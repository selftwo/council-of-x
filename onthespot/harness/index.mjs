#!/usr/bin/env node
// Build canvas/index.html for onthespot from decisions.md + runs/ + docs. Simpler
// than the lab's canvas.mjs (no judge scores yet, no split-verdict columns).
// Idempotent; report.mjs runs this after every run.
//   node harness/index.mjs

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const HARNESS = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HARNESS, "..");
const RUNS = join(ROOT, "runs");
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);

// ---- decisions.md "now" list ----
const dec = readFileSync(join(ROOT, "decisions.md"), "utf8");
const nowItems = (dec.match(/## now\n([\s\S]*?)\n## /) || [, ""])[1].split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));

// ---- runs table ----
const runs = existsSync(RUNS) ? readdirSync(RUNS).filter((d) => existsSync(join(RUNS, d, "transcript.jsonl"))).sort().reverse().map((d) => {
  const lines = readFileSync(join(RUNS, d, "transcript.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const meta = lines.find((l) => l.type === "meta") || {};
  const turns = lines.filter((l) => l.type === "turn");
  const benTurns = turns.filter((t) => t.role === "user").length;
  const counterpartTurns = turns.filter((t) => t.role === "assistant").length;
  const aiTurns = turns.filter((t) => t.role === "assistant" && t.tokens);
  const usd = aiTurns.reduce((a, t) => a + (t.usd || 0), 0);
  const first = turns[0], last = lines.find((l) => l.type === "end") || turns[turns.length - 1];
  const durationS = first && last && last.t ? Math.round((new Date(last.t) - new Date(first.t)) / 1000) : null;
  const when = d.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})/);
  const checks = readJson(join(RUNS, d, "checks.json"));
  const hasReport = existsSync(join(RUNS, d, "report.html"));
  const practicer = readJson(join(RUNS, d, "practicer.json"));
  const hasCoaching = existsSync(join(RUNS, d, "coaching.html"));
  return {
    id: d, meta, usd, benTurns, counterpartTurns, durationS, checks, hasReport, practicer, hasCoaching,
    stamp: when ? `${when[2]}-${when[3]} · ${when[4]}:${when[5]}` : d.slice(0, 10),
  };
}) : [];

const mmss = (s) => (s == null ? "?" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);

const runRows = runs.map((r) => `<tr>
<td class=dim>${esc(r.stamp)}</td>
<td>${r.hasReport ? `<a href="../runs/${esc(r.id)}/report.html">${esc(r.meta.title || r.meta.scenario)}</a>` : esc(r.meta.title || r.meta.scenario)}</td>
<td class=dim>${esc(r.meta.turns_mode || "?")}</td>
<td>${r.benTurns}</td>
<td>${r.counterpartTurns}</td>
<td class=dim>${mmss(r.durationS)}</td>
<td class=dim>$${r.usd.toFixed(4)}</td>
<td class="${r.checks ? (r.checks.all_hard_pass ? "ok" : "bad") : "none"}">${r.checks ? (r.checks.all_hard_pass ? "✓ pass" : "✗ fail") : "unchecked"}</td>
<td>${r.hasReport ? `<a href="../runs/${esc(r.id)}/report.html">report</a>` : "<span class=dim>—</span>"}</td>
</tr>`).join("\n");

// ---- coaching stream: graded sessions, accumulates over time (measures Ben) ----
const P_SHORT = { P1_buried_lead: "answers-first", P2_hedged_claims: "commits", P3_unsaid_ending: "lands-ending", P4_leaking: "no-leak", P5_question_dodged: "answers-asked", P6_incoherent_structure: "structured" };
const coached = runs.filter((r) => r.practicer).sort((a, b) => a.id.localeCompare(b.id)); // oldest first, so deltas read forward
const coachingRows = coached.map((r) => {
  const v = r.practicer.verdicts || {};
  const chips = Object.entries(v).map(([k, val]) => `<span class="pv ${val.pass ? "ok" : "bad"}">${val.pass ? "✓" : "✗"} ${P_SHORT[k] || k}</span>`).join(" ");
  const link = r.hasCoaching ? `../runs/${esc(r.id)}/coaching.html` : `../runs/${esc(r.id)}/report.html`;
  return `<tr>
<td class=dim>${esc(r.stamp)}</td>
<td><a href="${link}">${esc(r.meta.title || r.meta.scenario)}</a><div class=dim style="font-size:11px">${esc(r.meta.audience || "")}</div></td>
<td><div class=pvrow>${chips}</div></td>
<td>${esc(r.practicer.one_fix?.what || "")}</td>
</tr>`;
}).join("\n");

// ---- A/B model comparisons: deepseek vs gemini on the same human turns ----
const abDirs = existsSync(RUNS) ? readdirSync(RUNS).filter((d) => d.startsWith("AB-") && existsSync(join(RUNS, d, "index.html"))).sort().reverse() : [];
const abRows = abDirs.map((d) => {
  const j = readJson(join(RUNS, d, "judge.json"));
  const win = j ? j.overall_winner : null;
  const wins = j ? (j.per_dimension || []).filter((x) => x.dimension) : [];
  const tally = (m) => wins.filter((x) => x.winner === m).length;
  const winChip = win ? `<span class="pv ${win === "deepseek" ? "ok" : win === "gemini" ? "bad" : ""}">${win}</span>` : "<span class=dim>unjudged</span>";
  const scen = d.replace(/^AB-[0-9T-]+/, "");
  return `<tr>
<td><a href="../runs/${esc(d)}/index.html">${esc(scen)}</a></td>
<td>${winChip}</td>
<td class=dim>${j ? `deepseek ${tally("deepseek")} · gemini ${tally("gemini")} · tie ${tally("tie")}` : ""}</td>
<td class=dim>${j ? esc(j.judge_model) : ""}</td>
</tr>`;
}).join("\n");

// ---- documents table ----
function describe(path) {
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, "utf8");
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (fm) {
    const d = fm[1].match(/^description:\s*"?(.*?)"?\s*$/m);
    if (d) return d[1];
    const t = fm[1].match(/^title:\s*"?(.*?)"?\s*$/m);
    if (t) return t[1];
  }
  const h = raw.match(/^#\s+(.*)$/m);
  return h ? h[1] : "";
}

function listMd(dir, pattern) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".md") && (!pattern || pattern.test(f))).map((f) => join(dir, f));
}

const docPaths = [
  ...listMd(ROOT, null).filter((p) => ["README.md", "decisions.md", "scenarios.md", "scenario-map-draft.md"].includes(basename(p))),
  ...listMd(join(ROOT, "scenarios"), null),
  join(ROOT, "personas", "fit-summary-draft.md"),
  ...listMd(join(ROOT, "coaching"), null),
  ...listMd(join(ROOT, "evals"), null),
].filter((p, i, arr) => existsSync(p) && arr.indexOf(p) === i);

const docRows = docPaths.map((p) => {
  const rel = p.slice(ROOT.length + 1);
  return `<div><a href="../${esc(rel)}">${esc(rel)}</a><span class=dim>${esc(describe(p) || "")}</span></div>`;
}).join("");

const html = `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>onthespot · canvas</title>
<style>
:root{--fg:#16181d;--bg:#fff;--dim:#7a7f8a;--line:#e6e8ec;--soft:#f5f6f8;--ok:#0f8a3d;--okbg:#e9f7ee;--bad:#c8321f;--badbg:#fbeeec;--warn:#a86400;--warnbg:#fdf4e3;--blue:#1d5fd6;--bluebg:#eaf1fd;--purple:#6d3fc4;--purplebg:#f2ecfb;--teal:#0b7f74;--tealbg:#e6f5f3}
body.dark{--fg:#e8eaee;--bg:#131417;--dim:#8b8f99;--line:#2a2d33;--soft:#1c1e23;--ok:#57cf82;--okbg:#15291c;--bad:#ff7b6b;--badbg:#311b17;--warn:#e0a63f;--warnbg:#2d2413;--blue:#6d9ff2;--bluebg:#17233a;--purple:#af8df0;--purplebg:#241b36;--teal:#4ecdc0;--tealbg:#12302d}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.55 "SF Mono",ui-monospace,Menlo,monospace;transition:background .15s}
main{max-width:960px;margin:0 auto;padding:40px 24px 80px}
h1{font-size:18px;margin:0}
h2{font-size:12px;font-weight:600;letter-spacing:.08em;margin:44px 0 14px;padding-left:10px;border-left:3px solid var(--accent,var(--blue))}
h2.g{--accent:var(--ok)}h2.p{--accent:var(--purple)}h2.b{--accent:var(--blue)}h2.t{--accent:var(--teal)}
a{color:var(--blue)}.dim{color:var(--dim)}
.sub{color:var(--dim);font-size:13px;margin:4px 0 0}
ul.now{list-style:none;padding:0;margin:0}ul.now li{padding:5px 0 5px 18px;position:relative}
ul.now li:before{content:"▪";position:absolute;left:0;color:var(--blue)}
ul.now li:nth-child(2n):before{color:var(--purple)}ul.now li:nth-child(3n):before{color:var(--teal)}
table{border-collapse:collapse;width:100%;font-size:13px}
th{text-align:left;font-weight:400;color:var(--dim);font-size:10px;padding:4px 8px 8px 0;border-bottom:1px solid var(--line)}
td{padding:7px 8px 7px 0;border-bottom:1px solid var(--line);vertical-align:top}
td.ok{color:var(--ok);font-weight:700}td.bad{color:var(--bad);font-weight:700}td.none{color:var(--dim)}
.pvrow{display:flex;flex-wrap:wrap;gap:4px}
.pv{font-size:10px;padding:2px 6px;border:1px solid var(--line);border-radius:2px;white-space:nowrap}
.pv.ok{border-color:var(--ok);color:var(--ok);background:var(--okbg)}.pv.bad{border-color:var(--bad);color:var(--bad);background:var(--badbg)}
.docs div{padding:7px 0;border-bottom:1px solid var(--line);display:flex;gap:14px;font-size:13px;align-items:baseline}
.docs .dim{margin-left:auto;text-align:right;max-width:60%}
footer{margin-top:70px;color:var(--dim);font-size:11px;border-top:1px solid var(--line);padding-top:12px;display:flex;justify-content:space-between}
kbd{border:1px solid var(--line);padding:0 4px;border-radius:2px}
</style>
<main>
<h1>onthespot</h1>
<p class=sub>difficult conversations and situations, think and navigate gracefully. <a href="/">chat →</a> · <a href="../decisions.md">decisions.md</a> · <a href="../scenario-map-draft.md">scenario-map-draft.md</a></p>

<h2 class=b>now</h2>
<ul class=now>${nowItems.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>

<h2 class=g>runs</h2>
<table><tr><th>when</th><th>scenario</th><th>mode</th><th>ben turns</th><th>counterpart turns</th><th>duration</th><th>cost</th><th>checks</th><th>report</th></tr>
${runRows || "<tr><td colspan=9 class=dim>no runs yet</td></tr>"}</table>

<h2 class=t>coaching stream (grades ben, accumulates)</h2>
${coached.length ? `<table><tr><th>when</th><th>session</th><th>habit verdicts</th><th>one fix chosen</th></tr>
${coachingRows}</table>
<p class=sub>from the practicer rubric, graded by a pinned Opus judge, reconciled by harness/reconcile.mjs. oldest first so the fix-over-time reads down the column.</p>` : `<p class=sub>no graded sessions yet. play a scenario, then run the practicer judge to grade your responses.</p>`}

<h2 class=b>a/b: model comparison (roleplay, same human turns)</h2>
${abDirs.length ? `<table><tr><th>scenario</th><th>overall winner</th><th>dimension tally</th><th>judge</th></tr>
${abRows}</table>
<p class=sub>deepseek v4-flash vs gemini 3.5-flash-lite as the counterpart, driven with Ben's real turns from the graded plays. Blind pinned pairwise judge, code checks and latency and cost measured deterministically.</p>` : `<p class=sub>no a/b comparisons yet. run harness/ab.mjs then ab-judge.mjs then ab-report.mjs.</p>`}

<h2 class=p>documents</h2>
<div class=docs>${docRows}</div>

<footer><span><kbd>m</kbd> light/dark</span><span>generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} · ben + claude</span></footer>
</main>
<script>
if(matchMedia("(prefers-color-scheme:dark)").matches)document.body.classList.add("dark");
addEventListener("keydown",e=>{if(e.key==="m")document.body.classList.toggle("dark")});
</script>`;

mkdirSync(join(ROOT, "canvas"), { recursive: true });
writeFileSync(join(ROOT, "canvas", "index.html"), html);
console.log(join(ROOT, "canvas", "index.html"));
