# Inventory — every file in the lab and why it exists

Updated 2026-07-18 (evening, after the rubric v2 rebuild). What was created, what reference shaped it, and how other models are leveraged.

## Governance and orientation

| file | what it is | shaped by |
|---|---|---|
| CLAUDE.md | working rules any Claude session must follow here (the loop, artifacts-are-the-interface, model roles, key safety) | Ben's "verify through artifacts, not chat" requirement |
| start.md | session playbook: get current, run a cycle, write new material, close | — |
| decisions.md | append-only decision log; source of truth the canvas renders | — |
| inventory.md | this file | — |
| README.md | phases and harness usage | — |

## Harness (all zero-dependency node)

| file | what it does | shaped by |
|---|---|---|
| harness/spar.mjs | runs a conversation vs DeepSeek v4 flash; per-run folder with transcript + exact prompt snapshot (hash-versioned); budget ledger $2 cap; thinking disabled (reasoning drained max_tokens) | model research: DeepSeek thinking modes, cache-hit pricing |
| harness/checks.mjs | deterministic code checks (banned chars, stacked questions, length, markdown, compliment-opener flag) | evals-skills: exhaust code checks before LLM judges; ai-notes 080: deterministic checker beats judge on constraints |
| harness/judge.mjs | binary failure-mode judging vs evals/rubric.md; critique before verdict; pinned judge model; `--judge codex` for GPT-5.6 second opinion | evals-skills write-judge-prompt + validate-evaluator; ai-notes 006 (analysis-first), 010d (cross-model-family checks) |
| harness/report.mjs | per-run report.html: verdicts, checks, both judges with disagreement flags, prompt diff, full stream; rebuilds canvas | Ben: "what happened, what changed, what didn't, verifiable" |
| harness/canvas.mjs | regenerates canvas/index.html from decisions.md + runs/ | Ben's mono OS (localhost:4780) + color request |
| harness/serve.mjs | static server, port 4790 (launch.json: rehearsal-lab-canvas) | — |
| harness/backfill-first-run.mjs | one-time: migrated the first run into the runs/ structure with a reconstructed pre-fix prompt | — |

## Evals

| file | what it is |
|---|---|
| evals/rubric.md | rubric v2: six binary failure modes, pass/fail definitions, few-shot examples from real runs, calibration path |
| evals/rubric-v1-likert.md | archived v1 (1-5 scales); kept for the history of why it was replaced |
| runs/<id>/ | per run: transcript.jsonl, scenario.md snapshot, checks.json, eval.json (claude), eval-codex.json (gpt-5.6), eval.md + eval-codex.md, report.html |

## Content

| file | what it is |
|---|---|
| scenarios/*.md | canonical scenario prompts (shreyas-sparring @v4, stakeholder-pushback); 10 approved builds queued: A1 A3 B6 C8 C9 D11 D12 D13 E14 E15 |
| scenarios/proposals.md | the 15 candidates with Ben's picks marked |
| scenarios/turns-samples/*.txt | scripted mocked-Ben turns in his real dictated register (source: obsidian-vault/ben-vault journals) |
| coaching/01..06 + coaching-map.md | ~130 corpus items, 15 distilled coachable behaviors (eval seeds) |
| personas/catalog.md | 30 candidates; approved eight: Abrahams, de Montebello, Boz, Kao, Cohn, Rumelt, Mann, Evans |

## References (leaders / instructions we call on)

| reference | where | used for |
|---|---|---|
| Hamel Husain evals-skills | sources/evals-skills (cloned repo) | the entire rubric v2 method; judge validation path |
| Ben's ai-notes vault | ~/Documents/work/ai-notes/08-evals-and-verification/ | independent confirmation + analysis-first, run-level evals, multi-judge consensus; voice notes absent (flagged gap) |
| model prompting research | references/model-prompting-research.md | per-model steering/guarding for every model we call |
| calling other models | references/calling-other-models.md | exact Codex/Grok invocations, judge-diversity rules |
| Pipecat docs | references/voice/pipecat-notes.md (mined from docs.pipecat.ai) | voice-phase architecture; how the harness reshapes without touching the eval loop |
| voice cost report | references/voice/stt-tts-cost-report.md (+ canvas/voice-stack.html visual) | STT/TTS choice and per-session math; three workers (2× Sonnet, 1× Codex), disagreements shown |
| Codex delegation package | ~/Documents/Codex/2026-07-16/.../use-codex.md + skills | codex exec invocation shape used by judge.mjs |
| Lenny corpus | council/sources/lenny-knowledge-graph-vault | all persona and coaching grounding |

## How other models are leveraged (current reality)

- **DeepSeek v4 flash**: the production brain being calibrated. Never judges anything (a model must not judge itself).
- **Claude (this thread, Fable/Opus)**: orchestrates, edits prompts, writes decisions. Primary judge via `claude -p --model claude-fable-5` (pinned).
- **GPT-5.6 terra via Codex CLI**: second judge (`judge.mjs --judge codex`, verified working 2026-07-18: 5/6 agreement with Claude on the first double-judged run). Also available for grunt execution and image generation per the reference doc.
- **Sonnet subagents**: corpus mining and drafting; output reviewed here before landing.
- **Grok/Imagine**: media generation backup only; preflight keys before promising.
- Rules that hold everywhere: judges see nothing minable, judge models are recorded in every eval.json, delegated output is reviewed, keys never enter transcripts.
