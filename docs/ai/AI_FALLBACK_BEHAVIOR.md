# AI Fallback Behavior

**Status:** Official runtime specification  
**Effective commit:** `9bc2a6c`  
**Decision tree:** When resolver returns text, cards, null, or mock reply

---

## 1. Resolution entry point

```typescript
// conversational-ai.tsx — buildResolvedReply()
const resolvedReply = responseResolver?.({ message, brandName, contextItems })

if (resolvedReply) {
  return { content: resolvedReply.text, visualBlock: resolvedReply.visualBlock }
}

return { content: buildMockReply(brandName, message, contextItems) }
// no visualBlock
```

**Single decision point.** Vertical resolvers never call `buildMockReply` directly.

---

## 2. Outcome matrix

| Resolver returns | AI text | Visual block | Source |
|------------------|---------|--------------|--------|
| `{ text, visualBlock }` | Vertical copy | Rendered cards/CTA | Vertical resolver |
| `{ text }` only | Vertical copy | None | Vertical resolver (rare) |
| `null` | Mock copy | None | `buildMockReply()` |
| Builder returns `null` (empty entities) | — | — | Escalates to `null` → mock |

---

## 3. When to return text + cards

Return `ConversationResponseResolverResult` with `visualBlock` when:

1. Resolver **confidently owns** the intent
2. At least **one displayable entity** exists (or prompt block is intentional)
3. Copy can be **short and editorial** (≤2 sentences)

### Per-vertical triggers

| Vertical | Cards | Prompt-only |
|----------|-------|---------------|
| Ecommerce | Product match / related products | Never |
| Restaurant | Menu results | Cart prompt (filled cart) |
| Health | Care results | Schedule prompt (single context pro) |

---

## 4. When to return text only

**Current runtime:** No vertical returns text-only today. All successful resolves include `visualBlock`.

**Allowed pattern:** `{ text: "..." }` without `visualBlock` for future verticals when copy alone suffices (e.g. hours/location). Not used in baseline.

---

## 5. When to return null

Return `null` when:

1. Message does not match any vertical intent cue
2. Entity search yields zero results **and** no prompt block applies
3. Vertical intentionally defers to generic host voice

### Ecommerce null cases

- No facial/skincare product intent AND no context follow-up match
- Example: "qual o horario?" → null → mock

### Restaurant null cases

- No cart, item, category, context, or recommendation match
- Example: "voces delivery?" → null → mock

### Health null cases

- No schedule, context, service, specialty, or recommendation match
- Example: "aceita convenio?" → null → mock

---

## 6. Builder-level null (internal)

Vertical builders may return `null` before reaching resolver return:

```typescript
// restaurant / health
if (items.length === 0) return null

// ecommerce
if (searchResults.length === 0) return null
```

**Effect:** Resolver function falls through to next intent or final `return null`.

### Special case — restaurant empty cart + cart intent

Does **not** null — returns popular items block (intentional nudge).

### Special case — health context follow-up with no services

Does **not** null — returns professional card fallback.

### Special case — ecommerce context follow-up with no related products

`buildSearchResultsResponse([], ...)` → `null` → resolver returns null unless another branch matches → **mock reply**.

---

## 7. Mock reply behavior

```typescript
function buildMockReply(brandName, userMessage, contextItems)
```

| Condition | Reply style |
|-----------|-------------|
| `contextItems.length > 0` | 1 of 3 contextual templates referencing `summarizeContext()` |
| Empty context | 1 of 3 generic brand templates |
| Selection index | `userMessage.trim().length % 3` — deterministic rotation |

**Mock reply never includes visual blocks.**

---

## 8. Visual block render fallback

After resolver succeeds, renderer may still return `null`:

```typescript
// Unknown kind → null (text still shown)
// Invalid payload → null
// Entity id not found in feed data → card skipped
// All cards skipped → empty visual area (text only)
```

This is **renderer degradation**, not resolver null.

---

## 9. Decision flowchart

```txt
User sends message
        │
        ▼
responseResolver(input)
        │
   ┌────┴────┐
   │         │
  null    result
   │         │
   ▼         ▼
mock     has visualBlock?
reply         │
           ┌──┴──┐
          no     yes
           │      │
           ▼      ▼
        text   text + renderVisualBlock()
         only      │
                  ┌┴┐
               valid invalid
                  │      │
                  ▼      ▼
               cards   text only
```

---

## 10. Fallback invariants

| # | Invariant |
|---|-----------|
| F1 | Never return empty `text` string |
| F2 | `null` is preferred over wrong vertical content |
| F3 | Mock reply never impersonates vertical-specific entities |
| F4 | Empty entity list → null, not empty cards |
| F5 | Cart/schedule prompts are explicit blocks — not silent null |

---

## Related

- [`AI_RUNTIME_BASELINE.md`](./AI_RUNTIME_BASELINE.md)
- [`AI_CONTEXT_HYDRATION_SPEC.md`](./AI_CONTEXT_HYDRATION_SPEC.md)
- [`AI_CONVERSATIONAL_INVARIANTS.md`](./AI_CONVERSATIONAL_INVARIANTS.md)
