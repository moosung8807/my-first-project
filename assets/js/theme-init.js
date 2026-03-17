(() => {
  const storedTheme = localStorage.getItem("rb-theme");
  const theme = storedTheme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", theme);
})();
