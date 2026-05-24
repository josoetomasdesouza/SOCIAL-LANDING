# Next Convergence Readiness

**Date:** 2026-05-24  
**After:** Personal Phase 3 @ `43c969a`  
**Mode:** Readiness classification only — no migrate authorization

---

## Vertical status matrix

| Vertical | Stack | Drawers | Stable IDs | Migrated | Observation | Readiness |
|----------|-------|---------|------------|----------|-------------|-----------|
| **personal** | A (was B) | 2 | ✅ | ✅ **DONE** | RU-R-03 ✅ | — |
| **influencer** | B (bridge) | 2 | ✅ | ❌ | RU-R-03 partial (`links`) | 🟡 **CANDIDATE NEXT** |
| **institutional** | B (bridge) | 3 | ✅ | ❌ | Not in RU-R-03 subset | 🟡 **CANDIDATE LATER** |
| appointment | A | many | title-based | n/a | checklist baseline | ✅ reference |
| ecommerce | A | many | mixed | n/a | — | out of scope |
| others (8) | A | varies | varies | n/a | — | already converged |

**Remaining Stack B surface:** influencer (2 drawers) + institutional (3 drawers) = **5 drawers total** on main @ `e002921`.

---

## Decision questions

### 1. Should influencer migrate now?

**No — not immediately.**

| For | Against |
|-----|---------|
| Same pattern as personal; 2 drawers | Organizational pause not completed until consolidation docs land |
| RU-R-03 precedent for `influencer:links` | `media-kit` drawer less observed |
| Smallest remaining Stack B vertical | Risk of “success momentum” skipping gates |

**Verdict:** **Wait** until consolidation committed + human cadence decision. Then influencer is **first authorized next vertical** if converge resumes.

---

### 2. Should institutional migrate now?

**No.**

| For | Against |
|-----|---------|
| Nearly identical contact/project to personal | 3 drawers = heavier validation |
| Would complete Stack B elimination | Team drawer not in RU-R capture |
| High template reuse | More feed-specific components (hero, CTA) |

**Verdict:** **After influencer**, not parallel, not before.

---

### 3. Should we wait for more observation?

**Yes — short intentional pause.**

Minimum before next vertical:

- [ ] Consolidation docs reviewed by human
- [ ] Personal PR merged or held with explicit decision
- [ ] Fresh REAL_USAGE capture for target vertical (both drawers)
- [ ] New spec + approval per vertical (no template-only GO)

**Observation debt:**

| Vertical | Gap |
|----------|-----|
| influencer | `media-kit` open/close capture |
| institutional | all 3 drawers + team list scroll |

---

### 4. Safest next vertical (when resume)

**Influencer** — fewest drawers, partial RU-R coverage, structurally similar to personal.

---

### 5. Riskiest next vertical

**Institutional** — drawer count, extra feed components, highest structural similarity **misleading** (looks easy, validates harder).

---

### 6. Benefit of pausing convergence now

| Benefit | Explanation |
|---------|-------------|
| **Prevent success-induced speed** | #1 risk after first clean converge |
| **Let docs become team memory** | Pattern + postmortem reduce repeated prompts |
| **Separate PR for consolidation** | Knowledge commit distinct from runtime commit |
| **Observe personal on main after merge** | Real deploy/demo feedback before copy pattern |
| **Resolve dirty main workstreams** | Original SOCIAL-LANDING still has 5 mixed tracks |

---

### 7. Risks if we accelerate

| Risk | Impact |
|------|--------|
| Skip isolation on dirty tree | Contaminated PRs return |
| Skip vertical-specific observation | Event/temporal surprises |
| Global ActionDrawer “fixes” mid-migrate | Stack A regression |
| influencer + institutional one PR | Unreviewable blast radius |
| Push personal + migrate influencer same day | No rollback breathing room |
| Shadow tools compare old `other` payloads | False divergence alarms |

---

## Readiness gates (next vertical)

Before **any** next Stack B migration:

```
G0  Consolidation docs committed / reviewed
G1  Personal merge decision explicit (merge or hold)
G2  Clean worktree for next vertical
G3  Vertical spec + approval (new)
G4  REAL_USAGE capture for ALL drawers in target vertical
G5  Same validation suite adapted (events + smoke + checklist)
G6  COMMIT_WITH_NOTES again
G7  Postmortem update (lightweight)
```

Personal satisfied G2–G6. **G0–G1 pending.**

---

## Recommended timeline (conservative)

| Phase | Action | Duration hint |
|-------|--------|---------------|
| **Now** | Consolidation docs + human review | days |
| **Next** | Personal PR when ready (optional push) | human decision |
| **Then** | Dirty main triage (separate workstreams) | parallel safe |
| **Later** | Influencer spec + observation | 1 iteration |
| **After** | Institutional spec + observation | 1 iteration |
| **Future** | Visual refinement / Escape ADR | separate track |

---

## Executive readiness summary

| Question | Answer |
|----------|--------|
| Platform ready for more convergence? | **Process yes, cadence no** |
| Next vertical authorized? | **None** until pause completes |
| First candidate when resume? | **Influencer** |
| Blocker? | **Organizational cadence**, not technical |

**Default recommendation:** **PAUSE → CONSOLIDATE → OBSERVE → then influencer**

Do not interpret personal success as “migrate remaining 5 drawers this week.”
