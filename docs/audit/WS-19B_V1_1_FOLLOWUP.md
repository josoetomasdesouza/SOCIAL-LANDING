# WS-19B v1.1 — Human calibration and adversarial coverage

**Status:** Implemented (corpus v1.1.0 — 61 scenarios, 45 human, gates green)  
**Prerequisite:** PR #81 + PR #82 merged on `main` ✅  
**Blocks:** LLM bounded (Fase 4) — human review of Top 40 difficulty still required before GO

---

## Context

PR #82 shipped **observability only**:

- `eval-metrics.ts` — Escape Rate vs Wrong Lane Rate (separate)
- `ws19b-conversational-coverage.json` — Top 40 v1
- Runner gate: Escape &lt; 5%, critical wrong lane = 0

```txt
0/40 = gate técnico verde no snapshot atual
0/40 ≠ qualidade conversacional certificada
```

Top 40 v1 was **probe-calibrated** (`ws19b-probe-expectations.ts` → `classifyTurn()`). Wrong Lane = 0 by construction at calibration time.

---

## Goal

Harden the corpus so metrics measure **product intent**, not only classifier self-consistency.

---

## Scope

| Task | Detail |
|------|--------|
| `calibration: "human"` | Lock `expected_lane` / `expected_strategy` by review — not auto-probe |
| Dedup | Remove **B-13 / B-40** duplicate (news Dom Corleone) |
| Replace | **Broad indevido** — editorial chip, expect direct; fail if broad clarify |
| Replace | **Transactional indevido** — video/post chip, expect no delegate |
| Adversarial | Add **5–10** harder multi-turn / conflict scenarios |
| Negative controls | Add **2–3** with `escape_expected: true` (known bad paths) |
| Product alignment | Revisit **B-12 / B-38** — stub answers video but classifier says `defer_legacy`; align expectation to final reply path |

---

## Out of scope (v1.1)

- Kernel behavior / copy changes (unless a metric proves a bug — separate PR)
- LLM integration
- `conversational-ai.tsx`
- New lanes or ownership/priority refactors

---

## Gates (unchanged)

```bash
pnpm ts:budget
pnpm qa:kernel-stub   # Phase 1 + WS-19B report
pnpm qa:appointment
```

Success: corpus documents human review; adversarial set may show non-zero escape **without** failing gate until baseline agreed — or gate tightened after baseline.

---

## Merge order reference

```txt
#79 → anti-null + priority foundation
#80 → strategy executor
#81 → topic ownership
#82 → escape metrics + WS-19B v1
v1.1 → this doc (corpus hardening)
LLM  → after v1.1 sign-off
```
