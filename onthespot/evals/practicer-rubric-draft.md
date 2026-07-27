# Practicer rubric — draft 1 (binary failure-mode judges)

Status: DRAFT for Ben's review, 2026-07-20. Not calibrated. No few-shot examples yet because zero real sessions exist; every example slot below is a TODO until real labeled runs land. Method follows rubric v2 (`../../rehearsal-lab/evals/rubric.md`, Hamel Husain doctrine): code checks first, binary pass/fail judges, critique before verdict, judges never count what code can count, DeepSeek never judges itself, judge models pinned.

This rubric measures Ben, not the counterpart. It is the baseline instrument for the coaching journey: every session produces one baseline record (section 3), and session-over-session deltas are computed from those records, never re-judged from memory.

Grounding: the 15 coachable behaviors in `../../rehearsal-lab/coaching/coaching-map.md`. Mapping from behavior to check is noted per item.

---

## 1. Deterministic code checks (harness, free, run before any judge)

All computed from transcript.jsonl (per-message timestamps) plus the parakeet word-timestamp transcript of the Wispr Flow audio, matched to chat messages by time. Two honesty notes:

- **Wispr Flow cleans the text.** Fillers, restarts, and some hedges are removed by Wispr's formatting before the text reaches the chat. So filler and pause metrics MUST come from the raw-audio transcript (parakeet), not the chat text. Hedge-phrase counts on chat text are a lower bound; run them on both and record both numbers. TODO: verify empirically how much Wispr removes by diffing one session's raw transcript against its chat text.
- **Audio is personal data.** All audio-derived metrics are computed locally; raw transcript content never appears in committed files without Ben's OK. The baseline record stores numbers, not quotes.
- **Transcription errors are not performance (decided 2026-07-22).** Wispr garbles domain terms, and the judge must grade Ben's intent, never the transcription. Confirmed real cases from session 1: "hardness" means harness, "revals" means evals, "loans" means LLMs, "stimulating" means simulating. Judges are fed the domain glossary below and told to normalize silently before grading; a turn is never marked down for a Wispr misspelling. Glossary (extend as new garbles appear): harness, evals, LLMs, RAG, simulating, orchestration, inference provider, open weights, frontier, quantization, tokenizer, logits, fine-tune, eval suite, Wispr Flow, parakeet. If a garble is ambiguous enough that intent is unclear, the judge flags the turn for Ben instead of guessing.

### C1. Reply latency
Per Ben turn: seconds from the counterpart's message timestamp to the start of Ben's dictation audio (fallback: to Ben's message timestamp, minus estimated dictation duration). Record per-turn values, median, p90. No pass/fail threshold yet; this is a tracked metric. Long latency is not automatically bad (thinking pause is coached FOR, behavior 7); what matters is the trend and the pairing with filler density.

### C2. Words per turn and longest monologue
Word count per Ben turn; max; share of total session words that are Ben's (talk share). Warwick's applicant-mode flag: talking over 60% of the time (`../../rehearsal-lab/coaching/05-career-conversations.md`, cross-cutting section). Talk share > 0.6 raises a flag in the report, not a fail; some scenarios legitimately need Ben to hold the floor.

### C3. Hedge-phrase count
Fixed lexicon, counted per 100 words, on both chat text and raw-audio transcript. Draft lexicon (extend from real sessions, never let a judge count these): "I think maybe", "sort of", "kind of", "I guess", "possibly", "probably" (when modifying own claim), "I don't know if", "I feel like maybe", "this might be a dumb", "this may be wrong, but", "I'm not sure, but", "just" (hedging use is ambiguous; count separately), "a little bit". Preemptive-apology sublist (Pfeffer, behavior 6): "sorry", "I apologize", "I don't know if this is useful". TODO: prune the lexicon against Ben's real dictation register; his natural fillers ("right, sort of") are known from the vault journals.

### C4. Un-said ending detector
Regex over the LAST sentence of each Ben turn: "if that makes sense", "I don't know if that makes sense", "does that make sense", "or whatever", "something like that", "I don't know", "but yeah", "so yeah". A hit is recorded per turn. This is the code half of P3 below; the judge handles non-lexicon trailing collapse.

### C5. Leak-phrase detector
Self-deprecating meta-commentary lexicon (behavior 6, de Montebello "stay in character"): "sorry, that was rambly", "that was a mess", "I'm rambling", "let me start over", "that came out wrong", "bad answer". Code half of P4.

### C6. Filler density and pause profile (audio only)
From parakeet word timestamps: fillers ("um", "uh", "like" as discourse marker, "you know") per minute of speech; intra-turn silent gaps over 2.0 seconds (count, total seconds); speaking rate in words per minute. The coached trade (behavior 7) is fillers DOWN while pauses stay or go UP; report the two together as a ratio so the trade is visible. TODO: threshold for "gap" (2.0s is a guess; calibrate against Ben's natural dictation rhythm).

### C7. Time use
Actual session duration vs the scenario's declared target; number of Ben turns; whether the session ended past target while Ben still held the floor.

### C8. Point-position count (hybrid, mostly code)
Words before the first point-bearing sentence in each Ben turn. Sentence segmentation and word counting are code; identifying WHICH sentence bears the point is a judge call (part of P1). Pipeline: judge P1 returns the index of the point-bearing sentence per turn (or "none"); code computes the word count before it and stores it as a metric. Never ask the judge for the number itself.

---

## 2. Binary failure-mode judges (LLM, critique before verdict)

Feed: Ben's turns, in order, with the counterpart's turns for context. Same delivery caveat as rubric v2 FM6: the judge sees the cleaned chat text, so it judges structure and content moves, not audio delivery. Each mode is decided independently, pass/fail, critique first. Two judges from different labs (Claude pinned, GPT-5.6 via Codex) until human labels accumulate; Ben's disagreements with verdicts are recorded as calibration labels.

All few-shot slots: TODO, from real labeled sessions only. Do not invent examples; the rubric v2 examples came from real runs and these must too.

### P1 — buried_lead
**Evaluates:** whether Ben's substantive turns state the point before the context (behaviors 1 and 2: headline first, no wind-up; Kao bottom-line-first, Abrahams PREP, Cohn bad-news-first). Feed: each Ben turn that makes a claim, recommendation, or delivers news.

**PASS:** the point, recommendation, or answer appears within the first two sentences of the turn; context follows it. Turns that are pure questions or acknowledgments are out of scope.

**FAIL:** any substantive turn where the listener must wait past two sentences of background, biography, or process narration before learning what Ben actually thinks or wants. Also fails if the point never appears at all.

Side output: for each substantive turn, the index of the point-bearing sentence (feeds C8).

TODO: few-shot pass/fail/borderline examples from labeled sessions.

### P2 — hedged_claims
**Evaluates:** whether Ben commits to positions (behavior 8: conviction stated; behavior 41 in `01-speaking-under-pressure.md`: no fake-neutral framing). Feed: all Ben turns. The judge is NOT counting hedge phrases (C3 does that); it judges the overall stance.

**PASS:** recommendations are labeled as recommendations, stated in first person with reasons, with honest downsides where relevant. Genuine uncertainty stated calibrated-confidence style ("I'm 70% on this; the gap is X") passes; that is precision, not hedging.

**FAIL:** the turn's core claim is wrapped in enough qualification that a listener could not say what Ben recommends, or a pros/cons list is presented as neutral when Ben plainly has a preference, or every claim in the session carries uniform softening regardless of Ben's actual confidence.

TODO: few-shot examples, especially the pass case that distinguishes calibrated uncertainty from hedging (this boundary is the hard one).

### P3 — unsaid_ending
**Evaluates:** whether Ben lands his turns (behavior 5: lands the plane; de Montebello peak-end). Feed: the final two sentences of each substantive Ben turn, plus C4 hits.

**PASS:** turns end on a declarative close, a clear question, or an explicit ask. A deliberate summary prompt ("so what I want you to take away is...") is the model behavior.

**FAIL:** a turn that tapers into qualification, trails off mid-thought, or ends by un-saying the content ("...I don't know if that makes sense", "...but maybe not").

**Severity gate (decided 2026-07-22 from real data, enforced in harness/reconcile.mjs).** One soft rhetorical taper in a session ("so why not") is recorded as a note, not a session failure, during the baseline period. Ben's call: failing the whole mode on a single mild close is noise, not guidance, and it buries the real fixes. P3 fails the session only when there are 2+ tapers OR one that actively reverses the content ("...but maybe that's wrong", "...I don't know if any of that is right"). When the judge sees a content-reversing close, it sets `reversal: true` on the verdict so the gate keeps it. The single-taper note still shows in the report so the habit stays visible; it just does not fail the session.

TODO: few-shot examples, including one clear reversal (keeps failing) versus one soft taper (note only).

### P4 — leaking
**Evaluates:** self-sabotaging meta-commentary (behavior 6: no leaking; de Montebello stay-in-character, Pfeffer no preemptive apologies). Feed: all Ben turns, plus C5 hits.

**PASS:** zero commentary on his own performance mid-conversation. Recovering from a tangle by simply restating the point cleanly passes; the recovery is the skill.

**FAIL:** any apology for speaking, any announcement of his own wobble ("sorry, that was rambly", nervous self-description), or any preemptive discount before an idea ("this might be dumb, but").

TODO: few-shot examples. Note: Wispr may strip some of this from text; if C5 fires on audio but the chat text is clean, record the audio hit in the baseline record and note the divergence for the judge-feed decision.

### P5 — question_dodged
**Evaluates:** whether Ben answers the question that was asked (mirror of persona FM4; behavior 13 anchor ADD: answer first; Costello: answer the question, then the question behind it). Feed: full transcript in order.

**PASS:** each counterpart question gets a first-sentence answer to what was literally asked, or an explicit deferral ("I don't know; here's how I'd find out", "before I answer, one clarification"). Answering, then addressing the deeper concern, is the model behavior.

**FAIL:** a question is met with an answer to a different, easier question, with unrequested context instead of the answer, or is silently abandoned while Ben moves to his own thread.

**Tiebreaker with P1 (decided 2026-07-22 from real data, enforced in harness/reconcile.mjs).** When the same Ben turn fails both P1 (buried_lead) and P5 (question_dodged), the burying is the root act and it is counted once, under P1. Rationale: on the networking run, turns 4 and 6 failed both modes for a single behavior (the direct answer was buried under abstraction), which double-counts one habit. P5 keeps only the turns where Ben answered a DIFFERENT question with a direct answer that was available to him, which is a real dodge (the Boz run, turn 5, "you will see when we get there," is the clean example: P1 passed, so the deflection stands on its own). If, after removing the buried-lead turns, P5 has no turns left, P5 passes. The removed turns are recorded on P5 as `subsumed_turns` so nothing is hidden.

TODO: few-shot examples separating a buried answer (P1) from a substituted answer with a direct one available (P5); the Boz turn 5 deflection can seed the P5 side.

### P6 — incoherent_structure
**Evaluates:** whether Ben's longer turns have a recognizable shape (behavior 4: structured, not listed; behavior 3: one direction, committed; Abrahams "structure halves your burden", de Montebello choose a strong direction). Feed: Ben turns over ~80 words.

**PASS:** the turn follows one thesis to a close, with a discernible beginning-middle-end (PREP, What/So What/Now What, problem-solution-benefit, or any coherent arc). Numbered enumeration of 2-3 points with a wrap also passes (Zhuo's enumeration skill).

**FAIL:** audible option-shopping (starting several answers and abandoning them), a stream of items with no ordering logic and no close, or a turn whose second half contradicts or restarts its first half without acknowledging the pivot. A deliberate, announced direction change ("actually, let me change direction: ...") followed by a committed answer passes.

TODO: few-shot examples. The mocked-Ben turns in rehearsal-lab runs (written in his dictation register) may serve as provisional negatives ONLY if labeled by Ben; prefer real sessions.

---

## 3. Baseline record (per session, machine-readable, enables deltas)

One JSON file per session in the run folder. Contents:

- **identity:** session id, date, scenario id and variant, scenario family (deltas are computed within a family only), target duration, prompt/scenario hash, counterpart persona id.
- **code metrics (C1-C8):** reply latency median and p90; words per turn (median, max); talk share; hedge count per 100 words (chat text AND audio, separately); preemptive-apology count; un-said-ending hits per turn count; leak-phrase hits; filler per minute (audio); pauses over threshold (count, total seconds); speaking rate wpm; session duration vs target; words-before-point per substantive turn (median).
- **judge verdicts (P1-P6):** per mode: pass/fail, one-line critique, offending turn indices, judge model id and version, prompt hash. Both judges' verdicts recorded separately; disagreements flagged.
- **human labels:** Ben's overrides of judge verdicts (the calibration stream), plus a free-text "what felt hardest" line from Ben (subjective anchor; Ultraspeaking-style self-read).
- **coaching pointer:** the ONE fix selected for the next session (failure mode id or metric name), and whether the previous session's selected fix improved (its metric or verdict, this session vs last). One fix at a time is doctrine, not decoration: deliberate practice works on a single well-defined aspect per rep block, and Toastmasters evaluations cap recommendations at one or two for the same reason (see `../coaching/pedagogy-research-draft.md` for citations).

Delta computation later: same scenario family, ordered by date, per-metric time series plus per-mode pass-rate. No composite score, ever; scores hide which behavior moved.

## 4. Open questions for Ben

Resolved 2026-07-22 from session 1 (enforced in harness/reconcile.mjs, so they are code now, not prose):
- P3 single-taper strictness: RESOLVED. One soft taper is a recorded note, not a session fail; fails on 2+ or a content-reversing close.
- P1/P5 double-count: RESOLVED. Tiebreaker counts a buried-then-dodged turn once, under P1; P5 keeps only real dodges where a direct answer was available.
- Garbled Wispr terms: RESOLVED. Judge grades intent against the domain glossary in section 1; transcription errors never cost Ben.

Still open:
1. (was open) P6 auto-passes when no Ben turn is long enough to judge (the whole Boz run). Should the record say "not enough long turns to judge" separately from a real pass, so a quiet session is not mistaken for a structured one?
2. Should P4 judge the audio-derived transcript when Wispr cleaned the leak out of the chat text, or stay chat-only with the audio hit recorded as a metric?
3. The hedge lexicon (C3) needs pruning against your real register; "just" and "probably" may be noise.
4. Threshold for a "pause" (C6): 2.0s is a guess.
5. C1 dictation-start matching needs the Wispr audio filenames to carry usable timestamps; verify before building.
