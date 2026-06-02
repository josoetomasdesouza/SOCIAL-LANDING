# WS-15A — Publication Primitive: Appointment First

**Baseline técnico:** `origin/main` @ `4cd71c9`  
**Pré-requisitos:** WS-14A ✅ runtime-backed · WS-16A ✅ external reality opt-in/default OFF  
**Baseline produto perceptivo:** `1c92acc` (inalterado)  
**Classificação:** camada operacional de publicação mínima — **não** feature de produto  
**Status:** 📋 Charter proposto — **sem implementação até GO explícito**  
**Relação:** senta sobre WS-14A (read path) e WS-16A (overlay opt-in); **não substitui** WS-09 (DB) nem abre WS-17 (editor)

---

## Pergunta gate

```txt
isso cria publicação mínima
ou começou a virar CMS?
```

**Resposta do charter:** publicação mínima **somente se** draft/live forem **artefatos de arquivo + CLI**, com promote explícito, rollback trivial e **zero superfície de edição** — não painel, não CRUD, não workflow multi-usuário.

**Anti-padrão explícito:**

```txt
arquivo + CLI + promote consciente = GO (publicação primitiva)
UI de edição + permissões + multi-tenant = NO-GO (CMS)
```

Referências: [`WS-14A_LIVING_RUNTIME_FOUNDATION.md`](WS-14A_LIVING_RUNTIME_FOUNDATION.md), [`WS-16A_EXTERNAL_REALITY_MINIMUM.md`](WS-16A_EXTERNAL_REALITY_MINIMUM.md), [`PERCEPTUAL_LANGUAGE_SYSTEM.md`](../os/PERCEPTUAL_LANGUAGE_SYSTEM.md).

---

## Objetivo

Criar a **primeira camada mínima de publicação** do Appointment Runtime — sem editor visual, sem DB complexo e **sem alterar a experiência perceptiva**.

```txt
seed live único (v1)  →  draft operacional + promote validado + rollback trivial
```

Depois deste WS (se gate cumplido):

- operadores podem **preparar** alterações de conteúdo runtime em `draft` sem tocar o live
- **promote** substitui o live apenas após validação determinística
- `barba-negra.v1.json` permanece a **fonte live** committed e servida em runtime mode
- read path produto **inalterado** por default — preview de draft só via opt-in dev/staging
- external reality overlay continua **default OFF** e independente do ciclo draft/live

---

## Estado atual (pós WS-14A + WS-16A)

| Camada | Status |
|--------|--------|
| Live seed | `data/runtime/appointment/barba-negra.v1.json` — import estático em `runtime-store.ts` |
| Read path | `loadAppointmentRuntime()` → `mock` \| `runtime` via `NEXT_PUBLIC_APPOINTMENT_RUNTIME` |
| Validação bundle | `validateAppointmentRuntimeBundle()` + `assertAppointmentRuntimeBundle()` |
| Regeneração seed | `pnpm runtime:appointment:seed` (mock adapter → v1 overwrite) |
| External overlay | opt-in `NEXT_PUBLIC_APPOINTMENT_EXTERNAL_REALITY=1` · default OFF |
| Draft / promote | ❌ inexistente |
| Publication states | ❌ não modelados (explicitamente fora de WS-14A) |

**Gap:** hoje qualquer alteração de conteúdo runtime exige editar ou regenerar `v1.json` diretamente — sem workspace draft, sem gate de promote, sem backup operacional padronizado.

---

## Escopo

### Incluído

1. **Conceito `draft` e `live`** — vocabulário operacional file-first, Appointment pilot only
2. **Artefato draft** — `{slug}.draft.json` como workspace operacional separado do live
3. **Live preservado** — `{slug}.v1.json` continua live committed; runtime mode lê live por default
4. **Init draft seguro** — copiar live → draft ou seed from adapter; nunca mutar live implicitamente
5. **Validate draft** — schema + regras de integridade existentes + smoke parity (professionals, services, IDs morph)
6. **Promote draft → live** — comando explícito: validate → backup v1 → atomic write v1 ← draft
7. **Rollback trivial** — restore backup pré-promote ou `git checkout` do v1
8. **Preview opt-in (dev/staging)** — env flag para carregar draft no read path **sem** alterar default produto
9. **Gates técnicos** — estender `qa:appointment-runtime`; manter `qa:appointment` + `qa:events` verdes
10. **Runbook operacional** — documentar workflow draft → validate → promote → rollback

### Fora de escopo (inviolável neste WS)

| Fora | Motivo |
|------|--------|
| Editor visual (WS-17) | Superfície de edição = CMS |
| IA operacional (WS-18) | Requer entidades + histórico |
| DB / Drizzle / Postgres (WS-09) | Persistência write enterprise — ciclo separado |
| Autenticação / permissões / RBAC | Infra CMS |
| Painel administrativo | Superfície de produto |
| Upload de mídia / CDN pipeline | Asset management |
| Multi-vertical | Appointment pilot (`barba-negra`) only |
| Analytics / audit log enterprise | Observabilidade pesada |
| Default-on external reality | Política WS-16A — **proibido promover aqui** |
| Versionamento semver multi-live (`v2`, `v3`…) | Complexidade CMS; v1 + draft suficiente no Sprint 1 |
| Preview draft em produção default | Draft preview = opt-in explícito dev/staging |
| Alteração JSX / motion / composer / drawer | Produto perceptivo congelado @ `1c92acc` |
| Workflow de aprovação multi-pessoa | Processo editorial — não primitivo |

---

## Modelo draft / live

### Definições

| Estado | Artefato | Onde vive | Quem lê | Commit |
|--------|----------|-----------|---------|--------|
| **live** | `barba-negra.v1.json` | `data/runtime/appointment/` | `runtime-store.ts` em `NEXT_PUBLIC_APPOINTMENT_RUNTIME=runtime` | ✅ sim — fonte de verdade versionada |
| **draft** | `barba-negra.draft.json` | `data/runtime/appointment/` | CLI + preview opt-in apenas | ❌ gitignored (operacional local) |
| **backup** | `barba-negra.v1.{iso}.backup.json` | `data/runtime/appointment/backups/` | rollback CLI | ❌ gitignored |

### Metadados de publicação (proposto — em `meta`, draft only)

Estender `AppointmentRuntimeBundle.meta` **somente no draft** com campos opcionais:

```ts
interface AppointmentPublicationMeta {
  publicationState: "draft" | "live"
  derivedFrom?: "live" | "mock-adapter" | "manual"
  draftUpdatedAt?: string   // ISO
  promotedAt?: string       // ISO — preenchido no promote
}
```

**Regras:**

1. Arquivo **live** (`v1.json`) assume `publicationState: "live"` implicitamente — não exige campo novo para compat
2. Draft **deve** declarar `publicationState: "draft"` — validate falha se ausente ou incorreto
3. Promote **normaliza** meta ao escrever live: `source: "runtime"`, remove campos draft-only, atualiza `updatedAt`
4. Overlay external reality (WS-16A) aplica **depois** do load do bundle live/draft — publication não altera regras overlay

### Fluxo operacional

```txt
                    ┌─────────────────────┐
                    │  barba-negra.v1.json │  ← LIVE (committed, runtime default)
                    └──────────▲──────────┘
                               │ promote (validate + backup + atomic write)
                    ┌──────────┴──────────┐
                    │ barba-negra.draft.json │  ← DRAFT (gitignored workspace)
                    └──────────▲──────────┘
                               │ draft-init (copy live) ou edição manual/seed
                    ┌──────────┴──────────┐
                    │  operador / script   │
                    └─────────────────────┘
```

### Preview opt-in (paralelo à política WS-16A)

| Variável | Default | Função |
|----------|---------|--------|
| `APPOINTMENT_PUBLICATION_PREVIEW` | unset | `draft` = read path carrega draft em server/dev — **não** altera build produto default |

**Política:** preview draft = **OFF** por default, assim como external reality overlay. Produção runtime mode lê **sempre** live v1 salvo promote explícito + commit.

---

## Comandos propostos

| Comando | Papel |
|---------|-------|
| `pnpm runtime:appointment:draft-init` | Cria `barba-negra.draft.json` a partir do live v1 (ou `--from-mock` via adapter) |
| `pnpm runtime:appointment:draft-validate` | Valida draft: schema, IDs, slug, publicationState=draft; smoke parity |
| `pnpm runtime:appointment:promote` | `draft-validate` → backup v1 → escreve v1 ← draft → smoke live |
| `pnpm runtime:appointment:rollback` | Restaura último backup de v1 (ou `--to=<backup>`) |
| `pnpm qa:appointment-publication` | Gate agregado: validate live + draft-init smoke + promote dry-run fixture |

### Exemplo de workflow

```bash
# 1. Criar workspace draft a partir do live atual
pnpm runtime:appointment:draft-init

# 2. Editar data/runtime/appointment/barba-negra.draft.json (manual ou script externo)

# 3. Validar sem promover
pnpm runtime:appointment:draft-validate

# 4. Promover para live (gera backup automático)
pnpm runtime:appointment:promote

# 5. Gates pós-promote
pnpm typecheck
pnpm qa:appointment-runtime
pnpm qa:appointment
pnpm qa:events

# 6. Commit do v1 atualizado (operador — fora do CLI)
git add data/runtime/appointment/barba-negra.v1.json
git commit -m "chore: promote barba-negra runtime draft"

# Rollback se necessário
pnpm runtime:appointment:rollback
# ou
git checkout -- data/runtime/appointment/barba-negra.v1.json
```

### Flags propostas

| Flag | Comando | Efeito |
|------|---------|--------|
| `--slug=barba-negra` | todos | Pilot slug (default) |
| `--from-mock` | draft-init | Seed draft via mock adapter em vez de copy live |
| `--dry-run` | promote | Validate + diff summary; não escreve v1 |
| `--force` | promote | Promove mesmo com warnings não-bloqueantes (log explícito) |
| `--to=<file>` | rollback | Restaura backup específico |

---

## Arquivos candidatos

### Novos (propostos)

| Path | Papel |
|------|-------|
| `lib/runtime/appointment/publication/types.ts` | `AppointmentPublicationMeta`, paths, constants |
| `lib/runtime/appointment/publication/paths.ts` | Resolve `{slug}.v1.json`, `.draft.json`, backup dir |
| `lib/runtime/appointment/publication/load-document.ts` | Read JSON from disk (server/CLI only — não client bundle) |
| `lib/runtime/appointment/publication/validate-draft.ts` | Draft-specific validation + publicationState gate |
| `lib/runtime/appointment/publication/promote.ts` | Backup + atomic promote core |
| `lib/runtime/appointment/publication/rollback.ts` | Restore backup |
| `lib/runtime/appointment/publication/preview.ts` | `resolvePublicationPreviewMode()` — client-safe env resolver |
| `lib/runtime/appointment/publication/parity.ts` | Smoke: draft-init, validate, promote dry-run |
| `scripts/runtime/init-appointment-draft.ts` | CLI draft-init |
| `scripts/runtime/validate-appointment-draft.ts` | CLI draft-validate |
| `scripts/runtime/promote-appointment-draft.ts` | CLI promote |
| `scripts/runtime/rollback-appointment-live.ts` | CLI rollback |
| `scripts/runtime/appointment-publication-smoke.mjs` | Gate `qa:appointment-publication` |

### Alterados (mínimo)

| Path | Mudança |
|------|---------|
| `lib/runtime/appointment/runtime-store.ts` | Live load inalterado; optional draft preview via server-only branch |
| `lib/runtime/appointment/load.ts` | Branch preview draft (server-only, env opt-in) — default path intacto |
| `lib/runtime/appointment/types.ts` | `meta.publication?` opcional |
| `lib/runtime/appointment/validate.ts` | Validar `publicationState` quando presente |
| `package.json` | Scripts publication + `qa:appointment-publication` |
| `.gitignore` | `*.draft.json`, `data/runtime/appointment/backups/` |

### Intocados (Tier 1 / perceptivo)

- `components/business/appointment/appointment-feed.tsx`
- `components/business/conversational-ai.tsx`
- `lib/ui/composer-surface-material.ts`
- `lib/surfaces/*`
- `components/business/context-selectable.tsx`
- `app/criar/**` (editor legado — fora de escopo)

### Live atual (preservado)

| Path | Papel |
|------|-------|
| `data/runtime/appointment/barba-negra.v1.json` | **Live** — permanece seed committed; promote atualiza este arquivo |

---

## Riscos

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| Virar CMS disfarçado (UI, CRUD, multi-tenant) | **Alta** | Charter gate + diff review: zero JSX; CLI only |
| Promote acidental sem validate | **Alta** | `promote` sempre chama `draft-validate`; `--dry-run` default recomendado na docs |
| Draft commitado por engano | **Média** | `.gitignore` + validate falha se draft no index |
| Divergência live vs draft silenciosa | **Média** | Smoke parity pós-promote; `qa:appointment-runtime` compara counts/IDs |
| Quebra import estático `runtime-store` após promote | **Média** | v1 continua mesmo path/nome; rebuild necessário (documentado) |
| Preview draft vaza para produção | **Alta** | `APPOINTMENT_PUBLICATION_PREVIEW` nunca setado em prod; build gate verifica |
| Conflito com external reality overlay | **Baixa** | Overlay aplica após load; publication não altera WS-16A policy |
| Regeneração `runtime:appointment:seed` sobrescreve v1 sem draft | **Média** | Deprecar seed direto para v1 ou exigir `--target=draft`; documentar no runbook |
| Schema creep (versionamento v2/v3, approval flows) | **Média** | Sprint 1 = v1 + draft only; expansão exige novo charter |
| Rollback incompleto | **Média** | Backup timestamped antes de cada promote; `git checkout` como fallback |

---

## Plano de implementação — micro-etapas

### Etapa 0 — Charter ✅ (este documento)

- [x] Definir draft/live file-first
- [x] Propor comandos validate/promote/rollback
- [x] Mapear arquivos candidatos
- [x] Gate CMS vs publicação mínima
- [ ] **GO humano explícito para código**

### Etapa 1 — Types + paths (sem wiring load)

- `publication/types.ts`, `paths.ts`
- Extensão opcional `meta.publication`
- Unit smoke: path resolution

### Etapa 2 — Draft init + validate CLI

- `draft-init`, `draft-validate`
- `.gitignore` draft + backups
- Gate: validate live v1 atual PASS

### Etapa 3 — Promote + rollback CLI

- `promote.ts` backup + atomic write
- `rollback` restore
- `--dry-run` promote

### Etapa 4 — Preview opt-in no read path (server-only)

- `preview.ts` env resolver
- Branch em `load.ts` / `runtime-store` — **default inalterado**
- Smoke: preview OFF = live; preview ON + draft = draft

### Etapa 5 — Gates + runbook

- `qa:appointment-publication`
- Estender `qa:appointment-runtime`
- Atualizar `WORKSTREAMS.md`
- Runbook §Publication operacional

**Estimativa:** 2 PRs — (1) CLI publication core + (2) preview opt-in + gates — **não** big bang.

---

## Gate de saída WS-15A

| # | Critério | Verificação |
|---|----------|-------------|
| G1 | Conceito draft/live documentado e implementado file-first | paths + meta |
| G2 | `barba-negra.v1.json` permanece live default | runtime mode sem preview |
| G3 | `barba-negra.draft.json` gerável via `draft-init` | CLI smoke |
| G4 | `draft-validate` bloqueia draft inválido | smoke fixture inválido FAIL |
| G5 | `promote` exige validate + cria backup | CLI + arquivo backup |
| G6 | `rollback` restaura v1 pré-promote | CLI smoke |
| G7 | Preview draft = opt-in; default OFF | env gate |
| G8 | External reality overlay default OFF inalterado | WS-16A policy |
| G9 | `pnpm qa:appointment-runtime` PASS | CI/local |
| G10 | `pnpm qa:appointment` + `pnpm qa:events` PASS | 8/8 |
| G11 | Zero diff JSX/UI Tier 1 | grep / review |
| G12 | Nenhuma vertical além Appointment | diff scope |
| G13 | Zero editor / DB / auth / admin | diff scope |

---

## Runbook operacional (proposto)

### Política oficial

| Política | Valor |
|----------|-------|
| Live default | `barba-negra.v1.json` committed |
| Draft | gitignored — workspace local/staging |
| Promote | manual explícito — nunca CI automático para prod |
| Preview draft | OFF default — dev/staging opt-in |
| External reality | OFF default — independente de publication |
| Commit pós-promote | operador commita v1 — CLI não faz git commit |

### Rollback

```txt
1. pnpm runtime:appointment:rollback
   → restaura último backup timestamped

2. git checkout -- data/runtime/appointment/barba-negra.v1.json
   → restaura último committed

3. rebuild / restart dev server
   → runtime-store re-importa v1
```

### Quando promover

- Draft validado (`draft-validate` PASS)
- Diff revisado (conteúdo editorial, IDs morph preservados)
- Gates pós-promote verdes
- Intenção operacional clara — não promote automático em merge

### Quando NÃO promover

- Draft inválido ou IDs morph alterados sem revisão
- Objetivo é “testar copy” → usar preview opt-in, não promote
- Misturar com overlay external reality default-on
- Antes de Sessão B se alteração afetar copy perceptiva hero/chegada

---

## GO / NO-GO — começar código

### GO ✅ (recomendado — charter)

| Condição | Estado |
|----------|--------|
| WS-14A runtime wired | ✅ @ `4cd71c9` |
| WS-16A external reality fechado | ✅ default OFF |
| Produto perceptivo congelado | ✅ @ `1c92acc` |
| Live seed estável (`barba-negra.v1.json`) | ✅ committed |
| Validação bundle existente | ✅ `validate.ts` |
| Escopo Appointment-only definido | ✅ este charter |
| Gate CMS vs primitivo respondido | ✅ file + CLI only |

**Veredicto:** **GO para implementação WS-15A** após aprovação explícita deste charter.

**Condicionantes:**

1. Sprint 1 limitado a **v1 live + draft** — sem v2/multi-version
2. Preview draft permanece **opt-in** — nunca default prod
3. Promote **nunca** altera JSX/motion/composer
4. `runtime:appointment:seed` direct-to-v1 revisado para não contornar draft workflow

### NO-GO ❌ (se)

- Qualquer UI de edição, upload ou admin panel
- Autenticação, permissões ou multi-tenant
- DB / Drizzle no mesmo PR
- Promote automático em CI para produção
- Preview draft default-on
- Default-on external reality “bundled” com publication
- Schema virar workflow de aprovação enterprise
- Alteração perceptiva Tier 1 sem charter separado

---

## Decisão estratégica adjacente (fora deste WS)

```txt
WS-15A publication primitiva  →  (este charter)
WS-09 persistência DB           →  ciclo separado — write path enterprise
WS-17 editor perceptivo         →  requer publication madura
WS-18 IA operacional            →  requer entidades + histórico
```

**Ordem recomendada pós-15A:** WS-09 (persistência) **ou** WS-18 (IA) — decisão deliberada; publication primitiva **não** exige DB para respirar.

**Comparação deliberativa (referência — não decidir aqui):**

| Ciclo | Valor imediato | Risco |
|-------|----------------|-------|
| WS-09 persistência | write path real, multi-env | schema creep, infra pesada cedo |
| WS-15A publication | promote seguro **agora**, zero infra | limitado a file-first |
| WS-18 IA | resolver operacional | requer runtime/publication maduros |

---

## Registro

| Campo | Valor |
|-------|-------|
| Charter autor | proposta operacional @ `4cd71c9` |
| Pilot slug | `barba-negra` |
| Live atual | `data/runtime/appointment/barba-negra.v1.json` |
| Implementação | **aguardando GO explícito** |

*Publication Primitive — promote consciente, não CMS.*
