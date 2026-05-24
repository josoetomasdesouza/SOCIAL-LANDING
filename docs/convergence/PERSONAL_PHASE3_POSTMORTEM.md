# Personal Phase 3 — Post-Migration Postmortem

**Date:** 2026-05-24  
**Commit:** `43c969aa3f02007d742fdd09f19d7e546e432ba9`  
**Branch:** `workstream/personal-phase3-actiondrawer`  
**Base:** `e002921`  
**Mode:** POST-MIGRATION CONSOLIDATION (docs only)

---

## Executive summary

Personal was the **first controlled real convergence** on Social Landing: Stack B (`InstrumentedDrawerBridge` + shadcn/vaul) → Stack A (`ActionDrawer`) for two drawers only, with zero runtime contamination of the main working tree.

The migration succeeded not because the code change was large, but because **process gates worked**: isolation, spec, observation, scoped implement, automated validation, visual smoke, payload/escape review, and commit-with-notes.

---

## 1. What worked well

| Area | What worked |
|------|-------------|
| **Git worktree isolation** | Dirty main (5 mixed workstreams) stayed intact; migrate branch started clean @ `e002921` |
| **Spec-before-implement** | `PERSONAL_PHASE3_SPEC` + approval gate blocked premature migrate while tree was dirty |
| **Scoped file allowlist** | Only `personal-feed.tsx` + optional `action-drawer.tsx` — no scope creep |
| **RU-R-03 pre-validation** | Real capture of `personal:contact` / drawer↔surface ordering before migrate reduced event surprise |
| **Automated event QA** | `personal-phase3-validation.mjs` (9/9) locked stable IDs and drawer↔surface pairs |
| **Global regression guard** | `demo-event-checklist.mjs` (8/8) proved appointment/morph/composer paths untouched |
| **COMMIT_WITH_NOTES discipline** | Three conscious deltas documented instead of chasing false pixel-parity |
| **Rollback clarity** | Single-branch revert path always known (`e002921` or file checkout) |
| **Temporal governance mindset** | Team treated ordering/timing as valid semantics, not bugs to “fix” during migrate |

---

## 2. What almost went wrong

| Near-miss | How it was caught | Without the gate |
|-----------|-------------------|------------------|
| **Implement on dirty main** | `WORKING_TREE_ISOLATION_CHECK` + CONDITIONAL GO | ecommerce/db/shadow would enter personal PR |
| **Wrong worktree / wrong project** | Explicit path in every prompt (`social-landing-personal-phase3`) | Edit wrong tree or lose WIP |
| **Playwright selector `/Pessoal/i`** | Matches Influencer card text “personal**idades**” | RU-R-03 false failures / wrong vertical |
| **Auto-generated `next-env.d.ts`** | Reverted before commit | Noise in runtime diff |
| **pnpm script wrapper failures** | Used `./node_modules/.bin/next` directly | Blocked dev/validation unnecessarily |
| **Treating visual delta as blocker** | ACCEPTED_WITH_NOTE instead of rework loop | Delay or over-engineer ActionDrawer globally |
| **Globalizing Escape / drawerKind / vertical “for parity”** | Payload + escape review explicitly scoped | Uncontrolled ActionDrawer API growth |

---

## 3. What required the most care

1. **Stable drawer IDs vs dynamic titles** — `personal:project` must not become project title in events → `drawerId` optional prop.
2. **Event integrity** — `drawer.opened` / `surface.opened` / close pairs must remain paired; validated by script, not assumed.
3. **Vertical selector precision** — Demo uses **“Pessoal”** (exact), not “Personal” or regex on label text.
4. **Conscious delta acceptance** — Visual shell (handle/X/80vh), payload (`other`→`action`, no `vertical`), Escape local.
5. **Worktree hygiene** — Commit included only 3 files; excluded `.next/`, `node_modules/`, ephemeral QA scripts.

---

## 4. Surprises

| Surprise | Interpretation |
|----------|----------------|
| **Personal migrate was structurally similar to institutional** | Contact + project drawers mirror institutional patterns — good template, but institutional has **3** drawers not 2 |
| **ActionDrawer already lacked Escape globally** | Stack A verticals lived without vaul Escape for years; personal needed local restore, not platform-wide change |
| **No runtime consumer for `drawerKind=other`** | Payload delta was observability/documentation concern, not runtime breakage |
| **Content-height drawer vs 80vh cap** | Short forms render ~40% viewport; cap difference vs 90vh vaul matters less than chrome difference |
| **First convergence took more process docs than code lines** | Healthy ratio for a temporal-semantic platform |

---

## 5. Risks that did NOT materialize

- Tier 1 / morph layer regression
- composerMode / scroll-lock global breakage
- Cross-vertical drawer behavior change
- Event bus or instrumentation core edits
- Shadow apply or reducer creep
- Stable ID loss (`personal:contact`, `personal:project`)
- Overflow stuck after close
- Critical console errors on personal paths
- Contamination of original dirty `SOCIAL-LANDING` tree

---

## 6. Risks that remain real

| Risk | Status | Notes |
|------|--------|-------|
| **Accelerating to influencer/institutional without pause** | 🔴 Active | Biggest organizational risk post-success |
| **Shadow/compare expectations keyed on `other` + `vertical`** | 🟡 Latent | When shadow pack merges, update personal expectations |
| **ActionDrawer Escape inconsistency across Stack A** | 🟡 Latent | Personal has Escape; most Stack A verticals do not |
| **Visual convergence pressure (“make it identical to vaul”)** | 🟡 Latent | Would bloat ActionDrawer prematurely |
| **Ephemeral QA scripts not in repo** | 🟢 Low | Re-run instructions in implementation result; consider promoting later |
| **Typecheck debt on main** | 🟡 Pre-existing | Unrelated to personal migrate but blocks “green CI” narrative |

---

## 7. Decisions that were correct

- **Worktree isolation before implement**
- **NO-GO implement until clean branch**
- **Allowlist-only file scope**
- **`drawerId?: string` as minimal ActionDrawer extension**
- **Escape local to personal-feed this phase**
- **Accept Stack A payload semantics (`action`, no `vertical`)**
- **Visual smoke as gate, not optional polish**
- **COMMIT_WITH_NOTES before commit authorization**
- **Do not push immediately after first convergence**

---

## 8. Decisions that could change (future iterations)

| Decision | Could change when | Alternative |
|----------|-------------------|-------------|
| Escape local per vertical | After 2–3 Stack B migrations | Optional `onEscape` or ActionDrawer-level Escape with explicit ADR |
| No `vertical` in ActionDrawer events | If shadow analytics require it | Optional `vertical?: string` on ActionDrawer — not retroactive churn |
| 80vh `size="lg"` default | Visual refinement phase | Per-drawer size tuning or token alignment |
| Ephemeral QA scripts | After pattern stabilizes | Promote to `scripts/convergence/` with checklist index |
| Single vertical per PR | Never for Stack B batch | Still one vertical per PR — institutional’s 3 drawers stay one PR |

---

## 9. Most valuable checks

1. **Git worktree + clean `git status`** — prevented contaminated migrate
2. **`personal-phase3-validation.mjs`** — stable IDs + event pairs + Escape + overflow
3. **`demo-event-checklist.mjs`** — proved global demo path untouched
4. **Exact “Pessoal” selector** — avoided Influencer false match
5. **Focused code review checklist (12 items)** — caught scope and API compatibility early
6. **Payload review (no runtime consumer)** — prevented unnecessary “parity” code
7. **COMMIT_WITH_NOTES** — preserved architectural honesty in git narrative

---

## 10. Validations that prevented regression

| Validation | Regression prevented |
|------------|---------------------|
| 9/9 personal event script | Wrong drawerId, missing surface pairs, broken Escape |
| 8/8 demo checklist | Appointment drawer / morph / composer / WhatsApp breakage |
| Visual smoke (15 checks) | Missing handle/backdrop/content; feed lock after close |
| Pre-migrate RU-R-03 capture | Wrong selectors and vertical naming |
| Runtime file diff stat (2 files) | Accidental Tier 1 / ecommerce / shadow edits |

---

## Lessons for the organization

> **Success formula:** isolation → spec → observe → implement narrow → validate wide → review deltas → commit with notes → **pause and consolidate**.

> **Anti-pattern:** “It worked once → migrate influencer tomorrow.”

This postmortem closes the **personal migration arc**. Next work is organizational: extract pattern, assess ActionDrawer readiness, decide convergence cadence — not more runtime change yet.
