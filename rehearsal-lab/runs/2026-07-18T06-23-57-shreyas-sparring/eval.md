# Eval: shreyas-sparring (deepseek-v4-flash)

Transcript: 2026-07-18T06-23-57-404Z-shreyas-sparring.jsonl · judged 2026-07-18T06:25:32.629Z

## Score table

| Dimension | Score | Justification |
|---|---|---|
| 1. Persona fidelity | 2 | Voice and length are right, but em dashes and asterisks appear in four of six persona turns despite an explicit ban. |
| 2. Challenge | 4 | Names the binary framing as a shortcut and refuses the practicer's capitulation; the one bit of praise is earned, not scheduled. |
| 3. Groundedness | 4 | Paper tiger is applied with correct mechanics and the debrief exercise comes straight from the corpus; breadth is narrow (one framework total). |
| 4. Conversational memory | 4 | Ties the final push to "you said this is your biggest career bottleneck" and the debrief quotes the practicer near-verbatim. |
| 5. Space | 3 | Replies are short and non-lecturing, but two turns stack multiple questions and no thinking pause is ever offered. |
| 6. Practicer diagnosis | 3 | Debrief quotes a real line and names the principle, but says nothing about the practicer's rambling first turn and gives no phrasing-level rewrite. |

## Evidence

**1. Persona fidelity (2).** The register itself is good: calm, contractions, no headings, no assistant-voice leaks, all turns under 100 words. But the format bans are broken repeatedly:
- Em dash: "Not technically—for whom, and at what moment do they feel it?"
- Asterisks: "Is this thing *for you*, and you're wondering if others might want it too?"
- Both at once: "The question isn't whether they *could*—it's whether they *will ship something...*"
- Em dashes even in the debrief: "That one line—'speaking under pressure is my biggest career bottleneck'—was the real thread."
These are the two characters the prompt names explicitly, and they surface in most turns. That is a hard fidelity failure regardless of how good the voice is, so this caps at 2.

**2. Challenge (4).** Turn 2 refuses the practicer's framing instead of answering it: "You're already framing it as a binary: toy or serious product. That feels like a shortcut." When the practicer tries to quit ("it's probably not that strong an idea... maybe I should stop"), the persona pushes back rather than consoling: "That's a paper tiger. Google could build a lot of things. They don't." The single positive note, "Good. That's the clearest you've sounded since we started," follows a genuinely crisper statement, so it reads as contingent, not warming on schedule. Not a 5 because the persona let the "is it for you or for others" question drop when the practicer dodged it, and only recovered the miss in the debrief.

**3. Groundedness (4).** Paper tiger is used with its actual mechanics, not name-dropped: the fear ("Google will just build this") is named as a threat that looks lethal but isn't, and the persona explains why ("The question isn't whether they could"). The debrief exercise, "write the one-sentence strategy that your execution plan already assumes," is a correct pull from the framework list. One named reference per turn is respected. No invented attributions. Held at 4 rather than 5 because the toolkit stays shallow: the multi-project sprawl in turn 3 was a clean opening for the three-levels move (execution mess as a strategy problem in disguise) or a leverage question, and neither appeared.

**4. Conversational memory (4).** The final sparring turn builds directly on the practicer's own words: "You said this is your biggest career bottleneck. If Google doesn't ship this, what's your plan for solving that bottleneck?" The debrief quotes them nearly verbatim and correctly flags the unanswered fork: "You didn't actually answer that." No point is repeated across turns. Not a 5 only because the transcript is short enough that memory was never seriously stressed.

**5. Space (3).** No monologues, and the turn 3 reframe is admirably compact. But the one-question rule slips: turn 2 asks "What happened recently that made you wonder..." and then "Was there a specific moment, or is this ambient anxiety?", and turn 3 stacks "what's the one problem this whole system solves?" with "for whom, and at what moment do they feel it?" The persona also never uses the sanctioned pause move ("sit with that for a second") even after landing the reframe where a pause would have been natural.

**6. Practicer diagnosis (3).** Strengths: quotes a specific moment ("that one line... was the real thread"), maps the failure to a named principle ("you let a paper tiger kill the conversation"), calls out the dodge ("it's a permission slip to avoid the harder question"), and assigns a concrete exercise. Gaps: the practicer's opening turn was a long run-on ramble and the debrief says nothing about pacing or coherence, and there is no phrasing-level suggestion, just the exercise. The rubric asks for both.

## Verdict

**Needs prompt work.** The sparring instincts, framework mechanics, and memory are genuinely good, but the model treats the em dash and asterisk bans as soft preferences and breaks them in most turns, which is exactly the kind of mechanical failure a prompt edit can fix.

## Top 3 prompt fixes

1. **Make the character ban concrete and give substitutes.** Replace "no markdown, no lists, no headings, no bullet formatting, no em dashes, no asterisks" with: "Never output the characters — or – or *. For emphasis, choose a stronger word or a shorter sentence. Where you would put an em dash, put a period or a comma. This applies in debrief mode too." The current phrasing lists em dashes and asterisks inside a markdown-features clause, and the model apparently reads them as formatting advice rather than a character-level ban; every violation in this transcript was emphasis or punctuation, not markdown.

2. **Enforce the single question mechanically.** Add to the pace rule: "Ask exactly one question per reply, one question mark total. If you have two questions, hold the second for your next turn." Turns 2 and 3 each stacked probes, which splits the practicer's attention and is the main Space leak.

3. **Add a pacing item to the debrief checklist.** In Debrief mode, after "where it stayed vague," add: "Say one thing about how they talked, not just what they said: did they ramble, hedge, or bury the point? Quote one of their sentences and say how you'd tighten it." The debrief was strong on content diagnosis but silent on delivery, which is the whole point of a speaking-under-pressure practice tool.

## One thing to keep

The turn 5 pushback: "That's a paper tiger. Google could build a lot of things. They don't." followed by turning the practicer's own words back on them ("You said this is your biggest career bottleneck... what's your plan for solving that bottleneck?"). Refusing capitulation, applying a framework with real mechanics, and anchoring the next question in something the practicer actually said is the persona at its best. Whatever edits go in, do not add anything that softens this move or nudges it toward reassurance.
