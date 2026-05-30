# WS-06 — Influencer ActionDrawer Migration — Validation Report

**Date:** 2026-05-24  
**Base main:** `ce84adb` (WS-05.5 complete)  
**Branch:** `workstream/influencer-actiondrawer`  
**Pattern:** [`CONTROLLED_MIGRATION_PATTERN.md`](../convergence/CONTROLLED_MIGRATION_PATTERN.md)

---

## Summary

| Item | Result |
|------|--------|
| Stack B drawer removed (influencer) | ✅ |
| ActionDrawer wired | ✅ 2 drawers |
| composerMode local | ✅ overlay when open |
| Media kit trigger wired | ✅ (was dead state) |
| Tier 1 frozen | ✅ 0 errors |
| institutional-feed.tsx | ✅ untouched |
| `pnpm ts:budget` | ✅ 10/10 |
| `pnpm run build` | ✅ |
| `pnpm qa:events` | ✅ 8/8 |
| `pnpm qa:influencer` | ✅ 8/8 |

**Recommendation:** **GO WITH NOTES**

---

## Files changed

| File | Change |
|------|--------|
| `components/business/influencer/influencer-feed.tsx` | Stack B → ActionDrawer; composerMode; media kit triggers; TS fixes |
| `scripts/convergence/influencer-actiondrawer-validation.mjs` | New vertical QA script |
| `package.json` | `qa:influencer` script |
| `scripts/typescript/ts-error-baseline.json` | 16 → 10 |
| `docs/typescript/TS_ERROR_BASELINE.md` | Baseline refresh |
| `docs/os/WORKSTREAMS.md` | WS-06 status |

**Not changed:** ActionDrawer core, morph, composer, instrumentation, institutional, mock data (except import path).

---

## Drawer stack — before / after

| Drawer ID | Before | After |
|-------------|--------|-------|
| `influencer:links` | `InstrumentedDrawerBridge` + vaul `DrawerContent` | `ActionDrawer` (`size="lg"`, `drawerId` stable) |
| `influencer:media-kit` | `InstrumentedDrawerBridge` + vaul | `ActionDrawer` (`size="lg"`) |
| Collab cards | `setCollabDrawerOpen(true)` — **no drawer rendered** | Opens `influencer:media-kit` |

**Event source delta (accepted):** `source: "instrumentation"` → `source: "action-drawer"`; `drawerKind: "other"` → `drawerKind: "action"`.

---

## TypeScript — before / after

| Metric | Before | After |
|--------|--------|-------|
| Total baseline | 16 | **10** (−6) |
| `influencer-feed.tsx` | 6 | **0** |
| Tier 1 frozen | 0 | **0** ✅ |
| institutional (unchanged) | 2 | 2 |

---

## composerMode

```typescript
const nextMode = linksDrawerOpen || mediaKitDrawerOpen ? "overlay" : "default"
```

Resets to `default` on unmount. Emits `composer.mode.changed` on open/close (observed in `qa:influencer`).

---

## Media kit triggers (wired)

Previously `mediaKitDrawerOpen` had drawer content but **zero UI triggers** (P2-07).

| Trigger | Action |
|---------|--------|
| "Ver media kit comercial" (metrics section) | Opens media kit |
| Parcerias card click (e.g. Nike) | Opens media kit |
| Story "Collabs" | Opens media kit (+ story viewer) |
| Story "Links" | Opens links drawer (+ story viewer) |

---

## Validation

### Automated

```bash
pnpm ts:budget          # 10/10 PASS
pnpm run build          # PASS
pnpm qa:events          # 8/8 PASS
pnpm qa:influencer      # 8/8 PASS
```

### Manual walkthrough (influencer vertical)

- [x] Feed loads with links, metrics, parcerias, videos, posts
- [x] "Ver todos os links" opens links drawer with copy/external actions
- [x] Escape closes drawer; body scroll restored
- [x] Media kit opens from CTA and parcerias; contact mailto works
- [x] No visual regression outside ActionDrawer chrome (handle, backdrop)

---

## Residual risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Story click opens drawer **and** story viewer | Low | Pre-existing `onStoryClick` behavior; drawers stack correctly |
| ActionDrawer 80vh cap vs vaul 95% | Low | ACCEPTED_WITH_NOTE (personal precedent) |
| `InstrumentedDrawerBridge` still used by institutional | N/A | Out of scope WS-07 |
| No close X button — Escape/backdrop only | Low | Stack A standard; documented in qa script |

---

## ignoreBuildErrors

**Mantido `true`** — 10 erros restantes (Stack B feeds + appointment-calendar). Build strict não passa naturalmente.

---

## Verdict

**GO WITH NOTES** — migration criteria met; media kit gap closed; TS −6; institutional untouched. Notes: story+drawer dual open, visual chrome delta vs vaul accepted.
