#!/usr/bin/env node
// Render the practicer judge's grading of BEN into coaching.html for a run.
// Reads practicer.json (Opus judge verdicts + nudges) and practicer-metrics.json
// (deterministic signals) from the run folder.
//   node coaching-report.mjs ../runs/<run-id>   → writes coaching.html
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

export function renderCoaching(runDir) {
  const pj = join(runDir, "practicer.json");
  if (!existsSync(pj)) return null;
  const g = JSON.parse(readFileSync(pj, "utf8"));
  const m = existsSync(join(runDir, "practicer-metrics.json")) ? JSON.parse(readFileSync(join(runDir, "practicer-metrics.json"), "utf8")) : {};
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const MODE_LABEL = { P1_buried_lead: "answers first, no wind-up", P2_hedged_claims: "commits, does not hedge", P3_unsaid_ending: "lands the ending", P4_leaking: "no self-sabotage", P5_question_dodged: "answers what was asked", P6_incoherent_structure: "structured, one arc" };
  const verdicts = Object.entries(g.verdicts || {}).map(([k, v]) => {
    const cls = v.pass ? "ok" : "bad";
    const turns = v.offending_turns && v.offending_turns.length ? ` <span class=dim>(ben turns ${v.offending_turns.join(", ")})</span>` : "";
    const note = v.note ? `<div class=crit style="opacity:.7">reconciled: ${esc(v.note)}</div>` : "";
    return `<div class="check ${cls}"><span class=mark>${v.pass ? "✓" : "✗"}</span><div><b>${MODE_LABEL[k] || k}</b>${turns}<div class=crit>${esc(v.critique)}</div>${note}</div></div>`;
  }).join("");
  const reconcileBanner = (g.reconcile_notes && g.reconcile_notes.length)
    ? `<div class=callout style="background:var(--soft);border-color:var(--line)">verdicts reconciled by code (P3 severity gate, P1/P5 tiebreaker): ${g.reconcile_notes.map(esc).join("; ")}. The judge's raw verdicts are kept in practicer.json.</div>`
    : "";

  const nudges = (g.nudges || []).map((n) => `<div class=nudge>
    <div class=nhead>ben turn ${n.turn} · ${esc(n.what_happened)}</div>
    <div class=why>${esc(n.why_it_costs_him)}</div>
    <div class=quote><span class=qlab>he said</span> ${esc(n.his_line)}</div>
    <div class=quote tighter><span class=qlab>tighter</span> ${esc(n.tighter)}</div>
  </div>`).join("");

  const metricRow = (label, val) => val == null || val === "" ? "" : `<tr><td class=dim>${label}</td><td>${esc(val)}</td></tr>`;
  const metricsHtml = m.ben_turns == null ? "" : `<table>
    ${metricRow("ben turns", m.ben_turns)}
    ${metricRow("talk share", m.talk_share)}
    ${metricRow("words per turn (median / max)", `${m.words_per_turn?.median} / ${m.words_per_turn?.max}`)}
    ${metricRow("time to send, incl. dictation (median / p90)", `${m.think_s?.median}s / ${m.think_s?.p90}s`)}
    ${metricRow("session", `${m.session_s}s${m.target_minutes ? ` / target ${m.target_minutes}:00` : ""}`)}
    ${metricRow("hedges (chat text, lower bound)", `${m.hedges_total} (${m.hedges_per_100w}/100w)`)}
    ${metricRow("un-said endings", (m.unsaid_ending_turns || []).length ? `turns ${m.unsaid_ending_turns.join(", ")}` : "none")}
    ${metricRow("over budget turns", (m.over_budget_turns || []).length ? m.over_budget_turns.join(", ") : "none")}
  </table><p class=dim>${esc(m.note || "")}</p>`;

  const html = `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>coaching · ${esc(g.scenario)} · onthespot</title>
<style>
:root{--fg:#16181d;--bg:#fff;--dim:#7a7f8a;--line:#e6e8ec;--soft:#f5f6f8;--ok:#0f8a3d;--okbg:#e9f7ee;--bad:#c8321f;--badbg:#fbeeec;--blue:#1d5fd6;--bluebg:#eaf1fd;--purple:#6d3fc4;--purplebg:#f2ecfb}
body.dark{--fg:#e8eaee;--bg:#131417;--dim:#8b8f99;--line:#2a2d33;--soft:#1c1e23;--ok:#57cf82;--okbg:#15291c;--bad:#ff7b6b;--badbg:#311b17;--blue:#6d9ff2;--bluebg:#17233a;--purple:#af8df0;--purplebg:#241b36}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.6 "SF Mono",ui-monospace,Menlo,monospace}
main{max-width:820px;margin:0 auto;padding:40px 24px 80px}
h1{font-size:18px;margin:0 0 4px}
h2{font-size:12px;font-weight:600;letter-spacing:.08em;margin:40px 0 14px;padding-left:10px;border-left:3px solid var(--accent,var(--blue))}
h2.p{--accent:var(--purple)}h2.g{--accent:var(--ok)}h2.b{--accent:var(--blue)}
.meta{color:var(--dim);font-size:12px}.dim{color:var(--dim)}a{color:var(--blue)}
.check{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1px solid var(--line);margin-bottom:8px;font-size:12px}
.check.ok{border-color:var(--ok);background:var(--okbg)}.check.bad{border-color:var(--bad);background:var(--badbg)}
.check .mark{font-weight:700}.check.ok .mark{color:var(--ok)}.check.bad .mark{color:var(--bad)}
.crit{color:var(--fg);opacity:.85;margin-top:4px;font-weight:400}
.nudge{border:1px solid var(--line);border-left:3px solid var(--purple);padding:12px 14px;margin-bottom:12px}
.nhead{font-weight:600;font-size:12px;margin-bottom:4px}.why{color:var(--dim);font-size:12px;margin-bottom:8px}
.quote{background:var(--soft);padding:8px 10px;margin:4px 0;font-size:13px}
.quote.tighter{background:var(--okbg)}
.qlab{display:inline-block;min-width:60px;color:var(--dim);font-size:10px;letter-spacing:.06em;text-transform:uppercase;margin-right:8px}
.fix{border:1px solid var(--purple);background:var(--purplebg);padding:14px 16px}
.fix b{font-size:13px}.fix .drill{margin-top:8px;padding-top:8px;border-top:1px solid var(--line)}
table{border-collapse:collapse;width:100%;font-size:12px}td{padding:5px 8px 5px 0;border-bottom:1px solid var(--line);vertical-align:top}
.callout{background:var(--bluebg);border:1px solid var(--blue);padding:10px 14px;font-size:12px;margin-bottom:20px}
footer{margin-top:60px;color:var(--dim);font-size:11px;border-top:1px solid var(--line);padding-top:12px;display:flex;justify-content:space-between}
kbd{border:1px solid var(--line);padding:0 4px;border-radius:2px}
</style>
<main>
<h1>coaching: how you did</h1>
<p class=meta>scenario <b>${esc(g.scenario)}</b> · audience <b>${esc(g.audience)}</b> · judged by <b>${esc(g.judge_model)}</b> · ${esc(g.graded_at)}</p>
<div class=callout>This grades <b>you</b>, not the counterpart. Binary pass/fail per habit, critique before verdict, no scores. Chat text only for now: Wispr strips fillers and some hedges, so those counts are lower bounds, and time-to-send includes your dictation, so it is not pause length.</div>

<h2 class=p>the single fix for this session</h2>
<div class=fix><b>${esc(g.one_fix?.what || "")}</b>
<div class=why style="margin-top:6px">${esc(g.one_fix?.why || "")}</div>
<div class=drill><span class=qlab>drill</span> ${esc(g.one_fix?.drill || "")}</div></div>

<h2 class=b>habit verdicts</h2>
${reconcileBanner}
${verdicts}

<h2 class=p>nudges, with a tighter version of what you actually said</h2>
${nudges}

${g.strength ? `<h2 class=g>what worked</h2><div class="check ok"><span class=mark>✓</span><div><b>ben turn ${g.strength.turn}</b><div class=crit>${esc(g.strength.what_worked)}</div><div class=quote style="margin-top:8px">${esc(g.strength.his_line)}</div></div></div>` : ""}

${g.hardest_moment ? `<h2 class=b>the hardest moment</h2><p><b class=dim>ben turn ${g.hardest_moment.turn}.</b> ${esc(g.hardest_moment.read)}</p>` : ""}

<h2 class=b>signals (deterministic, measured by code)</h2>
${metricsHtml}

<footer><span><a href="report.html">← persona report</a> · <a href="../../canvas/index.html">canvas</a> · <a href="../../coaching/session-2026-07-22-baseline.md">session note</a> · <kbd>m</kbd> light/dark</span><span>onthespot coaching · ${esc(g.graded_at)}</span></footer>
</main>
<script>
if(matchMedia("(prefers-color-scheme:dark)").matches)document.body.classList.add("dark");
addEventListener("keydown",e=>{if(e.key==="m")document.body.classList.toggle("dark")});
</script>`;
  writeFileSync(join(runDir, "coaching.html"), html);
  return join(runDir, "coaching.html");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = renderCoaching(resolve(process.argv[2] || ""));
  console.log(out || "no practicer.json in that run");
}
