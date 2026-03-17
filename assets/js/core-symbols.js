(function () {
  function normalizeAliasKey(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^0-9a-zA-Z가-힣&().+-]/g, "");
  }

  function normalizeKrEtfAlias(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(
        /etf|kodex|tiger|rise|kbstar|arirang|ace|plus|sol|timefolio|코덱스|타이거|라이즈|케이스타|아리랑|에이스|플러스|쏠/g,
        ""
      )
      .replace(/[^0-9a-zA-Z가-힣]/g, "");
  }

  function normalizeSymbol(value) {
    return String(value || "").trim().toUpperCase();
  }

  const KR_ETF_ALIAS_MAP = Object.freeze([
    { ticker: "489250.KS", canonical: "KODEX 미국배당다우존스", aliases: ["미국배당다우존스", "미국배당다우", "미배당다우", "코미당", "미국배당", "453850"] },
    { ticker: "069500.KS", canonical: "KODEX 200", aliases: ["코덱스200", "국내200", "코스피200", "069500"] },
    { ticker: "102110.KS", canonical: "TIGER 200", aliases: ["타이거200", "호랑이200", "102110"] },
    { ticker: "133690.KS", canonical: "TIGER 미국나스닥100", aliases: ["미국나스닥100", "나스닥100", "미국나스닥", "133690"] },
    { ticker: "360750.KS", canonical: "TIGER 미국S&P500", aliases: ["미국s&p500", "미국sp500", "미국에스앤피500", "s&p500", "sp500", "360750"] },
    { ticker: "379800.KS", canonical: "KODEX 미국S&P500TR", aliases: ["미국s&p500tr", "미국sp500tr", "sp500tr", "379800"] },
    { ticker: "214980.KS", canonical: "KODEX 단기채권PLUS", aliases: ["단기채권", "파킹etf", "파킹", "214980"] },
    { ticker: "148070.KS", canonical: "KOSEF 국고채10년", aliases: ["국고채10년", "국채10년", "148070"] },
    { ticker: "273130.KS", canonical: "KODEX 종합채권(AA-이상)액티브", aliases: ["종합채권", "채권액티브", "273130"] },
    { ticker: "132030.KS", canonical: "KODEX 골드선물(H)", aliases: ["골드선물", "금etf", "금선물", "132030"] },
    { ticker: "114800.KS", canonical: "KODEX 인버스", aliases: ["인버스", "114800"] },
    { ticker: "122630.KS", canonical: "KODEX 레버리지", aliases: ["레버리지", "122630"] },
    { ticker: "233740.KS", canonical: "KODEX 코스닥150레버리지", aliases: ["코스닥150레버리지", "코스닥레버리지", "233740"] },
    { ticker: "229200.KS", canonical: "KODEX 코스닥150", aliases: ["코스닥150", "229200"] },
    { ticker: "305720.KS", canonical: "KODEX 2차전지산업", aliases: ["2차전지", "이차전지", "2차전지산업", "305720"] },
    { ticker: "305540.KS", canonical: "TIGER 2차전지테마", aliases: ["2차전지테마", "이차전지테마", "305540"] },
    { ticker: "381170.KS", canonical: "TIGER 미국테크TOP10 INDXX", aliases: ["미국테크top10", "미국테크10", "381170"] },
    { ticker: "379810.KS", canonical: "KODEX 미국나스닥100TR", aliases: ["미국나스닥100tr", "나스닥100tr", "379810"] },
    { ticker: "229480.KS", canonical: "KODEX 미국S&P500선물(H)", aliases: ["미국s&p500선물", "미국sp500선물", "229480"] },
    { ticker: "091180.KS", canonical: "KODEX 자동차", aliases: ["자동차", "091180"] }
  ]);

  const KR_ETF_ALIAS_INDEX = Object.freeze(
    KR_ETF_ALIAS_MAP.map((entry) => {
      const keySet = new Set([entry.canonical, entry.ticker, ...(entry.aliases || [])]);
      const keys = [...keySet]
        .map((value) => normalizeKrEtfAlias(value))
        .filter(Boolean)
        .sort((a, b) => b.length - a.length);
      return { ticker: entry.ticker, canonical: entry.canonical, keys };
    })
  );

  const SYMBOL_ALIAS_MAP = Object.freeze({
    "005930": "005930.KS",
    "000660": "000660.KS",
    "035420": "035420.KS",
    "035720": "035720.KS",
    "069500": "069500.KS",
    "102110": "102110.KS",
    "132030": "132030.KS",
    "148070": "148070.KS",
    "229200": "229200.KS",
    "360750": "360750.KS",
    "247540": "247540.KQ",
    "066970": "066970.KQ",
    "kodex200": "069500.KS",
    "tiger200": "102110.KS",
    "kodex골드선물h": "132030.KS",
    "kodex골드선물(h)": "132030.KS",
    "kosef국고채10년": "148070.KS",
    "tiger미국s&p500": "360750.KS",
    "tiger미국sp500": "360750.KS",
    "삼성전자": "005930.KS",
    "sk하이닉스": "000660.KS",
    "naver": "035420.KS",
    "카카오": "035720.KS",
    "에코프로비엠": "247540.KQ",
    "엘앤에프": "066970.KQ"
  });

  const STOCK_SUGGESTIONS = Object.freeze([
    { name: "삼성전자", symbol: "005930.KS", aliases: ["005930", "삼성"] },
    { name: "SK하이닉스", symbol: "000660.KS", aliases: ["000660", "하이닉스"] },
    { name: "NAVER", symbol: "035420.KS", aliases: ["035420", "네이버"] },
    { name: "카카오", symbol: "035720.KS", aliases: ["035720"] },
    { name: "KODEX 200", symbol: "069500.KS", aliases: ["069500", "kodex200"] },
    { name: "TIGER 200", symbol: "102110.KS", aliases: ["102110", "tiger200"] },
    { name: "KOSEF 국고채10년", symbol: "148070.KS", aliases: ["148070", "국고채10년"] },
    { name: "KODEX 골드선물(H)", symbol: "132030.KS", aliases: ["132030", "kodex골드선물h"] },
    { name: "TIGER 미국S&P500", symbol: "360750.KS", aliases: ["360750", "tiger미국sp500", "미국s&p500"] },
    { name: "KODEX 코스닥150레버리지", symbol: "233740.KS", aliases: ["233740"] },
    { name: "TIGER 코스닥150", symbol: "229200.KS", aliases: ["229200"] },
    { name: "에코프로비엠", symbol: "247540.KQ", aliases: ["247540"] },
    { name: "엘앤에프", symbol: "066970.KQ", aliases: ["066970"] },
    { name: "Apple", symbol: "AAPL", aliases: ["애플"] },
    { name: "Microsoft", symbol: "MSFT", aliases: ["마이크로소프트"] },
    { name: "NVIDIA", symbol: "NVDA", aliases: ["엔비디아"] },
    { name: "Tesla", symbol: "TSLA", aliases: ["테슬라"] }
  ]);

  function findKrEtfByAlias(rawInput) {
    const normalizedInput = normalizeKrEtfAlias(rawInput);
    if (!normalizedInput) return null;

    for (const etf of KR_ETF_ALIAS_INDEX) {
      if (etf.keys.some((alias) => alias === normalizedInput)) {
        return { ticker: etf.ticker, canonical: etf.canonical };
      }
    }

    let bestTicker = "";
    let bestCanonical = "";
    let bestScore = 0;
    for (const etf of KR_ETF_ALIAS_INDEX) {
      for (const alias of etf.keys) {
        if (alias.length < 3 || normalizedInput.length < 3) continue;
        const matched = normalizedInput.includes(alias) || alias.includes(normalizedInput);
        if (!matched) continue;
        if (alias.length > bestScore) {
          bestScore = alias.length;
          bestTicker = etf.ticker;
          bestCanonical = etf.canonical;
        }
      }
    }

    if (!bestTicker) return null;
    return { ticker: bestTicker, canonical: bestCanonical };
  }

  function resolveYahooSymbol(rawInput) {
    const input = String(rawInput || "").trim();
    if (!input) return "";

    const symbolLike = normalizeSymbol(input);
    if (/^[A-Z0-9.^=\-]{1,20}$/.test(symbolLike) && symbolLike.includes(".")) {
      return symbolLike;
    }

    const etfMatch = findKrEtfByAlias(input);
    if (etfMatch) {
      return etfMatch.ticker;
    }

    const aliasKey = normalizeAliasKey(input);
    if (SYMBOL_ALIAS_MAP[aliasKey]) {
      return SYMBOL_ALIAS_MAP[aliasKey];
    }

    const fromSuggestion = STOCK_SUGGESTIONS.find((item) => {
      if (normalizeAliasKey(item.name) === aliasKey) return true;
      return item.aliases.some((alias) => normalizeAliasKey(alias) === aliasKey);
    });
    if (fromSuggestion) {
      return fromSuggestion.symbol;
    }

    if (/^\d{6}$/.test(input)) {
      return `${input}.KS`;
    }

    if (/^[A-Za-z][A-Za-z0-9.^=\-]{0,9}$/.test(input)) {
      return symbolLike;
    }

    return symbolLike.replace(/\s+/g, "");
  }

  function getSuggestionCandidates(rawQuery) {
    const query = normalizeAliasKey(rawQuery);
    if (!query) return [];

    const results = STOCK_SUGGESTIONS.map((item) => {
      const keys = [
        normalizeAliasKey(item.name),
        normalizeAliasKey(item.symbol),
        ...item.aliases.map(normalizeAliasKey)
      ];
      const starts = keys.some((key) => key.startsWith(query));
      const contains = keys.some((key) => key.includes(query));
      if (!starts && !contains) return null;
      return { ...item, starts };
    }).filter(Boolean);

    results.sort((a, b) => {
      if (a.starts !== b.starts) return a.starts ? -1 : 1;
      return a.name.localeCompare(b.name, "ko");
    });

    return results.slice(0, 8);
  }

  window.RebalancingSymbols = Object.freeze({
    KR_ETF_ALIAS_MAP,
    STOCK_SUGGESTIONS,
    SYMBOL_ALIAS_MAP,
    findKrEtfByAlias,
    getSuggestionCandidates,
    normalizeAliasKey,
    normalizeKrEtfAlias,
    normalizeSymbol,
    resolveYahooSymbol
  });
})();
