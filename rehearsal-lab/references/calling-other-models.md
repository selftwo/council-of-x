# Calling other models from this lab

How Claude (the orchestrator) delegates to non-Anthropic models, and why. Companion: [model-prompting-research.md](model-prompting-research.md) for per-model steering rules.

## Why

Two reasons, in priority order:
1. **Judge diversity for evals.** A single judge model has blind spots and house biases. A second judge from a different lab (GPT-5.6 via Codex) catches disagreements; where judges disagree, a human (Ben) decides, and that decision becomes a labeled example for judge calibration (Hamel Husain's validate-evaluator method, see sources/evals-skills).
2. **Grunt execution.** Mechanical, well-specified work (batch transforms, image generation, computer use) can go to Codex workers while the main thread keeps judgment work.

## Codex (GPT-5.6) — verified working

CLI `codex` is on PATH. Billing is separate from Claude. Full instructions: `/Users/corphr.software/Documents/Codex/2026-07-16/how/outputs/claude-codex-gpt56/use-codex.md` plus the codex-review, codex-implementation, codex-computer-use skills there.

Direct invocation (works outside git repos):
```
codex exec -m gpt-5.6-terra -c 'model_reasoning_effort="medium"' \
  --ephemeral --skip-git-repo-check --sandbox read-only \
  -o <report-file> - < <prompt-file>
```

- Model routing: **luna** fast recon and mechanical checks, **terra** everyday implementation and judging, **sol** hard judgment only. Effort low/medium/high; never default to xhigh+.
- Long calls: run in background with `-o` report file, then read the report.
- Codex sessions have shell, apply_patch, browser, and native image generation. For image assets: give exact output filenames and require shell verification (existence, PNG validity) before it reports done.
- Prompting per the research: state each instruction exactly once; GPT-5.6 is concise by default; don't re-state rules.
- In this lab: `node harness/judge.mjs runs/<id> --judge codex` runs the same failure-mode judging through gpt-5.6-terra and writes `eval-codex.md` + `eval-codex.json` beside the Claude eval. Reports show both.

## Grok / Imagine — backup for media

`grok` CLI at `~/.grok/bin/grok`; the global use-grok-imagine skill and `~/documents/work/claude-design/use-grok.md` have exact invocations. Needs `XAI_API_KEY` or a `grok login` cache; preflight before promising media. Order for generated media: Codex first, Grok as backup. Exact UI, real copy, charts, and labeled diagrams stay in code, never generated images.

## Not wired yet (deliberately)

DeepSeek as judge (conflict: it's the brain being judged — never let a model judge itself), Gemini (dropped), Kimi/GLM (no accounts). If we add any, bank their steering rules from the research doc first.

## Rules

- Judges never see anything they could mine for the answer (no eval.json from other judges in their prompt, no prior scores).
- Pin model ids in judge calls; record the judge model in every eval.json.
- Anything a delegated model writes gets reviewed here before it lands in the lab.
- Keys and auth stay out of prompts and transcripts, always.
