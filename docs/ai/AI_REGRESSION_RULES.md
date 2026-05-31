# AI Regression Rules

**Status:** Official regression policy  
**Effective:** WS-08.8  
**Enforcement:** `pnpm qa:ai-regression` + CI manual gate before WS-08C

---

## 1. What counts as regression

### Critical (S1) — block merge / block WS-08C

| Code | Condition | Action |
|------|-----------|--------|
| CR-01 | Canonical flow fails in harness | Fix before merge |
| CR-02 | Drawer linkage broken (CTA opens nothing) | Fix immediately |
| CR-03 | Fallback returns wrong vertical cards | Fix immediately |
| CR-04 | Context follow-up ignores active chip | Fix immediately |
| CR-05 | `pnpm qa:events` drops below 8/8 | Fix Tier 1 or harness |
| CR-06 | Health response contains diagnosis/triage copy | NO-GO |
| CR-07 | >3 entities in single visual block | Fix resolver slice |

### Major (S2) — fix in same workstream or patch PR

| Code | Condition |
|------|-----------|
| MR-01 | Specific entity match returns wrong entity |
| MR-02 | Category/specialty filter returns empty → null (was populated) |
| MR-03 | Cart/schedule state branch inverted (restaurant/health) |
| MR-04 | Cross-vertical QA regression (restaurant/health scripts fail) |
| MR-05 | New critical console errors in harness |

### Minor (S3) — document + backlog

| Code | Condition |
|------|-----------|
| mR-01 | Copy prefix changed but pattern still matches |
| mR-02 | Card order changed, same entities |
| mR-03 | Mock template rotation differs |
| mR-04 | CTA label wording change |

---

## 2. Acceptable deltas (not regression)

| Delta | Example | Requires human GO? |
|-------|---------|-------------------|
| Editorial copy polish | "Separei" → "Encontrei" | No — if pattern holds |
| Mock-data entity rename | Product name change | Yes — update fixture |
| New professional in health data | Extra card candidate | No — if ≤3 shown |
| Ranking order shuffle | Different top 3 popular | No |
| Adding new intent (vertical PR) | New canonical flow row | Yes — extend fixture |

---

## 3. Requires human GO

| Situation | Reviewer checks |
|-----------|-----------------|
| Intentional resolver priority reorder | Audit + update canonical flows |
| Ecommerce resolver unfreeze | Era change + constitution amendment |
| New visual block kind | Contract doc + fixture + harness |
| Changing `null` fallback behavior | Fallback spec + perceptual review |
| WS-08C kickoff | Harness green + observation checklist |
| Fixture pattern loosened | Justify in audit report |

---

## 4. Regression vs observation

| Tool | Purpose | When |
|------|---------|------|
| `pnpm qa:ai-regression` | **Deterministic** canonical flows (18 scenarios) | Every AI PR; pre–WS-08C |
| `pnpm qa:ai-observation` | Aggregates events + vertical QA suites | Weekly; post-merge |
| `scripts/qa/ai-observation-checklist.md` | **Human** perceptual review | Before WS-08C; copy changes |

Regression catches **behavior drift**. Observation catches **emergent degradation**.

---

## 5. WS-08C gate (Appointment)

Appointment is the first **semi-stateful** resolver. Unlock requires:

- [ ] `pnpm qa:ai-regression` — 19/19 (18 flows + console)
- [ ] `pnpm qa:ai-observation` — 3/3 suites
- [ ] `pnpm qa:events` — 8/8
- [ ] TS 0/0 + build strict
- [ ] Human GO on [`AI_OBSERVATION_MATRIX.md`](./AI_OBSERVATION_MATRIX.md) watch items (optional but recommended)

---

## 6. Fix protocol

```txt
Harness FAIL
  → classify S1/S2/S3 (this doc)
  → S1: fix in vertical resolver or fixture if data drift
  → re-run qa:ai-regression + affected vertical QA
  → update AI_CANONICAL_FLOWS if intentional
  → audit note if perceptual
```

**Never** fix S1 by loosening patterns without human GO.

---

## 7. Recommendation rubric

| Result | Criteria |
|--------|----------|
| **GO** | All canonical flows pass; no S1/S2 open |
| **GO WITH NOTES** | S3 only; watch items documented |
| **NO-GO** | Any S1; health safety violation; drawer broken |

---

## Related

- [`AI_CANONICAL_FLOWS.md`](./AI_CANONICAL_FLOWS.md)
- [`AI_OBSERVATION_MATRIX.md`](./AI_OBSERVATION_MATRIX.md)
- [`AI_PERCEPTUAL_HEALTH.md`](./AI_PERCEPTUAL_HEALTH.md)
