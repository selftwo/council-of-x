// One-time backfill of the first calibration run (2026-07-18) into the runs/ structure.
// Reconstructs the pre-fix prompt so the next report's diff shows the three judge fixes.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const LAB = join(dirname(fileURLToPath(import.meta.url)), "..");
const cur = readFileSync(join(LAB, "scenarios", "shreyas-sparring.md"), "utf8");
const pre = cur
  .split("\n")
  .filter((l) => !l.startsWith("- Never output the characters") && !l.startsWith("- Ask exactly one question per reply"))
  .join("\n")
  .replace(" and say one thing about how they talked, not just what they said: did they ramble, hedge, or bury the point? Quote one of their sentences and say how you'd tighten it.", ".");
const dir = join(LAB, "runs", "2026-07-18T06-23-57-shreyas-sparring");
writeFileSync(join(dir, "scenario.md"), pre);
const hash = createHash("sha1").update(pre).digest("hex").slice(0, 8);
const lines = readFileSync(join(dir, "transcript.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
lines[0] = { ...lines[0], run: "2026-07-18T06-23-57-shreyas-sparring", prompt_version: hash };
writeFileSync(join(dir, "transcript.jsonl"), lines.map((o) => JSON.stringify(o)).join("\n") + "\n");
writeFileSync(join(dir, "eval.json"), JSON.stringify({
  scores: { persona_fidelity: 2, challenge: 4, groundedness: 4, conversational_memory: 4, space: 3, practicer_diagnosis: 3 },
  verdict: "Needs prompt work: strong challenge and grounding, but em dashes and asterisks leak into spoken text, questions stack, and the debrief ignores pacing.",
  run: "2026-07-18T06-23-57-shreyas-sparring", scenario: "shreyas-sparring", prompt_version: hash,
  judged_at: "2026-07-18T06:35:00Z", note: "backfilled; scenario.md is the reconstructed pre-fix prompt",
}, null, 2) + "\n");
console.log("pre-fix version:", hash, "differs from current:", pre !== cur);
