# Runtime baseline — Tier 1 official reference

**Status:** ✅ **Official** — WS-02.5 complete @ `673395d`  
**Authority:** Complements [`docs/os/FREEZE_ZONES.md`](../os/FREEZE_ZONES.md) with **observed, converged behavior**.

---

## Purpose

Post–PR #52, this directory is the **single source of truth** for Tier 1 runtime behavior. Influencer, institutional, AI resolvers, and DB work must reference these specs — not reinvent behavior per PR.

---

## Document index

| Document | Role |
|----------|------|
| [`TIER1_BASELINE.md`](./TIER1_BASELINE.md) | Snapshot commit, verticals, validation evidence |
| [`KNOWN_GOOD_BEHAVIORS.md`](./KNOWN_GOOD_BEHAVIORS.md) | Happy paths + anti-patterns |
| [`DRAWER_BEHAVIOR_SPEC.md`](./DRAWER_BEHAVIOR_SPEC.md) | Stack A drawer law |
| [`COMPOSER_BEHAVIOR_SPEC.md`](./COMPOSER_BEHAVIOR_SPEC.md) | Modes, clearance, morph |
| [`CHECKOUT_PATTERNS.md`](./CHECKOUT_PATTERNS.md) | Footer registration, cart, vertical matrix |
| [`PERCEPTUAL_INVARIANTS.md`](./PERCEPTUAL_INVARIANTS.md) | Non-negotiable UX truths |
| [`RUNTIME_CONSTITUTION.md`](./RUNTIME_CONSTITUTION.md) | Philosophy, anti-patterns, evolution rules |

---

## Baseline commit

```
673395d  Merge pull request #52 — drawer perceptual hygiene
```

---

## Validation

```bash
pnpm dev
pnpm qa:events    # 8/8 on main — record in TIER1_BASELINE.md
pnpm run build
```

---

## Next workstream

**WS-04 — CI Minimum** — institutionalize `qa:events` in GitHub Actions before AI or Stack B migrations.

---

## Related

- [`docs/os/WORKSTREAMS.md`](../os/WORKSTREAMS.md)  
- [`docs/audit/WS-02_PR52_VALIDATION_REPORT.md`](../audit/WS-02_PR52_VALIDATION_REPORT.md)
