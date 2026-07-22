#!/usr/bin/env node
// Eval a spar run: code checks first, then binary failure-mode judges (rubric v2).
//   node judge.mjs ../runs/<run-id>                 Claude judge (subscription, pinned model)
//   node judge.mjs ../runs/<run-id> --judge codex   second judge: GPT-5.6 terra via codex CLI
// Claude writes eval.md + eval.json; codex writes eval-codex.md + eval-codex.json.
// Judges never see other judges' output or prior scores (nothing to mine).

import { readFileSync, writeFileSync, existsSync, mkdtempSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { runChecks } from "./checks.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const runArg = args.find((a) => !a.startsWith("--"));
if (!runArg) { console.error("usage: judge.mjs <run dir> [--judge claude|codex] [--model m]"); process.exit(1); }
const judge = args.includes("--judge") ? args[args.indexOf("--judge") + 1] : "claude";
const mi = args.indexOf("--model");
// pin the judge model; providers drift (validate-evaluator doctrine)
const CLAUDE_MODEL = mi >= 0 ? args[mi + 1] : "claude-fable-5";
const CODEX_MODEL = "gpt-5.6-terra";

const runDir = resolve(runArg);
const lines = readFileSync(join(runDir, "transcript.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const meta = lines.find((l) => l.type === "meta") || {};
const turns = lines.filter((l) => l.type === "turn");
const transcript = turns.map((t) => `${t.role === "user" ? "PRACTICER" : "PERSONA"}: ${t.text}`).join("\n\n");

// code checks run first and are written regardless of judge outcome
const checks = runChecks(runDir);
writeFileSync(join(runDir, "checks.json"), JSON.stringify(checks, null, 2) + "\n");

const scenarioPrompt = readFileSync(join(runDir, "scenario.md"), "utf8");
const rubric = readFileSync(join(ROOT, "..", "evals", "rubric.md"), "utf8");

const FMS = ["flattery_leak", "register_break", "grounding_misuse", "dropped_question", "capitulation_unchallenged", "debrief_no_delivery"];

const prompt = `You are evaluating an AI persona used for spoken conversation practice. The rubric below defines six independent failure modes, each judged binary pass/fail with few-shot examples that set the decision boundary. Formatting/character rules are already checked by code; do not judge those.

Judge each failure mode INDEPENDENTLY. For each one: write the critique FIRST (detailed, quoting concrete evidence from the transcript), and only then commit to pass or fail. Never let one mode's verdict influence another. Be severe; a borderline case fails.

<rubric>
${rubric}
</rubric>

<scenario_system_prompt>
${scenarioPrompt}
</scenario_system_prompt>

<transcript scenario="${meta.scenario}" model="${meta.model}" prompt_version="${meta.prompt_version}">
${transcript}
</transcript>

Output markdown with one section per failure mode (critique then verdict), then a section "Top prompt fixes" (up to 3, quote the exact lines to add or change in the scenario system prompt, targeting only the failed modes), then "One thing to keep".

Then, as the very last thing, a fenced json block exactly in this shape (result values are exactly "pass" or "fail"; critiques are one dense sentence each):
\`\`\`json
{"failure_modes":{${FMS.map((f) => `"${f}":{"result":"...","critique":"..."}`).join(",")}},"verdict":"one short sentence"}
\`\`\``;

function runClaude() {
  const cliArgs = ["-p", "--model", CLAUDE_MODEL];
  let r = spawnSync("claude", cliArgs, { input: prompt, encoding: "utf8", maxBuffer: 10 * 1024 * 1024, timeout: 300000 });
  if (r.status !== 0) {
    console.error(`claude with pinned model failed (${(r.stderr || "").slice(0, 200)}); retrying with CLI default model`);
    r = spawnSync("claude", ["-p"], { input: prompt, encoding: "utf8", maxBuffer: 10 * 1024 * 1024, timeout: 300000 });
    if (r.status !== 0) { console.error("claude failed:", (r.stderr || "").slice(0, 500)); process.exit(1); }
    return { out: r.stdout.trim(), model: "claude-cli-default" };
  }
  return { out: r.stdout.trim(), model: CLAUDE_MODEL };
}

function runCodex() {
  const tmp = mkdtempSync(join(tmpdir(), "lab-judge-"));
  const pFile = join(tmp, "prompt.md"), oFile = join(tmp, "out.md");
  writeFileSync(pFile, prompt);
  const cArgs = ["exec", "-m", CODEX_MODEL, "-c", 'model_reasoning_effort="medium"', "--ephemeral", "--skip-git-repo-check", "--sandbox", "read-only", "-o", oFile, "-"];
  const r = spawnSync("codex", cArgs, { input: prompt, encoding: "utf8", maxBuffer: 20 * 1024 * 1024, timeout: 480000 });
  if (!existsSync(oFile)) { console.error("codex failed:", (r.stderr || r.stdout || "").slice(-800)); process.exit(1); }
  return { out: readFileSync(oFile, "utf8").trim(), model: CODEX_MODEL };
}

const { out, model } = judge === "codex" ? runCodex() : runClaude();
const suffix = judge === "codex" ? "-codex" : "";

writeFileSync(join(runDir, `eval${suffix}.md`), `# Eval: ${meta.scenario} @ ${meta.prompt_version} (${meta.model})\n\nRun: ${meta.run} · judged ${new Date().toISOString()} · judge ${model} · rubric v2 (binary failure modes)\n\n${out}\n`);

const jm = out.match(/```json\s*([\s\S]*?)```\s*$/);
if (jm) {
  try {
    const parsed = JSON.parse(jm[1]);
    const record = {
      schema: 2, run: meta.run, scenario: meta.scenario, prompt_version: meta.prompt_version,
      judge: judge === "codex" ? "codex" : "claude", judge_model: model, judged_at: new Date().toISOString(),
      checks_hard_pass: checks.all_hard_pass,
      failure_modes: parsed.failure_modes, verdict: parsed.verdict,
    };
    writeFileSync(join(runDir, `eval${suffix}.json`), JSON.stringify(record, null, 2) + "\n");
  } catch (e) { console.error("eval json parse failed:", e.message); }
} else console.error("no json block found in judge output; md written anyway");

console.log(join(runDir, `eval${suffix}.md`));
