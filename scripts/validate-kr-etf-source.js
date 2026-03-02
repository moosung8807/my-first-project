#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const out = {
    input: "data/kr-etf-source.seed.json",
    output: "data/kr-etf-validation.json",
    cache: "data/kr-etf-validation.cache.json",
    delayMs: 900,
    batchSize: 5,
    batchPauseMs: 2500,
    passThreshold: 0.72,
    checkThreshold: 0.4,
    limit: 0,
    retryOnly: false,
    timeoutMs: 8000,
    max429Retries: 6,
    minRlPauseMs: 45000,
    maxRlPauseMs: 900000,
    maxRetryPerCode: 12
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--input" && argv[i + 1]) {
      out.input = argv[i + 1];
      i += 1;
    } else if (a === "--out" && argv[i + 1]) {
      out.output = argv[i + 1];
      i += 1;
    } else if (a === "--cache" && argv[i + 1]) {
      out.cache = argv[i + 1];
      i += 1;
    } else if (a === "--delay" && argv[i + 1]) {
      out.delayMs = Math.max(700, Number(argv[i + 1]) || out.delayMs);
      i += 1;
    } else if (a === "--batch" && argv[i + 1]) {
      out.batchSize = Math.min(10, Math.max(1, Number(argv[i + 1]) || out.batchSize));
      i += 1;
    } else if (a === "--batch-pause" && argv[i + 1]) {
      out.batchPauseMs = Math.max(0, Number(argv[i + 1]) || out.batchPauseMs);
      i += 1;
    } else if (a === "--pass" && argv[i + 1]) {
      out.passThreshold = Number(argv[i + 1]) || out.passThreshold;
      i += 1;
    } else if (a === "--check" && argv[i + 1]) {
      out.checkThreshold = Number(argv[i + 1]) || out.checkThreshold;
      i += 1;
    } else if (a === "--limit" && argv[i + 1]) {
      out.limit = Math.max(0, Number(argv[i + 1]) || 0);
      i += 1;
    } else if (a === "--retry-only") {
      out.retryOnly = true;
    } else if (a === "--timeout" && argv[i + 1]) {
      out.timeoutMs = Math.max(3000, Number(argv[i + 1]) || out.timeoutMs);
      i += 1;
    } else if (a === "--max-429-retries" && argv[i + 1]) {
      out.max429Retries = Math.max(1, Number(argv[i + 1]) || out.max429Retries);
      i += 1;
    } else if (a === "--min-rl-pause" && argv[i + 1]) {
      out.minRlPauseMs = Math.max(10000, Number(argv[i + 1]) || out.minRlPauseMs);
      i += 1;
    } else if (a === "--max-rl-pause" && argv[i + 1]) {
      out.maxRlPauseMs = Math.max(out.minRlPauseMs, Number(argv[i + 1]) || out.maxRlPauseMs);
      i += 1;
    } else if (a === "--max-retry-per-code" && argv[i + 1]) {
      out.maxRetryPerCode = Math.max(1, Number(argv[i + 1]) || out.maxRetryPerCode);
      i += 1;
    }
  }
  return out;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomJitter(minMs, maxMs) {
  const span = Math.max(0, maxMs - minMs);
  return minMs + Math.floor(Math.random() * (span + 1));
}

function normalizeForCompare(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[\[\]().,+\-_/]/g, "")
    .replace(/etf|tr|선물|합성|액티브|active|인덱스|index|h/gi, "")
    .replace(/kodex|tiger|rise|kbstar|arirang|ace|kindex|kosef|sol|plus|hanaro|timefolio/gi, "")
    .replace(/코덱스|타이거|라이즈|케이스타|아리랑|에이스|킨덱스|코세프|쏠|플러스|하나로|타임폴리오/g, "")
    .replace(/[^0-9a-z가-힣]/g, "");
}

function ngramSet(s, n = 2) {
  const out = new Set();
  if (!s) return out;
  if (s.length < n) {
    out.add(s);
    return out;
  }
  for (let i = 0; i <= s.length - n; i += 1) {
    out.add(s.slice(i, i + n));
  }
  return out;
}

function jaccard(a, b) {
  const sa = ngramSet(a);
  const sb = ngramSet(b);
  if (!sa.size && !sb.size) return 1;
  let inter = 0;
  for (const x of sa) {
    if (sb.has(x)) inter += 1;
  }
  const union = sa.size + sb.size - inter;
  return union ? inter / union : 0;
}

function bestSimilarity(canonicalNorm, yahooShortNorm, yahooLongNorm) {
  const s1 = jaccard(canonicalNorm, yahooShortNorm);
  const s2 = jaccard(canonicalNorm, yahooLongNorm);
  return Math.max(s1, s2);
}

function toTicker(code) {
  const digits = String(code || "").replace(/[^0-9]/g, "");
  if (!/^\d{6}$/.test(digits)) return "";
  return `${digits}.KS`;
}

function parseRetryAfterMs(retryAfterHeader) {
  if (!retryAfterHeader) return 0;
  const asNum = Number(retryAfterHeader);
  if (Number.isFinite(asNum) && asNum > 0) return asNum * 1000;
  const asDate = new Date(retryAfterHeader).getTime();
  if (!Number.isFinite(asDate)) return 0;
  return Math.max(0, asDate - Date.now());
}

function isGlobalRateLimited(rateLimitState) {
  return Date.now() < rateLimitState.cooldownUntil;
}

function registerRateLimit(rateLimitState, retryAfterMs, args) {
  rateLimitState.hits += 1;
  rateLimitState.last429At = Date.now();
  const escalated = Math.min(
    args.maxRlPauseMs,
    args.minRlPauseMs + (Math.min(rateLimitState.hits, 10) * 15_000)
  );
  const cooldownMs = Math.max(args.minRlPauseMs, retryAfterMs || 0, escalated);
  rateLimitState.cooldownUntil = Date.now() + cooldownMs + randomJitter(500, 2500);
}

function registerSuccess(rateLimitState) {
  rateLimitState.hits = Math.max(0, rateLimitState.hits - 1);
  if (!isGlobalRateLimited(rateLimitState)) {
    rateLimitState.cooldownUntil = 0;
  }
}

function quoteFromQuotePayload(payload, fallbackSymbol) {
  const quote = payload?.quoteResponse?.result?.[0];
  if (!quote) return null;
  const price = Number(quote.regularMarketPrice);
  if (!Number.isFinite(price)) return null;
  return {
    symbol: String(quote.symbol || fallbackSymbol).toUpperCase(),
    shortName: quote.shortName || "",
    longName: quote.longName || "",
    price
  };
}

function quoteFromChartPayload(payload, fallbackSymbol) {
  const meta = payload?.chart?.result?.[0]?.meta;
  if (!meta) return null;
  const price = Number(meta.regularMarketPrice);
  if (!Number.isFinite(price)) return null;
  return {
    symbol: String(meta.symbol || fallbackSymbol).toUpperCase(),
    shortName: meta.shortName || "",
    longName: meta.instrumentType || "",
    price
  };
}

async function fetchJson(url, headers, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { headers, signal: controller.signal });
    const body = await resp.text();
    let payload = {};
    try {
      payload = body ? JSON.parse(body) : {};
    } catch {
      payload = {};
    }
    return { ok: resp.ok, status: resp.status, headers: resp.headers, payload };
  } catch (err) {
    const reason = err && err.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR";
    return { ok: false, status: 0, reason };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchYahooQuote(symbol, args, rateLimitState) {
  const headers = {
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    accept: "application/json,text/plain,*/*",
    "accept-language": "en-US,en;q=0.9"
  };
  const hosts = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];

  let lastReason = "UNKNOWN";
  let saw429 = false;

  if (isGlobalRateLimited(rateLimitState)) {
    return { ok: false, reason: "RETRY_RATE_LIMIT_GLOBAL" };
  }

  for (let attempt = 0; attempt <= args.max429Retries; attempt += 1) {
    if (isGlobalRateLimited(rateLimitState)) {
      return { ok: false, reason: "RETRY_RATE_LIMIT_GLOBAL" };
    }
    let sawNoResult = false;
    let hitRateLimitThisAttempt = false;

    for (const host of hosts) {
      const quoteUrl = new URL(`https://${host}/v7/finance/quote`);
      quoteUrl.searchParams.set("symbols", symbol);
      const quoteResp = await fetchJson(quoteUrl.toString(), headers, args.timeoutMs);

      if (quoteResp.ok) {
        const quote = quoteFromQuotePayload(quoteResp.payload, symbol);
        if (quote) {
          registerSuccess(rateLimitState);
          return { ok: true, quote };
        }
        sawNoResult = true;
      } else if (quoteResp.status === 429) {
        saw429 = true;
        hitRateLimitThisAttempt = true;
        lastReason = "HTTP_429";
        registerRateLimit(
          rateLimitState,
          parseRetryAfterMs(quoteResp.headers?.get("retry-after")),
          args
        );
        break;
      } else if (quoteResp.status > 0) {
        lastReason = `HTTP_${quoteResp.status}`;
      } else if (quoteResp.reason) {
        lastReason = quoteResp.reason;
      }

      if (hitRateLimitThisAttempt) break;

      const chartUrl = new URL(`https://${host}/v8/finance/chart/${symbol}`);
      chartUrl.searchParams.set("interval", "1d");
      chartUrl.searchParams.set("range", "1d");
      const chartResp = await fetchJson(chartUrl.toString(), headers, args.timeoutMs);

      if (chartResp.ok) {
        const quote = quoteFromChartPayload(chartResp.payload, symbol);
        if (quote) {
          registerSuccess(rateLimitState);
          return { ok: true, quote };
        }
        sawNoResult = true;
      } else if (chartResp.status === 429) {
        saw429 = true;
        hitRateLimitThisAttempt = true;
        lastReason = "HTTP_429";
        registerRateLimit(
          rateLimitState,
          parseRetryAfterMs(chartResp.headers?.get("retry-after")),
          args
        );
        break;
      } else if (chartResp.status > 0) {
        lastReason = `HTTP_${chartResp.status}`;
      } else if (chartResp.reason) {
        lastReason = chartResp.reason;
      }

      await sleep(randomJitter(200, 500));
    }

    if (hitRateLimitThisAttempt) {
      return { ok: false, reason: "RETRY_RATE_LIMIT" };
    }
    if (sawNoResult && !saw429) return { ok: false, reason: "NO_RESULT" };
    await sleep(350 * (attempt + 1));
  }

  if (saw429) return { ok: false, reason: "RETRY_RATE_LIMIT" };
  return { ok: false, reason: lastReason };
}

function loadJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function loadCache(cachePath) {
  return loadJson(cachePath, {});
}

function saveCache(cachePath, cache) {
  fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

function emptyGrouped() {
  return { PASS: [], CHECK: [], RETRY: [], FAIL: [], DEFERRED_RATE_LIMIT: [] };
}

function normalizeGrouped(input) {
  const grouped = emptyGrouped();
  for (const key of Object.keys(grouped)) {
    if (Array.isArray(input?.[key])) grouped[key] = input[key];
  }
  return grouped;
}

function mergeGrouped(previous, current) {
  const statusRank = {
    FAIL: 0,
    DEFERRED_RATE_LIMIT: 1,
    RETRY: 2,
    CHECK: 3,
    PASS: 4
  };
  const byCode = new Map();

  const pushBest = (row) => {
    const code = String(row.code || "");
    if (!code) return;
    const prev = byCode.get(code);
    if (!prev) {
      byCode.set(code, row);
      return;
    }
    const prevRank = statusRank[prev.status] ?? -1;
    const nextRank = statusRank[row.status] ?? -1;
    if (nextRank > prevRank) byCode.set(code, row);
  };

  for (const status of Object.keys(previous)) {
    for (const row of previous[status]) {
      pushBest({ ...row, status: row.status || status });
    }
  }

  for (const status of Object.keys(current)) {
    for (const row of current[status]) {
      pushBest({ ...row, status: row.status || status });
    }
  }

  const merged = emptyGrouped();
  for (const row of byCode.values()) {
    if (!merged[row.status]) merged.FAIL.push(row);
    else merged[row.status].push(row);
  }
  return merged;
}

function classifyResultFromQuote(canonical, code, tickerCandidate, quote, thresholds) {
  const shortName = quote.shortName || "";
  const longName = quote.longName || "";
  const canonicalNorm = normalizeForCompare(canonical);
  const shortNorm = normalizeForCompare(shortName);
  const longNorm = normalizeForCompare(longName);
  const similarity = bestSimilarity(canonicalNorm, shortNorm, longNorm);
  const status = similarity >= thresholds.pass ? "PASS" : "CHECK";
  return {
    status,
    canonical,
    code,
    tickerCandidate,
    resolvedSymbol: quote.symbol,
    similarity: Number(similarity.toFixed(4)),
    yahooShortName: shortName,
    yahooLongName: longName,
    reason: similarity >= thresholds.pass ? "SIMILARITY_HIGH" : "SIMILARITY_AMBIGUOUS"
  };
}

async function validateOne(item, thresholds, cache, args, rateLimitState) {
  const canonical = String(item.canonical || "").trim();
  const code = String(item.code || "").trim();
  const tickerCandidate = toTicker(code);

  if (!tickerCandidate) {
    return {
      status: "FAIL",
      canonical,
      code,
      tickerCandidate,
      reason: "INVALID_CODE"
    };
  }

  if (cache[tickerCandidate] && cache[tickerCandidate].kind === "QUOTE") {
    return classifyResultFromQuote(
      canonical,
      code,
      tickerCandidate,
      cache[tickerCandidate].quote,
      thresholds
    );
  }
  if (cache[tickerCandidate] && cache[tickerCandidate].kind === "NO_RESULT") {
    return {
      status: "FAIL",
      canonical,
      code,
      tickerCandidate,
      reason: "YAHOO_NO_RESULT"
    };
  }

  const result = await fetchYahooQuote(tickerCandidate, args, rateLimitState);
  if (!result.ok) {
    const retryMeta = cache[tickerCandidate] && typeof cache[tickerCandidate] === "object"
      ? cache[tickerCandidate]
      : {};
    if (result.reason === "NO_RESULT" || result.reason === "NO_PRICE") {
      cache[tickerCandidate] = { kind: "NO_RESULT", ts: Date.now(), reason: result.reason };
      return {
        status: "FAIL",
        canonical,
        code,
        tickerCandidate,
        reason: "YAHOO_NO_RESULT"
      };
    }
    if (
      result.reason === "RETRY_RATE_LIMIT" ||
      result.reason === "HTTP_429" ||
      result.reason === "RETRY_RATE_LIMIT_GLOBAL"
    ) {
      const retryCount = Number(retryMeta.retryCount || 0) + 1;
      cache[tickerCandidate] = {
        ...retryMeta,
        kind: "RATE_LIMIT",
        retryCount,
        lastTriedAt: new Date().toISOString(),
        lastReason: result.reason
      };
      if (retryCount >= args.maxRetryPerCode) {
        return {
          status: "DEFERRED_RATE_LIMIT",
          canonical,
          code,
          tickerCandidate,
          retryCount,
          reason: "DEFERRED_RATE_LIMIT"
        };
      }
      return {
        status: "RETRY",
        canonical,
        code,
        tickerCandidate,
        retryCount,
        reason: result.reason
      };
    }
    return {
      status: "FAIL",
      canonical,
      code,
      tickerCandidate,
      reason: result.reason
    };
  }

  cache[tickerCandidate] = {
    kind: "QUOTE",
    ts: Date.now(),
    retryCount: 0,
    lastTriedAt: new Date().toISOString(),
    quote: result.quote
  };
  return classifyResultFromQuote(canonical, code, tickerCandidate, result.quote, thresholds);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(process.cwd(), args.input);
  const outputPath = path.resolve(process.cwd(), args.output);
  const cachePath = path.resolve(process.cwd(), args.cache);

  const raw = fs.readFileSync(inputPath, "utf8");
  const items = JSON.parse(raw);
  if (!Array.isArray(items)) {
    throw new Error("input JSON must be an array of ETF objects");
  }

  const cache = loadCache(cachePath);
  const previousOutput = loadJson(outputPath, {});
  const previousGrouped = normalizeGrouped(previousOutput);
  const retryCodes = new Set([
    ...previousGrouped.RETRY.map((r) => String(r.code || "")),
    ...previousGrouped.DEFERRED_RATE_LIMIT.map((r) => String(r.code || ""))
  ]);

  let queue = items.slice();
  if (args.retryOnly) {
    queue = queue.filter((item) => retryCodes.has(String(item.code || "")));
  }
  if (args.limit > 0) {
    queue = queue.slice(0, args.limit);
  }

  const rateLimitState = { cooldownUntil: 0, last429At: 0, hits: 0 };
  const currentGrouped = emptyGrouped();
  const replacedCodes = new Set();

  const buildOutput = () => {
    const grouped = mergeGrouped(previousGrouped, currentGrouped);
    const mergedTotal =
      grouped.PASS.length +
      grouped.CHECK.length +
      grouped.RETRY.length +
      grouped.DEFERRED_RATE_LIMIT.length +
      grouped.FAIL.length;
    return {
      meta: {
        generatedAt: new Date().toISOString(),
        source: path.relative(process.cwd(), inputPath),
        thresholds: {
          pass: args.passThreshold,
          check: args.checkThreshold
        },
        runtime: {
          delayMs: args.delayMs,
          batchSize: args.batchSize,
          batchPauseMs: args.batchPauseMs,
          cache: path.relative(process.cwd(), cachePath),
          retryOnly: args.retryOnly,
          limit: args.limit,
          timeoutMs: args.timeoutMs,
          max429Retries: args.max429Retries,
          minRlPauseMs: args.minRlPauseMs,
          maxRlPauseMs: args.maxRlPauseMs,
          maxRetryPerCode: args.maxRetryPerCode,
          globalRateLimit: {
            last429At: rateLimitState.last429At ? new Date(rateLimitState.last429At).toISOString() : null,
            cooldownUntil: rateLimitState.cooldownUntil ? new Date(rateLimitState.cooldownUntil).toISOString() : null
          },
          processedThisRun: replacedCodes.size
        },
        counts: {
          PASS: grouped.PASS.length,
          CHECK: grouped.CHECK.length,
          RETRY: grouped.RETRY.length,
          DEFERRED_RATE_LIMIT: grouped.DEFERRED_RATE_LIMIT.length,
          FAIL: grouped.FAIL.length,
          sourceTotal: items.length,
          mergedTotal
        }
      },
      PASS: grouped.PASS,
      CHECK: grouped.CHECK,
      RETRY: grouped.RETRY,
      DEFERRED_RATE_LIMIT: grouped.DEFERRED_RATE_LIMIT,
      FAIL: grouped.FAIL
    };
  };

  if (queue.length === 0) {
    const output = buildOutput();
    fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
    saveCache(cachePath, cache);
    console.log(`generated: ${path.relative(process.cwd(), outputPath)}`);
    console.log(output.meta.counts);
    return;
  }

  for (let start = 0; start < queue.length; start += args.batchSize) {
    const batch = queue.slice(start, start + args.batchSize);
    for (let i = 0; i < batch.length; i += 1) {
      const row = batch[i];
      replacedCodes.add(String(row.code || ""));
      const res = await validateOne(
        row,
        {
          pass: args.passThreshold,
          check: args.checkThreshold
        },
        cache,
        args,
        rateLimitState
      );
      currentGrouped[res.status].push(res);
      if (args.delayMs > 0 && i < batch.length - 1) {
        await sleep(args.delayMs + randomJitter(200, 1200));
      }
    }

    const partialOutput = buildOutput();
    fs.writeFileSync(outputPath, `${JSON.stringify(partialOutput, null, 2)}\n`, "utf8");
    saveCache(cachePath, cache);

    if (args.batchPauseMs > 0 && start + args.batchSize < queue.length) {
      await sleep(args.batchPauseMs + randomJitter(500, 1500));
    }
  }

  const output = buildOutput();
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  saveCache(cachePath, cache);
  console.log(`generated: ${path.relative(process.cwd(), outputPath)}`);
  console.log(output.meta.counts);
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
