# Handoff Operacional — Social Landing

**Data:** 2026-06-03 (atualizado pós WS-13 Etapa 1 + WS-18A)
**Baseline remoto:** `origin/main` @ `702d00c` (WS-08D V1 + V2/Detour design · V1.1 spec)  
**Tipo:** Baseline consolidado · estado atual · sem propostas de feature  
**Autoridade:** Registrar contexto para próxima conversa — não reabrir filosofia congelada  
**WS-18A runbook canônico:** [`WS-18A_ETAPA_4_OPERATIONAL_CLOSURE.md`](WS-18A_ETAPA_4_OPERATIONAL_CLOSURE.md)

---

## 1. Baseline atual (hashes relevantes)

| Âncora | Hash | Significado |
|--------|------|-------------|
| **`origin/main` (publicado)** | `23fec61` | HEAD remoto · CI verde (QA Minimum) |
| **CI fix client bundle** | `fdb9e68` | `node:fs` leak corrigido · dev server `/demo` OK |
| **WS-18A Etapa 1** | `e64912c` | Operational AI primitives (fixture-only) |
| **WS-18A Etapa 0 charter** | `31c9b78` | `WS-18A_OPERATIONAL_AI_MINIMUM.md` |
| **WS-09A fechado** | `0b14eb7` (docs) · `67e41fe` (código) | Persistence filesystem · SQLite BLOCKED |
| **WS-15A publication** | `141c263` · docs `a837064` | draft/live CLI · preview OFF |
| **WS-16A external reality** | `d9c4f3e` | overlay opt-in · default OFF |
| **WS-14A runtime wired** | `1c92acc` | Feed Appointment → runtime layer |
| **Runtime seed** | `30a91ea` | `barba-negra.v1.json` store |
| **Produto perceptivo freeze** | `1c92acc` | Tier 1 · feed/composer/morph/drawer — INTOCADOS por política operacional |
| **Era 3 cognitiva (resolvers)** | `ca00dc7` (WS-08C) | Composer conversacional mock · camada separada |

### Estado remoto

| Estado | Detalhe |
|--------|---------|
| **`origin/main`** | `bf76278` — WS-18A fechada · hero higiene · WS-13 docs locais pendentes commit |
| **Untracked opcional** | Proxy WS-13 (`session-b-captures/`, `ws13b-observation-log.json`, `WS-13_SESSION_B_OBSERVATION_REPORT.md`) |
| **Não commitar** | `data/runtime/external/` · `.next/` · `next-env.d.ts` |

---

## 2. Workstreams concluídas (registro operacional)

### Infra / QA / TypeScript
| WS | Status | Hash ref |
|----|--------|----------|
| WS-01 Operational Hygiene | ✅ | PR #54 |
| WS-02 PR52 Validation | ✅ | `673395d` |
| WS-02.5 Runtime Baseline | ✅ | `ffcb548` |
| WS-04 CI Minimum | ✅ | `a30d0c5` |
| WS-05 TS Gate | ✅ | `f506030` |
| WS-05.5 TS Stabilization | ✅ | `9d467f1` |
| WS-07.6 TS Final Peel | ✅ | `47af7ff` — baseline 0 · `ignoreBuildErrors` off |
| WS-07.7 Stack B Cleanup | ✅ | `cd00647` |

### Stack Convergence (drawers)
| WS | Status | Hash ref |
|----|--------|----------|
| WS-06 Influencer ActionDrawer | ✅ | `6fe2b88` |
| WS-07 Institutional ActionDrawer | ✅ | `1b64b8f` |

### Era 3 — AI Resolvers (client mock · demo)
| WS | Status | Hash ref |
|----|--------|----------|
| WS-08A Restaurant | ✅ | `4f1f57f` |
| WS-08B Health | ✅ | `41b4ff7` |
| WS-08.5–08.8 Governance/Regression | ✅ | `9bc2a6c` … `ecc93dc` |
| WS-08C Appointment resolver | ✅ | `ca00dc7` — **congelado · transacional** |
| WS-08D V1 establishment dialogue | ✅ | `10b36c7` — PR #77 · `[2]→[1]→[3]` · AP-D01…14 |
| WS-08D V1.1 zona cinza | 🟢 spec / 🟡 impl. | [`WS-08D_V1_1_GRAY_ZONE_SPEC.md`](WS-08D_V1_1_GRAY_ZONE_SPEC.md) — AP-D15…25 · sem código até GO explícito |
| WS-08D V2 Conversation Kernel | 🟢 design / 🔴 código | [`WS-08D_V2_CONVERSATION_KERNEL.md`](WS-08D_V2_CONVERSATION_KERNEL.md) — após V1.1 recomendado |

### Era 4 — Appointment operacional (server)
| WS | Status | Hash ref |
|----|--------|----------|
| WS-09B→09D.1 Hero + chegada contextual | ✅ | `24394e9` |
| WS-10 Etapas 1–3 perceptual language | ✅ | `PERCEPTUAL_LANGUAGE_SYSTEM.md` |
| WS-11 Arrival scroll continuity | ✅ | gate §8 |
| WS-12 Drawer physical continuity | ✅ | + WS-12.1 |
| WS-14A Living Runtime Foundation | ✅ | `1c92acc` (wire) · `30a91ea` (seed) |
| WS-15A Publication Primitive | ✅ | `141c263` |
| WS-16A External Reality Minimum | ✅ | `d9c4f3e` |
| WS-09A Persistence Primitive | ✅ **FECHADO** | `67e41fe` · SQLite BLOCKED |
| WS-18A Operational AI | ✅ **FECHADO** | `31c9b78`/`e64912c`/`23fec61` + Etapa 3 LLM · Etapa 4 runbook [`WS-18A_ETAPA_4_OPERATIONAL_CLOSURE.md`](WS-18A_ETAPA_4_OPERATIONAL_CLOSURE.md) |

### Ativos / observacionais (não fechados)
| WS | Status |
|----|--------|
| WS-03 Stack A Parity | 🔴 Blocked (gaps menores) |
| WS-10 | 🟡 Observational hardening (macro) |
| WS-13 Presença contínua | ✅ **Etapa 1 FECHADA** · Sessão B humana @ `eaf5701` · [`WS-13_ETAPA_1_HUMAN_CLOSURE.md`](WS-13_ETAPA_1_HUMAN_CLOSURE.md) |
| WS-08D | ✅ V1 · 🟢 V1.1 spec · V2 design · **V2 impl. NO-GO** · próximo: `GO implementação V1.1` |
| WS-09 DB enterprise | 🔴 BLOCKED |

---

## 3. Runtime architecture (Appointment)

**Piloto:** `barba-negra` · slug único operacional

```txt
AppointmentRuntimeBundle (schema v1)
  ├── meta (source, slug, updatedAt, publication?, external?)
  ├── operational · arrival · establishment · professionals · services · styles
  └── feed (stories, sections)

Read path produto (client-safe):
  appointment-feed.tsx
    → appointment-feed-data.ts
      → load-feed.ts (SEM overlay/draft/server fs)
        → mock | runtime-store seed (JSON estático)

Read path servidor (overlay/draft):
  load.server.ts
    → overlay opt-in · draft preview opt-in

Modos:
  NEXT_PUBLIC_APPOINTMENT_RUNTIME=mock   (default dev)
  NEXT_PUBLIC_APPOINTMENT_RUNTIME=runtime (seed JSON)
```

**Arquivos núcleo:** `lib/runtime/appointment/`  
**Seed committed:** `data/runtime/appointment/barba-negra.v1.json`  
**Projeção legacy:** `legacy-projection.ts` → tipos consumidos pelo feed  
**Gates:** `pnpm qa:appointment-runtime` · `runtime-parity.ts` · `parity-checks.ts`

---

## 4. Publication architecture

**Política:** infra silenciosa · preview OFF default · promote manual only

```txt
live:   runtime/{slug}/live   → {slug}.v1.json
draft:  runtime/{slug}/draft  → {slug}.draft.json
backup: runtime/{slug}/backup/{timestamp} → backups/*.backup.json

Fluxo operador:
  draft-init → draft-validate → [preview opt-in] → promote --execute → [rollback]
```

| `derivedFrom` | Origem |
|---------------|--------|
| `live` | draft-init from live |
| `mock-adapter` | draft-init --from-mock |
| `manual` | operador |
| `ai` | operational AI (Etapa 2+) |

**Módulo:** `lib/runtime/appointment/publication/`  
**CLIs:** `runtime:appointment:draft-init|draft-validate|promote|rollback`  
**Gate:** `pnpm qa:appointment-publication`  
**Preview:** `APPOINTMENT_PUBLICATION_PREVIEW=draft` (server-only · default OFF)

**Proibido irreversível:** auto-promote · auto-publish · write IA em live

---

## 5. Persistence architecture (WS-09A)

**Classificação:** persistência operacional mínima · **não** backend platform

```txt
FileSystemStorageAdapter (server-only)
  storageRoot: data/runtime/appointment/

Namespace keys:
  runtime/{slug}/live
  runtime/{slug}/draft
  runtime/{slug}/backup/{timestamp}
  external/{slug}/snapshot
  external/{slug}/sync-report
  external/{slug}/merged-preview
```

**Módulo:** `lib/runtime/storage/`  
**Porta única:** `getFilesystemStorage()` · `writeJson` / `readJson` · dryRun · atomic · backup-on-live-promote  
**Gate:** `pnpm qa:appointment-storage`  
**SQLite / Drizzle / Postgres:** BLOCKED até GO humano explícito (WS-09 enterprise separado)

**Decisão fechada:** filesystem-first é suficiente para operação Appointment; perseguir DB agora = infra prematura.

---

## 6. External Reality architecture (WS-16A)

**Política:** opt-in · default OFF · enrichment editorial bounded

```txt
Google Places (server) → snapshot → sync-report
  → merge editorial (max 3 reviews)
  → overlay opt-in no runtime read (server)
  → merged-preview (storage namespace)
```

**Env:** `NEXT_PUBLIC_APPOINTMENT_EXTERNAL_REALITY=1` (OFF default)  
**CLI:** `runtime:appointment:sync-external`  
**Módulo:** `lib/runtime/appointment/external-reality/`  
**Gate build:** `pnpm qa:appointment-runtime-overlay-build`  
**Integrado em:** `qa:appointment-runtime` (overlay parity)

**Não confundir com:** operational AI · WS-08C composer · Maps embed · default-on overlay

---

## 7. Operational AI architecture (WS-18A)

**Classificação:** adaptação operacional server-only · **não** chat · **não** agente autônomo

### Três camadas de IA (boundaries fechados)

| Camada | Onde | Status |
|--------|------|--------|
| **Tier 1 produto** | feed · composer · morph · drawer @ `1c92acc` | 🔴 Frozen |
| **WS-08C composer resolver** | client mock · `appointment-conversational-search` | ✅ Concluído · isolado |
| **WS-18A operational AI** | server · draft-only | ✅ FECHADO · fixture default · LLM opt-in · runbook Etapa 4 |

### Pipeline (publicado até Etapa 2 @ `23fec61`)

```txt
live bundle (read)
  → generateOperationalAiFixture (7 primitives P-01…P-07)
  → mergeOperationalPatch + attachOperationalDraftMeta (derivedFrom: ai)
  → validateOperationalAiOutput + validateAppointmentDraftBundle
  → writeOperationalAiDraft (dry-run default)
  → runtime/{slug}/draft ONLY
```

### Pipeline Etapa 3 (provider + parser)

```txt
resolveOperationalAiProvider()
  fixture (default) | llm (APPOINTMENT_AI_PROVIDER=llm + API key)
  → generatePatch → parse-output (envelope { patch } only)
  → same validate + draft write path
```

**Módulo:** `lib/runtime/appointment/operational-ai/`  
**CLI:** `pnpm runtime:appointment:ai-draft` (--execute · --force)  
**Gate:** `pnpm qa:appointment-ai-operational`

**Regra principal (irreversível):** IA propõe draft · nunca publica · LLM = motor de patch · não agente de produto

---

## 8. Gates e QA existentes

### CI GitHub (WS-04)
| Workflow | Conteúdo |
|----------|----------|
| `qa-minimum.yml` | `pnpm build` · `pnpm ts:budget` · dev server · `pnpm qa:events` 8/8 |

**Não no CI:** `qa:appointment*` · `qa:appointment-runtime` · publication · storage · operational AI — rodar localmente pré-commit.

### Appointment operacional (local obrigatório pré-merge WS-18A+)
| Script | Função |
|--------|--------|
| `pnpm typecheck` | TS strict |
| `pnpm qa:appointment-ai-operational` | primitives + parser + draft round-trip |
| `pnpm qa:appointment-storage` | adapter + publication integration |
| `pnpm qa:appointment-publication` | draft/live parity |
| `pnpm qa:appointment-runtime` | external + overlay + runtime store |
| `pnpm qa:appointment` | perceptual 8/8 (dev server) |
| `pnpm qa:events` | passive events 8/8 (dev server) |

### Resolvers multi-vertical (Era 3 · separados)
`pnpm qa:restaurant` · `qa:health` · `qa:appointment` (composer) · `qa:ai-regression` · `qa:ai-observation`

### Runtime CLIs
| CLI | Função |
|-----|--------|
| `runtime:appointment:seed` | Gerar seed |
| `runtime:appointment:sync-external` | Snapshot externo |
| `runtime:appointment:draft-init` | Draft from live/mock |
| `runtime:appointment:draft-validate` | Validar draft |
| `runtime:appointment:promote` | dry-run default · `--execute` |
| `runtime:appointment:rollback` | Rollback live |
| `runtime:appointment:ai-draft` | Operational AI draft (Etapa 2+) |

---

## 9. Áreas congeladas

| Zona | Âncora | Paths representativos |
|------|--------|------------------------|
| **Produto perceptivo Tier 1** | `1c92acc` | feeds appointment, composer, morph, drawer physics |
| **ActionDrawer core** | FREEZE_ZONES | `action-drawer.tsx`, drag chrome, layout |
| **Morph runtime** | FREEZE_ZONES | `post-to-chat-morph-layer.tsx`, timings 480/420ms |
| **Composer core** | FREEZE_ZONES | `conversational-ai.tsx`, clearance, overlay |
| **WS-08C Appointment resolver** | `ca00dc7` | mock client · não wire LLM operacional aqui |
| **Overlay external default** | WS-16A | OFF até Sessão B humana |
| **Publication preview default** | WS-15A | OFF |
| **Operational AI default provider** | WS-18A | `fixture` · CI sem API key |

---

## 10. Áreas bloqueadas

| Item | Razão |
|------|-------|
| **WS-09 enterprise (Drizzle/Postgres/media API)** | GO humano separado · contamina runtime |
| **WS-09A SQLite backend** | BLOCKED pós-fechamento @ `0b14eb7` |
| **WS-03 Stack A parity** | Gaps menores · não gate crítico Appointment |
| **WS-17 Editor perceptivo** | Superfície futura · não confundir com WS-18A |
| **Auto-promote / auto-publish** | WS-15A policy |
| **IA write em live** | adapter + operational AI guard |
| **Client bundle server modules** | `node:fs` leak class · corrigido @ `fdb9e68` |
| **Default-on external overlay** | WS-16A até evidência humana |
| **Chatbot / agent loop / multi-agent** | Fora charter WS-18A |
| **Layout generation / new section kinds** | Quebra projection + morph |

---

## 11. Riscos conhecidos

| ID | Risco | Severidade | Estado |
|----|-------|------------|--------|
| R-01 | Etapa 3 hash não confirmado em `origin/main` | Alta | Verificar push · registar hash |
| R-02 | `WORKSTREAMS.md` WS-18A | Média | ✅ Fechado Etapa 4 |
| R-03 | WS-13 Etapa 1 fechada — promoção overlay ainda condicionada WS-16A | Baixa | Sessão B ✅ |
| R-04 | LLM nondeterminismo (Etapa 3) — mitigado por parser+validate | Média | Controlado se gated |
| R-05 | Confundir WS-08C composer com WS-18A operational | Alta | Boundary documentado |
| R-06 | `meta.ai` não persistido no JSON do draft | Baixa | Envelope-only |
| R-07 | Untracked `data/runtime/appointment/external/` local | Baixa | Não commitar acidentalmente |
| R-08 | CI não cobre gates appointment — regressão silenciosa possível | Média | Aceito · protocolo local |
| R-09 | WS-03 parity gaps outras verticais | Baixa | Paralelo |

---

## 12. Decisões irreversíveis (não rediscutir)

1. **Appointment-first** para runtime operacional — não multi-vertical neste ciclo.
2. **Produto perceptivo @ `1c92acc` intocado** por infra/IA/publication/storage.
3. **Publication = draft/live manual** — preview OFF · promote `--execute` only.
4. **External reality OFF default** — opt-in explícito.
5. **Persistence = filesystem adapter** — SQLite BLOCKED até GO separado.
6. **WS-08C permanece isolado** — resolver conversacional client mock ≠ operational AI server.
7. **Operational AI escreve só `runtime/{slug}/draft`** com `derivedFrom: ai`.
8. **IA nunca publica** — sem auto-promote · sem live write.
9. **CI mínimo = build + ts:budget + qa:events** — não expandir escopo sem WS dedicado.
10. **Client feed path sem `node:fs`** — `load-feed.ts` separado de `load.server.ts` (@ `fdb9e68`).

---

## 13. Próximas decisões estratégicas (ordenadas por prioridade)

| # | Decisão | Condição |
|---|---------|----------|
| 1 | **Commit + push WS-18A Etapa 3** (se ainda local) | Gates locais · escopo `operational-ai/` isolado |
| 2 | **Commit docs WS-18A Etapa 4** | `WS-18A_ETAPA_4_*` · charter · WORKSTREAMS · este handoff |
| 3 | ~~WS-13 Sessão B~~ ✅ · deliberar **WS-17** (GO humano) | Não implementar WS-17 automaticamente |
| 4 | **Promover draft IA/manual para live** (operador) | Após review · `promote --execute` |
| 5 | **WS-17 vs continuação WS-18A** (editor vs mais primitives) | GO humano · não automático |
| 6 | **WS-09 enterprise** | BLOCKED — GO humano explícito apenas |
| 7 | **WS-03 Stack A parity** | Paralelo · baixa prioridade Appointment |
| 8 | **Expandir CI com appointment gates** | WS dedicado · não ad-hoc |

---

## 14. O que NÃO deve ser reconstruído ou rediscutido

- Arquitetura Tier 1 feed/composer/morph/drawer @ `1c92acc`
- Separação WS-08C (composer mock) vs WS-18A (operational server)
- Namespace storage WS-09A e keys `runtime/*` + `external/*`
- Publication draft/live/backup semantics WS-15A
- External reality opt-in WS-16A
- Filesystem-first sem SQLite (WS-09A fechamento)
- Fixture como default operational AI provider em CI
- Dry-run default em promote e ai-draft
- Peel protocol / um WS por branch
- TS strict baseline 0 (WS-07.6)
- ActionDrawer como stack único pós-Era 2 (Stack B removido)
- Charter anti-patterns: chatbot · agent loop · auto-publish · UI IA · layout gen

---

## 15. Estado de maturidade do produto

| Dimensão | Maturidade | Nota |
|----------|------------|------|
| **Percepção / presença (Tier 1)** | Alta · congelada | @ `1c92acc` · WS-10/11/12/13 observação |
| **Convergência drawers (Era 2)** | Alta | Stack A instrumentado · influencer/institutional ✅ |
| **AI demo conversacional (Era 3)** | Média-alta | 4 verticais + appointment 8/8 · mock only |
| **Runtime vivo Appointment (Era 4)** | Média-alta | Wire + seed + modes · piloto único |
| **Publication operacional** | Alta | CLI completo · gates verdes |
| **Persistência operacional** | Alta · fechada | WS-09A ✅ · enterprise BLOCKED |
| **External reality** | Média | Implementado · default OFF · promoção condicionada |
| **Operational AI** | Baixa | WS-18A ✅ fechado · LLM opt-in operador |
| **CI/CD** | Média | Minimum green · appointment gates locais |
| **Multi-vertical runtime** | Baixa | Appointment only |
| **Backend platform** | Não iniciado | BLOCKED |

### Síntese operacional

```txt
Produto perceptivo: maduro e congelado (@ 1c92acc)
Infra Appointment: madura o suficiente para operação diária (runtime + publication + storage + external)
IA operacional: WS-18A fechado (fixture + LLM opt-in + runbook)
Próximo passo operacional típico: review/promote draft manual · **deliberar WS-17** (charter) · WS-09 enterprise BLOCKED
```

---

## Referências canônicas

| Documento | Path |
|-----------|------|
| Workstreams | `docs/os/WORKSTREAMS.md` |
| Freeze zones | `docs/os/FREEZE_ZONES.md` |
| WS-09A Persistence | `docs/audit/WS-09A_PERSISTENCE_PRIMITIVE.md` |
| WS-14A Runtime | `docs/audit/WS-14A_LIVING_RUNTIME_FOUNDATION.md` |
| WS-15A Publication | `docs/audit/WS-15A_PUBLICATION_PRIMITIVE.md` |
| WS-16A External | `docs/audit/WS-16A_EXTERNAL_REALITY_MINIMUM.md` |
| WS-18A Operational AI | `docs/audit/WS-18A_OPERATIONAL_AI_MINIMUM.md` · `docs/audit/WS-18A_ETAPA_4_OPERATIONAL_CLOSURE.md` |
| WS-13 Presença contínua | `docs/audit/WS-13_PRESENCA_CONTINUA_OBSERVACIONAL.md` · `docs/audit/WS-13_ETAPA_1_HUMAN_CLOSURE.md` |
| WS-17 candidato | `docs/audit/WS-17_CANDIDATE_COMPOSER_PAGE_PHYSICS.md` (sem implementação) |
| Perceptual language | `docs/os/PERCEPTUAL_LANGUAGE_SYSTEM.md` |
| CI strategy | `docs/audit/CI_MINIMUM_STRATEGY.md` |

---

*Handoff atualizado pós WS-18A Etapa 4 (docs). Baseline remoto `23fec61`; confirmar push Etapa 3 código. Não propõe features. Não reavalia filosofia.*
