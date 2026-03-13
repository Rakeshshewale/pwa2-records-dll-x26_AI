/* ══════════════════════════════════════════════════════
   Daily Expense Tracker V2 — app.js
   Repo: pwa2-records-dll-x26_AI
   ══════════════════════════════════════════════════════ */

Chart.register(ChartDataLabels);

const API = "https://script.google.com/macros/s/AKfycbx_wHyePe_GKAA9YBmpccIyPkYrKikyfosaWmhVJxZH1_MActOeD0IETvVIhnu2g_-O/exec";

/* ══ EXACT backend values → Google Sheet columns E–N ══ */
const CATS = {
  "Food":           ["Dining out","Snacks","Food deliveries","Groceries","Fruit"],
  "Shopping":       ["Shopping mart","Amazon","Electronics","Clothing","Other"],
  "Transportation": ["Public transport","Cab","Flight/Hotel","Rental vehicle","Other"],
  "Bills":          ["Electricity","Rent","Phone bills","Cable","Other"],
  "Entertainment":  ["Ytube+","Apple account","Outings","Movies","Other"],
  "Personal care":  ["Medical","Hair saloon spa","Cosmetics","Dr appointments","Other"],
  "Insurance":      ["LIC","Health Insurance","Term Insurance"],
  "Other Expenses": ["Laundry","Splitwise pay","Career","Vacation","Other"],
  "Money transfer": ["Salary","Salary to Kotak","Salary to ICICI","ICICI to Kotak","Kotak to ICICI","Cash withdrawal","Investment","Other income","E-wallet topup"],
  "Opening balance":["HDFC balance","ICICI balance","Kotak Balance","E-wallet balance","Cash"]
};

/* ══ Short display labels for buttons ══ */
const CAT_SHORT = {
  "Food":"Food","Shopping":"Shopping","Transportation":"Transport","Bills":"Bills",
  "Entertainment":"Entertain","Personal care":"Personal","Insurance":"Insurance","Other Expenses":"Other Exp",
  "Money transfer":"Money transfer","Opening balance":"Opening balance"
};

const DET_SHORT = {
  "Dining out":"Dining","Snacks":"Snacks","Food deliveries":"Delivery","Groceries":"Groceries","Fruit":"Fruit",
  "Shopping mart":"Mart","Amazon":"Amazon","Electronics":"Electronics","Clothing":"Clothing","Other":"Other",
  "Public transport":"Public","Cab":"Cab","Flight/Hotel":"Flight/Hotel","Rental vehicle":"Rental",
  "Electricity":"Electricity","Rent":"Rent","Phone bills":"Phone","Cable":"Cable",
  "Ytube+":"Ytube+","Apple account":"Apple","Outings":"Outings","Movies":"Movies",
  "Medical":"Medical","Hair saloon spa":"Saloon","Cosmetics":"Cosmetics","Dr appointments":"Doctor",
  "LIC":"LIC","Health Insurance":"Health Ins","Term Insurance":"Term Ins",
  "Laundry":"Laundry","Splitwise pay":"Splitwise","Career":"Career","Vacation":"Vacation",
  "Salary to Kotak":"Salary→Kotak","Salary to ICICI":"Salary→ICICI","ICICI to Kotak":"ICICI→Kotak","Kotak to ICICI":"Kotak→ICICI",
  "Cash withdrawal":"Cash W/D","Salary":"Salary","Investment":"Investment","Other income":"Other Income","E-wallet topup":"Wallet Topup",
  "HDFC balance":"HDFC","ICICI balance":"ICICI","Kotak Balance":"Kotak","E-wallet balance":"Wallet","Cash":"Cash"
};

const DET_COLS = {
  "Food":5,"Shopping":4,"Transportation":5,"Bills":5,
  "Entertainment":5,"Personal care":5,"Insurance":3,"Other Expenses":5,
  "Money transfer":3,"Opening balance":3
};

const EXP_CATS = ["Food","Shopping","Transportation","Bills","Entertainment","Personal care","Insurance","Other Expenses"];
const TRN_CATS = ["Money transfer","Opening balance"];

let S = { type:"", mode:"", cat:"", det:"", cc:"" };
let localEntries = [];


/* ═══════════════════════════════════════
   TABS
   ═══════════════════════════════════════ */
document.querySelectorAll('.tab').forEach(t => {
  t.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('p-' + t.dataset.tab).classList.add('active');
  };
});


/* ═══════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════ */
function clrGroup(el, cls) { el.querySelectorAll('button').forEach(b => { cls.forEach(c => b.classList.remove(c)); }); }
function activate(el, btn, cls) { clrGroup(el, ['btn-type','btn-mode','btn-cat','btn-detx','btn-ccx']); btn.classList.add(cls); }
function shake(id) { const e = document.getElementById(id); e.style.animation = 'shake .4s'; setTimeout(() => e.style.animation = '', 400); }
function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits:0, maximumFractionDigits:0 }); }
function fmtK(n) { return n >= 100000 ? '₹' + (n/100000).toFixed(1) + 'L' : n >= 1000 ? '₹' + (n/1000).toFixed(1) + 'K' : fmt(n); }


/* ═══════════════════════════════════════
   ENTRY TAB
   ═══════════════════════════════════════ */

/* TYPE */
document.getElementById('typeGrid').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  activate(e.currentTarget, b, 'btn-type');
  S.type = b.dataset.val; S.cat = ''; S.det = ''; S.cc = '';
  buildUI(b.dataset.val);
});

/* MODE */
document.getElementById('modeGrid').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  activate(e.currentTarget, b, 'btn-mode');
  S.mode = b.dataset.val;
});

/* CC CARDS */
document.getElementById('ccGrid').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  activate(e.currentTarget, b, 'btn-ccx');
  S.cc = b.dataset.val;
});

function buildUI(type) {
  const ms = document.getElementById('modeSection');
  const cs = document.getElementById('catSection');
  const ds = document.getElementById('detSection');
  const cc = document.getElementById('ccSection');
  const ns = document.getElementById('noteSection');
  const cg = document.getElementById('catGrid');
  const dg = document.getElementById('detGrid');

  cg.innerHTML = '';
  dg.innerHTML = '<div class="ph">Select category...</div>';
  clrGroup(document.getElementById('ccGrid'), ['btn-ccx']);

  if (type === "Credit card bill") {
    ms.classList.add('hidden'); cs.classList.add('hidden'); ds.classList.add('hidden');
    cc.classList.remove('hidden'); ns.classList.add('hidden');
    S.mode = ''; clrGroup(document.getElementById('modeGrid'), ['btn-mode']);
    return;
  }

  if (type === "Money transfer") {
    ms.classList.add('hidden');
    S.mode = ''; clrGroup(document.getElementById('modeGrid'), ['btn-mode']);
  } else {
    ms.classList.remove('hidden');
  }

  cs.classList.remove('hidden'); ds.classList.remove('hidden');
  cc.classList.add('hidden'); ns.classList.remove('hidden');

  if (type === "Expense") {
    const upiBtn = document.querySelector('#modeGrid button[data-val="UPI"]');
    if (upiBtn) { activate(document.getElementById('modeGrid'), upiBtn, 'btn-mode'); S.mode = 'UPI'; }
  }

  const list = type === "Expense" ? EXP_CATS : TRN_CATS;

  if (type !== "Expense") {
    cg.className = 'g3';
    cg.style.gridTemplateColumns = '1fr 1fr';
  } else {
    cg.className = 'g4';
    cg.style.gridTemplateColumns = '';
  }

  list.forEach(k => {
    const b = document.createElement('button');
    b.className = 'btn btn-sm';
    b.style.whiteSpace = 'nowrap';
    b.textContent = CAT_SHORT[k] || k;
    b.dataset.val = k;
    cg.appendChild(b);
  });

  cg.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    activate(cg, b, 'btn-cat');
    S.cat = b.dataset.val; S.det = '';
    buildDet(b.dataset.val);
  };

  const firstCat = cg.querySelector('button');
  if (firstCat) { activate(cg, firstCat, 'btn-cat'); S.cat = firstCat.dataset.val; buildDet(firstCat.dataset.val); }
}

function buildDet(cat) {
  const dg = document.getElementById('detGrid');
  dg.innerHTML = '';
  const items = CATS[cat] || [];
  const cols = DET_COLS[cat] || Math.min(items.length, 5);
  dg.style.gridTemplateColumns = '';
  dg.style.display = 'flex';
  dg.style.flexWrap = 'wrap';
  dg.style.justifyContent = 'center';
  dg.style.gap = '4px';

  items.forEach(d => {
    const b = document.createElement('button');
    b.className = 'btn btn-det';
    b.style.width = 'calc(33.33% - 3px)';
    b.textContent = DET_SHORT[d] || d;
    b.dataset.val = d;
    dg.appendChild(b);
  });

  dg.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    activate(dg, b, 'btn-detx');
    S.det = b.dataset.val;
  };

  const firstDet = dg.querySelector('button');
  if (firstDet) { activate(dg, firstDet, 'btn-detx'); S.det = firstDet.dataset.val; }
}


/* ═══════════════════════════════════════
   CLEAR & KEYBOARD
   ═══════════════════════════════════════ */
document.getElementById('clearBtn').addEventListener('click', resetForm);
document.getElementById('amountInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('submitBtn').click(); } });
document.getElementById('noteInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('submitBtn').click(); } });

function resetForm() {
  document.getElementById('amountInput').value = '';
  document.getElementById('noteInput').value = '';
  document.querySelectorAll('#p-entry button').forEach(b => {
    ['btn-type','btn-mode','btn-cat','btn-detx','btn-ccx'].forEach(c => b.classList.remove(c));
  });
  document.getElementById('catGrid').innerHTML = '';
  document.getElementById('detGrid').innerHTML = '<div class="ph">Select category...</div>';
  ['modeSection','catSection','detSection','noteSection'].forEach(id => document.getElementById(id).classList.remove('hidden'));
  document.getElementById('ccSection').classList.add('hidden');
  document.getElementById('saveMsg').innerHTML = '';
  S = { type:"", mode:"", cat:"", det:"", cc:"" };
}


/* ═══════════════════════════════════════
   SUBMIT
   ═══════════════════════════════════════ */
document.getElementById('submitBtn').addEventListener('click', async () => {
  const amt = document.getElementById('amountInput').value;
  if (!S.type) { shake('typeGrid'); return; }
  if (!amt || parseFloat(amt) <= 0) { document.getElementById('amountInput').focus(); return; }
  if (S.type === "Expense" && !S.mode) { shake('modeGrid'); return; }
  if (S.type === "Credit card bill" && !S.cc) { shake('ccGrid'); return; }

  const btn = document.getElementById('submitBtn');
  const sp = document.getElementById('spinner');
  const lb = document.getElementById('btnLabel');
  btn.disabled = true; sp.classList.add('show'); lb.textContent = 'Saving...';

  const body = new URLSearchParams();
  body.append('authToken', 'Rakesh9869');
  body.append('transactionType', S.type);
  body.append('amount', amt);
  body.append('expenseMode', S.type === "Credit card bill" ? "" : S.mode);
  body.append('category', S.cat);
  body.append('categoryValue', S.det);
  body.append('additionalInfo', S.type === "Credit card bill" ? S.cc : document.getElementById('noteInput').value);

  try {
    fetch(API, { method: "POST", body }).catch(() => {});

    const entry = {
      transactionType: S.type,
      amount: amt,
      expenseMode: S.type === "Credit card bill" ? "" : S.mode,
      category: S.cat,
      categoryValue: S.type === "Credit card bill" ? S.cc : S.det,
      additionalInfo: S.type === "Credit card bill" ? S.cc : document.getElementById('noteInput').value,
      date: new Date().toISOString().split('T')[0]
    };
    localEntries.push(entry);

    resetForm();
    document.getElementById('saveMsg').innerHTML = '<div class="ok" style="margin-top:6px">Saved ✅</div>';
    setTimeout(() => { document.getElementById('saveMsg').innerHTML = ''; }, 1400);
  } catch (err) {
    alert("Connection Error.");
  } finally {
    btn.disabled = false; sp.classList.remove('show'); lb.textContent = 'Submit Entry';
  }
});


/* ═══════════════════════════════════════
   DAILY TAB
   ═══════════════════════════════════════ */
const today = new Date();
document.getElementById('dailyDate').value = today.toISOString().split('T')[0];

document.getElementById('fetchDaily').addEventListener('click', async () => {
  const dt = document.getElementById('dailyDate').value; if (!dt) return;
  const sp = document.getElementById('spinDaily');
  const cont = document.getElementById('dailyContent');
  sp.classList.add('show'); cont.innerHTML = '';

  const getLocalDaily = () => localEntries.filter(e => e.date === dt).map(mapLocal);

  try {
    const r = await fetch(API + '?action=daily&date=' + encodeURIComponent(dt) + '&authToken=Rakesh9869');
    const d = await r.json();
    const apiRows = (d.data && d.data.length) ? d.data : [];
    const localRows = getLocalDaily();
    const allRows = [...apiRows, ...localRows];
    if (!allRows.length) { cont.innerHTML = '<div class="empty-st">No entries for this date</div>'; return; }
    renderDaily(allRows);
  } catch (err) {
    const localRows = getLocalDaily();
    if (localRows.length) { renderDaily(localRows); }
    else { cont.innerHTML = '<div class="empty-st">No entries for this date</div>'; }
  } finally {
    sp.classList.remove('show');
  }
});

function mapLocal(e) {
  return {
    type: e.transactionType, mode: e.expenseMode, category: e.category,
    detail: e.categoryValue, amount: e.amount, transactionType: e.transactionType,
    expenseMode: e.expenseMode, categoryValue: e.categoryValue, date: e.date
  };
}

function renderDaily(rows) {
  const cont = document.getElementById('dailyContent');
  const sorted = [...rows].reverse();
  let html = ''; let total = 0;

  sorted.forEach(r => {
    const amt = parseFloat(r.amount) || 0;
    const type = r.transactionType || r.type || '';
    const cat = r.category || '';
    const det = r.categoryValue || r.detail || '';
    const mode = r.expenseMode || r.mode || '';

    let cls = 'exp', amtCls = 'exp';
    if (type === 'Money transfer') { cls = 'trn'; amtCls = 'trn'; }
    else if (type === 'Credit card bill') { cls = 'ccb'; amtCls = 'ccb'; }
    else if (type === 'Opening balance') { cls = 'obal'; amtCls = 'obal'; }
    if (type === 'Expense') total += amt;

    const label = type === 'Credit card bill' ? (det || 'CC Bill') : cat;
    const sub = type === 'Credit card bill' ? 'CC Bill Payment' : type === 'Opening balance' ? det : (det + (mode ? ' · ' + mode : ''));

    html += `<div class="d-entry ${cls}"><div class="d-info"><div class="d-cat">${label}</div><div class="d-sub">${sub}</div></div><div class="d-amt ${amtCls}">${type === 'Expense' ? '-' : ''}${fmt(amt)}</div></div>`;
  });

  html += `<div class="d-total"><span>Total Expenses</span><span style="color:#ef4444">-${fmt(total)}</span></div>`;
  cont.innerHTML = html;
}


/* ═══════════════════════════════════════
   SUMMARY TAB
   ═══════════════════════════════════════ */
const MO = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const mSel = document.getElementById('sumMonth');
MO.forEach((m, i) => { const o = document.createElement('option'); o.value = i + 1; o.textContent = m; mSel.appendChild(o); });
mSel.value = today.getMonth() + 1;
document.getElementById('sumYear').value = today.getFullYear();

function calcSummary(rows) {
  const bal = { Kotak:0, ICICI:0, HDFC:0, Wallet:0, Cash:0 };
  let totalExpense = 0, totalTransfer = 0, totalCC = 0, totalSalary = 0, totalInvest = 0;
  const catTotals = {}; EXP_CATS.forEach(c => { catTotals[c] = 0; });
  const modeTotals = { UPI:0, "Credit card":0, Cash:0, "E-wallet":0 };
  let ccFrom3rd = 0;

  rows.forEach(r => {
    const amt = parseFloat(r.amount) || 0;
    const type = r.transactionType || r.type || '';
    const cat = r.category || '';
    const det = r.categoryValue || r.detail || '';
    const mode = r.expenseMode || r.mode || '';
    const dt = r.date ? new Date(r.date) : null;

    if (type === "Opening balance") {
      if (det === "E-wallet balance") bal.Wallet = amt;
      else if (det === "ICICI balance") bal.ICICI = amt;
      else if (det === "HDFC balance") bal.HDFC = amt;
      else if (det === "Kotak Balance") bal.Kotak = amt;
      else if (det === "Cash") bal.Cash = amt;
    }
    else if (type === "Money transfer") {
      totalTransfer += amt;
      if (det === "Salary to Kotak") { bal.Kotak += amt; bal.HDFC -= amt; }
      else if (det === "Salary to ICICI") { bal.ICICI += amt; bal.HDFC -= amt; }
      else if (det === "ICICI to Kotak") { bal.ICICI -= amt; bal.Kotak += amt; }
      else if (det === "Kotak to ICICI") { bal.Kotak -= amt; bal.ICICI += amt; }
      else if (det === "Cash withdrawal") { bal.HDFC -= amt; bal.Cash += amt; }
      else if (det === "Salary") { bal.HDFC += amt; totalSalary += amt; }
      else if (det === "Investment") { bal.ICICI -= amt; totalInvest += amt; }
      else if (det === "Other income") { bal.Kotak += amt; }
      else if (det === "E-wallet topup") { bal.Wallet += amt; }
    }
    else if (type === "Credit card bill") {
      totalCC += amt; bal.HDFC -= amt;
    }
    else if (type === "Expense") {
      totalExpense += amt;
      if (catTotals[cat] !== undefined) catTotals[cat] += amt;
      if (modeTotals[mode] !== undefined) modeTotals[mode] += amt;
      if (mode === "UPI") bal.Kotak -= amt;
      else if (mode === "Cash") bal.Cash -= amt;
      else if (mode === "E-wallet") bal.Wallet -= amt;
      if (mode === "Credit card" && dt) { if (dt.getDate() >= 3) ccFrom3rd += amt; }
    }
  });

  rows.forEach(r => {
    const det = r.categoryValue || r.detail || '';
    const type = r.transactionType || r.type || '';
    const dt = r.date ? new Date(r.date) : null;
    const amt = parseFloat(r.amount) || 0;
    if (type === "Money transfer" && det === "E-wallet topup" && dt) { if (dt.getDate() >= 3) ccFrom3rd += amt; }
  });

  const available = totalSalary - totalExpense - totalInvest;
  return { bal, totalExpense, totalTransfer, totalCC, totalSalary, totalInvest, available, catTotals, modeTotals, ccFrom3rd };
}

let charts = [];
function killCharts() { charts.forEach(c => c.destroy()); charts = []; }

function renderSummary(d) {
  killCharts();
  const cont = document.getElementById('sumContent');
  const COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#06b6d4","#ec4899","#8b5cf6","#f97316"];
  const totalBal = d.bal.Kotak + d.bal.ICICI + d.bal.HDFC + d.bal.Wallet + d.bal.Cash;

  let html = `
  <div class="bal-grid">
    <div class="bal-box"><div class="bal-label">Kotak</div><div class="bal-val ${d.bal.Kotak < 0 ? 'neg' : ''}">${fmt(d.bal.Kotak)}</div></div>
    <div class="bal-box"><div class="bal-label">ICICI</div><div class="bal-val ${d.bal.ICICI < 0 ? 'neg' : ''}">${fmt(d.bal.ICICI)}</div></div>
    <div class="bal-box"><div class="bal-label">HDFC</div><div class="bal-val ${d.bal.HDFC < 0 ? 'neg' : ''}">${fmt(d.bal.HDFC)}</div></div>
  </div>
  <div class="bal-grid">
    <div class="bal-box"><div class="bal-label">Wallet</div><div class="bal-val ${d.bal.Wallet < 0 ? 'neg' : ''}">${fmt(d.bal.Wallet)}</div></div>
    <div class="bal-box"><div class="bal-label">Cash</div><div class="bal-val ${d.bal.Cash < 0 ? 'neg' : ''}">${fmt(d.bal.Cash)}</div></div>
    <div class="bal-box"><div class="bal-label">Total</div><div class="bal-val ${totalBal < 0 ? 'neg' : ''}">${fmt(totalBal)}</div></div>
  </div>
  <div class="red-row">
    <div class="red-box"><div class="red-label">Total Expenses</div><div class="red-val">${fmt(d.totalExpense)}</div></div>
    <div class="red-box"><div class="red-label">CC Next Bill (3rd–3rd)</div><div class="red-val">${fmt(d.ccFrom3rd)}</div></div>
  </div>
  <div class="chart-wrap"><div class="chart-title">Expenses by Category</div><canvas id="chCat"></canvas></div>
  <div class="chart-wrap"><div class="chart-title">Payment Mode Split</div><canvas id="chMode"></canvas></div>
  <div class="chart-wrap"><div class="chart-title">Salary Breakup</div><canvas id="chSalary"></canvas></div>`;

  cont.innerHTML = html;

  /* Bar: Category Expenses */
  const cLabels = Object.keys(d.catTotals).filter(k => d.catTotals[k] > 0);
  const cData = cLabels.map(k => d.catTotals[k]);
  const cShort = cLabels.map(k => CAT_SHORT[k] || k);
  if (cData.length) {
    charts.push(new Chart(document.getElementById('chCat'), {
      type: 'bar',
      data: { labels: cShort, datasets: [{ data: cData, backgroundColor: COLORS.slice(0, cLabels.length), borderRadius: 4, borderSkipped: false }] },
      options: { responsive: true, indexAxis: 'y', plugins: {
        legend: { display: false },
        datalabels: { anchor: 'end', align: 'right', color: '#334155', font: { weight: 'bold', size: 9 }, formatter: v => fmtK(v) },
        tooltip: { callbacks: { label: ctx => fmt(ctx.raw) } }
      }, scales: { x: { display: false, grid: { display: false } }, y: { grid: { display: false }, ticks: { font: { size: 9, weight: 'bold' } } } } }
    }));
  }

  /* Donut: Payment Modes */
  const mLabels = Object.keys(d.modeTotals).filter(k => d.modeTotals[k] > 0);
  const mData = mLabels.map(k => d.modeTotals[k]);
  if (mData.length) {
    charts.push(new Chart(document.getElementById('chMode'), {
      type: 'doughnut',
      data: { labels: mLabels, datasets: [{ data: mData, backgroundColor: ['#6366f1','#f59e0b','#22c55e','#06b6d4'], borderWidth: 0, hoverOffset: 6 }] },
      options: { responsive: true, plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 8, usePointStyle: true, pointStyleWidth: 8 } },
        datalabels: { color: '#fff', font: { weight: 'bold', size: 10 }, formatter: v => fmtK(v) },
        tooltip: { callbacks: { label: ctx => ctx.label + ': ' + fmt(ctx.raw) } }
      }}
    }));
  }

  /* Pie: Salary Breakup */
  if (d.totalSalary > 0) {
    const salData = [d.totalInvest, d.totalExpense, Math.max(0, d.available)];
    charts.push(new Chart(document.getElementById('chSalary'), {
      type: 'pie',
      data: { labels: ['Investment','Expenses','Available'], datasets: [{ data: salData, backgroundColor: ['#8b5cf6','#ef4444','#22c55e'], borderWidth: 0, hoverOffset: 6 }] },
      options: { responsive: true, plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 8, usePointStyle: true, pointStyleWidth: 8 } },
        datalabels: { color: '#fff', font: { weight: 'bold', size: 10 }, formatter: v => fmtK(v) },
        tooltip: { callbacks: { label: ctx => ctx.label + ': ' + fmt(ctx.raw) } }
      }}
    }));
  }
}

document.getElementById('fetchSummary').addEventListener('click', async () => {
  const m = document.getElementById('sumMonth').value;
  const y = document.getElementById('sumYear').value;
  if (!m || !y) return;
  const sp = document.getElementById('spinSum');
  const cont = document.getElementById('sumContent');
  sp.classList.add('show'); cont.innerHTML = '';

  const mo = parseInt(m), yr = parseInt(y);
  const getLocal = () => localEntries.filter(e => {
    const dd = new Date(e.date);
    return (dd.getMonth() + 1) === mo && dd.getFullYear() === yr;
  }).map(mapLocal);

  try {
    const r = await fetch(API + '?action=monthdata&month=' + m + '&year=' + y + '&authToken=Rakesh9869');
    const d = await r.json();
    const apiRows = (d.data && d.data.length) ? d.data : [];
    const localRows = getLocal();
    const allRows = [...apiRows, ...localRows];
    if (!allRows.length) { cont.innerHTML = '<div class="empty-st">No data for this period</div>'; sp.classList.remove('show'); return; }
    renderSummary(calcSummary(allRows));
  } catch (err) {
    const localRows = getLocal();
    if (localRows.length) { renderSummary(calcSummary(localRows)); }
    else { cont.innerHTML = '<div class="empty-st">No data for this period</div>'; }
  } finally {
    sp.classList.remove('show');
  }
});


/* ═══════════════════════════════════════
   PWA SERVICE WORKER
   ═══════════════════════════════════════ */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(() => console.log('✅ Service Worker registered'))
    .catch(err => console.error('SW registration failed:', err));
}
