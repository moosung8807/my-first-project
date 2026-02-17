  const tbody = document.querySelector("#tbl tbody");
  const tableCard = document.querySelector("#tableCard");
  const calcBtn = document.querySelector("#calcBtn");
  const sumTargetEl = document.querySelector("#sumTarget");
  const themeToggle = document.querySelector("#themeToggle");

  // Summary UI
  const modeLabel = document.querySelector("#modeLabel");
  const sumTotalKey = document.querySelector("#sumTotalKey");
  const sumTotalLabel = document.querySelector("#sumTotalLabel");
  const cashLabel = document.querySelector("#cashLabel");
  const cashPill = document.querySelector("#cashPill");

  const buyCountEl = document.querySelector("#buyCount");
  const sellCountEl = document.querySelector("#sellCount");
  const holdCountEl = document.querySelector("#holdCount");

  // Progress UI
  const progressWrap = document.querySelector("#progressWrap");
  const progressBar = document.querySelector("#progressBar");
  const progressText = document.querySelector("#progressText");

  // Toast
  const toast = document.querySelector("#toast");
  const toastMsg = document.querySelector("#toastMsg");
  let toastTimer = null;

  let mode = "current"; // "current" | "result"
  const THEME_KEY = "rb-theme";

  function parseNum(v){
    const n = Number(String(v).replaceAll(",", "").trim());
    return isFinite(n) ? n : 0;
  }
  function toDigits(str){
    return String(str || "").replace(/[^\d]/g, "");
  }
  function withComma(numStr){
    if(!numStr) return "";
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function formatInputWithComma(el){
    const before = el.value;
    const start = el.selectionStart ?? before.length;
    const digitsBeforeCursor = toDigits(before.slice(0, start)).length;

    const digits = toDigits(before);
    const formatted = withComma(digits);
    el.value = formatted;

    if(document.activeElement !== el) return;
    let pos = 0;
    let digitCount = 0;
    while(pos < formatted.length){
      if(/\d/.test(formatted[pos])) digitCount++;
      pos++;
      if(digitCount >= digitsBeforeCursor) break;
    }
    el.setSelectionRange(pos, pos);
  }
  function clampMin0(n){ return n < 0 ? 0 : n; }

  function fmt(n){ return isFinite(n) ? n.toLocaleString("ko-KR") : "0"; }
  function fmtKRW(n){ return "₩ " + fmt(Math.round(n)); }
  function fmtPct01(x){ return isFinite(x) ? (x * 100).toFixed(2) + "%" : "0.00%"; }

  function showToast(message){
    toastMsg.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>toast.classList.remove("show"), 1700);
  }

  function setTheme(theme){
    const nextTheme = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);

    if(themeToggle){
      const nextLabel = nextTheme === "dark" ? "화이트 테마" : "블랙 테마";
      themeToggle.textContent = nextLabel;
      themeToggle.setAttribute("aria-label", `${nextLabel}로 전환`);
      themeToggle.setAttribute("title", `${nextLabel}로 전환`);
    }
  }

  function resetSummaryCounts(){
    buyCountEl.textContent = "0";
    sellCountEl.textContent = "0";
    holdCountEl.textContent = "0";
  }

  function setMode(nextMode){
    mode = nextMode;

    const currentEls = document.querySelectorAll(".g-current");
    const resultEls  = document.querySelectorAll(".g-result");

    if(mode === "current"){
      currentEls.forEach(el=>el.classList.remove("hide"));
      resultEls.forEach(el=>el.classList.add("hide"));
      calcBtn.textContent = "계산";
      tableCard.classList.add("mode-current");
      tableCard.classList.remove("mode-result");
      modeLabel.textContent = "입력";

      // 입력 모드: 결과/현금은 의미가 약하니 0으로 정리
      cashPill.classList.remove("negative");
      cashLabel.textContent = fmtKRW(0);
      sumTotalKey.textContent = "현재 보유액";
      resetSummaryCounts();
    }else{
      currentEls.forEach(el=>el.classList.add("hide"));
      resultEls.forEach(el=>el.classList.remove("hide"));
      calcBtn.textContent = "현재 보기";
      tableCard.classList.add("mode-result");
      tableCard.classList.remove("mode-current");
      modeLabel.textContent = "결과";
    }
  }

  function sumTargets(exceptInput=null){
    let sum = 0;
    const inputs = tbody.querySelectorAll(".target");
    inputs.forEach(inp=>{
      if(inp === exceptInput) return;
      sum += clampMin0(parseNum(inp.value));
    });
    return sum;
  }

  function updateProgress(sumPct){
    const clamped = Math.max(0, sumPct);
    const widthPct = Math.min(100, clamped);
    progressBar.style.width = widthPct + "%";
    progressText.textContent = clamped.toFixed(2) + "%";
    progressWrap.classList.toggle("over", clamped > 100.0001);
  }

  function updateTargetSumUI(){
    const sum = sumTargets(null);
    sumTargetEl.textContent = sum.toFixed(2) + "%";
    sumTargetEl.style.color = (sum > 100.0001) ? "var(--sell)" : "var(--sum-ok)";
    updateProgress(sum);
  }

  function attachTargetGuard(targetInput){
    targetInput.addEventListener("input", ()=>{
      let v = clampMin0(parseNum(targetInput.value));

      const others = sumTargets(targetInput);
      const allowedMax = Math.max(0, 100 - others);

      if(v > allowedMax + 1e-9){
        v = allowedMax;
        targetInput.value = (Math.round(v * 100) / 100).toString();
        showToast(`기준% 합계는 100%를 넘을 수 없어요. (이 행 최대 ${allowedMax.toFixed(2)}%)`);
      }else{
        if(parseNum(targetInput.value) < 0) targetInput.value = "0";
      }
      updateTargetSumUI();
    });

    targetInput.addEventListener("blur", ()=>{
      if(String(targetInput.value).trim() === ""){
        updateTargetSumUI();
        return;
      }
      let v = clampMin0(parseNum(targetInput.value));
      const others = sumTargets(targetInput);
      const allowedMax = Math.max(0, 100 - others);
      if(v > allowedMax) v = allowedMax;
      targetInput.value = (Math.round(v * 100) / 100).toString();
      updateTargetSumUI();
    });
  }

  function rowCount(){
    return tbody.querySelectorAll("tr").length;
  }

  function deleteRow(tr){
    if(rowCount() <= 1){
      showToast("최소 1개 행은 남겨야 해요.");
      return;
    }
    tr.remove();
    updateTargetSumUI();
    updateCurrentUI();

    if(mode === "result"){
      setMode("current");
      showToast("행이 변경되어 현재 보기로 돌아왔어요. 다시 계산하세요.");
    }
  }

  function setTradeCell(tr, tradeQty, decision){
    const cell = tr.querySelector(".tradeQtyCell");
    const numEl = cell.querySelector(".tradeNum");
    const iconEl = cell.querySelector(".tradeIcon");

    numEl.textContent =
  (tradeQty === 0) ? "0주"
  : (tradeQty < 0 ? "-" : "") + fmt(Math.abs(tradeQty)) + "주";

    iconEl.className = "tradeIcon " + (decision === "매수" ? "buy" : decision === "매도" ? "sell" : "hold");
    iconEl.textContent = (decision === "매수") ? "▲" : (decision === "매도") ? "▼" : "·";
  }

  function addRow(){
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="left col-name"><input class="name" placeholder="종목명"></td>

      <td class="col-target">
        <input class="target" type="number" min="0" max="100" step="0.1" placeholder="예: 30%">
      </td>

      <td class="col-price"><input class="price" type="text" inputmode="numeric" autocomplete="off" placeholder="예: 1,234"></td>
      <td class="col-qty"><input class="qty" type="text" inputmode="numeric" autocomplete="off" placeholder="예: 123"></td>

      <td class="g-current col-val val">₩ 0</td>
      <td class="g-current col-w w">0.00%</td>

      <td class="g-result col-decision decision hold">유지</td>
      <td class="g-result col-trade tradeQtyCell">
        <div class="tradeCell">
          <span class="tradeIcon hold">·</span>
          <span class="tradeNum">0</span>
        </div>
      </td>

      <td class="g-result col-afterqty afterQty">0</td>
      <td class="g-result col-afterval afterVal">₩ 0</td>
      <td class="g-result col-afterw afterW">0.00%</td>

      <td class="col-del">
        <button class="delBtn" type="button" title="행 삭제">×</button>
      </td>
    `;
    tbody.appendChild(tr);

attachTargetGuard(tr.querySelector(".target"));
tr.querySelector(".delBtn").addEventListener("click", ()=>deleteRow(tr));

// ✅ 현재가/수량: 편집 중엔 숫자, blur 시 천 단위 콤마 포맷
const priceEl = tr.querySelector(".price");
const qtyEl   = tr.querySelector(".qty");
[priceEl, qtyEl].forEach(el=>{
  el.addEventListener("input", ()=>{
    formatInputWithComma(el);
    if(mode === "current") updateCurrentUI();
  });
  el.addEventListener("blur", ()=>{
    formatInputWithComma(el);
    if(mode === "current") updateCurrentUI();
  });
});

updateTargetSumUI();
updateCurrentUI();

  }

function updateCurrentUI(){
  const { rows, total } = snapshotRows();

  // 행별 현재 보유액/비중
  rows.forEach(r=>{
    r.tr.querySelector(".val").textContent = fmtKRW(r.value);
    r.tr.querySelector(".w").textContent = fmtPct01(r.weight);
  });

  // 하단 합계(현재)
  document.querySelector("#sumValue").textContent = fmtKRW(total);
  document.querySelector("#sumWeight").textContent = fmtPct01(rows.reduce((s,r)=>s+r.weight,0));

  // 상단 현재 보유액
  sumTotalLabel.textContent = fmtKRW(total);
}

  function snapshotRows(){
    const rows = [...tbody.querySelectorAll("tr")].map(tr=>{
      const targetInput = tr.querySelector(".target");
      const targetPctRaw = String(targetInput.value).trim() === "" ? 0 : clampMin0(parseNum(targetInput.value));
      const price = clampMin0(parseNum(tr.querySelector(".price").value));
      const qty = clampMin0(parseNum(tr.querySelector(".qty").value));
      const value = price * qty;

      const active = (targetPctRaw > 0) || (price > 0 && qty > 0); // ✅ 목표가 있거나 실제 보유가 있으면 활성
return { tr, target: targetPctRaw/100, price, qty, value, active, targetPctRaw };
    });

    const total = rows.reduce((s,r)=>s+r.value,0);
    rows.forEach(r=>r.weight = total ? r.value/total : 0);

    return { rows, total };
  }

  // 현금 중립(부족분이 있으면 매수 수량 자동 감액)
  function enforceCashNeutral(trades){
    let buyCost = 0;
    let sellProceeds = 0;

    for(const t of trades){
      if(t.tradeQty > 0) buyCost += t.tradeQty * t.price;
      if(t.tradeQty < 0) sellProceeds += (-t.tradeQty) * t.price;
    }

    let residual = sellProceeds - buyCost; // +면 현금 남음, -면 현금 부족

    if(residual >= 0) return { trades, buyCost, sellProceeds, residual };

    // 부족하면: 가장 비싼 매수부터 1주씩 줄여가며 맞춤(작은 N이라 충분히 빠름)
    let shortfall = -residual;

    const buys = trades
      .filter(t => t.tradeQty > 0 && t.price > 0)
      .sort((a,b)=> b.price - a.price);

    for(const t of buys){
      if(shortfall <= 0) break;
      if(t.tradeQty <= 0) continue;

      const maxReduce = t.tradeQty;
      // 한 번에 줄일 수 있는 수량(ceil(shortfall/price))만큼 줄임
      const needReduce = Math.min(maxReduce, Math.ceil(shortfall / t.price));
      t.tradeQty -= needReduce;
      buyCost -= needReduce * t.price;
      shortfall -= needReduce * t.price;
    }

    residual = sellProceeds - buyCost;
    return { trades, buyCost, sellProceeds, residual };
  }

  function calc(){
    const epsEl = document.querySelector("#eps");
    if(parseNum(epsEl.value) < 0) epsEl.value = 0;
    const eps = clampMin0(parseNum(epsEl.value)) / 100;

    const { rows, total } = snapshotRows();

    // 현재 영역 업데이트(입력값만으로 즉시 맞춰줌)
    rows.forEach(r=>{
      r.tr.querySelector(".val").textContent = fmtKRW(r.value);
      r.tr.querySelector(".w").textContent = fmtPct01(r.weight);
    });

    // --- 1) 1차(이상적) 트레이드 계산 ---
    const trades = rows.map(r=>{
       if(!r.active){
         return { ...r, decision: "-", tradeQty: 0, inactive: true };
      }
      let decision = "유지";
      if(Math.abs(r.weight - r.target) > eps){
        decision = r.weight > r.target ? "매도" : "매수";
      }

      const targetValue = total * r.target;
      let tradeQty = 0;

      if(decision === "매수" && r.price > 0){
        tradeQty = Math.floor((targetValue - r.value) / r.price);
        if(tradeQty < 0) tradeQty = 0;
      }
      if(decision === "매도" && r.price > 0){
        tradeQty = -Math.floor((r.value - targetValue) / r.price);
        if(tradeQty > 0) tradeQty = 0;
      }

      return { ...r, decision, tradeQty };
    });

    // --- 2) 현금 중립 강제(부족분 있으면 매수 자동 감액) ---
    const beforeBuyCost = trades.reduce((s,t)=> s + (t.tradeQty>0 ? t.tradeQty*t.price : 0), 0);
    const beforeSell = trades.reduce((s,t)=> s + (t.tradeQty<0 ? (-t.tradeQty)*t.price : 0), 0);

    const neutral = enforceCashNeutral(trades);

    // 부족분이 있어서 조정이 일어난 경우, 사용자에게 한 번 알려주기
    if(neutral.residual >= 0 && beforeBuyCost > 0 && beforeSell - beforeBuyCost < 0){
      showToast("현금 중립을 위해 일부 매수 수량을 자동으로 줄였어요.");
    }

    const buyCost = neutral.buyCost;
    const sellProceeds = neutral.sellProceeds;
    const cashResidual = neutral.residual; // 항상 >= 0이 되도록 조정됨(가능한 범위에서)

    // 리밸런싱 후 “보유액(주식 합계)” 계산
    const afterHoldings = total + (buyCost - sellProceeds); // total - cashResidual
    // after 비중은 afterHoldings로 나눠서 100%가 되도록(현금은 별도 표시)
    const denomAfter = afterHoldings > 0 ? afterHoldings : 0;

    // Summary counts
    let buyCnt = 0, sellCnt = 0, holdCnt = 0;

    // --- 3) 결과 렌더링 ---
    neutral.trades.forEach(t=>{
// ✅ [추가] 비활성 행은 완전히 제외
  if(t.inactive){
    const d = t.tr.querySelector(".decision");
    d.textContent = "-";
    d.className = "g-result col-decision decision hold";

    const cell = t.tr.querySelector(".tradeQtyCell");
    cell.querySelector(".tradeIcon").textContent = "·";
    cell.querySelector(".tradeNum").textContent = "-";

    t.tr.querySelector(".afterQty").textContent = "-";
    t.tr.querySelector(".afterVal").textContent = "-";
    t.tr.querySelector(".afterW").textContent = "-";
    return; // ⭐ 여기서 끝 → 카운트도 안 되고 계산도 안 됨
  }

      let decision = t.decision;
      if(t.tradeQty === 0){
        decision = "유지";
      }

      if(decision === "매수") buyCnt++;
      else if(decision === "매도") sellCnt++;
      else holdCnt++;

      const afterQty = t.qty + t.tradeQty;
      const afterVal = t.price * afterQty;
      const afterW = (denomAfter > 0) ? (afterVal / denomAfter) : 0;

      const d = t.tr.querySelector(".decision");
      d.textContent = decision;
      d.className = "g-result col-decision decision " + (decision === "매도" ? "sell" : decision === "매수" ? "buy" : "hold");

      setTradeCell(t.tr, t.tradeQty, decision);

      t.tr.querySelector(".afterQty").textContent = fmt(afterQty) + "주";
      t.tr.querySelector(".afterVal").textContent = fmtKRW(afterVal);
      t.tr.querySelector(".afterW").textContent = fmtPct01(afterW);
    });

    // --- 4) 하단 합계(정합성) ---
    document.querySelector("#sumValue").textContent = fmtKRW(total);
    document.querySelector("#sumWeight").textContent = fmtPct01(rows.reduce((s,r)=>s+r.weight,0));
    document.querySelector("#sumAfterValue").textContent = fmtKRW(afterHoldings);
    document.querySelector("#sumAfterWeight").textContent = fmtPct01(1); // afterW 분모를 afterHoldings로 쓰니 항상 100%

    // --- 5) Summary bar 업데이트 ---
    sumTotalKey.textContent = "매매 후 보유액";
    sumTotalLabel.textContent = fmtKRW(afterHoldings);

    // 현금 잔액 표시(+만 존재하도록 조정했지만, 혹시 모를 방어)
    if(cashResidual >= 0){
      cashPill.classList.remove("negative");
      cashLabel.textContent = fmtKRW(cashResidual);
    }else{
      cashPill.classList.add("negative");
      cashLabel.textContent = "₩ -" + fmt(Math.round(-cashResidual));
    }

    buyCountEl.textContent = String(buyCnt);
    sellCountEl.textContent = String(sellCnt);
    holdCountEl.textContent = String(holdCnt);

    // 기준% 합계
    updateTargetSumUI();
  }

  document.querySelector("#addRow").onclick = addRow;

  calcBtn.onclick = ()=>{
    if(mode === "current"){
      const sum = sumTargets(null);
      if(sum > 100.0001){
        showToast("기준% 합계가 100%를 초과했어요. 입력을 조정하세요.");
        return;
      }
      calc();
      setMode("result");
    }else{
      setMode("current");
    }
  };

  document.querySelector("#reset").onclick = ()=>{
    tbody.innerHTML = "";
    for(let i=0;i<7;i++) addRow();
    setMode("current");
    sumTotalKey.textContent = "현재 보유액";
    sumTotalLabel.textContent = fmtKRW(0);
    cashLabel.textContent = fmtKRW(0);
    cashPill.classList.remove("negative");
    updateTargetSumUI();
    updateCurrentUI();
  };

  // init
  const savedTheme = localStorage.getItem(THEME_KEY);
  setTheme(savedTheme || "dark");
  if(themeToggle){
    themeToggle.addEventListener("click", ()=>{
      const currentTheme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      setTheme(currentTheme === "dark" ? "light" : "dark");
    });
  }

  for(let i=0;i<7;i++) addRow();
  setMode("current");
  sumTotalKey.textContent = "현재 보유액";
  sumTotalLabel.textContent = fmtKRW(0);
  cashLabel.textContent = fmtKRW(0);
  updateTargetSumUI();
  updateCurrentUI();

  // eps 음수 방지
  const epsEl = document.querySelector("#eps");
  epsEl.addEventListener("input", ()=>{
    const v = parseNum(epsEl.value);
    if(v < 0) epsEl.value = 0;
  });
