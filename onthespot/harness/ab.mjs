#!/usr/bin/env node
// A/B roleplay runner: drive one scenario through TWO brains (deepseek v4-flash
// and gemini 3.5-flash-lite) with the SAME human turns, so the only variable is
// the model playing the counterpart. Writes one run folder per brain (normal
// transcript.jsonl shape, so report.mjs and checks.mjs work unchanged) and tags
// each run's meta with model + ab_pair so the compare page can find them.
//
//   node harness/ab.mjs --scenario scenarios/boz-frontier-vs-open.md --turns <file-or-run>
//   node harness/ab.mjs --scenario scenarios/boz-frontier-vs-open.md --from-run runs/<id>
//
// --from-run replays the exact user turns of an earlier real play (Ben's), the
// fairest input: identical human side, two counterparts. --turns takes a plain
// turns file like vibe.mjs. Zero npm deps.

import { readFileSync, existsSync } from "node:fs";
import { basename, resolve, join } from "node:path";
import { KEY, GEMINI_KEY, loadScenario, createRun, turnFor } from "./session.mjs";

const args = process.argv.slice(2);
const arg = (name) => { const i = args.indexOf("--" + name); return i >= 0 ? args[i + 1] : null; };
const scenarioPath = arg("scenario");
const turnsPath = arg("turns");
const fromRun = arg("from-run");
if (!scenarioPath || (!turnsPath && !fromRun)) {
  console.error("usage: ab.mjs --scenario <path.md> (--turns <file.txt> | --from-run runs/<id>)");
  process.exit(1);
}
if (!KEY) { console.error("no DEEPSEEK_API_KEY"); process.exit(1); }
if (!GEMINI_KEY) { console.error("no GEMINI_API_KEY (checked GEMINI_API_KEY, GOOGLE_API_KEY, GOOGLE_GENAI_API_KEY)"); process.exit(1); }

// ---- collect the human turns to replay ----
let userTurns, source;
if (fromRun) {
  const tp = join(resolve(fromRun), "transcript.jsonl");
  if (!existsSync(tp)) { console.error("no transcript at " + tp); process.exit(1); }
  userTurns = readFileSync(tp, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
    .filter((l) => l.type === "turn" && l.role === "user").map((l) => l.text);
  source = "from-run:" + basename(resolve(fromRun));
} else {
  userTurns = readFileSync(resolve(turnsPath), "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
  source = "turns:" + basename(turnsPath);
}
if (!userTurns.length) { console.error("no user turns found in " + source); process.exit(1); }

const scenario = loadScenario(scenarioPath);
const pairId = `${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}-${scenario.id}`;

async function playBrain(provider) {
  const { fn, model } = turnFor(provider);
  const run = createRun(scenario, { turns_mode: "ab", turns_source: source, provider, ab_pair: pairId });
  console.log(`\n\x1b[35m### ${provider} (${model}) → ${basename(run.runDir)}\x1b[0m`);
  const messages = [];
  if (scenario.meta.opening) {
    run.log({ type: "turn", role: "assistant", text: scenario.meta.opening, opening: true });
    messages.push({ role: "assistant", content: scenario.meta.opening });
  }
  for (const text of userTurns) {
    console.log(`\x1b[36m> ${text.slice(0, 90).replace(/\n/g, " ")}${text.length > 90 ? "…" : ""}\x1b[0m`);
    messages.push({ role: "user", content: text });
    run.log({ type: "turn", role: "user", text, think_ms: null });
    const out = await fn(scenario.system, messages, null);
    process.stdout.write(out.text + "\n\n");
    messages.push({ role: "assistant", content: out.text });
    run.log({ type: "turn", role: "assistant", text: out.text, first_token_ms: out.first_token_ms, total_ms: out.total_ms, tokens: out.tokens, usd: out.usd });
  }
  run.log({ type: "end" });
  return run.runDir;
}

// deepseek first, gemini second; same script both times.
const dsDir = await playBrain("deepseek");
const gmDir = await playBrain("gemini");
console.log(`\n\x1b[35mab pair ${pairId}\x1b[0m\n  deepseek: ${dsDir}\n  gemini:   ${gmDir}\n  compare:  node harness/ab-report.mjs --pair ${pairId}`);
