# AI Failure Modes

**Status:** Official failure mode catalog  
**Effective commit:** `d229970`  
**Purpose:** Map known failure classes before expanding to WS-08C

Severity: **S1** user-blocking · **S2** wrong result · **S3** perceptual · **S4** cosmetic

---

## 1. Keyword collision

| FM | Description | Example | Vertical | Severity | Mitigation |
|----|-------------|---------|----------|----------|------------|
| FM-K01 | Shared substring triggers wrong intent | "consulta" in health → serv-1 vs schedule | Health | S2 | Priority order; document cues |
| FM-K02 | "pele" in health vs ecommerce facial | Cross-vertical demo switch only | Both | S4 | Vertical isolation |
| FM-K03 | "recomenda" matches recommendation + context follow-up | Restaurant | Restaurant | S3 | Priority: cart > specific > context |
| FM-K04 | Category slug in message accidentally | "pratos" → Pratos Principais | Restaurant | S2 | Acceptable if intended |
| FM-K05 | Botox → aesthetic service, not procedure booking | Health | Health | S3 | Copy: consultation-first |

**Detection:** Vertical QA + prompt matrix in observation report.

---

## 2. False positives

Resolver returns vertical content when user did not intend vertical action.

| FM | Trigger | Output | Severity |
|----|---------|--------|----------|
| FM-FP01 | "menu" in recommendation cues | Popular dishes | S3 |
| FM-FP02 | "ansiedade" in health recommendation | Psychology path | S2 |
| FM-FP03 | Partial dish name match | Wrong menu item | S2 |
| FM-FP04 | Empty cart + "pedido" | Popular items (not cart) | S3 — intentional nudge |
| FM-FP05 | Facial terms in non-product message | Product cards | S2 |

**Fallback rule:** When confidence is low, prefer `null` → mock (health/restaurant partially enforce via empty builder).

---

## 3. Over-trigger

Resolver fires too often or too aggressively.

| FM | Pattern | Signal | Severity |
|----|---------|--------|----------|
| FM-OT01 | Every message gets cards | User explores generic questions | S3 |
| FM-OT02 | Recommendation cue too broad ("me ajuda", "fome") | Restaurant always shows food | S3 |
| FM-OT03 | Guided health cues catch vague "quero" | Health cards on weak prompts | S2 |
| FM-OT04 | Context follow-up cues overlap recommendation | Double classification | S3 |

**Current state:** Restaurant recommendation cues are widest — highest over-trigger risk.

---

## 4. Dead-end replies

User reaches a state with no clear next action.

| FM | Scenario | Outcome | Severity |
|----|----------|---------|----------|
| FM-DE01 | Resolver returns null, mock reply generic | Text only, no cards | S3 |
| FM-DE02 | Ecommerce non-facial query | Mock — no product path | S2 |
| FM-DE03 | Related products empty (ecommerce context) | null → mock | S2 |
| FM-DE04 | Specialty with no professionals in data | Empty builder → null | S2 |
| FM-DE05 | Schedule prompt without professionalId | Button disabled | S1 if reachable |
| FM-DE06 | All cards fail entity resolve | Text only, empty visual | S3 |

**QA coverage:** FM-DE05 partially covered; FM-DE01/02 require manual exploration.

---

## 5. Drawer mismatch

CTA or card opens wrong or no drawer.

| FM | Cause | Severity | Detection |
|----|-------|----------|-----------|
| FM-DM01 | Entity id not in feed data | S1 | QA step 4/6 |
| FM-DM02 | Service without linked professional | S2 | Manual |
| FM-DM03 | Customization item → item drawer (expected) | — | QA restaurant |
| FM-DM04 | Composer hidden, user confused | S3 | Manual |
| FM-DM05 | Click triggers long-press threshold miss | S3 | QA uses PointerEvent |

**Baseline:** Automated QA passes drawer open for restaurant item + health schedule.

---

## 6. Context drift

Context chips and resolver input diverge from user mental model.

| FM | Scenario | Effect | Severity |
|----|----------|--------|----------|
| FM-CD01 | Stale chip from earlier selection | Follow-up applies wrong entity | S2 |
| FM-CD02 | User forgets chip is active | Unexpected contextual reply | S3 |
| FM-CD03 | Toggle off not discovered | Chip persists | S3 |
| FM-CD04 | Long-press vs tap confusion | Drawer opens instead of context | S3 |
| FM-CD05 | Multiple chips, resolver uses first only | Ignored selections | S2 |
| FM-CD06 | Vertical switch clears context silently | Expected — but surprising | S4 |

**Mitigation:** Visible chips + human checklist item "user aware of active context".

---

## 7. Repetitive responses

| FM | Mechanism | Example | Severity |
|----|-----------|---------|----------|
| FM-RR01 | Mock reply `length % 3` rotation | Similar messages → same template | S3 |
| FM-RR02 | Same resolver branch | Repeat "dermatologista" | S3 |
| FM-RR03 | Identical popular fallback | Empty cart spam | S3 |
| FM-RR04 | Copy templates shared across intents | "Separei…" repeated | S4 |

---

## 8. Failure mode × vertical matrix

| Mode | Ecommerce | Restaurant | Health |
|------|:---------:|:----------:|:------:|
| Keyword collision | Low | Medium | Medium |
| False positives | Medium | Medium | Medium |
| Over-trigger | Low | **High** | Medium |
| Dead-end | **High** (narrow intent) | Low | Low |
| Drawer mismatch | Low | Low | Low |
| Context drift | Medium | Medium | Medium |
| Repetitive responses | Medium | Medium | Medium |

---

## 9. Response playbook

| Severity | Action |
|----------|--------|
| S1 | Block merge; fix in vertical resolver PR |
| S2 | Document in audit; fix before next vertical or patch vertical |
| S3 | Track in observation matrix; human review cadence |
| S4 | Backlog / copy polish |

---

## 10. Pre–WS-08C gate

WS-08C must not introduce new failure modes without:

1. Entry in this catalog
2. QA step or checklist item
3. Update to [`AI_OBSERVATION_MATRIX.md`](./AI_OBSERVATION_MATRIX.md)

---

## Related

- [`AI_OBSERVATION_MATRIX.md`](./AI_OBSERVATION_MATRIX.md)
- [`AI_PERCEPTUAL_HEALTH.md`](./AI_PERCEPTUAL_HEALTH.md)
- [`AI_FALLBACK_BEHAVIOR.md`](./AI_FALLBACK_BEHAVIOR.md)
