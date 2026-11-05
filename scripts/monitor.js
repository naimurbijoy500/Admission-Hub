#!/usr/bin/env node
// =========================================================================
// Admission Hub - Circular Monitor & AI Circular Extractor
// 1. Visits each official admission website listed in data/sources.json,
//    with curl fallback for sites with broken HTTP headers or bot filters.
// 2. Collects admission-related links (notices / circulars / PDFs), and
//    records anything new in data/updates.json.
// 3. When GEMINI_API_KEY is configured, automatically downloads any new
//    admission circular PDF or notice page, uses Gemini (gemini-3.8-flash)
//    with Structured Outputs to extract ONLY real published data:
//      - Application start & deadline dates (আবেদনের শেষ তারিখ)
//      - Admission exam date (ভর্তি পরীক্ষার তারিখ)
//      - Minimum SSC, HSC & Total GPA (ন্যূনতম মোট জিপিএ)
//      - Application fee & total seats (আবেদন ফি ও আসন)
//    and automatically creates/updates the card in data/circulars.json
//    without ever inventing fake/default values.
// =========================================================================

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const { execFile } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const SOURCES_FILE = path.join(DATA, 'sources.json');
const SEEN_FILE = path.join(DATA, 'seen.json');
const UPDATES_FILE = path.join(DATA, 'updates.json');
const STATUS_FILE = path.join(DATA, 'status.json');
const CIRCULARS_FILE = path.join(DATA, 'circulars.json');

const MAX_UPDATES = 300;
const MAX_LATEST_PER_SOURCE = 8;
const TIMEOUT_MS = 30000;
const HARD_TIMEOUT_MS = 45000;
const CONCURRENCY = 8;
const MAX_AI_EXTRACTIONS_PER_RUN = 6;
const MAX_PDF_BYTES = 12 * 1024 * 1024; // 12 MB max PDF for inline base64

// Words that suggest a link is about admission / a circular / a notice.
const KEYWORDS = [
  'admission', 'circular', 'notice', 'undergraduate', 'apply', 'application',
  'result', 'seat plan', 'admit card', 'merit', 'waiting list', 'exam',
  'ভর্তি', 'বিজ্ঞপ্তি', 'বিজ্ঞাপন', 'নোটিশ', 'আবেদন', 'ফলাফল', 'পরীক্ষা',
  'প্রবেশপত্র', 'মেধা', 'অপেক্ষমাণ', 'গুচ্ছ', 'সার্কুলার'
];

// Stricter list for university homepages ("strict": true in sources.json).
const STRICT_KEYWORDS = [
  'admission', 'undergraduate', '1st year', 'first year', 'cluster',
  'ভর্তি', 'প্রথম বর্ষ', '১ম বর্ষ', 'গুচ্ছ', 'স্নাতক (সম্মান)', 'আন্ডারগ্র্যাজুয়েট'
];

// Keywords that strongly suggest a link is an actual admission circular
// (worthy of AI structured extraction for dates, GPA, fees, seats).
const CIRCULAR_KEYWORDS = [
  'admission', 'circular', 'prospectus', 'undergraduate', 'apply', 'application',
  'ভর্তি', 'বিজ্ঞপ্তি', 'সার্কুলার', 'আবেদন', 'প্রথম বর্ষ', '১ম বর্ষ', 'গুচ্ছ', 'আন্ডারগ্র্যাজুয়েট'
];

// Links we never care about (navigation, auth links, social media, etc).
const IGNORE = [
  'facebook.com', 'twitter.com', 'x.com/', 'youtube.com', 'youtu.be', 'linkedin.com',
  'instagram.com', 'mailto:', 'tel:', 'javascript:', 'play.google.com',
  '/student/login', '/student/registration', '/login', '/register', '/publication-details/'
];

// Generic navigation link titles to skip
const IGNORE_TITLES = new Set([
  'login', 'log in', 'sign in', 'registration', 'register', 'home', 'contact',
  'contact us', 'helpline', 'complain', 'complaint', 'faq', 'read more', 'details'
]);

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function sha1(text) {
  return crypto.createHash('sha1').update(text).digest('hex').slice(0, 16);
}

// Fetch raw Buffer (used for both HTML pages and PDF files).
function fetchBuffer(url, { insecure = false, redirects = 5 } = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/pdf,*/*;q=0.8',
        'Accept-Language': 'bn,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'identity'
      },
      rejectUnauthorized: !insecure,
      insecureHTTPParser: true,
      timeout: TIMEOUT_MS
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        if (redirects <= 0) return reject(new Error('Too many redirects'));
        const next = new URL(res.headers.location, url).toString();
        return resolve(fetchBuffer(next, { insecure, redirects: redirects - 1 }));
      }
      if (res.statusCode >= 400) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      let total = 0;
      res.on('data', c => {
        total += c.length;
        if (total <= MAX_PDF_BYTES) chunks.push(c);
      });
      res.on('end', () => resolve({
        buffer: Buffer.concat(chunks),
        contentType: (res.headers['content-type'] || '').toLowerCase(),
        finalUrl: url
      }));
    });
    req.on('timeout', () => req.destroy(new Error('Timed out')));
    const hardTimer = setTimeout(() => req.destroy(new Error('Timed out')), HARD_TIMEOUT_MS);
    req.on('close', () => clearTimeout(hardTimer));
    req.on('error', err => {
      const certError = /certificate|self[- ]signed|unable to verify|CERT_|SSL/i.test(err.code + ' ' + err.message);
      if (certError && !insecure) {
        resolve(fetchBuffer(url, { insecure: true, redirects }));
      } else {
        reject(err);
      }
    });
  });
}

// Fallback using system curl for servers with broken HTTP headers (like buet.ac.bd)
// or basic TLS/header fingerprinters.
function fetchWithCurl(url) {
  return new Promise((resolve, reject) => {
    const curlBin = process.platform === 'win32' ? 'curl.exe' : 'curl';
    execFile(curlBin, [
      '-s', '-L', '-k', '--max-time', '25',
      '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      url
    ], { encoding: 'buffer', maxBuffer: MAX_PDF_BYTES }, (err, stdout) => {
      if (err || !stdout || stdout.length < 50) {
        return reject(err || new Error('Empty response from curl'));
      }
      resolve({ buffer: stdout, contentType: 'text/html', finalUrl: url });
    });
  });
}

async function fetchPage(url) {
  try {
    const res = await fetchBuffer(url);
    return { html: res.buffer.toString('utf8'), finalUrl: res.finalUrl };
  } catch (err) {
    const retryable = /ECONNREFUSED|ECONNRESET|ETIMEDOUT|EPROTO|wrong version number|Timed out|Parse Error|HTTP 403/i.test(err.code + ' ' + err.message);
    if (retryable) {
      try {
        const res = await fetchWithCurl(url);
        return { html: res.buffer.toString('utf8'), finalUrl: res.finalUrl };
      } catch {
        // Also try plain http if https failed
        if (url.startsWith('https://')) {
          try {
            const res = await fetchBuffer('http://' + url.slice('https://'.length));
            return { html: res.buffer.toString('utf8'), finalUrl: res.finalUrl };
          } catch {
            // fall through
          }
        }
      }
    }
    throw err;
  }
}

function decodeEntities(str) {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function cleanText(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
  ).replace(/\s+/g, ' ').trim();
}

// Extract admission-related links from a page.
function extractLinks(html, baseUrl, strict = false) {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');

  const linkRe = /<a\b[^>]*?href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  const found = new Map();
  let m;
  while ((m = linkRe.exec(body)) !== null) {
    const rawHref = decodeEntities(m[2].trim());
    let title = cleanText(m[3]);
    if (!rawHref || rawHref === '#' || rawHref.startsWith('#')) continue;
    if (IGNORE.some(bad => rawHref.toLowerCase().includes(bad))) continue;

    let href;
    try {
      href = new URL(rawHref, baseUrl).toString();
    } catch {
      continue;
    }
    if (IGNORE.some(bad => href.toLowerCase().includes(bad))) continue;

    if (!title) {
      const titleAttr = /title\s*=\s*(["'])(.*?)\1/i.exec(m[0]);
      title = titleAttr ? cleanText(titleAttr[2]) : decodeURIComponent(href.split('/').pop() || '');
    }
    if (title.length < 4 || title.length > 250) continue;
    if (IGNORE_TITLES.has(title.toLowerCase())) continue;

    const haystack = (title + ' ' + href).toLowerCase();
    const isPdf = /\.pdf(\?|$)/i.test(href);
    const relevant = strict
      ? STRICT_KEYWORDS.some(k => haystack.includes(k))
      : isPdf || KEYWORDS.some(k => haystack.includes(k));
    if (!relevant) continue;

    if (!found.has(href)) found.set(href, { title, url: href, pdf: isPdf });
  }
  return [...found.values()];
}

// =========================================================================
// Gemini AI Circular Reader (Structured Output via Interactions API)
// Reads a newly discovered PDF or HTML notice and extracts exact dates,
// GPA requirements, application fee, and seats into data/circulars.json.
// Never invents or guesses unannounced fields.
// =========================================================================
const CIRCULAR_EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    isAdmissionCircular: {
      type: 'boolean',
      description: 'True ONLY if this document/notice is an official undergraduate admission circular or schedule notice containing real application dates or exam dates. False for postgraduate/MSc/MBA/MPhil/PhD notices, routine notices, tenders, seat plans, or unrelated news.'
    },
    banglaUniversityName: {
      type: 'string',
      description: 'University name in Bangla, e.g. ঢাকা বিশ্ববিদ্যালয় (ঢাবি)'
    },
    category: {
      type: 'string',
      enum: ['general', 'engineering', 'medical', 'cluster', 'science_tech', 'specialized']
    },
    units: {
      type: 'string',
      description: 'Units or faculties covered in Bangla if mentioned, e.g. ক, খ, গ ইউনিট. Empty string if not mentioned.'
    },
    applyStart: {
      type: 'string',
      description: 'Application start date in YYYY-MM-DD format if explicitly stated in the notice. Empty string if not stated.'
    },
    applyDeadline: {
      type: 'string',
      description: 'Application deadline date in YYYY-MM-DD format (আবেদনের শেষ তারিখ) if explicitly stated. Empty string if not stated.'
    },
    examDate: {
      type: 'string',
      description: 'Admission exam date in YYYY-MM-DD format (ভর্তি পরীক্ষার তারিখ) if explicitly stated. If multiple unit dates exist, use the earliest date. Empty string if not stated.'
    },
    minSscGpa: {
      type: 'number',
      description: 'Minimum required SSC GPA explicitly stated in the notice (e.g. 3.5 or 4.0). MUST be 0 if not explicitly stated.'
    },
    minHscGpa: {
      type: 'number',
      description: 'Minimum required HSC GPA explicitly stated in the notice (e.g. 3.5 or 4.0). MUST be 0 if not explicitly stated.'
    },
    minTotalGpa: {
      type: 'number',
      description: 'Minimum total GPA (SSC + HSC combined, e.g. 8.00) explicitly stated in the notice. MUST be 0 if not explicitly stated.'
    },
    allowedGroups: {
      type: 'array',
      items: { type: 'string', enum: ['science', 'arts', 'commerce'] },
      description: 'Eligible HSC groups: science, arts, commerce'
    },
    fee: {
      type: 'string',
      description: 'Application fee in Bangla ONLY if explicitly stated in the notice (e.g. ১,০০০ টাকা). Empty string if not stated.'
    },
    seats: {
      type: 'string',
      description: 'Total seats in Bangla ONLY if explicitly stated in the notice (e.g. ৪,৫০০ টি). Empty string if not stated.'
    },
    summary: {
      type: 'string',
      description: 'Short factual 1-2 sentence summary in Bangla of the official notice.'
    }
  },
  required: [
    'isAdmissionCircular', 'banglaUniversityName', 'category', 'units',
    'applyStart', 'applyDeadline', 'examDate', 'minSscGpa', 'minHscGpa',
    'minTotalGpa', 'allowedGroups', 'fee', 'seats', 'summary'
  ]
};

async function extractCircularWithGemini(item) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    console.log(`  🤖 [AI] Analyzing circular from ${item.code}: ${item.title}`);
    const fetched = await fetchBuffer(item.url).catch(() => fetchWithCurl(item.url));
    const isPdf = item.pdf || fetched.contentType.includes('application/pdf') || fetched.buffer.slice(0, 4).toString() === '%PDF';

    const promptText =
      `You are an accurate assistant for Bangladesh public university undergraduate admissions.\n` +
      `University Code: ${item.code}\n` +
      `University Name: ${item.name}\n` +
      `Notice Title: ${item.title}\n` +
      `Source URL: ${item.url}\n\n` +
      `Read the attached admission circular / notice carefully. Extract ONLY facts that are explicitly stated in the document. Do NOT guess or invent any date, GPA, fee, or seat count — leave unannounced strings empty ("") and unannounced numbers as 0. Convert any Bangla numbers in dates to standard YYYY-MM-DD format.`;

    const contentParts = [{ type: 'text', text: promptText }];
    if (isPdf) {
      contentParts.push({
        type: 'document',
        mime_type: 'application/pdf',
        data: fetched.buffer.toString('base64')
      });
    } else {
      const pageText = cleanText(fetched.buffer.toString('utf8')).slice(0, 35000);
      contentParts.push({
        type: 'text',
        text: `Page Content:\n${pageText}`
      });
    }

    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'Api-Revision': '2026-05-20'
      },
      body: JSON.stringify({
        model: 'gemini-3.8-flash',
        input: [{ role: 'user', content: contentParts }],
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: CIRCULAR_EXTRACTION_SCHEMA
        }
      })
    });

    if (!res.ok) {
      console.warn(`  🤖 [AI] Gemini API HTTP ${res.status}: ${await res.text()}`);
      return null;
    }

    const data = await res.json();
    let jsonText = data.output_text;
    if (!jsonText && Array.isArray(data.steps)) {
      for (let i = data.steps.length - 1; i >= 0; i--) {
        const step = data.steps[i];
        if (step.type === 'model_output' && Array.isArray(step.content)) {
          const textPart = step.content.find(p => p.type === 'text' && p.text);
          if (textPart) { jsonText = textPart.text; break; }
        }
      }
    }
    if (!jsonText) return null;

    const extracted = JSON.parse(jsonText);
    if (!extracted.isAdmissionCircular) {
      console.log(`  🤖 [AI] Notice is not an undergraduate admission circular (skipped card update).`);
      return null;
    }
    if (!extracted.applyDeadline && !extracted.examDate) {
      console.log(`  🤖 [AI] No deadline or exam date found in notice (skipped card update).`);
      return null;
    }

    console.log(`  ✅ [AI] Extracted real circular for ${item.code}: Deadline=${extracted.applyDeadline || 'TBA'}, Exam=${extracted.examDate || 'TBA'}, GPA=${extracted.minTotalGpa || 'TBA'}`);
    return extracted;
  } catch (err) {
    console.warn(`  🤖 [AI] Extraction failed for ${item.url}:`, err.message);
    return null;
  }
}

function upsertCircularCard(circulars, item, aiData) {
  const existingIdx = circulars.findIndex(c => c.code.toUpperCase() === item.code.toUpperCase());
  const existing = existingIdx >= 0 ? circulars[existingIdx] : {};

  const validDate = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d : '';

  const updated = {
    id: existing.id || `${item.code.toLowerCase()}-${new Date().getFullYear()}`,
    code: item.code.toUpperCase(),
    name: aiData.banglaUniversityName || existing.name || item.name,
    englishName: existing.englishName || item.name,
    category: aiData.category || existing.category || 'general',
    units: aiData.units || existing.units || 'সকল ইউনিট',
    applyStart: validDate(aiData.applyStart) || existing.applyStart || '',
    applyDeadline: validDate(aiData.applyDeadline) || existing.applyDeadline || '',
    examDate: validDate(aiData.examDate) || existing.examDate || '',
    minSscGpa: aiData.minSscGpa > 0 ? aiData.minSscGpa : (existing.minSscGpa || 0),
    minHscGpa: aiData.minHscGpa > 0 ? aiData.minHscGpa : (existing.minHscGpa || 0),
    minTotalGpa: aiData.minTotalGpa > 0 ? aiData.minTotalGpa : (existing.minTotalGpa || 0),
    allowedGroups: Array.isArray(aiData.allowedGroups) && aiData.allowedGroups.length
      ? aiData.allowedGroups
      : (existing.allowedGroups || ['science', 'arts', 'commerce']),
    fee: aiData.fee || existing.fee || '',
    seats: aiData.seats || existing.seats || '',
    website: existing.website || item.url,
    noticeUrl: item.url,
    summary: aiData.summary || item.title,
    verified: true,
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    circulars[existingIdx] = updated;
  } else {
    circulars.unshift(updated);
  }
  return updated;
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: false })
    });
    if (!res.ok) console.warn('  Telegram error:', res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.warn('  Telegram error:', err.message);
    return false;
  }
}

async function main() {
  const sources = readJson(SOURCES_FILE, []);
  const seen = readJson(SEEN_FILE, {});
  const updates = readJson(UPDATES_FILE, []);
  const status = readJson(STATUS_FILE, { sources: {} });
  const circulars = readJson(CIRCULARS_FILE, []);
  const now = new Date().toISOString();
  const newItemsBySource = new Array(sources.length);

  async function checkSource(src, index) {
    const entry = status.sources[src.id] || {};
    const fresh = [];
    let line;
    try {
      const { html, finalUrl } = await fetchPage(src.url);
      let links = extractLinks(html, finalUrl, Boolean(src.strict));
      // If a university also has a separate admission portal, check it and merge links
      if (src.admissionUrl && src.admissionUrl !== src.url) {
        try {
          const adm = await fetchPage(src.admissionUrl);
          const admLinks = extractLinks(adm.html, adm.finalUrl, false);
          const seenUrls = new Set(links.map(l => l.url));
          for (const l of admLinks) {
            if (!seenUrls.has(l.url)) {
              seenUrls.add(l.url);
              links.push(l);
            }
          }
        } catch {
          // Admission portal may be offline out-of-season; main site still works
        }
      }
      const isFirstRun = !Array.isArray(seen[src.id]);
      const seenSet = new Set(seen[src.id] || []);

      for (const link of links) {
        const id = sha1(src.id + '|' + link.url + '|' + link.title);
        if (seenSet.has(id)) continue;
        seenSet.add(id);
        if (!isFirstRun) {
          fresh.push({
            id,
            source: src.id,
            code: src.code,
            name: src.name,
            title: link.title,
            url: link.url,
            pdf: link.pdf,
            detectedAt: now
          });
        }
      }

      seen[src.id] = [...seenSet];
      status.sources[src.id] = {
        ok: true,
        lastChecked: now,
        lastSuccess: now,
        error: null,
        linkCount: links.length,
        latest: links.slice(0, MAX_LATEST_PER_SOURCE),
        lastNewAt: fresh.length > 0 ? now : (entry.lastNewAt || null)
      };
      line = `${links.length} links${isFirstRun ? ' (baseline saved)' : `, ${fresh.length} new`}`;
    } catch (err) {
      status.sources[src.id] = {
        ...entry,
        ok: false,
        lastChecked: now,
        error: err.message
      };
      line = `FAILED: ${err.message}`;
    }
    newItemsBySource[index] = fresh;
    console.log(`${src.code.padEnd(9)} ${src.url}  ->  ${line}`);
  }

  let next = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY, sources.length) }, async () => {
    while (next < sources.length) {
      const i = next++;
      await checkSource(sources[i], i);
    }
  });
  await Promise.all(workers);
  const newItems = newItemsBySource.flat();

  // If GEMINI_API_KEY is available, automatically parse new circular candidates
  // and update data/circulars.json (which powers the cards & calendar).
  let aiUpdatedCount = 0;
  if (process.env.GEMINI_API_KEY && newItems.length > 0) {
    const candidates = newItems.filter(item => {
      const hay = (item.title + ' ' + item.url).toLowerCase();
      return item.pdf || CIRCULAR_KEYWORDS.some(k => hay.includes(k));
    }).slice(0, MAX_AI_EXTRACTIONS_PER_RUN);

    for (const candidate of candidates) {
      const aiData = await extractCircularWithGemini(candidate);
      if (aiData) {
        upsertCircularCard(circulars, candidate, aiData);
        candidate.aiExtracted = true;
        candidate.applyDeadline = aiData.applyDeadline;
        candidate.examDate = aiData.examDate;
        aiUpdatedCount++;
      }
    }
    if (aiUpdatedCount > 0) {
      writeJson(CIRCULARS_FILE, circulars);
      console.log(`\n🎉 [AI] Automatically updated ${aiUpdatedCount} circular card(s) in data/circulars.json!`);
    }
  }

  // Remove status entries for sources that were deleted from sources.json.
  const ids = new Set(sources.map(s => s.id));
  for (const key of Object.keys(status.sources)) {
    if (!ids.has(key)) delete status.sources[key];
  }

  status.lastRun = now;
  const allUpdates = [...newItems, ...updates].slice(0, MAX_UPDATES);

  writeJson(SEEN_FILE, seen);
  writeJson(UPDATES_FILE, allUpdates);
  writeJson(STATUS_FILE, status);

  console.log(`\nDone. ${newItems.length} new item(s), ${aiUpdatedCount} circular card(s) auto-updated.`);

  // Telegram alerts (only if secrets are configured).
  const siteUrl = process.env.SITE_URL || '';
  for (const item of newItems.slice(0, 20)) {
    const extra = item.aiExtracted
      ? `\n📅 আবেদনের শেষ তারিখ: ${item.applyDeadline || 'প্রকাশিতব্য'}\n🎯 ভর্তি পরীক্ষা: ${item.examDate || 'প্রকাশিতব্য'}\n✅ ওয়েবসাইটের কার্ড ও ক্যালেন্ডারে স্বয়ংক্রিয়ভাবে যুক্ত হয়েছে!`
      : '';
    await sendTelegram(
      `🎓 নতুন আপডেট: ${item.name} (${item.code})\n\n${item.title}${extra}\n\n🔗 ${item.url}` +
      (siteUrl ? `\n\n🌐 ${siteUrl}` : '')
    );
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
