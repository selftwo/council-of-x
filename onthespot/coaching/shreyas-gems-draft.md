# Shreyas gems for the coach mind — draft 1

Status: DRAFT for Ben's review, 2026-07-27. Source: the newly absorbed Shreyas Doshi Substack corpus (`../../sources/shreyas-doshi-substack/posts/`, 29 posts, see `../../observations/2026-07-27-shreyas-doshi-substack.md`). Ben asked for two things: these ideas in the core corpus (done) and the load-bearing ones wired into the product's mind. This draft is the second part. Nothing here feeds a prompt until Ben approves it.

## 1. The spine: the Antithesis Principle

Source: `the-antithesis-principle.md`. Ben flagged this one specifically.

The idea: any truth about human nature points two ways. Pointed outward it is a tactic (how to be effective with people). Pointed inward it is a warning (the default to eliminate in yourself). Smart people find the tactic; wise people also do the inward work. Example from the post: explain with analogies, never decide by them.

Why it belongs in onthespot's mind and not just the corpus: onthespot is a practice product, and practice products drift toward teaching outward tactics only. The Antithesis Principle gives the coach a second axis on every hint.

Concrete wiring (each is a small change, none done yet):

- **Coach whisper**: when the coach hints an outward tactic ("lead with the point because people don't listen well"), it can occasionally add the inward pair ("and notice when a counterpart's confident framing is doing this to you"). At most one inward hint per session, or it becomes a lecture.
- **Counterpart personas**: the sparring value of a charismatic persona (Boz, Mann) is precisely the inward half: Ben practicing not being swayed by charisma, evocative analogies, and confident binaries. A scenario can declare which antithesis it is exercising, the way it declares a target duration.
- **Judge design guard**: the principle also warns us as builders. A rubric that rewards only outward polish trains performance, not judgment. The practicer rubric already leans this way (it measures Ben's clarity, not his persuasion wins); keep it that way.

## 2. Directly buildable: the 9 axioms

Source: `9-axioms-of-interpersonal-communication.md`. The nine: people don't listen well; love being listened to; love feeling right; love being entertained; pay attention when surprised; crave control; love praise; want to be liked; avoid unpleasant conversations (and admire those who conduct them gracefully).

Shreyas states outright that the way to use these with AI is to hand them over as context and specify which axioms to weight for the situation. That is a scenario-file feature: a scenario declares axiom weights for its counterpart (a VP intro weights 1, 2, 8; a pushback sparring session weights 3, 9). The counterpart persona and the coach whisper both read the weights. Cheap to add, grounded in the author's own instruction.

## 3. Gems for the coach whisper lexicon

One line each, with the source file. These are hint-sized ideas the coach can ground in, attributed to Doshi inline as the existing coach does.

- **Partition listening and thinking; ask for a moment to think** (`becoming-great-at-listening.md`). Maps straight onto rubric C1: thinking pauses are coached FOR. The coach can suggest the explicit move "give me a few seconds to think", which converts a dead pause into a controlled one.
- **Get to the core of the thing; refuse binaries at altitude** (`get-to-the-core-of-the-thing.md`). "Wide or deep" style framings let everyone sound smart while avoiding specifics; the truth is one level down. Coachable move: when handed an abstract binary, reframe to the concrete question. Also a counterpart move: personas should sometimes offer the seductive abstract framing as a trap.
- **Don't be a full cup** (`dont-be-a-full-cup.md`). Operate three-quarters full (leave room for input), shift to full-cup projection only when optics demand it. Useful pairing for Ben's hedging pattern: the goal is not zero uncertainty, it is deliberate control of when to project fullness.
- **The genuine anti-sell** (`the-genuine-anti-sell.md`). Naming honestly why you might not be the fit strengthens a competent counterpart's belief in you. Only genuine, never a hack. Fits intro and interview scenarios; the coach should only surface it where Ben actually believes the caveat.
- **Blunt feedback needs intent plus judgment** (`on-blunt-feedback.md`). Includes the backchannel warning: sometimes feedback's real audience is the label it lets the giver attach to you. Material for feedback-giving and feedback-receiving scenarios, and a self-check on the coach's own critiques.
- **All your problems are messaging problems; the micromanagement vocabulary and script** (`understanding-micromanagement.md`). Four types (mistrust, insecurity, complexity, taste), plus a complete worked script for announcing intentional close involvement. This is ready-made scenario material for manager conversations.
- **Route around big egos** (`route-around-big-egos.md`). Move a negotiation to the EMs/TLs instead of PM versus PM. Enterprise-navigation gem, squarely in Ben's stated gap. Also the closing line as a self-check: the smarter the person, the better the excuse.
- **What are you really selling** (`do-you-know-what-you-are-really-selling.md`). One-word essence forcing function (Apple sells taste, Stripe sells deep care). Good warm-up prompt for pitch and intro scenarios: what is Ben really selling in this conversation?
- **The humility trap** (`the-humility-trap.md`). Performative vulnerability is not humility; unperformative learning from non-superiors is. Guard against coaching Ben into humility theater.

## 4. Building-side gems (for us, not the coach)

- **The fundamental cognitive bias of product builders** (`the-fundamental-cognitive-bias-of.md`): "my product is great, marketing is the problem; my competitor wins on distribution; mine is better; I just need to keep building." Worth rereading before every onthespot roadmap decision, since this product is built by its only user.
- **Influence, power, and product management** (`influence-power-and-product-management.md`): complaints about lacking influence usually signal missing product sense or missing persuasion ability. Relevant to the calibration profile and to scenario realism.
- **Everything isn't meant for everyone / talk to fewer customers / outcomes over learning opportunities**: portfolio of judgment posts, corpus-retrievable, no wiring needed now.
- The four audio deep dives (listening, micromanagement, writing-as-thinking, why products fail) are transcribed in their post files. The listening deep dive is the one most likely to yield additional coach lexicon; mine it in a later pass.

## 5. Open questions for Ben

1. Axiom weights in scenario files: add now or after the current eval loop stabilizes?
2. Inward antithesis hints: cap at one per session, or keep the coach purely tactical and put the inward half only in post-session reports?
3. Should a "really selling" one-liner become a standard scenario-file field for intro/pitch scenarios?
