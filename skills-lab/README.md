# Skills lab

Proposals for skills that consume the council sources. Each proposal has at least one worked example in `examples/`, produced from real vault content, so the decision can be made on output, not promises.

Review process: read the example, then mark the proposal `keep`, `kill`, or `rework` below. Kept proposals get built as real Claude Code skills (a SKILL.md each) in the next pass.

---

## Proposal 01: Counsel — decision pending

**What**: bring a real challenge (a hard conversation, a stakeholder mess, a career call), get back a memo of 4 to 6 pieces of synthesized advice mined from the corpus, every piece attributed to a named guest and episode with a quote and timestamp.

**Why for you**: your building side is well-fed; the gap you named is people management, social dynamics, and enterprise navigation (the project-cesc side of your life, not the claude-design side). The corpus is unusually deep exactly there: exec coaches, CTOs, and operators talking about politics, influence, and managing up.

**Worked example**: [examples/counsel--enterprise-dynamics.md](examples/counsel--enterprise-dynamics.md) — your stated challenge, answered from the transcripts.

**As a skill**: `/counsel <challenge>`. Steps: expand the challenge into search terms, grep transcripts, read matching sections, select only advice that fits your seniority and context, write the memo, save it dated into a `counsel-log/`.

---

## Proposal 02: Framework finder — decision pending

**What**: describe a situation, get the 3 to 5 named frameworks from the corpus that actually apply, with real mechanics extracted from where a guest explains them, plus adaptations for a solo builder. Skips frameworks that need a team or big sample sizes.

**Why for you**: this is the lennys-frameworks.vercel.app idea, but tuned: it knows you work solo with agent leverage, and it filters accordingly instead of listing everything.

**Worked example**: [examples/framework-finder--what-to-build-next.md](examples/framework-finder--what-to-build-next.md) — "what should I build next and how do I know it's working", answered for a solo builder.

**As a skill**: `/frameworks <situation>`. Bonus infrastructure: a batch enrichment pass turning the 1,055 thin entity pages into real reference pages makes this near-instant (see roadmap).

---

## Proposal 03: Builder briefing — decision pending

**What**: before starting or unblocking a concrete project move, a one-page brief of what the corpus says about that specific move: positioning a personal product, naming, launching to a small audience, pricing, deciding what not to build. Input is a project and the move; output cites episodes and flags where the advice assumes a company you don't have.

**Why for you**: you have live moves this applies to right now: naming design-mode (Redline / Lightdesk / Trace), taking vesper to your portfolio, deciding what Florilegium becomes. The corpus has founders talking through exactly these moments.

**Worked example**: none yet, deliberately. If 01 and 02 read well, the natural first real use is a briefing for one live decision, which doubles as the example. Suggest: "how should I name and position design-mode."

---

## Decisions

| Proposal | Decision | Notes |
|---|---|---|
| 01 Counsel | pending | |
| 02 Framework finder | pending | |
| 03 Builder briefing | pending | |
