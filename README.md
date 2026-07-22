# Council

A personal knowledge system built from rich content sources: podcasts, paid newsletters, and other long material. Sources come in raw, get processed into entities and topic maps, and are consumed through skills that answer real situations instead of through browsing.

Created 2026-07-18.

## Layout

```
council/
├── README.md            ← you are here
├── sources/             ← the content itself, one folder per source
│   ├── _catalog.md      ← registry of every source: what it is, state, provenance
│   └── lenny-knowledge-graph-vault/   ← first source (git clone, see catalog)
├── observations/        ← first-pass survey reports on each source and candidate
├── system/              ← how content moves through the system (intake, tagging, maintenance)
├── roadmap/             ← ideation: what to build on top, sequencing, future intakes
└── skills-lab/          ← skill proposals, each with worked examples to review
    └── examples/        ← sample outputs produced from real vault content
```

## The model

Three layers, applied to every source:

1. **Raw**: the original material, unmodified (transcripts, newsletter text). Kept forever, never edited.
2. **Processed**: enriched forms produced from raw by LLM passes: frontmatter, entity pages (people, companies, frameworks), topic maps, wiki links. Regenerable, so quality problems here are fixable without touching raw.
3. **Consumption**: skills and views that use the processed layer to answer a situation: counsel on a challenge, framework lookup, briefing before starting work. See `skills-lab/`.

## Current state

- Source 1 absorbed: Lenny's Newsletter + Podcast knowledge graph (638 posts, 1,055 entities). See [sources/_catalog.md](sources/_catalog.md).
- First-pass observations in `observations/`.
- Three skill proposals with worked examples in `skills-lab/`, awaiting human review.
- Planned future intakes: Pragmatic Engineer (from the Obsidian LIBRARY), Twitter bookmarks, AI notes. Each needs its own cleaning pass before absorption; see the roadmap.

## How to use this today

Read the worked examples in `skills-lab/examples/`, decide which proposals feel useful, and mark decisions in `skills-lab/README.md`. Everything downstream (building the skills properly, wiring more sources) follows from those decisions.
