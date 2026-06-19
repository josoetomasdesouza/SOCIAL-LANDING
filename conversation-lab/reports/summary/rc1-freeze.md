# RC1 Freeze

Generated at: 2026-06-13

## Status

Conversation Intelligence is frozen as RC1.

This is not a new improvement cycle. No behavior changes were made for this freeze beyond adding the RC command and documentation.

## RC1 Validation Targets

Regression:

- Satisfaction: 97%
- P0: 12
- P1: 11
- invented_data: 0
- no_leak: 0

Real-agent:

- Satisfaction: 93%
- P0: 34
- P1: 33
- invented_data: 0
- no_leak: 0

## Command Added

- `pnpm conversation:lab:rc`

It runs:

1. `pnpm typecheck`
2. `pnpm conversation:lab:regression`
3. `pnpm conversation:lab:real`

Rule: no new improvement cycle can start unless `pnpm conversation:lab:rc` passes.

## Main Cycles Included In RC1

- Conversation Intelligence foundation and conductor.
- LLM-first brain and provider/fallback shape.
- Universal conversational agent with topic/tool separation.
- Question Satisfaction Layer.
- Conversation Lab and permanent regression datasets.
- Memory cycle for short follow-ups.
- Cross-vertical operational fail-closed.
- Final hardening for leak prevention and short follow-up arbitration.
- Baseline consolidation.
- Controlled naturalness-cycle limited to response composer / tonalidade.

## Critical Files

- `lib/conversation-intelligence/`
- `conversation-lab/scripts/`
- `conversation-lab/generators/golden-regression-loader.ts`
- `conversation-lab/datasets/golden/`
- `conversation-lab/reports/baselines/`
- `conversation-lab/reports/summary/`
- `package.json`

## Residual Risks

- Random real-agent scenarios still expose some cross-vertical and short-follow-up failures.
- Some evaluator/tool-use expectations are stricter than fail-closed textual correctness.
- Naturalness has remaining P2/P3 repetition, especially in sports and acknowledgements.
- Live providers are still needed for current data and transactional confirmations.

## Unlock Criteria

A new cycle is allowed only if:

- `pnpm conversation:lab:rc` passes immediately before starting.
- Scope is narrow and explicitly excludes unrelated layers.
- Regression P0/P1 do not increase.
- Real-agent P0/P1 do not increase.
- invented_data remains 0.
- no_leak remains 0.
- Fail-closed behavior is preserved.

Any proposed work that touches Question Contract, Topic Manager, Tool Router, OperationalIntentResolver, Memory, Evaluators, UI, or fail-closed rules must be treated as a separate explicit cycle, not as continuation of RC1 freeze.
