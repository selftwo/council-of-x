#!/usr/bin/env node
// Build the HTML artifact for a run: what happened, code checks, both judges, the stream, what changed.
//   node report.mjs ../runs/<run-id>
// Writes report.html into the run folder, then rebuilds the canvas.

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const RUNS = join(ROOT, "..", "runs");
const runDir = resolve(process.argv[2] || "");
if (!existsSync(join(runDir, "transcript.jsonl"))) { console.error("usage: report.mjs <run dir with transcript.jsonl>"); process.exit(1); }

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);

const lines = readFileSync(join(runDir, "transcript.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const meta = lines.find((l) => l.type === "meta") || {};
const turns = lines.filter((l) => l.type === "turn");
const aiTurns = turns.filter((t) => t.role === "assistant" && t.tokens);
const totUsd = aiTurns.reduce((a, t) => a + (t.usd || 0), 0);
const avgFirst = aiTurns.length ? Math.round(aiTurns.reduce((a, t) => a + (t.first_token_ms || 0), 0) / aiTurns.length) : 0;
const when = (meta.run || basename(runDir)).match(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})/);
const stamp = when ? `${when[1]} ${when[2]}:${when[3]}` : "";

const evalMd = existsSync(join(runDir, "eval.md")) ? readFileSync(join(runDir, "eval.md"), "utf8") : null;
const evalCodexMd = existsSync(join(runDir, "eval-codex.md")) ? readFileSync(join(runDir, "eval-codex.md"), "utf8") : null;
const ev = readJson(join(runDir, "eval.json"));
const evx = readJson(join(runDir, "eval-codex.json"));
const checks = readJson(join(runDir, "checks.json"));

// previous run of the same scenario for diff + deltas
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
const checksHtml = checks ? `<div class=checkrow>${Object.entries(CHECK_LABELS).map(([k, label]) => {
  const c = checks[k]; if (!c) return "";
  const cls = c.pass ? "ok" : c.soft ? "warn" : "bad";
  const detail = c.pass ? "clean" : c.failing_turns.map((f) => `turn ${f.turn}${f.count ? ` (${f.count}×)` : f.questions ? ` (${f.questions}?)` : f.words ? ` (${f.words}w)` : f.opener ? ` "${esc(f.opener)}"` : ""}`).join(", ");
  return `<div class="check ${cls}"><span class=mark>${c.pass ? "✓" : c.soft ? "⚑" : "✗"}</span><b>${label}</b><span>${detail}</span></div>`;
}).join("")}</div>
<p class=dim>deterministic, from harness/checks.mjs. these are never judged by an LLM.</p>` : "<p class=dim>no checks.json; run judge.mjs (it runs checks first).</p>";

// ---- failure-mode judges section (schema 2) ----
const FM_LABELS = { flattery_leak: "flattery leak", register_break: "register break", grounding_misuse: "grounding misuse", dropped_question: "dropped question", capitulation_unchallenged: "capitulation unchallenged", debrief_no_delivery: "debrief skips delivery" };
let judgesHtml = "";
if (ev?.schema === 2) {
  judgesHtml = Object.entries(FM_LABELS).map(([k, label]) => {
    const a = ev.failure_modes?.[k]; const b = evx?.failure_modes?.[k];
    const disagree = a && b && a.result !== b.result;
    return `<div class="fm ${a?.result === "pass" ? "ok" : "bad"}${disagree ? " split" : ""}">
      <div class=fmhead><b>${label}</b><span class=badges>
        <span class="pill ${a?.result}">claude · ${a?.result || "?"}</span>
        ${b ? `<span class="pill ${b.result}">gpt-5.6 · ${b.result}</span>` : ""}
        ${disagree ? `<span class="pill splitpill">judges disagree → your call</span>` : ""}</span></div>
      <div class=crit>${esc(a?.critique || "")}</div>
      ${disagree ? `<div class="crit alt">gpt-5.6: ${esc(b.critique || "")}</div>` : ""}
    </div>`;
  }).join("\n");
} else if (ev?.scores) {
  // legacy schema 1: numeric scores
  judgesHtml = `<div class=scores>` + Object.entries(ev.scores).map(([d, s]) =>
    `<div class="score s${s}"><div class=num>${s}<small>/5</small></div><div class=lbl>${d.replace(/_/g, " ")}</div></div>`).join("") + `</div><p class=dim>legacy 1-5 rubric (v1); newer runs use binary failure modes.</p>`;
} else judgesHtml = "<p class=dim>not judged yet. run judge.mjs on this folder.</p>";

const stream = turns.map((t) => {
  const chips = t.role === "assistant" && t.tokens
    ? `<span class=chips>first token ${t.first_token_ms}ms · ${t.total_ms}ms · ${t.tokens.in}in/${t.tokens.out}out${t.tokens.cached ? ` (${t.tokens.cached} cached)` : ""} · $${(t.usd || 0).toFixed(6)}</span>`
    : t.opening ? `<span class=chips>scripted opening</span>` : "";
  return `<div class="turn ${t.role}"><div class=who>${t.role === "user" ? "ben" : "persona"}</div><div class=txt>${esc(t.text)}</div>${chips}</div>`;
}).join("\n");

const verdicts = [ev?.verdict ? `<p class=verdict><b>claude:</b> ${esc(ev.verdict)}</p>` : "", evx?.verdict ? `<p class="verdict alt"><b>gpt-5.6:</b> ${esc(evx.verdict)}</p>` : ""].join("");

const html = `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>${esc(meta.scenario)} @ ${esc(meta.prompt_version)} · rehearsal lab</title>
<style>
:root{--fg:#16181d;--bg:#fff;--dim:#7a7f8a;--line:#e6e8ec;--soft:#f5f6f8;--ok:#0f8a3d;--okbg:#e9f7ee;--bad:#c8321f;--badbg:#fbeeec;--warn:#a86400;--warnbg:#fdf4e3;--blue:#1d5fd6;--bluebg:#eaf1fd;--purple:#6d3fc4;--purplebg:#f2ecfb}
body.dark{--fg:#e8eaee;--bg:#131417;--dim:#8b8f99;--line:#2a2d33;--soft:#1c1e23;--ok:#57cf82;--okbg:#15291c;--bad:#ff7b6b;--badbg:#311b17;--warn:#e0a63f;--warnbg:#2d2413;--blue:#6d9ff2;--bluebg:#17233a;--purple:#af8df0;--purplebg:#241b36}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.55 "SF Mono",ui-monospace,Menlo,monospace}
main{max-width:880px;margin:0 auto;padding:40px 24px 80px}
h1{font-size:18px;margin:0 0 4px}
h2{font-size:12px;font-weight:600;letter-spacing:.08em;margin:44px 0 14px;padding-left:10px;border-left:3px solid var(--accent,var(--blue))}
h2.g{--accent:var(--ok)}h2.r{--accent:var(--bad)}h2.p{--accent:var(--purple)}h2.b{--accent:var(--blue)}
.meta{color:var(--dim);font-size:12px}.meta b{color:var(--fg);font-weight:600}
a{color:var(--blue)}.dim{color:var(--dim)}
.verdict{border:1px solid var(--blue);background:var(--bluebg);padding:10px 14px;font-weight:600}
.verdict.alt{border-color:var(--purple);background:var(--purplebg)}
.checkrow{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.check{display:flex;gap:8px;align-items:baseline;padding:8px 12px;border:1px solid var(--line);font-size:12px}
.check.ok{border-color:var(--ok);background:var(--okbg)}.check.bad{border-color:var(--bad);background:var(--badbg)}.check.warn{border-color:var(--warn);background:var(--warnbg)}
.check .mark{font-weight:700}.check.ok .mark{color:var(--ok)}.check.bad .mark{color:var(--bad)}.check.warn .mark{color:var(--warn)}
.check span:last-child{color:var(--dim);margin-left:auto;text-align:right}
.fm{border:1px solid var(--line);border-left-width:4px;padding:10px 14px;margin-bottom:10px}
.fm.ok{border-left-color:var(--ok)}.fm.bad{border-left-color:var(--bad)}.fm.split{background:var(--warnbg)}
.fmhead{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.badges{margin-left:auto;display:flex;gap:6px}
.pill{font-size:11px;padding:1px 8px;border-radius:9px;border:1px solid var(--line)}
.pill.pass{color:var(--ok);border-color:var(--ok);background:var(--okbg)}.pill.fail{color:var(--bad);border-color:var(--bad);background:var(--badbg)}
.pill.splitpill{color:var(--warn);border-color:var(--warn);background:var(--warnbg);font-weight:700}
.crit{font-size:12px;color:var(--dim);margin-top:6px}.crit.alt{border-top:1px dashed var(--line);padding-top:6px}
.scores{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.score{border:1px solid var(--line);padding:10px 12px}.score .num{font-size:20px;font-weight:700}.score small{color:var(--dim)}
.score.s5 .num,.score.s4 .num{color:var(--ok)}.score.s3 .num{color:var(--warn)}.score.s2 .num,.score.s1 .num{color:var(--bad)}
.score .lbl{font-size:11px;color:var(--dim)}
.turn{margin:0 0 18px;padding-left:14px;border-left:3px solid var(--line)}
.turn.user{border-left-color:var(--blue)}.turn.assistant{border-left-color:var(--purple)}
.who{font-size:11px;letter-spacing:.06em}.turn.user .who{color:var(--blue);font-weight:700}.turn.assistant .who{color:var(--purple)}
.txt{white-space:pre-wrap;margin:2px 0 4px}.chips{font-size:11px;color:var(--dim)}
pre{background:var(--soft);border:1px solid var(--line);padding:14px;overflow:auto;font-size:12px;white-space:pre-wrap}
.diff ins{background:var(--okbg);color:var(--ok);text-decoration:none}.diff del{background:var(--badbg);color:var(--bad);text-decoration:none}.diff .hunk{color:var(--blue)}
details{margin:10px 0}summary{cursor:pointer;color:var(--blue);font-size:12px}
footer{margin-top:70px;color:var(--dim);font-size:11px;border-top:1px solid var(--line);padding-top:12px;display:flex;justify-content:space-between}
kbd{border:1px solid var(--line);padding:0 4px;border-radius:2px}
</style>
<main>
<h1>${esc(meta.title || meta.scenario)}</h1>
<p class=meta>ran <b>${esc(stamp)}</b> · run <b>${esc(meta.run)}</b> · scenario <b>${esc(meta.scenario)}</b> @ prompt <b>${esc(meta.prompt_version)}</b> · brain <b>${esc(meta.model)}</b> · ${esc(meta.turns_mode)}${meta.turns_file ? ` (${esc(meta.turns_file)})` : ""}<br>
${aiTurns.length} model turns · avg first token <b>${avgFirst}ms</b> · total <b>$${totUsd.toFixed(5)}</b></p>

<h2 class=b>what happened</h2>
${verdicts || "<p class=dim>not judged yet.</p>"}

<h2 class=g>code checks · certain, no judgment involved</h2>
${checksHtml}

<h2 class=r>failure-mode judges · binary, critique first, two labs</h2>
${judgesHtml}

<h2 class=p>what changed since last run</h2>
${diffHtml}

<h2 class=b>the stream</h2>
${stream}

<h2 class=p>full judge notes</h2>
${evalMd ? `<details open><summary>claude judge (eval.md)</summary><pre>${esc(evalMd)}</pre></details>` : "<p class=dim>no eval.md yet.</p>"}
${evalCodexMd ? `<details><summary>gpt-5.6 second judge (eval-codex.md)</summary><pre>${esc(evalCodexMd)}</pre></details>` : ""}

<footer><span><a href="../../canvas/index.html">← canvas</a> · <a href="scenario.md">prompt snapshot</a> · <a href="transcript.jsonl">raw jsonl</a> · <kbd>m</kbd> light/dark</span><span>rehearsal lab · ${new Date().toISOString().slice(0, 10)}</span></footer>
</main>
<script>
if(matchMedia("(prefers-color-scheme:dark)").matches)document.body.classList.add("dark");
addEventListener("keydown",e=>{if(e.key==="m")document.body.classList.toggle("dark")});
</script>`;

writeFileSync(join(runDir, "report.html"), html);
console.log(join(runDir, "report.html"));
spawnSync("node", [join(ROOT, "canvas.mjs")], { stdio: "inherit" });
