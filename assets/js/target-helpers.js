(function () {
  function sumTargets(refs, format, exceptInput = null) {
    let sum = 0;
    const inputs = refs.tbody.querySelectorAll(".target");
    inputs.forEach((inp) => {
      if (inp === exceptInput) return;
      sum += format.clampMin0(format.parseNum(inp.value));
    });
    return sum;
  }

  function updateProgress(refs, sumPct) {
    const clamped = Math.max(0, sumPct);
    const widthPct = Math.min(100, clamped);
    refs.progressBar.style.width = widthPct + "%";
    refs.progressText.textContent = clamped.toFixed(1) + "%";
    if (refs.mobileProgressText) refs.mobileProgressText.textContent = clamped.toFixed(1) + "%";
    refs.progressWrap.classList.toggle("over", clamped > 100.0001);
  }

  function updateTargetSumUI(refs, format, callbacks) {
    const sum = sumTargets(refs, format, null);
    refs.sumTargetEl.textContent = sum.toFixed(1);
    refs.sumTargetEl.style.color = sum > 100.0001 ? "var(--sell)" : "var(--sum-ok)";
    if (refs.mobileTargetSumLabel) {
      refs.mobileTargetSumLabel.textContent = `${sum.toFixed(1)}%`;
    }
    callbacks.updateProgress(sum);
    callbacks.updateCalcActionState(sum);
  }

  function attachTargetGuard(targetInput, format, callbacks) {
    targetInput.addEventListener("input", () => {
      const rawValue = format.parseNum(targetInput.value);
      let v = format.clampMin0(rawValue);
      if (rawValue < 0) targetInput.value = "0";
      if (v > 100) {
        targetInput.value = "100";
      }
      callbacks.updateTargetSumUI();
    });

    targetInput.addEventListener("blur", () => {
      if (String(targetInput.value).trim() === "") {
        callbacks.updateTargetSumUI();
        return;
      }
      let v = format.clampMin0(format.parseNum(targetInput.value));
      if (v > 100) v = 100;
      targetInput.value = (Math.round(v * 100) / 100).toString();
      callbacks.updateTargetSumUI();
    });
  }

  function rowCount(refs) {
    return refs.tbody.querySelectorAll("tr").length;
  }

  window.RebalancingTargetHelpers = Object.freeze({
    attachTargetGuard,
    rowCount,
    sumTargets,
    updateProgress,
    updateTargetSumUI
  });
})();
