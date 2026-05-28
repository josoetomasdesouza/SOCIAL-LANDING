# Tier 1 Runtime Baseline

**Status:** ✅ Official — WS-02.5 Runtime Stabilization Snapshot  
**Version:** 1.0  
**Baseline merge commit:** `673395d` — Merge PR #52 (`fix/drawer-perceptual-hygiene`)  
**Prior governance:** `7cd0fe5` (WS-01 hygiene) · `a84c616` (governance layer)  
**Date:** 2026-05-24  
**Workstream:** WS-02.5

---

## What this baseline is

The first **official converged runtime** for Social Landing Tier 1 after perceptual drawer/composer hygiene (PR #52). This is not “feature complete” — it is **behaviorally converged** for Stack A verticals.

Future work (influencer, institutional, AI resolvers, DB) must **consume** this baseline, not redefine it silently.

---

## Tier 1 verticals (Stack A — in baseline)

| Vertical | `BusinessType` | Drawer stack | Checkout / CTA pattern | Baseline status |
|----------|----------------|--------------|------------------------|-----------------|
| E-commerce | `ecommerce` | ActionDrawer | `onRegisterFooter` checkout | ✅ Converged |
| Restaurante | `restaurant` | ActionDrawer | Header cart + checkout footer | ✅ Converged |
| Barbearia | `appointment` | ActionDrawer | Calendar + pinned confirm | ✅ Converged |
| Gym | `gym` | ActionDrawer | `GymSignupForm` + footer | ✅ Converged |
| Imóveis | `realestate` | ActionDrawer | `ScheduleVisitForm` + footer | ✅ Converged |
| Saúde | `health` | ActionDrawer | `footer` prop on professional drawer | ✅ Converged |
| Cursos | `courses` | ActionDrawer | `CourseCheckout` + footer | ✅ Converged |
| Eventos | `events` | ActionDrawer | `TicketCheckout` + footer | ✅ Converged |
| Pessoal | `personal` | ActionDrawer | Phase 3 reference | ✅ Stable (pre-#52) |
| Profissionais | `professionals` | ActionDrawer | Service drawers | ✅ Stack A |

### Not in this baseline (Stack B — deferred)

| Vertical | Status | Next WS |
|----------|--------|---------|
| Influencer | Stack B (`feed-drawer` / vaul) | WS-06 |
| Institutional | Stack B | WS-07 |

---

## Official runtime state (post–PR #52)

| Surface | Class | Official behavior |
|---------|-------|-------------------|
| **ActionDrawer** | Stable | Drag-dismiss, 95dvh, pinned footer when composer hidden, overlay clearance |
| **BusinessFeedDrawer** | Stable | Feed content drawer; drag; backdrop; composer overlay clearance |
| **Composer** | Stable | Modes `default` \| `overlay` \| `hidden`; footprint metrics published |
| **Morph** | Stable | 480ms ease-out cubic; spatial continuity PostCard → composer |
| **Event bus** | Stable | Passive events; `pnpm qa:events` protocol |
| **E-commerce resolver** | Stable | Existing mock resolver unchanged by #52 |
| **Checkout flows** | Stable | `onRegisterFooter` pattern across commerce verticals |

---

## Validated behaviors (convergence evidence)

| Evidence | Source | Status |
|----------|--------|--------|
| PR #52 merge | `673395d` | ✅ |
| WS-02 validation record | `docs/audit/WS-02_PR52_VALIDATION_REPORT.md` | ✅ GO WITH NOTES |
| Manual sign-off checklist | Human perceptual (6 verticals) | ✅ Authorized merge |
| `pnpm qa:events` | 8-step protocol — re-run on main post-merge | ⏳ Required after deploy |
| `pnpm run build` | Production build | ✅ Pass (types skipped in build) |

**Post-merge gate:** run `pnpm qa:events` on `main` @ `673395d` and record 8/8 in this doc when executed.

---

## Architectural confidence (post–WS-02.5)

| Question | Answer |
|----------|--------|
| Is Tier 1 drawer behavior official? | **Yes** — see `DRAWER_BEHAVIOR_SPEC.md` |
| Is composer clearance official? | **Yes** — see `COMPOSER_BEHAVIOR_SPEC.md` |
| Safe to start AI multi-vertical? | **No** — WS-04 CI + WS-05 TS first |
| Safe to migrate influencer? | **After** CI/TS gates; consume baseline specs |
| Runtime convergence era | **Frozen** — patch-only on Tier 1 cores |

---

## Key paths (reference)

```
components/business/action-drawer.tsx
components/business/business-feed-drawer.tsx
components/business/conversational-ai.tsx
components/business/post-to-chat-morph-layer.tsx
lib/ui/use-drawer-sheet-drag.ts
lib/ui/drawer-layout.ts
lib/ui/composer-scroll-clearance.ts
scripts/runtime/demo-event-checklist.mjs
```

---

## Change policy

After WS-02.5:

1. Behavior changes require diff against `docs/runtime/*` + `FREEZE_ZONES.md`
2. Human GO + `VALIDATION_PROTOCOL.md` record
3. Re-run `pnpm qa:events` on affected paths
4. Update baseline version in this file (do not silent drift)

---

## Next workstream

**WS-04 — CI Minimum** (see `docs/os/WORKSTREAMS.md`)

Do not start AI multi-vertical until CI + TypeScript gates are in place.
