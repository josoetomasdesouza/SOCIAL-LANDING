# WS-02 — PR #52 Validation Report

**Date:** 2026-05-24  
**Workstream:** WS-02 — Drawer perceptual hygiene validation & merge prep  
**Validator:** Agent (technical + code review); perceptual manual **pending human sign-off**

---

## Summary

| Field | Value |
|-------|-------|
| **Base main** | `7cd0fe5` — Merge PR #54 (WS-01 operational hygiene) |
| **Branch validated** | `fix/drawer-perceptual-hygiene` @ `6fbf3d2` |
| **PR** | [#52](https://github.com/josoetomasdesouza/SOCIAL-LANDING/pull/52) — OPEN (not merged) |
| **Rebase on main** | ✅ Success — **0 conflicts** |
| **Remote updated** | ✅ `origin/fix/drawer-perceptual-hygiene` force-pushed post-rebase |
| **Final recommendation** | **GO WITH NOTES** |

---

## Rebase record

```
origin/main: 7cd0fe5
branch HEAD: 6fbf3d2

Commits (5, rebased):
  6fbf3d2 fix(drawers): pin CTAs to composer slot and unify cart/scroll behavior
  0aec26f fix(feed-drawer): restore opaque sheet by isolating backdrop opacity
  3451848 fix(drawers): bidirectional drag globally and remove close buttons
  e503bef fix(drawers): global 10dvh scroll end clearance for all drawer stacks
  7d15e73 fix(drawers): restore drag-close, stable dvh height, composer-safe scroll padding
```

**Conflicts:** none  
**Functional scope changes during rebase:** none

---

## Files altered by PR (28 total)

### Frozen-zone core (intentional — WS-02 scope)

| Path | Δ | Zone |
|------|---|------|
| `components/business/action-drawer.tsx` | +181/−79 | ActionDrawer 🔴 |
| `lib/ui/use-drawer-sheet-drag.ts` | +359 (new) | ActionDrawer 🔴 |
| `lib/ui/drawer-layout.ts` | +65 (new) | ActionDrawer 🔴 |
| `components/ui/drawer-drag-chrome.tsx` | +67 (new) | ActionDrawer 🔴 |
| `components/business/conversational-ai.tsx` | +108/−3 | Composer 🔴 |
| `lib/ui/composer-scroll-clearance.ts` | +193 (new) | Composer 🔴 |
| `components/ui/composer-overlay-clearance.tsx` | +30 (new) | Composer 🔴 |
| `components/business/conversation-selection-context.tsx` | +24 | Feed baseline 🟡 |

### Periphery / wiring (allowed)

| Path | Δ | Notes |
|------|---|-------|
| `components/business/checkout-flows.tsx` | +294/−84 | `onRegisterFooter` for checkout CTAs |
| `components/business/ecommerce/ecommerce-feed.tsx` | +34/−30 | Cart/checkout wiring |
| `components/business/restaurant/restaurant-feed.tsx` | +4/−14 | Header cart; bottom bar removed |
| `components/business/appointment/appointment-feed.tsx` | +8/−8 | Barbearia + `autoScrollToTimes` |
| `components/business/appointment-calendar.tsx` | +4/−1 | Scroll above pinned footer |
| `components/business/gym/gym-feed.tsx` | +8/−4 | Signup footer wiring |
| `components/business/realestate/realestate-feed.tsx` | +8/−4 | Visit form footer |
| `components/business/health/health-feed.tsx` | +32/−22 | `ProfessionalDrawer` footer prop |
| `components/business/courses/courses-feed.tsx` | +8/−4 | Checkout footer |
| `components/business/events/events-feed.tsx` | +8/−4 | Ticket checkout footer |
| `components/business/business-feed-drawer.tsx` | +69/−40 | Drag + clearance |
| `components/social-landing/feed-drawer.tsx` | +65/−36 | Backdrop isolation |
| `components/business/business-social-landing.tsx` | +26/−18 | Header cart API |
| `lib/ui/scroll-into-view-with-bottom-inset.ts` | +86 (new) | Calendar auto-scroll helper |
| `lib/ui/drawer-scroll-clearance.ts` | +5 (new) | Shared clearance constant |
| `components/ui/drawer.tsx` | +7/−5 | Handle chrome |
| `components/business/influencer/influencer-feed.tsx` | +2/−2 | Minor offset cleanup |
| `components/business/institutional/institutional-feed.tsx` | +3/−3 | Minor offset cleanup |
| `components/business/instrumented-drawer-bridge.tsx` | +1/−1 | Bridge touch |
| `components/business/post-to-chat-morph-layer.tsx` | +1/−1 | z-index adjacency only |

### Explicitly NOT in diff

- ❌ `package.json`, lockfiles
- ❌ `lib/db/**`, `drizzle/**`, `app/api/media/**`
- ❌ AI resolver paths (`lib/mock-data/conversational-search.ts`, etc.)
- ❌ Identity / username / slug routes
- ❌ Any `docs/**` (validation report added post-validation in WS-02)

**Total:** +1696 / −359 lines across 28 runtime files.

---

## Technical validation

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm run build` | ✅ **PASS** | Next.js 16; types validation skipped by config |
| `pnpm run typecheck` | ❌ **FAIL** | 1 error **in PR file** + pre-existing errors elsewhere |
| `pnpm lint` | ⚠️ **N/A** | `eslint` not present in `node_modules` (not in devDependencies) |
| `pnpm qa:events` | ❌ **FAIL** | Step 1 — see below |
| Rebase conflicts | ✅ None | |
| Out-of-scope paths | ✅ None | |

### Typecheck — PR-introduced

```
lib/ui/composer-scroll-clearance.ts(75,3): error TS2322
  LegacyComposerScrollClearanceOptions not assignable to ComposerScrollClearanceOptions
```

**Pre-existing (not introduced by PR):** `lib/mock-data/realestate-data.ts`, `lib/rules/rule-registry.ts` — multiple TS errors on main branch baseline.

**Action:** Non-blocker for runtime (build skips types), but should be fixed before WS-05 TypeScript gate or in a follow-up patch on this branch.

### qa:events output

```
FAIL 1. feed.vertical.changed — count=0
locator.scrollIntoViewIfNeeded: Timeout 30000ms exceeded.
  waiting for locator('#section-tutoriais-e-tendencias article').first()
```

**Analysis:**

1. Step 1 failed before morph/drawer/composer steps — vertical switch to "Agendamento" did not emit `feed.vertical.changed` (or event bus not logging in headless session).
2. Script references `#section-tutoriais-e-tendencias` — selector may not match current demo DOM for appointment vertical.
3. PR **removes explicit "Fechar" buttons** (drag-dismiss) — steps 4 and 7 in `demo-event-checklist.mjs` rely on `getByRole("button", { name: "Fechar" })`. **Script drift — not a runtime regression by itself**, but checklist is stale for post-#52 behavior.

**Recommendation:** Update `scripts/runtime/demo-event-checklist.mjs` in WS-04 (QA infra) to use drag-dismiss or backdrop click; re-run before merge GO.

---

## Per-vertical validation

Legend: **CR** = code review confirmed wiring · **MP** = manual perceptual pending human · **N/A** = not primary target

| Vertical | Drawer open/close | CTA pinned | Scroll interno | Composer visible | Specific checks | Status |
|----------|-------------------|------------|----------------|------------------|-----------------|--------|
| **E-commerce** | CR: drag hook + ActionDrawer | CR: `onRegisterFooter` on checkout | CR: overlay clearance | CR: mode effects in feed | Product/cart/checkout flow wired | **MP** |
| **Restaurante** | CR: same stack | CR: checkout `onRegisterFooter` | CR: 10dvh clearance | CR: `composerMode` on drawers | **Header cart** via `onHeaderCartClick` + `headerCartCount`; bottom bar removed | **MP** |
| **Barbearia** | CR: appointment feed | CR: calendar + confirmation | CR: **`autoScrollToTimes`** + `scroll-into-view-with-bottom-inset` | CR: hidden when drawer open | Time slots above pinned footer after date pick | **MP** |
| **Gym** | CR: ActionDrawer | CR: `GymSignupForm` + `onRegisterFooter` | CR: clearance utils | CR: offset cleanup | Signup CTA pinned when composer hidden | **MP** |
| **Imóveis** | CR: visit drawer | CR: `ScheduleVisitForm` + `onRegisterFooter` | CR: clearance | CR: offset cleanup | Visit scheduling CTA | **MP** |
| **Saúde** | CR: `ProfessionalDrawer` uses `footer` prop on ActionDrawer | CR: pinned when `composerMode === "hidden"` | CR: no `autoScrollToTimes` (manual scroll) | CR: mode hidden on drawer | Confirmation drawer separate | **MP** |

### Checklist (VALIDATION_PROTOCOL)

| Item | Code review | Manual /demo |
|------|-------------|--------------|
| Drawer abre e fecha (drag + backdrop) | ✅ Implemented | ⏳ Pending |
| CTA pinned não cobre conteúdo | ✅ `shouldPinFooterToScreen` + inset math | ⏳ Pending |
| Scroll interno funciona | ✅ `DrawerScrollBody` + padding | ⏳ Pending |
| Composer não fica escondido (default path) | ✅ Mode restore patterns preserved | ⏳ Pending |
| Header cart restaurante | ✅ Wired in PR | ⏳ Pending |
| Checkout fluxo esperado | ✅ `onRegisterFooter` pattern | ⏳ Pending |
| Tier 1 morph não regrediu | ✅ Morph layer ±1 line (z-index) | ⏳ Pending |
| Eventos emitindo | ❌ qa:events failed; script drift | ⏳ Re-run after script fix |

---

## Freeze zone adherence

| Zone | PR touches? | Within WS-02 mandate? | Notes |
|------|-------------|-------------------------|-------|
| ActionDrawer core | ✅ Yes | ✅ Yes — explicit WS-02 | Pin footer, drag, dvh height, clearance |
| Morph runtime | Minimal (+1/−1) | ✅ | No timing/duration changes |
| Composer core | ✅ Yes | ✅ Yes — metrics/clearance | `composerMode` literals unchanged |
| Instrumentation | +1 line bridge | ✅ | Event contracts not altered |
| E-commerce resolver | ❌ No | ✅ | |
| Feed baseline | 🟡 Wiring only | ✅ | Header cart, footer registration |
| DB / media | ❌ No | ✅ | |
| AI resolver | ❌ No | ✅ | |

`FREEZE_ZONES.md` documents PR #52 as **implicit GO during convergence**; after merge, zones return to 🔴 frozen.

---

## Residual risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| `qa:events` script incompatible with drag-dismiss (no Fechar button) | 🟡 Medium | Update checklist in WS-04; manual event verification on /demo |
| TS error in `composer-scroll-clearance.ts` normalize helper | 🟡 Medium | One-line type fix before or right after merge |
| Large diff in frozen cores (+1696 lines) | 🟡 Medium | Single-lane merge; no parallel runtime PRs |
| Health calendar without `autoScrollToTimes` | 🟢 Low | Only barbearia enables auto-scroll; acceptable parity gap → WS-03 |
| Influencer/institutional minimal changes | 🟢 Low | Stack B — out of WS-02 scope |
| Pre-existing typecheck debt | 🟢 Low | WS-05 gate |
| Manual perceptual not signed off | 🟡 Medium | **Required before merge GO** |

---

## Areas explicitly NOT touched

- [x] AI resolver / conversational-search
- [x] DB / Drizzle / media API
- [x] Identity / username / slug
- [x] `package.json` / lockfiles
- [x] New product features beyond drawer/composer hygiene

---

## Recommendation

### **GO WITH NOTES**

**Ready for merge prep when:**

1. Human completes manual `/demo` walkthrough for all 6 verticals (checklist above).
2. Event protocol re-validated — either fix `demo-event-checklist.mjs` for drag-dismiss or document manual event capture.
3. Optional: fix TS2322 in `composer-scroll-clearance.ts` (5-minute patch, same branch).

**Do NOT merge until:**

- Manual perceptual sign-off recorded (append section below or PR comment).
- Explicit human GO on Tier 1 frozen zone changes.

---

## Manual sign-off (human — fill before merge)

```markdown
### Perceptual sign-off @ /demo

- [ ] E-commerce — cart, checkout, composer overlay
- [ ] Restaurante — header cart badge, no bottom bar
- [ ] Barbearia — date → times visible above CTA
- [ ] Gym — signup CTA pinned
- [ ] Imóveis — visit CTA pinned
- [ ] Saúde — professional drawer + confirmation

Signed: ___________  Date: ___________
Decision: GO / NO-GO
```

---

## Next step (do not execute automatically)

**WS-02 completion:** Human perceptual pass + event checklist update → then merge PR #52 as single runtime lane.

**After merge:** WS-03 Stack A parity (health auto-scroll, remaining gaps per `OPERATIONAL_HYGIENE_REPORT.md`).

---

## References

- [`docs/os/VALIDATION_PROTOCOL.md`](../os/VALIDATION_PROTOCOL.md)
- [`docs/os/FREEZE_ZONES.md`](../os/FREEZE_ZONES.md)
- [`docs/os/OPERATIONAL_HYGIENE_REPORT.md`](../os/OPERATIONAL_HYGIENE_REPORT.md)
- PR [#52](https://github.com/josoetomasdesouza/SOCIAL-LANDING/pull/52)
