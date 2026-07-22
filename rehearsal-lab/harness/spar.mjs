#!/usr/bin/env node
// Text-only calibration harness for rehearsal personas.
// Runs a conversation against DeepSeek v4 flash. Each run gets its own folder:
//   runs/<id>/transcript.jsonl   every turn with timings, tokens, usd
//   runs/<id>/scenario.md        snapshot of the exact prompt that ran (version = short hash)
// then judge.mjs adds eval.md + eval.json and report.mjs adds report.html there.
//   node spar.mjs --scenario <path.md>               interactive REPL (empty line to send, /quit to end)
//   node spar.mjs --scenario <path.md> --turns f.txt scripted: one user turn per line, '#' comments skipped
// Zero npm deps. Keys load from prototypes/.env via the same parser as the voice server.

import { readFileSync, existsSync, appendFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { join, dirname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const LOGS = join(ROOT, "..", "logs");
mkdirSync(LOGS, { recursive: true });

// ---------- env ----------
const env = { ...process.env };
for (const p of [join(ROOT, "..", "..", "prototypes", ".env")]) {
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?([^"\n#]*)"?\s*$/);
    if (m && m[2].trim()) env[m[1]] = m[2].trim();
  }
}
const KEY = env.DEEPSEEK_API_KEY || env.DEEPSEEK_KEY;
if (!KEY) { console.error("no DEEPSEEK_API_KEY found"); process.exit(1); }
const MODEL = env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const PRICE = { in: 0.14, in_cached: 0.0028, out: 0.28 }; // $/M tokens

// ---------- budget guard (shared cumulative ledger for the lab) ----------
const LEDGER = join(LOGS, "usage.log");
const BUDGET = parseFloat(env.REHEARSAL_BUDGET_USD || "2.00");
function spentSoFar() {
  if (!existsSync(LEDGER)) return 0;
  return readFileSync(LEDGER, "utf8").split("\n").reduce((a, l) => a + (parseFloat(l.split("\tusd=")[1]) || 0), 0);
}
function meter(tokIn, tokOut, cached) {
  const usd = ((tokIn - cached) * PRICE.in + cached * PRICE.in_cached + tokOut * PRICE.out) / 1e6;
  appendFileSync(LEDGER, `${new Date().toISOString()}\t${MODEL}\tin=${tokIn}\tout=${tokOut}\tusd=${usd.toFixed(6)}\n`);
  return usd;
}

// ---------- scenario ----------
const args = process.argv.slice(2);
function arg(name) { const i = args.indexOf("--" + name); return i >= 0 ? args[i + 1] : null; }
const scenarioPath = arg("scenario");
if (!scenarioPath) { console.error("usage: spar.mjs --scenario <path.md> [--turns <file>]"); process.exit(1); }
const raw = readFileSync(resolve(scenarioPath), "utf8");
const fm = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
const meta = {};
if (fm) for (const line of fm[1].split("\n")) { const m = line.match(/^(\w+):\s*"?(.*?)"?\s*$/); if (m) meta[m[1]] = m[2]; }
const system = fm ? fm[2].trim() : raw.trim();
const scenarioId = basename(scenarioPath).replace(/\.md$/, "");

// ---------- run folder ----------
const runId = `${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}-${scenarioId}`;
const runDir = join(ROOT, "..", "runs", runId);
mkdirSync(runDir, { recursive: true });
writeFileSync(join(runDir, "scenario.md"), raw);
const promptVersion = createHash("sha1").update(raw).digest("hex").slice(0, 8);
const logPath = join(runDir, "transcript.jsonl");
function log(obj) { appendFileSync(logPath, JSON.stringify({ t: new Date().toISOString(), ...obj }) + "\n"); }
log({ type: "meta", run: runId, scenario: scenarioId, prompt_version: promptVersion, model: MODEL, title: meta.title || "", turns_mode: arg("turns") ? "scripted" : "interactive", turns_file: arg("turns") ? basename(arg("turns")) : null });

// ---------- conversation ----------
const messages = [];
async function turn(text) {
  if (spentSoFar() >= BUDGET) { console.error(`budget cap $${BUDGET} reached (lab ledger)`); process.exit(2); }
  messages.push({ role: "user", content: text });
  log({ type: "turn", role: "user", text });
  const t0 = Date.now();
  const r = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL, stream: true, stream_options: { include_usage: true },
      max_tokens: 400, temperature: 0.8,
      // v4-flash is a reasoning model; without this, hidden reasoning drains
      // max_tokens and replies truncate mid-sentence (and first token is ~4s slower)
      thinking: { type: "disabled" },
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!r.ok) throw new Error(`deepseek ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const rl = createInterface({ input: Readable.fromWeb(r.body) });
  let full = "", firstMs = null, toks = { in: 0, out: 0, cached: 0 };
  for await (const line of rl) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (payload === "[DONE]") break;
    let d; try { d = JSON.parse(payload); } catch { continue; }
    if (d.usage) toks = { in: d.usage.prompt_tokens || 0, out: d.usage.completion_tokens || 0, cached: d.usage.prompt_cache_hit_tokens || 0 };
    const delta = d.choices?.[0]?.delta?.content;
    if (!delta) continue;
    if (firstMs === null) firstMs = Date.now() - t0;
    full += delta;
    process.stdout.write(delta);
  }
  process.stdout.write("\n\n");
  messages.push({ role: "assistant", content: full });
  const usd = meter(toks.in, toks.out, toks.cached);
  log({ type: "turn", role: "assistant", text: full, first_token_ms: firstMs, total_ms: Date.now() - t0, tokens: toks, usd: +usd.toFixed(6) });
  return full;
}

// ---------- run ----------
if (meta.opening) { console.log(`\x1b[33m${meta.opening}\x1b[0m\n`); log({ type: "turn", role: "assistant", text: meta.opening, opening: true }); messages.push({ role: "assistant", content: meta.opening }); }

const turnsFile = arg("turns");
if (turnsFile) {
  const lines = readFileSync(resolve(turnsFile), "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
  for (const line of lines) {
    console.log(`\x1b[36m> ${line}\x1b[0m\n`);
    await turn(line);
  }
  console.log(`run: ${runDir}`);
} else {
  console.log(`(interactive; scenario "${meta.title || scenarioId}"; /quit to end)\n`);
  const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: "> " });
  rl.prompt();
  rl.on("line", async (line) => {
    const text = line.trim();
    if (text === "/quit") { console.log(`run: ${runDir}`); process.exit(0); }
    if (text) await turn(text);
    rl.prompt();
  });
}
