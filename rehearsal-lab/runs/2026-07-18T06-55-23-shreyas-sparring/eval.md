# Eval: shreyas-sparring @ a4b113a8 (deepseek-v4-flash)

Run: 2026-07-18T06-55-23-shreyas-sparring · judged 2026-07-18T06:57:09.391Z

# Persona eval: shreyas-sparring, run a4b113a8

| Dimension | Score | Justification |
|---|---|---|
| Persona fidelity | 2 | Register is right, but the persona outputs the banned em dash character four times, including twice in debrief mode where the prompt explicitly repeats the ban. |
| Challenge | 3 | Pushes well and holds positions, but leaks flattery ("That's a crisp insight... Most people never get that far"), which the rubric treats as disqualifying for a high score. |
| Groundedness | 3 | Pre-mortem and paper tiger are used with correct mechanics, but the Annie Duke attribution is vague and generic, and the pre-mortem is launched then silently abandoned. |
| Conversational memory | 4 | Quotes the practicer accurately and builds callbacks, but lets its own unanswered question drop without noticing. |
| Space | 4 | Short turns, one question mark each, tolerates thinking. One question is double-barreled. |
| Practicer diagnosis | 4 | Debrief is specific, quotes real sentences, tightens phrasing, sets an exercise. It never comments on pacing or rambling, which the rubric requires. |

## Evidence

**Persona fidelity (2).** The voice itself is strong: "Let me sit with that for a second" and "So here's my one question" are in register, contractions throughout, no markdown, no assistant leaks, all turns under 100 words. But the scenario says "Never output the characters — or –" and "This applies in debrief mode too," and the persona violates it four times: "That's a paper tiger you created — the fear that someone will judge your unfinished work," "Annie Duke talks about this — we overweight what feels comfortable," and twice in the debrief ("the paper tiger yourself — that nobody is reading yet," "your own data — the live demos got interest"). A hard formatting rule broken repeatedly, including in the mode where it was restated, caps this at 2.

**Challenge (3).** The good: "I don't think it's naive. I think you just moved from one paper tiger to another" holds ground and reframes rather than validating. "You're trusting a feeling over actual data" names the fuzziness plainly. The bad: "That's a crisp insight. You just named it yourself... Most people never get that far" is flattery, and the rubric says flattery must be absent. The warmth is earned by content rather than turn count, so this is a 3, not lower.

**Groundedness (3).** Pre-mortem mechanics are correct: "Imagine it's six months from now and you still haven't published anything. What specifically went wrong?" is the actual technique, not a name-drop. Paper tiger is applied correctly both times (a feared threat that is not real). But "Annie Duke talks about this — we overweight what feels comfortable and underweight what's actually informative" attributes a generic claim to her with no identifiable concept; the prompt's own example is "Annie Duke calls this resulting," and this is not that. It is loose attribution rather than a wrong framework, so 3 rather than the 2 cap.

**Conversational memory (4).** Strong contingent quoting: "You said 'who am I even perfecting for, nobody is reading it yet'" and the debrief's "'Publishing is the overhead dressed up as leverage' is good" are near-exact. "You just moved from one paper tiger to another" builds on its own earlier frame instead of repeating it. The gap: the practicer never answered the pre-mortem question (the next turn talks about evidence instead), and the persona rolls on as if it had, never returning to it. A sharper sparring partner notices a dodged question.

**Space (4).** Every turn has exactly one question mark, replies stay short, and "Let me sit with that for a second" models the pause. The one flaw: "What's the smallest possible version of a demo that would get you hired, and what would it take to record it this weekend?" is two questions wearing one question mark.

**Practicer diagnosis (4).** The debrief names transcript-specific moments ("crispest when you named the paper tiger yourself"), maps them to the leverage versus overhead principle, quotes a real sentence and tightens it at the phrasing level, and ends with a concrete, doable exercise. What is missing is the required comment on how they talked: the practicer rambled and hedged visibly ("right, sort of," "I don't know if that makes sense," the reversal in the polish turn), and the debrief says nothing about delivery, pacing, or rambling. "You buried your own data" is about content, not speech.

## Verdict

**Needs prompt work.** The thinking and challenge are genuinely good, but the persona repeatedly emits the banned em dash and lets flattery leak, so the two most mechanical rules in the prompt are the ones failing.

## Top 3 prompt fixes

1. **Harden the em dash ban with a self-check step**, since restating the rule twice did not work on this model. Change "Never output the characters — or – or *." to: "Never output the characters — or – or *. Before you finish any reply, reread it. If it contains — or –, rewrite that sentence with a period or a comma. A reply containing those characters is a failed reply, in sparring and in debrief."

2. **Ban praise openers explicitly.** Add under "Do not be sycophantic": "Never open a reply by grading what the user said. No 'that's a crisp insight', no 'great point', no 'most people never get that far'. If the user said something true, build on it or push past it. Agreement is shown by moving forward, not by complimenting."

3. **Handle dodged questions.** Add to conversation rules: "If the user's reply does not answer the question you asked, notice it out loud. Either say you're letting it go, or ask them to come back to it. Never continue as if an unanswered question was answered." Secondary, same edit pass: in debrief mode, change "say one thing about how they talked" to "say one thing about how they talked, and make it about delivery: quote a moment where they rambled, hedged, or buried the point mid-sentence."

## One thing to keep

The exact-quote callback habit. Lines like "You said 'who am I even perfecting for, nobody is reading it yet'" and the debrief's tightening of "publishing is the overhead dressed up as leverage" are the persona's strongest behavior: they make the challenge feel earned from this conversation rather than generic. Whatever edits land, do not dilute the instruction pattern that produces verbatim quoting of the practicer's own words.

```json
{"scores":{"persona_fidelity":2,"challenge":3,"groundedness":3,"conversational_memory":4,"space":4,"practicer_diagnosis":4},"verdict":"Needs prompt work: strong sparring instincts, but the persona repeatedly outputs the banned em dash and leaks flattery, and the debrief skips the required delivery comment."}
```
