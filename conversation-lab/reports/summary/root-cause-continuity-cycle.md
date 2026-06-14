# Conversation Lab Root-Cause Cycle

Generated at: 2026-06-13T23:33:27.006Z

## Scope

Allowed layers touched:

- Question Contract
- Topic Resolver / Topic Manager
- Tool Planning metadata
- Question verifier in Lab

Forbidden layers not touched:

- anti-repetition
- humanize
- conversational humanity
- final copy shaping
- UI / visual components
- real data

## Score

Original real-agent baseline before golden expansion:

- Satisfaction: 10%
- P0: 166
- P1: 106

Expanded baseline after adding 20 permanent golden regressions and first architectural pass:

- Satisfaction: 45%
- P0: 124
- P1: 113

Final after follow-up/topic contract refinement:

- Satisfaction: 46%
- P0: 121
- P1: 113

Gate result:

- P0 decreased in the expanded run: 124 -> 121
- P1 did not increase in the expanded run: 113 -> 113
- Satisfaction increased: 45% -> 46%
- Fail-closed remained active; invented data stayed at 0

## Derived Examples

20 real P0/P1 examples were converted into permanent golden regressions.

### Topic Continuity Regressions

1. `qual você escolheria?` after games/hours
   - previous_topic: futebol
   - expected_topic: futebol
   - wrong_behavior: answered as separated from barbershop
   - expected_contract: choose/compare a game from the active sports topic

2. `qual você escolheria?` after female curly hair -> games -> hours
   - previous_topic: futebol
   - expected_topic: futebol
   - wrong_behavior: said "isso é outro assunto"
   - expected_contract: stay in sports

3. `voltando ao que falávamos`
   - previous_topic: curiosidade
   - expected_topic: agendamento
   - wrong_behavior: said "isso é outro assunto"
   - expected_contract: resume paused appointment topic

4. `voltando ao que falávamos` after clinic + football
   - previous_topic: futebol
   - expected_topic: agendamento
   - wrong_behavior: treated return as new topic
   - expected_contract: resume consultation/price/schedule

5. `que horas?` after service availability
   - previous_topic: agendamento
   - expected_topic: agendamento
   - wrong_behavior: answered games or current time
   - expected_contract: answer appointment/schedule uncertainty

6. `e o preço?` after service
   - previous_topic: agendamento
   - expected_topic: agendamento
   - wrong_behavior: generic answer
   - expected_contract: answer price with fail-closed uncertainty

7. `e amanhã?` after schedule
   - previous_topic: agendamento
   - expected_topic: agendamento
   - wrong_behavior: generic answer
   - expected_contract: consult availability for tomorrow

8. `sobre o horário`
   - previous_topic: curiosidade
   - expected_topic: agendamento
   - wrong_behavior: did not reactivate schedule
   - expected_contract: resume appointment time preference

9. `então`
   - previous_topic: curiosidade
   - expected_topic: agendamento
   - wrong_behavior: treated as new topic
   - expected_contract: continue useful paused topic

10. `não gostei`
    - previous_topic: agendamento
    - expected_topic: agendamento
    - wrong_behavior: said "isso é outro assunto"
    - expected_contract: acknowledge rejection and offer alternative route

### Question Contract Regressions

11. `vocês cortam cabelo feminino?`
    - previous_topic: cabelo_feminino
    - expected_topic: agendamento
    - wrong_behavior: listed styles instead of answering service availability
    - expected_contract: yes/no with uncertainty if catalog does not confirm

12. `tem profissional para cacheado?`
    - previous_topic: cabelo_feminino
    - expected_topic: agendamento
    - wrong_behavior: repeated curly haircut list
    - expected_contract: confirm professional or say it needs verification

13. `tem reserva hoje?`
    - previous_topic: agendamento
    - expected_topic: agendamento
    - wrong_behavior: said "isso é outro assunto"
    - expected_contract: fail-closed availability answer

14. `tem consulta hoje?`
    - previous_topic: agendamento
    - expected_topic: agendamento
    - wrong_behavior: generic/off-domain answer
    - expected_contract: consult schedule before confirming

15. `tem estoque?`
    - previous_topic: produto
    - expected_topic: produto
    - wrong_behavior: said "isso é outro assunto"
    - expected_contract: fail-closed stock answer

16. `tem outra mesa?`
    - previous_topic: agendamento
    - expected_topic: agendamento
    - wrong_behavior: treated alternative as new topic
    - expected_contract: alternative within same topic

17. `tem hoje?`
    - previous_topic: agendamento
    - expected_topic: agendamento
    - wrong_behavior: off-domain/generic answer
    - expected_contract: consult agenda for today

18. `e preço?`
    - previous_topic: agendamento
    - expected_topic: agendamento
    - wrong_behavior: generic answer
    - expected_contract: answer price with service context or ask for missing service

19. `voltando ao que falávamos`
    - previous_topic: curiosidade
    - expected_topic: agendamento
    - wrong_behavior: said "isso é outro assunto"
    - expected_contract: resume previous topic without classifying

20. `interessante`
    - previous_topic: curiosidade
    - expected_topic: curiosidade
    - wrong_behavior: said "isso é outro assunto"
    - expected_contract: brief acknowledgement or close curiosity loop

## Corrections Made

- Added new Question Contract types:
  - `sports_opinion_followup`
  - `topic_return`
  - `contextual_operational_followup`

- Topic Manager now:
  - keeps `qual você escolheria?` in sports when football is active
  - prevents stale sports topic from capturing `que horas?` after explicit return
  - treats short operational follow-ups as appointment when an operational topic exists
  - recognizes `sobre o horário`, `sobre aquilo`, `e o horário`

- Question verifier now:
  - repairs sports opinion follow-ups that lose topic
  - repairs explicit returns that produce "outro assunto"
  - repairs contextual operational follow-ups with fail-closed uncertainty

- Real-agent capture now maps `questionSatisfaction.questionType` to real tool usage metadata before judging.

## Still Failing

Most important remaining failures:

1. Generic context loss:
   - `interessante`, `não gostei`, `e se irritar?` still often produce generic "conversa geral" answers.

2. Operational service/professional questions:
   - `tem profissional para cacheado?`, `tem reserva hoje?`, `tem estoque?` still fail in several vertical-mismatch scenarios.

3. Short follow-up ambiguity after multiple topic hops:
   - `que horas?` still sometimes resolves to the wrong recent topic when both sports and appointment are present.

## Next 3 Focuses

1. Conversation memory derivation:
   Preserve `lastUsefulTopic` and `lastOperationalTopic`, not just raw history.

2. Question Contract:
   Add explicit contracts for `acknowledgement_followup` and `rejection_followup`.

3. Tool Planning:
   Add vertical-aware operational planning for restaurant, clinic, store, and product instead of treating all operational questions as appointment/barbershop.
