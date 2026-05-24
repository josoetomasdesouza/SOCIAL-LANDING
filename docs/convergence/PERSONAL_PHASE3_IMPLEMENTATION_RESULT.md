# Personal Phase 3 — Implementation Result

**Date:** 2026-05-24  
**Worktree:** `/Users/josoetomasdesouza/Documents/New project/social-landing-personal-phase3`  
**Branch:** `workstream/personal-phase3-actiondrawer`  
**Base:** `e002921ef7994978597c80e13d56d6e4bda3d056`  
**Mode:** IMPLEMENT SCOPED MIGRATION (complete, not committed)

---

## Precheck

| Check | Result |
|-------|--------|
| Path ends in `social-landing-personal-phase3` | ✅ |
| Branch `workstream/personal-phase3-actiondrawer` | ✅ |
| Clean base before edits | ✅ |
| HEAD @ `e002921` | ✅ |

---

## Files altered

| File | Change |
|------|--------|
| `components/business/personal/personal-feed.tsx` | Migrated contact + project drawers from `InstrumentedDrawerBridge` + shadcn/vaul to `ActionDrawer`; added local Escape handler |
| `components/business/action-drawer.tsx` | Added optional `drawerId?: string` for stable event IDs (backward compatible) |

**Not altered:** Tier 1, other verticals, event bus core, shadow, ecommerce, db, bridge component file itself.

**Ephemeral QA (untracked):** `scripts/personal-phase3-validation.mjs`, `scripts/personal-phase3-visual-smoke.mjs` — local helpers, not part of migration diff.

---

## Review + Visual Smoke

**Date:** 2026-05-24  
**Mode:** REVIEW + VISUAL SMOKE ONLY (no commit)

### Phase 1 — Precheck

| Check | Result |
|-------|--------|
| Worktree path | ✅ `social-landing-personal-phase3` |
| Branch | ✅ `workstream/personal-phase3-actiondrawer` |
| Runtime files modified | ✅ **only** `action-drawer.tsx` + `personal-feed.tsx` |
| Other tracked changes | None (docs untracked; `.next/` / `node_modules/` untracked) |

### Phase 2 — Code review (focused)

| # | Criterion | Verdict |
|---|-----------|---------|
| 1 | `drawerId?: string` optional, backward-compatible | ✅ Pass — omitted → falls back to `title` |
| 2 | No breaking change for existing ActionDrawer callers | ✅ Pass — all existing usages unchanged |
| 3 | Events use `drawerId ?? title` | ✅ Pass — `eventDrawerId` in effect |
| 4 | Visual title ≠ technical ID | ✅ Pass — project title dynamic, ID fixed |
| 5 | `personal:contact` fixed ID | ✅ Pass |
| 6 | `personal:project` fixed ID | ✅ Pass |
| 7 | Drawer content preserved | ✅ Pass — form, success state, project detail |
| 8 | Triggers preserved | ✅ Pass — "Entrar em contato", project card tap |
| 9 | Escape listener cleanup | ✅ Pass — `removeEventListener` on effect cleanup; no listener when both closed |
| 10 | Overflow cleanup | ✅ Pass — ActionDrawer `useEffect` resets `body.style.overflow` |
| 11 | Tier 1 untouched | ✅ Pass |
| 12 | Other verticals untouched | ✅ Pass — bridge still used by influencer/institutional |

### Phase 3 — Visual smoke (`personal-phase3-visual-smoke.mjs` @ localhost:3002/demo)

**Selector:** `getByRole('heading', { name: 'Pessoal', exact: true })` → ancestor button (avoids Influencer "personalidades").

| Check | Verdict | Notes |
|-------|---------|-------|
| Contact drawer opens | ACCEPTED_VISUAL | |
| Handle bar present | ACCEPTED_VISUAL | ActionDrawer chrome |
| X button present | ACCEPTED_VISUAL | |
| Backdrop present | ACCEPTED_VISUAL | `bg-black/50` |
| Title "Enviar mensagem" | ACCEPTED_VISUAL | |
| Height cap 80vh vs vaul 90vh | ACCEPTED_WITH_NOTE | `maxHeight=80vh`; rendered height content-driven (~40% viewport for short form) |
| Form fields preserved | ACCEPTED_VISUAL | |
| Close via X | ACCEPTED_VISUAL | overflow clean |
| Close via Escape | ACCEPTED_VISUAL | |
| Project visual title | ACCEPTED_VISUAL | "App de Produtividade" |
| Project technical ID | ACCEPTED_VISUAL | `personal:project` |
| Feed scrollable after closes | ACCEPTED_VISUAL | |
| No critical console errors | ACCEPTED_VISUAL | |

**Visual smoke aggregate:** **PASS_WITH_NOTES** (13 ACCEPTED_VISUAL, 2 ACCEPTED_WITH_NOTE, 0 BLOCKER)

**Re-validation:** `personal-phase3-validation.mjs` **9/9 PASS** (re-run after smoke).

### Phase 4 — Payload review

| Question | Answer |
|----------|--------|
| Consumer depends on `drawerKind=other`? | **No runtime consumer** in this branch filters on `other`. Only Stack B bridge (influencer/institutional) still emits `other`. Personal now aligns with Stack A `action`. |
| Consumer depends on `vertical` in drawer payload? | **No runtime consumer** reads `payload.vertical` for drawer routing. Field is optional per `EVENT_CONTRACTS.md`; Event Debug Panel displays JSON only. |
| Event Debug Panel / Shadow interpret correctly? | **Event Debug Panel:** ✅ shows full payload, no kind-specific logic. **Surface Shadow:** not present in this worktree (`SURFACE_SHADOW_APPLY_TO_RUNTIME = false` on main); no compare-only breakage in runtime. |
| Accepted as ActionDrawer convergence consequence? | **Yes** — personal joins restaurant/health/realestate pattern (`drawerKind: action`, `source: action-drawer`). |
| Document as migration note? | **Yes** — recorded in this section and Before/After table. |

**Payload decision:** **ACCEPT** (no code change required)

### Phase 5 — Escape review

| Question | Answer |
|----------|--------|
| Listener add/remove correct? | ✅ Effect cleanup removes handler; early return when no drawer open |
| Strict Mode duplicate? | ✅ Dev double-mount cleans up first listener; at most one active listener |
| Interferes with other drawers? | ✅ Only mounted in `PersonalFeed`; only acts when personal drawers open |
| Should be global now? | **No** — out of scope; other ActionDrawer verticals unchanged by design |
| Local acceptable this phase? | **Yes** — restores parity lost when leaving vaul; scoped to personal |

**Escape decision:** **ACCEPT** (keep local; do not globalize ActionDrawer Escape in this PR)

### Risks consciously accepted for commit

1. **Visual shell** — ActionDrawer handle + X + 80vh cap (not 90vh vaul); aligns with Stack A, not pixel-parity with old Stack B.
2. **Payload** — `drawerKind: action`, no `vertical` field; stable IDs unchanged (`personal:contact`, `personal:project`).
3. **Escape** — personal-feed local only; not a global ActionDrawer behavior change.

### Blockers

**None.**

---

## Recommendation (updated after review)

**COMMIT_WITH_NOTES**

- Implementation scoped: ✅
- Code review: ✅
- Visual smoke: ✅ PASS_WITH_NOTES
- Event validation: ✅ 9/9 + checklist 8/8
- Payload + Escape: ✅ ACCEPT
- Blockers: none

Commit **only** runtime files + this doc when human authorizes. Do not include `.next/`, `node_modules/`, ephemeral QA scripts unless explicitly requested.

**Not recommended:** treating as zero-note COMMIT without acknowledging the three accepted deltas above.

---

## Recommendation (prior — superseded)

~~**NEEDS REVIEW → then COMMIT**~~

---

## Commit message suggestion (when authorized)

```
feat(personal): migrate contact and project drawers to ActionDrawer

Replace Stack B InstrumentedDrawerBridge with ActionDrawer on personal
vertical only. Add optional drawerId prop for stable event IDs.

Notes:
- drawerKind other→action; vertical field omitted (Stack A parity)
- Escape handled locally in personal-feed (not global ActionDrawer)
- Visual: ActionDrawer chrome (handle/X/80vh cap) vs prior vaul 90vh
```

---

## Migration summary

### Before
- Stack B: `InstrumentedDrawerBridge` wrapping shadcn `Drawer` / `DrawerContent`
- IDs via `drawerId` prop on bridge
- `drawerKind: "other"`, `vertical: "personal"`, `source: "instrumentation"`
- Escape handled by vaul
- Close via vaul overlay / default shadcn behavior

### After
- Stack A pattern: native `ActionDrawer` (same as restaurant, health, realestate, etc.)
- Stable IDs via `drawerId="personal:contact"` / `personal:project`
- Visual title remains human-readable (`Enviar mensagem`, project title)
- `drawerKind: "action"`, `source: "action-drawer"` (ActionDrawer default)
- Escape via `useEffect` keydown listener in `personal-feed.tsx` only
- Close via ActionDrawer X button, backdrop click, Escape

### Drawers migrated
1. **personal:contact** — trigger: "Entrar em contato" button in Sobre section
2. **personal:project** — trigger: project card tap in Projetos section

---

## Git diff summary

```
 components/business/action-drawer.tsx          |  10 +-
 components/business/personal/personal-feed.tsx | 139 ++++++++++++-------------
 2 files changed, 74 insertions(+), 75 deletions(-)
```

---

## Events confirmed (Playwright @ localhost:3002/demo)

| Scenario | drawer.opened | surface.opened | drawer.closed | surface.closed | drawerId |
|----------|---------------|----------------|---------------|----------------|----------|
| Contact open | ✅ | ✅ | — | — | `personal:contact` |
| Contact close (X) | — | — | ✅ | ✅ | `personal:contact` |
| Contact close (Escape) | — | — | ✅ | ✅ | `personal:contact` |
| Project open | ✅ | ✅ | — | — | `personal:project` |
| Project close (X) | — | — | ✅ | ✅ | `personal:project` |
| Project close (Escape) | — | — | ✅ | ✅ | `personal:project` |

**Overflow:** `document.body.style.overflow` clean (`""`) after close — ✅  
**Console:** no critical errors — ✅

---

## Before / after differences (intentional or residual)

| Aspect | Before (bridge) | After (ActionDrawer) |
|--------|-----------------|----------------------|
| Drawer shell | vaul/shadcn slide | ActionDrawer slide + handle + X header |
| Max height | `max-h-[90vh]` | `size="lg"` → 80vh |
| `drawerKind` in events | `other` | `action` |
| `vertical` in payload | `personal` | omitted |
| `source` | `instrumentation` | `action-drawer` |
| Close affordance | shadcn default | X button + backdrop |
| Escape | vaul native | personal-feed local handler |

Content, triggers, and stable IDs preserved. Visual shell aligns with Stack A verticals.

---

## Validations executed

| Validation | Result | Notes |
|------------|--------|-------|
| `scripts/personal-phase3-validation.mjs` | **9/9 PASS** | Personal contact + project flows |
| `scripts/demo-event-checklist.mjs` | **8/8 PASS** | Global regression (appointment vertical) |
| `pnpm typecheck` | Not clean | Pre-existing repo-wide TS errors (unchanged by this diff) |
| `pnpm lint` | Blocked | pnpm `ERR_PNPM_IGNORED_BUILDS` on this machine; not run via pnpm wrapper |
| Dev server | ✅ | `./node_modules/.bin/next dev` @ port 3002 |

---

## Errors found

None blocking migration scope.

- Auto-generated `next-env.d.ts` touched by Next dev — **reverted** before report.
- Playwright selector pitfall: `/Pessoal/i` matches Influencer card ("personalidades") — fixed in validation script only.

---

## Residual risks

1. **Perceptual parity** — ActionDrawer chrome (handle, X, 80vh vs 90vh) differs from prior vaul drawer; human visual review recommended.
2. **Event payload drift** — `drawerKind`, `vertical`, `source` differ from bridge era; shadow/compare tools keyed on `other` + `vertical` may need updated expectations for personal only.
3. **Escape scope** — Escape handler is personal-feed local, not ActionDrawer global (matches scope constraint; other ActionDrawer verticals unchanged).
4. **pnpm scripts** — `pnpm dev` / `pnpm typecheck` fail on this machine due to ignored build scripts; use `./node_modules/.bin/next` / `./node_modules/.bin/tsc` directly.

---

## Rollback path

```bash
cd "/Users/josoetomasdesouza/Documents/New project/social-landing-personal-phase3"
git checkout -- components/business/personal/personal-feed.tsx components/business/action-drawer.tsx
```

Or reset branch to `e002921` if no commit yet.
