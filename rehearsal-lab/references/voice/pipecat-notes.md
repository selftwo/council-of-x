# Pipecat notes — what it is and how it reshapes the harness

Researched 2026-07-18 from https://docs.pipecat.ai (Sonnet subagent mined the docs; reviewed and condensed here by Fable). Pipecat moves fast; re-verify class names at build time.

## Mental model

- Python framework for real-time voice agents. Server runs a **Pipeline** = ordered list of **FrameProcessors**: `transport.input() → stt → context_aggregator.user() → llm → tts → transport.output() → context_aggregator.assistant()`.
- **Frames** are the data units (audio, transcription, LLM text, control). Frames pass through every processor, so you can tap the stream anywhere (recording, metrics) without disturbing it.
- STT, LLM, TTS are swappable "services" behind common base classes. Switching providers is a constructor swap, not a pipeline rewrite.
- **Transports** carry audio between client and server: SmallWebRTC (peer-to-peer, no cloud account, the local-dev default), Daily, WebSocket. Local dev = browser tab at localhost:7860 talking WebRTC to the Python process.
- The dev runner (`pipecat.runner.run`, FastAPI) lets the same `bot()` run locally and in production without code changes.

## DeepSeek plugs in directly

- `DeepSeekLLMService` ships with Pipecat (subclass of `OpenAILLMService`; default base_url api.deepseek.com/v1). Docs warn: DeepSeek does not support `seed` or `max_completion_tokens`; use `max_tokens`.
- Our calibrated persona prompts carry over unchanged: the context object fed to `LLMContextAggregatorPair` is the same system-prompt + messages shape spar.mjs sends today.
- **Verify at build time**: Pipecat's docs say nothing about `thinking: { type: "disabled" }`, which we know is mandatory for v4 flash (reasoning drains max_tokens). Must confirm it can be passed through (settings/extra body); if not, we subclass the service. This is the number one integration risk.

## Turn-taking and interruption (matters a lot for Ben's use case)

- Silero VAD locally; `stop_secs` (default 0.2) is the main perceived-latency lever, but changing it invalidates Pipecat's pre-measured per-provider STT latency numbers (re-run their stt-benchmark if tuned).
- **Smart Turn v3** is the default turn-end detector: an on-device model judging linguistic completeness, not just silence. There is also a filter layer that classifies a stopped turn as complete / incomplete-short (wait 5s) / thinking (wait 10s). For a user who rambles, loops, and pauses mid-thought, this layer is the difference between a partner that interrupts his processing and one that waits — treat its tuning as part of calibration.
- Interruptions default on: user speech cuts the bot's in-flight TTS. Keep on; being talked over and pushing through it is part of the practice.
- Quickstart claims sub-1s full round trip with Deepgram + Cartesia.

## Observability — everything our eval loop needs exists

- `PipelineParams(enable_metrics=True, enable_usage_metrics=True)` emits MetricsFrames: per-service TTFB, TTS time-to-first-audio, LLM token usage **including cache metrics** (our DeepSeek cache-hit signal), TTS character counts.
- `UserBotLatencyObserver`: the gap from user-stops-speaking to bot-starts-speaking. This is the single number that decides whether voice feels like a conversation; it goes in every voice run report.
- Transcripts: `on_user_turn_stopped` / `on_assistant_turn_stopped` events deliver one object per turn with `.content`, `.timestamp`, and (assistant) `.interrupted`. No built-in export; you write the handler. That is good: we write lines in our exact transcript.jsonl schema.
- `AudioBufferProcessor` records audio: composite, separate user/bot tracks, or per-turn clips (raw PCM → WAV). Ben wants full recordings both sides for the active-learning layer; this is the hook.

## Docs' recommended defaults

STT: **Deepgram** ("fast, accurate streaming"). TTS: **Cartesia** (WebSocket, word timestamps used for precise context truncation on interruption; ElevenLabs and Rime also give word timestamps). Same pair the quickstart wires by default.

## How the harness reshapes (decided direction)

1. **Node stays the source of truth.** Prompt versioning, run folders, checks.mjs, judge.mjs, report.mjs, canvas: unchanged. A voice run is just another `runs/<id>/` folder.
2. **A thin Python bot joins the lab** (`voice/bot.py`, uv-managed): Pipeline = SmallWebRTC → Deepgram STT → DeepSeekLLMService → Cartesia TTS. It takes the scenario file path as an argument, loads the same prompt spar.mjs would, and writes `transcript.jsonl` in our existing schema plus voice fields (`interrupted`, `user_bot_latency_ms`, per-service TTFB, audio file refs).
3. **checks.mjs and judge.mjs run unmodified** on voice transcripts. New voice-only checks get added to checks.mjs (e.g. reply length matters more when spoken; latency budget check), not to a second system.
4. **Pipecat's own eval system** (`pipecat eval`, YAML scenarios, text or audio mode) is NOT adopted as judge — ours already encodes the calibration knowledge. But its audio mode solves "drive a running bot with synthesized speech, no human" — study that mechanism when we want scripted voice regression runs (mocked-Ben turns spoken by a TTS voice into the pipeline).
5. Metrics correlation (MetricsFrame → turn boundaries) is real but bounded work in bot.py; plan it, don't assume it's free.

## Local run on the Mac

Python 3.11+, `uv tool install "pipecat-ai[cli]"`, `pipecat init`, `uv run bot.py`, open localhost:7860/client, press connect. No cloud account needed (SmallWebRTC). Keys via .env, same non-negotiable handling rules as the text harness.
