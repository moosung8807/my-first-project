  const tbody = document.querySelector("#tbl tbody");
  const tableCard = document.querySelector("#tableCard");
  const calcBtn = document.querySelector("#calcBtn");
  const sumTargetEl = document.querySelector("#sumTarget");
  const themeToggle = document.querySelector("#themeToggle");
  const heroCalcBtn = document.querySelector("#heroCalcBtn");
  const heroDemoBtn = document.querySelector("#heroDemoBtn");
  const inputSection = document.querySelector("#inputSection");
  const resultSection = document.querySelector("#resultSection");
  const errorSummary = document.querySelector("#errorSummary");
  const staleBadge = document.querySelector("#staleBadge");
  const editWarningFloat = document.querySelector("#editWarningFloat");

  // Summary UI
  const modeLabel = document.querySelector("#modeLabel");
  const sumTotalKey = document.querySelector("#sumTotalKey");
  const sumTotalLabel = document.querySelector("#sumTotalLabel");
  const cashKey = document.querySelector("#cashKey");
  const cashLabel = document.querySelector("#cashLabel");
  const cashPill = document.querySelector("#cashPill");

  const buyCountEl = document.querySelector("#buyCount");
  const sellCountEl = document.querySelector("#sellCount");
  const holdCountEl = document.querySelector("#holdCount");

  // Progress UI
  const progressWrap = document.querySelector("#progressWrap");
  const progressBar = document.querySelector("#progressBar");
  const progressText = document.querySelector("#progressText");
  const mobileSumTotalKey = document.querySelector("#mobileSumTotalKey");
  const mobileSumTotalLabel = document.querySelector("#mobileSumTotalLabel");
  const mobileProgressText = document.querySelector("#mobileProgressText");
  const mobileCashLabel = document.querySelector("#mobileCashLabel");

  // Toast
  const toast = document.querySelector("#toast");
  const toastMsg = document.querySelector("#toastMsg");
  let toastTimer = null;
  let editWarningFloatTimer = null;

  let mode = "current"; // "current" | "result"
  const THEME_KEY = "rb-theme";
  const FIXED_TOLERANCE_PERCENT_POINT = 0.1;
  const FIXED_TOLERANCE_RATIO = FIXED_TOLERANCE_PERCENT_POINT / 100;
  const LARGE_AMOUNT_WRAP_THRESHOLD = 1000000000;
  const YAHOO_PROXY_ENDPOINT = "/api/quote";
  const PRICE_FETCH_DEBOUNCE_MS = 550;
  let hasComputed = false;
  let isDirtyAfterCalc = false;
  const rowQuoteStates = new WeakMap();
  const SYMBOL_ALIAS_MAP = Object.freeze({
    "005930": "005930.KS",
    "000660": "000660.KS",
    "035420": "035420.KS",
    "035720": "035720.KS",
    "069500": "069500.KS",
    "102110": "102110.KS",
    "132030": "132030.KS",
    "148070": "148070.KS",
    "229200": "229200.KS",
    "360750": "360750.KS",
    "247540": "247540.KQ",
    "066970": "066970.KQ",
    "kodex200": "069500.KS",
    "tiger200": "102110.KS",
    "kodex골드선물h": "132030.KS",
    "kodex골드선물(h)": "132030.KS",
    "kosef국고채10년": "148070.KS",
    "tiger미국s&p500": "360750.KS",
    "tiger미국sp500": "360750.KS",
    "삼성전자": "005930.KS",
    "sk하이닉스": "000660.KS",
    "naver": "035420.KS",
    "카카오": "035720.KS",
    "에코프로비엠": "247540.KQ",
    "엘앤에프": "066970.KQ"
  });

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
  function normalizeAliasKey(value){
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^0-9a-zA-Z가-힣&().+-]/g, "");
  }
  function normalizeSymbol(value){
    return String(value || "").trim().toUpperCase();
  }
  function resolveYahooSymbol(rawInput){
    const input = String(rawInput || "").trim();
    if(!input) return "";

    const symbolLike = normalizeSymbol(input);
    if(/^[A-Z0-9.^=\-]{1,20}$/.test(symbolLike) && symbolLike.includes(".")){
      return symbolLike;
    }

    const aliasKey = normalizeAliasKey(input);
    if(SYMBOL_ALIAS_MAP[aliasKey]){
      return SYMBOL_ALIAS_MAP[aliasKey];
    }

    if(/^\d{6}$/.test(input)){
      return `${input}.KS`;
    }

    if(/^[A-Za-z][A-Za-z0-9.^=\-]{0,9}$/.test(input)){
      return symbolLike;
    }

    return "";
  }
  function getRowQuoteState(tr){
    let state = rowQuoteStates.get(tr);
    if(!state){
      state = { timer: null, controller: null, seq: 0 };
      rowQuoteStates.set(tr, state);
    }
    return state;
  }
  function clearRowQuoteState(tr){
    const state = rowQuoteStates.get(tr);
    if(!state) return;
    if(state.timer){
      clearTimeout(state.timer);
      state.timer = null;
    }
    if(state.controller){
      state.controller.abort();
      state.controller = null;
    }
  }
  function applyFetchedPriceToRow(tr, price){
    const priceEl = tr.querySelector(".price");
    if(!priceEl) return;
    const rounded = Math.round(Number(price));
    if(!isFinite(rounded) || rounded <= 0) return;
    priceEl.value = withComma(String(rounded));
    priceEl.classList.remove("invalidField");
    if(mode === "current") updateCurrentUI();
    markDirtyIfNeeded();
  }
  async function fetchQuoteFromProxy(symbol, signal){
    const response = await fetch(`${YAHOO_PROXY_ENDPOINT}?symbol=${encodeURIComponent(symbol)}`, { signal });
    if(!response.ok){
      const payload = await response.json().catch(()=>({}));
      const message = payload && payload.error ? payload.error : "현재가 조회에 실패했습니다.";
      throw new Error(message);
    }
    const payload = await response.json();
    const price = Number(payload?.price);
    if(!isFinite(price) || price <= 0){
      throw new Error("조회된 현재가가 유효하지 않습니다.");
    }
    return { symbol: payload?.symbol || symbol, price };
  }
  function scheduleAutoPriceFetch(tr, { immediate = false } = {}){
    const nameEl = tr.querySelector(".name");
    if(!nameEl) return;
    const symbol = resolveYahooSymbol(nameEl.value);
    if(!symbol){
      if(immediate && String(nameEl.value || "").trim()){
        showToast("심볼을 인식하지 못했어요. 예: 005930, 삼성전자, AAPL");
      }
      return;
    }

    const state = getRowQuoteState(tr);
    if(state.timer){
      clearTimeout(state.timer);
      state.timer = null;
    }

    const runFetch = async ()=>{
      if(state.controller) state.controller.abort();
      state.controller = new AbortController();
      const currentSeq = ++state.seq;

      try{
        const result = await fetchQuoteFromProxy(symbol, state.controller.signal);
        if(currentSeq !== state.seq) return;
        tr.dataset.resolvedSymbol = result.symbol;
        applyFetchedPriceToRow(tr, result.price);
      }catch(err){
        if(err && (err.name === "AbortError")) return;
        tr.dataset.resolvedSymbol = "";
        if(immediate){
          showToast(`현재가 조회 실패: ${symbol}`);
        }
      }
    };

    if(immediate){
      runFetch();
      return;
    }
    state.timer = setTimeout(runFetch, PRICE_FETCH_DEBOUNCE_MS);
  }

  function fmt(n){ return isFinite(n) ? n.toLocaleString("ko-KR") : "0"; }
  function fmtKRW(n){ return "₩ " + fmt(Math.round(n)); }
  function fmtPct01(x){ return isFinite(x) ? (x * 100).toFixed(1) + "%" : "0.0%"; }
  function setTotalSummary(keyText, valueText){
    sumTotalKey.textContent = keyText;
    sumTotalLabel.textContent = valueText;
    if(mobileSumTotalKey) mobileSumTotalKey.textContent = keyText;
    if(mobileSumTotalLabel) mobileSumTotalLabel.textContent = valueText;
  }
  function setCashSummary(valueText){
    cashLabel.textContent = valueText;
    if(mobileCashLabel) mobileCashLabel.textContent = valueText;
  }
  function resetSummaryKeyLabels(){
    sumTotalKey.textContent = "현재 보유액";
    if(cashKey) cashKey.textContent = "현금 잔액";
  }
  function applyResultSummaryKeyLabels(afterHoldings, cashResidual){
    const shouldWrap = afterHoldings >= LARGE_AMOUNT_WRAP_THRESHOLD || cashResidual >= LARGE_AMOUNT_WRAP_THRESHOLD;
    sumTotalKey.innerHTML = shouldWrap ? "매매 후<br>보유액" : "매매 후 보유액";
    if(cashKey){
      cashKey.innerHTML = shouldWrap ? "현금<br>잔액" : "현금 잔액";
    }
  }

  function showToast(message){
    toastMsg.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>toast.classList.remove("show"), 1700);
  }

  function scrollToEl(el){
    if(!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearInvalidMarks(){
    document.querySelectorAll(".invalidField").forEach(el=>el.classList.remove("invalidField"));
  }

  function hideErrorSummary(){
    if(!errorSummary) return;
    errorSummary.hidden = true;
    errorSummary.textContent = "";
  }

  function showErrorSummary(message){
    if(!errorSummary){
      showToast(message);
      return;
    }
    errorSummary.textContent = message;
    errorSummary.hidden = false;
  }

  function setDirtyState(next){
    isDirtyAfterCalc = Boolean(next);
    if(!staleBadge) return;

    if(!hasComputed){
      staleBadge.hidden = true;
      staleBadge.classList.remove("dirty", "clean");
      staleBadge.textContent = "입력 변경됨 · 다시 계산 필요";
      return;
    }

    staleBadge.hidden = false;
    staleBadge.classList.toggle("dirty", isDirtyAfterCalc);
    staleBadge.classList.toggle("clean", !isDirtyAfterCalc);
    staleBadge.textContent = isDirtyAfterCalc
      ? "입력 변경됨 · 다시 계산 필요"
      : "최신 계산 결과가 반영됨";
  }

  function markDirtyIfNeeded(){
    if(hasComputed && mode === "current"){
      setDirtyState(true);
    }
  }

  function showEditWarningNearInput(inputEl){
    if(!editWarningFloat || !inputEl) return;
    const rect = inputEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const bubbleWidth = Math.min(280, vw - 16);
    let left = rect.left + rect.width / 2 - bubbleWidth / 2;
    let top = rect.top - 44;

    if(left < 8) left = 8;
    if(left + bubbleWidth > vw - 8) left = vw - bubbleWidth - 8;
    if(top < 8) top = rect.bottom + 8;

    editWarningFloat.style.width = `${bubbleWidth}px`;
    editWarningFloat.style.left = `${left}px`;
    editWarningFloat.style.top = `${top}px`;
    editWarningFloat.hidden = false;

    clearTimeout(editWarningFloatTimer);
    editWarningFloatTimer = setTimeout(()=>{
      editWarningFloat.hidden = true;
    }, 2200);
  }

  function switchToCurrentOnEdit(inputEl){
    if(mode !== "result") return;
    setMode("current");
    showEditWarningNearInput(inputEl);
  }

  function warnOnResultFocus(inputEl){
    if(mode !== "result") return;
    showEditWarningNearInput(inputEl);
  }

  function focusInvalidField(el){
    if(!el) return;
    el.classList.add("invalidField");
    scrollToEl(el);
    el.focus({ preventScroll: true });
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

    const inputEls = document.querySelectorAll(".g-input");
    const currentEls = document.querySelectorAll(".g-current");
    const resultEls  = document.querySelectorAll(".g-result");

    if(mode === "current"){
      inputEls.forEach(el=>el.classList.remove("hide"));
      currentEls.forEach(el=>el.classList.add("hide"));
      resultEls.forEach(el=>el.classList.add("hide"));
      calcBtn.textContent = "계산";
      tableCard.classList.add("mode-current");
      tableCard.classList.remove("mode-result");
      modeLabel.textContent = "입력";

      // 입력 모드: 결과/현금은 의미가 약하니 0으로 정리
      cashPill.classList.remove("negative");
      setCashSummary(fmtKRW(0));
      setTotalSummary("현재 보유액", document.querySelector("#sumValue").textContent);
      resetSummaryKeyLabels();
      resetSummaryCounts();
      tbody.querySelectorAll("tr").forEach(tr=>setRowDetailOpen(tr, false));
    }else{
      inputEls.forEach(el=>el.classList.add("hide"));
      currentEls.forEach(el=>el.classList.add("hide"));
      resultEls.forEach(el=>el.classList.remove("hide"));
      calcBtn.textContent = "현재 보기";
      tableCard.classList.add("mode-result");
      tableCard.classList.remove("mode-current");
      modeLabel.textContent = "결과";
      setDirtyState(false);
      tbody.querySelectorAll("tr").forEach(tr=>setRowDetailOpen(tr, false));
    }
  }

  function setRowDetailOpen(tr, open){
    if(!tr) return;
    const nextOpen = Boolean(open);
    tr.classList.toggle("mobile-details-open", nextOpen);
    const btn = tr.querySelector(".detailToggleBtn");
    if(btn){
      btn.setAttribute("aria-expanded", nextOpen ? "true" : "false");
      btn.textContent = nextOpen ? "접기" : "상세 보기";
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
    progressText.textContent = clamped.toFixed(1) + "%";
    if(mobileProgressText) mobileProgressText.textContent = clamped.toFixed(1) + "%";
    progressWrap.classList.toggle("over", clamped > 100.0001);
  }

  function updateTargetSumUI(){
    const sum = sumTargets(null);
    sumTargetEl.textContent = sum.toFixed(1) + "%";
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
    clearRowQuoteState(tr);
    tr.remove();
    updateTargetSumUI();
    updateCurrentUI();

    if(mode === "result"){
      setMode("current");
      showToast("행이 변경되어 현재 보기로 돌아왔어요. 다시 계산하세요.");
    }
    markDirtyIfNeeded();
    hideErrorSummary();
    clearInvalidMarks();
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
      <td class="left col-name"><input class="name" placeholder="종목명" aria-label="종목명"></td>

      <td class="g-input col-target">
        <input class="g-input target" type="number" min="0" max="100" step="0.1" inputmode="numeric" placeholder="예: 30%" aria-label="목표비중 퍼센트">
      </td>

      <td class="g-input col-price"><input class="g-input price" type="text" inputmode="numeric" autocomplete="off" placeholder="예: 1,234" aria-label="현재가 원"></td>
      <td class="g-input col-qty"><input class="g-input qty" type="text" inputmode="numeric" autocomplete="off" placeholder="예: 123" aria-label="수량 주"></td>

      <td class="g-current col-val val">₩ 0</td>
      <td class="g-current col-w w">0.00%</td>

      <td class="g-result col-decision decision hold">
        <span class="decisionLabel">유지</span>
        <button class="g-result detailToggleBtn" type="button" aria-expanded="false">상세 보기</button>
      </td>
      <td class="g-result col-trade tradeQtyCell">
        <div class="tradeCell">
          <span class="tradeIcon hold">·</span>
          <span class="tradeNum">0</span>
        </div>
      </td>

      <td class="g-result col-afterqty afterQty">0</td>
      <td class="g-result col-afterval afterVal">₩ 0</td>
      <td class="g-result col-afterw afterW">0.00%</td>

      <td class="g-input col-del">
        <button class="g-input delBtn" type="button" title="행 삭제">×</button>
      </td>
    `;
    tbody.appendChild(tr);

    // 새 행은 현재 모드와 동일한 컬럼 가시성 상태로 시작해야 레이아웃이 유지된다.
    const inputCells = tr.querySelectorAll(".g-input");
    const currentCells = tr.querySelectorAll(".g-current");
    const resultCells = tr.querySelectorAll(".g-result");
    if(mode === "current"){
      inputCells.forEach(el=>el.classList.remove("hide"));
      currentCells.forEach(el=>el.classList.add("hide"));
      resultCells.forEach(el=>el.classList.add("hide"));
    }else{
      inputCells.forEach(el=>el.classList.add("hide"));
      currentCells.forEach(el=>el.classList.add("hide"));
      resultCells.forEach(el=>el.classList.remove("hide"));
    }

attachTargetGuard(tr.querySelector(".target"));
tr.querySelector(".delBtn").addEventListener("click", ()=>deleteRow(tr));
tr.querySelector(".detailToggleBtn").addEventListener("click", ()=>{
  const next = !tr.classList.contains("mobile-details-open");
  setRowDetailOpen(tr, next);
});
tr.querySelector(".name").addEventListener("focus", ()=>warnOnResultFocus(tr.querySelector(".name")));
tr.querySelector(".name").addEventListener("input", ()=>{
  syncRowDisplayName(tr);
  switchToCurrentOnEdit(tr.querySelector(".name"));
  scheduleAutoPriceFetch(tr);
  markDirtyIfNeeded();
});
tr.querySelector(".name").addEventListener("blur", ()=>scheduleAutoPriceFetch(tr, { immediate: true }));
tr.querySelector(".name").addEventListener("keydown", (event)=>{
  if(event.key === "Enter"){
    scheduleAutoPriceFetch(tr, { immediate: true });
  }
});
tr.querySelector(".target").addEventListener("focus", ()=>warnOnResultFocus(tr.querySelector(".target")));
tr.querySelector(".target").addEventListener("input", ()=>{
  switchToCurrentOnEdit(tr.querySelector(".target"));
  tr.querySelector(".target").classList.remove("invalidField");
  if(mode === "current") updateCurrentUI();
  markDirtyIfNeeded();
});

// ✅ 현재가/수량: 편집 중엔 숫자, blur 시 천 단위 콤마 포맷
const priceEl = tr.querySelector(".price");
const qtyEl   = tr.querySelector(".qty");
[priceEl, qtyEl].forEach(el=>{
  el.addEventListener("focus", ()=>warnOnResultFocus(el));
  el.addEventListener("input", ()=>{
    switchToCurrentOnEdit(el);
    el.classList.remove("invalidField");
    formatInputWithComma(el);
    if(mode === "current") updateCurrentUI();
    markDirtyIfNeeded();
  });
  el.addEventListener("blur", ()=>{
    formatInputWithComma(el);
    if(mode === "current") updateCurrentUI();
    markDirtyIfNeeded();
  });
});

updateTargetSumUI();
updateCurrentUI();
setRowDetailOpen(tr, false);
syncRowDisplayName(tr);

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
  setTotalSummary("현재 보유액", fmtKRW(total));
}

  function syncRowDisplayName(tr){
    const nameInput = tr.querySelector(".name");
    const nameCell = tr.querySelector(".col-name");
    if(!nameInput || !nameCell) return;
    const raw = String(nameInput.value || "").trim();
    nameCell.setAttribute("data-name", raw || "종목명 미입력");
  }

  function snapshotRows(){
    const rows = [...tbody.querySelectorAll("tr")].map(tr=>{
      syncRowDisplayName(tr);
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

  function validateBeforeCalc(){
    clearInvalidMarks();
    hideErrorSummary();

    const allRows = [...tbody.querySelectorAll("tr")];
    const sum = sumTargets(null);
    const hasAnyActive = allRows.some((tr)=>{
      const target = clampMin0(parseNum(tr.querySelector(".target").value));
      const price = clampMin0(parseNum(tr.querySelector(".price").value));
      const qty = clampMin0(parseNum(tr.querySelector(".qty").value));
      return target > 0 || (price > 0 && qty > 0);
    });

    if(!hasAnyActive){
      showErrorSummary("입력 오류: 최소 1개 종목에 목표비중 또는 보유 수량/가격을 입력하세요.");
      showToast("입력값이 비어 있어요.");
      const first = tbody.querySelector("tr .target");
      focusInvalidField(first);
      return false;
    }

    if(Math.abs(sum - 100) > 0.01){
      showErrorSummary(`입력 오류: 목표비중 합계가 100%가 아닙니다. 현재 ${sum.toFixed(2)}%입니다.`);
      showToast("목표비중 합계를 100%로 맞춰주세요.");
      const first = tbody.querySelector("tr .target");
      focusInvalidField(first);
      return false;
    }

    for(const tr of allRows){
      const targetEl = tr.querySelector(".target");
      const priceEl = tr.querySelector(".price");
      const target = clampMin0(parseNum(targetEl.value));
      const price = clampMin0(parseNum(priceEl.value));

      if(target > 0 && price <= 0){
        showErrorSummary("입력 오류: 목표비중을 입력한 종목은 현재가를 0보다 크게 입력해야 합니다.");
        showToast("현재가를 확인해주세요.");
        focusInvalidField(priceEl);
        return false;
      }
    }

    return true;
  }

  function fillDemoAndRun(){
    const samples = [
      { name: "KODEX 200", target: "35", price: "35,200", qty: "110" },
      { name: "TIGER 미국S&P500", target: "35", price: "18,450", qty: "180" },
      { name: "KOSEF 국고채10년", target: "20", price: "10,230", qty: "120" },
      { name: "KODEX 골드선물(H)", target: "10", price: "14,120", qty: "60" }
    ];

    tbody.innerHTML = "";
    samples.forEach(()=>addRow());

    const rows = [...tbody.querySelectorAll("tr")];
    samples.forEach((sample, idx)=>{
      const tr = rows[idx];
      tr.querySelector(".name").value = sample.name;
      tr.querySelector(".target").value = sample.target;
      tr.querySelector(".price").value = sample.price;
      tr.querySelector(".qty").value = sample.qty;
    });

    updateTargetSumUI();
    updateCurrentUI();
    clearInvalidMarks();
    hideErrorSummary();

    if(validateBeforeCalc()){
      calc();
      hasComputed = true;
      setMode("result");
      setDirtyState(false);
      scrollToEl(resultSection || tableCard);
      showToast("예시 데이터로 계산을 완료했어요.");
    }
  }

  function calc(){
    const eps = FIXED_TOLERANCE_RATIO;

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
    const lbl = d.querySelector(".decisionLabel");
    if(lbl) lbl.textContent = "-";
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
      const lbl = d.querySelector(".decisionLabel");
      if(lbl) lbl.textContent = decision;
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
    setTotalSummary("매매 후 보유액", fmtKRW(afterHoldings));
    applyResultSummaryKeyLabels(afterHoldings, cashResidual);

    // 현금 잔액 표시(+만 존재하도록 조정했지만, 혹시 모를 방어)
    if(cashResidual >= 0){
      cashPill.classList.remove("negative");
      setCashSummary(fmtKRW(cashResidual));
    }else{
      cashPill.classList.add("negative");
      setCashSummary("₩ -" + fmt(Math.round(-cashResidual)));
    }

    buyCountEl.textContent = String(buyCnt);
    sellCountEl.textContent = String(sellCnt);
    holdCountEl.textContent = String(holdCnt);

    // 기준% 합계
    updateTargetSumUI();
  }

  document.querySelector("#addRow").onclick = ()=>{
    addRow();
    markDirtyIfNeeded();
    hideErrorSummary();
    clearInvalidMarks();
  };

  calcBtn.onclick = ()=>{
    if(mode === "current"){
      if(!validateBeforeCalc()){
        return;
      }
      calc();
      hasComputed = true;
      setMode("result");
      setDirtyState(false);
      hideErrorSummary();
      clearInvalidMarks();
      if(window.matchMedia("(max-width: 768px)").matches){
        scrollToEl(resultSection || tableCard);
      }
    }else{
      setMode("current");
    }
  };

  document.querySelector("#reset").onclick = ()=>{
    if(!window.confirm("전체 입력값을 초기화할까요?")){
      return;
    }
    tbody.innerHTML = "";
    for(let i=0;i<7;i++) addRow();
    setMode("current");
    setTotalSummary("현재 보유액", fmtKRW(0));
    setCashSummary(fmtKRW(0));
    cashPill.classList.remove("negative");
    hasComputed = false;
    setDirtyState(false);
    hideErrorSummary();
    clearInvalidMarks();
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
  if(heroCalcBtn){
    heroCalcBtn.addEventListener("click", ()=>{
      scrollToEl(inputSection);
      const firstInput = tbody.querySelector("tr .target");
      if(firstInput) firstInput.focus({ preventScroll: true });
    });
  }
  if(heroDemoBtn){
    heroDemoBtn.addEventListener("click", fillDemoAndRun);
  }

  for(let i=0;i<7;i++) addRow();
  setMode("current");
  setTotalSummary("현재 보유액", fmtKRW(0));
  setCashSummary(fmtKRW(0));
  setDirtyState(false);
  updateTargetSumUI();
  updateCurrentUI();
