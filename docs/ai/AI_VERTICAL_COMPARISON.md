# AI Vertical Comparison

**Status:** Official cross-vertical analysis  
**Effective commit:** `9bc2a6c`  
**Verticals:** Ecommerce (reference), Restaurant, Health

---

## 1. Side-by-side overview

| Dimension | Ecommerce | Restaurant | Health |
|-----------|-----------|------------|--------|
| **Merged** | Pre–WS-08 (frozen) | WS-08A @ `4f1f57f` | WS-08B @ `41b4ff7` |
| **Resolver file** | `conversational-search.ts` | `restaurant-conversational-search.ts` | `health-conversational-search.ts` |
| **Lines (resolver)** | ~250 | ~334 | ~364 |
| **Factory** | No | Yes (`cartItemCount`) | Yes (stateless factory) |
| **Kinds** | 1 | 2 | 2 |
| **QA** | — | 6 steps | 7 steps |
| **Context types** | Product | Menu item, category | Professional, specialty |
| **Stateful** | No | Cart count | No |
| **Primary CTA** | View / add product | Add / cart | Agendar |

---

## 2. Shared invariants (all verticals)

| Invariant | Ecommerce | Restaurant | Health |
|-----------|:---------:|:----------:|:------:|
| Max 3 entities per results block | ✅ | ✅ | ✅ |
| Short editorial reply text | ✅ | ✅ | ✅ |
| `null` → mock reply fallback | ✅ | ✅ | ✅ |
| Isolated resolver module | ✅ | ✅ | ✅ |
| Feed-only wiring | ✅ | ✅ | ✅ |
| Long-press context hydration | ✅ | ✅ | ✅ |
| CTA → existing drawer | ✅ | ✅ | ✅ |
| No Tier 1 core edits | ✅ | ✅ | ✅ |
| `normalizeSurfaceFlowText` for matching | ✅ | ✅ | ✅ |
| Prefix-based context parsing | ✅ | ✅ | ✅ |

---

## 3. Acceptable differences

These differences are **by design**, not debt:

| Difference | Rationale |
|------------|-----------|
| Ecommerce facial-only intent gate | Reference catalog scope — skincare vertical |
| Restaurant cart-aware branch | Only vertical with cart runtime state |
| Health schedule-prompt kind | Soft booking without cart equivalent |
| Health mixed entity cards (pro + service) | Care discovery needs both dimensions |
| Restaurant category context chips | Menu taxonomy maps naturally to categories |
| Health specialty slug indirection | UI chips use numeric ids → specialty map |
| Ecommerce uses shared visual renderer | Legacy — predates vertical factory pattern |
| Restaurant `intent` field in payload | Enables future analytics — unused in UI today |
| Health `kind: "professional" \| "service"` on items | Dual card rendering in one block |

---

## 4. Intent coverage comparison

| Intent type | Ecommerce | Restaurant | Health |
|-------------|-----------|------------|--------|
| Specific entity | ❌ (rank only) | ✅ Name match | ✅ Service keyword |
| Category / specialty | ❌ (facial terms) | ✅ Category map | ✅ Specialty map |
| Recommendation | ❌ (implicit in rank) | ✅ Popular items | ✅ Guided cues |
| Context follow-up | ✅ Related products | ✅ Related dishes | ✅ Related services |
| Stateful action | ❌ | ✅ Cart / checkout | ✅ Schedule |
| Empty-state nudge | ❌ → null | ✅ Popular if cart empty | ✅ Pro list if schedule w/o context |

---

## 5. Contextual behavior comparison

### Follow-up prompts (require hydrated context)

| Vertical | Example prompt | Hydrated input | Output |
|----------|----------------|----------------|--------|
| Ecommerce | "o que combina?" | Product chip | Related products |
| Restaurant | "o que combina?" | Menu item chip | Same-category dishes |
| Health | "esse profissional atende o que?" | Professional chip | Related services |

### Context + message merge

| Vertical | Merged signal |
|----------|---------------|
| Ecommerce | Context product terms ∪ message facial terms |
| Restaurant | Context categories ∪ message category |
| Health | Context specialties ∪ message specialty |

---

## 6. Fallback comparison

| Scenario | Ecommerce | Restaurant | Health |
|----------|-----------|------------|--------|
| Unknown intent | null → mock | null → mock | null → mock |
| Empty search results | null | null (except cart-empty) | null (except context pro fallback) |
| Context follow-up, no matches | null → mock | Popular fallback | Professional card fallback |
| Mock with context chip | Contextual template | Contextual template | Contextual template |

---

## 7. Visual block comparison

| Aspect | Ecommerce | Restaurant | Health |
|--------|-----------|------------|--------|
| Results kind | `conversational-search-results` | `restaurant-menu-results` | `health-care-results` |
| Prompt kind | — | `restaurant-cart-prompt` | `health-schedule-prompt` |
| Thumb shape | Square product | Square dish | Circle pro / square service |
| Price shown | ✅ | ✅ | ✅ (optional on pro) |
| Dual action (body + CTA) | ✅ | ✅ | ✅ |
| test id on block | Component-level | `restaurant-conversation-menu-block` | `health-conversation-results-block` |

---

## 8. Perceptual / safety comparison

| Rule | Ecommerce | Restaurant | Health |
|------|-----------|------------|--------|
| Editorial tone | ✅ | ✅ | ✅ |
| No dashboard grid | ✅ | ✅ | ✅ |
| No flow hijack | ✅ | ✅ | ✅ |
| Domain safety | No false product claims | No infinite menu text | **No diagnosis / triage** |
| Consultation deferral | N/A | N/A | ✅ Required in copy |

---

## 9. Maturity assessment

| Vertical | Maturity | Notes |
|----------|----------|-------|
| Ecommerce | Stable / frozen | Narrow intent — intentional reference |
| Restaurant | Production-ready mock | Full intent stack + cart |
| Health | Production-ready mock | Full intent stack + schedule |

---

## 10. Gap analysis (not blocking)

| Gap | Vertical | Safe fix path |
|-----|----------|---------------|
| No dedicated QA | Ecommerce | Optional `qa:ecommerce` in future |
| Narrow product intent | Ecommerce | Requires unfreeze decision |
| Feed/resolver entity count mismatch | Health | Feed display only — resolver OK |
| Specialty chips without professionals | Health | Extend mock-data in vertical PR |
| Ecommerce renderer not in vertical folder | Ecommerce | Cosmetic refactor — low priority |

---

## 11. Next vertical recommendation

**Appointment (WS-08C)** — highest alignment with baseline:

| Criterion | Fit |
|-----------|-----|
| Existing calendar drawer | ✅ (health pattern) |
| Isolated resolver module | ✅ |
| Clear intent set (provider, service, book) | ✅ |
| No Tier 1 changes required | ✅ |
| Governance + runtime docs complete | ✅ (this snapshot) |

**Not recommended next:** Realestate (needs property context model), Influencer (may not need commerce-style resolver).

See [`AI_ALLOWED_EVOLUTION.md`](./AI_ALLOWED_EVOLUTION.md) §7.

---

## Related

- [`AI_RUNTIME_BASELINE.md`](./AI_RUNTIME_BASELINE.md)
- [`AI_CONTEXT_HYDRATION_SPEC.md`](./AI_CONTEXT_HYDRATION_SPEC.md)
- [`AI_FALLBACK_BEHAVIOR.md`](./AI_FALLBACK_BEHAVIOR.md)
- [`AI_VISUAL_BLOCK_RUNTIME.md`](./AI_VISUAL_BLOCK_RUNTIME.md)
