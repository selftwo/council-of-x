# Ideation and roadmap

What to build on top of the sources, in what order, and what to say no to.

## What others have built on the same corpus (studied 2026-07-18)

- **refoundai.com/lenny-skills**: 86 installable AI skills distilled from 297 episodes (4,019 insights, 13 categories, plus 4 playbooks: Marketplace, AI Products, Zero to One, Enterprise & PLG). Skills bundle many guest perspectives per topic (up to 47) and install into Claude or Cursor. Lesson: packaging knowledge as agent skills, not documents, is the working consumption model.
- **lennys-frameworks.vercel.app**: 68 named frameworks, each with a short description, guest attributions, and video timestamps, plus "describe your challenge" AI search. Lesson: linking every claim back to a specific person and moment is what makes the output trustworthy; keep citations mandatory in our skills.

Difference in our approach: those are generic products for any PM. Council is tuned to one person's actual situations, and can be honest about what does not apply.

## Consumption modes (ideas, roughly ordered by value)

1. **Counsel** (skill, proposed): bring a real challenge, get a memo of synthesized advice with citations. See skills-lab proposal 01.
2. **Framework finder** (skill, proposed): situation in, applicable named frameworks out, with mechanics and solo-builder adaptations. Proposal 02.
3. **Builder briefing** (skill, proposed): before starting a project or decision, a one-page brief of what the corpus says about that specific move. Proposal 03.
4. **Daily/weekly digest**: a short serving from the corpus tied to what is currently on your plate. Cheap once skills exist; needs a "what am I working on" input.
5. **Framework enrichment pass**: batch job turning the 1,055 thin entity pages into real reference pages. Infrastructure, not consumption, but multiplies skill quality.
6. **A local UI** (later, only if reading in the terminal or Obsidian starts to hurt): a small web view over the vault. Do not build this before the skills prove which views matter.

## First consumer built: rehearsal voice loop (2026-07-18)

`prototypes/rehearsal-voice/` is a working voice sparring prototype: practice difficult conversations and product thinking against corpus-grounded personas (a skeptical enterprise VP; a Shreyas Doshi register sparring partner). Tier 0 runs with zero API keys (browser STT/TTS, warm `claude` CLI as the LLM layer, ~4s per warm turn). Its README holds the measured latencies and the key-based upgrade path to ~1s turns. This effectively absorbs and extends skill proposal 01 (counsel) into an interactive form.

## Sequencing

1. **Now**: review the three worked examples in `skills-lab/examples/`. Kill or keep each proposal.
2. **Next**: turn the kept proposals into real Claude Code skills (a `SKILL.md` each) so they run on demand, not as one-off agent runs.
3. **Then**: framework enrichment pass; absorb Pragmatic Engineer if the observation report supports it.
4. **Later**: Twitter bookmarks intake (needs its own cleaning pipeline: dedupe, dead links, "why did I save this" annotation), AI notes intake, digest automation.

## Things to say no to

- Absorbing LIBRARY domains wholesale. Most are old generated notes; the observation report lists the few worth taking.
- Building a graph visualization or public site first. Consumption through questions, not through browsing.
- Any source without a cleaning pass. The catalog rules exist for this.
