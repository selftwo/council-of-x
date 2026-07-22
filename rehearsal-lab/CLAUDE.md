# Rehearsal lab rules

This folder is Ben's conversation-practice calibration lab. Claude runs the loop autonomously; Ben verifies through artifacts, not chat claims. Read start.md for the run playbook, decisions.md for standing decisions.

## The loop (never skip a step)

1. `node harness/spar.mjs --scenario scenarios/<s>.md [--turns scenarios/turns-samples/<f>.txt]` → creates `runs/<id>/` with transcript.jsonl and a scenario.md snapshot (prompt version = hash).
2. `node harness/judge.mjs runs/<id>` → checks.json (code checks run first) + eval.md + eval.json (Claude judge, pinned model, rubric v2: binary failure modes, critique before verdict). Add `--judge codex` for the GPT-5.6 second judge (eval-codex.*) on runs that matter; disagreements are flagged for Ben and his calls are kept as calibration labels.
3. `node harness/report.mjs runs/<id>` → report.html in the run folder, and the canvas rebuilds automatically.
4. Apply the judge's prompt fixes to the scenario file, note anything decision-level in decisions.md, rerun.

Eval doctrine (from sources/evals-skills + ai-notes 08): never ask a judge to count what code can count; binary pass/fail only, no score scales; few-shot examples in the rubric come from real labeled runs; judges never see other judges' output or anything minable; DeepSeek never judges itself. Model steering rules for anything we call live in references/model-prompting-research.md and references/calling-other-models.md.

A run without a report does not count as done. If a step fails, fix and rerun it; do not report a half-run as complete.

## Artifacts are the interface

- Everything Ben should verify lives on disk: runs/, canvas/index.html (serve with `node harness/serve.mjs`, port 4790), decisions.md.
- Every claim in a summary must be checkable in a report.html or a file. No results that exist only in chat.
- decisions.md is append-only history: add new dated entries, update the `## now` list, never rewrite past decisions.
- After editing decisions.md by hand, run `node harness/canvas.mjs` to rebuild the canvas.

## Prompts and versions

- Canonical scenario files live in `scenarios/` here. The copies in prototypes/rehearsal-voice/scenarios are the legacy voice testbed; do not calibrate those directly.
- Never edit a scenario snapshot inside runs/; those are frozen records.
- Prompt changes come from judge fixes or Ben; when applying a judge fix, apply it exactly or note in decisions.md why you deviated.
- Calibrated = a scenario scores ≥4/5 on all six rubric dimensions in two consecutive runs.

## Models and cost

- DeepSeek v4 flash is the production brain. It is a reasoning model: any non-streaming call needs `thinking: { type: "disabled" }` or max_tokens drains into reasoning.
- Claude subscription (`claude -p`) is the judge. Fable/Opus in the main thread edits prompts and writes decisions. Sonnet subagents may draft or mine; their output gets reviewed before landing.
- Shared budget ledger: logs/usage.log, $2 cap enforced by spar.mjs. Meter estimates even on crashed calls.
- Keys live in ../prototypes/.env. NEVER read that file with shell tools (cat, grep, etc.); harness scripts load it themselves. Key values must never appear in transcripts, logs, or reports.
- Voice phase (when Ben says go): Pipecat split pipeline, Deepgram Nova-3 STT + Cartesia Sonic 3.5 TTS default; speech-to-speech ruled out. Plan and constraints in references/voice/pipecat-notes.md and references/voice/stt-tts-cost-report.md. Voice runs write the same transcript.jsonl schema so checks/judges run unchanged; Node stays source of truth for prompts and versions.

## Writing register

- Docs, reports, canvas copy: plain language, lowercase section labels in HTML artifacts, mono aesthetic (match Ben's OS at localhost:4780).
- Persona prompts: spoken register, no em dashes or asterisks in output (the personas leak them; the rubric checks).
- Mocked Ben turns must sound like his dictation (loops, restarts, "right, sort of", buried points). Source register: obsidian-vault/ben-vault journals. Clean prose defeats the diagnosis eval.

## Publishing

This may become a public portfolio repo. Keep secrets out of every committed file; keep paths relative; assume a stranger reads every artifact.
