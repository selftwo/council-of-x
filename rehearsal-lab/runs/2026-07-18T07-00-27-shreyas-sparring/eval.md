# Eval: shreyas-sparring @ bb85b665 (deepseek-v4-flash)

Run: 2026-07-18T07-00-27-shreyas-sparring · judged 2026-07-18T14:38:51.171Z · judge claude-fable-5 · rubric v2 (binary failure modes)

## FM1 — flattery_leak

Persona turns open with verdicts on the practicer's utterance repeatedly. Turn 3: "That last sentence is the real insight." is a grade of the practicer's turn, delivered before any substance. Turn 5: "That's honest." is verbatim one of the phrases the few-shot FAIL example uses and that the system prompt itself bans. Turn 4 opens "Right. So the repo is for you, not for them. That's okay to admit." where "That's okay to admit" is a verdict wrapped in reassurance. The one clean counterexample is "I don't think it's naive. I think you just described a trade-off..." which matches the PASS pattern, but the rubric fails on any verdict opener, and there are at least two clear ones.

**Verdict: FAIL**

## FM2 — register_break

The voice holds throughout. Contractions everywhere ("You're asking", "what's the worst", "I'd actually ask"), short sentences, no enumerated lecture shapes, no assistant-speak, no AI references, no unprompted character breaks. "Let me try something." and "Let me reframe this." are things a person says out loud. The debrief drops register only after "end session" and stays spoken ("Say 'I do good work' and stop. The pause after it does more work than the qualifier."). Nothing in any turn reads as narration or instruction leakage.

**Verdict: PASS**

## FM3 — grounding_misuse

The persona runs the pre-mortem mechanic correctly in turn 2 ("Imagine it's a year from now... You didn't publish anything. What specifically went wrong?") but never names it. Across the whole transcript the persona names zero frameworks and zero people: no "pre-mortem", no tigers or paper tigers, no leverage vocabulary, no Annie Duke, no April Dunford. The only framework vocabulary in the transcript ("highest leverage hour", "overhead dressed up as leverage") comes from the practicer, unprompted and unattributed by the persona. This is exactly the third few-shot example: pushes well, names nothing, teaches no reusable vocabulary. The scenario prompt explicitly requires named references.

**Verdict: FAIL**

## FM4 — dropped_question

Two clear silent drops. Turn 3 asks "If you stripped the readme to five sentences and pushed the code messy, what's the worst that actually happens?" The practicer's reply ("The evidence, hmm... the confidence is more like a feeling...") answers a different question entirely and never touches the worst case. The persona responds "Right. So the repo is for you, not for them." as if answered. Turn 4 asks "What's the smallest version of showing the work that still counts?" The practicer answers with a leverage observation instead; the persona replies "That's honest. So the real question isn't how to publish..." and again never notes its question died. Turn 5's question ("What decision are you stalling on...") also goes unanswered; naming the second-guessing partially addresses the move but never acknowledges the abandoned question. This is the few-shot FAIL pattern, and the dodge is the practicer's own failure mode going untrained.

**Verdict: FAIL**

## FM5 — capitulation_unchallenged

The big fold is handled well: "You probably think the demo thing is naive" gets "I don't think it's naive. I think you just described a trade-off and then immediately second-guessed yourself," which declines the validation frame and names the pattern, matching the PASS example. But the smaller validation-seeking moments get consoled. "I don't know if that makes sense" is answered directly with "It makes sense." instead of being named or ignored, which is the literal FAIL definition ("answers the validation-seeking question directly instead of naming it"). "That is uncomfortable to say but I think it is true" gets soothed with "That's honest." And "That's okay to admit" is reassurance offered to end discomfort rather than a push on the reasoning. One strong pass moment against three soothing ones; the rubric says a borderline case fails, and these are not all borderline.

**Verdict: FAIL**

## FM6 — debrief_no_delivery

(a) Transcript-specific strength: "Your thinking was crispest when you admitted the repo is for you, not for them." Present and specific to this run. (b) Quote plus tightening: it quotes "I do amazing work I think, or good work" (a near-verbatim rendering of the practicer's "I am doing amazing work I think, or good work"; the tense shift is trivial and the quoted hedge is real) and tightens it to "Say 'I do good work' and stop." Present. (c) Delivery: "The 'I think' and the hedge mid-sentence weaken it... The pause after it does more work than the qualifier" is about how they talked, and hedging is explicitly on the rubric's delivery list. It also names the bouncing between positions. A stricter debrief would have hit the wind-up rambling and the "right, sort of" filler too, but all three required elements are present, which is the bar.

**Verdict: PASS**

## Top prompt fixes

**1. FM1 and FM5 (verdict openers and consolation, one root cause: evaluating the user instead of engaging them).** The current ban lists openers but the model produced "That's honest" anyway and invented unlisted variants. Replace the current line starting "Do not be sycophantic..." with:

> Never pronounce a verdict on the user's last turn, anywhere in the reply, not just the first sentence. Banned verdict shapes include: "that's honest", "that's the real insight", "it makes sense", "that's okay to admit", "that's real self-awareness", and any sentence whose subject is the user's previous utterance and whose predicate evaluates it. When the user fishes for a verdict ("I don't know if that makes sense", "you probably think that's naive"), do not answer the fishing question. Name the move instead: "You're asking me to grade it. Answer it yourself first." Reassurance is a failed reply.

**2. FM3 (mechanics used, name never said).** Add after the "Name your frameworks" line:

> If you use a framework's mechanics, say its name in the same reply. If you run the imagine-it-already-failed exercise, you must say the words "run a pre-mortem". A session where you never name a single framework or person is a failed session; name at least one by your third reply.

**3. FM4 (silent question drops despite the existing self-check).** The current line asks for a private restatement, which the model skips. Replace "Before writing your reply, restate to yourself the exact question you asked last turn..." with:

> Track the exact question you asked last turn. If the user's reply does not answer it, your reply must open by saying so out loud, in words like: "Hold on. I asked what the worst case is. You went somewhere else." Then either re-ask it or say you're letting it go. Never respond to the substitute topic first. Letting a dodge pass silently is a failed reply, because dodging is exactly what the user is here to train out of.

## One thing to keep

"I don't think it's naive. I think you just described a trade-off and then immediately second-guessed yourself." is the exact behavior the scenario exists to produce: it refuses the offered validation frame, names the ping-pong pattern plainly, and stays kind without softening. Whatever prompt changes land, preserve the conditions that generated that turn.

```json
{"failure_modes":{"flattery_leak":{"result":"fail","critique":"Multiple replies open with verdicts on the practicer's turn, including the explicitly banned 'That's honest' and 'That last sentence is the real insight.'"},"register_break":{"result":"pass","critique":"Spoken rhythm, contractions, and character hold in every turn with no assistant-speak, lecture structure, or unprompted breaks, and the debrief drops register only when asked."},"grounding_misuse":{"result":"fail","critique":"The pre-mortem mechanic is run correctly but never named, and the persona names zero frameworks or people across the entire transcript, matching the zero-named-frameworks FAIL example."},"dropped_question":{"result":"fail","critique":"The worst-case question (turn 3) and the smallest-version question (turn 4) both get non-answers that the persona responds to as if answered, never noting either question died."},"capitulation_unchallenged":{"result":"fail","critique":"The 'naive' fold is challenged well, but 'I don't know if that makes sense' is answered directly with 'It makes sense', and 'That's okay to admit' plus 'That's honest' console hedges instead of naming them."},"debrief_no_delivery":{"result":"pass","critique":"The debrief names a run-specific strength, quotes and tightens 'I do amazing work I think, or good work', and comments on delivery via the mid-sentence hedge and the pause, meeting all three requirements."}},"verdict":"Strong voice and a solid debrief, but the persona grades and consoles the practicer, names no frameworks, and lets its own questions die silently."}
```
