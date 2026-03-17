(function () {
  function setTotalSummary(refs, keyText, valueText) {
    refs.sumTotalKey.textContent = keyText;
    refs.sumTotalLabel.textContent = valueText;
    if (refs.mobileSumTotalKey) refs.mobileSumTotalKey.textContent = keyText;
    if (refs.mobileSumTotalLabel) refs.mobileSumTotalLabel.textContent = valueText;
  }

  function setCashSummary(refs, valueText) {
    refs.cashLabel.textContent = valueText;
    if (refs.mobileCashLabel) refs.mobileCashLabel.textContent = valueText;
  }

  function resetSummaryKeyLabels(refs) {
    refs.sumTotalKey.textContent = "현재 보유액";
    if (refs.cashKey) refs.cashKey.textContent = "현금 잔액";
  }

  function applyResultSummaryKeyLabels(refs, afterHoldings, cashResidual, largeAmountWrapThreshold) {
    const shouldWrap = afterHoldings >= largeAmountWrapThreshold || cashResidual >= largeAmountWrapThreshold;
    refs.sumTotalKey.innerHTML = shouldWrap ? "매매 후<br>보유액" : "매매 후 보유액";
    if (refs.cashKey) {
      refs.cashKey.innerHTML = shouldWrap ? "현금<br>잔액" : "현금 잔액";
    }
  }

  function resetSummaryCounts(refs) {
    refs.buyCountEl.textContent = "0";
    refs.sellCountEl.textContent = "0";
    refs.holdCountEl.textContent = "0";
  }

  window.RebalancingSummaryHelpers = Object.freeze({
    applyResultSummaryKeyLabels,
    resetSummaryCounts,
    resetSummaryKeyLabels,
    setCashSummary,
    setTotalSummary
  });
})();
