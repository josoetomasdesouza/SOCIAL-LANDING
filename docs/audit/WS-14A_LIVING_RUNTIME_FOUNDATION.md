# WS-14A — Living Runtime Foundation: Appointment First

**Baseline:** `origin/main` @ `24aab7c`  
**Classificação:** infraestrutura operacional / runtime vivo — **não** alteração perceptiva  
**Status:** 📋 Charter proposto — **sem implementação até GO explícito**  
**Relação:** eleva e estreita o escopo futuro de WS-09 (DB/storage); **não abre WS-15+ neste ciclo**

---

## Pergunta central

```txt
isso cria metabolismo real
ou apenas mais arquitetura?
```

**Resposta do charter:** metabolismo real **somente se** Appointment renderizar de uma fonte runtime persistente (read path), com mock isolado como fallback dev — **sem** novo schema enterprise, **sem** generalização 12 verticais, **sem** publication/editor/IA neste WS.

---

## Pré-requisito — gate WS-13 / Fluxo 4B

### Sessão B humana externa

| Item | Status |
|------|--------|
| Participante externo | **Pendente** |
| Fluxos 1–3, 5 (proxy) | Registrados @ `39c7b12` — GO condicional |
| Fluxo 4 booking rápido | Pendente humano |
| Fluxo 4B M-01 drawer | **Gate técnico mínimo executado @ `24aab7c`** |
| Fluxo 5b device real 320 | Pendente humano |
| Perguntas indiretas / gate final | Pendente humano |

**Conclusão:** Sessão B **humana não está fechada**. Etapa 1 observacional permanece **GO condicional** para perceptivo.

### Gate técnico mínimo — Fluxo 4B @ `24aab7c`

Executado em dev (`localhost:3000`) sem alteração de produto:

| Path | Probe | Chip contextual | Composer |
|------|-------|-----------------|----------|
| Feed (`#section-agendar-horario`) | mouse long-press 650ms | ✅ `appointment-service-service-1` | 124px |
| Drawer (`Escolha o servico`) | mouse long-press + seletor scoped no sheet | ✅ mesmo chip | 124px |

**Veredicto técnico:** `TECH_GO_M01_PARITY` — paridade feed ↔ drawer **observável** em runtime dev.

**Classificação do proxy anterior inconclusivo:**

```txt
falha de harness dev (selector .first() + PointerEvent sintético)
não falha de experiência
```

**Não reinterpretar:** timeout/harness headless ≠ regressão perceptiva. Sessão B proxy @ `39c7b12` permanece válida.

**Não abrir:** polish morph · motion · composer · novo fix M-01 (já corrigido @ `b88172c`).

---

## Objetivo

Transformar **Appointment** de demo controlada em **primeira vertical com runtime vivo**:

```txt
demo controlada  →  runtime vivo (Appointment only)
```

Depois deste WS (se gate cumprido):

- `appointment-feed.tsx` deixa de importar mock como fonte primária
- conteúdo existe como **bundle runtime** endereçável (slug/id)
- mock permanece **fallback dev** explícito — não camuflado como produção
- nenhuma outra vertical migra neste WS

---

## Escopo

### Incluído

1. **Entity model mínimo** — vocabulário perceptivo operacional, não CRUD enterprise
2. **Runtime bundle Appointment** — serialização dos dados mock atuais em formato runtime estável
3. **Live runtime loader** — read path único (`getAppointmentRuntime(slug)`)
4. **Separação `mock | runtime`** — flag/env explícita; default dev = mock fallback permitido
5. **Wiring Appointment feed** — consumir loader; zero mudança Tier 1 (motion/composer/drawer)
6. **Gate técnico** — `pnpm qa:appointment` + `pnpm qa:events` verdes; smoke read path

### Fora de escopo (inviolável neste WS)

| Fora | Motivo |
|------|--------|
| Publication pipeline (WS-15) | Camada acima de persistência read |
| Editor perceptivo (WS-17) | Requer publication + runtime maduro |
| IA operacional (WS-18) | Requer entidades reais + histórico |
| Drizzle / Postgres / media API | WS-09 storage — **depois** read path provado |
| 12 verticais | Pilot Appointment only |
| UI / motion / smoke-fume / morph | Produto perceptivo congelado @ `39c7b12` |
| CMS / admin / permissões | Anti-padrão |
| Maps / reviews / hours externos (WS-16) | Depois runtime + publication |

---

## Mapa — dados mock atuais (Appointment)

| Domínio | Fonte hoje | Consumidor principal |
|---------|------------|----------------------|
| Establishment config | `lib/mock-data/appointment-data.ts` → `barberShopConfig` | `appointment-feed.tsx`, hero, contact |
| Hero operational context | `barberShopHeroOperationalContext` | `AppointmentOperationalHero` |
| Arrival context | `barberShopArrivalContext` | `AppointmentArrivalDrawer` |
| Professionals | `barbers[]` | Schedule, drawers, AI blocks |
| Services | `barberServices[]` | Schedule, drawers, AI resolver |
| Availability | `generateAvailability()` embarcado em `Professional` | `AppointmentCalendar`, booking flow |
| Style examples | `hairStyles[]` | `StylesModule` |
| Feed editorial | `lib/mock-data/business-content.ts` → `appointmentContent` | `BusinessSocialLanding` sections |
| Legacy posts | `barberPosts[]` (appointment-data) | **Possível duplicata** — consolidar no bundle |
| Conversational resolver | `appointment-conversational-search.ts` | AI mock — **permanece mock neste WS** |
| Context IDs morph | `appointment-{barber\|service\|style}-{id}` | `ContextSelectable` — preservar IDs |

**Dívida identificada:** conteúdo editorial espalhado (`appointmentContent` vs `barberPosts`). WS-14A **consolida** num único `AppointmentRuntimeBundle`.

---

## Entidades mínimas (modelo perceptivo operacional)

Não criar schema universal. Criar **5 núcleos + 2 blocos contextuais** suficientes para Appointment respirar:

### Núcleo

| Entidade | Campos mínimos | Notas |
|----------|----------------|-------|
| `Establishment` | `id`, `slug`, `model`, `name`, `brand`, `contact`, `hours` | `BusinessConfig` refinado |
| `Professional` | `id`, `profile`, `specialties`, `availability[]` | availability como value object |
| `Service` | `id`, `name`, `duration`, `price`, `category`, `media` | booking + morph context |
| `FeedItem` | `id`, `kind`, `title`, `media`, `metadata` | posts, videos, reviews, news, social unificados |
| `Story` | `id`, `label`, `media`, `isPrimary?` | stories ring |

### Contexto operacional (WS-09 preservado)

| Bloco | Campos | Surface |
|-------|--------|---------|
| `OperationalContext` | `liveState`, `placeHint`, `momentHint`, `hoursHint` | hero overlay |
| `ArrivalContext` | `drawerTitle`, `addressLine`, `referenceHint`, `routeHint`, `parkingHint`, `mapsQuery` | arrival drawer |

### Value objects (não entidades top-level)

- `TimeSlot`, `DayAvailability` — embarcados em `Professional`
- `StyleExample` — catálogo leve (`StyleCatalogItem[]`) ou subset de `FeedItem`

### Explicitamente **não** modelar neste WS

- `Surface` state machine (permanece runtime UI — `lib/surfaces/`)
- `Creator`, `Review` como entidades separadas (reviews = `FeedItem.kind=review`)
- `Schedule` global (availability vive no professional)
- Publication states (`draft/live`)

---

## Schema mínimo proposto (runtime bundle)

```ts
// lib/runtime/appointment/types.ts (proposto — não implementado)

interface AppointmentRuntimeBundle {
  version: 1
  establishment: Establishment
  operational: OperationalContext
  arrival: ArrivalContext
  professionals: Professional[]
  services: Service[]
  styles: StyleCatalogItem[]
  feed: {
    stories: Story[]
    sections: FeedItem[]  // normalizado de appointmentContent
  }
  meta: {
    source: "runtime" | "mock-fallback"
    slug: string
    updatedAt: string     // ISO — seed estático OK no Sprint 1
  }
}
```

**Persistência Sprint 1:** arquivo JSON versionado em repo (`data/runtime/appointment/barba-negra.v1.json`) ou TS module export — **sem DB**.

**Persistência Sprint 2 (opcional pós-gate):** WS-09 drizzle — **outro WS**, mesmo read interface.

---

## Read path runtime

```txt
AppointmentFeed
  └─ useAppointmentRuntime(slug?)
       └─ resolveRuntimeSource()     // env: NEXT_PUBLIC_APPOINTMENT_RUNTIME=mock|runtime
            ├─ runtime → loadAppointmentBundle(slug)
            └─ mock    → loadAppointmentMockFallback()  // adapter dos exports atuais
```

### Regras

1. **Uma porta de entrada** — proibir imports diretos de `appointment-data.ts` no feed após wiring
2. **Adapter mock** — traduz exports legados → `AppointmentRuntimeBundle` (zero duplicação manual)
3. **Slug pilot:** `barba-negra` (derivado de demo Appointment; alinhável a `/demo` tile)
4. **SSR/hydration:** loader pode ser sync no Sprint 1 (bundle estático); async reservado para WS-09
5. **IDs estáveis** — morph/context/AI prefixos **inalterados**

### Fallback mock

| Modo | Quando | Comportamento |
|------|--------|---------------|
| `mock` (default dev) | `NEXT_PUBLIC_APPOINTMENT_RUNTIME=mock` ou unset | Adapter → bundle; UI idêntica |
| `runtime` | `NEXT_PUBLIC_APPOINTMENT_RUNTIME=runtime` | JSON/module bundle; prova metabolismo |
| CI | `runtime` recomendado | garante que bundle não diverge silenciosamente |

---

## Arquivos candidatos

### Novos (propostos)

| Path | Papel |
|------|-------|
| `lib/runtime/appointment/types.ts` | Entity model mínimo |
| `lib/runtime/appointment/bundle.ts` | Seed / JSON loader |
| `lib/runtime/appointment/mock-adapter.ts` | `appointment-data` + `appointmentContent` → bundle |
| `lib/runtime/appointment/load.ts` | `loadAppointmentRuntime`, source resolution |
| `lib/runtime/appointment/index.ts` | Public API |
| `data/runtime/appointment/barba-negra.v1.json` | Bundle seed (runtime mode) |
| `scripts/runtime/appointment-runtime-smoke.mjs` | Gate: bundle shape + slug load |

### Alterados (mínimo)

| Path | Mudança |
|------|---------|
| `components/business/appointment/appointment-feed.tsx` | Consumir `loadAppointmentRuntime` — **sem** alterar JSX/motion |
| `package.json` | Script `qa:appointment-runtime` (opcional) |

### Intocados (Tier 1 / perceptivo)

- `components/business/conversational-ai.tsx`
- `lib/ui/composer-surface-material.ts`
- `lib/surfaces/*`
- `components/business/context-selectable.tsx`
- `lib/mock-data/appointment-conversational-search.ts` (permanece mock)

### Referência institucional

- `docs/os/WORKSTREAMS.md` — WS-09 blocked; WS-14A não substitui numeração ainda
- `docs/os/PERCEPTUAL_LANGUAGE_SYSTEM.md` — grammar preservada
- `docs/audit/WS-13_PRESENCA_CONTINUA_OBSERVACIONAL.md` — Era 4 observacional paralela

---

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Arquitetura sem metabolismo (re-wrap mock) | Gate exige `runtime` mode renderizar **sem** import direto de mock no feed |
| Schema creep / enterprise generic | Charter limita 5 entidades + 2 blocos; review obrigatório antes de +1 entidade |
| Duplicação editorial (`barberPosts` vs `appointmentContent`) | Consolidar no bundle; deprecate unused |
| `generateAvailability()` não determinístico | Seed com availability fixa no JSON; random só em mock adapter dev |
| Quebra morph/AI context IDs | IDs preservados; `qa:appointment` + gate 4B técnico |
| Confundir WS-14A com WS-09 DB | Read path file-first; drizzle só após gate 14A |
| Regressão perceptiva acidental | Zero JSX/motion; diff review focado em data wiring |
| Sessão B humana pendente | Não bloqueia 14A; não usar como desculpa para polish |

---

## Plano de implementação — micro-etapas

### Etapa 0 — Charter ✅ (este documento)

- [x] Mapear mock Appointment
- [x] Definir entidades mínimas
- [x] Propor read path + fallback
- [x] Gate 4B técnico mínimo @ `24aab7c`
- [ ] **GO humano explícito para código**

### Etapa 1 — Types + adapter (sem wiring UI)

- Definir `AppointmentRuntimeBundle` + types
- Implementar `mock-adapter.ts` (100% paridade com demo atual)
- Teste unitário/smoke: adapter output shape

### Etapa 2 — Seed runtime

- Gerar `barba-negra.v1.json` from adapter (script one-shot)
- `load.ts` com `mock | runtime` switch

### Etapa 3 — Wiring feed (único PR funcional)

- `appointment-feed.tsx` consome loader
- Remover imports diretos de mock data no feed
- Passar props derivadas do bundle para submodules

### Etapa 4 — Gates

- `pnpm qa:appointment` 8/8
- `pnpm qa:events` 8/8
- `pnpm qa:appointment-runtime` (bundle load + required fields)
- Gate 4B técnico repetido (opcional CI)

### Etapa 5 — Documentação operacional

- Atualizar `WORKSTREAMS.md` (WS-14A entry)
- Registrar baseline pós-merge

**Estimativa:** 1 PR types/adapter + 1 PR wiring/gates — **não** big bang.

---

## Gate de saída WS-14A

| # | Critério | Verificação |
|---|----------|-------------|
| G1 | Appointment renderiza via `loadAppointmentRuntime` | grep: zero import mock direto no feed |
| G2 | Modo `runtime` carrega JSON seed sem mock adapter | env smoke |
| G3 | Modo `mock` fallback dev funcional | default local |
| G4 | `pnpm qa:appointment` PASS | CI/local |
| G5 | `pnpm qa:events` PASS | sem regressão harness |
| G6 | IDs morph/context preservados | gate 4B técnico ou manual |
| G7 | Zero diff perceptivo Tier 1 | sem alteração composer/motion/drawer |
| G8 | Nenhuma vertical além Appointment migrada | diff scope |

---

## GO / NO-GO — começar código

### GO ✅ (recomendado — charter)

| Condição | Estado |
|----------|--------|
| Baseline operacional estável | `24aab7c` |
| Produto perceptivo congelado | `39c7b12` |
| Harness dev confiável | `qa:events` 8/8 |
| Gate 4B técnico M-01 | PASS @ dev |
| Escopo Appointment-only definido | este charter |
| Risco arquitetura-only mitigado | bundle + gate G1/G2 |

**Veredicto:** **GO para implementação WS-14A** após aprovação explícita deste charter.

**Condicionante perceptivo (não bloqueante):** Sessão B humana externa permanece pendente — documentar GO condicional Era 4 em paralelo; **não impede** runtime foundation.

### NO-GO ❌ (se)

- Charter expandir para 12 verticais, editor, IA ou DB no mesmo PR
- Wiring alterar motion/composer/smoke-fume
- Schema virar CRUD genérico antes de Appointment respirar
- Implementação sem adapter → bundle determinístico (metabolismo falso)

---

## Sequência pós WS-14A (referência — não abrir agora)

```txt
WS-14A ✅ runtime read (Appointment)
  → WS-09  persistence write (drizzle, isolado)
  → WS-15  publication pipeline
  → WS-16  external reality (maps/reviews/hours)
  → WS-17  editor perceptivo
  → WS-18  IA operacional
```

---

## Registro

| Campo | Valor |
|-------|-------|
| Charter autor | proposta operacional @ `24aab7c` |
| Gate 4B técnico | `TECH_GO_M01_PARITY` — dev localhost, probe mouse + drawer scoped |
| Sessão B humana | pendente — não invalidada |
| Implementação | **aguardando GO explícito** |

*Living Runtime Foundation — metabolismo real, não mais arquitetura.*
