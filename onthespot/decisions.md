# Decisions

Append-only. Same format as rehearsal-lab: `## now` is the current focus, entries are `### YYYY-MM-DD — title`, optional `impact:` line.

## now

- Ben delivered 10 rough scenarios (scenarios.md, 2026-07-20) plus the audience lever (same content up / across / down / external changes the right answer); mapped into 5 families in scenario-map-draft.md, pending his review
- audience research done 2026-07-20 as drafts, reviewed, pending Ben: coaching/audience-calibration-research-draft.md (verdict: add P7 audience_mismatch and FM7 power_flatten, with full pass/fail definitions; TA ego states kept as shorthand only, weak evidence base) and scenarios/family-e-questions-draft.md (E1 Friday drop, E2 date vs requirements, E3 promo not-this-cycle, E4 comp, E5 invisible work; E4 flagged thinnest grounding)
- Ben read the map, rubric, and research drafts (2026-07-20) and said go: build the chat UI, vibe-loop two scenarios per the recommended approach, deliver detailed HTML run artifacts for his review; his feedback then decides what changes in the rubrics
- V1 harness LIVE: `node harness/server.mjs` → http://localhost:4795/ (chat UI, timestamps, soft timer); vibe loop run to green on both scenarios (see 2026-07-20 entry below); latest reports: runs/2026-07-20T08-00-17-mann-ai-sparring and runs/2026-07-20T07-58-55-e1-friday-drop
- Ben: play both scenarios live in the chat UI, review the reports and canvas, give feedback on persona feel + what the reports should add; then rubric changes get decided
- Wispr+parakeet stays demarcated (spec in practicer rubric C1/C6/C9, not built); judging stays off until the vibe loop settles (doctrine stage 1); second clean consecutive run still needed on both scenarios before anything is called calibrated
- Ben: review the drafts: personas/*-dossier-draft.md, coaching/pedagogy-research-draft.md, evals/practicer-rubric-draft.md (5 open questions at its end: P3 strictness, P4 audio vs chat feed, hedge lexicon pruning, pause threshold, Wispr timestamp viability)
- workstream 1 (next build): local web chat UI on top of the imported harness, per-message timestamps, visible soft timer; harness import happens inside this build so it lands tested
- workstream 2 done 2026-07-20 as drafts: eight persona dossiers + fit table delivered, reviewed, pending Ben
- workstream 3: Wispr Flow audio location + parakeet ASR with word timestamps, prove pause extraction on one real dictation (also answers rubric open question 5)
- workstream 4 done 2026-07-20 as drafts: pedagogy research + practicer rubric v0 (8 code checks, 6 binary judge modes, baseline record schema; all few-shots TODO until real labeled sessions), reviewed, pending Ben

## decisions

### 2026-07-20 — Product reshape: rehearsal-lab becomes onthespot

Ben delivered the working-backwards press release (see README.md). Grilled in three batches, all calls made:

- Name: **onthespot**. Tagline: difficult conversations and situations, think and navigate gracefully.
- Location: new folder (this one). rehearsal-lab is frozen as the research phase; surviving harness pieces get imported here.
- Scenarios: Ben handwrites fresh ones. The lab's approved 10 (A1, A3, B6, C8, C9, D11, D12, D13, E14, E15) are scrapped as a queue, kept as raw material.
- Personas: named personas stay (no generic averaged executive), but each needs a mined dossier from the Lenny transcripts: situations faced, how handled, pressure-test moves, questioning style. Persona-scenario fit gets checked per scenario against the dossier. Ben remains conflicted on role-based vs named; the dossiers are how we decide.
- V1 interface: local web chat UI. Ben dictates with Wispr Flow into the chat box. No STT/TTS in V1; voice is V2 (stack already researched), video/body language is V3.
- Pacing: both signals in V1. Per-message timestamps in the chat, plus mining the Wispr Flow audio saved on the Mac with a local ASR (parakeet/Nemotron) for word-level timestamps, pauses, and gaps, matched to chat messages by timestamp.
- Time: visible soft timer with a per-scenario target duration; nothing cuts the session off; evals comment on time use.
- Evals: two rubrics, both run per session. Persona rubric carries the rubric v2 method; a new practicer rubric measures Ben (coherence, structure, hedging, buried points, pauses, time use) and becomes the coaching baseline.
- Coaching journey: per-run eval first; baseline and session-over-session progress is designed now, built after a few real sessions.
- Pedagogy sources: corpus and vaults first, then outside research (Matt Abrahams' methodology, deliberate practice literature, exec comms training).
- Ship: V1 is shipped when Ben runs real sessions daily. His sessions are the stage-3 traces. Repo shaped portfolio-public from the start.

impact: rehearsal-lab stops taking new work; its decisions.md gets a closing entry pointing here. The shreyas-sparring calibration history, rubric v2, model roles, budget rules, and voice research all carry forward as imports or references.

### 2026-07-20 — V1 harness built; first vibe loop run to green

Built (main thread wrote session.mjs, server.mjs, and both scenario prompts; a Sonnet worker built the chat UI, vibe runner, checks, report, and canvas to spec and verified end to end): local chat at http://localhost:4795/ with per-message timestamps, think-time logging, soft timer, live word-count against the scenario's spoken budget; scripted runner vibe.mjs; reports with a new deterministic pacing table; canvas index. Scenario spec gained the audience fields (audience, power_dynamic, audience_brief, target_minutes, response_budget_seconds).

Five vibe iterations on two scenarios (mann-ai-sparring @family C named, e1-friday-drop @family E role-based), total spend $0.0036. Cured, each by targeting the source: debrief emitting markdown and em dashes (rule: debrief keeps the spoken register; dashes leak when attaching quotes, so quotes attach with commas or colons); debrief misattribution, the worst find, where Mann credited Ben with a line Mann himself said (rule: quote only Ben's sentences, never credit him with your own move); the E1 manager converting a hedged "I guess I could squeeze it in" into a yes (new ladder rung: a hedged yes is not a yes, ask "Is that a yes?" and wait; verified firing next run); debrief overflowing its word budget (trimmed the spec to one fix one strength; the 400 max_tokens ceiling was being hit); stacked or-fork questions and mild verdict openers like "That's a concrete take" (dilemmas are one sentence one question mark; agreement skips the verdict).

Observed and left honest: single-pass behavior varies between identical runs (different checks flipped on different passes), consistent with the lab's judge-noise findings. Green on one pass is not calibrated; the bar stays all-hard-checks twice consecutively, and the verdict-opener pattern needs the FM1 judge, not more ban lists.
impact: the loop (vibe → checks → report → prompt fix → rerun) works end to end on the new product shape; Ben can now play both scenarios live and his feedback decides the rubric changes.
