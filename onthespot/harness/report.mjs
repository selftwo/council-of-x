#!/usr/bin/env node
// Build the HTML artifact for a run: what happened, code checks, pacing, the stream, what changed.
//   node report.mjs ../runs/<run-id>
// Writes report.html into the run folder, then rebuilds the canvas.
// Adapted from rehearsal-lab/harness/report.mjs: onthespot roles (ben/counterpart),
// a pacing section (words vs 140wpm spoken estimate vs the scenario's response
// budget), and no judges yet (vibe stage only).

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { runChecks } from "./checks.mjs";

const HARNESS = dirname(fileURLToPath(import.meta.url));
const RUNS = join(HARNESS, "..", "runs");
const runDir = resolve(process.argv[2] || "");
if (!existsSync(join(runDir, "transcript.jsonl"))) { console.error("usage: report.mjs <run dir with transcript.jsonl>"); process.exit(1); }

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);
const words = (t) => t.split(/\s+/).filter(Boolean).length;
const wpm = 140;

const lines = readFileSync(join(runDir, "transcript.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const meta = lines.find((l) => l.type === "meta") || {};
const turns = lines.filter((l) => l.type === "turn");
const endEvt = lines.find((l) => l.type === "end");
const aiTurns = turns.filter((t) => t.role === "assistant" && t.tokens);
const totUsd = aiTurns.reduce((a, t) => a + (t.usd || 0), 0);
const avgFirst = aiTurns.length ? Math.round(aiTurns.reduce((a, t) => a + (t.first_token_ms || 0), 0) / aiTurns.length) : 0;
const when = (meta.run || basename(runDir)).match(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})/);
const stamp = when ? `${when[1]} ${when[2]}:${when[3]}` : "";

// session duration: first turn timestamp to end event (or last turn if no end)
const firstTurn = turns[0];
const lastEvt = endEvt || turns[turns.length - 1];
const durationS = firstTurn && lastEvt && lastEvt.t ? Math.round((new Date(lastEvt.t) - new Date(firstTurn.t)) / 1000) : null;
const mmss = (s) => (s == null ? "?" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
const targetS = meta.target_minutes ? meta.target_minutes * 60 : null;

// response budget "60-120" → [60,120]
const budget = (meta.response_budget_seconds || "").split("-").map((n) => parseInt(n, 10)).filter((n) => !isNaN(n));
const budgetMax = budget.length ? budget[budget.length - 1] : null;

let checks = readJson(join(runDir, "checks.json"));
if (!checks) { checks = runChecks(runDir); writeFileSync(join(runDir, "checks.json"), JSON.stringify(checks, null, 2) + "\n"); }

// previous run of the same scenario for diff
const prior = readdirSync(RUNS).filter((d) => d.endsWith("-" + meta.scenario) && d !== basename(runDir) && existsSync(join(RUNS, d, "scenario.md"))).sort();
const prevDir = prior.length ? join(RUNS, prior[prior.length - 1]) : null;
let diffHtml = "<p class=dim>first run of this scenario, nothing to diff against.</p>";
if (prevDir) {
  const d = spawnSync("diff", ["-u", join(prevDir, "scenario.md"), join(runDir, "scenario.md")], { encoding: "utf8" });
  if (d.stdout && d.stdout.trim()) {
    diffHtml = "<pre class=diff>" + d.stdout.split("\n").slice(2).map((l) =>
      l.startsWith("+") ? `<ins>${esc(l)}</ins>` : l.startsWith("-") ? `<del>${esc(l)}</del>` : l.startsWith("@@") ? `<span class=hunk>${esc(l)}</span>` : esc(l)
    ).join("\n") + "</pre>";
  } else diffHtml = `<p class=dim>prompt unchanged since <a href="../${esc(prior[prior.length - 1])}/report.html">${esc(prior[prior.length - 1])}</a>.</p>`;
}

// ---- code checks section ----
const CHECK_LABELS = { banned_characters: "no — – * characters", stacked_questions: "one question per reply", overlong_reply: "reply length in bounds", markdown_leak: "no markdown formatting", compliment_opener_flag: "no grading openers (soft flag)" };
const checksHtml = `<div class=checkrow>${Object.entries(CHECK_LABELS).map(([k, label]) => {
  const c = checks[k]; if (!c) return "";
  const cls = c.pass ? "ok" : c.soft ? "warn" : "bad";
  const detail = c.pass ? "clean" : c.failing_turns.map((f) => `turn ${f.turn}${f.count ? ` (${f.count}×)` : f.questions ? ` (${f.questions}?)` : f.words ? ` (${f.words}w)` : f.opener ? ` "${esc(f.opener)}"` : ""}`).join(", ");
  return `<div class="check ${cls}"><span class=mark>${c.pass ? "✓" : c.soft ? "⚑" : "✗"}</span><b>${label}</b><span>${detail}</span></div>`;
}).join("")}</div>
<p class=dim>deterministic, from harness/checks.mjs. these are never judged by an LLM.</p>`;

// ---- pacing section: one row per ben turn ----
const benTurns = turns.filter((t) => t.role === "user");
const pacingRows = benTurns.map((t, i) => {
  const w = words(t.text);
  const spokenS = Math.round((w / wpm) * 60);
  const overBudget = budgetMax !== null && spokenS > budgetMax;
  const thinkCell = meta.turns_mode === "scripted" ? "scripted" : t.think_ms != null ? `${Math.round(t.think_ms / 1000)}s` : "?";
  return `<tr><td>${i + 1}</td><td>${w}</td><td class="${overBudget ? "warn" : ""}">${spokenS}s${meta.response_budget_seconds ? ` / ${esc(meta.response_budget_seconds)}s` : ""}</td><td class=dim>${thinkCell}</td></tr>`;
}).join("\n");
const sessionOverTarget = targetS !== null && durationS !== null && durationS > targetS;
const pacingHtml = `<table><tr><th>ben turn</th><th>words</th><th>est. spoken vs budget</th><th>think time</th></tr>
${pacingRows || "<tr><td colspan=4 class=dim>no ben turns</td></tr>"}</table>
<p class="${sessionOverTarget ? "warn" : "dim"}">session ${mmss(durationS)}${targetS !== null ? ` / target ${meta.target_minutes}:00` : ""} · deterministic, no judgment language.</p>`;

// ---- judges: vibe stage, not judged yet ----
const judgesHtml = `<p class=dim>vibe stage: not judged yet. Two-rubric judging (persona + practicer) starts after the vibe loop settles.</p>`;

const stream = turns.map((t) => {
  let chips = "";
  if (t.role === "assistant" && t.tokens) {
    chips = `<span class=chips>first token ${t.first_token_ms}ms · ${t.total_ms}ms · ${t.tokens.in}in/${t.tokens.out}out${t.tokens.cached ? ` (${t.tokens.cached} cached)` : ""} · $${(t.usd || 0).toFixed(6)}</span>`;
  } else if (t.role === "assistant" && t.opening) {
    chips = `<span class=chips>scripted opening</span>`;
  } else if (t.role === "user") {
    const w = words(t.text);
    const spokenS = Math.round((w / wpm) * 60);
    const overBudget = budgetMax !== null && spokenS > budgetMax;
    const thinkChip = meta.turns_mode === "scripted" ? "scripted" : t.think_ms != null ? `thought ${Math.round(t.think_ms / 1000)}s` : "";
    chips = `<span class="chips${overBudget ? " warn" : ""}">${thinkChip ? thinkChip + " · " : ""}${w}w ~${spokenS}s spoken${meta.response_budget_seconds ? ` · budget ${esc(meta.response_budget_seconds)}s` : ""}</span>`;
  }
  return `<div class="turn ${t.role}"><div class=who>${t.role === "user" ? "ben" : "counterpart"}</div><div class=txt>${esc(t.text)}</div>${chips}</div>`;
}).join("\n");

const html = `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>${esc(meta.title || meta.scenario)} @ ${esc(meta.prompt_version)} · onthespot</title>
<style>
:root{--fg:#16181d;--bg:#fff;--dim:#7a7f8a;--line:#e6e8ec;--soft:#f5f6f8;--ok:#0f8a3d;--okbg:#e9f7ee;--bad:#c8321f;--badbg:#fbeeec;--warn:#a86400;--warnbg:#fdf4e3;--blue:#1d5fd6;--bluebg:#eaf1fd;--purple:#6d3fc4;--purplebg:#f2ecfb}
body.dark{--fg:#e8eaee;--bg:#131417;--dim:#8b8f99;--line:#2a2d33;--soft:#1c1e23;--ok:#57cf82;--okbg:#15291c;--bad:#ff7b6b;--badbg:#311b17;--warn:#e0a63f;--warnbg:#2d2413;--blue:#6d9ff2;--bluebg:#17233a;--purple:#af8df0;--purplebg:#241b36}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.55 "SF Mono",ui-monospace,Menlo,monospace}
main{max-width:880px;margin:0 auto;padding:40px 24px 80px}
h1{font-size:18px;margin:0 0 4px}
h2{font-size:12px;font-weight:600;letter-spacing:.08em;margin:44px 0 14px;padding-left:10px;border-left:3px solid var(--accent,var(--blue))}
h2.g{--accent:var(--ok)}h2.r{--accent:var(--bad)}h2.p{--accent:var(--purple)}h2.b{--accent:var(--blue)}
.meta{color:var(--dim);font-size:12px}.meta b{color:var(--fg);font-weight:600}
a{color:var(--blue)}.dim{color:var(--dim)}.warn{color:var(--warn)}
.checkrow{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.check{display:flex;gap:8px;align-items:baseline;padding:8px 12px;border:1px solid var(--line);font-size:12px}
.check.ok{border-color:var(--ok);background:var(--okbg)}.check.bad{border-color:var(--bad);background:var(--badbg)}.check.warn{border-color:var(--warn);background:var(--warnbg)}
.check .mark{font-weight:700}.check.ok .mark{color:var(--ok)}.check.bad .mark{color:var(--bad)}.check.warn .mark{color:var(--warn)}
.check span:last-child{color:var(--dim);margin-left:auto;text-align:right}
table{border-collapse:collapse;width:100%;font-size:13px;margin-bottom:8px}
th{text-align:left;font-weight:400;color:var(--dim);font-size:10px;padding:4px 8px 8px 0;border-bottom:1px solid var(--line)}
td{padding:6px 8px 6px 0;border-bottom:1px solid var(--line)}
.turn{margin:0 0 18px;padding-left:14px;border-left:3px solid var(--line)}
.turn.user{border-left-color:var(--blue)}.turn.assistant{border-left-color:var(--purple)}
.who{font-size:11px;letter-spacing:.06em}.turn.user .who{color:var(--blue);font-weight:700}.turn.assistant .who{color:var(--purple)}
.txt{white-space:pre-wrap;margin:2px 0 4px}.chips{font-size:11px;color:var(--dim)}.chips.warn{color:var(--warn)}
pre{background:var(--soft);border:1px solid var(--line);padding:14px;overflow:auto;font-size:12px;white-space:pre-wrap}
.diff ins{background:var(--okbg);color:var(--ok);text-decoration:none}.diff del{background:var(--badbg);color:var(--bad);text-decoration:none}.diff .hunk{color:var(--blue)}
footer{margin-top:70px;color:var(--dim);font-size:11px;border-top:1px solid var(--line);padding-top:12px;display:flex;justify-content:space-between}
kbd{border:1px solid var(--line);padding:0 4px;border-radius:2px}
</style>
<main>
<h1>${esc(meta.title || meta.scenario)}</h1>
<p class=meta>ran <b>${esc(stamp)}</b> · run <b>${esc(meta.run)}</b> · scenario <b>${esc(meta.scenario)}</b> @ prompt <b>${esc(meta.prompt_version)}</b> · brain <b>${esc(meta.model)}</b> · ${esc(meta.turns_mode)}${meta.turns_file ? ` (${esc(meta.turns_file)})` : ""}<br>
audience <b>${esc(meta.audience)}</b> · power dynamic <b>${esc(meta.power_dynamic)}</b><br>
duration <b>${mmss(durationS)}</b>${targetS !== null ? ` / target <b>${esc(meta.target_minutes)}:00</b>` : ""} · ${aiTurns.length} model turns · avg first token <b>${avgFirst}ms</b> · total <b>$${totUsd.toFixed(5)}</b></p>

<h2 class=g>code checks · certain, no judgment involved</h2>
${checksHtml}

<h2 class=b>pacing · deterministic, words and time only</h2>
${pacingHtml}

<h2 class=r>judges</h2>
${judgesHtml}

<h2 class=p>what changed since last run</h2>
${diffHtml}

<h2 class=b>the stream</h2>
${stream}

<footer><span><a href="../../canvas/index.html">← canvas</a> · <a href="scenario.md">scenario snapshot</a> · <a href="transcript.jsonl">raw jsonl</a> · <kbd>m</kbd> light/dark</span><span>onthespot · ${new Date().toISOString().slice(0, 10)}</span></footer>
</main>
<script>
if(matchMedia("(prefers-color-scheme:dark)").matches)document.body.classList.add("dark");
addEventListener("keydown",e=>{if(e.key==="m")document.body.classList.toggle("dark")});
</script>`;

writeFileSync(join(runDir, "report.html"), html);
console.log(join(runDir, "report.html"));
spawnSync("node", [join(HARNESS, "index.mjs")], { stdio: "inherit" });
