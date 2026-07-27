#!/usr/bin/env node
// Deterministic practicer signals: measures BEN, not the counterpart. Implements
// the code half of evals/practicer-rubric-draft.md (C1-C7) on chat text only.
// Wispr cleans fillers and some hedges before they reach the chat, so these are
// LOWER BOUNDS; the audio (parakeet) half is not built yet. The judge is never
// asked to count any of this; it consumes these numbers.
//   node practicer-metrics.mjs ../runs/<run-id>   → writes practicer-metrics.json, prints it
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WPM = 140; // same spoken-rate estimate the report uses

// C3 hedge lexicon (chat text). Kept as the rubric draft lists it; prune later against real register.
const HEDGES = ["i think maybe", "sort of", "kind of", "i guess", "possibly", "probably", "i don't know if", "i feel like maybe", "this might be a dumb", "this may be wrong, but", "i'm not sure, but", "a little bit", "maybe", "perhaps", "sort of like"];
const APOLOGIES = ["sorry", "i apologize", "i don't know if this is useful"];
// C4 un-said endings (checked on the LAST sentence of each turn)
const UNSAID = ["if that makes sense", "does that make sense", "or whatever", "something like that", "i don't know", "but yeah", "so yeah", "why not", "or something"];
// C5 leak phrases (self-sabotage meta-commentary, any position in turn)
const LEAKS = ["that was rambly", "that was a mess", "i'm rambling", "let me start over", "that came out wrong", "bad answer", "i'm bad at"];

const words = (t) => t.split(/\s+/).filter(Boolean).length;
const lastSentence = (t) => { const m = t.trim().replace(/["'"]+$/, "").split(/[.!?]+\s|[.!?]+$/).filter((s) => s.trim()); return (m[m.length - 1] || t).toLowerCase(); };
const countPhrases = (text, list) => { const low = text.toLowerCase(); return list.reduce((a, p) => a + (low.split(p).length - 1), 0); };
const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); };
const pctl = (a, p) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };

export function practicerMetrics(runDir) {
  const L = readFileSync(join(runDir, "transcript.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const meta = L.find((o) => o.type === "meta") || {};
  const turns = L.filter((o) => o.type === "turn");
  const ben = turns.filter((o) => o.role === "user");
  const all = turns.filter((o) => !o.opening);
  const budget = (meta.response_budget_seconds || "").split("-").map((n) => parseInt(n, 10)).filter((n) => !isNaN(n));
  const budgetMax = budget.length ? budget[budget.length - 1] : null;

  const perTurn = ben.map((t, i) => {
    const w = words(t.text);
    const spokenS = Math.round((w / WPM) * 60);
    return {
      turn: i + 1,
      words: w,
      spoken_s_est: spokenS,
      over_budget: budgetMax != null && spokenS > budgetMax,
      think_s: t.think_ms != null ? Math.round(t.think_ms / 1000) : null,
      hedges: countPhrases(t.text, HEDGES),
      apologies: countPhrases(t.text, APOLOGIES),
      unsaid_ending: UNSAID.some((p) => lastSentence(t.text).includes(p)),
      leak: countPhrases(t.text, LEAKS) > 0,
      has_markdown_list: /^\s*([-*]|\d+\.)\s/m.test(t.text),
    };
  });

  const benWords = ben.reduce((a, t) => a + words(t.text), 0);
  const totWords = all.reduce((a, t) => a + words(t.text), 0);
  const wordsArr = perTurn.map((p) => p.words);
  const thinkArr = perTurn.map((p) => p.think_s).filter((n) => n != null);
  const firstTurn = turns[0], endEvt = L.find((o) => o.type === "end"), lastEvt = endEvt || turns[turns.length - 1];
  const durationS = firstTurn && lastEvt && lastEvt.t ? Math.round((new Date(lastEvt.t) - new Date(firstTurn.t)) / 1000) : null;

  return {
    run: meta.run, scenario: meta.scenario, audience: meta.audience || "",
    target_minutes: meta.target_minutes ?? null, response_budget_seconds: meta.response_budget_seconds || "",
    note: "chat-text only; hedge and filler counts are lower bounds (Wispr cleans them); audio/parakeet half not built",
    ben_turns: ben.length,
    talk_share: totWords ? +(benWords / totWords).toFixed(2) : null, // C2 (some scenarios legitimately > 0.6)
    words_per_turn: { median: median(wordsArr), max: Math.max(0, ...wordsArr) }, // C2
    think_s: { median: median(thinkArr), p90: pctl(thinkArr, 0.9) }, // C1 (chat proxy for latency)
    session_s: durationS, over_target: meta.target_minutes && durationS != null ? durationS > meta.target_minutes * 60 : null, // C7
    hedges_total: perTurn.reduce((a, p) => a + p.hedges, 0), // C3
    hedges_per_100w: benWords ? +((perTurn.reduce((a, p) => a + p.hedges, 0) / benWords) * 100).toFixed(1) : 0,
    apologies_total: perTurn.reduce((a, p) => a + p.apologies, 0), // C3 preemptive
    unsaid_ending_turns: perTurn.filter((p) => p.unsaid_ending).map((p) => p.turn), // C4
    leak_turns: perTurn.filter((p) => p.leak).map((p) => p.turn), // C5
    over_budget_turns: perTurn.filter((p) => p.over_budget).map((p) => p.turn),
    per_turn: perTurn,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const runDir = resolve(process.argv[2] || "");
  const m = practicerMetrics(runDir);
  writeFileSync(join(runDir, "practicer-metrics.json"), JSON.stringify(m, null, 2) + "\n");
  console.log(JSON.stringify(m, null, 2));
}
