#!/usr/bin/env node
// Pinned pairwise judge for an A/B pair. Both counterparts answered the SAME
// human turns; the judge reads them blind (Counterpart A / Counterpart B, no
// model names) and picks which role-played better per dimension. Pairwise
// preference is more reliable than absolute scoring, so it is the one judge call
// this A/B leans on. A = deepseek, B = gemini, un-blinded only when writing.
//   node harness/ab-judge.mjs --pair <id> [--model claude-opus-4-8]
// Writes runs/AB-<pair>/judge.json (+ judge.md). Then re-run ab-report.mjs.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HARNESS = dirname(fileURLToPath(import.meta.url));
const RUNS = join(HARNESS, "..", "runs");
const args = process.argv.slice(2);
const arg = (name) => { const i = args.indexOf("--" + name); return i >= 0 ? args[i + 1] : null; };
const pair = arg("pair");
const JUDGE_MODEL = arg("model") || "claude-opus-4-8"; // pinned; providers drift
if (!pair) { console.error("usage: ab-judge.mjs --pair <id> [--model m]"); process.exit(1); }

const dirs = readdirSync(RUNS).filter((d) => existsSync(join(RUNS, d, "transcript.jsonl"))).filter((d) => {
  try { return JSON.parse(readFileSync(join(RUNS, d, "transcript.jsonl"), "utf8").split("\n").filter(Boolean)[0]).ab_pair === pair; } catch { return false; }
});
if (dirs.length !== 2) { console.error(`expected 2 runs for pair ${pair}, found ${dirs.length}`); process.exit(1); }

function load(dir) {
  const lines = readFileSync(join(RUNS, dir, "transcript.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  return { dir, meta: lines.find((l) => l.type === "meta") || {}, turns: lines.filter((l) => l.type === "turn") };
}
const runs = dirs.map(load).sort((a, b) => (a.meta.provider === "deepseek" ? -1 : 1));
const [A, B] = runs; // A = deepseek, B = gemini (blinded below)
const scenarioPrompt = readFileSync(join(RUNS, A.dir, "scenario.md"), "utf8");

// build the blind side-by-side: shared human turn, then each counterpart's reply
const humanTurns = A.turns.filter((t) => t.role === "user").map((t) => t.text);
const aiA = A.turns.filter((t) => t.role === "assistant" && !t.opening).map((t) => t.text);
const aiB = B.turns.filter((t) => t.role === "assistant" && !t.opening).map((t) => t.text);
const opening = A.turns.find((t) => t.role === "assistant" && t.opening);
const transcript = [
  opening ? `COUNTERPART (opening, identical for both): ${opening.text}` : "",
  ...humanTurns.map((h, i) => `--- turn ${i + 1} ---\nPRACTICER (same input to both): ${h}\n\nCOUNTERPART A: ${aiA[i] || "(no reply)"}\n\nCOUNTERPART B: ${aiB[i] || "(no reply)"}`),
].filter(Boolean).join("\n\n");

const DIMS = [
  ["persona_fidelity", "stays in character: the specific person and power dynamic the scenario defines, not a generic helpful assistant"],
  ["substance", "pushes back with real, concrete content and memory of what was said, not vague or repetitive filler"],
  ["spoken_register", "sounds like a real person speaking, not a chatbot: no interview cadence, no formula of ending every turn with a question"],
  ["variety", "reply shape varies turn to turn (sometimes a flat assertion, sometimes a probe), not the same move every time"],
  ["handles_messy_input", "handles the practicer's garbled or self-correcting dictation gracefully without derailing or nitpicking"],
  ["practice_value", "creates useful pressure that would actually sharpen the practicer, without rescuing or flattering them"],
];

const prompt = `You are judging which of two AI counterparts role-plays a difficult-conversation partner better. Both were given the SAME scenario system prompt and the SAME human turns from a real practice session; the only difference is the model behind each counterpart. You do not know which model is which. Judge only the counterpart's replies (COUNTERPART A vs COUNTERPART B), never the practicer.

This is a PAIRWISE comparison: for each dimension pick a winner, "A", "B", or "tie". Write the reasoning FIRST quoting concrete lines, then commit to the winner. Be specific and severe; do not default to "tie" to avoid a call. Ignore formatting and character rules; those are checked by code.

<scenario_system_prompt>
${scenarioPrompt}
</scenario_system_prompt>

<transcript>
${transcript}
</transcript>

Dimensions to judge (each independently):
${DIMS.map(([k, d]) => `- ${k}: ${d}`).join("\n")}

Write one short paragraph per dimension (evidence then winner). Then an overall paragraph. Then, as the very last thing, a fenced json block exactly in this shape (winner is "A", "B", or "tie"; every text field one dense sentence, no line breaks inside strings):
\`\`\`json
{"per_dimension":[${DIMS.map(([k]) => `{"dimension":"${k}","winner":"...","why":"..."}`).join(",")}],"overall_winner":"...","overall_why":"...","counterpart_a_note":"...","counterpart_b_note":"...","for_the_product":"which counterpart would make the better practice partner for this kind of scenario and why, in one sentence"}
\`\`\``;

let r = spawnSync("claude", ["-p", "--model", JUDGE_MODEL], { input: prompt, encoding: "utf8", maxBuffer: 10 * 1024 * 1024, timeout: 300000 });
let model = JUDGE_MODEL;
if (r.status !== 0) {
  console.error(`claude pinned model failed (${(r.stderr || "").slice(0, 200)}); retrying CLI default`);
  r = spawnSync("claude", ["-p"], { input: prompt, encoding: "utf8", maxBuffer: 10 * 1024 * 1024, timeout: 300000 });
  if (r.status !== 0) { console.error("claude failed:", (r.stderr || "").slice(0, 500)); process.exit(1); }
  model = "claude-cli-default";
}
const out = r.stdout.trim();
const outDir = join(RUNS, `AB-${pair}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "judge.md"), `# A/B pairwise judge: ${A.meta.scenario}\n\npair ${pair} · judged ${new Date().toISOString()} · judge ${model} · A=deepseek(${A.meta.model}) B=gemini(${B.meta.model})\n\n${out}\n`);

const jm = out.match(/```json\s*([\s\S]*?)```\s*$/);
if (!jm) { console.error("no json block in judge output; judge.md written anyway"); process.exit(1); }
// the judge occasionally doubles the terminal quote of a value (`...text.""`);
// repair that one glitch before parsing so a good grading is not thrown away.
const repair = (s) => s.replace(/([.!?])""(\s*[,}])/g, '$1"$2');
let parsed;
try { parsed = JSON.parse(jm[1]); } catch { parsed = JSON.parse(repair(jm[1])); }
const unblind = (w) => (w === "A" ? "deepseek" : w === "B" ? "gemini" : "tie"); // A=deepseek, B=gemini
const record = {
  pair, scenario: A.meta.scenario, judge_model: model, graded_at: new Date().toISOString(),
  deepseek_run: A.dir, gemini_run: B.dir, deepseek_model: A.meta.model, gemini_model: B.meta.model,
  method: "blind pairwise (Counterpart A=deepseek, B=gemini, hidden from judge)",
  per_dimension: (parsed.per_dimension || []).map((d) => ({ dimension: d.dimension, winner: unblind(d.winner), why: d.why })),
  overall_winner: unblind(parsed.overall_winner), overall_why: parsed.overall_why,
  deepseek_note: parsed.counterpart_a_note, gemini_note: parsed.counterpart_b_note,
  for_bens_use_case: parsed.for_the_product,
};
writeFileSync(join(outDir, "judge.json"), JSON.stringify(record, null, 2) + "\n");
console.log(join(outDir, "judge.json"), "→", record.overall_winner);
