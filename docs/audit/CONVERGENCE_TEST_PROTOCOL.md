# Convergence Test Protocol — Social Landing

**Date:** 2026-05-24  
**Version:** 1.0 (institutionalized from Personal Phase 3)  
**Status:** OFFICIAL PROCESS — scripts promotion pending chore PR  
**Parent:** `docs/convergence/CONTROLLED_MIGRATION_PATTERN.md`

---

## Purpose

Define the **minimum official test protocol** for every future vertical convergence (Stack B → Stack A drawer migration and similar scoped runtime evolutions).

**Goal:** Repeatable gates without empty ritual.

---

## Protocol overview

```
PRE-MIGRATE          IMPLEMENT           PRE-MERGE              POST-MERGE
───────────          ─────────           ─────────              ──────────
RU-R observation  →  scoped code     →   vertical validation  →  demo-events 8/8
(spec/docs)          only                + visual smoke           + stabilization
                                         + PR notes                 window
                                         + 8/8 global
```

---

## Gate matrix

| Gate | Type | Required | Blocks merge | Script / artifact |
|------|------|----------|--------------|-------------------|
| Workstream isolation | process | ✅ | ✅ | clean worktree; `git status` empty |
| RU-R / observation | heuristics | ✅ | ✅ (implement) | `docs/audit/REAL_USAGE_*` or vertical note |
| Vertical event validation | automated | ✅ | ✅ | `scripts/convergence/<v>-validation.mjs` |
| Global event checklist | automated | ✅ | ✅ | `scripts/runtime/demo-event-checklist.mjs` |
| Visual drawer smoke | automated + human | ✅ | ⚠️ soft | `scripts/visual/<v>-drawer-smoke.mjs` |
| Overflow clean | embedded | ✅ | ✅ | in validation (steps *b) |
| Console clean | embedded | ✅ | ✅ | in validation step 7 |
| Payload review | human | ✅ | ✅ | drawerId, surfaceId, drawerKind |
| Escape behavior | automated | ✅ | ✅ | in validation |
| Accepted deltas doc | human | if needed | ✅ | PR section COMMIT_WITH_NOTES |
| Rollback notes | human | ✅ | ✅ | spec § rollback |
| Stabilization re-run | automated + human | ✅ post-merge | ✅ next converge | same scripts @ merge SHA |
| 48h pause | process | ✅ | ✅ next vertical | stabilization log |

---

## Minimum checklist (copy for each converge)

### A. Pre-implement (observation)

- [ ] Spec + approval docs exist (`CONDITIONAL GO`)
- [ ] Branch from clean `origin/main` SHA (not dirty tree)
- [ ] Drawer inventory: IDs, triggers, titles documented
- [ ] RU-R capture: open/close paths, event order, overflow, console
- [ ] Forbidden files untouched (Tier 1, other verticals, shadow apply, db)

### B. Pre-merge (validation)

- [ ] Vertical validation: **N/N PASS** (paste output in PR)
- [ ] Global demo-events: **8/8 PASS** (paste output in PR)
- [ ] Visual smoke: **PASS** or **PASS_WITH_NOTES** (list ACCEPTED_WITH_NOTE items)
- [ ] Overflow: `document.body.style.overflow === ""` after each close
- [ ] No critical console errors (favicon/404 excluded)
- [ ] PR diff scoped to allowlist only
- [ ] Rollback path stated (revert commit hash ready)

### C. Post-merge (stabilization window)

- [ ] Clean worktree @ merge commit
- [ ] Re-run vertical validation: **N/N PASS**
- [ ] Re-run demo-events: **8/8 PASS**
- [ ] Stabilization log entry (docs PR like #37)
- [ ] Verdict: **STABLE** | **STABLE_WITH_NOTES** | **UNSTABLE**
- [ ] **48h minimum** before next vertical converge (unless hotfix)

---

## Script runbook

### Prerequisites

```bash
# Terminal 1 — dev server
pnpm dev   # or ./node_modules/.bin/next dev -p 3000

# Terminal 2 — QA (after script promotion)
export DEMO_URL=http://127.0.0.1:3000/demo
export PLAYWRIGHT_BROWSERS_PATH=~/Library/Caches/ms-playwright  # macOS; document for Linux CI
```

### Order (always)

```bash
# 1. Vertical-specific (example: personal)
node scripts/convergence/personal-phase3-validation.mjs

# 2. Global regression
node scripts/runtime/demo-event-checklist.mjs

# 3. Visual (perceptual — document notes)
node scripts/visual/personal-phase3-drawer-smoke.mjs
```

**Rule:** Never merge if (1) or (2) fails. (3) may pass with notes.

---

## Verdict semantics

### Automated scripts

| Result | Meaning | Action |
|--------|---------|--------|
| N/N PASS | All hard steps green | Proceed |
| FAIL | Any step red | Fix or revert |
| exit 1 | Hard failure | Block merge |

### Visual smoke

| Verdict | Meaning | Action |
|---------|---------|--------|
| ACCEPTED_VISUAL | Matches expectation | Proceed |
| ACCEPTED_WITH_NOTE | Known delta; documented | Proceed with PR note |
| NEEDS_ADJUSTMENT | Unclear; review | Human decision |
| BLOCKER | Functional/perceptual break | Do not merge |

### Stabilization

| Verdict | Meaning | Next converge |
|---------|---------|---------------|
| STABLE | All gates pass; no notes | Allowed after 48h + human OK |
| STABLE_WITH_NOTES | Pass with documented deltas | Allowed after 48h + human OK |
| UNSTABLE | Validation fail on main | **STOP** — hotfix before anything else |

---

## Personal Phase 3 reference (proven)

| Gate | Result |
|------|--------|
| Vertical validation | 9/9 PASS |
| demo-event-checklist | 8/8 PASS |
| Visual smoke | PASS_WITH_NOTES (80vh, handle/X, drawerKind `action`) |
| Stabilization @ `38959cc` | STABLE_WITH_NOTES |
| Accepted deltas | Documented in IMPLEMENTATION_RESULT + stabilization log |

Use as **template**, not as excuse to skip gates for influencer.

---

## Fase 4 — Protocol review

### 1. Is the current protocol good?

**Yes — with one scope fix.**

Strengths:
- Separation of vertical vs global regression
- Overflow + console as hard gates
- COMMIT_WITH_NOTES for perceptual reality
- Stabilization window caught post-merge drift

Weakness:
- Scripts not on main yet → protocol is **process-only** until promotion

### 2. What to simplify?

| Remove / defer | Why |
|----------------|-----|
| Duplicate validation runs >3 pre-merge | 2 sufficient: after implement + before push |
| Mandatory visual smoke in CI | Keep manual/nightly; paste in PR |
| New script per micro-change | Reuse template; change IDs only |
| RU-R as 20-page doc | One page capture sufficient if events listed |

### 3. What to institutionalize?

| Item | How |
|------|-----|
| Script paths | `scripts/convergence/`, `scripts/visual/`, `scripts/runtime/` |
| PR template section | Paste 8/8 + N/N outputs |
| Stabilization log doc | After every converge merge |
| Selector rule | Exact vertical name in README |
| Template script | Copy `personal-phase3-validation.mjs` → `influencer-phase3-validation.mjs` |

### 4. What is still excess?

| Item | Verdict |
|------|---------|
| 10-phase pattern doc + this protocol | Keep both — pattern is narrative, protocol is checklist |
| Multiple audit packs saying same QA thing | Consolidate after this pack merges |
| Re-running visual smoke daily during stabilization | Once at merge SHA sufficient |
| Pixel-perfect visual automation | Out of scope — human notes enough |

### 5. What must NOT become empty ritual?

| Ritual risk | Guard |
|-------------|-------|
| Pasting fake PASS in PR | Require CI or maintainer spot-check |
| STABLE_WITH_NOTES without listed deltas | Reject PR |
| Skipping 8/8 because “vertical only changed” | **Personal proved global regression possible** |
| RU-R checkbox without capture | Implement NO-GO |
| Stabilization log without re-run output | Doc-only PR rejected |

---

## Future vertical: influencer (NOT STARTED)

When authorized, **copy protocol exactly**:

1. New spec + approval  
2. Observation on influencer drawers (5× vaul bridge)  
3. `influencer-phase3-validation.mjs` — exact heading **"Influencer"** or project convention  
4. Same 8/8 global  
5. Visual smoke with COMMIT_WITH_NOTES for vaul→ActionDrawer deltas  
6. **Do not start** until: PR #37 merged, dirty tree peeled, QA scripts on main, stabilization human sign-off  

---

## Overflow protocol (embedded standard)

Every vertical validation **must** include:

```javascript
const overflow = await page.evaluate(() => document.body.style.overflow)
// PASS if overflow === "" after each drawer close path (button + Escape)
```

Standalone overflow script **not needed** — keep embedded to avoid ritual proliferation.

---

## Event integrity protocol

Required events per drawer open/close (minimum):

| Action | Events |
|--------|--------|
| Open | `drawer.opened` + `surface.opened` (stable IDs in payload) |
| Close button | `drawer.closed` + `surface.closed` |
| Escape | `drawer.closed` (surface per implementation) |

Global checklist additionally verifies: morph, composer, whatsapp — **unchanged by vertical migrate**.

---

## Rollback notes (mandatory in PR)

Template:

```markdown
## Rollback
- Revert commit: `<hash>`
- Files: `<allowlist>`
- Known side effect: `<e.g. personal returns to vaul bridge>`
- Re-validate after revert: `8/8 demo-events`
```

---

## Related documents

- `CONTROLLED_MIGRATION_PATTERN.md` — full 10-phase narrative  
- `QA_INFRASTRUCTURE_PLAN.md` — where scripts live  
- `CI_MINIMUM_STRATEGY.md` — what runs in GitHub Actions  
- `PERSONAL_PHASE3_STABILIZATION_LOG.md` — worked example  

**Status:** Protocol official — awaiting script promotion to match.
