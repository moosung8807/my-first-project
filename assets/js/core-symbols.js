(function () {
  const MAX_SUGGESTION_CANDIDATES = 20;

  function normalizeAliasKey(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^0-9a-zA-Z가-힣&().+-]/g, "");
  }

  function tokenizeSuggestionQuery(value) {
    return String(value || "")
      .trim()
      .split(/\s+/)
      .map((part) => normalizeAliasKey(part))
      .filter(Boolean);
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

  function normalizeSecurityCode(value) {
    const match = normalizeSymbol(value).match(/^(?:A)?([0-9A-Z]{6})(?:\.(?:KS|KQ))?$/);
    if (!match) return "";
    return /\d/.test(match[1]) ? match[1] : "";
  }

  const KR_ETF_ALIAS_MAP = Object.freeze([
    { ticker: "489250", canonical: "KODEX 미국배당다우존스", aliases: ["미국배당다우존스", "미국배당다우", "미배당다우", "코미당", "미국배당", "453850"] },
    { ticker: "069500", canonical: "KODEX 200", aliases: ["코덱스200", "국내200", "코스피200", "069500"] },
    { ticker: "102110", canonical: "TIGER 200", aliases: ["타이거200", "호랑이200", "102110"] },
    { ticker: "133690", canonical: "TIGER 미국나스닥100", aliases: ["미국나스닥100", "나스닥100", "미국나스닥", "133690"] },
    { ticker: "360750", canonical: "TIGER 미국S&P500", aliases: ["미국s&p500", "미국sp500", "미국에스앤피500", "s&p500", "sp500", "360750"] },
    { ticker: "379800", canonical: "KODEX 미국S&P500TR", aliases: ["미국s&p500tr", "미국sp500tr", "sp500tr", "379800"] },
    { ticker: "214980", canonical: "KODEX 단기채권PLUS", aliases: ["단기채권", "파킹etf", "파킹", "214980"] },
    { ticker: "148070", canonical: "KOSEF 국고채10년", aliases: ["국고채10년", "국채10년", "148070"] },
    { ticker: "273130", canonical: "KODEX 종합채권(AA-이상)액티브", aliases: ["종합채권", "채권액티브", "273130"] },
    { ticker: "132030", canonical: "KODEX 골드선물(H)", aliases: ["골드선물", "금etf", "금선물", "132030"] },
    { ticker: "114800", canonical: "KODEX 인버스", aliases: ["인버스", "114800"] },
    { ticker: "122630", canonical: "KODEX 레버리지", aliases: ["레버리지", "122630"] },
    { ticker: "233740", canonical: "KODEX 코스닥150레버리지", aliases: ["코스닥150레버리지", "코스닥레버리지", "233740"] },
    { ticker: "229200", canonical: "KODEX 코스닥150", aliases: ["코스닥150", "229200"] },
    { ticker: "305720", canonical: "KODEX 2차전지산업", aliases: ["2차전지", "이차전지", "2차전지산업", "305720"] },
    { ticker: "305540", canonical: "TIGER 2차전지테마", aliases: ["2차전지테마", "이차전지테마", "305540"] },
    { ticker: "381170", canonical: "TIGER 미국테크TOP10 INDXX", aliases: ["미국테크top10", "미국테크10", "381170"] },
    { ticker: "379810", canonical: "KODEX 미국나스닥100TR", aliases: ["미국나스닥100tr", "나스닥100tr", "379810"] },
    { ticker: "229480", canonical: "KODEX 미국S&P500선물(H)", aliases: ["미국s&p500선물", "미국sp500선물", "229480"] },
    { ticker: "091180", canonical: "KODEX 자동차", aliases: ["자동차", "091180"] },
    {
      ticker: "0049M0",
      canonical: "ACE 미국배당퀄리티+커버드콜액티브",
      aliases: [
        "미국배당퀄리티커버드콜액티브",
        "미국배당퀄리티+커버드콜액티브",
        "미국배당퀄리티커버드콜",
        "0049m0",
        "a0049m0"
      ]
    }
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
    "069500": "069500",
    "102110": "102110",
    "114800": "114800",
    "122630": "122630",
    "132030": "132030",
    "148070": "148070",
    "214980": "214980",
    "229200": "229200",
    "229480": "229480",
    "233740": "233740",
    "273130": "273130",
    "305540": "305540",
    "305720": "305720",
    "360750": "360750",
    "379800": "379800",
    "379810": "379810",
    "381170": "381170",
    "0049m0": "0049M0",
    "a0049m0": "0049M0",
    "489250": "489250",
    "kodex200": "069500",
    "tiger200": "102110",
    "kodex골드선물h": "132030",
    "kodex골드선물(h)": "132030",
    "kosef국고채10년": "148070",
    "tiger미국s&p500": "360750",
    "tiger미국sp500": "360750"
  });

  const PRODUCT_SUGGESTIONS = Object.freeze([
    { name: "KODEX 200", symbol: "069500", aliases: ["069500", "kodex200"] },
    { name: "TIGER 200", symbol: "102110", aliases: ["102110", "tiger200"] },
    { name: "KODEX 인버스", symbol: "114800", aliases: ["114800", "인버스"] },
    { name: "KODEX 레버리지", symbol: "122630", aliases: ["122630", "레버리지"] },
    { name: "KODEX 골드선물(H)", symbol: "132030", aliases: ["132030", "kodex골드선물h"] },
    { name: "KOSEF 국고채10년", symbol: "148070", aliases: ["148070", "국고채10년"] },
    { name: "KODEX 단기채권PLUS", symbol: "214980", aliases: ["214980", "단기채권", "파킹etf"] },
    { name: "KODEX 코스닥150", symbol: "229200", aliases: ["229200", "코스닥150"] },
    { name: "KODEX 미국S&P500선물(H)", symbol: "229480", aliases: ["229480", "미국s&p500선물"] },
    { name: "KODEX 코스닥150레버리지", symbol: "233740", aliases: ["233740", "코스닥150레버리지"] },
    { name: "KODEX 종합채권(AA-이상)액티브", symbol: "273130", aliases: ["273130", "종합채권"] },
    { name: "TIGER 2차전지테마", symbol: "305540", aliases: ["305540", "2차전지테마"] },
    { name: "KODEX 2차전지산업", symbol: "305720", aliases: ["305720", "2차전지산업"] },
    { name: "TIGER 미국S&P500", symbol: "360750", aliases: ["360750", "tiger미국sp500", "미국s&p500"] },
    { name: "KODEX 미국S&P500TR", symbol: "379800", aliases: ["379800", "sp500tr"] },
    { name: "KODEX 미국나스닥100TR", symbol: "379810", aliases: ["379810", "나스닥100tr"] },
    { name: "TIGER 미국테크TOP10 INDXX", symbol: "381170", aliases: ["381170", "미국테크top10"] },
    { name: "KODEX 테슬라커버드콜채권혼합액티브", symbol: "475080", aliases: ["475080", "kodex테슬라", "테슬라커버드콜채권혼합액티브", "테슬라커버드콜채권혼합"] },
    { name: "ACE 미국배당퀄리티+커버드콜액티브", symbol: "0049M0", aliases: ["0049m0", "a0049m0", "미국배당퀄리티커버드콜액티브"] },
    { name: "KODEX 미국배당다우존스", symbol: "489250", aliases: ["489250", "미국배당다우존스", "미국배당다우"] }
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

  function resolveSecurityQuery(rawInput) {
    const input = String(rawInput || "").trim();
    if (!input) return "";

    const securityCode = normalizeSecurityCode(input);
    if (securityCode) {
      return securityCode;
    }

    const etfMatch = findKrEtfByAlias(input);
    if (etfMatch) {
      return etfMatch.ticker;
    }

    const aliasKey = normalizeAliasKey(input);
    if (SYMBOL_ALIAS_MAP[aliasKey]) {
      return SYMBOL_ALIAS_MAP[aliasKey];
    }

    const fromSuggestion = PRODUCT_SUGGESTIONS.find((item) => {
      if (normalizeAliasKey(item.name) === aliasKey) return true;
      return item.aliases.some((alias) => normalizeAliasKey(alias) === aliasKey);
    });
    if (fromSuggestion) {
      return fromSuggestion.symbol;
    }

    return input.replace(/\s+/g, " ").trim();
  }

  function getSuggestionCandidates(rawQuery) {
    const query = normalizeAliasKey(rawQuery);
    const queryTokens = tokenizeSuggestionQuery(rawQuery);
    if (!query || !queryTokens.length) return [];

    const results = PRODUCT_SUGGESTIONS.map((item) => {
      const keys = [
        normalizeAliasKey(item.name),
        normalizeAliasKey(item.symbol),
        ...item.aliases.map(normalizeAliasKey)
      ];
      const matchesAllTokens = queryTokens.every((token) => keys.some((key) => key.includes(token)));
      if (!matchesAllTokens) return null;
      const starts = keys.some((key) => key.startsWith(query));
      const contains = keys.some((key) => key.includes(query));
      if (!starts && !contains) return null;
      return { ...item, starts };
    }).filter(Boolean);

    results.sort((a, b) => {
      if (a.starts !== b.starts) return a.starts ? -1 : 1;
      return a.name.localeCompare(b.name, "ko");
    });

    return results.slice(0, MAX_SUGGESTION_CANDIDATES);
  }

  function mergeSuggestionCandidates(primaryItems, secondaryItems) {
    const merged = [];
    const seen = new Set();

    [...(primaryItems || []), ...(secondaryItems || [])].forEach((item) => {
      if (!item || !item.name || !item.symbol) return;
      const key = `${normalizeSymbol(item.symbol)}::${normalizeAliasKey(item.name)}`;
      if (seen.has(key)) return;
      seen.add(key);
      merged.push({
        name: String(item.name).trim(),
        symbol: normalizeSymbol(item.symbol),
        aliases: Array.isArray(item.aliases) ? item.aliases : []
      });
    });

    return merged.slice(0, MAX_SUGGESTION_CANDIDATES);
  }

  async function fetchRemoteSuggestionCandidates(rawQuery, { signal } = {}) {
    const query = String(rawQuery || "").trim();
    if (query.length < 2) return [];

    try {
      const response = await fetch(`/api/quote?mode=suggest&query=${encodeURIComponent(query)}`, {
        signal,
        headers: {
          accept: "application/json,text/plain,*/*"
        }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) return [];
      if (!Array.isArray(payload?.items)) return [];

      return payload.items
        .map((item) => ({
          name: String(item?.name || "").trim(),
          symbol: normalizeSymbol(item?.symbol),
          aliases: []
        }))
        .filter((item) => item.name && item.symbol)
        .slice(0, MAX_SUGGESTION_CANDIDATES);
    } catch (_error) {
      return [];
    }
  }

  async function getSuggestionCandidatesAsync(rawQuery, { signal } = {}) {
    const localItems = getSuggestionCandidates(rawQuery);
    const remoteItems = await fetchRemoteSuggestionCandidates(rawQuery, { signal });
    return mergeSuggestionCandidates(localItems, remoteItems);
  }

  window.RebalancingSymbols = Object.freeze({
    KR_ETF_ALIAS_MAP,
    PRODUCT_SUGGESTIONS,
    SYMBOL_ALIAS_MAP,
    fetchRemoteSuggestionCandidates,
    findKrEtfByAlias,
    getSuggestionCandidates,
    getSuggestionCandidatesAsync,
    normalizeAliasKey,
    normalizeKrEtfAlias,
    normalizeSecurityCode,
    normalizeSymbol,
    tokenizeSuggestionQuery,
    resolveSecurityQuery
  });
})();
