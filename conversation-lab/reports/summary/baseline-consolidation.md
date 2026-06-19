# Baseline Consolidation

Generated at: 2026-06-14T00:40:55.066Z

## Objective

Stop broad auto-correction cycles and freeze the approved Conversation Lab baseline as a stable regression target before any new improvement cycle.

Approved baseline:

- Satisfaction: 87%
- P0: 61
- P1: 96
- P2: 6
- P3: 4
- invented_data: 0
- no_leak: 0

## Commands Added

- `pnpm conversation:lab:regression`

This command runs only permanent golden datasets through the real Social Landing conversational agent. It does not generate new synthetic/random scenario seeds.

Implementation detail: Conversation Lab scripts now use local `tsx` instead of `npx --yes tsx`, because `npx` failed with `ECOMPROMISED` during validation. `tsx` is now a local dev dependency and `esbuild` build approval was registered through pnpm.

## Validation Results

### Typecheck

- Command: `pnpm typecheck`
- Result: PASS

### Regression Set

- Command: `pnpm conversation:lab:regression`
- Conversations: 121
- Turns: 285
- Satisfaction: 97%
- P0: 12
- P1: 42
- P2: 2
- P3: 0
- Failures: `conversation-lab/reports/failures/2026-06-14T00-40-38-301Z-latest.json`

### Real-Agent Set

- Command: `pnpm conversation:lab:real`
- Conversations: 151
- Turns: 825
- Satisfaction: 87%
- P0: 61
- P1: 96
- P2: 6
- P3: 4
- Failures: `conversation-lab/reports/failures/2026-06-14T00-40-55-066Z-latest.json`

## Golden Vs Random Difference

The regression set is the permanent baseline:

- 121 golden conversations
- 285 turns
- 97% satisfaction
- P0 12 / P1 42

The real-agent run adds generated scenarios on top of goldens:

- 151 total conversations
- 825 turns
- 87% satisfaction
- P0 61 / P1 96

Delta from regression-only to full real-agent:

- Satisfaction: -10 points
- P0: +49
- P1: +54
- P2: +4
- P3: +4

Interpretation: goldens are much more stable than random/generated coverage. The random layer is useful for discovery, but it should not be used as the sole merge gate for small targeted cycles.

## Baseline Artifacts

- Baseline snapshot: `conversation-lab/reports/baselines/baseline-2026-06-13.md`
- Residual triage: `conversation-lab/reports/triage/residual-failures.md`
- Final hardening report: `conversation-lab/reports/summary/final-hardening-cycle.md`

Golden files included in regression:

- `conversation-lab/datasets/golden/auto-regressions.jsonl`
- `conversation-lab/datasets/golden/topic-continuity-regressions.jsonl`
- `conversation-lab/datasets/golden/question-contract-regressions.jsonl`
- `conversation-lab/datasets/golden/conversation-memory-regressions.jsonl`
- `conversation-lab/datasets/golden/cross-vertical-operational-regressions.jsonl`
- `conversation-lab/datasets/golden/final-hardening-regressions.jsonl`

## Auto-Runner Guards

`conversation:lab:auto` now has baseline protection:

- Blocks automatic execution if `conversation-lab/reports/baselines/baseline-2026-06-13.md` does not exist.
- Runs `conversation:lab:regression` before accepting a cycle.
- Rejects cycles that increase P0 or P1 in the regression set.
- Rejects cycles that increase invented data or internal leaks.
- Rejects cycles that increase fail-closed risk.
- Blocks evaluator changes unless `CONVERSATION_LAB_EVALUATOR_CHANGE_JUSTIFICATION` is provided.

## Overfitting Risks

- Goldens can become too tailored to known failure strings.
- Random scenarios still expose failures not fully represented in permanent datasets.
- Tool-use labels can drift from answer correctness when a fail-closed textual answer is acceptable.
- Naturalness failures may be hidden if future work only optimizes evaluator phrases instead of improving response composition.

## Next Allowed Cycle

Only `naturalness-cycle` is allowed next, and only under these constraints:

- Do not alter Question Contract.
- Do not alter Topic Manager.
- Do not alter Tool Planning.
- Work only in Response Composer / tonality.
- Keep `pnpm conversation:lab:regression` PASS.
- Do not increase P0/P1 in regression.
- Do not weaken fail-closed behavior.

Recommendation: before changing tone, add a small naturalness-specific report that samples the 70 P1 macro-like responses from the full real-agent run and groups them by reusable response-composer patterns.
