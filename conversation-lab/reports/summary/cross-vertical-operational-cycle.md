# Cross-Vertical Operational Cycle

Generated at: 2026-06-14T00:10:55.250Z

## Goal

Resolve cross-vertical operational yes/no questions and operational follow-ups with fail-closed behavior, without pulling restaurant, store, clinic, aesthetic, gym, workshop, or pet-shop questions back into barbershop appointment logic.

This cycle intentionally did not target final copy, humanize, anti-repetition, UI, or general tone polish.

## Baseline

Baseline provided by the previous cycle:

- Satisfaction: 66%
- P0: 110
- P1: 110
- invented_data: 0

## Final Result

Final real-agent run:

- Conversations: 125
- Turns: 760
- Satisfaction: 84%
- P0: 63
- P1: 98
- invented_data: 0

Gate result: PASSED.

- Satisfaction rose from 66% to 84%.
- P0 fell from 110 to 63.
- P1 fell from 110 to 98.
- invented_data stayed at 0.

## Changes Made

- Added 45 cross-vertical golden regressions in `conversation-lab/datasets/golden/cross-vertical-operational-regressions.jsonl`.
- Added domain and business vertical metadata support to `conversation-lab/generators/golden-regression-loader.ts`.
- Created `lib/conversation-intelligence/operational-intent-resolver.ts`.
- Added operational contracts:
  - `yes_no_service_availability`
  - `yes_no_professional_availability`
  - `yes_no_product_stock`
  - `yes_no_reservation`
  - `yes_no_schedule_availability`
  - `price_lookup`
  - `payment_lookup`
  - `delivery_lookup`
  - `booking_intent`
- Added early fail-closed handling in `resolver-adapter.ts` for operational contracts.
- Updated tool routing for product stock, payment, reservation, delivery, sports questions, and operational follow-ups.
- Updated Lab tool attribution for product and operational question contracts.
- Tightened Lab evaluator precision to avoid false positives like `temperatura` containing `tem`, while preserving strict fail-closed requirements for real operational questions.

## Examples Corrected

- `tem estoque?`
  - Now becomes product stock lookup/fail-closed instead of generic conversation.
- `tem reserva hoje?`
  - Now becomes reservation fail-closed instead of barbershop appointment copy.
- `tem profissional para cacheado?`
  - Now becomes professional availability fail-closed instead of listing haircuts again.
- `aceita cartão?`
  - Now becomes payment lookup/fail-closed instead of confirming without data.
- `entrega hoje?`
  - Now becomes delivery lookup/fail-closed instead of invented availability.
- `tem horário amanhã?`
  - Now becomes schedule availability fail-closed for the current vertical.
- `quem joga hoje?`
  - Corrected as sports, not operational `tem`.
- `qual a temperatura agora?`
  - Corrected as weather/current data, not `tem` service question.

## Verticals Improved

- Barbearia: professional/service/booking questions now fail closed more consistently.
- Salão feminino: service, professional, price, payment, schedule questions are covered by goldens.
- Estética: procedure, specialist, price, schedule, booking questions are covered.
- Restaurante: reservation/table/payment/booking questions no longer default to barbershop semantics.
- Consultório: specialist, consultation, child attendance, price, payment questions are covered.
- Loja: stock, size, delivery, ready delivery, payment questions are covered.
- Academia: plan, class schedule, teacher, price, payment questions are covered.
- Oficina: service, schedule, budget/price, booking, payment questions are covered.
- Pet shop: bath/grooming, puppy attendance, professional, schedule, price questions are covered.

## Remaining Failures

Important residual failures:

- Short follow-ups like `que horas?` can still choose the wrong prior operational topic in long mixed-topic conversations.
- Some non-operational short messages still produce classifier-like text (`isso é outro assunto`, `conversa geral`). This is mostly outside this cycle and overlaps with naturalness/copy work.
- Some old scenarios still encode barbershop-specific assumptions in broad vertical contexts.
- A few sports follow-ups still fail the stricter satisfaction evaluator even when the answer is broadly sports-related.
- One no-leak issue remains around the word `resolver` in a clarification response.

## Validation

Commands run:

- `pnpm typecheck`
- `pnpm conversation:lab:real`

Latest artifacts:

- `conversation-lab/reports/summary/latest.md`
- `conversation-lab/reports/failures/2026-06-14T00-10-55-250Z-latest.json`

## Next 3 Focuses

1. Improve short follow-up arbitration between active sports/weather topics and paused operational topics.
2. Add a narrow non-operational follow-up resolver for `será?`, `dá para ir?`, `dura bastante?`, and similar short questions.
3. Remove the remaining internal wording leak around `resolver` without reopening broad copy/humanize work.
