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
  const unitsPerEm = font.unitsPerEm;
  const scale = size / unitsPerEm;
  const tracking = letterSpacing * size;
  let cursorX = x;
  let totalWidth = 0;

  if (anchor !== "start") {
    for (let i = 0; i < text.length; i += 1) {
      const glyph = font.charToGlyph(text[i]);
      totalWidth += glyph.advanceWidth * scale;
      if (i < text.length - 1) {
        totalWidth += tracking;
      }
    }
    if (anchor === "middle") {
      cursorX -= totalWidth / 2;
    } else if (anchor === "end") {
      cursorX -= totalWidth;
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

function buildOgSvg({
  badge,
  titleLine1,
  titleLine2,
  tagline,
  detailLine1,
  detailLine2,
  siteLine = "www.rebalancing.kr",
  targetPercent = "25%",
  priceValue = "72,000원",
  quantityValue = "128주",
  actionTitle = "매수 12주",
  actionDetail = "오차 -6%p → 목표 구간 복귀",
  ctaLabel = "리밸런싱 계산 시작",
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="74" y1="34" x2="1126" y2="602" gradientUnits="userSpaceOnUse">
      <stop stop-color="#091427"/>
      <stop offset="0.56" stop-color="#0C1C35"/>
      <stop offset="1" stop-color="#102645"/>
    </linearGradient>
    <radialGradient id="glowA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(910 122) rotate(135) scale(430 310)">
      <stop stop-color="#4DA7FF" stop-opacity="0.24"/>
      <stop offset="1" stop-color="#4DA7FF" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(214 530) rotate(27) scale(500 190)">
      <stop stop-color="#7CCBFF" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#7CCBFF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="card" x1="0" y1="0" x2="356" y2="420" gradientUnits="userSpaceOnUse">
      <stop stop-color="#101E33"/>
      <stop offset="1" stop-color="#0B172B"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="308" y2="88" gradientUnits="userSpaceOnUse">
      <stop stop-color="#152841"/>
      <stop offset="1" stop-color="#11233C"/>
    </linearGradient>
    <linearGradient id="cta" x1="0" y1="0" x2="220" y2="64" gradientUnits="userSpaceOnUse">
      <stop stop-color="#46A6FF"/>
      <stop offset="1" stop-color="#2A86E5"/>
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

  <g opacity="0.38" filter="url(#softBlur)">
    <circle cx="118" cy="98" r="2.6" fill="#A8D5FF"/>
    <circle cx="232" cy="142" r="1.8" fill="#87C7FF"/>
    <circle cx="406" cy="82" r="2.1" fill="#9BD0FF"/>
    <circle cx="514" cy="165" r="1.7" fill="#7DBDFF"/>
    <circle cx="672" cy="104" r="2.3" fill="#9ACFFF"/>
    <circle cx="782" cy="184" r="1.9" fill="#83C3FF"/>
    <circle cx="1042" cy="112" r="2.2" fill="#8CC8FF"/>
    <circle cx="1086" cy="214" r="1.6" fill="#79B9F8"/>
    <circle cx="154" cy="392" r="1.9" fill="#9BCFFF"/>
    <circle cx="294" cy="458" r="2.2" fill="#8BC7FF"/>
    <circle cx="462" cy="404" r="1.7" fill="#78B9F7"/>
    <circle cx="642" cy="496" r="2.4" fill="#9FD4FF"/>
    <circle cx="946" cy="472" r="1.8" fill="#84C3FE"/>
    <circle cx="1114" cy="532" r="2" fill="#8CC8FF"/>
  </g>

  <g opacity="0.16">
    <path d="M80 150C240 210 420 320 650 410" stroke="#A9D8FF" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M140 110C320 180 500 300 730 390" stroke="#8CC7FF" stroke-width="1" stroke-linecap="round"/>
    <path d="M40 260C230 310 420 430 700 530" stroke="#7BB9F5" stroke-width="1" stroke-linecap="round"/>
  </g>

  <g opacity="0.5">
    <rect x="82" y="78" width="178" height="34" rx="17" fill="#13253D" stroke="#2B4A70"/>
    ${textPath({ text: badge, x: 171, y: 100, size: 12, fill: "#8FC8FF", font: font700, anchor: "middle" })}

    ${textPath({ text: titleLine1, x: 84, y: 206, size: 72, fill: "#EAF4FF", font: font800, letterSpacing: -0.02 })}
    ${textPath({ text: titleLine2, x: 84, y: 282, size: 72, fill: "#EAF4FF", font: font800, letterSpacing: -0.02 })}

    ${textPath({ text: tagline, x: 84, y: 338, size: 30, fill: "#A9C2DD", font: font700 })}

    <rect x="84" y="372" width="560" height="2" fill="#1E3655"/>

    ${textPath({ text: detailLine1, x: 84, y: 430, size: 21, fill: "#7EA2C8", font: font700 })}
    ${textPath({ text: detailLine2, x: 84, y: 468, size: 21, fill: "#7EA2C8", font: font700 })}
    ${textPath({ text: siteLine, x: 84, y: 528, size: 20, fill: "#5F86AF", font: font700, letterSpacing: 0.01 })}
  </g>

  <g transform="translate(684 92)">
    <rect width="432" height="446" rx="18" fill="url(#card)" stroke="#2B456A" stroke-width="1.4"/>

    <rect x="24" y="24" width="384" height="88" rx="12" fill="url(#panel)" stroke="#2A466B"/>
    ${textPath({ text: "목표 비중", x: 44, y: 52, size: 13, fill: "#84A9CF", font: font700 })}
    ${textPath({ text: targetPercent, x: 388, y: 77, size: 34, fill: "#EAF4FF", font: font800, anchor: "end" })}

    <rect x="24" y="126" width="185" height="76" rx="12" fill="#10233D" stroke="#274367"/>
    ${textPath({ text: "현재 가격", x: 40, y: 153, size: 11, fill: "#7CA2CA", font: font700 })}
    ${textPath({ text: priceValue, x: 193, y: 184, size: 23, fill: "#E4F1FF", font: font800, anchor: "end" })}

    <rect x="223" y="126" width="185" height="76" rx="12" fill="#10233D" stroke="#274367"/>
    ${textPath({ text: "보유 수량", x: 239, y: 153, size: 11, fill: "#7CA2CA", font: font700 })}
    ${textPath({ text: quantityValue, x: 392, y: 184, size: 23, fill: "#E4F1FF", font: font800, anchor: "end" })}

    <rect x="24" y="220" width="384" height="118" rx="14" fill="#0E1F37" stroke="#284465"/>
    ${textPath({ text: "추천 액션", x: 44, y: 252, size: 12, fill: "#7DA3CB", font: font700 })}
    ${textPath({ text: actionTitle, x: 44, y: 298, size: 44, fill: "#ECF6FF", font: font800 })}
    ${textPath({ text: actionDetail, x: 44, y: 325, size: 15, fill: "#8DB0D5", font: font700 })}

    <rect x="24" y="354" width="384" height="54" rx="11" fill="url(#cta)"/>
    ${textPath({ text: ctaLabel, x: 216, y: 388, size: 18, fill: "#F8FCFF", font: font800, anchor: "middle" })}
  </g>

  <rect width="1200" height="630" filter="url(#grain)" opacity="0.22"/>
</svg>
`;
}

const defaultSvg = buildOgSvg({
  badge: "ETF 투자자를 위한",
  titleLine1: "포트폴리오",
  titleLine2: "리밸런싱 계산기",
  tagline: "clean · professional · minimal",
  detailLine1: "목표 비중 입력 → 매수·매도 수량 자동 계산",
  detailLine2: "ETF 리밸런싱 매수·매도 수량 자동 계산",
});

const sampleSvg = buildOgSvg({
  badge: "복잡한 계산은 빼고",
  titleLine1: "비중 정리는",
  titleLine2: "딸깍 한 번",
  tagline: "simple · fast · no spreadsheet",
  detailLine1: "목표 비중만 넣으면 필요한 수량이 바로 보입니다",
  detailLine2: "엑셀 없이 매수·매도만 빠르게 확인하세요",
  actionTitle: "바로 맞추기",
  actionDetail: "오차 확인 → 필요한 주문 수량 즉시 계산",
  ctaLabel: "지금 계산하기",
});

fs.writeFileSync(path.join(ogDir, "rebalancing-guide-og.svg"), defaultSvg);
fs.writeFileSync(path.join(ogDir, "sample.svg"), sampleSvg);
