(() => {
  const standards = [
    {
      title: "우리나라 중위소득",
      metric: "50%",
      summary: "전체 가구 소득을 순서대로 나열했을 때 가운데에 해당하는 기준입니다.",
      defaultOption: 3,
      options: [
        { label: "1인 가구", value: "월 256만원", exact: "2,564,238원" },
        { label: "2인 가구", value: "월 420만원", exact: "4,199,292원" },
        { label: "3인 가구", value: "월 536만원", exact: "5,359,036원" },
        { label: "4인 가구", value: "월 649만원", exact: "6,494,738원" }
      ],
      facts: {
        "기준 연도": "2026년",
        "의미": "복지급여와 지원 대상 판정에 쓰이는 국민 가구소득의 중간값",
        "활용": "복지 기준, 지원금 기준, 생활 수준 비교",
        "출처": "보건복지부, 2026년도 기준 중위소득"
      },
      sources: [
        {
          label: "보건복지부 고시 PDF",
          href: "../data/sources/2026-기준중위소득-보건복지부-고시.pdf"
        }
      ],
      bars: [38, 52, 66, 82]
    },
    {
      title: "순자산 상위 기준",
      value: "상위 10% 약 10.5억원",
      valueParts: ["상위 10% 약 10.5억원"],
      metric: "10%",
      summary: "자산에서 부채를 뺀 순자산으로 본 상위권 진입 기준입니다.",
      facts: {
        "기준 시점": "2024년 3월 말",
        "의미": "가구 순자산 기준 10분위 진입선",
        "활용": "내 순자산의 상대적 위치 점검",
        "출처": "통계청·금융감독원·한국은행, 2024년 가계금융복지조사"
      },
      sources: [
        {
          label: "가계금융복지조사 PDF",
          href: "../data/sources/2024-가계금융복지조사-결과.pdf"
        },
        {
          label: "부록 통계표 XLSX",
          href: "../data/sources/2024-가계금융복지조사-부록통계표.xlsx"
        }
      ],
      bars: [24, 32, 44, 72]
    },
    {
      title: "근로소득 상위 기준",
      metric: "10%",
      summary: "국세청 근로소득 백분위 자료의 인원과 총급여를 나눠 계산한 구간 평균 총급여입니다.",
      defaultOption: 2,
      options: [
        { label: "상위 1%", value: "상위 1% 연 1억 9,953만원", valueParts: ["상위 1%", "연 1억 9,953만원"] },
        { label: "상위 5%", value: "상위 5% 연 1억 1,984만원", valueParts: ["상위 5%", "연 1억 1,984만원"] },
        { label: "상위 10%", value: "상위 10% 연 9,117만원", valueParts: ["상위 10%", "연 9,117만원"] },
        { label: "상위 20%", value: "상위 20% 연 6,534만원", valueParts: ["상위 20%", "연 6,534만원"] },
        { label: "상위 50%", value: "상위 50% 연 3,417만원", valueParts: ["상위 50%", "연 3,417만원"] }
      ],
      facts: {
        "기준일": "2025년 12월 31일",
        "의미": "해당 백분위 구간의 총급여를 인원으로 나눈 평균값",
        "활용": "내 연봉의 근로소득 상대 위치를 빠르게 가늠",
        "출처": "국세청, 근로소득 백분위(천분위) 자료"
      },
      sources: [
        {
          label: "국세청 백분위 PDF",
          href: "../data/sources/2025-국세청-근로소득-백분위-천분위-자료.pdf"
        }
      ],
      bars: [86, 68, 54, 38, 24]
    },
    {
      title: "보통사람 가구소득",
      value: "월 544만원",
      valueParts: ["월 544만원"],
      metric: "544",
      summary: "20~64세 경제활동가구가 실제 손에 쥐는 월평균 가구 총소득입니다.",
      defaultOption: 0,
      options: [
        { label: "월평균 총소득", value: "월 544만원", valueParts: ["월 544만원"] },
        { label: "월평균 소비", value: "월 276만원", valueParts: ["월 276만원"] },
        { label: "저축/투자", value: "월 105만원", valueParts: ["월 105만원"] },
        { label: "금융자산", value: "8,178만원", valueParts: ["8,178만원"] },
        { label: "총자산", value: "6억 294만원", valueParts: ["6억 294만원"] }
      ],
      facts: {
        "기준 연도": "2023년",
        "의미": "전국 만 20~64세 경제활동자를 대상으로 본 보통가구의 생활금융 평균",
        "활용": "내 소득, 소비, 저축 규모를 보통가구와 비교",
        "출처": "신한은행, 보통사람 금융생활 보고서 2024"
      },
      sources: [
        {
          label: "신한 보통사람 보고서 PDF",
          href: "../data/sources/2024-신한은행-보통사람-금융생활-보고서.pdf"
        }
      ],
      bars: [70, 36, 24, 52, 86]
    },
    {
      title: "평균 금융자산",
      value: "1억 178만원",
      valueParts: ["1억 178만원"],
      metric: "1억",
      summary: "금융소비자가 보유한 예금, 투자상품, 연금, 보험 등을 합친 평균 금융자산입니다.",
      defaultOption: 2,
      options: [
        { label: "2022년", value: "9,004만원", valueParts: ["9,004만원"] },
        { label: "2023년", value: "9,049만원", valueParts: ["9,049만원"] },
        { label: "2024년", value: "1억 178만원", valueParts: ["1억 178만원"] },
        { label: "투자·신탁 비중", value: "29.5%", valueParts: ["29.5%"] }
      ],
      facts: {
        "기준 시점": "2024년 7월 조사",
        "의미": "20~64세 금융소비자의 평균 금융자산 규모",
        "활용": "현금성 자산과 투자자산의 상대적 수준 점검",
        "출처": "하나금융연구소, 대한민국 금융소비자 보고서 2025"
      },
      sources: [
        {
          label: "하나 금융소비자 보고서 PDF",
          href: "../data/sources/2025-하나금융연구소-대한민국-금융소비자-보고서.pdf"
        }
      ],
      bars: [58, 59, 78, 42]
    },
    {
      title: "결혼비용 기준",
      value: "평균 2억 1,227만원",
      valueParts: ["평균 2억 1,227만원"],
      metric: "2.1억",
      summary: "최근 3년 내 결혼했거나 결혼을 준비 중인 사람이 본 주택·예식 등 결혼자금입니다.",
      defaultOption: 0,
      options: [
        { label: "평균", value: "평균 2억 1,227만원", valueParts: ["평균 2억 1,227만원"] },
        { label: "신혼 3년 내", value: "2억 635만원", valueParts: ["2억 635만원"] },
        { label: "결혼 준비", value: "2억 2,541만원", valueParts: ["2억 2,541만원"] },
        { label: "서울/수도권", value: "2억 2,374만원", valueParts: ["2억 2,374만원"] },
        { label: "기타 광역시", value: "1억 7,905만원", valueParts: ["1억 7,905만원"] }
      ],
      facts: {
        "기준 시점": "2024년 7월 조사",
        "의미": "주택 마련 및 결혼식 등에 소요된 결혼자금 평균",
        "활용": "결혼 준비 자금, 대출 필요성, 지역별 비용 차이 점검",
        "출처": "하나금융연구소, 대한민국 금융소비자 보고서 2025"
      },
      sources: [
        {
          label: "하나 금융소비자 보고서 PDF",
          href: "../data/sources/2025-하나금융연구소-대한민국-금융소비자-보고서.pdf"
        }
      ],
      bars: [72, 68, 76, 74, 58]
    },
    {
      title: "노후 안심 총자산",
      value: "18.6억원",
      valueParts: ["18.6억원"],
      metric: "18.6",
      summary: "노후자금이 충분하다고 느낀 기혼가구가 은퇴 시점까지 확보할 것으로 예상한 총자산입니다.",
      defaultOption: 2,
      options: [
        { label: "기혼가구 평균", value: "9.2억원", valueParts: ["9.2억원"] },
        { label: "부족 인식", value: "5.7억원", valueParts: ["5.7억원"] },
        { label: "충분 인식", value: "18.6억원", valueParts: ["18.6억원"] }
      ],
      facts: {
        "기준 시점": "2024년 7월 조사",
        "의미": "기혼가구가 은퇴 시점에 확보할 것으로 예상한 노후자금",
        "활용": "은퇴 준비 목표와 유동자산 확보 수준 점검",
        "출처": "하나금융연구소, 대한민국 금융소비자 보고서 2025"
      },
      sources: [
        {
          label: "하나 금융소비자 보고서 PDF",
          href: "../data/sources/2025-하나금융연구소-대한민국-금융소비자-보고서.pdf"
        }
      ],
      bars: [50, 30, 92]
    },
    {
      title: "우리나라 가계부채",
      value: "가계신용 1,978.8조원",
      valueParts: ["가계신용 1,978.8조원"],
      metric: "1,979",
      summary: "가계대출과 판매신용을 합친 한국은행 가계신용 잔액입니다.",
      defaultOption: 0,
      options: [
        { label: "가계신용", value: "가계신용 1,978.8조원", valueParts: ["가계신용 1,978.8조원"] },
        { label: "가계대출", value: "가계대출 1,852.7조원", valueParts: ["가계대출 1,852.7조원"] },
        { label: "판매신용", value: "판매신용 126.0조원", valueParts: ["판매신용 126.0조원"] },
        { label: "전년 대비", value: "전년 대비 56.1조원 증가", valueParts: ["전년 대비 56.1조원 증가"] }
      ],
      facts: {
        "기준 시점": "2025년 4분기 말",
        "의미": "가계가 금융기관 등에 지고 있는 신용 총액",
        "활용": "부채 부담, 금리 민감도, 가계경제 흐름 확인",
        "출처": "한국은행, 2025년 4분기 가계신용(잠정)"
      },
      sources: [
        {
          label: "한국은행 가계신용 PDF",
          href: "../data/sources/2025-4분기-한국은행-가계신용-잠정.pdf"
        }
      ],
      bars: [92, 86, 18, 34]
    },
    {
      title: "직장인 점심값",
      value: "한 끼 평균 1만원",
      valueParts: ["한 끼 평균 1만원"],
      metric: "1만",
      summary: "직장인이 점심 한 끼에 쓰는 평균 금액으로 본 생활물가 체감 기준입니다.",
      defaultOption: 0,
      options: [
        { label: "현재 점심값", value: "한 끼 평균 1만원", valueParts: ["한 끼 평균 1만원"] },
        { label: "절약 후", value: "현재 6천원", valueParts: ["현재 6천원"] },
        { label: "절약 목표", value: "목표 5천원", valueParts: ["목표 5천원"] },
        { label: "절약 노력", value: "68.6%가 노력", valueParts: ["68.6%가 노력"] }
      ],
      facts: {
        "기준 연도": "2023년",
        "의미": "런치플레이션 속 직장인의 평균 점심 지출",
        "활용": "식비 예산, 생활비 절약 목표 설정",
        "출처": "신한은행, 보통사람 금융생활 보고서 2024"
      },
      sources: [
        {
          label: "신한 보통사람 보고서 PDF",
          href: "../data/sources/2024-신한은행-보통사람-금융생활-보고서.pdf"
        }
      ],
      bars: [78, 48, 40, 62]
    },
    {
      title: "부자의 기준",
      value: "금융자산 10억원 이상",
      metric: "10억",
      summary: "KB 한국 부자보고서가 한국 부자를 분류할 때 쓰는 대표 기준입니다.",
      facts: {
        "기준 연도": "2025년",
        "의미": "예금, 주식, 펀드 등 금융자산을 10억원 이상 보유한 개인",
        "활용": "자산가 통계와 투자 성향 비교",
        "출처": "KB금융지주 경영연구소, 2025 한국 부자 보고서"
      },
      sources: [
        {
          label: "KB 부자보고서 요약본",
          href: "../data/sources/2025-KB-한국-부자보고서-요약본.html"
        }
      ],
      bars: [28, 42, 64, 88]
    },
    {
      title: "부자가 생각한 부자",
      value: "총자산 100억원",
      valueParts: ["총자산 100억원"],
      metric: "100억",
      summary: "KB 한국 부자보고서에서 한국 부자가 생각하는 상징적인 부자의 자산 기준입니다.",
      facts: {
        "기준 연도": "2025년",
        "의미": "금융자산 10억원 이상 부자가 응답한 부자의 총자산 기준",
        "활용": "사회적 부자 인식과 통계상 부자 기준 구분",
        "출처": "KB금융지주 경영연구소, 2025 한국 부자 보고서"
      },
      sources: [
        {
          label: "KB 부자보고서 요약본",
          href: "../data/sources/2025-KB-한국-부자보고서-요약본.html"
        }
      ],
      bars: [26, 48, 74, 92]
    },
    {
      title: "금수저 / 흙수저",
      value: "공식 기준 없음",
      metric: "비공식",
      summary: "가구 배경과 자산 격차를 말할 때 쓰는 표현이지만, 통계상 고정된 금액 기준은 없습니다.",
      facts: {
        "기준 연도": "상시",
        "의미": "사회적으로 쓰이는 비공식 표현",
        "활용": "가구 자산, 소득 분위, 상속 여부 등을 함께 볼 때 참고",
        "출처": "공식 통계 기준 없음"
      },
      sources: [],
      bars: [18, 34, 56, 78]
    },
    {
      title: "은퇴 필요자금",
      value: "부부 월 298만원",
      metric: "298",
      summary: "50세 이상 중고령자가 생각하는 부부 기준 적정 노후 생활비입니다.",
      facts: {
        "기준 연도": "2024년 조사",
        "의미": "건강한 노후에 표준적인 생활을 한다고 느끼는 월 생활비",
        "활용": "연금, 현금흐름, 은퇴자금 목표 점검",
        "출처": "국민연금연구원, 국민노후보장패널조사 제10차 부가조사"
      },
      sources: [
        {
          label: "국민노후보장패널 PDF",
          href: "../data/sources/2024-국민노후보장패널조사-제10차-부가조사-기초분석보고서.pdf"
        }
      ],
      bars: [30, 48, 58, 70]
    },
    {
      title: "연령대별 평균 자산",
      value: "50대 평균 자산 6.1억원",
      valueParts: ["50대 평균 자산 6.1억원"],
      metric: "50대",
      summary: "가구주 연령대별 총자산 평균으로 본 생애주기별 자산 수준입니다.",
      facts: {
        "기준 시점": "2024년 3월 말",
        "의미": "가구주 연령대별 가구 평균 자산",
        "활용": "연령대별 자산 형성 속도 비교",
        "출처": "통계청·금융감독원·한국은행, 2024년 가계금융복지조사"
      },
      sources: [
        {
          label: "가계금융복지조사 PDF",
          href: "../data/sources/2024-가계금융복지조사-결과.pdf"
        },
        {
          label: "부록 통계표 XLSX",
          href: "../data/sources/2024-가계금융복지조사-부록통계표.xlsx"
        }
      ],
      options: [
        { label: "39세 이하", value: "3.5억원" },
        { label: "40대", value: "5.8억원" },
        { label: "50대", value: "6.1억원" },
        { label: "60세 이상", value: "5.8억원" }
      ],
      defaultOption: 2,
      bars: [45, 76, 82, 78]
    }
  ];

  const track = document.getElementById("standardTrack");
  const prevButton = document.getElementById("prevStandard");
  const nextButton = document.getElementById("nextStandard");
  const panel = document.getElementById("standardPanel");
  const label = document.getElementById("standardLabel");
  const value = document.getElementById("standardValue");
  const summary = document.getElementById("standardSummary");
  const facts = document.getElementById("standardFacts");
  const options = document.getElementById("optionStrip");
  const visualMetric = document.getElementById("visualMetric");
  const visualBars = document.getElementById("visualBars");

  let activeIndex = 0;
  const optionIndexes = standards.map((item) => item.defaultOption || 0);
  let touchStartX = 0;
  let touchStartY = 0;

  function wrapIndex(index) {
    return (index + standards.length) % standards.length;
  }

  function getPositionClass(index) {
    const diff = (index - activeIndex + standards.length) % standards.length;
    if (diff === 0) return "isCenter";
    if (diff === 1) return "isRight";
    if (diff === standards.length - 1) return "isLeft";
    if (diff === 2) return "isFarRight";
    if (diff === standards.length - 2) return "isFarLeft";
    return "";
  }

  function getCurrentValue(item) {
    if (!item.options) return item.value;
    return item.options[optionIndexes[activeIndex]]?.value || item.value;
  }

  function getCurrentValueParts(item) {
    if (!item.options) return item.valueParts || [item.value];
    const option = item.options[optionIndexes[activeIndex]];
    return option?.valueParts || [option?.value || item.value];
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function renderCarousel() {
    track.innerHTML = standards.map((item, index) => {
      const positionClass = getPositionClass(index);
      const direction = positionClass === "isLeft" || positionClass === "isFarLeft"
        ? -1
        : positionClass === "isRight" || positionClass === "isFarRight"
          ? 1
          : 0;
      return `<button class="carouselItem ${positionClass}" type="button" data-direction="${direction}" aria-label="${item.title} 보기"><strong>${item.title}</strong></button>`;
    }).join("");
  }

  function renderFacts(item) {
    const factItems = Object.entries(item.facts).map(([key, fact]) => (
      `<div class="factItem"><dt>${key}</dt><dd>${fact}</dd></div>`
    ));
    const sourceItems = item.sources && item.sources.length
      ? item.sources.map((source) => (
        `<a class="sourceLink" href="${source.href}" target="_blank" rel="noopener">${source.label}</a>`
      )).join("")
      : `<span class="sourceMuted">공식 숫자 기준 없음</span>`;

    factItems.push(`<div class="factItem sourceItem"><dt>근거자료</dt><dd>${sourceItems}</dd></div>`);
    facts.innerHTML = factItems.join("");
  }

  function renderOptions(item) {
    if (!item.options) {
      options.innerHTML = "";
      return;
    }

    options.innerHTML = item.options.map((option, index) => {
      const active = index === optionIndexes[activeIndex] ? "isActive" : "";
      const exact = option.exact ? ` · ${option.exact}` : "";
      return `<button class="optionCard ${active}" type="button" data-option-index="${index}"><strong>${option.label}</strong><span>${option.value}${exact}</span></button>`;
    }).join("");
  }

  function renderVisual(item) {
    visualMetric.textContent = item.metric;
    visualBars.innerHTML = item.bars.map((height, index) => (
      `<span style="height: ${height}%; animation-delay: ${index * 0.05}s"></span>`
    )).join("");
  }

  function renderPanel() {
    const item = standards[activeIndex];
    label.textContent = item.title;
    value.innerHTML = getCurrentValueParts(item).map((part) => (
      `<span class="valueChunk">${escapeHtml(part)}</span>`
    )).join(" ");
    summary.textContent = item.summary;
    renderFacts(item);
    renderOptions(item);
    renderVisual(item);

    panel.classList.remove("isChanging");
    window.requestAnimationFrame(() => {
      panel.classList.add("isChanging");
    });
  }

  function render() {
    renderCarousel();
    renderPanel();
  }

  function move(direction) {
    activeIndex = wrapIndex(activeIndex + direction);
    render();
  }

  prevButton.addEventListener("click", () => move(-1));
  nextButton.addEventListener("click", () => move(1));

  track.addEventListener("click", (event) => {
    const button = event.target.closest("[data-direction]");
    if (!button) return;
    const direction = Number(button.dataset.direction);
    if (direction === 0) return;
    move(direction);
  });

  options.addEventListener("click", (event) => {
    const button = event.target.closest("[data-option-index]");
    if (!button) return;
    optionIndexes[activeIndex] = Number(button.dataset.optionIndex);
    renderPanel();
  });

  function bindSwipe(element) {
    element.addEventListener("touchstart", (event) => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    element.addEventListener("touchend", (event) => {
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy)) return;
      move(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  bindSwipe(track);
  bindSwipe(panel);

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  });

  render();
})();
