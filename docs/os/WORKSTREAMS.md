# Workstreams — Social Landing

**Autoridade:** Este documento  
**Versão:** 2.0  
**Data:** 2026-05-24  
**Extensão:** [`docs/audit/WORKSTREAM_ISOLATION_PLAN.md`](../audit/WORKSTREAM_ISOLATION_PLAN.md), [`MASTER_ROADMAP.md`](MASTER_ROADMAP.md)

---

## Princípios invioláveis

1. **Um workstream por branch.** Nunca misturar vertical + infra + docs + runtime na mesma PR.
2. Branches nascem de **`origin/main` limpo** — nunca de árvore suja local.
3. **Nomenclatura:** `workstream/<nome>`, `docs/<pacote>`, `chore/<infra>`, `fix/<escopo>`.
4. Cada WS encerra com registro em [`VALIDATION_PROTOCOL.md`](VALIDATION_PROTOCOL.md).

---

## Trilhas ativas (WS-01 → WS-09)

### WS-01 — Operational Hygiene

| Campo | Valor |
|-------|-------|
| **Era** | 1 — Operational Hygiene |
| **Status** | ✅ Concluído (PR #54 merged) |
| **Objetivo** | Árvore limpa; WIPs isolados; docs deduplicados |
| **Escopo** | Peel dirty tree, dedupe `docs/audit/* 2.md`, inventário WIP |
| **Fora de escopo** | Runtime, componentes, lib |
| **Branch sugerida** | `chore/operational-hygiene` |
| **Gate de saída** | Cada WIP tem branch ou decisão de discard documentada |
| **Refs** | `docs/audit/DIRTY_TREE_TRIAGE.md`, `WORKSTREAM_ISOLATION_PLAN.md` |

---

### WS-02 — PR52 Merge Validation

| Campo | Valor |
|-------|-------|
| **Era** | 2 — Stack Convergence |
| **Status** | ✅ Concluído — PR #52 merged @ `673395d` |
| **Objetivo** | Merge PR #52 na `main` com evidência perceptual |
| **Escopo** | Test plan PR #52, merge, sign-off manual |
| **Gate de saída** | PR mergeado — ver `WS-02_PR52_VALIDATION_REPORT.md` |
| **Refs** | GitHub PR #52, `docs/audit/WS-02_PR52_VALIDATION_REPORT.md` |

---

### WS-02.5 — Runtime Stabilization Snapshot

| Campo | Valor |
|-------|-------|
| **Era** | 2 — Stack Convergence (baseline) |
| **Status** | ✅ Concluído — PR #55 merged @ `ffcb548` |
| **Objetivo** | Baseline oficial Tier 1 pós-convergência |
| **Escopo** | `docs/runtime/*` completo (8 docs) |
| **Gate de saída** | Baseline publicado; `qa:events` 8/8 via CI WS-04 ou local |
| **Refs** | [`docs/runtime/README.md`](../runtime/README.md) |

---

### WS-03 — Stack A Parity

| Campo | Valor |
|-------|-------|
| **Era** | 2 — Stack Convergence |
| **Status** | 🔴 Blocked até WS-05 recomendado; gaps menores only |
| **Objetivo** | Paridade checkout/composer nas verticais Stack A restantes |
| **Escopo** | Restaurant `onRegisterFooter`; `AppointmentConfirmation` pinned; appointment hero morph; realestate WhatsApp instrumentado; duplicate React keys |
| **Fora de escopo** | Influencer/institutional (WS-06/07); AI resolver (WS-08) |
| **Branch sugerida** | `workstream/stack-a-parity` (1 PR por sub-tema se possível) |
| **Gate de saída** | Matriz vertical atualizada; smoke manual 5 verticais |
| **Refs** | `SYSTEM_STATE.md` Semi-stable |

---

### WS-04 — CI Minimum

| Campo | Valor |
|-------|-------|
| **Era** | 3 — QA/CI Minimum |
| **Status** | ✅ Concluído — PR #56 merged @ `a30d0c5` |
| **Objetivo** | CI GitHub com gate mínimo |
| **Escopo** | `.github/workflows/qa-minimum.yml`; ajustes em `scripts/runtime/demo-event-checklist.mjs` (harness) — **build + qa:events only** |
| **Fora de escopo** | `tsc --noEmit` (WS-05); matrix 12 verticais; lint; nightly |
| **Branch sugerida** | `chore/qa-minimum-ci` |
| **Gate de saída** | Workflow verde na `main` (build + qa:events 8/8) |
| **Refs** | `docs/audit/CI_MINIMUM_STRATEGY.md`, `QA_INFRASTRUCTURE_PLAN.md` |

---

### WS-05 — TypeScript Gate

| Campo | Valor |
|-------|-------|
| **Era** | 4 — TypeScript Gate |
| **Status** | 🟡 Próximo — desbloqueado após WS-04 |
| **Objetivo** | `tsc --noEmit` no CI; remover `ignoreBuildErrors` |
| **Escopo** | `next.config.mjs`, workflow CI, fixes TS incrementais |
| **Fora de escopo** | Refactor amplo; mudanças Tier 1 frozen |
| **Branch sugerida** | `chore/typescript-gate` |
| **Gate de saída** | Build falha em erro TS real |
| **Refs** | `TECH_DEBT_REPORT.md` TD-001 |

---

### WS-06 — Influencer ActionDrawer Migration

| Campo | Valor |
|-------|-------|
| **Era** | 2 — Stack Convergence |
| **Status** | 🔴 Blocked até WS-02 + estabilização window |
| **Objetivo** | Migrar influencer de Stack B → `ActionDrawer` |
| **Escopo** | `influencer-feed.tsx`, `composerMode`, morph wiring, media kit trigger |
| **Fora de escopo** | Institutional; AI resolver |
| **Branch sugerida** | `workstream/influencer-actiondrawer` |
| **Gate de saída** | `qa:influencer` script + re-run perceptual |
| **Refs** | `PRIORITIES.md` — próxima vertical GO |

---

### WS-07 — Institutional ActionDrawer Migration

| Campo | Valor |
|-------|-------|
| **Era** | 2 — Stack Convergence |
| **Status** | 🔴 Blocked até WS-06 |
| **Objetivo** | Migrar institutional de Stack B → `ActionDrawer` |
| **Escopo** | `institutional-feed.tsx`, image alt fixes, morph wiring |
| **Fora de escopo** | Influencer (já migrado); AI resolver |
| **Branch sugerida** | `workstream/institutional-actiondrawer` |
| **Gate de saída** | QA converge + matriz 12/12 Stack A |
| **Refs** | `CONTROLLED_MIGRATION_PATTERN.md` |

---

### WS-08 — AI Resolver Expansion

| Campo | Valor |
|-------|-------|
| **Era** | 5 — Multi-Vertical AI |
| **Status** | 🔴 Blocked até Era 2 concluída |
| **Objetivo** | Resolver + visual block por vertical (1 vertical/PR) |
| **Escopo** | Novos módulos em `lib/mock-data/`; wire por feed |
| **Fora de escopo** | Alterar `ecommerceMockConversationResolver`; Tier 1 frozen |
| **Branch sugerida** | `workstream/ai-resolver-<vertical>` |
| **Gate de saída** | Resolver dedicado + smoke conversacional |
| **Ordem sugerida** | restaurant → health → appointment |

---

### WS-09 — DB/Storage Isolation

| Campo | Valor |
|-------|-------|
| **Era** | 6 — DB/Storage Integration |
| **Status** | 🔴 Blocked — GO humano explícito |
| **Objetivo** | PR isolado db-media sem tocar runtime Tier 1 |
| **Escopo** | `lib/db/`, drizzle, API media, schema alignment doc |
| **Fora de escopo** | Runtime business feeds; composer/drawer |
| **Branch sugerida** | `workstream/db-storage` |
| **Gate de saída** | Smokes SQL verdes; doc alignment preenchido |
| **Refs** | `docs/architecture/social-landing-storage-schema-alignment.md` |

---

## Sequência recomendada

```txt
WS-01 ✅ → WS-02 ✅ → WS-02.5 ✅ → WS-04 ✅ → WS-05 (TS) ──┬──► WS-06 → WS-07
                                                              ├──► WS-03 (parity gaps)
                                                              └──► WS-08 (AI — last)
WS-09 (DB) — paralelo, GO humano
```

**Atual:** iniciar **WS-05 TypeScript Gate** (PR isolado — sem misturar com CI mínimo).

---

## Peel protocol (árvore suja)

1. Inventariar paths (`DIRTY_TREE_TRIAGE`)
2. Classificar por workstream (tabela acima)
3. Criar branch limpa por workstream
4. Cherry-pick ou reapply seletivo
5. Dedupe docs vs main

---

## Proibido

- Merge de dirty tree inteira
- WIP de vertical A contaminando vertical B
- Docs exploratórios (~40 audit files) em PR único
- Dois workstreams numa branch
