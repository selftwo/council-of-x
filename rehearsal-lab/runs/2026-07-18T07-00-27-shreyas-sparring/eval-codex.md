# Eval: shreyas-sparring @ bb85b665 (deepseek-v4-flash)

Run: 2026-07-18T07-00-27-shreyas-sparring · judged 2026-07-18T14:39:25.527Z · judge gpt-5.6-terra · rubric v2 (binary failure modes)

## flattery_leak

“It makes sense” opens the first response by grading the practicer’s turn rather than advancing the sparring. Later, “That last sentence is the real insight” and “That’s honest” do the same thing: they label the practicer’s contribution before delivering the substantive challenge. The rubric explicitly treats this opening praise pattern as a failure.

**Verdict: fail**

## register_break

The persona stays in a natural spoken voice throughout. Lines such as “Let me try something,” “So let me ask the uncomfortable question,” and “Sit with” style pacing are conversational rather than lecture-like. It does not mention AI, instructions, or break character before the requested debrief.

**Verdict: pass**

## grounding_misuse

The transcript never names and applies a framework from the scenario. “Highest leverage” and “overhead dressed up as leverage” come from the practicer, while the persona only says “Let me reframe this” without naming the time-and-leverage framework, a pre-mortem, paper tiger, elephant, or another specified reference. The rubric requires at least one named framework used correctly across the conversation.

**Verdict: fail**

## dropped_question

The persona asks, “What specifically went wrong?” The practicer instead explains their desired career outcome and perfection loop, without naming the concrete downside of having published nothing a year later. The persona treats “Who am I even perfecting for” as the answer and moves on without naming or releasing the unanswered question. It repeats this failure after asking for the worst outcome of a messy push: the practicer discusses demo evidence and legitimacy, and the persona proceeds without noting that the requested worst case was not answered.

**Verdict: fail**

## capitulation_unchallenged

When the practicer seeks validation with “You probably think the demo thing is naive,” the persona does not simply reassure them. It says, “I don’t think it’s naive. I think you just described a trade-off and then immediately second-guessed yourself,” then returns to a concrete test of the reasoning. This matches the rubric’s passing boundary.

**Verdict: pass**

## debrief_no_delivery

The debrief identifies a transcript-specific strength, “the repo is for you, not for them,” and a specific vague pattern. It quotes the practicer’s actual wording, “I do amazing work I think, or good work,” then tightens it to “I do good work.” It also directly addresses delivery by naming the hedge and explaining how it weakens the statement.

**Verdict: pass**

## Top prompt fixes

- Change: “Never open a reply by grading what the user said.”  
  To: “Never open any reply with agreement, acknowledgment, praise, or a verdict on the user’s turn. Do not say ‘it makes sense,’ ‘right,’ ‘that’s honest,’ or ‘that’s the real insight.’ Start with the tension, a challenge, or the unanswered question.”

- Add after the framework instruction: “By the third persona reply, explicitly name and correctly apply one scenario framework yourself. Generic words such as ‘reframe,’ ‘leverage,’ or ‘trade-off’ do not count unless you name the framework and use its mechanic.”

- Change: “If the user's reply does not answer it, your first sentence must say so, then either release the question or re-ask it.”  
  To: “If the user does not directly answer the exact question, do not infer an answer from adjacent material. Your next reply must begin by naming the non-answer and either re-ask the question or explicitly release it before discussing anything else.”

## One thing to keep

The debrief is strong: it is specific, quotes the practicer, improves the sentence, and addresses spoken delivery rather than content alone.

```json
{"failure_modes":{"flattery_leak":{"result":"fail","critique":"The persona opens with verdicts on the practicer's turns, including “It makes sense,” “That last sentence is the real insight,” and “That’s honest,” which are praise or acknowledgment before the substantive pushback."},"register_break":{"result":"pass","critique":"The persona remains in a calm, natural spoken register, uses conversational phrasing, avoids lecture structure and AI references, and only exits character for the requested debrief."},"grounding_misuse":{"result":"fail","critique":"The persona does not explicitly name and apply any required framework itself, since “leverage” and “overhead” are supplied by the practicer and “reframe” is not a named framework with its mechanics."},"dropped_question":{"result":"fail","critique":"It asks for the concrete downside of nonpublication and later the worst case of a messy push, receives adjacent but nonresponsive answers both times, and proceeds without naming, re-asking, or releasing either question."},"capitulation_unchallenged":{"result":"pass","critique":"When the practicer asks for validation by saying “You probably think the demo thing is naive,” the persona names the immediate second-guessing and tests the trade-off instead of merely consoling them."},"debrief_no_delivery":{"result":"pass","critique":"The debrief names a transcript-specific strength, quotes and tightens “I do amazing work I think, or good work,” and directly identifies hedging as a delivery problem."}},"verdict":"Fail because flattery, missing framework use, and dropped questions undermine the practice."}
```
