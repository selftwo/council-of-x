// Rehearsal voice loop — tier-1 server.
// LLM: DeepSeek v4 flash (streaming, OpenAI-compatible) or `claude` CLI fallback.
// TTS: Gemini 2.5/3.1 flash TTS (24kHz PCM → WAV) or browser speechSynthesis.
// STT: browser Web Speech (streaming) or Gemini batch transcription (push-to-talk).
// Cost: real usage metering + price table + hard budget cap.
// Env: loads ../.env (prototypes/.env) then ./.env (overrides). Zero npm deps.

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFileSync, readdirSync, existsSync, appendFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 7860;

// ---------- env ----------
const env = { ...process.env };
const envKeyNames = []; // names only, for /api/health; values never leave the process
for (const p of [join(ROOT, "..", ".env"), join(ROOT, ".env")]) {
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?([^"\n#]*)"?\s*$/);
    if (m && m[2].trim()) { env[m[1]] = m[2].trim(); envKeyNames.push(m[1]); }
  }
}
const GEMINI_KEY = env.GEMINI_API_KEY || env.GOOGLE_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY || "";
const DEEPSEEK_KEY = env.DEEPSEEK_API_KEY || env.DEEPSEEK_KEY || "";
const BUDGET_USD = parseFloat(env.REHEARSAL_BUDGET_USD || "2.00");
const CLAUDE_MODEL = env.REHEARSAL_MODEL || "claude-haiku-4-5-20251001";
const DEEPSEEK_MODEL = env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const STT_MODEL = env.GEMINI_STT_MODEL || "gemini-3.5-flash";

// ---------- pricing ($ per 1M tokens; audio TTS out ≈ 25 tok/sec) ----------
const PRICES = {
  "deepseek-v4-flash": { in: 0.14, in_cached: 0.0028, out: 0.28 },
  "gemini-3.1-flash-tts-preview": { in: 1.0, out: 20.0 },
  "gemini-2.5-flash-preview-tts": { in: 0.5, out: 10.0 },
  "gemini-3.5-flash": { in: 0.30, out: 2.50 }, // STT via audio understanding (approx, verify on dashboard)
};

// ---------- usage ledger ----------
const usage = { total_usd: 0, items: {} }; // items[model] = {calls, in, out, usd}
function meter(model, tokIn, tokOut, cachedIn = 0) {
  const p = PRICES[model] || { in: 0, out: 0 };
  const usd =
    ((tokIn - cachedIn) * (p.in || 0) + cachedIn * (p.in_cached ?? p.in ?? 0) + tokOut * (p.out || 0)) / 1e6;
  const it = (usage.items[model] ||= { calls: 0, in: 0, out: 0, usd: 0 });
  it.calls++; it.in += tokIn; it.out += tokOut; it.usd += usd;
  usage.total_usd += usd;
  appendFileSync(join(ROOT, "usage.log"),
    `${new Date().toISOString()}\t${model}\tin=${tokIn}\tout=${tokOut}\tusd=${usd.toFixed(6)}\ttotal=${usage.total_usd.toFixed(4)}\n`);
  return usd;
}
function budgetOk() { return usage.total_usd < BUDGET_USD; }

// ---------- scenarios ----------
function loadScenarios() {
  const dir = join(ROOT, "scenarios");
  const out = [];
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const raw = readFileSync(join(dir, f), "utf8");
    const fm = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    const meta = {};
    if (fm) for (const line of fm[1].split("\n")) {
      const m = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
      if (m) meta[m[1]] = m[2];
    }
    out.push({ id: f.replace(/\.md$/, ""), title: meta.title || f, description: meta.description || "",
      opening: meta.opening || "", system: fm ? fm[2].trim() : raw.trim() });
  }
  return out;
}

// ---------- session ----------
// { llm: "deepseek"|"claude", system, messages[], child?, busy }
let session = null;

function killClaude() { if (session?.child) try { session.child.kill(); } catch {} }

function startClaude(system) {
  const child = spawn("claude", ["-p", "--verbose", "--input-format", "stream-json",
    "--output-format", "stream-json", "--include-partial-messages",
    "--model", CLAUDE_MODEL, "--system-prompt", system, "--disallowedTools", "*"], { cwd: ROOT, env });
  child.stderr.on("data", (d) => console.error("[claude:err]", String(d).slice(0, 200)));
  const rl = createInterface({ input: child.stdout });
  rl.on("line", (line) => { let ev; try { ev = JSON.parse(line); } catch { return; } session?.onEvent?.(ev); });
  return child;
}

function extractSentences(buf) {
  const sentences = [];
  let rest = buf;
  for (;;) {
    const m = rest.match(/^([\s\S]{12,}?[.!?…]["')\]]?)\s+([\s\S]*)$/);
    if (!m) break;
    sentences.push(m[1].trim());
    rest = m[2];
  }
  return { sentences, rest };
}

// ---------- LLM turn ----------
async function turnDeepseek(text, res) {
  const t0 = Date.now();
  let firstDelta = null, firstSentence = null, buf = "", full = "";
  session.messages.push({ role: "user", content: text });
  const r = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${DEEPSEEK_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL, stream: true, stream_options: { include_usage: true },
      max_tokens: 400, temperature: 0.8,
      messages: [{ role: "system", content: session.system }, ...session.messages],
    }),
  });
  if (!r.ok) { sse(res, "error", { message: `deepseek ${r.status}: ${(await r.text()).slice(0, 200)}` }); res.end(); return; }
  const rl = createInterface({ input: Readable.fromWeb(r.body) });
  let toks = { in: 0, out: 0, cached: 0 };
  try {
  for await (const line of rl) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (payload === "[DONE]") break;
    let d; try { d = JSON.parse(payload); } catch { continue; }
    if (d.usage) toks = { in: d.usage.prompt_tokens || 0, out: d.usage.completion_tokens || 0,
      cached: d.usage.prompt_cache_hit_tokens || 0 };
    const delta = d.choices?.[0]?.delta?.content;
    if (!delta) continue;
    if (firstDelta === null) { firstDelta = Date.now() - t0; sse(res, "first_token", { ms: firstDelta }); }
    buf += delta; full += delta;
    const { sentences, rest } = extractSentences(buf);
    buf = rest;
    for (const s of sentences) {
      if (firstSentence === null) firstSentence = Date.now() - t0;
      sse(res, "sentence", { text: s, ms: Date.now() - t0 });
    }
  }
  } catch (e) {
    // the request was billed even if the stream died client-side; meter an estimate so the ledger matches the dashboard
    const estIn = Math.ceil(JSON.stringify(session.messages).length / 4);
    meter(DEEPSEEK_MODEL, toks.in || estIn, toks.out || Math.ceil(full.length / 4), toks.cached);
    throw e;
  }
  if (buf.trim()) {
    if (firstSentence === null) firstSentence = Date.now() - t0;
    sse(res, "sentence", { text: buf.trim(), ms: Date.now() - t0 });
  }
  session.messages.push({ role: "assistant", content: full });
  const usd = meter(DEEPSEEK_MODEL, toks.in, toks.out, toks.cached);
  sse(res, "done", { total_ms: Date.now() - t0, first_token_ms: firstDelta, first_sentence_ms: firstSentence,
    text: full, tokens: toks, usd: +usd.toFixed(6), total_usd: +usage.total_usd.toFixed(4) });
  res.end();
}

function turnClaude(text, res) {
  const t0 = Date.now();
  let firstDelta = null, firstSentence = null, buf = "", full = "";
  session.onEvent = (ev) => {
    if (ev.type === "stream_event") {
      const d = ev.event;
      if (d?.type === "content_block_delta" && d.delta?.type === "text_delta") {
        if (firstDelta === null) { firstDelta = Date.now() - t0; sse(res, "first_token", { ms: firstDelta }); }
        buf += d.delta.text; full += d.delta.text;
        const { sentences, rest } = extractSentences(buf);
        buf = rest;
        for (const s of sentences) {
          if (firstSentence === null) firstSentence = Date.now() - t0;
          sse(res, "sentence", { text: s, ms: Date.now() - t0 });
        }
      }
    } else if (ev.type === "result") {
      if (buf.trim()) sse(res, "sentence", { text: buf.trim(), ms: Date.now() - t0 });
      sse(res, "done", { total_ms: Date.now() - t0, first_token_ms: firstDelta, first_sentence_ms: firstSentence,
        text: full, usd: 0, total_usd: +usage.total_usd.toFixed(4) });
      session.busy = false; session.onEvent = null; res.end();
    }
  };
  session.child.stdin.write(JSON.stringify({ type: "user",
    message: { role: "user", content: [{ type: "text", text }] } }) + "\n");
}

// ---------- coach whisper ----------
// A side-channel guide: after an exchange, one short text-only hint grounded in the corpus voices.
// Never spoken, never seen by the persona; displayed dimly in the UI.
const COACH_SYSTEM = `You are a silent coach watching someone rehearse a difficult work conversation. You know the Lenny's Podcast corpus well. After each exchange, whisper ONE hint to the person practicing, in at most 35 words.

Ground the hint in a specific named source when one fits, e.g.: Wes Kao (managing up, stating the problem in the other person's terms), Camille Fournier (visible support beats private reassurance), Ethan Evans (the Magic Loop: ask how you can help what they're measured on), Anneka Gupta (get curious about their motivations), Shreyas Doshi (pre-mortems, tigers/paper tigers/elephants, three levels of product work, conviction quality), April Dunford (positioning), Lenny Rachitsky's guests generally.

Format: plain text, one or two sentences. Name the source inline like "Try Kao's move: ...". If the person is doing well, say what worked and whose principle it matched. No praise padding. Never address the persona, only the person practicing.`;

async function coachHint() {
  const t0 = Date.now();
  const recent = session.messages.slice(-6).map((m) => `${m.role === "user" ? "PRACTICER" : "PERSONA"}: ${m.content}`).join("\n");
  const r = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${DEEPSEEK_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      // v4-flash burns the whole budget on reasoning for this prompt; turn thinking off, the hint doesn't need it
      model: DEEPSEEK_MODEL, max_tokens: 200, temperature: 0.5, thinking: { type: "disabled" },
      messages: [
        { role: "system", content: COACH_SYSTEM },
        { role: "user", content: `Scenario: ${session.scenarioId}\n\nRecent exchange:\n${recent}\n\nOne whispered hint:` },
      ],
    }),
  });
  if (!r.ok) throw new Error(`coach deepseek ${r.status}`);
  const j = await r.json();
  const usd = meter(DEEPSEEK_MODEL, j.usage?.prompt_tokens || 0, j.usage?.completion_tokens || 0,
    j.usage?.prompt_cache_hit_tokens || 0);
  const msg = j.choices?.[0]?.message || {};
  const text = (msg.content || "").trim();
  if (!text) console.error("[coach] empty content", JSON.stringify({ finish: j.choices?.[0]?.finish_reason, keys: Object.keys(msg), usage: j.usage }));
  return { text, ms: Date.now() - t0, usd: +usd.toFixed(6) };
}

// ---------- Gemini TTS ----------
function wavFromPcm(pcm, rate = 24000) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

// Gemini TTS takes natural-language style direction in the prompt itself.
// This is how you get intonation instead of narration: direct the performance, then give the line.
const DEFAULT_TTS_STYLE =
  "Speak as a real person in a tense but professional work conversation. Slow, deliberate pace. " +
  "Natural pauses between sentences, as if thinking. Conversational intonation, not narration or announcer style";

async function geminiTts(text, model, voice, style) {
  const t0 = Date.now();
  const directed = `${style || DEFAULT_TTS_STYLE}: "${text}"`;
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": GEMINI_KEY, "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: directed }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice || "Kore" } } },
      },
    }),
  });
  if (!r.ok) throw new Error(`gemini tts ${model} ${r.status}: ${(await r.text()).slice(0, 800)}`);
  const j = await r.json();
  const part = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error("gemini tts: no audio in response " + JSON.stringify(j).slice(0, 200));
  const pcm = Buffer.from(part.inlineData.data, "base64");
  const um = j.usageMetadata || {};
  const usd = meter(model, um.promptTokenCount || 0, um.candidatesTokenCount || 0);
  return { wav: wavFromPcm(pcm), ms: Date.now() - t0, usd,
    tokens: { in: um.promptTokenCount || 0, out: um.candidatesTokenCount || 0 },
    audio_secs: +(pcm.length / 48000).toFixed(2) };
}

// ---------- Gemini streaming TTS (3.1, interactions API) ----------
async function geminiTtsStream(text, voice, onChunk) {
  const t0 = Date.now();
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "x-goog-api-key": GEMINI_KEY, "content-type": "application/json", "Api-Revision": "2026-05-20" },
    body: JSON.stringify({
      model: "gemini-3.1-flash-tts-preview", input: text,
      response_format: { type: "audio" },
      generation_config: { speech_config: [{ voice: voice || "Charon" }] },
      stream: true,
    }),
  });
  if (!r.ok) throw new Error(`gemini tts stream ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const rl = createInterface({ input: Readable.fromWeb(r.body) });
  let firstChunk = null, bytes = 0, events = new Set(), usageEv = null;
  for await (const line of rl) {
    if (!line.startsWith("data:")) continue;
    let d; try { d = JSON.parse(line.slice(5).trim()); } catch { continue; }
    events.add(d.event_type || d.type || "?");
    if (d.usage || d.usage_metadata) usageEv = d.usage || d.usage_metadata;
    const b64 = d.delta?.type === "audio" ? d.delta.data : null;
    if (b64) {
      if (firstChunk === null) firstChunk = Date.now() - t0;
      const buf = Buffer.from(b64, "base64");
      bytes += buf.length;
      onChunk?.(buf);
    }
  }
  const audio_secs = +(bytes / 48000).toFixed(2);
  // meter: no usage metadata guaranteed in stream; estimate audio tokens at 25/sec if absent
  const outTok = usageEv?.candidatesTokenCount || usageEv?.output_tokens || Math.round(audio_secs * 25);
  const inTok = usageEv?.promptTokenCount || usageEv?.input_tokens || Math.ceil(text.length / 4);
  const usd = meter("gemini-3.1-flash-tts-preview", inTok, outTok);
  return { first_chunk_ms: firstChunk, total_ms: Date.now() - t0, bytes, audio_secs, usd,
    events: [...events], usage_estimated: !usageEv };
}

// ---------- Gemini STT (batch) ----------
async function geminiStt(b64wav, mime) {
  const t0 = Date.now();
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${STT_MODEL}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": GEMINI_KEY, "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [
        { text: "Transcribe this audio verbatim. Output only the transcript text, nothing else." },
        { inlineData: { mimeType: mime || "audio/wav", data: b64wav } },
      ] }],
      generationConfig: { temperature: 0 },
    }),
  });
  if (!r.ok) throw new Error(`gemini stt ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim() || "";
  const um = j.usageMetadata || {};
  const usd = meter(STT_MODEL, um.promptTokenCount || 0, um.candidatesTokenCount || 0);
  return { text, ms: Date.now() - t0, usd, tokens: { in: um.promptTokenCount || 0, out: um.candidatesTokenCount || 0 } };
}

// ---------- http ----------
function sse(res, event, data) { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); }
function json(res, obj, code = 200) { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); }
async function body(req) { let b = ""; for await (const c of req) b += c; return b ? JSON.parse(b) : {}; }

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (url.pathname === "/") {
      res.writeHead(200, { "content-type": "text/html" });
      res.end(readFileSync(join(ROOT, "public", "index.html")));
    } else if (url.pathname === "/api/health") {
      json(res, {
        keys: { gemini: !!GEMINI_KEY, deepseek: !!DEEPSEEK_KEY },
        env_vars_found: envKeyNames,
        llm_default: DEEPSEEK_KEY ? "deepseek" : "claude",
        models: { deepseek: DEEPSEEK_MODEL, claude: CLAUDE_MODEL, stt: STT_MODEL },
        budget_usd: BUDGET_USD, spent_usd: +usage.total_usd.toFixed(4),
        session: session ? { scenario: session.scenarioId, llm: session.llm, busy: session.busy } : null,
      });
    } else if (url.pathname === "/api/usage") {
      json(res, { budget_usd: BUDGET_USD, total_usd: +usage.total_usd.toFixed(4), items: usage.items });
    } else if (url.pathname === "/api/scenarios") {
      json(res, loadScenarios().map(({ system, ...s }) => s));
    } else if (url.pathname === "/api/session" && req.method === "POST") {
      const { scenario: id, llm } = await body(req);
      const sc = loadScenarios().find((s) => s.id === id);
      if (!sc) return json(res, { error: "unknown scenario" }, 400);
      killClaude();
      const backend = llm || (DEEPSEEK_KEY ? "deepseek" : "claude");
      session = { scenarioId: sc.id, llm: backend, system: sc.system, messages: [], busy: false };
      if (backend === "claude") session.child = startClaude(sc.system);
      json(res, { ok: true, opening: sc.opening, llm: backend });
    } else if (url.pathname === "/api/turn" && req.method === "POST") {
      const { text } = await body(req);
      if (!session) return json(res, { error: "no session" }, 400);
      if (session.busy) return json(res, { error: "busy" }, 429);
      if (session.llm === "deepseek" && !budgetOk())
        return json(res, { error: `budget cap $${BUDGET_USD} reached` }, 402);
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
      session.busy = true;
      try {
        if (session.llm === "deepseek") { await turnDeepseek(text, res); session.busy = false; }
        else turnClaude(text, res); // busy cleared in result handler
      } catch (e) { session.busy = false; sse(res, "error", { message: String(e) }); res.end(); }
    } else if (url.pathname === "/api/coach" && req.method === "POST") {
      if (!session || session.messages.length < 2) return json(res, { error: "no exchange yet" }, 400);
      if (!DEEPSEEK_KEY) return json(res, { error: "no deepseek key" }, 404);
      if (!budgetOk()) return json(res, { error: `budget cap $${BUDGET_USD} reached` }, 402);
      json(res, await coachHint());
    } else if (url.pathname === "/api/tts" && req.method === "POST") {
      const { text, model, voice, style } = await body(req);
      if (!GEMINI_KEY) return json(res, { error: "no gemini key" }, 404);
      if (!budgetOk()) return json(res, { error: `budget cap $${BUDGET_USD} reached` }, 402);
      const out = await geminiTts(text, model || "gemini-2.5-flash-preview-tts", voice, style);
      res.writeHead(200, { "content-type": "audio/wav", "x-tts-ms": out.ms,
        "x-tts-usd": out.usd.toFixed(6), "x-audio-secs": out.audio_secs });
      res.end(out.wav);
    } else if (url.pathname === "/api/tts-stream" && req.method === "POST") {
      // streams raw s16le 24k mono PCM; timing headers unavailable mid-stream, metrics via trailer event on /api/bench
      const { text, voice } = await body(req);
      if (!GEMINI_KEY) return json(res, { error: "no gemini key" }, 404);
      if (!budgetOk()) return json(res, { error: `budget cap $${BUDGET_USD} reached` }, 402);
      res.writeHead(200, { "content-type": "application/octet-stream", "x-format": "pcm-s16le-24000" });
      await geminiTtsStream(text, voice, (buf) => res.write(buf));
      res.end();
    } else if (url.pathname === "/api/bench/tts-stream" && req.method === "POST") {
      const { text, voice } = await body(req);
      if (!GEMINI_KEY) return json(res, { error: "no gemini key" }, 404);
      if (!budgetOk()) return json(res, { error: `budget cap $${BUDGET_USD} reached` }, 402);
      json(res, await geminiTtsStream(text, voice, null));
    } else if (url.pathname === "/api/stt" && req.method === "POST") {
      const { audio, mime } = await body(req);
      if (!GEMINI_KEY) return json(res, { error: "no gemini key" }, 404);
      if (!budgetOk()) return json(res, { error: `budget cap $${BUDGET_USD} reached` }, 402);
      json(res, await geminiStt(audio, mime));
    } else { res.writeHead(404); res.end("not found"); }
  } catch (e) {
    console.error(e);
    try { json(res, { error: String(e) }, 500); } catch {}
  }
});

server.listen(PORT, () => {
  console.log(`rehearsal-voice tier-1 on http://localhost:${PORT}`);
  console.log(`keys: gemini=${!!GEMINI_KEY} deepseek=${!!DEEPSEEK_KEY} | budget $${BUDGET_USD}`);
});
process.on("SIGINT", () => { killClaude(); process.exit(0); });
