(() => {
  const tbody = document.getElementById("dcaTableBody");
  const addRowBtn = document.getElementById("dcaAddRowBtn");
  const calcBtn = document.getElementById("dcaCalcBtn");
  const resetBtn = document.getElementById("dcaResetBtn");
  const demoBtn = document.getElementById("dcaDemoBtn");
  const contributionInput = document.getElementById("monthlyContribution");
  const currentTotalLabel = document.getElementById("currentTotalLabel");
  const targetTotalLabel = document.getElementById("targetTotalLabel");
  const targetTotalHint = document.getElementById("targetTotalHint");
  const errorBox = document.getElementById("dcaError");
  const resultBadge = document.getElementById("resultBadge");
  const allocationNote = document.getElementById("allocationNote");
  const resultTableBody = document.getElementById("resultTableBody");
  const metricContribution = document.getElementById("metricContribution");
  const metricAfterTotal = document.getElementById("metricAfterTotal");
  const metricDrift = document.getElementById("metricDrift");
  const metricTopBuy = document.getElementById("metricTopBuy");
  const metricTopBuyMeta = document.getElementById("metricTopBuyMeta");
  const {
    escapeHtml,
    fmtKRW,
    formatInputWithComma,
    parseNum
  } = window.RebalancingFormat;

  const TARGET_SUM_TOLERANCE = 0.05;
  const DEFAULT_ROWS = [
    { name: "", amount: "", target: "" },
    { name: "", amount: "", target: "" },
    { name: "", amount: "", target: "" },
    { name: "", amount: "", target: "" }
  ];
  const DEMO_STATE = {
    contribution: "1,000,000",
    rows: [
      { name: "KODEX 200", amount: "4,800,000", target: "30" },
      { name: "TIGER 미국S&P500", amount: "3,200,000", target: "35" },
      { name: "KOSEF 국고채10년", amount: "1,900,000", target: "20" },
      { name: "KODEX 골드선물(H)", amount: "600,000", target: "15" }
    ]
  };

  function createRow(row = {}) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <input class="nameInput" data-field="name" placeholder="예: TIGER 미국S&P500" value="${escapeHtml(row.name || "")}" />
      </td>
      <td class="num">
        <input class="moneyInput" data-field="amount" inputmode="numeric" placeholder="0" value="${escapeHtml(row.amount || "")}" />
      </td>
      <td class="num">
        <span class="weightPreview">0.0%</span>
      </td>
      <td class="num">
        <input class="percentInput" data-field="target" inputmode="decimal" placeholder="0" value="${escapeHtml(row.target || "")}" />
      </td>
      <td>
        <button class="iconButton" type="button" aria-label="종목 삭제">삭제</button>
      </td>
    `;

    const amountInput = tr.querySelector('[data-field="amount"]');
    const targetInput = tr.querySelector('[data-field="target"]');
    const deleteBtn = tr.querySelector(".iconButton");

    amountInput.addEventListener("input", () => {
      formatInputWithComma(amountInput);
      updateInputSummary();
      clearResults();
    });
    targetInput.addEventListener("input", () => {
      updateInputSummary();
      clearResults();
    });
    tr.querySelector('[data-field="name"]').addEventListener("input", () => {
      clearError();
      clearResults();
    });
    amountInput.addEventListener("focus", clearError);
    targetInput.addEventListener("focus", clearError);
    deleteBtn.addEventListener("click", () => {
      if (tbody.children.length <= 1) {
        showError("최소 1개 종목은 남겨두세요.");
        return;
      }
      tr.remove();
      updateInputSummary();
      clearResults();
    });

    return tr;
  }

  function replaceRows(rows) {
    tbody.replaceChildren(...rows.map((row) => createRow(row)));
    updateInputSummary();
    clearResults();
  }

  function addRow(row = {}) {
    tbody.appendChild(createRow(row));
    updateInputSummary();
  }

  function getRows() {
    return [...tbody.querySelectorAll("tr")].map((tr) => {
      const name = tr.querySelector('[data-field="name"]').value.trim();
      const currentAmount = parseNum(tr.querySelector('[data-field="amount"]').value);
      const target = Number(tr.querySelector('[data-field="target"]').value.trim());
      return {
        name,
        currentAmount,
        target: Number.isFinite(target) ? target : NaN,
        previewEl: tr.querySelector(".weightPreview"),
        nameEl: tr.querySelector('[data-field="name"]'),
        amountEl: tr.querySelector('[data-field="amount"]'),
        targetEl: tr.querySelector('[data-field="target"]')
      };
    });
  }

  function clearInvalidState() {
    getRows().forEach((row) => {
      row.nameEl.classList.remove("invalidField");
      row.amountEl.classList.remove("invalidField");
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
        firstInvalid = rows[0]?.targetEl || contributionInput;
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
          showError(`${index + 1}번째 종목의 현재 보유액을 확인하세요.`);
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
    clearError();
    return rows;
  }

  function buildResultRows(rows, contribution) {
    const currentTotal = rows.reduce((sum, row) => sum + row.currentAmount, 0);
    const finalTotal = currentTotal + contribution;
    const enriched = rows.map((row) => {
      const targetRatio = row.target / 100;
      const currentWeight = currentTotal > 0 ? (row.currentAmount / currentTotal) * 100 : 0;
      const desiredAmount = finalTotal * targetRatio;
      const gapAmount = Math.max(desiredAmount - row.currentAmount, 0);
      return {
        ...row,
        currentWeight,
        desiredAmount,
        gapAmount
      };
    });
    const totalGap = enriched.reduce((sum, row) => sum + row.gapAmount, 0);
    const rawAllocations = enriched.map((row) => (
      totalGap > 0 ? (contribution * row.gapAmount) / totalGap : contribution * (row.target / 100)
    ));
    const roundedAllocations = roundAllocations(rawAllocations, contribution);

    return enriched.map((row, index) => {
      const recommendedBuy = roundedAllocations[index];
      const afterAmount = row.currentAmount + recommendedBuy;
      const afterWeight = finalTotal > 0 ? (afterAmount / finalTotal) * 100 : 0;
      return {
        ...row,
        recommendedBuy,
        afterAmount,
        afterWeight
      };
    });
  }

  function renderResults(rows, contribution) {
    const resultRows = buildResultRows(rows, contribution);
    const currentTotal = rows.reduce((sum, row) => sum + row.currentAmount, 0);
    const finalTotal = currentTotal + contribution;
    const beforeDrift = averageDrift(resultRows, "currentWeight");
    const afterDrift = averageDrift(resultRows, "afterWeight");
    const topBuyRow = [...resultRows].sort((a, b) => b.recommendedBuy - a.recommendedBuy)[0];
    const positiveGapCount = resultRows.filter((row) => row.gapAmount > 0).length;
    const exactMatchPossible = resultRows.every((row) => row.currentAmount <= row.desiredAmount + 0.01);

    metricContribution.textContent = fmtKRW(contribution);
    metricAfterTotal.textContent = fmtKRW(finalTotal);
    metricDrift.textContent = `${beforeDrift.toFixed(1)}%p → ${afterDrift.toFixed(1)}%p`;
    metricTopBuy.textContent = topBuyRow ? topBuyRow.name : "없음";
    metricTopBuyMeta.textContent = topBuyRow ? `${fmtKRW(topBuyRow.recommendedBuy)} 권장` : "계산 후 표시됩니다.";
    resultBadge.textContent = exactMatchPossible ? "목표 비중 근접" : "매수 우선순위 계산";
    allocationNote.textContent = exactMatchPossible
      ? `이번 달 적립금은 부족한 ${positiveGapCount}개 종목에 배분하면 목표 비중에 거의 맞출 수 있습니다.`
      : "현재 과대 비중 자산이 있어 이번 달 적립금만으로는 정확한 복귀가 어렵습니다. 부족한 자산 위주로 우선 배분한 결과입니다.";

    resultTableBody.innerHTML = resultRows.map((row) => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td class="num">${row.currentWeight.toFixed(1)}%</td>
        <td class="num">${row.target.toFixed(1)}%</td>
        <td class="num">${fmtKRW(row.gapAmount)}</td>
        <td class="num emphasis">${fmtKRW(row.recommendedBuy)}</td>
        <td class="num">${row.afterWeight.toFixed(1)}%</td>
      </tr>
    `).join("");
  }

  function clearResults() {
    resultBadge.textContent = "계산 전";
    allocationNote.textContent = "계산하면 종목별 권장 매수액과 매수 후 예상 비중이 여기에 표시됩니다.";
    metricContribution.textContent = "₩ 0";
    metricAfterTotal.textContent = "₩ 0";
    metricDrift.textContent = "0.0%p → 0.0%p";
    metricTopBuy.textContent = "없음";
    metricTopBuyMeta.textContent = "계산 후 표시됩니다.";
    resultTableBody.innerHTML = '<tr><td class="resultEmpty" colspan="6">입력 후 계산하면 결과가 나타납니다.</td></tr>';
  }

  function handleCalculate() {
    clearInvalidState();
    clearError();

    const contribution = parseNum(contributionInput.value);
    const rows = getRows();
    const validRows = validateRows(rows, contribution);
    if (!validRows) return;

    renderResults(validRows, contribution);
  }

  contributionInput.addEventListener("input", () => {
    formatInputWithComma(contributionInput);
    clearResults();
    clearError();
  });
  contributionInput.addEventListener("focus", clearError);
  addRowBtn.addEventListener("click", () => {
    addRow();
    clearResults();
  });
  calcBtn.addEventListener("click", handleCalculate);
  resetBtn.addEventListener("click", () => {
    contributionInput.value = "";
    replaceRows(DEFAULT_ROWS);
  });
  demoBtn.addEventListener("click", () => {
    contributionInput.value = DEMO_STATE.contribution;
    replaceRows(DEMO_STATE.rows);
    handleCalculate();
  });

  replaceRows(DEFAULT_ROWS);
})();
