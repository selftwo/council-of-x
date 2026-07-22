#!/usr/bin/env node
// Code-based checks: deterministic rules a judge should never be asked to score
// (Hamel Husain's evals doctrine: exhaust code checks before reaching for an LLM judge).
// Judges got the em dash count wrong in both directions on 2026-07-18; this never will.
//   node checks.mjs ../runs/<run-id>     (also imported by judge.mjs)
// Writes checks.json into the run folder.

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function runChecks(runDir) {
  const lines = readFileSync(join(runDir, "transcript.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const turns = lines.filter((l) => l.type === "turn" && l.role === "assistant" && !l.opening).map((t, i) => ({ i: i + 1, text: t.text }));

  const failures = (name, arr) => ({ pass: arr.length === 0, failing_turns: arr });

  // banned characters: em dash, en dash, asterisk (spoken persona must never emit them)
  const banned = turns.filter((t) => /[—–*]/.test(t.text)).map((t) => ({ turn: t.i, count: (t.text.match(/[—–*]/g) || []).length }));

  // stacked questions: more than one "?" in a single reply
  const stacked = turns.filter((t) => (t.text.match(/\?/g) || []).length > 1).map((t) => ({ turn: t.i, questions: (t.text.match(/\?/g) || []).length }));

  // overlong reply: prompt says under 100 words; tolerance 110. Debrief (last turn) allowed 260.
  const overlong = turns.filter((t, idx) => {
    const words = t.text.split(/\s+/).filter(Boolean).length;
    const limit = idx === turns.length - 1 ? 260 : 110;
    return words > limit;
  }).map((t) => ({ turn: t.i, words: t.text.split(/\s+/).filter(Boolean).length }));

  // markdown leak: bullets, headings, numbered lists, bold
  const markdown = turns.filter((t) => /^\s*([-#]|\d+\.)\s/m.test(t.text) || t.text.includes("**")).map((t) => ({ turn: t.i }));

  // compliment opener (soft heuristic; the judge confirms, this flags): first sentence grades the user
  const compliment = turns.filter((t) => /^(that's (a )?(honest|crisp|crucial|great|good|sharp|genuinely)|great point|good point|excellent|exactly right|now you're|you just (named|surfaced))/i.test(t.text.trim())).map((t) => ({ turn: t.i, opener: t.text.trim().split(/[.!?]/)[0].slice(0, 60) }));

  const checks = {
    banned_characters: failures("banned_characters", banned),
    stacked_questions: failures("stacked_questions", stacked),
    overlong_reply: failures("overlong_reply", overlong),
    markdown_leak: failures("markdown_leak", markdown),
    compliment_opener_flag: { ...failures("compliment_opener_flag", compliment), soft: true },
  };
  checks.all_hard_pass = ["banned_characters", "stacked_questions", "overlong_reply", "markdown_leak"].every((k) => checks[k].pass);
  return checks;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const runDir = resolve(process.argv[2] || "");
  const checks = runChecks(runDir);
  writeFileSync(join(runDir, "checks.json"), JSON.stringify(checks, null, 2) + "\n");
  console.log(JSON.stringify(checks, null, 2));
}
