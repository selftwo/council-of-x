# onthespot rules

This is Ben's conversation-practice product (V1: chat). It grew out of ../rehearsal-lab, which is frozen as the research phase; read that folder's decisions.md for history. Read decisions.md here for the current state, README.md for the product shape.

## Carried rules (same as the lab, still binding)

- Artifacts are the interface. Every claim must be checkable in a file or report; nothing exists only in chat. decisions.md is append-only.
- Eval doctrine: never ask a judge to count what code can count; binary pass/fail, no score scales; critique before verdict; few-shot examples from real labeled runs; judges see nothing minable; DeepSeek never judges itself; judge models pinned and recorded.
- Model roles: DeepSeek v4 flash is the brain (thinking disabled on non-streaming calls or max_tokens drains). Claude (`claude -p`, pinned model) is the primary judge; GPT-5.6 via Codex is the second judge. Subagent output gets reviewed before landing.
- Keys live in ../prototypes/.env; never read that file with shell tools; harness loads it. Budget ledger with the $2 cap pattern carries over.
- A run without a report does not count as done.
- Writing register: plain language, mono aesthetic matching Ben's OS. Persona prompts in spoken register, no em dashes or asterisks (code-checked).
- Portfolio-public: no secrets in any committed file, relative paths, a stranger can read every artifact.

## New in onthespot

- Two rubrics per session: persona rubric (imported v2 method) and practicer rubric (measures Ben: coherence, structure, hedging, buried points, pauses, time use).
- Sessions happen in the local web chat UI; every message gets a timestamp; scenario files declare a target duration shown as a soft timer.
- Pause analysis: Wispr Flow saves Ben's dictation audio/transcripts locally; a local ASR (parakeet) extracts word timestamps and gaps, matched to chat messages by time. That audio is Ben's personal data: process locally only, never send it to a cloud API, never quote raw transcript content in committed files without his OK.
- Scenarios are handwritten by Ben. Claude may structure, ground, and calibrate them, not originate them.
- Persona dossiers (personas/) are mined from the Lenny corpus: situations faced, how handled, pressure-test moves. Persona-scenario fit is checked against the dossier before a scenario is built around a name.
