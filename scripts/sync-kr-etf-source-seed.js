#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const SERVICE_BASE_URL = "https://apis.data.go.kr/1160100/service/GetSecuritiesProductInfoService/getETFPriceInfo";

function parseArgs(argv) {
  const out = {
    output: "data/kr-etf-source.seed.json",
    aliasOut: "data/kr-etf-alias-seed.json",
    pageSize: 1000,
    maxPages: 20,
    serviceKey: "",
    refreshAliasSeed: false,
    aliasTop: 0
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--out" && argv[i + 1]) {
      out.output = argv[i + 1];
      i += 1;
    } else if (arg === "--alias-out" && argv[i + 1]) {
      out.aliasOut = argv[i + 1];
      i += 1;
    } else if (arg === "--page-size" && argv[i + 1]) {
      out.pageSize = Math.min(1000, Math.max(100, Number(argv[i + 1]) || out.pageSize));
      i += 1;
    } else if (arg === "--max-pages" && argv[i + 1]) {
      out.maxPages = Math.max(1, Number(argv[i + 1]) || out.maxPages);
      i += 1;
    } else if (arg === "--service-key" && argv[i + 1]) {
      out.serviceKey = String(argv[i + 1] || "").trim();
      i += 1;
    } else if (arg === "--refresh-alias-seed") {
      out.refreshAliasSeed = true;
    } else if (arg === "--alias-top" && argv[i + 1]) {
      const raw = String(argv[i + 1] || "").trim().toLowerCase();
      out.aliasTop = raw === "all" ? 0 : Math.max(0, Number(raw) || 0);
      i += 1;
    }
  }

  return out;
}

function resolveServiceKey(cliValue) {
  return String(
    cliValue ||
    process.env.DATA_GO_KR_SERVICE_KEY ||
    process.env.PUBLIC_DATA_PORTAL_SERVICE_KEY ||
    process.env.SECURITIES_PRODUCT_SERVICE_KEY ||
    process.env.SERVICE_KEY ||
    ""
  ).trim();
}

function formatServiceKey(serviceKey) {
  if (!serviceKey) return "";
  return /%[0-9A-Fa-f]{2}/.test(serviceKey) ? serviceKey : encodeURIComponent(serviceKey);
}

function toNum(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function normalizeCode(value) {
  const digits = String(value || "").replace(/[^0-9]/g, "");
  return /^\d{6}$/.test(digits) ? digits : "";
}

function readJsonArray(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

async function fetchPage(pageNo, pageSize, serviceKey) {
  const params = new URLSearchParams();
  params.set("numOfRows", String(pageSize));
  params.set("pageNo", String(pageNo));
  params.set("resultType", "json");

  const url = `${SERVICE_BASE_URL}?${params.toString()}&serviceKey=${formatServiceKey(serviceKey)}`;
  const response = await fetch(url, {
    headers: {
      accept: "application/json,text/plain,*/*"
    }
  });

  if (!response.ok) {
    throw new Error(`ETF 목록 조회 실패: HTTP ${response.status}`);
  }

  const payload = await response.json();
  const header = payload?.response?.header || {};
  const resultCode = String(header.resultCode || "");
  if (resultCode && resultCode !== "00") {
    throw new Error(header.resultMsg || `ETF 목록 조회 실패: API ${resultCode}`);
  }

  const body = payload?.response?.body || {};
  const items = body?.items?.item;
  return {
    totalCount: Math.max(0, Number(body.totalCount) || 0),
    items: Array.isArray(items) ? items : items ? [items] : []
  };
}

async function fetchAllEtfItems(args, serviceKey) {
  const merged = [];
  let totalCount = 0;

  for (let pageNo = 1; pageNo <= args.maxPages; pageNo += 1) {
    const page = await fetchPage(pageNo, args.pageSize, serviceKey);
    if (pageNo === 1) {
      totalCount = page.totalCount;
    }
    if (!page.items.length) break;
    merged.push(...page.items);

    if (totalCount > 0 && merged.length >= totalCount) break;
    if (page.items.length < args.pageSize) break;
  }

  return { totalCount, items: merged };
}

function buildSourceSeed(items, previousRows) {
  const previousByCode = new Map(
    previousRows
      .map((row) => [normalizeCode(row.code), row])
      .filter(([code]) => code)
  );

  const dedup = new Map();
  items.forEach((item) => {
    const code = normalizeCode(item?.srtnCd);
    const canonical = String(item?.itmsNm || "").trim();
    if (!code || !canonical) return;

    const previous = previousByCode.get(code) || {};
    const turnover1d = toNum(item?.accTrval) || toNum(previous.turnover1d);
    const turnover5d = toNum(previous.turnover5d);
    const turnover20d = toNum(previous.turnover20d);
    const aliases = Array.isArray(previous.aliases) ? previous.aliases : [];

    dedup.set(code, {
      canonical,
      code,
      turnover1d,
      turnover5d,
      turnover20d,
      aliases
    });
  });

  return [...dedup.values()].sort((a, b) => {
    const diff = toNum(b.turnover1d) - toNum(a.turnover1d);
    if (diff !== 0) return diff;
    return a.canonical.localeCompare(b.canonical, "ko");
  });
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function refreshAliasSeed(projectRoot, sourcePath, aliasOut, aliasTop) {
  const scriptPath = path.join(projectRoot, "scripts", "build-kr-etf-alias-seed.js");
  const args = [scriptPath, "--input", sourcePath, "--out", aliasOut, "--top", String(aliasTop)];
  const result = spawnSync(process.execPath, args, {
    cwd: projectRoot,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error("alias seed 재생성에 실패했습니다.");
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = process.cwd();
  const outputPath = path.resolve(projectRoot, args.output);
  const aliasOutPath = path.resolve(projectRoot, args.aliasOut);
  const serviceKey = resolveServiceKey(args.serviceKey);

  if (!serviceKey) {
    throw new Error("공공데이터포털 서비스키가 필요합니다. 환경변수 또는 --service-key 로 전달해 주세요.");
  }

  const previousRows = readJsonArray(outputPath);
  const { totalCount, items } = await fetchAllEtfItems(args, serviceKey);
  const seed = buildSourceSeed(items, previousRows);

  writeJson(outputPath, seed);

  console.log(`written: ${path.relative(projectRoot, outputPath)}`);
  console.log(`fetched items: ${items.length}`);
  console.log(`totalCount: ${totalCount}`);
  console.log(`seed count: ${seed.length}`);

  if (args.refreshAliasSeed) {
    refreshAliasSeed(projectRoot, path.relative(projectRoot, outputPath), path.relative(projectRoot, aliasOutPath), args.aliasTop);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
