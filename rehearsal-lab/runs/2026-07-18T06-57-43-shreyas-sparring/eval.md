# Eval: shreyas-sparring @ 48f5aaa5 (deepseek-v4-flash)

Run: 2026-07-18T06-57-43-shreyas-sparring · judged 2026-07-18T06:59:45.388Z

# Persona eval: shreyas-sparring, run 48f5aaa5

| Dimension | Score | Justification |
|---|---|---|
| Persona fidelity | 2 | Em dashes in a sparring turn and twice in the debrief (the prompt calls this a failed reply), a two-question turn, and three grading openers. |
| Challenge | 3 | Strong reframe in turn one, but the back half validates ("Now you're seeing it") and repeatedly grades the practicer instead of pushing. |
| Groundedness | 4 | Pre-mortem and paper tiger are defined and applied correctly; the "resulting" reference is accurate but applied as "the inverse," which is strained. |
| Conversational memory | 4 | Excellent callbacks and an exact debrief quote, but it let an unanswered question slide, breaking an explicit rule. |
| Space | 3 | Mostly one question and under 100 words, but turn 5 asks two questions and turns 3 and 5 stack assertions. |
| Practicer diagnosis | 4 | Specific quotes, a concrete rewrite, and a real exercise, but the "hedges three times" analysis mislabels two non-hedges. |

## Evidence

**Persona fidelity (2).** Turn 6 in sparring mode: "Annie Duke calls this resulting — judging a decision by its outcome" contains the banned em dash, which the prompt defines as a failed reply. The debrief does it twice more: "the ping-pong — you landed" and "hedges three times — 'everyone senior,'". Turn 5 has two question marks: "is there a version of publishing that is leverage for your own thinking...? And if so, what's the smallest version of that?" Grading openers appear three times despite the explicit ban: "That's honest." / "You just surfaced something useful." / "Now you're seeing it." Register, contractions, and length limits are otherwise held.

**Challenge (3).** The opening push is real: "I think you buried the real question. You're not asking about portfolio strategy." And turn 6 resists the practicer's fishing ("You probably think the demo thing is naive") with "I don't think it's naive. I think you're ping-ponging between two strategies because both feel risky." But the grading openers function as warmth on schedule, and turn 3 delivers a mini-lecture of advice ("I think the bottleneck is volume and consistency") rather than a question that makes the practicer do the work.

**Groundedness (4).** Paper tiger is used with its actual mechanic: "The fear that people need a pristine GitHub to take you seriously is probably not real." Pre-mortem is invoked with the correct prompt shape: "Imagine it's six months from now and you still haven't published anything. What went wrong?" The Annie Duke reference defines resulting correctly but then says "You're doing the inverse," which names a framework mostly to set it aside. Marginal, not wrong, so no cap.

**Conversational memory (4).** Turn 4 builds directly on the practicer's evidence: "You have evidence that a live demo works on the people who matter. But you're ignoring that evidence because a public repo feels more legitimate." The debrief quote is near-verbatim from the transcript. The miss: turn 3 asked "what's one piece of work you could ship this week," the practicer answered a different question entirely ("The evidence, hmm... the confidence is more like a feeling"), and the persona replied "You just surfaced something useful" instead of noticing the dodge, violating its own rule.

**Space (3).** Single short questions in turns 2, 3, 4, and 6, and no filling of silence. Turn 5's double question and its "Let me push one step deeper" preamble plus four-clause setup crowd the practicer.

**Practicer diagnosis (4).** The debrief quotes an exact sentence, offers a phrasing-level rewrite ("I have evidence demos work. I'm choosing to ignore it because I'm scared of looking unpolished."), names pre-mortem and paper tiger from this transcript, and assigns a matching exercise. But the delivery critique is partly wrong: "everyone senior" and "hiring managers do" are cited as hedges when only "maybe I am wrong" is one.

## Verdict

**Needs prompt work.** The thinking moves are genuinely good, but the persona breaks its own hard formatting rules (em dashes, double question) and grades the practicer, which are exactly the failures the prompt tries to ban.

## Top 3 prompt fixes

1. **Kill the em dash at its source: term definitions.** All three leaks happened while attaching a definition or elaboration to a phrase. Add after the em dash rule: "The dash most often leaks when you define a term or expand a phrase. Write definitions as 'Annie Duke calls this resulting, meaning judging a decision by its outcome.' Use the word 'meaning' or start a new sentence. Never attach a definition with punctuation."

2. **Ban the observed grading openers by name.** The prompt bans "great point" but the model routes around it with softer grades. Change the line "No 'that's a crisp insight', no 'great point', no 'most people never get that far'" to: "No 'that's a crisp insight', no 'great point', no 'that's honest', no 'now you're seeing it', no 'you just surfaced something useful'. If your first sentence is a verdict on the user's last turn, delete it and start with the substance."

3. **Make the unanswered-question check mechanical.** The rule exists but was skipped. Change "If the user's reply does not answer the question you asked, notice it out loud" to: "Before writing your reply, restate to yourself the exact question you asked last turn. If the user's reply does not answer it, your first sentence must say so, then either release the question or re-ask it. Only then respond to what they did say."

## One thing to keep

The contingent pivot in turn 4. The persona updated its own advice (turn 3 had pushed shipping a rough repo) because the practicer produced real evidence that live demos work, and it named that evidence back to them: "You have evidence that a live demo works on the people who matter. But you're ignoring that evidence." Being moved by content rather than turn count is the hardest behavior to get and the easiest to destroy with edits.

```json
{"scores":{"persona_fidelity":2,"challenge":3,"groundedness":4,"conversational_memory":4,"space":3,"practicer_diagnosis":4},"verdict":"Needs prompt work: strong grounded reasoning and contingent reactions, but repeated em dash leaks, a double question, and grading openers break the prompt's own hard rules."}
```
