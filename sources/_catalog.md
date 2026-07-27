# Source Catalog

Registry of every source in the system. One row per source. States: `absorbed` (in sources/, usable), `candidate` (identified, not yet absorbed), `planned` (known future intake, needs cleaning first).

| Source | Type | State | Location | Notes |
|---|---|---|---|---|
| Lenny's Newsletter + Podcast knowledge graph | podcast transcripts, newsletter text, entities, topic maps | absorbed | `sources/lenny-knowledge-graph-vault/` | Cloned 2026-07-18 from github.com/selftwo/lenny-knowledge-graph-vault (shallow clone). 349 newsletters, 289 podcast transcripts, 1,055 entity pages, 30 topic maps. |
| Pragmatic Engineer material | templates, datasets, research summaries | candidate (approved by survey) | Obsidian vault: `ben-vault/LIBRARY/pragmatic-engineer/` (18 files) | Templates (11) are full actionable extractions: absorb. Datasets and research are lossy summaries: absorb as secondary. |
| Lenny distilled learnings | hand-distilled syntheses | candidate (approved by survey) | `ben-vault/LIBRARY/product-growth/learnings/` (~52 files tagged `lenny-kext-pipeline`) | Clean per-guest syntheses; absorb as a distilled layer on top of the raw corpus. |
| Obsidian LIBRARY remainder | mixed generated notes | rejected | `ben-vault/LIBRARY/` | ~8,000 files of old generated imports and pipeline cruft, including an outdated subset copy of the Lenny graph. Skip wholesale; see observations report 2026-07-18. |
| Shreyas Doshi Substack | newsletter essays + podcast transcripts | absorbed | `sources/shreyas-doshi-substack/` | 29 posts fetched 2026-07-27 via the Substack public JSON API (`api/v1/posts/<slug>`), all free tier. 25 text essays, 4 podcast episodes (audio downloaded, transcribed locally with Whisper small.en; transcript appended to each post file, mp3s deleted after transcription, audio URLs kept in `posts/audio/manifest.json`). Picked by Ben for the interpersonal/communication gems (Antithesis Principle, 9 axioms, listening, blunt feedback). See observations report 2026-07-27. |
| pmcurve Advanced Growth PM course | course text exports (6 modules) | absorbed | `sources/pmcurve-advanced-growth/` | Recovered 2026-07-27 from Obsidian vault git history (`git show 0622181b:<path>`); the vault working tree had lost the files. 20,239 lines. Covers growth models, retention, engagement, activation, acquisition, pricing/monetisation. Paid content, personal use only. Includes `distilled/` layer: the six GROWTH-01..06 skill cards that cite these modules. See README reading map and observations report 2026-07-27. |
| PM Curve Interview Bootcamp (Deepak Singh) | session notes + verbatim transcripts | absorbed | `sources/pmcurve-interview-bootcamp/` | 43 session files copied 2026-07-27 from vault `interview-prep/`; 11 live cohort transcripts recovered from vault git history (`git show 898db610:<path>`, deleted by prune commit 2988d45c). 4 modules: product sense, strategy, analytical & growth, behavioral & leadership. Paid content, personal use only. |
| Twitter bookmarks | links, threads | planned | not yet exported | Needs thorough scrutiny and cleaning before intake. Own pipeline stage. |
| AI notes | personal notes | planned | TBD | Needs cleaning and updating first. |

## Rules for absorbing a source

1. Raw form goes in `sources/<name>/` untouched. Record provenance (URL, export date, method) here.
2. Be critical at the door: a source earns absorption by being primary material (full text, transcripts) or by being personally written. Summaries of summaries and old LLM-generated notes stay out.
3. Processing (entities, tags, maps) is a separate pass and is regenerable. Never hand-edit raw.
4. Every absorption gets a short observation report in `observations/`.
