# WS-09A — Persistence Primitive: Appointment First

**Baseline técnico:** `origin/main` @ `3e6c80e` (Etapa 0–1)  
**Pré-requisitos:** WS-14A ✅ · WS-16A ✅ · WS-15A ✅ · WS-09A Etapa 0–1 ✅ @ `3e6c80e`  
**Baseline produto perceptivo:** `1c92acc` (inalterado)  
**Classificação:** camada operacional de persistência mínima — **não** backend platform  
**Status:** Etapa 0–1 publicada @ `3e6c80e` · **Etapa 2 implementada localmente** (aguardando commit)  
**Relação:** unifica I/O server-side de WS-14A/15A/16A; **não substitui** WS-17 (editor) nem WS-18 (IA)

---

## Pergunta gate

```txt
isso é persistência operacional mínima
ou backend platform prematuro?
```

**Resposta do charter:** persistência operacional mínima **somente se** for um **storage adapter server-only** que formaliza read/write já existentes (JSON files) — sem ORM enterprise, sem auth, sem multi-tenant, sem cloud architecture.

**Anti-padrão explícito:**

```txt
adapter + filesystem/SQLite local + CLI explícito = GO (persistência primitiva)
Drizzle + Postgres + API media + permissions + realtime = NO-GO (backend platform prematuro)
```

Referências: [`WS-14A_LIVING_RUNTIME_FOUNDATION.md`](WS-14A_LIVING_RUNTIME_FOUNDATION.md), [`WS-15A_PUBLICATION_PRIMITIVE.md`](WS-15A_PUBLICATION_PRIMITIVE.md), [`WS-16A_EXTERNAL_REALITY_MINIMUM.md`](WS-16A_EXTERNAL_REALITY_MINIMUM.md).

---

## Objetivo

Definir **persistência mínima operacional** para runtime / publication / external reality — sem abrir backend enterprise e **sem alterar a experiência perceptiva**.

```txt
I/O espalhado (fs ad-hoc + import estático)  →  storage adapter único server-only
```

Depois deste WS (se gate cumplido):

- read/write runtime Appointment passam por **uma porta** (`StorageAdapter`)
- draft/live publication e external snapshots usam **mesma gramática de keys**
- filesystem permanece **default** (zero regressão); SQLite opcional como Sprint 2
- rollback continua **trivial** (backup file + git checkout live committed)
- produto default **inalterado** — adapter é infra silenciosa

---

## Estado atual (pós WS-14A + WS-15A + WS-16A @ `a837064`)

| Domínio | Persistência hoje | Onde |
|---------|-------------------|------|
| Live runtime | `barba-negra.v1.json` committed + import estático | `runtime-store.ts` |
| Draft publication | `barba-negra.draft.json` gitignored | `publication/load-document.ts` |
| Backups publication | `backups/*.backup.json` gitignored | `publication/promote.ts` |
| External snapshot | `{slug}.snapshot.json` gitignored | `external-reality/snapshot-cache.ts` |
| External sync report | `{slug}.sync-report.json` gitignored | `external-reality/sync-report.ts` |
| Read path produto | `load.ts` → mock \| runtime + overlays opt-in | sem adapter unificado |
| Write path | CLI publication + CLI external sync | `fs` direto, sem abstração |

**Gap:** I/O operacional funciona, mas está **fragmentado** — difícil trocar backend, auditar writes, ou evoluir para SQLite local sem duplicar lógica.

**WS-09 legacy (blocked):** Drizzle/Postgres/media API — **fora deste charter**. WS-09A é **re-escopo estreito** da trilha persistência, não reopen do PR db-media enterprise.

---

## Escopo

### Incluído

1. **Storage adapter simples** — interface `read` / `write` / `exists` / `backup` server-only
2. **Read/write runtime** — live bundle via adapter (fallback import estático preservado Sprint 1)
3. **Persistência draft/live** — publication domain keys; promote/rollback via adapter
4. **Persistência external snapshots** — snapshot + sync-report via adapter
5. **Filesystem-first** — `FileSystemStorageAdapter` wrap paths existentes (default)
6. **SQLite simples (opcional Sprint 2)** — single-file local; **sem ORM**; JSON blob columns ou document store minimal
7. **Rollback simples** — backup-before-write + restore; compatível com publication rollback atual
8. **Gates técnicos** — smoke adapter + `qa:appointment-runtime` + `qa:appointment-publication` verdes
9. **Runbook operacional** — documentar env, paths, rollback, política default

### Fora de escopo (inviolável neste WS)

| Fora | Motivo |
|------|--------|
| Auth / permissions / RBAC | Backend platform |
| Admin panel / UI storage | CMS |
| Editor visual (WS-17) | Superfície produto |
| IA operacional (WS-18) | Ciclo separado |
| ORM enterprise (Drizzle migrations) | WS-09 legacy — não misturar |
| Postgres / cloud DB | Infra prematura |
| Multi-tenant | Platform scope |
| WebSocket / realtime | Fora de persistência mínima |
| Analytics / billing | Growth platform |
| Media upload API | WS-09 legacy media |
| Auto-write on HTTP request | Side effects silenciosos |
| Alteração JSX / motion / composer | Produto @ `1c92acc` |
| Multi-vertical | Appointment pilot (`barba-negra`) only |

---

## Storage strategy

### Princípio

```txt
filesystem-first  →  adapter port  →  (opcional) SQLite local
```

**Sprint 1 (recomendado):** apenas `FileSystemStorageAdapter` — **zero mudança de comportamento default**; unifica callsites.

**Sprint 2 (opcional pós-gate):** `SqliteStorageAdapter` — arquivo único ex.: `data/runtime/appointment/store.sqlite` — para atomic write multi-key; ainda server-only, sem migrations enterprise.

### Domínios de storage (keys propostas)

| Key pattern | Payload | Política |
|-------------|---------|----------|
| `runtime/{slug}/live` | `AppointmentRuntimeBundle` | committed v1 + adapter read |
| `runtime/{slug}/draft` | `AppointmentRuntimeBundle` + `meta.publication` | gitignored operacional |
| `runtime/{slug}/backup/{timestamp}` | `AppointmentRuntimeBundle` | gitignored; pré-promote |
| `external/{slug}/snapshot` | `ExternalRealitySnapshot` | gitignored operacional |
| `external/{slug}/sync-report` | sync report JSON | gitignored operacional |
| `external/{slug}/merged-preview` | merged runtime preview JSON | gitignored operacional (CLI sync only) |

**Mapeamento filesystem (Sprint 1):**

| Key | Path atual |
|-----|------------|
| `runtime/barba-negra/live` | `data/runtime/appointment/barba-negra.v1.json` |
| `runtime/barba-negra/draft` | `data/runtime/appointment/barba-negra.draft.json` |
| `runtime/barba-negra/backup/{ts}` | `data/runtime/appointment/backups/barba-negra.v1.{ts}.backup.json` |
| `external/barba-negra/snapshot` | `data/runtime/appointment/external/barba-negra.snapshot.json` |
| `external/barba-negra/sync-report` | `data/runtime/appointment/external/barba-negra.sync-report.json` |
| `external/barba-negra/merged-preview` | `data/runtime/appointment/external/barba-negra.merged-preview.json` |

### Interface proposta

```ts
// lib/runtime/appointment/storage/types.ts (proposto — não implementado)

interface StorageReadResult<T> {
  ok: boolean
  data: T | null
  source: "filesystem" | "sqlite" | "static-import"
  error?: string
}

interface StorageWriteOptions {
  backup?: boolean
  dryRun?: boolean
}

interface AppointmentStorageAdapter {
  readJson<T>(key: string): Promise<StorageReadResult<T>> | StorageReadResult<T>
  writeJson<T>(key: string, data: T, options?: StorageWriteOptions): { ok: boolean; backupKey?: string }
  exists(key: string): boolean
  list(prefix: string): string[]
  resolvePath?(key: string): string // filesystem adapter only — debug/runbook
}
```

**Regras:**

1. Adapter **server-only** — nunca importado em client bundle
2. **Sync API** OK no Sprint 1 (fs local); async reservado para SQLite/network futuro
3. **Validate before write** — publication + external schemas existentes
4. **Backup before overwrite** quando `backup: true`
5. **Static import fallback** para live committed — produto default não depende de fs runtime em build

### Seleção de backend

| Variável | Default | Função |
|----------|---------|--------|
| `APPOINTMENT_STORAGE_BACKEND` | `filesystem` | `filesystem` \| `sqlite` (Sprint 2) |
| `APPOINTMENT_STORAGE_ROOT` | `data/runtime/appointment` | Root operacional (filesystem) |

**Política:** default `filesystem` — produto e CI idênticos ao estado @ `a837064`.

---

## Read strategy

### Ordem de resolução (runtime live — produto default)

```txt
loadAppointmentRuntime()
  └─ mode mock → mock adapter (inalterado)
  └─ mode runtime
       └─ preview draft OFF (default)
            └─ live: static import barba-negra.v1.json  (Sprint 1 — preservar)
            └─ (Sprint 2 opcional) adapter.read(runtime/{slug}/live) se env force
       └─ preview draft ON (WS-15A)
            └─ adapter.read(runtime/{slug}/draft) → fallback live
       └─ external overlay ON (WS-16A)
            └─ adapter.read(external/{slug}/snapshot) → merge server-only
```

### Regras read

1. **Uma porta** — proibir novo `readFileSync` disperso após wiring; callsites usam adapter
2. **Fallback silencioso** — draft/snapshot inválido ou ausente → noop (políticas WS-15A/16A preservadas)
3. **Client bundle** — continua sem storage adapter; browser não lê draft/snapshot
4. **Parity** — `qa:appointment-runtime` compara projeção live vs mock (inalterado)

---

## Write strategy

### Quem pode escrever

| Operação | Trigger | Gate |
|----------|---------|------|
| Draft init/seed | CLI `draft-init`, `runtime:appointment:seed` | validate draft |
| Promote live | CLI `promote --execute` | validate + backup |
| Rollback live | CLI `rollback --execute` | backup restore |
| External sync | CLI `runtime:appointment:sync-external` | schema validate |
| HTTP / SSR request | **proibido** | — |

### Regras write

1. **Explicit CLI only** — nenhum write implícito no request path
2. **Dry-run default** onde já existe (publication promote/rollback)
3. **Atomic write** — temp file + rename (padrão publication @ WS-15A)
4. **Live committed** — promote atualiza disco; operador commita git manualmente
5. **Seed default draft** — política WS-15A preservada

---

## Rollback strategy

### Camadas (do mais rápido ao mais amplo)

```txt
1. publication rollback --execute
   → adapter restore runtime/{slug}/backup/{latest}

2. adapter.restore(key, backupKey)
   → genérico para snapshot/sync-report se necessário

3. git checkout -- data/runtime/appointment/barba-negra.v1.json
   → live committed baseline

4. rebuild / restart
   → runtime-store static import refresh
```

### Política rollback

| Cenário | Ação |
|---------|------|
| Promote acidental | `rollback --execute` ou backup timestamp |
| Snapshot externo corrompido | delete snapshot key; overlay noop |
| SQLite Sprint 2 corrupt | fallback filesystem keys; restore file backup |
| Produto perceptivo | **nunca** rollback via storage — live committed + gates |

---

## Arquivos candidatos

### Novos (propostos)

| Path | Papel |
|------|-------|
| `lib/runtime/appointment/storage/types.ts` | Adapter interface + key constants |
| `lib/runtime/appointment/storage/keys.ts` | Key ↔ path mapping |
| `lib/runtime/appointment/storage/filesystem-adapter.ts` | Default backend |
| `lib/runtime/appointment/storage/sqlite-adapter.ts` | Sprint 2 optional |
| `lib/runtime/appointment/storage/resolve-adapter.server.ts` | Env backend resolver |
| `lib/runtime/appointment/storage/parity.ts` | Round-trip smoke |
| `scripts/runtime/appointment-storage-smoke.mjs` | Gate `qa:appointment-storage` |

### Alterados (mínimo — incremental)

| Path | Mudança |
|------|---------|
| `publication/load-document.ts` | Delegar read/write ao adapter |
| `publication/promote.ts` / `rollback.ts` | Write via adapter |
| `external-reality/snapshot-cache.ts` | Read/write via adapter |
| `external-reality/sync-report.ts` | Read/write via adapter |
| `load.ts` | Optional adapter read draft (já wired preview) |
| `package.json` | `qa:appointment-storage` |

### Intocados (Tier 1 / perceptivo)

- `components/business/appointment/appointment-feed.tsx`
- `components/business/conversational-ai.tsx`
- `lib/ui/composer-surface-material.ts`
- `app/criar/**`

---

## Riscos

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| Virar backend platform (Drizzle/Postgres/API) | **Alta** | Charter gate; WS-09A ≠ WS-09 legacy |
| Regressão read path produto | **Alta** | Static import live default Sprint 1; parity smoke |
| Adapter abstraction sem benefício (wrap only) | **Média** | Wire writes + keys unificados; smoke round-trip |
| SQLite prematuro | **Média** | Sprint 2 optional; filesystem default |
| Duplicar publication rollback | **Baixa** | Adapter backup = wrapper atual |
| Side-effect writes em SSR | **Alta** | CLI-only write policy |
| Schema creep (tenants, users, media) | **Alta** | Appointment keys only; charter review |
| Conflito WS-15A preview / WS-16A overlay | **Baixa** | Adapter não altera env policies |
| Client bundle leak | **Alta** | `.server.ts` + grep gate |

---

## Plano de implementação — micro-etapas

### Etapa 0 — Charter ✅ (este documento)

- [x] Storage strategy filesystem-first
- [x] Read/write/rollback strategy
- [x] Gate platform vs primitivo
- [x] Micro-etapas 1–6
- [ ] **GO humano explícito para código**

### Etapa 1 — Adapter port + filesystem backend ✅ @ `3e6c80e`

- `lib/runtime/storage/*` — `FileSystemStorageAdapter`, keys, parity
- Publication + external I/O wired via adapter
- Atomic write + backup-before-overwrite

### Etapa 2 — Storage consolidation pack ✅ (local)

- Namespace final inclui `external/{slug}/merged-preview`
- `resolveStorageKeyFromFilesystemPath` — path ↔ key unificado
- `merged-preview.ts` — read/write via adapter
- Gate dedicado `pnpm qa:appointment-storage`
- Parity storage removido de `qa:appointment-publication` (canonical no storage gate)

**Decisões Etapa 2:**

1. `merged-preview` entra no namespace external — mesmo root `data/runtime/appointment/external/`
2. Fixtures Google Places permanecem fora do namespace (repo fixtures, não runtime storage)
3. Scripts de parity (`publication/parity.ts`, `sync-parity.ts`) mantêm `fs` direto em temp dirs — isolamento explícito
4. `load-document` fallback `readFileSync` apenas para paths fora de `storageRoot`

**Comandos:**

```bash
pnpm qa:appointment-storage      # gate dedicado Etapa 2
pnpm qa:appointment-publication  # publication (sem storage duplicado)
pnpm qa:appointment-runtime      # runtime + external parity
```

**Riscos residuais Etapa 2:**

| Risco | Mitigação |
|-------|-----------|
| Parity scripts ainda usam `fs` em temp dirs | Aceito — isolamento test-only |
| Fixture paths fora do adapter | By design — não são runtime keys |
| SQLite Sprint 2 | Fora de escopo até GO explícito |

### Etapa 3 — Wire publication I/O (legado charter — absorvido Etapa 1)

- `load-document`, `promote`, `rollback` → adapter
- `qa:appointment-publication` verde
- Comportamento idêntico @ `a837064`

### Etapa 3 — Wire external-reality I/O

- `snapshot-cache`, `sync-report` → adapter
- `qa:appointment-runtime` verde (external parity inalterado)

### Etapa 4 — Read path optional consolidation

- Draft preview read via adapter (substituir fs direto)
- Live static import **preservado** default
- Wiring parity publication verde

### Etapa 5 — SQLite adapter (opcional)

- Single-file local; feature flag `APPOINTMENT_STORAGE_BACKEND=sqlite`
- Migration tool one-shot filesystem → sqlite
- Rollback para filesystem documentado

### Etapa 6 — Gates + runbook + WORKSTREAMS

- `qa:appointment-storage`
- Runbook §Storage operacional
- Gate de saída G1–G12
- WS-09A fechado

**Estimativa:** 3 PRs — (1) adapter + fs · (2) publication + external wire · (3) gates/runbook — SQLite Sprint 2 separado se necessário.

---

## Gate de saída WS-09A

| # | Critério | Verificação |
|---|----------|-------------|
| G1 | Storage adapter documentado e implementado | types + fs backend |
| G2 | Filesystem default; produto default inalterado | parity vs `a837064` |
| G3 | Publication draft/live/backup via adapter | promote/rollback smoke |
| G4 | External snapshot/sync-report via adapter | sync parity |
| G5 | Write CLI-only; zero HTTP auto-write | grep / review |
| G6 | Rollback trivial (backup + git) | runbook + smoke |
| G7 | Preview publication OFF default | WS-15A policy |
| G8 | External overlay OFF default | WS-16A policy |
| G9 | Server-only; zero client adapter import | grep gate |
| G10 | `qa:appointment-storage` PASS | CI/local |
| G11 | `qa:appointment-runtime` + `qa:appointment-publication` PASS | CI/local |
| G12 | Zero JSX/UI · zero auth/admin/ORM enterprise | diff scope |

---

## Runbook operacional (proposto)

### Política oficial

| Política | Valor |
|----------|-------|
| **Persistência** | Infra silenciosa — não backend visível |
| Backend default | `filesystem` |
| Live committed | `barba-negra.v1.json` — git source of truth |
| Writes | CLI explicit only |
| Auto-promote / CI write | **Proibido** (WS-15A) |
| Preview / overlay | OFF default (WS-15A / WS-16A) |

### Variáveis

| Variável | Default | Função |
|----------|---------|--------|
| `APPOINTMENT_STORAGE_BACKEND` | `filesystem` | Backend selector |
| `APPOINTMENT_STORAGE_ROOT` | `data/runtime/appointment` | Root path |
| `APPOINTMENT_PUBLICATION_PREVIEW` | unset | WS-15A — independente |
| `NEXT_PUBLIC_APPOINTMENT_EXTERNAL_REALITY` | OFF | WS-16A — independente |

### Rollback operacional

```bash
# Publication live
pnpm runtime:appointment:rollback -- --execute

# Live committed
git checkout -- data/runtime/appointment/barba-negra.v1.json

# External snapshot corrupto
rm data/runtime/appointment/external/barba-negra.snapshot.json
# overlay noop automático
```

---

## GO / NO-GO — começar código

### GO ✅ (recomendado — charter)

| Condição | Estado |
|----------|--------|
| WS-14A runtime wired | ✅ |
| WS-15A publication fechado | ✅ @ `a837064` |
| WS-16A external reality fechado | ✅ default OFF |
| Produto perceptivo congelado | ✅ @ `1c92acc` |
| I/O fragmentado identificado | ✅ |
| Escopo Appointment-only | ✅ este charter |
| Gate platform vs primitivo respondido | ✅ adapter + fs default |

**Veredicto:** **GO para implementação WS-09A** após aprovação explícita deste charter.

**Condicionantes:**

1. Sprint 1 = **filesystem adapter only** — SQLite Sprint 2 optional
2. Live static import **preservado** até gate explícito de migração
3. **Zero** Drizzle/Postgres/auth/admin neste WS
4. Writes permanecem **CLI-only**

### NO-GO ❌ (se)

- Drizzle migrations / Postgres / cloud DB
- Auth, permissions, multi-tenant
- Media API / upload pipeline
- Admin UI / storage dashboard
- Realtime / websocket sync
- Auto-write em request handlers
- Alteração perceptiva Tier 1
- Confundir WS-09A com reopen WS-09 enterprise db-media PR

---

## Decisão estratégica adjacente

```txt
WS-09A persistence primitiva  →  (este charter)
WS-09 legacy (Drizzle/Postgres/media)  →  permanece BLOCKED — ciclo separado
WS-17 editor perceptivo         →  após publication + storage maduros
WS-18 IA operacional            →  decisão deliberada
```

**Ordem recomendada pós-09A:** WS-18 (IA) **ou** WS-17 (editor) — **não** reopen WS-09 enterprise automaticamente.

---

## Registro

| Campo | Valor |
|-------|-------|
| Charter autor | Etapa 0 @ `a837064` · Etapa 0–1 @ `3e6c80e` · Etapa 2 local |
| Pilot slug | `barba-negra` |
| Modo | acelerado — filesystem-first |
| Implementação | Etapa 0–1 publicada · Etapa 2 pronta para commit |

*Persistence Primitive — adapter silencioso, não backend platform.*
