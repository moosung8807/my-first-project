#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const out = {
    input: "data/kr-etf-source.seed.json",
    output: "data/kr-etf-validation.json",
    cache: "data/kr-etf-validation.cache.json",
    delayMs: 800,
    batchSize: 8,
    batchPauseMs: 1600,
    passThreshold: 0.72,
    checkThreshold: 0.4
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
      out.delayMs = Math.max(700, Number(argv[i + 1]) || 800);
      i += 1;
    } else if (a === "--batch" && argv[i + 1]) {
      out.batchSize = Math.min(10, Math.max(5, Number(argv[i + 1]) || 8));
      i += 1;
    } else if (a === "--batch-pause" && argv[i + 1]) {
      out.batchPauseMs = Math.max(0, Number(argv[i + 1]) || 0);
      i += 1;
    } else if (a === "--pass" && argv[i + 1]) {
      out.passThreshold = Number(argv[i + 1]) || out.passThreshold;
      i += 1;
    } else if (a === "--check" && argv[i + 1]) {
      out.checkThreshold = Number(argv[i + 1]) || out.checkThreshold;
      i += 1;
    }
  }
  return out;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

async function fetchYahooQuote(symbol) {
  const headers = {
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    accept: "application/json,text/plain,*/*",
    "accept-language": "en-US,en;q=0.9"
  };

  let lastReason = "UNKNOWN";
  let hit429 = false;
  const max429Retries = 3;
  for (let attempt = 0; attempt <= max429Retries; attempt += 1) {
    const url = new URL("https://query1.finance.yahoo.com/v7/finance/quote");
    url.searchParams.set("symbols", symbol);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let resp;
    try {
      resp = await fetch(url.toString(), { headers, signal: controller.signal });
    } catch (err) {
      clearTimeout(timeout);
      lastReason = err && err.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR";
      await sleep(300 * (attempt + 1));
      continue;
    }
    clearTimeout(timeout);

    if (resp.ok) {
      const payload = await resp.json().catch(() => ({}));
      const quote = payload?.quoteResponse?.result?.[0];
      if (!quote) return { ok: false, reason: "NO_RESULT" };
      const price = Number(quote.regularMarketPrice);
      if (!Number.isFinite(price)) return { ok: false, reason: "NO_PRICE" };
      return {
        ok: true,
        quote: {
          symbol: String(quote.symbol || symbol).toUpperCase(),
          shortName: quote.shortName || "",
          longName: quote.longName || "",
          price
        }
      };
    }

    lastReason = `HTTP_${resp.status}`;
    if (resp.status !== 429) break;
    hit429 = true;
    if (attempt >= max429Retries) break;
    await sleep(900 * (2 ** attempt));
  }

  if (hit429) return { ok: false, reason: "RETRY_RATE_LIMIT" };
  return { ok: false, reason: lastReason };
}

function loadCache(cachePath) {
  if (!fs.existsSync(cachePath)) return {};
  try {
    const raw = fs.readFileSync(cachePath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveCache(cachePath, cache) {
  fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
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

async function validateOne(item, thresholds, cache) {
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

  const result = await fetchYahooQuote(tickerCandidate);
  if (!result.ok) {
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
    if (result.reason === "RETRY_RATE_LIMIT" || result.reason === "HTTP_429") {
      return {
        status: "RETRY",
        canonical,
        code,
        tickerCandidate,
        reason: "RETRY_RATE_LIMIT"
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
  const grouped = { PASS: [], CHECK: [], FAIL: [], RETRY: [] };
  for (let start = 0; start < items.length; start += args.batchSize) {
    const batch = items.slice(start, start + args.batchSize);
    for (let i = 0; i < batch.length; i += 1) {
      const row = batch[i];
      const res = await validateOne(
        row,
        {
          pass: args.passThreshold,
          check: args.checkThreshold
        },
        cache
      );
      grouped[res.status].push(res);
      if (args.delayMs > 0 && i < batch.length - 1) {
        await sleep(args.delayMs);
      }
    }
    saveCache(cachePath, cache);
    if (args.batchPauseMs > 0 && start + args.batchSize < items.length) {
      await sleep(args.batchPauseMs);
    }
  }

  const output = {
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
        cache: path.relative(process.cwd(), cachePath)
      },
      counts: {
        PASS: grouped.PASS.length,
        CHECK: grouped.CHECK.length,
        RETRY: grouped.RETRY.length,
        FAIL: grouped.FAIL.length,
        total: items.length
      }
    },
    PASS: grouped.PASS,
    CHECK: grouped.CHECK,
    RETRY: grouped.RETRY,
    FAIL: grouped.FAIL
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  saveCache(cachePath, cache);
  console.log(`generated: ${path.relative(process.cwd(), outputPath)}`);
  console.log(output.meta.counts);
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
