# Start here — session playbook

Orientation for any Claude session (or Ben) picking up the lab.

## 1. Get current

- Open the canvas: `node harness/serve.mjs` then http://localhost:4790/canvas/index.html (or `.claude/launch.json` name `rehearsal-lab-canvas`). It shows the now-list, all runs with scores, decisions, and file links.
- Read decisions.md `## now` for the active focus. Read the latest run's report.html before touching anything.

## 2. Run a calibration cycle

```
cd rehearsal-lab
node harness/spar.mjs --scenario scenarios/shreyas-sparring.md --turns scenarios/turns-samples/<turns>.txt
node harness/judge.mjs runs/<the new run id>
node harness/report.mjs runs/<the new run id>
```

Then: read eval.md, apply the top prompt fixes to the scenario file in scenarios/, rerun the same turns file, and compare the two reports (report.html shows the prompt diff and score deltas automatically).

Interactive mode (Ben at the keyboard): drop `--turns`, type turns, `/quit` to end, then judge and report the run as usual.

## 3. Write new material

- New scenario: copy the shape of scenarios/shreyas-sparring.md (frontmatter title/description/opening + system prompt). Ground the persona in coaching/ extracts and personas/catalog.md. Include the conversation rules block (no em dashes or asterisks, one question per reply, short spoken replies) and a debrief mode that names sources and comments on pacing.
- New turns file: one user turn per line, `#` for comments, written in Ben's dictated register with deliberate failure modes for the persona to catch (see coaching/coaching-map.md anti-behaviors).
- Record anything decision-level in decisions.md (dated entry + impact line), then `node harness/canvas.mjs`.

## 4. Close the session

Update decisions.md `## now` if the focus moved. Make sure the last run has a report. The summary to Ben links the canvas and the newest report; every claim must be verifiable there.
