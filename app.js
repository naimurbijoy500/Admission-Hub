// =========================================================================
// Admission Hub Bangladesh - Frontend
// Data sources (all generated / stored in the GitHub repo):
//   data/circulars.json  - structured circular info (dates, GPA, fees) for the calendar
//   data/updates.json    - new notices auto-detected by scripts/monitor.js
//   data/status.json     - last check time & latest links for each official site
//   data/sources.json    - list of monitored official admission websites
// =========================================================================

const CATEGORY_LABELS = {
  general: 'সাধারণ ও স্বায়ত্তশাসিত বিশ্ববিদ্যালয়',
  engineering: 'প্রকৌশল ও প্রযুক্তি (Engineering)',
  medical: 'মেডিকেল ও ডেন্টাল',
  cluster: 'গুচ্ছ ভর্তি সিস্টেম (Cluster)',
  science_tech: 'বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়',
  specialized: 'বিশেষায়িত পাবলিক বিশ্ববিদ্যালয়'
};

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // re-check data every 10 minutes while the page is open

// State
let circulars = [];
let sources = [];
let status = { sources: {} };
let updates = [];
let customCirculars = JSON.parse(localStorage.getItem('admissionHub_custom') || '[]');
let savedIds = JSON.parse(localStorage.getItem('admissionHub_saved') || '[]');
let readUpdateIds = new Set(JSON.parse(localStorage.getItem('admissionHub_readUpdates') || '[]'));
let knownUpdateIds = null; // ids seen during this page session (for live alerts)

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
// Helpers
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

// Status is calculated from the dates, so it is always current.
function computeStatus(c) {
  const t = todayStr();
  if (c.applyStart && t < c.applyStart) return 'upcoming';
  if (c.applyDeadline && t > c.applyDeadline) return 'closed';
  return 'open';
}

function allCirculars() {
  return [...customCirculars, ...circulars].map(c => ({ ...c, status: computeStatus(c) }));
}

async function loadJson(path, fallback) {
  try {
    const res = await fetch(`${path}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (err) {
    console.warn('Could not load', path, err);
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
  } catch (e) {
    // Browsers may block audio before the first user interaction.
  }
}

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------
async function loadData({ silent = false } = {}) {
  const [c, s, st, u] = await Promise.all([
    loadJson('data/circulars.json', []),
    loadJson('data/sources.json', []),
    loadJson('data/status.json', { sources: {} }),
    loadJson('data/updates.json', [])
  ]);
  circulars = c;
  sources = s;
  status = st;
  updates = u;

  // First visit ever: don't flood the user with old items as "unread".
  if (!localStorage.getItem('admissionHub_readUpdates')) {
    updates.forEach(item => readUpdateIds.add(item.id));
    persistRead();
  }

  // Live alerts for items that appeared while the page was open.
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
    el.textContent = `${toBanglaNum(sources.length)}টি অফিশিয়াল ভর্তি ওয়েবসাইট নিয়মিত চেক করা হচ্ছে। সর্বশেষ চেক: ${timeAgo(status.lastRun)}`;
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
      open: ['🟢 আবেদন চলছে', 'status-open'],
      upcoming: ['🟡 আসন্ন', 'status-upcoming'],
      closed: ['🔴 আবেদন শেষ', 'status-closed']
    };
    const [statusText, statusClass] = statusMap[c.status];

    let countdownLabel = 'আবেদনের সময় শেষ হয়েছে';
    if (c.status === 'upcoming') countdownLabel = `🗓 আবেদন শুরু ${formatBanglaDate(c.applyStart)}`;
    else if (daysLeft >= 0) countdownLabel = `⏳ আবেদনের বাকি ${toBanglaNum(daysLeft)} দিন`;

    const verifyBadge = c.custom
      ? '<span class="verify-badge custom">👤 আপনার যুক্ত করা</span>'
      : c.verified
        ? '<span class="verify-badge ok">✔ যাচাইকৃত</span>'
        : '<span class="verify-badge warn" title="তারিখ ও তথ্য অফিশিয়াল সার্কুলারের সাথে মিলিয়ে নিন">⚠ নমুনা তথ্য — অফিশিয়াল সাইটে যাচাই করুন</span>';

    return `
      <article class="circular-card">
        <div>
          <div class="card-top">
            <div class="uni-badge-group">
              <div class="uni-short-avatar">${escapeHtml(c.code)}</div>
              <div class="uni-title-wrap">
                <h3>${escapeHtml(c.name)}</h3>
                <span class="uni-category-label">${CATEGORY_LABELS[c.category] || 'পাবলিক বিশ্ববিদ্যালয়'}</span>
              </div>
            </div>
            <div class="card-top-right">
              <span class="status-badge ${statusClass}">${statusText}</span>
              <button class="bookmark-btn ${isSaved ? 'saved' : ''}" onclick="toggleBookmark('${c.id}')" title="সংরক্ষণ করুন">
                ${isSaved ? '★' : '☆'}
              </button>
            </div>
          </div>

          ${verifyBadge}

          <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 10px 0 14px;">
            ${escapeHtml(c.summary || '')}
          </p>

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
            <span style="font-size: 0.76rem; color: var(--text-secondary);">📅 ক্যালেন্ডারে আছে</span>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-primary" onclick="openCircularModal('${c.id}')">📄 বিস্তারিত</button>
          <button class="btn-outline" onclick="addToGoogleCalendar('${c.id}')" title="Google Calendar-এ যুক্ত করুন">📅 Google Calendar</button>
          <a href="${escapeHtml(c.website)}" target="_blank" rel="noopener" class="btn-outline">🔗 অফিশিয়াল সাইট</a>
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
  const latest = src && status.sources[src.id] ? (status.sources[src.id].latest || []) : [];

  content.innerHTML = `
    <div class="modal-header">
      <div class="uni-badge-group">
        <div class="uni-short-avatar">${escapeHtml(c.code)}</div>
        <div>
          <h3>${escapeHtml(c.name)}</h3>
          <p style="font-size:0.85rem; color:var(--text-secondary);">${escapeHtml(c.englishName || '')}</p>
        </div>
      </div>
      <button class="close-modal-btn" onclick="closeCircularModal()">✕</button>
    </div>

    <div style="display:flex; flex-direction:column; gap:14px;">
      ${!c.verified && !c.custom ? '<div class="verify-badge warn" style="display:block;">⚠ এই তারিখ ও শর্তগুলো নমুনা তথ্য। আবেদন করার আগে অবশ্যই অফিশিয়াল সার্কুলার দেখে নিন।</div>' : ''}
      <p style="color:var(--text-secondary);">${escapeHtml(c.summary || '')}</p>

      <div class="card-meta-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
        <div class="meta-item"><span>ইউনিট সমূহ</span><strong>${escapeHtml(c.units)}</strong></div>
        <div class="meta-item"><span>আবেদন শুরুর তারিখ</span><strong>${formatBanglaDate(c.applyStart)}</strong></div>
        <div class="meta-item"><span>আবেদনের শেষ তারিখ</span><strong style="color:var(--warning);">${formatBanglaDate(c.applyDeadline)}</strong></div>
        <div class="meta-item"><span>ভর্তি পরীক্ষার তারিখ</span><strong style="color:var(--accent-primary);">${formatBanglaDate(c.examDate)}</strong></div>
        <div class="meta-item"><span>ন্যূনতম জিপিএ</span><strong>SSC: ${toBanglaNum(c.minSscGpa)} | HSC: ${toBanglaNum(c.minHscGpa)} (মোট: ${toBanglaNum(c.minTotalGpa)})</strong></div>
        <div class="meta-item"><span>আবেদন ফি ও আসন</span><strong>${escapeHtml(c.fee)} • ${escapeHtml(c.seats || '—')}</strong></div>
      </div>

      ${latest.length ? `
        <div style="background:var(--bg-secondary); padding:14px; border-radius:12px;">
          <h4 style="margin-bottom:8px; font-size:0.95rem;">📰 অফিশিয়াল সাইটে সর্বশেষ পাওয়া নোটিশ</h4>
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
    const base = { uniId: c.id, code: c.code, uniName: c.name };
    if (c.applyStart) events.push({ ...base, date: c.applyStart, type: 'start', title: `${c.code} আবেদন শুরু` });
    if (c.applyDeadline) events.push({ ...base, date: c.applyDeadline, type: 'deadline', title: `${c.code} শেষ দিন` });
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
    listEl.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding:24px;">কোনো ইভেন্ট নেই।</p>';
    return;
  }

  const labels = { start: '🟦 আবেদন শুরু', deadline: '⏳ আবেদনের শেষ দিন', exam: '🎯 ভর্তি পরীক্ষা' };
  listEl.innerHTML = events.map(ev => `
    <div class="timeline-item type-${ev.type}">
      <div class="timeline-info">
        <h4>${escapeHtml(ev.uniName)} (${escapeHtml(ev.code)})</h4>
        <p>${labels[ev.type]} • <strong>${formatBanglaDate(ev.date)}</strong></p>
      </div>
      <button class="btn-outline" style="padding:6px 10px; font-size:0.78rem;" onclick="openCircularModal('${ev.uniId}')">দেখুন</button>
    </div>
  `).join('');
}

// ---------------------------------------------------------------------------
// Notifications (from data/updates.json, produced by the GitHub Actions monitor)
// ---------------------------------------------------------------------------
function renderNotifications() {
  const listEl = document.getElementById('notifList');
  const badgeEl = document.getElementById('unreadNotifBadge');
  const unread = updates.filter(u => !readUpdateIds.has(u.id)).length;
  badgeEl.textContent = toBanglaNum(unread);
  badgeEl.style.display = unread > 0 ? 'flex' : 'none';

  if (updates.length === 0) {
    listEl.innerHTML = `<div style="padding:20px; color:var(--text-secondary); font-size:0.88rem;">
      এখনো কোনো নতুন নোটিশ শনাক্ত হয়নি। অফিশিয়াল ওয়েবসাইটগুলোতে নতুন কিছু প্রকাশ হলে এখানে দেখাবে।
    </div>`;
    return;
  }

  listEl.innerHTML = updates.slice(0, 50).map(u => `
    <div class="notif-item ${readUpdateIds.has(u.id) ? '' : 'unread'}" onclick="handleNotifClick('${u.id}')">
      <div class="notif-item-icon">${u.pdf ? '📄' : '🔔'}</div>
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
// Monitored official websites directory
// ---------------------------------------------------------------------------
function renderDirectory() {
  const grid = document.getElementById('universityDirectoryGrid');
  grid.innerHTML = sources.map(src => {
    const st = status.sources[src.id];
    let stateHtml = '<span class="dir-status pending">⏺ এখনো চেক করা হয়নি</span>';
    if (st && st.ok) {
      stateHtml = `<span class="dir-status"><span class="live-dot" style="width:7px; height:7px;"></span> চেক হয়েছে ${timeAgo(st.lastChecked)} • ${toBanglaNum(st.linkCount || 0)}টি লিংক</span>`;
    } else if (st && !st.ok) {
      stateHtml = `<span class="dir-status error" title="${escapeHtml(st.error)}">⚠ সাইটে পৌঁছানো যায়নি (${timeAgo(st.lastChecked)})</span>`;
    }
    const latest = st && st.latest ? st.latest.slice(0, 3) : [];
    return `
      <div class="dir-card">
        <div class="dir-card-header">
          <div class="uni-short-avatar" style="width:42px; height:42px; font-size:0.78rem;">${escapeHtml(src.code)}</div>
          <div>
            <h4 style="font-size:0.96rem;">${escapeHtml(src.name)}</h4>
            ${stateHtml}
          </div>
        </div>
        ${latest.length ? `<div class="dir-latest">${latest.map(l =>
          `<a class="notice-link" href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${l.pdf ? '📄' : '🔗'} ${escapeHtml(l.title)}</a>`).join('')}</div>` : ''}
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(src.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</span>
          <a href="${escapeHtml(src.url)}" target="_blank" rel="noopener" class="btn-outline" style="padding:5px 10px; font-size:0.78rem;">ভিজিট ↗</a>
        </div>
      </div>`;
  }).join('');
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span style="font-size:1.3rem;">🔔</span><div style="font-size:0.9rem; font-weight:500;">${message}</div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// ---------------------------------------------------------------------------
// Event listeners
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
      showToast('আপনার ব্রাউজারে নোটিফিকেশন সাপোর্ট নেই। ফোনে অ্যালার্ট পেতে টেলিগ্রাম চ্যানেল ব্যবহার করুন।');
      return;
    }
    const perm = await Notification.requestPermission();
    showToast(perm === 'granted'
      ? '✅ ব্রাউজার নোটিফিকেশন চালু হয়েছে। পেজ খোলা থাকলে নতুন নোটিশ এলেই জানাবে।'
      : '❌ নোটিফিকেশনের অনুমতি দেওয়া হয়নি।');
  };
  document.getElementById('enablePushBtn').addEventListener('click', requestBrowserNotif);
  document.getElementById('subscribeAlertHeroBtn').addEventListener('click', requestBrowserNotif);

  document.getElementById('syncNowBtn').addEventListener('click', async () => {
    const icon = document.getElementById('syncIcon');
    icon.classList.add('spinning');
    await loadData();
    icon.classList.remove('spinning');
    showToast(`🔄 তথ্য রিফ্রেশ হয়েছে। সর্বশেষ সার্ভার চেক: ${timeAgo(status.lastRun)}`);
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
      <h4 style="margin-bottom:6px; color:var(--accent-primary);">
        🎉 মোট জিপিএ ${toBanglaNum(total.toFixed(2))} দিয়ে আপনি ${toBanglaNum(eligible.length)}টিতে আবেদন করতে পারেন:
      </h4>
      <p style="font-size:0.78rem; color:var(--text-secondary); margin-bottom:12px;">বিষয়ভিত্তিক শর্ত (যেমন গণিত/জীববিজ্ঞানে জিপিএ) অফিশিয়াল সার্কুলারে মিলিয়ে নিন।</p>
      ${eligible.map(c => `
        <div class="eligible-item">
          <div>
            <strong>${escapeHtml(c.name)} (${escapeHtml(c.code)})</strong>
            <p style="font-size:0.78rem; color:var(--text-secondary);">ন্যূনতম: ${toBanglaNum(c.minTotalGpa)} • ডেডলাইন: ${formatBanglaDate(c.applyDeadline)}</p>
          </div>
          <button class="btn-outline" style="padding:6px 10px; font-size:0.8rem;" onclick="openCircularModal('${c.id}')">বিস্তারিত</button>
        </div>`).join('')}
    `;
  });

  // Personal circulars (saved only in this browser)
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
      summary: 'আপনার নিজের যুক্ত করা সার্কুলার (শুধু এই ব্রাউজারে সংরক্ষিত)।'
    };
    customCirculars.unshift(item);
    localStorage.setItem('admissionHub_custom', JSON.stringify(customCirculars));
    closeAdd();
    e.target.reset();
    renderAll();
    showToast(`✅ ${escapeHtml(item.name)} যুক্ত হয়েছে এবং ক্যালেন্ডারে তারিখগুলো বসানো হয়েছে।`);
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
  setInterval(() => loadData({ silent: true }), REFRESH_INTERVAL_MS);
}

document.addEventListener('DOMContentLoaded', initApp);
