# Naturalness Cycle

Generated at: 2026-06-14T00:46:53.665Z

## Objective

Improve unnatural but otherwise correct responses without changing comprehension, topic management, question contracts, tool planning, operational intent, memory, evaluators, UI or fail-closed rules.

## Scope

Changed only response surface / tonalidade:

- Added permanent naturalness goldens.
- Added final answer rewrites for macro-like phrases.
- Reworded one anti-repetition/off-domain surface phrase that sounded like a classifier answer.

Not changed:

- Question Contract
- Topic Manager
- Tool Router
- OperationalIntentResolver
- Memory
- Evaluators
- UI
- Fail-closed rules

## Source Triage

Read: `conversation-lab/reports/triage/residual-failures.md`

Only targeted the section `Resposta Correta Mas Pouco Natural`:

- Macro-like phrasing: `Posso responder isso como conversa geral`.
- Repeated sports list answers.
- Short advice answers that were correct but stiff.

## Goldens Added

File:

- `conversation-lab/datasets/golden/naturalness-regressions.jsonl`

Cases added: 10

Coverage:

- Short contextual follow-ups: `fica bom?`, `é seguro?`, `é grave?`, `levo bastante`, `até 2 mil`.
- Advice: `o que eu faço?`.
- Sports repetition and sports opinion.
- Brief acknowledgement: `interessante`.

## Changes

`lib/conversation-intelligence/humanize-final-answer.ts`

- Rewrites `Posso responder isso como conversa geral...` into a less system-like request for one more detail.
- Shortens the rigid sports opinion sentence into a more direct answer.
- Varies `Hoje aparecem estes jogos` into `Para hoje, a lista é`.
- Rewrites the exact `Isso é outro assunto...` sentence into external-facing phrasing without classifier language.

`lib/conversation-intelligence/anti-repetition.ts`

- Replaced the off-domain fallback phrase `Isso é outro assunto...` with a less internal/classifier-sounding sentence.

`conversation-lab/generators/golden-regression-loader.ts`

- Added `naturalness-regressions.jsonl` to permanent regression loading.

## Validation

### Typecheck

- Command: `pnpm typecheck`
- Result: PASS

### Regression

- Command: `pnpm conversation:lab:regression`
- Conversations: 131
- Turns: 309
- Satisfaction: 97%
- P0: 12
- P1: 11
- P2: 3
- P3: 3
- invented_data: 0
- no_leak: 0
- Gate: PASS, stayed at required 97%.

### Real-Agent

- Command: `pnpm conversation:lab:real`
- Conversations: 161
- Turns: 849
- Satisfaction: 93%
- P0: 34
- P1: 33
- P2: 17
- P3: 5
- invented_data: 0
- no_leak: 0
- Gate: PASS. P0/P1 did not increase versus approved baseline.

Approved baseline comparison:

- Baseline: satisfaction 87%, P0 61, P1 96, invented_data 0, no_leak 0
- After cycle: satisfaction 93%, P0 34, P1 33, invented_data 0, no_leak 0

## Residuals

Remaining important failures:

- 17 P0 cross-vertical operational answers still marked as barbershop/agendamento.
- 16 P0 short follow-ups still inherit wrong topic/tool in older mixed contexts.
- 14 P1 tool-use mismatches remain where text is fail-closed but expected tool differs.
- Naturalness P1 macro language was removed, but P2/P3 repetition remains in some sports/acknowledgement flows.

Known naturalness residual in new goldens:

- `naturalness-sports-repeat-list` still has P2/P3 because the list content is necessarily similar across repeated sports questions.
- `naturalness-notebook-carry` has P3 opening repetition despite correct answer.
- `naturalness-safety-is-safe` has a tool-use mismatch, not a naturalness failure.

## Decision

Cycle accepted. No revert needed.

The cycle improved tonalidade without altering frozen comprehension layers and kept regression PASS. Do not continue into another naturalness loop automatically; the remaining naturalness issues should be handled only with a smaller response-composer pass focused on repeated openings, not with topic/tool changes.
