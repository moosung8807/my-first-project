#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const out = { input: "data/kr-etf-source.seed.json", output: "data/kr-etf-alias-seed.json", top: 40 };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--input" && argv[i + 1]) {
      out.input = argv[i + 1];
      i += 1;
    } else if (a === "--out" && argv[i + 1]) {
      out.output = argv[i + 1];
      i += 1;
    } else if (a === "--top" && argv[i + 1]) {
      const raw = String(argv[i + 1] || "").trim().toLowerCase();
      out.top = raw === "all" ? 0 : Math.max(0, Number(raw) || 0);
      i += 1;
    }
  }
  return out;
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function inferManager(canonical, managerHint) {
  if (managerHint) return managerHint;
  const name = String(canonical || "").trim();
  const brands = ["KODEX", "TIGER", "RISE", "KOSEF", "ACE", "ARIRANG", "SOL", "PLUS", "TIMEFOLIO", "HANARO", "KINDEX"];
  const found = brands.find((b) => name.toUpperCase().startsWith(b));
  return found || "기타";
}

function inferCategory(canonical, categoryHint) {
  if (categoryHint) return categoryHint;
  const n = String(canonical || "").toLowerCase();

  if (/cd금리|단기|mmf|통안채|파킹/.test(n)) return "단기자금";
  if (/채권|국고채|회사채|종합채권/.test(n)) return "채권";
  if (/배당|dividend|dow jones/.test(n)) return "배당";
  if (/2차전지|이차전지|반도체|테크|로봇|바이오|전기차|메타버스|게임/.test(n)) return "테마";
  return "지수";
}

function normalizeCode(code) {
  const digits = String(code || "").replace(/[^0-9]/g, "");
  return /^\d{6}$/.test(digits) ? digits : "";
}

function buildSeed(records, topN) {
  const prepared = records
    .map((r) => {
      const code = normalizeCode(r.code);
      if (!code) return null;
      const t1 = toNum(r.turnover1d);
      const t5 = toNum(r.turnover5d);
      const t20 = toNum(r.turnover20d);
      const score = Math.max(t1, t5, t20);

      return {
        canonical: String(r.canonical || "").trim(),
        code,
        tickerCandidate: `${code}.KS`,
        turnover: {
          "1d": t1,
          "5d": t5,
          "20d": t20
        },
        turnoverScore: score,
        manager: inferManager(r.canonical, r.manager),
        category: inferCategory(r.canonical, r.category),
        aumRankHint: "거래대금 상위(1d/5d/20d 중 최대치 기준)",
        aliases: Array.isArray(r.aliases) ? r.aliases : []
      };
    })
    .filter(Boolean)
    .filter((r) => r.canonical.length > 0)
    .sort((a, b) => b.turnoverScore - a.turnoverScore);

  const dedup = [];
  const seen = new Set();
  for (const row of prepared) {
    if (seen.has(row.code)) continue;
    seen.add(row.code);
    dedup.push(row);
  }

  const limited = topN > 0 ? dedup.slice(0, topN) : dedup;

  return limited.map((r) => ({
    canonical: r.canonical,
    code: r.code,
    tickerCandidate: r.tickerCandidate,
    turnover: r.turnover,
    manager: r.manager,
    category: r.category,
    aumRankHint: r.aumRankHint,
    aliases: r.aliases
  }));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(process.cwd(), args.input);
  const outputPath = path.resolve(process.cwd(), args.output);

  const raw = fs.readFileSync(inputPath, "utf8");
  const records = JSON.parse(raw);
  if (!Array.isArray(records)) {
    throw new Error("input JSON must be an array");
  }

  const seed = buildSeed(records, args.top);
  fs.writeFileSync(outputPath, `${JSON.stringify(seed, null, 2)}\n`, "utf8");

  console.log(`generated: ${path.relative(process.cwd(), outputPath)}`);
  console.log(`count: ${seed.length}`);
}

main();
