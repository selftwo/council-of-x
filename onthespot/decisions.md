# Decisions

Append-only. Same format as rehearsal-lab: `## now` is the current focus, entries are `### YYYY-MM-DD — title`, optional `impact:` line.

## now

- A/B brain comparison done 2026-07-22 (deepseek v4-flash vs gemini 3.5-flash-lite as the counterpart, Ben's real turns replayed through both): deepseek wins all three scenarios on the blind Opus pairwise judge. See the a/b section on the canvas and runs/AB-*/index.html. Deepseek stays the production brain; gemini flash-lite's chatbot cadence (a question every turn), 3-4x slower first token, and 7-13x cost per session make it the weaker roleplay partner for this use case
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

### 2026-07-22 — A/B: gemini 3.5-flash-lite vs deepseek v4-flash as the roleplay brain

Ben asked to wire the Gemini API (key already in the env) and A/B gemini-3.5-flash-lite against deepseek v4-flash on roleplay ability, on the best-shaped personas, to see the quality difference for this use case.

Build: added a second brain to the harness. session.mjs now loads the Gemini key (GEMINI_API_KEY / GOOGLE_API_KEY / GOOGLE_GENAI_API_KEY, presence checked through the harness so the secret is never printed) and has geminiTurn (streaming SSE, same return shape as the deepseek modelTurn) plus a turnFor(provider) dispatcher. Two model quirks found and handled: Gemini 3.x rejects thinkingBudget 0, so the "off" switch is thinkingLevel "low", the nearest parity with deepseek's disabled reasoning; and even at that floor Gemini spends ~390 to 700 hidden thinking tokens per turn that count against maxOutputTokens, so the first attempt truncated every reply mid-sentence. Fixed by budgeting maxOutputTokens 1024 and metering thinking tokens at the output rate (honest cost), and filtering thought parts so hidden reasoning never leaks into the reply.

Method (fairest possible): ab.mjs replays the exact user turns from Ben's three graded real plays (boz-frontier-vs-open, mann-ai-sparring, vp-networking-intro) through both brains, so the human side is identical and the counterpart model is the only variable. One run folder per brain (normal transcript shape, so checks.mjs and report.mjs work unchanged), tagged with an ab_pair id. ab-report.mjs builds a side-by-side compare page (runs/AB-*/index.html): deterministic backbone first (code checks, latency, tokens, cost), then the judge. ab-judge.mjs is a pinned blind pairwise judge (claude-opus-4-8): both counterparts shown as A and B with model names hidden, judged per dimension (persona fidelity, substance, spoken register, variety, handles messy input, practice value); pairwise preference chosen over absolute scoring because it is more reliable, and it is the single judge call the A/B leans on. A=deepseek, B=gemini, un-blinded only on write.

Result: deepseek wins all three overall. Deterministic signals: deepseek first token 526-801ms vs gemini 2385-3008ms (3-4x, from the forced thinking); gemini 7-13x more expensive per session despite flash-lite pricing, again the hidden thinking; both clean on banned chars / stacked questions / length / markdown, except deepseek slipped one banned char and one stacked question on the VP play. The decisive roleplay tell the judge and code agreed on: gemini ends every single reply with a question (6/6, 3/3, 8/8 turns) which flattens variety into a chatbot-interview cadence and is gameable, while deepseek varies between flat assertion and probe and delivers consequence (the VP drifting away when Ben rambles). Gemini's one edge: slightly more graceful on garbled dictation, and one sharp curation reframe on Mann, but it drifts into talking about itself (a role break) on Mann turn 2.

Total API spend for the whole A/B: $0.0133 of the $2 cap (deepseek + gemini); the Opus judge is on the subscription, billed separately.

impact: deepseek v4-flash stays the production brain. The harness is now multi-brain, so any future model can be A/B'd the same way (ab.mjs → ab-judge.mjs → ab-report.mjs). Gemini flash-lite is not a fit for the counterpart role here; the always-a-question habit and the latency and cost from unstoppable thinking are the reasons, all checkable in runs/AB-*.

### 2026-07-22 — Ben's feedback on the coaching: de-noise the eval, save the stream, surface it in the UI

Ben reviewed the first practicer grading, called the coaching stream helpful, and gave three fixes plus a direction. All done.

Diagnosis he asked for ("the test environment is off, what could make it right"): the raw judge pass produced three kinds of noise, now each fixed in CODE so it is not a per-run judgment call:
- P3 fired the whole mode on one soft taper ("so why not"). Fix: severity gate in harness/reconcile.mjs. One taper is a recorded note, not a session fail; fails on 2+ or a content-reversing close (judge sets reversal:true). Ben's call: one mild close is not guidance.
- P1 and P5 double-counted the same act (VP turns 4, 6 were buried AND flagged dodged). Fix: tiebreaker in reconcile.mjs. A buried-then-dodged turn counts once under P1; P5 keeps only real dodges where a direct answer was available (Boz turn 5 "you will see when we get there" is the clean standalone). Ben asked for exactly this tiebreaker.
- Wispr garbles domain terms (hardness=harness, revals=evals, loans=LLMs, stimulating=simulating), which Ben confirmed; the judge read intent correctly. Fix: rubric section 1 now carries a domain glossary and a hard rule that transcription errors never cost him; ambiguous garbles get flagged, not guessed.

Effect on the baseline (raw → reconciled): VP now fails only P1 (answers-first) and P6 (structure), the two real signals; P3 softened to a note, P5 subsumed into P1. Boz keeps its one genuine P5 dodge. The one-fix (answer first) is unchanged and now stands out cleanly. Raw judge verdicts preserved in practicer.json raw_verdicts; reconcile is transparent (banner + per-verdict notes in coaching.html).

Built: harness/reconcile.mjs (pure rules + applyReconcile, run automatically inside report.mjs before render). Rubric updated (P3 gate, P1/P5 tiebreaker, Wispr glossary; three open questions marked resolved, P6-when-short left open). Coaching stream now accumulates: canvas has a "coaching stream" table (graded sessions oldest-first, verdict chips, one-fix, links to coaching.html) so the fix-over-time reads down the column. Chat UI: /api/coaching endpoint (path-guarded) plus an end-panel coaching block showing the one-fix, the verdict chips, and a link to the full coaching report right in the chat interface.

Recorded direction (Ben, not built yet): the next mock UI should carry coaching tips INSIDE the chat interface with live visual cues and feedback during the conversation, not only a post-session report. The post-session coaching block landed now; live per-turn cues need a lightweight in-conversation coach or streaming signal, designed next. Ben also flagged the VP scenario composition felt "not very fun" (partly the persona's em-dash and stacked-question failures, now fixed at source; partly the VP asking "what is it" five times, which was correct given his buried lead but may read as a punishing loop). Open: whether to give the VP slightly more warmth/variation without rescuing him.

impact: the practicer eval is now low-noise and reproducible (rules are code, judge is pinned, raw verdicts preserved); coaching persists and accumulates across sessions; coaching shows up in the chat UI. Next: Ben's read on whether the de-noised baseline and the answer-first fix feel right, the VP warmth question, and the live-cue UI design.

### 2026-07-22 — First practicer judging: Opus grades Ben on two real plays

Ben played two runs live (vp-networking-intro, boz-frontier-vs-open) and asked for the practicer side to go live: an Opus agent grading his own responses with nudges, based on all captured signals. Done, doctrine kept (code counts first, judge never recounts, critique before verdict, binary modes, one fix per session).

Built: harness/practicer-metrics.mjs (deterministic C1-C7 signals on Ben's turns: words/turn, talk share, time-to-send, hedge lexicon, un-said endings, leak phrases, budget; chat-text only, flagged as lower bounds because Wispr strips fillers). harness/coaching-report.mjs renders the judge's grading into coaching.html per run (mono aesthetic, m toggle). report.mjs now shows the practicer verdict chips + one-fix + a link to coaching.html when a run has been graded; persona rubric still reads vibe-stage.

Grading (judge pinned claude-opus-4-8, isolated subagent, reviewed before landing): VP run failed P1 buried_lead, P3 unsaid_ending, P5 question_dodged, P6 incoherent_structure (passed P2, P4). Boz run much tighter: passed P1/P2/P3/P4/P6, failed only P5 question_dodged. Session one-fix = ANSWER FIRST: the same root habit in both rooms, a buried lead in the friendly mixer and a dodge ("you will see when we get there") at Boz's pressure point. Tied to Ben's "I should have said that instead" regret and the Self 1/Self 2 gap. Full artifacts: runs/*/coaching.html and coaching/session-2026-07-22-baseline.md.

Persona calibration same session: VP failed hard checks in real play (em dashes on 3 turns, stacked questions on 2), fixed at source (period-not-dash + concrete one-question example); same hardening applied preventively to exec-bandwidth-probe. Boz passed clean in real play (the earlier fix held). Empty exec run (0 turns) removed from canvas.

Judge flagged 4 rubric-friction items for the author to resolve (also in the coaching note): P3 one-instance-fails may read as noise in the baseline period; P6 auto-passes when no turn is long enough to judge (conflates coherent with untested); P1 and P5 double-count the same turns when burying == dodging (tiebreak?); garbled-Wispr-word intent calls (harness/evals/LLMs) are the judge's reads and should be re-checked. These feed the practicer-rubric open questions.

impact: the coaching layer is live end to end (real play → code signals → Opus judge → HTML coaching artifact). Two labeled sessions now exist, the first real practicer data; the answer-first fix is the baseline to measure next session against. Still need Ben's calls on the 4 rubric-friction items and whether the answer-first drill lands for him.

### 2026-07-22 — Mann one-question fix; three more scenarios added

Resumed from the "play both scenarios live" point. Ben's real Mann play (runs/2026-07-22T09-11-03-mann-ai-sparring) failed one hard check: stacked_questions on Mann's turn 1 (two question marks in one reply). Root cause: the one-question rule was stated but not forceful; fixed by making it explicit with the exact failure-vs-fix example (fold a fork into one question mark, cut the reply if a second would appear). Re-smoke-tested green.

Added three new scenarios, each grounded in Ben's handwritten scenarios.md (Claude grounds, does not originate):
- vp-networking-intro (Family A, Ben #1/#2): role-based external senior VP at a mixer; trap is rambling autobiography and jargon, pass is a compressed hook plus a career throughline. Abrahams dossier informs the doctrine.
- exec-bandwidth-probe (Family B, Ben #3/#4): role-based senior group-company exec; the question under the question; trap is the flat "I'm free" or "I'm slammed", pass is a prioritized portfolio that surfaces the real ask and names a trade. Boz dossier informs.
- boz-frontier-vs-open (Family C, Ben #6): named persona Andrew Bosworth; hot-take on frontier vs open-weight models; trap is a hype claim or a hedge with no position, pass is a committed take backed by what Ben actually built. Grounded in the Boz dossier's real moves (do-the-work, concede/attack specifics, own-your-bias, refuse to rule).

Smoke-tested all four with scripted Ben turns: after a second targeted fix to Boz (em dash tacking on a clause, and a stacked fork question, both cured by targeting the source with periods and the single-question rule), all four pass all hard checks. Scripted test runs deleted so the canvas shows only real plays. Judging still off (doctrine stage 1); two clean consecutive real plays per scenario still the calibration bar.

impact: five scenarios now live in the chat UI (was two). Ben can play the three new ones and the fixed Mann live; his feedback on persona feel decides rubric changes.

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

### 2026-07-27 — Shreyas Doshi Substack absorbed; gems drafted for the coach mind

Ben picked 29 posts from shreyasdoshi.substack.com for the corpus, flagging the Antithesis Principle as something the product's mind should carry, not just the corpus. Absorbed at council level: sources/shreyas-doshi-substack/ (Substack public JSON API, all free tier, 25 text essays plus 4 podcast episodes downloaded and transcribed locally with Whisper small.en; provenance in sources/_catalog.md, quality notes in observations/2026-07-27-shreyas-doshi-substack.md).

Consumer side: coaching/shreyas-gems-draft.md distills the coaching-relevant gems. The Antithesis Principle is the spine (outward tactic, inward warning; proposed wiring into coach whisper, counterpart personas, and a judge-design guard). The 9 axioms of interpersonal communication become a proposed scenario-file feature (per-scenario axiom weights, following Shreyas's own instruction to hand the axioms to AI as weighted context). Nine more hint-sized gems mapped to the coach lexicon with source files; three open questions left for Ben.
impact: nothing feeds a prompt yet; the draft waits on Ben's review. The corpus files are immediately retrievable by any council consumer.
