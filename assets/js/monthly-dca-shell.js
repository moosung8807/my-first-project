(() => {
  const themeToggle = document.getElementById("themeToggle");
  const calcBtn = document.getElementById("monthlyHeroCalcBtn");
  const guideTemplate = document.querySelector("#guideTemplate");
  const guideTarget = document.querySelector("#desktopGuideContent");
  const guidePanel = document.querySelector("#guidePanel");
  const guidePanelToggle = document.querySelector("#guidePanelToggle");
  const guidePanelClose = document.querySelector("#guidePanelClose");
  const guidePanelOverlay = document.querySelector("#guidePanelOverlay");
  const guidePanelArrow = document.querySelector("#guidePanelArrow");
  const guideRailList = document.querySelector("#guideRailList");
  const guideRailRefreshBtn = document.querySelector("#guideRailRefreshBtn");
  const setTheme = window.RebalancingThemeHelpers && window.RebalancingThemeHelpers.setTheme;
  const travelToElement = window.RebalancingScrollHelpers && window.RebalancingScrollHelpers.travelToElement;
  const initGuideRail = window.RebalancingGuideRail && window.RebalancingGuideRail.initGuideRail;
  const THEME_KEY = "rb-theme";

  function applyThemeButtonState() {
    if (!themeToggle || !setTheme) return;
    const currentTheme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    setTheme(currentTheme, THEME_KEY, { themeToggle });
  }

  function scrollToTarget(selector) {
    const target = document.querySelector(selector);
    if (!target) return;
    if (travelToElement) {
      travelToElement(target, { desktopOnly: true });
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setGuidePanelOpen(nextOpen) {
    const open = Boolean(nextOpen);
    if (!guidePanel || !guidePanelToggle || !guidePanelOverlay || !guidePanelArrow) return;
    guidePanel.classList.toggle("open", open);
    guidePanelOverlay.hidden = !open;
    guidePanelToggle.setAttribute("aria-expanded", open ? "true" : "false");
    guidePanelToggle.setAttribute("aria-label", open ? "월 적립식 매수 계산기 사용방법 닫기" : "월 적립식 매수 계산기 사용방법 열기");
    guidePanelArrow.textContent = open ? "◀" : "▶";
    document.body.classList.toggle("guide-panel-open", open);
  }

  applyThemeButtonState();

  if (initGuideRail) {
    initGuideRail({
      listEl: guideRailList,
      refreshBtn: guideRailRefreshBtn,
      pathPrefix: "../"
    });
  }

  if (guideTemplate && guideTarget) {
    guideTarget.replaceChildren(guideTemplate.content.cloneNode(true));
  }

  if (themeToggle && setTheme) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      setTheme(nextTheme, THEME_KEY, { themeToggle });
    });
  }

  if (calcBtn) {
    calcBtn.addEventListener("click", () => scrollToTarget("#dcaWorkspace"));
  }

  if (guidePanelToggle) {
    guidePanelToggle.addEventListener("click", () => {
      const isOpen = guidePanel && guidePanel.classList.contains("open");
      setGuidePanelOpen(!isOpen);
    });
  }

  if (guidePanelClose) {
    guidePanelClose.addEventListener("click", () => setGuidePanelOpen(false));
  }

  if (guidePanelOverlay) {
    guidePanelOverlay.addEventListener("click", () => setGuidePanelOpen(false));
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setGuidePanelOpen(false);
    }
  });
})();
