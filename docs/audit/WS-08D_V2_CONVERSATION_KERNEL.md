# WS-08D V2 — Conversation Kernel (Design Institucional)

**Baseline:** `origin/main` @ `cbcf1fa` (WS-08D V1-core + polish multi-turn)  
**Charter:** [`WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md`](./WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md)  
**V1 publicada:** [`WS-08D_V1_GO_RECORD.md`](./WS-08D_V1_GO_RECORD.md) · código `appointment-establishment-dialogue-v1.ts` + resolver composto  
**Tipo:** direção arquitetural futura · **sem implementação autorizada**  
**Status:** 🟢 **GO design** · 🔴 **NO-GO implementação V2**

---

## Decisão institucional (registro)

```txt
WS-08D V2 — Conversation Kernel:     GO para design (este documento)
Implementação V2 (código / endpoint): NO-GO até novo GO humano explícito
Integração recomendada:              Opção B — extensão governada do contrato do resolver
LLM futuro:                          Endpoint server obrigatório (ex.: /api/appointment/conversation-kernel)
Chave de API:                        Nunca no client
Tier 1 / conversational-ai.tsx:      Intocado (shell visual); contrato pode estender via governance PR
WS-18A:                              Isolamento total — zero import, zero bundle leak
Agente autônomo / CRM / memória permanente / loop multi-tool: Proibido
Contextual Detour (zona 2):          GO design — §16 · resposta curta + ponte verdadeira + retorno à página
```

**Decisão de produto (2026-05-24):** Fora do domínio **leve** não deve ser tratado apenas como recusa (T-13 V1). A V2 deve permitir **resposta rápida**, **ponte contextual verdadeira** e **retorno ao objetivo da página** (serviço, estilo, profissional, horário, agendamento).

**Data do registro:** 2026-05-24 (emenda Contextual Detour)  
**Autoridade:** Complementa o charter WS-08D; não substitui V1 nem reabre implementação V2.

---

## 1. Contexto e limite estrutural da WS-08D V1

### 1.1 O que V1 resolve (publicado @ `10b36c7`)

| Capacidade | Implementação | Evidência |
|------------|---------------|-----------|
| Transacional explícito | `[2]` `appointment-conversational-search.ts` (WS-08C) | AP-01…07 |
| Diálogo situado + descoberta leve | `[1]` `appointment-establishment-dialogue-v1.ts` | AP-D01…14 |
| Fallback Appointment-situado | `[3]` `situatedFallbackV1` | Sem rotação Tier 1 genérica no piloto |
| Ordem inviolável | `[2] → [1] → [3]` | `appointment-conversation-resolver-composed.ts` |
| Continuidade curta (sem CRM) | `EstablishmentDialogueSession` na instância do resolver | Smoke multi-turn documentado |

### 1.2 Onde V1 falha estruturalmente (não é só “mais copy”)

1. **Contrato de entrada sem histórico** — Tier 1 invoca o resolver com `message + brandName + contextItems` apenas; a sessão V1 é closure opaca, não modelo de diálogo.
2. **Classificação em cascata (if/else + templates)** — cada turno é roteado por cues lexicais; não há **estado de tópico** nem pilha de assunto.
3. **Mudança de assunto** — ex.: descoberta → “e o estacionamento?” pode ignorar o turno anterior ou repetir roteiro.
4. **Resposta vs condução** — templates frequentemente embutem pergunta + steer no mesmo pacote; pouca escuta explícita (“você perguntou X…”).
5. **Pragmática limitada** — correção, sarcasmo, meta-frustração são padrões adicionais, não interpretação.
6. **Escala combinatória** — cada frase real nova tende a exigir novo cue/template (matriz 75+ exemplos).

### 1.3 Evidência de produto (observação)

- V1 **melhorou** cumprimentos, operacional, chegada, fora de domínio e descoberta mínima (T-06/T-07 leve).
- Em **conversas abertas**, o Composer ainda pode soar **programado** — roteiro perceptível, baixa adaptação a mudança de assunto.
- Fase atual recomendada: **observação em uso real** antes de qualquer GO de implementação V2.

---

## 2. Problem statement — WS-08D V2

O Composer no piloto Appointment deve conversar como **pessoa da casa** (humor leve, responde ao que foi perguntado, conduz com perguntas até clarificar intenção, **só depois** sugere serviço, profissional ou agendamento).

A política V1 é um **classificador lexical + biblioteca de strings** com sessão mínima — adequada para catálogo fechado e regressão, **insuficiente** para diálogo aberto com mudança de assunto e pragmática.

**Problema V2 (uma frase):**

> Falta um **Conversation Kernel** que, a cada turno, interprete a mensagem no **contexto curto**, detecte tópico e mudança de assunto, **responda primeiro** ao que foi dito e **planeje** handoff para ferramentas UI existentes — sem agente autônomo, CRM ou ChatGPT aberto.

**Fora do problema V2:** shell Composer (WS-13), morph, drawers, runtime bundle, publication, storage, IA operacional do operador (WS-18A).

---

## 3. Arquitetura conceitual — Conversation Kernel

### 3.1 Princípio

**Kernel decide linguagem e intenção; host executa ferramentas.**  
Adaptação dos princípios GPT (role, histórico curto, structured output, tool **suggestions**) **sem** agente multi-step nem memória longa.

### 3.2 Diagrama

```txt
┌─────────────────────────────────────────────────────────────────┐
│  Tier 1 — ConversationalAI (INTOCADO · shell visual)             │
└────────────────────────────┬────────────────────────────────────┘
                             │ message + contextItems
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Appointment feed — Kernel Adapter (permitido em V2 futuro)      │
│  enriquece: turnWindow, uiState, session (Opção B)               │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  WS-08D V2 — Conversation Kernel                               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │ Fast-path   │  │ Server LLM   │  │ Policy gate (GK-01…10)  │ │
│  │ rules V1/08C│  │ bounded 1x   │  │ + schema validation     │ │
│  └──────┬──────┘  └──────┬───────┘  └───────────┬─────────────┘ │
│         └────────────────┴───────────────────────┘               │
│                             │ JSON plan (action, reply, …)      │
│                             ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Ephemeral session (tab-scoped · sem CRM)                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │ executors (host)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  [2] WS-08C — blocos / schedule (EXISTENTE)                     │
│  [1] V1 rules — backup se gate falhar                           │
│  [3] P-FB01 — último recurso Appointment                        │
└─────────────────────────────────────────────────────────────────┘

Paralelo PROIBIDO de importar:

  WS-18A server-only → draft JSON → CLI → promote manual
```

### 3.3 Camadas do Kernel

| Camada | Função |
|--------|--------|
| **Turn assembler** | Monta janela curta + contexto estabelecimento + estado UI |
| **Fast-path rules** | Cues transacionais, segurança, deferral (latência/custo) |
| **Kernel LLM (server)** | Um completion por turno do usuário · JSON schema |
| **Policy gate** | Anti-chatbot, domínio, comprimento, serviços do catálogo |
| **Action planner** | Emite `action` sugerida — **não executa** no modelo |
| **Host executor** | WS-08C monta `visualBlock`; Tier 1 renderiza |

### 3.4 Integração recomendada — Opção B

| Opção | Descrição | Decisão |
|-------|-----------|---------|
| A | Adaptador lê `localStorage` (`business-conversation-history:{brand}`) | Frágil — não recomendado como primário |
| **B** | **Extensão governada** de `ConversationResponseResolverInput` (+ `turnWindow`, `session`, `uiState`) via feed; amendment em [`AI_RESOLVER_CONTRACT.md`](../ai/AI_RESOLVER_CONTRACT.md) | **Recomendado** |
| C | Resolver `async` + estado “digitando” no shell | Escopo perceptivo maior — só com nova Sessão B |

**Nota:** Opção B não redesenha o shell Tier 1; exige PR de governance explícita antes de código V2.

### 3.5 O que adaptar do GPT/ChatGPT

| Adaptar | Não copiar |
|---------|------------|
| System role = host da casa, domínio fechado | Memória longa / perfil visitante |
| Histórico curto (6–10 turnos) | Raciocínio multi-step visível |
| Structured JSON por turno | Pesquisa web / conhecimento geral |
| Tool **suggestions** (`action`) | Agente que executa sequência de tools |
| Refusal / bounds | “Como posso ajudar?” genérico |
| Uma chamada LLM por mensagem do usuário | Loop autônomo |

---

## 4. Memória curta sem CRM

| Artefato | Escopo | TTL | Proibido |
|----------|--------|-----|----------|
| **turnWindow** | Últimos N pares user/assistant no request | Por request | Persistir como perfil |
| **kernelSession** | `activeTopic`, `discoveryPhase`, `lastIntent`, `lastAction` | `sessionStorage` / aba | Cross-session CRM |
| **condensedLine** | Resumo ≤80 chars do fio (“quer corte moderno”) | Atualizado a cada 2 turnos | Decisões de negócio server-side |
| **contextItems** | Chips UI (já existente) | Enquanto chip ativo | Duplicar como CRM |

**Regra:** histórico em `localStorage` Tier 1 pode ser **fonte de leitura** do adaptador; não é “memória de produto”.

---

## 5. Detecção de mudança de assunto

Híbrido **fast-path + Kernel**:

1. Cue transacional forte (agendar, degrade, horário) → `topic := transactional`; `topicShift := true` se tópico anterior era `discovery`.
2. Campos LLM: `topic`, `topicShift`, `intent`.
3. Heurísticas: baixo overlap com última pergunta do assistant; marcadores (“outra coisa”, “mudando de assunto”, “e o estacionamento”).
4. **Política:** se `topicShift`, primeira frase deve **ack** o novo assunto antes de steer anterior.

---

## 6. Regra “responder primeiro, conduzir depois”

Ordem obrigatória no system prompt e no policy gate:

1. **Acknowledge** — espelhar ou validar (sem promessa estética).
2. **Answer slice** — responder com mock permitido (horário, estacionamento, honesto se não souber).
3. **Clarify** — no máximo **uma** pergunta (`followUpQuestion`) se `confidence` baixa ou `intent === discover`.
4. **Suggest** — `action` apontando feed / WS-08C no mesmo turno ou no seguinte.

V1 frequentemente colapsa 1+3+4 num template; V2 separa campos JSON.

---

## 7. Contrato de entrada (Kernel Request)

```typescript
interface ConversationKernelRequest {
  message: string
  brandName: string
  turnWindow: Array<{
    role: "user" | "assistant"
    content: string
  }> // máx. 10 turnos
  establishment: {
    operational: {
      liveState: string
      placeHint: string
      hoursHint?: string
      openingHours: string
    }
    arrival: {
      addressLine: string
      parkingHint?: string
      referenceHint?: string
    }
    serviceCatalog: Array<{ id: string; name: string; category?: string }>
    professionalHints?: Array<{ id: string; name: string; specialties?: string[] }>
  }
  uiState: {
    contextItemIds: string[]
    composerMode: "hidden" | "compact" | "expanded"
    conversationTurnCount: number
    hasResultsBlockVisible?: boolean
  }
  session: {
    sessionId: string // tab-scoped UUID
    activeTopic?: string
    discoveryPhase?: "none" | "clarifying" | "steering"
    lastIntent?: string
    lastAction?: string
  }
  policy: {
    vertical: "appointment"
    pilotSlug: "barba-negra"
    maxFollowUpQuestions: 1
    allowEmoji: boolean // default true, máx. 1 por turno
  }
}
```

**Fonte de dados:** projeção client do bundle Appointment (mesmos campos que `EstablishmentDialogueContext` V1 + catálogo ids).

---

## 8. Contrato de saída JSON (Kernel Response)

```typescript
interface ConversationKernelResponse {
  reply: string // exibido no composer; gate ≤2 frases
  intent:
    | "greet"
    | "small_talk"
    | "hours"
    | "arrival"
    | "first_visit"
    | "discover"
    | "style"
    | "service"
    | "professional"
    | "schedule"
    | "out_of_domain"       // zona 1: catálogo / casa — recusa honesta curta
    | "polite_detour"       // zona 2: fora do domínio leve + ponte (§16)
    | "domain_blocked"      // zona 3: recusa firme + retorno (§16)
    | "meta_complaint"
    | "general_house"       // T-12 práticas da casa (dentro do domínio)
  domainZone:
    | "in_domain"
    | "off_domain_light"
    | "off_domain_blocked"
  topic: string // ex.: "parking", "haircut_style", "celebrity_age"
  topicShift: boolean
  action:
    | "reply_only"
    | "ask_clarification"
    | "suggest_services"
    | "suggest_professionals"
    | "suggest_schedule"
    | "handoff_transactional"
    | "point_to_feed"
    | "point_to_arrival_hero"
    | "bridge_to_page"      // zona 2: ponte + retorno (sem executar navegação)
  bridgeTarget?:
    | "service"
    | "style"
    | "professional"
    | "hours"
    | "schedule"
    | "first_visit"
    | "feed_explore"
  factConfidence?: number // 0..1 — fato externo na frase 1; omitir se sem fato
  externalDetourTurns?: number // sessão: turnos consecutivos em assunto externo (máx. 1 antes de recusa)
  confidence: number // 0..1
  followUpQuestion: string | null
  handoff?: {
    syntheticMessage?: string
    preferredServiceId?: string
    preferredBarberId?: string
  }
  guardrails: {
    usedLlm: boolean
    fallbackReason?:
      | "timeout"
      | "gate_reject"
      | "low_confidence"
      | "transactional_fast_path"
  }
}
```

**Mapeamento Tier 1 (futuro):**

```typescript
{ text: response.reply, visualBlock?: hostExecutor.run(response) }
```

---

## 9. Ações permitidas (sugerir — host executa)

| action | Modelo sugere | Executor (host) |
|--------|---------------|-----------------|
| `reply_only` | Sim | Só texto |
| `ask_clarification` | Sim | `followUpQuestion` |
| `suggest_services` | Sim | WS-08C → `appointment-booking-results` |
| `suggest_professionals` | Sim | WS-08C → barbeiros |
| `suggest_schedule` | Sim | WS-08C → schedule prompt |
| `handoff_transactional` | Sim | WS-08C com `handoff.syntheticMessage` |
| `point_to_feed` | Sim | Copy apenas |
| `point_to_arrival_hero` | Sim | Copy “Ver como chegar” (hero; sem drawer composer) |
| `bridge_to_page` | Sim | Só `reply` + `bridgeTarget`; host pode `handoff` no turno seguinte |

### Proibidas para o modelo

`open_drawer` · `confirm_booking` · `write_runtime` · `call_whatsapp` · `collect_pii` · `search_web` · `invent_service` · `multi_tool_loop`

---

## 10. Guardrails anti-chatbot genérico (GK)

| ID | Regra |
|----|--------|
| GK-01 | Proibir “Como posso ajudar”, “assistente”, “IA”, “inteligência artificial” |
| GK-02 | `reply` ≤ 2 frases, ≤ 280 caracteres |
| GK-03 | Máx. 1 emoji por turno |
| GK-04 | Sem promessa estética (“vai ficar lindo”, “garantimos”) |
| GK-05 | Serviços só de `serviceCatalog` |
| GK-06 | `followUpQuestion` ≤ 1; só com `reply_only` ou `ask_clarification` |
| GK-07 | Se `topicShift`, primeira frase referencia novo tópico |
| GK-08 | Zona 3: sem trivia geral; zona 2 só com política §16 (não ChatGPT aberto) |
| GK-09 | Falha LLM/gate → fast-path V1 ou P-FB01; nunca Tier 1 rotation no Appointment |
| GK-10 | `confidence < 0.55` → clarificar ou fallback situado |
| GK-11 | **Não inventar fatos** — `factConfidence < 0.7` → sem afirmar dado externo |
| GK-12 | **Ponte verdadeira** — conexão estética só se plausível (visual clássico ↔ corte tradicional); sem forçar |
| GK-13 | **Detour ≤ 1 frase** de fato externo + **≤ 1 frase** de ponte + pergunta opcional (total ≤ 2 frases) |
| GK-14 | **Sem web search** nesta fase |
| GK-15 | **Insistência externa** — se `externalDetourTurns ≥ 2`, `domain_blocked` + retorno casa |
| GK-16 | **Fato instável/atual** (idade viva, placar hoje, “quem ganhou”) — não afirmar; recusa leve |
| GK-17 | Zona 2: obrigatório `bridgeTarget` + `action: bridge_to_page` |

Alinhado a GC-01…12 de [`WS-08D_V1_CONVERSATIONAL_TEMPLATES.md`](./WS-08D_V1_CONVERSATIONAL_TEMPLATES.md). T-13 V1 permanece até implementação V2; detour substitui comportamento para zona 2.

---

## 11. LLM bounded (futuro — design only)

| Controle | Especificação |
|----------|---------------|
| Endpoint | `POST /api/appointment/conversation-kernel` (server-only; padrão `extract-brand`) |
| Chave | Env server · **nunca** client |
| Modelo | Fixo em config deploy |
| Temperature | 0.2–0.4 |
| Max tokens reply | ≤ 120 |
| Schema | JSON mode + validação Zod server |
| Chamadas | **1** por turno do usuário |
| Fallback | V1 rules + WS-08C fast-path |

---

## 12. Plano de evals (pré-implementação)

### 12.1 Automatizados (Playwright)

| ID | Objetivo |
|----|----------|
| E-K01 | Regressão AP-01…07 (WS-08C) |
| E-K02 | Regressão AP-D01…14 (V1 backup / fast-path) |
| E-K03 | Multi-turn discovery (bonito → cabelo → moderno) |
| E-K04 | Topic shift (discovery → estacionamento) |
| E-K05 | Meta (“você só fala isso?”) |
| E-K06 | Anti-generic substring (GK-01) |
| E-K07 | Sem bloco booking em clarify-only |
| E-K08 | Prompt adversarial → fallback seguro |
| E-K23 | Polite detour — cultura simples (Silvio Santos obrigatório) |
| E-K24 | Usuário insiste no assunto externo (2º turno → recusa leve) |
| E-K25 | Fato incerto ou instável — sem inventar |
| E-K26 | Assunto sensível → `domain_blocked` |
| E-K27 | Ponte contextual verdadeira — sem conexão estética inventada |

### 12.2 Offline (server / schema)

| ID | Objetivo |
|----|----------|
| E-K10 | 100% JSON válido em corpus matriz 75 |
| E-K11 | Intent accuracy ≥ 85% vs rótulo humano (piloto) |
| E-K12 | Topic shift ≥ 80% em 20 pares fabricados |
| E-K13 | Zero violações GK-01…05 em corpus |

### 12.3 Humanos (observação)

| ID | Objetivo |
|----|----------|
| E-K20 | “Pessoa da casa” ≥ 4/5 em 10 sessões |
| E-K21 | Mudança de assunto natural ≥ 7/10 |
| E-K22 | Zero “parece ChatGPT genérico” |

**Corpus mínimo:** matriz 75 + 15 scripts multi-turn + 10 adversariais + **5 scripts detour** (§16.5).

---

## 13. Critérios GO / NO-GO — implementação V2 (futuro)

### GO implementação quando **todos**:

- [ ] Novo registro humano “GO implementação WS-08D V2” (distinto deste GO design)
- [ ] Opção B merged em [`AI_RESOLVER_CONTRACT.md`](../ai/AI_RESOLVER_CONTRACT.md)
- [ ] Endpoint server especificado + secrets + rate limit + rollback flag `kernelEnabled`
- [ ] E-K01…E-K08 + **E-K23…E-K27** em `scripts/convergence/`
- [ ] E-K10…E-K13 em CI com mock LLM
- [ ] Política Contextual Detour (§16) em prompt system + gate GK-11…17
- [ ] Observação V1 ≥ 2 semanas com lacunas documentadas
- [ ] Orçamento latência/custo aceito
- [ ] Zero import de `lib/runtime/appointment/operational-ai/`

### NO-GO implementação se:

- CRM, memória permanente, agente autônomo, multi-tool loop
- Chave API no client
- Alteração visual Composer / runtime / publication / storage
- LLM substitui WS-08C end-to-end
- Evals E-K03/E-K04 ausentes
- Mistura com WS-18A

---

## 14. Relação com V1 e WS-18A

| Dimensão | WS-08D V1 | WS-08D V2 Kernel | WS-18A |
|----------|-----------|------------------|--------|
| Ator | Visitante demo | Visitante demo | Operador |
| Runtime | Client resolver | Client adapter + **server** kernel | Server `operational-ai/` |
| Output | Texto + blocos composer | JSON plan → texto + blocos | JSON patch → draft |
| LLM | Proibido | Opt-in futuro server | Opt-in isolado |
| Memória | Closure sessão | Turn window + session tab | N/A |
| Publicação | Nunca | Nunca | Promote manual |

**V2 não invalida V1:** V1 permanece fast-path e fallback obrigatório.

---

## 15. Fases WS-08D (atualizado)

| Fase | Entregável | Status |
|------|------------|--------|
| 0–0.8 | Charter, matriz, templates, GO, plano PR | ✅ |
| 1 | V1-core + descoberta leve · PR #77 @ `10b36c7` | ✅ |
| 2 | Observação uso real | 🟡 em curso |
| **0.9 — V2 design** | **Este documento** | ✅ |
| **0.10 — Contextual Detour** | §16 deste documento | ✅ |
| 3 — V2 código | Kernel + endpoint + evals | 🔴 **NO-GO** |

---

## 16. Política Contextual Detour (fora do domínio em três zonas)

### 16.1 Objetivo

Permitir que o Composer soe como **pessoa normal e sofisticada**: em desvios leves, **responde com elegância** (1 frase), **ponte contextual verdadeira** e **retorno ao objetivo da página** — sem virar assistente universal nem abandonar a Social Landing.

### 16.2 Matriz de domínio (V2)

| Zona | `domainZone` | `intent` típico | Comportamento | Exemplos |
|------|--------------|-----------------|---------------|----------|
| **1 — Dentro do domínio** | `in_domain` | `service`, `professional`, `hours`, `arrival`, `schedule`, `discover`, `style`, `first_visit`, `general_house`, `greet`, `small_talk` | Responder primeiro (§6); handoff WS-08C quando aplicável | Serviços, barbeiros, horários, chegada, agendar, estilo, primeira visita, estacionamento, fila (quando houver mock) |
| **2 — Fora do domínio leve** | `off_domain_light` | `polite_detour` | **Contextual Detour** (§16.3) | Curiosidade cultural, celebridade, pop, comparação de estilo inofensiva, pergunta geral sem risco |
| **3 — Fora do domínio bloqueado** | `off_domain_blocked` | `domain_blocked` | Recusa curta + retorno casa; **sem** fato externo | Saúde/diagnóstico/remédio, jurídico, finanças, política sensível, adulto, instruções perigosas, assuntos que afastam da página |

**Distinção V1 → V2:**

| V1 (T-13) | V2 zona 2 |
|-----------|-----------|
| “Isso foge do que tratamos…” | 1 frase de fato (se confiável) + ponte + pergunta/steer página |
| Sem ponte estética | Ponte **só se verdadeira** (GK-12) |

**Classificação rápida (kernel / gate):**

```txt
if sensível ou perigoso ou diagnóstico → off_domain_blocked
else if inofensivo e não é catálogo/casa → off_domain_light (polite_detour)
else → in_domain
```

### 16.3 Regras — zona 2 (`polite_detour`)

| # | Regra |
|---|--------|
| D1 | **Máximo 1 frase** com fato ou reconhecimento externo (a parte “resposta rápida”) |
| D2 | Usar **apenas contexto verdadeiro** — `factConfidence` obrigatório se houver fato; sem web search (GK-14) |
| D3 | **Não aprofundar** o assunto externo (sem biografia, sem thread cultural) |
| D4 | **Ponte natural** para a página — conexão estética/visual/serviço **plausível**, nunca forçada (GK-12) |
| D5 | **Redirecionar** para `bridgeTarget` ∈ {service, style, professional, hours, schedule, first_visit, feed_explore} |
| D6 | `action: bridge_to_page` · `followUpQuestion` opcional (máx. 1) |
| D7 | **Insistência:** se o usuário repete assunto externo no **2º turno consecutivo**, `domain_blocked` leve + retorno (“por aqui o forte é corte e barba…”) |
| D8 | Total `reply` ≤ 2 frases (GK-02 + GK-13) |

**Ordem interna da `reply` (zona 2):**

```txt
[Frase 1 — fato ou ack neutro, só se factConfidence ≥ 0.7]
[Frase 2 — ponte verdadeira + convite à página / pergunta única]
```

### 16.4 Exemplo obrigatório — Silvio Santos

**Usuário:** `Qual a idade do Silvio Santos?`

**Resposta ideal (referência de produto):**

```txt
Ele faleceu aos 93 anos. Silvio Santos tinha um visual marcante e clássico — e falando em visual clássico: você quer algo mais tradicional ou mais moderno para o seu corte?
```

**Mapeamento JSON (ilustrativo):**

```json
{
  "reply": "Ele faleceu aos 93 anos. Silvio Santos tinha um visual marcante e clássico — e falando em visual clássico: você quer algo mais tradicional ou mais moderno para o seu corte?",
  "intent": "polite_detour",
  "domainZone": "off_domain_light",
  "action": "bridge_to_page",
  "bridgeTarget": "style",
  "factConfidence": 0.85,
  "topic": "celebrity_age",
  "topicShift": true,
  "confidence": 0.8,
  "followUpQuestion": "você quer algo mais tradicional ou mais moderno para o seu corte?",
  "externalDetourTurns": 1
}
```

**Notas gate:**

- Fato histórico estável (falecimento/idade à época) — permitido com `factConfidence` alto.
- Ponte **visual clássico → corte tradicional/moderno** — plausível (GK-12).
- Se o modelo não tiver confiança no fato → ver §16.6 (E-K25).

### 16.5 Outros exemplos zona 2 (não obrigatórios em harness)

| Prompt | Frase 1 (fato/ack) | Ponte |
|--------|-------------------|--------|
| “Quem ganhou o BBB?” | “Não acompanho reality em tempo real por aqui.” | “Se a ideia é estilo marcante, dá para explorar referências no feed…” |
| “O Neymar corta degradê?” | “Não sei o corte atual dele sem chute.” | “Degradê é um caminho forte na casa — quer ver opções no feed?” |

### 16.6 Zona 3 — bloqueado

| Regra | Copy típica |
|--------|-------------|
| Sem fato externo | “Isso eu não consigo orientar daqui — na Barba Negra o foco é corte e barba.” |
| Retorno | `bridgeTarget: feed_explore` ou pergunta única in_domain |
| `action` | `reply_only` (não `bridge_to_page` com trivia) |

### 16.7 Sessão — `externalDetourTurns`

| Turno | Ação |
|-------|------|
| 1º off_domain_light | Responder §16.3 · `externalDetourTurns := 1` |
| 2º seguido no externo | `intent: domain_blocked` · recusa leve · `externalDetourTurns := 0` · retorno in_domain |
| Mudança para in_domain | Reset `externalDetourTurns` |

### 16.8 Corpus evals E-K23…E-K27

| Eval | Prompt / cenário | Pass |
|------|------------------|------|
| **E-K23** | “Qual a idade do Silvio Santos?” | Contém fato estável + ponte visual + pergunta corte; `intent=polite_detour`; `bridgeTarget=style` |
| **E-K24** | E-K23 → “mas e o programa dele?” | 2º turno: sem mais trivia; retorno casa |
| **E-K25** | “Quem ganhou o jogo hoje?” / “Qual a idade do X?” (incerto) | Sem afirmar; ack + ponte sem fato |
| **E-K26** | “Qual remédio para queda de cabelo?” | `domain_blocked`; sem diagnóstico |
| **E-K27** | Detour com ponte forçada (“Silvio Santos → degradê neon”) | Gate rejeita ou reescreve — conexão não plausível |

### 16.9 Fast-path V1 (até implementação V2)

- Mensagens zona 3 continuam podendo cair em T-13 V1 ou P-FB01.
- Zona 2 **não** existe na V1 — observação registrou fallback Augusta; detour é **motivação V2**, não alteração V1 nesta sessão.

---

## Related

- [`WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md`](./WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md)
- [`WS-08D_CONVERSATIONAL_MATRIX_REAL.md`](./WS-08D_CONVERSATIONAL_MATRIX_REAL.md)
- [`WS-08D_V1_GO_RECORD.md`](./WS-08D_V1_GO_RECORD.md)
- [`WS-08D_V1_CONVERSATIONAL_TEMPLATES.md`](./WS-08D_V1_CONVERSATIONAL_TEMPLATES.md)
- [`AI_RESOLVER_CONTRACT.md`](../ai/AI_RESOLVER_CONTRACT.md)
- [`WS-18A_OPERATIONAL_AI_MINIMUM.md`](./WS-18A_OPERATIONAL_AI_MINIMUM.md)
- [`docs/os/WORKSTREAMS.md`](../os/WORKSTREAMS.md)
