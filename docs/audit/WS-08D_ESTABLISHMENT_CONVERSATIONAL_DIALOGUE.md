# WS-08D — Establishment Conversational Dialogue (Appointment Pilot)

**Baseline técnico:** `origin/main` @ `3d75600`  
**Pré-requisitos:** WS-08C ✅ · WS-08.5–08.8 ✅ · WS-13 Etapa 1 ✅ · WS-18A ✅ (fechada — **isolada**)  
**Baseline produto perceptivo:** `1c92acc` (Tier 1 frozen — shell/composer/morph/drawer)  
**Classificação:** política de diálogo client-side no piloto Appointment — **não** chatbot genérico · **não** IA operacional server  
**Status:** 🟢 **ABERTA (charter)** — implementação **NO-GO** até critérios §11  
**Branch sugerida (futura):** `workstream/ws-08d-establishment-dialogue`  
**Autoridade:** Este documento é o charter oficial da WS-08D. Nenhuma implementação pode precedê-lo.

---

## Pergunta gate principal

```txt
O Composer está conduzindo o visitante como interlocutor especializado do estabelecimento
— com diálogo situado e descoberta leve de intenção —
ou está se comportando como assistente universal / chatbot genérico?
```

**Resposta do charter:** interlocutor **especializado do estabelecimento** somente se respostas forem curtas, situadas, domínio-fechado e transicionarem para ferramentas já existentes (blocos visuais, drawers) **sem** sequência obrigatória, memória permanente ou protagonismo de IA.

**Anti-padrão explícito:**

```txt
Cumprimento situado + 0–1 clarificação opcional + handoff para WS-08C = GO
Thread infinita + conhecimento geral + auto-booking + UI IA = NO-GO
```

---

## 1. Problem Statement

No piloto Appointment (`barba-negra`), o Composer satisfaz **intenções explícitas** via `appointment-conversational-search.ts` (WS-08C): serviço, profissional, recomendação guiada, follow-up com chips, agendamento suave.

Mensagens de **baixa estruturação** — cumprimentos, cordialidade, funcionamento, descoberta vaga, pedidos mal formulados ou fora do catálogo mock — frequentemente resultam em `null` e caem no fallback genérico rotativo (`buildMockReply` em `conversational-ai.tsx`), que não sustenta conversa situada nem conduz com leve aprofundamento até serviços, profissionais ou fluxos de agendamento já implementados.

**Evidência:** uso real do operador (exemplos aprovados na abertura da WS-08D). **Não coberto por:** WS-13 Etapa 1 (presença do shell, não matriz conversacional).

**O que não é o problema:** física do Composer, morph, clearance, runtime bundle, publication, storage, external reality, IA operacional do operador (WS-18A).

---

## 2. Objetivo único

```txt
Estabelecer e, numa fase futura autorizada, implementar uma política de diálogo
especializada do estabelecimento no Composer (Appointment), cobrindo interações
naturais e descoberta leve de intenção antes de acionar a resolução transacional
existente (WS-08C) — sem chatbot genérico e sem alterar a física perceptiva
validada na WS-13.
```

---

## 3. Escopo permitido

| Área | Permitido nesta workstream |
|------|---------------------------|
| **Charter e governança** | Este documento; emendas propostas (não aplicadas) a docs `docs/ai/*` |
| **Política de diálogo** | Definição de camadas 1–3; matriz V1; regras de transição diálogo → bloco → drawer |
| **Implementação futura (quando GO §12)** | Extensão de `appointment-conversational-search.ts` e/ou módulo de política mock adjacente; substituição contextual do fallback Appointment (sem alterar `buildMockReply` global para outras verticais) |
| **Harness futuro** | Casos AP-D* ou extensão `qa:appointment` alinhada à matriz V1 |
| **Piloto** | `barba-negra` / vertical Appointment apenas |
| **Dados de resposta** | Mock editorial + hints operacionais já no feed/runtime projection (sem novo write path) |
| **Observação** | Sessão humana pós-implementação alinhada a checklist WS-13 (copy/UX composer apenas) |

---

## 4. Escopo proibido

| Área | Proibido — inviolável |
|------|----------------------|
| **Nesta fase (charter)** | Qualquer código, PR funcional, alteração de resolver, invariantes ou Tier 1 |
| **Produto genérico** | ChatGPT aberto; assistente universal; CRM conversacional; agente autônomo; multiagente |
| **Memória e estado** | Memória permanente cross-session; perfil de visitante; histórico como motor de decisão |
| **Protagonismo IA** | Badges “IA”; copiloto; motion de “pensando”; nova superfície protagonista |
| **Infra operacional** | WS-18A (`operational-ai/`, CLI draft, promote); runtime write; publication; storage; external reality |
| **Percepção congelada** | WS-17; Composer Page Physics (hipótese apenas); reabrir morph/clearance/composer shell sem nova Sessão B |
| **Transacional proibido** | Auto-booking; confirmação automática de reserva; cobrança; intake clínico |
| **Multi-vertical day-one** | Restaurant, health, ecommerce na mesma PR |
| **Catálogo inventado** | Produtos/serviços/preços não presentes no mock — resposta honesta + redirecionamento |
| **LLM em produção** | Fora de discussão neste charter (ver § Restrições de sessão) |

---

## 5. Arquitetura conceitual

A WS-08D **não redesenha** o stack conversacional. Insere uma **política de diálogo** entre a mensagem do utilizador e o resolvedor transacional existente.

```txt
┌─────────────────────────────────────────────────────────────────┐
│  Tier 1 — ConversationalAI shell (WS-13 validado · INTOCADO)   │
│  overlay · chips · drawers · composerMode · instrumentation     │
└────────────────────────────┬────────────────────────────────────┘
                             │ message + contextItems
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  WS-08D — Política de diálogo do estabelecimento (NOVO)         │
│  Camada 1: Diálogo situado                                      │
│  Camada 2: Descoberta de intenção (≤1 pergunta opcional)        │
└────────────────────────────┬────────────────────────────────────┘
                             │ intenção suficiente OU handoff explícito
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  WS-08C — appointment-conversational-search (EXISTENTE)         │
│  text + visualBlock · schedule prompt · drawers existentes      │
└────────────────────────────┬────────────────────────────────────┘
                             │ null (apenas se política 08D também não cobrir)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Fallback Appointment-situado (substitui rotação genérica local) │
│  Nunca: fallback cross-vertical nem erro técnico exposto          │
└─────────────────────────────────────────────────────────────────┘

Paralelo isolado (SEM import, SEM bundle leak):

  WS-18A server-only → draft JSON → CLI → promote manual
```

### Contratos preservados

| Contrato | Relação WS-08D |
|----------|----------------|
| [`AI_RESOLVER_CONTRACT.md`](../ai/AI_RESOLVER_CONTRACT.md) | Camada 3 permanece `ConversationResponseResolverResult \| null` |
| [`AI_CONVERSATIONAL_INVARIANTS.md`](../ai/AI_CONVERSATIONAL_INVARIANTS.md) | Lei até emenda aprovada §12-I3; WS-08D propõe clarificação **opcional** vs proibida |
| [`AI_FALLBACK_BEHAVIOR.md`](../ai/AI_FALLBACK_BEHAVIOR.md) | Appointment deixa de depender de mock genérico rotativo para casos da matriz V1 |
| [`PERCEPTUAL_LANGUAGE_SYSTEM.md`](../os/PERCEPTUAL_LANGUAGE_SYSTEM.md) | Tom de lugar; utilitário sem showcase |

### Separação obrigatória WS-18A

| Dimensão | WS-08D | WS-18A |
|----------|--------|--------|
| Ator | Visitante na demo | Operador / infra |
| Runtime | Client resolver policy | Server `operational-ai/` |
| Output | Texto + blocos no composer | JSON patch → `runtime/.../draft` |
| Publicação | Nunca | Promote manual apenas |
| Provider | Mock / política situada (futuro) | Fixture default; LLM opt-in isolado |

---

## 6. Camadas (modelo obrigatório)

### Camada 1 — Diálogo situado

**Função:** Responder como **casa**, não como modelo de linguagem genérico.

| Cobre | Exemplos | Saída típica |
|-------|----------|--------------|
| Cumprimentos | Olá; Bom dia; Tudo bem? | Texto curto caloroso + convite leve |
| Small talk básico | Como vocês estão? | 1 frase; retorno ao feed/composer |
| Horários / funcionamento | Estão atendendo hoje? | Hints mock (`liveState`, `hoursHint`) |
| Dúvidas editoriais | Onde ficam? Estacionamento? | Copy honesta; chegada → drawer existente se aplicável |
| Fora de catálogo (honesto) | Produto não listado | Declarar ausência; não inventar SKU |

**Regras:** ≤2 frases; sem apresentação do assistente; sem thread infinita; sem scroll hijack.

### Camada 2 — Descoberta de intenção

**Função:** Quando a mensagem é vaga, **uma** pergunta de clarificação opcional para desambiguar antes da Camada 3.

| Cobre | Exemplos | Limite |
|-------|----------|--------|
| Intenção aberta | Quero mudar meu visual; Não sei o que fazer | Máx. **1** pergunta por turno |
| Refinamento suave | Algo para relaxar | Opções fechadas (corte / barba / estilo) |

**Regras:** Nunca gate obrigatório multi-step; utilizador pode ignorar e voltar ao feed; não bloquear drawers.

### Camada 3 — Resolvedor existente (WS-08C)

**Função:** Intenção suficiente → comportamento atual: blocos visuais, schedule prompt, CTAs para drawers existentes.

| Cobre | Exemplos | Comportamento |
|-------|----------|---------------|
| Serviço explícito | degrade; corte masculino | Service card + barbeiros |
| Profissional | Quem é bom em barba? | Lista filtrada |
| Agendamento | Quero agendar um corte | `Ver horários` → calendar drawer |
| Follow-up com chips | barber chip + quais serviços? | Continuidade semi-stateful WS-08C |

**Regras:** Sem confirmar reserva na IA; sem novos drawers; ≤3 entidades por bloco.

### Ordem de avaliação (implementação futura)

```txt
1. Camada 1 match? → resposta situada (texto; visualBlock só se Camada 3 já aplicável)
2. Camada 2 necessária? → texto + pergunta única (sem visualBlock obrigatório)
3. Camada 3 (WS-08C) → resultado transacional existente
4. Fallback Appointment-situado (não rotação genérica irrelevante)
```

---

## 7. Guardrails obrigatórios

### G-D01 — Domínio fechado

Respostas limitadas ao estabelecimento piloto: serviços, profissionais, estilos, horários, chegada, tom editorial Barba Negra. Conhecimento geral → recusa educada + redirecionamento.

### G-D02 — Anti-chatbot

Proibido: “Como posso ajudá-lo hoje?” genérico; listas longas em texto; tom de call center; emojis excessivos; persona “assistente virtual”.

### G-D03 — Anti-CRM

Proibido: pedir nome, telefone, e-mail no composer; funil de qualificação; “antes de continuar, responda…”.

### G-D04 — Anti-agente

Proibido: planejar ações autônomas; “já agendei para você”; mutar runtime/live; importar `operational-ai` no client.

### G-D05 — Fluxo soberano (WS-13 + invariantes)

Composer overlay; dismiss livre; composer `hidden` em drawer datetime; sem sequência obrigatória de perguntas.

### G-D06 — Forma de resposta

Texto ≤2 frases (~160 chars alvo); máx. 1 `visualBlock`; máx. 3 entidades; CTAs só para drawers existentes.

### G-D07 — Honestidade

Fora de catálogo → admitir; não fabricar produto/preço/disponibilidade. `null` global apenas onde política Appointment também não cobre.

### G-D08 — Isolamento vertical

Mudanças confinadas a Appointment; `qa:restaurant`, `qa:health`, `qa:ai-regression` inalterados por regressão.

### G-D09 — Infra silenciosa

Zero UI nova de IA; zero badge; zero write em `data/runtime/`.

### G-D10 — Preservação WS-13

Qualquer PR que altere copy/composer visível exige checklist perceptivo pós-change (não substitui Sessão B formal se escopo for só texto mock).

---

## 8. Critérios de aceite (fechamento da implementação futura)

A implementação da WS-08D só é **aceite** quando **todos** forem verdadeiros:

| ID | Critério |
|----|----------|
| A-01 | 100% das linhas da Matriz V1 (§11) com comportamento documentado e verificável |
| A-02 | Cumprimentos e small talk respondem em Camada 1 sem pedir intenção transacional imediata |
| A-03 | Descoberta vaga usa ≤1 pergunta; nunca gate multi-step |
| A-04 | Intenções explícitas WS-08C permanecem equivalentes ou melhores (sem regressão AP-*) |
| A-05 | Agendamento abre apenas drawer/calendar existente — sem confirmação automática |
| A-06 | Fora de catálogo: resposta honesta sem entidade inventada |
| A-07 | Fallback Appointment não usa frases genéricas rotativas irrelevantes para o turno |
| A-08 | `pnpm qa:appointment` 8/8 |
| A-09 | `pnpm qa:events` 8/8 |
| A-10 | `pnpm qa:ai-regression` 26/26 (ou superset documentado se harness estendido) |
| A-11 | Zero imports de `lib/runtime/appointment/operational-ai` no client |
| A-12 | Relatório de observação humana: sem “inteligente demais” / sem protagonismo IA |
| A-13 | Tier 1 cores intocados (diff restrito a resolver policy + copy mock + harness) |

---

## 9. Gates obrigatórios

### Gates de merge (toda PR de implementação)

| Gate | Comando / evidência |
|------|---------------------|
| G1 | `pnpm run build` PASS |
| G2 | `pnpm qa:events` 8/8 |
| G3 | `pnpm qa:appointment` 8/8 |
| G4 | `pnpm qa:ai-regression` green |
| G5 | `pnpm ts:budget` (se tocar TS) |
| G6 | Diff review: sem `components/conversational-ai` Tier 1 structural change |
| G7 | Diff review: sem `operational-ai` no client graph |
| G8 | Matriz V1 assinada no PR body |

### Gates institucionais

| Gate | Quando |
|------|--------|
| G-INST-1 | Charter WS-08D merged antes da primeira PR de código |
| G-INST-2 | Emenda a `AI_CONVERSATIONAL_INVARIANTS` (se necessária) em PR **docs-only** separada ou precedente |
| G-INST-3 | Um workstream por branch; sem mistura com runtime/publication/WS-18A |

---

## 10. Matriz V1 consolidada

**Legenda:** L1 = Camada 1 · L2 = Camada 2 · L3 = Camada 3 (WS-08C) · H = honesto · FB = fallback situado

| ID | Categoria | Exemplo(s) usuário | Camada alvo | Comportamento esperado V1 | Visual block | Drawer |
|----|-----------|-------------------|-------------|---------------------------|--------------|--------|
| V1-01 | Cumprimentos | Olá · Bom dia · Tudo bem? | L1 | Cumprimento caloroso; convite leve ao lugar | Não | — |
| V1-02 | Small talk | Como vocês estão? · Legal o lugar | L1 | Resposta curta casa; não prolongar thread | Não | — |
| V1-03 | Horários | Estão atendendo hoje? · Que horas fecham? | L1 | Usar hints operacionais mock | Não | — |
| V1-04 | Chegada | Onde ficam? · Como chegar? | L1 → L3 se CTA | Copy editorial + handoff chegada se intenção clara | Opcional | `AppointmentArrivalDrawer` |
| V1-05 | Estacionamento | Tem estacionamento? | L1 / H | Honesto com mock; sem inventar infra | Não | — |
| V1-06 | Descoberta vaga | Quero mudar meu visual | L2 → L3 | Uma pergunta: corte, barba ou estilo? → recommendation | Após L3 | — |
| V1-07 | Descoberta vaga | Não sei o que fazer | L2 → L3 | Clarificação única → serviços populares | Após L3 | — |
| V1-08 | Recomendação serviço | Quero um degrade · corte masculino | L3 | Service + barbeiros (≤3) | Sim | BarberDetails |
| V1-09 | Recomendação vaga | Algo para relaxar | L2 → L3 | Clarificação opcional → recommendation | Após L3 | — |
| V1-10 | Recomendação profissional | Quem é bom em barba? | L3 | Barbeiros filtrados | Sim | BarberDetails |
| V1-11 | Alternar profissional | E outro profissional? | L3 | Excluir contexto atual | Sim | BarberDetails |
| V1-12 | Agendamento | Quero agendar um corte | L3 | Schedule prompt; Ver horários | Prompt | Calendar drawer |
| V1-13 | Follow-up chips | [chip barbeiro] quais serviços? | L3 | Serviços relacionados | Sim | — |
| V1-14 | Período | [chip] tem algo à tarde? | L3 | Soft schedule prompt | Prompt | Calendar drawer |
| V1-15 | Fora catálogo | Produto limpeza de rosto (inexistente) | H → L2 | Não temos; sugerir próximo (hidratação/barba) se existir | Opcional | — |
| V1-16 | Fallback | Texto sem match L1–L3 | FB | Mínimo contextual (“estamos na Augusta…”); não rotação irrelevante | Não | — |

**Cobertura obrigatória:** todas as categorias da abertura da WS-08D estão representadas (cumprimentos, small talk, horários, descoberta, serviços, profissionais, agendamento, dúvidas gerais).

---

## 11. Critérios para futura implementação (GO implementação)

Implementação **só inicia** quando **todos** os itens abaixo estiverem ✅:

| ID | Critério |
|----|----------|
| I1 | Charter WS-08D merged em `main` |
| I2 | Decisão humana explícita “GO implementação WS-08D” registrada (issue/PR/issue comment) |
| I3 | Matriz V1 (§10) aprovada sem alteração de escopo ou alteração documentada |
| I4 | Plano de emenda a invariantes decidido: **manter** “no forced multi-step” e interpretar L2 como opcional **ou** emenda docs-only aprovada antes do código |
| I5 | Branch limpa de `origin/main` @ commit ≥ charter merge |
| I6 | Harness plan escrito (AP-D* ou extensão `qa:appointment`) — pode ser na mesma PR que código |
| I7 | WS-17, Page Physics, WS-09 enterprise confirmados **fora** da branch |
| I8 | Nenhum trabalho paralelo de WS-18A na mesma branch |

**Ordem sugerida de PRs (futuro):**

```txt
PR-1 (opcional): docs-only — emenda AI_CONVERSATIONAL_INVARIANTS + AI_FALLBACK_BEHAVIOR (Appointment)
PR-2: política mock Camada 1–2 + integração Camada 3 + fallback situado + harness
PR-3 (opcional): relatório observacional pós-implementação
```

---

## 12. Critérios de rollback

Rollback **obrigatório** (revert PR ou desligar política 08D) se **qualquer** condição ocorrer pós-merge:

| ID | Gatilho | Ação |
|----|---------|------|
| R-01 | `qa:appointment` ou `qa:events` falha na `main` | Revert imediato |
| R-02 | Regressão AP-* / `qa:ai-regression` | Revert + postmortem |
| R-03 | Observação humana: tom chatbot genérico ou protagonismo IA | Revert ou flag-off mock policy |
| R-04 | Sequência obrigatória de perguntas introduzida | Revert — violação invariante |
| R-05 | Import acidental `operational-ai` ou write runtime no client | Revert + auditoria bundle |
| R-06 | Drift perceptivo WS-13 (composer “inteligente”, showcase) | Revert; revalidar Sessão B antes de re-tentar |
| R-07 | Confirmação automática de reserva ou copy de “já agendado” | Revert — violação segurança transacional |
| R-08 | Escopo creep multi-vertical na mesma PR | Revert escopo excedente |

**Rollback parcial permitido:** desativar apenas Camada 1–2 via policy flag mock, mantendo WS-08C — se harness permitir e regressão zerada.

---

## Relação com workstreams adjacentes

| WS | Relação |
|----|---------|
| WS-08C | Camada 3 — **estender política**, não substituir contrato |
| WS-13 | Shell intocado; revalidar percepção se copy/composer mudar |
| WS-18A | **Proibido** misturar — ciclos independentes |
| WS-17 | Fora de escopo |
| WS-09A / 15A / 16A | Sem write/read path novo |
| WS-10 | Linguagem perceptiva — alinhar copy, não abrir Etapa funcional nova |

---

## Nomenclatura (colisão histórica)

Em [`AI_ALLOWED_EVOLUTION.md`](../ai/AI_ALLOWED_EVOLUTION.md) §8, **“WS-08D”** foi usado provisoriamente para *Realestate / outros on demand*. Este charter **redefine oficialmente** WS-08D como **Establishment Conversational Dialogue**. Expansão futura de resolver para outras verticais deve usar identificador novo (ex.: **WS-08E**) em emenda docs-only — **não** nesta sessão.

---

## Entregáveis desta workstream (fases)

| Fase | Entregável | Status |
|------|------------|--------|
| **0 — Charter** | Este documento | ✅ |
| **1 — Implementação** | Código + harness + relatório | ⏸ NO-GO até §11 |
| **2 — Observação** | Notas pós Sessão humana (copy) | ⏸ |

---

## Related

- [`WS-08C_APPOINTMENT_AI_REPORT.md`](./WS-08C_APPOINTMENT_AI_REPORT.md)
- [`WS-13_ETAPA_1_HUMAN_CLOSURE.md`](./WS-13_ETAPA_1_HUMAN_CLOSURE.md)
- [`WS-18A_OPERATIONAL_AI_MINIMUM.md`](./WS-18A_OPERATIONAL_AI_MINIMUM.md)
- [`AI_RESOLVER_CONSTITUTION.md`](../ai/AI_RESOLVER_CONSTITUTION.md)
- [`AI_CONVERSATIONAL_INVARIANTS.md`](../ai/AI_CONVERSATIONAL_INVARIANTS.md)
- [`docs/os/WORKSTREAMS.md`](../os/WORKSTREAMS.md)
