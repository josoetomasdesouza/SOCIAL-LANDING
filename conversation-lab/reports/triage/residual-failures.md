# Residual Failures Triage

Date: 2026-06-13

Baseline approved:

- Satisfaction: 87%
- P0: 61
- P1: 96
- invented_data: 0
- no_leak: 0

## Agente Realmente Errou

- Mixed-context short follow-ups can still inherit the wrong topic in older random scenarios, especially `qual você escolheria?` after sports appears in the thread.
- Some weather follow-ups still receive generic "outro assunto" style answers instead of using the recent weather context.
- Some cross-vertical price questions still mention barbershop/corte when the scenario is estética or consultório.

## Evaluator Severo Ou Desalinhado

- Some fail-closed textual answers are marked as tool-use failures because the evaluator expected a transactional tool even though the agent refused to invent data.
- Some `que horas?` operational fail-closed answers are marked P0 when the answer is safe but the expected/actual tool mapping disagrees.
- Some financial or reasoning follow-ups are marked as tool failures even though no external tool is required.

## Resposta Correta Mas Pouco Natural

- Several answers still contain macro-like phrasing such as "Posso responder isso como conversa geral".
- Some repeated sports list responses are correct but feel repetitive.
- Some short advice answers are accurate but too stiff for a modern assistant.

## Limitação Aceitável Por Fail-Closed

- The agent refuses to confirm schedule, stock, reservation, price, professional availability or delivery without catalog/tool confirmation.
- This can reduce perceived directness, but preserves the non-invention contract.
- These should remain acceptable unless a real provider is connected.

## Precisa De Ferramenta Real

- Accurate sports schedules beyond mocked provider data.
- Weather forecast by exact city/time window.
- Live product stock, delivery and payment confirmation.
- Live reservation or appointment availability.
- Current news/web rankings with source quality.

## Precisa De Decisão De Produto

- Whether fail-closed text should count as sufficient for tool-use when the agent does not trigger a visual/transactional block.
- Whether regression gates should prioritize answer correctness over expected tool label in ambiguous operational messages.
- Whether the next approved cycle should be `naturalness-cycle` only, targeting response composer/tonality without touching Question Contract, Topic Manager or Tool Planning.

## Triage Recommendation

Do not run another broad auto-improvement loop. The approved baseline should be protected by `conversation:lab:regression`. The only next cycle allowed should be a limited `naturalness-cycle`, and it must keep regression PASS.
