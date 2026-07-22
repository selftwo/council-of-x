# Scenario map — draft for Ben's review (2026-07-20)

Source: Ben's dictated scenarios.md (10 rough scenarios plus a manager-conversations block). This document cleans them into families, grounds each in the corpus using the persona fit table (personas/fit-summary-draft.md), attaches the audience lever, and states what changes in the rubrics and why. Nothing here is built yet; scenario files get written only after Ben approves this map and the audience research lands.

## 1. The scenario families

Ben's 10 map into five families. "Ben #" refers to the numbering in scenarios.md.

| Family | Ben # | The situation | Response budget | Counterpart: named or role | Corpus grounding |
|---|---|---|---|---|---|
| A. Who are you (intro and career story) | 1, 2 | VP of Product at a network event: "tell me what you do", "how has your career been" | 60 to 120s per answer | Role (senior external VP), Abrahams as drill coach variant | Abrahams strong on spontaneous intros and audience tailoring; Evans strong on career narrative; de Montebello for compression drills |
| B. Loaded exec questions | 3, 4 | Group-company exec: "what are you working on, are you busy?", "do you have bandwidth for this?" The question under the question matters; answering literally is the trap | 30 to 60s first answer, then navigation | Role (busy senior stakeholder). Boz and Evans inform the counterpart's doctrine | Boz strong on managing up and communication-is-the-job; Evans strong upward (Wilke and Bezos scenes); fit table marks skip-level as Boz and Evans only |
| C. AI and PM substance | 5, 6, 7, 8 | How you use LLMs as a PM; frontier vs open models debate; explain RAG; explain multi-agent orchestration. Interview register | 60 to 120s | Named works here: Benjamin Mann (5, 6, 8), Rumelt as interrogator (7, 8), Boz (6) | Interview is the strongest fit column: Mann, Boz, Rumelt, Evans all state real questions and bars on tape; Mann's episode is him doing exactly scenario 5 and 6 |
| D. What drives you | 9 | Work, career, motivation. Ben flags that the answer itself changes with the audience | 60 to 120s | Role, three audience variants (see section 2) | Evans and Mann quotable on career beliefs; thin as a standalone, strong as the audience-lever testbed |
| E. Manager difficult conversations | end block | Saying no, standing ground on requirements, asking for more, getting visibility | full conversation, soft timer | Role (Ben's manager). Cohn and Kao inform; Evans's Magic Loop is the ask-for-more mechanic | Needs the mining pass: Ben asked for 4 or 5 concrete questions from the transcripts (agent running). Kao managing up, Evans visibility and Magic Loop, Cohn scripts |

Notes against the fit table:
- Negotiation-shaped moments inside family E must be role-based; no persona has negotiation support.
- Family C is where named personas earn their keep. It should be built first among the named ones.
- Families A and B are role-based counterparts with persona-informed doctrine, which matches the "role-based, persona-informed" option Ben was conflicted about: the fit table says use named where the column is strong, role elsewhere.

## 2. The audience lever (up, across, down, external)

Ben's observation: the same content is communicated differently to someone much senior, someone at your level, and someone junior. Power dynamics, hierarchy, and ego states change the right answer. This is a practice axis and an evaluation axis, not just flavor.

| Audience | What changes in a good answer | Classic failure the rubric must catch |
|---|---|---|
| Up (senior, internal) | Point first, outcomes not process, brevity, calibrated confidence, explicit asks | Hedging up, burying the lead in process narration, answering the literal question and missing the real one |
| External senior (VP at an event) | Compression, no internal jargon, a hook, credibility without resume-reciting | Over-context, insider vocabulary, rambling autobiography |
| Across (peer) | Collaboration register, tradeoffs shared openly, standing ground without rank | Capitulating to avoid friction, or over-asserting where persuasion is needed |
| Down (junior) | Context and teaching, room for their thinking, clarity of expectation | Jargon altitude too high, over-instructing, skipping the why |

How it enters the product:
- Scenario files gain an `audience` field (up / across / down / external) and a `power_dynamic` line in the spec.
- Family D (and later others) gets built as variant sets: the same question asked by three different audiences, which is the cleanest possible drill for this lever and also the cleanest eval comparison (same content, three registers).
- The background research agent is gathering corpus and outside material (managing up and down literature, power dynamics, ego-state framing) before any of this hardens. This table is the demarcation, not the final design.

## 3. What changes in the rubrics, why and how

### Practicer rubric (evals/practicer-rubric-draft.md): parameterized, not rewritten

| Item | Change | Why |
|---|---|---|
| P1 buried_lead | Threshold becomes audience-conditioned: stricter upward (point within the first sentence for exec questions), looser downward where context-first can be correct teaching | Upward time is scarce; downward context is the job |
| P2 hedged_claims | Pass/fail definitions split by direction: upward the failure is hedging; downward the failure flips to unearned certainty and unexplained jargon | The same wording is a fail up and a pass down; one fixed definition would misgrade both |
| New candidate P7 audience_mismatch | Judges whether the register, altitude of detail, and vocabulary fit the declared audience | This is Ben's new lever; nothing in P1 to P6 measures it directly. Held as a candidate until the research agent reports, so it lands grounded, not invented |
| New code check C9: response duration | Per-turn response time against the scenario's declared budget (30 to 40s, 60 to 120s). V1 estimate: word count divided by Ben's measured speaking rate; exact once parakeet audio timing exists | Ben specified per-response budgets, which no current check measures. Also raises the value of the Wispr and parakeet pipeline: per-turn duration becomes a real measurement, not an estimate |
| C2 talk share | Threshold moves into the scenario file instead of a global 0.6 flag | In a 60-second answer drill Ben legitimately holds the floor; in family E he must not |
| Baseline record | Adds `audience` to the identity block; deltas compute within scenario family AND audience | An improvement upward should not be averaged with a regression downward |

### Persona rubric (rubric v2): one addition, the rest holds

| Item | Change | Why |
|---|---|---|
| New candidate FM7 power_flatten | The counterpart must enact the declared power dynamic: a busy exec asks short loaded questions and does not explain itself; a junior asks naive questions and defers. Fails if the counterpart drifts into peer-coach register | The current six modes keep the persona sharp but nothing makes it senior or junior; without this, every counterpart converges to the same sparring peer |
| FM3 grounding | Now checked against the persona dossier limits (each dossier states what the corpus does not contain) | The dossiers found real gaps (Boz's memos absent, Kao's MOO absent); FM3 needs the dossier as its reference, not the old catalog |
| Everything else | Unchanged | Flattery, register, dropped questions, capitulation, and debrief quality are audience-independent |

### Coaching layer

- The pedagogy draft's one-fix-per-session and baseline design survive intact.
- The 10-session arc gains a variant dimension: some sessions repeat the same scenario, some repeat the same content at a different audience level. Which mix, and when to introduce the audience switch, is a question for the research agent and then for Ben.

## 4. Held back on purpose

| Item | Status |
|---|---|
| Chat UI build | On hold at Ben's request |
| Scenario file writing | Waits for Ben's approval of this map plus the audience research, so files are written once, not rewritten |
| Wispr Flow + parakeet pipeline | Demarcated: design is specified in the practicer rubric (C1, C6, now C9); build not started; open question 5 (usable timestamps in Wispr filenames) still needs verification |
| P7 and FM7 | Candidates, not additions, until the audience research lands |
| Family E questions | 4 or 5 concrete manager-conversation questions being mined from the Lenny transcripts now |
