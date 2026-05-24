# Workstream Isolation Plan — Social Landing

**Data:** 2026-05-23  
**Baseline publicada:** `main` @ `e002921`  
**Escopo:** recomendação de separação — **nenhuma ação git executada neste documento**

> Problema central: working tree com timelines arquiteturais concorrentes destrói rastreabilidade de comportamento.

---

## Princípio

```
Uma trilha = um objetivo semântico = um branch = um chat = um PR
```

Nunca misturar trilhas. Nunca `git add .` cross-trilha.

---

## Mapa de trilhas

| Trilha | Branch sugerido | Prioridade | Status |
|--------|-----------------|------------|--------|
| runtime-observability | `workstream/runtime-observability` | Alta | Parcialmente em `main` |
| shadow-audit-docs | `workstream/shadow-audit-docs` | Alta | Local untracked |
| stack-b-convergence | `workstream/stack-b-convergence` | Alta | Fase 1–2 em `main`; Fase 3 pendente |
| ecommerce-wip | `workstream/ecommerce-evolution` | Média | Local modified |
| db-media | `workstream/db-media-foundation` | Baixa (isolada) | Local untracked |
| brand-dna-foundation | `workstream/brand-dna-foundation` | Baixa | Em `lib/brand-dna/` publicado |

---

## 1. runtime-observability

### Objetivo

Manter e estender observação passiva sem alterar UX: Event Bus, instrumentation, passive providers, REAL_USAGE automation.

### Arquivos permitidos

```
lib/events/**
lib/events/instrumentation.ts
components/dev/event-debug-panel.tsx
components/dev/passive-event-provider.tsx
scripts/demo-event-checklist.mjs (se existir)
docs/audit/EVENT_*.md
docs/audit/REAL_USAGE*.md
```

### Arquivos proibidos

```
components/business/conversational-ai.tsx
components/business/post-to-chat-morph-layer.tsx
components/business/business-social-landing.tsx (exceto observe* já publicado)
lib/db/**
components/business/ecommerce/**
lib/surfaces/shadow/** (trilha shadow separada)
```

### Risco

🟡 Médio — wiring incorreto pode duplicar eventos ou criar loops (mitigado: bus sync, dedupe composer).

### Dependências

- Tier 1 emite eventos — não controla
- Shadow trilha consome mesmos eventos

### Critério de merge

- [ ] Zero diff perceptivo Tier 1
- [ ] Event validation checklist passa
- [ ] Sem event storm em sessão `/demo` 5min
- [ ] `NEXT_PUBLIC_DISABLE_EVENT_BUS` kill switch testado

### Critério de rollback

`git revert` + confirmar `/demo` sem Event Debug Panel side effects.

---

## 2. shadow-audit-docs

### Objetivo

Surface Shadow compare-only, audit docs, convergence plans, governance — **zero runtime mutation**.

### Arquivos permitidos

```
lib/surfaces/shadow/**
lib/surfaces/surface-*.ts (reducer/machine — guards false)
docs/audit/**
docs/convergence/**
components/dev/passive-event-provider.tsx (shadow subscription only)
```

### Arquivos proibidos

```
Qualquer Tier 1 component
Qualquer feed vertical (exceto docs)
lib/db/**
ecommerce/**
```

### Risco

🟢 Baixo perceptivo — 🔴 Alto processual se misturado com código runtime.

### Dependências

- Event Bus ativo
- `SURFACE_SHADOW_APPLY_TO_RUNTIME = false` permanente nesta trilha

### Critério de merge

- [ ] Guards verificados em code review
- [ ] DEV-only (`isSurfaceShadowModeEnabled`)
- [ ] Docs atualizados (SURFACE_DIVERGENCES, SHADOW_MODE_REPORT)
- [ ] Nenhum import shadow em Tier 1 production path

### Critério de rollback

Revert PR; shadow é DEV-only — rollback transparente ao usuário.

---

## 3. stack-b-convergence

### Objetivo

Convergir personal, influencer, institutional para Stack A (ActionDrawer + contratos globais).

### Arquivos permitidos

```
components/business/personal/**
components/business/influencer/**
components/business/institutional/**
components/business/instrumented-drawer-bridge.tsx
components/business/custom-content-bridge.tsx
components/business/action-drawer.tsx (shared — cuidado)
components/business/business-feed-drawer.tsx (shared — cuidado)
hooks/use-body-scroll-lock.ts (futuro)
docs/convergence/**
```

### Arquivos proibidos

```
post-to-chat-morph-layer.tsx
conversational-ai.tsx (salvo observe*)
ecommerce/**
lib/db/**
lib/surfaces/shadow/** (PR separado)
```

### Risco

🔴 Alto — duas semânticas drawer; migração afeta scroll lock, composerMode, eventos.

### Dependências

- DD-01 ✅
- Provider 12/12 ✅
- Bridges ✅
- REAL_USAGE re-run ⏳ antes de Fase 3

### Critério de merge (por vertical/ciclo)

- [ ] 1 vertical por PR na Fase 3
- [ ] Morph PostCards validado pós-migração (influencer, institutional)
- [ ] `drawer.opened/closed` emite nativamente (não só bridge)
- [ ] Scroll lock OK mobile
- [ ] composerMode policy respeitada
- [ ] Shadow false negatives reduzidos

### Critério de rollback

Revert vertical feed + restore shadcn drawer; re-enable bridge se necessário.

---

## 4. ecommerce-wip

### Objetivo

Evolução feature ecommerce: product cards, conversation blocks, checkout UX — **isolada do convergence**.

### Arquivos permitidos

```
components/business/ecommerce/**
docs relacionados a ecommerce
```

### Arquivos proibidos

```
Tier 1 shared (BSL, conversational-ai, morph)
stack B feeds
lib/db/** (trilha db separada)
instrumentation global changes
```

### Risco

🟡 Médio perceptivo — composerMode ecommerce tem priority rules complexas.

### Dependências

- Stack A baseline
- Não alterar `deriveEcommerceComposerMode` shadow policy sem doc

### Critério de merge

- [ ] Ecommerce vertical smoke completo
- [ ] composerMode: hidden durante checkout, overlay product drawer
- [ ] Sem regressão em outras verticals (grep shared imports)
- [ ] REAL_USAGE ecommerce path

### Critério de rollback

Revert ecommerce files only; vertical selector ainda funciona com versão anterior.

---

## 5. db-media

### Objetivo

Infraestrutura Drizzle, Supabase, Media API, landing-schema — **gated off**, zero impacto runtime `/demo`.

### Arquivos permitidos

```
lib/db/**
lib/landing-schema/**
drizzle/**
drizzle.config.ts
app/api/media/**
scripts/db-*.sql
scripts/*smoke*.mjs
docs/ai-handoffs/SUPABASE*.md
docs/ai-handoffs/PR*_*.md
.env.example
```

### Arquivos proibidos

```
components/business/**
lib/events/**
lib/surfaces/**
app/demo/**
```

### Risco

🟢 Baixo runtime — 🔴 Alto se ENABLE_* flags ligados sem review.

### Dependências

- Nenhuma runtime Tier 1
- Feature flags default false

### Critério de merge

- [ ] `ENABLE_DB`, `ENABLE_AUTH`, `ENABLE_MEDIA_API` default false
- [ ] Smoke scripts passam em dev target
- [ ] RLS review se migrations
- [ ] Zero import db em Tier 1 feeds publicados

### Critério de rollback

Revert migrations via drizzle down manual; disable env flags.

---

## 6. brand-dna-foundation

### Objetivo

Brand DNA parser, signals, rule engine evaluate-only — preparação IA futura.

### Arquivos permitidos

```
lib/brand-dna/**
lib/rules/**
docs/audit/BRAND_DNA_SPEC.md
docs/audit/RULE_ENGINE_SPEC.md
```

### Arquivos proibidos

```
Tier 1 runtime mutation via rules
composer surface color changes
Goal Engine wiring (BLOCKED)
```

### Risco

🟢 Baixo — evaluate-only hoje.

### Dependências

- Rule engine não conectado a runtime apply

### Critério de merge

- [ ] Zero side effects em evaluate
- [ ] `BRAND_DNA_PROTECTED_FIELDS` intacto
- [ ] Block rules para Tier 1 mutation

### Critério de rollback

Revert lib/rules changes — sem impacto `/demo`.

---

## Matriz de compatibilidade PR

| Trilha A | Trilha B | Merge mesmo PR? |
|----------|----------|-----------------|
| runtime-observability | shadow-audit-docs | ⚠️ Só se shadow zero Tier 1 |
| stack-b-convergence | ecommerce-wip | ❌ |
| stack-b-convergence | db-media | ❌ |
| shadow-audit-docs | db-media | ✅ Docs + infra OK |
| runtime-observability | stack-b-convergence | ⚠️ Só observe* em bridge |
| qualquer | Tier 1 morph fix | ❌ PR dedicado TIER1_RISK |

---

## Working tree atual — classificação

| Path | Trilha | Ação recomendada |
|------|--------|------------------|
| `lib/surfaces/shadow/` | shadow-audit-docs | Branch dedicado |
| `docs/audit/`, `docs/convergence/` | shadow-audit-docs | Commit docs-only |
| `ecommerce/*.tsx` modified | ecommerce-wip | Stash ou branch |
| `lib/db/`, drizzle, scripts | db-media | Branch dedicado |
| `post-to-chat-morph-layer.tsx` local | TIER1_RISK | Descartar ou PR isolado |
| `.next/`, `tsconfig.tsbuildinfo` | — | gitignore / descartar |

---

## Chats Cursor recomendados

| Chat | Escopo | Não discutir |
|------|--------|--------------|
| Runtime Observation | Governança, REAL_USAGE, shadow compare | ecommerce features |
| Stack B Convergence | Migração drawers | db schema |
| Ecommerce Evolution | Product/checkout UX | Tier 1 refactor |
| DB/Media Infra | Drizzle, API, RLS | composer, morph |

---

## Referências

- `docs/audit/WORKING_TREE_AUDIT.md`
- `docs/audit/RUNTIME_GOVERNANCE.md`
- `docs/convergence/MIGRATION_STRATEGY.md`
