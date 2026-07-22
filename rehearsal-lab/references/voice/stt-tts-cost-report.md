# Voice stack cost and quality report — STT, TTS, and the per-minute math

Researched 2026-07-18 by three independent workers: a Sonnet subagent on the Pipecat docs, a Sonnet subagent on pricing/quality (web, official pages, dated citations), and Codex (GPT-5.6 terra) as an independent second opinion. Where they disagree, the disagreement is shown, not averaged. Visual version: canvas/voice-stack.html.

## The shape of the cost (your constraints)

Per session: ~2 minutes total, you talk ~70%. So STT runs on the whole session (~2 streaming minutes), TTS only speaks the persona's ~30% (~1,000 characters). DeepSeek is measured from our own ledger: a full six-turn session costs ~$0.0003 (cache hits ~90%). Conclusion up front: **at your volume every reasonable stack costs 3 to 13 cents per session. Cost cannot decide this; voice quality and latency decide it.**

## STT (the bigger minutes, the smaller dollars)

| provider | streaming $/min | notes | verified |
|---|---|---|---|
| Deepgram Nova-3 | $0.0048 | both workers' pick; strongest accuracy reputation on fast rambling speech; sub-300ms finals; $200 free credit | official page, 2026-07-18 |
| Deepgram Flux | $0.0065 | purpose-built for voice-agent turn-taking; try only if turn timing (not accuracy) becomes the issue | official page |
| AssemblyAI Universal-Streaming | $0.0025 | cheapest credible streaming; bills WebSocket-open time incl. silence; $50 free credit | official page |
| OpenAI gpt-4o-transcribe | ~$0.006 | fine, but not built for lowest-latency turn-taking; token billing is opaque | official pricing |
| Cartesia Ink-2 | unpublished | claims top of streaming-STT leaderboard; plan-hours only, no $/min anywhere | NOT verified |
| Groq Whisper turbo | $0.00067 | not truly streaming (chunked batch); wrong architecture for live conversation | official page |

**Pick: Deepgram Nova-3.** Codex and the pricing agent agree; the Pipecat docs recommend it; the $200 free credit covers ~40,000 minutes, meaning STT is effectively free for the whole calibration era. AssemblyAI is the cheaper A/B if accuracy on your dictation-style speech ever disappoints.

## TTS (the smaller minutes, the bigger dollars, and the real decision)

| provider | eff. $/1k chars | human-ness signal | latency | flag |
|---|---|---|---|---|
| Inworld Realtime TTS-2 | $0.025 | top or near-top on BOTH arenas (TTS-Arena + Artificial Analysis) — most consistent ranking found | <250ms claimed | pricing agent's #1; Codex did not evaluate it |
| Cartesia Sonic 3.5 | $0.038 | near-top arena; Pipecat's recommended default; expressive voices (Kyle, Cory) suggested for character work | ~90ms claims | Codex's #1; speed/volume controls temporarily disabled on 3.5 (pin Sonic 3 snapshot if needed) |
| Hume Octave 2 | $0.05-0.15 | the only one with direct emotion steering ("say it sarcastically / firmly") — uniquely fits difficult-conversation practice | 150-200ms claimed | arenas disagree sharply on it (top-6 vs #46); tiered pricing is confusing |
| ElevenLabs Flash v2/v2.5 | $0.05-0.09 | expressive tier is v3 (not real-time); Flash is the usable one, unbenchmarked separately | ~75ms model-only | two official pages disagree by 2x on price — verify at checkout |
| Deepgram Aura-2 | $0.030 | competent, not characterful | ~90ms (best-documented latency claim of the set) | fine as a budget fallback |
| Rime | $0.033-0.05 | marketing says natural fillers; independent leaderboards rank it mid-to-low and one benchmark calls it unsuitable for real-time | contradicted | skip unless auditioned |
| OpenAI gpt-4o-mini-tts | ~$0.16 empirical | steerable but empirically ~8x its implied marketing price; deprecated listing | unknown | skip |

## Speech-to-speech (OpenAI Realtime) — checked and ruled out

Two independent reasons, one decisive:
1. **The brain must stay DeepSeek.** Your persona prompts are calibrated on it. Realtime's own model does the listening, thinking, and speaking; routing "thoughts" to DeepSeek via tool calls leaves OpenAI's model in charge of the conversation. That breaks the whole calibration premise (Codex: "effectively a dealbreaker").
2. Worse and pricier anyway: its voice quality ranks below dedicated TTS (arena ELO ~1,060), time-to-first-audio 0.8-2.3s, and real-world cost $0.18-0.46/min uncached ($0.36-0.92 per session) vs. pennies for the split stack.

The ai-notes vault flagged speech-to-speech as the architecture to compare before committing to Pipecat. This is that comparison; conclusion: split pipeline. Revisit only if a future version drops the DeepSeek requirement.

## Per-session math (2 min, 70/30 split, ~1,000 TTS chars)

| stack | STT | TTS | LLM | per session | per minute |
|---|---|---|---|---|---|
| Deepgram + Cartesia | $0.0096 | $0.0392 | $0.0003 | **$0.049** | $0.025 |
| AssemblyAI + Inworld | $0.0050 | $0.0250 | $0.0003 | **$0.030** | $0.015 |
| Deepgram + ElevenLabs Flash | $0.0096 | $0.05-0.09 | $0.0003 | **$0.06-0.10** | $0.03-0.05 |
| Deepgram + Hume Octave | $0.0096 | $0.05-0.15 | $0.0003 | **$0.06-0.16** | $0.03-0.08 |
| OpenAI Realtime (all-in) | — | — | — | **$0.36-0.92** real-world | $0.18-0.46 |

Subscription floors at low volume (~52 sessions/month): Cartesia Pro $5/mo → ~$0.10/session allocated; ElevenLabs Starter $6/mo → ~$0.12/session. Inworld and Deepgram are usage-priced (no subscription floor), which suits dozens-per-week volume better. Either way: **a month of heavy practice costs less than one coffee.**

## Recommendation (and the one disagreement for your call)

**Default build: Deepgram Nova-3 + Cartesia Sonic 3.5.** It is the Pipecat quickstart pair (least integration friction), Codex's pick, near-top on quality, ~$0.05/session, and both have generous free credits to start.

**◐ The judges disagree on TTS**: the pricing agent ranks **Inworld** first (cheapest AND most consistently top-ranked for human-ness) and makes a case for **Hume** specifically because emotion steering fits "sound firm, skeptical, unimpressed" persona work. Codex never evaluated Inworld and backs Cartesia. This is an audition question, not a research question. Codex's method is right: a fixed ~20-line audition script of pushback lines (interruption, skepticism, corrective feedback, calm authority, one sharp challenge), rendered by Cartesia, Inworld, and Hume, listened to on your phone and headphones. Your ear decides; the harness wires whichever wins in one line.

## Unverified numbers (do not build a budget on these)

Cartesia Ink-2 STT $/min (unpublished); ElevenLabs Flash effective rate (official pages disagree 2x); MiniMax rates (third-party only); exact arena ELOs (shift weekly; directional only); OpenAI Realtime real-world $/min range (third-party trackers, not reproduced).
