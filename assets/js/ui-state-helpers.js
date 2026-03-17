(function () {
  function setDirtyState(refs, next, state, callbacks) {
    state.isDirtyAfterCalc = Boolean(next);
    callbacks.updateExportPdfButtonState();
    if (!refs.staleBadge) return;

    if (!state.hasComputed) {
      refs.staleBadge.hidden = true;
      refs.staleBadge.classList.remove("dirty", "clean");
      refs.staleBadge.textContent = "입력 변경됨 · 다시 계산 필요";
      return;
    }

    refs.staleBadge.hidden = false;
    refs.staleBadge.classList.toggle("dirty", state.isDirtyAfterCalc);
    refs.staleBadge.classList.toggle("clean", !state.isDirtyAfterCalc);
    refs.staleBadge.textContent = state.isDirtyAfterCalc
      ? "입력 변경됨 · 다시 계산 필요"
      : "최신 계산 결과가 반영됨";
  }

  function markDirtyIfNeeded(state, callbacks) {
    if (state.hasComputed && state.mode === "current") {
      callbacks.setDirtyState(true);
    }
  }

  function showEditWarningNearInput(refs, inputEl, state) {
    if (!refs.editWarningFloat || !inputEl) return;
    const rect = inputEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const bubbleWidth = Math.min(280, vw - 16);
    let left = rect.left + rect.width / 2 - bubbleWidth / 2;
    let top = rect.top - 44;

    if (left < 8) left = 8;
    if (left + bubbleWidth > vw - 8) left = vw - bubbleWidth - 8;
    if (top < 8) top = rect.bottom + 8;

    refs.editWarningFloat.style.width = `${bubbleWidth}px`;
    refs.editWarningFloat.style.left = `${left}px`;
    refs.editWarningFloat.style.top = `${top}px`;
    refs.editWarningFloat.hidden = false;

    clearTimeout(state.editWarningFloatTimer);
    state.editWarningFloatTimer = setTimeout(() => {
      refs.editWarningFloat.hidden = true;
    }, 2200);
  }

  function switchToCurrentOnEdit(state, inputEl, callbacks) {
    if (state.mode !== "result") return;
    callbacks.setMode("current");
    callbacks.showEditWarningNearInput(inputEl);
  }

  function warnOnResultFocus(state, inputEl, callbacks) {
    if (state.mode !== "result") return;
    callbacks.showEditWarningNearInput(inputEl);
  }

  window.RebalancingUiStateHelpers = Object.freeze({
    markDirtyIfNeeded,
    setDirtyState,
    showEditWarningNearInput,
    switchToCurrentOnEdit,
    warnOnResultFocus
  });
})();
