/* ============================================================
   WAFER 개인 투자 터미널
   - Finnhub 무료 API로 실시간 시세를 가져옵니다.
   - API 키는 브라우저 localStorage에만 저장됩니다 (서버 없음).
   ============================================================ */

const LS_KEYS = {
  apiKey: 'wafer_api_key',
  watchlist: 'wafer_watchlist',
  goal: 'wafer_goal',
  fng: 'wafer_fng',
  vixManual: 'wafer_vix_manual',
};

const DEFAULT_WATCHLIST = {
  leverage: ['SOXL', 'SOXS'],
  software: ['IGV', 'WCLD', 'SKYY', 'XSW'],
  pick: ['LLY', 'ISRG', 'RKLB', 'LMT'],
};

const GROUP_LABELS = {
  leverage: '레버리지 / 인버스',
  software: '미국 소프트웨어 ETF',
  pick: 'AI 추천 종목 (헬스케어 · 우주/방산)',
};

const COLORS = { green: '#1FA971', amber: '#E5A100', red: '#E14848', gray: '#C7CEDB' };

let watchlist = loadJSON(LS_KEYS.watchlist, DEFAULT_WATCHLIST);
let apiKey = localStorage.getItem(LS_KEYS.apiKey) || '';
let quoteCache = {};
let aiResultsCache = [];

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function saveJSON(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// -------------------- 상단바 --------------------
document.getElementById('topbarDate').textContent = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric', month: '2-digit', day: '2-digit',
});

// -------------------- Finnhub 호출 --------------------
async function fetchQuote(symbol) {
  if (!apiKey) return null;
  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.c === undefined || data.c === 0) return null;
    return data;
  } catch (e) {
    return null;
  }
}

async function fetchMetric(symbol) {
  if (!apiKey) return null;
  try {
    const res = await fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${apiKey}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.metric || null;
  } catch (e) {
    return null;
  }
}

// -------------------- 관심종목 --------------------
function allSymbols() {
  return [...watchlist.leverage, ...watchlist.software, ...watchlist.pick];
}

function renderWatchlistSkeleton() {
  const wrap = document.getElementById('watchlistGroups');
  wrap.innerHTML = '';
  Object.keys(watchlist).forEach((groupKey) => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'wl-group';
    groupDiv.innerHTML = `<h3 class="wl-group-title">${GROUP_LABELS[groupKey]}</h3><div class="wl-grid" id="wlgrid-${groupKey}"></div>`;
    wrap.appendChild(groupDiv);

    const grid = groupDiv.querySelector(`#wlgrid-${groupKey}`);
    watchlist[groupKey].forEach((sym) => {
      const card = document.createElement('div');
      card.className = 'stock-card';
      card.id = `card-${sym}`;
      card.innerHTML = `
        <button class="remove-btn" data-remove="${sym}" data-group="${groupKey}">✕</button>
        <div class="ticker">${sym}</div>
        <div class="price" id="price-${sym}">—</div>
        <div class="change" id="change-${sym}">${apiKey ? '불러오는 중...' : 'API 키 필요'}</div>
      `;
      grid.appendChild(card);
    });
  });

  wrap.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sym = btn.getAttribute('data-remove');
      const group = btn.getAttribute('data-group');
      watchlist[group] = watchlist[group].filter((s) => s !== sym);
      saveJSON(LS_KEYS.watchlist, watchlist);
      renderWatchlistSkeleton();
      loadAllQuotes();
    });
  });

  const count = allSymbols().length;
  document.getElementById('kpiSymbolCount').innerHTML = `${count}<span class="kpi-unit">개</span>`;
  document.getElementById('subSymbolCount').textContent = count;
}

async function loadAllQuotes() {
  if (!apiKey) return;
  const symbols = allSymbols();
  await Promise.all(symbols.map(async (sym) => {
    const q = await fetchQuote(sym);
    const priceEl = document.getElementById(`price-${sym}`);
    const changeEl = document.getElementById(`change-${sym}`);
    if (!priceEl) return;
    if (!q) {
      changeEl.textContent = '데이터 없음';
      return;
    }
    quoteCache[sym] = q;
    priceEl.textContent = `$${q.c.toFixed(2)}`;
    const sign = q.d >= 0 ? '+' : '';
    changeEl.textContent = `${sign}${q.d.toFixed(2)} (${sign}${q.dp.toFixed(2)}%)`;
    changeEl.className = 'change ' + (q.d >= 0 ? 'up' : 'down');
  }));
  renderChangeBarList();
}

function renderChangeBarList() {
  const wrap = document.getElementById('changeBarList');
  const entries = Object.entries(quoteCache);
  if (!entries.length) {
    wrap.innerHTML = '<p class="empty-note">설정에서 API 키를 입력하면 표시됩니다.</p>';
    return;
  }
  const maxAbs = Math.max(...entries.map(([, q]) => Math.abs(q.dp)), 1);
  wrap.innerHTML = '';
  entries.sort((a, b) => b[1].dp - a[1].dp).forEach(([sym, q]) => {
    const pct = Math.min(100, (Math.abs(q.dp) / maxAbs) * 100);
    const cls = q.d >= 0 ? 'up' : 'down';
    const sign = q.d >= 0 ? '+' : '';
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <span class="bar-ticker">${sym}</span>
      <span class="bar-track"><span class="bar-fill ${cls}" style="width:${pct}%"></span></span>
      <span class="bar-pct ${cls}">${sign}${q.dp.toFixed(2)}%</span>
    `;
    wrap.appendChild(row);
  });
}

// -------------------- AI 매매 추천 --------------------
function scoreBuffett(m) {
  let score = 0;
  const reasons = [];
  if (m.roeTTM !== undefined && m.roeTTM > 15) { score += 25; reasons.push(`ROE ${m.roeTTM.toFixed(1)}%`); }
  if (m.peBasicExclExtraTTM !== undefined && m.peBasicExclExtraTTM > 0 && m.peBasicExclExtraTTM < 25) { score += 25; reasons.push(`PER ${m.peBasicExclExtraTTM.toFixed(1)}배`); }
  if (m['totalDebt/totalEquityAnnual'] !== undefined && m['totalDebt/totalEquityAnnual'] < 0.5) { score += 25; reasons.push('낮은 부채비율'); }
  if (m.grossMarginTTM !== undefined && m.grossMarginTTM > 40) { score += 25; reasons.push(`매출총이익률 ${m.grossMarginTTM.toFixed(0)}%`); }
  return { score, reasons };
}

function scoreLynch(m) {
  let score = 0;
  const reasons = [];
  const growth = m.epsGrowth5Y ?? m.epsGrowthTTMYoy;
  const pe = m.peBasicExclExtraTTM;
  if (growth !== undefined && growth > 10) { score += 30; reasons.push(`EPS 성장률 ${growth.toFixed(1)}%`); }
  if (growth !== undefined && pe !== undefined && pe > 0) {
    const peg = pe / growth;
    if (peg > 0 && peg < 1.5) { score += 40; reasons.push(`PEG ${peg.toFixed(2)}`); }
  }
  if (m.currentRatioAnnual !== undefined && m.currentRatioAnnual > 1.5) { score += 30; reasons.push('우수한 유동성'); }
  return { score, reasons };
}

function verdictFromScore(total) {
  if (total >= 65) return { label: '매수 관심', cls: 'buy' };
  if (total >= 35) return { label: '관망', cls: 'watch' };
  return { label: '유의', cls: 'avoid' };
}

async function renderAiSection() {
  const listEl = document.getElementById('aiIssueList');
  if (!apiKey) {
    listEl.innerHTML = '<p class="empty-note">설정에서 Finnhub API 키를 입력하면 분석이 표시됩니다.</p>';
    updateSignalDonut([]);
    document.getElementById('kpiBuyCount').innerHTML = '0<span class="kpi-unit">건</span>';
    return;
  }
  const symbols = [...watchlist.software, ...watchlist.pick];
  listEl.innerHTML = '<p class="empty-note">분석 중...</p>';

  const rows = await Promise.all(symbols.map(async (sym) => {
    const m = await fetchMetric(sym);
    if (!m) return { sym, error: true };
    const b = scoreBuffett(m);
    const l = scoreLynch(m);
    const total = Math.round((b.score + l.score) / 2);
    const v = verdictFromScore(total);
    const reasons = [...b.reasons, ...l.reasons];
    return { sym, total, verdict: v, reasons };
  }));

  aiResultsCache = rows;
  listEl.innerHTML = '';
  rows.forEach((r) => {
    const row = document.createElement('div');
    if (r.error) {
      row.className = 'issue-row';
      row.innerHTML = `<div class="issue-body"><span class="issue-title">${r.sym}</span><div class="issue-desc">재무 데이터를 가져오지 못했습니다.</div></div>`;
    } else {
      row.className = `issue-row ${r.verdict.cls}`;
      row.innerHTML = `
        <span class="issue-badge ${r.verdict.cls}">${r.verdict.label}</span>
        <div class="issue-body">
          <span class="issue-title">${r.sym}</span><span class="issue-score">종합 ${r.total}점</span>
          <div class="issue-desc">${r.reasons.length ? r.reasons.join(' · ') : '뚜렷한 신호 없음'}</div>
        </div>
      `;
    }
    listEl.appendChild(row);
  });

  updateSignalDonut(rows.filter((r) => !r.error));
  const buyCount = rows.filter((r) => !r.error && r.verdict.cls === 'buy').length;
  document.getElementById('kpiBuyCount').innerHTML = `${buyCount}<span class="kpi-unit">건</span>`;
}

// -------------------- 도넛 차트 (canvas) --------------------
function updateSignalDonut(rows) {
  const canvas = document.getElementById('signalDonut');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 180;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const counts = { buy: 0, watch: 0, avoid: 0 };
  rows.forEach((r) => counts[r.verdict.cls]++);
  const total = rows.length;
  document.getElementById('donutTotal').textContent = total;

  const segments = [
    { key: 'buy', label: '매수 관심', color: COLORS.green, count: counts.buy },
    { key: 'watch', label: '관망', color: COLORS.amber, count: counts.watch },
    { key: 'avoid', label: '유의', color: COLORS.red, count: counts.avoid },
  ];

  const cx = size / 2, cy = size / 2, r = 78, lineWidth = 22;
  if (total === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#E4E8F0';
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  } else {
    let start = -Math.PI / 2;
    segments.forEach((seg) => {
      if (seg.count === 0) return;
      const angle = (seg.count / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + angle);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'butt';
      ctx.stroke();
      start += angle;
    });
  }

  const legend = document.getElementById('signalLegend');
  legend.innerHTML = segments.map((seg) => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${seg.color}"></span>
      ${seg.label}<span class="legend-count">${seg.count}건</span>
    </div>
  `).join('');
}

// -------------------- 시장 지표 --------------------
async function renderIndicators() {
  if (!apiKey) return;

  const vixManual = localStorage.getItem(LS_KEYS.vixManual);
  const vixQ = await fetchQuote('^VIX');
  if (vixQ) {
    document.getElementById('vixValue').textContent = vixQ.c.toFixed(2);
    document.getElementById('kpiVix').textContent = vixQ.c.toFixed(2);
    const sign = vixQ.d >= 0 ? '+' : '';
    const changeEl = document.getElementById('vixChange');
    changeEl.textContent = `${sign}${vixQ.d.toFixed(2)} (${sign}${vixQ.dp.toFixed(2)}%)`;
    changeEl.className = 'mini-change ' + (vixQ.d >= 0 ? 'up' : 'down');
  } else if (vixManual) {
    document.getElementById('vixValue').textContent = vixManual + ' (수동)';
    document.getElementById('kpiVix').textContent = vixManual;
  } else {
    document.getElementById('vixValue').textContent = '데이터 없음';
  }

  const qqq = await fetchQuote('QQQ');
  if (qqq) {
    document.getElementById('ndxValue').textContent = `$${qqq.c.toFixed(2)}`;
    const sign = qqq.d >= 0 ? '+' : '';
    const changeEl = document.getElementById('ndxChange');
    changeEl.textContent = `${sign}${qqq.d.toFixed(2)} (${sign}${qqq.dp.toFixed(2)}%)`;
    changeEl.className = 'mini-change ' + (qqq.d >= 0 ? 'up' : 'down');
  } else {
    document.getElementById('ndxValue').textContent = '데이터 없음';
  }
}

document.querySelector('[data-manual="vix"]').addEventListener('click', () => {
  const val = prompt('VIX 값을 직접 입력하세요 (예: 18.5)');
  if (val && !isNaN(parseFloat(val))) {
    localStorage.setItem(LS_KEYS.vixManual, parseFloat(val).toFixed(2));
    renderIndicators();
  }
});

// -------------------- 공포탐욕 게이지 --------------------
function updateFngGauge(value) {
  const clamped = Math.max(0, Math.min(100, Number(value)));
  document.getElementById('fngValue').textContent = clamped;
  const arc = document.getElementById('fngArc');
  const circumference = 251.2;
  const offset = circumference - (circumference * clamped) / 100;
  arc.setAttribute('stroke-dashoffset', offset);

  const angle = -90 + (clamped / 100) * 180;
  document.getElementById('fngNeedle').setAttribute('transform', `rotate(${angle} 100 100)`);

  let label;
  if (clamped < 25) label = '극도의 공포';
  else if (clamped < 45) label = '공포';
  else if (clamped < 55) label = '중립';
  else if (clamped < 75) label = '탐욕';
  else label = '극도의 탐욕';
  document.getElementById('fngLabel').textContent = label;

  saveJSON(LS_KEYS.fng, clamped);
}

document.getElementById('fngSlider').addEventListener('input', (e) => {
  updateFngGauge(e.target.value);
});

// -------------------- 목표 설정 --------------------
function loadGoal() {
  const goal = loadJSON(LS_KEYS.goal, {});
  if (goal.currentValue !== undefined) document.getElementById('currentValueInput').value = goal.currentValue;
  if (goal.principal !== undefined) document.getElementById('principalInput').value = goal.principal;
  if (goal.targetProfit !== undefined) document.getElementById('targetProfitInput').value = goal.targetProfit;
  renderGoalReadout(goal);
}

function renderGoalReadout(goal) {
  const currentValue = parseFloat(goal.currentValue) || 0;
  const principal = parseFloat(goal.principal) || 0;
  const targetProfit = parseFloat(goal.targetProfit) || 0;
  const profit = currentValue - principal;

  const profitEl = document.getElementById('currentProfitValue');
  profitEl.textContent = `${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`;
  profitEl.style.color = profit >= 0 ? 'var(--green)' : 'var(--red)';

  document.getElementById('kpiProfit').textContent = `${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`;
  document.getElementById('kpiProfit').style.color = profit >= 0 ? 'var(--green)' : 'var(--red)';

  const circumference = 439.8;
  const ring = document.getElementById('goalRingArc');

  if (targetProfit > 0) {
    const pct = Math.max(0, Math.min(100, (profit / targetProfit) * 100));
    ring.setAttribute('stroke-dashoffset', circumference - (circumference * pct) / 100);
    document.getElementById('goalRingPct').textContent = `${pct.toFixed(0)}%`;
    document.getElementById('kpiGoalPct').innerHTML = `${pct.toFixed(0)}<span class="kpi-unit">%</span>`;
    document.getElementById('kpiGoalFoot').textContent = `목표 $${targetProfit.toFixed(0)} 중 진행`;
    document.getElementById('goalAchievementLabel').textContent =
      pct >= 100 ? '목표 달성! 🎯' : `$${(targetProfit - profit).toFixed(2)} 남음`;
  } else {
    ring.setAttribute('stroke-dashoffset', circumference);
    document.getElementById('goalRingPct').textContent = '0%';
    document.getElementById('kpiGoalPct').innerHTML = '0<span class="kpi-unit">%</span>';
    document.getElementById('kpiGoalFoot').textContent = '목표 수익금 미설정';
    document.getElementById('goalAchievementLabel').textContent = '목표 수익금을 입력하세요';
  }
}

document.getElementById('saveGoalBtn').addEventListener('click', () => {
  const goal = {
    currentValue: document.getElementById('currentValueInput').value,
    principal: document.getElementById('principalInput').value,
    targetProfit: document.getElementById('targetProfitInput').value,
  };
  saveJSON(LS_KEYS.goal, goal);
  renderGoalReadout(goal);
});

// -------------------- 설정 --------------------
document.getElementById('apiKeyInput').value = apiKey;
document.getElementById('saveApiKeyBtn').addEventListener('click', () => {
  apiKey = document.getElementById('apiKeyInput').value.trim();
  localStorage.setItem(LS_KEYS.apiKey, apiKey);
  renderWatchlistSkeleton();
  loadAllQuotes();
  renderIndicators();
  renderAiSection();
});

// -------------------- 종목 추가 --------------------
document.getElementById('addSymbolBtn').addEventListener('click', () => {
  const input = document.getElementById('addSymbolInput');
  const sym = input.value.trim().toUpperCase();
  const group = document.getElementById('addCategorySelect').value;
  if (!sym) return;
  if (!watchlist[group].includes(sym)) {
    watchlist[group].push(sym);
    saveJSON(LS_KEYS.watchlist, watchlist);
    renderWatchlistSkeleton();
    loadAllQuotes();
    renderAiSection();
  }
  input.value = '';
});

document.getElementById('refreshAllBtn').addEventListener('click', () => {
  loadAllQuotes();
  renderIndicators();
  renderAiSection();
});

// -------------------- 사이드바 스크롤 강조 --------------------
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navItems.forEach((i) => i.classList.remove('active'));
    item.classList.add('active');
    const section = item.getAttribute('data-section');
    const label = item.textContent;
    document.getElementById('breadcrumbCurrent').textContent = label;
  });
});

// -------------------- 초기화 --------------------
function init() {
  renderWatchlistSkeleton();
  const savedFng = loadJSON(LS_KEYS.fng, 50);
  document.getElementById('fngSlider').value = savedFng;
  updateFngGauge(savedFng);
  loadGoal();
  updateSignalDonut([]);

  if (apiKey) {
    loadAllQuotes();
    renderIndicators();
    renderAiSection();
  }
}

init();
