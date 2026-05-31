# AI Allowed Evolution

**Status:** Official growth and governance guide  
**Purpose:** How new vertical resolvers are born, what is forbidden, and what comes next

---

## 1. How a new vertical resolver is born

### Prerequisites

- [ ] Vertical feed exists with primary modules and drawers
- [ ] Context-selectable entities use `{vertical}-{type}-{id}` prefix
- [ ] Constitution + contract reviewed by implementer
- [ ] Workstream entry in `docs/os/WORKSTREAMS.md`

### Birth checklist (1 PR per vertical)

| Step | Deliverable |
|------|-------------|
| 1 | `lib/mock-data/{vertical}-conversational-search.ts` |
| 2 | Kind constants + payload interfaces |
| 3 | `create{Vertical}MockConversationResolver()` or constant export |
| 4 | `{vertical}-conversation-*-block.tsx` card component(s) |
| 5 | `{vertical}-conversational-visual-block.tsx` renderer factory |
| 6 | Wire in `{vertical}-feed.tsx` only |
| 7 | `scripts/convergence/{vertical}-ai-resolver-validation.mjs` |
| 8 | `pnpm qa:{vertical}` in `package.json` |
| 9 | `docs/audit/WS-08{X}_{VERTICAL}_AI_RESOLVER_REPORT.md` |
| 10 | WORKSTREAMS status update |

### Intent budget

Target **5–7 intents** per vertical MVP:

- 1–2 discovery (category / specialty / recommendation)
- 1 specific entity match
- 1 context follow-up
- 1 stateful or action CTA (cart, schedule, contact)
- Fallback via `null`

More intents ship incrementally in follow-up PRs — never in the same PR as governance or another vertical.

---

## 2. Allowed changes

| Area | Allowed |
|------|---------|
| New vertical resolver module | ✅ Isolated file under `lib/mock-data/` |
| New visual block kinds | ✅ Namespaced by vertical |
| Mock-data extension | ✅ Within vertical data file only |
| Feed wiring | ✅ `conversationResponseResolver` + `renderConversationVisualBlock` |
| Vertical QA script | ✅ New `qa:{vertical}` |
| Audit report | ✅ One per vertical PR |
| Docs (`docs/ai/`) | ✅ Governance PRs (WS-08.5+) |
| Factory options | ✅ Feed-local state (cart count, booking step) |

---

## 3. Forbidden changes

| Area | Forbidden | Reason |
|------|-----------|--------|
| `ecommerceMockConversationResolver` body | ❌ | Frozen reference |
| `conversational-ai.tsx` vertical branches | ❌ | Tier 1 composer core |
| `business-social-landing.tsx` vertical branches | ❌ | Tier 1 feed core |
| `action-drawer.tsx` | ❌ | Tier 1 drawer core |
| Morph runtime | ❌ | Tier 1 |
| Instrumentation core | ❌ | Tier 1 |
| Cross-vertical resolver imports | ❌ | Isolation breach |
| Shared god-resolver with switch(model) | ❌ | Anti-pattern |
| DB / identity / media API | ❌ | Wrong era (WS-09) |
| Real payments / bookings in composer | ❌ | Flow sovereignty |
| LLM API integration in resolver PR | ❌ | Future era — separate workstream |

---

## 4. Anti-patterns

### AP-01 — Search engine chatbot

**Symptom:** User types anything → wall of keyword matches, no context, no editorial copy.  
**Fix:** Intent priority stack + `null` fallback + max 3 results.

### AP-02 — Menu / catalog dump

**Symptom:** Restaurant returns 20 dishes; health lists every service.  
**Fix:** Category/specialty filter + slice(0, 3) + drawer for depth.

### AP-03 — Clinical triage bot (health)

**Symptom:** "Qual sua dor?", "Há quanto tempo?", symptom checker.  
**Fix:** Consultation-first copy; route to professional drawer.

### AP-04 — Composer replaces feed

**Symptom:** All discovery moved to composer; feed modules deprioritized.  
**Fix:** Feed remains primary; composer is optional layer.

### AP-05 — God resolver

**Symptom:** `switch (businessModel)` inside one 800-line resolver.  
**Fix:** One module per vertical; shared types only.

### AP-06 — Core fork

**Symptom:** Resolver PR edits ActionDrawer or composer scroll logic.  
**Fix:** Revert core; adapt via feed callbacks.

### AP-07 — Silent cross-contamination

**Symptom:** Restaurant PR breaks `qa:health` or modifies ecommerce resolver.  
**Fix:** Revert; run full vertical QA matrix before merge.

### AP-08 — Inline new surfaces

**Symptom:** Calendar, checkout form, or payment inside composer block.  
**Fix:** CTA → existing drawer only.

---

## 5. Amendment and deprecation

| Change type | Process |
|-------------|---------|
| New invariant | Docs PR + WORKSTREAMS note |
| New kind namespace | Vertical PR + update `AI_RESOLVER_CONTRACT.md` |
| Deprecate a kind | Two-phase: mark deprecated in docs, remove next vertical cycle |
| Unfreeze ecommerce resolver | Explicit era change + human GO — not allowed in Era 5 |

---

## 6. Current vertical matrix

| Vertical | Status | Resolver module | QA | Intents |
|----------|--------|-----------------|-----|---------|
| Ecommerce | ✅ Reference (frozen) | `conversational-search.ts` | — | Product discovery, context related |
| Restaurant | ✅ WS-08A | `restaurant-conversational-search.ts` | `qa:restaurant` 6/6 | Category, dish, recommend, cart |
| Health | ✅ WS-08B | `health-conversational-search.ts` | `qa:health` 7/7 | Specialty, service, recommend, context, schedule |
| Appointment | 🔜 Recommended next | — | — | Provider, slot, service type, reschedule |
| Realestate | ⏸ Later | — | — | Property match, visit, context listing |
| Personal / Influencer | ⏸ Evaluate need | — | — | May not need commerce-style resolver |

---

## 7. Recommended next vertical: **Appointment**

**Gate:** Blocked until WS-08.7 (AI Stability & Observation) merges. Then run `pnpm qa:ai-observation` + human checklist before kickoff.

### Rationale

1. **Natural third leg** — ecommerce (buy), restaurant (order), health (consult) → appointment (book)
2. **Existing primitives** — `AppointmentCalendar`, confirmation drawers already in health feed
3. **Clear intent set** — provider search, slot availability, service selection, reschedule nudge
4. **Isolation path** — dedicated `appointment-conversational-search.ts` without touching health resolver
5. **Governance ready** — WS-08.5 docs define patterns appointment must follow

### Suggested scope (WS-08C)

| Intent | Example |
|--------|---------|
| Find provider | "cabeleireiro", "massagem" |
| Find service | "corte masculino", "limpeza de pele" |
| Guided | "quero relaxar", "preciso cortar o cabelo" |
| Context follow-up | Selected pro + "quais serviços?" |
| Soft book | "quero agendar" → existing calendar drawer |

### Out of scope for WS-08C

- Global appointment engine refactor
- Real calendar sync / notifications
- Cross-vertical health ↔ appointment merge

### Branch name

`workstream/ai-resolver-appointment`

---

## 8. Era roadmap (AI resolver lane)

```txt
WS-08A ✅ Restaurant
WS-08B ✅ Health
WS-08.5 ✅ Governance (this docs pack)
WS-08C 🔜 Appointment  ← recommended next
WS-08D ⏸ Realestate / others on demand
```

---

## Related

- [`AI_RESOLVER_CONSTITUTION.md`](./AI_RESOLVER_CONSTITUTION.md)
- [`AI_RESOLVER_CONTRACT.md`](./AI_RESOLVER_CONTRACT.md)
- [`../os/WORKSTREAMS.md`](../os/WORKSTREAMS.md)
