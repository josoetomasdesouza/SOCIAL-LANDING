# Runtime Reality Audit — Social Landing

**Date:** 2026-05-24  
**Mode:** RUNTIME REALITY AUDIT (operational, not architectural)  
**Baseline:** `main` @ `38959cc` (post Personal Phase 3 merge)  
**Evidence:** codebase inspection + post-merge Playwright stabilization @ `38959cc`

---

## Executive snapshot

Social Landing is **operationally functional** and **perceptually hybrid**: a mature demo platform with **three coexisting drawer stacks**, **per-vertical composer behavior**, and **recent proof** that controlled convergence works — but **not yet one unified product feel** across all 12 verticals.

| Signal | Verdict |
|--------|---------|
| Can ship demo reliably? | **Yes** — 8/8 global checklist, personal 9/9 post-merge |
| One coherent drawer UX? | **No** — Stack A / Stack B / feed drawer still diverge |
| Governance matches runtime on main? | **Partially** — convergence docs on main; deeper audit pack mostly off-main |
| Hidden fragility? | **Moderate** — scroll lock, composerMode duplication, typecheck disabled |

---

## Fase 1 — Realidade operacional

### Drawer landscape (12 demo verticals)

| Implementation | Verticals | Count |
|----------------|-----------|-------|
| **ActionDrawer** (Stack A) | appointment, courses, ecommerce, events, gym, health, professionals, realestate, restaurant, **personal** | **10** |
| **InstrumentedDrawerBridge** + vaul (Stack B) | influencer, institutional | **2** |
| **BusinessFeedDrawer** (content posts) | all via `BusinessSocialLanding` | **12** |

**Solid:** ActionDrawer is the dominant pattern; personal join did not break global demo paths. Stable IDs work on personal via `drawerId` prop. Overflow cleanup verified post-merge on personal.

**Fragile:** Three drawer implementations with different scroll lock, chrome, Escape, and max-height semantics. Stack B still emits `drawerKind: other` + `vertical`; Stack A emits `drawerKind: action` without `vertical`.

**Improvised:** Personal is the **only** ActionDrawer vertical with a **local Escape handler**. Most ActionDrawer callers still use **title as event ID** (no `drawerId`) — works until dynamic titles need stable IDs.

**Mature:** Event instrumentation (`drawer.opened` ↔ `surface.opened`) is wired and testable. `demo-event-checklist.mjs` catches regressions on appointment/morph/composer/WhatsApp paths.

**Inconsistent:** User switching **Pessoal** (ActionDrawer) → **Influencer** (vaul) → **Institutional** (vaul) will feel **two platforms**: handle/X/80vh vs shadcn slide/90vh, different close affordances.

---

### Composer + drawer coupling

**Observation:** `setComposerMode` appears in **9** ActionDrawer-heavy feeds (appointment, ecommerce, etc.) — **not** in personal, influencer, or institutional feed files.

| Behavior | Verticals |
|----------|-----------|
| Drawer open may drive `composerMode` overlay/hidden | Most Stack A commerce/booking verticals |
| Drawer open does **not** adjust composer from feed | personal, influencer, institutional |

**Impact:** Same `/demo` product; **different composer coexistence** when drawers open. Not a bug from stabilization — **structural inconsistency** users may feel as “some sections hide the chat bar, others don’t.”

---

### Morph + feed drawer

**Solid:** Morph long-press + `BusinessFeedDrawer` tap path still passes checklist on main. Temporal ordering (composer overlay before drawer.opened on feed path) was classified TEMPORALLY_VALID in prior observation — runtime matches that model.

**Fragile:** Morph + feed drawer + ActionDrawer + composer share z-index/scroll contracts documented in `FROZEN_SYSTEMS.md` but enforced by **manual QA**, not CI.

---

### Mobile viewport, keyboard, overflow

| Area | Reality |
|------|---------|
| Mobile layout | Feed column + fixed composer — intentional, stable |
| Body overflow | ActionDrawer sets/clears `document.body.style.overflow` — **verified clean** on personal post-merge |
| Escape | vaul (Stack B) native; ActionDrawer **none** except personal local fix |
| Keyboard / composer | Real device matrix **not** fully automated in repo |
| Backdrop | ActionDrawer `bg-black/50` fixed; Stack B uses vaul overlay |

---

### Event integrity

**Post-merge evidence (main @ `38959cc`):**

- personal:contact / personal:project — full open/close pairs, correct IDs
- Global demo — morph, feed drawer, composer.mode, WhatsApp — pass

**Drift:** Payload shape differs by stack (`action` vs `other`, `vertical` present vs absent). No runtime consumer breaks today; observability/compare tools must know the split.

---

### Stack coexistence summary

```
┌─────────────────────────────────────────────────────────┐
│  /demo — one product narrative, three drawer engines     │
├─────────────────────────────────────────────────────────┤
│  BusinessFeedDrawer  → content posts (all verticals)    │
│  ActionDrawer        → 10 verticals (incl. personal)      │
│  vaul + bridge       → influencer, institutional (2)    │
└─────────────────────────────────────────────────────────┘
```

**Answer:** Yes — **two drawer UX families** plus feed drawer still coexist. Personal reduced Stack B from 3 → 2 verticals; did **not** unify the platform.

---

## Fase 3 — Runtime drift (docs ↔ contracts ↔ observed behavior)

| Area | Classification | Notes |
|------|----------------|-------|
| Personal convergence outcome | **HEALTHY_ALIGNMENT** | Matches spec, stabilization STABLE_WITH_NOTES |
| Event contracts doc vs Stack A payloads | **MINOR_DRIFT** | Contracts list optional `vertical?`; ActionDrawer omits it |
| FROZEN_SYSTEMS “three drawer implementations” | **HEALTHY_ALIGNMENT** | Still true; personal moved between buckets |
| Temporal-semantic governance docs | **IMPORTANT_DRIFT** | Rich audit/temporal pack exists in **dirty worktree**, not all on `main` |
| `lib/surfaces` reducer / machine | **IMPORTANT_DRIFT** | Code on main; **not applied to Tier 1** — docs in dirty tree describe shadow/compare; main runtime unaffected |
| `typescript.ignoreBuildErrors: true` | **IMPORTANT_DRIFT** | Docs acknowledge TS debt; build still ships with type errors ignored |
| “Platform converged to ActionDrawer” | **IMPORTANT_DRIFT** | Narrative ahead of reality — **5 Stack B drawers** remain |
| Escape parity across ActionDrawer | **MINOR_DRIFT** | Docs accept local Escape; product inconsistent across Stack A |
| CI enforcement of checklists | **IMPORTANT_DRIFT** | Validation scripts exist ephemerally — **not in repo/CI** |

**No CRITICAL_DRIFT** identified for runtime stability post Personal Phase 3 merge.

---

## Operational maturity scorecard

| Dimension | Score | Evidence |
|-----------|-------|----------|
| Drawer open/close reliability | **8/10** | Playwright pass; overflow clean |
| Cross-vertical consistency | **5/10** | Stack A/B split + composer coupling gap |
| Event observability | **7/10** | Bus works; payload heterogeneity |
| Mobile hardening | **6/10** | Designed for mobile; limited automated device matrix |
| Convergence mechanics | **8/10** | First migrate proven; protocol repeatable |
| Build/type integrity | **4/10** | ignoreBuildErrors; TS errors pre-existing |
| Doc ↔ main alignment | **6/10** | Convergence docs on main; deep governance split across worktrees |

---

## What is actually solid

1. **Tier 1 morph + composer spine** — untouched by convergence; checklist green  
2. **Passive event bus** — fire-and-forget, no reducer creep in runtime  
3. **Personal migration** — stable on main with known accepted deltas  
4. **Controlled migration protocol** — produced real safety, not theater  
5. **Demo as integration test** — `/demo` exercises cross-cutting paths  

---

## What is actually fragile

1. **Dual Stack A/B drawer UX** — user-visible on vertical switch  
2. **Per-vertical composerMode logic** — duplicated, absent on 3 verticals  
3. **Escape inconsistency** — personal only  
4. **Title-as-ID** on most ActionDrawers — latent event ID bugs  
5. **QA not institutionalized** — scripts not committed; no CI gate  
6. **Typecheck disabled in build** — silent structural decay  

---

## Recommendations (audit-only — no code)

1. **Do not accelerate convergence** until stabilization human sign-off + PR #37 merged  
2. **Promote checklists to repo/CI** before next vertical — highest ROI anti-false-safety step  
3. **Document Stack B vs A user-visible deltas** in one page — reduce illusion of “done”  
4. **Dirty tree triage** — separate governance docs PR from runtime workstreams  
5. **Next converge:** influencer with explicit composer/Escape decision — don’t copy personal blindly  

---

## Related artifacts on main

- `docs/convergence/*` (PR #36) — protocol + personal results  
- `docs/audit/*` (14 files) — strategic baseline pre–Personal Phase 3  
- `docs/convergence/PERSONAL_PHASE3_STABILIZATION_LOG.md` — on branch PR #37, pending main  
