(function () {
  function deleteRow(refs, tr, state, callbacks) {
    if (callbacks.rowCount() <= 1) {
      callbacks.showToast("최소 1개 행은 남겨야 해요.");
      return;
    }
    callbacks.hideNameSuggestions(tr);
    callbacks.clearRowQuoteState(tr);
    tr.remove();
    callbacks.updateTargetSumUI();
    callbacks.updateCurrentUI();

    if (state.mode === "result") {
      callbacks.setMode("current");
      callbacks.showToast("행이 변경되어 현재 보기로 돌아왔어요. 다시 계산하세요.");
    }
    callbacks.markDirtyIfNeeded();
    callbacks.hideErrorSummary();
    callbacks.clearInvalidMarks();
  }

  function setTradeCell(format, tr, tradeQty, decision) {
    const cell = tr.querySelector(".tradeQtyCell");
    const numEl = cell.querySelector(".tradeNum");
    const iconEl = cell.querySelector(".tradeIcon");

    numEl.textContent = tradeQty === 0 ? "0주" : (tradeQty < 0 ? "-" : "") + format.fmt(Math.abs(tradeQty)) + "주";

    iconEl.className = "tradeIcon " + (decision === "매수" ? "buy" : decision === "매도" ? "sell" : "hold");
    iconEl.textContent = decision === "매수" ? "▲" : decision === "매도" ? "▼" : "·";
  }

  function updateCurrentUI(refs, format, snapshotRows, callbacks) {
    const { rows, total } = snapshotRows();

    rows.forEach((r) => {
      r.tr.querySelector(".val").textContent = format.fmtKRW(r.value);
      r.tr.querySelector(".w").textContent = format.fmtPct01(r.weight);
    });

    refs.sumValue.textContent = format.fmtKRW(total);
    refs.sumWeight.textContent = format.fmtPct01(rows.reduce((s, r) => s + r.weight, 0));

    callbacks.setTotalSummary("현재 보유액", format.fmtKRW(total));
    if (refs.mobileTotalAssetLabel) {
      refs.mobileTotalAssetLabel.textContent = format.fmtKRW(total);
    }
  }

  function syncRowDisplayName(tr) {
    const nameInput = tr.querySelector(".name");
    const nameCell = tr.querySelector(".col-name");
    if (!nameInput || !nameCell) return;
    const raw = String(nameInput.value || "").trim();
    nameCell.setAttribute("data-name", raw || "종목명 미입력");
    nameCell.setAttribute("data-mobile-header", raw || "종목명 미입력");
    nameCell.setAttribute("data-mobile-decision", "유지");
  }

  window.RebalancingRowHelpers = Object.freeze({
    deleteRow,
    setTradeCell,
    syncRowDisplayName,
    updateCurrentUI
  });
})();
