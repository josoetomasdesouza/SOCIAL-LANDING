# QA Scripts — Social Landing

Minimal operational QA for `/demo`. No runtime changes — Playwright checks only.

## Prerequisites

```bash
pnpm install
pnpm exec playwright install chromium
pnpm dev   # default http://127.0.0.1:3000/demo
```

Override target:

```bash
export DEMO_URL=http://127.0.0.1:3000/demo
```

## Commands

| Command | Script | Merge gate |
|---------|--------|------------|
| `pnpm qa:events` | `runtime/demo-event-checklist.mjs` | **Yes** — 8/8 required on converge PRs |
| `pnpm qa:personal` | `convergence/personal-phase3-validation.mjs` | **Yes** — 9/9 for personal vertical |
| `pnpm qa:visual` | `visual/personal-phase3-visual-smoke.mjs` | **Soft** — BLOCKER fails; ACCEPTED_WITH_NOTE needs PR note |

## When to run

### Convergence PR (vertical migrate)

1. `pnpm qa:personal` (or future vertical script) — **must pass**
2. `pnpm qa:events` — **must pass** (global regression)
3. `pnpm qa:visual` — run; document any ACCEPTED_WITH_NOTE in PR

### Post-merge stabilization

Re-run steps 1–2 on clean worktree @ merge commit.

### Day-to-day

Optional. Not required for docs-only PRs.

## What blocks merge

- Any **FAIL** in `qa:events` or `qa:personal`
- **BLOCKER** in `qa:visual`
- Missing pasted output on converge PRs (process)

## Observational (not hard CI yet)

- `qa:visual` NEEDS_ADJUSTMENT — human review
- ACCEPTED_WITH_NOTE deltas — document in PR, do not block on pixel parity

## Heuristic / manual (not scripts)

- RU-R observation before migrate — see `docs/convergence/CONTROLLED_MIGRATION_PATTERN.md`
- Stabilization window sign-off — see stabilization log template

## Layout

```
scripts/
  README.md           ← this file
  runtime/            ← global /demo protocol
  convergence/        ← vertical event validation
  visual/             ← perceptual smoke
```

## Future verticals

Copy `convergence/personal-phase3-validation.mjs` → `convergence/<vertical>-phase<n>-validation.mjs`.  
Use exact vertical heading selectors (e.g. `Pessoal`, not regex).

## Protocol

Full checklist: `docs/convergence/CONTROLLED_MIGRATION_PATTERN.md` (update path: `pnpm qa:events`).
