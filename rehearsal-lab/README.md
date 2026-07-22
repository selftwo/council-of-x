# Rehearsal lab — brain calibration before voice

Decision 2026-07-18: Gemini is dropped entirely (TTS and STT). Voice will be paid and good (ElevenLabs or Cartesia, orchestrated with Pipecat) — but only after the brain is proven in text. This lab is that proving ground.

## Phases

1. **Corpus → personas and coaching map** (background agents): `personas/catalog.md` (20-30 candidates by speaker and theme), `coaching/coaching-map.md` (what the corpus says about speaking under pressure, managing up, influence, careers; each item with a checkable "coachable behavior").
2. **Scenario selection**: `scenarios/proposals.md` holds 15 candidate difficult conversations tuned to Ben. He picks; picked ones become real scenario files.
3. **Text calibration on DeepSeek v4 flash**: run conversations through `harness/spar.mjs` (interactive or scripted). Each run gets its own folder in `runs/` with the transcript, an exact snapshot of the prompt that ran (versioned by hash), and cost/latency per turn.
4. **Evals**: `harness/judge.mjs` sends the run plus `evals/rubric.md` to Claude (`claude -p`, subscription; Opus/Fable-class judge) and writes `eval.md` + `eval.json` into the run folder. `harness/report.mjs` renders `report.html` (what happened, the stream, what changed since the previous run) and rebuilds the canvas. The loop: run → judge → report → tighten the prompt → rerun. Runs accumulate into an eval dataset.
5. **Then voice**: Pipecat + paid STT/TTS, reusing the calibrated prompts. The existing `prototypes/rehearsal-voice/` server stays as the scrappy voice testbed until then.

## Harness

```
node harness/spar.mjs --scenario scenarios/<s>.md              # interactive REPL
node harness/spar.mjs --scenario scenarios/<s>.md --turns f.txt # scripted (one user turn per line, # = comment)
node harness/judge.mjs runs/<run-id>                           # eval a run (writes eval.md + eval.json)
node harness/report.mjs runs/<run-id>                          # report.html + canvas rebuild
node harness/serve.mjs                                         # canvas at http://localhost:4790/canvas/index.html
```

Canonical scenarios live in `scenarios/` here. Keys come from `prototypes/.env` (never read that file directly; the harness loads it). DeepSeek only; budget guard at $2 cumulative in `logs/usage.log`. See `CLAUDE.md` for the working rules and `start.md` for the session playbook; `decisions.md` plus `runs/` drive the canvas.

## What "calibrated" means

The persona, judged blind against `evals/rubric.md`, consistently: stays in character and register, pushes instead of accommodating, uses corpus frameworks correctly with attribution, gives Ben room (one question at a time, tolerates silence), and produces debriefs that name specific transcript moments. When three different scenarios each score ≥4/5 on those axes across two runs, the brain is ready for voice.
