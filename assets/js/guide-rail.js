(() => {
  const DEFAULT_VISIBLE_COUNT = 3;
  const GUIDE_RAIL_ITEMS = [
    {
      href: "pages/why-rebalancing.html",
      tag: "개념",
      title: "리밸런싱을 해야 하는 이유",
      description: "목표 비중을 유지해야 하는 이유와 위험 관리 관점을 먼저 정리합니다."
    },
    {
      href: "pages/monthly-dca-rebalancing.html",
      tag: "적립식",
      title: "월 적립식 매수 비중 계산기",
      description: "매도 없이 이번 달 적립금을 어떤 종목에 얼마씩 넣을지 빠르게 계산합니다."
    },
    {
      href: "pages/rebalancing-frequency.html",
      tag: "주기",
      title: "리밸런싱 주기 정하는 법",
      description: "연 1회, 반기, 비중 기준 방식이 실제로 어떻게 다른지 빠르게 비교합니다."
    },
    {
      href: "pages/rebalancing-calculation-difficulty.html",
      tag: "계산",
      title: "리밸런싱 계산이 어려운 이유",
      description: "손계산이 복잡해지는 지점과 계산기가 필요한 이유를 짚어줍니다."
    },
    {
      href: "https://blog.naver.com/rebalancing_/224236461413",
      tag: "사용법",
      title: "리밸런싱 계산기 사용법",
      description: "ETF 비중 계산과 수량 자동 맞추는 흐름을 네이버 블로그 글로 자세히 안내합니다.",
      external: true
    },
    {
      href: "https://blog.naver.com/rebalancing_/224249366126",
      tag: "적립식",
      title: "월 30만원 적립식 투자, 리밸런싱 계산기로 몇주 살지 해결한 방법(실사용 후기)",
      description: "월 30만원 적립식 투자에서 종목별 몇 주를 살지 계산기로 정리한 실제 사용 흐름을 소개합니다.",
      external: true
    },
    {
      href: "https://blog.naver.com/rebalancing_/224229403746",
      tag: "사용법",
      title: "엑셀없이 쉽게 ETF 리밸런싱 하는방법",
      description: "엑셀 없이 리밸런싱 계산기를 활용해 ETF 비중을 쉽게 맞추는 흐름을 설명합니다.",
      external: true
    },
    {
      href: "https://blog.naver.com/rebalancing_/224225914521",
      tag: "월배당",
      title: "월배당 ETF로 월 30만원 만들기",
      description: "월 30만원 배당을 목표로 할 때 필요한 자금 규모와 현실적인 계산 방법을 정리합니다.",
      external: true
    },
    {
      href: "https://blog.naver.com/rebalancing_/224220149514",
      tag: "월배당",
      title: "월배당 ETF 투자하면 생기는 착각",
      description: "월배당 ETF 투자에서 자주 생기는 오해와 실제로 확인해야 할 포인트를 짚어봅니다.",
      external: true
    },
    {
      href: "https://blog.naver.com/rebalancing_/224220133118",
      tag: "개념",
      title: "리밸런싱 하면 수익률이 좋아질까?",
      description: "리밸런싱이 수익률을 무조건 높여준다고 믿기 쉬운 지점과 실제로 봐야 할 기준을 설명합니다.",
      external: true
    }
  ];

  function escapeHtml(value) {
    const helper = window.RebalancingFormat && window.RebalancingFormat.escapeHtml;
    if (typeof helper === "function") {
      return helper(value);
    }
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function shuffleItems(items) {
    const nextItems = [...items];
    for (let i = nextItems.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [nextItems[i], nextItems[j]] = [nextItems[j], nextItems[i]];
    }
    return nextItems;
  }

  function normalizePathname(pathname) {
    const compact = String(pathname || "").replace(/\/+/g, "/");
    const withoutIndex = compact.replace(/\/index\.html$/, "/");
    if (withoutIndex.length > 1 && withoutIndex.endsWith("/")) {
      return withoutIndex.slice(0, -1);
    }
    return withoutIndex || "/";
  }

  function resolveItemHref(item, pathPrefix) {
    if (!item || item.external) {
      return item ? item.href : "";
    }
    return `${pathPrefix || ""}${item.href}`;
  }

  function isCurrentPageItem(item, pathPrefix) {
    if (!item || item.external) return false;
    const itemUrl = new URL(resolveItemHref(item, pathPrefix), window.location.href);
    const currentUrl = new URL(window.location.href);
    return normalizePathname(itemUrl.pathname) === normalizePathname(currentUrl.pathname);
  }

  function pickGuideRailItems(items, visibleCount, previousSelectionKey) {
    if (!items.length) {
      return [];
    }
    if (items.length <= visibleCount) {
      return shuffleItems(items);
    }

    let nextItems = [];
    let nextSelectionKey = "";
    let attempt = 0;
    do {
      nextItems = shuffleItems(items).slice(0, visibleCount);
      nextSelectionKey = nextItems.map((item) => item.href).sort().join("|");
      attempt += 1;
    } while (nextSelectionKey === previousSelectionKey && attempt < 8);

    return nextItems;
  }

  function createGuideRailController({
    listEl,
    refreshBtn,
    items = GUIDE_RAIL_ITEMS,
    pathPrefix = "",
    visibleCount = DEFAULT_VISIBLE_COUNT,
    filterCurrentPage = true
  } = {}) {
    if (!listEl) {
      return { render() {} };
    }

    const controllerState = { selectionKey: "" };

    function getAvailableItems() {
      return items.filter((item) => !filterCurrentPage || !isCurrentPageItem(item, pathPrefix));
    }

    function render() {
      const availableItems = getAvailableItems();
      const nextItems = pickGuideRailItems(availableItems, visibleCount, controllerState.selectionKey);

      if (!nextItems.length) {
        listEl.innerHTML = "";
        if (refreshBtn) {
          refreshBtn.disabled = true;
        }
        return;
      }

      controllerState.selectionKey = nextItems.map((item) => item.href).sort().join("|");
      listEl.innerHTML = nextItems.map((item) => {
        const href = resolveItemHref(item, pathPrefix);
        const externalAttrs = item.external ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `
          <a class="guideRailCard" href="${href}" role="listitem"${externalAttrs}>
            <span class="guideRailCardBody">
              <span class="guideRailCardTag">${escapeHtml(item.tag)}</span>
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.description)}</span>
            </span>
            <span class="guideRailCardArrow" aria-hidden="true">→</span>
          </a>
        `;
      }).join("");

      if (refreshBtn) {
        refreshBtn.disabled = availableItems.length < 2;
      }
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", render);
    }

    render();

    return { render };
  }

  window.RebalancingGuideRail = {
    GUIDE_RAIL_ITEMS,
    initGuideRail: createGuideRailController
  };
})();
