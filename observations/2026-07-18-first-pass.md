# First-pass observations, 2026-07-18

Survey of the initial source, the surrounding library, and prior art. Written before any building decisions.

## 1. The Lenny knowledge graph vault (absorbed)

Cloned from github.com/selftwo/lenny-knowledge-graph-vault into `sources/`.

**Contents**: 289 podcast transcripts (full, timestamped, speaker-labeled), 349 newsletters (full text, 2019 to 2026), 1,055 entity pages (people, companies, frameworks), 30 topic Maps of Content, 16,600+ wiki links. Built earlier with a multi-agent pipeline (ingestion, frontmatter enrichment, entity extraction, wiki linking).

**Quality assessment**:
- Raw layer is excellent. Transcripts are complete with timestamps and clean speaker turns. Newsletters keep original formatting, quotes, and links. Word counts run 2,000 to 19,000 per document.
- Frontmatter is consistent and useful: title, date, type, tags, topics, frameworks, companies, people, word_count. This becomes the house schema (see `system/intake-pipeline.md`).
- Two processing defects, both fixable without touching raw:
  1. The wiki-link pass over-linked stopwords (`[[the]]`, `[[that]]`, `[[this]]` inside transcript text).
  2. Framework entity pages are thin: just a name and which guests mention it, no definition or mechanics.

**Verdict**: this alone is enough to power the first skills. It is the anchor source.

## 2. Prior art on the same corpus

- **refoundai.com/lenny-skills**: 86 installable agent skills from 297 episodes, 13 categories, 4 playbooks, up to 47 guest perspectives per skill. Proof that skills, not documents, are the consumption model.
- **lennys-frameworks.vercel.app**: 68 frameworks with guest attributions and video timestamps, plus challenge-based AI search. Proof that mandatory citation to a person and moment is what makes output trustworthy.

Both are generic products. Council's edge is personalization: it knows the owner's actual projects and challenge areas and filters advice accordingly.

## 3. Owner context (from a scan of active projects, last 3 days)

Active work clusters around design and personal software: claude-design (design language systems), ideate (vesper and meridian explorations), portfolio-site (benirl.co), design-mode (a design review tool, mid-pivot and unnamed), inkling. The richest self-assessment lives in `claude-design/references/learning/ben-profile.md`: solo product builder using agent leverage, owning taste, "observant curator and helper-builder", strong locked design doctrine.

Implication for council: the building side is already well-served by existing repos and memory. The underserved side is people management, social dynamics, and enterprise navigation (the project-cesc register). That is where the Lenny corpus is deepest and where the counsel skill aims. Explicit self-written notes on those struggles were not found in the vault top level; the journal folders (Focus-notes-journal, Thinking-notes-journal, Field-Notes-journal) are the likely place and were left unexplored for now.

## 4. Obsidian LIBRARY candidates (survey complete)

The LIBRARY holds 19 domains, ~8,300 files. The bulk (decision-science, inspiration, knowledge-retrieval, governance-decisions, product-excellence, roughly 3,000+ files tagged `library-import`, `cto-mentor-import`, `product-excellence-backup`) is old generated material. **Skip wholesale**; mine only if a specific topic gap appears.

Key finding: `product-growth/lenny-knowledge-graph/` (4,043 files) is an older, worse generation of the same corpus we cloned from GitHub. Its 223 newsletters and 55 partial podcasts are a strict subset (older chunked `-partN` variants; verified by filename diff). Its 1,051 entity stubs and 2,681 staged pipeline notes are cruft. **The GitHub clone is canonical; nothing to take from this tree.**

What the LIBRARY does contribute:

| Candidate | Files | What | Verdict |
|---|---:|---|---|
| `pragmatic-engineer/templates/` | 11 | Full actionable extractions from Gergely Orosz's newsletter: new EM checklist, tech lead expectations, performance review and security review templates | **Absorb** |
| `product-growth/learnings/` (lenny-kext notes) | ~52 | Clean hand-distilled Lenny syntheses (e.g. `hila-qu-plg-guide.md`) | **Absorb as a distilled layer** |
| `pragmatic-engineer/datasets/` + `research/` | 4 | Survey data and reports, already lossy summaries (`format:` field marks which) | Absorb as secondary |
| `product-growth/nate-research/` | 7 | Project-specific viral-loop research synthesis | Review, low priority |
| Everything else | ~8,000 | Generated imports, derived stubs, pipeline drafts | Skip |

No other podcast or newsletter archive on the Lenny or Pragmatic Engineer scale exists in the LIBRARY.
