# WS-09A — Persistence Primitive: Appointment First

**Baseline técnico:** `origin/main` @ `67e41fe`  
**Pré-requisitos:** WS-14A ✅ · WS-15A ✅ @ `a837064` · WS-16A ✅ · WS-09A Etapas 0–2 ✅ @ `67e41fe`  
**Baseline produto perceptivo:** `1c92acc` (inalterado)  
**Classificação:** camada operacional de persistência mínima — **não** backend platform  
**Status:** ✅ **FECHADO** @ Etapa 3 (`67e41fe` + docs fechamento) — filesystem-first · SQLite **BLOCKED**  
**Relação:** unifica I/O server-side de WS-14A/15A/16A; **não substitui** WS-17 (editor) · **próximo ciclo recomendado:** WS-18A (IA operacional mínima)

---

## Pergunta gate (Etapa 3 — fechamento)

```txt
a persistência já é suficiente para destravar operação
ou ainda estamos perseguindo infraestrutura perfeita?
```

**Resposta:** **Suficiente para destravar operação.** Adapter único, namespace fechado, gates verdes, writes CLI-only — publication, external sync e rollback operam sem SQLite. Perseguir SQLite agora seria **infraestrutura perfeita prematura**, não destrave operacional.

---

## Pergunta gate (charter original)

```txt
isso é persistência operacional mínima
ou backend platform prematuro?
```

**Resposta:** persistência operacional mínima — **storage adapter server-only** que formaliza read/write JSON existentes. Confirmado pós-implementação @ `67e41fe`.

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
- filesystem permanece **único backend** (SQLite **BLOCKED** até GO explícito separado)
- rollback continua **trivial** (backup file + git checkout live committed)
- produto default **inalterado** — adapter é infra silenciosa

---

## Estado entregue (pós Etapas 0–2 @ `67e41fe`)

| Domínio | Persistência | Implementação |
|---------|--------------|---------------|
| Live runtime | `runtime/{slug}/live` | `FileSystemStorageAdapter` + static import default |
| Draft publication | `runtime/{slug}/draft` | adapter via `publication/*` |
| Backups publication | `runtime/{slug}/backup/{ts}` | adapter backup/restore + `list()` |
| External snapshot | `external/{slug}/snapshot` | `snapshot-cache.ts` |
| External sync report | `external/{slug}/sync-report` | `sync-report.ts` |
| External merged preview | `external/{slug}/merged-preview` | `merged-preview.ts` |
| Read path produto | mock \| runtime + overlays opt-in | **inalterado** @ `1c92acc` |
| Write path | CLI publication + CLI external sync | **adapter único** — CLI-only |

**Gap original (fragmentação I/O):** ✅ **fechado** — `lib/runtime/storage/*` + wiring publication/external.

**WS-09 legacy (enterprise):** Drizzle/Postgres/media API — permanece **BLOCKED** · WS-09A ≠ reopen WS-09.

---

## Escopo

### Incluído

1. **Storage adapter simples** — interface `read` / `write` / `exists` / `backup` server-only
2. **Read/write runtime** — live bundle via adapter (fallback import estático preservado Sprint 1)
3. **Persistência draft/live** — publication domain keys; promote/rollback via adapter
4. **Persistência external snapshots** — snapshot + sync-report via adapter
5. **Filesystem-only** — `FileSystemStorageAdapter` único backend implementado
6. ~~SQLite simples (opcional Sprint 2)~~ — **BLOCKED** · ver §Decisão SQLite
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
filesystem-first  →  adapter port  →  (BLOCKED) SQLite local
```

**Entregue:** `FileSystemStorageAdapter` @ `lib/runtime/storage/*` — comportamento default inalterado; I/O operacional unificado.

**SQLite:** **não iniciado** · **BLOCKED** até GO explícito em ciclo separado (ver §Decisão SQLite).

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

### Interface implementada

```ts
// lib/runtime/storage/types.ts + filesystem-adapter.ts

interface RuntimeStorageAdapter {
  exists(key: string): boolean
  readJson<T>(key: string): StorageReadResult<T>
  writeJson<T>(key: string, data: T, options?: StorageWriteOptions): StorageWriteResult
  delete(key: string): StorageDeleteResult
  list(prefix: string): string[]
  resolvePath(key: string): string
  backup(sourceKey: string, backupKey: string): StorageBackupResult
  restore(backupKey: string, targetKey: string, options?: { dryRun?: boolean }): StorageWriteResult
}
```

Entry point: `getFilesystemStorage(rootDir?)` · keys: `lib/runtime/storage/keys.ts`

**Regras:**

1. Adapter **server-only** — nunca importado em client bundle
2. **Sync API** OK no Sprint 1 (fs local); async reservado para SQLite/network futuro
3. **Validate before write** — publication + external schemas existentes
4. **Backup before overwrite** quando `backup: true`
5. **Static import fallback** para live committed — produto default não depende de fs runtime em build

### Seleção de backend

| Variável | Default | Função |
|----------|---------|--------|
| `APPOINTMENT_STORAGE_BACKEND` | `filesystem` | **Único backend implementado** — SQLite não existe no codebase |
| Root operacional | `data/runtime/appointment` | Via `resolveAppointmentStorageRoot(rootDir)` |

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

## Arquivos entregues

### Implementados @ `3e6c80e`–`67e41fe`

| Path | Papel |
|------|-------|
| `lib/runtime/storage/types.ts` | `RuntimeStorageAdapter` interface |
| `lib/runtime/storage/keys.ts` | Key ↔ path mapping + `resolveStorageKeyFromFilesystemPath` |
| `lib/runtime/storage/filesystem-adapter.ts` | Filesystem backend (atomic write, backup) |
| `lib/runtime/storage/resolve-storage.server.ts` | `getFilesystemStorage()` |
| `lib/runtime/storage/parity.ts` | Core adapter round-trip |
| `lib/runtime/storage/gate.ts` | Gate integrado (core + publication + external) |
| `lib/runtime/storage/index.ts` | Public exports |
| `lib/runtime/appointment/publication/*` | Draft/live/backup via adapter |
| `lib/runtime/appointment/external-reality/snapshot-cache.ts` | Snapshot via adapter |
| `lib/runtime/appointment/external-reality/sync-report.ts` | Sync report via adapter |
| `lib/runtime/appointment/external-reality/merged-preview.ts` | Merged preview via adapter |
| `scripts/runtime/appointment-storage-smoke.mjs` | Gate `qa:appointment-storage` |

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

### Etapa 0 — Charter ✅ @ `3e6c80e`

- [x] Storage strategy filesystem-first
- [x] Read/write/rollback strategy
- [x] Gate platform vs primitivo

### Etapa 1 — FileSystem Storage Adapter ✅ @ `3e6c80e`

- [x] `lib/runtime/storage/*` — adapter, keys, parity
- [x] Publication + external I/O wired
- [x] Atomic write + backup-before-overwrite

### Etapa 2 — Storage consolidation pack ✅ @ `67e41fe`

- [x] Namespace final inclui `external/{slug}/merged-preview`
- [x] `resolveStorageKeyFromFilesystemPath` — path ↔ key unificado
- [x] Gate dedicado `pnpm qa:appointment-storage`

### Etapa 3 — Fechamento sem SQLite ✅ (este commit)

- [x] Runbook operacional finalizado (§ abaixo)
- [x] Gate de saída G1–G12 verificado
- [x] Usos `fs` remanescentes documentados
- [x] Decisão SQLite: **BLOCKED**
- [x] WORKSTREAMS.md atualizado
- [x] **WS-09A oficialmente fechado**

### Não entregue (deliberado)

| Item | Status |
|------|--------|
| SQLite adapter | **BLOCKED** — GO explícito separado |
| WS-09 enterprise (Drizzle/Postgres) | **BLOCKED** — ciclo separado |
| Editor (WS-17) | Ciclo futuro |
| IA operacional (WS-18A) | **Próximo ciclo recomendado** |

---

## Gate de saída WS-09A — ✅ TODOS VERIFICADOS @ `67e41fe`

| # | Critério | Verificação |
|---|----------|-------------|
| G1 | Storage adapter documentado e implementado | ✅ `lib/runtime/storage/*` |
| G2 | Filesystem default; produto default inalterado | ✅ gates perceptivos @ `1c92acc` |
| G3 | Publication draft/live/backup via adapter | ✅ `qa:appointment-storage` + publication |
| G4 | External snapshot/sync-report/merged-preview via adapter | ✅ storage gate external block |
| G5 | Write CLI-only; zero HTTP auto-write | ✅ review |
| G6 | Rollback trivial (backup + git) | ✅ runbook + smoke |
| G7 | Preview publication OFF default | ✅ WS-15A policy |
| G8 | External overlay OFF default | ✅ WS-16A policy |
| G9 | Server-only; zero client adapter import | ✅ grep gate |
| G10 | `qa:appointment-storage` PASS | ✅ CI/local |
| G11 | `qa:appointment-runtime` + `qa:appointment-publication` PASS | ✅ CI/local |
| G12 | Zero JSX/UI · zero auth/admin/ORM enterprise | ✅ diff scope |

---

## Runbook operacional

### Comandos de validação

```bash
pnpm qa:appointment-storage      # gate dedicado — core + publication + external
pnpm qa:appointment-publication  # publication draft/promote/rollback
pnpm qa:appointment-runtime      # runtime + external parity
pnpm qa:appointment              # perceptual 8/8
pnpm qa:events                   # eventos passivos
```

### CLI operacional (writes)

```bash
pnpm runtime:appointment:draft-init
pnpm runtime:appointment:draft-validate
pnpm runtime:appointment:promote -- --execute
pnpm runtime:appointment:rollback -- --execute
pnpm runtime:appointment:sync-external
```

### Política oficial

| Política | Valor |
|----------|-------|
| **Persistência** | Infra silenciosa — adapter filesystem-only |
| Backend | **`filesystem` único** — SQLite não implementado |
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

---

## Usos `fs` remanescentes (aceitos)

| Local | Uso | Justificativa |
|-------|-----|---------------|
| `lib/runtime/storage/filesystem-adapter.ts` | read/write/rename/copy | **Implementação única** do adapter |
| `lib/runtime/storage/keys.ts` | `readdirSync` (backups) | Listagem de backup keys |
| `lib/runtime/storage/parity.ts` | `readFileSync` pós dry-run | Assert atômico em teste isolado |
| `publication/load-document.ts` | fallback `readFileSync` | Paths fora de `storageRoot` (parity temp) |
| `publication/rollback.ts` | `existsSync(to)` | Backup path absoluto legado CLI |
| `sync-external-reality.ts` | `readFileSync(fixture)` | Fixture Google Places — fora do namespace |
| `*-parity.ts` | seed/assert temp dirs | Test-only — isolamento explícito |

**Política:** novo I/O operacional runtime/publication/external → **adapter only**. `fs` direto permitido apenas nos casos acima.

---

## Decisão SQLite

| Decisão | Valor |
|---------|-------|
| SQLite adapter | **BLOCKED** — não iniciado neste WS |
| Condição de reopen | GO humano explícito + charter separado |
| Motivo do block | Persistência já destrava publication + external + rollback; SQLite = infra adicional sem necessidade operacional imediata |
| WS-09 enterprise | Permanece **BLOCKED** — Drizzle/Postgres/media API |

---

## Decisão estratégica — pós-fechamento

```txt
WS-09A persistence primitiva     →  ✅ FECHADO @ 67e41fe
WS-09 legacy (Drizzle/Postgres)    →  BLOCKED — ciclo separado
SQLite local                       →  BLOCKED — GO explícito separado
WS-18A IA operacional mínima       →  ⭐ PRÓXIMO CICLO RECOMENDADO
WS-17 editor perceptivo            →  alternativa deliberada pós-WS-18A ou paralelo
```

**Rationale:** Runtime + publication + external + storage maduros — destrave natural é **IA operacional** (adaptação server-side) sem abrir editor ou backend platform.

---

## GO / NO-GO — fechamento WS-09A

### GO ✅ FECHADO

| Condição | Estado |
|----------|--------|
| Adapter filesystem implementado | ✅ @ `3e6c80e` |
| Namespace final fechado | ✅ @ `67e41fe` |
| Gate `qa:appointment-storage` | ✅ |
| Gates perceptivos verdes | ✅ |
| Produto @ `1c92acc` inalterado | ✅ |
| SQLite não iniciado | ✅ BLOCKED |

### NO-GO ❌ (permanece)

- SQLite / Drizzle / Postgres sem GO separado
- Auth, permissions, multi-tenant
- Auto-write em request handlers
- Alteração perceptiva Tier 1

---

## Registro

| Campo | Valor |
|-------|-------|
| Charter | Etapa 0 @ `a837064` |
| Implementação | Etapa 1 @ `3e6c80e` · Etapa 2 @ `67e41fe` |
| Fechamento | Etapa 3 @ docs (pós-`67e41fe`) |
| Pilot slug | `barba-negra` |
| Modo | acelerado — filesystem-first |
| Status final | ✅ **WS-09A FECHADO** |

*Persistence Primitive — adapter silencioso, não backend platform. Suficiente para destravar operação.*
