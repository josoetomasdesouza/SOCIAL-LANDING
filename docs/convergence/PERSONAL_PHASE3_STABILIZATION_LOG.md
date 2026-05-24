# Personal Phase 3 — Stabilization Log

**Date:** 2026-05-24  
**Mode:** STABILIZATION WINDOW OBSERVATION (post-merge, no code changes)  
**Decision:** **STABLE_WITH_NOTES**

---

## Environment

| Item | Value |
|------|-------|
| Main HEAD observed | `38959ccd93b02387495aa19bf882228c50f2be61` |
| Merge commit | PR #36 merge into `main` |
| Preserved commits | `43c969a` (runtime), `53d0f32` (docs) |
| Observation worktree | `/Users/josoetomasdesouza/Documents/New project/social-landing-main-stabilization` |
| Dev server | `http://localhost:3003/demo` (`next dev` @ main) |
| Original `SOCIAL-LANDING` worktree | **Not updated** — dirty @ `e002921` (intentionally untouched) |

**Note:** `main` could not be checked out in `social-landing-personal-phase3` (already checked out elsewhere). Stabilization used a **fresh detached worktree** at `origin/main` @ `38959cc`.

---

## Phase 1 — Main verification

```
38959cc Merge pull request #36 from josoetomasdesouza/workstream/personal-phase3-actiondrawer
53d0f32 Document personal phase 3 convergence learnings
43c969a Migrate personal drawers to ActionDrawer
e002921 chore(surface): instrument institutional project drawer bridge
```

✅ Merge commit + both convergence commits present on `origin/main`.

---

## Phase 2 — Personal smoke (Playwright)

**Selector:** `getByRole('heading', { name: 'Pessoal', exact: true })` → ancestor button.

| # | Scenario | Result |
|---|----------|--------|
| 1 | Open `personal:contact` | ✅ PASS |
| 2 | Close contact via X | ✅ PASS |
| 3 | Re-open contact | ✅ PASS |
| 4 | Close contact via Escape | ✅ PASS |
| 5 | Open `personal:project` (card tap) | ✅ PASS |
| 6 | Close project via X | ✅ PASS |
| 7 | Re-open project | ✅ PASS |
| 8 | Close project via Escape | ✅ PASS |
| 9 | Feed scrollable after closes | ✅ PASS |
| 10 | `body.style.overflow` clean after each close | ✅ PASS (`""`) |
| 11 | No critical console errors | ✅ PASS |

### Visual smoke (15 checks)

| Verdict | Count |
|---------|-------|
| ACCEPTED_VISUAL | 13 |
| ACCEPTED_WITH_NOTE | 1 |
| NEEDS_ADJUSTMENT | 1 (V6 — content-height ratio heuristic; not a regression) |
| BLOCKER | 0 |

**Visual notes (pre-accepted deltas, unchanged post-merge):**

- Handle bar present
- X close button present
- Backdrop `bg-black/50` present
- Title "Enviar mensagem" preserved
- `maxHeight` cap ~80vh (675px @ 844px viewport)
- Short form renders content-driven height (~40% viewport), not full cap

---

## Phase 3 — Event validation

Script: `personal-phase3-validation.mjs` — **9/9 PASS**

### personal:contact

| Event | Observed | drawerId / surfaceId |
|-------|----------|----------------------|
| drawer.opened | ✅ | `personal:contact` |
| surface.opened | ✅ | `personal:contact` |
| drawer.closed (X) | ✅ | `personal:contact` |
| surface.closed (X) | ✅ | `personal:contact` |
| drawer.closed (Escape) | ✅ | `personal:contact` |
| surface.closed (Escape) | ✅ | `personal:contact` |

### personal:project

| Event | Observed | drawerId / surfaceId |
|-------|----------|----------------------|
| drawer.opened | ✅ | `personal:project` |
| surface.opened | ✅ | `personal:project` |
| drawer.closed (X) | ✅ | `personal:project` |
| surface.closed (X) | ✅ | `personal:project` |
| drawer.closed (Escape) | ✅ | `personal:project` |
| surface.closed (Escape) | ✅ | `personal:project` |

**Title vs ID:** project visual title = "App de Produtividade"; technical ID = `personal:project` ✅

**Anomalies:** No unexpected duplication, no orphan critical events, no perceptual mismatch beyond documented Stack A chrome delta.

**Payload (expected post-convergence):** `drawerKind: action`, `source: action-drawer`, no `vertical` field.

---

## Phase 4 — Global checklist

Script: `demo-event-checklist.mjs` — **8/8 PASS**

| Step | Result |
|------|--------|
| feed.vertical.changed | ✅ |
| morph.started → morph.completed | ✅ |
| drawer.opened + surface.opened | ✅ |
| drawer.closed + surface.closed | ✅ |
| ai.surface.opened (once) | ✅ |
| ai.surface.opened not repeated | ✅ |
| composer.mode.changed | ✅ |
| whatsapp.clicked + user.intent.signal | ✅ |

No global regression detected on appointment demo path.

---

## Divergences

| ID | Description | Classification |
|----|-------------|----------------|
| D-01 | ActionDrawer chrome vs prior vaul (handle/X/80vh cap) | **Accepted delta** — documented pre-merge |
| D-02 | `drawerKind` `other` → `action` | **Accepted delta** |
| D-03 | Escape local in personal-feed only | **Accepted delta** |
| D-04 | V6 height ratio heuristic flags short-form drawer | **Non-issue** — content-driven height |

No new divergences introduced by merge.

---

## Decision

**STABLE_WITH_NOTES**

| Criterion | Status |
|-----------|--------|
| Main post-merge correct | ✅ |
| personal:contact stable | ✅ |
| personal:project stable | ✅ |
| Events integral | ✅ |
| Overflow clean | ✅ |
| Global checklist | ✅ 8/8 |
| Perceptual regression | ❌ None beyond accepted deltas |
| Blocker | ❌ None |

---

## Recommended next steps (not executed)

1. **Continue short observation window** (2–5 days) on deployed preview/production if applicable
2. **Triage dirty original worktree** (`SOCIAL-LANDING`) — separate workstreams, do not mix with converge
3. **Optional:** commit this stabilization log in a docs-only follow-up PR
4. **Do NOT** start influencer migration until stabilization window closes with human sign-off
5. **Do NOT** rollback — no evidence supports revert

---

## Commands used (reproducible)

```bash
# Worktree at main
git worktree add ../social-landing-main-stabilization origin/main

# Dev
PORT=3003 ./node_modules/.bin/next dev

# Validation (ephemeral scripts copied from prior QA session)
DEMO_URL=http://localhost:3003/demo node scripts/personal-phase3-validation.mjs
DEMO_URL=http://localhost:3003/demo node scripts/personal-phase3-visual-smoke.mjs
DEMO_URL=http://localhost:3003/demo node scripts/demo-event-checklist.mjs
```

---

## Sign-off placeholder

| Role | Status | Date |
|------|--------|------|
| Automated stabilization | ✅ STABLE_WITH_NOTES | 2026-05-24 |
| Human stabilization | ⏳ Pending | — |
