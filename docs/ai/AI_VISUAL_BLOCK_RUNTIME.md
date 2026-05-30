# AI Visual Block Runtime

**Status:** Official runtime specification  
**Effective commit:** `9bc2a6c`  
**Scope:** How visual blocks render, behave, and link to drawers at runtime

---

## 1. Lifecycle

```txt
Resolver builds { kind, payload }
  → stored on ConversationRuntimeMessage.visualBlock
  → ConversationalAI renders AI message bubble
  → renderVisualBlock(visualBlock) called
  → vertical renderer factory switches on kind
  → block component mounts in composer thread
```

One `visualBlock` per AI message. Immutable after send.

---

## 2. Quantity limits (enforced in resolver)

| Limit | Value | Enforcement site |
|-------|-------|------------------|
| Max entities per results block | **3** | `.slice(0, 3)` in build functions |
| Max visual blocks per reply | **1** | Resolver result shape |
| Max prompt CTAs | **1** | Prompt block components |

Ecommerce ranking also caps at 3 via `rankProductEntitiesForConversation(..., 3)`.

---

## 3. Block catalog (runtime)

### Results blocks

| test id | Vertical | Card types |
|---------|----------|------------|
| (via `EcommerceConversationProductsBlock`) | Ecommerce | Product |
| `restaurant-conversation-menu-block` | Restaurant | Menu item |
| `health-conversation-results-block` | Health | Professional \| Service |

### Prompt blocks

| test id | Vertical | Action |
|---------|----------|--------|
| `restaurant-cart-prompt-block` | Restaurant | Open cart / checkout |
| `health-schedule-prompt-block` | Health | Open professional drawer |

---

## 4. Card anatomy (composer surface)

Shared pattern across restaurant and health (ecommerce uses dedicated product block):

```txt
┌ flex gap-3 p-3 rounded-xl border border-white/10 bg-white/5 ─┐
│ [thumb 64×64]  [title + subtitle + price]  [CTA Button sm]      │
└─────────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Stack spacing | `flex flex-col gap-2` |
| Thumb — product/dish/service | `rounded-lg` square |
| Thumb — professional | `rounded-full` |
| Price format | `R$ XX,XX` (accent) |
| CTA size | `size="sm" variant="secondary"` |

---

## 5. CTA behavior matrix

| Block | Tap target | CTA label | Callback |
|-------|------------|-----------|----------|
| Ecommerce product | Card body | (favorites/add in block) | `onOpenProductDrawer` / add cart |
| Restaurant menu | Card body | Add / Ver / Personalizar | `onSelectItem` / `onAddToCart` |
| Restaurant cart prompt | Full-width button | Ver pedido (N) / Ir para pagamento | `onOpenCart` / `onOpenCheckout` |
| Health results (pro) | Card body | Agendar | `onSelectProfessional` |
| Health results (service) | Card body | Ver detalhes | `onSelectService` → linked pro drawer |
| Health schedule prompt | Full-width button | Agendar com {name} | `onScheduleProfessional(id)` |

**Rule:** All callbacks are **feed-injected** — defined in `{vertical}-feed.tsx` `useMemo` factory.

---

## 6. Drawer linkage

Visual blocks **never embed** drawer UI. They invoke feed handlers:

```typescript
// health-feed.tsx pattern
onSelectProfessional: (prof) => {
  setSelectedProfessional(prof)
  setProfessionalDrawerOpen(true)
}
```

| Vertical | Drawer opened from block |
|----------|--------------------------|
| Ecommerce | Product detail drawer |
| Restaurant | Item detail / cart / checkout |
| Health | ProfessionalDrawer (AppointmentCalendar inside) |

Composer sets `composerMode: "hidden"` when drawer opens — block CTAs that open drawers hide composer until dismiss.

---

## 7. Spacing in conversation thread

Visual blocks render **inside AI message bubble**, below text content. No additional margin spec in vertical blocks — parent `ConversationalAI` controls thread spacing.

Blocks use transparent/glass styling (`bg-white/5`) to match composer dark overlay aesthetic.

---

## 8. Contextual persistence

| Aspect | Behavior |
|--------|----------|
| Block content after send | Frozen — reflects entities at resolve time |
| Context chips | Persist until user removes — affect **next** message only |
| Cart count in label | Snapshot at resolve time (`itemCount` in payload) |
| Re-open composer | Previous blocks remain in thread history |

Blocks do **not** re-fetch or live-update when cart/context changes retroactively.

---

## 9. Renderer degradation

| Condition | Runtime result |
|-----------|----------------|
| Unknown `kind` | `return null` — text only |
| Payload fails type guard | `return null` |
| Entity id not in feed data | Card omitted (`return null` in map) |
| All cards omitted | Empty block area — text only |

---

## 10. Ecommerce-specific runtime

Uses shared `createConversationalSearchVisualBlockRenderer` from `conversational-search-results.tsx`:

- Resolves product ids from payload against live `products` array
- Renders `EcommerceConversationProductsBlock` with favorites + context toggle
- Returns `null` if zero products resolve

---

## 11. Anti-patterns (runtime)

| Pattern | Status |
|---------|--------|
| 4+ cards in one block | ❌ Prevented by resolver slice |
| Inline forms in block | ❌ Not implemented |
| Horizontal scroll carousel | ❌ Not implemented |
| Block opens new drawer type | ❌ Forbidden — reuse feed drawers |
| Live cart sync in old blocks | ❌ Snapshot only |

---

## Related

- [`AI_VISUAL_BLOCK_PATTERNS.md`](./AI_VISUAL_BLOCK_PATTERNS.md) — design patterns
- [`AI_VERTICAL_COMPARISON.md`](./AI_VERTICAL_COMPARISON.md)
- [`AI_FALLBACK_BEHAVIOR.md`](./AI_FALLBACK_BEHAVIOR.md)
