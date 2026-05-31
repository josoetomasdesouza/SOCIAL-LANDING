# AI Perceptual Health

**Status:** Official perceptual monitoring guide  
**Effective commit:** `d229970`  
**Purpose:** Define degradation signals before they become user-visible product failures

---

## 1. Perceptual health model

```txt
Healthy ──► Watch ──► Degraded ──► Critical
  │            │           │            │
  │            │           │            └─ Stop vertical expansion
  │            │           └─ Fix in vertical PR
  │            └─ Human checklist review
  └─ Automated QA green + tone aligned
```

**Current baseline:** **Healthy** for restaurant and health; ecommerce narrow but stable.

---

## 2. Editorial degradation signals

Signs the AI layer is losing warm, orientative tone.

| ID | Signal | Example | Vertical | Status |
|----|--------|---------|----------|--------|
| ED-01 | Copy sounds like search results | "10 resultados encontrados" | — | ✅ Not present |
| ED-02 | Clinical / legal disclaimers stacked | Multiple warnings per reply | Health | ✅ Single line max |
| ED-03 | Robotic list enumeration | "1. Consulta 2. Check-up…" | — | ✅ Not present |
| ED-04 | Brand voice lost in fallback | Mock feels generic | All | ⚠️ Acceptable |
| ED-05 | **Over-explaining in text** | >3 sentences before cards | — | ✅ Not present |
| ED-06 | Pressure language | "Compre agora", "Urgente" | — | ✅ Not present |
| ED-07 | Outcome promises | "Vai melhorar sua pele" | Health | ✅ Avoided |

**Review trigger:** Any new copy introducing ED-05+ or ED-07 → block merge.

---

## 3. Chatbotification signals

Signs the composer is becoming a traditional FAQ/support bot.

| ID | Signal | Indicator | Threshold |
|----|--------|-----------|-----------|
| CB-01 | "Como posso ajudar?" loops | Mock-only | Any = watch |
| CB-02 | Multi-turn required for action | No single-card CTA | None today ✅ |
| CB-03 | Intent interrogation | "Você quer X ou Y?" | None today ✅ |
| CB-04 | **Text-only streak** | 3+ mock replies, no cards | Manual session |
| CB-05 | Symptom gathering | "Qual sua dor?" | Forbidden — health |
| CB-06 | Yes/no branching trees | Sequential gates | None today ✅ |
| CB-07 | Composer replaces WhatsApp | AI for contact info | Not observed ✅ |

**Critical:** CB-05 in health = immediate NO-GO.

---

## 4. Dashboardification signals

Signs the composer is becoming a data panel.

| ID | Signal | Indicator | Threshold |
|----|--------|-----------|-----------|
| DB-01 | >3 cards per reply | Resolver slice | Hard cap ✅ |
| DB-02 | Grid layout in composer | 2×2+ tiles | Not present ✅ |
| DB-03 | Filters / sort in composer | UI controls | Not present ✅ |
| DB-04 | Pagination / "ver mais" | Load more in thread | Not present ✅ |
| DB-05 | **Table or comparison matrix** | Side-by-side specs | Not present ✅ |
| DB-06 | Stats blocks | "2340 consultas" in cards | Partial — subtitle only |
| DB-07 | Full menu/catalog dump | Text listing all items | Prevented ✅ |

**Watch:** DB-06 — keep stats in feed, not composer cards.

---

## 5. AI excess signals

Signs the AI layer is over-present relative to the feed.

| ID | Signal | Indicator | Action |
|----|--------|-----------|--------|
| EX-01 | User cannot discover without composer | Feed modules unused | Keep feed primary |
| EX-02 | Composer auto-opens | Without gesture | Not implemented ✅ |
| EX-03 | Blocks on every message | Including greetings | Over-trigger review |
| EX-04 | Composer covers >50% viewport persistently | Sheet height | Tier 1 controls |
| EX-05 | **Drawer + composer + context compete** | Three layers active | Hide composer in drawer ✅ |
| EX-06 | AI narrates feed content | Reads back visible cards | Not present ✅ |
| EX-07 | Repeated nudges same session | Cart/schedule spam | Watch CTA-05 |

---

## 6. Vertical perceptual scores (baseline)

Subjective assessment @ `d229970`:

| Vertical | Editorial | Non-chatbot | Non-dashboard | Non-excessive | Overall |
|----------|:---------:|:-----------:|:-------------:|:-------------:|:-------:|
| Ecommerce | B+ | A | A | A | **B+** (narrow) |
| Restaurant | A- | A- | A | A- | **A-** |
| Health | A | A | A | A | **A** |

Grades reflect mock/demo scope — not production LLM.

---

## 7. Human review protocol

Run [`scripts/qa/ai-observation-checklist.md`](../../scripts/qa/ai-observation-checklist.md) per vertical:

1. 5-minute exploratory session in `/demo`
2. Mark any ED/CB/DB/EX signal observed
3. Log in audit report if ≥2 Watch signals

**Cadence:** Before WS-08C merge; after any resolver copy change.

---

## 8. Recovery actions

| Degradation type | First response |
|------------------|----------------|
| Editorial | Shorten copy; remove promises |
| Chatbotification | Return `null` earlier; reduce cue lists |
| Dashboardification | Enforce slice(0,3); remove grid experiments |
| AI excess | Reduce recommendation cue breadth |

All fixes stay in **vertical resolver modules** — not Tier 1.

---

## Related

- [`AI_OBSERVATION_MATRIX.md`](./AI_OBSERVATION_MATRIX.md)
- [`AI_FAILURE_MODES.md`](./AI_FAILURE_MODES.md)
- [`AI_RESOLVER_CONSTITUTION.md`](./AI_RESOLVER_CONSTITUTION.md)
