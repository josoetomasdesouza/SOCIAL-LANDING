# QA Infrastructure Plan — Social Landing

**Date:** 2026-05-24  
**Mode:** QA INFRASTRUCTURE (planning only — no runtime or script moves in this pass)  
**Context:** Post Personal Phase 3 · Dirty Tree Triage · STABLE_WITH_NOTES  
**Reference:** `docs/audit/QA_STRATEGY_REVIEW.md`, `docs/convergence/CONTROLLED_MIGRATION_PATTERN.md`

---

## Purpose

Transform proven convergence validations from **ephemeral, worktree-local scripts** into **minimum sustainable operational infrastructure** — without bureaucratic overhead or false confidence.

**Success =** scripts findable, runnable, convention-bound, CI-ready — not a QA department.

---

## Fase 1 — QA inventory

### Complete script map

| Script | Location today | On `main`? | Category | Playwright? |
|--------|----------------|------------|----------|-------------|
| `demo-event-checklist.mjs` | `scripts/` | ✅ | events / runtime | ✅ |
| `personal-phase3-validation.mjs` | worktrees only | ❌ | convergence / events / overflow | ✅ |
| `personal-phase3-visual-smoke.mjs` | worktrees only | ❌ | visual / convergence | ✅ |
| `verify-dev-db-target.mjs` | dirty tree | ❌ | runtime / db preflight | ❌ |
| `auth-health-check.mjs` | dirty tree | ❌ | smoke / db | ❌ (tsx) |
| `media-permission-smoke.mjs` | dirty tree | ❌ | smoke / db | ❌ |
| `media-api-wired-smoke.mjs` | dirty tree | ❌ | smoke / db / API | ❌ |
| `media-api-signed-url-smoke.mjs` | dirty tree | ❌ | smoke / db / API | ❌ |
| `db-smoke-test.sql` | dirty tree | ❌ | smoke / db | ❌ |
| `db-rls-smoke-test.sql` | dirty tree | ❌ | smoke / db | ❌ |
| `db-storage-schema-smoke-test.sql` | dirty tree | ❌ | smoke / db | ❌ |
| `dev-seed-media-e2e.sql` | dirty tree | ❌ | experimental / db | ❌ |
| `storage-buckets-policies-reference.sql` | dirty tree | ❌ | reference / db | ❌ |

### Non-script QA (process artifacts)

| Artifact | Type | Value |
|----------|------|-------|
| `REAL_USAGE_RE_RUN_*` docs | heuristics / observation | High — pre-migrate baseline |
| `PERSONAL_PHASE3_STABILIZATION_LOG.md` | post-merge gate | High — template for #37 pattern |
| Manual RU-R captures | heuristics | High but human-dependent |
| Agent chat “run this command” | experimental | **Discard as process** |

### Category totals

| Category | Count | Official today |
|----------|-------|----------------|
| convergence | 2 | 0 |
| events | 2 (overlap) | 1 partial |
| visual | 1 | 0 |
| overflow | 0 standalone | embedded in validation |
| runtime | 1 | 1 |
| smoke (db) | 4 mjs + 4 sql | 0 on main |
| playwright | 3 | 1 on main |
| heuristics | docs only | not repo'd as scripts |
| experimental | 1 sql seed | 0 |

---

## Fase 1 — Assessment questions

### 1. Which scripts actually added value?

| Script | Value proof |
|--------|-------------|
| `demo-event-checklist.mjs` | **Proven** — 8/8 on stabilization @ `38959cc`; catches global event regressions |
| `personal-phase3-validation.mjs` | **Proven** — 9/9; caught drawerId/surfaceId contract; overflow clean |
| `personal-phase3-visual-smoke.mjs` | **Proven** — enabled COMMIT_WITH_NOTES (80vh vs 90vh); blocked false merge confidence |
| `verify-dev-db-target.mjs` | **Proven locally** — prevents wrong Supabase target; no connection needed |
| db/media smokes | **Proven in WIP** — tied to unmerged stack; value real but **out of scope until db PR** |

### 2. Which detected real problems?

| Detection | Where |
|-----------|-------|
| Event ordering (drawer ↔ surface) | validation + checklist |
| Stable drawer IDs (`personal:contact`, `personal:project`) | validation |
| Body overflow lock after close | validation steps 2b, 6b |
| Vertical selector ambiguity (`Pessoal` vs Influencer) | visual smoke + human lesson |
| Perceptual drawer height delta | visual smoke V6 |
| Global /demo regression after vertical migrate | demo-event-checklist post-merge |

### 3. Which are fragile?

| Item | Fragility |
|------|-----------|
| `demo-event-checklist.mjs` | Hardcoded section IDs (`#section-tutoriais-e-tutoriais`), vertical "Agendamento", timing sleeps |
| Both personal scripts | Require dev server + Playwright browsers; port in `DEMO_URL` |
| Visual smoke | CSS class selectors (`.fixed.bottom-0.z-50`) — breaks on layout refactor |
| db smokes | Require `.env.local`, Supabase, `pnpm dlx tsx`, live DB |
| No shared test utilities | Duplicated `parsePassiveEvent`, `record()` across 3 files |

### 4. Which depend too much on human context?

| Item | Dependency |
|------|------------|
| Visual smoke verdicts | ACCEPTED_WITH_NOTE requires human PR narrative |
| RU-R observation | Manual capture before migrate — no script |
| Stabilization STABLE_WITH_NOTES | Human sign-off after re-run |
| COMMIT_WITH_NOTES deltas | Documented in PR, not machine-verified |
| db smokes | Operator must source env, know project ref |

### 5. Which are duplicated?

| Duplication | Action |
|-------------|--------|
| `demo-event-checklist.mjs` × 3 worktrees | Same file; promote once |
| personal validation/visual × 2 worktrees | Same ephemeral copies |
| Passive event parsing | Copy-pasted in 3 Playwright scripts → **future** `scripts/lib/passive-events.mjs` |
| QA_STRATEGY_REVIEW vs this plan | This doc supersedes for implementation |

### 6. Which should be discarded?

| Item | Verdict |
|------|---------|
| Worktree-only copies after promotion | **Discard** (dedupe) |
| Ad-hoc agent-generated one-off scripts | **Never commit** |
| `dev-seed-media-e2e.sql` as CI gate | **LOCAL_ONLY** until db stack merges |
| `storage-buckets-policies-reference.sql` | **Reference doc**, not a test — move to `docs/` or keep as non-gate |

---

## Fase 2 — Official structure

### Target layout (promotion PR — not applied yet)

```
scripts/
  README.md                         # entry point: what to run when
  lib/
    passive-events.mjs              # shared parse/record (phase 2 — optional)
  runtime/
    demo-event-checklist.mjs        # global /demo event protocol (move from root)
  convergence/
    README.md                       # vertical migrate QA guide
    personal-phase3-validation.mjs
    TEMPLATE-vertical-validation.mjs  # copy template (future)
  visual/
    personal-phase3-drawer-smoke.mjs  # rename from visual-smoke; perceptual gate
    README.md                       # ACCEPTED_WITH_NOTE semantics
  smoke/
    db/
      verify-dev-db-target.mjs
      auth-health-check.mjs
      media-permission-smoke.mjs
      media-api-wired-smoke.mjs
      media-api-signed-url-smoke.mjs
      *.sql                         # manual / psql smokes
  experimental/
    README.md                       # explicitly not CI; may break
```

**Pragmatic phase 1 promotion (minimal move):**

Only promote convergence-proven scripts first. Defer full tree shuffle if it causes import/path churn — **docs define target; chore PR executes**.

---

## Promotion classification

| Asset | Status | Target |
|-------|--------|--------|
| `demo-event-checklist.mjs` | **OFFICIAL** | `scripts/runtime/` (or keep root short-term) |
| `personal-phase3-validation.mjs` | **OFFICIAL** (promote) | `scripts/convergence/` |
| `personal-phase3-visual-smoke.mjs` | **OFFICIAL** (promote) | `scripts/visual/` |
| Shared passive-event helpers | **EXPERIMENTAL** | `scripts/lib/` — extract in follow-up |
| db smokes + verify | **OFFICIAL** (gated) | `scripts/smoke/db/` — **with db-media PR only** |
| SQL reference files | **LOCAL_ONLY** / docs | Not merge gates |
| RU-R manual captures | **PROCESS** | Stay in `docs/audit/` — not scripts |
| Future influencer validation | **EXPERIMENTAL** until proven | Copy from personal template |

### Status legend

| Label | Meaning |
|-------|---------|
| **OFFICIAL** | In repo, documented, expected before merge |
| **EXPERIMENTAL** | In repo under `experimental/`; no CI |
| **LOCAL_ONLY** | May exist locally; never blocks merge |
| **DISCARD** | Do not promote |

---

## Package.json scripts (target)

```json
{
  "qa:events": "node scripts/runtime/demo-event-checklist.mjs",
  "qa:convergence:personal": "node scripts/convergence/personal-phase3-validation.mjs",
  "qa:visual:personal": "node scripts/visual/personal-phase3-drawer-smoke.mjs",
  "qa:convergence": "npm run qa:events && npm run qa:convergence:personal",
  "db:verify-target": "node scripts/smoke/db/verify-dev-db-target.mjs"
}
```

**Note:** Playwright must remain a dev dependency or documented `npx playwright` invocation — see CI doc.

---

## Shared conventions (institutionalize)

### Environment

| Var | Default | Purpose |
|-----|---------|---------|
| `DEMO_URL` | `http://127.0.0.1:3000/demo` | All Playwright scripts |
| `PLAYWRIGHT_BROWSERS_PATH` | OS cache | Document in README |

### Output contract

- Exit `0` = all hard gates pass  
- Exit `1` = failure with step list  
- Visual smoke: `BLOCKER` fails; `ACCEPTED_WITH_NOTE` passes exit 0 but **requires PR note**

### Selector rules

- Vertical labels: **exact** match (`Pessoal`, not regex)  
- Document in `scripts/convergence/README.md`

### Naming for future verticals

```
scripts/convergence/<vertical>-phase<n>-validation.mjs
scripts/visual/<vertical>-phase<n>-drawer-smoke.mjs
```

---

## Implementation sequence (chore PRs)

| PR | Scope | Blocks runtime? |
|----|-------|-----------------|
| **QA-1** | Promote personal scripts + READMEs + npm scripts | No |
| **QA-2** | Move demo-event-checklist to `runtime/` + path updates | No |
| **QA-3** | Extract `scripts/lib/passive-events.mjs` | No |
| **QA-4** | Minimal GitHub Actions (see CI doc) | No |
| **QA-5** | db smokes — **with db-media merge only** | No |

**Do not combine QA-1 with db promotion or runtime changes.**

---

## Anti-patterns (avoid operational fatigue)

| Anti-pattern | Why bad |
|--------------|---------|
| 15 scripts in CI | Slow, flaky, ignored |
| Visual smoke on every PR | Expensive; run on `/demo` or converge paths only |
| Mandatory RU-R script | Observation is human; automate events only |
| Duplicate docs per worktree | Same README in 3 trees |
| QA without README | Scripts become tribal knowledge again |

---

## Dependency on dirty tree triage

QA promotion **does not** resolve dirty tree. Order:

1. Merge PR #37  
2. PR docs (Runtime Reality Audit + Dirty Tree Triage + **this QA pack**)  
3. **Chore PR:** promote scripts from clean worktree @ `origin/main`  
4. **Chore PR:** CI minimum  

Scripts should be copied from `social-landing-main-stabilization` worktree (known-good @ stabilization), not from dirty `SOCIAL-LANDING`.

---

## Success criteria

- [ ] All proven scripts live on `main` under conventional paths  
- [ ] `scripts/README.md` answers “what do I run before merge?”  
- [ ] npm scripts exist for top 3 checks  
- [ ] No QA script exists only in a worktree  
- [ ] db smokes explicitly gated on db-media PR  
- [ ] Operational fatigue guarded — ≤5 official gates total  

**Status:** Plan complete — execution via chore PR(s) when authorized.
