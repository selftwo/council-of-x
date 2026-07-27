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

// second brain for A/B: gemini. Keys loaded by the same harness pass above.
export const GEMINI_KEY = env.GEMINI_API_KEY || env.GOOGLE_API_KEY || env.GOOGLE_GENAI_API_KEY;
export const GEMINI_MODEL = env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const GEMINI_PRICE = { in: 0.10, in_cached: 0.025, out: 0.40 }; // $/M tokens, flash-lite tier (approximate)
// which key/model names the harness actually found, so a diagnostic can report
// presence without ever printing the secret value itself.
export const brains = () => ({ deepseek: { model: MODEL, ready: !!KEY }, gemini: { model: GEMINI_MODEL, ready: !!GEMINI_KEY } });

// ---------- budget guard (onthespot has its own ledger) ----------
const LEDGER = join(LOGS, "usage.log");
const BUDGET = parseFloat(env.ONTHESPOT_BUDGET_USD || "2.00");
export function spentSoFar() {
  if (!existsSync(LEDGER)) return 0;
  return readFileSync(LEDGER, "utf8").split("\n").reduce((a, l) => a + (parseFloat(l.split("\tusd=")[1]) || 0), 0);
}
function meter(tokIn, tokOut, cached, model = MODEL, price = PRICE) {
  const usd = ((tokIn - cached) * price.in + cached * price.in_cached + tokOut * price.out) / 1e6;
  appendFileSync(LEDGER, `${new Date().toISOString()}\t${model}\tin=${tokIn}\tout=${tokOut}\tusd=${usd.toFixed(6)}\n`);
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

// ---------- one Gemini turn (streaming SSE; same shape as modelTurn) ----------
// The A/B second brain. Gemini 3.x has no full off switch (thinkingBudget 0 is
// rejected); thinkingLevel "low" is the floor, the nearest parity with
// DeepSeek's disabled reasoning: minimal hidden chain, comparable first token.
export async function geminiTurn(system, messages, onDelta) {
  if (!GEMINI_KEY) throw new Error("no GEMINI_API_KEY found (checked GEMINI_API_KEY, GOOGLE_API_KEY, GOOGLE_GENAI_API_KEY)");
  if (spentSoFar() >= BUDGET) throw new Error(`budget cap $${BUDGET} reached (logs/usage.log)`);
  const t0 = Date.now();
  const contents = messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`, {
    method: "POST",
    headers: { "x-goog-api-key": GEMINI_KEY, "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      // ~390 of these go to hidden thinking even at the "low" floor, so budget
      // well above DeepSeek's 400 or the visible reply truncates mid-sentence.
      generationConfig: { maxOutputTokens: 1024, temperature: 0.8, thinkingConfig: { thinkingLevel: "low" } },
    }),
  });
  if (!r.ok) throw new Error(`gemini ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const rl = createInterface({ input: Readable.fromWeb(r.body) });
  let full = "", firstMs = null, toks = { in: 0, out: 0, thoughts: 0, cached: 0 };
  for await (const line of rl) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (!payload) continue;
    let d; try { d = JSON.parse(payload); } catch { continue; }
    if (d.usageMetadata) toks = { in: d.usageMetadata.promptTokenCount || 0, out: d.usageMetadata.candidatesTokenCount || 0, thoughts: d.usageMetadata.thoughtsTokenCount || 0, cached: d.usageMetadata.cachedContentTokenCount || 0 };
    const parts = d.candidates?.[0]?.content?.parts?.filter((p) => !p.thought); // never leak the hidden reasoning into the reply
    const delta = Array.isArray(parts) ? parts.map((p) => p.text || "").join("") : "";
    if (!delta) continue;
    if (firstMs === null) firstMs = Date.now() - t0;
    full += delta;
    if (onDelta) onDelta(delta);
  }
  // gemini bills thinking tokens at the output rate, so count them toward cost.
  const usd = meter(toks.in, toks.out + toks.thoughts, toks.cached, GEMINI_MODEL, GEMINI_PRICE);
  return { text: full, first_token_ms: firstMs, total_ms: Date.now() - t0, tokens: toks, usd: +usd.toFixed(6) };
}

// ---------- provider dispatcher: A/B runner picks a brain by name ----------
export function turnFor(provider) {
  if (provider === "gemini") return { fn: geminiTurn, model: GEMINI_MODEL };
  return { fn: modelTurn, model: MODEL };
}
