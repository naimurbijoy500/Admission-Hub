// =========================================================================
// Admission Hub Bangladesh - Frontend (Clean Service/API Architecture)
// Ready for seamless migration to ASP.NET Core Web API / React + SQL Server.
//
// Current Static Data Endpoints (can be swapped via API_CONFIG.BASE_URL):
//   GET /circulars.json  -> List<AdmissionCircularDto>
//   GET /sources.json    -> List<UniversitySourceDto>
//   GET /status.json     -> MonitorStatusDto
//   GET /updates.json    -> List<CircularNoticeDto>
// =========================================================================

const API_CONFIG = {
  // When migrating to ASP.NET Core, change this to '/api/v1'
  BASE_URL: 'data',
  ENDPOINTS: {
    CIRCULARS: 'circulars.json',
    SOURCES: 'sources.json',
    STATUS: 'status.json',
    UPDATES: 'updates.json'
  },
  REFRESH_INTERVAL_MS: 10 * 60 * 1000
};

const CATEGORY_LABELS = {
  general: 'সাধারণ ও স্বায়ত্তশাসিত',
  engineering: 'প্রকৌশল ও প্রযুক্তি',
  medical: 'মেডিকেল ও ডেন্টাল',
  cluster: 'গুচ্ছ ভর্তি সিস্টেম',
  science_tech: 'বিজ্ঞান ও প্রযুক্তি',
  specialized: 'বিশেষায়িত বিশ্ববিদ্যালয়'
};

// Official University Seal / Logo Mapping (Wikimedia Commons & Official Emblem Assets)
// Falls back automatically to official domain favicon & styled crest badge.
const OFFICIAL_UNIVERSITY_LOGOS = {
  DU: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/University_of_Dhaka_logo.svg/200px-University_of_Dhaka_logo.svg.png',
  BUET: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/BUET_LOGO.svg/200px-BUET_LOGO.svg.png',
  RU: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/University_of_Rajshahi_logo.svg/200px-University_of_Rajshahi_logo.svg.png',
  CU: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/University_of_Chittagong_logo.svg/200px-University_of_Chittagong_logo.svg.png',
  JU: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Jahangirnagar_University_Logo.svg/200px-Jahangirnagar_University_Logo.svg.png',
  BAU: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Bangladesh_Agricultural_University_logo.svg/200px-Bangladesh_Agricultural_University_logo.svg.png',
  SUST: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Shahjalal_University_of_Science_and_Technology_logo.png/200px-Shahjalal_University_of_Science_and_Technology_logo.png',
  KU: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Khulna_University_Logo.svg/200px-Khulna_University_Logo.svg.png',
  IU: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c8/Islamic_University%2C_Bangladesh_logo.svg/200px-Islamic_University%2C_Bangladesh_logo.svg.png',
  JNU: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Jagannath_University_logo.svg/200px-Jagannath_University_logo.svg.png',
  BUP: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/Bangladesh_University_of_Professionals_logo.svg/200px-Bangladesh_University_of_Professionals_logo.svg.png',
  MIST: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/03/Military_Institute_of_Science_and_Technology_Logo.svg/200px-Military_Institute_of_Science_and_Technology_Logo.svg.png',
  CUET: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/CUET_Vector_Logo.svg/200px-CUET_Vector_Logo.svg.png',
  KUET: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/77/KUET_logo.svg/200px-KUET_logo.svg.png',
  RUET: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/80/RUET_logo.svg/200px-RUET_logo.svg.png',
  DUET: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/90/DUET_Logo.svg/200px-DUET_Logo.svg.png',
  BUTEX: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8d/Bangladesh_University_of_Textiles_logo.svg/200px-Bangladesh_University_of_Textiles_logo.svg.png',
  COU: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Comilla_University_logo.svg/200px-Comilla_University_logo.svg.png',
  BU: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/University_of_Barisal_logo.svg/200px-University_of_Barisal_logo.svg.png',
  BRUR: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3e/Begum_Rokeya_University_logo.svg/200px-Begum_Rokeya_University_logo.svg.png',
  HSTU: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/22/Hajee_Mohammad_Danesh_Science_%26_Technology_University_logo.png/200px-Hajee_Mohammad_Danesh_Science_%26_Technology_University_logo.png',
  MBSTU: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Mawlana_Bhashani_Science_and_Technology_University_logo.png/200px-Mawlana_Bhashani_Science_and_Technology_University_logo.png',
  NSTU: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Noakhali_Science_and_Technology_University_logo.png/200px-Noakhali_Science_and_Technology_University_logo.png',
  PUST: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/00/Pabna_University_of_Science_and_Technology_logo.png/200px-Pabna_University_of_Science_and_Technology_logo.png',
  JUST: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e9/Jessore_University_of_Science_and_Technology_logo.svg/200px-Jessore_University_of_Science_and_Technology_logo.svg.png',
  NU: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/88/National_University%2C_Bangladesh_logo.svg/200px-National_University%2C_Bangladesh_logo.svg.png',
  BOU: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/36/Bangladesh_Open_University_logo.svg/200px-Bangladesh_Open_University_logo.svg.png',
  BSMMU: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Bangabandhu_Sheikh_Mujib_Medical_University_logo.svg/200px-Bangabandhu_Sheikh_Mujib_Medical_University_logo.svg.png',
  DGME: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/200px-Government_Seal_of_Bangladesh.svg.png',
  MBC: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/200px-Government_Seal_of_Bangladesh.svg.png'
};

// State
let circulars = [];
let sources = [];
let status = { sources: {} };
let updates = [];
let customCirculars = JSON.parse(localStorage.getItem('admissionHub_custom') || '[]');
let savedIds = JSON.parse(localStorage.getItem('admissionHub_saved') || '[]');
let readUpdateIds = new Set(JSON.parse(localStorage.getItem('admissionHub_readUpdates') || '[]'));
let knownUpdateIds = null;

let activeCategory = 'all';
let activeStatus = 'all';
let activeSort = 'deadline';
let searchQuery = '';
let showOnlySaved = false;

const today = new Date();
let calYear = today.getFullYear();
let calMonth = today.getMonth();
let selectedCalDate = null;
let timelineFilter = 'all';

// ---------------------------------------------------------------------------
// Helpers & University Logo Resolver
// ---------------------------------------------------------------------------
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

function toBanglaNum(num) {
  return String(num).replace(/\d/g, d => BN_DIGITS[d]);
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function extractDomain(url, fallbackDomain) {
  if (fallbackDomain) return fallbackDomain;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'du.ac.bd';
  }
}

// Renders an official university logo with automatic 2-tier fallback:
// 1. Official Wikimedia/University emblem -> 2. Google S2 High-Res Favicon -> 3. Styled Code Crest
function renderUniLogo(code, url, logoDomain, sizeClass = '') {
  const upper = String(code || '').toUpperCase();
  const domain = extractDomain(url, logoDomain);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  const primaryLogo = OFFICIAL_UNIVERSITY_LOGOS[upper] || faviconUrl;

  return `
    <div class="uni-logo-wrap ${sizeClass}" title="${escapeHtml(upper)}">
      <img
        class="uni-logo-img"
        src="${escapeHtml(primaryLogo)}"
        data-favicon="${escapeHtml(faviconUrl)}"
        alt="${escapeHtml(upper)}"
        loading="lazy"
        onerror="if(this.src!==this.dataset.favicon){this.src=this.dataset.favicon;}else{this.style.display='none';this.nextElementSibling.style.display='flex';}"
      />
      <span class="uni-logo-fallback">${escapeHtml(upper)}</span>
    </div>
  `;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatBanglaDate(dateStr) {
  if (!dateStr) return 'শীঘ্রই জানানো হবে';
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${toBanglaNum(d)} ${BN_MONTHS[m - 1]} ${toBanglaNum(y)}`;
}

function timeAgo(iso) {
  if (!iso) return 'কখনো না';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'এইমাত্র';
  if (diff < 3600) return `${toBanglaNum(Math.floor(diff / 60))} মিনিট আগে`;
  if (diff < 86400) return `${toBanglaNum(Math.floor(diff / 3600))} ঘণ্টা আগে`;
  return `${toBanglaNum(Math.floor(diff / 86400))} দিন আগে`;
}

function getDaysRemaining(deadlineStr) {
  const target = new Date(deadlineStr + 'T23:59:59');
  return Math.ceil((target - new Date()) / (1000 * 60 * 60 * 24));
}

function computeStatus(c) {
  const t = todayStr();
  if (c.applyStart && t < c.applyStart) return 'upcoming';
  if (c.applyDeadline && t > c.applyDeadline) return 'closed';
  return 'open';
}

// Deduplicates circulars by university code so there is never duplicate info
function allCirculars() {
  const map = new Map();
  for (const item of [...customCirculars, ...circulars]) {
    const key = String(item.code || item.id).toUpperCase();
    if (!map.has(key)) {
      map.set(key, { ...item, status: computeStatus(item) });
    }
  }
  return [...map.values()];
}

async function fetchEndpoint(endpoint, fallback) {
  try {
    const url = `${API_CONFIG.BASE_URL}/${endpoint}?t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (err) {
    console.warn('Could not load', endpoint, err);
    return fallback;
  }
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {}
}

// ---------------------------------------------------------------------------
// Data Loading
// ---------------------------------------------------------------------------
async function loadData({ silent = false } = {}) {
  const [c, s, st, u] = await Promise.all([
    fetchEndpoint(API_CONFIG.ENDPOINTS.CIRCULARS, []),
    fetchEndpoint(API_CONFIG.ENDPOINTS.SOURCES, []),
    fetchEndpoint(API_CONFIG.ENDPOINTS.STATUS, { sources: {} }),
    fetchEndpoint(API_CONFIG.ENDPOINTS.UPDATES, [])
  ]);
  circulars = c;

  // Deduplicate sources by code as a safeguard
  const seenCodes = new Set();
  sources = s.filter(src => {
    const k = String(src.code || src.id).toUpperCase();
    if (seenCodes.has(k)) return false;
    seenCodes.add(k);
    return true;
  });

  status = st;
  updates = u;

  if (!localStorage.getItem('admissionHub_readUpdates')) {
    updates.forEach(item => readUpdateIds.add(item.id));
    persistRead();
  }

  if (knownUpdateIds) {
    const fresh = updates.filter(item => !knownUpdateIds.has(item.id));
    fresh.slice(0, 5).forEach(alertNewUpdate);
  }
  knownUpdateIds = new Set(updates.map(item => item.id));

  renderAll();
  if (!silent) document.getElementById('lastCheckedTime').textContent = timeAgo(status.lastRun);
}

function persistRead() {
  localStorage.setItem('admissionHub_readUpdates', JSON.stringify([...readUpdateIds].slice(-1000)));
}

function alertNewUpdate(item) {
  playNotificationSound();
  showToast(`নতুন আপডেট: ${escapeHtml(item.name)} — ${escapeHtml(item.title)}`);
  if ('Notification' in window && Notification.permission === 'granted') {
    const n = new Notification(`🎓 ${item.name} (${item.code})`, { body: item.title });
    n.onclick = () => window.open(item.url, '_blank', 'noopener');
  }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
function renderAll() {
  updateStats();
  renderTicker();
  renderCirculars();
  renderNotifications();
  renderCalendar();
  renderTimeline();
  renderDirectory();
  updateSavedBadge();
}

function updateStats() {
  const list = allCirculars();
  document.getElementById('statOpenCount').textContent = toBanglaNum(list.filter(c => c.status === 'open').length);
  document.getElementById('statUpcomingCount').textContent = toBanglaNum(list.filter(c => c.status === 'upcoming').length);
  document.getElementById('statExamCount').textContent = toBanglaNum(getAllCalendarEvents().length);
  document.getElementById('statTotalUni').textContent = toBanglaNum(sources.length);
  document.getElementById('heroSourceCount').textContent = toBanglaNum(sources.length);
  document.getElementById('lastCheckedTime').textContent = timeAgo(status.lastRun);
}

function renderTicker() {
  const el = document.getElementById('liveTickerText');
  if (updates.length > 0) {
    el.textContent = updates.slice(0, 5).map(u => `${u.code}: ${u.title}`).join('  •  ');
  } else {
    el.textContent = `${toBanglaNum(sources.length)}টি পাবলিক বিশ্ববিদ্যালয় ও ভর্তি পোর্টাল নিয়মিত মনিটর হচ্ছে • সর্বশেষ চেক: ${timeAgo(status.lastRun)}`;
  }
}

function updateSavedBadge() {
  document.getElementById('savedCountBadge').textContent = toBanglaNum(savedIds.length);
  document.getElementById('savedFilterBtn').classList.toggle('active', showOnlySaved);
}

function renderCirculars() {
  const grid = document.getElementById('circularsGrid');
  const emptyState = document.getElementById('emptyState');

  const filtered = allCirculars().filter(item => {
    if (showOnlySaved && !savedIds.includes(item.id)) return false;
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (activeStatus !== 'all' && item.status !== activeStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hay = [item.name, item.englishName, item.code, item.units].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (activeSort === 'exam') return new Date(a.examDate) - new Date(b.examDate);
    if (activeSort === 'recent') return new Date(b.applyStart) - new Date(a.applyStart);
    return new Date(a.applyDeadline) - new Date(b.applyDeadline);
  });

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  grid.innerHTML = filtered.map(c => {
    const daysLeft = getDaysRemaining(c.applyDeadline);
    const isSaved = savedIds.includes(c.id);

    const statusMap = {
      open: ['🟢 চলমান', 'status-open'],
      upcoming: ['🟡 আসন্ন', 'status-upcoming'],
      closed: ['🔴 সমাপ্ত', 'status-closed']
    };
    const [statusText, statusClass] = statusMap[c.status];

    let countdownLabel = 'আবেদনের সময় শেষ';
    if (c.status === 'upcoming') countdownLabel = `🗓 শুরু: ${formatBanglaDate(c.applyStart)}`;
    else if (daysLeft >= 0) countdownLabel = `⏳ বাকি ${toBanglaNum(daysLeft)} দিন`;

    const verifyBadge = c.custom
      ? '<span class="verify-badge custom">👤 কাস্টম</span>'
      : c.verified
        ? '<span class="verify-badge ok">🤖 AI যাচাইকৃত</span>'
        : '<span class="verify-badge warn" title="নতুন সার্কুলার প্রকাশিত হলে AI স্বয়ংক্রিয়ভাবে এই তথ্য আপডেট করবে">⏳ সম্ভাব্য তথ্য (অটো-আপডেট হবে)</span>';

    return `
      <article class="circular-card">
        <div>
          <div class="card-top">
            <div class="uni-badge-group">
              ${renderUniLogo(c.code, c.website, c.logoDomain)}
              <div class="uni-title-wrap">
                <h3>${escapeHtml(c.name)}</h3>
                <span class="uni-category-label">${CATEGORY_LABELS[c.category] || 'পাবলিক বিশ্ববিদ্যালয়'} • <strong>${escapeHtml(c.code)}</strong></span>
              </div>
            </div>
            <div class="card-top-right">
              <span class="status-badge ${statusClass}">${statusText}</span>
              <button class="bookmark-btn ${isSaved ? 'saved' : ''}" onclick="toggleBookmark('${c.id}')" title="সংরক্ষণ করুন">
                ${isSaved ? '★' : '☆'}
              </button>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; gap:6px; flex-wrap:wrap;">
            ${verifyBadge}
            <span style="font-size:0.75rem; color:var(--text-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:210px;" title="${escapeHtml(c.units)}">📚 ${escapeHtml(c.units)}</span>
          </div>

          <div class="card-meta-grid">
            <div class="meta-item">
              <span>আবেদনের শেষ তারিখ</span>
              <strong>📅 ${formatBanglaDate(c.applyDeadline)}</strong>
            </div>
            <div class="meta-item">
              <span>ভর্তি পরীক্ষার তারিখ</span>
              <strong>🎯 ${formatBanglaDate(c.examDate)}</strong>
            </div>
            <div class="meta-item">
              <span>ন্যূনতম মোট জিপিএ</span>
              <strong>⭐ ${toBanglaNum(Number(c.minTotalGpa || 0).toFixed(2))}</strong>
            </div>
            <div class="meta-item">
              <span>আবেদন ফি ও আসন</span>
              <strong>💳 ${escapeHtml(c.fee || '—')} (${escapeHtml(c.seats || '—')})</strong>
            </div>
          </div>

          <div class="countdown-banner">
            <span class="countdown-timer">${countdownLabel}</span>
            <span style="font-size: 0.72rem; color: var(--text-secondary);">📅 ক্যালেন্ডারে যুক্ত</span>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-primary" onclick="openCircularModal('${c.id}')">📄 বিস্তারিত</button>
          <button class="btn-outline" onclick="addToGoogleCalendar('${c.id}')" title="Google Calendar-এ যুক্ত করুন">📅 ক্যালেন্ডার</button>
          <a href="${escapeHtml(c.website)}" target="_blank" rel="noopener" class="btn-outline">🔗 পোর্টাল</a>
        </div>
      </article>
    `;
  }).join('');
}

window.toggleBookmark = function (id) {
  if (savedIds.includes(id)) {
    savedIds = savedIds.filter(i => i !== id);
    showToast('🔖 সংরক্ষিত তালিকা থেকে সরানো হয়েছে।');
  } else {
    savedIds.push(id);
    showToast('⭐ সার্কুলারটি সংরক্ষিত হয়েছে!');
  }
  localStorage.setItem('admissionHub_saved', JSON.stringify(savedIds));
  updateSavedBadge();
  renderCirculars();
};

function findCircular(id) {
  return allCirculars().find(item => item.id === id);
}

window.openCircularModal = function (id) {
  const c = findCircular(id);
  if (!c) return;
  const content = document.getElementById('circularModalContent');
  const src = sources.find(s => s.code.toLowerCase() === String(c.code).toLowerCase());
  const st = src ? (status.sources[src.id] || status.sources[src.id + '-admission']) : null;
  const latest = st ? (st.latest || []) : [];

  content.innerHTML = `
    <div class="modal-header">
      <div class="uni-badge-group">
        ${renderUniLogo(c.code, c.website, c.logoDomain)}
        <div>
          <h3>${escapeHtml(c.name)} (${escapeHtml(c.code)})</h3>
          <p style="font-size:0.8rem; color:var(--text-secondary);">${escapeHtml(c.englishName || '')}</p>
        </div>
      </div>
      <button class="close-modal-btn" onclick="closeCircularModal()">✕</button>
    </div>

    <div style="display:flex; flex-direction:column; gap:10px;">
      <p style="font-size:0.88rem; color:var(--text-secondary);">${escapeHtml(c.summary || '')}</p>

      <div class="card-meta-grid" style="grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); margin-bottom:0;">
        <div class="meta-item"><span>ইউনিট সমূহ</span><strong>${escapeHtml(c.units)}</strong></div>
        <div class="meta-item"><span>আবেদন শুরুর তারিখ</span><strong>${formatBanglaDate(c.applyStart)}</strong></div>
        <div class="meta-item"><span>আবেদনের শেষ তারিখ</span><strong style="color:var(--warning);">${formatBanglaDate(c.applyDeadline)}</strong></div>
        <div class="meta-item"><span>ভর্তি পরীক্ষার তারিখ</span><strong style="color:var(--accent-primary);">${formatBanglaDate(c.examDate)}</strong></div>
        <div class="meta-item"><span>ন্যূনতম জিপিএ</span><strong>SSC: ${toBanglaNum(c.minSscGpa)} | HSC: ${toBanglaNum(c.minHscGpa)} (মোট: ${toBanglaNum(c.minTotalGpa)})</strong></div>
        <div class="meta-item"><span>আবেদন ফি ও আসন</span><strong>${escapeHtml(c.fee)} • ${escapeHtml(c.seats || '—')}</strong></div>
      </div>

      ${latest.length ? `
        <div style="background:var(--bg-secondary); padding:10px 12px; border-radius:10px;">
          <h4 style="margin-bottom:6px; font-size:0.88rem;">📰 অফিশিয়াল সাইটে সর্বশেষ প্রাপ্ত নোটিশ</h4>
          ${latest.map(l => `<a class="notice-link" href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${l.pdf ? '📄' : '🔗'} ${escapeHtml(l.title)}</a>`).join('')}
        </div>` : ''}
    </div>

    <div class="modal-footer">
      <button class="btn-outline" onclick="downloadSingleIcs('${c.id}')">📥 .ics ফাইল</button>
      <button class="btn-outline" onclick="addToGoogleCalendar('${c.id}')">📅 Google Calendar</button>
      <a href="${escapeHtml(c.website)}" target="_blank" rel="noopener" class="btn-primary">🌐 অফিশিয়াল পোর্টাল</a>
    </div>
  `;
  document.getElementById('circularModalBackdrop').classList.add('show');
};

window.closeCircularModal = function () {
  document.getElementById('circularModalBackdrop').classList.remove('show');
};

window.addToGoogleCalendar = function (id) {
  const c = findCircular(id);
  if (!c) return;
  const day = c.examDate.replace(/-/g, '');
  const next = new Date(c.examDate + 'T00:00:00');
  next.setDate(next.getDate() + 1);
  const end = `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, '0')}${String(next.getDate()).padStart(2, '0')}`;
  const title = encodeURIComponent(`ভর্তি পরীক্ষা: ${c.name} (${c.code})`);
  const details = encodeURIComponent(
    `ইউনিট: ${c.units}\nআবেদনের শেষ তারিখ: ${c.applyDeadline}\nঅফিশিয়াল ওয়েবসাইট: ${c.website}`
  );
  window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${day}/${end}&details=${details}`, '_blank', 'noopener');
};

window.downloadSingleIcs = function (id) {
  const c = findCircular(id);
  if (c) generateAndDownloadIcs([c], `${c.code}-Admission-Calendar.ics`);
};

function generateAndDownloadIcs(list, filename) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Admission Hub Bangladesh//BN'];
  const addEvent = (uid, date, summary, desc) => {
    if (!date) return;
    lines.push('BEGIN:VEVENT', `UID:${uid}@admission-hub`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${date.replace(/-/g, '')}`, `SUMMARY:${summary}`, `DESCRIPTION:${desc}`, 'END:VEVENT');
  };
  list.forEach(c => {
    addEvent(`${c.id}-deadline`, c.applyDeadline, `আবেদনের শেষ দিন: ${c.name} (${c.code})`, `অফিশিয়াল পোর্টাল: ${c.website}`);
    addEvent(`${c.id}-exam`, c.examDate, `ভর্তি পরীক্ষা: ${c.name} (${c.code})`, `ইউনিট: ${c.units} | ${c.website}`);
  });
  lines.push('END:VCALENDAR');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  showToast('📥 ক্যালেন্ডার (.ics) ফাইল ডাউনলোড হয়েছে!');
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------
function getAllCalendarEvents() {
  const events = [];
  allCirculars().forEach(c => {
    const base = { uniId: c.id, code: c.code, uniName: c.name, website: c.website, logoDomain: c.logoDomain };
    if (c.applyStart) events.push({ ...base, date: c.applyStart, type: 'start', title: `${c.code} শুরু` });
    if (c.applyDeadline) events.push({ ...base, date: c.applyDeadline, type: 'deadline', title: `${c.code} শেষ` });
    if (c.examDate) events.push({ ...base, date: c.examDate, type: 'exam', title: `${c.code} পরীক্ষা` });
  });
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function renderCalendar() {
  document.getElementById('calendarMonthTitle').textContent = `${BN_MONTHS[calMonth]} ${toBanglaNum(calYear)}`;
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const allEvents = getAllCalendarEvents();
  const t = todayStr();

  let html = '';
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';

  for (let day = 1; day <= daysInMonth; day++) {
    const fullDate = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = allEvents.filter(e => e.date === fullDate);
    const pills = dayEvents.slice(0, 3).map(ev =>
      `<span class="cal-pill ${ev.type}" title="${escapeHtml(ev.uniName)}">${escapeHtml(ev.title)}</span>`
    ).join('');
    const more = dayEvents.length > 3 ? `<span class="cal-more">+${toBanglaNum(dayEvents.length - 3)}</span>` : '';

    html += `
      <div class="cal-day ${fullDate === t ? 'today' : ''} ${selectedCalDate === fullDate ? 'selected' : ''}" onclick="selectCalendarDate('${fullDate}')">
        <span class="cal-day-num">${toBanglaNum(day)}</span>
        <div class="cal-event-dots">${pills}${more}</div>
      </div>`;
  }
  document.getElementById('calendarDaysGrid').innerHTML = html;
}

window.selectCalendarDate = function (dateStr) {
  selectedCalDate = selectedCalDate === dateStr ? null : dateStr;
  document.getElementById('timelineTitle').textContent = selectedCalDate
    ? `📌 ${formatBanglaDate(dateStr)} তারিখের ইভেন্ট`
    : '📌 ক্যালেন্ডার ইভেন্ট ও সময়সূচি';
  renderCalendar();
  renderTimeline();
};

function renderTimeline() {
  const listEl = document.getElementById('calendarTimelineList');
  let events = getAllCalendarEvents();
  if (selectedCalDate) {
    events = events.filter(e => e.date === selectedCalDate);
  } else {
    events = events.filter(e => e.date >= todayStr());
    if (timelineFilter !== 'all') events = events.filter(e => e.type === timelineFilter);
  }

  if (events.length === 0) {
    listEl.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding:18px;">কোনো ইভেন্ট নেই।</p>';
    return;
  }

  const labels = { start: '🟦 আবেদন শুরু', deadline: '⏳ আবেদনের শেষ দিন', exam: '🎯 ভর্তি পরীক্ষা' };
  listEl.innerHTML = events.map(ev => `
    <div class="timeline-item type-${ev.type}">
      <div style="display:flex; align-items:center; gap:10px;">
        ${renderUniLogo(ev.code, ev.website, ev.logoDomain, 'sm')}
        <div class="timeline-info">
          <h4>${escapeHtml(ev.uniName)} (${escapeHtml(ev.code)})</h4>
          <p>${labels[ev.type]} • <strong>${formatBanglaDate(ev.date)}</strong></p>
        </div>
      </div>
      <button class="btn-outline" style="padding:5px 9px; font-size:0.75rem;" onclick="openCircularModal('${ev.uniId}')">দেখুন</button>
    </div>
  `).join('');
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
function renderNotifications() {
  const listEl = document.getElementById('notifList');
  const badgeEl = document.getElementById('unreadNotifBadge');
  const unread = updates.filter(u => !readUpdateIds.has(u.id)).length;
  badgeEl.textContent = toBanglaNum(unread);
  badgeEl.style.display = unread > 0 ? 'flex' : 'none';

  if (updates.length === 0) {
    listEl.innerHTML = `<div style="padding:16px; color:var(--text-secondary); font-size:0.84rem;">
      এখনো কোনো নতুন নোটিশ শনাক্ত হয়নি। অফিশিয়াল ওয়েবসাইটগুলোতে নতুন কিছু প্রকাশ হলে এখানে দেখাবে।
    </div>`;
    return;
  }

  listEl.innerHTML = updates.slice(0, 50).map(u => `
    <div class="notif-item ${readUpdateIds.has(u.id) ? '' : 'unread'}" onclick="handleNotifClick('${u.id}')">
      ${renderUniLogo(u.code, u.url, null, 'sm')}
      <div class="notif-item-body">
        <h5>${escapeHtml(u.name)} (${escapeHtml(u.code)})</h5>
        <p>${escapeHtml(u.title)}</p>
        <span class="notif-item-time">${timeAgo(u.detectedAt)}</span>
      </div>
    </div>
  `).join('');
}

window.handleNotifClick = function (id) {
  const item = updates.find(u => u.id === id);
  readUpdateIds.add(id);
  persistRead();
  renderNotifications();
  if (item) window.open(item.url, '_blank', 'noopener');
};

// ---------------------------------------------------------------------------
// Monitored Official Websites Directory (Deduplicated + Logos)
// ---------------------------------------------------------------------------
function renderDirectory() {
  const grid = document.getElementById('universityDirectoryGrid');
  grid.innerHTML = sources.map(src => {
    const st = status.sources[src.id] || status.sources[src.id + '-admission'];
    let stateHtml = '<span class="dir-status pending">⏺ অপেক্ষমাণ</span>';
    if (st && st.ok) {
      stateHtml = `<span class="dir-status"><span class="live-dot" style="width:6px; height:6px;"></span> সক্রিয় • ${toBanglaNum(st.linkCount || 0)}টি লিংক</span>`;
    } else if (st && !st.ok) {
      stateHtml = `<span class="dir-status error" title="${escapeHtml(st.error)}">⚠ সার্ভার অফলাইন</span>`;
    }
    const latest = st && st.latest ? st.latest.slice(0, 2) : [];
    const targetUrl = src.admissionUrl || src.url;
    return `
      <div class="dir-card">
        <div class="dir-card-header">
          ${renderUniLogo(src.code, src.url, null, 'sm')}
          <div style="min-width:0;">
            <h4 style="font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(src.name)}">${escapeHtml(src.name)}</h4>
            ${stateHtml}
          </div>
        </div>
        ${latest.length ? `<div class="dir-latest">${latest.map(l =>
          `<a class="notice-link" href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${l.pdf ? '📄' : '🔗'} ${escapeHtml(l.title)}</a>`).join('')}</div>` : ''}
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.72rem; color:var(--text-secondary);">${escapeHtml(src.code)} • ${escapeHtml(src.category || '')}</span>
          <a href="${escapeHtml(targetUrl)}" target="_blank" rel="noopener" class="btn-outline" style="padding:4px 9px; font-size:0.74rem;">পোর্টাল ↗</a>
        </div>
      </div>`;
  }).join('');
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span style="font-size:1.1rem;">🔔</span><div style="font-size:0.85rem; font-weight:500;">${message}</div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4500);
}

// ---------------------------------------------------------------------------
// Event Listeners
// ---------------------------------------------------------------------------
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    clearBtn.style.display = searchQuery ? 'block' : 'none';
    renderCirculars();
  });
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearBtn.style.display = 'none';
    renderCirculars();
  });

  document.querySelectorAll('#categoryTabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#categoryTabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      renderCirculars();
    });
  });

  document.getElementById('statusFilter').addEventListener('change', e => { activeStatus = e.target.value; renderCirculars(); });
  document.getElementById('sortFilter').addEventListener('change', e => { activeSort = e.target.value; renderCirculars(); });

  document.getElementById('resetFiltersBtn').addEventListener('click', () => {
    activeCategory = 'all';
    activeStatus = 'all';
    searchQuery = '';
    showOnlySaved = false;
    searchInput.value = '';
    document.getElementById('statusFilter').value = 'all';
    document.querySelectorAll('#categoryTabs .tab-btn').forEach(b => b.classList.toggle('active', b.dataset.category === 'all'));
    updateSavedBadge();
    renderCirculars();
  });

  document.getElementById('savedFilterBtn').addEventListener('click', () => {
    showOnlySaved = !showOnlySaved;
    updateSavedBadge();
    renderCirculars();
    document.getElementById('circulars-section').scrollIntoView({ behavior: 'smooth' });
  });

  const notifBtn = document.getElementById('notifBellBtn');
  const notifDropdown = document.getElementById('notifDropdown');
  notifBtn.addEventListener('click', e => {
    e.stopPropagation();
    notifDropdown.classList.toggle('show');
  });
  document.addEventListener('click', e => {
    if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) notifDropdown.classList.remove('show');
  });
  document.getElementById('markAllReadBtn').addEventListener('click', () => {
    updates.forEach(u => readUpdateIds.add(u.id));
    persistRead();
    renderNotifications();
  });

  const requestBrowserNotif = async () => {
    if (!('Notification' in window)) {
      showToast('আপনার ব্রাউজারে নোটিফিকেশন সাপোর্ট নেই।');
      return;
    }
    const perm = await Notification.requestPermission();
    showToast(perm === 'granted'
      ? '✅ ব্রাউজার নোটিফিকেশন চালু হয়েছে।'
      : '❌ নোটিফিকেশনের অনুমতি দেওয়া হয়নি।');
  };
  document.getElementById('enablePushBtn').addEventListener('click', requestBrowserNotif);
  document.getElementById('subscribeAlertHeroBtn').addEventListener('click', requestBrowserNotif);

  document.getElementById('syncNowBtn').addEventListener('click', async () => {
    const icon = document.getElementById('syncIcon');
    icon.classList.add('spinning');
    await loadData();
    icon.classList.remove('spinning');
    showToast(`🔄 তথ্য রিফ্রেশ হয়েছে। সর্বশেষ চেক: ${timeAgo(status.lastRun)}`);
  });

  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('admissionHub_theme', next);
    document.getElementById('themeIcon').textContent = next === 'dark' ? '☀️' : '🌙';
  });

  document.getElementById('prevMonthBtn').addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    selectedCalDate = null;
    renderCalendar();
    renderTimeline();
  });
  document.getElementById('nextMonthBtn').addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    selectedCalDate = null;
    renderCalendar();
    renderTimeline();
  });

  document.querySelectorAll('.timeline-filter-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.timeline-filter-pills .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCalDate = null;
      timelineFilter = btn.dataset.evtype;
      renderCalendar();
      renderTimeline();
    });
  });

  document.getElementById('exportAllIcsBtn').addEventListener('click', () => {
    generateAndDownloadIcs(allCirculars(), 'Bangladesh-Public-University-Admission-Calendar.ics');
  });

  document.getElementById('gpaCalcForm').addEventListener('submit', e => {
    e.preventDefault();
    const group = document.getElementById('studentGroup').value;
    const ssc = parseFloat(document.getElementById('sscGpa').value) || 0;
    const hsc = parseFloat(document.getElementById('hscGpa').value) || 0;
    const total = ssc + hsc;
    const eligible = allCirculars().filter(c =>
      (c.allowedGroups || []).includes(group) && ssc >= c.minSscGpa && hsc >= c.minHscGpa && total >= c.minTotalGpa
    );
    const box = document.getElementById('gpaResultsBox');
    if (eligible.length === 0) {
      box.innerHTML = `<div class="calc-placeholder"><span>⚠️</span>
        <p>মোট জিপিএ ${toBanglaNum(total.toFixed(2))} দিয়ে তালিকার কোনো বিশ্ববিদ্যালয়ের ন্যূনতম শর্ত পূরণ হয়নি।</p></div>`;
      return;
    }
    box.innerHTML = `
      <h4 style="margin-bottom:6px; font-size:0.9rem; color:var(--accent-primary);">
        🎉 মোট জিপিএ ${toBanglaNum(total.toFixed(2))} দিয়ে আপনি ${toBanglaNum(eligible.length)}টিতে আবেদন করতে পারবেন:
      </h4>
      ${eligible.map(c => `
        <div class="eligible-item">
          <div style="display:flex; align-items:center; gap:8px;">
            ${renderUniLogo(c.code, c.website, c.logoDomain, 'sm')}
            <div>
              <strong style="font-size:0.86rem;">${escapeHtml(c.name)} (${escapeHtml(c.code)})</strong>
              <p style="font-size:0.74rem; color:var(--text-secondary);">ন্যূনতম: ${toBanglaNum(c.minTotalGpa)} • শেষ তারিখ: ${formatBanglaDate(c.applyDeadline)}</p>
            </div>
          </div>
          <button class="btn-outline" style="padding:5px 9px; font-size:0.75rem;" onclick="openCircularModal('${c.id}')">বিস্তারিত</button>
        </div>`).join('')}
    `;
  });

  const addBackdrop = document.getElementById('addCircularModalBackdrop');
  document.getElementById('addCustomCircularBtn').addEventListener('click', () => addBackdrop.classList.add('show'));
  const closeAdd = () => addBackdrop.classList.remove('show');
  document.getElementById('closeAddModalBtn').addEventListener('click', closeAdd);
  document.getElementById('cancelAddModalBtn').addEventListener('click', closeAdd);

  document.getElementById('addCircularForm').addEventListener('submit', e => {
    e.preventDefault();
    const val = id => document.getElementById(id).value.trim();
    const item = {
      id: 'custom-' + Date.now(),
      custom: true,
      code: val('newUniCode').toUpperCase(),
      name: val('newUniName'),
      englishName: '',
      category: val('newUniCategory'),
      units: val('newUniUnits'),
      applyStart: val('newApplyStart'),
      applyDeadline: val('newApplyDeadline'),
      examDate: val('newExamDate'),
      minSscGpa: 0,
      minHscGpa: 0,
      minTotalGpa: parseFloat(val('newMinTotalGpa')) || 0,
      allowedGroups: ['science', 'arts', 'commerce'],
      fee: val('newAppFee'),
      seats: '',
      website: val('newWebsiteUrl'),
      summary: 'আপনার যুক্ত করা কাস্টম সার্কুলার।'
    };
    customCirculars.unshift(item);
    localStorage.setItem('admissionHub_custom', JSON.stringify(customCirculars));
    closeAdd();
    e.target.reset();
    renderAll();
    showToast(`✅ ${escapeHtml(item.name)} যুক্ত হয়েছে।`);
  });

  document.getElementById('circularModalBackdrop').addEventListener('click', e => {
    if (e.target.id === 'circularModalBackdrop') closeCircularModal();
  });
}

async function initApp() {
  const savedTheme = localStorage.getItem('admissionHub_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.getElementById('themeIcon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  setupEventListeners();
  await loadData();
  setInterval(() => loadData({ silent: true }), API_CONFIG.REFRESH_INTERVAL_MS);
}

document.addEventListener('DOMContentLoaded', initApp);
