#!/usr/bin/env node
// Tiny static server for the lab canvas and run reports. No deps.
//   node serve.mjs   → http://localhost:4790/canvas/index.html
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const LAB = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 4790;
const TYPES = { ".html": "text/html", ".md": "text/plain", ".jsonl": "text/plain", ".json": "application/json", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".txt": "text/plain", ".log": "text/plain" };

createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p === "/") p = "/canvas/index.html";
  const file = normalize(join(LAB, p));
  if (!file.startsWith(LAB) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, { "content-type": (TYPES[extname(file)] || "application/octet-stream") + "; charset=utf-8" });
  res.end(readFileSync(file));
}).listen(PORT, () => console.log(`rehearsal lab canvas: http://localhost:${PORT}/canvas/index.html`));
