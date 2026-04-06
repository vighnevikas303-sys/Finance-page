// ─── Helpers ────────────────────────────────────────────────
function fmt(n) {
  return Math.abs(n).toLocaleString("en-US",{minimumFractionDigits: 0})+" RS";
}
function fmtDate(iso) {
  const d=new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US",{ month: "short",day: "2-digit"});
}
function el(id) { 
  return document.getElementById(id);
}

// ─── Computed Data (always derived fresh from transactions[]) ──
function computeStats() {
  const income=transactions.filter(t =>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const expenses=transactions.filter(t =>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const net=income-expenses;
  const balance=24830+(net-3190);
  return { income,expenses,net,balance};
}

function computeMonthlyData() {
  const map={};
  transactions.forEach(t=>{
    const key=t.date.slice(0,7);
    if (!map[key])map[key]={income:0,expenses:0};
    if (t.type==="income")map[key].income+=t.amount;
    if (t.type==="expense")map[key].expenses+=t.amount;
  });

  const histKeys=new Set(historicalMonths.map(h => h.key));
  const liveKeys=Object.keys(map).filter(k => !histKeys.has(k)).sort();
  const MONTH_LABELS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const live=liveKeys.map(k=>({
    key:k,
    month:MONTH_LABELS[parseInt(k.slice(5,7),10)-1],
    income:map[k].income,
    expenses:map[k].expenses,
  }));

  const combined = historicalMonths.map(h => {
    if (map[h.key]) {
      return {...h,income:h.income+map[h.key].income,expenses:h.expenses+map[h.key].expenses};
    }
    return h;
  });

  const all=[...combined, ...live].sort((a,b)=>a.key<b.key?-1:1);
  return all.slice(-6);
}

function computeSpendingBreakdown() {
  const catTotals = {};
  transactions.filter(t =>t.type==="expense").forEach(t=>{
    catTotals[t.category]=(catTotals[t.category] || 0)+t.amount;
  });
  const total=Object.values(catTotals).reduce((s,v)=>s+v, 0)|| 1;
  const sorted=Object.entries(catTotals).sort((a,b)=>b[1]-a[1]);
  const colorList=["#FF5722","#FFC107","#00BCD4","#7C4DFF","#4CAF50","#2196F3","#E91E63","#FF9800","#78909C","#9C27B0"];
  const top=sorted.slice(0,4);
  const otherAmt=sorted.slice(4).reduce((s,[,v])=>s+v,0);
  const result=top.map(([label,amount],i)=>({
    label, amount,
    pct: Math.round((amount / total) * 100),
    color:(categoryColors[label] && categoryColors[label].dot)||colorList[i],
  }));
  if(otherAmt>0)result.push({ label:"Other",amount: otherAmt, pct:Math.round((otherAmt/total)*100), color:"#78909C"});
  return result;
}

function computeCategoryBreakdown() {
  const catTotals={};
  transactions.filter(t=>t.type==="expense").forEach(t=>{
    catTotals[t.category]=(catTotals[t.category]||0)+t.amount;
  });
  return Object.entries(catTotals).sort((a,b)=>b[1]-a[1]);
}

// ─── Master refresh ───────────────────────────────────────────
function refreshAll() {
  if (AppState.activePage==="overview")renderOverview();
  if (AppState.activePage==="transactions")renderTransactions();
  if (AppState.activePage==="insights")renderInsights();
}

// ─── Page Router ─────────────────────────────────────────────
function navigateTo(page) {
  AppState.activePage = page;
  document.querySelectorAll(".nav-item").forEach(n=>{
    n.classList.toggle("active",n.dataset.page===page);
  });
  document.querySelectorAll(".page").forEach(p => {
    p.style.display=p.id==="page-"+page ? "block":"none";
  });
  if (page==="overview")renderOverview();
  if (page==="transactions")renderTransactions();
  if (page==="insights")renderInsights();
}

// ─── Role ─────────────────────────────────────────────────────
function applyRole() {
  const isAdmin = AppState.role==="admin";
  document.querySelectorAll(".admin-only").forEach(e=>{ e.style.display=isAdmin ? "":"none";});
  document.querySelectorAll(".viewer-badge").forEach(e=>{ e.style.display=isAdmin ? "none":"flex";});
  el("role-indicator").textContent=isAdmin ? "Admin":"Viewer";
  el("role-dot").className="role-dot "+AppState.role;
  el("role-select").value=AppState.role;
  el("sidebar-role-text").textContent=isAdmin ? "Administrator" : "Viewer";
}

// ─── Badge helper ─────────────────────────────────────────────
function makeBadge(val,positiveIsGood) {
  const num=parseFloat(val);
  const up=num>=0;
  const good=positiveIsGood ? up:!up;
  return `<span class="${good ? "badge-up" : "badge-down"}">${up ? "↑" : "↓"} ${Math.abs(num).toFixed(1)}%</span>`;
}

// ─── Transaction row HTML ─────────────────────────────────────
function txRow(t) {
  const col = categoryColors[t.category] || { bg: "#f5f5f5", text: "#555", dot: "#999" };
  const isAdmin = AppState.role === "admin";
  return `
    <tr class="tx-row" data-id="${t.id}">
      <td class="tx-date">${fmtDate(t.date)}</td>
      <td class="tx-desc">${t.desc}</td>
      <td><span class="cat-pill" style="background:${col.bg};color:${col.text}">${t.category}</span></td>
      <td><span class="type-pill ${t.type}">${t.type==="income" ? "Income":"Expense"}</span></td>
      <td class="tx-amount ${t.type}">${t.type==="income" ? "+" : "-"}${fmt(t.amount)}</td>
      ${isAdmin
        ? `<td class="tx-actions">
             <button class="action-btn edit-btn" onclick="openEditModal(${t.id})">Edit</button>
             <button class="action-btn del-btn"  onclick="deleteTransaction(${t.id})">Delete</button>
           </td>`
        : `<td></td>`}
    </tr>`;
}


// ─── Overview Page ────────────────────────────────────────────
function renderOverview() {
  const stats=computeStats();
  const monthlyData=computeMonthlyData();
  const breakdown =computeSpendingBreakdown();
 
  const prevInc=7500,prevExp=4820,prevNet=2700,prevBal=23500;
  el("stat-balance").textContent=fmt(stats.balance);
  el("stat-income").textContent =fmt(stats.income);
  el("stat-expense").textContent=fmt(stats.expenses);
  el("stat-savings").textContent=fmt(stats.net);
 
  el("badge-balance").innerHTML=makeBadge(((stats.balance- prevBal)/prevBal*100).toFixed(1),true);
  el("badge-income").innerHTML=makeBadge(((stats.income-prevInc)/prevInc*100).toFixed(1),true);
  el("badge-expense").innerHTML=makeBadge(((stats.expenses-prevExp)/prevExp*100).toFixed(1),false);
  el("badge-savings").innerHTML=makeBadge(((stats.net -prevNet)/Math.abs(prevNet) * 100).toFixed(1), true);
 
  // Sparklines from live monthly data
  Charts.drawMiniLine("spark-balance", monthlyData.map(m => m.income - m.expenses + 22000), "#3B82F6");
  Charts.drawMiniLine("spark-income",  monthlyData.map(m => m.income),   "#22C55E");
  Charts.drawMiniLine("spark-expense", monthlyData.map(m => m.expenses), "#EF4444");
  Charts.drawMiniLine("spark-savings", monthlyData.map(m => m.income - m.expenses), "#8B5CF6");
 
  // Live donut legend
  const donutLegend=document.querySelector(".donut-legend");
  if (donutLegend) {
    donutLegend.innerHTML = breakdown.map(s =>
      `<div class="donut-row">
        <div class="donut-swatch" style="background:${s.color}"></div>
        <span class="donut-cat">${s.label}</span>
        <span class="donut-pct">${s.pct}%</span>
        <span class="donut-amt">${fmt(s.amount)}</span>
      </div>`
    ).join("");
  }
 
  requestAnimationFrame(() => {
    Charts.drawBarChart("bar-chart",monthlyData);
    Charts.drawDonutChart("donut-chart",breakdown);
  });
 
  // Recent 5 transactions
  const tbody = el("overview-tx-list");
  const recent = [...transactions].sort((a,b) => a.date < b.date ? 1 : -1).slice(0, 5);
  tbody.innerHTML = recent.length
    ? recent.map(t => txRow(t)).join("")
    : `<tr><td colspan="6" class="empty-state"><div class="empty-icon">📭</div><div>No transactions yet</div></td></tr>`;
}
// ─── Transactions Page ────────────────────────────────────────
function renderTransactions() {
  let list = [...transactions];
  if (AppState.filter==="income")list=list.filter(t =>t.type==="income");
  if (AppState.filter==="expense")list=list.filter(t =>t.type==="expense");
  if (AppState.search) {
    const q=AppState.search.toLowerCase();
    list=list.filter(t => t.desc.toLowerCase().includes(q)||t.category.toLowerCase().includes(q));
  }
  list.sort((a,b)=>{
    let av = a[AppState.sortBy],bv=b[AppState.sortBy];
    if (AppState.sortBy==="amount"){ av=+av;bv=+bv; }
    if (av<bv) return AppState.sortDir==="asc" ? -1:1;
    if (av>bv) return AppState.sortDir==="asc" ? 1:-1;
    return 0;
  });

  el("tx-count").textContent = list.length + " transaction" + (list.length !== 1 ? "s" : "");
  const tbody = el("tx-table-body");
  tbody.innerHTML = list.length
    ? list.map(t => txRow(t)).join("")
    : `<tr><td colspan="6" class="empty-state"><div class="empty-icon"></div><div>No transactions found</div></td></tr>`;

  document.querySelectorAll(".sort-btn").forEach(btn=>{
    const col=btn.dataset.col;
    btn.classList.toggle("active-sort",col===AppState.sortBy);
    btn.textContent=col===AppState.sortBy ? (AppState.sortDir === "asc" ? "↑" : "↓") : "↕";
  });
}

// ─── Insights Page ────────────────────────────────────────────
function renderInsights() {
  const stats=computeStats();
  const monthlyData=computeMonthlyData();
  const catSorted=computeCategoryBreakdown();

  const savingsRate=stats.income > 0 ? ((stats.net/stats.income)*100).toFixed(1):"0.0";
  const prevExp=4820;
  const expChange=(((stats.expenses-prevExp)/prevExp)*100).toFixed(1);
  const topCat=catSorted[0] || ["—",0];

  el("insight-top-cat").textContent=topCat[0];
  el("insight-top-amt").textContent=fmt(topCat[1]);
  el("insight-savings-rate").textContent=savingsRate + "%";
  el("insight-exp-change").textContent=(expChange > 0 ? "+":"")+expChange+"%";
  el("insight-income").textContent= fmt(stats.income);
  el("insight-expenses").textContent=fmt(stats.expenses);

  const totalExp=catSorted.reduce((s,[,v])=>s+v,0)||1;
  const list=el("cat-breakdown-list");
  list.innerHTML=catSorted.length
    ? catSorted.slice(0,6).map(([cat,amt])=>{
        const col=categoryColors[cat]||{ dot:"#78909C" };
        const pct=((amt/totalExp)*100).toFixed(1);
        return `
          <div class="breakdown-row">
            <div class="breakdown-left">
              <span class="breakdown-dot" style="background:${col.dot}"></span>
              <span class="breakdown-cat">${cat}</span>
            </div>
            <div class="breakdown-bar-wrap">
              <div class="breakdown-bar" style="width:${pct}%;background:${col.dot}25;border-left:3px solid ${col.dot}"></div>
            </div>
            <span class="breakdown-pct">${pct}%</span>
            <span class="breakdown-amt">${fmt(amt)}</span>
          </div>`;
      }).join("")
    : `<div class="empty-state"><div class="empty-icon">📊</div><div>No expense data yet</div></div>`;

  const compList=el("monthly-compare");
  compList.innerHTML=monthlyData.map(m=>{
    const net=m.income-m.expenses;
    return `
      <div class="compare-row">
        <span class="compare-month">${m.month}</span>
        <span class="compare-income">+${fmt(m.income)}</span>
        <span class="compare-expense">-${fmt(m.expenses)}</span>
        <span class="compare-net ${net >= 0 ? "pos":"neg"}">${net >= 0 ? "+":""}${fmt(net)}</span>
      </div>`;
  }).join("");

  requestAnimationFrame(() => {
    Charts.drawBarChart("insights-bar-chart",monthlyData);
  });
}

// ─── Modal ─────────────────────────────────────────────────────
function openAddModal() {
  el("modal-title").textContent="Add transaction";
  el("modal-form").reset();
  el("modal-id").value="";
  el("modal-date").value=new Date().toISOString().slice(0,10);
  el("modal").classList.add("open");
}

function openEditModal(id) {
  const t=transactions.find(x=>x.id===id);
  if (!t) return;
  el("modal-title").textContent="Edit transaction";
  el("modal-id").value=id;
  el("modal-date").value=t.date;
  el("modal-desc").value=t.desc;
  el("modal-category").value=t.category;
  el("modal-type").value=t.type;
  el("modal-amount").value=t.amount;
  el("modal").classList.add("open");
}

function closeModal() {
  el("modal").classList.remove("open");
}

function saveTransaction(e) {
  e.preventDefault();
  const id=el("modal-id").value;
  const data={
    date:el("modal-date").value,
    desc:el("modal-desc").value,
    category:el("modal-category").value,
    type:el("modal-type").value,
    amount:parseFloat(el("modal-amount").value),
  };
  if (id) {
    const idx=transactions.findIndex(t=>t.id===+id);
    if (idx>-1)Object.assign(transactions[idx],data);
    showToast("Transaction updated");
  } else {
    data.id=Date.now();
    transactions.unshift(data);
    showToast("Transaction added");
  }
  closeModal();
  refreshAll();
}

function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;
  const idx=transactions.findIndex(t=>t.id===id);
  if (idx>-1)transactions.splice(idx,1);
  refreshAll();
  showToast("Transaction deleted");
}

// ─── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const toast=el("toast");
  toast.textContent=msg;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),2500);
}

// ─── Init ───────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll(".nav-item").forEach(n=>{
    n.addEventListener("click",()=>navigateTo(n.dataset.page));
  });

  el("role-select").addEventListener("change",e=>{
    AppState.role=e.target.value;
    applyRole();
    refreshAll();
  });

  document.querySelectorAll(".period-btn").forEach(btn =>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll(".period-btn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      AppState.selectedPeriod=btn.dataset.period;
    });
  });

  document.querySelectorAll(".filter-pill").forEach(pill=>{
    pill.addEventListener("click",()=>{
      document.querySelectorAll(".filter-pill").forEach(p=>p.classList.remove("active"));
      pill.classList.add("active");
      AppState.filter=pill.dataset.filter;
      renderTransactions();
    });
  });

  el("tx-search").addEventListener("input",e=>{
    AppState.search=e.target.value;
    renderTransactions();
  });

  document.querySelectorAll(".sort-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const col = btn.dataset.col;
      if (AppState.sortBy===col) {
        AppState.sortDir=AppState.sortDir==="asc" ? "desc" : "asc";
      } else {
        AppState.sortBy=col;
        AppState.sortDir="desc";
      }
      renderTransactions();
    });
  });

  el("add-tx-btn").addEventListener("click",openAddModal);
  el("modal-close").addEventListener("click",closeModal);
  el("modal-cancel").addEventListener("click",closeModal);
  el("modal").addEventListener("click",e=>{if(e.target===el("modal")) closeModal();});
  el("modal-form").addEventListener("submit",saveTransaction);

  window.addEventListener("resize",()=>refreshAll());

  applyRole();
  navigateTo("overview");
});
