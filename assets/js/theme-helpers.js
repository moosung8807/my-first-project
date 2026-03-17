(function () {
  function setTheme(theme, themeKey, refs) {
    const nextTheme = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem(themeKey, nextTheme);

    if (refs.themeToggle) {
      const nextLabel = nextTheme === "dark" ? "화이트 테마" : "블랙 테마";
      refs.themeToggle.textContent = nextLabel;
      refs.themeToggle.setAttribute("aria-label", `${nextLabel}로 전환`);
      refs.themeToggle.setAttribute("title", `${nextLabel}로 전환`);
    }
  }

  window.RebalancingThemeHelpers = Object.freeze({
    setTheme
  });
})();
