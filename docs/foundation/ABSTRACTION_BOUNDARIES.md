# Abstraction Boundaries — Social Landing

**Date:** 2026-05-24  
**Mode:** STRATEGIC FOUNDATION ANALYSIS ONLY  
**Goal:** Prevent **eternal temporary integration**, **semantic coupling**, and **architectural lock-in**

---

## Core problem

Two failure modes threaten Integration-first → Selective native:

1. **Temporary integration forever** — Calendly iframe becomes permanent UX  
2. **Premature native rebuild** — building Stripe competitor before product-market fit  

Abstractions exist to **delay the decision** without **hiding the decision**.

---

## Boundary model (layers)

```
┌─────────────────────────────────────────────────────────┐
│  TIER 1 — EXPERIENCE (native, frozen converge discipline) │
│  Feeds, composer, morph, drawers, visual continuity       │
└───────────────────────────┬─────────────────────────────┘
                            │ domain intents only
┌───────────────────────────▼─────────────────────────────┐
│  ORCHESTRATION (native, evolving)                        │
│  Surface machine, event bus, rules, intent routing         │
└───────────────────────────┬─────────────────────────────┘
                            │ port interfaces
┌───────────────────────────▼─────────────────────────────┐
│  INTEGRATION PORTS (lib/integrations + future ports)       │
│  WhatsApp, Shopify, CRM, Booking, Media, Completion      │
└───────────────────────────┬─────────────────────────────┘
                            │ adapters
┌───────────────────────────▼─────────────────────────────┐
│  PROVIDERS (external)                                    │
│  Meta, Stripe, Supabase, Google, LLM APIs                │
└─────────────────────────────────────────────────────────┘
```

**Rule:** Tier 1 imports **orchestration** and **domain types** — never provider SDKs.

---

## Fase 3 — Abstraction strategy

### 1. Provider interfaces that will matter

| Port | Status | Priority | Domain verbs (examples) |
|------|--------|----------|-------------------------|
| `WhatsAppPort` | Exists | **P0 wire** | `buildDeepLink`, `sendMessage`, `validatePhone` |
| `InstagramPort` | Exists | P1 | `getProfile`, `verifyHandle`, `buildProfileUrl` |
| `YouTubePort` | Exists | P2 | `resolveEmbed`, `getMetadata` |
| `GooglePort` | Exists | P1 (auth) | OAuth exchange, profile |
| `ShopifyPort` | Exists | P1 (ecommerce) | `syncProducts`, `getProduct` |
| `CRMPort` | Exists | P2 | `submitLead`, `createContact` |
| **`BookingPort`** | **Missing** | **P1** | `getAvailability`, `createHold`, `confirmBooking` |
| **`PaymentIntentPort`** | **Missing** | P2 | `createCheckoutSession` — not capture logic |
| **`MediaPort`** | Partial (db WIP) | P1 with db merge | `requestUpload`, `signedUrl` |
| **`IdentityVerificationPort`** | **Missing** | P2 | `verifyExternalHandle` |
| **`CompletionPort`** | **Missing** | P2 | `complete`, `stream` — model-agnostic |

**Naming convention (existing):** `{Provider}Port`, `{provider}Adapter`, `{provider}MockAdapter`.

---

### 2. Capability layers to preserve

| Layer | Owns | Must not leak |
|-------|------|---------------|
| **Experience** | Layout, motion, drawer UX | Shopify variant IDs, Stripe client secrets |
| **Orchestration** | When user transitions surfaces | Provider HTTP errors in UI copy |
| **Domain** | Brand, landing, intent, event types | Calendly event names |
| **Integration** | Provider translation | Composer state |
| **Infrastructure** | Connection strings, keys | Business rules |

**Existing assets to protect:**

- `lib/events/event-types.ts` — semantic vocabulary  
- `lib/surfaces/surface-machine.ts` — experience state  
- `lib/rules/rule-engine.ts` — policy above providers  
- `landing-schema` — publication domain (WIP)  

---

### 3. Boundaries to maintain

#### Tier 1 boundary (hard)

| Allowed | Forbidden |
|---------|-----------|
| Call orchestration hooks | Import `@supabase/supabase-js` in feeds |
| Emit domain events | Embed Stripe.js in ActionDrawer |
| Use domain IDs (`drawerId`, `personal:contact`) | Use `shopifyProductId` in event payloads |
| Open handoff via orchestrator callback | Direct `window.open` without event (legacy — migrate) |

**Precedent:** Personal Phase 3 stable IDs — apply to **integration handoffs** (`intentId`, not `calendlyUrl`).

---

#### Integration boundary (soft — enforce in review)

- All new external calls go through `lib/integrations` or successor `lib/ports/`  
- Mocks must pass smoke tests before adapter swap  
- Adapters return **domain errors**, not raw fetch responses to UI  

---

#### Data boundary

- `external_sources` (db WIP) tracks provenance — **integration data ≠ canonical brand data** until promoted  
- Provider snapshots stored as refs, not merged silently into live landing  

---

#### Auth boundary

- Session lives in auth adapter layer  
- Feeds receive `userId?` / `brandId` — never tokens  

---

### Anti-patterns (eternal integration traps)

| Anti-pattern | Symptom | Fix |
|--------------|---------|-----|
| **Stringly integration** | `instagram: "@foo"` in mock with no verify enum | Identity link model |
| **URL in component** | `wa.me` hardcoded in 5 feeds | `WhatsAppPort.buildDeepLink` |
| **Provider UI embed** | Calendly iframe in drawer | Native drawer + port read |
| **Semantic import** | `import { Product } from '@shopify/...'` in feed card | `CatalogProduct` domain type |
| **Event pollution** | `shopify.checkout.started` in global checklist | Domain: `commerce.checkout.started` |
| **Skip mock** | “We’ll add adapter when API ready” | Mock-first always |
| **Tier 1 “small fix” for provider** | Stripe button styling in ActionDrawer | Orchestration layer CTA |

---

### 4. Current decisions that could block future evolution

| Decision | Blocker type | Mitigation |
|----------|--------------|------------|
| Runtime bypasses `lib/integrations` | Coupling | Wire ports on next touch (not mass refactor) |
| No `BookingPort` while appointment native mock grows | Eternal native mock | Define port + mock before Calendly |
| Ecommerce dirty WIP without catalog abstraction | Shopify lock-in | CatalogPort before merge |
| Event types tied to one vertical | Scale | Domain events + vertical attribute |
| `localStorage` chat history only | AI memory fragmentation | Document as interim; plan brand-scoped store behind port |
| db/media merge without integration registry | Orphan adapters | `INTEGRATION_PROVIDERS` registry extended formally |
| Shadow/reducer in dirty tree | Complexity creep | Keep separate from integration layer |

---

## Wiring strategy (when implementation is allowed — not now)

**Phase A — Document ports** (analysis complete with this pack)  
**Phase B — Mock-only wire** — feeds call ports; mocks return current behavior  
**Phase C — Single provider swap** — one vertical, one provider, feature flag  
**Phase D — Selective native** — replace provider **slice** behind same port  

Never: Phase D before Phase B.

---

## Domain types vs provider types

| Domain (stable) | Provider (volatile) |
|-----------------|-------------------|
| `IntentAction.contact` | `wa.me` URL format |
| `CatalogProduct` | Shopify GID |
| `BookingSlot` | Calendly event type UUID |
| `VerifiedSocialLink` | Meta Graph node id |
| `MediaAssetRef` | Supabase storage path |
| `drawerId: personal:contact` | — |

**Adapter responsibility:** map provider ↔ domain at boundary only.

---

## Event bus as integration glue

Native orchestration advantage: **semantic events already exist**.

| Pattern | Example |
|---------|---------|
| Handoff before open | `whatsapp.clicked` → then navigate |
| Intent signal | `user.intent.signal` |
| Surface sync | `drawer.opened` / `surface.opened` |
| Future | `booking.intent.created` → BookingPort |
| Future | `commerce.checkout.requested` → PaymentIntentPort |

**Rule:** integrations **emit and consume domain events** — not ad-hoc callbacks across feeds.

---

## Rules engine placement

`lib/rules` sits **above ports**:

- “If brand has Shopify, show catalog block”  
- “If WA not configured, hide CTA”  
- “If claim unverified, soften trust badge”  

Keeps feed components dumb to provider configuration.

---

## Testing boundaries

| Layer | Test type |
|-------|-----------|
| Ports | Mock adapter contract tests |
| Adapters | Recorded fixtures / sandbox API |
| Tier 1 | Playwright QA (existing) |
| Integration E2E | Optional nightly — not every PR |

Mocks are **not second-class** — they are the **default production path** until adapter GO.

---

## Checklist for future PRs (integration touch)

- [ ] Does this import a provider SDK outside `lib/integrations` or `lib/db`?  
- [ ] Is there a domain type free of provider IDs?  
- [ ] Is there a mock adapter path?  
- [ ] Are events domain-named?  
- [ ] Does Tier 1 remain provider-agnostic?  
- [ ] Is this integration or native orchestration? (tag PR)  

---

## Success criterion

- [x] Port inventory + gaps identified  
- [x] Layer boundaries defined  
- [x] Anti-patterns named  
- [x] Current repo gaps honest (`lib/integrations` unwired)  
- [x] No code changes  

**Related:** `INTEGRATION_STRATEGY_ANALYSIS.md`, `NATIVE_OWNERSHIP_MAP.md`, `EXECUTIVE_PLATFORM_DIRECTION.md`
