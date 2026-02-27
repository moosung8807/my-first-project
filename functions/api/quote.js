export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const symbol = String(requestUrl.searchParams.get("symbol") || "").trim().toUpperCase();

  if (!symbol) {
    return jsonResponse({ error: "symbol 파라미터가 필요합니다." }, 400);
  }

  if (!/^[A-Z0-9.^=\-]{1,20}$/.test(symbol)) {
    return jsonResponse({ error: "지원하지 않는 symbol 형식입니다." }, 400);
  }

  const upstreamUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        "user-agent": "Mozilla/5.0",
        "accept": "application/json"
      }
    });

    if (!upstream.ok) {
      return jsonResponse({ error: "Yahoo Finance 응답 오류", status: upstream.status }, 502);
    }

    const payload = await upstream.json();
    const quote = payload?.quoteResponse?.result?.[0];
    const regularMarketPrice = Number(quote?.regularMarketPrice);

    if (!quote || !isFinite(regularMarketPrice) || regularMarketPrice <= 0) {
      return jsonResponse({ error: "현재가를 찾을 수 없습니다." }, 404);
    }

    return jsonResponse(
      {
        symbol: String(quote.symbol || symbol).toUpperCase(),
        price: regularMarketPrice,
        currency: quote.currency || null,
        exchangeName: quote.fullExchangeName || quote.exchange || null
      },
      200
    );
  } catch (error) {
    return jsonResponse({ error: "프록시 호출 중 오류가 발생했습니다." }, 500);
  }
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
