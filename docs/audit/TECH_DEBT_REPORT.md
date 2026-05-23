# TECH DEBT REPORT — Social Landing

**Data:** 23/05/2026  
**Complemento:** ARCHITECTURE_REPORT.md, RISK_REPORT.md

---

## Sumário

Dívida técnica **concentrada na fronteira UI mock ↔ schema/db** e em **duplicações históricas** do runtime. Dívida **intencional documentada** (morph singleton, DOM protocol) não deve ser "paga" sem substituto equivalente.

**Estimativa global:** ~**45–60 dias-dev** para debt P0–P1 (sem contar features novas).

---

## Classificação

| Severidade | Critério |
|------------|----------|
| **P0** | Segurança, build integrity, data leak risk |
| **P1** | Escala dev team, ENABLE_DB blockers |
| **P2** | Manutenção, duplicação, drift |
| **P3** | Cleanup cosmético |

---

## P0 — Crítico

### TD-001: `typescript.ignoreBuildErrors: true`

| | |
|---|---|
| **Arquivo** | `next.config.mjs` |
| **Problema** | Build passa com erros TS — bugs silenciosos |
| **Impacto** | Alto em escala |
| **Esforço** | 3–10 dias (fix all errors) |
| **Ação** | Remover flag; fix type errors incrementalmente |

### TD-002: SSRF potential em extract-brand

| | |
|---|---|
| **Arquivo** | `app/api/extract-brand/route.ts` |
| **Problema** | Server fetch URL user-supplied |
| **Impacto** | Segurança |
| **Esforço** | 0.5–1 dia |
| **Ação** | Allowlist schemes, block private IPs, timeout |

### TD-003: Sem middleware auth refresh

| | |
|---|---|
| **Arquivo** | Ausente `middleware.ts` |
| **Problema** | Session stale quando ENABLE_AUTH=true |
| **Impacto** | Auth broken UX |
| **Esforço** | 1–2 dias |
| **Ação** | Supabase SSR middleware pattern |

### TD-004: RLS não validado em prod path

| | |
|---|---|
| **Arquivos** | `drizzle/migrations/0001_*`, scripts SQL |
| **Problema** | Smoke tests existem mas DB off by default |
| **Impacto** | Data leak se ENABLE_DB rushed |
| **Esforço** | 2–3 dias operacional |
| **Ação** | CI gate on RLS smoke |

---

## P1 — Alto (blockers de escala)

### TD-010: Dual type system

| | |
|---|---|
| **Arquivos** | `lib/types.ts` vs `lib/landing-schema/entities.ts` |
| **Problema** | Duas verdades para Brand, Post, etc. |
| **Esforço** | 5–8 dias |
| **Ação** | `lib/adapters/ui-to-schema/` + deprecate types.ts gradually |

### TD-011: UI não conectada ao schema

| | |
|---|---|
| **Problema** | Regra explícita: schema isolado |
| **Esforço** | 8–15 dias |
| **Ação** | Published snapshot loader for `[slug]` |

### TD-012: Repository layer vazio

| | |
|---|---|
| **Arquivo** | `lib/db/repositories/.gitkeep` |
| **Problema** | DB logic will scatter |
| **Esforço** | 5–10 dias |
| **Ação** | Implement brand, landing, post repositories |

### TD-013: Dual feed architecture

| | |
|---|---|
| **Arquivos** | `social-landing/` vs `business/` |
| **Problema** | Bug fixes 2×, divergência visual |
| **Esforço** | 10–15 dias (longo prazo) |
| **Ação** | Shared primitives after schema bridge |

### TD-014: composerMode duplication

| | |
|---|---|
| **Arquivos** | 9+ `*Feed.tsx` |
| **Problema** | Same useEffect pattern copy-pasted |
| **Esforço** | 3–5 dias |
| **Ação** | `useComposerModePolicy(drawerState)` hook or surface reducer |

### TD-015: No server actions boundary

| | |
|---|---|
| **Problema** | Docs reference; zero implementation |
| **Esforço** | 3–5 dias |
| **Ação** | `app/actions/` for db mutations |

---

## P2 — Médio

### TD-020: Triplicate drawer implementations

| | |
|---|---|
| **Arquivos** | `action-drawer`, `business-feed-drawer`, `feed-drawer` |
| **Problema** | ~90% overlap, drift guaranteed |
| **Esforço** | 5–8 dias |
| **Ação** | Extract `BaseFeedDrawer` — **after** frozen protocol tests |

### TD-021: `reserveComposerSpace` dead prop

| | |
|---|---|
| **Arquivo** | `action-drawer.tsx` |
| **Esforço** | 0.5 dia |
| **Ação** | Implement or remove from API |

### TD-022: Duplicate hooks

| | |
|---|---|
| **Arquivos** | `hooks/use-mobile.ts`, `hooks/use-toast.ts` vs `components/ui/*` |
| **Esforço** | 0.5 dia |
| **Ação** | Single source in hooks/ |

### TD-023: Duplicate globals.css

| | |
|---|---|
| **Arquivos** | `app/globals.css`, `styles/globals.css` |
| **Esforço** | 0.5 dia |
| **Ação** | Delete legacy styles/ |

### TD-024: Dual toast (use-toast + Sonner)

| | |
|---|---|
| **Esforço** | 1 dia |
| **Ação** | Standardize on Sonner or shadcn toast |

### TD-025: ThemeProvider not wired

| | |
|---|---|
| **Arquivo** | `components/theme-provider.tsx`, `app/layout.tsx` |
| **Esforço** | 0.5 dia |
| **Ação** | Wire or delete |

### TD-026: `realestate` type cast hack

| | |
|---|---|
| **Arquivo** | `realestate-feed.tsx` |
| **Esforço** | 0.5 dia |
| **Ação** | Fix business-types interface |

### TD-027: Images unoptimized

| | |
|---|---|
| **Arquivo** | `next.config.mjs` |
| **Esforço** | 1–2 dias |
| **Ação** | Enable optimization + CDN for production |

### TD-028: External Unsplash hardcoded

| | |
|---|---|
| **Arquivos** | All mock-data |
| **Esforço** | Ongoing |
| **Ação** | MediaAsset + storage when ENABLE_MEDIA_API |

### TD-029: localStorage chat without schema

| | |
|---|---|
| **Arquivo** | `conversational-ai.tsx` |
| **Esforço** | 1 dia |
| **Ação** | Versioned schema + migration |

### TD-030: block-registry vs runtime drift

| | |
|---|---|
| **Arquivo** | `block-registry.ts` — lite verticals composer.enabled mismatch risk |
| **Esforço** | 1 dia audit |
| **Ação** | Align capabilities with actual feeds |

### TD-031: Feature flags documented but unwired

| | |
|---|---|
| **Vars** | `LANDING_PUBLISH_STRICT_DEFAULT`, `LANDING_SUPPORTED_LAYOUT_VERSIONS` |
| **Esforço** | 2–3 dias |
| **Ação** | Wire in publish-sandbox → publish service |

### TD-032: Brand-id denorm TODO

| | |
|---|---|
| **Arquivo** | `lib/db/schema/brand-id-denorm.contract.ts` |
| **Esforço** | 2–3 dias |
| **Ação** | Trigger or repository write contract |

### TD-033: Blocks content type CHECK TODO

| | |
|---|---|
| **Arquivo** | `lib/db/schema/blocks.ts` |
| **Esforço** | 1 dia |
| **Ação** | DB constraint post-editor |

---

## P3 — Baixo / cosmético

| ID | Item | Esforço |
|----|------|---------|
| TD-040 | `false &&` dead code conversational-ai | 5 min |
| TD-041 | eslint config missing | 1 dia |
| TD-042 | Root PNG clutter | 1 hr |
| TD-043 | pnpm + package-lock dual lockfiles | 30 min |
| TD-044 | ~90 review/ screenshots in repo | policy decision |

---

## Dívida intencional (NÃO pagar sem substituto)

| Item | Razão documentada | Referência |
|------|-------------------|------------|
| `rememberedMorphSource` singleton | Evita re-render cards | composer-continuity-contract |
| DOM `data-*` protocol | Sync read for morph | FROZEN_SYSTEMS |
| `setTimeout(100)` scroll-to-post | Drawer mount timing | Frozen until IntersectionObserver |
| Strict Mode morph cleanup skip | Double-fire prevention | post-to-chat-morph-layer |
| Magic numbers 88px, 104px, pb-36 | Calibrated per vertical | SYSTEM_ARCHITECTURE |
| 3 separate scroll lock implementations | Frozen pattern identity | composer-continuity-contract |

**Reclassificar como dívida apenas quando:** substituto medido e aprovado via frozen protocol.

---

## Mapa de dívida por área

```
Runtime UI Tier 1     ████████░░  (80% — monolith + duplication, but WORKS)
Schema/DB layer       ████░░░░░░  (40% — schema rich, repos empty)
Integration           ██░░░░░░░░  (20% — ports missing)
Documentation         █████████░  (90% — strong ai-handoffs)
Build/DevEx           ███░░░░░░░  (30% — ignoreBuildErrors, no eslint)
Test coverage         ████░░░░░░  (40% — smoke scripts, no unit tests UI)
```

---

## Roadmap sugerido de pagamento

### Sprint 1 — Integrity (P0)
- TD-001, TD-002, TD-003, TD-004

### Sprint 2 — Bridge (P1)
- TD-010, TD-011, TD-012, TD-015

### Sprint 3 — Surface governance (P1)
- TD-014 + Event bus log-only

### Sprint 4 — Consolidation (P2, selective)
- TD-020 (with full regression matrix)
- TD-027, TD-028

### Backlog — Long term
- TD-013 (dual feed unification)

---

## Métricas de dívida

| Métrica | Valor atual | Target 6mo |
|---------|-------------|------------|
| TS build errors ignored | Yes | No |
| Drawer implementations | 3 | 2 (base + variants) |
| composerMode useEffect copies | 9+ | 1 policy module |
| Type systems | 2 | 1 (+ adapters) |
| Test files (UI) | ~0 | Critical path smoke |
| Docs/code drift | Low | Low (EVOLUTION_LOG discipline) |

---

## Conclusão

A dívida **não é caótica** — é **estruturada e parcialmente documentada**. Prioridade: **integridade de build (TD-001)**, **bridge schema (TD-010/011)**, **surface governance (TD-014)**. Evitar "cleanup" em Tier 1 que confunde dívida real com contratos congelados intencionais.
