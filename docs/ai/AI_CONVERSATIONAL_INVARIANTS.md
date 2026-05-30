# AI Conversational Invariants

**Status:** Non-negotiable UX invariants  
**Violation severity:** Block merge until fixed or constitution amended

---

## 1. Response shape

| Invariant | Spec |
|-----------|------|
| **Short replies** | AI text ≤ 2 sentences; ~160 characters target |
| **One visual block per reply** | At most one `visualBlock` object |
| **Max 3 entities per block** | Slice at resolver build time, not in UI |
| **CTA present when actionable** | If block shows entities, each card has tap + optional button CTA |

---

## 2. Spatial continuity

| Invariant | Spec |
|-----------|------|
| **Composer overlays feed** | Does not push or replace feed layout |
| **Drawer stack unchanged** | Resolver opens same drawers as feed tap |
| **Morph source preserved** | Long-press sets `data-post-context-source` for morph continuity |
| **Composer hides on drawer** | Feed sets `composerMode: "hidden"` when primary drawer open — resolver does not override |
| **No scroll hijack** | Resolver never programmatically scrolls feed |

---

## 3. Flow sovereignty

| Invariant | Spec |
|-----------|------|
| **No flow sequestration** | User can dismiss composer / drawer and return to feed at any point |
| **No forced multi-step chat** | Resolver does not require follow-up questions to complete action |
| **No blocking gates** | Never "answer three questions before seeing menu" |
| **Null is honest** | Unknown intent → generic fallback, not fabricated vertical content |

---

## 4. Context invariants

| Invariant | Spec |
|-----------|------|
| **Context is opt-in** | Long-press toggles; never auto-add without user gesture |
| **Context visible** | Selected items appear as chips before send |
| **Context consumed consistently** | Resolver reads `contextItems` from input — same IDs as chips |
| **Follow-up requires context** | "O que combina?", "Atende o quê?" only special-case when context non-empty |

---

## 5. Fallback invariants

```txt
Vertical resolver returns null
  → buildMockReply(brandName, message, contextItems)
  → No visual block
  → Generic editorial text (never error strings)
```

| Invariant | Spec |
|-----------|------|
| **No empty AI messages** | Every reply has non-empty `content` |
| **No cross-vertical fallback** | Restaurant resolver never returns ecommerce kinds |
| **No silent failures** | Unknown visual kind → renderer returns `null`, text still shows |

---

## 6. Vertical safety invariants

### Health

| Must | Must not |
|------|----------|
| Defer to consultation | Diagnose or triage |
| Editorial orientation | Promise treatment outcomes |
| Soft scheduling CTA | Real booking / payment in composer |
| "Conversar em consulta" framing | Clinical intake questionnaires |

### Restaurant

| Must | Must not |
|------|----------|
| Card-based menu hints | Full menu as text |
| Cart awareness when items exist | Replace cart drawer |
| Popular fallback when cart empty | Fake order confirmation in composer |

### Ecommerce (frozen reference)

| Must | Must not |
|------|----------|
| Editorial discovery | Price-war / comparison bot |
| Related products from context | Catalog dump |

---

## 7. Instrumentation invariants

| Invariant | Spec |
|-----------|------|
| **`qa:events` stable** | 8/8 after any resolver PR |
| **`ai.surface.opened` once** | Composer session instrumentation unchanged |
| **No new required events** | Vertical resolver PRs do not add instrumentation core changes |

---

## 8. Testing invariants

Every vertical resolver PR must verify:

- [ ] Intent matrix in audit report matches QA script steps
- [ ] Long-press → context chip → follow-up prompt (where applicable)
- [ ] CTA opens existing drawer (Playwright visible assertion)
- [ ] Console: no critical errors (filter favicon, 404, duplicate key noise)
- [ ] Other vertical QAs still pass (regression)

---

## 9. Invariant checklist (reviewers)

Before approving a resolver PR:

1. Reply text is short and editorial?
2. Block has ≤ 3 items?
3. CTAs map to existing drawers?
4. `null` returned for out-of-scope intents?
5. No Tier 1 core edits?
6. No cross-vertical resolver imports?
7. Vertical-specific safety rules respected?
8. QA script added/updated?

---

## Related

- [`AI_RESOLVER_CONSTITUTION.md`](./AI_RESOLVER_CONSTITUTION.md)
- [`AI_ALLOWED_EVOLUTION.md`](./AI_ALLOWED_EVOLUTION.md)
