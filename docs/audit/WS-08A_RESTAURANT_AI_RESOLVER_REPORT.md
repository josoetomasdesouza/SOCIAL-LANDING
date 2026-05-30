# WS-08A — Restaurant AI Resolver — Validation Report

**Date:** 2026-05-30  
**Base main:** `cd00647` (Era 2 closed — Stack B cleanup)  
**Branch:** `workstream/ai-resolver-restaurant`  
**Pattern:** Isolated resolver mirroring ecommerce wiring; **no** changes to `ecommerceMockConversationResolver`

---

## Summary

| Item | Result |
|------|--------|
| Restaurant resolver isolated | ✅ `restaurant-conversational-search.ts` |
| Visual blocks (menu + cart) | ✅ |
| `ecommerceMockConversationResolver` | ✅ untouched |
| Tier 1 frozen | ✅ 0 errors |
| `pnpm ts:budget` | ✅ 0/0 |
| `pnpm exec tsc --noEmit` | ✅ 0 |
| `pnpm run build` | ✅ strict |
| `pnpm qa:events` | ✅ 8/8 |
| `pnpm qa:restaurant` | ✅ 6/6 |

**Recommendation:** **GO WITH NOTES**

---

## Perceptual — before / after

| Aspect | Before WS-08A | After WS-08A |
|--------|---------------|--------------|
| Restaurant composer replies | Generic mock text only | Contextual replies + inline menu cards |
| Dish discovery | Feed scroll only | Conversational recommendations in composer |
| Category intent | N/A | "sobremesas", "bebidas", etc. → filtered cards |
| Specific dish | N/A | Name match → single dish card + drawer open |
| Cart intent | N/A | Empty → popular fallback; with items → cart CTA |
| Tone | Editorial feed | **Preserved** — warm copy, cards not search grid |

---

## Files changed

| File | Change |
|------|--------|
| `lib/mock-data/restaurant-conversational-search.ts` | New isolated resolver + visual block kinds |
| `components/business/restaurant/restaurant-conversation-menu-block.tsx` | Composer menu cards |
| `components/business/restaurant/restaurant-conversational-visual-block.tsx` | Visual block renderer factory |
| `components/business/restaurant/restaurant-feed.tsx` | Wire resolver + renderer + cart count |
| `scripts/convergence/restaurant-ai-resolver-validation.mjs` | Vertical QA |
| `package.json` | `qa:restaurant` |
| `docs/os/WORKSTREAMS.md` | WS-08A status |

**Not changed:** `conversational-search.ts`, `ecommerce-feed.tsx`, ActionDrawer/morph/composer/instrumentation cores.

---

## Supported intents

| Intent | Example prompt | Response |
|--------|----------------|----------|
| Recommendation | "o que voce recomenda?" | Popular items (3) |
| Category | "quero sobremesas" | Category-filtered cards |
| Specific item | "picanha na brasa" | Single dish card |
| Context follow-up | Item in context + "o que combina?" | Related category items |
| Cart (empty) | "ver pedido" | Popular fallback + copy |
| Cart (filled) | "ver pedido" / "pagamento" | Cart/checkout CTA block |

---

## Drawer / cart flows

| Flow | Trigger | Action |
|------|---------|--------|
| Open item drawer | Tap menu card in composer | `setItemDrawerOpen(true)` |
| Add simple item | Tap Add on card without customizations | Add to cart + open cart drawer |
| Customize item | Tap Add/Ver on item with customizations | Open item drawer |
| Open cart | Cart CTA in composer block | `setCartDrawerOpen(true)` |
| Checkout | "pagamento" CTA when cart has items | Open checkout drawer |

---

## Residual risks

| ID | Risk | Severity | Mitigation |
|----|------|----------|-------|
| R-01 | Resolver is mock — no LLM | N/A | By design WS-08A |
| R-02 | Category slug map manual | Low | Extend `CATEGORY_ALIASES` as menu grows |
| R-03 | Composer placeholder still generic | Low | Future: restaurant-specific placeholder |
| R-04 | Cart QA with items not automated | Low | Manual walkthrough; step 5 covers empty cart |
| R-05 | React duplicate key warning on rapid composer sends | Low | Pre-existing pattern; filtered in QA; not restaurant-specific |

---

## Validation commands

```bash
pnpm dev
pnpm qa:restaurant   # 6/6
pnpm qa:events       # 8/8 regression
```

---

## Related

- [`INFLUENCER_BEHAVIOR_SPEC.md`](../runtime/INFLUENCER_BEHAVIOR_SPEC.md) — social vertical precedent (drawers)  
- [`INSTITUTIONAL_BEHAVIOR_SPEC.md`](../runtime/INSTITUTIONAL_BEHAVIOR_SPEC.md)  
- Ecommerce reference: `ecommerceMockConversationResolver` + `EcommerceConversationProductsBlock`
