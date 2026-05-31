# AI Observation Matrix

**Status:** Official observational baseline  
**Effective commit:** `d229970` (WS-08.6 merged — PR #70)  
**Purpose:** Capture emergent patterns across ecommerce, restaurant, and health resolvers before WS-08C  
**Method:** Automated QA (Playwright) + human checklist (`scripts/qa/ai-observation-checklist.md`)

---

## 1. Observation scope

| Layer | Observed? | Method |
|-------|-----------|--------|
| Resolver intent matching | ✅ | Vertical QA scripts |
| Visual block rendering | ✅ | QA + manual |
| Context hydration | ✅ | QA long-press steps |
| Fallback to mock reply | ⚠️ Partial | Manual only |
| Cross-vertical regression | ✅ | `pnpm qa:ai-observation` |
| Perceptual tone | ✅ | Human checklist |
| Composer / feed balance | ✅ | Human checklist |

---

## 2. Emergent patterns (stable)

Patterns that **reliably appear** across sessions and match design intent.

| ID | Pattern | Verticals | Signal | Assessment |
|----|---------|-----------|--------|------------|
| EP-01 | **Card-first discovery** | Restaurant, Health | User prompt → text + ≤3 cards | ✅ Intended |
| EP-02 | **Context amplifies relevance** | All | Long-press + follow-up → narrower results | ✅ Intended |
| EP-03 | **Drawer delegation** | Restaurant, Health | Card CTA opens existing drawer | ✅ Intended |
| EP-04 | **Null → host voice** | All | Unknown intent → generic mock reply (no cards) | ✅ Intended |
| EP-05 | **Priority stack wins** | Restaurant, Health | Cart/schedule checked before category | ✅ Intended |
| EP-06 | **Editorial copy prefix** | All | "Separei…", "Encontrei…", "Pensando em…" | ✅ Intended |
| EP-07 | **Snapshot blocks** | All | Old cards in thread don't update when cart changes | ✅ By design |
| EP-08 | **Facial gate** | Ecommerce | Non-skincare queries → mock fallback | ✅ Frozen scope |

---

## 3. CTA repetition patterns

| ID | Pattern | Where | Frequency | Risk |
|----|---------|-------|-----------|------|
| CTA-01 | Dual tap target (body + button) | Restaurant, Health cards | Every card | Low — redundant but clear |
| CTA-02 | Same label "Agendar" on all pro cards | Health results | High in specialty flows | Low — consistent |
| CTA-03 | "Add" vs "Ver" split by customizations | Restaurant | Per item type | Low — semantic |
| CTA-04 | Full-width prompt CTA after text | Cart, schedule prompts | Once per intent | Low |
| CTA-05 | **Repeated "Agendar" in multi-message session** | Health | Medium | **Medium** — feels mechanical if user sends 3+ scheduling prompts |
| CTA-06 | Mock reply rotation (3 templates) | All fallbacks | `length % 3` | Low — slight repetition on similar-length messages |

### Mitigation notes (no runtime change in WS-08.7)

- Monitor CTA-05 in human review before WS-08C
- Future: vary CTA labels by intent (`intent` field already in payloads)

---

## 4. Card saturation patterns

| ID | Pattern | Threshold | Current behavior | Assessment |
|----|---------|-----------|------------------|------------|
| CS-01 | Max cards per reply | 3 | Enforced in resolver `.slice(0,3)` | ✅ Healthy |
| CS-02 | Stacked blocks in thread | Unlimited | Each message adds one block | ⚠️ Watch — long sessions feel chatty |
| CS-03 | Service + pro in one reply | 2 entities | Health service intent | ✅ Acceptable |
| CS-04 | Popular fallback when empty cart | 3 dishes | Restaurant cart intent | ✅ Nudge, not saturation |
| CS-05 | **Same entity across consecutive replies** | — | Re-prompting "dermatologista" | **Low** — new block each time |

### Saturation health

```txt
Green  — ≤3 cards per reply, feed remains primary navigation
Yellow — 5+ AI messages in one session with blocks each turn
Red    — User must scroll composer history to reach feed modules
```

**Current baseline:** Green in automated QA paths; Yellow possible in exploratory manual sessions.

---

## 5. Conversational loop patterns

| ID | Loop type | Trigger | Behavior | Risk |
|----|-----------|---------|----------|------|
| CL-01 | **Mock echo loop** | Repeated unknown intents | Same 3 mock templates cycle | Medium |
| CL-02 | **Intent re-trigger** | Same keyword ("sobremesas", "dermatologista") | New block, similar cards | Low |
| CL-03 | **Context stale loop** | Chip remains, user asks unrelated question | Resolver may still see context | Medium |
| CL-04 | **Schedule → drawer → close → schedule** | Health | Works; composer returns | Low |
| CL-05 | **Cart empty → popular → add → cart prompt** | Restaurant | Healthy conversion path | Low |
| CL-06 | **No exit cue** | User wants to stop AI | Must dismiss composer manually | Low — by design |

---

## 6. Contextual conflict patterns

| ID | Conflict | Verticals | Example | Resolution today |
|----|----------|-----------|---------|------------------|
| CC-01 | Message intent vs context specialty | Health | Chip: Cardio + message: "dermatologista" | Specialty from message wins in merge order |
| CC-02 | Multiple context items | Restaurant | Two menu items selected | First pro/item used for follow-up label |
| CC-03 | Context chip + cart intent | Restaurant | Item in context + "ver pedido" | Cart branch runs first — context ignored |
| CC-04 | Schedule + no context pro | Health | "quero agendar" | Shows 3 professionals — not wrong, less precise |
| CC-05 | **"consulta" keyword** | Health | Service match vs schedule | Schedule checked first if "agendar" absent; "consulta" → serv-1 |
| CC-06 | Facial + non-product context | Ecommerce | Product chip + non-skincare message | Follow-up may still fire on cue match |

---

## 7. Tone differences between verticals

| Dimension | Ecommerce | Restaurant | Health |
|-----------|-----------|------------|--------|
| Warmth | Neutral-helpful | Warm / house style | Careful / consultation-first |
| Confidence | Product suggestion | "favoritos da casa" | "conversar em consulta" |
| Urgency | Low | Medium (cart nudge) | Low (schedule soft) |
| Safety language | None | None | **Anti-diagnosis explicit** |
| Fallback voice | Brand host | Brand host | Brand host (same `buildMockReply`) |
| Risk | Generic commerce | Over-selling food | **Clinical drift if copy changes** |

### Tone invariant

Mock fallback is **shared** across verticals — contextual chips make it feel vertical-aware even when resolver returned null.

---

## 8. Automated observation matrix (QA baseline)

Captured @ merge `d229970`:

| Gate | Result | Steps |
|------|--------|-------|
| `pnpm qa:events` | 8/8 | Global instrumentation |
| `pnpm qa:restaurant` | 6/6 | Category, dish, recommend, drawer, cart |
| `pnpm qa:health` | 7/7 | Specialty, service, recommend, context, schedule |
| `pnpm qa:ai-observation` | — | Aggregates vertical QA (WS-08.7) |

---

## 9. Observation cadence

| When | Action |
|------|--------|
| Before merge of new vertical resolver | Run full matrix + human checklist |
| After Tier 1 touch (rare) | Re-run all gates |
| Monthly (Era 5) | Human checklist on 3 verticals |
| WS-08C kickoff | Compare against this baseline |

---

## Related

- [`AI_FAILURE_MODES.md`](./AI_FAILURE_MODES.md)
- [`AI_PERCEPTUAL_HEALTH.md`](./AI_PERCEPTUAL_HEALTH.md)
- [`../audit/WS-08.7_AI_STABILITY_OBSERVATION_REPORT.md`](../audit/WS-08.7_AI_STABILITY_OBSERVATION_REPORT.md)
- [`../../scripts/qa/ai-observation-checklist.md`](../../scripts/qa/ai-observation-checklist.md)
