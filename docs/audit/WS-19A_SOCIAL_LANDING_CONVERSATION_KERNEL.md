# WS-19A — Social Landing Conversation Kernel (Charter de Plataforma)

**Baseline:** `origin/main` @ `4172f2d`  
**Autoridade:** Workstream de **plataforma** — conversa cross-model no Composer visitante  
**Tipo:** charter + contratos + evals — **sem implementação** nesta publicação  
**Status:** ✅ **Charter publicado** · 🔴 **Implementação bloqueada** até novo GO explícito  
**Relacionados:** [`WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md`](./WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md) · [`WS-08D_V2_CONVERSATION_KERNEL.md`](./WS-08D_V2_CONVERSATION_KERNEL.md) · [`AI_RESOLVER_CONSTITUTION.md`](../ai/AI_RESOLVER_CONSTITUTION.md) · [`WS-18A_OPERATIONAL_AI_MINIMUM.md`](./WS-18A_OPERATIONAL_AI_MINIMUM.md)

---

## Registro institucional (decisões)

**Data:** 2026-05-24

```txt
WS-19A design / platform charter:     GO (este documento)
WS-19A implementação (código):        NO-GO
LLM visitante / endpoint Kernel:      NO-GO (fase atual)
V1.1 rules como estratégia final:     NO-GO
V1.1 implementação em main:           NO-GO (estratégia encerrada)
V1.1 local (working tree):            baseline comparativo / experimento
WS-08D V2 Appointment isolado:        NO-GO como kernel separado — perfil 19A
WS-08D V1 em produção:                mantida até migração 19A autorizada
Tier 1 / conversational-ai.tsx:       intocado
WS-18A:                               isolamento total — zero overlap
```

**Primeira fase futura autorizada (após `GO implementação WS-19A fase 1`):**

| # | Entregável | LLM | Tier 1 |
|---|------------|-----|--------|
| 1 | Contratos `ModelContextPack` + `KernelResponse` (types-only ou docs fixture) | ❌ | ❌ diff |
| 2 | Matriz evals E-G00…E-G16 + fixture `conversation-kernel-eval-matrix.json` | ❌ | ❌ |
| 3 | Rule-kernel stub (determinístico) | ❌ | ❌ |
| 4 | Adapter piloto Appointment + `buildModelContextPack` | ❌ | ❌ |
| 5 | Comparativo V1.1 experimento vs stub (AP-D15…25) | ❌ | ❌ |

---

## Checklist do charter (cobertura)

| Requisito | Secção |
|-----------|--------|
| Problem statement universal | §2 |
| Por que V1.1 rules não escala | §1 |
| Arquitetura cross-model | §3 |
| `ModelContextPack` | §4 |
| `KernelResponse` | §5 |
| Actions globais | §9 |
| Actions por vertical | §10 |
| Guardrails globais | §7 |
| Evals globais | §11 |
| Destino V1.1 local | §13 |
| Implementação NO-GO | Registro + §15 |

---

## Decisão de nomenclatura (registro)

| Opção | Veredito |
|-------|----------|
| **WS-08E** Cross-Model Conversation Kernel | **Não recomendado** — série WS-08 = *resolver transacional por vertical* (08A…08C); “E” no charter histórico reserva *nova vertical*, não camada plataforma |
| **WS-19A** Social Landing Conversation Kernel | **Recomendado** — workstream de **plataforma conversacional** (paralela à Era 3 resolvers, ortogonal a WS-18A operacional) |

**WS-08D** permanece: piloto Appointment + diálogo estabelecimento; **não** é o guarda-chuva cross-model. O V2 design passa a ser **perfil `establishment.appointment`** do WS-19A.

---

## 1. Parecer crítico sobre V1.1 rules

### O que V1.1 provou (valor local)

- Perguntas **recorrentes** (pix, remarcar, nome, outra cidade, massagem) podem sair do fallback Augusta com **copy honesta** curta.
- **Deferral** WS-08C ↔ diálogo é necessário (ex.: “barbearia” ≠ especialidade Barba).
- Harness AP-D15…25 é útil como **regressão de sintomas**, não como arquitetura.

### Por que não escala (resposta obrigatória #1)

| Mecanismo V1.1 | Limite estrutural |
|----------------|-------------------|
| **Cues lexicais** (`includes("pix")`, listas de cidades) | Cobertura combinatória infinita; toda frase nova exige patch |
| **Ordem if/else fixa** | Conflitos entre matchers (horário vs vaga vs estacionamento); prioridade manual frágil |
| **Templates monolíticos** | Misturam resposta + pergunta + steer; violam “responder antes de conduzir” |
| **Sessão opaca** (`discoveryTurns`, `awaitingFocus`) | Não modela tópico, pilha de assuntos nem ack de mudança |
| **Só Appointment** | Duplicaria 4× (`*-conversational-search` + `*-dialogue-v1`) |
| **Sem contrato de saída** | Host não sabe *intent*, *action*, *topicShift* — só `text` |
| **Fallback residual único** | Uma string (“veja no feed”) para tudo não coberto → sensação de bot |

**Conclusão:** V1.1 é **camada sintomática** adequada a piloto e baseline comparativo; **não** é solução final nem deve ser publicada como tal.

### Problemas estruturais (tarefa 2)

| Problema | Estrutural? | V1.1 mitiga? |
|----------|-------------|--------------|
| Pergunta fora do roteiro | ✅ | Parcial (mais cues) |
| Mudança de assunto | ✅ | Parcial (reset leve) |
| Prática sem dado cadastrado | ✅ | Parcial (copy honesta) |
| Fallback repetitivo | ✅ | Parcial |
| Conduzir antes de responder | ✅ | Não |
| Expansão multi-modelo / vertical | ✅ | Não |

---

## 2. Problem statement — solução universal

> O Composer em **qualquer modelo** da Social Landing deve soar como **anfitrião da página** — responder ao que foi perguntado, admitir lacunas de dados, mudar de assunto sem perder o objetivo do feed, e só então sugerir entidades/ações já existentes na UI — **sem** chatbot genérico, CRM, memória permanente ou agente autônomo.

**Não é o problema:** shell Tier 1, morph, drawers, runtime write, WS-18A, LLM operador.

**É o problema:** ausência de **Kernel conversacional compartilhado** com **Context Pack por modelo** e **Actions registradas**, hoje substituído por N resolvers transacionais + fallback rotativo Tier 1.

---

## 3. Arquitetura — Cross-Model Conversation Kernel

### 3.1 Princípio

```txt
Kernel decide linguagem + intenção + action sugerida (structured).
Host (feed vertical) executa action → visualBlock / drawer / scroll.
Fast-path rules = dados, não labirinto de if/else por frase.
```

### 3.2 Diagrama

```txt
┌──────────────────────────────────────────────────────────────────┐
│ Tier 1 — ConversationalAI (INTOCADO)                              │
│   message + contextItems + brandName                              │
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ Feed adapter (por modelo) — monta ModelContextPack + turnWindow   │
│   NÃO contém lógica de frase-a-frase                              │
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ WS-19A — Conversation Kernel (GLOBAL)                             │
│  ┌──────────────┐  ┌─────────────────┐  ┌────────────────────┐ │
│  │ Topic state  │  │ Planner         │  │ Policy gate        │ │
│  │ (ephemeral)  │  │ answer→clarify→ │  │ GK-* global        │ │
│  │              │  │ suggest         │  │                    │ │
│  └──────────────┘  └─────────────────┘  └────────────────────┘ │
│  ┌──────────────┐  ┌─────────────────┐                         │
│  │ Fast-path    │  │ LLM (fase futura)│  NO-GO nesta fase       │
│  │ rule tables  │  │ server 1x/turn   │                         │
│  └──────────────┘  └─────────────────┘                         │
└────────────────────────────┬─────────────────────────────────────┘
                             │ KernelResponse
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ Action executor (por vertical) — registry lookup                  │
│  ex.: show_catalog_cards, open_schedule, honest_text_only         │
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ Resolver transacional legado (WS-08A/B/C + ecommerce frozen)      │
│  só quando action = delegate_transactional_resolver               │
└──────────────────────────────────────────────────────────────────┘
```

### 3.3 O que é global vs específico (tarefa 4)

| Global (WS-19A) | Específico por modelo (adapter + pack) |
|-----------------|--------------------------------------|
| `KernelResponse` schema | Catálogo de entidades (produtos, pratos, serviços, médicos) |
| Topic / topicShift / discoveryPhase | Tom e `houseVoice` |
| Guardrails GK-01…N | Actions permitidas no registry |
| Ordem answer → clarify → suggest | Fallback situado por marca |
| Evals E-G* cross-model | Fast-path tables (YAML/JSON), não TS espalhado |
| turnWindow / session tab-scoped | Deferral para transactional resolver |
| domainZone (in / off_light / blocked) | Visual block kinds existentes |

---

## 4. Contrato `ModelContextPack` (obrigatória #2)

```typescript
/** Montado pelo feed — projeção read-only do que a página já mostra. */
interface ModelContextPack {
  /** Identidade */
  modelId: "ecommerce" | "restaurant" | "health" | "appointment"
  brandName: string
  pilotSlug?: string

  /** Voz e limites editoriais */
  houseVoice: {
    roleLabel: string // "anfitrião da loja", "da casa", "da clínica"
    locale: "pt-BR"
    maxReplySentences: 2
    allowEmoji: boolean
  }

  /** Operacional genérico (opcional por modelo) */
  operational?: {
    liveState?: string
    placeHint?: string
    hoursHint?: string
    openingHours?: string
    addressLine?: string
    parkingHint?: string
    contactHint?: string // WhatsApp, balcão
  }

  /** Catálogo fechado — ids estáveis para gate anti-alucinação */
  catalog: {
    entities: Array<{
      id: string
      kind: string // product | dish | service | professional | ...
      name: string
      category?: string
      attributes?: Record<string, string | number | boolean> // duration, price visible, etc.
    }>
    /** O que a casa NÃO oferece (negativo explícito) */
    exclusions?: string[]
  }

  /** Capacidades UI já existentes — Kernel não inventa superfície */
  capabilities: {
    visualBlockKinds: string[]
    supportsContextChips: boolean
    supportsSchedulePrompt: boolean
    supportsCartOrBookingDrawer: boolean
    supportsArrivalMap: boolean
  }

  /** Ponte para resolver transacional legado */
  transactionalResolverId: string // ex.: "appointment-ws08c"

  /** Regras honestas sem dado (declarativo, não código) */
  dataGaps: Array<{
    topic: string // payment, wifi, queue, reschedule_policy, ...
    honestReply: string
  }>
}
```

**Regra:** o pack é **dados + declarações**; o feed só **mapeia** mock/runtime projection → pack. Sem `if (message.includes("pix"))` no feed.

---

## 5. Contrato `KernelResponse` (obrigatória #3)

```typescript
interface KernelResponse {
  /** Camada linguística (sempre) */
  reply: string

  /** Classificação — drive evals e analytics */
  intent:
    | "greet" | "small_talk" | "operational" | "discover"
    | "entity_lookup" | "transactional" | "practical_question"
    | "out_of_catalog" | "polite_detour" | "domain_blocked"
    | "meta_complaint"

  domainZone: "in_domain" | "off_domain_light" | "off_domain_blocked"

  topic: string
  topicShift: boolean

  /** Responder primeiro (#6) */
  structure: {
    acknowledged: boolean
    answered: boolean
    followUpQuestion?: string // máx. 1
  }

  confidence: "high" | "medium" | "low"

  /** Plano de UI — host executa */
  action: KernelAction

  /** Fast-path ou futuro LLM — auditoria */
  source: "rule_table" | "transactional_delegate" | "llm_bounded"
}

type KernelAction =
  | { type: "text_only" }
  | { type: "delegate_transactional_resolver" }
  | { type: "show_catalog_cards"; entityIds: string[]; maxItems: 3 }
  | { type: "show_schedule_prompt"; barberId?: string; serviceId?: string }
  | { type: "bridge_to_page"; anchor: "feed" | "hero_map" | "contact" | "cart" }
  | { type: "situated_fallback" }
```

**Mapeamento host:** `KernelResponse` → `ConversationResponseResolverResult` (text + optional visualBlock) **sem** alterar `conversational-ai.tsx` na fase 0 (adapter no feed).

---

## 6. Como cada modelo informa dados sem lógica própria (obrigatória #4)

| Passo | Responsável |
|-------|-------------|
| 1 | Cada feed expõe `buildModelContextPack(): ModelContextPack` (projeção pura) |
| 2 | Kernel carrega **rule tables** por `modelId` + **shared tables** (greet, hours, meta) |
| 3 | `delegate_transactional_resolver` chama o módulo WS-08* existente |
| 4 | Novos tópicos = linha em `dataGaps` ou regra na tabela — **não** novo arquivo dialogue |

**Anti-padrão proibido:** `appointment-establishment-dialogue-v2.ts` paralelo em cada vertical.

---

## 7. Como impedir ChatGPT genérico (obrigatória #5)

| GK | Regra |
|----|-------|
| GK-01 | `domainZone !== in_domain` → sem conselho geral; detour curto + ponte |
| GK-02 | Entidades citadas ⊆ `catalog.entities` |
| GK-03 | Proibido “Como posso ajudar?” / “Sou um assistente” |
| GK-04 | `reply` ≤ `maxReplySentences` |
| GK-05 | `followUpQuestion` ≤ 1 e só se `!structure.answered` ou `discover` |
| GK-06 | Sem promessa médica/estética/legal |
| GK-07 | Sem auto-booking / confirmar reserva |
| GK-08 | Action deve ∈ registry do `modelId` |
| GK-09 | Health: defer humano em sintoma/diagnóstico |
| GK-10 | Ecommerce frozen baseline intocado sem eval |

---

## 8. Conversa natural sem abandonar a página (obrigatória #6)

- **polite_detour** (zona 2): 1 frase humana + `bridge_to_page` (serviço/estilo/card).
- **topicShift:** primeira frase ack do novo tópico; não repetir pergunta de discovery anterior.
- **Objetivo da página:** todo turno termina com `action` que aponta feed, drawer existente ou texto honesto — nunca thread infinita.

---

## 9. Actions globais (obrigatória #7)

| Action | Descrição |
|--------|-----------|
| `text_only` | Só copy situada |
| `situated_fallback` | Último recurso marca-aware (não Tier 1 rotativo) |
| `bridge_to_page` | Hero, mapa, contacto, scroll feed |
| `ack_meta_complaint` | Frustração com o bot → reset tom + pergunta única |

---

## 10. Actions por vertical (obrigatória #8)

| Model | Actions específicas |
|-------|---------------------|
| **ecommerce** | `show_catalog_cards` (products), `open_product_detail` via drawer linkage |
| **restaurant** | `show_menu_cards`, `nudge_cart`, `open_item_drawer` |
| **health** | `show_professional_cards`, `show_service_cards`, `defer_clinical` |
| **appointment** | `show_service_barber_cards`, `show_schedule_prompt`, `delegate_transactional_resolver` (WS-08C), `honest_policy` (dataGaps) |

---

## 11. Plano de evals global (obrigatória #9) — antes de código

### Camadas

| Camada | ID | O quê |
|--------|-----|-------|
| **Schema** | E-G00 | Validação JSON `ModelContextPack` + `KernelResponse` |
| **Global behavior** | E-G01…E-G15 | answer-before-steer, topicShift, no generic fallback, max 3 cards |
| **Per model** | E-M-{model}-01… | Portar AP/RS/HL/EC + diálogo establishment |
| **Cross-model** | E-X01…E-X10 | Mesmo prompt class de comportamento (horas, fora domínio, meta) em 4 modelos |
| **Regression** | `pnpm qa:ai-regression` | 26/26 preservado + extensão opt-in |
| **Anti-chatbot** | E-G16 | Lista negra de frases proibidas |

### Mínimo para GO implementação

- E-G00, E-G01…E-G10, E-X01…E-X05 documentados em fixture  
- Baseline comparativo V1.1 vs Kernel stub (mesmos AP-D15…25)  
- **Sem** GO de LLM até E-G + stub rule-kernel verdes

---

## 12. Menor protótipo possível (obrigatória #10)

**Fase 0 — sem LLM, sem endpoint, sem Tier 1 diff:**

1. Charter WS-19A + contratos TypeScript em `docs/` ou `lib/conversation-kernel/types.ts` (types-only PR).
2. **Rule-kernel stub** (~1 arquivo): lê pack + message + session → `KernelResponse`.
3. **Um adapter:** Appointment only — substitui `[1]` dialogue por kernel stub; mantém `[2]→delegate`.
4. **10 evals** E-G01…E-G10 + AP-D15…25 comparativos.
5. Pack builder em `appointment-feed` — só projeção, sem cues.

**Não inclui:** LLM, WS-18A, CRM, novo drawer.

---

## 13. Destino da V1.1 local (entregável 11)

| Destino | Veredito |
|---------|----------|
| Merge como solução final | **Não** |
| Descartar totalmente | **Não** — aprendizado e deferral list |
| **Experimento + baseline comparativo** | **Sim** |
| Reaproveitamento parcial | **Sim** — tabelas `dataGaps` + cues viram **JSON rule tables**, não TS em cascata |

**Ação institucional:** marcar V1.1 local como `experiment/ws08d-v1.1-gray-zone` (branch ou tag); não promover a `main` como produto cross-model. Spec `WS-08D_V1_1_GRAY_ZONE_SPEC.md` permanece referência de **sintomas**, não arquitetura final.

---

## 14. Relação WS-08D V2

| WS-08D V2 (design) | WS-19A |
|--------------------|--------|
| Appointment-only | Todos os modelos |
| `establishment` fixo | `ModelContextPack` genérico |
| LLM no roadmap | LLM fase 2, mesma gate |
| Contextual Detour §16 | `polite_detour` global |

**Não duplicar:** V2 doc vira **anexo Appointment** do WS-19A; evitar dois kernels.

---

## 15. Veredito GO/NO-GO — nova workstream (entregável 12)

| Decisão | Veredito |
|---------|----------|
| **Abrir WS-19A (charter + contratos + evals)** | **GO** |
| **Continuar V1.1 rules como estratégia** | **NO-GO** |
| **Implementar V2 Appointment isolado** | **NO-GO** — subordinar a WS-19A |
| **LLM / endpoint** | **NO-GO** (fase atual) |

**Próximo passo institucional:** fixture evals (docs-only) · depois `GO implementação WS-19A fase 1` para stub.

---

## 16. Isolamento WS-18A (sem conflito)

| Dimensão | WS-19A (visitante) | WS-18A (operador) |
|----------|-------------------|-------------------|
| Utilizador | Visitante no Composer demo/live | Operador / back-office |
| Runtime | Client mock + futuro endpoint visitante | Server `operational-ai/`, draft, promote |
| Memória | Tab-scoped / turnWindow | Fixture + publication pipeline |
| LLM | Fase 2 visitante (bounded) | Etapa 3 operacional — **fechada** |
| Imports | Proibido importar WS-18A | Proibido importar kernel visitante |
| Objetivo | Descoberta + diálogo na landing | Edição operacional do estabelecimento |

**Regra:** WS-19A **não** reabre WS-18A, **não** partilha bundle server operacional, **não** usa promote/CLI como motor de conversa visitante.

---

## Respostas rápidas — 10 perguntas obrigatórias

| # | Resposta curta |
|---|----------------|
| 1 | Cues não escalam — combinatória infinita, sem estado de tópico, conflitos de ordem |
| 2 | `ModelContextPack` — catálogo + capabilities + dataGaps + houseVoice |
| 3 | `KernelResponse` — reply + intent + topicShift + structure + action |
| 4 | Feed só `buildModelContextPack()`; regras em tabelas compartilhadas |
| 5 | Guardrails GK-* + catálogo fechado + sem frases-assistente |
| 6 | polite_detour + bridge_to_page + answer-before-steer |
| 7 | text_only, situated_fallback, bridge_to_page, ack_meta |
| 8 | cards/schedule/cart/clinical defer por vertical (§10) |
| 9 | E-G* + E-M-* + E-X* antes de código (§11) |
| 10 | Rule-kernel stub + 1 adapter Appointment + 10 evals (§12) |

---

## Related

- [`docs/os/WORKSTREAMS.md`](../os/WORKSTREAMS.md)
- [`WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md`](./WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md)
- [`AI_RESOLVER_CONTRACT.md`](../ai/AI_RESOLVER_CONTRACT.md) — emenda futura Opção B
