# TTS and speech-to-speech API comparison (July 2026)

Research date: 2026-07-18. Use case: real-time voice agent for a conversation-practice app, built on Pipecat, low volume (a few dozen 2-minute sessions per week), English only. Priority: sounds human and engaging, low streaming latency.

All prices and claims below come from live web research on 2026-07-18. Where a provider's pricing page had no visible "last updated" date, that is noted — the number reflects what the page showed today, not a dated snapshot. Two known discrepancies (ElevenLabs, MiniMax) are flagged explicitly; verify before locking in a cost model.

---

## Quick-reference table

| Provider | Model | Effective $/1,000 chars | Pipecat support | Human-ness signal | Latency signal |
|---|---|---|---|---|---|
| Cartesia | Sonic 3.5 | $0.037–0.05 (paid tiers) | Yes — `CartesiaTTSService` | High — near top of Artificial Analysis realtime arena | ~40–90ms TTFB (vendor/3rd-party claims) |
| ElevenLabs | Flash v2.5 / Turbo v2.5 | $0.05–0.09 (see discrepancy note) | Yes — `ElevenLabsTTSService` | v3 rated most expressive overall; Flash/Turbo not separately benchmarked | Not confirmed this pass |
| Deepgram | Aura-2 | $0.027–0.030, flat, no credits | Yes — `DeepgramTTSService`, official Pipecat guide | Competent/natural, ranked below Cartesia/Inworld in one arena snapshot | ~90ms steady-state TTFB (first-party engineering blog) |
| OpenAI | gpt-4o-mini-tts | ~$0.16 empirical (vendor markets ~$0.02, see caveat) | Yes — `OpenAITTSService` | Steerable/instructable, generally human-like; some pacing complaints | No official TTFB for the TTS endpoint found |
| Rime | Mist / Arcana / Coda | $0.033–0.05 | Yes — 3 service classes, richest Pipecat integration | Strong naturalness marketing; mid-pack (#55–81) on Artificial Analysis leaderboard | Vendor claims 150–200ms; one independent benchmark flags high variance |
| PlayHT / PlayAI | Play 3.0 | ~$0.125 (stale, mid-2025 data) | No — not in Pipecat services directory | Unconfirmed | Unconfirmed |
| Inworld | Realtime TTS-2 | $0.0125–0.025 (paid tiers) | Yes — `pipecat.services.inworld.tts` | Top-ranked on both TTS-Arena and Artificial Analysis | Vendor claims <200–250ms P90 TTFB |
| Hume AI | Octave 2 | $0.05–0.15 overage | Yes — `HumeTTSService`, official integration doc | Distinctive emotion/prosody control; mixed arena placement (higher on TTS-Arena, mid-table on Artificial Analysis) | ~150–200ms TTFB claimed; described as "upper range" latency vs. leaders |
| MiniMax | Speech-02/2.6/2.8 Turbo/HD | ~$0.03–0.10 (third-party only, not official) | Yes — `MiniMaxHttpTTSService` | Mid-pack on both arenas | Not found |
| **OpenAI Realtime (S2S)** | gpt-realtime-2.1 | N/A (per-minute audio, see below) | Yes — `OpenAIRealtimeLLMService` | Good conversational dynamics (~95–96%), but voice ELO (~1,060) below most dedicated TTS models | 0.82–2.33s time-to-first-audio depending on reasoning effort (Artificial Analysis); not the 2026 latency leader |

---

## 1. Cartesia (Sonic)

**Pricing.** Character-based credits: 1 credit = 1 character (1.5 credits/char for Pro Voice Clone playback).

| Tier | Monthly price | Credits/chars per month | Effective $/1,000 chars |
|---|---|---|---|
| Free | $0 | 20,000 | $0 (capped) |
| Pro | $5 | 100,000 | $0.05 |
| Startup | $49 | 1,250,000 | $0.0392 |
| Scale | $299 | 8,000,000 | $0.0374 |
| Enterprise | custom | custom | — |

At the stated volume (a few dozen 2-minute sessions/week ≈ 10,000–15,000 chars/week ≈ 40,000–60,000 chars/month), the Pro tier ($5/mo) likely covers it.

**Human-ness.** Marketed on emotion/prosody and "AI laughter," not described as robotic. On Artificial Analysis's Realtime TTS Arena (snapshot ~2026-05-28), Sonic 3.5 scored ~1,204 ELO, near the top of that category, ahead of Deepgram Aura-2 and non-v3 ElevenLabs.

**Latency.** Vendor/third-party claims: ~90ms time-to-first-audio standard, ~40ms on the Turbo variant. Cited consistently across multiple 2025–2026 blogs (TextToLab, Inworld's own comparison, Leadlock) but not independently reproduced in this research — treat as vendor-adjacent, not audited.

**Pipecat.** Yes — `pipecat.services.cartesia.tts.CartesiaTTSService`, documented as "speed-optimized."

**Sources.** https://www.cartesia.ai/pricing, https://docs.cartesia.ai/pricing, https://artificialanalysis.ai/text-to-speech/model-families/cartesia, https://texttolab.com/blog/cartesia-ai-review — fetched 2026-07-18, no visible "last updated" stamp on the pricing page itself.

**Caveats.** ELO snapshot is explicitly volatile (arena says rankings "shift weekly"). Latency numbers are repeated third-party claims, not independently measured.

---

## 2. ElevenLabs (Flash v2.5, Turbo v2.5, v3)

**Subscription tiers** (elevenlabs.io/pricing):

| Tier | Monthly price | Credits/mo |
|---|---|---|
| Free | $0 | 10,000 |
| Starter | $6 | 30,000 |
| Creator | $22 | 121,000 |
| Pro | $99 | 600,000 |
| Scale | $299 | 1,800,000 |
| Business | $990 | 6,000,000 |

Credit cost per model: Multilingual v2/v3 = 1 credit/character. Flash v2.5 and Turbo v2.5 = 0.5 credit/character (half price in credits).

**Math, Free tier:** Flash/Turbo: 10,000 credits ÷ 0.5 = 20,000 chars/month free. Multilingual: 10,000 ÷ 1 = 10,000 chars/month free.

**Math, Creator tier ($22/mo, 121,000 credits):**
- Flash/Turbo: 121,000 ÷ 0.5 = 242,000 chars/month → $22 / 242k = **$0.0909 per 1,000 chars**
- Multilingual: 121,000 ÷ 1 = 121,000 chars/month → $22 / 121k = **$0.182 per 1,000 chars**

**Discrepancy found.** ElevenLabs' separate flat API/pay-as-you-go page (elevenlabs.io/pricing/api) quotes Flash/Turbo at $0.05/1,000 chars and Multilingual at $0.10/1,000 chars — roughly half the effective rate implied by dividing the Creator-tier subscription price by its included credits ($0.09/$0.18 above). This likely reflects a difference between an overage/PAYG rate and the "included-credit" value on a subscription, but the two ElevenLabs pages don't reconcile cleanly. **Verify the actual current rate in the ElevenLabs dashboard/checkout before using this in a cost model** — this is a load-bearing number.

**Human-ness.** v3 (GA reported "early 2026") is cited as the most expressive/human-like of the three model tiers, particularly for multi-speaker, emotional narration. Flash/Turbo (the low-latency variants relevant here) trade some expressiveness for speed and were not separately benchmarked in this pass.

**Latency.** Not confirmed with a specific published TTFB figure in this research pass. ElevenLabs markets Flash/Turbo as low-latency but no primary-source ms number was verified — flag as unconfirmed pending a follow-up check of ElevenLabs' streaming/latency docs.

**Pipecat.** Yes — `pipecat.services.elevenlabs.tts.ElevenLabsTTSService`, supports model selection and mid-conversation settings updates via `TTSUpdateSettingsFrame`.

**Sources.** https://elevenlabs.io/pricing, https://elevenlabs.io/pricing/api, https://docs.pipecat.ai/server/services/tts/elevenlabs — fetched 2026-07-18, no "last updated" date visible on either pricing page.

---

## 3. Deepgram (Aura / Aura-2)

**Pricing** (flat per-character, no credit conversion needed):

| Model | Pay-as-you-go | Growth plan |
|---|---|---|
| Aura-2 | $0.030/1,000 chars | $0.027/1,000 chars |
| Aura-1 (older) | $0.0150/1,000 chars | $0.0135/1,000 chars |

$200 free credit for new accounts, applicable to TTS. Aura-2 is the cheapest of the nine TTS providers here on a raw per-character basis.

**Human-ness.** Not typically flagged as robotic; Deepgram markets Aura-2 as enterprise-grade with attention to naturalness, and cites a third-party benchmark (Coval) ranking it well on latency/consistency/cost. On the Artificial Analysis Realtime TTS Arena (~2026-05 snapshot), Aura-2 placed below the top tier occupied by Cartesia Sonic 3.5 and Inworld's models — competent and natural, not the most expressive.

**Latency.** Deepgram's own engineering blog states they brought Aura-2's steady-state time-to-first-byte down to ~90ms, with 95th percentile under 200ms ("How We Took Aura-2's TTFB from <200ms to 90ms," deepgram.com/learn). This is a first-party, technically detailed source — the best-sourced latency figure among the TTS providers researched here.

**Pipecat.** Yes — `pipecat.services.deepgram.tts.DeepgramTTSService`, described as "cost-optimized." Deepgram also publishes an official Pipecat integration guide.

**Sources.** https://deepgram.com/pricing, https://deepgram.com/learn/engineering-real-time-low-latency-voice-ai-at-scale, https://deepgram.com/learn/introducing-aura-2-enterprise-text-to-speech, https://developers.deepgram.com/docs/pipecat-integration — fetched 2026-07-18, no visible "last updated" date on the pricing page.

---

## 4. OpenAI TTS (gpt-4o-mini-tts)

**Official rate:** $0.60 per 1M input text tokens, $12.00 per 1M output audio tokens. OpenAI does not publish an official per-character or per-minute rate for this model.

**Two very different derived estimates:**
- **Naive/marketing estimate** (commonly repeated in secondary sources): ~$0.015/minute, assuming ~4 characters/token and roughly 1:1 input:output token ratio.
- **Empirical measurement** (S. Anand, published 2025-11-02): tokenized a 4,096-character input at 877 tokens (~0.21 tokens/char via OpenAI's o200k_base tokenizer), then found 1 input text token produced ~6 output audio tokens in practice — not 1:1. Actual billed cost for that test: $0.0652 for 4,096 characters and 268 seconds of audio, which works out to:
  - **~$0.159 per 1,000 characters**
  - **~$0.88 per minute of audio**

The two estimates differ by roughly 50x. A March 2025 OpenAI community forum thread corroborates real-world costs landing near "1.5 cents per minute" on some tests but "about double that" on short texts — high variance, and the community itself is confused why costs exceed the naive estimate. **For a conversational, short-utterance use case like this one, treat the empirical ~$0.16/1,000-chars figure as the safer planning basis**, not the marketing number.

**Human-ness.** Widely described as human-like and non-robotic due to "steerable"/"instructable" delivery — tone, emotion, pacing, and accent can be controlled via natural-language prompt instructions, including laughter and controlled shouting on demand. Some user reports (OpenAI developer forum) of unnaturally slow pacing with odd pauses in certain configurations.

**Latency.** No official published TTFB/TTFA number exists specifically for the standalone `gpt-4o-mini-tts` REST `/v1/audio/speech` streaming endpoint (the one Pipecat's `OpenAITTSService` uses). Note: a commonly cited ~212ms TTFA figure belongs to the separate Realtime API speech-to-speech model, not this standalone TTS endpoint — do not conflate the two.

**Pipecat.** Yes — `OpenAITTSService`, module `pipecat.services.openai`. Explicitly supports the `instructions` parameter for tone/affect control. HTTP streaming (no WebSocket), fixed 24kHz PCM output.

**Sources.** developers.openai.com/api/docs/models/gpt-4o-mini-tts, developers.openai.com/api/docs/pricing, s-anand.net/blog/openai-tts-cost (2025-11-02), community.openai.com/t/new-tts-api-pricing-and-gotchas/1150616 (2025-03), docs.pipecat.ai/server/services/tts/openai — fetched 2026-07-18.

**Caveats.** The $/token rate is official and current. The character/minute conversion is not officially published by OpenAI — the ~$0.16/1,000-char figure is empirically derived, not a guaranteed rate, and depends on speech density and rate.

---

## 5. Rime (streaming TTS)

**Pricing** (rime.ai/pricing, confirmed live):

- PAYG: **$0.05 per 1,000 chars**
- Starter: $5/mo for 100k chars → $0.05/1,000
- Developer: $19/mo for 500k chars → $0.038/1,000
- Pro: $99/mo for 3M chars → $0.033/1,000
- Business: $249/mo for 10M chars → $0.0249/1,000
- Enterprise: custom

At the stated volume (~100k–200k chars/month), expect $0.04–0.05/1,000 effective.

**Human-ness.** Rime markets heavily on conversational naturalness — its docs explicitly recommend including verbal fillers ("um," "uh," "so," "well") to mimic natural hesitation, and the company says its training data came from people talking naturally rather than voice actors reading scripts ("working audio" over "showroom audio"). However, on the Artificial Analysis TTS leaderboard (live, through July 2026), Rime's models rank mid-to-low: Coda #55 (ELO 1036), Arcana v3 #67 (ELO 1003), Mist V2 #81 (ELO 886) out of roughly 100 ranked models. **This is a meaningful gap between marketing claims and third-party blind-comparison scores.**

**Latency.** Rime advertises itself as a low-latency specialist, with claims ranging from ~175ms TTFB (cloud API) to sub-150ms (self-hosted) to sub-100ms (on-prem), depending on the source. An independent 2026 benchmark (Gradium) flags high latency variance for Rime's Mist-v3 and Arcana models, calling them "unsuitable for real-time voice agents" in that specific test — this directly contradicts Rime's own positioning and should be treated as an open tension, not resolved in Rime's favor.

**Pipecat.** Yes, and the richest integration of any provider researched: three service classes — `RimeTTSService` (WebSocket, word-level timing + interruption handling, best fit for conversational agents), `RimeHttpTTSService` (simpler HTTP, no timing/interruption), and `RimeNonJsonTTSService` (plain-text WebSocket for models like Arcana). Module: `pipecat.services.rime`. Supports Mist, Mist v2, Arcana, and Coda (shipped ~May 2026).

**Sources.** rime.ai/pricing, rime.ai/resources/new-pricing (2025-03-06, values match the current live page), artificialanalysis.ai/text-to-speech/leaderboard/provider-voice, rime.ai/resources/latency-and-the-speed-of-conversation, docs.pipecat.ai/server/services/tts/rime — fetched 2026-07-18.

**Caveats.** Pricing confirmed current for 2026. Latency claims are vendor-published and conflict with at least one independent benchmark on variance — worth an in-house TTFB test before committing.

---

## 6. PlayHT / PlayAI

**Status flag — likely not viable.** Multiple business-press sources (TechCrunch, Bloomberg, Engadget) report Meta acquired PlayAI on 2025-07-12. Secondary sources describe the public REST API halting new signups around 2025-07-26 and the platform being slated for retirement 2025-12-31, with voice clones and data deleted and no migration path. Countering this, docs.play.ht was reachable in this research pass but showed a "last updated 10 months ago" marker — consistent with a freeze shortly after the acquisition rather than active development. Direct fetches of play.ht/play.ai's own pricing page failed (DNS resolution errors) in this research pass, which could mean the domain is down or could be an environment-level network issue — not conclusively distinguishable.

**Pricing** (third-party sourced only, no live confirmation from PlayHT/PlayAI itself, last verified mid-2025):
- Free: 1,000 chars/month, no API access
- Creator: $31.20/mo (annual billing) for 3M chars/year → $374.40 / 3,000k = **$0.125 per 1,000 chars**
- Unlimited: $49–99/mo, uncapped with fair-use limits, no published per-char rate

**Human-ness / latency.** No independently verified naturalness or TTFB figures found in this research pass.

**Pipecat.** **No.** Confirmed by checking the live Pipecat GitHub services directory — no playht or playai module exists.

**Sources.** techcrunch.com/2025/07/13/meta-acquires-voice-startup-play-ai, docs.play.ht/reference/api-getting-started, voice.ai/hub/tts/play-ht-pricing (2025-07-10), github.com/pipecat-ai/pipecat/tree/main/src/pipecat/services.

**Recommendation.** Given stale/unconfirmed pricing, uncertain operational status, and no Pipecat support, PlayHT/PlayAI should likely be excluded from the shortlist or flagged "verify directly before use."

---

## 7. Inworld AI (Realtime TTS)

**Pricing** (inworld.ai/pricing, per-million-character rate converted to per-1,000):

| Model | On-demand | Down to (Enterprise/Growth) |
|---|---|---|
| Realtime TTS-2 (flagship) | $0.025/1,000 | $0.005/1,000 (enterprise) / $0.0125 (Growth, $1,500/mo tier) |
| Realtime TTS 1.5 Max | $0.035/1,000 | $0.0175/1,000 (Growth) |
| Realtime TTS 1.5 Mini (cheapest/fastest) | $0.015/1,000 | $0.007/1,000 (Growth) |

**Human-ness.** Consistently ranked at or near the top of both major public arenas. TTS-Arena (Hugging Face, via search snippet — the live JS-rendered table could not be directly fetched): "Inworld TTS MAX" ELO ~1579 (62% win rate), "Inworld TTS" ELO ~1571 (59% win rate). Artificial Analysis Speech Arena: Inworld Realtime TTS 1.5 Max leads with ~73% win rate, ELO ~1210, reported as #1 realtime TTS in a ~2026-05 snapshot (cited via MarkTechPost, a third-party outlet, rather than Inworld's own blog).

**Latency.** Vendor claims sub-200ms to <250ms P90 time-to-first-audio for TTS-2, WebSocket-native streaming. Not independently benchmarked in this research pass.

**Pipecat.** Yes — dedicated module `pipecat.services.inworld.tts`, documented directly at docs.pipecat.ai. Inworld also published a blog post specifically about the Pipecat integration.

**Sources.** https://inworld.ai/pricing, https://docs.pipecat.ai/server/services/tts/inworld, https://artificialanalysis.ai (arena data via MarkTechPost, ~2026-05) — fetched 2026-07-18.

**Caveats.** Multiple model families with different price/quality tradeoffs — pick the specific model before costing. Latency and some ranking numbers rely partly on Inworld's own marketing pages; cross-check against neutral benchmarks where precision matters.

---

## 8. Hume AI (Octave)

**Pricing** (per character, confirmed unit — not per-second):

| Tier | Included chars/mo | Overage $/1,000 |
|---|---|---|
| Free | 10,000 | $0.15 |
| Starter (~$3–14/mo, verify at checkout) | 30,000 | $0.12 |
| Creator | 140,000 | $0.15 |
| Pro | 1,000,000 | $0.12 |
| Scale | 3,300,000 | $0.10 |
| Business | 10,000,000 | $0.05 |
| Enterprise | custom | — |

Note the overage rate is not monotonically improving (Creator's $0.15/1,000 is worse than Starter's $0.12/1,000) — this may be a plan-naming artifact, verify directly. A third-party site (CloudPrice) cites $7.60/1M chars for Octave 2, which conflicts sharply with the official table above ($50–150/1M) and could not be reconciled — treat the official hume.ai/pricing table as authoritative.

At the stated volume, a 2-minute conversational turn generates well under 10,000 characters, so "a few dozen" sessions/week likely stays within the Free or Starter monthly allotment — verify against real session transcripts.

**Human-ness.** Hume markets Octave explicitly as "Text-to-Speech with Emotional Intelligence," with text-embedded emotional/acting direction (e.g., "say this sarcastically") — a differentiated capability, not just marketing copy. On TTS-Arena (search-snippet sourced): rank ~#6, ELO ~1561, 64% win rate. On Artificial Analysis: Octave 2 ELO 1055 (rank 46), Octave v1 ELO 1024 (rank 62) — notably lower placement than on TTS-Arena and lower than Inworld on the same leaderboard. **This is a meaningful discrepancy between the two arenas**, possibly reflecting that emotional-expressiveness scores differently than raw naturalness. Net: emotion control is Hume's most distinctive strength; general "human-like realism" ranking is mixed/lower than Inworld's.

**Latency.** Search-sourced (not from a directly fetched official page): Octave 2 / EVI 3 claimed 150–200ms TTFB, with an "Instant mode" as low as ~100ms generation latency (excludes network transit). A third-party comparison (Coval, 2026) places Hume in the "upper range" of latency, behind Cartesia, Deepgram, Rime, and ElevenLabs Flash v2.5, which publish sub-100ms TTFB.

**Pipecat.** Yes — `HumeTTSService`. Hume also documents the integration directly (dev.hume.ai/docs/integrations/pipecat), noting it streams at 48kHz and the pipeline's audio_out_sample_rate should be matched.

**Sources.** https://www.hume.ai/pricing, https://hume.ai/octave, https://dev.hume.ai/docs/integrations/pipecat — fetched 2026-07-18.

---

## 9. MiniMax (Speech / T2A API)

**Reachability and English support.** The international platform (platform.minimax.io) has English-language docs, console, and API reference, distinct from a separate mainland-China product. Pipecat, LiveKit, and Agora all ship dedicated English-capable MiniMax integrations, implying English output is a standard supported path, not an edge case. Email-based signup appears available without a hard requirement for a Chinese phone number, based on search-derived summaries — not independently confirmed by completing signup.

**Pricing — weakest data point of all nine providers.** MiniMax's official pricing page (platform.minimax.io/docs/guides/pricing-speech) denominates plans in "audio points" with no published points-to-characters conversion formula found despite multiple fetch attempts. No authoritative official per-character price could be obtained. Third-party figures (Artificial Analysis, WaveSpeedAI, fal.ai, pricepertoken.com) cluster around:
- Speech-02/2.6/2.8-Turbo: ~$0.06/1,000 chars ($60/1M)
- Speech-02/2.6/2.8-HD: ~$0.10/1,000 chars ($100/1M)
- T2A-01-Turbo (older, cheapest): ~$0.03/1,000 chars ($30/1M)
- T2A-01-HD (older): ~$0.05/1,000 chars ($50/1M)

Resellers disagree by up to 2x for the same model (WaveSpeedAI: $0.03/1,000 for Speech-02-Turbo vs. fal.ai: $0.06/1,000). **Treat $0.03–$0.10 per 1,000 chars as an approximate range from secondary sources only — not confirmed by MiniMax directly.**

**Human-ness.** Mid-pack on both arenas. Artificial Analysis: best MiniMax model is Speech 2.8 HD at ELO 1180 (rank 8), down to T2A-01-Turbo at ELO 1021 (rank 63) — below Inworld's top models, roughly comparable to or slightly above Hume's Octave models. TTS-Arena (search-snippet): Speech-02-Turbo ~rank #7 (ELO ~1542), Speech-02-HD ~rank #8 (ELO ~1540). No emotional-control marketing angle comparable to Hume; reputation is competent, mid-pack naturalness.

**Latency.** No published TTFB or latency claims found from official sources or independent benchmarks in this research pass — a genuine gap, not a guess.

**Pipecat.** Yes — `MiniMaxHttpTTSService`, supporting speech-2.6-hd, speech-2.6-turbo, speech-02-hd, speech-02-turbo, speech-01-hd, speech-01-turbo, with configurable emotions and audio settings.

**Sources.** platform.minimax.io/docs/api-reference/speech-t2a-http, platform.minimax.io/docs/guides/pricing-speech, artificialanalysis.ai/text-to-speech/model-families/minimax-hailou, docs.pipecat.ai/server/services/tts/minimax — fetched 2026-07-18.

**Recommendation.** Resolve the pricing gap with a direct test account before using MiniMax in a final cost model; treat current numbers as rough planning estimates only.

---

## 10. OpenAI Realtime API (gpt-realtime-2.1) — speech-to-speech alternative

**Model.** gpt-realtime-2.1 is the current flagship as of mid-2026 (successor to gpt-realtime-2, released 2026-05-08, which itself succeeded the original gpt-realtime GA model from August 2025). A cheaper `gpt-realtime-2.1-mini` variant also exists.

**Audio token pricing — flagship (gpt-realtime-2.1):**
- Input: $32.00 per 1M tokens (cached input: $0.40 per 1M tokens — ~98.75% discount)
- Output: $64.00 per 1M tokens

**Audio token pricing — mini (gpt-realtime-2.1-mini):**
- Input: $10.00 per 1M tokens (cached: $0.30 per 1M tokens)
- Output: $20.00 per 1M tokens

**Tokens-per-minute conversion** (from OpenAI's Realtime cost-management docs): user (input) audio billed at 1 token per 100ms → 600 tokens/minute. Assistant (output) audio billed at 1 token per 50ms → 1,200 tokens/minute (output is billed at twice the token density of input).

**Per-minute math, flagship:**
- Input: $32/1M × 600 tokens/min = **$0.0192/min**
- Output: $64/1M × 1,200 tokens/min = **$0.0768/min**
- Combined (1 min user speech + 1 min assistant speech, no caching): **~$0.096/min**

**Per-minute math, mini:**
- Input: $10/1M × 600 = **$0.006/min**
- Output: $20/1M × 1,200 = **$0.024/min**
- Combined: **~$0.03/min**

**Independent cross-check.** Artificial Analysis lists OpenAI realtime audio pricing as $1.15/hour input, $4.61/hour output — dividing by 60 gives $0.0192/min and $0.0768/min, exactly matching the token math above. Strong confirmation the flagship per-token rate is correct as of mid-2026.

**Important caveat — real-world cost is much higher than the token-math floor.** Because the Realtime API resends growing conversation context each turn before caching applies, and includes silence/VAD overhead, third-party measured sessions (callsphere.ai, tokenmix.ai — not independently verified against raw session logs) report **$0.18–$0.46/min uncached**, dropping to **$0.04–$0.10/min** once prompt caching and tool-output trimming are applied. Treat the $0.096/min combined figure as a best case, not a typical session cost — for a 2-minute conversational session, plan around the higher uncached range unless caching is specifically implemented.

**Text token pricing (system prompts etc.):**
- Flagship: $4.00/1M input ($0.40/1M cached), $24.00/1M output
- Mini: $0.60/1M input ($0.06/1M cached), $2.40/1M output

**Related but out-of-scope models** (priced per-minute, not full speech-to-speech): `gpt-realtime-translate` ($0.034/min), `gpt-realtime-whisper` (transcription only, $0.017/min).

**Latency reputation.** Per Artificial Analysis (2026 data), time-to-first-audio ranges 0.82–2.33 seconds depending on model and reasoning-effort setting — gpt-realtime-1.5 fastest at 0.82s, gpt-realtime-2 at "high" reasoning slowest at 2.33s (1.12s at "minimal" reasoning). A third-party comparison (Impekable blog) states a competitor's voice agent runs nearly 2x faster than gpt-realtime-2 at high reasoning effort — **OpenAI is not the 2026 latency leader**, though it remains within a generally usable range for conversational agents.

**Voice quality / human-ness.** Artificial Analysis metrics: Conversational Dynamics (turn-taking, pauses, interruption handling) ~95–96%; Speech Reasoning (Big Bench Audio) 93–97% depending on reasoning effort. Separately, Artificial Analysis's TTS-quality ELO puts gpt-realtime-2 at ~1,060, which several secondary sources describe as **below most standalone/dedicated TTS models** — good conversational dynamics, but not the most natural-sounding voice on the market. New Cedar and Marin voices (introduced with gpt-realtime-2) are reported to have improved prosody and more natural pause/filler handling versus earlier realtime voices.

**Pipecat.** Yes, officially supported as a full speech-to-speech service. Docs at docs.pipecat.ai/server/services/s2s/openai. Current recommended class is `OpenAIRealtimeLLMService` (`pipecat.services.openai.realtime.llm`), default model recently updated to gpt-realtime-2. The older `OpenAIRealtimeBetaLLMService` still exists but is deprecated.

**Sources.** developers.openai.com/api/docs/pricing, developers.openai.com/api/docs/models/gpt-realtime-2.1, developers.openai.com/api/docs/guides/realtime-costs (source of the 100ms/50ms token-conversion rate), aireiter.com/blog/openai-realtime-api-pricing (2026-07-09, states "verified against OpenAI pricing page"), artificialanalysis.ai/speech-to-speech, docs.pipecat.ai/server/services/s2s/openai — fetched 2026-07-18.

**Caveats.** Raw HTML for openai.com/index/introducing-gpt-realtime/ returned 403 Forbidden and platform.openai.com/docs/guides/realtime redirected without pricing content, so pricing was confirmed via the dedicated pricing page plus two independent cross-checks (model page, third-party tracker, Artificial Analysis $/hour figures) rather than a single raw fetch. Model release dates came from a Latent Space article, not directly fetched OpenAI pages (a couple of OpenAI model pages returned garbled/implausible dates through the summarizer and were discarded as likely rendering artifacts). All pricing is current as of 2026-07-18 access; no 2025-only fallback was needed.

---

## Cross-cutting notes for the cost calculation

1. **Two numbers need direct verification before finalizing any cost model:** ElevenLabs' effective per-1,000-char rate (two ElevenLabs pages disagree by ~2x) and MiniMax's per-character rate (no official conversion from "audio points" was found; only third-party estimates exist).
2. **Arena rankings (TTS-Arena, Artificial Analysis) are volatile point-in-time snapshots**, not stable rankings — several were sourced from search snippets rather than directly fetched live tables (the Hugging Face TTS-Arena space is JS-rendered and did not return full data via WebFetch). Directionally, Inworld ranks consistently at or near the top across both arenas; Rime and MiniMax rank mid-pack despite marketing claims to the contrary; Hume's placement diverges sharply between the two arenas (higher on TTS-Arena, mid-table on Artificial Analysis).
3. **Latency claims are almost entirely vendor- or third-party-published, not independently benchmarked** by this research. Deepgram's TTFB figure is the best-sourced (first-party engineering blog with methodology), and OpenAI Realtime's latency is the best-sourced overall (independent Artificial Analysis benchmark with a clear range). For the others, budget time for an in-house TTFB test with real network conditions before committing to a vendor for a latency-sensitive use case.
4. **PlayHT/PlayAI should likely be dropped from the shortlist** — pricing is stale (mid-2025), operational status post-Meta-acquisition is unconfirmed, and there is no Pipecat integration.
5. For a low-volume workload (a few dozen 2-minute sessions/week), absolute monthly cost differences between providers are small in dollar terms even though the per-1,000-char rates span roughly 5x (Deepgram Aura-2 at ~$0.03 to OpenAI gpt-4o-mini-tts's empirical ~$0.16). Model/latency/human-ness fit likely matters more than price at this volume — cost becomes decisive only if volume scales up significantly.
