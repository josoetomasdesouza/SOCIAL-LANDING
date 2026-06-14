# WS-H01 — Human Message Taxonomy Layer

Generated at: 2026-06-14T01:15:03.591Z

## Objective

Add a pre-contract layer that answers only: "what kind of message is this?"

This cycle targets real failures where personal observations or booking intent were incorrectly treated as operational availability/service questions.

## Files Added

- `lib/conversation-intelligence/message-nature-classifier.ts`
- `conversation-lab/datasets/golden/human-message-taxonomy-regressions.jsonl`

## Files Changed

- `lib/conversation-intelligence/resolver-adapter.ts`
- `lib/conversation-intelligence/types.ts`
- `conversation-lab/generators/golden-regression-loader.ts`

## Explicitly Not Changed

- Question Contract
- Topic Manager
- Tool Router
- OperationalIntentResolver
- Memory
- Evaluators
- UI
- Fail-closed rules

## Taxonomy Categories

- `QUESTION`
- `REQUEST`
- `OBSERVATION`
- `STORY`
- `REACTION`
- `EMOTION`
- `GREETING`
- `BOOKING_INTENT`
- `OPERATIONAL_QUERY`

## Dataset

Added 50+ permanent goldens in:

- `conversation-lab/datasets/golden/human-message-taxonomy-regressions.jsonl`

Coverage:

- Observations
- Stories
- Emotions
- Greetings
- Booking intents
- Operational queries
- Requests
- Reactions
- Multi-turn reproduction of the real screenshot flow

## Real Screenshot Flow

Final golden transcript:

1. User: `faz 30 dias ja que nao corto`
   Assistant: `Então já deu tempo de repensar o visual. Você está sentindo que precisa só aparar e alinhar ou quer aproveitar para mudar um pouco?`

2. User: `que horas a barbearia fecha?`
   Assistant: `Barba Negra costuma funcionar de segunda a sábado, das 9h às 20h.`

3. User: `quero agendar`
   Assistant: `Não tenho confirmação de horário ainda. Antes de consultar agenda, preciso saber o que você quer fazer: corte, barba ou combo?`

## Validation

Command:

- `pnpm conversation:lab:rc`

Result: PASS

Regression:

- Satisfaction: 99%
- P0: 8
- P1: 11
- invented_data: 0
- no_leak: 0

Real-agent:

- Satisfaction: 95%
- P0: 28
- P1: 33
- invented_data: 0
- no_leak: 0

Compared to RC1:

- Regression P0 improved from 12 to 8.
- Regression P1 stayed at 11.
- Real-agent P0 improved from 34 to 28.
- Real-agent P1 stayed at 33.

## Notes

The classifier intentionally does not replace Question Contract, Topic Manager or Tool Router. It only prevents high-confidence non-operational message natures from entering fail-closed paths too early.

Low-confidence observations fall through to the existing pipeline to avoid hijacking older regression cases like `clima`, `futebol`, `quero cortar cabelo` or generated scenario setup messages.

## Residual Risks

- Some short follow-ups still inherit wrong topic/tool in older mixed contexts.
- Some tool-use mismatches remain where fail-closed text is correct but the expected tool label differs.
- Some naturalness P2/P3 repetition remains.

No additional improvement cycle was started.
