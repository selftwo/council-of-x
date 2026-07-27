#!/usr/bin/env node
// Deterministic reconciliation of the practicer judge's raw verdicts. Encodes two
// rules Ben asked for after the first real session (2026-07-22), so the "test
// environment" stops producing noise the way a raw judge pass did:
//
//   1. P3 severity gate. A single soft rhetorical taper ("so why not") is recorded
//      as a note, not a session failure, during the baseline period. P3 only fails
//      the session on 2+ tapers OR a taper the judge marked as reversing content
//      (verdict.reversal === true). Rationale: one soft close is not a guiding
//      signal; failing on it drowns the real fixes.
//   2. P1 / P5 tiebreaker. When the same Ben turn fails BOTH buried_lead (P1) and
//      question_dodged (P5), the burying is the root act; count it once under P1.
//      P5 keeps only turns where he answered a DIFFERENT question with a direct
//      answer available (a real dodge, like Boz's "you will see when we get there"),
//      not turns where the answer was merely buried. If P5 has no turns left, it
//      passes.
//
// Pure function, no I/O, so report.mjs and coaching-report.mjs share one source of
// truth. applyReconcile(runDir) persists raw_verdicts + reconciled verdicts back
// into practicer.json.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function reconcileVerdicts(verdictsIn) {
  const v = JSON.parse(JSON.stringify(verdictsIn));
  const notes = [];
  const P1 = v.P1_buried_lead, P3 = v.P3_unsaid_ending, P5 = v.P5_question_dodged;

  // Rule 1: P3 severity gate
  if (P3 && P3.pass === false) {
    const n = (P3.offending_turns || []).length;
    if (n <= 1 && P3.reversal !== true) {
      P3.pass = true;
      P3.softened = true;
      P3.note = `one soft taper (turn ${(P3.offending_turns || []).join(", ") || "?"}) recorded as a note, not a session fail; P3 fails on 2+ tapers or a content-reversing close`;
      notes.push(`P3: softened one taper to a note (baseline gate)`);
    }
  }

  // Rule 2: P1 / P5 tiebreaker
  if (P1 && P5 && P5.pass === false) {
    const buried = new Set(P1.pass === false ? (P1.offending_turns || []) : (P1.offending_turns || []));
    const before = (P5.offending_turns || []);
    const kept = before.filter((t) => !buried.has(t));
    if (kept.length !== before.length) {
      const removed = before.filter((t) => buried.has(t));
      P5.offending_turns = kept;
      P5.subsumed_turns = removed;
      if (kept.length === 0) {
        P5.pass = true;
        P5.note = `turns ${removed.join(", ")} were buried leads, not independent dodges; counted once under P1 (answers-first). No standalone dodge remains`;
        notes.push(`P5: all offending turns subsumed by P1 (tiebreaker) → pass`);
      } else {
        P5.note = `turns ${removed.join(", ")} moved to P1 (buried, not dodged); turns ${kept.join(", ")} are real dodges (direct answer was available)`;
        notes.push(`P5: ${removed.join(", ")} subsumed by P1; ${kept.join(", ")} kept as real dodges`);
      }
    }
  }
  return { verdicts: v, notes };
}

export function applyReconcile(runDir) {
  const pj = join(runDir, "practicer.json");
  if (!existsSync(pj)) return null;
  const g = JSON.parse(readFileSync(pj, "utf8"));
  if (!g.raw_verdicts) g.raw_verdicts = JSON.parse(JSON.stringify(g.verdicts)); // preserve the judge's original once
  const { verdicts, notes } = reconcileVerdicts(g.raw_verdicts);
  g.verdicts = verdicts;
  g.reconcile_notes = notes;
  g.reconciled_by = "harness/reconcile.mjs (P3 gate + P1/P5 tiebreaker, 2026-07-22)";
  writeFileSync(pj, JSON.stringify(g, null, 2) + "\n");
  return notes;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const notes = applyReconcile(resolve(process.argv[2] || ""));
  console.log(notes ? (notes.length ? notes.join("\n") : "no changes") : "no practicer.json in that run");
}
