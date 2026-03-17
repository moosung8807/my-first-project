(function () {
  function parseNum(v) {
    const n = Number(String(v).replaceAll(",", "").trim());
    return Number.isFinite(n) ? n : 0;
  }

  function toDigits(str) {
    return String(str || "").replace(/[^\d]/g, "");
  }

  function withComma(numStr) {
    if (!numStr) return "";
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function formatInputWithComma(el) {
    const before = el.value;
    const start = el.selectionStart ?? before.length;
    const digitsBeforeCursor = toDigits(before.slice(0, start)).length;

    const digits = toDigits(before);
    const formatted = withComma(digits);
    el.value = formatted;

    if (document.activeElement !== el) return;
    let pos = 0;
    let digitCount = 0;
    while (pos < formatted.length) {
      if (/\d/.test(formatted[pos])) digitCount += 1;
      pos += 1;
      if (digitCount >= digitsBeforeCursor) break;
    }
    el.setSelectionRange(pos, pos);
  }

  function clampMin0(n) {
    return n < 0 ? 0 : n;
  }

  function fmt(n) {
    return Number.isFinite(n) ? n.toLocaleString("ko-KR") : "0";
  }

  function fmtKRW(n) {
    return "₩ " + fmt(Math.round(n));
  }

  function fmtPct01(x) {
    return Number.isFinite(x) ? (x * 100).toFixed(1) + "%" : "0.0%";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parseNumberFromText(text) {
    const num = Number(String(text ?? "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(num) ? num : 0;
  }

  window.RebalancingFormat = Object.freeze({
    clampMin0,
    escapeHtml,
    fmt,
    fmtKRW,
    fmtPct01,
    formatInputWithComma,
    parseNum,
    parseNumberFromText,
    withComma,
  });
})();
