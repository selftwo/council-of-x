# Rehearsal — voice sparring prototype

Practice difficult work conversations and product thinking out loud, against personas grounded in the council corpus. Tier 1 as of 2026-07-18 evening: DeepSeek v4 flash brain, Gemini TTS/STT tested and benchmarked, cost metering with a hard budget cap.

## Run it

```
node prototypes/rehearsal-voice/server.mjs
```

Open http://localhost:7860 in Chrome, allow the mic, wear headphones. Keys are read from `prototypes/.env` (and `prototypes/rehearsal-voice/.env`, which overrides). Currently set: Gemini, DeepSeek.

## Current best real-time stack (measured, not guessed)

Web Speech STT (browser, free) → **DeepSeek v4 flash** streaming with server-side history and prompt caching → sentence chunking → browser speechSynthesis. Voice-to-voice roughly 2.5 to 4s. The Gemini voices are selectable in the UI to hear quality, but they are not real-time (numbers below).

## Benchmark record (2026-07-18, this machine)

| Component | Latency | Cost observed | Verdict |
|---|---|---|---|
| DeepSeek v4 flash, warm turn | 1.9 to 3.5s first token, +~0.1s to first sentence | ~$0.00007 to $0.00017 per turn (caching works: 640/842 input tokens cached) | **Keep as brain.** Cheap, character quality high. TTFT is the api's baseline, not payload size. |
| `claude` CLI (tier 0 fallback) | ~3.8s first token warm | subscription | Fallback only. |
| Gemini 2.5 flash TTS (batch) | 4.4s (short sentence) to 7s (two sentences) | ~$0.0017 per sentence pair | Not real-time. Good voice for async use. |
| Gemini 3.1 flash TTS (batch) | 8.5 to 13.5s | ~$0.005 per call | Not real-time. |
| Gemini 3.1 flash TTS (streaming, interactions API) | **6.6 to 7.7s to FIRST audio chunk** | ~$0.004 per call | Streaming does not fix it; the model thinks before speaking. Ruled out for the loop. |
| Gemini 3.5 flash STT (batch transcription) | 9.0s for an 8s clip | ~$0.00013 per call | Word-perfect transcript, hopeless latency. Ruled out for the loop. |
| Browser speechSynthesis | ~instant | free | Default voice until a real conversational TTS key exists. |
| Browser Web Speech STT | streaming, endpointing not tunable | free | Default STT for now. |

### Spend audit (2026-07-18, reconciled against the ledger)

- Ledger (`usage.log`) sums: DeepSeek 16 calls $0.0015, Gemini 2.5 TTS 13 calls $0.0126, Gemini 3.1 TTS 6 calls $0.0240, Gemini STT 1 call $0.0001.
- DeepSeek dashboard shows ~22 requests vs 16 metered: the missing 6 were the calls that failed client-side during the `Readable.fromWeb` bug. They were billed by DeepSeek but crashed before metering. Estimated ~$0.0006. Fixed: failed turns now meter an estimate.
- Real DeepSeek spend: about $0.002 total. Matches "well under $0.01".
- **The Gemini key is on the free tier** (429 says `generate_content_free_tier_requests, limit: 10` for 2.5 TTS). The ~$0.037 of Gemini "spend" in the ledger is what it would have cost; the dashboard should show $0. The ledger keeps pricing it so the numbers are ready when billing is enabled. Free-tier limits are the real constraint: roughly 10 requests/min on 2.5 TTS, so a long reply plus prefetch can briefly 429 and fall back to the browser voice (the UI says so when it happens).
- Gemini streaming TTS returns no usage metadata; those calls are estimated at 25 tokens per audio second, marked `usage_estimated`.

## Cost controls

- Every paid call is metered from real usage fields where available, priced from the table in `server.mjs`, appended to `usage.log`.
- `REHEARSAL_BUDGET_USD` (default $2.00) is a hard cap: paid endpoints return HTTP 402 once total spend crosses it.
- The UI shows per-turn cost and running session spend.

## Deliberate-pace mode (added 2026-07-18 evening)

The user decided pauses are a feature: tough conversations are practiced slowly. Changes:

- **Style-directed Gemini TTS**: the TTS prompt now carries a performance direction ("speak as a real person… slow, deliberate, natural pauses, not narration"). This is the documented way to get intonation out of Gemini TTS; the plain text before sounded like an announcer. Measured: the same two-sentence line renders ~13s of slow audio on 3.1. Override per call with `style` in the `/api/tts` body.
- **Sentence prefetch**: while one sentence plays, the next two are already synthesizing, so inter-sentence gaps shrink to the chosen 400ms breathing pause instead of full TTS latency. First sentence still costs full latency (~5s on 2.5); accepted.
- **Browser voice slowed** to rate 0.92 with the same 400ms pauses, and TTS failures now surface in the UI instead of silently falling back.
- **Coach whisper** (`/api/coach`, checkbox in UI): after each exchange, a second cheap DeepSeek call (thinking disabled, ~1.3s, ~$0.00002) whispers one text-only hint grounded in named corpus voices (Kao, Fournier, Evans, Gupta, Doshi…). Shown dimly under the persona's turn, never spoken, never seen by the persona.
- **Personas updated**: unhurried register, comfort with silence, and explicit named references (Shreyas persona teaches its vocabulary; Rajan's debrief attributes each principle to its source).

## What we learned about the architecture

The stitched pipeline's weak links are now precisely known: the brain costs ~2s (DeepSeek network baseline) and the only free voice is robotic. Gemini's TTS family is narration-grade, not conversation-grade; no amount of orchestration fixes a model that takes 6+ seconds to start speaking.

## Next steps, in order

1. **Local Parakeet ASR** (v3, via sherpa-onnx or MLX): replaces Web Speech, gives tunable endpointing and ~100 to 300ms local transcription. This is the STT plan; Gemini STT is ruled out.
2. **Gemini Live API experiment** (`gemini-2.5-flash-native-audio` / 3.1 flash live): the one untested Gemini path, and the only one designed for sub-second voice. It is speech-to-speech, so Gemini replaces DeepSeek as the brain in that variant; persona goes in the system instruction. Worth one session to compare feel; free-tier friendly. Build as a separate page (`live.html`) using their WebSocket API.
3. **A real conversational TTS key** if the stitched path wins: ElevenLabs Flash or Cartesia Sonic (~75ms first audio). This is the single biggest "feels human" upgrade money can buy in this pipeline.
4. Session transcripts + debriefs saved into `council/` as practice logs.

## Scenarios

`scenarios/*.md`: frontmatter (`title`, `description`, `opening`) + system prompt body. Current: `stakeholder-pushback` (Rajan, skeptical enterprise VP; behavior encodes Wes Kao / Camille Fournier / Ethan Evans / Anneka Gupta principles; winnable if played well), `shreyas-sparring` (product thinking partner grounded in his episodes: pre-mortems, tigers, three levels, conviction quality). Add scenarios by copying a file.

## Known limitations

- LLM output occasionally leaks markdown emphasis or em dashes into spoken text; a strip pass before TTS would clean it.
- No mid-turn cancel to the LLM on barge-in (reply drains silently server-side).
- One session at a time, localhost only.
