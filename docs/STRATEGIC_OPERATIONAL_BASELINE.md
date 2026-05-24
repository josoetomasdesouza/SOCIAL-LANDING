# Strategic & Operational Baseline — Social Landing

**Date:** 2026-05-24  
**Baseline commit target:** post PR #37 + #38 (`origin/main`)  
**Mode:** Docs-only institutional index — not a roadmap commit

---

## What this pack is

Official consolidation of **operational maturity**, **runtime reality**, **hygiene learnings**, **QA infrastructure thinking**, and **strategic direction** after Personal Phase 3 convergence.

**Not included:** runtime changes, port wiring, influencer work, orphan drafts, or the full historical audit archive (~40+ exploratory docs remain local until curated separately).

---

## Read order

| Order | Document | Why |
|-------|----------|-----|
| 1 | [`audit/EXECUTIVE_REALITY_SUMMARY.md`](audit/EXECUTIVE_REALITY_SUMMARY.md) | Runtime + org reality in one page |
| 2 | [`audit/DIRTY_TREE_TRIAGE.md`](audit/DIRTY_TREE_TRIAGE.md) | Biggest operational risk today |
| 3 | [`audit/QA_EXECUTIVE_SUMMARY.md`](audit/QA_EXECUTIVE_SUMMARY.md) | QA as infrastructure (#38 implements scripts) |
| 4 | [`foundation/EXECUTIVE_PLATFORM_DIRECTION.md`](foundation/EXECUTIVE_PLATFORM_DIRECTION.md) | Orchestration-layer strategy |

---

## Pack index

### Runtime Reality Audit (4)

| Doc | Role |
|-----|------|
| [`RUNTIME_REALITY_AUDIT.md`](audit/RUNTIME_REALITY_AUDIT.md) | Full runtime audit |
| [`PERCEPTUAL_MATURITY_REPORT.md`](audit/PERCEPTUAL_MATURITY_REPORT.md) | Perceptual maturity |
| [`CONVERGENCE_ECONOMICS.md`](audit/CONVERGENCE_ECONOMICS.md) | Cost of converge |
| [`EXECUTIVE_REALITY_SUMMARY.md`](audit/EXECUTIVE_REALITY_SUMMARY.md) | Executive summary |

### Dirty Tree Triage (3)

| Doc | Role |
|-----|------|
| [`DIRTY_TREE_TRIAGE.md`](audit/DIRTY_TREE_TRIAGE.md) | Inventory |
| [`WORKSTREAM_CLASSIFICATION.md`](audit/WORKSTREAM_CLASSIFICATION.md) | Peel verdicts |
| [`OPERATIONAL_HYGIENE_REPORT.md`](audit/OPERATIONAL_HYGIENE_REPORT.md) | Branches/worktrees |

### QA Institutionalization (4)

| Doc | Role |
|-----|------|
| [`QA_INFRASTRUCTURE_PLAN.md`](audit/QA_INFRASTRUCTURE_PLAN.md) | Script promotion plan |
| [`CI_MINIMUM_STRATEGY.md`](audit/CI_MINIMUM_STRATEGY.md) | Minimal CI tiers |
| [`CONVERGENCE_TEST_PROTOCOL.md`](audit/CONVERGENCE_TEST_PROTOCOL.md) | Per-migrate checklist |
| [`QA_EXECUTIVE_SUMMARY.md`](audit/QA_EXECUTIVE_SUMMARY.md) | QA executive review |

**Implemented on main:** PR #38 — `scripts/runtime/`, `scripts/convergence/`, `scripts/visual/`, `pnpm qa:*`

### Foundation — Integration & Identity (5)

| Doc | Role |
|-----|------|
| [`foundation/INTEGRATION_STRATEGY_ANALYSIS.md`](foundation/INTEGRATION_STRATEGY_ANALYSIS.md) | Integration mapping |
| [`foundation/NATIVE_OWNERSHIP_MAP.md`](foundation/NATIVE_OWNERSHIP_MAP.md) | Native vs external |
| [`foundation/ABSTRACTION_BOUNDARIES.md`](foundation/ABSTRACTION_BOUNDARIES.md) | Tier1 / ports / providers |
| [`foundation/EXECUTIVE_PLATFORM_DIRECTION.md`](foundation/EXECUTIVE_PLATFORM_DIRECTION.md) | Platform direction |
| [`foundation/FUTURE_USERNAME_IDENTITY_NOTE.md`](foundation/FUTURE_USERNAME_IDENTITY_NOTE.md) | Future identity (no impl) |

---

## Architectural principles (from this baseline)

1. **Tier 1 never imports provider SDKs** — orchestration owns semantics  
2. **Integration-first → selective native ownership** — own experience, rent rails  
3. **`lib/integrations` ports exist; runtime must not bypass them forever** — wire later, align semantics now  
4. **Never merge dirty tree wholesale** — peel by workstream  
5. **Copy Personal converge protocol** — do not reinvent per vertical  
6. **Institutionalize ≠ bureaucratize** — minimum QA, not CI theater  

---

## Superseded / not in this PR

| Doc | Verdict |
|-----|---------|
| `QA_STRATEGY_REVIEW.md` | Superseded by QA Institutionalization pack |
| Dirty-tree `docs/convergence/*` drafts | Superseded by main convergence docs (PR #36, #37) |
| ~40 audit exploration docs (REAL_USAGE, temporal, contracts, shadow) | **KEEP_LOCAL** — peel in future `docs/audit-real-usage-pack` PR |
| `docs/audit/INTEGRATION_STRATEGY.md` (older, on main) | Coexists; **foundation pack is strategic authority** |

---

## Already on main (related)

- `docs/convergence/CONTROLLED_MIGRATION_PATTERN.md`  
- `docs/convergence/PERSONAL_PHASE3_*` + stabilization log (#37)  
- `scripts/README.md` + QA scripts (#38)  
- Original strategic audit set (14 files in `docs/audit/`)

---

## Next steps (process — not this PR)

1. Merge this docs baseline  
2. Short operational pause  
3. Dirty tree peel (workstreams)  
4. **Influencer readiness only** — not migrate until human GO  

**Explicitly not next:** port wiring, BookingPort runtime, identity engine, native commerce.
