// Shared session core for onthespot: env, budget ledger, scenario parsing,
// run folders, DeepSeek streaming call. Used by server.mjs (chat UI) and
// vibe.mjs (scripted runs). Zero npm deps. Imported from rehearsal-lab's
// spar.mjs and adapted: per-turn timestamps and think-time are first-class.

import { readFileSync, existsSync, appendFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { join, dirname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOGS = join(ROOT, "logs");
mkdirSync(LOGS, { recursive: true });

// ---------- env (keys live in council/prototypes/.env; never read it by hand) ----------
const env = { ...process.env };
for (const p of [join(ROOT, "..", "prototypes", ".env")]) {
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?([^"\n#]*)"?\s*$/);
    if (m && m[2].trim()) env[m[1]] = m[2].trim();
  }
}
export const KEY = env.DEEPSEEK_API_KEY || env.DEEPSEEK_KEY;
export const MODEL = env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const PRICE = { in: 0.14, in_cached: 0.0028, out: 0.28 }; // $/M tokens

// ---------- budget guard (onthespot has its own ledger) ----------
const LEDGER = join(LOGS, "usage.log");
const BUDGET = parseFloat(env.ONTHESPOT_BUDGET_USD || "2.00");
export function spentSoFar() {
  if (!existsSync(LEDGER)) return 0;
  return readFileSync(LEDGER, "utf8").split("\n").reduce((a, l) => a + (parseFloat(l.split("\tusd=")[1]) || 0), 0);
}
function meter(tokIn, tokOut, cached) {
  const usd = ((tokIn - cached) * PRICE.in + cached * PRICE.in_cached + tokOut * PRICE.out) / 1e6;
  appendFileSync(LEDGER, `${new Date().toISOString()}\t${MODEL}\tin=${tokIn}\tout=${tokOut}\tusd=${usd.toFixed(6)}\n`);
  return usd;
}

// ---------- scenarios ----------
export function loadScenario(path) {
  const raw = readFileSync(resolve(path), "utf8");
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta = {};
  if (fm) for (const line of fm[1].split("\n")) { const m = line.match(/^(\w+):\s*"?(.*?)"?\s*$/); if (m) meta[m[1]] = m[2]; }
  return { raw, meta, system: fm ? fm[2].trim() : raw.trim(), id: basename(path).replace(/\.md$/, "") };
}

// ---------- run folder ----------
export function createRun(scenario, extraMeta = {}) {
  const runId = `${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}-${scenario.id}`;
  const runDir = join(ROOT, "runs", runId);
  mkdirSync(runDir, { recursive: true });
  writeFileSync(join(runDir, "scenario.md"), scenario.raw);
  const promptVersion = createHash("sha1").update(scenario.raw).digest("hex").slice(0, 8);
  const logPath = join(runDir, "transcript.jsonl");
  const log = (obj) => appendFileSync(logPath, JSON.stringify({ t: new Date().toISOString(), ...obj }) + "\n");
  log({
    type: "meta", run: runId, scenario: scenario.id, prompt_version: promptVersion, model: MODEL,
    title: scenario.meta.title || "", audience: scenario.meta.audience || "", power_dynamic: scenario.meta.power_dynamic || "",
    target_minutes: scenario.meta.target_minutes ? +scenario.meta.target_minutes : null,
    response_budget_seconds: scenario.meta.response_budget_seconds || "",
    ...extraMeta,
  });
  return { runId, runDir, promptVersion, log };
}

// ---------- one model turn (streaming; onDelta gets each text chunk) ----------
export async function modelTurn(system, messages, onDelta) {
  if (spentSoFar() >= BUDGET) throw new Error(`budget cap $${BUDGET} reached (logs/usage.log)`);
  const t0 = Date.now();
  const r = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL, stream: true, stream_options: { include_usage: true },
      max_tokens: 400, temperature: 0.8,
      // v4-flash is a reasoning model; without this, hidden reasoning drains
      // max_tokens and replies truncate (and first token is ~4s slower)
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
    if (onDelta) onDelta(delta);
  }
  const usd = meter(toks.in, toks.out, toks.cached);
  return { text: full, first_token_ms: firstMs, total_ms: Date.now() - t0, tokens: toks, usd: +usd.toFixed(6) };
}
