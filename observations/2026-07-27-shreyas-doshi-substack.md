# Absorption report: Shreyas Doshi Substack, 2026-07-27

Ben picked 29 posts from shreyasdoshi.substack.com and asked for them as a corpus source, with the audio episodes transcribed locally. He flagged the Antithesis Principle as something that should live in the coach's mind, not just the corpus.

## What was absorbed

`sources/shreyas-doshi-substack/posts/`: one markdown file per post, 29 total.

- **Method**: Substack public JSON API (`https://shreyasdoshi.substack.com/api/v1/posts/<slug>`), which returns full `body_html` for free posts. HTML converted to markdown with html2text. Every post carries frontmatter: title, subtitle, author, source URL, publish date, type, audience, retrieval date, method.
- **Paywall check**: all 29 posts report `audience: everyone`. Nothing truncated.
- **Audio**: 4 posts are podcast episodes (`is-writing-really-thinking-a-deep`, `why-products-fail`, `becoming-great-at-listening-a-deep`, `understanding-micromanagement-a-deep`), about 61 minutes total. Audio downloaded, transcribed locally with Whisper small.en (no cloud API), transcript appended to each post file under a `## Transcript` heading. Ben decided 2026-07-27 that the markdown transcripts are the master source: the mp3s (~44 MB) were deleted after transcription. The audio URLs live in `posts/audio/manifest.json` if a re-download is ever needed.

## Quality assessment

- Text posts are complete and clean. Sizes range from ~1.4k chars (aphoristic posts) to ~62k chars (the peer-reviewed-studies deep dive, which embeds many quoted tweets).
- Three of the four audio episodes are NotebookLM-generated deep dives that Shreyas produced from his own private writing; he stands behind them explicitly. They are secondary-voice but primary-content. The Whisper small.en transcripts are unedited machine output: fine for retrieval, but treat wording as approximate when quoting verbatim (the audio can be re-downloaded from the manifest URLs to verify).
- Two title pairs look like duplicates but are not: `becoming-great-at-listening` / `understanding-micromanagement` are the text essays, the `-a-deep` variants are the companion audio deep dives.
- Watch one corpus-hygiene issue: several posts link out to Claude.ai share chats ("check out this Claude chat") that hold real content (e.g. the logic error in the fundamental cognitive bias post). Those chats were not captured. If a future consumer needs them, that is a separate small intake.

## Why this source earns absorption

Primary material, author's full text, zero generation loss. It lands squarely in Ben's stated gap: interpersonal dynamics, influence, communication under pressure. The Lenny corpus has Shreyas as a guest; this is his own voice at much higher density.

## Consumer wiring done in the same pass

`onthespot/coaching/shreyas-gems-draft.md` distills the coaching-relevant gems (Antithesis Principle first) into coach-mind material for the practicer loop, mapped to the practicer rubric dimensions. Draft status: Ben reviews before it feeds any prompt.
