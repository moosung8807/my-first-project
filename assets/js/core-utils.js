(function () {
  function requestPortfolioName() {
    const saved = String(localStorage.getItem("rb-portfolio-name") || "My Portfolio").trim() || "My Portfolio";
    const input = window.prompt("포트폴리오 이름을 입력하세요.", saved);
    if (input === null) return null;
    const nextName = String(input).trim() || "My Portfolio";
    localStorage.setItem("rb-portfolio-name", nextName);
    return nextName;
  }

  function waitForImagesLoaded(root) {
    const images = [...(root?.querySelectorAll?.("img") || [])];
    if (images.length === 0) return Promise.resolve();
    return Promise.all(images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        const done = () => resolve();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
    })).then(() => undefined);
  }

  function formatReportDate(date) {
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }

  function classifyAssetBucket(name) {
    const n = String(name || "").toLowerCase();
    if (n.includes("채") || n.includes("bond") || n.includes("국고")) return "채권";
    if (n.includes("골드") || n.includes("금") || n.includes("gold")) return "금/원자재";
    if (n.includes("cash") || n.includes("현금")) return "현금";
    if (
      n.includes("주식") ||
      n.includes("stock") ||
      n.includes("equity") ||
      n.includes("나스닥") ||
      n.includes("nasdaq") ||
      n.includes("s&p") ||
      n.includes("sp500") ||
      n.includes("코스피")
    ) return "주식";
    return "기타";
  }

  window.RebalancingUtils = Object.freeze({
    classifyAssetBucket,
    formatReportDate,
    requestPortfolioName,
    waitForImagesLoaded
  });
})();
