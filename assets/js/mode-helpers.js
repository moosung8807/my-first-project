(function () {
  function setRowDetailOpen(tr, open) {
    if (!tr) return;
    const nextOpen = Boolean(open);
    tr.classList.toggle("mobile-details-open", nextOpen);
    const btn = tr.querySelector(".detailToggleBtn");
    if (btn) {
      btn.setAttribute("aria-expanded", nextOpen ? "true" : "false");
      btn.textContent = nextOpen ? "접기" : "상세 보기";
    }
  }

  function setMode(refs, nextMode, state, callbacks) {
    state.mode = nextMode;
    callbacks.hideAllNameSuggestions();

    const inputEls = document.querySelectorAll(".g-input");
    const currentEls = document.querySelectorAll(".g-current");
    const resultEls = document.querySelectorAll(".g-result");

    if (state.mode === "current") {
      inputEls.forEach((el) => el.classList.remove("hide"));
      currentEls.forEach((el) => el.classList.add("hide"));
      resultEls.forEach((el) => el.classList.add("hide"));
      refs.calcBtn.textContent = "계산";
      if (refs.mobileCalcBtn) refs.mobileCalcBtn.textContent = "계산하기";
      refs.tableCard.classList.add("mode-current");
      refs.tableCard.classList.remove("mode-result");
      refs.modeLabel.textContent = "입력";
      if (refs.mobileResultList) {
        refs.mobileResultList.hidden = true;
        refs.mobileResultList.innerHTML = "";
      }
      if (refs.mobileDetailToggle) {
        refs.mobileDetailToggle.hidden = true;
        refs.mobileDetailToggle.textContent = "상세 보기";
        refs.mobileDetailToggle.setAttribute("aria-expanded", "false");
      }
      refs.tableCard.classList.remove("mobile-details-open-global");

      refs.cashPill.classList.remove("negative");
      callbacks.setCashSummary(callbacks.fmtKRW(0));
      callbacks.setTotalSummary("현재 보유액", document.querySelector("#sumValue").textContent);
      callbacks.resetSummaryKeyLabels();
      callbacks.resetSummaryCounts();
      refs.tbody.querySelectorAll("tr").forEach((tr) => callbacks.setRowDetailOpen(tr, false));
    } else {
      inputEls.forEach((el) => el.classList.add("hide"));
      currentEls.forEach((el) => el.classList.add("hide"));
      resultEls.forEach((el) => el.classList.remove("hide"));
      refs.calcBtn.textContent = "현재 보기";
      if (refs.mobileCalcBtn) refs.mobileCalcBtn.textContent = "입력 보기";
      refs.tableCard.classList.add("mode-result");
      refs.tableCard.classList.remove("mode-current");
      refs.modeLabel.textContent = "결과";
      callbacks.setDirtyState(false);
      refs.tbody.querySelectorAll("tr").forEach((tr) => callbacks.setRowDetailOpen(tr, false));
      if (refs.mobileResultList) {
        refs.mobileResultList.hidden = false;
      }
      if (refs.mobileDetailToggle) {
        refs.mobileDetailToggle.hidden = false;
        refs.mobileDetailToggle.textContent = "상세 보기";
        refs.mobileDetailToggle.setAttribute("aria-expanded", "false");
      }
      refs.tableCard.classList.remove("mobile-details-open-global");
    }

    callbacks.updateExportPdfButtonState();
  }

  window.RebalancingModeHelpers = Object.freeze({
    setMode,
    setRowDetailOpen
  });
})();
