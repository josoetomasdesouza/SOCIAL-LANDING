# Convergence Economics — Social Landing

**Date:** 2026-05-24  
**Scope:** Cost, benefit, and sustainability of drawer convergence after Personal Phase 3  
**Baseline:** First real migration @ `43c969a` on `main` @ `38959cc`

---

## Summary

The **first convergence paid off** — but the **unit economics** are closer to a **careful surgical procedure** than a **factory line**.  
Repeatable yes; cheap no.  
The protocol **justifies its cost** for Tier-2 drawer migrations; it would **not** justify itself for every small change.

---

## Fase 5 — Convergence economics

### What the first migration actually cost

| Cost category | Personal Phase 3 (observed) |
|---------------|----------------------------|
| **Process time** | Spec, isolation, RU-R observation, implement, 3 validation passes, 2 reviews, 2 commits, PR, stabilization, docs |
| **Code churn** | ~75 lines net runtime (`personal-feed` + `drawerId` prop) |
| **Doc churn** | ~1,100+ lines convergence docs (high ratio doc:code) |
| **Cognitive load** | Worktree management, selector pitfalls, payload/Escape decisions |
| **Calendar time** | Multi-session (appropriate for first of kind) |

**Ratio insight:** First migration is **expensive in governance**, **cheap in runtime diff** — expected for a template-setting migration.

---

### Will the next migration be easier?

| Factor | Easier? | Notes |
|--------|---------|-------|
| Pattern / blueprint | **Yes** | `CONTROLLED_MIGRATION_PATTERN.md` exists |
| ActionDrawer API | **Yes** | `drawerId` prop ready |
| Worktree isolation | **Yes** | Playbook proven |
| Validation scripts | **Partial** | Exist locally, **not in repo** — must recreate or promote |
| Human judgment (deltas) | **Same** | Each vertical still needs ACCEPT notes |
| influencer (2 drawers) | **~60–70%** effort vs first | Similar surface |
| institutional (3 drawers) | **~80–90%** effort vs first | More validation cases |

**Answer:** **Yes, marginally cheaper** — not 10× faster unless checklists land in CI and scripts are committed.

---

### Is the system more convergible?

**Yes, structurally:**

- ActionDrawer proven outside “born Stack A” verticals  
- Bridge pattern isolated to 2 verticals / 5 drawers  
- Rollback discipline tested  

**Still blocking full convergibility:**

- ~~`InstrumentedDrawerBridge` must remain until influencer + institutional migrate~~ ✅ Resolved (Era 2)
- ComposerMode policy unset for profile-style verticals  
- Escape behavior unset globally  
- Title-as-ID debt across legacy ActionDrawer calls  

---

### Does ActionDrawer reduce real complexity?

| Before (personal) | After |
|-------------------|-------|
| shadcn Drawer + DrawerContent + bridge wrapper | Single ActionDrawer component |
| vaul scroll/Escape | ActionDrawer scroll lock + local Escape |
| Two styling systems | One within Stack A |

**Net:** **Real reduction** for migrated verticals.  
**Platform net:** **Small** until 5 remaining Stack B drawers migrate — bridge + vaul dep remain.

---

### Is the protocol scalable?

| Scale to | Verdict |
|----------|---------|
| 2 more verticals (5 drawers) | **Yes** — protocol scales |
| Monthly convergences across platform | **No** — team fatigue + doc debt |
| Every UI tweak | **No** — overkill |

**Bottleneck:** Human review gates, not git mechanics.

---

### Influencer vs institutional economics

| Vertical | Drawers | Template match | Observation debt | Relative cost |
|----------|---------|----------------|------------------|---------------|
| **influencer** | 2 | High (like personal) | media-kit partial | **Lower** |
| **institutional** | 3 | High content, +team drawer | 3 drawers uncaptured | **Higher** |

**institutional looks like copy-paste but costs more in validation** — deceptive similarity.

---

### Bridge eternity risk

**Current state:**

- Stack B: **5 drawers** (2 verticals)  
- Stack A: **10 verticals** + feed drawer  

If convergence pauses >2–3 months:

- Bridge becomes **“temporary for a year”**  
- Engineers forget Stack B payload semantics  
- New hires learn two drawer religions  

**Mitigation:** Time-box remaining convergence or explicitly declare **dual-stack supported until Q×** (honest status).

---

### Migration fatigue risk

**Triggers:**

- “Personal was easy → do all tomorrow”  
- Doc volume > code volume per PR  
- Repeated ACCEPT notes feel repetitive  
- Dirty main worktree never triaged  

**Antidote (already chosen):** PAUSE + stabilization — **correct economic decision**.

---

## Fase 4 — False safety audit

### What genuinely increases safety

| Mechanism | Real value? | Evidence |
|-----------|-------------|----------|
| Git worktree isolation | **High** | Prevented contaminated personal PR |
| Scoped file allowlist | **High** | 2 runtime files only |
| Playwright event validation | **High** | Caught selector bug (Pessoal vs personalidades) |
| demo-event-checklist | **High** | Global regression signal |
| Visual smoke | **Medium–High** | Found accepted deltas, not blockers |
| Payload / Escape review | **Medium** | Prevented unnecessary global API churn |
| COMMIT_WITH_NOTES | **Medium** | Honest merge narrative |
| Stabilization window | **Medium** | Confirmed main post-merge |

**Verdict:** Core protocol **reduces real regression risk** — not theater for Personal Phase 3.

---

### What creates false safety

| Mechanism | Risk | Reality |
|-----------|------|---------|
| Large governance doc corpus | **High** | Sophistication can exceed **what’s on main** (dirty tree audit pack) |
| Shadow / reducer docs (off-main) | **Medium** | Implies unified surface state machine — **not applied to runtime** |
| Contracts marked “wired ✅” | **Low–Medium** | True for events; **optional fields** not uniformly emitted |
| Manual-only checklists | **High** | Not run unless someone remembers |
| `ignoreBuildErrors` | **High** | Green build ≠ type-safe code |
| “Converged platform” narrative | **High** | 2/12 verticals still Stack B for action drawers |
| PR review without `/demo` smoke | **Medium** | Vercel pass ≠ drawer matrix tested |

---

### Protocol bureaucracy check

| Question | Answer |
|----------|--------|
| Does protocol reduce regression? | **Yes** — demonstrated |
| Getting bureaucratic? | **Borderline** — doc:code ratio high on first run |
| Accelerates or slows learning? | **Slows first time, accelerates repeat** |
| Checks find real problems? | **Yes** — selector, isolation, payload |
| Ritual without value? | **Low** for isolation + Playwright; **some** doc duplication |
| Excess documentation? | **Yes for steady state** — consolidate, don’t expand |
| Cost justified? | **Yes for convergence**; **no for trivial edits** |
| Team understands runtime without docs? | **Partially** — Tier 1 requires docs; drawers learnable from code |

---

## Economic recommendation

### Continue (high ROI)

- Worktree isolation for runtime changes  
- Vertical-scoped migrations  
- Playwright event + demo checklist before merge  
- COMMIT_WITH_NOTES for accepted deltas  
- Stabilization window after merge  

### Simplify (reduce ornamental cost)

- Cap new governance docs — **update** pattern/postmortem instead of new taxonomies  
- Commit validation scripts to `scripts/convergence/` (one-time cost, recurring benefit)  
- Single PR template for converge + stabilization log  
- Merge PR #37 (stabilization log) — close the observation loop on main  

### Do not simplify (real safety)

- Tier 1 freeze  
- No shadow apply to runtime  
- No reducer migration under converge pressure  
- No multi-vertical batch PRs  
- No skip of global checklist because “only touched one file”  

---

## Readiness to continue converging (economic view)

| Gate | Status |
|------|--------|
| Protocol ROI proven | ✅ |
| Marginal cost of next migrate acceptable | ✅ (if not rushed) |
| Platform convergibility improved | ✅ modest |
| Team fatigue managed | ✅ (pause active) |
| False safety from docs > runtime | ⚠️ monitor |

**Economic verdict:** **Continue convergence program** — but at **~1 vertical per cycle** with **promoted automation**, not accelerated parallel migration.

---

## Bottom line

Personal Phase 3 was **worth the process cost** because it bought:

1. Proof of safe evolution  
2. Reusable pattern  
3. Honest accepted deltas  
4. No main regression  

The **next dollar** should go to **operationalizing checks** (CI/scripts), not **more governance documents**.
