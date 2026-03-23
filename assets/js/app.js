  const tbody = document.querySelector("#tbl tbody");
  const tableCard = document.querySelector("#tableCard");
  const calcBtn = document.querySelector("#calcBtn");
  const resetBtn = document.querySelector("#reset");
  const sumTargetEl = document.querySelector("#sumTarget");
  const themeToggle = document.querySelector("#themeToggle");
  const heroCalcBtn = document.querySelector("#heroCalcBtn");
  const heroDemoBtn = document.querySelector("#heroDemoBtn");
  const guideRailList = document.querySelector("#guideRailList");
  const guideRailRefreshBtn = document.querySelector("#guideRailRefreshBtn");
  const inputSection = document.querySelector("#inputSection");
  const resultSection = document.querySelector("#resultSection");
  const errorSummary = document.querySelector("#errorSummary");
  const staleBadge = document.querySelector("#staleBadge");
  const editWarningFloat = document.querySelector("#editWarningFloat");
  const autoQuoteToggle = document.querySelector("#autoQuoteToggle");
  const mobileTargetSumLabel = document.querySelector("#mobileTargetSumLabel");
  const mobileTargetWarning = document.querySelector("#mobileTargetWarning");
  const mobileResultList = document.querySelector("#mobileResultList");
  const mobileDetailToggle = document.querySelector("#mobileDetailToggle");
  const mobileTotalAssetLabel = document.querySelector("#mobileTotalAssetLabel");
  const mobileCalcBtn = document.querySelector("#mobileCalcBtn");
  const mobileResetBtn = document.querySelector("#mobileResetBtn");
  const exportPdfBtn = document.querySelector("#exportPdfBtn");

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
  const {
    clampMin0,
    escapeHtml,
    fmt,
    fmtKRW,
    fmtPct01,
    formatInputWithComma,
    parseNum,
    parseNumberFromText,
    withComma
  } = window.RebalancingFormat;
  const {
    KR_ETF_ALIAS_MAP,
    STOCK_SUGGESTIONS,
    SYMBOL_ALIAS_MAP,
    findKrEtfByAlias,
    getSuggestionCandidates,
    normalizeAliasKey,
    normalizeKrEtfAlias,
    normalizeSymbol,
    resolveYahooSymbol
  } = window.RebalancingSymbols;
  const {
    getNameInput,
    getNameSuggestBox,
    getNameSuggestionItems,
    getSuggestionActiveIndex,
    setSuggestionActiveIndex
  } = window.RebalancingDomHelpers;
  const {
    classifyAssetBucket,
    formatReportDate,
    requestPortfolioName
  } = window.RebalancingUtils;
  const {
    applyResultSummaryKeyLabels: applyResultSummaryKeyLabelsHelper,
    resetSummaryCounts: resetSummaryCountsHelper,
    resetSummaryKeyLabels: resetSummaryKeyLabelsHelper,
    setCashSummary: setCashSummaryHelper,
    setTotalSummary: setTotalSummaryHelper
  } = window.RebalancingSummaryHelpers;
  const {
    clearInvalidMarks: clearInvalidMarksHelper,
    focusInvalidField: focusInvalidFieldHelper,
    hideErrorSummary: hideErrorSummaryHelper,
    scrollToEl: scrollToElHelper,
    showErrorSummary: showErrorSummaryHelper,
    showToast: showToastHelper
  } = window.RebalancingFeedbackHelpers;
  const {
    markDirtyIfNeeded: markDirtyIfNeededHelper,
    setDirtyState: setDirtyStateHelper,
    showEditWarningNearInput: showEditWarningNearInputHelper,
    switchToCurrentOnEdit: switchToCurrentOnEditHelper,
    warnOnResultFocus: warnOnResultFocusHelper
  } = window.RebalancingUiStateHelpers;
  const {
    setTheme: setThemeHelper
  } = window.RebalancingThemeHelpers;
  const {
    attachTargetGuard: attachTargetGuardHelper,
    rowCount: rowCountHelper,
    sumTargets: sumTargetsHelper,
    updateProgress: updateProgressHelper,
    updateTargetSumUI: updateTargetSumUIHelper
  } = window.RebalancingTargetHelpers;
  const {
    setMode: setModeHelper,
    setRowDetailOpen: setRowDetailOpenHelper
  } = window.RebalancingModeHelpers;
  const {
    deleteRow: deleteRowHelper,
    setTradeCell: setTradeCellHelper,
    syncRowDisplayName: syncRowDisplayNameHelper,
    updateCurrentUI: updateCurrentUIHelper
  } = window.RebalancingRowHelpers;
  const {
    renderMobileResultList: renderMobileResultListHelper,
    setMobileDetailHeader: setMobileDetailHeaderHelper
  } = window.RebalancingMobileHelpers;

  function getDecisionIcon(decision) {
    if (decision === "매수") return "↗";
    if (decision === "매도") return "↘";
    return "−";
  }

  function setDecisionBadge(labelEl, decision) {
    if (!labelEl) return;
    const nextDecision = decision === "매수" || decision === "매도" || decision === "유지"
      ? decision
      : "유지";
    labelEl.innerHTML = `
      <span class="decisionIcon" aria-hidden="true">${getDecisionIcon(nextDecision)}</span>
      <span class="decisionText">${nextDecision}</span>
    `;
  }

  function setEmptyDecisionBadge(labelEl) {
    if (!labelEl) return;
    labelEl.innerHTML = `<span class="decisionText">-</span>`;
  }

  function getDecisionText(tr) {
    return tr.querySelector(".decisionText")?.textContent?.trim()
      || tr.querySelector(".decisionLabel")?.textContent?.trim()
      || "유지";
  }

  const summaryRefs = {
    buyCountEl,
    cashKey,
    cashLabel,
    holdCountEl,
    mobileCashLabel,
    mobileSumTotalKey,
    mobileSumTotalLabel,
    sellCountEl,
    sumTotalKey,
    sumTotalLabel
  };
  const targetRefs = {
    mobileProgressText,
    mobileTargetSumLabel,
    progressBar,
    progressText,
    progressWrap,
    sumTargetEl,
    tbody
  };
  const modeRefs = {
    calcBtn,
    cashPill,
    mobileCalcBtn,
    mobileDetailToggle,
    mobileResultList,
    modeLabel,
    tableCard,
    tbody
  };
  const rowRefs = {
    mobileTotalAssetLabel,
    sumValue: document.querySelector("#sumValue"),
    sumWeight: document.querySelector("#sumWeight")
  };
  const mobileRefs = {
    mobileResultList
  };
  const feedbackRefs = {
    errorSummary,
    toast,
    toastMsg
  };
  const uiStateRefs = {
    editWarningFloat,
    staleBadge
  };
  const feedbackState = {
    get toastTimer() {
      return toastTimer;
    },
    set toastTimer(value) {
      toastTimer = value;
    }
  };
  const uiState = {
    get editWarningFloatTimer() {
      return editWarningFloatTimer;
    },
    set editWarningFloatTimer(value) {
      editWarningFloatTimer = value;
    },
    get hasComputed() {
      return hasComputed;
    },
    get isDirtyAfterCalc() {
      return isDirtyAfterCalc;
    },
    set isDirtyAfterCalc(value) {
      isDirtyAfterCalc = value;
    },
    get mode() {
      return mode;
    }
  };

  let mode = "current"; // "current" | "result"
  const THEME_KEY = "rb-theme";
  const AUTO_QUOTE_KEY = "rb-auto-quote-enabled";
  const FIXED_TOLERANCE_PERCENT_POINT = 0.1;
  const FIXED_TOLERANCE_RATIO = FIXED_TOLERANCE_PERCENT_POINT / 100;
  const LARGE_AMOUNT_WRAP_THRESHOLD = 1000000000;
  const YAHOO_PROXY_ENDPOINT = "/api/quote";
  const PRICE_FETCH_DEBOUNCE_MS = 550;
  const PRESET_PORTFOLIOS = {
    balanced: {
      toastMessage: "균형형 4자산 예시로 계산을 완료했어요.",
      samples: [
        { name: "KODEX 200", target: "35", price: "35,200", qty: "110" },
        { name: "TIGER 미국S&P500", target: "35", price: "18,450", qty: "180" },
        { name: "KOSEF 국고채10년", target: "20", price: "10,230", qty: "120" },
        { name: "KODEX 골드선물(H)", target: "10", price: "14,120", qty: "60" }
      ]
    },
    growth: {
      toastMessage: "성장형 80/20 예시로 계산을 완료했어요.",
      samples: [
        { name: "TIGER 미국나스닥100", target: "40", price: "12,880", qty: "210" },
        { name: "TIGER 미국S&P500", target: "25", price: "18,450", qty: "150" },
        { name: "KODEX 200", target: "15", price: "35,200", qty: "70" },
        { name: "KOSEF 국고채10년", target: "20", price: "10,230", qty: "110" }
      ]
    },
    income: {
      toastMessage: "현금흐름 중시형 예시로 계산을 완료했어요.",
      samples: [
        { name: "TIGER 미국배당다우존스", target: "35", price: "16,980", qty: "150" },
        { name: "KOSEF 국고채10년", target: "30", price: "10,230", qty: "180" },
        { name: "KBSTAR 단기통안채", target: "20", price: "52,400", qty: "45" },
        { name: "KODEX 골드선물(H)", target: "15", price: "14,120", qty: "55" }
      ]
    }
  };
  const GUIDE_RAIL_VISIBLE_COUNT = 3;
  const GUIDE_RAIL_ITEMS = [
    {
      href: "pages/why-rebalancing.html",
      tag: "개념",
      title: "리밸런싱을 해야 하는 이유",
      description: "목표 비중을 유지해야 하는 이유와 위험 관리 관점을 먼저 정리합니다."
    },
    {
      href: "pages/monthly-dca-rebalancing.html",
      tag: "적립식",
      title: "월 적립식 매수 비중 계산기",
      description: "매도 없이 이번 달 적립금을 어떤 종목에 얼마씩 넣을지 빠르게 계산합니다."
    },
    {
      href: "pages/rebalancing-frequency.html",
      tag: "주기",
      title: "리밸런싱 주기 정하는 법",
      description: "연 1회, 반기, 비중 기준 방식이 실제로 어떻게 다른지 빠르게 비교합니다."
    },
    {
      href: "pages/rebalancing-calculation-difficulty.html",
      tag: "계산",
      title: "리밸런싱 계산이 어려운 이유",
      description: "손계산이 복잡해지는 지점과 계산기가 필요한 이유를 짚어줍니다."
    }
  ];
  let hasComputed = false;
  let isDirtyAfterCalc = false;
  let autoQuoteEnabled = true;
  let guideRailSelectionKey = "";
  const rowQuoteStates = new Map();
  function applySuggestionSelection(tr, item){
    const nameEl = getNameInput(tr);
    if(!nameEl || !item) return;
    const name = item.dataset.name || "";
    const symbol = item.dataset.symbol || "";
    nameEl.value = name;
    syncRowDisplayName(tr);
    hideNameSuggestions(tr);
    if(autoQuoteEnabled){
      scheduleAutoPriceFetch(tr, { immediate: true, symbolOverride: symbol });
    }
    nameEl.focus({ preventScroll: true });
  }
  function hideNameSuggestions(tr){
    const suggestBox = getNameSuggestBox(tr);
    const nameEl = getNameInput(tr);
    if(!suggestBox) return;
    suggestBox.hidden = true;
    suggestBox.innerHTML = "";
    suggestBox.removeAttribute("aria-label");
    suggestBox.removeAttribute("data-active-index");
    if(nameEl){
      nameEl.setAttribute("aria-expanded", "false");
      nameEl.removeAttribute("aria-activedescendant");
    }
  }
  function showNameSuggestions(tr, query){
    const suggestBox = getNameSuggestBox(tr);
    const nameEl = getNameInput(tr);
    if(!suggestBox) return;

    const candidates = getSuggestionCandidates(query);
    if(!candidates.length){
      hideNameSuggestions(tr);
      return;
    }

    suggestBox.innerHTML = "";
    suggestBox.setAttribute("aria-label", "종목 자동완성 목록");
    candidates.forEach((item, idx)=>{
      const button = document.createElement("button");
      button.type = "button";
      button.className = "nameSuggestItem";
      button.id = `${suggestBox.id}-item-${idx}`;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", "false");
      button.dataset.name = item.name;
      button.dataset.symbol = item.symbol;
      button.innerHTML = `
        <span class="nameSuggestName">${item.name}</span>
        <span class="nameSuggestSymbol">${item.symbol}</span>
      `;
      button.addEventListener("mousedown", (event)=>event.preventDefault());
      button.addEventListener("click", ()=>applySuggestionSelection(tr, button));
      suggestBox.appendChild(button);
    });
    suggestBox.hidden = false;
    setSuggestionActiveIndex(tr, -1);
    if(nameEl){
      nameEl.setAttribute("aria-expanded", "true");
      nameEl.setAttribute("aria-controls", suggestBox.id);
    }
  }
  function hideAllNameSuggestions(){
    tbody.querySelectorAll("tr").forEach((tr)=>hideNameSuggestions(tr));
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
    rowQuoteStates.delete(tr);
  }
  function clearAllRowQuoteStates(){
    [...rowQuoteStates.keys()].forEach((tr)=>clearRowQuoteState(tr));
  }
  function getInitialRowCount(){
    return window.matchMedia("(max-width: 768px)").matches ? 3 : 7;
  }
  function setActivePreset(){
  }
  function shuffleItems(items){
    const nextItems = [...items];
    for(let i = nextItems.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [nextItems[i], nextItems[j]] = [nextItems[j], nextItems[i]];
    }
    return nextItems;
  }
  function pickGuideRailItems(){
    if(!GUIDE_RAIL_ITEMS.length){
      return [];
    }
    if(GUIDE_RAIL_ITEMS.length <= GUIDE_RAIL_VISIBLE_COUNT){
      return shuffleItems(GUIDE_RAIL_ITEMS);
    }

    let nextItems = [];
    let nextKey = "";
    let attempt = 0;
    do{
      nextItems = shuffleItems(GUIDE_RAIL_ITEMS).slice(0, GUIDE_RAIL_VISIBLE_COUNT);
      nextKey = nextItems.map((item)=>item.href).sort().join("|");
      attempt += 1;
    }while(nextKey === guideRailSelectionKey && attempt < 8);

    return nextItems;
  }
  function renderGuideRail(){
    if(!guideRailList) return;
    const items = pickGuideRailItems();
    if(!items.length){
      guideRailList.innerHTML = "";
      if(guideRailRefreshBtn){
        guideRailRefreshBtn.disabled = true;
      }
      return;
    }
    guideRailSelectionKey = items.map((item)=>item.href).sort().join("|");
    guideRailList.innerHTML = items.map((item)=>`
      <a class="guideRailCard" href="${item.href}" role="listitem">
        <span class="guideRailCardBody">
          <span class="guideRailCardTag">${escapeHtml(item.tag)}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.description)}</span>
        </span>
        <span class="guideRailCardArrow" aria-hidden="true">→</span>
      </a>
    `).join("");
    if(guideRailRefreshBtn){
      guideRailRefreshBtn.disabled = GUIDE_RAIL_ITEMS.length < 2;
    }
  }
  function syncRowPriceInputMode(tr){
    if(!tr) return;
    const rowAutoToggle = tr.querySelector(".rowAutoQuoteToggle");
    const manualToggle = tr.querySelector(".rowManualPriceToggle");
    const statusEl = tr.querySelector(".rowPriceStatus");
    if(rowAutoToggle){
      rowAutoToggle.checked = autoQuoteEnabled;
    }
    if(!manualToggle){
      return;
    }
    const wasDisabled = manualToggle.disabled;
    const forceManual = !autoQuoteEnabled;
    manualToggle.disabled = forceManual;
    if(forceManual){
      manualToggle.checked = true;
    }else if(wasDisabled){
      manualToggle.checked = false;
    }
    const manualOn = forceManual || manualToggle.checked;
    tr.classList.toggle("manual-price-on", manualOn);

    if(statusEl){
      statusEl.textContent = manualOn
        ? (autoQuoteEnabled ? "현재가 수동입력 ON · 보유금액 자동 계산" : "현재가를 직접 입력하세요 · 보유금액 자동 계산")
        : "현재가 자동조회 ON · 보유금액 자동 계산";
    }
  }
  function syncAllRowsPriceMode(){
    tbody.querySelectorAll("tr").forEach((tr)=>syncRowPriceInputMode(tr));
  }
  function setCalcButtonDisabled(disabled){
    const nextDisabled = Boolean(disabled);
    if(calcBtn) calcBtn.disabled = nextDisabled;
    if(mobileCalcBtn) mobileCalcBtn.disabled = nextDisabled;
  }
  function updateCalcActionState(sumPct){
    const overLimit = sumPct > 100.0001;
    setCalcButtonDisabled(overLimit);
    if(mobileTargetWarning){
      mobileTargetWarning.hidden = !overLimit;
    }
  }
  function setAutoQuoteEnabled(nextEnabled, { notify = false } = {}){
    autoQuoteEnabled = Boolean(nextEnabled);
    if(autoQuoteToggle){
      autoQuoteToggle.checked = autoQuoteEnabled;
    }
    localStorage.setItem(AUTO_QUOTE_KEY, autoQuoteEnabled ? "1" : "0");
    if(!autoQuoteEnabled){
      clearAllRowQuoteStates();
    }
    if(notify){
      showToast(autoQuoteEnabled ? "현재가 자동조회가 켜졌어요." : "현재가 자동조회가 꺼졌어요.");
    }
    syncAllRowsPriceMode();
    if(autoQuoteEnabled){
      tbody.querySelectorAll("tr").forEach((tr)=>{
        scheduleAutoPriceFetch(tr, { immediate: true });
      });
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
  function clearFetchedPriceFromRow(tr){
    const priceEl = tr.querySelector(".price");
    if(!priceEl) return;
    priceEl.value = "";
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
  function scheduleAutoPriceFetch(tr, { immediate = false, symbolOverride = "" } = {}){
    if(!autoQuoteEnabled) return;
    if(tr && tr.classList.contains("manual-price-on")) return;
    const nameEl = tr.querySelector(".name");
    if(!nameEl) return;
    const aliasMatch = symbolOverride ? null : findKrEtfByAlias(nameEl.value);
    const symbol = symbolOverride || (aliasMatch ? aliasMatch.ticker : resolveYahooSymbol(nameEl.value));
    if(!symbol){
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
        if(aliasMatch && String(result.symbol || "").toUpperCase() !== String(aliasMatch.ticker).toUpperCase()){
          console.warn("Invalid Yahoo symbol in aliasMap:", aliasMatch.ticker, aliasMatch.canonical);
        }
        applyFetchedPriceToRow(tr, result.price);
      }catch(err){
        if(err && (err.name === "AbortError")) return;
        tr.dataset.resolvedSymbol = "";
        clearFetchedPriceFromRow(tr);
        if(aliasMatch){
          console.warn("Invalid Yahoo symbol in aliasMap:", aliasMatch.ticker, aliasMatch.canonical);
        }
      }
    };

    if(immediate){
      runFetch();
      return;
    }
    state.timer = setTimeout(runFetch, PRICE_FETCH_DEBOUNCE_MS);
  }

  function buildPieChartSvg(currentItems, targetItems, afterItems){
    const palette = ["#4e79a7", "#a0cbe8", "#f28e2b", "#ffbe7d", "#b07aa1", "#9c755f", "#bab0ac"];
    const getSeriesColor = (index)=>{
      if(index < palette.length) return palette[index];
      const hue = Math.round((index * 137.508) % 360);
      return `hsl(${hue} 62% 48%)`;
    };
    const normalizeParts = (items)=>items
      .map((item)=>({ ...item, value: Math.max(0, Number(item.value) || 0) }))
      .filter((item)=>item.value > 0);
    const compressParts = (items, limit = 6)=>{
      const sorted = [...normalizeParts(items)].sort((a, b)=>b.value - a.value);
      if(sorted.length <= limit){
        return sorted;
      }
      const keepCount = Math.max(1, limit - 1);
      const kept = sorted.slice(0, keepCount);
      const othersValue = sorted.slice(keepCount).reduce((sum, item)=>sum + item.value, 0);
      if(othersValue > 0){
        kept.push({ name: "Others", value: othersValue });
      }
      return kept;
    };
    const currentParts = compressParts(currentItems, 6);
    const targetParts = compressParts(targetItems, 6);
    const afterParts = compressParts(afterItems, 6);
    if(afterParts.length === 0){
      return `<div class="chart-empty">표시할 비중 데이터가 없습니다.</div>`;
    }
    const orderedNames = [];
    [...afterParts, ...currentParts, ...targetParts].forEach((part)=>{
      if(!orderedNames.includes(part.name)){
        orderedNames.push(part.name);
      }
    });
    const colorByName = new Map();
    orderedNames.forEach((name, idx)=>{
      colorByName.set(name, getSeriesColor(idx));
    });
    const toValueMap = (parts)=>{
      const m = new Map();
      parts.forEach((p)=>m.set(p.name, p.value));
      return m;
    };
    const currentMap = toValueMap(currentParts);
    const targetMap = toValueMap(targetParts);
    const afterMap = toValueMap(afterParts);
    const buildStackBar = (title, valueMap)=>{
      const segments = orderedNames.map((name)=>{
        const value = Number(valueMap.get(name) || 0);
        if(value <= 0) return "";
        return `<span class="alloc-seg" style="width:${value.toFixed(2)}%;background:${colorByName.get(name)}" title="${escapeHtml(name)} ${value.toFixed(1)}%"></span>`;
      }).join("");
      return `
        <div class="pie-card">
          <p class="pie-card-title">${title}</p>
          <div class="alloc-bar-track">${segments}</div>
          <p class="alloc-bar-total">100%</p>
        </div>
      `;
    };
    const targetGapRows = orderedNames
      .map((name)=>({
        name,
        gap: (Number(afterMap.get(name) || 0) - Number(targetMap.get(name) || 0))
      }))
      .sort((a, b)=>Math.abs(b.gap) - Math.abs(a.gap))
      .slice(0, 5);
    const maxAbsGap = targetGapRows.reduce((max, row)=>Math.max(max, Math.abs(row.gap)), 0) || 1;
    const legendHtml = orderedNames.map((name)=>{
      const value = Number(afterMap.get(name) || 0);
      const color = colorByName.get(name);
      return `<li><span class="dot" style="background:${color}"></span><span class="name">${escapeHtml(name)}</span><span class="pct">${escapeHtml(value.toFixed(1))}%</span></li>`;
    }).join("");
    const targetGapHtml = targetGapRows.length === 0
      ? `<li class="gap-empty">유의미한 비중 차이가 없습니다.</li>`
      : targetGapRows.map((row)=>{
        const dirClass = row.gap >= 0 ? "up" : "down";
        const width = Math.max(4, (Math.abs(row.gap) / maxAbsGap) * 100);
        const sign = row.gap > 0 ? "+" : "";
        return `
          <li>
            <span class="gap-name">${escapeHtml(row.name)}</span>
            <span class="gap-val ${dirClass}">${sign}${escapeHtml(row.gap.toFixed(1))}%p</span>
            <span class="gap-track"><span class="gap-bar ${dirClass}" style="width:${width.toFixed(1)}%"></span></span>
          </li>
        `;
      }).join("");

    return `
      <div class="chart-block keep-together">
        <div class="pie-compare-wrap">
        ${buildStackBar("현재 비중", currentMap)}
        ${buildStackBar("목표 비중", targetMap)}
        ${buildStackBar("리밸런싱 후 비중", afterMap)}
        </div>
        <div class="pie-wrap">
          <div class="pie-legend-box">
            <p class="pie-legend-title">자산별 비중 비교</p>
            <ul class="pie-legend">${legendHtml}</ul>
          </div>
          <div class="target-gap-box">
            <p class="pie-legend-title">목표 대비 차이(리밸런싱 후)</p>
            <ul class="target-gap-list">${targetGapHtml}</ul>
          </div>
        </div>
      </div>
    `;
  }
  function updateExportPdfButtonState(){
    if(!exportPdfBtn) return;
    exportPdfBtn.disabled = !(hasComputed && mode === "result" && !isDirtyAfterCalc);
  }
  function printReportViaIframe(html){
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    const cleanup = ()=>{
      setTimeout(()=>{
        iframe.remove();
        updateExportPdfButtonState();
      }, 300);
    };
    const triggerPrint = ()=>{
      try{
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }catch(_error){
        cleanup();
        showToast("인쇄 창을 열지 못했습니다.");
        return;
      }
      setTimeout(cleanup, 1500);
    };
    iframe.addEventListener("load", ()=>{
      const win = iframe.contentWindow;
      if(!win){
        cleanup();
        showToast("인쇄 창을 열지 못했습니다.");
        return;
      }
      win.addEventListener("afterprint", cleanup, { once: true });
      setTimeout(triggerPrint, 180);
    }, { once: true });
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if(!doc){
      iframe.remove();
      showToast("인쇄 창을 열지 못했습니다.");
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();
  }
  function exportResultReportPdf(){
    if(!hasComputed){
      showToast("먼저 계산을 실행해 결과를 만들어주세요.");
      return;
    }
    if(mode !== "result"){
      showToast("결과 보기 상태에서 인쇄용 보고서를 열 수 있어요.");
      return;
    }
    if(isDirtyAfterCalc){
      showToast("입력이 변경되었습니다. 다시 계산 후 인쇄용 보고서를 여세요.");
      return;
    }

    const rows = [...tbody.querySelectorAll("tr")].map((tr)=>{
      const name = String(tr.querySelector(".name")?.value || "").trim() || "이름 미입력";
      const currentQtyValue = Math.max(0, Math.round(parseNumberFromText(tr.querySelector(".qty")?.value || "0")));
      const currentPriceValue = Math.max(0, Math.round(parseNumberFromText(tr.querySelector(".price")?.value || "0")));
      const targetValue = Math.max(0, parseNumberFromText(tr.querySelector(".target")?.value || "0"));
      const currentWeightText = tr.querySelector(".w")?.textContent?.trim() || "0.0%";
      const currentWeightValue = parseNumberFromText(currentWeightText);
      const decision = getDecisionText(tr);
      const tradeQtyValue = Math.round(parseNumberFromText(tr.querySelector(".tradeNum")?.textContent || "0"));
      const expectedTradeAmount = Math.abs(tradeQtyValue) * currentPriceValue;
      const afterWeightText = tr.querySelector(".afterW")?.textContent?.trim() || "0.0%";
      const afterWeightValue = parseNumberFromText(afterWeightText);
      const diffValue = targetValue - currentWeightValue;
      const afterValueText = tr.querySelector(".afterVal")?.textContent?.trim() || "₩ 0";
      const afterValueValue = parseNumberFromText(afterValueText);
      return {
        name,
        targetText: `${targetValue.toFixed(1)}%`,
        targetValue,
        currentQtyValue,
        currentPriceValue,
        currentQtyText: `${fmt(currentQtyValue)}주`,
        currentPriceText: fmtKRW(currentPriceValue),
        currentValueText: tr.querySelector(".val")?.textContent?.trim() || "₩ 0",
        currentWeightText,
        currentWeightValue,
        diffValue,
        decision,
        tradeQtyValue,
        tradeQtyText: tr.querySelector(".tradeNum")?.textContent?.trim() || "0주",
        expectedTradeAmount,
        afterQtyText: tr.querySelector(".afterQty")?.textContent?.trim() || "0주",
        afterValueText,
        afterValueValue,
        afterWeightText,
        afterWeightValue
      };
    });

    const nowText = formatReportDate(new Date());
    const sumValueText = document.querySelector("#sumValue")?.textContent?.trim() || "₩ 0";
    const sumAfterValueText = document.querySelector("#sumAfterValue")?.textContent?.trim() || "₩ 0";
    const cashResidual = Math.max(0, Math.round(parseNumberFromText(sumValueText) - parseNumberFromText(sumAfterValueText)));
    const portfolioName = requestPortfolioName();
    if(portfolioName === null){
      showToast("보고서 생성을 취소했어요.");
      return;
    }

    const buyPlans = rows.filter((row)=>row.decision === "매수" && row.tradeQtyValue !== 0);
    const sellPlans = rows.filter((row)=>row.decision === "매도" && row.tradeQtyValue !== 0);
    const buyCount = buyPlans.length;
    const sellCount = sellPlans.length;
    const holdCount = rows.filter((row)=>row.decision === "유지").length;
    const adjustedCount = rows.filter((row)=>row.tradeQtyValue !== 0).length;
    const totalBuyAmount = buyPlans.reduce((sum, row)=>sum + row.expectedTradeAmount, 0);
    const totalSellAmount = sellPlans.reduce((sum, row)=>sum + row.expectedTradeAmount, 0);
    const totalAssetValue = parseNumberFromText(sumValueText);
    const totalAfterValue = parseNumberFromText(sumAfterValueText);
    const sortedByAbsDiff = [...rows].sort((a, b)=>Math.abs(b.diffValue) - Math.abs(a.diffValue));
    const sortedByAfterWeight = [...rows].sort((a, b)=>b.afterWeightValue - a.afterWeightValue);
    const topDiff = sortedByAbsDiff[0];
    const maxWeightRow = sortedByAfterWeight[0];
    const top3Concentration = sortedByAfterWeight.slice(0, 3).reduce((sum, row)=>sum + row.afterWeightValue, 0);
    const reportId = `RB-${String(Date.now()).slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;
    const afterAvgDiff = rows.length > 0
      ? rows.reduce((sum, row)=>sum + Math.abs(row.targetValue - row.afterWeightValue), 0) / rows.length
      : 0;
    const turnoverPct = totalAssetValue > 0 ? ((totalBuyAmount + totalSellAmount) / totalAssetValue) * 100 : 0;
    const currentAvgDrift = rows.length > 0
      ? rows.reduce((sum, row)=>sum + Math.abs(row.diffValue), 0) / rows.length
      : 0;
    const currentMaxDrift = topDiff ? Math.abs(topDiff.diffValue) : 0;
    const driftRowsHtml = sortedByAbsDiff.map((row)=>{
      const isBuy = row.diffValue >= 0;
      const dirClass = isBuy ? "pos" : "neg";
      const dirText = isBuy ? "매수" : "매도";
      return `
      <tr>
        <td class="left">${escapeHtml(row.name)}</td>
        <td class="num">${escapeHtml(row.currentWeightText)}</td>
        <td class="num">${escapeHtml(row.targetText)}</td>
        <td class="num diff ${dirClass}"><span class="dir-tag ${dirClass}">${dirText}</span>${isBuy ? "▲ " : "▼ "}${escapeHtml(Math.abs(row.diffValue).toFixed(1))}%p</td>
      </tr>
    `;
    }).join("");
    const tradeRowsByAmount = [...rows]
      .filter((row)=>row.tradeQtyValue !== 0)
      .sort((a, b)=>b.expectedTradeAmount - a.expectedTradeAmount);
    const totalTradeAmount = totalBuyAmount + totalSellAmount;
    const top3TradeAmount = tradeRowsByAmount.slice(0, 3).reduce((sum, row)=>sum + row.expectedTradeAmount, 0);
    const top3TradeConcentration = totalTradeAmount > 0 ? (top3TradeAmount / totalTradeAmount) * 100 : 0;
    const largestTradeRow = tradeRowsByAmount[0];
    const largestTradeDisplay = String(largestTradeRow?.name || "-").trim() || "-";
    const liquidityRows = tradeRowsByAmount
      .map((row)=>{
        const currentValueValue = parseNumberFromText(row.currentValueText);
        const ratio = currentValueValue > 0 ? (row.expectedTradeAmount / currentValueValue) * 100 : 0;
        return { ...row, liquidityRatio: ratio };
      })
      .sort((a, b)=>b.liquidityRatio - a.liquidityRatio);
    const maxLiquidityRow = liquidityRows[0];
    const highLiquidityCount = liquidityRows.filter((row)=>row.liquidityRatio >= 25).length;
    const liquidityRowsHtml = liquidityRows.map((row)=>`
      <tr>
        <td class="left">${escapeHtml(row.name)}</td>
        <td class="num">${escapeHtml(fmtKRW(row.expectedTradeAmount))}</td>
        <td class="num">${escapeHtml(row.liquidityRatio.toFixed(1))}%</td>
      </tr>
    `).join("");
    const cashRatio = totalAssetValue > 0 ? (cashResidual / totalAssetValue) * 100 : 0;
    const tradeBurdenPct = totalAssetValue > 0 ? (totalTradeAmount / totalAssetValue) * 100 : 0;
    const cashEfficiencyLabel = cashRatio > 1 ? "비효율(잔여현금 과다)" : cashRatio > 0.5 ? "보통" : "양호";
    const cashRatioText = `${cashRatio.toFixed(2)}%`;
    const concentrationTone = top3Concentration >= 60 ? "높은 편" : top3Concentration >= 45 ? "보통 수준" : "안정적인 편";
    const cashTone = cashEfficiencyLabel === "양호" ? "양호한 수준" : "추가 점검이 필요한 수준";
    const riskSummaryText = `현재 포트폴리오는 상위 3종목 집중도가 ${concentrationTone}이며, 잔여금 효율은 ${cashTone}입니다.`;
    const concentrationHint = top3Concentration >= 70 ? "다소 높은 수준 · 분산 개선 필요" : top3Concentration >= 55 ? "보통 수준 · 편중 모니터링 필요" : "양호한 수준 · 분산 상태 안정적";
    const maxWeightHint = (maxWeightRow?.afterWeightValue || 0) >= 35 ? "단일 종목 비중이 높아 변동성 주의" : "단일 종목 비중이 과도하지 않음";
    const tradeBurdenHint = tradeBurdenPct >= 20 ? "거래 부담 높음" : tradeBurdenPct >= 10 ? "거래 부담 보통" : "거래 부담 낮음";
    const driftImprovement = Math.max(0, currentAvgDrift - afterAvgDiff);
    const driftImprovePct = currentAvgDrift > 0 ? (driftImprovement / currentAvgDrift) * 100 : 0;
    const clampScore = (value)=>Math.max(35, Math.min(100, Math.round(value)));
    const diversificationScore = clampScore(92 - Math.max(0, top3Concentration - 55) * 0.9 - Math.max(0, (maxWeightRow?.afterWeightValue || 0) - 30) * 1.1);
    const driftStabilityScore = clampScore(94 - currentAvgDrift * 4.2 - currentMaxDrift * 1.8);
    const tradeEfficiencyScore = clampScore(93 - turnoverPct * 0.45 - cashRatio * 5.5 - Math.max(0, top3TradeConcentration - 70) * 0.25);
    const portfolioTotalScore = clampScore((diversificationScore + driftStabilityScore + tradeEfficiencyScore) / 3);
    const scoreStatusLabel = (score)=>{
      if(score >= 85) return "양호";
      if(score >= 70) return "보통";
      return "개선 필요";
    };
    const diversificationLabel = scoreStatusLabel(diversificationScore);
    const driftLabel = scoreStatusLabel(driftStabilityScore);
    const tradeLabel = scoreStatusLabel(tradeEfficiencyScore);
    const totalLabel = scoreStatusLabel(portfolioTotalScore);
    const diversificationReason = `상위 3종목 비중 ${top3Concentration.toFixed(1)}%, 최대 단일 비중 ${(maxWeightRow?.afterWeightValue || 0).toFixed(1)}% 반영`;
    const driftReason = `목표 대비 평균 오차 ${currentAvgDrift.toFixed(1)}%p → ${afterAvgDiff.toFixed(1)}%p 개선`;
    const tradeReason = `총 거래금액 비중 ${tradeBurdenPct.toFixed(1)}%, 잔여현금 비중 ${cashRatio.toFixed(2)}% 반영`;

    const currentBucketTotals = rows.reduce((acc, row)=>{
      const key = classifyAssetBucket(row.name);
      acc[key] = (acc[key] || 0) + parseNumberFromText(row.currentValueText);
      return acc;
    }, {});

    const bucketTotals = rows.reduce((acc, row)=>{
      const key = classifyAssetBucket(row.name);
      acc[key] = (acc[key] || 0) + row.afterValueValue;
      return acc;
    }, {});
    const bucketRowsHtml = Object.entries(bucketTotals)
      .sort((a, b)=>b[1] - a[1])
      .map(([bucket, value])=>{
        const pct = totalAfterValue > 0 ? (value / totalAfterValue) * 100 : 0;
        return `<tr><td class="left">${escapeHtml(bucket)}</td><td class="num">${escapeHtml(fmtKRW(value))}</td><td class="num">${escapeHtml(pct.toFixed(1))}%</td></tr>`;
      }).join("");
    const bucketPalette = ["#2563eb", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b"];
    const bucketSegments = Object.entries(bucketTotals)
      .sort((a, b)=>b[1] - a[1])
      .map(([bucket, value], index)=>{
        const pct = totalAfterValue > 0 ? (value / totalAfterValue) * 100 : 0;
        const width = Math.min(100, Math.max(0, pct));
        const color = bucketPalette[index % bucketPalette.length];
        return { bucket, pct, width, color };
      });
    const bucketBarHtml = `
      <div class="bucket-stack-track">
        ${bucketSegments.map((segment)=>`<span class="bucket-stack-segment" style="width:${segment.width.toFixed(1)}%;background:${segment.color};" title="${escapeHtml(segment.bucket)} ${segment.pct.toFixed(1)}%"></span>`).join("")}
      </div>
      <ul class="bucket-stack-legend">
        ${bucketSegments.map((segment)=>`<li><span class="dot" style="background:${segment.color};"></span><span class="name">${escapeHtml(segment.bucket)}</span><span class="pct">${segment.pct.toFixed(1)}%</span></li>`).join("")}
      </ul>
    `;
    const currentStockPct = totalAssetValue > 0 ? ((currentBucketTotals["주식"] || 0) / totalAssetValue) * 100 : 0;
    const currentBondPct = totalAssetValue > 0 ? ((currentBucketTotals["채권"] || 0) / totalAssetValue) * 100 : 0;
    const currentGoldPct = totalAssetValue > 0 ? ((currentBucketTotals["금/원자재"] || 0) / totalAssetValue) * 100 : 0;
    const afterStockPct = totalAfterValue > 0 ? ((bucketTotals["주식"] || 0) / totalAfterValue) * 100 : 0;
    const afterBondPct = totalAfterValue > 0 ? ((bucketTotals["채권"] || 0) / totalAfterValue) * 100 : 0;
    const afterGoldPct = totalAfterValue > 0 ? ((bucketTotals["금/원자재"] || 0) / totalAfterValue) * 100 : 0;
    const stockShift = afterStockPct - currentStockPct;
    const bondShift = afterBondPct - currentBondPct;
    const goldShift = afterGoldPct - currentGoldPct;
    const driftRecoveryPct = currentAvgDrift > 0
      ? Math.max(0, Math.min(100, (1 - (afterAvgDiff / currentAvgDrift)) * 100))
      : 100;
    const labelByThreshold = (value, goodMax, warnMin)=>{
      if(value >= warnMin) return "주의";
      if(value <= goodMax) return "좋음";
      return "보통";
    };
    const concentrationStatus = labelByThreshold(top3Concentration, 55, 70);
    const maxWeightStatus = labelByThreshold((maxWeightRow?.afterWeightValue || 0), 30, 35);
    const turnoverStatus = labelByThreshold(turnoverPct, 10, 20);
    const cashStatus = cashRatio <= 0.5 ? "좋음" : cashRatio <= 1 ? "보통" : "주의";

    const reasonRows = sortedByAbsDiff.slice(0, 3);
    const reasonRowsHtml = reasonRows.map((row)=>{
      const diff = row.currentWeightValue - row.targetValue;
      const sign = diff >= 0 ? "+" : "-";
      return `<li>${escapeHtml(row.name)} 비중이 목표보다 ${sign}${escapeHtml(Math.abs(diff).toFixed(1))}%p ${diff >= 0 ? "높음" : "낮음"}</li>`;
    }).join("");
    const reasonRiskText = currentStockPct > afterStockPct
      ? "현재 상태는 주식 비중이 상대적으로 높아 변동성이 커질 수 있습니다."
      : "현재 상태는 목표 대비 자산군 편차가 있어 목표 자산배분 이탈 위험이 있습니다.";
    const reasonExplanationHtml = `
      <div class="narrative-box">
        <h3 class="subsection-title">리밸런싱 필요 이유</h3>
        <p class="narrative-text">현재 포트폴리오는 다음과 같은 편차가 발생했습니다.</p>
        <ul class="bullet-list">${reasonRowsHtml || "<li>의미 있는 비중 편차가 없습니다.</li>"}</ul>
        <p class="narrative-text">${reasonRiskText} 따라서 편차가 큰 자산을 조정해 목표 자산배분으로 복귀하도록 설계했습니다.</p>
      </div>
    `;
    const rebalanceChangeHtml = `
      <div class="narrative-box">
        <h3 class="subsection-title">리밸런싱 전후 포트폴리오 변화</h3>
        <table aria-label="전후 비중 변화">
          <thead>
            <tr><th>자산군</th><th class="num">조정 전</th><th class="num">조정 후</th><th class="num">변화</th></tr>
          </thead>
          <tbody>
            <tr><td>주식 비중</td><td class="num">${currentStockPct.toFixed(1)}%</td><td class="num">${afterStockPct.toFixed(1)}%</td><td class="num">${stockShift >= 0 ? "+" : ""}${stockShift.toFixed(1)}%p</td></tr>
            <tr><td>채권 비중</td><td class="num">${currentBondPct.toFixed(1)}%</td><td class="num">${afterBondPct.toFixed(1)}%</td><td class="num">${bondShift >= 0 ? "+" : ""}${bondShift.toFixed(1)}%p</td></tr>
            <tr><td>금 비중</td><td class="num">${currentGoldPct.toFixed(1)}%</td><td class="num">${afterGoldPct.toFixed(1)}%</td><td class="num">${goldShift >= 0 ? "+" : ""}${goldShift.toFixed(1)}%p</td></tr>
          </tbody>
        </table>
        <p class="narrative-text">리밸런싱 후 포트폴리오는 ${stockShift < 0 ? "주식 의존도가 낮아지고 안정 자산 비중이 높아져" : "자산군 편차가 줄어"} 전체 변동성 관리에 유리한 구조로 개선됩니다.</p>
      </div>
    `;
    const executionGuideHtml = `
      <div class="narrative-box">
        <h3 class="subsection-title">실행 가이드</h3>
        <ol class="step-list">
          <li>먼저 매도 주문을 실행합니다.</li>
          <li>매도 체결 후 매수 주문을 실행합니다.</li>
          <li>장중 변동성이 큰 시간대는 피하고 필요하면 2회 이상 나눠서 집행합니다.</li>
        </ol>
      </div>
    `;
    const investorChecklistHtml = `
      <div class="narrative-box">
        <h3 class="subsection-title">투자자 체크 포인트</h3>
        <ul class="bullet-list">
          <li>리밸런싱은 보통 3~6개월 단위 또는 비중 차이 5%p 이상일 때 재점검합니다.</li>
          <li>거래 전 세금, 수수료, 최소 주문 금액을 함께 확인합니다.</li>
          <li>이번 보고서는 수익률 예측이 아니라 자산배분 관리 판단을 돕기 위한 자료입니다.</li>
        </ul>
      </div>
    `;
    const chartInterpretationHtml = `
      <p class="narrative-text chart-interpretation">리밸런싱 후 포트폴리오는 주식 ${afterStockPct.toFixed(1)}%, 채권 ${afterBondPct.toFixed(1)}%, 금 ${afterGoldPct.toFixed(1)}% 구조로 조정되어 보다 균형 잡힌 자산배분 상태에 가까워집니다.</p>
    `;
    const performanceSummaryHtml = `
      <div class="narrative-box">
        <h3 class="subsection-title">리밸런싱 성과 요약</h3>
        <p class="narrative-text">목표 비중 평균 오차: <strong>${currentAvgDrift.toFixed(1)}%p</strong> → <strong>${afterAvgDiff.toFixed(1)}%p</strong></p>
        <p class="narrative-text">포트폴리오는 목표 자산배분에 약 <strong>${driftRecoveryPct.toFixed(0)}%</strong> 수준으로 복귀했습니다.</p>
      </div>
    `;
    const diagnosisCommentHtml = `
      <div class="narrative-box">
        <h3 class="subsection-title">포트폴리오 진단 코멘트</h3>
        <p class="narrative-text">현재 포트폴리오는 ${currentStockPct > afterStockPct ? "주식 비중이 높아 단기 변동성이 확대될 수 있는 구조이며" : "자산군 편차가 누적되어 목표 비중 이탈이 관찰되며"} 리밸런싱을 통해 채권·금 비중을 보완해 안정성이 개선되는 방향으로 조정되었습니다.</p>
      </div>
    `;
    const page1OutcomeHtml = `
      <div class="narrative-box">
        <h3 class="subsection-title">리밸런싱 효과</h3>
        <p class="narrative-text"><strong>목표 비중 오차</strong> ${currentAvgDrift.toFixed(1)}%p → ${afterAvgDiff.toFixed(1)}%p</p>
        <p class="narrative-text"><strong>목표 포트폴리오 복귀</strong> 약 ${driftRecoveryPct.toFixed(0)}%</p>
        <p class="narrative-text">리밸런싱을 통해 포트폴리오는 목표 자산배분에 더 가까운 안정 구조로 복귀합니다.</p>
      </div>
    `;

    const currentTableRowsHtml = rows.map((row)=>{
      const isBuy = row.diffValue >= 0;
      const dirClass = isBuy ? "pos" : "neg";
      const dirText = isBuy ? "매수" : "매도";
      return `
      <tr>
        <td class="left">${escapeHtml(row.name)}</td>
        <td class="num">${escapeHtml(row.currentQtyText)}</td>
        <td class="num">${escapeHtml(row.currentPriceText)}</td>
        <td class="num">${escapeHtml(row.currentValueText)}</td>
        <td class="num">${escapeHtml(row.currentWeightText)}</td>
        <td class="num">${escapeHtml(row.targetText)}</td>
        <td class="num diff ${dirClass}"><span class="dir-tag ${dirClass}">${dirText}</span>${isBuy ? "▲ " : "▼ "}${escapeHtml(Math.abs(row.diffValue).toFixed(1))}%p</td>
      </tr>
    `;
    }).join("");
    const afterTableRowsHtml = rows.map((row)=>`
      <tr>
        <td class="left">${escapeHtml(row.name)}</td>
        <td class="num">${escapeHtml(row.afterQtyText)}</td>
        <td class="num">${escapeHtml(row.afterValueText)}</td>
        <td class="num">${escapeHtml(row.afterWeightText)}</td>
      </tr>
    `).join("");
    const buildPlanSummaryList = (plans, verb, maxItems = 5)=>{
      if(plans.length === 0){
        return `<p class="muted">${verb} 대상 종목이 없습니다.</p>`;
      }
      const sorted = [...plans].sort((a, b)=>b.expectedTradeAmount - a.expectedTradeAmount);
      const visible = sorted.slice(0, maxItems);
      const hiddenCount = Math.max(0, sorted.length - visible.length);
      const itemsHtml = visible.map((row)=>
        `<li><span class="asset">${escapeHtml(row.name)}</span> <span class="qty">${escapeHtml(fmt(Math.abs(row.tradeQtyValue)))}주 ${verb}</span> <span class="amt">${escapeHtml(fmtKRW(row.expectedTradeAmount))}</span></li>`
      ).join("");
      const moreHtml = hiddenCount > 0 ? `<li class="more">외 ${hiddenCount}건</li>` : "";
      return `<ul class="trade-list compact-list ${verb === "매도" ? "sell-list" : "buy-list"}">${itemsHtml}${moreHtml}</ul>`;
    };
    const sellPlanItemsHtml = buildPlanSummaryList(sellPlans, "매도", 5);
    const buyPlanItemsHtml = buildPlanSummaryList(buyPlans, "매수", 5);
    const buyPlansByHighPrice = [...buyPlans].sort((a, b)=>b.currentPriceValue - a.currentPriceValue);
    const executionStepRows = [...sellPlans, ...buyPlansByHighPrice];
    const executionSteps = executionStepRows.map((row, idx)=>{
      const action = row.decision === "매도" ? "매도" : "매수";
      const actionClass = action === "매도" ? "sell" : "buy";
      return `<li><span class="step-label">${idx + 1}</span><span class="step-text"><span class="order-action ${actionClass}">${action}</span> ${escapeHtml(row.name)} ${escapeHtml(fmt(Math.abs(row.tradeQtyValue)))}주</span></li>`;
    }
    ).join("");
    const executionOrderHtml = executionSteps
      ? `<ol class="exec-order step-order">${executionSteps}</ol>`
      : `<p class="muted">실행이 필요한 주문이 없습니다.</p>`;
    const resultSummaryHtml = `
      <ul class="result-summary">
        <li>리밸런싱 결과: 매도 ${sellCount}건, 매수 ${buyCount}건으로 총 ${adjustedCount}개 종목을 조정했습니다.</li>
        <li>리밸런싱 후 목표 비중 평균 오차는 ${afterAvgDiff.toFixed(1)}%p입니다.</li>
        <li>가장 큰 조정 필요 종목은 ${escapeHtml(topDiff?.name || "-")}이었습니다.</li>
      </ul>
    `;
    const weightComparisonRowsHtml = sortedByAbsDiff.map((row)=>{
      const diff = row.targetValue - row.currentWeightValue;
      const action = diff > 0 ? "매수" : diff < 0 ? "매도" : "유지";
      const sign = diff > 0 ? "+" : "";
      return `
      <tr>
        <td class="left">${escapeHtml(row.name)}</td>
        <td class="num">${escapeHtml(row.currentWeightText)}</td>
        <td class="num">${escapeHtml(row.targetText)}</td>
        <td class="num">${sign}${escapeHtml(diff.toFixed(1))}%p</td>
        <td>${action}</td>
      </tr>
    `;
    }).join("");
    const largestSell = [...sellPlans].sort((a, b)=>b.expectedTradeAmount - a.expectedTradeAmount)[0];
    const largestBuy = [...buyPlans].sort((a, b)=>b.expectedTradeAmount - a.expectedTradeAmount)[0];
    const strategyHeadline = largestSell && largestBuy
      ? `주식 ETF 비중이 목표 대비 높아 ${escapeHtml(largestSell.name)}를 일부 매도하고 ${escapeHtml(largestBuy.name)}를 매수해 목표 비중으로 복귀하도록 설계했습니다.`
      : largestSell
        ? `목표 대비 초과 비중을 보인 ${escapeHtml(largestSell.name)}를 줄여 전체 비중 편차를 축소하도록 설계했습니다.`
        : largestBuy
          ? `목표 대비 부족 비중이 큰 ${escapeHtml(largestBuy.name)}를 매수해 자산배분을 목표에 맞추도록 설계했습니다.`
          : "이번 리밸런싱은 현재 포트폴리오 비중을 유지하며 목표 대비 편차를 점검하는 방향으로 진행되었습니다.";
    const nextReviewText = currentMaxDrift >= 5
      ? "권장 점검 시점: 1개월 후 또는 비중 편차 5%p 이상 발생 시"
      : "권장 점검 시점: 3개월 후 또는 비중 편차 5%p 이상 발생 시";
    const strategySummaryHtml = `
      <div class="strategy-note">
        <p class="strategy-title">리밸런싱 전략 요약</p>
        <p class="strategy-line">${strategyHeadline}</p>
        <p class="strategy-line">주식 비중 ${currentStockPct.toFixed(1)}% → ${afterStockPct.toFixed(1)}% (${stockShift >= 0 ? "+" : ""}${stockShift.toFixed(1)}%p), 채권 비중 ${currentBondPct.toFixed(1)}% → ${afterBondPct.toFixed(1)}% (${bondShift >= 0 ? "+" : ""}${bondShift.toFixed(1)}%p)</p>
        <p class="strategy-line">${nextReviewText}</p>
      </div>
    `;
    const targetGapRows = [...rows]
      .map((row)=>({ name: row.name, gap: row.afterWeightValue - row.targetValue }))
      .sort((a, b)=>Math.abs(b.gap) - Math.abs(a.gap))
      .slice(0, 5);
    const targetGapSummaryHtml = `
      <div class="narrative-box">
        <h3 class="subsection-title">목표 대비 차이 (상위)</h3>
        <ul class="bullet-list">
          ${targetGapRows.length > 0
            ? targetGapRows.map((row)=>{
              const sign = row.gap > 0 ? "+" : "";
              return `<li>${escapeHtml(row.name)} ${sign}${escapeHtml(row.gap.toFixed(1))}%p</li>`;
            }).join("")
            : "<li>유의미한 차이가 없습니다.</li>"}
        </ul>
      </div>
    `;
    const pieChartHtml = buildPieChartSvg(
      rows.map((row)=>({ name: row.name, value: row.currentWeightValue })),
      rows.map((row)=>({ name: row.name, value: row.targetValue })),
      rows.map((row)=>({ name: row.name, value: row.afterWeightValue }))
    );
    const effectSummaryHtml = `
      <div class="effect-card">
        <div class="effect-grid">
          <div class="effect-box">
            <p class="k">조정 전 평균 오차</p>
            <p class="v before">${currentAvgDrift.toFixed(1)}%p</p>
          </div>
          <div class="effect-box">
            <p class="k">조정 후 평균 오차</p>
            <p class="v after">${afterAvgDiff.toFixed(1)}%p</p>
          </div>
          <div class="effect-box">
            <p class="k">개선 폭</p>
            <p class="v gain">${driftImprovement.toFixed(1)}%p (${driftImprovePct.toFixed(0)}%)</p>
          </div>
        </div>
        <p class="effect-note">목표 자산배분 복귀 수준: ${afterAvgDiff <= 0.5 ? "매우 양호" : afterAvgDiff <= 1.5 ? "양호" : "추가 조정 권장"}</p>
      </div>
    `;
    const actionHeadlineText = adjustedCount > 0
      ? `${adjustedCount}개 종목 조정으로 목표 비중에 복귀합니다.`
      : "추가 주문 없이 현재 비중을 유지해도 됩니다.";
    const actionLeadText = adjustedCount > 0
      ? `핵심은 ${sellCount > 0 ? `매도 ${sellCount}건` : "매도 없음"}${buyCount > 0 ? ` 후 매수 ${buyCount}건` : ""} 순서로 실행해 비중 편차를 줄이는 것입니다.`
      : "현재 포트폴리오는 목표 비중과 큰 차이가 없어 다음 점검 시점까지 유지 전략이 가능합니다.";
    const summaryStatCardsHtml = `
      <div class="stat-grid" aria-label="핵심 수치">
        <div class="stat-card">
          <p class="stat-label">총 포트폴리오</p>
          <p class="stat-value">${escapeHtml(sumValueText)}</p>
          <p class="stat-meta">기준 평가금액</p>
        </div>
        <div class="stat-card sell">
          <p class="stat-label">총 매도 예정</p>
          <p class="stat-value">${escapeHtml(fmtKRW(totalSellAmount))}</p>
          <p class="stat-meta">${sellCount}건</p>
        </div>
        <div class="stat-card buy">
          <p class="stat-label">총 매수 예정</p>
          <p class="stat-value">${escapeHtml(fmtKRW(totalBuyAmount))}</p>
          <p class="stat-meta">${buyCount}건</p>
        </div>
        <div class="stat-card neutral">
          <p class="stat-label">리밸런싱 후 현금</p>
          <p class="stat-value">${escapeHtml(fmtKRW(cashResidual))}</p>
          <p class="stat-meta">비중 ${cashRatioText}</p>
        </div>
      </div>
    `;
    const quickSignalItems = [
      largestTradeRow
        ? `가장 큰 주문은 ${escapeHtml(largestTradeDisplay)} ${escapeHtml(fmtKRW(largestTradeRow.expectedTradeAmount))} 규모입니다.`
        : "실행이 필요한 주문이 없습니다.",
      `목표 대비 평균 오차는 ${currentAvgDrift.toFixed(1)}%p에서 ${afterAvgDiff.toFixed(1)}%p로 개선됩니다.`,
      `${nextReviewText}.`
    ];
    const quickSignalHtml = `
      <div class="signal-box">
        <h3 class="subsection-title">우선 확인할 포인트</h3>
        <ul class="signal-list">
          ${quickSignalItems.map((item)=>`<li>${item}</li>`).join("")}
        </ul>
      </div>
    `;
    const actionFocusRowsHtml = tradeRowsByAmount.slice(0, 6).map((row)=>{
      const actionClass = row.decision === "매도" ? "sell" : "buy";
      return `
        <tr>
          <td class="left">${escapeHtml(row.name)}</td>
          <td class="num">${escapeHtml(row.currentWeightText)}</td>
          <td class="num">${escapeHtml(row.targetText)}</td>
          <td class="num">${escapeHtml(row.afterWeightText)}</td>
          <td><span class="order-action ${actionClass}">${row.decision}</span> ${escapeHtml(fmt(Math.abs(row.tradeQtyValue)))}주</td>
        </tr>
      `;
    }).join("");
    const actionFocusTableHtml = actionFocusRowsHtml
      ? `
        <table class="action-table" aria-label="핵심 조정 종목">
          <thead>
            <tr>
              <th>자산</th>
              <th class="num">현재</th>
              <th class="num">목표</th>
              <th class="num">조정 후</th>
              <th>주문</th>
            </tr>
          </thead>
          <tbody>${actionFocusRowsHtml}</tbody>
        </table>
      `
      : `<p class="muted">현재 포트폴리오는 이미 목표 비중에 가까워 별도 조정 종목이 없습니다.</p>`;
    const allocationSummaryHtml = `
      <div class="allocation-card">
        <h3 class="subsection-title">리밸런싱 후 자산군 구성</h3>
        ${bucketSegments.length > 0 ? bucketBarHtml : '<p class="muted">자산군 요약 데이터가 없습니다.</p>'}
        ${bucketRowsHtml
          ? `
            <table class="bucket-table" aria-label="리밸런싱 후 자산군 비중">
              <thead>
                <tr><th>자산군</th><th class="num">금액</th><th class="num">비중</th></tr>
              </thead>
              <tbody>${bucketRowsHtml}</tbody>
            </table>
          `
          : ""}
      </div>
    `;
    const reportClassNames = ["report", "report-container"].join(" ");
    const reportTitleText = `${portfolioName} 리밸런싱 보고서`;

    const reportHtml = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(reportTitleText)}</title>
  <style>
    @page { size: A4 portrait; margin: 8mm 8mm 10mm; }
    :root {
      color-scheme: light;
      --line: #dbe2ea;
      --head: #f4f7fb;
      --text: #0f172a;
      --muted: #475569;
      --primary: #1e3a8a;
      --buy: #15803d;
      --sell: #b91c1c;
      --accent: #0f172a;
    }
    body {
      margin: 0;
      background: #fff;
      color: var(--text);
      font-family: "Pretendard", "SUIT", "Noto Sans KR", Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      html, body {
        width: 100%;
        min-height: auto;
      }
      body {
        margin: 0;
      }
    }
    .report,
    .report-container {
      width: 100%;
      max-width: 720px;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    .report-container { margin: 0 auto; }
    .report-page {
      margin: 0;
      padding: 0;
      break-inside: auto;
      page-break-inside: auto;
    }
    .report-section {
      margin-top: 9px;
      margin-bottom: 9px;
      break-inside: auto;
      page-break-inside: auto;
    }
    .content-card {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 9px 11px;
      background: #fff;
      break-inside: auto;
      page-break-inside: auto;
    }
    .keep-together {
      break-inside: avoid-page;
      page-break-inside: avoid;
    }
    .split-allow {
      break-inside: auto;
      page-break-inside: auto;
    }
    .header {
      border-bottom: 2px solid #1f2937;
      padding-bottom: 10px;
      margin-bottom: 12px;
      break-after: avoid-page;
      page-break-after: avoid;
    }
    .header-main {
      display: grid;
      gap: 8px;
    }
    .title { margin: 0; color: var(--primary); font-size: 22px; }
    .title-sub { margin: 0; color: #64748b; }
    .meta {
      color: #334155;
      display: flex;
      flex-wrap: wrap;
      gap: 6px 10px;
      font-size: 11.5px;
    }
    .meta-item {
      display: inline-flex;
      gap: 4px;
      align-items: baseline;
    }
    .section-title {
      margin: 0 0 9px;
      border-bottom: 1px solid #1f2937;
      padding-bottom: 6px;
      font-size: 15px;
      color: var(--primary);
      line-height: 1.35;
    }
    .section-lead {
      margin: 0 0 10px;
      color: #334155;
      line-height: 1.62;
    }
    .subsection-title {
      margin: 0 0 9px;
      font-size: 13px;
      color: #1f2937;
      line-height: 1.35;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 13px;
      line-height: 1.5;
    }
    thead { display: table-header-group; }
    th, td {
      border: 1px solid var(--line);
      padding: 10px;
      vertical-align: top;
      white-space: normal;
      word-break: keep-all;
      overflow-wrap: break-word;
      height: auto;
      line-height: 1.45;
    }
    th {
      background: var(--head);
      font-weight: 600;
      color: #334155;
      text-align: center;
    }
    td.left { text-align: left; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; }
    th.num { text-align: center; font-variant-numeric: tabular-nums; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    .table-compact {
      font-size: 11.5px;
      line-height: 1.42;
    }
    .table-compact th,
    .table-compact td {
      padding: 7px;
      white-space: normal !important;
      word-break: break-word;
      overflow-wrap: anywhere;
      height: auto;
    }
    .current-table th {
      white-space: nowrap !important;
      background: #f8fafc;
    }
    .after-table th {
      background: #f5f9ff;
    }
    .after-table {
      border-top: 2px solid #c7d7f2;
    }
    .table-compact td.left { overflow-wrap: anywhere; }
    .metrics-table {
      table-layout: auto;
      font-size: 11.5px;
    }
    .metrics-table th,
    .metrics-table td {
      padding: 7px;
    }
    .metrics-table td.metric-name,
    .metrics-table td.metric-desc {
      text-align: left;
    }
    .metrics-table td.metric-value {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .metrics-table td.metric-status { text-align: center; }
    .metrics-table td.metric-desc {
      white-space: normal !important;
      word-break: keep-all;
      overflow-wrap: anywhere;
      color: #475569;
      line-height: 1.46;
    }
    .analysis-compare-table {
      font-size: 11.5px;
      line-height: 1.46;
    }
    .analysis-compare-table th,
    .analysis-compare-table td {
      padding: 7px;
    }
    .action-table {
      table-layout: auto;
      font-size: 11.5px;
    }
    .action-table th,
    .action-table td {
      padding: 7px;
      line-height: 1.42;
    }
    .bucket-table {
      margin-top: 10px;
      table-layout: auto;
      font-size: 11.5px;
    }
    .bucket-table th,
    .bucket-table td {
      padding: 7px;
    }
    .summary td { width: 25%; }
    .summary-label { color: #64748b; font-size: 11px; }
    .summary-value { margin-top: 3px; font-size: 18px; font-weight: 700; }
    .summary-value.sell { color: var(--sell); }
    .summary-value.buy { color: var(--buy); }
    .summary-value.cash { color: var(--accent); }
    .summary-value.count { color: var(--accent); }
    .hero-card {
      background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
      border-color: #cbd8ea;
    }
    .hero-eyebrow {
      margin: 0 0 7px;
      color: #1d4ed8;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .hero-title {
      margin: 0 0 10px;
      font-size: 20px;
      line-height: 1.38;
      color: #0f172a;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 9px;
      margin: 14px 0 12px;
    }
    .stat-card {
      border: 1px solid #d7dfeb;
      border-radius: 10px;
      padding: 11px 10px 10px;
      background: #fff;
    }
    .stat-card.sell {
      background: #fff7f7;
      border-color: #f3c7c7;
    }
    .stat-card.buy {
      background: #f5fbf6;
      border-color: #cce7d2;
    }
    .stat-card.neutral {
      background: #f8fafc;
    }
    .stat-label {
      margin: 0 0 7px;
      color: #64748b;
      font-size: 11px;
      font-weight: 700;
      line-height: 1.35;
    }
    .stat-value {
      margin: 0;
      font-size: 17px;
      font-weight: 800;
      line-height: 1.25;
    }
    .stat-meta {
      margin: 7px 0 0;
      color: #64748b;
      font-size: 10.5px;
      line-height: 1.4;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .panel { padding: 0; min-height: 90px; }
    .panel .subsection-title {
      margin-bottom: 7px;
    }
    .signal-box,
    .allocation-card {
      margin-top: 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #f8fafc;
      padding: 11px 10px 10px;
    }
    .signal-list {
      margin: 0;
      padding-left: 18px;
      color: #334155;
      line-height: 1.62;
    }
    .signal-list li { margin-bottom: 5px; }
    .trade-list, .exec-order, .result-summary {
      margin: 0;
      padding-left: 18px;
      line-height: 1.58;
    }
    .trade-list li, .exec-order li, .result-summary li { margin-bottom: 5px; }
    .trade-list .asset { font-weight: 700; }
    .trade-list.sell-list .qty { color: var(--sell); font-weight: 700; }
    .trade-list.buy-list .qty { color: var(--buy); font-weight: 700; }
    .trade-list.compact-list .more { color: var(--muted); font-style: italic; }
    .exec-heading { margin: 10px 0 6px; font-weight: 700; }
    .strategy-note {
      border: 1px solid var(--line);
      background: #f8fafc;
      padding: 11px 10px 10px;
    }
    .strategy-title { margin: 0 0 7px; font-size: 13px; line-height: 1.35; }
    .strategy-line { margin: 0 0 6px; color: #334155; line-height: 1.58; }
    .strategy-line:last-child { margin-bottom: 0; }
    .report-disclaimer {
      margin-top: 14px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 9px;
      color: #64748b;
      font-size: 10.5px;
      line-height: 1.52;
    }
    .effect-card { margin-top: 12px; }
    .effect-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .effect-box { border-top: 1px solid #d8e2f0; padding: 7px 0 3px; min-height: 80px; }
    .effect-box .k { margin: 0 0 7px; color: #94a3b8; font-size: 11px; font-weight: 700; line-height: 1.35; letter-spacing: 0.01em; }
    .effect-box .v { margin: 0; font-size: 14px; font-weight: 800; line-height: 1.28; }
    .effect-note { margin: 10px 0 0; color: #334155; font-size: 12px; font-weight: 700; line-height: 1.45; }
    .chart-block {
      break-inside: avoid-page;
      page-break-inside: avoid;
    }
    .pie-compare-wrap {
      margin-top: 8px;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      break-inside: avoid-page;
      page-break-inside: avoid;
    }
    .pie-card {
      border: 1px solid var(--line);
      padding: 6px;
      text-align: center;
      break-inside: avoid-page;
      page-break-inside: avoid;
      background: #fff;
    }
    .pie-card-title { margin: 0 0 7px; font-size: 11px; font-weight: 800; color: #0f172a; }
    .pie { width: 100%; max-width: 102px; display: block; margin: 0 auto; }
    .alloc-bar-track {
      display: flex;
      width: 100%;
      height: 16px;
      border-radius: 999px;
      overflow: hidden;
      background: #e5e7eb;
      border: 1px solid #d1d5db;
    }
    .alloc-seg {
      display: block;
      height: 100%;
      min-width: 2px;
    }
    .alloc-bar-total {
      margin: 6px 0 0;
      font-size: 10px;
      color: #64748b;
      font-weight: 700;
      text-align: right;
    }
    .pie-wrap {
      margin-top: 8px;
      border: 1px solid var(--line);
      padding: 8px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      break-inside: avoid-page;
      page-break-inside: avoid;
    }
    .pie-legend-box {
      border: 1px solid var(--line);
      background: #fafcff;
      padding: 8px;
    }
    .pie-legend-title { margin: 0 0 8px; font-size: 11px; color: #64748b; font-weight: 700; }
    .pie-legend {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 4px;
      font-size: 10.5px;
      color: #475569;
    }
    .pie-legend li {
      display: grid;
      grid-template-columns: 10px minmax(0, 1fr) auto;
      gap: 6px;
      align-items: center;
    }
    .pie-legend .dot {
      inline-size: 10px;
      block-size: 10px;
      border-radius: 999px;
      background: #94a3b8;
      display: inline-block;
    }
    .chart-empty { border: 1px dashed #cbd5e1; padding: 10px; color: #64748b; }
    .muted { margin: 0; color: #64748b; }
    .narrative-box { padding: 7px 0; margin-top: 14px; }
    .narrative-text {
      margin: 0 0 10px;
      color: #334155;
      line-height: 1.65;
    }
    .narrative-text:last-child { margin-bottom: 0; }
    .bullet-list, .step-list {
      margin: 2px 0 10px;
      padding-left: 18px;
      color: #334155;
      line-height: 1.62;
    }
    .bullet-list li, .step-list li { margin-bottom: 5px; }
    .chart-interpretation { margin-top: 10px; }
    .step-order {
      list-style: none;
      padding-left: 0;
    }
    .step-order li {
      margin-bottom: 7px;
      border-bottom: 1px solid #eef2f7;
      padding-bottom: 5px;
      display: grid;
      grid-template-columns: 18px minmax(0, 1fr);
      gap: 8px;
      align-items: baseline;
    }
    .step-label { color: #334155; font-weight: 700; }
    .step-text { color: #0f172a; font-weight: 600; }
    .order-action {
      display: inline-block;
      margin-right: 6px;
      padding: 2px 6px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 700;
      border: 1px solid #d1d5db;
      color: #334155;
      background: #fff;
    }
    .order-action.sell { border-color: #fecaca; color: #991b1b; background: #fef2f2; }
    .order-action.buy { border-color: #bbf7d0; color: #166534; background: #f0fdf4; }
    .status-chip {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 10.5px;
      font-weight: 700;
      border: 1px solid #d1d5db;
      color: #334155;
      background: #fff;
    }
    .status-chip.good { border-color: #bfdbfe; color: #1d4ed8; background: #eff6ff; }
    .status-chip.mid { border-color: #fde68a; color: #92400e; background: #fffbeb; }
    .status-chip.warn { border-color: #fed7aa; color: #9a3412; background: #fff7ed; }
    .target-gap-box {
      border: 1px solid var(--line);
      background: #fcfdff;
      padding: 8px;
    }
    .target-gap-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 6px;
      font-size: 10.5px;
    }
    .target-gap-list li {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 6px;
      align-items: center;
    }
    .gap-name {
      min-width: 0;
      color: #334155;
      overflow-wrap: anywhere;
      color: #334155;
      font-weight: 600;
    }
    .gap-val {
      font-variant-numeric: tabular-nums;
      font-weight: 700;
      white-space: nowrap;
    }
    .gap-val.up { color: #2563eb; }
    .gap-val.down { color: #b91c1c; }
    .gap-track {
      grid-column: 1 / -1;
      height: 4px;
      border-radius: 999px;
      background: #e5e7eb;
      overflow: hidden;
    }
    .gap-bar {
      display: block;
      height: 100%;
      border-radius: 999px;
    }
    .gap-bar.up { background: #60a5fa; }
    .gap-bar.down { background: #f87171; }
    .gap-empty { color: #64748b; }
    .bucket-stack-track {
      display: flex;
      width: 100%;
      height: 14px;
      border-radius: 999px;
      overflow: hidden;
      background: #e5e7eb;
      border: 1px solid #d7dee8;
    }
    .bucket-stack-segment {
      display: block;
      height: 100%;
      min-width: 2px;
    }
    .bucket-stack-legend {
      list-style: none;
      margin: 10px 0 0;
      padding: 0;
      display: grid;
      gap: 4px;
      font-size: 11px;
    }
    .bucket-stack-legend li {
      display: grid;
      grid-template-columns: 10px minmax(0, 1fr) auto;
      gap: 6px;
      align-items: center;
    }
    .bucket-stack-legend .dot {
      inline-size: 10px;
      block-size: 10px;
      border-radius: 999px;
      display: inline-block;
    }
  </style>
</head>
  <body>
  <main class="${reportClassNames}">
    <section class="header">
      <div class="header-main">
        <h1 class="title">포트폴리오 리밸런싱 보고서</h1>
        <p class="title-sub">초보 투자자도 바로 실행할 수 있도록 정리한 요약형 리포트</p>
        <div class="meta">
          <span class="meta-item"><strong>포트폴리오</strong><span>${escapeHtml(portfolioName)}</span></span>
          <span class="meta-item"><strong>생성일</strong><span>${escapeHtml(nowText)}</span></span>
          <span class="meta-item"><strong>총 자산</strong><span>${escapeHtml(sumValueText)}</span></span>
        </div>
      </div>
    </section>

    <section class="report-page">
      <section class="report-section content-card keep-together hero-card">
        <p class="hero-eyebrow">핵심 실행</p>
        <h2 class="hero-title">${actionHeadlineText}</h2>
        <p class="section-lead">${actionLeadText}</p>
        ${summaryStatCardsHtml}
        <div class="two-col" aria-label="매수매도 요약">
          <div class="panel">
            <h3 class="subsection-title">매도</h3>
            ${sellPlanItemsHtml}
          </div>
          <div class="panel">
            <h3 class="subsection-title">매수</h3>
            ${buyPlanItemsHtml}
          </div>
        </div>
        ${quickSignalHtml}
      </section>
      <section class="report-section content-card keep-together">
        <h2 class="section-title">핵심 조정 종목</h2>
        <p class="section-lead">거래 금액 기준으로 영향이 큰 종목부터 정리했습니다. 아래 현재 보유 현황과 함께 보면 어떤 종목을 줄이고 늘릴지 바로 파악할 수 있습니다.</p>
        ${actionFocusTableHtml}
      </section>
      <section class="report-section content-card split-allow">
        <h2 class="section-title">현재 포트폴리오 상세</h2>
        <table class="current-table table-compact">
          <colgroup>
            <col style="width:22%">
            <col style="width:10%">
            <col style="width:11%">
            <col style="width:17%">
            <col style="width:9%">
            <col style="width:9%">
            <col style="width:22%">
          </colgroup>
          <thead>
            <tr>
              <th>자산</th>
              <th class="num">수량(주)</th>
              <th class="num">현재가(원)</th>
              <th class="num">보유액(원)</th>
              <th class="num">현재비중</th>
              <th class="num">목표비중</th>
              <th class="num">조정(%p)</th>
            </tr>
          </thead>
          <tbody>${currentTableRowsHtml}</tbody>
        </table>
      </section>
    </section>

    <section class="report-page">
      <section class="report-section content-card">
        <h2 class="section-title">왜 지금 조정하나요</h2>
        <p class="section-lead">현재 비중이 목표에서 얼마나 벗어났는지와, 이번 조정이 어떤 개선 효과를 만드는지 먼저 보여줍니다.</p>
        ${reasonExplanationHtml}
        ${effectSummaryHtml}
      </section>
      <section class="report-section content-card">
        <h2 class="section-title">실행 순서와 확인 포인트</h2>
        <p class="section-lead">실행 순서는 단순하게 유지하고, 남아 있는 편차가 큰 종목은 별도로 체크합니다.</p>
        ${executionOrderHtml}
        ${executionGuideHtml}
        ${targetGapSummaryHtml}
      </section>
    </section>

    <section class="report-page">
      <section class="report-section content-card">
        <h2 class="section-title">핵심 비교와 진단</h2>
        <p class="section-lead">앞에서 본 실행안이 실제로 포트폴리오 구조를 어떻게 바꾸는지 한눈에 비교합니다.</p>
        ${pieChartHtml}
        ${chartInterpretationHtml}
        ${allocationSummaryHtml}
      </section>
      <section class="report-section content-card">
        <h2 class="section-title">포트폴리오 진단</h2>
        <h3 class="subsection-title">핵심 지표</h3>
        <table class="metrics-table" aria-label="핵심 지표">
          <colgroup>
            <col style="width:24%">
            <col style="width:12%">
            <col style="width:12%">
            <col style="width:52%">
          </colgroup>
          <thead>
            <tr>
              <th class="metric-name">지표</th>
              <th class="metric-value">수치</th>
              <th class="metric-status">상태</th>
              <th class="metric-desc">설명</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="metric-name">상위 3개 자산 집중도</td><td class="metric-value">${top3Concentration.toFixed(1)}%</td><td class="metric-status"><span class="status-chip ${concentrationStatus === "좋음" ? "good" : concentrationStatus === "보통" ? "mid" : "warn"}">${concentrationStatus}</span></td><td class="metric-desc">상위 종목 쏠림이 ${top3Concentration >= 70 ? "높은" : top3Concentration >= 55 ? "다소 있는" : "낮은"} 편입니다.</td></tr>
            <tr><td class="metric-name">단일 자산 최대 비중</td><td class="metric-value">${maxWeightRow ? `${maxWeightRow.afterWeightValue.toFixed(1)}%` : "-"}</td><td class="metric-status"><span class="status-chip ${maxWeightStatus === "좋음" ? "good" : maxWeightStatus === "보통" ? "mid" : "warn"}">${maxWeightStatus}</span></td><td class="metric-desc">최대 단일 자산 비중이 ${((maxWeightRow?.afterWeightValue || 0) >= 35) ? "다소 높은" : "무리가 없는"} 수준입니다.</td></tr>
            <tr><td class="metric-name">매매 회전율</td><td class="metric-value">${turnoverPct.toFixed(1)}%</td><td class="metric-status"><span class="status-chip ${turnoverStatus === "좋음" ? "good" : turnoverStatus === "보통" ? "mid" : "warn"}">${turnoverStatus}</span></td><td class="metric-desc">이번 거래 부담은 전체 대비 ${tradeBurdenHint}입니다.</td></tr>
            <tr><td class="metric-name">잔여 현금 효율</td><td class="metric-value">${cashRatioText}</td><td class="metric-status"><span class="status-chip ${cashStatus === "좋음" ? "good" : cashStatus === "보통" ? "mid" : "warn"}">${cashStatus}</span></td><td class="metric-desc">조정 후 현금 비중은 ${escapeHtml(cashEfficiencyLabel)} 수준입니다.</td></tr>
          </tbody>
        </table>
        <h3 class="subsection-title" style="margin-top:12px;">비중 비교</h3>
        <table class="analysis-compare-table" aria-label="비중 비교 테이블">
          <thead>
            <tr>
              <th>자산</th>
              <th class="num">현재</th>
              <th class="num">목표</th>
              <th class="num">차이</th>
              <th>조치</th>
            </tr>
          </thead>
          <tbody>${weightComparisonRowsHtml || `<tr><td class="left">-</td><td class="num">0.0%</td><td class="num">0.0%</td><td class="num">0.0%p</td><td>유지</td></tr>`}</tbody>
        </table>
      </section>
    </section>

    <section class="report-page">
      <section class="report-section content-card split-allow">
        <h2 class="section-title">리밸런싱 후 포트폴리오 상세</h2>
        <table class="after-table table-compact">
          <thead>
            <tr>
              <th>자산명</th>
              <th class="num">최종 보유 수량</th>
              <th class="num">리밸런싱 후 보유액</th>
              <th class="num">리밸런싱 후 비중</th>
            </tr>
          </thead>
          <tbody>${afterTableRowsHtml}</tbody>
        </table>
        ${resultSummaryHtml}
        ${rebalanceChangeHtml}
      </section>
      <section class="report-section content-card">
        <h2 class="section-title">마무리 점검</h2>
        <p class="section-lead">이번 조정의 의도와 다음 점검 시점, 실행 전 체크할 항목을 마지막에 다시 묶어둡니다.</p>
        ${strategySummaryHtml}
        ${investorChecklistHtml}
        <div class="report-disclaimer">
          <div>본 보고서는 거래 수수료·세금·슬리피지 미반영(브로커/상품별 상이).</div>
          <div>주문 수량은 정수 단위 반올림으로 목표 대비 소폭 오차가 남을 수 있음.</div>
          <div>%p는 퍼센트포인트 단위.</div>
        </div>
      </section>
    </section>
  </main>
</body>
</html>`;
    exportPdfBtn && (exportPdfBtn.disabled = true);
    printReportViaIframe(reportHtml);
  }
  function setTotalSummary(keyText, valueText){
    setTotalSummaryHelper(summaryRefs, keyText, valueText);
  }
  function setCashSummary(valueText){
    setCashSummaryHelper(summaryRefs, valueText);
  }
  function resetSummaryKeyLabels(){
    resetSummaryKeyLabelsHelper(summaryRefs);
  }
  function applyResultSummaryKeyLabels(afterHoldings, cashResidual){
    applyResultSummaryKeyLabelsHelper(summaryRefs, afterHoldings, cashResidual, LARGE_AMOUNT_WRAP_THRESHOLD);
  }

  function showToast(message){
    showToastHelper(feedbackRefs, message, feedbackState);
  }

  function scrollToEl(el){
    scrollToElHelper(el);
  }

  function clearInvalidMarks(){
    clearInvalidMarksHelper();
  }

  function hideErrorSummary(){
    hideErrorSummaryHelper(feedbackRefs);
  }

  function showErrorSummary(message){
    showErrorSummaryHelper(feedbackRefs, message, showToast);
  }

  function setDirtyState(next){
    setDirtyStateHelper(uiStateRefs, next, uiState, { updateExportPdfButtonState });
  }

  function markDirtyIfNeeded(){
    markDirtyIfNeededHelper(uiState, { setDirtyState });
  }

  function showEditWarningNearInput(inputEl){
    showEditWarningNearInputHelper(uiStateRefs, inputEl, uiState);
  }

  function switchToCurrentOnEdit(inputEl){
    switchToCurrentOnEditHelper(uiState, inputEl, { setMode, showEditWarningNearInput });
  }

  function warnOnResultFocus(inputEl){
    warnOnResultFocusHelper(uiState, inputEl, { showEditWarningNearInput });
  }

  function focusInvalidField(el){
    focusInvalidFieldHelper(el);
  }

  function setTheme(theme){
    setThemeHelper(theme, THEME_KEY, { themeToggle });
  }

  function resetSummaryCounts(){
    resetSummaryCountsHelper(summaryRefs);
  }

  function setMode(nextMode){
    setModeHelper(modeRefs, nextMode, {
      get mode() {
        return mode;
      },
      set mode(value) {
        mode = value;
      }
    }, {
      fmtKRW,
      hideAllNameSuggestions,
      resetSummaryCounts,
      resetSummaryKeyLabels,
      setCashSummary,
      setDirtyState,
      setRowDetailOpen,
      setTotalSummary,
      updateExportPdfButtonState
    });
  }

  function setRowDetailOpen(tr, open){
    setRowDetailOpenHelper(tr, open);
  }

  function sumTargets(exceptInput=null){
    return sumTargetsHelper(targetRefs, { clampMin0, parseNum }, exceptInput);
  }

  function updateProgress(sumPct){
    updateProgressHelper(targetRefs, sumPct);
  }

  function updateTargetSumUI(){
    updateTargetSumUIHelper(targetRefs, { clampMin0, parseNum }, { updateCalcActionState, updateProgress });
  }

  function attachTargetGuard(targetInput){
    attachTargetGuardHelper(targetInput, { clampMin0, parseNum }, { updateTargetSumUI });
  }

  function rowCount(){
    return rowCountHelper(targetRefs);
  }

  function deleteRow(tr){
    deleteRowHelper({}, tr, {
      get mode() {
        return mode;
      }
    }, {
      clearInvalidMarks,
      clearRowQuoteState,
      hideErrorSummary,
      hideNameSuggestions,
      markDirtyIfNeeded,
      rowCount,
      setMode,
      showToast,
      updateCurrentUI,
      updateTargetSumUI
    });
  }

  function setTradeCell(tr, tradeQty, decision){
    setTradeCellHelper({ fmt }, tr, tradeQty, decision);
  }

  function addRow(){
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="left col-name">
        <div class="nameFieldWrap">
          <input class="name" placeholder="종목명 또는 티커" aria-label="종목명" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false">
          <div class="nameSuggest" hidden role="listbox"></div>
          <div class="rowMetaPanel">
            <div class="rowMetaStatus">
              <span class="rowPriceStatus">현재가를 직접 입력하세요 · 보유금액 자동 계산</span>
            </div>
            <label class="rowManualPriceControl">
              <input class="rowManualPriceToggle" type="checkbox" aria-label="현재가 수동입력">
              <span>현재가 수동입력</span>
            </label>
          </div>
        </div>
      </td>

      <td class="g-input col-price"><input class="g-input price" type="text" inputmode="numeric" autocomplete="off" placeholder="예: 1,234" aria-label="현재가 원"></td>
      <td class="g-input col-qty"><input class="g-input qty" type="text" inputmode="numeric" autocomplete="off" placeholder="예: 123" aria-label="수량 주"></td>
      <td class="g-input col-target">
        <input class="g-input target" type="number" min="0" max="100" step="0.1" inputmode="numeric" placeholder="예: 30%" aria-label="목표비중 퍼센트">
      </td>

      <td class="g-current col-val val">₩ 0</td>
      <td class="g-current col-w w">0.00%</td>

      <td class="g-result col-decision decision hold">
        <span class="decisionLabel"><span class="decisionIcon" aria-hidden="true">−</span><span class="decisionText">유지</span></span>
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
    const nameEl = tr.querySelector(".name");
    const targetEl = tr.querySelector(".target");
    const priceEl = tr.querySelector(".price");
    const qtyEl = tr.querySelector(".qty");
    const suggestBox = tr.querySelector(".nameSuggest");
    if(suggestBox){
      const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      suggestBox.id = `nameSuggest-${uid}`;
    }

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

    const focusNextFieldInRow = (currentEl)=>{
      const fieldOrder = [nameEl, priceEl, qtyEl, targetEl];
      const currentIndex = fieldOrder.indexOf(currentEl);
      if(currentIndex < 0) return;
      const nextEl = fieldOrder[currentIndex + 1];
      if(!nextEl) return;
      nextEl.focus({ preventScroll: true });
    };

    attachTargetGuard(targetEl);
    tr.querySelector(".delBtn").addEventListener("click", ()=>{
      setActivePreset(null);
      deleteRow(tr);
    });
    tr.querySelector(".detailToggleBtn").addEventListener("click", ()=>{
      const next = !tr.classList.contains("mobile-details-open");
      setRowDetailOpen(tr, next);
    });
    nameEl.addEventListener("focus", ()=>warnOnResultFocus(nameEl));
    nameEl.addEventListener("input", ()=>{
      showNameSuggestions(tr, nameEl.value);
      syncRowDisplayName(tr);
      switchToCurrentOnEdit(nameEl);
      setActivePreset(null);
      if(autoQuoteEnabled) scheduleAutoPriceFetch(tr);
      markDirtyIfNeeded();
    });
    nameEl.addEventListener("focus", ()=>{
      if(nameEl && String(nameEl.value || "").trim()){
        showNameSuggestions(tr, nameEl.value);
      }
    });
    nameEl.addEventListener("blur", ()=>{
      setTimeout(()=>hideNameSuggestions(tr), 120);
      if(autoQuoteEnabled) scheduleAutoPriceFetch(tr, { immediate: true });
    });
    nameEl.addEventListener("keydown", (event)=>{
      if(event.isComposing) return;
      const items = getNameSuggestionItems(tr);
      const isOpen = items.length > 0;
      if(event.key === "ArrowDown" && isOpen){
        event.preventDefault();
        const next = Math.min(getSuggestionActiveIndex(tr) + 1, items.length - 1);
        setSuggestionActiveIndex(tr, next);
        return;
      }
      if(event.key === "ArrowUp" && isOpen){
        event.preventDefault();
        const next = getSuggestionActiveIndex(tr) <= 0 ? items.length - 1 : getSuggestionActiveIndex(tr) - 1;
        setSuggestionActiveIndex(tr, next);
        return;
      }
      if(event.key === "Enter"){
        if(isOpen){
          event.preventDefault();
          const activeIndex = getSuggestionActiveIndex(tr);
          const picked = activeIndex >= 0 ? items[activeIndex] : items[0];
          if(picked){
            applySuggestionSelection(tr, picked);
            return;
          }
        }
        hideNameSuggestions(tr);
        if(autoQuoteEnabled) scheduleAutoPriceFetch(tr, { immediate: true });
        event.preventDefault();
        focusNextFieldInRow(nameEl);
      }
      if(event.key === "Escape"){
        hideNameSuggestions(tr);
      }
    });
    targetEl.addEventListener("focus", ()=>warnOnResultFocus(targetEl));
    targetEl.addEventListener("input", ()=>{
      switchToCurrentOnEdit(targetEl);
      setActivePreset(null);
      targetEl.classList.remove("invalidField");
      if(mode === "current") updateCurrentUI();
      markDirtyIfNeeded();
    });
    const rowAutoToggleEl = tr.querySelector(".rowAutoQuoteToggle");
    const rowManualPriceToggleEl = tr.querySelector(".rowManualPriceToggle");
    [priceEl, qtyEl].forEach(el=>{
      el.addEventListener("focus", ()=>warnOnResultFocus(el));
      el.addEventListener("keydown", (event)=>{
        if(event.key !== "Enter" || event.isComposing) return;
        event.preventDefault();
        focusNextFieldInRow(el);
      });
      el.addEventListener("input", ()=>{
        switchToCurrentOnEdit(el);
        setActivePreset(null);
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
    targetEl.addEventListener("keydown", (event)=>{
      if(event.key !== "Enter" || event.isComposing) return;
      event.preventDefault();
      focusNextFieldInRow(targetEl);
    });

if(rowAutoToggleEl){
  rowAutoToggleEl.addEventListener("change", ()=>{
    setAutoQuoteEnabled(rowAutoToggleEl.checked, { notify: true });
  });
}
if(rowManualPriceToggleEl){
  rowManualPriceToggleEl.addEventListener("change", ()=>{
    syncRowPriceInputMode(tr);
    setActivePreset(null);
    if(autoQuoteEnabled && !rowManualPriceToggleEl.checked){
      scheduleAutoPriceFetch(tr, { immediate: true });
    }
    if(mode === "current") updateCurrentUI();
    markDirtyIfNeeded();
  });
}

updateTargetSumUI();
updateCurrentUI();
setRowDetailOpen(tr, false);
syncRowDisplayName(tr);
syncRowPriceInputMode(tr);

  }

  function updateCurrentUI(){
    updateCurrentUIHelper(rowRefs, { fmtKRW, fmtPct01 }, snapshotRows, { setTotalSummary });
  }

  function syncRowDisplayName(tr){
    syncRowDisplayNameHelper(tr);
  }
  function setMobileDetailHeader(tr, { nameText = "", decision = "유지", tradeText = "" } = {}){
    setMobileDetailHeaderHelper(tr, { decision, nameText, tradeText });
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

  function applyPresetPortfolio(presetKey){
    const preset = PRESET_PORTFOLIOS[presetKey];
    if(!preset) return;
    const { samples, toastMessage } = preset;

    clearAllRowQuoteStates();
    tbody.innerHTML = "";
    samples.forEach(()=>addRow());

    const rows = [...tbody.querySelectorAll("tr")];
    samples.forEach((sample, idx)=>{
      const tr = rows[idx];
      if(!tr) return;
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
      setActivePreset(presetKey);
      showToast(toastMessage || "기본 예시로 계산을 완료했어요.");
    }
  }

  function fillDemoAndRun(){
    applyPresetPortfolio("balanced");
  }

  function renderMobileResultList(trades, cashResidual){
    renderMobileResultListHelper(mobileRefs, { fmt }, trades, cashResidual);
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
    t.tr.classList.add("inactiveRow");
    const d = t.tr.querySelector(".decision");
    const lbl = d.querySelector(".decisionLabel");
    setEmptyDecisionBadge(lbl);
    d.className = "g-result col-decision decision hold";

    const cell = t.tr.querySelector(".tradeQtyCell");
    cell.querySelector(".tradeIcon").textContent = "·";
    cell.querySelector(".tradeNum").textContent = "-";

    t.tr.querySelector(".afterQty").textContent = "-";
      t.tr.querySelector(".afterVal").textContent = "-";
      t.tr.querySelector(".afterW").textContent = "-";
      const inactiveNameCell = t.tr.querySelector(".col-name");
      if(inactiveNameCell){
        inactiveNameCell.setAttribute("data-mobile-header", "-");
        inactiveNameCell.setAttribute("data-mobile-decision", "유지");
      }
      setMobileDetailHeader(t.tr, { nameText: "결과 없음", decision: "유지", tradeText: "-" });
      return; // ⭐ 여기서 끝 → 카운트도 안 되고 계산도 안 됨
  }
      t.tr.classList.remove("inactiveRow");

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
      setDecisionBadge(lbl, decision);
      d.className = "g-result col-decision decision " + (decision === "매도" ? "sell" : decision === "매수" ? "buy" : "hold");

      setTradeCell(t.tr, t.tradeQty, decision);
      const tradeLabel = t.tradeQty === 0
        ? "0주"
        : `${fmt(Math.abs(t.tradeQty))}주`;
      const nameCell = t.tr.querySelector(".col-name");
      const rawName = String(t.tr.querySelector(".name")?.value || "").trim() || "이름 미입력";
      if(nameCell){
        nameCell.setAttribute("data-mobile-header", `${rawName}   [${decision}] ${tradeLabel}`);
        nameCell.setAttribute("data-mobile-decision", decision);
      }
      setMobileDetailHeader(t.tr, { nameText: rawName, decision, tradeText: tradeLabel });

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
    renderMobileResultList(neutral.trades, cashResidual);

    // 기준% 합계
    updateTargetSumUI();
  }

  document.querySelector("#addRow").onclick = ()=>{
    addRow();
    setActivePreset(null);
    markDirtyIfNeeded();
    hideErrorSummary();
    clearInvalidMarks();
  };

  function runCalcAction(){
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
    }else{
      setMode("current");
    }
  }
  function resetAllRows(){
    if(!window.confirm("전체 입력값을 초기화할까요?")){
      return;
    }
    clearAllRowQuoteStates();
    tbody.innerHTML = "";
    for(let i=0;i<getInitialRowCount();i++) addRow();
    setMode("current");
    setTotalSummary("현재 보유액", fmtKRW(0));
    setCashSummary(fmtKRW(0));
    if(mobileTotalAssetLabel){
      mobileTotalAssetLabel.textContent = fmtKRW(0);
    }
    cashPill.classList.remove("negative");
    hasComputed = false;
    setDirtyState(false);
    hideErrorSummary();
    clearInvalidMarks();
    setActivePreset(null);
    updateTargetSumUI();
    updateCurrentUI();
  }
  calcBtn.onclick = runCalcAction;
  if(mobileCalcBtn){
    mobileCalcBtn.addEventListener("click", runCalcAction);
  }
  if(mobileDetailToggle){
    mobileDetailToggle.addEventListener("click", ()=>{
      const nextOpen = !tableCard.classList.contains("mobile-details-open-global");
      tableCard.classList.toggle("mobile-details-open-global", nextOpen);
      mobileDetailToggle.textContent = nextOpen ? "상세 닫기" : "상세 보기";
      mobileDetailToggle.setAttribute("aria-expanded", nextOpen ? "true" : "false");
    });
  }
  if(resetBtn){
    resetBtn.onclick = resetAllRows;
  }
  if(mobileResetBtn){
    mobileResetBtn.addEventListener("click", (event)=>{
      event.preventDefault();
      resetAllRows();
      const details = mobileResetBtn.closest("details");
      if(details) details.open = false;
    });
  }
  if(exportPdfBtn){
    exportPdfBtn.addEventListener("click", exportResultReportPdf);
  }

  // init
  const savedTheme = localStorage.getItem(THEME_KEY);
  const defaultTheme = window.matchMedia("(max-width: 768px)").matches ? "dark" : "light";
  setTheme(savedTheme || defaultTheme);
  setAutoQuoteEnabled(false);
  if(autoQuoteToggle){
    autoQuoteToggle.addEventListener("change", ()=>{
      setAutoQuoteEnabled(autoQuoteToggle.checked, { notify: true });
    });
  }
  document.addEventListener("click", (event)=>{
    if(event.target && event.target.closest && event.target.closest(".nameFieldWrap")){
      return;
    }
    hideAllNameSuggestions();
  });
  if(themeToggle){
    themeToggle.addEventListener("click", ()=>{
      const currentTheme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      setTheme(currentTheme === "dark" ? "light" : "dark");
    });
  }
  if(heroCalcBtn){
    heroCalcBtn.addEventListener("click", ()=>{
      scrollToEl(inputSection);
      const firstInput = tbody.querySelector("tr .name");
      if(firstInput) firstInput.focus({ preventScroll: true });
    });
  }
  if(heroDemoBtn){
    heroDemoBtn.addEventListener("click", fillDemoAndRun);
  }
  if(guideRailRefreshBtn){
    guideRailRefreshBtn.addEventListener("click", ()=>renderGuideRail());
  }

  for(let i=0;i<getInitialRowCount();i++) addRow();
  renderGuideRail();
  setActivePreset(null);
  setMode("current");
  setTotalSummary("현재 보유액", fmtKRW(0));
  setCashSummary(fmtKRW(0));
  setDirtyState(false);
  updateExportPdfButtonState();
  updateTargetSumUI();
  updateCurrentUI();
