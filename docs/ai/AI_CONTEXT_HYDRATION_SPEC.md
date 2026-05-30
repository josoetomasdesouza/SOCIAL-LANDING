# AI Context Hydration Spec

**Status:** Official runtime specification  
**Effective commit:** `9bc2a6c`  
**Implements:** Long-press → context chip → resolver input pipeline

---

## 1. Definition

**Context hydration** is the process by which user-selected feed entities become structured input (`contextItems`) available to the vertical resolver at message send time.

Hydration is **client-side only**, **gesture-initiated**, and **visible** (chips in composer rail).

---

## 2. Pipeline

```txt
User long-press on ContextSelectable (feed/drawer)
  → toggleConversationContextItem({ id, title, image, subtitle })
  → contextItems state (ConversationSelectionProvider)
  → chip rendered: data-conversation-context-chip={id}
  → user sends message
  → responseResolver({ message, brandName, contextItems })
  → resolver parses id prefixes → hydrated entities
```

---

## 3. Long-press semantics

| Constant | Value | Source |
|----------|-------|--------|
| `LONG_PRESS_MS` | 420ms | `context-selectable.tsx` |
| Morph source memory | 1800ms | `MORPH_SOURCE_MEMORY_MS` |

### Gesture rules

- **Pointer down** starts timer (ignored if target is interactive child: button, link, input)
- **Hold ≥420ms** → `onLongPress()` fires, `longPressTriggeredRef = true`
- **Pointer up** after long-press → click suppressed
- **Short tap** → `onClick()` only (opens drawer / feed action)

### DOM attributes

| Attribute | Location | Purpose |
|-----------|----------|---------|
| `data-post-context-source={id}` | `ContextSelectable` root | Morph + QA targeting |
| `data-conversation-context-chip={id}` | Composer chip | Confirms hydration in UI |

**QA protocol:** `PointerEvent` pointerdown → wait ≥450ms → pointerup (see `demo-event-checklist.mjs`, `health-ai-resolver-validation.mjs`).

---

## 4. Context item schema

```typescript
interface ConversationContextItem {
  id: string      // "{vertical}-{type}-{entityId}"
  title: string
  image: string
  subtitle?: string
}
```

Resolver modules parse `id` prefix — never assume global format.

---

## 5. Hydration by vertical

### Ecommerce

| Source | ID pattern | Resolver function |
|--------|------------|-------------------|
| Product card | `ecommerce-product-{productId}` | `getContextCatalogProducts()` |

**Hydrated use:**
- Context follow-up → related products via category/keyword terms
- Facial search → merges context terms into ranking

### Restaurant

| Source | ID pattern | Resolver function |
|--------|------------|-------------------|
| Menu item | `menu-item-{itemId}` | `getContextMenuItems()` |
| Category chip | `restaurant-category-{slug}` | `getContextCategories()` → alias map |

**Hydrated use:**
- Follow-up → related items in same category
- Category in message OR context → merged category set for ranking

### Health

| Source | ID pattern | Resolver function |
|--------|------------|-------------------|
| Professional | `health-professional-{docId}` | `getContextProfessionals()` |
| Specialty chip | `health-specialty-{1-4}` | `getContextSpecialties()` → slug map |

**Hydrated use:**
- Follow-up → related services for professional
- Schedule with single pro → schedule-prompt block
- Specialty context + message → merged specialty resolution

---

## 6. Cart state hydration (restaurant only)

Cart is **not** a context chip. It is **feed-local state** injected at resolver factory creation:

```typescript
createRestaurantMockConversationResolver({ cartItemCount: cartCount })
```

| cartItemCount | Cart intent behavior |
|---------------|------------------------|
| 0 | Popular menu fallback block |
| ≥1 | `restaurant-cart-prompt` with `itemCount` |

**Re-hydration:** `useMemo` dependency on `cartCount` recreates resolver when cart changes.

---

## 7. Drawer continuity

Context hydration works **inside open drawers** — professional drawer in health exposes long-press on professional card.

| Rule | Behavior |
|------|----------|
| Composer hidden when drawer open | Feed sets `composerMode: "hidden"` — user must close drawer to send |
| Context persists across drawer open/close | Chips remain until user removes |
| Resolver CTAs open **same** drawers as feed tap | No new surfaces from hydration path |

---

## 8. Pending context protocol

On send, `ConversationalAI` tracks `pendingContextIds` for newly added chips — used for morph/event sequencing. Resolver receives full `contextItems` array regardless of pending state.

---

## 9. Hydration invariants

| # | Invariant |
|---|-----------|
| H1 | Context is opt-in via long-press — never auto-added |
| H2 | Toggle semantics — second long-press removes chip |
| H3 | Resolver only trusts `contextItems` ids — not DOM state |
| H4 | Empty prefix parse → entity ignored silently |
| H5 | Cross-vertical ids in same session impossible (vertical switch resets feed) |
| H6 | Follow-up intents require non-empty hydrated entities for special behavior |

---

## 10. Failure modes

| Symptom | Cause | Runtime behavior |
|---------|-------|------------------|
| Follow-up returns null / mock | No context chip | Generic mock reply |
| Follow-up shows unrelated items | Wrong prefix / stale chip | Resolver uses whatever ids present |
| Long-press opens drawer instead | Hold <420ms | onClick fires — expected |
| QA timeout on chip | Wrong DOM selector | Use `data-post-context-source`, not legacy attrs |

---

## Related

- [`AI_RUNTIME_BASELINE.md`](./AI_RUNTIME_BASELINE.md)
- [`AI_FALLBACK_BEHAVIOR.md`](./AI_FALLBACK_BEHAVIOR.md)
- [`AI_RESOLVER_CONTRACT.md`](./AI_RESOLVER_CONTRACT.md)
