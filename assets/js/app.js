  const tbody = document.querySelector("#tbl tbody");
  const tableCard = document.querySelector("#tableCard");
  const calcBtn = document.querySelector("#calcBtn");
  const resetBtn = document.querySelector("#reset");
  const sumTargetEl = document.querySelector("#sumTarget");
  const themeToggle = document.querySelector("#themeToggle");
  const heroCalcBtn = document.querySelector("#heroCalcBtn");
  const heroDemoBtn = document.querySelector("#heroDemoBtn");
  const heroDemoBtnMobile = document.querySelector("#heroDemoBtnMobile");
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

  let mode = "current"; // "current" | "result"
  const THEME_KEY = "rb-theme";
  const AUTO_QUOTE_KEY = "rb-auto-quote-enabled";
  const FIXED_TOLERANCE_PERCENT_POINT = 0.1;
  const FIXED_TOLERANCE_RATIO = FIXED_TOLERANCE_PERCENT_POINT / 100;
  const LARGE_AMOUNT_WRAP_THRESHOLD = 1000000000;
  const YAHOO_PROXY_ENDPOINT = "/api/quote";
  const PRICE_FETCH_DEBOUNCE_MS = 550;
  let hasComputed = false;
  let isDirtyAfterCalc = false;
  let autoQuoteEnabled = true;
  const rowQuoteStates = new Map();
  const KR_ETF_ALIAS_MAP = Object.freeze([
    {
      ticker: "489250.KS",
      canonical: "KODEX 미국배당다우존스",
      aliases: ["미국배당다우존스", "미국배당다우", "미배당다우", "코미당", "미국배당", "453850"]
    },
    {
      ticker: "069500.KS",
      canonical: "KODEX 200",
      aliases: ["코덱스200", "국내200", "코스피200", "069500"]
    },
    {
      ticker: "102110.KS",
      canonical: "TIGER 200",
      aliases: ["타이거200", "호랑이200", "102110"]
    },
    {
      ticker: "133690.KS",
      canonical: "TIGER 미국나스닥100",
      aliases: ["미국나스닥100", "나스닥100", "미국나스닥", "133690"]
    },
    {
      ticker: "360750.KS",
      canonical: "TIGER 미국S&P500",
      aliases: ["미국s&p500", "미국sp500", "미국에스앤피500", "s&p500", "sp500", "360750"]
    },
    {
      ticker: "379800.KS",
      canonical: "KODEX 미국S&P500TR",
      aliases: ["미국s&p500tr", "미국sp500tr", "sp500tr", "379800"]
    },
    {
      ticker: "214980.KS",
      canonical: "KODEX 단기채권PLUS",
      aliases: ["단기채권", "파킹etf", "파킹", "214980"]
    },
    {
      ticker: "148070.KS",
      canonical: "KOSEF 국고채10년",
      aliases: ["국고채10년", "국채10년", "148070"]
    },
    {
      ticker: "273130.KS",
      canonical: "KODEX 종합채권(AA-이상)액티브",
      aliases: ["종합채권", "채권액티브", "273130"]
    },
    {
      ticker: "132030.KS",
      canonical: "KODEX 골드선물(H)",
      aliases: ["골드선물", "금etf", "금선물", "132030"]
    },
    {
      ticker: "114800.KS",
      canonical: "KODEX 인버스",
      aliases: ["인버스", "114800"]
    },
    {
      ticker: "122630.KS",
      canonical: "KODEX 레버리지",
      aliases: ["레버리지", "122630"]
    },
    {
      ticker: "233740.KS",
      canonical: "KODEX 코스닥150레버리지",
      aliases: ["코스닥150레버리지", "코스닥레버리지", "233740"]
    },
    {
      ticker: "229200.KS",
      canonical: "KODEX 코스닥150",
      aliases: ["코스닥150", "229200"]
    },
    {
      ticker: "305720.KS",
      canonical: "KODEX 2차전지산업",
      aliases: ["2차전지", "이차전지", "2차전지산업", "305720"]
    },
    {
      ticker: "305540.KS",
      canonical: "TIGER 2차전지테마",
      aliases: ["2차전지테마", "이차전지테마", "305540"]
    },
    {
      ticker: "381170.KS",
      canonical: "TIGER 미국테크TOP10 INDXX",
      aliases: ["미국테크top10", "미국테크10", "381170"]
    },
    {
      ticker: "379810.KS",
      canonical: "KODEX 미국나스닥100TR",
      aliases: ["미국나스닥100tr", "나스닥100tr", "379810"]
    },
    {
      ticker: "229480.KS",
      canonical: "KODEX 미국S&P500선물(H)",
      aliases: ["미국s&p500선물", "미국sp500선물", "229480"]
    },
    {
      ticker: "091180.KS",
      canonical: "KODEX 자동차",
      aliases: ["자동차", "091180"]
    }
  ]);
  const KR_ETF_ALIAS_INDEX = Object.freeze(
    KR_ETF_ALIAS_MAP.map((entry)=>{
      const keySet = new Set([entry.canonical, entry.ticker, ...(entry.aliases || [])]);
      const keys = [...keySet]
        .map((value)=>normalizeKrEtfAlias(value))
        .filter(Boolean)
        .sort((a, b)=>b.length - a.length);
      return { ticker: entry.ticker, canonical: entry.canonical, keys };
    })
  );
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
  const STOCK_SUGGESTIONS = Object.freeze([
    { name: "삼성전자", symbol: "005930.KS", aliases: ["005930", "삼성"] },
    { name: "SK하이닉스", symbol: "000660.KS", aliases: ["000660", "하이닉스"] },
    { name: "NAVER", symbol: "035420.KS", aliases: ["035420", "네이버"] },
    { name: "카카오", symbol: "035720.KS", aliases: ["035720"] },
    { name: "KODEX 200", symbol: "069500.KS", aliases: ["069500", "kodex200"] },
    { name: "TIGER 200", symbol: "102110.KS", aliases: ["102110", "tiger200"] },
    { name: "KOSEF 국고채10년", symbol: "148070.KS", aliases: ["148070", "국고채10년"] },
    { name: "KODEX 골드선물(H)", symbol: "132030.KS", aliases: ["132030", "kodex골드선물h"] },
    { name: "TIGER 미국S&P500", symbol: "360750.KS", aliases: ["360750", "tiger미국sp500", "미국s&p500"] },
    { name: "KODEX 코스닥150레버리지", symbol: "233740.KS", aliases: ["233740"] },
    { name: "TIGER 코스닥150", symbol: "229200.KS", aliases: ["229200"] },
    { name: "에코프로비엠", symbol: "247540.KQ", aliases: ["247540"] },
    { name: "엘앤에프", symbol: "066970.KQ", aliases: ["066970"] },
    { name: "Apple", symbol: "AAPL", aliases: ["애플"] },
    { name: "Microsoft", symbol: "MSFT", aliases: ["마이크로소프트"] },
    { name: "NVIDIA", symbol: "NVDA", aliases: ["엔비디아"] },
    { name: "Tesla", symbol: "TSLA", aliases: ["테슬라"] }
  ]);

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
  function normalizeKrEtfAlias(value){
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(
        /etf|kodex|tiger|rise|kbstar|arirang|ace|plus|sol|timefolio|코덱스|타이거|라이즈|케이스타|아리랑|에이스|플러스|쏠/g,
        ""
      )
      .replace(/[^0-9a-zA-Z가-힣]/g, "");
  }
  function normalizeSymbol(value){
    return String(value || "").trim().toUpperCase();
  }
  function findKrEtfByAlias(rawInput){
    const normalizedInput = normalizeKrEtfAlias(rawInput);
    if(!normalizedInput) return null;

    for(const etf of KR_ETF_ALIAS_INDEX){
      if(etf.keys.some((alias)=>alias === normalizedInput)){
        return { ticker: etf.ticker, canonical: etf.canonical };
      }
    }

    let bestTicker = "";
    let bestCanonical = "";
    let bestScore = 0;
    for(const etf of KR_ETF_ALIAS_INDEX){
      for(const alias of etf.keys){
        if(alias.length < 3 || normalizedInput.length < 3) continue;
        const matched = normalizedInput.includes(alias) || alias.includes(normalizedInput);
        if(!matched) continue;
        if(alias.length > bestScore){
          bestScore = alias.length;
          bestTicker = etf.ticker;
          bestCanonical = etf.canonical;
        }
      }
    }
    if(!bestTicker) return null;
    return { ticker: bestTicker, canonical: bestCanonical };
  }
  function resolveYahooSymbol(rawInput){
    const input = String(rawInput || "").trim();
    if(!input) return "";

    const symbolLike = normalizeSymbol(input);
    if(/^[A-Z0-9.^=\-]{1,20}$/.test(symbolLike) && symbolLike.includes(".")){
      return symbolLike;
    }

    const etfMatch = findKrEtfByAlias(input);
    if(etfMatch){
      return etfMatch.ticker;
    }

    const aliasKey = normalizeAliasKey(input);
    if(SYMBOL_ALIAS_MAP[aliasKey]){
      return SYMBOL_ALIAS_MAP[aliasKey];
    }
    const fromSuggestion = STOCK_SUGGESTIONS.find((item)=>{
      if(normalizeAliasKey(item.name) === aliasKey) return true;
      return item.aliases.some((alias)=>normalizeAliasKey(alias) === aliasKey);
    });
    if(fromSuggestion){
      return fromSuggestion.symbol;
    }

    if(/^\d{6}$/.test(input)){
      return `${input}.KS`;
    }

    if(/^[A-Za-z][A-Za-z0-9.^=\-]{0,9}$/.test(input)){
      return symbolLike;
    }

    return symbolLike.replace(/\s+/g, "");
  }
  function getSuggestionCandidates(rawQuery){
    const query = normalizeAliasKey(rawQuery);
    if(!query) return [];

    const results = STOCK_SUGGESTIONS.map((item)=>{
      const keys = [
        normalizeAliasKey(item.name),
        normalizeAliasKey(item.symbol),
        ...item.aliases.map(normalizeAliasKey)
      ];
      const starts = keys.some((key)=>key.startsWith(query));
      const contains = keys.some((key)=>key.includes(query));
      if(!starts && !contains) return null;
      return { ...item, starts };
    }).filter(Boolean);

    results.sort((a, b)=>{
      if(a.starts !== b.starts) return a.starts ? -1 : 1;
      return a.name.localeCompare(b.name, "ko");
    });
    return results.slice(0, 8);
  }
  function getNameSuggestBox(tr){
    return tr ? tr.querySelector(".nameSuggest") : null;
  }
  function getNameInput(tr){
    return tr ? tr.querySelector(".name") : null;
  }
  function getNameSuggestionItems(tr){
    const suggestBox = getNameSuggestBox(tr);
    if(!suggestBox) return [];
    return [...suggestBox.querySelectorAll(".nameSuggestItem")];
  }
  function getSuggestionActiveIndex(tr){
    const suggestBox = getNameSuggestBox(tr);
    if(!suggestBox) return -1;
    const n = Number(suggestBox.dataset.activeIndex);
    return Number.isInteger(n) ? n : -1;
  }
  function setSuggestionActiveIndex(tr, nextIndex){
    const suggestBox = getNameSuggestBox(tr);
    const nameEl = getNameInput(tr);
    if(!suggestBox || !nameEl) return;

    const items = getNameSuggestionItems(tr);
    const last = items.length - 1;
    const index = (nextIndex < 0 || nextIndex > last) ? -1 : nextIndex;
    suggestBox.dataset.activeIndex = String(index);

    items.forEach((item, itemIndex)=>{
      const active = itemIndex === index;
      item.setAttribute("aria-selected", active ? "true" : "false");
      item.classList.toggle("isActive", active);
      if(active){
        nameEl.setAttribute("aria-activedescendant", item.id);
        item.scrollIntoView({ block: "nearest" });
      }
    });

    if(index === -1){
      nameEl.removeAttribute("aria-activedescendant");
    }
  }
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
        ? (autoQuoteEnabled ? "현재가 수동입력 ON · 보유금액 자동 계산" : "자동조회 OFF · 현재가 수동입력 필요")
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

  function fmt(n){ return isFinite(n) ? n.toLocaleString("ko-KR") : "0"; }
  function fmtKRW(n){ return "₩ " + fmt(Math.round(n)); }
  function fmtPct01(x){ return isFinite(x) ? (x * 100).toFixed(1) + "%" : "0.0%"; }
  function escapeHtml(value){
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function parseNumberFromText(text){
    const num = Number(String(text ?? "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(num) ? num : 0;
  }
  function requestPortfolioName(){
    const saved = String(localStorage.getItem("rb-portfolio-name") || "My Portfolio").trim() || "My Portfolio";
    const input = window.prompt("포트폴리오 이름을 입력하세요.", saved);
    if(input === null) return null;
    const nextName = String(input).trim() || "My Portfolio";
    localStorage.setItem("rb-portfolio-name", nextName);
    return nextName;
  }
  function formatReportDate(date){
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }
  function classifyAssetBucket(name){
    const n = String(name || "").toLowerCase();
    if(n.includes("채") || n.includes("bond") || n.includes("국고")) return "채권";
    if(n.includes("골드") || n.includes("금") || n.includes("gold")) return "금/원자재";
    if(n.includes("cash") || n.includes("현금")) return "현금";
    if(
      n.includes("주식") ||
      n.includes("stock") ||
      n.includes("equity") ||
      n.includes("나스닥") ||
      n.includes("nasdaq") ||
      n.includes("s&p") ||
      n.includes("sp500") ||
      n.includes("코스피")
    ) return "주식";
    return "기타";
  }
  function buildPieChartSvg(items){
    const palette = ["#1f77b4", "#ef4444", "#22c55e", "#f59e0b", "#1f3a8a", "#6b7280"];
    const parts = items
      .map((item)=>({ ...item, value: Math.max(0, Number(item.value) || 0) }))
      .filter((item)=>item.value > 0);
    const total = parts.reduce((sum, item)=>sum + item.value, 0);
    if(total <= 0){
      return `<div class="chart-empty">표시할 비중 데이터가 없습니다.</div>`;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 360;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");
    if(!ctx){
      return `<div class="chart-empty">차트를 생성할 수 없습니다.</div>`;
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 140;
    const innerRadius = 72;
    let acc = -Math.PI / 2;
    parts.forEach((part, idx)=>{
      const ratio = part.value / total;
      const next = acc + ratio * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, acc, next);
      ctx.closePath();
      ctx.fillStyle = palette[idx % palette.length];
      ctx.fill();
      acc = next;
    });
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.fillStyle = "#64748b";
    ctx.font = "700 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("TOTAL", cx, cy - 9);
    ctx.fillStyle = "#0f172a";
    ctx.font = "800 36px Arial";
    ctx.fillText("100%", cx, cy + 29);
    const chartSrc = canvas.toDataURL("image/png");
    const legends = parts.map((part, idx)=>{
      const color = palette[idx % palette.length];
      return `<li><span class="dot" style="background:${color}"></span><span class="name">${escapeHtml(part.name)}</span><span class="pct">${escapeHtml(part.value.toFixed(1))}%</span></li>`;
    }).join("");

    return `
      <div class="pie-wrap">
        <img class="pie" src="${chartSrc}" alt="리밸런싱 후 비중 차트">
        <ul class="pie-legend">${legends}</ul>
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
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if(!doc){
      iframe.remove();
      showToast("PDF 인쇄 창을 열지 못했습니다.");
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(()=>{
      try{
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }finally{
        setTimeout(()=>iframe.remove(), 800);
      }
    }, 160);
  }
  function exportResultReportPdf(){
    if(!hasComputed){
      showToast("먼저 계산을 실행해 결과를 만들어주세요.");
      return;
    }
    if(mode !== "result"){
      showToast("결과 보기 상태에서 PDF를 출력할 수 있어요.");
      return;
    }
    if(isDirtyAfterCalc){
      showToast("입력이 변경되었습니다. 다시 계산 후 PDF를 출력하세요.");
      return;
    }

    const rows = [...tbody.querySelectorAll("tr")].map((tr)=>{
      const name = String(tr.querySelector(".name")?.value || "").trim() || "이름 미입력";
      const currentQtyValue = Math.max(0, Math.round(parseNumberFromText(tr.querySelector(".qty")?.value || "0")));
      const currentPriceValue = Math.max(0, Math.round(parseNumberFromText(tr.querySelector(".price")?.value || "0")));
      const targetValue = Math.max(0, parseNumberFromText(tr.querySelector(".target")?.value || "0"));
      const currentWeightText = tr.querySelector(".w")?.textContent?.trim() || "0.0%";
      const currentWeightValue = parseNumberFromText(currentWeightText);
      const decision = tr.querySelector(".decisionLabel")?.textContent?.trim() || "유지";
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
      showToast("PDF 생성을 취소했어요.");
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
    const driftRowsHtml = sortedByAbsDiff.map((row)=>`
      <tr>
        <td class="left">${escapeHtml(row.name)}</td>
        <td class="num">${escapeHtml(row.currentWeightText)}</td>
        <td class="num">${escapeHtml(row.targetText)}</td>
        <td class="num">${escapeHtml(Math.abs(row.diffValue).toFixed(1))}%p</td>
      </tr>
    `).join("");
    const tradeRowsByAmount = [...rows]
      .filter((row)=>row.tradeQtyValue !== 0)
      .sort((a, b)=>b.expectedTradeAmount - a.expectedTradeAmount);
    const totalTradeAmount = totalBuyAmount + totalSellAmount;
    const top3TradeAmount = tradeRowsByAmount.slice(0, 3).reduce((sum, row)=>sum + row.expectedTradeAmount, 0);
    const top3TradeConcentration = totalTradeAmount > 0 ? (top3TradeAmount / totalTradeAmount) * 100 : 0;
    const largestTradeRow = tradeRowsByAmount[0];
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
    const cashEfficiencyLabel = cashRatio > 1 ? "비효율(잔여현금 과다)" : cashRatio > 0.5 ? "보통" : "양호";
    const riskSummaryText = `현재안 기준 최대 편차 ${currentMaxDrift.toFixed(1)}%p, 상위 3종목 집중도 ${top3Concentration.toFixed(1)}%입니다. 잔여금 효율은 ${cashEfficiencyLabel} 상태입니다.`;

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

    const currentTableRowsHtml = rows.map((row)=>`
      <tr>
        <td class="left">${escapeHtml(row.name)}</td>
        <td class="num">${escapeHtml(row.currentQtyText)}</td>
        <td class="num">${escapeHtml(row.currentPriceText)}</td>
        <td class="num">${escapeHtml(row.currentValueText)}</td>
        <td class="num">${escapeHtml(row.currentWeightText)}</td>
        <td class="num">${escapeHtml(row.targetText)}</td>
        <td class="num diff ${row.diffValue >= 0 ? "pos" : "neg"}">${row.diffValue >= 0 ? "▲ " : "▼ "}${escapeHtml(Math.abs(row.diffValue).toFixed(1))}%p</td>
      </tr>
    `).join("");
    const afterTableRowsHtml = rows.map((row)=>`
      <tr>
        <td class="left">${escapeHtml(row.name)}</td>
        <td class="num">${escapeHtml(row.afterQtyText)}</td>
        <td class="num">${escapeHtml(row.afterValueText)}</td>
        <td class="num">${escapeHtml(row.afterWeightText)}</td>
      </tr>
    `).join("");
    const sellPlanItemsHtml = sellPlans.length > 0
      ? `<ul class="trade-list">${sellPlans.map((row)=>
        `<li>${escapeHtml(row.name)} ${escapeHtml(fmt(Math.abs(row.tradeQtyValue)))}주 매도 (예상 ${escapeHtml(fmtKRW(row.expectedTradeAmount))})</li>`
      ).join("")}</ul>`
      : `<p class="muted">매도 대상 종목이 없습니다.</p>`;
    const buyPlanItemsHtml = buyPlans.length > 0
      ? `<ul class="trade-list">${buyPlans.map((row)=>
        `<li>${escapeHtml(row.name)} ${escapeHtml(fmt(Math.abs(row.tradeQtyValue)))}주 매수 (예상 ${escapeHtml(fmtKRW(row.expectedTradeAmount))})</li>`
      ).join("")}</ul>`
      : `<p class="muted">매수 대상 종목이 없습니다.</p>`;
    const buyPlansByHighPrice = [...buyPlans].sort((a, b)=>b.currentPriceValue - a.currentPriceValue);
    const executionSteps = [...sellPlans, ...buyPlansByHighPrice].map((row, idx)=>
      `<li><span class="step-num">${idx + 1}.</span><span class="step-text">${escapeHtml(row.name)} ${escapeHtml(fmt(Math.abs(row.tradeQtyValue)))}주 ${escapeHtml(row.decision)}</span></li>`
    ).join("");
    const executionOrderHtml = executionSteps
      ? `<ul class="exec-order">${executionSteps}</ul>`
      : `<p class="muted">실행이 필요한 주문이 없습니다.</p>`;
    const resultSummaryHtml = `
      <ul class="result-summary">
        <li>리밸런싱 결과: 매도 ${sellCount}건, 매수 ${buyCount}건으로 총 ${adjustedCount}개 종목을 조정했습니다.</li>
        <li>리밸런싱 후 목표 비중 평균 오차는 ${afterAvgDiff.toFixed(1)}%p입니다.</li>
        <li>가장 큰 조정 필요 종목: ${escapeHtml(topDiff?.name || "-")} (${topDiff ? `${topDiff.diffValue >= 0 ? "+" : ""}${topDiff.diffValue.toFixed(1)}%p` : "-"})</li>
      </ul>
    `;
    const pieChartHtml = buildPieChartSvg(rows.map((row)=>({ name: row.name, value: row.afterWeightValue })));

    const reportHtml = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>리밸런싱 계산 결과 보고서</title>
  <style>
    @page { size: A4 portrait; margin: 25mm 20mm 38mm 20mm; }
    :root { color-scheme: light; }
    body {
      margin: 0;
      background: #fff;
      color: #111;
      font-family: Arial, "Noto Sans KR", sans-serif;
      font-size: 13px;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    :root {
      --primary: #1f3a8a;
      --buy: #2563eb;
      --sell: #dc2626;
      --neutral: #6b7280;
      --table-head: #f3f4f6;
    }
    .report { width: 100%; padding: 0; }
    .header {
      border-left: 6px solid var(--primary);
      border-bottom: 2px solid #111;
      padding-left: 10px;
      padding-bottom: 10px;
      margin-bottom: 16px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
    }
    .header-main{
      flex: 1 1 auto;
      min-width: 0;
    }
    .header-meta{
      flex: 0 0 auto;
      border: 1px solid #d1d5db;
      background: #f9fafb;
      border-radius: 10px;
      padding: 7px 9px;
      font-size: 11px;
      color: #4b5563;
      line-height: 1.45;
      min-width: 148px;
      text-align: right;
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 6px;
      line-height: 1.3;
      color: var(--primary);
    }
    .brand-sub {
      margin: 0 0 6px;
      font-size: 13px;
      color: var(--neutral);
      font-weight: 700;
      letter-spacing: .02em;
    }
    .meta { font-size: 13px; color: #444; }
    .meta div { margin-bottom: 2px; }
    .summary {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .summary td {
      width: 25%;
      border: 1px solid #ddd;
      padding: 12px 10px;
      vertical-align: top;
      background: #f8fafc;
      border-top: 4px solid #d1d5db;
    }
    .summary td.sell { border-top-color: var(--sell); }
    .summary td.buy { border-top-color: var(--buy); }
    .summary td.primary { border-top-color: var(--primary); }
    .summary td.neutral { border-top-color: var(--neutral); }
    .summary-label { font-size: 12px; color: #666; margin-bottom: 6px; }
    .summary-value { font-size: 22px; font-weight: 800; color: var(--primary); line-height: 1.15; }
    .summary-value.sell { color: var(--sell); }
    .summary-value.buy { color: var(--buy); }
    .section { margin-bottom: 18px; }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 8px;
      padding-bottom: 5px;
      border-bottom: 1px solid #222;
      color: #111827;
    }
    .section + .section { padding-top: 4px; }
    .subsection-title{
      margin: 0 0 6px;
      font-size: 13px;
      color: #374151;
      font-weight: 700;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 6px 5px;
      text-align: center;
      word-break: keep-all;
      overflow-wrap: anywhere;
      vertical-align: middle;
    }
    th { background: var(--table-head); font-weight: 700; }
    td.left { text-align: left; }
    th.left { text-align: center; }
    .risk-card table td.left{
      white-space: normal;
      word-break: keep-all;
      overflow-wrap: normal;
      line-break: auto;
    }
    .current-table thead th { text-align: center; }
    .current-table tbody td.left { text-align: left; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; }
    th.num { text-align: center; }
    td.diff.pos { color: var(--buy); font-weight: 700; }
    td.diff.neg { color: var(--sell); font-weight: 700; }
    td.diff { white-space: nowrap; font-size: 11px; }
    tbody tr { break-inside: avoid; page-break-inside: avoid; }
    thead { display: table-header-group; }
    .trade-box-wrap {
      width: 100%;
      border-collapse: separate;
      border-spacing: 8px 0;
      margin-left: -8px;
      margin-right: -8px;
    }
    .trade-box-wrap td {
      width: 50%;
      border: 1px solid #ddd;
      padding: 10px;
      vertical-align: top;
      text-align: left;
    }
    .trade-box-wrap td.sell-box { background: #fef2f2; }
    .trade-box-wrap td.buy-box { background: #eff6ff; }
    .trade-title { font-size: 15px; font-weight: 700; margin: 0 0 8px; }
    .trade-title.sell { color: var(--sell); }
    .trade-title.buy { color: var(--buy); }
    .trade-list { margin: 0; padding-left: 16px; }
    .trade-list li { margin-bottom: 6px; }
    .exec-heading {
      margin: 10px 0 6px;
      font-size: 13px;
      font-weight: 700;
    }
    .exec-order {
      margin: 0;
      padding-left: 0;
      font-size: 12.5px;
      list-style: none;
    }
    .exec-order li {
      margin-bottom: 4px;
      line-height: 1.45;
      display: grid;
      grid-template-columns: 24px 1fr;
      align-items: start;
      column-gap: 4px;
    }
    .exec-order .step-num{
      font-variant-numeric: tabular-nums;
      font-weight: 700;
      color: #334155;
      text-align: right;
      display: inline-block;
      width: 24px;
    }
    .exec-order .step-text{
      display: inline-block;
      min-width: 0;
    }
    .result-summary {
      margin: 10px 0 0;
      padding-left: 18px;
      color: #2f3b4b;
      font-size: 12.5px;
    }
    .result-summary li { margin-bottom: 4px; }
    .risk-grid{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      align-items: stretch;
      grid-auto-rows: auto;
      width: 100%;
    }
    .risk-card{
      border: 1px solid #d1d5db;
      background: #f9fafb;
      padding: 8px 9px;
      border-radius: 10px;
      font-size: 12.5px;
      line-height: 1.5;
      height: 100%;
      break-inside: avoid;
      page-break-inside: avoid;
      overflow: visible;
      box-sizing: border-box;
      width: 100%;
      display: flex;
      flex-direction: column;
    }
    .risk-card strong{
      color: #111827;
      font-weight: 800;
    }
    .kpi-grid{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 8px;
    }
    .kpi-card{
      border: 1px solid #d7deea;
      background: #ffffff;
      border-radius: 8px;
      padding: 5px 6px;
      min-height: 46px;
    }
    .kpi-label{
      margin: 0 0 4px;
      font-size: 10px;
      color: #64748b;
      font-weight: 700;
      line-height: 1.3;
    }
    .kpi-value{
      margin: 0;
      font-size: 15px;
      line-height: 1.2;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .kpi-value.small{
      font-size: 12.5px;
      letter-spacing: 0;
    }
    .risk-summary{
      margin: 0;
      padding: 7px 8px;
      border: 1px solid #d7deea;
      background: #ffffff;
      border-radius: 8px;
      color: #334155;
      font-size: 11.5px;
      line-height: 1.45;
    }
    .risk-note{
      margin-top: 6px;
      color: #6b7280;
      font-size: 11px;
    }
    .risk-pill{
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border: 1px solid #d1d5db;
      border-radius: 999px;
      font-size: 10.5px;
      font-weight: 700;
      color: #374151;
      background: #ffffff;
      margin-left: 4px;
    }
    .pie-wrap {
      margin-top: 10px;
      border: 1px solid #ddd;
      padding: 10px;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .pie {
      width: 130px;
      height: 130px;
      flex: 0 0 auto;
      display: block;
      object-fit: contain;
    }
    .pie-legend {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-size: 12px;
      width: 100%;
    }
    .pie-legend li {
      display: grid;
      grid-template-columns: 10px 1fr auto;
      align-items: center;
      gap: 6px;
    }
    .pie-legend .dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      display: inline-block;
    }
    .pie-legend .name { color: #1f2937; }
    .pie-legend .pct { font-variant-numeric: tabular-nums; font-weight: 700; color: #111; }
    .chart-empty {
      border: 1px dashed #cbd5e1;
      padding: 12px;
      color: #64748b;
      font-size: 12px;
    }
    .muted { margin: 0; color: #666; }
    @media print {
      html, body { width: 210mm; }
      .report { padding-bottom: 0; }
      .risk-grid{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        align-items: stretch;
        page-break-inside: auto;
        break-inside: auto;
      }
      .risk-card{
        margin: 0;
        page-break-inside: auto;
        break-inside: auto;
      }
      .risk-card table,
      .kpi-grid,
      .trade-box-wrap{
        page-break-inside: auto;
        break-inside: auto;
      }
    }
  </style>
</head>
<body>
  <main class="report">
    <section class="header">
      <div class="header-main">
        <h1 class="title">포트폴리오 리밸런싱 리포트</h1>
        <p class="brand-sub">rebalancing.kr</p>
        <div class="meta">
          <div><strong>포트폴리오 이름:</strong> ${escapeHtml(portfolioName)}</div>
          <div><strong>생성일:</strong> ${escapeHtml(nowText)}</div>
          <div><strong>총 포트폴리오 금액:</strong> ${escapeHtml(sumValueText)}</div>
        </div>
      </div>
      <div class="header-meta">
        <div><strong>Report ID</strong> ${escapeHtml(reportId)}</div>
        <div><strong>Version</strong> v1.3</div>
        <div><strong>Timezone</strong> KST/UTC</div>
      </div>
    </section>

    <table class="summary" aria-label="요약">
      <tr>
        <td class="sell">
          <div class="summary-label">총 매도 금액</div>
          <div class="summary-value sell">${escapeHtml(fmtKRW(totalSellAmount))}</div>
        </td>
        <td class="buy">
          <div class="summary-label">총 매수 금액</div>
          <div class="summary-value buy">${escapeHtml(fmtKRW(totalBuyAmount))}</div>
        </td>
        <td class="primary">
          <div class="summary-label">잔여 현금</div>
          <div class="summary-value">${escapeHtml(fmtKRW(cashResidual))}</div>
        </td>
        <td class="neutral">
          <div class="summary-label">조정 종목 수</div>
          <div class="summary-value">${escapeHtml(String(adjustedCount))}개</div>
        </td>
      </tr>
    </table>

    <section class="section">
      <h2 class="section-title">리스크 지표</h2>
      <div class="risk-grid">
        <div class="risk-card">
          <div class="subsection-title">핵심 지표</div>
          <div class="kpi-grid">
            <div class="kpi-card">
              <p class="kpi-label">최대 단일 비중</p>
              <p class="kpi-value">${maxWeightRow ? `${maxWeightRow.afterWeightValue.toFixed(1)}%` : "-"}</p>
            </div>
            <div class="kpi-card">
              <p class="kpi-label">상위 3종목 집중도</p>
              <p class="kpi-value">${top3Concentration.toFixed(1)}%</p>
            </div>
            <div class="kpi-card">
              <p class="kpi-label">매매 회전율</p>
              <p class="kpi-value">${turnoverPct.toFixed(1)}%</p>
            </div>
            <div class="kpi-card">
              <p class="kpi-label">거래 집중도</p>
              <p class="kpi-value">${top3TradeConcentration.toFixed(1)}%</p>
            </div>
            <div class="kpi-card">
              <p class="kpi-label">잔여금 효율</p>
              <p class="kpi-value small">${cashRatio.toFixed(2)}% · ${escapeHtml(cashEfficiencyLabel)}</p>
            </div>
            <div class="kpi-card">
              <p class="kpi-label">최대 거래 종목</p>
              <p class="kpi-value small">${escapeHtml(largestTradeRow?.name || "-")}</p>
            </div>
          </div>
          <p class="risk-summary">${escapeHtml(riskSummaryText)}</p>
        </div>
        <div class="risk-card">
          <div class="subsection-title">비중 차이 지표 (현재 비중 vs 목표 비중)</div>
          <div><strong>평균 차이</strong> ${currentAvgDrift.toFixed(1)}%p · <strong>가장 큰 차이</strong> ${currentMaxDrift.toFixed(1)}%p</div>
          <table>
            <thead>
              <tr>
                <th class="left">자산명</th>
                <th class="num">현재</th>
                <th class="num">목표</th>
                <th class="num">차이 크기</th>
              </tr>
            </thead>
            <tbody>${driftRowsHtml || `<tr><td class="left">-</td><td class="num">0.0%</td><td class="num">0.0%</td><td class="num">0.0%p</td></tr>`}</tbody>
          </table>
        </div>
        <div class="risk-card">
          <div class="subsection-title">거래 부담 지표 (내 보유 대비 주문 크기)</div>
          <div><strong>최고 비율</strong> ${maxLiquidityRow ? `${maxLiquidityRow.liquidityRatio.toFixed(1)}%` : "0.0%"} · <strong>주의 종목</strong> ${highLiquidityCount}개 (25% 이상)</div>
          <table>
            <thead>
              <tr>
                <th class="left">자산명</th>
                <th class="num">거래금액</th>
                <th class="num">비율</th>
              </tr>
            </thead>
            <tbody>${liquidityRowsHtml || `<tr><td class="left">-</td><td class="num">₩ 0</td><td class="num">0.0%</td></tr>`}</tbody>
          </table>
        </div>
        <div class="risk-card">
          <div class="subsection-title">자산군 비중(리밸런싱 후)</div>
          <table>
            <thead>
              <tr>
                <th class="left">자산군</th>
                <th class="num">보유액</th>
                <th class="num">비중</th>
              </tr>
            </thead>
            <tbody>${bucketRowsHtml || `<tr><td class="left">-</td><td class="num">₩ 0</td><td class="num">0.0%</td></tr>`}</tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">현재 포트폴리오</h2>
      <table class="current-table">
        <colgroup>
          <col style="width:27%">
          <col style="width:11%">
          <col style="width:14%">
          <col style="width:16%">
          <col style="width:11%">
          <col style="width:11%">
          <col style="width:10%">
        </colgroup>
        <thead>
          <tr>
            <th class="left">자산명</th>
            <th class="num">현재 수량</th>
            <th class="num">현재가</th>
            <th class="num">현재 보유액</th>
            <th class="num">현재 비중</th>
            <th class="num">목표 비중</th>
            <th class="num">차이</th>
          </tr>
        </thead>
        <tbody>${currentTableRowsHtml}</tbody>
      </table>
    </section>

    <section class="section">
      <h2 class="section-title">리밸런싱 실행 계획</h2>
      <table class="trade-box-wrap" aria-label="리밸런싱 실행 계획">
        <tr>
          <td class="sell-box">
            <div class="trade-title sell">매도</div>
            ${sellPlanItemsHtml}
          </td>
          <td class="buy-box">
            <div class="trade-title buy">매수</div>
            ${buyPlanItemsHtml}
          </td>
        </tr>
      </table>
      <div class="exec-heading">실행 순서 (기준: 매도 우선, 매수는 현재가 높은 순)</div>
      ${executionOrderHtml}
    </section>

    <section class="section">
      <h2 class="section-title">리밸런싱 후 포트폴리오</h2>
      <table>
        <thead>
          <tr>
            <th class="left">자산명</th>
            <th class="num">최종 보유 수량</th>
            <th class="num">리밸런싱 후 보유액</th>
            <th class="num">리밸런싱 후 비중</th>
          </tr>
        </thead>
        <tbody>${afterTableRowsHtml}</tbody>
      </table>
      ${resultSummaryHtml}
      ${pieChartHtml}
    </section>
  </main>
</body>
</html>`;

    if(typeof window.html2pdf !== "function"){
      showToast("PDF 라이브러리를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const parser = new DOMParser();
    const parsed = parser.parseFromString(reportHtml, "text/html");
    const styleText = [...parsed.querySelectorAll("style")].map((el)=>el.textContent || "").join("\n");
    const reportNode = parsed.querySelector("main.report");
    if(!reportNode){
      showToast("PDF 템플릿을 만들지 못했습니다.");
      return;
    }

    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-pdf-capture-style", "true");
    const captureFixCss = `
      [data-pdf-capture-host] .report { width: 100% !important; }
      [data-pdf-capture-host] .trade-box-wrap { margin-left: 0 !important; margin-right: 0 !important; }
      [data-pdf-capture-host] table { max-width: 100% !important; }
    `;
    styleEl.textContent = `${styleText}\n${captureFixCss}`;
    document.head.appendChild(styleEl);

    const host = document.createElement("div");
    host.setAttribute("data-pdf-capture-host", "true");
    host.style.position = "static";
    host.style.width = "680px"; // conservative A4 content width to prevent right clipping
    host.style.maxWidth = "680px";
    host.style.margin = "0 auto";
    host.style.background = "#fff";
    host.style.pointerEvents = "auto";
    host.style.opacity = "1";
    const reportClone = reportNode.cloneNode(true);
    host.appendChild(reportClone);
    document.body.appendChild(host);

    const safeName = String(portfolioName || "My Portfolio")
      .replace(/[\\/:*?"<>|]+/g, "_")
      .replace(/\s+/g, "_")
      .slice(0, 60);
    const filename = `${safeName}_rebalancing_report.pdf`;

    exportPdfBtn && (exportPdfBtn.disabled = true);
    window.html2pdf()
      .set({
        margin: [10, 10, 14, 10],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] }
      })
      .from(host)
      .toPdf()
      .get("pdf")
      .then((pdf)=>{
        const totalPages = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        for(let i=1; i<=totalPages; i++){
          pdf.setPage(i);
          pdf.setFontSize(9);
          pdf.setTextColor(90, 90, 90);
          pdf.text("rebalancing.kr | Portfolio Rebalancing Tool", 8, pageHeight - 6);
          pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 8, pageHeight - 6, { align: "right" });
        }
      })
      .save()
      .catch(()=>{
        showToast("PDF 생성 중 오류가 발생했습니다.");
      })
      .finally(()=>{
        styleEl.remove();
        host.remove();
        updateExportPdfButtonState();
      });
  }
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
    updateExportPdfButtonState();
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
    hideAllNameSuggestions();

    const inputEls = document.querySelectorAll(".g-input");
    const currentEls = document.querySelectorAll(".g-current");
    const resultEls  = document.querySelectorAll(".g-result");

    if(mode === "current"){
      inputEls.forEach(el=>el.classList.remove("hide"));
      currentEls.forEach(el=>el.classList.add("hide"));
      resultEls.forEach(el=>el.classList.add("hide"));
      calcBtn.textContent = "계산";
      if(mobileCalcBtn) mobileCalcBtn.textContent = "계산하기";
      tableCard.classList.add("mode-current");
      tableCard.classList.remove("mode-result");
      modeLabel.textContent = "입력";
      if(mobileResultList){
        mobileResultList.hidden = true;
        mobileResultList.innerHTML = "";
      }
      if(mobileDetailToggle){
        mobileDetailToggle.hidden = true;
        mobileDetailToggle.textContent = "상세 보기";
        mobileDetailToggle.setAttribute("aria-expanded", "false");
      }
      tableCard.classList.remove("mobile-details-open-global");

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
      if(mobileCalcBtn) mobileCalcBtn.textContent = "입력 보기";
      tableCard.classList.add("mode-result");
      tableCard.classList.remove("mode-current");
      modeLabel.textContent = "결과";
      setDirtyState(false);
      tbody.querySelectorAll("tr").forEach(tr=>setRowDetailOpen(tr, false));
      if(mobileResultList){
        mobileResultList.hidden = false;
      }
      if(mobileDetailToggle){
        mobileDetailToggle.hidden = false;
        mobileDetailToggle.textContent = "상세 보기";
        mobileDetailToggle.setAttribute("aria-expanded", "false");
      }
      tableCard.classList.remove("mobile-details-open-global");
    }
    updateExportPdfButtonState();
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
    sumTargetEl.textContent = sum.toFixed(1);
    sumTargetEl.style.color = (sum > 100.0001) ? "var(--sell)" : "var(--sum-ok)";
    if(mobileTargetSumLabel){
      mobileTargetSumLabel.textContent = `${sum.toFixed(1)}%`;
    }
    updateProgress(sum);
    updateCalcActionState(sum);
  }

  function attachTargetGuard(targetInput){
    targetInput.addEventListener("input", ()=>{
      let v = clampMin0(parseNum(targetInput.value));
      if(parseNum(targetInput.value) < 0) targetInput.value = "0";
      if(v > 100){
        targetInput.value = "100";
      }
      updateTargetSumUI();
    });

    targetInput.addEventListener("blur", ()=>{
      if(String(targetInput.value).trim() === ""){
        updateTargetSumUI();
        return;
      }
      let v = clampMin0(parseNum(targetInput.value));
      if(v > 100) v = 100;
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
    hideNameSuggestions(tr);
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
      <td class="left col-name">
        <div class="nameFieldWrap">
          <input class="name" placeholder="종목명 또는 티커" aria-label="종목명" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false">
          <div class="nameSuggest" hidden role="listbox"></div>
          <div class="rowMetaPanel">
            <div class="rowMetaStatus">
              <label class="rowAutoQuoteControl">
                <span>현재가 자동</span>
                <input class="rowAutoQuoteToggle" type="checkbox" checked aria-label="현재가 자동조회">
              </label>
              <span class="rowPriceStatus">현재가 자동조회 ON · 보유금액 자동 계산</span>
            </div>
            <label class="rowManualPriceControl">
              <input class="rowManualPriceToggle" type="checkbox" aria-label="현재가 수동입력">
              <span>현재가 수동입력</span>
            </label>
          </div>
        </div>
      </td>

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

attachTargetGuard(tr.querySelector(".target"));
tr.querySelector(".delBtn").addEventListener("click", ()=>deleteRow(tr));
tr.querySelector(".detailToggleBtn").addEventListener("click", ()=>{
  const next = !tr.classList.contains("mobile-details-open");
  setRowDetailOpen(tr, next);
});
tr.querySelector(".name").addEventListener("focus", ()=>warnOnResultFocus(tr.querySelector(".name")));
tr.querySelector(".name").addEventListener("input", ()=>{
  const nameEl = tr.querySelector(".name");
  showNameSuggestions(tr, nameEl.value);
  syncRowDisplayName(tr);
  switchToCurrentOnEdit(nameEl);
  if(autoQuoteEnabled) scheduleAutoPriceFetch(tr);
  markDirtyIfNeeded();
});
tr.querySelector(".name").addEventListener("focus", ()=>{
  const nameEl = tr.querySelector(".name");
  if(nameEl && String(nameEl.value || "").trim()){
    showNameSuggestions(tr, nameEl.value);
  }
});
tr.querySelector(".name").addEventListener("blur", ()=>{
  setTimeout(()=>hideNameSuggestions(tr), 120);
  if(autoQuoteEnabled) scheduleAutoPriceFetch(tr, { immediate: true });
});
tr.querySelector(".name").addEventListener("keydown", (event)=>{
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
  }
  if(event.key === "Escape"){
    hideNameSuggestions(tr);
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
const rowAutoToggleEl = tr.querySelector(".rowAutoQuoteToggle");
const rowManualPriceToggleEl = tr.querySelector(".rowManualPriceToggle");
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

if(rowAutoToggleEl){
  rowAutoToggleEl.addEventListener("change", ()=>{
    setAutoQuoteEnabled(rowAutoToggleEl.checked, { notify: true });
  });
}
if(rowManualPriceToggleEl){
  rowManualPriceToggleEl.addEventListener("change", ()=>{
    syncRowPriceInputMode(tr);
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
  if(mobileTotalAssetLabel){
    mobileTotalAssetLabel.textContent = fmtKRW(total);
  }
}

  function syncRowDisplayName(tr){
    const nameInput = tr.querySelector(".name");
    const nameCell = tr.querySelector(".col-name");
    if(!nameInput || !nameCell) return;
    const raw = String(nameInput.value || "").trim();
    nameCell.setAttribute("data-name", raw || "종목명 미입력");
    nameCell.setAttribute("data-mobile-header", raw || "종목명 미입력");
    nameCell.setAttribute("data-mobile-decision", "유지");
  }
  function setMobileDetailHeader(tr, { nameText = "", decision = "유지", tradeText = "" } = {}){
    if(!tr) return;
    const nameCell = tr.querySelector(".col-name");
    if(!nameCell) return;
    let rich = nameCell.querySelector(".mobileHeaderRich");
    if(!rich){
      rich = document.createElement("div");
      rich.className = "mobileHeaderRich";
      rich.innerHTML = `
        <span class="mobileHeaderName"></span>
        <span class="mobileHeaderSep"> : </span>
        <span class="mobileHeaderTrade"></span>
        <span class="mobileHeaderDecision"></span>
      `;
      nameCell.appendChild(rich);
    }
    const nameEl = rich.querySelector(".mobileHeaderName");
    const decisionEl = rich.querySelector(".mobileHeaderDecision");
    const tradeEl = rich.querySelector(".mobileHeaderTrade");
    if(nameEl) nameEl.textContent = nameText || "이름 미입력";
    if(decisionEl){
      decisionEl.textContent = `[${decision}]`;
      decisionEl.className = `mobileHeaderDecision ${decision === "매수" ? "buy" : decision === "매도" ? "sell" : "hold"}`;
    }
    if(tradeEl) tradeEl.textContent = tradeText || "";
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

    clearAllRowQuoteStates();
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
      showToast("예시 데이터로 계산을 완료했어요.");
    }
  }

  function renderMobileResultList(trades, cashResidual){
    if(!mobileResultList) return;
    mobileResultList.innerHTML = "";

    const activeTrades = trades.filter((t)=>!t.inactive);
    if(!activeTrades.length){
      const empty = document.createElement("li");
      empty.className = "mobileResultItem empty";
      empty.textContent = "표시할 계산 결과가 없습니다.";
      mobileResultList.appendChild(empty);
      return;
    }

    activeTrades.forEach((t)=>{
      const item = document.createElement("li");
      item.className = "mobileResultItem";
      const name = String(t.tr?.querySelector(".name")?.value || "").trim() || "이름 미입력";
      const decision = t.tradeQty > 0 ? "매수" : t.tradeQty < 0 ? "매도" : "유지";
      const qtyText = t.tradeQty === 0
        ? "0주"
        : `${t.tradeQty > 0 ? "+" : "-"}${fmt(Math.abs(t.tradeQty))}주`;
      const nameEl = document.createElement("span");
      nameEl.className = "name";
      nameEl.textContent = name;
      const decisionEl = document.createElement("span");
      decisionEl.className = `decision ${decision === "매수" ? "buy" : decision === "매도" ? "sell" : "hold"}`;
      decisionEl.textContent = decision;
      const qtyEl = document.createElement("span");
      qtyEl.className = "qty";
      qtyEl.textContent = qtyText;
      item.append(nameEl, decisionEl, qtyEl);
      mobileResultList.appendChild(item);
    });

    const cashItem = document.createElement("li");
    cashItem.className = "mobileResultItem cash";
    const cashName = document.createElement("span");
    cashName.className = "name";
    cashName.textContent = "현금";
    const cashDecision = document.createElement("span");
    cashDecision.className = `decision ${cashResidual >= 0 ? "buy" : "sell"}`;
    cashDecision.textContent = cashResidual >= 0 ? "잔액" : "부족";
    const cashQty = document.createElement("span");
    cashQty.className = "qty";
    cashQty.textContent = `${cashResidual < 0 ? "-" : ""}${fmt(Math.round(Math.abs(cashResidual)))}원`;
    cashItem.append(cashName, cashDecision, cashQty);
    mobileResultList.appendChild(cashItem);
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
    if(lbl) lbl.textContent = "-";
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
      if(lbl) lbl.textContent = decision;
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
  setTheme(savedTheme || "light");
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
  if(heroDemoBtnMobile){
    heroDemoBtnMobile.addEventListener("click", fillDemoAndRun);
  }

  for(let i=0;i<getInitialRowCount();i++) addRow();
  setMode("current");
  setTotalSummary("현재 보유액", fmtKRW(0));
  setCashSummary(fmtKRW(0));
  setDirtyState(false);
  updateExportPdfButtonState();
  updateTargetSumUI();
  updateCurrentUI();
