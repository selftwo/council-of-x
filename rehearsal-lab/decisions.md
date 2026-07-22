# Decisions

Source of truth for the lab canvas. `canvas.mjs` renders this file plus the runs folder.
Format: `## now` is the current focus list. Each decision is `### YYYY-MM-DD — title` with a body; an optional line starting with `impact:` gets highlighted.

## now

- lab frozen 2026-07-20: all new work happens in ../onthespot (see the closing entry below)

## decisions

### 2026-07-20 — Lab frozen; the product is now onthespot

Ben delivered the working-backwards press release and made the reshape calls (recorded in ../onthespot/decisions.md). The product is **onthespot**: difficult conversations and situations, think and navigate gracefully. V1 is a local web chat (Wispr Flow dictation in, text out) with per-message timestamps, a soft timer, pause analysis from local ASR on the Wispr Flow audio, and two rubrics per session (the persona rubric from here, plus a new practicer rubric measuring Ben). Ben handwrites the scenarios fresh; the approved queue here is scrapped as a queue and kept as raw material. Named personas survive but each needs a mined dossier before scenarios get built around it. Voice (the stack researched here) is V2; video is V3.
impact: this folder stops taking new work. The harness, rubric v2, coaching map, persona catalog, and voice research carry into onthespot as imports or references; runs/ and this log stay as the research record.

### 2026-07-18 — Text first, voice later

Gemini dropped entirely (TTS and STT); no more time on free-tier voice. Phase order: calibrate the DeepSeek v4 flash brain with text-only runs and evals, then bring Pipecat plus a paid voice API (ElevenLabs or Cartesia, Ben pays). Quality over free.
impact: the voice prototype at prototypes/rehearsal-voice is now a legacy testbed; all new work happens in rehearsal-lab.

### 2026-07-18 — The calibration loop is the product for now

spar.mjs (conversation vs DeepSeek) → judge.mjs (Claude via subscription scores against evals/rubric.md) → apply the judge's prompt fixes → rerun. A scenario counts as calibrated at ≥4/5 on all rubric dimensions across two consecutive runs.
impact: first loop already caught real defects (em dash leakage, stacked questions, debrief silent on pacing) and the fixes are in the prompts.

### 2026-07-18 — Scenario picks approved

Ben picked 10 of the 15 proposals in scenarios/proposals.md: A1 skip-level ambush, A3 the cold call, B6 hot-take sparring, C8 the steamroller peer, C9 the slipping date, D11 the promo case, D12 the interview gauntlet, D13 the negotiation, E14 the 60-second drill, E15 explain it to a sharp outsider. Not picked: A2 ("why not just use ChatGPT?"), B4 ("AI kills the PM role"), B5 the skeptic CTO, C7 stakeholder pushback / Rajan (already built separately), C10 no to a pet feature.
impact: build queue is fixed in that order; each becomes a real scenario file grounded in the coaching map and run through the calibration loop before the next one starts.

### 2026-07-18 — Persona shortlist approved

Ben approved the recommended eight from the 30-candidate catalog: Matt Abrahams, Tristan de Montebello, Boz, Wes Kao, Alisa Cohn, Richard Rumelt, Benjamin Mann, Ethan Evans. Progression: warm up with de Montebello and Abrahams, content rounds with Rumelt, Mann, Cohn, stress-test with Boz.
impact: new scenario files get built around these eight, grounded in coaching/ extracts.

### 2026-07-18 — Every run is a visible artifact

Each run lives in runs/<id>/ with the transcript, an exact snapshot of the prompt that ran (versioned by hash), the judge's eval, and a generated report.html showing what happened, the stream, and what changed since the previous run. The canvas at canvas/index.html indexes runs, decisions, and files. Design register follows Ben's mono OS (localhost:4780).
impact: Ben can verify any claim about a run by opening its report; nothing exists only in chat.

### 2026-07-18 — Mocked Ben turns come from his own dictation

Scripted practice turns are written in Ben's actual spoken register, drawn from his Obsidian vault (ben-vault journals, Wispr Flow transcripts): loops, restarts, "right, sort of", buried points. Evals of the persona's diagnosis quality are only meaningful if the input sounds like him.
impact: turns-samples/ files imitate real failure modes, not clean prose.

### 2026-07-18 — Eval system rebuilt on the evals-skills method (rubric v2)

Adopted Hamel Husain's evals-skills doctrine (cloned into sources/evals-skills) after Ben pointed to it, cross-confirmed by Ben's own ai-notes vault (08-evals-and-verification). Changes: 1-5 Likert scores replaced by six binary failure-mode judges with critique-before-verdict and few-shot examples from our real runs; everything countable moved to deterministic code checks (harness/checks.mjs); judge model pinned (claude-fable-5); a second judge from a different lab (GPT-5.6 terra via Codex CLI) runs the same rubric, and disagreements are flagged for Ben, whose calls accumulate as labels for proper TPR/TNR judge validation later. Deviation noted: all six judgments run in one call per judge (latency), not one call each; split if verdicts look correlated. First double-judged run: 5/6 agreement across labs, the split was capitulation_unchallenged.
impact: judge noise stops driving prompt iteration; code catches character/question/length violations for free; "calibrated" now means all hard checks pass plus all six modes pass, twice consecutively.

### 2026-07-18 — Other models as workers and second judges

References landed: references/model-prompting-research.md (Ben's per-model steering research, July 2026) and references/calling-other-models.md (exact invocations). Codex (GPT-5.6) is wired and verified as second judge and available for grunt execution and image generation; Grok/Imagine is media backup. Rules: judges see nothing minable, DeepSeek never judges itself, delegated output gets reviewed, judge models recorded in every eval.
impact: eval verdicts no longer depend on one lab's model; delegation paths for mechanical work exist without adding orchestration complexity.

### 2026-07-18 — Findings from calibration runs 2 to 4 (shreyas-sparring)

Three loop iterations on one turns file (mocked Ben, publish-or-not topic). Cured: reply truncation (v4 flash reasoning was draining max_tokens; harness now disables thinking, which also cut first-token latency from ~4s to ~1.5s) and the em dash leak (fixed only once the rule targeted the source, definitions attached with punctuation, not just the character). Still open: complimenting openers survive the ban lists (the model routes around named phrases), and the anti-flattery pressure in v4 squeezed out framework naming entirely. Also observed: judge scores vary between passes on similar behavior, so single-pass scores are directional, not precise.
impact: next prompt round should merge the compliment rule into a positive instruction (open with substance) instead of longer ban lists, and the calibrated bar should be measured with a pinned judge model.

### 2026-07-18 — Voice stack researched: Pipecat split pipeline, Deepgram + Cartesia default, speech-to-speech ruled out

Three independent workers (Sonnet on Pipecat docs, Sonnet on pricing, Codex GPT-5.6 second opinion) researched the voice phase. Findings: Pipecat's architecture preserves the whole eval loop (per-turn transcript events map onto our transcript.jsonl; checks.mjs and both judges run unmodified on voice runs; a thin Python voice/bot.py joins the Node harness, Node stays source of truth for prompts and versions). The ai-notes-mandated comparison with speech-to-speech (OpenAI Realtime) is done and Realtime is ruled out: the brain must stay DeepSeek (calibrated prompts), and Realtime is also slower to first audio, lower-rated on voice quality, and 7 to 15x the cost. Cost per 2-minute session at Ben's 70/30 talking split: $0.03 to $0.16 for every sensible stack, so voice feel decides, not cost. STT pick: Deepgram Nova-3 ($0.0048/min, $200 free credit, both workers agree, Pipecat's own default). TTS default: Cartesia Sonic 3.5 (~$0.038/1k chars, Pipecat default, Codex pick), with a flagged disagreement: the pricing agent ranks Inworld TTS-2 first (cheapest and most consistently top-ranked for human-ness) and flags Hume Octave for its emotion steering. Resolution method: a fixed 20-line pushback-line audition script, Ben's ear decides. Build-time verification item: Pipecat's DeepSeekLLMService must pass through thinking-disabled or we subclass it.
impact: the voice phase has a concrete build plan and a cost ceiling of pennies per session; the eval loop needs no redesign for voice; the only open decision is which voice wins the audition.

### 2026-07-18 — Model roles

DeepSeek v4 flash is the production brain (cheap, fast, prompt-cached). Claude (subscription, `claude -p`) is the judge. Fable/Opus in this thread runs the loop and edits prompts. Sonnet subagents may draft docs or mine the corpus; anything a subagent writes gets reviewed here before it lands.
impact: cost stays near zero during calibration; judgment quality stays high.
