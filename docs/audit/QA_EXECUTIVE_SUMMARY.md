# QA Executive Summary — Social Landing

**Date:** 2026-05-24  
**Mode:** QA INSTITUTIONALIZATION — executive review  
**Audience:** Decision-makers before next converge or CI investment

---

## One-line verdict

**QA protects the runtime when run — but today it lives outside the repo, so protection is fragile.**  
Institutionalize the **three proven Playwright scripts** + **minimum CI (lint + parse + nightly events)** — nothing more yet.

---

## Fase 5 — Executive answers

### 1. Does current QA protect the runtime?

**Conditionally yes.**

| When QA runs | Protection level |
|--------------|------------------|
| Personal Phase 3 converge | **High** — 9/9 + 8/8 caught contract + global regression |
| Day-to-day dev without scripts | **Low** — no automated guard on main |
| After merge without stabilization | **Medium** — human process only |

**Gap:** Protection is **proven but not persistent**. Scripts in worktrees do not protect `main` tomorrow.

---

### 2. Is current QA sustainable?

**No — not in current form.**

| Factor | Assessment |
|--------|------------|
| Script location | Ephemeral (2 of 3 off main) |
| Documentation | Good process docs; bad operational entry point |
| Duplication | 3 worktrees × same scripts |
| Human dependency | High for visual + stabilization |
| CI | None |

**After institutionalization (this plan):** **Yes** — if promotion + minimal CI executed without scope creep.

---

### 3. Is there false sense of security?

**Yes — two forms.**

1. **“We have QA”** because checklist ran once during Personal Phase 3 — scripts not on main  
2. **“Main is stable”** because runtime passed — without nightly re-verification  

**Antidote:** Promote scripts + paste outputs in PR template + optional nightly Playwright.

---

### 4. Is the system becoming bureaucratic?

**Trending toward it — but still controllable.**

| Bureaucracy signal | Current state | Recommendation |
|--------------------|---------------|----------------|
| Doc volume | High (audit + convergence) | Consolidate indexes; 4-doc QA pack then stop |
| Phase count | 10-phase pattern | Keep; use 1-page protocol for daily use |
| Multiple worktrees | 3 | Reduce to 1 clean + ephemeral converge |
| Checklists | Reasonable | Cap at **3 automated gates** per converge |

**Rule:** If a gate does not catch a **real** Personal Phase 3 class bug, remove it.

---

### 5. Is operational cost healthy?

| Phase | Cost | Verdict |
|-------|------|---------|
| Personal converge QA | ~15 min manual (3 scripts) | **Healthy** |
| Dirty tree + worktrees | High cognitive load | **Unhealthy** — triage first |
| Future 10 verticals × 15 min | ~2.5h QA alone | **Acceptable** if templated |
| Full CI Playwright every PR | 5+ min × flake risk | **Unhealthy** — use nightly |

**Biggest cost is not QA runtime — it is operational fragmentation** (wrong tree, stale HEAD, rediscovering scripts).

---

### 6. Does QA help velocity or hurt?

**Helps — when bounded.**

| QA type | Velocity impact |
|---------|-----------------|
| 9/9 vertical validation | **Helps** — confidence to merge without firefighting |
| 8/8 global | **Helps** — prevented silent /demo breakage |
| Visual COMMIT_WITH_NOTES | **Helps** — avoided pixel-parity trap |
| Hypothetical 50-check CI | **Hurts** — would be ignored |
| Missing QA on main | **Hurts** — fear of regressions slows converge |

**Net:** Institutionalize **minimum** QA to **increase** safe converge velocity.

---

### 7. What most needs to become real infrastructure?

| Priority | Item |
|----------|------|
| **P0** | Promote 3 Playwright scripts to `scripts/{runtime,convergence,visual}/` |
| **P0** | `scripts/README.md` — single entry point |
| **P1** | npm scripts (`qa:events`, `qa:convergence:personal`) |
| **P1** | PR template: paste validation output |
| **P2** | GitHub Actions: lint + script-parse |
| **P2** | Nightly demo-event-checklist |
| **P3** | Shared `scripts/lib/passive-events.mjs` |
| **Deferred** | db smokes until db-media on main |
| **Deferred** | tsc CI gate until ignoreBuildErrors resolved |

---

### 8. What should NOT become infrastructure?

| Item | Why not |
|------|---------|
| RU-R as automated script | Observation requires human context |
| 12 vertical Playwright suite in CI | Unmaintainable |
| Shadow divergence in merge gate | Dev-only; policy NO-GO apply |
| Pixel diff screenshot baselines | Cost >> benefit for demo platform |
| 48h timer automation | Process judgment |
| Every audit markdown as required reading | Fatigue |
| Visual smoke blocking every docs PR | Noise |

---

### 9. Is the project ready for stronger CI?

**Partially.**

| Ready | Not ready |
|-------|-----------|
| lint | tsc as gate (`ignoreBuildErrors`) |
| script-parse after promotion | db secrets in CI |
| nightly Playwright (low blast radius) | per-PR Playwright for all changes |
| path-filtered workflows | 12-vertical matrix |

**Recommendation:** **Phase CI in 3 steps** (see `CI_MINIMUM_STRATEGY.md`) — do not jump to “strong CI.”

---

### 10. What is the biggest operational risk now?

**Not missing QA infrastructure yet — it is stale dirty tree + ephemeral QA combined.**

```
HEAD desatualizado + dirty tree misturado
        +
scripts QA só em worktrees
        =
merge acidental + validação não repetível + drift silencioso
```

QA institutionalization **reduces** the second term. Dirty tree peel **reduces** the first. **Both required.**

---

## Strategic assessment

| Question | Answer |
|----------|--------|
| Runtime healthier than repo? | **Yes** |
| QA proven? | **Yes** (Personal Phase 3) |
| QA institutionalized? | **No** (this pack defines how) |
| False security risk? | **Yes** until scripts on main |
| Bureaucracy risk? | **Medium** — guard with 3-gate cap |
| Ready for influencer QA? | **No** — promote scripts + merge #37 + peel dirty tree first |

---

## Recommended action sequence

| Step | Action | Owner |
|------|--------|-------|
| 1 | Merge PR #37 | Human |
| 2 | PR docs: Runtime Reality Audit + Dirty Tree Triage + **QA pack (4 docs)** | Agent/human |
| 3 | Chore PR **QA-1**: promote scripts + README + npm scripts | Agent |
| 4 | Chore PR **QA-4**: `.github/workflows/qa-minimum.yml` | Agent |
| 5 | Enable nightly Playwright after 1 week local stability | Human |
| 6 | Influencer spec — **only after** steps 1–4 | Human GO |

---

## Success metrics (30 days)

| Metric | Target |
|--------|--------|
| QA scripts on main | 3/3 proven |
| Converge PRs with pasted 8/8 + N/N | 100% |
| QA scripts only in worktrees | 0 |
| CI PR time (minimum) | < 3 min |
| Nightly demo-events flake rate | < 5% |
| New vertical QA prep time | < 2h (template copy) |

---

## Transformation statement

```
FROM:  "scripts úteis espalhados"
TO:    "infraestrutura operacional mínima e sustentável"
```

**Minimum infrastructure =**

- 3 official Playwright scripts in conventional paths  
- 1 README  
- 2 npm commands developers actually run  
- 1 lightweight CI workflow  
- 1 convergence protocol (this doc)  

**Not** a QA team, not 12 vertical CI matrix, not ritual without signal.

---

## Document map (QA institutionalization pack)

| Document | Role |
|----------|------|
| `QA_INFRASTRUCTURE_PLAN.md` | Inventory + promotion structure |
| `CI_MINIMUM_STRATEGY.md` | Tiers, workflows, merge gates |
| `CONVERGENCE_TEST_PROTOCOL.md` | Per-migrate checklist |
| `QA_EXECUTIVE_SUMMARY.md` | This file — decisions |

**Prior pack:** `QA_STRATEGY_REVIEW.md` (triage phase) — superseded for implementation by this pack.

---

## Final recommendation

**Approve QA institutionalization as docs now; execute as two small chore PRs next.**

Do **not** bundle script promotion with influencer migrate, db/media, or dirty tree peel — **parallel docs PR, sequential chore PRs.**

The platform is mature enough to treat validation as infrastructure. It is **not** mature enough to absorb heavy CI or operational weight — **minimum viable protection** is the correct strategy.
