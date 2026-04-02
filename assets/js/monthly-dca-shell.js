(() => {
  const themeToggle = document.getElementById("themeToggle");
  const calcBtn = document.getElementById("monthlyHeroCalcBtn");
  const guideBtn = document.getElementById("monthlyHeroGuideBtn");
  const setTheme = window.RebalancingThemeHelpers && window.RebalancingThemeHelpers.setTheme;
  const THEME_KEY = "rb-theme";

  function applyThemeButtonState() {
    if (!themeToggle || !setTheme) return;
    const currentTheme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    setTheme(currentTheme, THEME_KEY, { themeToggle });
  }

  function scrollToTarget(selector) {
    const target = document.querySelector(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  applyThemeButtonState();

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

  if (guideBtn) {
    guideBtn.addEventListener("click", () => scrollToTarget("#monthlyGuide"));
  }
})();
