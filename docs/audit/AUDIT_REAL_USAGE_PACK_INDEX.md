# Audit Real-Usage Pack — Index

**Branch:** `docs/audit-real-usage-pack`  
**Base:** `origin/main @ be5d812`  
**Mode:** Docs-only — no runtime changes  
**Created:** 2026-05-24 (dirty tree peel — Phase 1)

---

## Purpose

Institutional pack of **local-only** audit and governance docs peeled from the legacy dirty worktree. Complements the baseline pack in `docs/STRATEGIC_OPERATIONAL_BASELINE.md` without duplicating docs already on main.

---

## Read order

| Order | Document | Role |
|-------|----------|------|
| 1 | `RUNTIME_GOVERNANCE.md` | Governance rules for runtime evolution |
| 2 | `REAL_USAGE_VALIDATION.md` | Baseline real-usage observations |
| 3 | `REAL_USAGE_RE_RUN_RESULTS.md` | Post-stabilization re-run |
| 4 | `SESSION_TIMELINES.md` | Temporal session evidence |
| 5 | `SURFACE_DIVERGENCES.md` | Surface-level divergences |
| 6 | `WORKSTREAM_ISOLATION_PLAN.md` | Isolation procedure |
| 7 | `contracts/` | Contract skeletons (6 files) |

---

## Pack contents (35 files)

### Real usage & temporal (8)

- `REAL_USAGE_VALIDATION.md`
- `REAL_USAGE_RE_RUN_PLAN.md`
- `REAL_USAGE_RE_RUN_RESULTS.md`
- `SESSION_TIMELINES.md`
- `TEMPORAL_CLASSIFICATION.md`
- `TEMPORAL_RISK_REPORT.md`
- `RUNTIME_TEMPORAL_MAPPING_PLAN.md`
- `RUNTIME_STATE_MAP.md`

### Governance & isolation (6)

- `RUNTIME_GOVERNANCE.md`
- `WORKSTREAM_ISOLATION_PLAN.md`
- `WORKING_TREE_ISOLATION_CHECK.md`
- `WORKING_TREE_AUDIT.md`
- `CONTROLLED_EXECUTION_READINESS.md`
- `NEXT_EVOLUTION_DECISION.md`

### Behavior & events (7)

- `GLOBAL_BEHAVIOR_AUDIT.md`
- `VERTICAL_BEHAVIOR_MATRIX.md`
- `EVENT_ORDERING_ANALYSIS.md`
- `EVENT_VALIDATION.md`
- `SURFACE_DIVERGENCES.md`
- `OWNERSHIP_TRANSFER_MAPPING.md`
- `EVOLUTION_MODEL_RISK_REVIEW.md`

### Stabilization & fixes (5)

- `STABILIZATION_REPORT.md`
- `PERCEPTUAL_VALIDATION.md`
- `P0-01_SCROLL_LOCK_DIAGNOSIS.md`
- `P0-02_PHASE1_PROVIDER_WRAP.md`
- `BEHAVIOR_FIX_PRIORITY.md`

### Bridge & shadow (2)

- `CUSTOM_CONTENT_BRIDGE_REPORT.md`
- `SHADOW_MODE_REPORT.md` *(compare-only policy — no runtime apply)*

### Contracts (6)

- `contracts/SURFACE_CONTRACT.md`
- `contracts/DRAWER_CONTRACT.md`
- `contracts/COMPOSER_CONTRACT.md`
- `contracts/MORPH_CONTRACT.md`
- `contracts/EVENT_ORDERING_CONTRACT.md`
- `contracts/OWNERSHIP_CONTRACT.md`

### Cross-reference (1)

- `GLOBAL_CONTRACTS.md`

---

## Explicitly excluded from this pack

| Doc | Reason |
|-----|--------|
| `QA_STRATEGY_REVIEW.md` | Superseded by QA Institutionalization pack on baseline |
| All 21 baseline duplicates | Already on `origin/main @ be5d812` — see peel manifest |

---

## Not in this PR

- Runtime code (ecommerce, shadow, db/media)
- Influencer / institutional migration
- Convergence execution
