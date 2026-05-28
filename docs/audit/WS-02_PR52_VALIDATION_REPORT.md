# WS-02 — PR #52 Validation Report

**Date:** 2026-05-24  
**Workstream:** WS-02 — Drawer perceptual hygiene validation & merge prep  
**Validator:** Agent (technical + code review)  
**Last updated:** WS-02 blocker pass (TS fix + qa script alignment)

---

## Summary

| Field | Value |
|-------|-------|
| **Base main** | `7cd0fe5` — Merge PR #54 (WS-01 operational hygiene) |
| **Branch validated** | `fix/drawer-perceptual-hygiene` (rebased + blocker fixes pending push) |
| **PR** | [#52](https://github.com/josoetomasdesouza/SOCIAL-LANDING/pull/52) — OPEN (not merged) |
| **Rebase on main** | ✅ Success — **0 conflicts** |
| **Blocker fixes (this pass)** | TS2322 ✅ · qa script drawer dismiss ✅ |
| **Final recommendation** | **GO WITH NOTES** |

---

## Rebase record

```
origin/main: 7cd0fe5

Commits (5 runtime, rebased):
  fix(drawers): pin CTAs to composer slot and unify cart/scroll behavior
  fix(feed-drawer): restore opaque sheet by isolating backdrop opacity
  fix(drawers): bidirectional drag globally and remove close buttons
  fix(drawers): global 10dvh scroll end clearance for all drawer stacks
  fix(drawers): restore drag-close, stable dvh height, composer-safe scroll padding
```

**Conflicts:** none  
**Functional scope changes during rebase:** none

---

## Blocker resolution (WS-02 pass 2)

| Blocker | Action | Status |
|---------|--------|--------|
| TS2322 `composer-scroll-clearance.ts:75` | Explicit return type in `normalizeClearanceOptions` | ✅ **Fixed** |
| `qa:events` stale "Fechar" button | Steps 4 + 7 use **Escape** dismiss; mirror `console.debug` passive events to `console.log`; wait for React hydration | ✅ **Script updated** |
| Restore close X for tests | Not done — intentionally avoided | ✅ N/A |
| UX / ActionDrawer scope creep | No new features; TS + script only in this pass | ✅ |

### Diff added in blocker pass (3 files)

| File | Change |
|------|--------|
| `lib/ui/composer-scroll-clearance.ts` | TS2322 fix in `normalizeClearanceOptions` (+4/−1) |
| `scripts/runtime/demo-event-checklist.mjs` | Escape dismiss, hydration wait, passive-event capture, `networkidle` goto |
| `docs/audit/WS-02_PR52_VALIDATION_REPORT.md` | This update |

**PR runtime diff remains 28 files / +1696 −359** (unchanged scope from original #52).

---

## Technical validation (latest run)

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm run build` | ✅ **PASS** | After TS fix |
| `pnpm run typecheck` | ⚠️ **FAIL (pre-existing)** | **No error in `composer-scroll-clearance.ts`** — confirmed `NO_PR_TS_ERROR` |
| `pnpm lint` | ⚠️ **N/A** | `eslint` not in devDependencies |
| `pnpm qa:events` | ⚠️ **NOT VERIFIED (agent env)** | Script updated; headless run blocked — React hydration timeout on local dev (see below) |
| Out-of-scope paths | ✅ None | No package/db/ai/identity |

### Typecheck — PR file

**Before:** `composer-scroll-clearance.ts(75,3): error TS2322`  
**After:** ✅ **Resolved**

**Remaining errors:** pre-existing debt (`realestate-data.ts`, `rule-registry.ts`, `gym-feed.tsx`, Stack B feeds, etc.) — tracked for WS-05, not introduced by #52.

### qa:events — script changes

```javascript
// Drawer dismiss: Escape (ActionDrawer + BusinessFeedDrawer support Escape)
await dismissDrawer(page)

// Passive events: mirror console.debug → console.log (DEV logger uses debug)
await context.addInitScript(...)

// Readiness: wait for React hydration before vertical select
await waitForClientHydration(page)
```

**Agent run result (2026-05-24):**

```
page.waitForFunction: Timeout 30000ms exceeded.
  at waitForClientHydration — React __react* keys never attached on button
```

**Cause:** local Next dev in agent environment did not hydrate client components (HMR/WebSocket warnings; multiple lockfiles / workspace root warning). **Not attributed to PR #52 regression.**

**Required before merge GO:** re-run locally with healthy dev server:

```bash
pnpm dev          # confirm http://localhost:3000/demo hydrates (click Agendamento works)
pnpm qa:events    # expect 8/8 steps PASS
```

---

## Files altered by PR #52 (28 runtime + 1 doc)

See prior section — frozen cores (ActionDrawer, composer clearance, drag hook) + periphery wiring (checkout footers, restaurant header cart, barbearia auto-scroll, health footer prop).

### Explicitly NOT in diff

- ❌ `package.json`, lockfiles
- ❌ `lib/db/**`, AI resolver, identity/slug
- ❌ Botão "Fechar" restaurado

---

## Per-vertical validation

Legend: **CR** = code review · **MP** = manual perceptual (human `/demo`) · **AUTO** = automated (blocked in agent env)

| Vertical | Drawer open/close | CTA pinned | Scroll | Composer | Specific | Status |
|----------|-------------------|------------|--------|----------|----------|--------|
| **E-commerce** | CR: drag + Escape | CR: `onRegisterFooter` checkout | CR: overlay clearance | CR: feed modes | Cart/checkout wired | **MP** |
| **Restaurante** | CR: same | CR: checkout footer | CR: 10dvh | CR: drawer modes | Header cart (`onHeaderCartClick`) | **MP** |
| **Barbearia** | CR: appointment | CR: calendar CTA | CR: `autoScrollToTimes` | CR: hidden on drawer | Times above pinned footer | **MP** |
| **Gym** | CR: ActionDrawer | CR: `GymSignupForm` | CR: clearance | CR: offset cleanup | Signup pinned | **MP** |
| **Imóveis** | CR: visit drawer | CR: `ScheduleVisitForm` | CR: clearance | CR: offset cleanup | Visit CTA | **MP** |
| **Saúde** | CR: `ProfessionalDrawer` + `footer` | CR: pinned when hidden | CR: manual scroll | CR: mode hidden | Confirmation drawer | **MP** |

### Checklist (VALIDATION_PROTOCOL)

| Item | Code review | Manual /demo |
|------|-------------|--------------|
| Drawer abre | ✅ | ⏳ Human |
| Drawer fecha (drag / Escape / backdrop) | ✅ | ⏳ Human |
| Scroll interno | ✅ | ⏳ Human |
| CTA pinned não cobre conteúdo | ✅ | ⏳ Human |
| Composer visível quando aplicável | ✅ | ⏳ Human |
| Checkout sem regressão | ✅ wiring | ⏳ Human |
| Tier 1 morph | ✅ ±1 line | ⏳ Human |
| Eventos coerentes | ✅ script aligned | ⏳ Re-run `pnpm qa:events` locally |

---

## Freeze zone adherence

Unchanged from prior pass — PR #52 touches ActionDrawer/composer with convergence GO; morph/instrumentation minimal; no resolver/DB/identity.

---

## Residual risks

| Risk | Severity | Status |
|------|----------|--------|
| TS2322 composer clearance | 🟡 | ✅ **Resolved** |
| qa script / Fechar drift | 🟡 | ✅ **Script fixed** — local re-run pending |
| Agent env hydration | 🟡 | Environmental — verify on developer machine |
| Manual perceptual unsigned | 🟡 | **Required before merge** |
| Pre-existing typecheck debt | 🟢 | WS-05 |
| Large frozen-core diff | 🟡 | Single-lane merge only |

---

## Recommendation

### **GO WITH NOTES**

**Blockers cleared in code:**

1. ✅ TS2322 in PR file  
2. ✅ qa script aligned with drag-dismiss / Escape (no Fechar restoration)

**Still required before merge:**

1. Human `/demo` walkthrough — 6 verticals (checklist below)  
2. Local `pnpm qa:events` PASS on dev server with working hydration  
3. Explicit human GO on Tier 1 changes  

**Do NOT merge #52 until manual sign-off + qa:events green locally.**

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

pnpm qa:events: PASS / FAIL — ___________

Signed: ___________  Date: ___________
Decision: GO / NO-GO
```

---

## Next step

1. Push blocker-fix commit to `fix/drawer-perceptual-hygiene`  
2. Human: `/demo` + `pnpm qa:events`  
3. If green → merge PR #52 (single runtime lane)  
4. WS-03 Stack A parity  

---

## References

- [`docs/os/VALIDATION_PROTOCOL.md`](../os/VALIDATION_PROTOCOL.md)
- [`docs/os/FREEZE_ZONES.md`](../os/FREEZE_ZONES.md)
- PR [#52](https://github.com/josoetomasdesouza/SOCIAL-LANDING/pull/52)
