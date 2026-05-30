# AI Visual Block Patterns

**Status:** Official UI patterns for composer visual blocks  
**Applies to:** All vertical resolvers (ecommerce, restaurant, health, future)

---

## 1. Purpose

Visual blocks are **inline composer cards** — not feed duplicates, not modals. They bridge conversation and existing feed actions (drawer open, cart, schedule).

---

## 2. Anatomy

```txt
┌─ AI text reply (1–2 sentences) ─────────────────────┐
│  Editorial copy — orientative, not diagnostic          │
├───────────────────────────────────────────────────────┤
│  ┌─ Visual block ─────────────────────────────────┐   │
│  │  [thumb] Title                     [CTA btn]   │   │
│  │          Subtitle / meta                       │   │
│  │          Price (optional)                      │   │
│  └────────────────────────────────────────────────┘   │
│  (max 3 cards stacked vertically)                     │
└───────────────────────────────────────────────────────┘
```

---

## 3. Layout rules

| Rule | Value |
|------|-------|
| Max items per block | **3** |
| Card layout | Horizontal: thumb + text + CTA |
| Thumb shape | Square (products, dishes, services) or circle (professionals) |
| Stack gap | `gap-2` between cards |
| Card surface | `rounded-xl border border-white/10 bg-white/5` (composer dark surface) |
| Price | Accent color, `R$ XX,XX` format |

---

## 4. Block types by vertical

### Results block (generic pattern)

Used by: ecommerce products, restaurant menu, health care results.

| Element | Behavior |
|---------|----------|
| Card body tap | Open entity detail drawer |
| CTA button | Primary action: Add, Agendar, Ver, Personalizar |
| Missing entity | Skip render (`return null`) — never show broken card |

**Test ID:** `{vertical}-conversation-{entity}-block`  
Examples: `restaurant-conversation-menu-block`, `health-conversation-results-block`

### Prompt block (single CTA)

Used by: restaurant cart, health schedule.

| Element | Behavior |
|---------|----------|
| Full-width button | One clear action |
| Label | Includes state when relevant ("Ver pedido (3)", "Agendar com Dra. Ana") |

**Test ID:** `{vertical}-{purpose}-prompt-block`  
Examples: `restaurant-cart-prompt-block`, `health-schedule-prompt-block`

---

## 5. CTA vocabulary

| Vertical | Primary CTAs | Opens |
|----------|--------------|-------|
| Ecommerce | (card tap) | Product drawer |
| Restaurant | Add, Ver, Personalizar | Item drawer / cart |
| Restaurant | Ver pedido, Ir para pagamento | Cart / checkout drawer |
| Health | Agendar, Ver detalhes | Professional drawer |
| Health | Agendar com {name} | Professional drawer |

**Rule:** CTA always delegates to **existing** feed drawer — never inline forms in composer.

---

## 6. Renderer factory pattern

```typescript
export function createVerticalConversationalVisualBlockRenderer(
  options: VerticalConversationalVisualBlockOptions
): ConversationVisualBlockRenderer {
  return (visualBlock) => {
    if (visualBlock.kind === VERTICAL_RESULTS_KIND) {
      // type-narrow payload
      return <VerticalConversationResultsBlock {...} />
    }
    if (visualBlock.kind === VERTICAL_PROMPT_KIND) {
      return <PromptButton {...} />
    }
    return null  // unknown kind — graceful degrade
  }
}
```

### Payload type guards

Always guard `unknown` payload before render:

```typescript
function isVerticalResultsPayload(payload: unknown): payload is VerticalResultsPayload {
  if (!payload || typeof payload !== "object") return false
  return Array.isArray((payload as VerticalResultsPayload).items)
}
```

---

## 7. Visual continuity with feed

| Principle | Implementation |
|-----------|----------------|
| Same images | Use entity image from mock-data / feed source |
| Same prices | Format with feed's currency helper |
| Same entity IDs | Card `key` and resolver result `id` match feed entity |
| Morph compatibility | Context sources use `data-post-context-source` matching card entities |

Composer cards should feel like **selected feed rows**, not a different design system.

---

## 8. Anti-patterns (visual)

| Anti-pattern | Why forbidden |
|--------------|---------------|
| Grid of 6+ items | Becomes dashboard; violates max-3 rule |
| Text-only menu list | Restaurant menu as bullet list |
| Inline calendar / date picker | Hijacks flow; use drawer |
| Diagnostic checklist UI | Clinical triage appearance (health) |
| Carousel / horizontal scroll in composer | Breaks spatial continuity |
| External links as primary CTA | Breaks drawer-native flow |

---

## 9. Accessibility

- Card body: `<button type="button">` for tap target
- CTA: separate `Button` with descriptive label
- Images: meaningful `alt` from entity title
- Do not rely on color alone for primary action

---

## Related

- [`AI_RESOLVER_CONTRACT.md`](./AI_RESOLVER_CONTRACT.md) — kind registry
- [`AI_CONVERSATIONAL_INVARIANTS.md`](./AI_CONVERSATIONAL_INVARIANTS.md) — spatial rules
