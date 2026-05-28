# Operational Hygiene Report — Social Landing

**Date:** 2026-05-24  
**Workstream:** WS-01 Operational Hygiene  
**Mode:** Inventory, isolation, deduplication — **no runtime changes**  
**Baseline:** `origin/main` @ `c911057` (Merge PR #51 — anti-philosophy drift)  
**Branch for this deliverable:** `chore/operational-hygiene`

---

## Executive summary

The repository is in **Runtime Convergence** phase. Runtime on `main` is stable for Tier 1 verticals after Personal Phase 3. Operational entropy comes from **parallel worktrees**, **stale remote branches**, **untracked duplicate docs**, and **open PRs that touch frozen zones**.

This report maps the dirty tree, classifies workstreams, archives redundant copies, and proposes a **safe merge order**. No application code, packages, or visual behavior were modified in WS-01.

| Metric | Value |
|--------|-------|
| Active local worktrees | **6** (+ primary) |
| Open PRs (runtime-relevant) | **#52**, **#53** |
| Stale `cursor/*` remotes | **20+** |
| Duplicate audit docs archived | **42** (byte-identical to canonical) |
| Runtime files touched in WS-01 | **0** |

---

## Current active branches

### Primary convergence path (merge candidates)

| Branch | vs `main` | PR | Classification | Notes |
|--------|-----------|-----|----------------|-------|
| `docs/os-governance-layer` | +1 commit | [#53](https://github.com/josoetomasdesouza/SOCIAL-LANDING/pull/53) OPEN | **SAFE** | Docs-only: MASTER_ROADMAP, SYSTEM_STATE, WORKSTREAMS v2, FREEZE_ZONES. **Merge first.** |
| `fix/drawer-perceptual-hygiene` | +5 commits | [#52](https://github.com/josoetomasdesouza/SOCIAL-LANDING/pull/52) OPEN | **REVIEW** | Touches ActionDrawer, composer clearance, checkout CTAs. Tier 1 — requires VALIDATION_PROTOCOL checklist before merge. |

### Isolated docs workstreams (branch-ready)

| Branch | vs `main` | Worktree | Classification | Notes |
|--------|-----------|----------|----------------|-------|
| `docs/audit-real-usage-pack` | ahead | `social-landing-audit-real-usage-pack` | **SAFE** | Temporal/REAL_USAGE audit pack; docs-only |
| `docs/strategic-operational-baseline` | ahead | `social-landing-docs-baseline` | **SAFE** | Strategic baseline docs |
| `docs/personal-phase3-stabilization-log` | ahead | `social-landing-main-stabilization` | **SAFE** | Stabilization log; separate from runtime |
| `chore/qa-infrastructure` | **28 behind** | `social-landing-qa-1` | **REVIEW** | Stale; rebase or close before any PR |
| `chore/pr-template-os-enforcement` | remote only | — | **SAFE** | Template/governance helper |

### Runtime WIP (isolated — do not merge mixed)

| Branch | vs `main` | Worktree | Classification | Notes |
|--------|-----------|----------|----------------|-------|
| `workstream/ecommerce-product-card` | **17 behind** | `social-landing-ecommerce-wip` | **REVIEW** | 3 ecommerce files; stale base — rebase onto post-#52 main |
| `workstream/personal-phase3-actiondrawer` | merged | `social-landing-personal-phase3` | **ARCHIVE** | Phase 3 done on main; worktree can be removed |
| `feat/ecommerce-contextual-conversation-runtime` | remote | — | **BLOCKED** | Composer/ecommerce — frozen until Stack A parity |
| `feat/composer-contextual-placeholder` | remote | — | **BLOCKED** | Composer surface — frozen |
| `chore/ecommerce-remove-dead-recommendation-surface` | remote | — | **REVIEW** | Small cleanup; verify no drawer/composer coupling |

### Legacy / agent branches (high contamination risk)

| Pattern | Count | Classification | Action |
|---------|-------|----------------|--------|
| `cursor/composer-*` | 8+ | **BLOCKED** | Do not merge; superseded by main + #52 |
| `cursor/contextual-*` | 5+ | **BLOCKED** | Morph/conversation experiments — orphan |
| `cursor/product-flow-*` | 3+ | **BLOCKED** | Pre-canonical product flow |
| `cursor/fix-*` | 2+ | **REVIEW** | May contain useful fixes — cherry-pick only with audit |
| `cursor/create-operational-memory-docs-*` | 1 | **ARCHIVE** | Likely superseded by `docs/os/` |

**Rule:** Treat every `cursor/*` branch as **unsafe to merge wholesale**. If a fix is still needed, extract as a single-purpose PR against current `main`.

---

## Mixed concerns

### Original primary worktree (`SOCIAL-LANDING`)

Prior triage ([`docs/audit/DIRTY_TREE_TRIAGE.md`](../audit/DIRTY_TREE_TRIAGE.md)) identified **5 simultaneous workstreams** in one tree. Current state on `chore/operational-hygiene` (clean `main` checkout):

| Concern | Location | Status on this branch | Classification |
|---------|----------|----------------------|----------------|
| Duplicate audit docs | `docs/audit/* 2.md` | **Archived** → `docs/archive/audit-duplicate-copies-2026-05-24/` | **ARCHIVE** |
| DB / Drizzle / media API | `lib/db/`, `drizzle/`, `app/api/media/` | Not present on `main`; may exist in other worktrees | **BLOCKED** (WS-09) |
| Shadow observe mode | `lib/surfaces/shadow/` | Not on `main` | **BLOCKED** until apply=false verified |
| Ecommerce product card WIP | separate worktree | Isolated | **REVIEW** |
| Visual observation scripts | `scripts/visual/*.mjs` | Untracked locally | **REVIEW** — keep local or `chore/` PR later |
| Empty architecture stub | `docs/architecture/` | Untracked placeholder | **REVIEW** — WS-09 handoff |
| Local secrets | `.env.local` | Untracked | **BLOCKED** — never commit |
| Build artifacts | `.next/`, `*.tsbuildinfo`, `.pnpm-store/` | Untracked/generated | **ARCHIVE** (gitignore only) |
| Review observations | `.review/ecommerce-*` | Untracked | **REVIEW** — local QA notes |

### Worktree map (simultaneous trilhas)

```
SOCIAL-LANDING (primary)          → chore/operational-hygiene @ main
social-landing-audit-real-usage   → docs/audit-real-usage-pack
social-landing-docs-baseline      → docs/strategic-operational-baseline
social-landing-ecommerce-wip      → workstream/ecommerce-product-card (STALE)
social-landing-main-stabilization → docs/personal-phase3-stabilization-log
social-landing-personal-phase3    → workstream/personal-phase3-actiondrawer (ORPHAN)
social-landing-qa-1               → chore/qa-infrastructure (STALE)
```

**Danger:** Editing in the primary worktree while WIP lives in another branch **without** worktree isolation causes silent cross-contamination. Prefer one worktree per active runtime PR.

---

## Unsafe workstreams

These must **not** merge until prerequisites and isolation gates are met:

| Workstream | Why unsafe | Gate |
|------------|------------|------|
| **DB / media stack** | `package.json`, migrations, env, API routes | WS-09; isolated PR; `.env` policy |
| **Shadow runtime** | Touches `passive-event-provider`, surface exports | Confirm `SURFACE_SHADOW_APPLY_TO_RUNTIME === false` |
| **Any `cursor/composer-*` PR** | Overlaps frozen composer core | Close or archive after #52 |
| **Any `cursor/contextual-*` / morph PR** | Overlaps morph contract | WS-06+ only |
| **Mixed dirty tree merge** | 5+ concerns in one diff | Never — peel to branches (see triage doc) |
| **AI resolver experiments** | Cross-vertical instrumentation | WS-08; one vertical per PR |
| **PR #52 without validation** | Tier 1 perceptual changes | Full VALIDATION_PROTOCOL on 6+ verticals |

---

## Duplicate docs

### Resolved in WS-01

| Issue | Count | Action |
|-------|-------|--------|
| macOS duplicate copies `* 2.md` in `docs/audit/` | 42 | Moved to `docs/archive/audit-duplicate-copies-2026-05-24/` |
| Byte identity vs canonical | 42/42 identical | Safe archive; canonical paths unchanged |

See [`docs/archive/audit-duplicate-copies-2026-05-24/MANIFEST.md`](../archive/audit-duplicate-copies-2026-05-24/MANIFEST.md).

### Remaining doc overlap (not deduplicated — needs human REVIEW)

| Topic | Locations | Recommendation |
|-------|-----------|----------------|
| Operational hygiene | `docs/audit/OPERATIONAL_HYGIENE_REPORT.md` vs **this file** | **This file** is canonical post–WS-01; audit copy is historical |
| Runtime governance | `docs/audit/RUNTIME_GOVERNANCE.md` vs `docs/os/GOVERNANCE.md` | Merge narrative after PR #53 lands |
| Workstream plans | `docs/audit/WORKSTREAM_*.md` vs `docs/os/WORKSTREAMS.md` | Audit = snapshot; OS = living doc after #53 |
| Convergence pack | `docs/convergence/` on various branches | Dedupe when stabilization PRs merge |
| Freeze zones | `docs/os/FROZEN_ZONES.md` vs `FREEZE_ZONES.md` (on #53) | Consolidate in #53 follow-up if both exist |

---

## Runtime contamination risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Merging #52 without Tier 1 QA | 🔴 High | Run perceptual checklist; no parallel runtime edits |
| Merging ecommerce WIP before #52 | 🟡 Medium | Rebase worktree; test checkout CTAs |
| Stale branch (`17–28` commits behind) | 🟡 Medium | Rebase or abandon; never merge blind |
| `cursor/*` resurrection | 🔴 High | Archive remotes after 30d; no bulk merge |
| DB stack mixed with drawer fix | 🔴 Critical | Separate worktree; WS-09 only |
| Untracked `.env.local` in primary tree | 🔴 Critical | Verify `.gitignore`; never stage |
| Duplicate docs edited independently | 🟢 Low | **Resolved** by archive move |

---

## Classification index (SAFE · REVIEW · BLOCKED · ARCHIVE)

| Label | Meaning |
|-------|---------|
| **SAFE** | Docs-only or isolated; merge when reviewed |
| **REVIEW** | Needs rebase, dedupe, or explicit human sign-off |
| **BLOCKED** | Frozen zone, missing gate, or dangerous mix |
| **ARCHIVE** | Superseded, duplicate, or orphan — no merge path |

### SAFE

- PR #53 `docs/os-governance-layer`
- `docs/audit-real-usage-pack` branch
- `docs/strategic-operational-baseline` branch
- `docs/personal-phase3-stabilization-log` branch
- WS-01 deliverable (`chore/operational-hygiene`) — this PR
- Canonical `docs/audit/*.md` (non-duplicate)

### REVIEW

- PR #52 `fix/drawer-perceptual-hygiene`
- `workstream/ecommerce-product-card` (stale — rebase required)
- `chore/qa-infrastructure` (stale)
- `scripts/visual/*.mjs` (untracked observation scripts)
- `docs/architecture/` empty stub
- `.review/` local observation packs
- `.gitignore` untracked delta vs main
- Residual doc overlap (governance vs audit)

### BLOCKED

- All `cursor/composer-*`, `cursor/contextual-*`, morph/product-flow branches
- DB / Drizzle / `app/api/media/` stack (WS-09)
- Shadow observe runtime (until verified observe-only)
- `.env.local` and any secrets
- AI resolver / instrumentation changes (WS-08)
- Any mixed-concern dirty-tree merge

### ARCHIVE

- 42 duplicate `* 2.md` files → `docs/archive/audit-duplicate-copies-2026-05-24/`
- `workstream/personal-phase3-actiondrawer` worktree (merged)
- Draft PRs #10–#32 on obsolete cursor branches (close after review)
- `docs/audit/OPERATIONAL_HYGIENE_REPORT.md` — superseded by this report

---

## Suggested isolation strategy

### Phase A — Hygiene (this PR)

1. Land **WS-01** (`chore/operational-hygiene`): archive duplicates + this report.
2. Do **not** commit `.env.local`, `.next/`, or build artifacts.

### Phase B — Governance

3. Merge **PR #53** → establishes `docs/os/MASTER_ROADMAP`, `FREEZE_ZONES`, `WORKSTREAMS` v2.
4. Remove orphan worktree `social-landing-personal-phase3` after confirming main has Phase 3.

### Phase C — Runtime convergence (single lane)

5. Validate **PR #52** using `docs/os/VALIDATION_PROTOCOL.md` (after #53 merge).
6. Merge **PR #52** alone — no other runtime PR in same window.
7. Rebase `workstream/ecommerce-product-card` onto new main; open isolated PR.

### Phase D — Docs convergence

8. Merge audit-real-usage pack and stabilization log as separate docs PRs.
9. Rebase or close `chore/qa-infrastructure`.

### Phase E — Deferred stacks

10. Stack A parity (restaurant footer, appointment confirmation) — WS-03.
11. CI / TypeScript gate — WS-04–05.
12. Influencer → institutional ActionDrawer — WS-06–07.
13. DB/media — WS-09 in dedicated worktree only.

### Worktree hygiene rules

- **One active runtime PR** per worktree.
- **Never** `git add .` on primary tree with untracked WIPs.
- **Prefix branches:** `fix/`, `docs/`, `workstream/`, `chore/` — avoid anonymous commits on `main`.
- **Remove stale worktrees** after branch merge: `git worktree remove <path>`.

---

## Safe merge order

| Order | Item | Type | Blocker |
|-------|------|------|---------|
| **1** | PR #53 — governance layer | docs | None |
| **2** | PR WS-01 — operational hygiene (this) | docs | Can parallel #53; prefer after #53 if conflicts in `docs/os/` |
| **3** | PR #52 — drawer perceptual hygiene | runtime | Validation checklist; #53 recommended for FREEZE_ZONES reference |
| **4** | `docs/personal-phase3-stabilization-log` | docs | None |
| **5** | `docs/audit-real-usage-pack` | docs | Dedupe against post-#53 OS docs |
| **6** | `workstream/ecommerce-product-card` (rebased) | runtime | After #52; ecommerce-only diff |
| **7** | `chore/qa-infrastructure` (rebased or split) | chore | After TS/build baseline clear |
| **8** | Close/archive stale `cursor/*` PRs | hygiene | No merge — reference only |
| **9+** | WS-03 … WS-09 per `docs/os/WORKSTREAMS.md` | varies | Per-workstream gates |

**Do not merge:** DB stack, shadow code, or any `cursor/composer-*` branch before items 1–3 complete.

---

## Trilha map (workstreams → branches)

| WS | Name | Branch(es) | Status |
|----|------|------------|--------|
| WS-01 | Operational Hygiene | `chore/operational-hygiene` | **In PR** |
| WS-02 | Drawer merge + validation | `fix/drawer-perceptual-hygiene` | PR #52 open |
| WS-03 | Stack A parity | TBD from main | Not started |
| WS-04 | CI minimum | `chore/qa-infrastructure` (stale) | REVIEW |
| WS-05 | TypeScript gate | TBD | Not started |
| WS-06 | Influencer ActionDrawer | TBD | BLOCKED until WS-02 |
| WS-07 | Institutional ActionDrawer | TBD | BLOCKED until WS-06 |
| WS-08 | AI resolver | none isolated | BLOCKED |
| WS-09 | DB / storage | dirty tree / other worktree | BLOCKED |

Governance docs (pre–WS-01 numbering) live on `docs/os-governance-layer` → PR #53.

---

## Explicit non-touch list (WS-01 validation)

The following were **not** modified, staged, or committed in this workstream:

### Application / runtime

- `app/**`
- `components/**` (including ActionDrawer, feeds, checkout flows)
- `lib/**` (including composer, surfaces, db if present elsewhere)
- `hooks/**`
- `styles/**`, `public/**`

### Tooling / dependencies

- `package.json`, `pnpm-lock.yaml`, `package-lock.json`
- `tsconfig.json`, `next.config.*`, `drizzle.config.ts`
- `scripts/**` (including existing QA scripts; untracked `scripts/visual/` left unstaged)

### Config / secrets

- `.env`, `.env.local`, `.env.example`
- `.gitignore` (untracked delta not committed)

### Generated / local

- `.next/`, `.pnpm-store/`, `*.tsbuildinfo`
- `.review/` observation packs

### Git / branches

- No branch deletions
- No force pushes
- No remote branch cleanup (documented only)

---

## References

- [`docs/audit/DIRTY_TREE_TRIAGE.md`](../audit/DIRTY_TREE_TRIAGE.md) — original mixed-tree inventory (2026-05-24)
- [`docs/audit/WORKSTREAM_CLASSIFICATION.md`](../audit/WORKSTREAM_CLASSIFICATION.md) — prior classification matrix
- [`docs/archive/README.md`](../archive/README.md) — archive policy
- PR [#53](https://github.com/josoetomasdesouza/SOCIAL-LANDING/pull/53) — governance layer (pending merge)
- PR [#52](https://github.com/josoetomasdesouza/SOCIAL-LANDING/pull/52) — drawer hygiene (pending validation)

---

*Generated as part of WS-01. Next action: merge PR #53, then validate and merge PR #52.*
