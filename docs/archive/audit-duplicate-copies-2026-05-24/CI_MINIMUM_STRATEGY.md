# CI Minimum Strategy — Social Landing

**Date:** 2026-05-24  
**Mode:** Strategy only — no workflow files in this pass  
**Principle:** **Minimum viable protection** — not bureaucracy theater

---

## Design constraints

1. **No CI gigante** — if checks are slow or flaky, they will be skipped  
2. **Static before browser** — prefer grep/AST checks where possible (future)  
3. **Browser checks are expensive** — scope narrowly  
4. **Merge gates ≠ observational checks** — separate tiers explicitly  
5. **No secrets in CI** until db stack is on main with documented test project  

---

## Tier model

| Tier | Name | Blocks merge? | Runs when |
|------|------|---------------|-----------|
| **T0** | Repo hygiene | Optional | Every PR |
| **T1** | Static runtime QA | **Yes** (target) | Every PR touching `components/`, `lib/`, `app/` |
| **T2** | Playwright event protocol | **Yes** on converge PRs | Manual + CI nightly (phase 1) |
| **T3** | Vertical convergence QA | **Yes** on converge PRs only | Converge PR + stabilization |
| **T4** | Visual perceptual smoke | **No** (observational in CI) | Nightly or manual; human notes in PR |
| **T5** | db/media smokes | **Yes** on db PRs only | Requires Supabase secrets |

---

## Fase 3 — Answers

### 1. Which checks should always run?

**Phase 1 (immediate after QA promotion PR):**

| Check | Tier | Rationale |
|-------|------|-----------|
| `eslint .` | T0 | Already in package.json; cheap |
| Script existence / path lint | T0 | Optional: verify promoted scripts parse (`node --check`) |

**Phase 2 (after Playwright in CI proven stable):**

| Check | Tier | Rationale |
|-------|------|-----------|
| `node scripts/runtime/demo-event-checklist.mjs` | T2 | Global event contract — highest ROI |

**Not “always” yet:**

- `tsc --noEmit` — blocked by `typescript.ignoreBuildErrors: true` policy; **decision required** before making merge gate  
- Visual smoke — too heavy for every PR  
- db smokes — wrong scope until db on main  

---

### 2. Which checks are too expensive?

| Check | Cost | Verdict |
|-------|------|---------|
| `demo-event-checklist.mjs` | ~30–60s + dev server + Chromium | **Moderate** — OK for nightly/converge, not every typo PR |
| `personal-phase3-validation.mjs` | ~20–40s + server | **Converge PR only** |
| `personal-phase3-visual-smoke.mjs` | ~30s + screenshots implicit | **Nightly or manual** |
| Full `next build` | High; ignores TS errors today | **Observational** until typecheck policy fixed |
| db API smokes | Network + secrets + tsx | **db PR only** |
| Playwright across 12 verticals | Prohibitive | **Never** in minimum CI |

---

### 3. Which checks are local only?

| Check | Why local |
|-------|-----------|
| Visual smoke with ACCEPTED_WITH_NOTE | Human documents perceptual deltas in PR |
| RU-R manual observation | Pre-migrate capture; not automatable fully |
| `verify-dev-db-target.mjs` | Pre-flight before local migrate |
| SQL smokes via psql | Operator-driven; no CI secrets yet |
| Stabilization window re-run | Human timing judgment (48h pause) |

---

### 4. Which should block merge?

| PR type | Required gates |
|---------|----------------|
| **Docs-only** | None beyond GitHub review |
| **General runtime** (non-converge) | eslint (T0); optional tsc when policy fixed |
| **Convergence PR** (vertical migrate) | eslint + **demo-event-checklist 8/8** + **vertical validation N/N** + PR must paste outputs |
| **db-media PR** | db verify + auth health + media smokes (T5) |
| **Chore QA PR** | Scripts `node --check` parse |

**Visual smoke:** **Does not block CI exit** in phase 1 — PR author attests PASS or PASS_WITH_NOTES in description template. Optional nightly job fails on BLOCKER only.

---

### 5. Which are observational only?

| Check | Purpose |
|-------|---------|
| Visual smoke (CI nightly) | Early warning on CSS drift |
| `next build` in CI | Track build breakage; not authoritative until TS enforced |
| Event count JSON in checklist summary | Trending, not gating initially |
| Future: shadow divergence stats | Dev-only; never merge gate |

---

### 6. Which require real viewport/device?

| Check | Viewport | Notes |
|-------|----------|-------|
| All 3 Playwright scripts | 390×844 mobile | **Required** — desktop misses drawer/composer behavior |
| Long-press morph test | Mobile + touch timing | 500ms press in checklist |
| Overflow checks | Mobile | body.style.overflow |
| Visual height ratio V6 | Mobile 844px | 80vh perceptual |

**CI implication:** Playwright jobs must set viewport in script (already done) — no device farm needed for minimum strategy.

---

## Recommended workflow (minimal)

### File: `.github/workflows/qa-minimum.yml` (future chore PR)

```yaml
name: QA Minimum

on:
  pull_request:
    paths:
      - 'components/**'
      - 'lib/**'
      - 'app/**'
      - 'scripts/**'
  workflow_dispatch:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  script-parse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: node --check scripts/runtime/demo-event-checklist.mjs
      - run: node --check scripts/convergence/personal-phase3-validation.mjs
      - run: node --check scripts/visual/personal-phase3-drawer-smoke.mjs
```

### File: `.github/workflows/qa-playwright-nightly.yml` (phase 2)

```yaml
name: QA Playwright Nightly

on:
  schedule:
    - cron: '0 6 * * *'   # 06:00 UTC daily
  workflow_dispatch:

jobs:
  demo-events:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install chromium
      - run: pnpm dev &
      - run: npx wait-on http://127.0.0.1:3000/demo
      - run: DEMO_URL=http://127.0.0.1:3000/demo node scripts/runtime/demo-event-checklist.mjs
```

**Converge PRs:** require maintainer to run playwright locally and paste 8/8 + N/N in PR until nightly is trusted (~2 weeks flake-free).

---

## Path-based triggering (avoid noise)

| Path changed | Run |
|--------------|-----|
| `docs/**` only | lint optional skip |
| `components/business/personal/**` | full converge QA set |
| `components/business/action-drawer.tsx` | demo-events + **all** vertical validations on main |
| `lib/db/**` | db smokes (when exist on main) |
| `scripts/**` | script-parse always |

---

## Failure semantics

| Exit code | CI behavior | Human behavior |
|-----------|-------------|----------------|
| 0 | Green | Proceed |
| 1 | Red | Fix or revert |
| Visual ACCEPTED_WITH_NOTE + exit 0 | Green (if run) | PR must list deltas |
| Stabilization FAIL | No merge | Extend window |

---

## What NOT to put in CI

| Item | Reason |
|------|--------|
| 12 vertical validations | Unmaintainable |
| Shadow observer registration | Dev-only |
| REAL_USAGE manual checklist | Not machine-verifiable |
| `pnpm dlx tsx` without lock | Non-deterministic |
| Full visual regression screenshots | Storage + flake cost |
| Mandatory 48h stabilization timer | Process, not automation |

---

## Readiness for stronger CI

| Prerequisite | Status |
|--------------|--------|
| Scripts on main | ❌ Pending promotion PR |
| Playwright in devDependencies | ⚠️ Verify on main (currently npx invocation) |
| Single lockfile (pnpm) | ⚠️ Dirty tree has package-lock noise |
| Typecheck policy | ❌ ignoreBuildErrors blocks tsc gate |
| CI flake budget owner | ❌ Assign on first nightly |
| Supabase test project for db | ❌ db not on main |

**Verdict:** Ready for **T0–T1** immediately after QA promotion. **T2 nightly** after one week local stability. **T3 converge gates** manual until nightly proven. **T5** deferred.

---

## Cost / benefit summary

| Investment | Protection gained |
|------------|-------------------|
| lint on PR | Syntax/import hygiene |
| script-parse | Prevents broken QA infra |
| nightly demo-events | Catches silent event protocol regression |
| converge manual paste | Preserves human review without CI cost |
| db smokes on db PR | Prevents auth/storage regressions |

**Target CI time (minimum path):** < 3 min per PR (lint + parse). Nightly ~5 min with Playwright.

---

## Related documents

- `QA_INFRASTRUCTURE_PLAN.md` — script promotion  
- `CONVERGENCE_TEST_PROTOCOL.md` — when to run each check  
- `QA_EXECUTIVE_SUMMARY.md` — strategic verdict  

**Status:** Strategy defined — workflow implementation is separate chore PR QA-4.
