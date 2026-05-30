# AI Resolver Contract

**Status:** Official technical contract  
**Types source of truth:** `lib/mock-data/conversational-search.ts`  
**Reference wiring:** `ecommerce-feed.tsx`, `restaurant-feed.tsx`, `health-feed.tsx`

---

## 1. Type surface (shared — import only)

Vertical resolvers **import types** from `conversational-search.ts`. They do **not** modify shared types without a dedicated governance PR.

```typescript
interface ConversationVisualBlock {
  kind: string
  payload: unknown
}

interface ConversationResponseResolverResult {
  text: string
  visualBlock?: ConversationVisualBlock
}

interface ConversationResponseResolverInput {
  message: string
  brandName: string
  contextItems: ConversationContextPayload[]
}

type ConversationResponseResolver = (
  input: ConversationResponseResolverInput
) => ConversationResponseResolverResult | null

type ConversationVisualBlockRenderer = (
  visualBlock: ConversationVisualBlock
) => ReactNode
```

---

## 2. Resolver module layout

Each vertical ships an isolated module:

```txt
lib/mock-data/{vertical}-conversational-search.ts   # resolver + kind constants + payload types
components/business/{vertical}/{vertical}-conversational-visual-block.tsx
components/business/{vertical}/{vertical}-conversation-*-block.tsx   # card UI
components/business/{vertical}/{vertical}-feed.tsx                     # wire only
scripts/convergence/{vertical}-ai-resolver-validation.mjs
```

### Factory pattern (recommended)

State-aware verticals use a factory:

```typescript
export function createRestaurantMockConversationResolver(
  options: { cartItemCount?: number } = {}
): ConversationResponseResolver
```

Stateless verticals may export a constant resolver:

```typescript
export const healthMockConversationResolver = createHealthMockConversationResolver()
```

---

## 3. Registered visual block kinds

| Vertical | Kind constant | Purpose |
|----------|---------------|---------|
| Ecommerce | `conversational-search-results` | Product discovery cards |
| Restaurant | `restaurant-menu-results` | Menu item cards |
| Restaurant | `restaurant-cart-prompt` | Cart / checkout CTA |
| Health | `health-care-results` | Professional / service cards |
| Health | `health-schedule-prompt` | Soft scheduling CTA |

**Kind naming:** `{vertical}-{entity}-{purpose}` — lowercase, hyphenated, namespaced by vertical.

New kinds require:
1. Exported constant in vertical resolver module
2. Payload interface with `satisfies` at build site
3. Branch in vertical visual block renderer
4. QA assertion via `data-testid`

---

## 4. Resolver resolution order

Each vertical defines its own intent priority. Recommended pattern (restaurant / health):

```txt
1. Stateful intents (cart, schedule with context)
2. Context follow-up (requires contextItems)
3. Specific entity match (dish, service, product)
4. Category / specialty match
5. Guided recommendation
6. null → generic fallback
```

### Fallback chain

```txt
responseResolver(input)
  ├─ returns ConversationResponseResolverResult → use text + optional visualBlock
  └─ returns null → buildMockReply(brandName, message, contextItems)
```

**Contract:** Vertical resolver returns `null` for anything it does not confidently own. Never return empty text to "silence" the composer.

---

## 5. Context hydration

### Context item shape

Feed modules register context via `ConversationContextItem`:

```typescript
{
  id: "{vertical}-{entity-type}-{entity-id}",  // e.g. health-professional-doc-3
  title: string,
  image: string,
  subtitle?: string,
}
```

### DOM protocol

Long-press targets use `data-post-context-source={id}` on `ContextSelectable`.

Composer chips use `data-conversation-context-chip={id}`.

### Prefix conventions

| Vertical | Prefix examples |
|----------|-----------------|
| Ecommerce | `ecommerce-product-{id}` |
| Restaurant | `menu-item-{id}`, `restaurant-category-{slug}` |
| Health | `health-professional-{id}`, `health-specialty-{slug}` |

Resolver parses prefixes — never assume global ID format.

### Long-press semantics

- **Duration:** 420ms (`LONG_PRESS_MS` in `context-selectable.tsx`)
- **Effect:** Toggle context chip; remember morph source element
- **QA:** Use `PointerEvent` pointerdown/up with ≥450ms hold (see `demo-event-checklist.mjs`)

---

## 6. Cart awareness (restaurant pattern)

When resolver behavior depends on runtime state:

```typescript
const conversationResponseResolver = useMemo(
  () => createRestaurantMockConversationResolver({ cartItemCount: cartCount }),
  [cartCount]
)
```

**Rules:**
- Pass only serializable, feed-local state
- Do not read global stores from inside resolver module
- Document state inputs in vertical audit report

---

## 7. Feed wiring contract

Each feed passes exactly two hooks to `BusinessSocialLanding`:

```typescript
<BusinessSocialLanding
  conversationResponseResolver={conversationResponseResolver}
  renderConversationVisualBlock={renderConversationVisualBlock}
  // ...
/>
```

### Visual block renderer factory

```typescript
const renderConversationVisualBlock = useMemo(
  () =>
    createVerticalConversationalVisualBlockRenderer({
      // entity collections + feed callbacks only
      onSelectItem: (item) => { /* open existing drawer */ },
    }),
  [/* stable deps */]
)
```

**Prohibited in renderer factory:**
- New drawer types
- Changes to ActionDrawer core
- Composer mode manipulation

---

## 8. Text normalization

All vertical resolvers use:

```typescript
import { normalizeSurfaceFlowText } from "@/lib/surface-flow/product-entity"
```

Keyword maps operate on normalized text (lowercase, diacritics stripped). User-facing copy remains properly accented in Portuguese.

---

## 9. QA contract

Each vertical adds:

```json
"qa:{vertical}": "node scripts/convergence/{vertical}-ai-resolver-validation.mjs"
```

Minimum QA coverage:

| # | Scenario |
|---|----------|
| 1 | Primary discovery intent |
| 2 | Specific entity intent |
| 3 | Recommendation / guided intent |
| 4 | Context follow-up (long-press + prompt) |
| 5 | Stateful CTA (cart / schedule) |
| 6 | CTA opens existing drawer — no new surfaces |
| 7 | No critical console errors |

Global regression: `pnpm qa:events` must remain 8/8.

---

## 10. Frozen boundaries

| Path | Rule |
|------|------|
| `lib/mock-data/conversational-search.ts` | Ecommerce resolver frozen; types only for new verticals |
| `components/business/conversational-ai.tsx` | No vertical-specific branches |
| `components/business/business-social-landing.tsx` | Pass-through props only |
| `components/business/action-drawer.tsx` | No resolver awareness |

---

## Related

- [`AI_RESOLVER_CONSTITUTION.md`](./AI_RESOLVER_CONSTITUTION.md)
- [`AI_VISUAL_BLOCK_PATTERNS.md`](./AI_VISUAL_BLOCK_PATTERNS.md)
- [`AI_CONVERSATIONAL_INVARIANTS.md`](./AI_CONVERSATIONAL_INVARIANTS.md)
