const SERVICE_BASE_URL = "https://apis.data.go.kr/1160100/service/GetSecuritiesProductInfoService";
const PRODUCT_OPERATIONS = [
  { market: "ETF", path: "getETFPriceInfo" },
  { market: "ETN", path: "getETNPriceInfo" },
  { market: "ELW", path: "getELWPriceInfo" }
];

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const rawQuery = String(
    requestUrl.searchParams.get("symbol") ||
    requestUrl.searchParams.get("query") ||
    ""
  ).trim();

  if (!rawQuery) {
    return jsonResponse({ error: "symbol 또는 query 파라미터가 필요합니다." }, 400);
  }

  if (!isSupportedQuery(rawQuery)) {
    return jsonResponse({ error: "지원하지 않는 종목명 또는 종목코드 형식입니다." }, 400);
  }

  const serviceKey = resolveServiceKey(context.env || {});
  if (!serviceKey) {
    return jsonResponse({ error: "공공데이터포털 서비스키가 설정되지 않았습니다." }, 500);
  }

  try {
    const result = await fetchSecuritiesProductQuote(rawQuery, serviceKey);
    if (!result) {
      return jsonResponse({ error: "가격 정보를 찾을 수 없습니다." }, 404);
    }

    return jsonResponse(
      {
        symbol: result.symbol,
        name: result.name,
        market: result.market,
        price: result.price,
        baseDate: result.baseDate
      },
      200
    );
  } catch (error) {
    if (error && error.kind === "upstream_api") {
      return jsonResponse(
        {
          error: error.message || "공공데이터포털 응답 오류",
          code: error.code || null
        },
        error.status || 502
      );
    }

    if (error && error.kind === "upstream_http") {
      return jsonResponse(
        {
          error: "공공데이터포털 호출 중 오류가 발생했습니다.",
          status: error.status || 502
        },
        502
      );
    }

    return jsonResponse({ error: "프록시 호출 중 오류가 발생했습니다." }, 500);
  }
}

async function fetchSecuritiesProductQuote(rawQuery, serviceKey) {
  const normalizedQuery = normalizeProductQuery(rawQuery);
  const isCodeQuery = /^\d{6}$/.test(normalizedQuery);
  let lastApiError = null;

  for (const operation of PRODUCT_OPERATIONS) {
    try {
      const items = await fetchOperationItems(operation.path, normalizedQuery, serviceKey, { isCodeQuery });
      const bestItem = pickBestItem(items, normalizedQuery, { isCodeQuery });
      if (!bestItem) continue;

      const price = Number(bestItem.clpr);
      if (!isFinite(price) || price <= 0) continue;

      return {
        symbol: String(bestItem.srtnCd || normalizedQuery).trim(),
        name: String(bestItem.itmsNm || "").trim() || null,
        market: operation.market,
        price,
        baseDate: String(bestItem.basDt || "").trim() || null
      };
    } catch (error) {
      if (error && error.kind === "upstream_api") {
        lastApiError = error;
        continue;
      }
      throw error;
    }
  }

  if (lastApiError) throw lastApiError;
  return null;
}

async function fetchOperationItems(path, query, serviceKey, { isCodeQuery }) {
  const params = new URLSearchParams();
  params.set("numOfRows", isCodeQuery ? "10" : "20");
  params.set("pageNo", "1");
  params.set("resultType", "json");

  if (isCodeQuery) {
    params.set("likeSrtnCd", query);
  } else {
    params.set("likeItmsNm", query);
  }

  const endpoint = `${SERVICE_BASE_URL}/${path}?${params.toString()}&serviceKey=${formatServiceKey(serviceKey)}`;
  const response = await fetch(endpoint, {
    headers: {
      accept: "application/json,text/plain,*/*"
    }
  });

  if (!response.ok) {
    throw {
      kind: "upstream_http",
      status: response.status
    };
  }

  const payload = await response.json();
  const header = payload?.response?.header || {};
  const resultCode = String(header.resultCode || "");
  const resultMsg = String(header.resultMsg || "").trim();

  if (resultCode && resultCode !== "00") {
    throw mapApiError(resultCode, resultMsg);
  }

  const items = payload?.response?.body?.items?.item;
  if (Array.isArray(items)) return items;
  if (items && typeof items === "object") return [items];
  return [];
}

function pickBestItem(items, query, { isCodeQuery }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const queryKey = normalizeSearchKey(query);
  let bestItem = null;
  let bestScore = -1;

  for (const item of items) {
    const code = String(item?.srtnCd || "").trim();
    const name = String(item?.itmsNm || "").trim();
    const nameKey = normalizeSearchKey(name);
    let score = 0;

    if (isCodeQuery) {
      if (code === query) score += 1000;
      else if (code.startsWith(query)) score += 600;
      else if (code.includes(query)) score += 400;
    } else {
      if (name === query) score += 950;
      if (nameKey === queryKey) score += 900;
      else if (nameKey.startsWith(queryKey)) score += 650;
      else if (nameKey.includes(queryKey)) score += 500;
      if (queryKey && normalizeSearchKey(code) === queryKey) score += 850;
    }

    const price = Number(item?.clpr);
    if (isFinite(price) && price > 0) {
      score += 50;
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  return bestScore > 0 ? bestItem : null;
}

function normalizeProductQuery(value) {
  const input = String(value || "").trim();
  if (!input) return "";

  const upper = input.toUpperCase();
  const codeMatch = upper.match(/^(\d{6})(?:\.(?:KS|KQ))?$/);
  if (codeMatch) {
    return codeMatch[1];
  }

  return input.replace(/\s+/g, " ");
}

function normalizeSearchKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^0-9a-zA-Z가-힣]/g, "");
}

function isSupportedQuery(value) {
  return /^[0-9A-Za-z가-힣\s&().+\-]{1,120}$/.test(String(value || "").trim());
}

function formatServiceKey(serviceKey) {
  const raw = String(serviceKey || "").trim();
  if (!raw) return "";
  return /%[0-9A-Fa-f]{2}/.test(raw) ? raw : encodeURIComponent(raw);
}

function resolveServiceKey(env) {
  return (
    env.DATA_GO_KR_SERVICE_KEY ||
    env.PUBLIC_DATA_PORTAL_SERVICE_KEY ||
    env.SECURITIES_PRODUCT_SERVICE_KEY ||
    env.SERVICE_KEY ||
    ""
  );
}

function mapApiError(code, message) {
  if (code === "22") {
    return {
      kind: "upstream_api",
      code,
      status: 503,
      message: message || "공공데이터포털 요청 한도를 초과했습니다."
    };
  }

  if (code === "30" || code === "31" || code === "32") {
    return {
      kind: "upstream_api",
      code,
      status: 502,
      message: message || "공공데이터포털 서비스키 설정을 확인해 주세요."
    };
  }

  return {
    kind: "upstream_api",
    code,
    status: 502,
    message: message || "공공데이터포털 응답 오류"
  };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
