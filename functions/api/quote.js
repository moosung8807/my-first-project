export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const symbol = String(requestUrl.searchParams.get("symbol") || "").trim().toUpperCase();

  if (!symbol) {
    return jsonResponse({ error: "symbol 파라미터가 필요합니다." }, 400);
  }

  if (!/^[A-Z0-9.^=\-]{1,20}$/.test(symbol)) {
    return jsonResponse({ error: "지원하지 않는 symbol 형식입니다." }, 400);
  }

  try {
    const validation = await validateYahooSymbol(symbol);
    if (!validation.ok || !validation.quote) {
      return jsonResponse({ error: "현재가를 찾을 수 없습니다." }, 404);
    }
    const regularMarketPrice = Number(validation.quote.regularMarketPrice);

    return jsonResponse(
      {
        symbol: String(validation.resolvedSymbol || validation.quote.symbol || symbol).toUpperCase(),
        price: regularMarketPrice,
        currency: validation.quote.currency || null,
        exchangeName: validation.quote.fullExchangeName || validation.quote.exchange || null
      },
      200
    );
  } catch (error) {
    if (error && error.upstreamStatus) {
      return jsonResponse({ error: "Yahoo Finance 응답 오류", status: error.upstreamStatus }, 502);
    }
    return jsonResponse({ error: "프록시 호출 중 오류가 발생했습니다." }, 500);
  }
}

async function validateYahooSymbol(inputSymbol) {
  const candidates = buildSymbolCandidates(inputSymbol);
  for (const candidate of candidates) {
    const quote = await fetchYahooQuote(candidate);
    const price = Number(quote?.regularMarketPrice);
    if (!quote || !isFinite(price) || price <= 0) {
      continue;
    }
    return {
      ok: true,
      price,
      resolvedSymbol: String(quote.symbol || candidate).toUpperCase(),
      quote
    };
  }
  return { ok: false };
}

function buildSymbolCandidates(rawSymbol) {
  const symbol = String(rawSymbol || "").trim().toUpperCase();
  if (!symbol) return [];

  if (/^\d{6}$/.test(symbol)) {
    return [`${symbol}.KS`, `${symbol}.KQ`];
  }
  if (/^\d{6}\.(KS|KQ)$/.test(symbol)) {
    const base = symbol.slice(0, 6);
    const other = symbol.endsWith(".KS") ? `${base}.KQ` : `${base}.KS`;
    return [symbol, other];
  }
  return [symbol];
}

async function fetchYahooQuote(symbol) {
  const direct = await fetchQuoteEndpoint(symbol);
  if (direct.ok) return direct.quote;
  if (direct.status === 404) return null;

  if (![401, 403, 429].includes(direct.status)) {
    throw { upstreamStatus: direct.status };
  }

  const session = await getYahooSession();
  if (!session) {
    throw { upstreamStatus: direct.status };
  }

  const withCrumb = await fetchQuoteEndpoint(symbol, session);
  if (withCrumb.ok) return withCrumb.quote;
  if (withCrumb.status === 404) return null;

  throw { upstreamStatus: withCrumb.status || direct.status };
}

async function fetchQuoteEndpoint(symbol, session = null) {
  const url = new URL("https://query1.finance.yahoo.com/v7/finance/quote");
  url.searchParams.set("symbols", symbol);
  if (session?.crumb) {
    url.searchParams.set("crumb", session.crumb);
  }

  const headers = {
    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "accept": "application/json,text/plain,*/*",
    "accept-language": "en-US,en;q=0.9"
  };
  if (session?.cookie) {
    headers.cookie = session.cookie;
  }

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    return { ok: false, status: response.status };
  }

  const payload = await response.json();
  const quote = payload?.quoteResponse?.result?.[0];
  if (!quote) {
    return { ok: false, status: 404 };
  }
  return { ok: true, quote, status: 200 };
}

async function getYahooSession() {
  const baseHeaders = {
    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9"
  };

  const cookieResp = await fetch("https://fc.yahoo.com", {
    headers: baseHeaders,
    redirect: "manual"
  });
  const setCookie = cookieResp.headers.get("set-cookie");
  if (!setCookie) return null;
  const cookie = setCookie.split(",").map((item) => item.trim().split(";")[0]).join("; ");
  if (!cookie) return null;

  const crumbResp = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
    headers: {
      ...baseHeaders,
      cookie
    }
  });
  if (!crumbResp.ok) return null;

  const crumb = (await crumbResp.text()).trim();
  if (!crumb) return null;

  return { cookie, crumb };
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
