#!/usr/bin/env node
// =========================================================================
// Admission Hub - Circular Monitor
// Visits each official admission website listed in data/sources.json,
// collects admission-related links (notices / circulars / PDFs), and
// records anything new in data/updates.json. Optionally sends a Telegram
// message for every new item.
//
// Runs on GitHub Actions on a schedule (see .github/workflows/site.yml),
// but can also be run locally with:  node scripts/monitor.js
// No npm dependencies required (Node 18+).
// =========================================================================

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const SOURCES_FILE = path.join(DATA, 'sources.json');
const SEEN_FILE = path.join(DATA, 'seen.json');
const UPDATES_FILE = path.join(DATA, 'updates.json');
const STATUS_FILE = path.join(DATA, 'status.json');

const MAX_UPDATES = 300;
const MAX_LATEST_PER_SOURCE = 8;
const TIMEOUT_MS = 30000;
const HARD_TIMEOUT_MS = 45000;
const CONCURRENCY = 8;

// Words that suggest a link is about admission / a circular / a notice.
const KEYWORDS = [
  'admission', 'circular', 'notice', 'undergraduate', 'apply', 'application',
  'result', 'seat plan', 'admit card', 'merit', 'waiting list', 'exam',
  'ভর্তি', 'বিজ্ঞপ্তি', 'বিজ্ঞাপন', 'নোটিশ', 'আবেদন', 'ফলাফল', 'পরীক্ষা',
  'প্রবেশপত্র', 'মেধা', 'অপেক্ষমাণ', 'গুচ্ছ', 'সার্কুলার'
];

// Stricter list for university homepages ("strict": true in sources.json).
// Homepages also list exam, staff, tender and other notices, so only links
// that clearly mention admission are reported there.
const STRICT_KEYWORDS = [
  'admission', 'undergraduate', '1st year', 'first year', 'cluster',
  'ভর্তি', 'প্রথম বর্ষ', '১ম বর্ষ', 'গুচ্ছ', 'স্নাতক (সম্মান)'
];

// Links we never care about (navigation, social media, etc).
const IGNORE = [
  'facebook.com', 'twitter.com', 'x.com/', 'youtube.com', 'linkedin.com',
  'instagram.com', 'mailto:', 'tel:', 'javascript:', 'play.google.com'
];

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

// Fetch a URL as text. Follows redirects. Many Bangladeshi university sites
// have misconfigured TLS certificates, so on a certificate error we retry
// once without certificate verification (read-only public pages only).
function fetchText(url, { insecure = false, redirects = 5 } = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AdmissionHubMonitor/1.0; +https://github.com/naimurbijoy500/Admission-Hub)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Encoding': 'identity'
      },
      rejectUnauthorized: !insecure,
      // Some university servers send slightly malformed HTTP headers.
      insecureHTTPParser: true,
      timeout: TIMEOUT_MS
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        if (redirects <= 0) return reject(new Error('Too many redirects'));
        const next = new URL(res.headers.location, url).toString();
        return resolve(fetchText(next, { insecure, redirects: redirects - 1 }));
      }
      if (res.statusCode >= 400) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ html: Buffer.concat(chunks).toString('utf8'), finalUrl: url }));
    });
    req.on('timeout', () => req.destroy(new Error('Timed out')));
    // Some servers trickle data forever; give up after a fixed time.
    const hardTimer = setTimeout(() => req.destroy(new Error('Timed out')), HARD_TIMEOUT_MS);
    req.on('close', () => clearTimeout(hardTimer));
    req.on('error', err => {
      const certError = /certificate|self[- ]signed|unable to verify|CERT_|SSL/i.test(err.code + ' ' + err.message);
      if (certError && !insecure) {
        resolve(fetchText(url, { insecure: true, redirects }));
      } else {
        reject(err);
      }
    });
  });
}

// Try https first; if the server doesn't speak https at all, try plain http.
async function fetchPage(url) {
  try {
    return await fetchText(url);
  } catch (err) {
    const noHttps = /ECONNREFUSED|ECONNRESET|ETIMEDOUT|EPROTO|wrong version number|Timed out/i.test(err.code + ' ' + err.message);
    if (url.startsWith('https://') && noHttps) {
      try {
        return await fetchText('http://' + url.slice('https://'.length));
      } catch {
        // fall through to the original error
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
  return decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

// Extract admission-related links from a page.
function extractLinks(html, baseUrl, strict = false) {
  // Drop scripts/styles so their contents are not mistaken for links.
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

    if (!title) {
      // Use the title attribute or file name when the link has no text.
      const titleAttr = /title\s*=\s*(["'])(.*?)\1/i.exec(m[0]);
      title = titleAttr ? cleanText(titleAttr[2]) : decodeURIComponent(href.split('/').pop() || '');
    }
    if (title.length < 4 || title.length > 250) continue;

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
  const now = new Date().toISOString();
  const newItemsBySource = new Array(sources.length);

  async function checkSource(src, index) {
    const entry = status.sources[src.id] || {};
    const fresh = [];
    let line;
    try {
      const { html, finalUrl } = await fetchPage(src.url);
      const links = extractLinks(html, finalUrl, Boolean(src.strict));
      const isFirstRun = !Array.isArray(seen[src.id]);
      const seenSet = new Set(seen[src.id] || []);

      for (const link of links) {
        const id = sha1(src.id + '|' + link.url + '|' + link.title);
        if (seenSet.has(id)) continue;
        seenSet.add(id);
        // On the very first run we only record a baseline (no alerts),
        // otherwise every existing notice would be reported as "new".
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

  // Check several sites at the same time.
  let next = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY, sources.length) }, async () => {
    while (next < sources.length) {
      const i = next++;
      await checkSource(sources[i], i);
    }
  });
  await Promise.all(workers);
  const newItems = newItemsBySource.flat();

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

  console.log(`\nDone. ${newItems.length} new item(s).`);

  // Telegram alerts (only if secrets are configured).
  const siteUrl = process.env.SITE_URL || '';
  for (const item of newItems.slice(0, 20)) {
    await sendTelegram(
      `🎓 নতুন আপডেট: ${item.name} (${item.code})\n\n${item.title}\n\n🔗 ${item.url}` +
      (siteUrl ? `\n\n🌐 ${siteUrl}` : '')
    );
  }
  if (newItems.length > 20) {
    await sendTelegram(`➕ আরও ${newItems.length - 20}টি নতুন আপডেট পাওয়া গেছে।${siteUrl ? '\n' + siteUrl : ''}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
