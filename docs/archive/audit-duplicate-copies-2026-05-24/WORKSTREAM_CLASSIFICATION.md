# Workstream Classification — Social Landing

**Date:** 2026-05-24  
**Source:** Dirty tree triage @ `SOCIAL-LANDING` worktree  
**Reference main:** `origin/main` @ `38959cc`

---

## Classification legend

| Verdict | Meaning |
|---------|---------|
| **READY_FOR_BRANCH** | Peel to new branch from clean `main`; work is coherent |
| **READY_FOR_PR** | Already branch-ready or small enough for direct PR |
| **KEEP_LOCAL_ONLY** | Ephemeral / machine-local; do not commit |
| **DISCARD_SAFE** | Generated or obsolete; safe to delete |
| **NEEDS_INVESTIGATION** | Value unclear or risk unclear |
| **BLOCKED** | External dependency or policy hold |
| **ORPHANED** | No owner / superseded / stale |
| **DANGEROUS_TO_MERGE** | Must never land mixed with other streams |

---

## Workstream matrix

| # | Workstream | Verdict | Branch name (suggested) | PR strategy |
|---|------------|---------|-------------------------|-------------|
| 1 | **personal Phase 3** | ✅ **DONE** (on main) | `workstream/personal-phase3-actiondrawer` | MERGED #36 |
| 2 | **stabilization log** | **READY_FOR_PR** | `docs/personal-phase3-stabilization-log` | OPEN #37 — merge |
| 3 | **runtime reality audit** | **READY_FOR_PR** | new `docs/runtime-reality-audit` | 4 files; docs-only |
| 4 | **audit/governance pack (dirty)** | **READY_FOR_BRANCH** | `docs/audit-governance-pack` | Curate ~20 files; dedupe main |
| 5 | **convergence docs (dirty)** | **NEEDS_INVESTIGATION** | — | Overlap PR #36; merge not copy |
| 6 | **temporal/REAL_USAGE docs** | **READY_FOR_BRANCH** | `docs/audit-real-usage-pack` | High value; not on main |
| 7 | **contracts skeleton** | **READY_FOR_BRANCH** | include in audit pack | 6 contract files |
| 8 | **ecommerce WIP** | **READY_FOR_BRANCH** | `workstream/ecommerce-product-card` | 3 files; from clean main |
| 9 | **db/media stack** | **DANGEROUS_TO_MERGE** → **READY_FOR_BRANCH** | `workstream/db-media-landing` | Isolated; env required |
| 10 | **shadow observe** | **NEEDS_INVESTIGATION** | `workstream/shadow-observe-only` | Confirm apply=false |
| 11 | **passive provider + surfaces index** | **READY_FOR_BRANCH** | with shadow branch | 2 modified + shadow dir |
| 12 | **EVOLUTION_LOG handoff** | **READY_FOR_BRANCH** | `docs/evolution-log-update` | Docs-only; separate |
| 13 | **architecture handoffs** | **READY_FOR_BRANCH** | with db or docs | `docs/architecture/`, PR3/PR7 |
| 14 | **QA convergence scripts** | **READY_FOR_BRANCH** | `chore/convergence-qa-scripts` | Promote to repo |
| 15 | **db smoke scripts** | **READY_FOR_BRANCH** | with db-media | Not standalone |
| 16 | **build artifacts** | **DISCARD_SAFE** | — | `.next/`, tsbuildinfo |
| 17 | **next-env.d.ts** | **DISCARD_SAFE** | — | revert |
| 18 | **package-lock.json** | **DISCARD_SAFE** | — | pnpm is primary |
| 19 | **pnpm-workspace.yaml** | **NEEDS_INVESTIGATION** | — | Monorepo intent? |
| 20 | **.gitignore untracked** | **NEEDS_INVESTIGATION** | — | Compare with main |
| 21 | **personal-phase3 worktree** | **ORPHANED** | — | Merged; remove worktree |
| 22 | **main-stabilization worktree** | **READY_FOR_PR** | current branch | After audit PR |
| 23 | **cursor/* remote branches** | **ORPHANED** | — | Archive/delete stale |
| 24 | **dirty main @ e002921** | **BLOCKED** | — | Must reset after peel |

---

## Detailed classifications

### READY_FOR_BRANCH (priority order)

#### A. `docs/audit-real-usage-pack` — **High value, low risk**

**Include:**
- `SESSION_TIMELINES.md`, `REAL_USAGE_RE_RUN_RESULTS.md`, `SURFACE_DIVERGENCES.md`
- `TEMPORAL_*`, `EVENT_ORDERING_*`, `OWNERSHIP_TRANSFER_*`
- `RUNTIME_GOVERNANCE.md`, `WORKSTREAM_ISOLATION_PLAN.md`, `WORKING_TREE_ISOLATION_CHECK.md`
- `docs/audit/contracts/*.md` (6 files)

**Exclude from same PR:** db, shadow code, ecommerce

**Why:** Captures observation investment; aligns with main runtime; docs-only.

---

#### B. `workstream/ecommerce-product-card` — **Medium value, medium risk**

**Include:** 3 modified ecommerce files only  
**Base:** `origin/main` @ `38959cc`  
**Validate:** perceptual QA on ecommerce vertical; no checklist regression

---

#### C. `workstream/db-media-landing` — **High value, high risk**

**Include:** entire `lib/db/`, `drizzle/`, `app/api/media/`, deps in package.json, db scripts, architecture handoffs  
**Blockers:** `.env.example` secrets policy, Supabase target, migration review  
**Never mix with:** shadow, ecommerce, converge

---

#### D. `workstream/shadow-observe-only` — **Medium value, medium risk**

**Include:** `lib/surfaces/shadow/**`, provider diff, index export  
**Gate:** Verify `SURFACE_SHADOW_APPLY_TO_RUNTIME === false`  
**PR body:** explicit NO-GO apply to runtime

---

#### E. `chore/convergence-qa-scripts` — **High ROI**

**Include:** `demo-event-checklist.mjs` (already on main), `personal-phase3-validation.mjs`, `personal-phase3-visual-smoke.mjs`  
**Optional:** CI workflow stub (separate PR)

---

### READY_FOR_PR (immediate)

| PR | Content | Base |
|----|---------|------|
| **#37** | Stabilization log | main — **merge now** |
| **New** | Runtime Reality Audit (4 docs) | main |
| **New** | Dirty tree triage (4 docs) | main — this pack |

---

### KEEP_LOCAL_ONLY

- `.next/`
- `tsconfig.tsbuildinfo`
- Playwright cache paths
- Local `.env` (never commit)

---

### DISCARD_SAFE

| Item | Reason |
|------|--------|
| `.next/` | build output |
| `tsconfig.tsbuildinfo` | cache |
| `package-lock.json` (untracked) | pnpm project |
| `next-env.d.ts` local diff | regenerate from main |
| Duplicate `docs/convergence/PERSONAL_PHASE3_*` on dirty tree | superseded by main @ #36 |

---

### NEEDS_INVESTIGATION

| Item | Question |
|------|----------|
| `docs/convergence/` (8 files on dirty) | Which are superseded by main? Diff before any PR |
| `pnpm-workspace.yaml` | Intentional monorepo or accidental? |
| `.gitignore` untracked | Merge into root gitignore or discard? |
| `SHADOW_MODE_REPORT.md` vs shadow code | Report without code or code without report? |
| Stale `cursor/*` branches | Any still needed for composer work? |

---

### BLOCKED

| Item | Blocker |
|------|---------|
| Dirty tree wholesale merge | Mixed streams |
| Influencer/institutional converge | Process: stabilization + triage first |
| Shadow apply to runtime | Policy NO-GO |
| Brand DNA / Goal Engine | Out of scope; docs exist as spec only |

---

### ORPHANED

| Item | Action |
|------|--------|
| `workstream/personal-phase3-actiondrawer` worktree | Remove after confirm merged |
| `SOCIAL-LANDING` @ `e002921` | Reset to `origin/main` after peels |
| ~15 open draft PRs on `cursor/*` | Review → close or archive |
| `docs/convergence/PERSONAL_PHASE3_SPEC` on dirty | Archive; main has implementation result |

---

### DANGEROUS_TO_MERGE

**Never combine in one commit/PR:**

- db/media + shadow provider + ecommerce + audit docs + package.json

**Highest danger file groups:**
1. `package.json` + `pnpm-lock.yaml` + db + api routes  
2. `passive-event-provider.tsx` + shadow (changes `/demo` dev behavior)  
3. Any commit from dirty HEAD without rebasing onto `38959cc`

---

## Dependency graph

```
origin/main @ 38959cc
    ├── PR #37 stabilization log (docs)
    ├── PR runtime reality audit (docs)
    ├── PR dirty tree triage (docs)
    ├── branch: audit-real-usage-pack (docs)
    ├── branch: convergence-qa-scripts (chore)
    ├── branch: ecommerce-product-card (runtime: 3 files)
    ├── branch: shadow-observe-only (dev + lib)
    └── branch: db-media-landing (large; last)
```

**Rule:** Docs PRs can parallelize. Runtime branches **one at a time**.

---

## Peel procedure (per workstream)

```bash
git fetch origin
git worktree add ../sl-<name> -b workstream/<name> origin/main
# copy or cherry-pick ONLY allowlisted files from dirty tree
# validate
# PR scoped
```

**Never** `git add -A` on dirty tree.

---

## Classification summary counts

| Verdict | Count |
|---------|-------|
| READY_FOR_BRANCH | 6 |
| READY_FOR_PR | 3 |
| DONE | 1 |
| NEEDS_INVESTIGATION | 5 |
| DISCARD_SAFE | 4 |
| ORPHANED | 4 |
| BLOCKED | 2 |
| DANGEROUS_TO_MERGE | 1 (as bundle) |
