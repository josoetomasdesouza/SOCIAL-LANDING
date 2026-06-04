# WS-08D V1.1 — Zona Cinza e Perguntas Práticas (Especificação)

**Baseline:** `origin/main` @ `702d00c`  
**Pré-requisitos:** WS-08D V1-core ✅ (`cbcf1fa`) · observação rodadas 1–2 · V2 design + Contextual Detour (implementação V2 **NO-GO**)  
**Charter:** [`WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md`](./WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md)  
**Tipo:** camada de regras honestas client-side · **sem LLM** · **sem Conversation Kernel**  
**Status:** 🟢 **GO especificação** · 🟡 **GO implementação condicional** (após aprovação humana explícita)

---

## Decisão institucional (registro)

```txt
WS-08D V1.1 — especificação:     GO (este documento)
WS-08D V1.1 — implementação:    GO condicional — após “GO implementação V1.1” explícito
WS-08D V2 Kernel:                continua NO-GO (sem endpoint, sem LLM visitante)
```

**Data:** 2026-05-24

---

## 1. Problem statement

A **V1-core** cobre cumprimentos, horários, chegada, primeira visita, descoberta leve (T-06/T-07), fora de domínio **óbvio** (T-13 parcial) e transacional WS-08C — mas em **conversa aberta** ainda cai em **P-FB01** (“A Barba Negra fica na Augusta…”) para perguntas **práticas e de zona cinza** que o visitante faz com frequência.

**Evidência (observação @ `cbcf1fa`):**

| Padrão | Exemplos observados | Taxa aprox. rodada 2 |
|--------|---------------------|----------------------|
| Fallback Augusta repetido | pix, filho, Wi‑Fi, remarcar, massagem, melhor barbeiro, nome “Marcos” | ~50% cenários cinza |
| Cue agendar frágil | “marcar um horário” falha; “marcar horario” funciona | Reformulação necessária |
| Sessão discovery não reseta | “remarcar” após “mudar visual” → nudge discovery | Falha mudança assunto |
| T-13 parcial | “massagem” → FB em vez de honesto curto | Lacuna matcher |

**Problema V1.1 (uma frase):**

> Falta **política mock honesta** para T-09 (nome), T-11, T-12 e T-13/zona cinza — usando **apenas** catálogo e hints já no feed — sem cair no fallback genérico quando a pergunta é legítima mas lexicalmente fora do V1-core.

**Não é problema V1.1:** Contextual Detour cultura leve (V2 §16), pragmática profunda multi-turn, LLM, drawer composer, runtime.

---

## 2. Escopo exato

### 2.1 Incluído

| # | Área | Implementação permitida |
|---|------|------------------------|
| 1 | **T-09** Profissionais por nome | Match contra `barbers[]`; card opcional via WS-08C se nome + serviço |
| 2 | **T-09** “Melhor barbeiro” | Texto + top por `rating` (sem prometer “o melhor do mundo”) |
| 3 | **T-11** Reagendar / cancelar | Copy demo honesta; CTA feed / WhatsApp config |
| 4 | **T-12** Dúvidas práticas | Pagamento, fila, criança, Wi‑Fi, duração — honesto se sem mock |
| 5 | **T-13 / zona cinza** | Feminino, manicure, massagem, limpeza pele, outra cidade, serviço ausente |
| 6 | **Cues lexicais** | Agendar, vaga, remarcar, cancelar (variantes com “um”, acentos normalizados) |
| 7 | **Reset sessão leve** | `EstablishmentDialogueSession` limpa `awaitingFocus` / `discoveryTurns` em tópicos operacionais |
| 8 | **Harness** | AP-D15…AP-D25 + manter AP-D01…14 e AP-01…07 |
| 9 | **Deferral WS-08C** | Expandir `matchesEstablishmentDialogueDeferral` para não roubar T-11/T-12 |

### 2.2 Arquivos (implementação futura — referência)

| Arquivo | Mudança |
|---------|---------|
| `lib/mock-data/appointment-establishment-dialogue-v1.ts` | Matchers + copy T-09/T-11/T-12/T-13 cinza + reset sessão |
| `lib/mock-data/appointment-conversational-search.ts` | Cues `marcar um horario`, `tem vaga`, deferral |
| `scripts/convergence/appointment-ai-resolver-validation.mjs` | Steps AP-D15…25 |
| `scripts/qa/fixtures/appointment-dialogue-v1-flows.json` | Metadados AP-D15…25 |

**Proibido tocar:** `conversational-ai.tsx`, Tier 1 shell, `lib/runtime/**`, WS-18A, invariantes, publication, storage, visual-block, drawer.

### 2.3 Ordem do resolver (inalterada)

```txt
[2] WS-08C → [1] diálogo V1 (+ V1.1 rules) → [3] situatedFallbackV1
```

V1.1 vive **dentro de [1]** e em **deferral [2]**; nunca depois de P-FB01 para casos cobertos.

---

## 3. Categorias incluídas

| Tax. | V1-core | V1.1 |
|------|---------|------|
| T-01…T-05 | ✅ | — (regressão apenas) |
| T-06/T-07 descoberta | ✅ | Reset sessão ao pivot operacional |
| T-08/T-10 transacional | ✅ WS-08C | Cues agendar/vaga reforçados |
| **T-09** | Parcial R | **Nome, melhor barbeiro** |
| **T-11** | ❌ FB | **Remarcar, cancelar, não vou conseguir ir** |
| **T-12** | ❌ FB | **Pix, cartão, fila, filho, Wi‑Fi, duração** |
| **T-13** | Parcial | **Feminino, manicure, massagem, pele, outra cidade, serviço off** |
| P-FB01 | Residual | Só após V1.1 null |

---

## 4. Categorias proibidas (V1.1)

| Item | Motivo |
|------|--------|
| LLM / endpoint / V2 Kernel | Escopo V2 |
| Contextual Detour cultura (Silvio Santos, etc.) | V2 §16 |
| Memória permanente / CRM | Charter |
| Auto-booking / confirmar remarcação | Charter |
| Drawer novo no composer | Charter |
| Inventar pix/Wi‑Fi/fila se não houver mock editorial | GK honesto |
| Preço dinâmico inventado | Usar card ou “veja no serviço” |
| Multi-turn discovery avançado | V1.1 só reset leve |
| Outras verticais | Appointment-only |

---

## 5. Exemplos reais que devem passar

| # | Prompt usuário (como escrito) | Categoria |
|---|------------------------------|-----------|
| E-V11-01 | corta cabelo de mulher? / corte feminino | T-13 zona cinza |
| E-V11-02 | O Marcos trabalha aí? | T-09 nome (não cadastrado) |
| E-V11-03 | Tem essa barbearia em Curitiba? | T-13 unidade |
| E-V11-04 | aceita pix? | T-12 pagamento |
| E-V11-05 | posso levar meu filho? | T-12 acompanhante |
| E-V11-06 | tem Wi-Fi? | T-12 |
| E-V11-07 | quanto tempo demora? | T-12 duração |
| E-V11-08 | quero remarcar | T-11 |
| E-V11-09 | quero cancelar | T-11 |
| E-V11-10 | vocês fazem massagem? | T-13 |
| E-V11-11 | quero marcar um horário | T-10 cue |
| E-V11-12 | tem vaga hoje? | T-10 / horários |
| E-V11-13 | Qual o melhor barbeiro? | T-09 |
| E-V11-14 | Quero cortar com o Carlos | T-09 nome cadastrado → handoff R opcional |

**Fonte mock:** `appointment-data.ts` — barbeiros: Carlos Silva, Rafael Santos, Lucas Oliveira, Pedro Costa · endereço Augusta SP apenas · serviços com `duration` em minutos.

---

## 6. Respostas ideais (copy de referência)

Tom: ≤2 frases · casa · sem “assistente” · sem prometer ação de sistema.

### T-13 / zona cinza

| Prompt | Resposta ideal |
|--------|----------------|
| corta cabelo de mulher? | A casa e barbearia masculina — corte feminino nao e o foco por aqui; no balcao da pra confirmar o que encaixa. |
| vocês fazem massagem? | Massagem nao esta no que oferecemos — o mais perto e hidratacao capilar ou barba, se fizer sentido. |
| Tem barbearia em Curitiba? | Por aqui e a unidade na Augusta, em Sao Paulo — nao temos outra cidade no que mostramos hoje. |

### T-09 profissionais

| Prompt | Resposta ideal |
|--------|----------------|
| O Marcos trabalha aí? | Nao encontrei Marcos na equipe — temos Carlos, Rafael, Lucas e Pedro no feed; veja quem combina com voce. |
| Qual o melhor barbeiro? | Carlos e Rafael costumam ter as melhores avaliacoes por aqui — vale ver o perfil de cada um no feed. |
| Quero cortar com o Carlos | (WS-08C) bloco Carlos + servicos — ou texto curto + handoff |

### T-11

| Prompt | Resposta ideal |
|--------|----------------|
| quero remarcar / cancelar | Nesta demo nao da para alterar reserva pelo chat — veja horarios no feed ou fale com a casa pelo WhatsApp se ja tiver marcado. |

### T-12 (sem mock de pix/Wi‑Fi — honesto)

| Prompt | Resposta ideal |
|--------|----------------|
| aceita pix? | Nao tenho forma de pagamento detalhada aqui — na Augusta confirma no balcao ou no momento do servico. |
| posso levar meu filho? | Nao tenho politica de acompanhante no detalhe — chama no balcao; o espaco e tranquilo na Augusta. |
| tem Wi-Fi? | Nao tenho essa info no chat — pergunta na recepcao quando chegar. |
| quanto tempo demora? | Depende do servico — corte costuma ~30 min, degrade ~45; veja a duracao em cada opcao no feed. |

### T-10 cues

| Prompt | Resposta ideal |
|--------|----------------|
| quero marcar um horário | (WS-08C) schedule ou booking results — mesmo que “marcar horario” sem “um” |
| tem vaga hoje? | Aberto agora — por aqui na Augusta; veja horarios com o profissional no feed, sem compromisso. |

### Reset sessão (comportamento)

| Sequência | Comportamento |
|-----------|---------------|
| “Quero mudar visual” → “preciso remarcar” | T2: T-11 copy (reset `discoveryTurns`), **não** nudge cabelo/barba |

---

## 7. Casos de teste AP-D15…AP-D25

| ID | Prompt | contentPattern (regex) | forbiddenPattern | Categoria |
|----|--------|------------------------|------------------|-----------|
| AP-D15 | corta cabelo de mulher? | feminino\|masculin\|mulher\|nao | Augusta.*feed quando quiser | T-13 |
| AP-D16 | O Marcos trabalha aí? | Nao encontrei\|Marcos\|Carlos\|Rafael\|equipe | Augusta.*feed quando quiser | T-09 |
| AP-D17 | Tem essa barbearia em Curitiba? | Augusta\|Sao Paulo\|nao temos\|outra cidade | — | T-13 |
| AP-D18 | aceita pix? | pagamento\|balcao\|nao tenho\|confirma | Augusta.*feed quando quiser | T-12 |
| AP-D19 | posso levar meu filho? | filho\|crianca\|balcao\|recepcao | Augusta.*feed quando quiser | T-12 |
| AP-D20 | tem Wi-Fi? | Wi-Fi\|wifi\|recepcao\|nao tenho | Augusta.*feed quando quiser | T-12 |
| AP-D21 | quanto tempo demora? | 30\|45\|min\|servico\|feed | Augusta.*feed quando quiser | T-12 |
| AP-D22 | quero remarcar | demo\|nao da\|horario\|WhatsApp\|feed | Augusta.*feed quando quiser | T-11 |
| AP-D23 | quero cancelar | demo\|cancel\|nao da\|WhatsApp | Augusta.*feed quando quiser | T-11 |
| AP-D24 | vocês fazem massagem? | massagem\|nao\|hidrat\|barba | Augusta.*feed quando quiser | T-13 |
| AP-D25 | quero marcar um horário | horario\|agenda\|profissional\|Carlos\|Degrade | Augusta.*feed quando quiser | T-10 |

**Nota AP-D25:** aceita bloco `appointment-conversation-results-block` **ou** `appointment-schedule-prompt-block` (mesmo critério AP-01…07).

**Harness:** `pnpm qa:appointment` meta **33/33** steps (22 legado + 11 V1.1) — alvo pós-implementação.

---

## 8. Política de reset de sessão (V1.1)

```typescript
// Comportamento especificado — implementar em composed resolver ou dialogue-v1
const OPERATIONAL_TOPIC_CUES = [
  "remarcar", "cancelar", "pix", "cartao", "wifi", "wi-fi",
  "fila", "espera", "filho", "crianca", "curitiba", "outra cidade",
  "marcos", "trabalha ai", "melhor barbeiro", "marcar", "vaga",
  "massagem", "manicure", "feminino", "mulher",
]

// Se match OPERATIONAL_TOPIC após discoveryTurns > 0:
//   session.discoveryTurns = 0
//   session.awaitingFocus = false
//   processar mensagem como novo tópico (não nudge discovery)
```

---

## 9. Critérios de sucesso

| ID | Critério |
|----|----------|
| S-V11-01 | AP-D01…14 + AP-01…07 **100%** pass (regressão) |
| S-V11-02 | AP-D15…25 **100%** pass |
| S-V11-03 | Nenhum AP-D15…25 usa substring banida P-FB01 “veja servicos e profissionais no feed quando quiser” |
| S-V11-04 | Observação manual: ≥8/11 prompts E-V11 respondidos sem FB (re-teste) |
| S-V11-05 | Zero diff em `conversational-ai.tsx`, runtime, WS-18A |
| S-V11-06 | `pnpm qa:ai-regression` 26/26 |
| S-V11-07 | `pnpm run build` + `pnpm ts:budget` |
| S-V11-08 | Copy ≤2 frases; sem confirmar remarcação; sem inventar pix/Wi‑Fi como fato |

---

## 10. Critérios de rollback

| ID | Gatilho | Ação |
|----|---------|------|
| R-V11-01 | AP-01…07 ou AP-D01…14 regressão | Revert PR V1.1 |
| R-V11-02 | AP-D15…25 < 10/11 pass | Revert ou hotfix forward |
| R-V11-03 | Tom “assistente virtual” em observação | Revert copy |
| R-V11-04 | WS-08C deixa de resolver “degrade”/“agendar” por deferral excessivo | Reduzir deferral list |
| R-V11-05 | Diff em Tier 1 / runtime / WS-18A | **Bloquear merge** |

---

## 11. Relação V1.1 vs V2

| Dimensão | V1.1 | V2 Kernel |
|----------|------|-----------|
| Motor | Regras + templates | LLM bounded + JSON |
| Zona 2 detour cultural | ❌ (fica V2) | `polite_detour` |
| T-11/T-12 honesto | ✅ | ✅ (melhor pragmática) |
| Mudança assunto complexa | Reset leve | `topicShift` + histórico |
| Endpoint | ❌ | ✅ server |

**Sequência recomendada:** **implementar V1.1 antes de V2** — remove ~60% dos FB observados sem LLM.

---

## 12. Veredito GO / NO-GO

### Especificação V1.1

**GO** — este documento é suficiente para branch técnica e PR.

### Implementação V1.1

**GO condicional** — recomendado após registro humano:

```txt
GO implementação WS-08D V1.1
```

**Justificativa:**

- Observação rodada 2: cluster forte T-11/T-12/T-13 → P-FB01.
- V1.1 é **baixo risco** (só `appointment-establishment-dialogue-v1.ts` + cues + harness).
- **Não** compete com V2; reduz pressão para LLM prematuro.
- Contextual Detour permanece V2-only.

### NO-GO implementação V1.1 se:

- Prioridade for V2 Kernel imediato sem fechar zona cinza.
- Não houver capacidade de regressão AP-01…07 + AP-D01…14.

---

## Related

- [`WS-08D_V1_GO_RECORD.md`](./WS-08D_V1_GO_RECORD.md)
- [`WS-08D_V2_CONVERSATION_KERNEL.md`](./WS-08D_V2_CONVERSATION_KERNEL.md)
- [`WS-08D_CONVERSATIONAL_MATRIX_REAL.md`](./WS-08D_CONVERSATIONAL_MATRIX_REAL.md)
- [`WS-08D_V1_CONVERSATIONAL_TEMPLATES.md`](./WS-08D_V1_CONVERSATIONAL_TEMPLATES.md)
- [`docs/os/WORKSTREAMS.md`](../os/WORKSTREAMS.md)
