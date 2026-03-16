const fs = require("fs");
const path = require("path");
const opentype = require(fs.existsSync("/tmp/opentype.js")
  ? "/tmp/opentype.js"
  : "/tmp/opentype-build/node_modules/opentype.js");

const root = path.resolve(__dirname, "..");
const ogDir = path.join(root, "assets", "og");
const fontsDir = path.join(root, "assets", "fonts");

const font400 = opentype.loadSync(path.join(fontsDir, "noto-sans-kr-400.ttf"));
const font700 = opentype.loadSync(path.join(fontsDir, "noto-sans-kr-700.ttf"));
const font800 = opentype.loadSync(path.join(fontsDir, "noto-sans-kr-800.ttf"));

function escape(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function textWidth({ text, size, font, letterSpacing = 0 }) {
  const scale = size / font.unitsPerEm;
  const tracking = letterSpacing * size;
  let total = 0;

  for (let i = 0; i < text.length; i += 1) {
    const glyph = font.charToGlyph(text[i]);
    total += glyph.advanceWidth * scale;
    if (i < text.length - 1) {
      total += tracking;
    }
  }

  return total;
}

function textPath({
  text,
  x,
  y,
  size,
  fill,
  font,
  letterSpacing = 0,
  anchor = "start",
}) {
  const scale = size / font.unitsPerEm;
  const tracking = letterSpacing * size;
  let cursorX = x;

  if (anchor !== "start") {
    const width = textWidth({ text, size, font, letterSpacing });
    if (anchor === "middle") {
      cursorX -= width / 2;
    } else if (anchor === "end") {
      cursorX -= width;
    }
  }

  let d = "";
  for (let i = 0; i < text.length; i += 1) {
    const glyph = font.charToGlyph(text[i]);
    const glyphPath = glyph.getPath(cursorX, y, size);
    d += `${glyphPath.toPathData(2)} `;
    cursorX += glyph.advanceWidth * scale + tracking;
  }

  return `<path d="${d.trim()}" fill="${fill}" aria-label="${escape(text)}" />`;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="96" y1="40" x2="1098" y2="590" gradientUnits="userSpaceOnUse">
      <stop stop-color="#E8F5FF"/>
      <stop offset="0.52" stop-color="#CFEAFC"/>
      <stop offset="1" stop-color="#B9DCF5"/>
    </linearGradient>
    <radialGradient id="glowA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(964 118) rotate(135) scale(430 310)">
      <stop stop-color="#69BEF0" stop-opacity="0.24"/>
      <stop offset="1" stop-color="#8ED8FF" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(220 520) rotate(24) scale(520 220)">
      <stop stop-color="#9FDCF8" stop-opacity="0.3"/>
      <stop offset="1" stop-color="#B7F0FF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="card" x1="0" y1="0" x2="356" y2="420" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F7F8FB"/>
      <stop offset="1" stop-color="#DCE3E8"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="308" y2="88" gradientUnits="userSpaceOnUse">
      <stop stop-color="#D9DED6"/>
      <stop offset="1" stop-color="#BEC7BB"/>
    </linearGradient>
    <linearGradient id="cta" x1="0" y1="0" x2="220" y2="64" gradientUnits="userSpaceOnUse">
      <stop stop-color="#B9DD58"/>
      <stop offset="1" stop-color="#9FC63E"/>
    </linearGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#D5E0E7"/>
    </linearGradient>
    <filter id="softBlur" x="0" y="0" width="1200" height="630" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="0.4"/>
    </filter>
    <filter id="grain" x="0" y="0" width="1200" height="630" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.05"/>
      </feComponentTransfer>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glowA)"/>
  <rect width="1200" height="630" fill="url(#glowB)"/>

  <g opacity="0.14" filter="url(#softBlur)">
    <circle cx="118" cy="98" r="2.6" fill="#7EC7F8"/>
    <circle cx="406" cy="82" r="2.1" fill="#92D7FF"/>
    <circle cx="514" cy="165" r="1.7" fill="#6BC8D8"/>
    <circle cx="672" cy="104" r="2.3" fill="#8DD9FF"/>
    <circle cx="782" cy="184" r="1.9" fill="#7ABEF8"/>
    <circle cx="1086" cy="214" r="1.6" fill="#76C8F7"/>
    <circle cx="154" cy="392" r="1.9" fill="#9DDFFF"/>
    <circle cx="294" cy="458" r="2.2" fill="#7CCCF3"/>
    <circle cx="642" cy="496" r="2.4" fill="#8DD8FF"/>
    <circle cx="946" cy="472" r="1.8" fill="#8BD1FC"/>
    <circle cx="1114" cy="532" r="2" fill="#77C8F1"/>
  </g>

  <g opacity="0.1">
    <path d="M80 150C240 210 420 320 650 410" stroke="#78BCE7" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M140 110C320 180 500 300 730 390" stroke="#8CCAF0" stroke-width="1" stroke-linecap="round"/>
  </g>

  <g opacity="0.72">
    <rect x="82" y="78" width="178" height="34" rx="17" fill="#F7FBFF" fill-opacity="0.88" stroke="#9FCBE8"/>
    ${textPath({ text: "복잡한 계산은 빼고", x: 171, y: 100, size: 12, fill: "#155C92", font: font700, anchor: "middle" })}

    ${textPath({ text: "비중 정리는", x: 84, y: 214, size: 80, fill: "#0A2E4E", font: font800, letterSpacing: -0.04 })}
    ${textPath({ text: "딸깍 한 번", x: 84, y: 298, size: 80, fill: "#0A2E4E", font: font800, letterSpacing: -0.04 })}
    ${textPath({ text: "simple · fast · no spreadsheet", x: 84, y: 346, size: 26, fill: "#3F6587", font: font700, letterSpacing: -0.01 })}

    <rect x="84" y="378" width="560" height="2" fill="#7BAED3"/>

    ${textPath({ text: "목표 비중만 넣으면 필요한 수량이 바로 보입니다", x: 84, y: 438, size: 23, fill: "#365B7B", font: font700, letterSpacing: -0.02 })}
    ${textPath({ text: "엑셀 없이 매수·매도만 빠르게 확인하세요", x: 84, y: 478, size: 23, fill: "#365B7B", font: font700, letterSpacing: -0.02 })}
    ${textPath({ text: "www.rebalancing.kr", x: 84, y: 530, size: 18, fill: "#4C7599", font: font700, letterSpacing: 0.01 })}
  </g>

  <g transform="translate(700 80)">
    <rect width="412" height="468" rx="20" fill="url(#card)" stroke="#AAB8C1" stroke-width="1.8"/>
    <rect x="0.5" y="0.5" width="411" height="467" rx="19.5" stroke="#F5FBFD" stroke-opacity="0.56"/>
    <rect x="10" y="10" width="392" height="448" rx="24" fill="none" stroke="#FFFFFF" stroke-opacity="0.6"/>
    <circle cx="26" cy="26" r="4" fill="url(#metal)" stroke="#B6C4CC"/>
    <circle cx="386" cy="26" r="4" fill="url(#metal)" stroke="#B6C4CC"/>
    <circle cx="26" cy="442" r="4" fill="url(#metal)" stroke="#B6C4CC"/>
    <circle cx="386" cy="442" r="4" fill="url(#metal)" stroke="#B6C4CC"/>
    <rect x="22" y="22" width="368" height="424" rx="16" fill="#ECF1F4" fill-opacity="0.42" stroke="#C6D2D9" stroke-opacity="0.72"/>
    ${textPath({ text: "RB-12", x: 52, y: 48, size: 11, fill: "#5D7380", font: font700, letterSpacing: 0.08 })}
    ${textPath({ text: "REBALANCER", x: 368, y: 48, size: 11, fill: "#5D7380", font: font700, anchor: "end", letterSpacing: 0.08 })}

    <rect x="24" y="30" width="362" height="96" rx="12" fill="url(#panel)" stroke="#8B998B" stroke-width="1.8"/>
    <rect x="36" y="42" width="338" height="72" rx="8" fill="#D8E1D4" stroke="#A4AEA2" stroke-width="1.1"/>
    <circle cx="60" cy="74" r="4.5" fill="#92A289"/>
    <circle cx="76" cy="74" r="4.5" fill="#A5B49A"/>
    <circle cx="92" cy="74" r="4.5" fill="#BBC8B2"/>
    ${textPath({ text: "TARGET", x: 48, y: 62, size: 14, fill: "#42524B", font: font700, letterSpacing: 0.08 })}
    ${textPath({ text: "25%", x: 357, y: 95, size: 45, fill: "#273731", font: font800, anchor: "end", letterSpacing: -0.05 })}

    <rect x="24" y="148" width="362" height="126" rx="12" fill="#EEF3F6" stroke="#C2CFD6" stroke-width="1.2"/>
    <rect x="36" y="160" width="162" height="46" rx="9" fill="#F8FBFC" stroke="#C8D5DC" stroke-width="1.1"/>
    <rect x="212" y="160" width="162" height="46" rx="9" fill="#F8FBFC" stroke="#C8D5DC" stroke-width="1.1"/>
    <rect x="36" y="216" width="338" height="46" rx="9" fill="#DCE6EB" stroke="#B3C5CF" stroke-width="1"/>
    ${textPath({ text: "PRICE", x: 48, y: 178, size: 12, fill: "#4A5C56", font: font700, letterSpacing: 0.08 })}
    ${textPath({ text: "72,000", x: 184, y: 192, size: 26, fill: "#2C3C36", font: font800, anchor: "end", letterSpacing: -0.04 })}
    ${textPath({ text: "OWNED", x: 224, y: 178, size: 12, fill: "#4A5C56", font: font700, letterSpacing: 0.08 })}
    ${textPath({ text: "128", x: 360, y: 192, size: 26, fill: "#2C3C36", font: font800, anchor: "end", letterSpacing: -0.04 })}
    ${textPath({ text: "YOU NEED", x: 48, y: 234, size: 13, fill: "#415A6B", font: font700, letterSpacing: 0.08 })}
    ${textPath({ text: "+12 SHARES", x: 360, y: 248, size: 27, fill: "#1E3344", font: font800, anchor: "end", letterSpacing: -0.03 })}

    <rect x="24" y="286" width="362" height="156" rx="16" fill="#EDF3F6" stroke="#C2CFD6" stroke-width="1.2"/>
    <rect x="36" y="300" width="338" height="2" rx="1" fill="#D5E1E7"/>
    <circle cx="58" cy="318" r="17" fill="#FCFEFF" stroke="#CFDBE1" stroke-width="1.15"/>
    <circle cx="114" cy="318" r="17" fill="#FCFEFF" stroke="#CFDBE1" stroke-width="1.15"/>
    <circle cx="170" cy="318" r="17" fill="#FCFEFF" stroke="#CFDBE1" stroke-width="1.15"/>
    <circle cx="226" cy="318" r="17" fill="#EEF4EE" stroke="#C5D2C8" stroke-width="1.15"/>
    <circle cx="282" cy="318" r="17" fill="#EEF4EE" stroke="#C5D2C8" stroke-width="1.15"/>
    <circle cx="338" cy="318" r="17" fill="#EEF4EE" stroke="#C5D2C8" stroke-width="1.15"/>
    <circle cx="58" cy="353" r="17" fill="#FCFEFF" stroke="#CFDBE1" stroke-width="1.15"/>
    <circle cx="114" cy="353" r="17" fill="#FCFEFF" stroke="#CFDBE1" stroke-width="1.15"/>
    <circle cx="170" cy="353" r="17" fill="#FCFEFF" stroke="#CFDBE1" stroke-width="1.15"/>
    <circle cx="226" cy="353" r="17" fill="#EEF4EE" stroke="#C5D2C8" stroke-width="1.15"/>
    <circle cx="282" cy="353" r="17" fill="#EEF4EE" stroke="#C5D2C8" stroke-width="1.15"/>
    <circle cx="338" cy="353" r="17" fill="#EEF4EE" stroke="#C5D2C8" stroke-width="1.15"/>
    <circle cx="58" cy="388" r="17" fill="#FCFEFF" stroke="#CFDBE1" stroke-width="1.15"/>
    <circle cx="114" cy="388" r="17" fill="#FCFEFF" stroke="#CFDBE1" stroke-width="1.15"/>
    <circle cx="170" cy="388" r="17" fill="#FCFEFF" stroke="#CFDBE1" stroke-width="1.15"/>
    <circle cx="226" cy="388" r="17" fill="#EEF4EE" stroke="#C5D2C8" stroke-width="1.15"/>
    <circle cx="282" cy="388" r="17" fill="#EEF4EE" stroke="#C5D2C8" stroke-width="1.15"/>
    <circle cx="338" cy="388" r="17" fill="#EEF4EE" stroke="#C5D2C8" stroke-width="1.15"/>
    <circle cx="58" cy="421" r="17" fill="#EEF4EE" stroke="#C5D2C8" stroke-width="1.15"/>
    <circle cx="114" cy="421" r="17" fill="#FCFEFF" stroke="#CFDBE1" stroke-width="1.15"/>
    <circle cx="170" cy="421" r="17" fill="#FCFEFF" stroke="#CFDBE1" stroke-width="1.15"/>
    <circle cx="226" cy="421" r="17" fill="#EEF4EE" stroke="#C5D2C8" stroke-width="1.15"/>
    <circle cx="282" cy="421" r="17" fill="#EEF4EE" stroke="#C5D2C8" stroke-width="1.15"/>
    <rect x="320" y="404" width="36" height="34" rx="13" fill="url(#cta)" stroke="#96B82F" stroke-width="1.2"/>
    <rect x="44" y="306" width="28" height="21" rx="9" fill="#EFF4F7" opacity="0.52"/>
    <rect x="100" y="306" width="28" height="21" rx="9" fill="#EFF4F7" opacity="0.52"/>
    <rect x="156" y="306" width="28" height="21" rx="9" fill="#EFF4F7" opacity="0.52"/>
    <rect x="212" y="306" width="28" height="21" rx="9" fill="#E5EDE5" opacity="0.7"/>
    <rect x="268" y="306" width="28" height="21" rx="9" fill="#E5EDE5" opacity="0.7"/>
    <rect x="324" y="306" width="28" height="21" rx="9" fill="#E5EDE5" opacity="0.7"/>
    <rect x="44" y="341" width="28" height="21" rx="9" fill="#EFF4F7" opacity="0.52"/>
    <rect x="100" y="341" width="28" height="21" rx="9" fill="#EFF4F7" opacity="0.52"/>
    <rect x="156" y="341" width="28" height="21" rx="9" fill="#EFF4F7" opacity="0.52"/>
    <rect x="212" y="341" width="28" height="21" rx="9" fill="#E5EDE5" opacity="0.7"/>
    <rect x="268" y="341" width="28" height="21" rx="9" fill="#E5EDE5" opacity="0.7"/>
    <rect x="324" y="341" width="28" height="21" rx="9" fill="#E5EDE5" opacity="0.7"/>
    <rect x="44" y="376" width="28" height="21" rx="9" fill="#EFF4F7" opacity="0.52"/>
    <rect x="100" y="376" width="28" height="21" rx="9" fill="#EFF4F7" opacity="0.52"/>
    <rect x="156" y="376" width="28" height="21" rx="9" fill="#EFF4F7" opacity="0.52"/>
    <rect x="212" y="376" width="28" height="21" rx="9" fill="#E5EDE5" opacity="0.7"/>
    <rect x="268" y="376" width="28" height="21" rx="9" fill="#E5EDE5" opacity="0.7"/>
    <rect x="324" y="376" width="28" height="21" rx="9" fill="#E5EDE5" opacity="0.7"/>
    <rect x="44" y="409" width="28" height="21" rx="9" fill="#E5EDE5" opacity="0.7"/>
    <rect x="100" y="409" width="28" height="21" rx="9" fill="#EFF4F7" opacity="0.52"/>
    <rect x="156" y="409" width="28" height="21" rx="9" fill="#EFF4F7" opacity="0.52"/>
    <rect x="212" y="409" width="28" height="21" rx="9" fill="#E5EDE5" opacity="0.7"/>
    <rect x="268" y="409" width="28" height="21" rx="9" fill="#E5EDE5" opacity="0.7"/>
    <rect x="326" y="410" width="24" height="20" rx="9" fill="#CBE37B" opacity="0.28"/>
    ${textPath({ text: "7", x: 58, y: 323, size: 13, fill: "#5B6C61", font: font700, anchor: "middle" })}
    ${textPath({ text: "8", x: 114, y: 323, size: 13, fill: "#5B6C61", font: font700, anchor: "middle" })}
    ${textPath({ text: "9", x: 170, y: 323, size: 13, fill: "#5B6C61", font: font700, anchor: "middle" })}
    ${textPath({ text: "%", x: 226, y: 322, size: 11.5, fill: "#5F7167", font: font700, anchor: "middle" })}
    ${textPath({ text: "×", x: 282, y: 323, size: 13, fill: "#5F7167", font: font700, anchor: "middle" })}
    ${textPath({ text: "÷", x: 338, y: 323, size: 13, fill: "#5F7167", font: font700, anchor: "middle" })}
    ${textPath({ text: "4", x: 58, y: 358, size: 13, fill: "#5B6C61", font: font700, anchor: "middle" })}
    ${textPath({ text: "5", x: 114, y: 358, size: 13, fill: "#5B6C61", font: font700, anchor: "middle" })}
    ${textPath({ text: "6", x: 170, y: 358, size: 13, fill: "#5B6C61", font: font700, anchor: "middle" })}
    ${textPath({ text: "(", x: 226, y: 358, size: 13, fill: "#5F7167", font: font700, anchor: "middle" })}
    ${textPath({ text: ")", x: 282, y: 358, size: 13, fill: "#5F7167", font: font700, anchor: "middle" })}
    ${textPath({ text: "-", x: 338, y: 357, size: 15, fill: "#5F7167", font: font700, anchor: "middle" })}
    ${textPath({ text: "1", x: 58, y: 393, size: 13, fill: "#5B6C61", font: font700, anchor: "middle" })}
    ${textPath({ text: "2", x: 114, y: 393, size: 13, fill: "#5B6C61", font: font700, anchor: "middle" })}
    ${textPath({ text: "3", x: 170, y: 393, size: 13, fill: "#5B6C61", font: font700, anchor: "middle" })}
    ${textPath({ text: "+", x: 226, y: 393, size: 13, fill: "#5F7167", font: font700, anchor: "middle" })}
    ${textPath({ text: "±", x: 282, y: 393, size: 11.5, fill: "#5F7167", font: font700, anchor: "middle" })}
    ${textPath({ text: "M", x: 338, y: 393, size: 11.5, fill: "#5F7167", font: font700, anchor: "middle" })}
    ${textPath({ text: "AC", x: 58, y: 426, size: 8.5, fill: "#5F7167", font: font700, anchor: "middle", letterSpacing: 0.04 })}
    ${textPath({ text: "0", x: 114, y: 426, size: 13, fill: "#5B6C61", font: font700, anchor: "middle" })}
    ${textPath({ text: ".", x: 170, y: 426, size: 15, fill: "#5B6C61", font: font700, anchor: "middle" })}
    ${textPath({ text: "=", x: 226, y: 425, size: 13, fill: "#5F7167", font: font700, anchor: "middle" })}
    ${textPath({ text: "CE", x: 282, y: 425, size: 8.5, fill: "#5F7167", font: font700, anchor: "middle", letterSpacing: 0.03 })}
    ${textPath({ text: "=", x: 338, y: 426, size: 16, fill: "#F7FFF0", font: font800, anchor: "middle" })}
  </g>

  <rect width="1200" height="630" filter="url(#grain)" opacity="0.14"/>
</svg>
`;

fs.writeFileSync(path.join(ogDir, "sample.svg"), svg);
