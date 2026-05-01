(() => {
  const button = document.getElementById("backToTopButton");
  const desktopQuery = window.matchMedia("(min-width: 769px)");
  const visibleClass = "isVisible";
  const threshold = 520;

  if (!button) return;

  function updateVisibility() {
    const shouldShow = desktopQuery.matches && window.scrollY > threshold;
    button.hidden = !shouldShow;
    button.classList.toggle(visibleClass, shouldShow);
  }

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", updateVisibility, { passive: true });
  window.addEventListener("resize", updateVisibility);

  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener("change", updateVisibility);
  }

  updateVisibility();
})();
