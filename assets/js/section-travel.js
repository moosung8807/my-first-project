(() => {
  const DESKTOP_QUERY = "(min-width: 1025px)";
  const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
  const activeState = {
    arrivedTimer: 0,
    cleanupTimer: 0,
    frameId: 0,
    target: null
  };

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function cancelActiveTravel() {
    if (activeState.frameId) {
      cancelAnimationFrame(activeState.frameId);
      activeState.frameId = 0;
    }
    if (activeState.cleanupTimer) {
      clearTimeout(activeState.cleanupTimer);
      activeState.cleanupTimer = 0;
    }
    if (activeState.arrivedTimer && activeState.target) {
      clearTimeout(activeState.arrivedTimer);
      activeState.target.classList.remove("sectionTravelArrived");
      activeState.arrivedTimer = 0;
    }
    if (activeState.target) {
      activeState.target.classList.remove("sectionTravelTarget");
      activeState.target = null;
    }
    document.body.classList.remove("sectionTraveling");
  }

  function getScrollOffset(target, explicitOffset) {
    if (Number.isFinite(explicitOffset)) {
      return explicitOffset;
    }
    const styles = window.getComputedStyle(target);
    const scrollMarginTop = parseFloat(styles.scrollMarginTop || "0");
    return Number.isFinite(scrollMarginTop) ? scrollMarginTop : 0;
  }

  function finishTravel(target, options) {
    document.body.classList.remove("sectionTraveling");
    target.classList.remove("sectionTravelTarget");
    target.classList.add("sectionTravelArrived");
    activeState.arrivedTimer = window.setTimeout(() => {
      target.classList.remove("sectionTravelArrived");
      if (activeState.target === target) {
        activeState.target = null;
      }
      activeState.arrivedTimer = 0;
    }, 820);
    if (typeof options.onComplete === "function") {
      options.onComplete();
    }
  }

  function fallbackScroll(target, options) {
    const offset = getScrollOffset(target, options.offset);
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset);
    const behavior = window.matchMedia(REDUCED_MOTION_QUERY).matches ? "auto" : "smooth";
    window.scrollTo({ top, behavior });
    if (typeof options.onComplete === "function") {
      window.setTimeout(() => options.onComplete(), behavior === "smooth" ? 260 : 0);
    }
  }

  function easeTravel(progress) {
    return progress >= 1 ? 1 : 1 - Math.pow(1 - progress, 5);
  }

  function travelToElement(target, options = {}) {
    if (!target) return;

    const desktopOnly = options.desktopOnly !== false;
    const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const isDesktop = window.matchMedia(DESKTOP_QUERY).matches;

    if (prefersReducedMotion || (desktopOnly && !isDesktop)) {
      fallbackScroll(target, options);
      return;
    }

    cancelActiveTravel();

    const startY = window.scrollY;
    const offset = getScrollOffset(target, options.offset);
    const targetY = Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset);
    const distance = Math.abs(targetY - startY);

    if (distance < 180) {
      fallbackScroll(target, options);
      return;
    }

    const duration = clamp(860 + distance * 0.14, 920, 1320);
    const startTime = performance.now();
    activeState.target = target;

    target.classList.add("sectionTravelTarget");
    document.body.classList.add("sectionTraveling");

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = easeTravel(progress);
      const nextY = startY + (targetY - startY) * eased;

      window.scrollTo(0, nextY);

      if (progress < 1) {
        activeState.frameId = requestAnimationFrame(step);
        return;
      }

      activeState.frameId = 0;
      window.scrollTo(0, targetY);
      activeState.cleanupTimer = window.setTimeout(() => {
        activeState.cleanupTimer = 0;
        finishTravel(target, options);
      }, 40);
    };

    activeState.frameId = requestAnimationFrame(step);
  }

  window.RebalancingScrollHelpers = Object.freeze({
    travelToElement
  });
})();
