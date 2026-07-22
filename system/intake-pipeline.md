# Intake pipeline and tagging scheme

How a source moves from "found it" to "usable by skills".

## Stages

1. **Identify**: name the source, note where it lives, what format, roughly how much. Add a `candidate` row to `sources/_catalog.md`.
2. **Observe**: short report in `observations/`: what it actually contains, sample quality, verdict (absorb / absorb partially / skip). Be strict; most candidates should fail.
3. **Absorb raw**: copy or clone into `sources/<name>/`, record provenance, mark `absorbed`.
4. **Process**: LLM passes over raw to produce the enriched layer. The Lenny vault arrived already processed; for new sources this means:
   - frontmatter per document (schema below)
   - entity extraction (people, companies, frameworks) into shared entity pages
   - topic maps linking documents per theme
5. **Wire into skills**: nothing extra needed if frontmatter and entities follow the schema; skills grep and read across `sources/*/`.

## Frontmatter schema (adopted from the Lenny vault)

```yaml
title, date, type (podcast | newsletter | article | note | thread),
author, source, tags [], topics [], frameworks [], companies [], people [],
word_count, status (raw | processed)
```

Keep new sources compatible with this so one skill can query everything. Extend with fields, never rename existing ones.

## Known quality debts in the Lenny vault (fix in the processed layer, raw is fine)

- The wiki-linking pass over-linked stopwords: `[[the]]`, `[[that]]`, `[[this]]` appear inside transcript text. Harmless for grep-based skills, ugly in Obsidian. Fixable with one regex pass over a copy; do not edit the clone since it can be re-pulled.
- Framework entity pages are thin: name plus a list of guests who mention it, no definition or mechanics. A "framework enrichment" pass (find where each framework is explained in transcripts, extract the mechanics into the entity page) is the highest-value processing upgrade. The framework-finder skill does this on demand; the enrichment pass would make it instant.

## Maintenance and quality of life

- Re-pull the Lenny repo occasionally (`git -C sources/lenny-knowledge-graph-vault pull`) for new episodes.
- Twitter bookmarks and AI notes get their own observe stage with an explicit cleaning step before absorb; do not shortcut it.
- When a skill produces something good, save the output in `skills-lab/examples/` with the date and the question asked. The examples folder doubles as a record of what the system is actually good for.
