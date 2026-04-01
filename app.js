/* ══════════════════════════════════════════════════════
   Daily Expense Tracker V2 — app.js
   Repo: pwa2-records-dll-x26_AI
   ══════════════════════════════════════════════════════ */

Chart.register(ChartDataLabels);

const API = "https://script.google.com/macros/s/AKfycbx_wHyePe_GKAA9YBmpccIyPkYrKikyfosaWmhVJxZH1_MActOeD0IETvVIhnu2g_-O/exec";

/* ══ EXACT backend values → Google Sheet columns E-N ══ */
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

/* ══ Short display labels ══ */
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
  "Salary to Kotak":"Salary\u2192Kotak","Salary to ICICI":"Salary\u2192ICICI","ICICI to Kotak":"ICICI\u2192Kotak","Kotak to ICICI":"Kotak\u2192ICICI",
  "Cash withdrawal":"Cash W/D","Salary":"Salary","Investment":"Investment","Other income":"Other Income","E-wallet topup":"Wallet Topup",
  "HDFC balance":"HDFC","ICICI balance":"ICICI","Kotak Balance":"Kotak","E-wallet balance":"Wallet","Cash":"Cash"
};

const DET_COLS = {
  "Food":3,"Shopping":3,"Transportation":3,"Bills":3,
  "Entertainment":3,"Personal care":3,"Insurance":3,"Other Expenses":3,
  "Money transfer":3,"Opening balance":3
};

const EXP_CATS = ["Food","Shopping","Transportation","Bills","Entertainment","Personal care","Insurance","Other Expenses"];
const TRN_CATS = ["Money transfer","Opening balance"];

let S = { type:"", mode:"", cat:"", det:"", cc:"" };


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
function fmt(n) { return '\u20b9' + Number(n).toLocaleString('en-IN', { minimumFractionDigits:0, maximumFractionDigits:0 }); }
function fmtK(n) { return n >= 100000 ? '\u20b9' + (n/100000).toFixed(1) + 'L' : n >= 1000 ? '\u20b9' + (n/1000).toFixed(1) + 'K' : fmt(n); }


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
  const cols = DET_COLS[cat] || 3;

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

    resetForm();
    document.getElementById('saveMsg').innerHTML = '<div class="ok" style="margin-top:6px">Saved \u2705</div>';
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

  try {
    const r = await fetch(API + '?action=daily&date=' + encodeURIComponent(dt) + '&authToken=Rakesh9869', {redirect: "follow"});
    const d = await r.json();
    const apiRows = (d.data && d.data.length) ? d.data : [];
    if (!apiRows.length) { cont.innerHTML = '<div class="empty-st">No entries for this date</div>'; return; }
    renderDaily(apiRows);
  } catch (err) {
    cont.innerHTML = '<div class="empty-st">Failed to load. Check connection.</div>';
  } finally {
    sp.classList.remove('show');
  }
});

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
    if (cat === 'Opening balance') { cls = 'obal'; amtCls = 'obal'; }
    else if (type === 'Money transfer' || cat === 'Money transfer') { cls = 'trn'; amtCls = 'trn'; }
    else if (type === 'Credit card bill') { cls = 'ccb'; amtCls = 'ccb'; }
    if (type === 'Expense') total += amt;

    const label = type === 'Credit card bill' ? (det || 'CC Bill') : cat;
    const sub = type === 'Credit card bill' ? 'CC Bill Payment' : cat === 'Opening balance' ? det : (det + (mode ? ' \u00b7 ' + mode : ''));

    html += '<div class="d-entry ' + cls + '"><div class="d-info"><div class="d-cat">' + label + '</div><div class="d-sub">' + sub + '</div></div><div class="d-amt ' + amtCls + '">' + (type === 'Expense' ? '-' : '') + fmt(amt) + '</div></div>';
  });

  html += '<div class="d-total"><span>Total Expenses</span><span style="color:#ef4444">-' + fmt(total) + '</span></div>';
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

    if (cat === "Opening balance") {
      if (det === "E-wallet balance") bal.Wallet += amt;
      else if (det === "ICICI balance") bal.ICICI += amt;
      else if (det === "HDFC balance") bal.HDFC += amt;
      else if (det === "Kotak Balance") bal.Kotak += amt;
      else if (det === "Cash") bal.Cash += amt;
    }
    else if (cat === "Money transfer") {
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
    const cat = r.category || '';
    const det = r.categoryValue || r.detail || '';
    const type = r.transactionType || r.type || '';
    const dt = r.date ? new Date(r.date) : null;
    const amt = parseFloat(r.amount) || 0;
    if (cat === "Money transfer" && det === "E-wallet topup" && dt) { if (dt.getDate() >= 3) ccFrom3rd += amt; }
  });

  const available = totalSalary - totalExpense - totalInvest - totalCC;
  return { bal, totalExpense, totalTransfer, totalCC, totalSalary, totalInvest, available, catTotals, modeTotals, ccFrom3rd };
}

let charts = [];
function killCharts() { charts.forEach(c => c.destroy()); charts = []; }

function filtZero(data, labels, colors) {
  var fd = [], fl = [], fc = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i] > 0) { fd.push(data[i]); fl.push(labels[i]); fc.push(colors[i]); }
  }
  return { d: fd, l: fl, c: fc };
}

function connectorPlugin(total) {
  return {
    id: 'conn' + Math.random(),
    afterDraw: function(ch) {
      var meta = ch.getDatasetMeta(0);
      var cx = ch.ctx;
      var ds = ch.data.datasets[0];
      if (total === 0) return;
      meta.data.forEach(function(arc, i) {
        var v = ds.data[i];
        if (v === 0) return;
        var pct = v / total * 100;
        if (pct >= 5) return;
        var col = ds.backgroundColor[i];
        var p = arc.getProps(['x','y','startAngle','endAngle','outerRadius','innerRadius']);
        var mid = (p.startAngle + p.endAngle) / 2;
        var oR = p.outerRadius;
        var iR = p.innerRadius || 0;
        cx.save();
        cx.beginPath();
        cx.arc(p.x, p.y, oR, p.startAngle, p.endAngle);
        if (iR > 0) { cx.arc(p.x, p.y, iR, p.endAngle, p.startAngle, true); }
        else { cx.lineTo(p.x, p.y); }
        cx.closePath();
        cx.strokeStyle = col;
        cx.lineWidth = 2;
        cx.stroke();
        cx.restore();
        var x1 = p.x + Math.cos(mid) * oR;
        var y1 = p.y + Math.sin(mid) * oR;
        var x2 = p.x + Math.cos(mid) * (oR + 20);
        var y2 = p.y + Math.sin(mid) * (oR + 20);
        cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2, y2);
        cx.strokeStyle = col; cx.lineWidth = 2; cx.stroke();
        cx.fillStyle = '#334155';
        cx.font = 'bold 11px -apple-system,BlinkMacSystemFont,sans-serif';
        cx.textAlign = Math.cos(mid) >= 0 ? 'left' : 'right';
        cx.textBaseline = 'middle';
        var x3 = p.x + Math.cos(mid) * (oR + 24);
        var y3 = p.y + Math.sin(mid) * (oR + 24);
        cx.fillText(fmtK(v), x3, y3);
      });
    }
  };
}

function renderSummary(d) {
  killCharts();
  const cont = document.getElementById('sumContent');
  const COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#06b6d4","#ec4899","#8b5cf6","#f97316"];
  const totalBal = d.bal.Kotak + d.bal.ICICI + d.bal.HDFC + d.bal.Wallet + d.bal.Cash;

  let html = '<div class="bal-grid">' +
    '<div class="bal-box"><div class="bal-label">Kotak</div><div class="bal-val ' + (d.bal.Kotak < 0 ? 'neg' : '') + '">' + fmt(d.bal.Kotak) + '</div></div>' +
    '<div class="bal-box"><div class="bal-label">ICICI</div><div class="bal-val ' + (d.bal.ICICI < 0 ? 'neg' : '') + '">' + fmt(d.bal.ICICI) + '</div></div>' +
    '<div class="bal-box"><div class="bal-label">HDFC</div><div class="bal-val ' + (d.bal.HDFC < 0 ? 'neg' : '') + '">' + fmt(d.bal.HDFC) + '</div></div>' +
    '</div><div class="bal-grid">' +
    '<div class="bal-box"><div class="bal-label">Wallet</div><div class="bal-val ' + (d.bal.Wallet < 0 ? 'neg' : '') + '">' + fmt(d.bal.Wallet) + '</div></div>' +
    '<div class="bal-box"><div class="bal-label">Cash</div><div class="bal-val ' + (d.bal.Cash < 0 ? 'neg' : '') + '">' + fmt(d.bal.Cash) + '</div></div>' +
    '<div class="bal-box"><div class="bal-label">Total</div><div class="bal-val ' + (totalBal < 0 ? 'neg' : '') + '">' + fmt(totalBal) + '</div></div>' +
    '</div><div class="red-row">' +
    '<div class="red-box"><div class="red-label">Total Expenses</div><div class="red-val">' + fmt(d.totalExpense) + '</div></div>' +
    '<div class="red-box"><div class="red-label">CC Next Bill</div><div class="red-val">' + fmt(d.ccFrom3rd) + '</div></div>' +
    '</div>' +
    '<div class="chart-wrap"><div class="chart-title">Monthly Trend (6 Months)</div><canvas id="chTrend"></canvas></div>' +
    '<div class="chart-wrap"><div class="chart-title">Expenses by Category</div><canvas id="chCat"></canvas></div>' +
    '<div class="chart-wrap"><div class="chart-title">Payment Mode Split</div><canvas id="chMode"></canvas></div>' +
    '<div class="chart-wrap"><div class="chart-title">Salary Breakup</div><canvas id="chSalary"></canvas></div>';

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
        datalabels: {
          font: { weight: 'bold', size: 9 },
          formatter: v => fmtK(v),
          anchor: function(ctx) { return 'end'; },
          align: function(ctx) { var max = Math.max.apply(null, ctx.dataset.data); return ctx.dataset.data[ctx.dataIndex] >= max * 0.6 ? 'start' : 'right'; },
          color: function(ctx) { var max = Math.max.apply(null, ctx.dataset.data); return ctx.dataset.data[ctx.dataIndex] >= max * 0.6 ? '#ffffff' : '#334155'; }
        },
        tooltip: { callbacks: { label: ctx => fmt(ctx.raw) } }
      }, scales: { x: { display: false, grid: { display: false } }, y: { grid: { display: false }, ticks: { font: { size: 9, weight: 'bold' } } } } }
    }));
  }

  /* Donut: Payment Modes — legend on right, smart small labels */
  const mLabels = Object.keys(d.modeTotals);
  const mAllData = mLabels.map(k => d.modeTotals[k]);
  const mAllColors = ['#6366f1','#f59e0b','#22c55e','#06b6d4'];
  const mFilt = filtZero(mAllData, mLabels, mAllColors);
  if (mFilt.d.length) {
    const mTotal = mFilt.d.reduce((a,b) => a+b, 0);
    var legHtml = '';
    for (var mi = 0; mi < mLabels.length; mi++) {
      if (mAllData[mi] > 0) legHtml += '<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:#64748b"><div style="width:9px;height:9px;border-radius:2px;background:' + mAllColors[mi] + ';flex-shrink:0"></div><div>' + mLabels[mi] + '<br><span style="font-weight:700;color:#334155;font-size:11px">' + fmtK(mAllData[mi]) + '</span></div></div>';
    }
    document.getElementById('chMode').parentElement.style.display = 'flex';
    document.getElementById('chMode').parentElement.style.alignItems = 'center';
    document.getElementById('chMode').parentElement.style.gap = '10px';
    document.getElementById('chMode').style.flex = '1';
    var legDiv = document.createElement('div');
    legDiv.style.cssText = 'display:flex;flex-direction:column;gap:7px;min-width:80px';
    legDiv.innerHTML = legHtml;
    document.getElementById('chMode').parentElement.appendChild(legDiv);
    charts.push(new Chart(document.getElementById('chMode'), {
      type: 'doughnut',
      data: { labels: mFilt.l, datasets: [{ data: mFilt.d, backgroundColor: mFilt.c, borderWidth: 0, hoverOffset: 6 }] },
      options: { responsive: true, layout: { padding: { top: 28, bottom: 10, left: 28, right: 4 } }, plugins: {
        legend: { display: false },
        datalabels: {
          display: function(ctx) { var v = ctx.dataset.data[ctx.dataIndex]; if (v === 0) return false; return (v / mTotal * 100) >= 5; },
          color: '#fff', font: { weight: 'bold', size: 10 }, formatter: v => v > 0 ? fmtK(v) : ''
        },
        tooltip: { callbacks: { label: ctx => ctx.label + ': ' + fmt(ctx.raw) } }
      }},
      plugins: [connectorPlugin(mTotal)]
    }));
  }

  /* Pie: Salary Breakup — legend on right, smart small labels */
  if (d.totalSalary > 0) {
    const salAllData = [d.totalInvest, d.totalExpense, d.totalCC, Math.max(0, d.available)];
    const salAllLabels = ['Investment','Expenses','CC Bill Paid','Available'];
    const salAllColors = ['#8b5cf6','#ef4444','#f59e0b','#22c55e'];
    const salFilt = filtZero(salAllData, salAllLabels, salAllColors);
    const salTotal = salFilt.d.reduce((a,b) => a+b, 0);
    var slegHtml = '';
    for (var si = 0; si < salAllLabels.length; si++) {
      if (salAllData[si] > 0) slegHtml += '<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:#64748b"><div style="width:9px;height:9px;border-radius:2px;background:' + salAllColors[si] + ';flex-shrink:0"></div><div>' + salAllLabels[si] + '<br><span style="font-weight:700;color:#334155;font-size:11px">' + fmtK(salAllData[si]) + '</span></div></div>';
    }
    document.getElementById('chSalary').parentElement.style.display = 'flex';
    document.getElementById('chSalary').parentElement.style.alignItems = 'center';
    document.getElementById('chSalary').parentElement.style.gap = '10px';
    document.getElementById('chSalary').style.flex = '1';
    var slegDiv = document.createElement('div');
    slegDiv.style.cssText = 'display:flex;flex-direction:column;gap:7px;min-width:80px';
    slegDiv.innerHTML = slegHtml;
    document.getElementById('chSalary').parentElement.appendChild(slegDiv);
    charts.push(new Chart(document.getElementById('chSalary'), {
      type: 'pie',
      data: { labels: salFilt.l, datasets: [{ data: salFilt.d, backgroundColor: salFilt.c, borderWidth: 0, hoverOffset: 6 }] },
      options: { responsive: true, layout: { padding: { top: 28, bottom: 10, left: 28, right: 4 } }, plugins: {
        legend: { display: false },
        datalabels: {
          display: function(ctx) { var v = ctx.dataset.data[ctx.dataIndex]; if (v === 0) return false; return (v / salTotal * 100) >= 5; },
          color: '#fff', font: { weight: 'bold', size: 10 }, formatter: v => v > 0 ? fmtK(v) : ''
        },
        tooltip: { callbacks: { label: ctx => ctx.label + ': ' + fmt(ctx.raw) } }
      }},
      plugins: [connectorPlugin(salTotal)]
    }));
  }
}


/* ═══════════════════════════════════════
   TREND CHART
   ═══════════════════════════════════════ */
const MONTH_SHORT = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function linReg(data) {
  var n = data.length, sx = 0, sy = 0, sxy = 0, sx2 = 0;
  for (var i = 0; i < n; i++) { sx += i; sy += data[i]; sxy += i * data[i]; sx2 += i * i; }
  var slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
  var intercept = (sy - slope * sx) / n;
  var out = [];
  for (var i = 0; i < n; i++) { out.push(Math.round(slope * i + intercept)); }
  return out;
}

function renderTrend(data) {
  const canvas = document.getElementById('chTrend');
  if (!canvas) return;
  const labels = data.map(d => MONTH_SHORT[d.month] + ' ' + String(d.year).slice(-2));
  const expData = data.map(d => parseFloat(d.totalExpense) || 0);
  const ccData = data.map(d => parseFloat(d.totalCC) || 0);
  const trendLine = linReg(expData);

  charts.push(new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Expenses',
          data: expData,
          backgroundColor: 'rgba(239,68,68,.7)',
          borderRadius: 4,
          borderSkipped: false,
          order: 2
        },
        {
          label: 'CC Bill Paid',
          data: ccData,
          backgroundColor: 'rgba(59,130,246,.6)',
          borderRadius: 4,
          borderSkipped: false,
          order: 3
        },
        {
          label: 'Expense Trend',
          data: trendLine,
          type: 'line',
          borderColor: '#ef4444',
          borderWidth: 2,
          borderDash: [6, 3],
          pointRadius: 0,
          fill: false,
          tension: 0,
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 9 }, padding: 8, usePointStyle: true, pointStyleWidth: 8 }
        },
        datalabels: { display: false },
        tooltip: {
          callbacks: { label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw) }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 9, weight: 'bold' } }
        },
        y: {
          grid: { color: 'rgba(148,163,184,.15)' },
          ticks: { font: { size: 8 }, callback: v => fmtK(v) },
          border: { display: false }
        }
      }
    }
  }));
}

document.getElementById('fetchSummary').addEventListener('click', async () => {
  const m = document.getElementById('sumMonth').value;
  const y = document.getElementById('sumYear').value;
  if (!m || !y) return;
  const sp = document.getElementById('spinSum');
  const cont = document.getElementById('sumContent');
  sp.classList.add('show'); cont.innerHTML = '';

  try {
    const r = await fetch(API + '?action=summary&month=' + m + '&year=' + y + '&count=6&authToken=Rakesh9869', {redirect: "follow"});
    const d = await r.json();
    const apiRows = (d.data && d.data.length) ? d.data : [];
    if (!apiRows.length) { cont.innerHTML = '<div class="empty-st">No data for this period</div>'; sp.classList.remove('show'); return; }
    renderSummary(calcSummary(apiRows));
    if (d.trend && d.trend.length) { renderTrend(d.trend); }
  } catch (err) {
    console.error('Summary error:', err);
    cont.innerHTML = '<div class="empty-st">Failed to load. Check connection.</div>';
  } finally {
    sp.classList.remove('show');
  }
});


/* ═══════════════════════════════════════
   PWA SERVICE WORKER
   ═══════════════════════════════════════ */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(() => console.log('SW registered'))
    .catch(err => console.error('SW failed:', err));
}
