# Operational Hygiene Report — Social Landing

**Date:** 2026-05-24  
**Scope:** Branches, worktrees, merge discipline, PR hygiene, scalability  
**Baseline:** `origin/main` @ `38959cc` · dirty original @ `e002921`

---

## Fase 5 — Operational assessment

### 1. Is the ecosystem healthy?

**Verdict: 🟡 HYBRID — runtime healthy, operations fragmented**

| Layer | Health |
|-------|--------|
| Runtime on `main` | 🟢 STABLE_WITH_NOTES |
| Git hygiene (original worktree) | 🔴 Dirty, stale HEAD |
| Workstream isolation | 🟡 Proven once (personal); not sustained |
| Documentation | 🟡 High volume; scattered across trees |
| CI / automation | 🔴 Minimal |
| Branch/PR discipline | 🟡 Improving post #36 |

---

### 2. Forgotten worktrees?

| Worktree | Risk | Recommendation |
|----------|------|----------------|
| `SOCIAL-LANDING` (original) | 🔴 **High** — 68 dirty paths, wrong mental model of "main" | Reset after peel; rename mentally to "legacy-dirty" |
| `social-landing-personal-phase3` | 🟡 **Medium** — merged branch, still checked out | `git worktree remove` after confirm #36 |
| `social-landing-main-stabilization` | 🟢 **Active** — PR #37 + uncommitted audit docs | Finish PRs; then remove or repurpose |

**No unknown fourth worktree detected** — but original dirty tree behaves like a "forgotten" contamination sink.

---

### 3. Dangerous branches?

| Branch | Risk | Action |
|--------|------|--------|
| Local `main` @ `e002921` (dirty) | 🔴 Merge accident | Never push; reset to `origin/main` |
| `workstream/personal-phase3-actiondrawer` | 🟢 Merged | Delete remote/local after cleanup |
| `cursor/*` (20+ remote) | 🟡 Stale drafts | Bulk review → close |
| Unnamed WIP on dirty HEAD | 🔴 No branch | **Peel immediately** — work is unprotected |

**Dangerous pattern:** editing `main` directly on dirty tree without branch.

---

### 4. Contaminated trails?

**Yes — 5 streams in one working tree:**

```
ecommerce (3 files)
    +
shadow (2 mod + 6 untracked)
    +
db/media (pkg + 50+ paths)
    +
audit docs (~36 untracked)
    +
handoffs/convergence docs
```

**Contamination type:** not runtime cross-import (mostly isolated folders) but **human/process contamination** — one `git add -A` destroys isolation.

---

### 5. Accidental merge risk?

| Scenario | Likelihood | Impact |
|----------|------------|--------|
| Commit dirty tree to `main` | Medium | 🔴 Critical |
| Push `e002921` thinking it's current | Medium | 🔴 Critical |
| Merge db WIP without review | Low-Medium | 🔴 Critical |
| Shadow provider lands unnoticed | Low | 🟡 Dev/demo divergence |
| Close wrong stale PR | Low | 🟡 Lost work |

**Mitigations (immediate):**
- Do not commit from original `SOCIAL-LANDING` until peeled  
- `git update-index --assume-unchanged` **not recommended** — hides problem  
- Prefer **new worktrees only** from `origin/main`  
- Branch protection on `main` if not already enabled  

---

### 6. Operationally heavy?

**Yes — trending heavy:**

| Factor | Weight |
|--------|--------|
| 3 worktrees | Moderate |
| 68-path dirty tree | High cognitive load |
| 49 audit files (multiple locations) | High |
| 20+ stale remote branches | Noise |
| Manual QA not in CI | Repeat effort each converge |
| Dual lockfiles | Confusion |

**Not yet unsustainable** — but **silent fragmentation** will compound without triage execution.

---

### 7. Is the process scalable?

| Aspect | Scalable? | Notes |
|--------|-----------|-------|
| Controlled migration pattern | ✅ Yes | Personal proved template |
| Dirty tree as default workspace | ❌ No | Must not repeat |
| Docs-only PRs | ✅ Yes | #37, audit packs |
| One worktree per converge | ✅ Yes | Proven |
| QA in agent chat only | ❌ No | Must promote scripts |
| 12 verticals sequential | ⚠️ Slow but OK | Economics doc: ~2–3 converges before refactor pressure |

**Scale blocker #1:** original dirty worktree  
**Scale blocker #2:** QA not in repo/CI  
**Scale blocker #3:** audit doc sprawl without index  

---

## Fase 6 — Executive triage

### 1. Biggest operational risk today?

**Silent operational fragmentation** — healthy runtime on `main` while local reality is a mixed WIP at stale HEAD.

### 2. What most threatens healthy evolution?

- Unprotected multi-stream dirty tree  
- Human merge/commit mistakes  
- Continued doc accumulation without PR deduplication  

### 3. Organize immediately?

1. Peel workstreams from dirty tree (see WORKSTREAM_CLASSIFICATION)  
2. Merge PR #37  
3. PR Runtime Reality Audit + this triage pack  
4. Promote QA scripts to `scripts/convergence/`  
5. Remove stale personal-phase3 worktree  
6. Reset original worktree to `origin/main`  

### 4. Can wait?

- Influencer converge  
- CI Playwright nightly  
- Bulk delete of all `cursor/*` branches (after quick scan)  
- `pnpm-workspace.yaml` decision  
- Brand DNA / Goal Engine  

### 5. Should become formal branches?

| Content | Branch |
|---------|--------|
| db/media | `workstream/db-media-landing` |
| shadow observe | `workstream/shadow-observe-only` |
| ecommerce | `workstream/ecommerce-product-card` |
| audit REAL_USAGE pack | `docs/audit-real-usage-pack` |
| QA scripts | `chore/convergence-qa-scripts` |

### 6. Should become PRs?

- #37 stabilization log (**now**)  
- Runtime Reality Audit (4 docs)  
- Dirty Tree Triage (4 docs — this pack)  
- Each peeled branch above (separate PRs)  

### 7. Should stay local?

- `.next/`, build caches  
- `.env` secrets  
- Experimental Playwright output artifacts  

### 8. Should be discarded?

- `package-lock.json` (untracked)  
- Generated `tsconfig.tsbuildinfo`  
- Duplicate convergence docs superseded by main  
- Build artifacts in git status  

### 9. Stop accumulating?

- Untracked audit markdown without branch  
- Validation scripts only in worktrees  
- Mixed modifications on `main` checkout  
- Duplicate governance docs across trees  
- npm lockfile alongside pnpm  

### 10. Start institutionalizing?

- `scripts/convergence/` + README  
- Stabilization log after every merge  
- One worktree per workstream rule  
- PR template: validation output  
- Static CI for checklist scripts  
- `docs/audit/INDEX.md` (future — not in this pass)  

### 11. Is runtime healthier than repo?

**Yes.**  
Runtime: converged personal, 10/12 ActionDrawer, protocols validated.  
Repo: dirty tree, stale HEAD, ephemeral QA, doc sprawl.

### 12. Project today appears:

| Label | Applies? |
|-------|----------|
| Organized | Partially (main path) |
| Fragmented | **Yes** (local/ecosystem) |
| Controlled | **Yes** (governance mode) |
| Dangerous | **Locally** (dirty tree) |
| Sustainable | **If triage executes** |
| Heavy | Increasing |
| Mature | Runtime yes; ops catching up |
| **Hybrid** | **Best single word** |

---

## Merge discipline scorecard

| Practice | Personal Phase 3 | Current state |
|----------|------------------|---------------|
| Clean branch from main | ✅ | ❌ dirty tree violates |
| Scoped PR | ✅ #36 | — |
| Validation before merge | ✅ 9/9 + 8/8 | Ephemeral scripts |
| Stabilization window | ✅ | In progress (#37) |
| Worktree cleanup | ⚠️ Pending | 2 extra trees |
| Post-merge doc | ✅ on main | Audit pack uncommitted |

---

## Naming & isolation recommendations

| Convention | Rule |
|------------|------|
| Branches | `workstream/<domain>-<feature>` or `docs/<topic>` |
| Worktrees | `social-landing-<short-name>` adjacent to repo |
| Never | Edit ecommerce on docs branch |
| PR titles | `[workstream]`, `[docs]`, `[chore]` prefix |

---

## 7-day operational plan (suggested)

| Day | Action |
|-----|--------|
| D0 | Merge PR #37 |
| D0 | Open PR: Runtime Reality Audit + Dirty Tree Triage (8 docs, can split 2 PRs) |
| D1 | Peel + PR: convergence QA scripts |
| D2 | Peel + PR: audit REAL_USAGE pack (curated) |
| D3 | Peel branch: ecommerce (if product priority) |
| D4–5 | Peel branch: shadow observe (review apply flag) |
| D6+ | Peel branch: db/media (dedicated review window) |
| D7 | Reset original worktree; remove personal-phase3 worktree |

---

## Final verdict

The platform crossed an maturity threshold: **architectural gravity is real**.  
The correct response is **operational hygiene**, not more runtime change.

**Transform:**

```
"runtime saudável em repo fragmentado"
        ↓ (execute peel + institutionalize QA)
"plataforma operacionalmente madura"
```

**This report + sibling triage docs complete the classification pass.**  
**No runtime files were modified in this triage.**

---

## Related documents

- `DIRTY_TREE_TRIAGE.md` — inventory  
- `WORKSTREAM_CLASSIFICATION.md` — per-stream verdicts  
- `QA_STRATEGY_REVIEW.md` — scripts & CI strategy  
- On main: `docs/convergence/CONTROLLED_MIGRATION_PATTERN.md`  
- Uncommitted (main-stabilization): Runtime Reality Audit pack  
