#!/usr/bin/env node
// A/B compare report: two brains, same scenario, same human turns, side by side.
// Deterministic backbone first (code checks + latency + tokens + cost), then an
// optional pinned pairwise judge (judge.json) as the qualitative layer.
//   node harness/ab-report.mjs --pair <ab_pair id>
// Writes runs/AB-<pair>/index.html. Finds the two runs by their meta.ab_pair.

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runChecks } from "./checks.mjs";

const HARNESS = dirname(fileURLToPath(import.meta.url));
const RUNS = join(HARNESS, "..", "runs");
const args = process.argv.slice(2);
const arg = (name) => { const i = args.indexOf("--" + name); return i >= 0 ? args[i + 1] : null; };
const pair = arg("pair");
if (!pair) { console.error("usage: ab-report.mjs --pair <ab_pair id>"); process.exit(1); }

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);
const words = (t) => t.split(/\s+/).filter(Boolean).length;
const median = (a) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); };

// ---- find the two runs of this pair ----
function loadRun(dir) {
  const lines = readFileSync(join(RUNS, dir, "transcript.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const meta = lines.find((l) => l.type === "meta") || {};
  const turns = lines.filter((l) => l.type === "turn");
  const ai = turns.filter((t) => t.role === "assistant" && !t.opening);
  const checks = readJson(join(RUNS, dir, "checks.json")) || (() => { const c = runChecks(join(RUNS, dir)); writeFileSync(join(RUNS, dir, "checks.json"), JSON.stringify(c, null, 2) + "\n"); return c; })();
  return {
    dir, meta, turns, ai, checks,
    firstMedian: median(ai.map((t) => t.first_token_ms || 0)),
    totalMedian: median(ai.map((t) => t.total_ms || 0)),
    wordsMedian: median(ai.map((t) => words(t.text))),
    usd: ai.reduce((a, t) => a + (t.usd || 0), 0),
    thoughts: ai.reduce((a, t) => a + (t.tokens?.thoughts || 0), 0),
    outTok: ai.reduce((a, t) => a + (t.tokens?.out || 0), 0),
  };
}
const dirs = readdirSync(RUNS).filter((d) => existsSync(join(RUNS, d, "transcript.jsonl")))
  .filter((d) => {
    const first = readFileSync(join(RUNS, d, "transcript.jsonl"), "utf8").split("\n").filter(Boolean)[0];
    try { return JSON.parse(first).ab_pair === pair; } catch { return false; }
  });
if (dirs.length !== 2) { console.error(`expected 2 runs for pair ${pair}, found ${dirs.length}: ${dirs.join(", ")}`); process.exit(1); }
const runs = dirs.map(loadRun).sort((a, b) => (a.meta.provider === "deepseek" ? -1 : 1));
const [A, B] = runs; // A = deepseek, B = gemini
const judge = readJson(join(RUNS, `AB-${pair}`, "judge.json"));

// ---- shared human turns (identical across both) ----
const humanTurns = A.turns.filter((t) => t.role === "user").map((t) => t.text);
const aiA = A.turns.filter((t) => t.role === "assistant" && !t.opening);
const aiB = B.turns.filter((t) => t.role === "assistant" && !t.opening);

// ---- summary metric table ----
const CHECK_LABELS = { banned_characters: "no — – * chars", stacked_questions: "one question per reply", overlong_reply: "length in bounds", markdown_leak: "no markdown" };
const checkCell = (r, k) => { const c = r.checks[k]; return c.pass ? `<span class=ok>clean</span>` : `<span class=bad>${c.failing_turns.length} turn${c.failing_turns.length > 1 ? "s" : ""}</span>`; };
const metricRows = [
  ["brain", esc(A.meta.model), esc(B.meta.model)],
  ["visible reply, median words", A.wordsMedian, B.wordsMedian],
  ["first token, median", `${A.firstMedian}ms`, `${B.firstMedian}ms`],
  ["full reply, median", `${A.totalMedian}ms`, `${B.totalMedian}ms`],
  ["hidden thinking tokens (total)", A.thoughts || "0 (disabled)", B.thoughts || 0],
  ["visible output tokens (total)", A.outTok, B.outTok],
  ["cost for the session", `$${A.usd.toFixed(5)}`, `$${B.usd.toFixed(5)}`],
  ...Object.entries(CHECK_LABELS).map(([k, label]) => [label, checkCell(A, k), checkCell(B, k)]),
].map(([label, a, b]) => `<tr><td class=dim>${label}</td><td>${a}</td><td>${b}</td></tr>`).join("\n");

// ---- side-by-side stream ----
const streamRows = humanTurns.map((ht, i) => `
<div class=exch>
  <div class=ben><div class=who>ben · turn ${i + 1}</div><div class=txt>${esc(ht)}</div></div>
  <div class=cols>
    <div class="rep a"><div class=rlab>deepseek</div><div class=txt>${esc(aiA[i]?.text || "")}</div><div class=chips>${aiA[i] ? `${words(aiA[i].text)}w · ${aiA[i].first_token_ms}ms first · $${(aiA[i].usd || 0).toFixed(5)}` : ""}</div></div>
    <div class="rep b"><div class=rlab>gemini</div><div class=txt>${esc(aiB[i]?.text || "")}</div><div class=chips>${aiB[i] ? `${words(aiB[i].text)}w · ${aiB[i].first_token_ms}ms first · ${aiB[i].tokens?.thoughts || 0} think · $${(aiB[i].usd || 0).toFixed(5)}` : ""}</div></div>
  </div>
</div>`).join("\n");

// ---- optional pinned pairwise judge ----
let judgeHtml = `<p class=dim>no pairwise judge yet. This page is the deterministic backbone (code checks, latency, tokens, cost) plus the raw side-by-side. Run the judge step to add a pinned qualitative read.</p>`;
if (judge) {
  const winnerLabel = { deepseek: "deepseek v4-flash", gemini: "gemini 3.5-flash-lite", tie: "too close to call" }[judge.overall_winner] || judge.overall_winner;
  const per = (judge.per_dimension || []).filter((d) => d.dimension && d.dimension.trim()).map((d) => `<tr><td class=dim>${esc(d.dimension)}</td><td class="${d.winner === "deepseek" ? "ok" : d.winner === "gemini" ? "b" : "dim"}">${esc(d.winner)}</td><td>${esc(d.why)}</td></tr>`).join("\n");
  judgeHtml = `<div class=callout>pinned judge <b>${esc(judge.judge_model)}</b>, ${esc(judge.graded_at)}. Pairwise preference (which counterpart role-played better), not an absolute score. Comparison is easier and more reliable than scoring, so it is the one judge call this A/B leans on.</div>
  <p class=verdict>overall: <b>${esc(winnerLabel)}</b></p>
  <p>${esc(judge.overall_why || "")}</p>
  <table><tr><th>dimension</th><th>winner</th><th>why</th></tr>${per}</table>
  ${judge.deepseek_note ? `<p><b>deepseek:</b> ${esc(judge.deepseek_note)}</p>` : ""}
  ${judge.gemini_note ? `<p><b>gemini:</b> ${esc(judge.gemini_note)}</p>` : ""}
  ${judge.for_bens_use_case ? `<div class=callout style="border-color:var(--purple);background:var(--purplebg)"><b>for your use case:</b> ${esc(judge.for_bens_use_case)}</div>` : ""}`;
}

const html = `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>A/B · ${esc(A.meta.title || A.meta.scenario)} · deepseek vs gemini</title>
<style>
:root{--fg:#16181d;--bg:#fff;--dim:#7a7f8a;--line:#e6e8ec;--soft:#f5f6f8;--ok:#0f8a3d;--okbg:#e9f7ee;--bad:#c8321f;--badbg:#fbeeec;--warn:#a86400;--warnbg:#fdf4e3;--blue:#1d5fd6;--bluebg:#eaf1fd;--purple:#6d3fc4;--purplebg:#f2ecfb;--teal:#0b7f74;--tealbg:#e6f5f3}
body.dark{--fg:#e8eaee;--bg:#131417;--dim:#8b8f99;--line:#2a2d33;--soft:#1c1e23;--ok:#57cf82;--okbg:#15291c;--bad:#ff7b6b;--badbg:#311b17;--warn:#e0a63f;--warnbg:#2d2413;--blue:#6d9ff2;--bluebg:#17233a;--purple:#af8df0;--purplebg:#241b36;--teal:#4ecdc0;--tealbg:#12302d}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.55 "SF Mono",ui-monospace,Menlo,monospace}
main{max-width:1000px;margin:0 auto;padding:40px 24px 80px}
h1{font-size:18px;margin:0 0 4px}
h2{font-size:12px;font-weight:600;letter-spacing:.08em;margin:44px 0 14px;padding-left:10px;border-left:3px solid var(--accent,var(--blue))}
h2.g{--accent:var(--ok)}h2.p{--accent:var(--purple)}h2.b{--accent:var(--blue)}h2.t{--accent:var(--teal)}
.meta{color:var(--dim);font-size:12px}.meta b{color:var(--fg)}a{color:var(--blue)}.dim{color:var(--dim)}.ok{color:var(--ok);font-weight:700}.bad{color:var(--bad);font-weight:700}.b{color:var(--blue);font-weight:700}
table{border-collapse:collapse;width:100%;font-size:13px}
th{text-align:left;font-weight:400;color:var(--dim);font-size:10px;padding:4px 8px 8px 0;border-bottom:1px solid var(--line)}
td{padding:7px 8px 7px 0;border-bottom:1px solid var(--line);vertical-align:top}
.callout{background:var(--bluebg);border:1px solid var(--blue);padding:10px 14px;font-size:12px;margin-bottom:16px}
.verdict{font-size:15px}
.exch{margin:0 0 22px;border-top:1px solid var(--line);padding-top:14px}
.ben{border-left:3px solid var(--blue);padding-left:12px;margin-bottom:10px}
.who{font-size:11px;letter-spacing:.06em;color:var(--blue);font-weight:700}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.rep{border:1px solid var(--line);padding:10px 12px}
.rep.a{border-left:3px solid var(--purple)}.rep.b{border-left:3px solid var(--teal)}
.rlab{font-size:10px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:5px}.rep.a .rlab{color:var(--purple)}.rep.b .rlab{color:var(--teal)}
.txt{white-space:pre-wrap}.chips{font-size:10px;color:var(--dim);margin-top:6px}
footer{margin-top:70px;color:var(--dim);font-size:11px;border-top:1px solid var(--line);padding-top:12px;display:flex;justify-content:space-between}
kbd{border:1px solid var(--line);padding:0 4px;border-radius:2px}
@media(max-width:720px){.cols{grid-template-columns:1fr}}
</style>
<main>
<h1>A/B roleplay: deepseek v4-flash vs gemini 3.5-flash-lite</h1>
<p class=meta>scenario <b>${esc(A.meta.title || A.meta.scenario)}</b> · audience <b>${esc(A.meta.audience)}</b> · same human turns (<b>${esc(A.meta.turns_source || "")}</b>) driven through both brains · the counterpart is the only variable.<br>
deepseek run <b>${esc(A.dir)}</b> · gemini run <b>${esc(B.dir)}</b></p>

<h2 class=b>the pinned judge</h2>
${judgeHtml}

<h2 class=g>the numbers · deterministic</h2>
<table><tr><th>metric</th><th>deepseek v4-flash</th><th>gemini 3.5-flash-lite</th></tr>
${metricRows}</table>
<p class=dim>code checks from harness/checks.mjs, never judged by an LLM. Gemini 3.x cannot fully disable thinking; the lowest setting still spends the hidden tokens shown, which raises latency and cost even though the visible reply is short.</p>

<h2 class=t>same input, two counterparts</h2>
${streamRows}

<footer><span><a href="../../canvas/index.html">← canvas</a> · <a href="../${esc(A.dir)}/report.html">deepseek report</a> · <a href="../${esc(B.dir)}/report.html">gemini report</a> · <kbd>m</kbd> light/dark</span><span>onthespot A/B · ${new Date().toISOString().slice(0, 10)}</span></footer>
</main>
<script>
if(matchMedia("(prefers-color-scheme:dark)").matches)document.body.classList.add("dark");
addEventListener("keydown",e=>{if(e.key==="m")document.body.classList.toggle("dark")});
</script>`;

const outDir = join(RUNS, `AB-${pair}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "index.html"), html);
console.log(join(outDir, "index.html"));
