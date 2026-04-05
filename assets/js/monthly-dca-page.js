(() => {
  const tbody = document.getElementById("dcaTableBody");
  const addRowBtn = document.getElementById("dcaAddRowBtn");
  const calcBtn = document.getElementById("dcaCalcBtn");
  const resetBtn = document.getElementById("dcaResetBtn");
  const demoBtn = document.getElementById("dcaDemoBtn");
  const saveBtn = document.getElementById("dcaSaveBtn");
  const loadBtn = document.getElementById("dcaLoadBtn");
  const contributionInput = document.getElementById("monthlyContribution");
  const currentTotalLabel = document.getElementById("currentTotalLabel");
  const targetTotalLabel = document.getElementById("targetTotalLabel");
  const targetTotalHint = document.getElementById("targetTotalHint");
  const modeLabel = document.getElementById("dcaModeLabel");
  const tradeModeSummary = document.getElementById("dcaTradeModeSummary");
  const contributionSummary = document.getElementById("dcaContributionSummary");
  const currentSummary = document.getElementById("dcaCurrentSummary");
  const priceReadySummary = document.getElementById("dcaPriceReadySummary");
  const rowCountSummary = document.getElementById("dcaRowCountSummary");
  const targetProgressWrap = document.getElementById("dcaTargetProgressWrap");
  const targetProgressBar = document.getElementById("dcaTargetProgressBar");
  const targetProgressText = document.getElementById("dcaTargetProgressText");
  const errorBox = document.getElementById("dcaError");
  const staleBadge = document.getElementById("dcaStaleBadge");
  const saveStatusText = document.getElementById("dcaSaveStatusText");
  const resultSection = document.getElementById("dcaResultSection");
  const resultCopy = document.getElementById("dcaResultCopy");
  const resultBadge = document.getElementById("resultBadge");
  const allocationNote = document.getElementById("allocationNote");
  const resultTableBody = document.getElementById("resultTableBody");
  const metricBuyLabel = document.getElementById("metricBuyLabel");
  const metricContribution = document.getElementById("metricContribution");
  const metricActualBuyTotal = document.getElementById("metricActualBuyTotal");
  const metricActualBuyMeta = document.getElementById("metricActualBuyMeta");
  const metricSellTotal = document.getElementById("metricSellTotal");
  const metricSellMeta = document.getElementById("metricSellMeta");
  const metricResidualCash = document.getElementById("metricResidualCash");
  const metricResidualCashMeta = document.getElementById("metricResidualCashMeta");
  const metricDrift = document.getElementById("metricDrift");
  const metricTopTradeLabel = document.getElementById("metricTopTradeLabel");
  const metricTopBuy = document.getElementById("metricTopBuy");
  const metricTopBuyMeta = document.getElementById("metricTopBuyMeta");
  const toast = document.getElementById("dcaToast");
  const toastMsg = document.getElementById("dcaToastMsg");
  const {
    escapeHtml,
    fmtKRW,
    formatInputWithComma,
    parseNum,
    withComma
  } = window.RebalancingFormat;
  const RebalancingSymbols = window.RebalancingSymbols || {};
  const RebalancingUtils = window.RebalancingUtils || {};
  const getSuggestionCandidates = RebalancingSymbols.getSuggestionCandidates || (() => []);
  const getSuggestionCandidatesAsync = RebalancingSymbols.getSuggestionCandidatesAsync || (async (query) => getSuggestionCandidates(query));
  const resolveSecurityQuery = RebalancingSymbols.resolveSecurityQuery || (() => "");
  const formatReportDate = RebalancingUtils.formatReportDate || ((date) => {
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  });

  const TARGET_SUM_TOLERANCE = 0.05;
  const QUOTE_ENDPOINT = "/api/quote";
  const WORKSPACE_SAVE_KEY = "rb-monthly-dca-saved-workspace-v1";
  const rowStates = new WeakMap();
  const DEFAULT_ROWS = [
    { name: "", amount: "", price: "", target: "" },
    { name: "", amount: "", price: "", target: "" },
    { name: "", amount: "", price: "", target: "" },
    { name: "", amount: "", price: "", target: "" }
  ];
  const DEMO_STATE = {
    contribution: "1,000,000",
    rows: [
      { name: "KODEX 200", amount: "4,800,000", price: "36,400", target: "30", symbol: "069500" },
      { name: "TIGER 미국S&P500", amount: "3,200,000", price: "19,850", target: "35", symbol: "360750" },
      { name: "KOSEF 국고채10년", amount: "1,900,000", price: "111,250", target: "20", symbol: "148070" },
      { name: "KODEX 골드선물(H)", amount: "600,000", price: "15,300", target: "15", symbol: "132030" }
    ]
  };
  let hasComputed = false;
  let isDirtyAfterCalc = false;
  let toastTimer = null;

  function ensureRowState(tr) {
    let state = rowStates.get(tr);
    if (!state) {
      state = {
        activeIndex: -1,
        controller: null,
        suggestController: null,
        suggestSeq: 0
      };
      rowStates.set(tr, state);
    }
    return state;
  }

  function showToast(message) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 1700);
  }

  function updateStaleBadge() {
    if (!staleBadge) return;
    if (!hasComputed) {
      staleBadge.hidden = true;
      staleBadge.classList.remove("dirty", "clean");
      staleBadge.textContent = "입력 변경됨 · 다시 계산 필요";
      updateWorkspaceSummary();
      return;
    }
    staleBadge.hidden = false;
    staleBadge.classList.toggle("dirty", isDirtyAfterCalc);
    staleBadge.classList.toggle("clean", !isDirtyAfterCalc);
    staleBadge.textContent = isDirtyAfterCalc
      ? "입력 변경됨 · 다시 계산 필요"
      : "최신 계산 결과가 반영됨";
    updateWorkspaceSummary();
  }

  function setDirtyState(next) {
    isDirtyAfterCalc = Boolean(next);
    updateStaleBadge();
  }

  function markDirtyIfNeeded() {
    if (hasComputed) {
      setDirtyState(true);
    }
  }

  function hasWorkspaceData() {
    if (parseNum(contributionInput.value) > 0) return true;
    return getRows().some((row) => (
      row.name ||
      row.currentAmount > 0 ||
      row.currentPrice > 0 ||
      (Number.isFinite(row.target) && row.target > 0)
    ));
  }

  function updateTradeModeUi() {
    if (resultCopy) {
      resultCopy.textContent = "적립금으로 먼저 맞추고, 부족할 때만 초과 비중 종목 매도를 더한 예상 주문 수량을 확인하세요.";
    }
  }

  function normalizeSavedWorkspace(raw) {
    if (!raw || typeof raw !== "object") return null;
    const rows = Array.isArray(raw.rows) ? raw.rows.map((row) => ({
      name: String(row && row.name || "").trim(),
      amount: String(row && row.amount || "").trim(),
      price: String(row && row.price || "").trim(),
      target: String(row && row.target || "").trim(),
      symbol: String(row && row.symbol || "").trim()
    })) : [];
    return {
      contribution: String(raw.contribution || "").trim(),
      rows,
      savedAt: String(raw.savedAt || "").trim(),
      resumeToResult: Boolean(raw.resumeToResult),
      version: Number(raw.version) || 1
    };
  }

  function buildWorkspaceSnapshot() {
    return {
      contribution: String(contributionInput.value || "").trim(),
      rows: getRows().map((row) => ({
        name: row.name,
        amount: row.amountEl.value,
        price: row.priceEl.value,
        target: row.targetEl.value,
        symbol: row.symbol
      })),
      savedAt: new Date().toISOString(),
      resumeToResult: hasComputed && !isDirtyAfterCalc,
      version: 2
    };
  }

  function readSavedWorkspace() {
    try {
      const raw = localStorage.getItem(WORKSPACE_SAVE_KEY);
      if (!raw) return null;
      const snapshot = normalizeSavedWorkspace(JSON.parse(raw));
      if (snapshot) return snapshot;
    } catch (_error) {
    }
    localStorage.removeItem(WORKSPACE_SAVE_KEY);
    return null;
  }

  function formatSavedWorkspaceText(snapshot) {
    if (!snapshot) {
      return "최근 저장 없음";
    }
    const savedDate = snapshot.savedAt ? new Date(snapshot.savedAt) : null;
    const savedText = savedDate && !Number.isNaN(savedDate.getTime())
      ? formatReportDate(savedDate)
      : "시간 정보 없음";
    const rowCountText = snapshot.rows.length > 0 ? `${snapshot.rows.length}개 종목` : "입력 없음";
    return `최근 저장 ${savedText} · ${rowCountText}`;
  }

  function updateSavedWorkspaceUi(snapshot) {
    if (saveStatusText) {
      saveStatusText.textContent = formatSavedWorkspaceText(snapshot);
    }
    if (loadBtn) {
      loadBtn.disabled = !snapshot;
    }
  }

  function saveWorkspaceSnapshot() {
    if (!hasWorkspaceData()) {
      showToast("저장할 입력값이 없습니다.");
      return;
    }
    const snapshot = buildWorkspaceSnapshot();
    try {
      localStorage.setItem(WORKSPACE_SAVE_KEY, JSON.stringify(snapshot));
    } catch (_error) {
      showToast("브라우저 저장 공간에 작업을 저장하지 못했습니다.");
      return;
    }
    updateSavedWorkspaceUi(snapshot);
    showToast("현재 작업을 이 브라우저에 저장했어요.");
  }

  function restoreWorkspaceSnapshot(snapshot) {
    if (!snapshot) {
      showToast("불러올 저장 작업이 없습니다.");
      return;
    }
    if ((hasWorkspaceData() || hasComputed) && !window.confirm("현재 입력값을 덮어쓰고 최근 저장 작업을 불러올까요?")) {
      return;
    }

    contributionInput.value = snapshot.contribution;
    updateTradeModeUi();
    replaceRows(snapshot.rows.length > 0 ? snapshot.rows : DEFAULT_ROWS, { preserveComputed: false });
    clearInvalidState();
    clearError();

    if (snapshot.resumeToResult) {
      const contribution = parseNum(contributionInput.value);
      const validRows = validateRows(getRows(), contribution);
      if (validRows) {
        renderResults(validRows, contribution);
        showToast("최근 저장 작업을 결과 화면으로 불러왔어요.");
        return;
      }
    }

    clearResults({ preserveComputed: false });
    showToast("최근 저장 작업을 불러왔어요.");
  }

  function getSuggestBox(tr) {
    return tr ? tr.querySelector(".dcaSuggest") : null;
  }

  function getSuggestItems(tr) {
    const box = getSuggestBox(tr);
    return box ? [...box.querySelectorAll(".dcaSuggestItem")] : [];
  }

  function getActiveSuggestionIndex(tr) {
    return ensureRowState(tr).activeIndex;
  }

  function setActiveSuggestionIndex(tr, nextIndex) {
    const box = getSuggestBox(tr);
    const nameInput = tr.querySelector(".nameInput");
    const items = getSuggestItems(tr);
    const state = ensureRowState(tr);
    if (!box || !nameInput) return;

    const index = nextIndex >= 0 && nextIndex < items.length ? nextIndex : -1;
    state.activeIndex = index;

    items.forEach((item, itemIndex) => {
      const active = itemIndex === index;
      item.classList.toggle("isActive", active);
      item.setAttribute("aria-selected", active ? "true" : "false");
      if (active) {
        nameInput.setAttribute("aria-activedescendant", item.id);
        item.scrollIntoView({ block: "nearest" });
      }
    });

    if (index === -1) {
      nameInput.removeAttribute("aria-activedescendant");
    }
  }

  function setRowQuoteStatus(tr, message, tone = "idle") {
    const statusEl = tr.querySelector(".quoteStatus");
    if (!statusEl) return;
    const nextMessage = String(message || "").trim();
    statusEl.textContent = nextMessage;
    statusEl.dataset.tone = tone;
    statusEl.hidden = !nextMessage;
  }

  function abortQuoteRequest(tr) {
    const state = ensureRowState(tr);
    if (state.controller) {
      state.controller.abort();
      state.controller = null;
    }
  }

  function hideNameSuggestions(tr) {
    const box = getSuggestBox(tr);
    const nameInput = tr.querySelector(".nameInput");
    abortSuggestRequest(tr);
    if (!box || !nameInput) return;
    box.hidden = true;
    box.innerHTML = "";
    box.classList.remove("isAbove");
    box.style.removeProperty("max-height");
    ensureRowState(tr).activeIndex = -1;
    nameInput.setAttribute("aria-expanded", "false");
    nameInput.removeAttribute("aria-controls");
    nameInput.removeAttribute("aria-activedescendant");
  }

  function abortSuggestRequest(tr) {
    const state = ensureRowState(tr);
    if (state.suggestController) {
      state.suggestController.abort();
      state.suggestController = null;
    }
  }

  function updateSuggestionPlacement(tr) {
    const box = getSuggestBox(tr);
    const nameInput = tr.querySelector(".nameInput");
    if (!box || !nameInput || box.hidden) return;

    box.classList.remove("isAbove");

    const inputRect = nameInput.getBoundingClientRect();
    const desiredHeight = Math.min(box.scrollHeight || 0, 220);
    const availableBelow = Math.max(0, window.innerHeight - inputRect.bottom - 12);
    const availableAbove = Math.max(0, inputRect.top - 12);
    const shouldOpenAbove = availableBelow < Math.min(desiredHeight, 180) && availableAbove > availableBelow;
    const availableSpace = shouldOpenAbove ? availableAbove : availableBelow;
    const cappedHeight = Math.max(88, Math.min(220, availableSpace - 8));

    box.classList.toggle("isAbove", shouldOpenAbove);
    box.style.maxHeight = `${cappedHeight}px`;
  }

  function applySuggestionSelection(tr, item) {
    const nameInput = tr.querySelector(".nameInput");
    if (!nameInput || !item) return;
    const name = item.dataset.name || "";
    const symbol = item.dataset.symbol || "";
    nameInput.value = name;
    tr.dataset.resolvedSymbol = symbol;
    hideNameSuggestions(tr);
    requestQuoteForRow(tr, { symbolOverride: symbol, force: true });
  }

  function renderNameSuggestions(tr, items) {
    const box = getSuggestBox(tr);
    const nameInput = tr.querySelector(".nameInput");
    if (!box || !nameInput) return;
    if (!items.length) {
      hideNameSuggestions(tr);
      return;
    }

    box.innerHTML = "";
    items.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dcaSuggestItem";
      button.id = `${box.id || "dcaSuggest"}-item-${index}`;
      button.dataset.name = item.name;
      button.dataset.symbol = item.symbol;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", "false");
      button.innerHTML = `
        <span class="dcaSuggestName">${escapeHtml(item.name)}</span>
        <span class="dcaSuggestSymbol">${escapeHtml(item.symbol)}</span>
      `;
      button.addEventListener("mousedown", (event) => event.preventDefault());
      button.addEventListener("click", () => applySuggestionSelection(tr, button));
      box.appendChild(button);
    });

    box.hidden = false;
    nameInput.setAttribute("aria-expanded", "true");
    if (!box.id) {
      box.id = `dcaSuggest-${Math.random().toString(36).slice(2, 8)}`;
    }
    nameInput.setAttribute("aria-controls", box.id);
    updateSuggestionPlacement(tr);
    setActiveSuggestionIndex(tr, 0);
  }
  function showNameSuggestions(tr, query) {
    const box = getSuggestBox(tr);
    const nameInput = tr.querySelector(".nameInput");
    if (!box || !nameInput) return;

    const trimmedQuery = String(query || "").trim();
    if (!trimmedQuery) {
      hideNameSuggestions(tr);
      return;
    }

    const localItems = getSuggestionCandidates(trimmedQuery);
    if (localItems.length) {
      renderNameSuggestions(tr, localItems);
    } else {
      hideNameSuggestions(tr);
    }

    const state = ensureRowState(tr);
    abortSuggestRequest(tr);
    const controller = new AbortController();
    state.suggestController = controller;
    const currentSeq = ++state.suggestSeq;

    getSuggestionCandidatesAsync(trimmedQuery, { signal: controller.signal })
      .then((items) => {
        if (controller.signal.aborted || currentSeq !== state.suggestSeq) {
          return;
        }
        state.suggestController = null;
        if (String(nameInput.value || "").trim() !== trimmedQuery) {
          return;
        }
        renderNameSuggestions(tr, items);
      })
      .catch(() => {});
  }

  async function fetchQuoteFromProxy(symbol, signal) {
    const response = await fetch(`${QUOTE_ENDPOINT}?symbol=${encodeURIComponent(symbol)}`, { signal });
    let payload = null;
    try {
      payload = await response.json();
    } catch (_error) {
      payload = null;
    }

    if (!response.ok) {
      const message = payload && payload.error ? payload.error : "가격 조회에 실패했습니다.";
      throw new Error(message);
    }

    const price = Number(payload && payload.price);
    if (!(price > 0)) {
      throw new Error("조회된 가격이 유효하지 않습니다.");
    }
    return {
      price,
      symbol: String((payload && payload.symbol) || symbol).toUpperCase(),
      baseDate: String((payload && payload.baseDate) || "")
    };
  }

  async function requestQuoteForRow(tr, { symbolOverride = "", force = false } = {}) {
    const nameInput = tr.querySelector(".nameInput");
    const priceInput = tr.querySelector(".priceInput");
    if (!nameInput || !priceInput) return;

    const name = nameInput.value.trim();
    if (!name) return;

    const symbol = symbolOverride || tr.dataset.resolvedSymbol || resolveSecurityQuery(name);
    if (!symbol) {
      setRowQuoteStatus(tr, "지원되는 ETF/ETN/ELW 종목명이나 종목코드를 입력해 주세요.", "warn");
      return;
    }

    if (!force && priceInput.dataset.edited === "manual" && parseNum(priceInput.value) > 0) {
      setRowQuoteStatus(tr, "", "manual");
      return;
    }

    abortQuoteRequest(tr);
    const state = ensureRowState(tr);
    const controller = new AbortController();
    state.controller = controller;
    setRowQuoteStatus(tr, "최근 종가를 조회하고 있습니다...", "loading");

    try {
      const result = await fetchQuoteFromProxy(symbol, controller.signal);
      if (state.controller !== controller) return;
      tr.dataset.resolvedSymbol = result.symbol;
      priceInput.value = withComma(String(Math.round(result.price)));
      delete priceInput.dataset.edited;
      setRowQuoteStatus(
        tr,
        "",
        "success"
      );
      updateInputSummary();
      markDirtyIfNeeded();
      clearResults();
    } catch (error) {
      if (controller.signal.aborted) return;
      setRowQuoteStatus(tr, error instanceof Error ? `${error.message} 직접 입력으로 계속할 수 있습니다.` : "최근 종가 자동조회에 실패했습니다. 직접 입력해 주세요.", "error");
    } finally {
      if (state.controller === controller) {
        state.controller = null;
      }
    }
  }

  function createRow(row = {}) {
    const tr = document.createElement("tr");
    tr.dataset.resolvedSymbol = row.symbol || "";
    tr.innerHTML = `
      <td class="col-name">
        <div class="dcaNameField">
          <input
            class="nameInput"
            data-field="name"
            placeholder="예: TIGER 미국S&P500"
            value="${escapeHtml(row.name || "")}"
            autocomplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="false"
          />
          <div class="dcaSuggest" hidden role="listbox"></div>
        </div>
      </td>
      <td class="num col-amount">
        <input class="moneyInput" data-field="amount" inputmode="numeric" placeholder="0" value="${escapeHtml(row.amount || "")}" />
      </td>
      <td class="num col-price">
        <input class="moneyInput priceInput" data-field="price" inputmode="numeric" placeholder="예: 12,345" value="${escapeHtml(row.price || "")}" />
      </td>
      <td class="num col-weight">
        <span class="weightPreview">0.0%</span>
      </td>
      <td class="num col-target">
        <input class="percentInput" data-field="target" inputmode="decimal" placeholder="0" value="${escapeHtml(row.target || "")}" />
      </td>
      <td class="col-del">
        <button class="iconButton" type="button" aria-label="종목 삭제">삭제</button>
      </td>
    `;

    const nameInput = tr.querySelector('[data-field="name"]');
    const amountInput = tr.querySelector('[data-field="amount"]');
    const priceInput = tr.querySelector('[data-field="price"]');
    const targetInput = tr.querySelector('[data-field="target"]');
    const deleteBtn = tr.querySelector(".iconButton");
    const suggestBox = tr.querySelector(".dcaSuggest");
    if (suggestBox && !suggestBox.id) {
      suggestBox.id = `dcaSuggest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    if (parseNum(priceInput.value) > 0) {
      setRowQuoteStatus(tr, "", "manual");
      priceInput.dataset.edited = "manual";
    }

    amountInput.addEventListener("input", () => {
      formatInputWithComma(amountInput);
      updateInputSummary();
      markDirtyIfNeeded();
      clearResults();
    });
    amountInput.addEventListener("focus", clearError);

    priceInput.addEventListener("input", () => {
      formatInputWithComma(priceInput);
      priceInput.dataset.edited = parseNum(priceInput.value) > 0 ? "manual" : "";
      if (parseNum(priceInput.value) > 0) {
        setRowQuoteStatus(tr, "", "manual");
      } else {
        setRowQuoteStatus(tr, "", "idle");
      }
      markDirtyIfNeeded();
      clearResults();
      clearError();
    });
    priceInput.addEventListener("focus", clearError);

    targetInput.addEventListener("input", () => {
      updateInputSummary();
      markDirtyIfNeeded();
      clearResults();
    });
    targetInput.addEventListener("focus", clearError);

    nameInput.addEventListener("input", () => {
      clearError();
      markDirtyIfNeeded();
      clearResults();
      tr.dataset.resolvedSymbol = "";
      if (!String(nameInput.value || "").trim()) {
        hideNameSuggestions(tr);
        if (!priceInput.dataset.edited) {
          setRowQuoteStatus(tr, "", "idle");
        }
        return;
      }
      showNameSuggestions(tr, nameInput.value);
      if (!priceInput.dataset.edited) {
        setRowQuoteStatus(tr, "", "idle");
      }
    });
    nameInput.addEventListener("focus", () => {
      clearError();
      if (String(nameInput.value || "").trim()) {
        showNameSuggestions(tr, nameInput.value);
      }
    });
    nameInput.addEventListener("blur", () => {
      setTimeout(() => hideNameSuggestions(tr), 120);
      if (parseNum(priceInput.value) <= 0) {
        requestQuoteForRow(tr);
      }
    });
    nameInput.addEventListener("keydown", (event) => {
      if (event.isComposing) return;
      const items = getSuggestItems(tr);
      if (!items.length) {
        if (event.key === "Enter") {
          event.preventDefault();
          requestQuoteForRow(tr);
        }
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveSuggestionIndex(tr, Math.min(getActiveSuggestionIndex(tr) + 1, items.length - 1));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        const currentIndex = getActiveSuggestionIndex(tr);
        setActiveSuggestionIndex(tr, currentIndex <= 0 ? items.length - 1 : currentIndex - 1);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const activeIndex = getActiveSuggestionIndex(tr);
        const picked = activeIndex >= 0 ? items[activeIndex] : items[0];
        if (picked) {
          applySuggestionSelection(tr, picked);
        }
        return;
      }
      if (event.key === "Escape") {
        hideNameSuggestions(tr);
      }
    });

    deleteBtn.addEventListener("click", () => {
      if (tbody.children.length <= 1) {
        showError("최소 1개 종목은 남겨두세요.");
        return;
      }
      abortQuoteRequest(tr);
      tr.remove();
      updateInputSummary();
      markDirtyIfNeeded();
      clearResults();
    });

    return tr;
  }

  function replaceRows(rows, { preserveComputed = false } = {}) {
    tbody.replaceChildren(...rows.map((row) => createRow(row)));
    updateInputSummary();
    clearResults({ preserveComputed });
  }

  function addRow(row = {}) {
    tbody.appendChild(createRow(row));
    updateInputSummary();
  }

  function getRows() {
    return [...tbody.querySelectorAll("tr")].map((tr) => {
      const name = tr.querySelector('[data-field="name"]').value.trim();
      const currentAmount = parseNum(tr.querySelector('[data-field="amount"]').value);
      const currentPrice = parseNum(tr.querySelector('[data-field="price"]').value);
      const target = Number(tr.querySelector('[data-field="target"]').value.trim());
      return {
        tr,
        name,
        symbol: tr.dataset.resolvedSymbol || "",
        currentAmount,
        currentPrice,
        target: Number.isFinite(target) ? target : NaN,
        previewEl: tr.querySelector(".weightPreview"),
        nameEl: tr.querySelector('[data-field="name"]'),
        amountEl: tr.querySelector('[data-field="amount"]'),
        priceEl: tr.querySelector('[data-field="price"]'),
        targetEl: tr.querySelector('[data-field="target"]')
      };
    });
  }

  function clearInvalidState() {
    getRows().forEach((row) => {
      row.nameEl.classList.remove("invalidField");
      row.amountEl.classList.remove("invalidField");
      row.priceEl.classList.remove("invalidField");
      row.targetEl.classList.remove("invalidField");
    });
    contributionInput.classList.remove("invalidField");
  }

  function showError(message) {
    errorBox.hidden = false;
    errorBox.textContent = message;
  }

  function clearError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }

  function updateInputSummary() {
    clearInvalidState();
    clearError();

    const rows = getRows();
    const currentTotal = rows.reduce((sum, row) => sum + row.currentAmount, 0);
    const targetTotal = rows.reduce((sum, row) => sum + (Number.isFinite(row.target) ? row.target : 0), 0);

    rows.forEach((row) => {
      const weight = currentTotal > 0 ? (row.currentAmount / currentTotal) * 100 : 0;
      row.previewEl.textContent = currentTotal > 0 ? `${weight.toFixed(1)}%` : "-";
    });

    currentTotalLabel.textContent = fmtKRW(currentTotal);
    targetTotalLabel.textContent = `${targetTotal.toFixed(1)}%`;

    const isValidTargetTotal = Math.abs(targetTotal - 100) <= TARGET_SUM_TOLERANCE;
    targetTotalLabel.classList.toggle("isInvalid", !isValidTargetTotal);
    targetTotalHint.textContent = isValidTargetTotal
      ? "합계가 100%입니다."
      : "목표 비중 합계를 100%로 맞춰야 합니다.";
    updateWorkspaceSummary(rows, {
      currentTotal,
      targetTotal
    });
  }

  function updateWorkspaceSummary(rowsArg, totalsArg) {
    const rows = rowsArg || getRows();
    const currentTotal = totalsArg && Number.isFinite(totalsArg.currentTotal)
      ? totalsArg.currentTotal
      : rows.reduce((sum, row) => sum + row.currentAmount, 0);
    const targetTotal = totalsArg && Number.isFinite(totalsArg.targetTotal)
      ? totalsArg.targetTotal
      : rows.reduce((sum, row) => sum + (Number.isFinite(row.target) ? row.target : 0), 0);
    const contribution = parseNum(contributionInput.value);
    const namedRows = rows.filter((row) => row.name).length;
    const pricedRows = rows.filter((row) => row.name && row.currentPrice > 0).length;
    const progressValue = Math.max(0, Math.min(targetTotal, 100));
    const modeText = !hasComputed
      ? "입력 중"
      : isDirtyAfterCalc
        ? "다시 계산 필요"
        : "계산 완료";

    if (modeLabel) {
      modeLabel.textContent = modeText;
    }
    if (tradeModeSummary) {
      tradeModeSummary.textContent = "적립금 우선";
    }
    if (contributionSummary) {
      contributionSummary.textContent = fmtKRW(contribution);
    }
    if (currentSummary) {
      currentSummary.textContent = fmtKRW(currentTotal);
    }
    if (priceReadySummary) {
      priceReadySummary.textContent = `${pricedRows}/${Math.max(namedRows, 0)}`;
    }
    if (rowCountSummary) {
      rowCountSummary.textContent = `${namedRows}개`;
    }
    if (targetProgressText) {
      targetProgressText.textContent = `${targetTotal.toFixed(1)}%`;
    }
    if (targetProgressBar) {
      targetProgressBar.style.width = `${progressValue}%`;
    }
    if (targetProgressWrap) {
      targetProgressWrap.classList.toggle("over", targetTotal > 100 + TARGET_SUM_TOLERANCE);
    }
    if (modeLabel && modeLabel.parentElement) {
      modeLabel.parentElement.classList.toggle("buy", hasComputed && !isDirtyAfterCalc);
      modeLabel.parentElement.classList.toggle("sell", hasComputed && isDirtyAfterCalc);
      modeLabel.parentElement.classList.toggle("hold", !hasComputed);
    }
    if (tradeModeSummary && tradeModeSummary.parentElement) {
      tradeModeSummary.parentElement.classList.toggle("buy", true);
      tradeModeSummary.parentElement.classList.toggle("sell", false);
      tradeModeSummary.parentElement.classList.toggle("hold", false);
    }
    if (priceReadySummary && priceReadySummary.parentElement) {
      const allReady = namedRows > 0 && pricedRows === namedRows;
      priceReadySummary.parentElement.classList.toggle("buy", allReady);
      priceReadySummary.parentElement.classList.toggle("hold", !allReady);
      priceReadySummary.parentElement.classList.toggle("sell", false);
    }
    if (rowCountSummary && rowCountSummary.parentElement) {
      rowCountSummary.parentElement.classList.toggle("hold", true);
    }
    if (contributionSummary && contributionSummary.parentElement) {
      contributionSummary.parentElement.classList.toggle("cash", true);
      contributionSummary.parentElement.classList.toggle("negative", contribution < 0);
    }
    if (currentSummary && currentSummary.parentElement) {
      currentSummary.parentElement.classList.toggle("hold", true);
    }
  }

  function averageDrift(items, key) {
    if (!items.length) return 0;
    return items.reduce((sum, item) => sum + Math.abs(item[key] - item.target), 0) / items.length;
  }

  function roundAllocations(rawAllocations, total) {
    const rounded = rawAllocations.map((value) => Math.floor(value));
    let remainder = Math.max(0, Math.round(total - rounded.reduce((sum, value) => sum + value, 0)));
    const fractions = rawAllocations
      .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
      .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

    let cursor = 0;
    while (remainder > 0 && fractions.length) {
      rounded[fractions[cursor].index] += 1;
      remainder -= 1;
      cursor = (cursor + 1) % fractions.length;
    }

    return rounded;
  }

  function buildResultRows(rows, contribution) {
    const currentTotal = rows.reduce((sum, row) => sum + row.currentAmount, 0);
    const finalTotal = currentTotal + contribution;
    const enriched = rows.map((row) => {
      const targetRatio = row.target / 100;
      const currentWeight = currentTotal > 0 ? (row.currentAmount / currentTotal) * 100 : 0;
      const desiredAmount = finalTotal * targetRatio;
      const deficitAmount = Math.max(desiredAmount - row.currentAmount, 0);
      const excessAmount = Math.max(row.currentAmount - desiredAmount, 0);
      return {
        ...row,
        currentWeight,
        desiredAmount,
        deficitAmount,
        excessAmount,
        gapAmount: deficitAmount
      };
    });

    const totalDeficit = enriched.reduce((sum, row) => sum + row.deficitAmount, 0);
    const contributionBudgetTotal = Math.min(contribution, totalDeficit);
    const contributionAllocations = roundAllocations(
      enriched.map((row) => (
        totalDeficit > 0 ? (contributionBudgetTotal * row.deficitAmount) / totalDeficit : 0
      )),
      contributionBudgetTotal
    );

    const afterContributionRows = enriched.map((row, index) => {
      const contributionBudget = contributionAllocations[index];
      const afterContributionAmount = row.currentAmount + contributionBudget;
      const remainingDeficit = Math.max(row.desiredAmount - afterContributionAmount, 0);
      return {
        ...row,
        contributionBudget,
        afterContributionAmount,
        remainingDeficit
      };
    });

    const totalRemainingDeficit = afterContributionRows.reduce((sum, row) => sum + row.remainingDeficit, 0);
    const totalExcess = afterContributionRows.reduce((sum, row) => sum + row.excessAmount, 0);
    const sellBudgetTotal = Math.min(totalRemainingDeficit, totalExcess);
    const sellAllocations = roundAllocations(
      afterContributionRows.map((row) => (
        totalExcess > 0 ? (sellBudgetTotal * row.excessAmount) / totalExcess : 0
      )),
      sellBudgetTotal
    );
    const buyFromSellAllocations = roundAllocations(
      afterContributionRows.map((row) => (
        totalRemainingDeficit > 0 ? (sellBudgetTotal * row.remainingDeficit) / totalRemainingDeficit : 0
      )),
      sellBudgetTotal
    );

    const plannedRows = afterContributionRows.map((row, index) => {
      const recommendedBudget = row.contributionBudget + buyFromSellAllocations[index] - sellAllocations[index];
      let recommendedQty = 0;
      if (row.currentPrice > 0) {
        if (recommendedBudget > 0) {
          recommendedQty = Math.floor(recommendedBudget / row.currentPrice);
        } else if (recommendedBudget < 0) {
          const estimatedHoldQty = Math.max(0, Math.floor(row.currentAmount / row.currentPrice));
          recommendedQty = -Math.min(estimatedHoldQty, Math.floor(Math.abs(recommendedBudget) / row.currentPrice));
        }
      }
      return {
        ...row,
        recommendedBudget,
        recommendedQty,
        actualTradeAmount: recommendedQty * row.currentPrice
      };
    });

    let cashBalance = contribution - plannedRows.reduce((sum, row) => sum + row.actualTradeAmount, 0);
    while (cashBalance > 0) {
      const extraBuyCandidate = plannedRows
        .filter((row) => row.currentPrice > 0 && row.currentPrice <= cashBalance)
        .map((row) => {
          const currentGap = Math.abs((row.currentAmount + row.actualTradeAmount) - row.desiredAmount);
          const nextTradeAmount = (row.recommendedQty + 1) * row.currentPrice;
          const nextGap = Math.abs((row.currentAmount + nextTradeAmount) - row.desiredAmount);
          return {
            row,
            improvement: currentGap - nextGap
          };
        })
        .filter((candidate) => candidate.improvement > 0)
        .sort((a, b) => b.improvement - a.improvement || a.row.currentPrice - b.row.currentPrice)[0];
      if (!extraBuyCandidate) break;
      extraBuyCandidate.row.recommendedQty += 1;
      extraBuyCandidate.row.actualTradeAmount = extraBuyCandidate.row.recommendedQty * extraBuyCandidate.row.currentPrice;
      cashBalance -= extraBuyCandidate.row.currentPrice;
    }

    return plannedRows.map((row) => {
      const tradeGap = row.recommendedBudget - row.actualTradeAmount;
      const afterAmount = row.currentAmount + row.actualTradeAmount;
      const afterWeight = finalTotal > 0 ? (afterAmount / finalTotal) * 100 : 0;
      return {
        ...row,
        tradeGap,
        afterAmount,
        afterWeight,
        tradeAction: row.actualTradeAmount > 0 ? "buy" : row.actualTradeAmount < 0 ? "sell" : "hold"
      };
    });
  }

  function validateRows(rows, contribution) {
    let firstInvalid = null;

    if (!(contribution > 0)) {
      contributionInput.classList.add("invalidField");
      firstInvalid = contributionInput;
      showError("이번 달 적립금은 0보다 큰 값이어야 합니다.");
    }

    if (rows.length === 0) {
      showError("계산할 종목을 먼저 추가하세요.");
      return null;
    }

    const targetTotal = rows.reduce((sum, row) => sum + (Number.isFinite(row.target) ? row.target : 0), 0);
    if (Math.abs(targetTotal - 100) > TARGET_SUM_TOLERANCE) {
      if (!firstInvalid) {
        firstInvalid = rows[0] ? rows[0].targetEl : contributionInput;
      }
      showError("목표 비중 합계는 100%여야 합니다.");
    }

    rows.forEach((row, index) => {
      if (!row.name) {
        row.nameEl.classList.add("invalidField");
        if (!firstInvalid) firstInvalid = row.nameEl;
        if (!errorBox.textContent) {
          showError(`${index + 1}번째 종목의 이름을 입력하세요.`);
        }
      }
      if (row.currentAmount < 0) {
        row.amountEl.classList.add("invalidField");
        if (!firstInvalid) firstInvalid = row.amountEl;
        if (!errorBox.textContent) {
          showError(`${index + 1}번째 종목의 현재 평가금액을 확인하세요.`);
        }
      }
      if (row.currentPrice < 0) {
        row.priceEl.classList.add("invalidField");
        if (!firstInvalid) firstInvalid = row.priceEl;
        if (!errorBox.textContent) {
          showError(`${index + 1}번째 종목의 최근 종가를 확인하세요.`);
        }
      }
      if (!Number.isFinite(row.target) || row.target < 0) {
        row.targetEl.classList.add("invalidField");
        if (!firstInvalid) firstInvalid = row.targetEl;
        if (!errorBox.textContent) {
          showError(`${index + 1}번째 종목의 목표 비중을 확인하세요.`);
        }
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return null;
    }

    const resultPreview = buildResultRows(rows, contribution);
    const needsPriceRow = resultPreview.find((row) => Math.abs(row.recommendedBudget) > 0 && !(row.currentPrice > 0));
    if (needsPriceRow) {
      needsPriceRow.priceEl.classList.add("invalidField");
      needsPriceRow.priceEl.focus();
      showError(`${needsPriceRow.name}의 최근 종가를 입력하면 권장 거래 수량과 거래 후 비중까지 계산할 수 있습니다.`);
      return null;
    }

    clearError();
    return rows;
  }

  function formatTradeQty(value) {
    const absValue = Math.max(0, Math.floor(Math.abs(value)));
    if (!(absValue > 0)) return "0주";
    return value < 0
      ? `매도 ${absValue.toLocaleString("ko-KR")}주`
      : `매수 ${absValue.toLocaleString("ko-KR")}주`;
  }

  function scrollToResultSection() {
    if (!resultSection) return;
    window.requestAnimationFrame(() => {
      resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  function renderResults(rows, contribution) {
    const resultRows = buildResultRows(rows, contribution);
    const actualBuyTotal = resultRows.reduce((sum, row) => sum + (row.actualTradeAmount > 0 ? row.actualTradeAmount : 0), 0);
    const actualSellTotal = resultRows.reduce((sum, row) => sum + (row.actualTradeAmount < 0 ? Math.abs(row.actualTradeAmount) : 0), 0);
    const actualNetTrade = resultRows.reduce((sum, row) => sum + row.actualTradeAmount, 0);
    const residualCash = contribution - actualNetTrade;
    const beforeDrift = averageDrift(resultRows, "currentWeight");
    const afterDrift = averageDrift(resultRows, "afterWeight");
    const topTradeRow = [...resultRows].sort((a, b) => {
      const amountDiff = Math.abs(b.actualTradeAmount) - Math.abs(a.actualTradeAmount);
      if (amountDiff !== 0) return amountDiff;
      return Math.abs(b.recommendedBudget) - Math.abs(a.recommendedBudget);
    })[0];
    const positiveGapCount = resultRows.filter((row) => row.gapAmount > 0).length;
    const activeBuyCount = resultRows.filter((row) => row.actualTradeAmount > 0).length;
    const activeSellCount = resultRows.filter((row) => row.actualTradeAmount < 0).length;
    const sellTriggered = actualSellTotal > 0;

    metricContribution.textContent = fmtKRW(contribution);
    metricActualBuyTotal.textContent = fmtKRW(actualBuyTotal);
    if (metricActualBuyMeta) {
      metricActualBuyMeta.textContent = sellTriggered
        ? "적립금과 매도 대금으로 집행되는 매수 합계"
        : "정수 수량 기준 예상 주문액";
    }
    if (metricSellTotal) {
      metricSellTotal.textContent = fmtKRW(actualSellTotal);
    }
    if (metricSellMeta) {
      metricSellMeta.textContent = sellTriggered
        ? "적립금만으로 부족해 자동 반영된 매도액"
        : "적립금만으로도 목표 비중에 가깝게 맞췄습니다.";
    }
    metricResidualCash.textContent = fmtKRW(Math.max(0, residualCash));
    metricResidualCashMeta.textContent = residualCash > 0
      ? "정수 수량 반영 뒤 남는 현금"
      : "남는 현금 없이 배분되었습니다.";
    metricDrift.textContent = `${beforeDrift.toFixed(1)}%p → ${afterDrift.toFixed(1)}%p`;
    if (metricBuyLabel) {
      metricBuyLabel.textContent = "예상 매수 금액";
    }
    if (metricTopTradeLabel) {
      metricTopTradeLabel.textContent = "가장 크게 조정할 종목";
    }
    metricTopBuy.textContent = topTradeRow && Math.abs(topTradeRow.actualTradeAmount) > 0 ? topTradeRow.name : "없음";
    metricTopBuyMeta.textContent = topTradeRow && Math.abs(topTradeRow.actualTradeAmount) > 0
      ? `${fmtKRW(Math.abs(topTradeRow.actualTradeAmount))} · ${formatTradeQty(topTradeRow.recommendedQty)}`
      : "계산 후 표시됩니다.";
    resultBadge.textContent = sellTriggered ? "적립금+매도 조정" : residualCash > 0 ? "적립금 우선 조정" : "목표 비중 근접";
    allocationNote.textContent = sellTriggered
      ? `적립금으로 먼저 매수한 뒤에도 부족한 비중이 남아 매수 ${activeBuyCount}개 종목, 매도 ${activeSellCount}개 종목으로 추가 조정했습니다. 정수 수량 반영 뒤 남는 현금은 ${fmtKRW(Math.max(0, residualCash))}입니다.`
      : `적립금만으로 부족한 ${positiveGapCount}개 종목을 우선 배분했고, 실제 주문 기준으로 ${activeBuyCount}개 종목을 매수하면 됩니다. 정수 수량 기준 예상 잔여 현금은 ${fmtKRW(Math.max(0, residualCash))}입니다.`;

    resultTableBody.innerHTML = resultRows.map((row) => `
      <tr>
        <td data-label="종목명">${escapeHtml(row.name)}</td>
        <td class="num" data-label="현재 비중">${row.currentWeight.toFixed(1)}%</td>
        <td class="num" data-label="목표 비중">${row.target.toFixed(1)}%</td>
        <td class="num ${row.recommendedBudget < 0 ? "sell" : row.recommendedBudget > 0 ? "buy" : ""}" data-label="권장 거래액">${fmtKRW(row.recommendedBudget)}</td>
        <td class="num" data-label="최근 종가">${row.currentPrice > 0 ? fmtKRW(row.currentPrice) : "-"}</td>
        <td class="num emphasis ${row.recommendedQty < 0 ? "sell" : row.recommendedQty > 0 ? "buy" : ""}" data-label="거래 수량">${row.currentPrice > 0 ? formatTradeQty(row.recommendedQty) : "-"}</td>
        <td class="num ${row.actualTradeAmount < 0 ? "sell" : row.actualTradeAmount > 0 ? "buy" : ""}" data-label="실제 거래액">${fmtKRW(row.actualTradeAmount)}</td>
        <td class="num ${row.tradeGap < 0 ? "sell" : row.tradeGap > 0 ? "buy" : ""}" data-label="미반영 차액">${fmtKRW(row.tradeGap)}</td>
        <td class="num" data-label="거래 후 비중">${row.afterWeight.toFixed(1)}%</td>
      </tr>
    `).join("");
    hasComputed = true;
    setDirtyState(false);
    scrollToResultSection();
  }

  function clearResults({ preserveComputed = true } = {}) {
    if (!preserveComputed) {
      hasComputed = false;
      isDirtyAfterCalc = false;
    }
    resultBadge.textContent = "계산 전";
    allocationNote.textContent = "계산하면 종목별 권장 거래 금액, 거래 수량, 남는 현금이 여기에 표시됩니다.";
    metricContribution.textContent = "₩ 0";
    metricActualBuyTotal.textContent = "₩ 0";
    if (metricActualBuyMeta) {
      metricActualBuyMeta.textContent = "정수 수량 기준 예상 주문액";
    }
    if (metricSellTotal) {
      metricSellTotal.textContent = "₩ 0";
    }
    if (metricSellMeta) {
      metricSellMeta.textContent = "적립금으로 부족할 때만 자동 반영됩니다.";
    }
    if (metricBuyLabel) {
      metricBuyLabel.textContent = "예상 매수 금액";
    }
    metricResidualCash.textContent = "₩ 0";
    metricResidualCashMeta.textContent = "수량 계산 후 남는 현금";
    metricDrift.textContent = "0.0%p → 0.0%p";
    if (metricTopTradeLabel) {
      metricTopTradeLabel.textContent = "가장 크게 조정할 종목";
    }
    metricTopBuy.textContent = "없음";
    metricTopBuyMeta.textContent = "계산 후 표시됩니다.";
    resultTableBody.innerHTML = '<tr><td class="resultEmpty" colspan="9">입력 후 계산하면 결과가 나타납니다.</td></tr>';
    updateStaleBadge();
  }

  function handleCalculate({ notify = true } = {}) {
    clearInvalidState();
    clearError();

    const contribution = parseNum(contributionInput.value);
    const rows = getRows();
    const validRows = validateRows(rows, contribution);
    if (!validRows) return;

    renderResults(validRows, contribution);
    if (notify) {
      showToast("월 적립 조정 계산을 완료했어요.");
    }
  }

  contributionInput.addEventListener("input", () => {
    formatInputWithComma(contributionInput);
    markDirtyIfNeeded();
    clearResults();
    clearError();
  });
  contributionInput.addEventListener("focus", clearError);
  addRowBtn.addEventListener("click", () => {
    addRow();
    markDirtyIfNeeded();
    clearResults();
  });
  calcBtn.addEventListener("click", handleCalculate);
  if (saveBtn) {
    saveBtn.addEventListener("click", saveWorkspaceSnapshot);
  }
  if (loadBtn) {
    loadBtn.addEventListener("click", () => restoreWorkspaceSnapshot(readSavedWorkspace()));
  }
  resetBtn.addEventListener("click", () => {
    contributionInput.value = "";
    replaceRows(DEFAULT_ROWS, { preserveComputed: false });
    showToast("입력값을 초기화했어요.");
  });
  demoBtn.addEventListener("click", () => {
    contributionInput.value = DEMO_STATE.contribution;
    updateTradeModeUi();
    replaceRows(DEMO_STATE.rows, { preserveComputed: false });
    handleCalculate({ notify: false });
    showToast("기본 예시로 계산을 완료했어요.");
  });

  updateTradeModeUi();
  replaceRows(DEFAULT_ROWS, { preserveComputed: false });
  updateSavedWorkspaceUi(readSavedWorkspace());
  updateStaleBadge();
})();
