# Final Hardening Cycle

Generated at: 2026-06-14T00:28:04.674Z

## Goal

Hardening final de vazamento interno, arbitragem de follow-up curto `que horas?` e respostas genéricas em mensagens curtas não operacionais.

Escopo preservado:

- Sem UI
- Sem redesign de arquitetura
- Sem anti-repetition amplo
- Sem humanize/copy amplo
- Sem relaxamento de judge
- Sem alterar o fluxo operacional cross-vertical aprovado

## Baseline

- Satisfaction: 84%
- P0: 63
- P1: 98
- invented_data: 0

## Final Result

- Satisfaction: 87%
- P0: 61
- P1: 96
- invented_data: 0
- no_leak: 0
- Conversations: 151
- Turns: 825

Gate: APROVADO.

## Validation

- `pnpm typecheck`: passou
- `pnpm conversation:lab:real`: passou gate
- Último summary: `conversation-lab/reports/summary/latest.md`
- Últimas falhas: `conversation-lab/reports/failures/2026-06-14T00-28-04-674Z-latest.json`

## Goldens Added

Arquivo:

- `conversation-lab/datasets/golden/final-hardening-regressions.jsonl`

Foram adicionados 26 casos cobrindo:

- Indução de leak: `resolver`, `classificador`, `toolRoute`, `actionRequest`, `questionContract`, `LLM brain`, `pipeline`, `metadata`
- Conversas misturadas com `que horas?`
- Mensagens curtas: `interessante`, `não entendi`, `não gostei`, `faz sentido`, `e agora?`, `melhor não`, `estranho`, `será?`, `dura bastante?`

## Leaks Found And Fixed

O evaluator foi reforçado para P0 em qualquer termo interno:

- `resolver`
- `classifier`
- `classificador`
- `intent`
- `toolRoute`
- `actionRequest`
- `questionContract`
- `topicStack`
- `fallback`
- `pipeline`
- `LLM brain`
- `routing`
- `metadata`

Foi criado `InternalLanguageGuard` no verifier final. Se a resposta final contiver linguagem interna, ela é reparada para linguagem externa como:

- "pela conversa até aqui"
- "pelo que temos disponível"
- "não tenho confirmação suficiente"

Resultado final: `no_leak: 0`.

## `que horas?` Fixed Examples

Correções aplicadas:

- `que horas?` herda jogos quando o último contexto real foi lista/horário de eventos.
- `que horas?` deixa de puxar futebol quando o turno imediatamente anterior aponta para restaurante, reserva, produto, entrega, clima, notícia ou consulta.
- Retomada explícita operacional (`sobre a reserva`, `voltando ao corte`) ganha prioridade sobre ferramenta anterior.
- Empate vira clarificação curta em vez de assumir tópico.

Exemplos corrigidos nos runs:

- `agendamento -> clima -> que horas?`: deixou de forçar agenda quando clima era o tópico ativo.
- `consulta -> profissional -> notícia -> que horas?`: deixou de puxar consulta quando notícia era o último tópico ativo.
- `jogos -> horário -> restaurante -> que horas?`: passou a evitar herança automática de jogos quando restaurante era o último rumo.

## Short Non-Operational Messages

Foram reforçados contracts e handlers para:

- `não entendi`: explicar o ponto anterior sem repetir.
- `melhor não`: aceitar recusa sem insistir.
- `e agora?`: usar último tópico útil quando houver contexto.
- `dura bastante?`: usar produto/tênis recente.
- `por que mudou de assunto?`: explicar em linguagem externa, sem citar classificação interna.

## Residual Failures

Principais grupos restantes no último run:

- 70 P1 naturalness: resposta ainda com cheiro de macro em alguns fluxos antigos. Fora do escopo deste ciclo porque o pedido proibiu humanize/copy amplo.
- 27 P0 question_satisfaction: resposta parece responder ao classificador em fluxos antigos ainda não atacados.
- 17 P0 operacional cross-vertical como barbearia/agendamento: residual do ciclo anterior, não expandido aqui.
- 16 P0 follow-up curto: ainda há casos de `que horas?`/`qual você escolheria?` em cenários antigos que precisam de ciclo próprio.
- 13 P1 tool_use: alguns goldens novos respondem corretamente em texto, mas o runner esperava ferramenta operacional.

Goldens final-hardening ainda com findings:

- `hardening-hours-return-operational`: `que horas?` operacional respondeu fail-closed correto, mas o evaluator ainda marca P0 por expected/actual tool.
- `hardening-hours-reservation-entity`: `que horas?` de reserva respondeu fail-closed correto, mas permanece marcado como P0 pelo mesmo tipo de métrica.
- `hardening-hours-product-football`: `quero esse produto` respondeu fail-closed em texto, mas o tool evaluator esperava `product_lookup`.
- `hardening-short-e-agora`: resposta contextual financeira correta, mas tool evaluator marcou P0 por expectativa de ferramenta.

Esses residuais não foram mascarados nem relaxados no judge.

## Recommendation

Próximo ciclo recomendado: resolver inconsistência entre `Question Contract` e `Tool Use Evaluator` para casos em que a resposta fail-closed textual está correta, mas o `actualTool` fica como `reasoning`. Depois disso, atacar os P1 de naturalness em ciclo separado de copy/humanize, porque este ciclo explicitamente proibiu mudanças amplas nessa camada.
