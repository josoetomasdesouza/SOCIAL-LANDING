# Conversation Memory Cycle

Generated at: 2026-06-13T23:42:15.416Z

## Goal

Reduce failures in short follow-ups and generic answers when recent context is enough to answer:

- `interessante`
- `não gostei`
- `e se irritar?`
- `e o horário?`
- `que horas?`
- `tem hoje?`

This cycle intentionally did not target final copy, humanize, anti-repetition, UI, or broad cross-vertical tool planning.

## Baseline

Previous real-agent baseline:

- Conversations: 50
- Turns: 597
- Satisfaction: 46%
- P0: 121
- P1: 113
- invented_data: 0

## Final Result

Final real-agent run:

- Conversations: 80
- Turns: 672
- Satisfaction: 66%
- P0: 110
- P1: 110
- invented_data: 0

Gate result: PASSED.

- P0 fell from 121 to 110.
- P1 fell from 113 to 110.
- Satisfaction rose from 46% to 66%.
- invented_data stayed at 0.

## Changes Made

- Added 30 permanent memory golden regressions in `conversation-lab/datasets/golden/conversation-memory-regressions.jsonl`.
- Loaded those regressions through `conversation-lab/generators/golden-regression-loader.ts`.
- Expanded `ConversationMemory` with:
  - `lastUsefulTopic`
  - `lastOperationalTopic`
  - `lastToolTopic`
  - `lastUserDecision`
  - `lastUserReaction`
  - `lastEntityMentioned`
  - `lastAnswerableQuestion`
  - `lastOfferedNextStep`
- Derived those fields in `lib/conversation-intelligence/memory.ts`.
- Added Question Contract types:
  - `acknowledgement_followup`
  - `rejection_followup`
  - `concern_followup`
  - `preference_followup`
  - `ambiguous_short_followup`
- Connected memory to `deriveQuestionContract()` and `satisfyUserQuestion()`.
- Added verifier repairs for short reactions, rejection, concern, preference, and ambiguous short follow-ups.
- Tightened `satisfaction-evaluator.ts` for short reaction displacement.
- Updated real-agent tool attribution to consider the final satisfied Question Contract before the original routed tool.

## Examples Improved

- `quais jogos tem hoje?` → `interessante`
  - The assistant now keeps the sports topic instead of replying as generic conversation.
- `quais jogos tem hoje?` → `que horas?`
  - The assistant now treats `que horas?` as game-hour follow-up when sports is the active tool topic.
- `tenho pele sensível` → `e se irritar?`
  - The assistant now answers as a contextual concern instead of asking the user to restate the topic.
- `quero algo executivo` → `não gostei`
  - The assistant now recognizes rejection and keeps the operational/style context.
- `qual é a capital da Austrália?` → `interessante`
  - The assistant now acknowledges the reaction without forcing app flow.

## Remaining Failures

Most remaining P0/P1 failures are outside the priority of this cycle:

- Cross-vertical operational routing still confuses restaurant/clinic/store scenarios with appointment/barbershop assumptions.
- Some operational yes/no questions still receive reasoning answers instead of explicit service/professional/stock availability resolution.
- Some generic macro replies remain in broad vertical scenarios, especially restaurant, store, health, and technology.
- `tem profissional para cacheado?` still returns the hair-style list instead of answering the operational professional question.
- Some multi-topic sequences still choose the stale sports topic after a non-sports operational return.

## Memory Fields That Helped Most

- `lastToolTopic`: improved sports/time follow-ups like `que horas?`.
- `lastOperationalTopic`: improved `não gostei`, `e o preço?`, `tem hoje?`, and operational follow-ups.
- `lastUserReaction`: allowed `interessante`, `legal`, `faz sentido`, `não gostei`, and `gostei` to be treated as conversational signals.
- `lastEntityMentioned`: improved concerns like `e se irritar?`.
- `lastUsefulTopic`: gave non-operational reactions a topic to continue without forcing app context.

## Validation

Commands run:

- `pnpm typecheck`
- `pnpm conversation:lab:real`

Latest report:

- `conversation-lab/reports/summary/latest.md`
- `conversation-lab/reports/failures/2026-06-13T23-42-15-416Z-latest.json`

## Next Focus

Next cycle should target narrow cross-vertical operational question resolution, not copy:

1. Service/professional/stock/reservation yes-no resolver.
2. Vertical-aware operational topic memory.
3. Tool planning only for operational questions that the memory already identifies.
4. Keep invented_data fail-closed.
