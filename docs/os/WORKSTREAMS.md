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
| **Status** | ✅ Concluído — PR #57 merged @ `f506030` |
| **Objetivo** | Gate incremental TS — error budget, **não** zero-errors |
| **Escopo** | `scripts/typescript/*`, `docs/typescript/*`, CI `ts:budget`, baseline 91 erros |
| **Fora de escopo** | Remover `ignoreBuildErrors`; refactors; runtime Tier 1; zerar TS |
| **Branch sugerida** | `chore/ws-05-typescript-gate` |
| **Gate de saída** | `pnpm ts:budget` no CI main; baseline 91 erros; **0 erros Tier 1** |
| **Refs** | [`docs/typescript/TS_HARDENING_PLAN.md`](../typescript/TS_HARDENING_PLAN.md), TD-001 |

---

### WS-05.5 — TypeScript Stabilization

| Campo | Valor |
|-------|-------|
| **Era** | 4 — TypeScript Gate |
| **Status** | ✅ Concluído — PRs #58, #59, #60 merged @ `9d467f1` |
| **Objetivo** | Redução cirúrgica do baseline; preparar remoção de `ignoreBuildErrors` |
| **Escopo A** | `lib/business-types.ts`, `lib/rules/rule-registry.ts` |
| **Escopo B** | `lib/mock-data/realestate-data.ts`, `lib/mock-data/events-data.ts` |
| **Escopo C** | `business-content.ts`, `professionals-data.ts`, `gym-data.ts` |
| **Fora de escopo** | Refactor amplo; runtime Tier 1; Stack B feeds; migrations verticais |
| **Gate de saída** | Runtime critical 0; safe legacy mock 0; baseline **16**; Tier 1 **0**; `ignoreBuildErrors` mantido |
| **Refs** | [`docs/typescript/TS_HARDENING_PLAN.md`](../typescript/TS_HARDENING_PLAN.md) |

---

### WS-06 — Influencer ActionDrawer Migration

| Campo | Valor |
|-------|-------|
| **Era** | 2 — Stack Convergence |
| **Status** | ✅ Concluído — PR #61 merged @ `6fe2b88` |
| **Objetivo** | Migrar influencer de Stack B → `ActionDrawer` |
| **Escopo** | `influencer-feed.tsx`, `composerMode`, morph wiring, media kit trigger |
| **Fora de escopo** | Institutional; AI resolver |
| **Gate de saída** | `qa:influencer` 8/8; TS 16→10; Tier 1 = 0 |
| **Refs** | [`WS-06_INFLUENCER_VALIDATION_REPORT.md`](../audit/WS-06_INFLUENCER_VALIDATION_REPORT.md) |

---

### WS-06.5 — Influencer Stabilization Snapshot

| Campo | Valor |
|-------|-------|
| **Era** | 2 — Stack Convergence (baseline) |
| **Status** | ✅ Complete — PR #62 merged |
| **Objetivo** | Cristalizar comportamento oficial influencer pós-convergência |
| **Escopo** | `docs/runtime/*`, `docs/audit/*`, `docs/os/*` — **docs only** |
| **Fora de escopo** | Runtime, componentes, Tier 1 |
| **Gate de saída** | [`INFLUENCER_BEHAVIOR_SPEC.md`](../runtime/INFLUENCER_BEHAVIOR_SPEC.md) + [`WS-06_5_INFLUENCER_BASELINE.md`](../audit/WS-06_5_INFLUENCER_BASELINE.md) |
| **Refs** | [`INFLUENCER_BEHAVIOR_SPEC.md`](../runtime/INFLUENCER_BEHAVIOR_SPEC.md) |

---

### WS-07 — Institutional ActionDrawer Migration

| Campo | Valor |
|-------|-------|
| **Era** | 2 — Stack Convergence |
| **Status** | ✅ Complete — PR #63 merged @ `1b64b8f` |
| **Objetivo** | Migrar institutional de Stack B → `ActionDrawer` |
| **Escopo** | `institutional-feed.tsx`, composerMode local, QA institutional |
| **Fora de escopo** | Influencer (já migrado); AI resolver; cores Tier 1 |
| **Gate de saída** | QA converge + baseline 8/8 + relatório WS-07 |
| **Refs** | [`WS-07_INSTITUTIONAL_VALIDATION_REPORT.md`](../audit/WS-07_INSTITUTIONAL_VALIDATION_REPORT.md) |

---

### WS-07.5 — Institutional Stabilization Snapshot

| Campo | Valor |
|-------|-------|
| **Era** | 2 — Stack Convergence (baseline) |
| **Status** | ✅ Complete — PR #64 merged @ `e426ff1` |
| **Objetivo** | Cristalizar comportamento oficial institutional pós-convergência |
| **Escopo** | `docs/runtime/*`, `docs/os/*` — **docs only** |
| **Fora de escopo** | Runtime, componentes, Tier 1 |
| **Gate de saída** | [`INSTITUTIONAL_BEHAVIOR_SPEC.md`](../runtime/INSTITUTIONAL_BEHAVIOR_SPEC.md) + invariants I-I1…I-I3 |
| **Refs** | [`INSTITUTIONAL_BEHAVIOR_SPEC.md`](../runtime/INSTITUTIONAL_BEHAVIOR_SPEC.md) |

---

### WS-07.6 — TS Final Peel

| Campo | Valor |
|-------|-------|
| **Era** | 2 — Stack Convergence (type safety) |
| **Status** | ✅ Complete — PR #65 merged @ `47af7ff` |
| **Objetivo** | Zerar baseline TS (8→0); remover `ignoreBuildErrors` se build strict passar |
| **Escopo** | `gym-feed`, `personal-feed`, `professionals-feed`, `appointment-calendar`, baseline, `next.config.mjs` |
| **Fora de escopo** | Tier 1 cores; `instrumented-drawer-bridge.tsx` cleanup; AI resolver |
| **Gate de saída** | baseline **0/0**; build strict PASS; QA regressions green |
| **Refs** | [`TS_ERROR_BASELINE.md`](../typescript/TS_ERROR_BASELINE.md) |

---

### WS-07.7 — Stack B Cleanup

| Campo | Valor |
|-------|-------|
| **Era** | 2 — Stack Convergence (closure) |
| **Status** | ✅ Complete — PR #66 merged @ `cd00647` |
| **Objetivo** | Remover `instrumented-drawer-bridge.tsx` órfão; atualizar refs operacionais |
| **Escopo** | Delete bridge file; `docs/os/*`, `docs/typescript/*`, refs diretas obsoletas |
| **Fora de escopo** | Runtime behavior; Tier 1 cores; AI; DB |
| **Gate de saída** | Zero imports; QA green; CI green |

---

---

### WS-08A — Restaurant AI Resolver

| Campo | Valor |
|-------|-------|
| **Era** | 5 — Multi-Vertical AI |
| **Status** | ✅ Concluído — PR #67 merged @ `4f1f57f` |
| **Objetivo** | Resolver + visual blocks isolados para restaurante |
| **Escopo** | `restaurant-feed.tsx`, `restaurant-conversational-search.ts`, QA restaurant |
| **Fora de escopo** | `ecommerceMockConversationResolver`; Tier 1 cores |
| **Gate de saída** | `qa:restaurant` 6/6 + relatório WS-08A |
| **Refs** | [`WS-08A_RESTAURANT_AI_RESOLVER_REPORT.md`](../audit/WS-08A_RESTAURANT_AI_RESOLVER_REPORT.md) |

---

### WS-08B — Health AI Resolver

| Campo | Valor |
|-------|-------|
| **Era** | 5 — Multi-Vertical AI |
| **Status** | ✅ Concluído — PR #68 merged @ `41b4ff7` |
| **Objetivo** | Resolver + visual blocks isolados para saúde |
| **Escopo** | `health-feed.tsx`, `health-conversational-search.ts`, mock-data health, QA health |
| **Fora de escopo** | `ecommerceMockConversationResolver`; restaurant resolver; Tier 1 cores |
| **Gate de saída** | `qa:health` 7/7 + relatório WS-08B |
| **Refs** | [`WS-08B_HEALTH_AI_RESOLVER_REPORT.md`](../audit/WS-08B_HEALTH_AI_RESOLVER_REPORT.md) |

---

### WS-08.5 — AI Resolver Governance

| Campo | Valor |
|-------|-------|
| **Era** | 5 — Multi-Vertical AI |
| **Status** | ✅ Concluído — PR #69 merged @ `9bc2a6c` |
| **Objetivo** | Constituição oficial e contratos para resolvers multi-vertical |
| **Escopo** | `docs/ai/*` — constitution, contract, patterns, invariants, evolution |
| **Fora de escopo** | Runtime; resolver implementations; Tier 1 cores |
| **Gate de saída** | Docs-only PR; CI green |
| **Refs** | [`docs/ai/`](../ai/AI_RESOLVER_CONSTITUTION.md) |

---

### WS-08.6 — AI Runtime Snapshot

| Campo | Valor |
|-------|-------|
| **Era** | 5 — Multi-Vertical AI |
| **Status** | ✅ Concluído — PR #70 merged @ `d229970` |
| **Objetivo** | Baseline oficial da camada AI resolver antes de novas expansões |
| **Escopo** | `docs/ai/` — baseline, hydration, fallback, visual runtime, vertical comparison |
| **Fora de escopo** | Runtime; Tier 1 cores |
| **Gate de saída** | Docs-only PR; CI green |
| **Refs** | [`AI_RUNTIME_BASELINE.md`](../ai/AI_RUNTIME_BASELINE.md) |

---

### WS-08.7 — AI Stability & Observation

| Campo | Valor |
|-------|-------|
| **Era** | 5 — Multi-Vertical AI |
| **Status** | ✅ Concluído @ `3eab7c1` (PR #71) |
| **Objetivo** | Observar e estabilizar comportamento emergente dos resolvers |
| **Escopo** | `docs/ai/` observation/failure/perceptual; `scripts/qa/`; `qa:ai-observation` |
| **Fora de escopo** | Novas verticais; LLM; Tier 1 cores; mudanças perceptivas grandes |
| **Gate de saída** | Observation matrix + failure modes + checklist; CI green |
| **Refs** | [`WS-08.7_AI_STABILITY_OBSERVATION_REPORT.md`](../audit/WS-08.7_AI_STABILITY_OBSERVATION_REPORT.md) |

---

### WS-08.8 — AI Regression Harness

| Campo | Valor |
|-------|-------|
| **Era** | 5 — Multi-Vertical AI |
| **Status** | ✅ Concluído @ `ecc93dc` (PR #72) |
| **Objetivo** | Regressão conversacional multi-vertical antes de Appointment |
| **Escopo** | `scripts/qa/ai-regression-*`, fixtures, `docs/ai/AI_CANONICAL_FLOWS.md`, `docs/ai/AI_REGRESSION_RULES.md` |
| **Fora de escopo** | Runtime core; novas verticais; resolver logic; ActionDrawer; composer core; backend; DB; LLM |
| **Gate de saída** | `pnpm qa:ai-regression` green + CI |
| **Refs** | [`WS-08.8_AI_REGRESSION_HARNESS_REPORT.md`](../audit/WS-08.8_AI_REGRESSION_HARNESS_REPORT.md) |

---

### WS-08C — Appointment AI Resolver

| Campo | Valor |
|-------|-------|
| **Era** | 5 — Multi-Vertical AI |
| **Status** | ✅ Concluído @ `ca00dc7` (PR #73) |
| **Objetivo** | Primeiro resolver semi-stateful (continuidade leve, sem persistência real) |
| **Escopo** | `appointment-conversational-search.ts`, visual blocks, feed wire, `qa:appointment`, AP-* harness |
| **Fora de escopo** | Backend; agenda real; multi-session memory; runtime core; cross-vertical |
| **Gate de saída** | `qa:appointment` 8/8 + `qa:ai-regression` 26/26 + CI green |
| **Refs** | [`WS-08C_APPOINTMENT_AI_REPORT.md`](../audit/WS-08C_APPOINTMENT_AI_REPORT.md), [`ERA3_COGNITIVE_BASELINE_SNAPSHOT.md`](../audit/ERA3_COGNITIVE_BASELINE_SNAPSHOT.md) |

---

### WS-08 — AI Resolver Expansion

| Campo | Valor |
|-------|-------|
| **Era** | 5 — Multi-Vertical AI |
| **Status** | ✅ Baseline 4 verticais — Era 3 cognitiva consolidada |
| **Objetivo** | Resolver + visual block por vertical (1 vertical/PR) |
| **Escopo** | Novos módulos em `lib/mock-data/`; wire por feed |
| **Fora de escopo** | Alterar `ecommerceMockConversationResolver`; Tier 1 frozen |
| **Gate de saída** | Resolver dedicado + smoke conversacional + harness |
| **Ordem sugerida** | ~~WS-08A~~ ✅ → ~~WS-08B~~ ✅ → ~~WS-08.5~~ ✅ → ~~WS-08.6~~ ✅ → ~~WS-08.7~~ ✅ → ~~WS-08.8~~ ✅ → ~~WS-08C~~ ✅ |

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

### WS-09B → WS-09D.1 — Hero Operacional + Chegada Contextual

| Campo | Valor |
|-------|-------|
| **Era** | 4 — Presença contextual (piloto) |
| **Status** | ✅ Concluído @ `24394e9` (PR #76) |
| **Objetivo** | Hero viva + linha operacional humana + chegada contextual integrada |
| **Escopo** | Appointment only; `leadingContent`; `AppointmentOperationalHero`; `AppointmentArrivalDrawer`; mock operacional |
| **Fora de escopo** | Universalização; mapas; ETA; outras verticais |
| **Gate de saída** | Perceptual GO + `qa:appointment` 8/8 |
| **Refs** | [`STRATEGIC_PRODUCT_AUDIT_POST_WS09.md`](../audit/STRATEGIC_PRODUCT_AUDIT_POST_WS09.md), audits WS-09B–D.1 |

---

### WS-10 — Perceptual Maturity (sem features)

| Campo | Valor |
|-------|-------|
| **Era** | 4 — Presença contextual (maturação) |
| **Status** | 🟡 **Ativo — Etapa 1: Observational Hardening** |
| **Objetivo** | Refinamento perceptivo sistemático; aprender o que **não** tocar |
| **Escopo** | Observação → dívida perceptiva → consolidação de linguagem |
| **Fora de escopo** | Features novas; universalização; mapas/ETA/IA chegada; DB (WS-09) |
| **Entregáveis** | Etapa 1: [`OBSERVATIONAL_HARDENING_WS10.md`](../audit/OBSERVATIONAL_HARDENING_WS10.md) · Etapa 2: WS-10A/B/C ✅ · Etapa 3: [`PERCEPTUAL_LANGUAGE_SYSTEM.md`](PERCEPTUAL_LANGUAGE_SYSTEM.md) ✅ |
| **Gate de saída** | ≥3 sessões observacionais + GO humano por etapa |
| **Refs** | [`STRATEGIC_PRODUCT_AUDIT_POST_WS09.md`](../audit/STRATEGIC_PRODUCT_AUDIT_POST_WS09.md) |

**Sequência interna:** Etapa 1 ✅ → Etapa 2 (WS-10A/B/C) ✅ → **Etapa 3** [`PERCEPTUAL_LANGUAGE_SYSTEM.md`](PERCEPTUAL_LANGUAGE_SYSTEM.md) ✅ → **WS-11** (primeiro WS funcional pós-gates §8) ✅

---

## Sequência recomendada

```txt
WS-01 ✅ → … → WS-08C ✅ — **Era 3 cognitiva consolidada**
WS-09B → WS-09D.1 ✅ — **Era 4 piloto presença contextual** (Appointment)
WS-10 ✅ — Etapas 1–3 concluídas · [`PERCEPTUAL_LANGUAGE_SYSTEM.md`](PERCEPTUAL_LANGUAGE_SYSTEM.md)
WS-11 ✅ — Arrival return scroll continuity (gate §8 · piloto Appointment)
  └──► Pós-WS-11 Human Continuity Validation — [`WS-11_HUMAN_CONTINUITY_VALIDATION.md`](../audit/WS-11_HUMAN_CONTINUITY_VALIDATION.md) (Proxy A ✅ · Sessão B humana pendente)
WS-03 (parity gaps) — paralelo, escopo menor
WS-09 (DB) — paralelo, GO humano
```

**Atual:** **Era 4 emergente** @ `6167cb8` — WS-10 Etapa 1 ativa; aguardando sessões observacionais reais.

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
