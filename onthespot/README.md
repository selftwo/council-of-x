# onthespot

Difficult conversations and situations. Think and navigate gracefully.

## Press release (working backwards, written 2026-07-20)

You know the feeling after a conversation that mattered: I wish I had said this instead of that. I wish I had the courage to say it at all. I wish I had structured my point better in the two minutes I had with leadership. Tough conversations are rare, so you never get enough practice at them, and the skills they need (clarity under pressure, pausing to think, saying the point without burying it) do not come naturally to everyone.

onthespot puts you in those situations on purpose. You have a real two-way conversation with an AI counterpart that has the gravitas, expertise, and questioning style of people worth practicing against, grounded in professional advice and career context. Sessions are timed. After each one you get analysis against rubrics: what you did, a baseline, the smallest quickest fix to make first, and a way to practice it. Over a coaching journey (ten or so sessions on one tough scenario, with variations), the way you pause, think, structure, and answer becomes measurably more coherent. The goal is instinctive flow: thinking, attention, and eventually delivery and body language.

## Phases

- **V1 (now): chat.** A local web chat interface. Ben dictates his turns with Wispr Flow; replies come back as text. Measured: conversation quality (two rubrics, see below), message timestamps for thinking time, and pause/gap analysis from the Wispr Flow audio saved on disk (local ASR with word timestamps, parakeet). Visible soft timer per session. Brain: DeepSeek v4 flash.
- **V2: voice.** STT/TTS via Pipecat (stack already researched in rehearsal-lab: Deepgram Nova-3 + Cartesia default, audition pending). Tone, spacing, and delivery feedback from actual audio.
- **V3: video.** The session records you; body language and visual delivery feedback from a vision model.

## What V1 measures

Two rubrics, both run on every session:

1. **Persona rubric** (carried from rehearsal-lab rubric v2): the counterpart must stay good. Binary failure modes, code checks first, two judges from different labs.
2. **Practicer rubric** (new): you. Coherence, structure, hedging, buried points, thinking pauses, time use. This rubric is the baseline for the coaching journey.

Coaching journey (baseline, deltas across sessions, smallest-first-fix pedagogy) is designed now and built after a few real sessions exist.

## Scenarios and personas

- Ben handwrites the 10 to 20 V1 scenarios himself, from the press-release framing. The rehearsal-lab approved queue is scrapped as a queue; it and the proposals stay as raw material.
- Counterparts keep named personas from the Lenny corpus (not a generic averaged executive), enriched by a mined pool per persona: situations they actually faced, how they handled them, their pressure-test moves and questioning styles. Whether each named persona holds for a given scenario gets checked against that dossier.

## Eval flywheel (the three stages)

1. Vibe check in a loop until sessions feel good.
2. Ben's handwritten 10 to 20 scenarios, quantified with the two rubrics. Ship (ship = Ben uses it daily).
3. Real session traces accumulate into datasets and feed back through the eval machinery.

Repo is shaped to become public portfolio work: no secrets in committed files, relative paths, artifacts readable by a stranger.

## Lineage

Imported from `../rehearsal-lab` (frozen as the research phase): the run/judge/report harness, rubric v2 method (Hamel Husain evals-skills doctrine), coaching map, persona catalog, voice stack research, model roles and budget rules. See `decisions.md` here for what carried over and `../rehearsal-lab/decisions.md` for the history.
