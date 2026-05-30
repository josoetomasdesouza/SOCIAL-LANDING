# AI Runtime Baseline

**Status:** Official runtime snapshot  
**Effective commit:** `9bc2a6c` (WS-08.5 merged — PR #69)  
**Scope:** Multi-vertical AI resolver layer as deployed in mock/demo runtime  
**Companion docs:** Governance pack in `docs/ai/AI_RESOLVER_*.md`

---

## 1. Purpose

This document **crystallizes the current runtime state** of the AI resolver layer before further vertical expansion (WS-08C+). It is descriptive, not aspirational — what ships today, not what we plan.

---

## 2. Layer topology

```txt
Feed ({vertical}-feed.tsx)
  └─ BusinessSocialLanding
       ├─ conversationResponseResolver   ← vertical module (or frozen ecommerce constant)
       ├─ renderConversationVisualBlock  ← vertical renderer factory
       └─ ConversationalAI (Tier 1 — frozen)
            ├─ buildResolvedReply()
            │    ├─ resolver(input) → { text, visualBlock? }
            │    └─ null → buildMockReply() — text only
            └─ renderVisualBlock(visualBlock) → ReactNode | null
```

**Tier 1 frozen:** `conversational-ai.tsx`, `business-social-landing.tsx`, `action-drawer.tsx`, `context-selectable.tsx`.

**Tier 2 per vertical:** resolver module + visual block components + feed wiring + QA script.

---

## 3. Vertical baseline matrix

| Dimension | Ecommerce | Restaurant | Health |
|-----------|-----------|------------|--------|
| **Status** | Reference (frozen) | WS-08A ✅ | WS-08B ✅ |
| **Resolver module** | `lib/mock-data/conversational-search.ts` | `restaurant-conversational-search.ts` | `health-conversational-search.ts` |
| **Feed wiring** | `ecommerce-feed.tsx` | `restaurant-feed.tsx` | `health-feed.tsx` |
| **Factory pattern** | Constant export | `createRestaurantMockConversationResolver({ cartItemCount })` | `createHealthMockConversationResolver()` |
| **QA script** | — | `pnpm qa:restaurant` (6/6) | `pnpm qa:health` (7/7) |
| **Visual kinds** | 1 | 2 | 2 |
| **Stateful input** | None | Cart item count | None |
| **Primary entities** | Catalog products | Menu items | Professionals + services |

---

## 4. Registered visual block kinds (runtime)

| Kind | Vertical | Payload key | Max entities |
|------|----------|-------------|--------------|
| `conversational-search-results` | Ecommerce | `products[]` | 3 |
| `restaurant-menu-results` | Restaurant | `items[]` | 3 |
| `restaurant-cart-prompt` | Restaurant | `action`, `itemCount` | 1 CTA |
| `health-care-results` | Health | `items[]` (pro \| service) | 3 |
| `health-schedule-prompt` | Health | `professionalId?`, `professionalName?` | 1 CTA |

---

## 5. Intent resolution order (actual)

### Ecommerce

```txt
1. Context products + contextual follow-up cue → related products (max 3)
2. Facial/skincare product intent → ranked catalog products (max 3)
3. null
```

**Note:** Ecommerce does not handle cart, checkout, or generic product search outside facial/skincare cues.

### Restaurant

```txt
1. Cart / checkout intent
   ├─ cart empty → popular menu items (recommendation block)
   └─ cart filled → cart-prompt block
2. Specific menu item name match → single item block
3. Context menu items + follow-up cue → related category items
4. Category (message and/or context category chip) → ranked items
5. Recommendation cue → popular items
6. null
```

### Health

```txt
1. Schedule intent
   ├─ single context professional → schedule-prompt block
   └─ else → professional results block (Agendar)
2. Context professional + follow-up cue → related services (fallback: pro card)
3. Service / procedure keyword → service + linked pro cards
4. Specialty (message and/or context specialty chip) → professionals
5. Guided recommendation cue → professionals + services (max 3 combined)
6. null
```

---

## 6. Context ID prefixes (runtime)

| Vertical | Prefix | Example |
|----------|--------|---------|
| Ecommerce | `ecommerce-product-` | `ecommerce-product-prod-1` |
| Restaurant | `menu-item-` | `menu-item-item-3` |
| Restaurant | `restaurant-category-` | `restaurant-category-sobremesas` |
| Health | `health-professional-` | `health-professional-doc-3` |
| Health | `health-specialty-` | `health-specialty-2` → Cardiologia |

---

## 7. Global regression gates (must stay green)

| Gate | Current |
|------|---------|
| `pnpm ts:budget` | 0/0 |
| `pnpm exec tsc --noEmit` | 0 errors |
| `pnpm run build` | PASS strict |
| `pnpm qa:events` | 8/8 |
| `pnpm qa:restaurant` | 6/6 |
| `pnpm qa:health` | 7/7 |

Any resolver PR must not regress these gates.

---

## 8. Mock-data boundaries

| Module | Mutable by new verticals? |
|--------|---------------------------|
| `conversational-search.ts` (ecommerce resolver body) | ❌ Frozen |
| `conversational-search.ts` (shared types) | ⚠️ Governance PR only |
| `{vertical}-conversational-search.ts` | ✅ Own vertical only |
| `{vertical}-data.ts` | ✅ Own vertical only |

---

## 9. Current risks

| Risk | Severity | Notes |
|------|----------|-------|
| Ecommerce resolver narrow (facial-only) | Low | By design; other intents fall through to mock reply |
| Keyword collision across intents | Medium | Vertical-specific; mitigated by priority order |
| Feed shows subset, resolver searches full list (health) | Low | Feed `slice(0,3)` vs 5 professionals in data |
| Long-press QA timing-sensitive | Low | Requires PointerEvent ≥450ms; documented in hydration spec |
| No LLM — keyword/heuristic only | Info | All resolvers are deterministic mock logic |
| Specialty UI chips ≠ resolver specialties (health) | Low | Ortopedia/Pediatria chips have no matching professionals yet |

---

## 10. Architecture limits (current era)

1. **No shared resolver runtime** — duplication of intent-matching patterns across verticals is accepted
2. **No cross-vertical context** — switching feed vertical clears conversation context
3. **No persistence of resolver state** — cart count passed at resolve time only (restaurant)
4. **No server-side AI** — client-side mock resolvers only
5. **Single visual block per reply** — no multi-block responses
6. **Composer session local** — history keyed by brand name in session storage

---

## 11. Safe next steps

1. **WS-08C Appointment** — new isolated resolver; reuse health calendar/drawer patterns where applicable
2. **Do not** modify ecommerce resolver or Tier 1 cores
3. **Do not** merge multiple vertical resolvers in one PR
4. **Do** add `pnpm qa:appointment` before merge
5. **Do** update this baseline doc after each vertical lands

---

## Related

- [`AI_VERTICAL_COMPARISON.md`](./AI_VERTICAL_COMPARISON.md)
- [`AI_CONTEXT_HYDRATION_SPEC.md`](./AI_CONTEXT_HYDRATION_SPEC.md)
- [`AI_FALLBACK_BEHAVIOR.md`](./AI_FALLBACK_BEHAVIOR.md)
- [`AI_VISUAL_BLOCK_RUNTIME.md`](./AI_VISUAL_BLOCK_RUNTIME.md)
- [`AI_ALLOWED_EVOLUTION.md`](./AI_ALLOWED_EVOLUTION.md)
