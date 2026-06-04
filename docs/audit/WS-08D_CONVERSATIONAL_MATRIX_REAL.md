# WS-08D — Matriz Conversacional Real (Appointment · Barba Negra)

**Baseline:** `origin/main` @ `97d060b`  
**Charter:** [`WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md`](./WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md)  
**Resolver atual:** `lib/mock-data/appointment-conversational-search.ts` (WS-08C)  
**Fallback atual:** `buildMockReply` em `components/business/conversational-ai.tsx` (rotação genérica)  
**Tipo:** observação comportamental · **sem implementação**  
**Classificação alvo:** **D** = diálogo situado · **C** = clarificação (≤1) · **R** = WS-08C · **H** = honesto / fora de domínio  
**Estado hoje:** **OK-R** = R funciona · **FAIL-MOCK** = null → mock genérico · **PARTIAL-R** = R fraco ou sem contexto ideal · **POLICY** = exige política WS-08D (ainda inexistente)

---

## 1. Taxonomia conversacional completa

| ID tax. | Categoria | Intenção do visitante | Subtipos |
|---------|-----------|----------------------|----------|
| T-01 | **Cumprimentos** | Abrir conversa / ser reconhecido | saudação · despedida curta · retorno (“oi de novo”) |
| T-02 | **Small talk** | Cordialidade sem pedido transacional | elogio ao espaço · pergunta social leve · humor leve |
| T-03 | **Horários e funcionamento** | Saber se pode ir agora / quando fecha | aberto agora · horário do dia · feriado / exceção (mock limitado) |
| T-04 | **Localização e chegada** | Encontrar o endereço / como chegar | endereço · referência · estacionamento · metrô / acesso |
| T-05 | **Primeira visita** | Reduzir incerteza de quem nunca foi | o que esperar · como funciona · precisa agendar antes |
| T-06 | **Descoberta de intenção** | Objetivo vago — precisa de orientação | “não sei” · mudança de visual · problema descrito (cabelo/barba) |
| T-07 | **Estilo e visual** | Referência estética antes de serviço | estilo do feed · inspiração · “quero parecido com…” |
| T-08 | **Serviços** | Escolher ou entender um serviço | nome explícito · preço · duração · combo · tratamento |
| T-09 | **Profissionais** | Escolher barbeiro / especialidade | recomendação · especialidade · outro profissional |
| T-10 | **Agendamento** | Marcar horário | agendar · ver horários · período (manhã/tarde) |
| T-11 | **Reagendamento** | Alterar ou remarcar (demo sem backend) | trocar horário · cancelar · “não posso ir” |
| T-12 | **Dúvidas gerais** | Informação da casa não transacional | pagamento · fila · acompanhante · criança · Wi‑Fi |
| T-13 | **Fora de domínio** | Pedido que a casa não oferece | skincare/spa fora do catálogo · assunto geral · outro negócio |

**Fontes de verdade editorial (mock):** `barberShopHeroOperationalContext`, `barberShopArrivalContext`, `barberServices`, `barbers`, `hairStyles` em `appointment-data.ts`.

---

## 2. Matriz conversacional V1 (por categoria)

Legenda de ação: **Responder** = texto situado · **Perguntar** = ≤1 clarificação · **Bloco** = `appointment-conversation-results-block` · **Prompt** = `appointment-schedule-prompt-block` · **Drawer** = `AppointmentArrivalDrawer` / `BarberDetailsDrawer` (calendar) · **Honesto** = admitir limite mock

| Cat. | Intenção | Exemplos reais (amostra) | Comportamento esperado V1 | Responder | Perguntar | Bloco | Drawer | Honesto |
|------|----------|--------------------------|---------------------------|-----------|-----------|-------|--------|---------|
| T-01 | Reconhecimento social | Olá; Bom dia; Boa noite | Cumprimento + convite leve à casa (Augusta, visual) | Sim | Não | Não | — | — |
| T-02 | Cordialidade | Tudo bem?; Gostei do ambiente | Resposta curta; não virar thread | Sim | Não | Não | — | — |
| T-03 | Disponibilidade | Estão abertos?; Até que horas? | `liveState` + `hoursHint` + `openingHours` | Sim | Só se ambíguo (“amanhã cedo”) | Não | — | Se exceção não no mock |
| T-04 | Chegada | Onde ficam?; Como chegar? | Endereço + hint Augusta; CTA chegada se pedido explícito | Sim | Não | Opcional | Chegada | Estacionamento: hint mock, não inventar |
| T-05 | Primeira visita | Nunca fui; É a primeira vez | Tom acolhedor + como funciona (escolhe serviço/pro → horários) | Sim | Opcional (“corte ou barba?”) | Após clarificação | — | — |
| T-06 | Objetivo vago | Quero mudar o visual; Cabelo cheio | Uma pergunta fechada → handoff R | Curto | Sim (1x) | Após R | — | — |
| T-07 | Estilo | Quero um degrade assim; [chip estilo] | Estilo chip → specialty/barbeiros; senão C→R | Sim / R | Se sem chip | Sim | Barber | Se estilo inexistente |
| T-08 | Serviço | Degradê; Quanto custa o corte? | R: serviço + profissionais; preço só se no mock | R | Se vago (“algo barato”) | Sim | Barber | Preço dinâmico inventado = H |
| T-09 | Profissional | Quem faz barba bem?; Outro barbeiro | R: specialty / alternate | R | Se “o melhor” sem critério | Sim | Barber | — |
| T-10 | Agendar | Quero marcar; Horário com Carlos | R: schedule prompt; drawer calendar no CTA | R | Se sem profissional/serviço | Prompt | Calendar | Nunca confirmar reserva |
| T-11 | Reagendar | Preciso remarcar; Cancelei | Honesto: demo sem conta; orientar ver horários / WhatsApp config | Sim | Não | Opcional | Calendar | Sem prometer remarcação real |
| T-12 | Dúvidas gerais | Aceita cartão?; Posso levar acompanhante? | Editorial mock bounded; senão H + orientar feed | Sim | Raro | Não | — | Se não há dado mock |
| T-13 | Fora domínio | Limpeza de rosto; Quem ganhou o jogo? | H: não oferecemos + proximidade (hidratação/barba) se fizer sentido | Sim | Opcional 1x | Opcional | — | Sim |

---

## 3. Catálogo de exemplos reais (≥50)

### 3.1 Tabela classificada

| # | Mensagem (como o cliente escreveria) | Tax. | Alvo | Hoje | Lacuna / nota |
|---|--------------------------------------|------|------|------|----------------|
| E-01 | Olá | T-01 | D | FAIL-MOCK | Mock rotativo genérico |
| E-02 | Bom dia | T-01 | D | FAIL-MOCK | Idem |
| E-03 | Boa noite | T-01 | D | FAIL-MOCK | Idem |
| E-04 | Oi, tudo bem? | T-01/T-02 | D | FAIL-MOCK | Mistura cumprimento + small talk |
| E-05 | Tudo bem? | T-02 | D | FAIL-MOCK | Idem |
| E-06 | E aí | T-01 | D | FAIL-MOCK | Coloquial — política D |
| E-07 | Valeu | T-01 | D | FAIL-MOCK | Despedida — política D |
| E-08 | Obrigado | T-01 | D | FAIL-MOCK | Idem |
| E-09 | Como vocês estão? | T-02 | D | FAIL-MOCK | Idem |
| E-10 | Gostei muito do lugar | T-02 | D | FAIL-MOCK | Idem |
| E-11 | Ambiente bem bacana | T-02 | D | FAIL-MOCK | Idem |
| E-12 | Estão atendendo hoje? | T-03 | D | FAIL-MOCK | Dados existem no hero mock |
| E-13 | Vocês estão abertos agora? | T-03 | D | FAIL-MOCK | Idem |
| E-14 | Que horas fecham? | T-03 | D | FAIL-MOCK | `hoursHint` / `openingHours` não ligados |
| E-15 | Funciona domingo? | T-03 | D/H | FAIL-MOCK | Mock Seg–Sáb — honesto se não houver domingo |
| E-16 | Até que horas vocês ficam? | T-03 | D | FAIL-MOCK | Idem E-14 |
| E-17 | Onde fica a barbearia? | T-04 | D | FAIL-MOCK | `address` + arrival mock disponíveis |
| E-18 | Qual o endereço? | T-04 | D | FAIL-MOCK | Idem |
| E-19 | Como eu chego aí? | T-04 | D→drawer | FAIL-MOCK | Deveria abrir chegada ou CTA |
| E-20 | Fica perto do metrô? | T-04 | H | FAIL-MOCK | Honesto se não houver dado — não inventar linha |
| E-21 | Tem estacionamento? | T-04/T-12 | D/H | FAIL-MOCK | AP-05: mock genérico; `parkingHint` existe |
| E-22 | Onde posso parar o carro? | T-04 | D | FAIL-MOCK | Usar `parkingHint` |
| E-23 | É na Augusta mesmo? | T-04 | D | FAIL-MOCK | `placeHint` |
| E-24 | Nunca fui aí | T-05 | D | FAIL-MOCK | Primeira visita — política D |
| E-25 | É minha primeira vez | T-05 | D | FAIL-MOCK | Idem |
| E-26 | Como funciona aí? | T-05 | D→C | FAIL-MOCK | Explicar fluxo casa |
| E-27 | Preciso agendar antes de ir? | T-05/T-10 | D | FAIL-MOCK | Orientar agendar vs walk-in editorial |
| E-28 | Quero mudar meu visual | T-06 | C→R | FAIL-MOCK | “cuidar do visual” está em RECOMMENDATION_CUES mas frase exata não |
| E-29 | Não sei qual corte fazer | T-06 | C→R | OK-R | `nao sei` em RECOMMENDATION_CUES |
| E-30 | Não sei o que escolher | T-06 | C→R | OK-R | Idem |
| E-31 | Me ajuda a escolher | T-06 | C→R | OK-R | `me ajuda` em cues |
| E-32 | Meu cabelo está muito cheio | T-06 | C→R | FAIL-MOCK | Problema descrito — precisa política D/C |
| E-33 | Tá na hora de cortar | T-06/T-08 | C→R | PARTIAL-R | Pode cair em recommendation se “cortar” |
| E-34 | Quero dar um trato na barba | T-06/T-08 | R | OK-R | `cuidar da barba` em cues |
| E-35 | Preciso cortar o cabelo | T-06/T-08 | R | OK-R | AP-01 |
| E-36 | Quero relaxar um pouco | T-06 | C→R | OK-R | `quero relaxar` em cues |
| E-37 | Quero um visual mais moderno | T-07 | C→R | FAIL-MOCK | “moderno” não mapeado sem estilo chip |
| E-38 | Vi um degradê no feed, quero parecido | T-07 | R | PARTIAL-R | Com chip estilo → specialty; sem chip → FAIL |
| E-39 | Quero um fade | T-07/T-08 | R | OK-R | keyword degrade |
| E-40 | degrade | T-08 | R | OK-R | AP-02 |
| E-41 | Quanto custa o corte masculino? | T-08 | D/R | PARTIAL-R | R mostra serviço; preço no card, não no texto IA |
| E-42 | Quanto tempo demora corte e barba? | T-08 | D | PARTIAL-R | Duração no mock do serviço |
| E-43 | Vocês fazem platinado? | T-08 | R | OK-R | service-8 keyword |
| E-44 | Tem hidratação? | T-08 | R | OK-R | service-6 |
| E-45 | Quero só aparar a barba | T-08 | R | OK-R | barba / barba completa |
| E-46 | Qual serviço você recomenda? | T-08/T-06 | R | OK-R | `recomenda` em cues |
| E-47 | Qual produto para limpeza do rosto? | T-13 | H | FAIL-MOCK | Fora catálogo — H obrigatório |
| E-48 | Faz manicure? | T-13 | H | FAIL-MOCK | Idem |
| E-49 | Quem é o melhor barbeiro? | T-09 | C→R | PARTIAL-R | R lista por rating; C opcional critério |
| E-50 | Qual barbeiro você recomenda? | T-09 | R | OK-R | `recomenda` |
| E-51 | Quem é bom em barba? | T-09 | R | OK-R | specialty Barba |
| E-52 | Quero cortar com o Carlos | T-09 | R | PARTIAL-R | Nome próprio — não há intent por nome hoje |
| E-53 | E outro profissional? | T-09 | R | OK-R | Com chip barbeiro |
| E-54 | Tem alguém que faz desenho? | T-09 | R | OK-R | specialty Desenho |
| E-55 | Quero marcar horário | T-10 | R | OK-R | schedule intent |
| E-56 | Quero agendar um corte | T-10 | R | OK-R | agendar + serviço implícito |
| E-57 | Tem horário hoje à tarde? | T-10 | R | PARTIAL-R | period + schedule; melhor com chip |
| E-58 | Ver horários | T-10 | R | OK-R | cue ver horario |
| E-59 | Quero agendar com o Rafael | T-10 | R | PARTIAL-R | Nome sem chip — lista genérica |
| E-60 | Preciso remarcar meu horário | T-11 | H→D | FAIL-MOCK | Sem backend — H + orientação |
| E-61 | Posso cancelar? | T-11 | H | FAIL-MOCK | Idem |
| E-62 | Não vou conseguir ir hoje | T-11 | H | FAIL-MOCK | Idem |
| E-63 | Aceita cartão? | T-12 | H | FAIL-MOCK | Sem dado pagamento no mock |
| E-64 | Tem fila de espera? | T-12 | H/D | FAIL-MOCK | Editorial bounded |
| E-65 | Posso ir com meu filho? | T-12 | H | FAIL-MOCK | Idem |
| E-66 | Vocês têm Wi‑Fi? | T-12 | H | FAIL-MOCK | Idem |
| E-67 | Quanto tempo de espera? | T-12 | H | FAIL-MOCK | Idem |
| E-68 | Qual a diferença entre degrade e fade? | T-12/T-08 | D | FAIL-MOCK | Editorial curto — D |
| E-69 | Vocês atendem mulher? | T-13/T-12 | H | FAIL-MOCK | Honesto conforme posicionamento casa |
| E-70 | Quem ganhou o jogo ontem? | T-13 | H | FAIL-MOCK | Fora domínio total |
| E-71 | Me indica um restaurante perto | T-13 | H | FAIL-MOCK | Idem |
| E-72 | [chip Carlos] quais serviços? | T-08/T-09 | R | OK-R | AP-03 |
| E-73 | [chip Carlos] tem algo à tarde? | T-10 | R | OK-R | AP-04 |
| E-74 | [chip Carlos] quero agendar | T-10 | R | OK-R | AP-07 → drawer |
| E-75 | vocês tem estacionamento | T-04 | D/H | FAIL-MOCK | AP-05 — texto sem estacionamento real |

**Total exemplos:** 75 (mínimo 50 atendido)

### 3.2 Distribuição alvo (D / C / R / H)

| Classificação | Quantidade | % |
|---------------|------------|---|
| **D** | 28 | 37% |
| **C** (incl. C→R) | 12 | 16% |
| **R** | 28 | 37% |
| **H** | 7 | 9% |

---

## 4. Lacunas descobertas

### 4.1 Falham totalmente hoje (null → mock genérico)

**Volume estimado:** ~42/75 mensagens (56%) — principalmente T-01 a T-05, T-11, T-12, T-13 e problemas descritos sem keyword.

| Grupo | Exemplos representativos | Política WS-08D necessária |
|-------|-------------------------|------------------------------|
| Social abertura | E-01–E-11 | **D** cumprimento / small talk |
| Operacional | E-12–E-16 | **D** ligado a `barberShopHeroOperationalContext` |
| Chegada / parking | E-17–E-23, E-75 | **D** + `barberShopArrivalContext`; drawer se intenção forte |
| Primeira visita | E-24–E-27 | **D** onboarding casa |
| Visual vago | E-28, E-32, E-37 | **C→R** ou **D→C** |
| Reagendamento | E-60–E-62 | **H** demo sem CRM |
| Dúvidas gerais | E-63–E-69 | **D/H** bounded |
| Fora domínio | E-47–E-48, E-70–E-71 | **H** |

**Sintoma:** frases como “Barba Negra pode te ajudar com isso rapidinho” (AP-05/06) — **não respondem à pergunta**.

### 4.2 Recebem fallback genérico (confirmado)

| Mecanismo | Evidência |
|-----------|-----------|
| Resolver `return null` | Qualquer mensagem fora de keywords/cues WS-08C |
| `buildMockReply` 3-way rotation | `userMessage.trim().length % 3` — sem semântica |
| Harness AP-05 / AP-06 | Espera `Barba Negra|ajudar|orientar` sem bloco visual |

### 4.3 Já funcionam bem (WS-08C · R)

| Fluxo | Harness / cue | Exemplos |
|-------|---------------|----------|
| Recomendação guiada | AP-01 · RECOMMENDATION_CUES | E-29–E-31, E-35–E-36 |
| Serviço explícito | AP-02 · SERVICE_KEYWORDS | E-39–E-40, E-43–E-45 |
| Specialty barbeiro | BARBER_SPECIALTY_KEYWORDS | E-51, E-54 |
| Context follow-up | AP-03 · chip | E-72 |
| Período | AP-04 · chip | E-73 |
| Agendar + chip | AP-07 · chip | E-74 |
| Schedule / period / alternate | intents dedicados | E-53–E-58 |

### 4.4 Funcionam parcialmente (PARTIAL-R)

| Caso | Limitação atual | Política futura |
|------|-----------------|-----------------|
| Nome de profissional (E-52, E-59) | Sem NLP de nome → lista genérica | **C** (“qual barbeiro?”) ou **D** + cards top |
| Preço/duração em texto (E-41–E-42) | Preço só no card | **D** curto citando mock |
| Estilo sem chip (E-37–E-38) | Specialty só com keywords/chip | **C** ou long-press estilo |
| “Mudar visual” (E-28) | Frase não bate cue exato | **C→R** alinhar cues ou **D** |
| Agendar sem contexto (E-55–E-56) | R lista barbeiros — OK mas genérico | Aceitável; opcional **D** uma linha |

### 4.5 Exigirão novas políticas de diálogo (não só keywords R)

| Política | Descrição | Camada |
|----------|-----------|--------|
| **P-D01** Cumprimento situado | Tom casa; mencionar Augusta/visual sem pedir intenção logo | D |
| **P-D02** Operacional hero | Mapear T-03 para `liveState` / `hoursHint` / `openingHours` | D |
| **P-D03** Chegada | T-04 → copy + CTA drawer chegada | D + drawer |
| **P-D04** Primeira visita | T-05 fluxo explicativo curto | D (+ C opcional) |
| **P-C01** Problema descrito | “cabelo cheio”, “visual moderno” → pergunta fechada | C |
| **P-H01** Fora catálogo | skincare, manicure, assunto geral | H |
| **P-H02** Reagendamento demo | sem conta real — honesto + WhatsApp/config | H |
| **P-H03** Dúvidas sem mock | cartão, Wi‑Fi, fila — não inventar | H |
| **P-FB01** Fallback situado | Substituir rotação quando D/R/H não aplicam | FB (charter) |

**Não exigem** novo drawer, runtime write, LLM, nem alteração Tier 1 — apenas **política mock** sobre dados já existentes.

---

## 5. Resumo para GO implementação futuro

Antes de liberar código (charter §11), a organização deve ter:

1. ✅ Esta matriz como evidência comportamental (75 exemplos · 13 categorias).
2. ☐ Priorização V1: T-01–T-05 + T-13 + fallback (maior FAIL-MOCK).
3. ☐ Casos R existentes congelados como regressão (AP-01–07 + E-29–E-45, E-72–E-74).
4. ☐ Copy bounds documentados por política P-D* / P-H*.
5. ☐ Decisão humana explícita GO implementação.

**Pergunta operacional atual:**

```txt
Quais evidências e guardrails precisam existir para liberar a implementação?
→ Esta matriz + priorização V1 + harness AP-D* (futuro) + checklist anti-chatbot (charter §7).
```

---

## Related

- [`WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md`](./WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md) — §10 matriz normativa (V1-01…16)
- [`WS-08C_APPOINTMENT_AI_REPORT.md`](./WS-08C_APPOINTMENT_AI_REPORT.md)
- [`AI_FALLBACK_BEHAVIOR.md`](../ai/AI_FALLBACK_BEHAVIOR.md)
- [`scripts/qa/fixtures/ai-canonical-flows.json`](../../scripts/qa/fixtures/ai-canonical-flows.json) — AP-01…07
