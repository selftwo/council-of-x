#!/usr/bin/env node
// Scripted calibration runner for onthespot: replays a turns file through the
// same session core the chat server uses, so vibe-loop runs and real sessions
// share transcript.jsonl shape exactly.
//   node harness/vibe.mjs --scenario scenarios/<s>.md --turns scenarios/turns-samples/<f>.txt
// Zero npm deps. Adapted from rehearsal-lab/harness/spar.mjs scripted mode.

import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { KEY, loadScenario, createRun, modelTurn } from "./session.mjs";

if (!KEY) { console.error("no DEEPSEEK_API_KEY found"); process.exit(1); }

const args = process.argv.slice(2);
function arg(name) { const i = args.indexOf("--" + name); return i >= 0 ? args[i + 1] : null; }
const scenarioPath = arg("scenario");
const turnsPath = arg("turns");
if (!scenarioPath || !turnsPath) { console.error("usage: vibe.mjs --scenario <path.md> --turns <path.txt>"); process.exit(1); }

const scenario = loadScenario(scenarioPath);
const run = createRun(scenario, { turns_mode: "scripted", turns_file: basename(turnsPath) });
console.log(`run: ${run.runDir}\n`);

const messages = [];
if (scenario.meta.opening) {
  console.log(`\x1b[33m${scenario.meta.opening}\x1b[0m\n`);
  run.log({ type: "turn", role: "assistant", text: scenario.meta.opening, opening: true });
  messages.push({ role: "assistant", content: scenario.meta.opening });
}

const lines = readFileSync(resolve(turnsPath), "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
for (const line of lines) {
  console.log(`\x1b[36m> ${line}\x1b[0m\n`);
  // scripted runs have no real think time (no human reading/dictating between turns); don't fake one
  messages.push({ role: "user", content: line });
  run.log({ type: "turn", role: "user", text: line, think_ms: null });
  const out = await modelTurn(scenario.system, messages, (delta) => process.stdout.write(delta));
  process.stdout.write("\n\n");
  messages.push({ role: "assistant", content: out.text });
  run.log({ type: "turn", role: "assistant", text: out.text, first_token_ms: out.first_token_ms, total_ms: out.total_ms, tokens: out.tokens, usd: out.usd });
}

run.log({ type: "end" });
console.log(`run: ${run.runDir}`);
