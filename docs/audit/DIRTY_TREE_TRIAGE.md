# Dirty Tree Triage — Social Landing

**Date:** 2026-05-24  
**Mode:** DIRTY TREE TRIAGE (inventory only — no code changes)  
**Subject:** Original worktree `/Users/josoetomasdesouza/Documents/New project/SOCIAL-LANDING`  
**Baseline comparison:** local `HEAD` = `e002921` · `origin/main` = `38959cc` (**68 commits behind**)

---

## Executive summary

The **runtime on `main` is healthy** after Personal Phase 3.  
The **original local worktree is operationally hazardous**: 5 mixed workstreams, 68 paths of drift, and **no merge path to `main` without triage**.

| Metric | Value |
|--------|-------|
| Modified tracked | **9 files** |
| Untracked paths (incl. dirs) | **~59** |
| Mixed workstreams | **5** |
| Commits behind `origin/main` | **~3 merge commits** (personal + docs on main) |
| Safe to merge dirty tree as-is | **❌ NO** |

**Primary risk:** **silent operational fragmentation** — not runtime core failure.

---

## Fase 1 — Inventário real

### 1. Ecommerce WIP

| Item | Detail |
|------|--------|
| **Modified tracked** | 3 files |
| **Paths** | `ecommerce-conversation-products-block.tsx`, `ecommerce-feed.tsx`, `ecommerce-product-feed-card.tsx` |
| **Diff size** | ~177 lines in product card (perceptual); 2 lines each in other files |
| **Untracked** | none (changes are tracked) |
| **Risk** | 🟡 perceptual / product-flow |
| **Relation to main** | Main @ `38959cc` does **not** include these changes |
| **Dependency** | Isolated to ecommerce vertical; no db required for UI-only parts |

---

### 2. DB / media WIP

| Item | Detail |
|------|--------|
| **Modified tracked** | `package.json`, `pnpm-lock.yaml` (+1055 lock lines) |
| **Untracked dirs/files** | `lib/db/**`, `lib/landing-schema/`, `drizzle/**`, `drizzle.config.ts`, `app/api/media/**`, `.env.example` |
| **Scripts** | 10+ SQL/smoke scripts under `scripts/` |
| **Docs** | `docs/ai-handoffs/PR3_*`, `PR7_*`, `SUPABASE_*`, `docs/architecture/` |
| **Risk** | 🔴 **DANGEROUS_TO_MERGE** without isolated PR + env + migration review |
| **Relation to main** | **Fully absent** from `origin/main` |
| **Dependency** | Supabase, Drizzle, env secrets, storage buckets |

**File count (approx):** `lib/db/` ~40+ files, `drizzle/migrations` 5+ SQL files, `app/api/media` 3 routes.

---

### 3. Shadow / runtime WIP

| Item | Detail |
|------|--------|
| **Modified tracked** | `components/dev/passive-event-provider.tsx`, `lib/surfaces/index.ts` |
| **Untracked** | `lib/surfaces/shadow/**` (6 files) |
| **Behavior** | Registers shadow observer when shadow mode enabled — **compare-only intent** |
| **Risk** | 🟡 **NEEDS_INVESTIGATION** — touches dev provider path used by `/demo` |
| **Relation to main** | Main has `lib/surfaces` reducer/machine **without** shadow/ export; provider is clean on main |
| **Dependency** | Passive events + surface machine; must confirm `SURFACE_SHADOW_APPLY_TO_RUNTIME = false` |

---

### 4. Audit / convergence docs (untracked on dirty tree)

| Bucket | Count | Location |
|--------|-------|----------|
| **Audit WIP (dirty only)** | ~30 untracked + 6 contracts | `docs/audit/*.md`, `docs/audit/contracts/` |
| **Convergence WIP (dirty only)** | 8 files | `docs/convergence/` (spec, approval, strategy — pre-PR36 pack) |
| **On main already (via PR #36)** | 5 files | `docs/convergence/PERSONAL_PHASE3_*`, pattern, readiness, etc. |
| **On branch PR #37** | 1 file | `PERSONAL_PHASE3_STABILIZATION_LOG.md` |
| **Uncommitted (main-stabilization worktree)** | 4 files | Runtime Reality Audit pack |
| **On main (committed baseline)** | 14 files | Original strategic audit set |

**Risk:** 🟡 doc fragmentation — same topics in 4 locations (dirty, main, branches, uncommitted).

---

### 5. QA scripts

| Location | Scripts | On main? |
|----------|---------|----------|
| **Dirty tree `scripts/`** | `demo-event-checklist.mjs` + 12 db/media smokes | checklist ✅ on main; db scripts ❌ |
| **personal-phase3 worktree** | `personal-phase3-validation.mjs`, `visual-smoke.mjs` | ❌ ephemeral |
| **main-stabilization worktree** | copies of above | ❌ ephemeral |

---

### 6. Build artifacts

| Path | Class | Action |
|------|-------|--------|
| `.next/` | generated | **DISCARD_SAFE** / gitignore |
| `tsconfig.tsbuildinfo` | generated | **DISCARD_SAFE** |
| `next-env.d.ts` (modified) | generated | **DISCARD_SAFE** — revert vs main |
| `package-lock.json` (untracked) | duplicate lockfile | **NEEDS_INVESTIGATION** — conflicts with pnpm |

---

### 7. Experimental / orphan

| Item | Notes |
|------|-------|
| `.gitignore` (untracked) | May duplicate or conflict with repo ignore rules |
| `pnpm-workspace.yaml` (untracked) | Suggests monorepo experiment |
| `docs/ai-handoffs/EVOLUTION_LOG.md` (+802 lines modified) | Handoff log — not runtime |
| Old cursor remote branches (20+) | Stale PRs — **ORPHANED** at GitHub level |

---

### 8. Generated / duplicated

- **Dual lockfiles:** `pnpm-lock.yaml` modified + `package-lock.json` untracked → **DANGEROUS**
- **Duplicate convergence docs:** dirty `docs/convergence/` overlaps merged main content
- **Three worktrees** on same repo with different HEADs

---

### 9. Worktree inventory (cross-repo)

| Path | Branch / HEAD | State |
|------|---------------|-------|
| `SOCIAL-LANDING` | `main` @ `e002921` | **DIRTY — 68 paths** |
| `social-landing-personal-phase3` | `workstream/personal-phase3-actiondrawer` @ `53d0f32` | clean; **merged** — stale |
| `social-landing-main-stabilization` | `docs/personal-phase3-stabilization-log` @ `19d7989` | +4 uncommitted audit docs |

---

## Quantity summary

| Category | Modified | Untracked (top-level groups) |
|----------|----------|------------------------------|
| ecommerce | 3 | 0 |
| db/media | 2 (pkg) | ~4 trees + 10 scripts |
| shadow | 2 | 1 dir (6 files) |
| audit docs | 0 | ~36 files |
| convergence docs | 0 | 8 files (partial overlap main) |
| build/generated | 1 | 3+ |
| handoffs | 1 | 3 files |
| **Total status lines** | **9 modified** | **~59 untracked entries** |

---

## Immediate danger list

1. **Merge accident** — committing dirty tree while thinking it's `main` @ `38959cc`  
2. **Lockfile chaos** — npm + pnpm + dependency drift  
3. **Shadow hook in provider** — dev/demo path differs from production main  
4. **Db WIP half-landed** — package.json deps without isolated migration PR  
5. **Worktree confusion** — editing wrong directory after converge success  

---

## Triage outcome (preview)

See `WORKSTREAM_CLASSIFICATION.md` for per-stream verdicts.

**Do not** merge dirty tree wholesale.  
**Do** peel workstreams into isolated branches from **`origin/main` @ `38959cc`**, not from `e002921` dirty HEAD.

---

## Recommended peel order

1. Merge **PR #37** (stabilization log) on GitHub  
2. PR **Runtime Reality Audit** (4 docs from main-stabilization worktree)  
3. PR **audit/convergence governance pack** (curated subset from dirty tree — dedupe vs main)  
4. Branch **workstream/db-media** from clean main  
5. Branch **workstream/shadow-observe** from clean main  
6. Branch **workstream/ecommerce-wip** from clean main  
7. **Reset or rebase** original `SOCIAL-LANDING` worktree to `origin/main` after peels saved  

---

## Success criterion

Dirty tree triage succeeds when:

- [ ] Each WIP has a named branch or discard decision  
- [ ] Original worktree can `git checkout main && git pull` to clean `38959cc+`  
- [ ] No mixed commit ever touches ecommerce + db + shadow + docs together  
- [ ] QA scripts promoted or explicitly ephemeral  

**Status:** Inventory complete — execution pending human-approved peel PRs.
