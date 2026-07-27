#!/usr/bin/env node
// onthespot chat server: the V1 interface. Ben dictates with Wispr Flow into
// the chat box; replies come back as text. Every message is timestamped;
// think-time (gap between counterpart message shown and Ben's send) is logged.
//   node harness/server.mjs   → http://localhost:4795/
// Also serves the whole folder statically (runs/, canvas/, docs) like the lab.

import { createServer } from "node:http";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, extname, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT, KEY, MODEL, loadScenario, createRun, modelTurn } from "./session.mjs";

if (!KEY) { console.error("no DEEPSEEK_API_KEY found"); process.exit(1); }
const HARNESS = dirname(fileURLToPath(import.meta.url));
const PORT = 4795;
const TYPES = { ".html": "text/html", ".md": "text/plain", ".jsonl": "text/plain", ".json": "application/json", ".css": "text/css", ".mjs": "text/javascript", ".js": "text/javascript", ".txt": "text/plain", ".log": "text/plain" };

const sessions = new Map(); // runId → { scenario, messages, log, runDir, lastShownAt }

const readBody = (req) => new Promise((res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => res(b ? JSON.parse(b) : {})); });

createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const p = decodeURIComponent(url.pathname);
  try {
    if (p === "/" ) {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end(readFileSync(join(ROOT, "app", "index.html")));
    }
    if (p === "/api/scenarios") {
      const list = readdirSync(join(ROOT, "scenarios")).filter((f) => f.endsWith(".md") && !f.includes("draft"))
        .map((f) => { const s = loadScenario(join(ROOT, "scenarios", f)); return { id: s.id, ...s.meta }; })
        .filter((s) => s.title);
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify(list));
    }
    if (p === "/api/session" && req.method === "POST") {
      const { scenario: id } = await readBody(req);
      const scenario = loadScenario(join(ROOT, "scenarios", id + ".md"));
      const run = createRun(scenario, { turns_mode: "interactive" });
      const messages = [];
      if (scenario.meta.opening) {
        run.log({ type: "turn", role: "assistant", text: scenario.meta.opening, opening: true });
        messages.push({ role: "assistant", content: scenario.meta.opening });
      }
      sessions.set(run.runId, { scenario, messages, log: run.log, runDir: run.runDir, lastShownAt: Date.now() });
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ run: run.runId, opening: scenario.meta.opening || null, meta: scenario.meta, prompt_version: run.promptVersion }));
    }
    if (p === "/api/message" && req.method === "POST") {
      const { run, text } = await readBody(req);
      const s = sessions.get(run);
      if (!s) { res.writeHead(404); return res.end("no such session"); }
      const think_ms = Date.now() - s.lastShownAt; // gap since counterpart's last message appeared
      s.messages.push({ role: "user", content: text });
      s.log({ type: "turn", role: "user", text, think_ms });
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
      const out = await modelTurn(s.scenario.system, s.messages, (delta) => res.write(`data: ${JSON.stringify(delta)}\n\n`));
      s.messages.push({ role: "assistant", content: out.text });
      s.log({ type: "turn", role: "assistant", text: out.text, first_token_ms: out.first_token_ms, total_ms: out.total_ms, tokens: out.tokens, usd: out.usd });
      s.lastShownAt = Date.now();
      res.write(`event: done\ndata: ${JSON.stringify({ first_token_ms: out.first_token_ms, total_ms: out.total_ms, usd: out.usd })}\n\n`);
      return res.end();
    }
    if (p === "/api/end" && req.method === "POST") {
      const { run } = await readBody(req);
      const s = sessions.get(run);
      if (!s) { res.writeHead(404); return res.end("no such session"); }
      s.log({ type: "end" });
      sessions.delete(run);
      spawnSync("node", [join(HARNESS, "report.mjs"), s.runDir], { stdio: "inherit" });
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ report: `/runs/${run}/report.html` }));
    }
    if (p === "/api/coaching") {
      const run = (url.searchParams.get("run") || "").replace(/[^0-9A-Za-z:_.-]/g, "");
      const f = normalize(join(ROOT, "runs", run, "practicer.json"));
      if (!run || !f.startsWith(join(ROOT, "runs")) || !existsSync(f)) { res.writeHead(404, { "content-type": "application/json" }); return res.end("{}"); }
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(readFileSync(f));
    }
    // static: reports, canvas, docs
    const file = normalize(join(ROOT, p));
    if (!file.startsWith(ROOT) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "content-type": (TYPES[extname(file)] || "application/octet-stream") + "; charset=utf-8" });
    return res.end(readFileSync(file));
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.writeHead(500, { "content-type": "text/plain" });
    res.end("error: " + e.message);
  }
}).listen(PORT, () => console.log(`onthespot: http://localhost:${PORT}/ (brain: ${MODEL})`));
