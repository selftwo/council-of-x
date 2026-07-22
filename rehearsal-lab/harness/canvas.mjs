#!/usr/bin/env node
// Rebuild canvas/index.html from decisions.md + runs/. Run after every run/eval; report.mjs calls it.
//   node canvas.mjs

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const LAB = join(ROOT, "..");
const RUNS = join(LAB, "runs");
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);

// ---- decisions.md ----
const dec = readFileSync(join(LAB, "decisions.md"), "utf8");
const nowItems = (dec.match(/## now\n([\s\S]*?)\n## /) || [, ""])[1].split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
const decisions = [...dec.matchAll(/### (\d{4}-\d{2}-\d{2}) — (.*?)\n([\s\S]*?)(?=\n### |\n*$)/g)].map((m) => {
  const body = m[3].trim().split("\n").filter(Boolean);
  const impact = body.find((l) => l.startsWith("impact:"));
  return { date: m[1], title: m[2], body: body.filter((l) => !l.startsWith("impact:")).join(" "), impact: impact ? impact.slice(7).trim() : null };
}).reverse();

// ---- runs ----
const FMS = ["flattery_leak", "register_break", "grounding_misuse", "dropped_question", "capitulation_unchallenged", "debrief_no_delivery"];
const FM_SHORT = ["flattery", "register", "grounding", "memory", "challenge", "debrief"];
const DIMS_V1 = ["persona_fidelity", "challenge", "groundedness", "conversational_memory", "space", "practicer_diagnosis"];

const runs = existsSync(RUNS) ? readdirSync(RUNS).filter((d) => existsSync(join(RUNS, d, "transcript.jsonl"))).sort().reverse().map((d) => {
  const lines = readFileSync(join(RUNS, d, "transcript.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const meta = lines.find((l) => l.type === "meta") || {};
  const ai = lines.filter((l) => l.type === "turn" && l.role === "assistant" && l.tokens);
  const usd = ai.reduce((a, t) => a + (t.usd || 0), 0);
  const when = d.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})/);
  return {
    id: d, meta, usd,
    stamp: when ? `${when[2]}-${when[3]} · ${when[4]}:${when[5]}` : d.slice(0, 10),
    ev: readJson(join(RUNS, d, "eval.json")),
    evx: readJson(join(RUNS, d, "eval-codex.json")),
    checks: readJson(join(RUNS, d, "checks.json")),
    hasReport: existsSync(join(RUNS, d, "report.html")),
  };
}) : [];

function cells(r) {
  if (r.ev?.schema === 2) {
    return FMS.map((k, i) => {
      const a = r.ev.failure_modes?.[k]?.result;
      const b = r.evx?.failure_modes?.[k]?.result;
      const split = a && b && a !== b;
      const cls = split ? "split" : a === "pass" ? "ok" : a === "fail" ? "bad" : "none";
      return `<td class="${cls}" title="${FM_SHORT[i]}${split ? " · judges disagree" : ""}">${split ? "◐" : a === "pass" ? "✓" : a === "fail" ? "✗" : "·"}</td>`;
    }).join("");
  }
  if (r.ev?.scores) return DIMS_V1.map((k) => { const s = r.ev.scores[k]; const cls = s >= 4 ? "ok" : s === 3 ? "mid" : s ? "bad" : "none"; return `<td class="${cls}">${s ?? "·"}</td>`; }).join("");
  return `<td class=none colspan=6>not judged</td>`;
}

const runRows = runs.map((r) => `<tr>
<td class=dim>${esc(r.stamp)}</td>
<td>${r.hasReport ? `<a href="../runs/${esc(r.id)}/report.html">${esc(r.meta.scenario)}</a>` : esc(r.meta.scenario)} <span class=ver>@${esc(r.meta.prompt_version || "?")}</span></td>
<td class="${r.checks ? (r.checks.all_hard_pass ? "ok" : "bad") : "none"}">${r.checks ? (r.checks.all_hard_pass ? "✓" : "✗") : "·"}</td>
${cells(r)}
<td class=dim>${r.evx ? "2" : r.ev ? "1" : "0"}</td>
<td class=dim>$${r.usd.toFixed(4)}</td>
</tr>`).join("\n");

const files = [
  ["canvas/how-evals-work.html", "how the eval system works, explained visually", "explainer", "blue"],
  ["canvas/voice-stack.html", "pipecat + STT/TTS research: pipeline, prices, the plan", "explainer", "blue"],
  ["references/voice/stt-tts-cost-report.md", "voice cost + quality report, three workers, math shown", "reference", "amber"],
  ["references/voice/pipecat-notes.md", "pipecat architecture and how the harness reshapes", "reference", "amber"],
  ["inventory.md", "every file in the lab and why it exists", "inventory", "blue"],
  ["scenarios/proposals.md", "15 candidates, 10 approved by Ben", "picked", "green"],
  ["personas/catalog.md", "30 personas, shortlist of 8 approved", "picked", "green"],
  ["coaching/coaching-map.md", "15 coachable behaviors + 6 corpus maps", "eval seeds", "purple"],
  ["evals/rubric.md", "rubric v2: binary failure modes, few-shot from real runs", "v2", "red"],
  ["references/model-prompting-research.md", "per-model steering and guarding (July 2026)", "reference", "amber"],
  ["references/calling-other-models.md", "Codex and Grok as workers and second judges", "reference", "amber"],
  ["decisions.md", "this canvas's source of truth", "", ""],
  ["CLAUDE.md", "working rules for any session in this lab", "", ""],
  ["start.md", "session playbook", "", ""],
];

const html = `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>rehearsal lab · canvas</title>
<style>
:root{--fg:#16181d;--bg:#fff;--dim:#7a7f8a;--line:#e6e8ec;--soft:#f5f6f8;--ok:#0f8a3d;--okbg:#e9f7ee;--bad:#c8321f;--badbg:#fbeeec;--warn:#a86400;--warnbg:#fdf4e3;--blue:#1d5fd6;--bluebg:#eaf1fd;--purple:#6d3fc4;--purplebg:#f2ecfb;--teal:#0b7f74;--tealbg:#e6f5f3}
body.dark{--fg:#e8eaee;--bg:#131417;--dim:#8b8f99;--line:#2a2d33;--soft:#1c1e23;--ok:#57cf82;--okbg:#15291c;--bad:#ff7b6b;--badbg:#311b17;--warn:#e0a63f;--warnbg:#2d2413;--blue:#6d9ff2;--bluebg:#17233a;--purple:#af8df0;--purplebg:#241b36;--teal:#4ecdc0;--tealbg:#12302d}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.55 "SF Mono",ui-monospace,Menlo,monospace;transition:background .15s}
main{max-width:960px;margin:0 auto;padding:40px 24px 80px}
h1{font-size:18px;margin:0}
h2{font-size:12px;font-weight:600;letter-spacing:.08em;margin:44px 0 14px;padding-left:10px;border-left:3px solid var(--accent,var(--blue))}
h2.g{--accent:var(--ok)}h2.p{--accent:var(--purple)}h2.b{--accent:var(--blue)}h2.t{--accent:var(--teal)}
a{color:var(--blue)}.dim{color:var(--dim)}.ver{color:var(--purple);font-size:11px}
.sub{color:var(--dim);font-size:13px;margin:4px 0 0}
ul.now{list-style:none;padding:0;margin:0}ul.now li{padding:5px 0 5px 18px;position:relative}
ul.now li:before{content:"▪";position:absolute;left:0;color:var(--blue)}
ul.now li:nth-child(2n):before{color:var(--purple)}ul.now li:nth-child(3n):before{color:var(--teal)}
table{border-collapse:collapse;width:100%;font-size:13px}
th{text-align:left;font-weight:400;color:var(--dim);font-size:10px;padding:4px 8px 8px 0;border-bottom:1px solid var(--line)}
td{padding:7px 8px 7px 0;border-bottom:1px solid var(--line);vertical-align:top}
td.ok{color:var(--ok);font-weight:700}td.bad{color:var(--bad);font-weight:700}td.mid{color:var(--warn);font-weight:700}td.none{color:var(--dim)}td.split{color:var(--warn);font-weight:700}
.legend{font-size:11px;color:var(--dim);margin-top:8px}
.legend b{font-weight:700}.legend .lok{color:var(--ok)}.legend .lbad{color:var(--bad)}.legend .lsplit{color:var(--warn)}
.d{border-left:3px solid var(--purple);background:var(--purplebg);padding:10px 14px;margin:0 0 14px}
.d .when{font-size:11px;color:var(--purple);font-weight:700}.d b{display:block;margin:1px 0 3px}
.d .impact{margin-top:8px;font-size:12px;border:1px solid var(--warn);background:var(--warnbg);color:var(--warn);padding:5px 10px;display:inline-block}
.files div{padding:7px 0;border-bottom:1px solid var(--line);display:flex;gap:14px;font-size:13px;align-items:baseline}
.files .tag{margin-left:auto;font-size:10px;padding:1px 8px;border-radius:9px;white-space:nowrap;border:1px solid var(--line);color:var(--dim)}
.files .tag.blue{color:var(--blue);border-color:var(--blue);background:var(--bluebg)}
.files .tag.green{color:var(--ok);border-color:var(--ok);background:var(--okbg)}
.files .tag.purple{color:var(--purple);border-color:var(--purple);background:var(--purplebg)}
.files .tag.red{color:var(--bad);border-color:var(--bad);background:var(--badbg)}
.files .tag.amber{color:var(--warn);border-color:var(--warn);background:var(--warnbg)}
footer{margin-top:70px;color:var(--dim);font-size:11px;border-top:1px solid var(--line);padding-top:12px;display:flex;justify-content:space-between}
kbd{border:1px solid var(--line);padding:0 4px;border-radius:2px}
</style>
<main>
<h1>rehearsal lab</h1>
<p class=sub>practice difficult conversations against corpus-grounded personas. text calibration first, paid voice after. this canvas regenerates from decisions.md and runs/. <a href="how-evals-work.html">how the evals work →</a></p>

<h2 class=b>now</h2>
<ul class=now>${nowItems.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>

<h2 class=g>runs · code checks + six binary failure-mode judges (rubric v2) · older runs show legacy 1-5 scores</h2>
<table><tr><th>when</th><th>scenario @ prompt</th><th>checks</th><th>flattery</th><th>register</th><th>grounding</th><th>memory</th><th>challenge</th><th>debrief</th><th>judges</th><th>cost</th></tr>
${runRows || "<tr><td colspan=11 class=dim>no runs yet</td></tr>"}</table>
<p class=legend><b class=lok>✓ pass</b> · <b class=lbad>✗ fail</b> · <b class=lsplit>◐ judges disagree, needs your call</b> · checks = deterministic code rules · judges column counts judge models (claude, gpt-5.6)</p>

<h2 class=p>decisions</h2>
${decisions.map((d) => `<div class=d><span class=when>${esc(d.date)}</span><b>${esc(d.title)}</b>${esc(d.body)}${d.impact ? `<div class=impact>impact · ${esc(d.impact)}</div>` : ""}</div>`).join("\n")}

<h2 class=t>files</h2>
<div class=files>${files.map(([p, what, tag, color]) => `<div><a href="../${p}">${p}</a><span class=dim>${what}</span>${tag ? `<span class="tag ${color}">${tag}</span>` : ""}</div>`).join("")}</div>

<footer><span><kbd>m</kbd> light/dark</span><span>generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} · ben + claude</span></footer>
</main>
<script>
if(matchMedia("(prefers-color-scheme:dark)").matches)document.body.classList.add("dark");
addEventListener("keydown",e=>{if(e.key==="m")document.body.classList.toggle("dark")});
</script>`;

mkdirSync(join(LAB, "canvas"), { recursive: true });
writeFileSync(join(LAB, "canvas", "index.html"), html);
console.log(join(LAB, "canvas", "index.html"));
