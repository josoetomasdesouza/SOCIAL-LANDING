# WS-15A — Publication Primitive: Appointment First

**Baseline técnico:** `origin/main` @ `141c263`  
**Pré-requisitos:** WS-14A ✅ runtime-backed · WS-16A ✅ external reality opt-in/default OFF  
**Baseline produto perceptivo:** `1c92acc` (inalterado)  
**Classificação:** camada operacional de publicação mínima — **não** feature de produto  
**Status:** ✅ **WS-15A concluído (Etapas 0–3)** — preview **default OFF** · promote **manual `--execute`** · **zero JSX**  
**Relação:** senta sobre WS-14A (read path) e independente de WS-16A (overlay); **não substitui** WS-09 (DB) nem abre WS-17 (editor)

---

## Pergunta gate

```txt
publication ficou segura e operacional
ou começou a virar workflow editorial visível?
```

**Resposta do charter (Etapas 1–3):** publication **segura e operacional** — draft/live file-first, CLI controlado, preview server-only opt-in, **zero superfície visível** ao usuário final.

**Anti-padrão explícito:**

```txt
arquivo + CLI + promote consciente = GO (publicação primitiva)
UI de edição + permissões + auto-promote = NO-GO (CMS / workflow editorial)
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

## Estado atual (pós WS-15A @ `141c263`)

| Camada | Status |
|--------|--------|
| Live seed | `data/runtime/appointment/barba-negra.v1.json` — import estático em `runtime-store.ts` |
| Draft workspace | `barba-negra.draft.json` — gitignored; gerável via `draft-init` / `seed` |
| Backups | `data/runtime/appointment/backups/` — gitignored; criados antes de promote `--execute` |
| Read path default | `loadAppointmentRuntime()` → live committed (preview OFF) |
| Preview draft | `APPOINTMENT_PUBLICATION_PREVIEW=draft` — server-only opt-in @ `141c263` |
| Validação | `validateAppointmentDraftBundle()` + `validateAppointmentLiveBundle()` |
| Promote / rollback | CLI real com `--execute` obrigatório; dry-run default |
| Seed | `pnpm runtime:appointment:seed` → **draft** default; live exige `--live --force` |
| External overlay | opt-in `NEXT_PUBLIC_APPOINTMENT_EXTERNAL_REALITY=1` · default OFF (WS-16A) |
| Gates | `qa:appointment-publication` + wiring parity em `qa:appointment-runtime` |

**Política oficial:** publication é **infraestrutura silenciosa** — não interface operacional visível.

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

## Comandos (implementados)

| Comando | Papel |
|---------|-------|
| `pnpm runtime:appointment:draft-init` | Cria draft a partir do live (`--from-mock` opcional) |
| `pnpm runtime:appointment:draft-validate` | Valida live committed + draft local (se existir) |
| `pnpm runtime:appointment:promote` | Dry-run default; `--execute` → validate + backup + atomic write v1 |
| `pnpm runtime:appointment:rollback` | Dry-run default; `--execute` → restore backup |
| `pnpm runtime:appointment:seed` | **Default draft**; `--live --force` para overwrite live explícito |
| `pnpm qa:appointment-publication` | Gate: live parity + draft/promote/rollback temp + wiring |
| `pnpm qa:appointment-runtime` | Inclui publication wiring parity |

### Workflow operacional

```bash
# 1. Criar workspace draft a partir do live atual
pnpm runtime:appointment:draft-init

# 2. Editar data/runtime/appointment/barba-negra.draft.json (manual ou script externo)

# 3. Validar sem promover
pnpm runtime:appointment:draft-validate

# 4. Inspecionar promote (dry-run — default)
pnpm runtime:appointment:promote

# 5. Promover para live (backup obrigatório quando v1 existe)
pnpm runtime:appointment:promote -- --execute

# 6. Gates pós-promote
pnpm typecheck
pnpm qa:appointment-publication
pnpm qa:appointment-runtime
pnpm qa:appointment
pnpm qa:events

# 7. Commit do v1 atualizado (operador — CLI não faz git commit)
git add data/runtime/appointment/barba-negra.v1.json
git commit -m "chore: promote barba-negra runtime draft"

# Rollback se necessário
pnpm runtime:appointment:rollback -- --execute
# ou backup explícito por timestamp
pnpm runtime:appointment:rollback -- --execute --to=2026-06-02T00-09-45.720Z
# ou git
git checkout -- data/runtime/appointment/barba-negra.v1.json
```

### Flags

| Flag | Comando | Efeito |
|------|---------|--------|
| `--slug=barba-negra` | todos | Pilot slug (default) |
| `--from-mock` | draft-init | Seed draft via mock adapter |
| `--force` | draft-init, seed | Sobrescreve draft/live existente |
| `--execute` | promote, rollback | Execução real (sem flag = dry-run) |
| `--to=<timestamp\|path>` | rollback | Backup explícito ou último se omitido |
| `--live` / `--target=live` | seed | Escreve v1 — exige `--force` se existir |

---

## Arquivos implementados

| Path | Papel | Commit |
|------|-------|--------|
| `lib/runtime/appointment/publication/*` | Module draft/live/promote/rollback/preview | `283086b` + `141c263` |
| `lib/runtime/appointment/publication/load-draft.server.ts` | Leitura draft server-only | `141c263` |
| `lib/runtime/appointment/publication/wiring-parity.ts` | Smoke preview ON/OFF | `141c263` |
| `lib/runtime/appointment/load.ts` | Preview branch runtime load path | `141c263` |
| `lib/runtime/appointment/types.ts` | `meta.publication?` | `283086b` |
| `scripts/runtime/init-appointment-draft.ts` | CLI draft-init | `283086b` |
| `scripts/runtime/validate-appointment-draft.ts` | CLI validate | `283086b` |
| `scripts/runtime/promote-appointment-draft.ts` | CLI promote | `283086b` |
| `scripts/runtime/rollback-appointment-live.ts` | CLI rollback | `283086b` |
| `scripts/runtime/generate-appointment-runtime-seed.ts` | Seed → draft default | `141c263` |
| `scripts/runtime/appointment-publication-smoke.*` | Gate publication | `283086b` |
| `.gitignore` | `*.draft.json`, `backups/` | `283086b` |

### Intocados (Tier 1 / perceptivo)

- `components/business/appointment/appointment-feed.tsx`
- `components/business/conversational-ai.tsx`
- `lib/ui/composer-surface-material.ts`
- `lib/surfaces/*`
- `app/criar/**` (editor legado — fora de escopo)

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
| Regeneração `runtime:appointment:seed` sobrescreve v1 | **Média** | Mitigado @ `141c263` — default draft; live exige `--live --force` |
| Schema creep (versionamento v2/v3, approval flows) | **Média** | Sprint 1 = v1 + draft only; expansão exige novo charter |
| Rollback incompleto | **Média** | Backup timestamped antes de cada promote; `git checkout` como fallback |

---

## Plano de implementação — micro-etapas

### Etapa 0 — Charter ✅ @ `283086b` (charter doc)

- [x] Definir draft/live file-first
- [x] Propor comandos validate/promote/rollback
- [x] Gate CMS vs publicação mínima

### Etapa 1 — Publication primitive foundation ✅ @ `283086b`

- [x] `publication/types`, `paths`, `load-document`, `preview`, `validate-draft`
- [x] `draft-init`, `promote`, `rollback` (library)
- [x] CLI draft-init + draft-validate
- [x] `qa:appointment-publication` + `.gitignore`

### Etapa 2 — Wiring + controlled promote ✅ @ `141c263`

- [x] `load-draft.server.ts` + preview branch em `load.ts`
- [x] Promote/rollback `--execute` real; dry-run default
- [x] Seed default → draft
- [x] Wiring parity em `qa:appointment-runtime`

### Etapa 3 — Gates + runbook ✅ (este fechamento)

- [x] Runbook operacional completo
- [x] Gate de saída G1–G13 verificados
- [x] `WORKSTREAMS.md` atualizado
- [x] Decisão: preview OFF · auto-promote proibido

**Histórico commits WS-15A:**

```txt
283086b  feat: add appointment publication primitive      (Etapa 1)
141c263  feat: add controlled appointment publication workflow  (Etapa 2)
```

---

## Gate de saída WS-15A

| # | Critério | Verificação | Etapa 3 |
|---|----------|-------------|---------|
| G1 | Conceito draft/live file-first | paths + meta | ✅ |
| G2 | `barba-negra.v1.json` live default | runtime mode preview OFF | ✅ wiring parity |
| G3 | Draft gerável via `draft-init` | CLI smoke | ✅ publication parity |
| G4 | `draft-validate` bloqueia inválido | smoke temp dir | ✅ publication parity |
| G5 | Promote exige validate + backup | `--execute` + backup file | ✅ publication parity |
| G6 | Rollback restaura v1 pré-promote | timestamp rollback smoke | ✅ publication parity |
| G7 | Preview draft opt-in; default OFF | env gate | ✅ wiring parity |
| G8 | Preview server-only | `typeof window` guard | ✅ load.ts |
| G9 | External reality overlay default OFF | WS-16A policy | ✅ inalterado |
| G10 | `pnpm qa:appointment-runtime` PASS | CI/local | ✅ |
| G11 | `pnpm qa:appointment-publication` PASS | wiring + parity | ✅ |
| G12 | `pnpm qa:appointment` + `pnpm qa:events` PASS | 8/8 | ✅ |
| G13 | Zero JSX/UI · zero editor/DB/auth | diff scope | ✅ |

---

## Runbook operacional

### Política oficial

| Política | Valor |
|----------|-------|
| **Publication** | Infraestrutura silenciosa — não interface operacional visível |
| Live default | `barba-negra.v1.json` committed |
| Draft | gitignored — workspace local/staging |
| Promote | manual `--execute` — **nunca CI automático** |
| Preview draft | **OFF default** — `APPOINTMENT_PUBLICATION_PREVIEW=draft` dev/staging only |
| Seed | default **draft**; live exige `--live --force` |
| External reality | OFF default — independente de publication (WS-16A) |
| Commit pós-promote | operador commita v1 — CLI não faz git commit |
| Editor / DB / IA | **fora de escopo** WS-15A |

### Variáveis de ambiente

| Variável | Onde | Default | Função |
|----------|------|---------|--------|
| `NEXT_PUBLIC_APPOINTMENT_RUNTIME` | build/runtime | `mock` | `runtime` = seed JSON live |
| `APPOINTMENT_PUBLICATION_PREVIEW` | server / dev | unset (**live**) | `draft` = preview draft server-side |
| `NEXT_PUBLIC_APPOINTMENT_EXTERNAL_REALITY` | build/runtime | **OFF** | overlay WS-16A — independente |

### Preview draft no load path

Preview aplica **somente** quando **todas** as condições:

1. `APPOINTMENT_PUBLICATION_PREVIEW=draft`
2. Server-side (`typeof window === "undefined"`)
3. `NEXT_PUBLIC_APPOINTMENT_RUNTIME=runtime` (via `loadAppointmentRuntimeFromRuntimeStore`)
4. Draft local válido (`barba-negra.draft.json` + `draft-validate` rules)

Implementação: `load.ts` → `load-draft.server.ts` (require server-only)

| Condição | Efeito |
|----------|--------|
| Preview OFF (default) | Live committed via `runtime-store` |
| Preview ON + draft válido | Conteúdo draft server-side |
| Preview ON + draft ausente/inválido | Fallback silencioso → live |
| Client bundle | **Sempre live** — ignora preview |

### Promote workflow

```bash
pnpm runtime:appointment:draft-validate
pnpm runtime:appointment:promote              # dry-run (default)
pnpm runtime:appointment:promote -- --execute # backup + atomic write v1
```

**Regras `--execute`:**

- Sempre valida draft antes de escrever
- Backup **obrigatório** quando live v1 existe
- Escrita atômica via temp file + rename
- Rebuild/restart necessário para `runtime-store` static import refletir v1

### Rollback

```txt
1. pnpm runtime:appointment:rollback -- --execute
   → restaura último backup timestamped

2. pnpm runtime:appointment:rollback -- --execute --to=<timestamp>
   → backup explícito por timestamp no filename

3. git checkout -- data/runtime/appointment/barba-negra.v1.json
   → restaura último committed

4. rebuild / restart dev server
   → runtime-store re-importa v1
```

### Seed workflow

```bash
# Default — escreve draft (nunca live implicitamente)
pnpm runtime:appointment:seed

# Live explícito — exige --force se v1 existir
pnpm runtime:appointment:seed -- --live --force
```

### Quando promover

- Draft validado (`draft-validate` PASS)
- Diff revisado (IDs morph preservados)
- Gates pós-promote verdes
- Intenção operacional clara — **não** promote automático em merge/CI

### Quando NÃO promover

- Draft inválido ou IDs morph alterados sem revisão
- Objetivo é “testar copy” → usar **preview opt-in**, não promote
- CI/CD pipeline — **auto-promote proibido**
- Antes de revisão perceptiva se alteração afeta hero/chegada/copy WS-09D

### Fallback behavior

| Condição | Efeito |
|----------|--------|
| Preview OFF | Live v1 intacto — **comportamento produto default** |
| Preview ON sem draft | noop → live |
| Draft inválido | noop → live |
| Promote sem `--execute` | noop no disco (dry-run) |
| Rollback sem `--execute` | noop no disco (dry-run) |

---

## Decisão WS-15A — pós Etapa 3

| Opção | Decisão |
|-------|---------|
| **Preview default OFF** | ✅ **Adotado** @ `141c263` |
| **Promote manual `--execute`** | ✅ **Adotado** — dry-run default |
| **Auto-promote / CI promotion** | ❌ **Proibido** |
| **Editor / DB / IA / admin panel** | ❌ **Fora de escopo** |
| **Publication como infra silenciosa** | ✅ **Política oficial** |

**Veredicto gate:** publication **segura e operacional** — não workflow editorial visível.

---

## GO / NO-GO — WS-15A fechado

### GO ✅ — WS-15A oficialmente concluído

| Condição | Estado |
|----------|--------|
| Etapas 1–2 implementadas | ✅ @ `283086b` + `141c263` |
| Runbook + gates G1–G13 | ✅ Etapa 3 |
| Preview default OFF | ✅ |
| Promote auto proibido | ✅ |
| Zero JSX/UI | ✅ @ `1c92acc` perceptivo |
| Produto perceptivo inalterado | ✅ |

**Veredicto:** **WS-15A FECHADO** — publication primitive operacional; próximo ciclo = decisão estratégica deliberada.

### NO-GO ❌ (próximos ciclos — não autorizado sem charter)

- Editor visual (WS-17)
- DB persistência write (WS-09)
- IA operacional (WS-18)
- Preview default-on em produção
- CI auto-promote
- Badge/UI draft-live
- Multi-vertical publication

---

## Decisão estratégica adjacente (pós WS-15A)

```txt
WS-15A publication primitiva  →  ✅ FECHADO @ 141c263
WS-09 persistência DB           →  ciclo separado — decisão deliberada
WS-17 editor perceptivo         →  requer publication madura — não abrir automaticamente
WS-18 IA operacional            →  requer entidades + histórico — decisão deliberada
```

**Próxima decisão estratégica (deliberada — não abrir automaticamente):**

| Ciclo | Quando faz sentido | Risco |
|-------|-------------------|-------|
| **WS-09** persistência DB | write path multi-env, histórico | schema creep, infra cedo |
| **WS-18** IA operacional | resolver com runtime maduro | requer entidades reais |
| **WS-17** editor perceptivo | após publication + DB maduros | virar CMS se prematuro |

**Recomendação:** publication permanece **infra silenciosa**. Operar via CLI draft/live antes de abrir editor ou DB.

---

## Registro

| Campo | Valor |
|-------|-------|
| Charter | proposta @ `4cd71c9` · implementação @ `283086b`–`141c263` |
| Fechamento Etapa 3 | runbook + gates @ `141c263` baseline |
| Pilot slug | `barba-negra` |
| Live | `data/runtime/appointment/barba-negra.v1.json` |
| Commits WS-15A | `283086b` (Etapa 1) · `141c263` (Etapa 2) |
| Status | ✅ **WS-15A concluído** |

*Publication Primitive — promote consciente, infra silenciosa, não CMS.*
