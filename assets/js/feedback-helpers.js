(function () {
  function showToast(refs, message, state) {
    refs.toastMsg.textContent = message;
    refs.toast.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => refs.toast.classList.remove("show"), 1700);
  }

  function scrollToEl(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearInvalidMarks() {
    document.querySelectorAll(".invalidField").forEach((el) => el.classList.remove("invalidField"));
  }

  function hideErrorSummary(refs) {
    if (!refs.errorSummary) return;
    refs.errorSummary.hidden = true;
    refs.errorSummary.textContent = "";
  }

  function showErrorSummary(refs, message, onFallbackToast) {
    if (!refs.errorSummary) {
      onFallbackToast(message);
      return;
    }
    refs.errorSummary.textContent = message;
    refs.errorSummary.hidden = false;
  }

  function focusInvalidField(el) {
    if (!el) return;
    el.classList.add("invalidField");
    scrollToEl(el);
    el.focus({ preventScroll: true });
  }

  window.RebalancingFeedbackHelpers = Object.freeze({
    clearInvalidMarks,
    focusInvalidField,
    hideErrorSummary,
    scrollToEl,
    showErrorSummary,
    showToast
  });
})();
