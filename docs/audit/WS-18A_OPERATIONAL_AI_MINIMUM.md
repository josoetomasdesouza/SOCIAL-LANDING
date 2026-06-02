# WS-18A — Operational AI Minimum: Appointment First

**Baseline técnico:** `origin/main` @ `0b14eb7`  
**Pré-requisitos:** WS-14A ✅ runtime-backed · WS-15A ✅ publication · WS-16A ✅ external reality · WS-09A ✅ storage  
**Baseline produto perceptivo:** `1c92acc` (inalterado)  
**Classificação:** camada operacional de adaptação server-side — **não** feature de chat · **não** agente autônomo  
**Status:** 📋 Charter proposto (Etapa 0) — **sem implementação até GO explícito**  
**Relação:** senta sobre runtime bundle + publication draft + storage adapter; **não substitui** WS-08C (composer resolver) · **não abre** WS-17 (editor) · **distinto de** chatbot / copiloto visual

---

## Pergunta gate principal

```txt
a IA está produzindo adaptação operacional coerente
ou está tentando substituir o produto?
```

**Resposta do charter:** adaptação operacional coerente **somente se** a IA produzir **artefatos estruturados** (`AppointmentRuntimeBundle` draft patches) que passam validação determinística e **parecem criados pelo sistema** — mesma gramática, mesmos IDs morph, mesma cadência editorial. Substituir o produto = copy genérica, novos layouts, nova superfície protagonista, ou bypass do read path perceptivo.

**Anti-padrão explícito:**

```txt
draft JSON validado + CLI review + promote manual = GO (IA operacional mínima)
chat autônomo + auto-publish + UI IA + layout gerado = NO-GO (substituição de produto)
```

---

## Pergunta arquitetural (draft authenticity)

```txt
o draft gerado pela IA ainda parece criado pelo sistema
ou parece conteúdo artificial externo ao produto?
```

**Critério GO:** o operador não consegue distinguir *origem* do draft na projeção feed — apenas *qualidade* da copy. IDs, section kinds, morph targets e hierarquia emocional permanecem indistinguíveis de draft copiado do live ou seed manual.

**Sinais NO-GO:**

- tom de marketing genérico (“melhor barbearia da cidade”)
- campos fora do schema ou IDs inventados que quebram morph/drawer
- proposta de nova section kind, novo drawer, ou reorder de feed não suportado pelo bundle
- copy que viola [`PERCEPTUAL_LANGUAGE_SYSTEM.md`](../os/PERCEPTUAL_LANGUAGE_SYSTEM.md) (utilitário > presença)

---

## Objetivo

Definir a **primeira camada de IA operacional** sobre runtime + publication + external reality + storage — produzindo **drafts e enrichments** server-side, sem virar chat genérico nem agente autônomo total.

```txt
runtime bundle (live/draft) + sinais externos  →  adaptation draft  →  validate  →  publication draft key
                                                                                      ↓
                                                                              review humano (CLI)
                                                                                      ↓
                                                                              promote manual (WS-15A)
```

Depois deste WS (se gate cumprido):

- operadores podem **gerar variações operacionais** em draft sem editar JSON manualmente
- IA escreve **somente** em `runtime/{slug}/draft` via storage adapter (WS-09A)
- live committed **nunca** mutado pela IA
- composer / feed / motion / morph **inalterados** — zero JSX
- resolver conversacional existente (WS-08C) **permanece mock/client** — ciclo separado

---

## Direção obrigatória

| Princípio | Política |
|-----------|----------|
| IA como infra silenciosa | Nenhuma superfície “IA” no produto default |
| IA server-only | Provider keys, prompts, outputs — nunca client bundle |
| IA produz draft/output operacional | Structured JSON — não HTML, não JSX, não layout |
| IA não protagonista | Sem badge “gerado por IA”, sem copiloto visual |
| Grammar perceptiva | [`PERCEPTUAL_LANGUAGE_SYSTEM.md`](../os/PERCEPTUAL_LANGUAGE_SYSTEM.md) + invariants Tier 1 |
| Zero reestruturação JSX | `components/**`, `app/**` intocados |
| Zero feed autônomo | Section kinds existentes; reorder bounded |
| Zero motion/composer/morph | Tier 1 frozen @ `1c92acc` |
| Trabalha sobre bundles | Input/output = `AppointmentRuntimeBundle` (+ patches) |

---

## Estado atual (pós WS-09A @ `0b14eb7`)

| Camada | Status | Relação com WS-18A |
|--------|--------|-------------------|
| Runtime bundle v1 | ✅ `barba-negra.v1.json` + projection | **Input base** |
| Publication draft/live | ✅ CLI promote/rollback · preview OFF | **Output sink** (draft only) |
| Storage adapter | ✅ `getFilesystemStorage()` · keys namespace | **Write port** |
| External snapshot | ✅ opt-in · default OFF | **Input opcional** (enrichment) |
| Composer resolver | ✅ WS-08C mock · client-side | **Fora de escopo** — não confundir |
| IA operacional server | ❌ inexistente | **Gap deste WS** |
| Auto-promote / auto-publish | ❌ proibido (WS-15A) | **Permanece proibido** |

**Gap:** operador adapta copy manualmente ou via seed — não há pipeline de **variação assistida** que respeite bundle grammar + publication validate.

---

## O que a IA pode fazer (Sprint 1)

Produzir **somente** artefatos dentro do schema existente:

| Categoria | Exemplos permitidos | Campos típicos |
|-----------|---------------------|----------------|
| **Variações operacionais** | refresh de hints contextuais | `operational.liveState`, `placeHint`, `momentHint`, `hoursHint` |
| **Drafts** | bundle draft completo ou patch parcial | `AppointmentRuntimeBundle` com `meta.publication` |
| **Enrichments** | merge editorial de snapshot externo | `establishment.contact`, `arrival.*`, reviews mapeáveis |
| **Copy contextual** | descrições bounded | `establishment.brand.description`, `service.description` |
| **Reorganização editorial mínima** | reorder dentro da mesma section kind | `feed.sections[].items` — IDs preservados |
| **Sugestões runtime-aware** | output sidecar JSON (não live) | `*.ai-suggestion.json` gitignored — **opcional Etapa 2+** |

**Limite de alteração por run:** patch preferido sobre full rewrite; IDs de `professional`, `service`, `style`, `story` **imutáveis** salvo operador explícito.

---

## O que a IA não pode fazer (inviolável)

| Proibido | Motivo |
|----------|--------|
| Chatbot completo / thread infinita | Substituir composer = produto diferente |
| Agente autônomo com loop | Backend platform / ops não auditável |
| Memória infinita / multi-session persistent | Scope creep; privacidade |
| Multi-agent / tools orchestration complexa | Framework de agentes |
| UI IA / copiloto visual / editor IA | WS-17 ou produto novo |
| Auto-publish / auto-promote | WS-15A policy |
| Geração automática de layout | Viola Tier 1 JSX freeze |
| Novos feed section kinds | Quebra projection + morph |
| Alterar motion / composer / morph / drawer physics | `@ 1c92acc` |
| Write em `runtime/{slug}/live` | Live = operador + promote CLI |
| HTTP auto-write em request path | Side effects silenciosos |
| Keys no client bundle | Segurança |
| Multi-vertical | Appointment pilot only |

---

## Boundaries explícitos — três camadas de IA

```txt
┌─────────────────────────────────────────────────────────────┐
│ Tier 1 — Produto perceptivo (@ 1c92acc)                     │
│ feed · composer · morph · drawer — INTOCADO                 │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ WS-08C — Composer resolver (client mock)                    │
│ conversação demo · booking blocks · session-local           │
│ FORA do WS-18A — não estender para LLM neste WS             │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ WS-18A — Operational AI (server-only)                       │
│ bundle adaptation → draft key → validate → human promote    │
│ ESTE CHARTER                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Input / output model

### Input (`OperationalAiInput`)

| Campo | Obrigatório | Fonte |
|-------|-------------|-------|
| `slug` | ✅ | `barba-negra` pilot |
| `baseBundle` | ✅ | live ou draft via storage adapter / static import |
| `adaptationKind` | ✅ | primitive enum (ver abaixo) |
| `externalSnapshot` | ❌ | `external/{slug}/snapshot` se overlay disponível |
| `operatorBrief` | ❌ | texto curto operacional — não chat history |
| `constraints` | ❌ | campos locked, max length, tone guardrails |

### Output (`OperationalAiOutput`)

| Campo | Tipo | Destino |
|-------|------|---------|
| `draftBundle` | `AppointmentRuntimeBundle` | `runtime/{slug}/draft` via adapter |
| `patch` | `Partial<AppointmentRuntimeBundle>` | merge into existing draft |
| `meta.ai` | provenance (proposto) | draft-only metadata |
| `validation` | `{ ok, errors[] }` | gate antes de write |
| `suggestions` | sidecar opcional | gitignored — nunca live |

### Metadados propostos (draft-only)

```ts
interface AppointmentAiMeta {
  provider: "fixture" | "openai" | "anthropic" | (string & {})
  adaptationKind: OperationalAdaptationKind
  generatedAt: string
  sourceBundle: "live" | "draft" | "mock-adapter"
  operatorBrief?: string
  model?: string
}

// Extensão em meta.publication.derivedFrom:
// "live" | "mock-adapter" | "manual" | "ai"
```

---

## Adaptation primitives (Sprint 1)

Primitives = **units of work** com prompt + validate + merge bounded:

| ID | Primitive | Input | Output patch | Locked |
|----|-----------|-------|--------------|--------|
| `P-01` | `operational_hints_refresh` | live + optional external | `operational.*` | IDs, feed structure |
| `P-02` | `arrival_copy_variation` | live + arrival context | `arrival.*` (bounded length) | `mapsQuery`, drawerTitle grammar |
| `P-03` | `brand_description_polish` | live | `establishment.brand.description` | brand assets URLs |
| `P-04` | `service_copy_polish` | live | `services[].description` | price, duration, IDs |
| `P-05` | `external_review_map` | live + snapshot | `feed.sections` review items | max 3 reviews (WS-16A cap) |
| `P-06` | `story_caption_refresh` | live | `stories[].caption` | story IDs, media URLs |
| `P-07` | `full_draft_variation` | live + brief | full draft clone | validate entire bundle |

**Regra:** cada primitive declara `allowedPaths[]` — output fora da lista = **reject**.

---

## Pipeline mínimo proposto

```txt
1. RESOLVE base
   └─ read live (default) or existing draft via storage adapter
   └─ optional: read external snapshot

2. COMPOSE operational prompt
   └─ system: grammar perceptiva + schema constraints + primitive spec
   └─ user: operatorBrief + serialized subset of bundle (not full chat)

3. GENERATE structured output
   └─ fixture mode (deterministic, no API) — Sprint 1 gate
   └─ LLM mode (env opt-in) — Sprint 2+

4. NORMALIZE + MERGE
   └─ map to bundle paths
   └─ preserve IDs / section kinds
   └─ apply editorial gates (tone, length, review cap)

5. VALIDATE
   └─ validateAppointmentRuntimeBundle
   └─ validateAppointmentDraftBundle
   └─ perceptual gate (checklist HP/AR)
   └─ bundle-compare: morph targets still resolvable

6. WRITE (dry-run default)
   └─ storage.writeJson(runtime/{slug}/draft, { dryRun? })
   └─ NEVER write live

7. REVIEW (human)
   └─ preview opt-in APPOINTMENT_PUBLICATION_PREVIEW=draft
   └─ operador decide: discard | edit manual | promote --execute
```

**CLI proposto (Etapas futuras — não implementado):**

```bash
pnpm runtime:appointment:ai-draft -- --kind operational_hints_refresh [--dry-run]
pnpm runtime:appointment:ai-validate   # re-validate draft pós-IA
```

---

## Operational prompts (política)

| Regra | Detalhe |
|-------|---------|
| Prompts versionados | repo files `lib/runtime/appointment/operational-ai/prompts/*` — não inline disperso |
| System prompt fixo por primitive | grammar + anti-patterns + output JSON schema |
| No chat history in prompt | Single-turn operational brief only |
| Temperature bounded | Baixa para copy operacional; fixture = deterministic |
| Output = JSON only | Parse failure → fallback noop + error report |
| Portuguese pilot | Barba Negra tone — lugar como linguagem |
| Prohibited phrases list | “melhor de”, “clique aqui”, “não perca”, emoji spam |

---

## Review gates

### Gates determinísticos (automáticos)

| Gate | Verificação |
|------|-------------|
| G-schema | `validateAppointmentDraftBundle` |
| G-ids | professional/service/style/story IDs unchanged (exceto P-07 explícito) |
| G-morph | projection parity — morph targets resolve |
| G-length | field max lengths (reuse WS-16A editorial caps where applicable) |
| G-perceptual | checklist HP-07, AR-02 — no utilitário |
| G-no-live-write | grep + adapter audit — draft key only |
| G-no-jsx | zero diff em `components/`, `app/` |

### Gates humanos (obrigatórios antes de promote)

| Gate | Quem |
|------|------|
| H-tone | operador — copy soa lugar, não anúncio |
| H-promote | operador — `promote --execute` manual (WS-15A) |
| H-perceptual | opcional Sessão B — se alteração em hints visíveis |

### Gates CI (propostos)

```bash
pnpm qa:appointment-ai-operational   # parity fixture mode — proposto Etapa 4
pnpm qa:appointment-storage          # draft write via adapter
pnpm qa:appointment-publication      # draft validate path
pnpm qa:appointment                  # 8/8 perceptual
pnpm qa:events                       # 8/8 passive events
```

---

## Failure modes

| Modo | Sintoma | Resposta |
|------|---------|----------|
| F-01 Hallucinated IDs | morph/drawer break | Reject write; log validation errors |
| F-02 Generic marketing tone | perceptual drift | Editorial gate fail; discard output |
| F-03 Schema overflow | extra keys / wrong types | Parse reject; noop |
| F-04 Locked field mutation | URLs/prices changed | Primitive boundary reject |
| F-05 API failure / timeout | no provider response | Fallback noop; live untouched |
| F-06 Key leak risk | env in client | server-only module + grep gate |
| F-07 Accidental live write | promote bypass | Adapter key guard + code review |
| F-08 Over-eager full rewrite | P-07 without brief | Require explicit `--kind full_draft_variation` |
| F-09 External snapshot stale | wrong enrichment | Respect WS-16A stale/fallback policy |
| F-10 Composer confusion | WS-08C extended to LLM | Charter boundary — separate WS |

---

## Rollback strategy

```txt
1. Discard AI draft
   → delete runtime/{slug}/draft or draft-init --force from live

2. Regenerate
   → ai-draft CLI with different brief / fixture

3. Publication rollback (unchanged WS-15A)
   → se promote acidental: rollback --execute

4. Git baseline
   → live committed @ barba-negra.v1.json unchanged by AI

5. Produto perceptivo
   → nunca rollback via IA — Tier 1 @ 1c92acc
```

**Política:** IA **nunca** cria backup de live — backup permanece responsabilidade do promote CLI (WS-15A).

---

## Riscos de drift perceptivo

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| Copy genérica “marketing IA” | **Alta** | Editorial gate + PERCEPTUAL_LANGUAGE_SYSTEM |
| Composer vira copiloto LLM | **Alta** | Boundary WS-08C vs WS-18A explícito |
| Auto-promote silencioso | **Alta** | Draft-only write; promote manual |
| Feed reorder caótico | **Média** | Primitive allowedPaths; IDs locked |
| External + IA double-enrichment | **Média** | Snapshot optional; overlay OFF default |
| Prompt injection via operatorBrief | **Média** | Brief length cap; no tool execution |
| Scope creep → agent framework | **Alta** | Single-turn primitives; no multi-agent |
| Regressão qa:appointment 8/8 | **Alta** | Gates obrigatórios pré-commit |
| Confundir WS-18A com WS-17 editor | **Média** | IA = infra; editor = superfície futura |

---

## Plano de implementação — micro-etapas

### Etapa 0 — Charter ✅ (este documento)

- [x] Objetivos e boundaries WS-18A
- [x] Input/output model + adaptation primitives
- [x] Pipeline mínimo + review gates
- [x] Failure modes + rollback
- [x] Gate principal + pergunta arquitetural
- [ ] **GO humano explícito para código**

### Etapa 1 — Types + primitives foundation

- `operational-ai/types.ts` — `OperationalAdaptationKind`, I/O contracts
- `operational-ai/primitives.ts` — allowedPaths per primitive
- `operational-ai/validate-output.ts` — schema + ID lock + editorial gate
- Fixture generator (deterministic, zero API)
- **Zero wiring produto**

### Etapa 2 — Merge + draft write

- `operational-ai/merge-into-draft.ts` — bounded patch merge
- Wire storage adapter draft key (WS-09A)
- Extend `meta.publication.derivedFrom` with `"ai"` + `meta.ai` provenance
- Dry-run default

### Etapa 3 — Provider adapter (opt-in)

- `operational-ai/provider.fixture.ts` — default gate mode
- `operational-ai/provider.llm.server.ts` — env-gated (`APPOINTMENT_AI_PROVIDER`)
- **Default fixture** — CI verde sem API key

### Etapa 4 — CLI + parity gate

- `scripts/runtime/generate-appointment-ai-draft.ts`
- `pnpm qa:appointment-ai-operational` — fixture round-trip
- Extend publication validate smoke

### Etapa 5 — Runbook + gates + WORKSTREAMS

- Runbook §IA operacional
- Gate de saída G1–G14
- WS-18A fechado

**Estimativa:** 2–3 PRs — (1) types + fixture · (2) merge + CLI · (3) optional LLM + runbook

---

## Gate de saída WS-18A (proposto)

| # | Critério | Verificação |
|---|----------|-------------|
| G1 | IA operacional documentada | este charter + runbook |
| G2 | Server-only; zero client provider import | grep gate |
| G3 | Output = draft only; live untouched | adapter + smoke |
| G4 | Primitives bounded; IDs locked default | validate-output |
| G5 | Passa `validateAppointmentDraftBundle` | parity |
| G6 | Fixture mode default; CI sem API key | qa gate |
| G7 | Auto-promote proibido | WS-15A policy preserved |
| G8 | Preview draft OFF default | WS-15A policy preserved |
| G9 | External overlay OFF default | WS-16A policy preserved |
| G10 | Zero JSX/UI diff | diff scope @ `1c92acc` |
| G11 | `qa:appointment` 8/8 | perceptual |
| G12 | `qa:events` 8/8 | passive events |
| G13 | `qa:appointment-storage` + publication PASS | infra |
| G14 | Draft parece sistema — não marketing externo | H-tone + checklist |

---

## Runbook operacional (proposto)

### Política oficial

| Política | Valor |
|----------|-------|
| **IA operacional** | Infra silenciosa — não superfície produto |
| Default provider | `fixture` (deterministic) |
| Write target | `runtime/{slug}/draft` only |
| Promote | **Manual** — operador `promote --execute` |
| Preview | Opt-in `APPOINTMENT_PUBLICATION_PREVIEW=draft` |
| Composer WS-08C | **Não estender** neste WS |

### Variáveis (propostas)

| Variável | Default | Função |
|----------|---------|--------|
| `APPOINTMENT_AI_PROVIDER` | `fixture` | `fixture` \| `openai` \| … |
| `APPOINTMENT_AI_MODEL` | unset | model slug when provider ≠ fixture |
| `APPOINTMENT_AI_DRY_RUN` | `1` | skip draft write unless `0` |
| `APPOINTMENT_PUBLICATION_PREVIEW` | unset | WS-15A — independente |
| `NEXT_PUBLIC_APPOINTMENT_EXTERNAL_REALITY` | OFF | WS-16A — independente |

### Fluxo operador

```bash
# 1. Gerar draft (dry-run)
pnpm runtime:appointment:ai-draft -- --kind operational_hints_refresh --dry-run

# 2. Executar write draft
pnpm runtime:appointment:ai-draft -- --kind operational_hints_refresh --execute

# 3. Validar
pnpm runtime:appointment:draft-validate

# 4. Preview local (opt-in)
APPOINTMENT_PUBLICATION_PREVIEW=draft pnpm dev

# 5. Promote (manual, operador)
pnpm runtime:appointment:promote -- --execute
```

---

## GO / NO-GO — começar código

### GO ✅ (recomendado — charter)

| Condição | Estado |
|----------|--------|
| WS-09A storage fechado | ✅ @ `67e41fe` |
| WS-15A publication fechado | ✅ @ `a837064` |
| WS-16A external fechado | ✅ default OFF |
| WS-14A runtime wired | ✅ |
| Produto @ `1c92acc` | ✅ frozen |
| Gate substituição vs adaptação respondido | ✅ draft estruturado |
| Escopo Appointment-only | ✅ este charter |

**Veredicto:** **GO para implementação WS-18A** após aprovação explícita deste charter.

**Condicionantes:**

1. Etapa 1 = **fixture provider only** — LLM opt-in posterior
2. **Zero** auto-promote · **zero** JSX · **zero** composer LLM
3. Draft authenticity = passa validate + perceptual checklist
4. WS-08C permanece isolado

### NO-GO ❌ (se)

- Chatbot / agent loop / multi-agent
- Auto-publish ou auto-promote
- UI copiloto / editor IA (WS-17 premature)
- Geração de layout / novas sections
- Alteração motion/composer/morph
- Memória persistente cross-session
- Client-side LLM calls
- Confundir IA operacional com resolver conversacional WS-08C

---

## Decisão estratégica adjacente

```txt
WS-18A IA operacional mínima   →  (este charter) ⭐ recomendado pós-WS-09A
WS-17 editor perceptivo        →  após ou paralelo — superfície, não infra
WS-09 enterprise (DB)          →  BLOCKED
WS-08C composer resolver       →  intacto — demo conversacional separada
```

**Ordem recomendada pós-charter:** Etapa 1 fixture → Etapa 2 draft write → Etapa 4 gate → LLM opt-in só se fixture gate verde.

---

## Registro

| Campo | Valor |
|-------|-------|
| Charter autor | proposta @ `0b14eb7` |
| Pilot slug | `barba-negra` |
| Modo | acelerado — server-only · draft-first |
| Implementação | **aguardando GO explícito** |

*Operational AI Minimum — adaptação silenciosa, não substituição de produto.*
