# Controlled Migration Pattern — Blueprint

**Version:** 1.0 (extracted from Personal Phase 3)  
**Date:** 2026-05-24  
**Reference commit:** `43c969aa3f02007d742fdd09f19d7e546e432ba9`  
**Status:** PROVEN — one successful convergence

---

## Purpose

Transform the first successful personal migration into a **repeatable organizational capability** for future Stack B → Stack A drawer convergences (and similar scoped runtime evolutions).

This is a **process blueprint**, not a license to accelerate without gates.

---

## When to use

Use this pattern when:

- Migrating a vertical from `InstrumentedDrawerBridge` + shadcn/vaul to `ActionDrawer`
- Runtime change is **scoped** to one vertical (or explicit allowlist)
- Platform is in **governance/observation mode** (Tier 1 frozen, no shadow apply, no reducer)

Do **not** use this pattern to justify:

- Multi-vertical batch migrations
- Global ActionDrawer refactors
- Visual “pixel parity” projects
- Typecheck-debt cleanup mixed into converge PRs

---

## Pattern overview

```
┌─────────────────┐
│ 0. BLOCKER CHECK │  dirty tree? mixed workstreams? → isolate first
└────────┬────────┘
         ▼
┌─────────────────┐
│ 1. SPEC         │  allowlist, forbidden files, IDs, events, rollback
└────────┬────────┘
         ▼
┌─────────────────┐
│ 2. APPROVAL     │  CONDITIONAL GO / NO-GO (human + process)
└────────┬────────┘
         ▼
┌─────────────────┐
│ 3. ISOLATION    │  git worktree + branch from clean main SHA
└────────┬────────┘
         ▼
┌─────────────────┐
│ 4. OBSERVATION  │  REAL_USAGE / RU-R captures on target vertical
└────────┬────────┘
         ▼
┌─────────────────┐
│ 5. IMPLEMENT    │  scoped files only; stop if scope expansion needed
└────────┬────────┘
         ▼
┌─────────────────┐
│ 6. VALIDATE     │  vertical event script + demo-event-checklist
└────────┬────────┘
         ▼
┌─────────────────┐
│ 7. VISUAL SMOKE │  exact selectors; ACCEPTED_WITH_NOTE allowed
└────────┬────────┘
         ▼
┌─────────────────┐
│ 8. REVIEWS      │  code + payload + escape (document deltas)
└────────┬────────┘
         ▼
┌─────────────────┐
│ 9. COMMIT GATE  │  COMMIT_WITH_NOTES; 3-file hygiene
└────────┬────────┘
         ▼
┌─────────────────┐
│10. CONSOLIDATE  │  postmortem + pattern update (this doc)
└────────┬────────┘
         ▼
     PAUSE — no immediate next migrate
```

---

## Phase details

### 0. Blocker check

**Inputs:** `git status`, workstream classification doc  
**Gate:** If dirty tree mixes ≥2 workstreams → **NO-GO implement**  
**Tool:** `git worktree add ../<name> -b workstream/<vertical>-<feature> <clean-sha>`

**Personal proof:** Main had ecommerce + db + shadow + audit docs mixed; worktree was clean @ `e002921`.

---

### 1. Spec

**Artifact:** `docs/convergence/<VERTICAL>_PHASE<N>_SPEC.md`

**Must include:**

- Goal (what changes, what does not)
- Drawer inventory (IDs, triggers, content)
- Allowed files (explicit list)
- Forbidden files (Tier 1, other verticals, bus, shadow, db)
- Event contract (drawer↔surface, stable IDs)
- Validation plan
- Rollback path

---

### 2. Approval

**Artifact:** `docs/convergence/<VERTICAL>_PHASE<N>_APPROVAL.md`

**Verdicts:**

| Verdict | Meaning |
|---------|---------|
| Spec GO | Spec is complete |
| Implement NO-GO | Blocked (dirty tree, missing observation, human hold) |
| Implement CONDITIONAL GO | After isolation + observation |

**Rule:** Spec approval ≠ implement authorization.

---

### 3. Branch isolation

**Branch naming:** `workstream/<vertical>-<short-feature>`  
**Example:** `workstream/personal-phase3-actiondrawer`

**Precheck (every session):**

```bash
pwd                    # must end in isolated worktree path
git branch --show-current
git status --short     # clean before implement
git rev-parse HEAD     # matches approved base SHA
```

---

### 4. Runtime observation

**Before implement**, capture real usage on target vertical:

- Open/close paths (click, Escape if applicable)
- Event ordering (drawer.opened ↔ surface.opened timing)
- Overflow after close
- Console cleanliness

**Artifact:** `docs/audit/REAL_USAGE_*` or vertical-specific capture notes  
**Personal proof:** RU-R-03 ACCEPTED for `personal:contact` before migrate.

---

### 5. Scoped implementation

**Rules:**

- Edit only allowlisted files
- If ActionDrawer needs API extension → **minimal optional prop only** (e.g. `drawerId?`)
- If fix requires forbidden file → **STOP and report**
- No “while we’re here” refactors

**Personal allowlist:**

- `components/business/personal/personal-feed.tsx`
- `components/business/action-drawer.tsx` (optional `drawerId` only)

---

### 6. Event validation

**Vertical-specific script** (ephemeral or promoted later):

- Stable drawer IDs in payload
- drawer.opened + surface.opened on open
- drawer.closed + surface.closed on close
- Escape + button close
- overflow clean

**Global regression:**

```bash
node scripts/demo-event-checklist.mjs   # 8/8 on /demo
```

**Personal results:** 9/9 + 8/8 PASS.

---

### 7. Visual smoke

**Selector rule:** Exact vertical label — e.g. `Pessoal` not `/Pessoal/i` (matches “personalidades” on Influencer).

**Verdicts:**

| Verdict | Action |
|---------|--------|
| ACCEPTED_VISUAL | Pass |
| ACCEPTED_WITH_NOTE | Pass with documented delta |
| NEEDS_ADJUSTMENT | Fix or re-scope |
| BLOCKER | No commit |

**Personal:** PASS_WITH_NOTES (80vh cap, ActionDrawer chrome).

---

### 8. Reviews (mandatory before commit)

#### Code review checklist

- Optional API backward compatible
- Stable IDs preserved
- Content + triggers preserved
- Listener cleanup (Escape)
- Tier 1 untouched
- Other verticals untouched

#### Payload review

- Any consumer depends on old payload fields?
- Accept convergence deltas explicitly?

#### Escape review

- Local vs global decision documented
- No silent global behavior change

---

### 9. Commit gating

**Include only:**

- Vertical feed file(s)
- Minimal shared component change (if any)
- `docs/convergence/*_IMPLEMENTATION_RESULT.md`

**Exclude:**

- `.next/`, `node_modules/`, lockfile churn unrelated to scope
- Ephemeral QA scripts (unless promoted deliberately)

**Message style:** Short title + notes in doc / PR body for deltas.

**Personal commit:** `43c969a` — 3 files, +341/−75.

---

### 10. Rollback discipline

**Before commit:** know revert command  
**After commit:** branch revert or `git revert` — never “fix forward” across verticals in panic

```bash
git checkout -- components/business/<vertical>/<vertical>-feed.tsx
# or reset branch to base SHA if no downstream deps
```

---

### 11. Post-migration consolidation (mandatory pause)

After first commit on a pattern:

- Write postmortem
- Update this blueprint
- Assess shared component readiness
- Classify next vertical readiness
- **Do not** immediately start next vertical

---

## Artifact map (per convergence)

| Phase | Artifact |
|-------|----------|
| Spec | `*_SPEC.md` |
| Approval | `*_APPROVAL.md` |
| Isolation | `WORKING_TREE_ISOLATION_CHECK.md` (or equivalent) |
| Branch plan | `*_BRANCH_PLAN.md` |
| Implement result | `*_IMPLEMENTATION_RESULT.md` |
| Postmortem | `*_POSTMORTEM.md` |
| Pattern | `CONTROLLED_MIGRATION_PATTERN.md` (this file) |

---

## Anti-patterns (learned from near-misses)

1. Implement on dirty main “because it’s small”
2. Regex vertical selectors in Playwright
3. Chase vaul pixel-parity in ActionDrawer globally
4. Add `vertical`, `drawerKind`, Escape to ActionDrawer “for consistency” mid-migration
5. Push + next vertical same day
6. Mix docs/audit pack into converge PR
7. Skip global `demo-event-checklist` because “we only touched personal”

---

## Success criteria (pattern level)

A convergence iteration is successful when:

- [ ] Isolated branch from clean SHA
- [ ] Scoped runtime diff only
- [ ] Vertical event validation PASS
- [ ] Global demo checklist PASS
- [ ] Visual smoke PASS or PASS_WITH_NOTES
- [ ] Deltas consciously accepted and documented
- [ ] Clean commit (no contamination)
- [ ] Postmortem written
- [ ] Explicit pause before next vertical

**Personal Phase 3:** all boxes checked.

---

## Next pattern evolution (v1.1 candidates)

- Promote vertical validation script to repo (`scripts/convergence/`)
- Standard PR template with three delta notes
- Shadow expectation update checklist when shadow pack lands
- Optional ActionDrawer ADR before influencer (Escape / vertical prop)

Do not implement v1.1 until organizational pause completes.
