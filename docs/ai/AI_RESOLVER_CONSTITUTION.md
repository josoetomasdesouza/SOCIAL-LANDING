# AI Resolver Constitution

**Status:** Official — Era 5 Multi-Vertical AI  
**Effective base:** `41b4ff7` (WS-08B merged)  
**Scope:** Conversational resolver layer per business vertical  
**Not in scope:** Composer core, morph runtime, ActionDrawer, instrumentation, DB

---

## Preamble

The AI resolver is not a chatbot product. It is an **editorial companion** embedded in a social landing feed — a thin contextual layer that helps visitors discover what already exists in the feed, without replacing scroll, cards, or drawers.

Every vertical owns its resolver. Shared types live in `lib/mock-data/conversational-search.ts`; **implementations never cross vertical boundaries.**

---

## 1. Philosophy

### Editorial

Copy reads like a knowledgeable host, not a search engine or clinical intake form.

- Warm, orientative, brand-aligned tone
- One idea per reply — no walls of text
- Suggestions framed as conversation starters, not verdicts

### Contextual

Replies honor what the user selected (long-press context), what they typed, and what the vertical already surfaces in the feed.

- Context chips are first-class input to the resolver
- Follow-up prompts ("o que combina?", "esse profissional atende o quê?") resolve against selection, not generic search

### Not a dashboard

The composer must never become a data grid, admin panel, or infinite list.

- Visual blocks show **at most 3 items** per reply
- No tables, filters, sort controls, or pagination inside the composer
- Discovery stays lightweight; depth lives in existing drawers

### Not a cold chatbot

Avoid robotic FAQ patterns, scripted triage trees, and "Como posso ajudar?" loops.

- Prefer concrete cards and CTAs over abstract options
- When uncertain, defer to human consultation (especially health)
- Preserve the feed's spatial and visual language in composer blocks

---

## 2. Core rules

| Rule | Meaning |
|------|---------|
| **AI never replaces the feed** | Scroll, stories, modules, and drawers remain the primary UX. Composer augments; it does not become the app. |
| **AI complements discovery** | Resolver routes intent to feed-native entities (products, dishes, professionals, services). |
| **Resolver is contextual, not pure search** | Keyword match alone is insufficient. Rank by context, category, popularity, and vertical semantics. |
| **One vertical, one resolver module** | No shared resolver logic that branches on `businessModel` inside a god-file. |
| **Null means fallback** | Returning `null` delegates to generic mock reply — vertical resolver only handles what it owns. |
| **Frozen reference implementations** | `ecommerceMockConversationResolver` is the ecommerce baseline — do not modify it when adding verticals. |

---

## 3. Vertical-specific charter

### Ecommerce (reference — frozen)

- **Role:** Editorial product discovery for skincare/beauty catalog
- **Tone:** "Encontrei alguns produtos que combinam"
- **Must:** Preserve discovery cards, context follow-up for related products
- **Must not:** Become a price comparator, stock dashboard, or checkout chat

### Restaurant (WS-08A)

- **Role:** Menu discovery, recommendation, cart nudge
- **Tone:** Warm, house-style suggestions
- **Must:** Open item drawer or cart via existing feed callbacks
- **Must not:** Dump full menu as text; infinite category lists; replace cart drawer UX

### Health (WS-08B)

- **Role:** Specialty/service orientation, soft scheduling
- **Tone:** Light, editorial, consultation-first
- **Must:** Route scheduling to existing `ProfessionalDrawer` — no real booking in resolver
- **Must not:** Diagnose, triage, promise outcomes, or simulate clinical intake

### Future verticals (appointment, realestate, etc.)

Must adopt this constitution before implementation. See [`AI_ALLOWED_EVOLUTION.md`](./AI_ALLOWED_EVOLUTION.md).

---

## 4. Authority and change control

| Document | Governs |
|----------|---------|
| This constitution | Why and what — philosophy, rules, vertical charter |
| [`AI_RESOLVER_CONTRACT.md`](./AI_RESOLVER_CONTRACT.md) | How — types, wiring, fallback, kinds |
| [`AI_VISUAL_BLOCK_PATTERNS.md`](./AI_VISUAL_BLOCK_PATTERNS.md) | UI patterns for composer blocks |
| [`AI_CONVERSATIONAL_INVARIANTS.md`](./AI_CONVERSATIONAL_INVARIANTS.md) | Non-negotiable UX invariants |
| [`AI_ALLOWED_EVOLUTION.md`](./AI_ALLOWED_EVOLUTION.md) | Growth path, anti-patterns, next vertical |

**Amendment protocol:** Docs-only PR. Runtime changes require vertical workstream + QA gate. Constitution changes require explicit review — no drive-by edits in feature PRs.

---

## 5. Success criteria

A resolver is constitutional when:

1. Feed-first UX is unchanged for users who never open the composer
2. Replies feel editorial, not mechanical
3. Visual blocks reuse feed iconography (images, prices, CTAs)
4. Context long-press semantics work in QA
5. Vertical QA script passes; `qa:events` still 8/8
6. No cross-vertical imports in resolver modules
7. Audit report documents intents, risks, and GO / GO WITH NOTES / NO-GO

---

## Related

- [`../os/WORKSTREAMS.md`](../os/WORKSTREAMS.md) — WS-08A, WS-08B, WS-08.5
- [`../audit/WS-08A_RESTAURANT_AI_RESOLVER_REPORT.md`](../audit/WS-08A_RESTAURANT_AI_RESOLVER_REPORT.md)
- [`../audit/WS-08B_HEALTH_AI_RESOLVER_REPORT.md`](../audit/WS-08B_HEALTH_AI_RESOLVER_REPORT.md)
