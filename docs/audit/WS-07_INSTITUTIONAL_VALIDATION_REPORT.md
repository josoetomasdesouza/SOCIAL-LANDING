# WS-07 — Institutional ActionDrawer Migration — Validation Report

**Date:** 2026-05-30  
**Base main:** `0ff805f` (WS-06.5 complete)  
**Branch:** `workstream/institutional-actiondrawer`  
**Pattern:** [`CONTROLLED_MIGRATION_PATTERN.md`](../convergence/CONTROLLED_MIGRATION_PATTERN.md)

---

## Summary

| Item | Result |
|------|--------|
| Stack B drawer removed (institutional) | ✅ |
| ActionDrawer wired | ✅ 3 drawers |
| composerMode local | ✅ overlay when any drawer open |
| Stable drawer IDs preserved | ✅ |
| Tier 1 frozen | ✅ 0 errors |
| `influencer-feed.tsx` | ✅ untouched |
| ActionDrawer / morph / composer cores | ✅ untouched |
| `pnpm ts:budget` | ✅ 8/8 |
| `pnpm run build` | ✅ |
| `pnpm qa:events` | ✅ 8/8 |
| `pnpm qa:institutional` | ✅ 9/9 |
| `pnpm qa:influencer` | ✅ 8/8 (regression check) |

**Recommendation:** **GO WITH NOTES**

---

## Files changed

| File | Change |
|------|--------|
| `components/business/institutional/institutional-feed.tsx` | Stack B → ActionDrawer; composerMode; TS fixes |
| `scripts/convergence/institutional-actiondrawer-validation.mjs` | New vertical QA script |
| `package.json` | `qa:institutional` script |
| `scripts/typescript/ts-error-baseline.json` | 10 → 8 |
| `docs/typescript/TS_ERROR_BASELINE.md` | Baseline refresh |
| `docs/os/WORKSTREAMS.md` | WS-07 status |

**Not changed:** ActionDrawer core, morph, composer, instrumentation, influencer-feed, mock data cores.

---

## Drawer stack — before / after

| Drawer ID | Before | After | Trigger |
|-----------|--------|-------|---------|
| `institutional:contact` | `InstrumentedDrawerBridge` + vaul | `ActionDrawer` (`size="lg"`) | Hero "Fale conosco"; `SocialContactCTA` |
| `institutional:team` | `InstrumentedDrawerBridge` + vaul | `ActionDrawer` (`size="lg"`) | "Ver equipe completa" |
| `institutional:project` | `InstrumentedDrawerBridge` + vaul | `ActionDrawer` (`size="lg"`) | Project card click |

**Event source delta (accepted):** `source: "instrumentation"` → `source: "action-drawer"`; `drawerKind: "other"` → `drawerKind: "action"`.

---

## TypeScript — before / after

| Metric | Before | After |
|--------|--------|-------|
| Total baseline | 10 | **8** (−2) |
| `institutional-feed.tsx` | 2 | **0** |
| Tier 1 frozen | 0 | **0** ✅ |
| influencer (unchanged) | 0 | 0 |

**Fixes in institutional-feed.tsx:**
- `institutionalConfig` typed as `BusinessConfig` (`model: "institutional"`, `primaryColor`)
- Sections typed as `BusinessSection[]`; `type: "custom"` → `"specific"`
- Video/product/news posts mapped to valid `BusinessPost` shape (`title`/`image` vs legacy `content`/`media`)

---

## composerMode

```typescript
const anyDrawerOpen = contactDrawerOpen || teamDrawerOpen || projectDrawerOpen
const nextMode = anyDrawerOpen ? "overlay" : "default"
```

Resets to `default` on unmount. `composer.mode.changed` observed on each drawer open/close in `qa:institutional`.

---

## Validation

### Automated

```bash
pnpm ts:budget          # 8/8 PASS
pnpm run build          # PASS
pnpm qa:events          # 8/8 PASS
pnpm qa:institutional   # 9/9 PASS
pnpm qa:influencer      # 8/8 PASS (no regression)
```

### Manual walkthrough (institutional vertical)

- [x] Feed loads: hero, pillars, impact, team preview, projects, videos, products, news, FAQ, contact CTA
- [x] "Fale conosco" opens contact form drawer; success state after submit
- [x] "Ver equipe completa" opens team list with LinkedIn buttons
- [x] Project card opens project detail drawer with status badge and CTA
- [x] Escape closes each drawer; body scroll restored
- [x] No visual regression outside ActionDrawer chrome (handle, backdrop)

---

## Residual risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| ActionDrawer 80vh cap vs vaul 95% | Low | ACCEPTED_WITH_NOTE (personal/influencer precedent) |
| Stack B still used by gym, personal, professionals, appointment-calendar | N/A | Out of scope WS-07 |
| No close X button — Escape/backdrop only | Low | Stack A standard; documented in qa script |
| Contact form is mock (no backend) | N/A | Pre-existing; unchanged behavior |

---

## Stack B remaining (post WS-07)

| Vertical | File | Drawers |
|----------|------|---------|
| gym | `gym-feed.tsx` | TBD |
| personal | `personal-feed.tsx` | contact, project |
| professionals | `professionals-feed.tsx` | TBD |
| appointment | `appointment-calendar.tsx` | calendar |

Institutional is **off Stack B**.

---

## Recommendation detail

**GO WITH NOTES** — Migration meets all gates: institutional vertical fully on ActionDrawer with stable IDs, composer overlay, TS reduction, and green automated QA. Notes: accepted ActionDrawer height delta vs vaul; remaining Stack B verticals deferred to future workstreams.
