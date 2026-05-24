# Native Ownership Map — Social Landing

**Date:** 2026-05-24  
**Mode:** STRATEGIC FOUNDATION ANALYSIS ONLY  
**Companion:** `INTEGRATION_STRATEGY_ANALYSIS.md`

---

## Purpose

Map **what should stay integrated**, **what may become native**, **what must never be native early**, and **what is already core experience** — without prescribing a build timeline or feature list.

---

## Ownership spectrum

```
EXTERNAL ONLY          HYBRID (orchestrate)           NATIVE CORE
─────────────────────────────────────────────────────────────────
Stripe rails           Booking flow UX                Composer / morph
WA message delivery    Cart surface + intent          Surface machine
YouTube hosting        Identity hub + verify          Event semantics
Shopify catalog        AI context policy              Drawer orchestration
Supabase ops           Media permissions API          Feed continuity
Calendly slots         Lead → CRM routing             Vertical intent routing
```

---

## Fase 2 — Capability analysis

### 1. What should remain integration (long horizon)

| Capability | Provider examples | Why stay external |
|------------|-------------------|-------------------|
| Payment capture & PCI | Stripe | Compliance, fraud, rails |
| WhatsApp **message send** | Meta Cloud API | Policy, deliverability |
| Video hosting | YouTube | CDN cost, encoding |
| Full product ERP | Shopify, Woo | Inventory complexity |
| OAuth / credential crypto | Supabase Auth, Google | Security surface |
| Email deliverability | SendGrid, Resend | Reputation infra |
| Calendar **slot storage** (optional) | Google Calendar API | Sync not core UX |
| LLM inference | OpenAI, Anthropic | Model race — abstract, don’t own weights early |

**Rule:** If failure mode is **legal, financial, or global ops** → integrate.

---

### 2. What may become abstraction (capability layer — not feature)

| Capability | Abstraction shape | Notes |
|------------|-------------------|-------|
| All external providers | `lib/integrations/*` ports | **Extend** — add booking, payments-intent, media |
| Handoff actions | `IntentRouter` / action registry | “contact”, “book”, “buy”, “watch” |
| Lead capture | `LeadPort` → CRM adapters | Already have `CRMPort` sketch |
| Product catalog read | `CatalogPort` → Shopify/mock | Sync, don’t embed admin |
| Calendar availability read | `AvailabilityPort` | Native UX consumes port |
| Verified social links | `IdentityLinkPort` | Meta verify behind interface |
| Media upload | `MediaPort` → Supabase adapter | WIP in db stack |
| AI completion | `CompletionPort` | Policy native; model external |

**Rule:** Abstraction **without** implementation = ports + types + mocks + tests.

---

### 3. What may become native (selective ownership)

| Capability | Native scope | NOT in scope |
|------------|--------------|--------------|
| **Booking orchestration** | Multi-step drawer flow, confirmation UX, composer sync, reminders **intent** | Owning calendar infra worldwide |
| **Messaging orchestration** | When to open WA, pre-filled context, thread **intent** in composer | Replacing WhatsApp |
| **Claimed pages / identity hub** | Username routing, verified badge UX, link hub | Meta account hosting |
| **Lightweight commerce** | Cart drawer, product cards in feed, checkout **surface** | Warehouse, tax engine |
| **AI memory / context** | Conversation history policy, context chips, brand-scoped memory rules | Foundation model training |
| **Recommendation / match** | “Suggested actions”, vertical presets, social graph **lite** | TikTok-scale recommender |
| **Publication / landing assembly** | `landing-schema`, publish sandbox (WIP) | Generic CMS replacement |
| **Trust signals** | Claim status UI, audit trail display | Legal review automation |

**Priority native candidates (by moat potential):**

1. Orchestration of surfaces + intent (already in progress)  
2. AI context + conversational continuity  
3. Identity hub (username + verified externals)  
4. Booking **experience** orchestration  
5. Lightweight commerce **surface**  

---

### 4. What would be error to internalize

| Error | Why catastrophic |
|-------|-------------------|
| Payment processor | PCI, fraud, regulatory drag |
| WhatsApp protocol client | Policy bans, maintenance hell |
| Instagram feed mirror | API limits, ToS, stale embed wars |
| Full scheduling SaaS | Commodity; distracts from social UX |
| Custom auth crypto | Security incidents |
| Video transcoding pipeline | Infra company, not landing company |
| Social graph at Facebook scale | Premature; burns focus |
| Crawler + LLM extraction platform | Scope explosion (watch `external_sources` WIP) |

---

### 5. Core experience (already native — protect)

| Asset | Location | Ownership |
|-------|----------|-----------|
| Feed continuity | `BusinessSocialLanding` | **Core** |
| Composer modes | `ConversationalAI`, vertical feeds | **Core** |
| Morph layer | `PostToChatMorphLayer` | **Core** |
| Drawer engines | ActionDrawer, surface machine | **Core** |
| Event semantics | `lib/events` | **Core** |
| Vertical storytelling | 12 feeds | **Core** |
| Context selection | `ConversationSelectionProvider` | **Core** |

**Never outsource Tier 1 UX to iframe/embed providers.**

---

### 6. Commodity infra (rent forever)

- Hosting (Vercel)  
- Postgres hosting (Supabase)  
- Object storage backend  
- CDN  
- Transactional email  
- Generic analytics dashboards  
- Stripe  

---

## Capability decision table

| Capability | Now | Phase 2 (6–12mo) | Long-term default |
|------------|-----|------------------|-------------------|
| Payments | — | Stripe Checkout link | **External** |
| WA contact | wa.me direct | Port + instrumented handoff | **External delivery, native orchestration** |
| Booking UI | Native mock | Native + AvailabilityPort | **Native UX, optional external calendar** |
| Ecommerce UI | Native mock | Native + CatalogPort | **Native surface, external catalog/pay** |
| IG content | Link out | Verified link + embed where allowed | **External media, native hub** |
| Identity | Slug mock | Auth integrate + username RFC | **Native hub, external verify** |
| AI chat | Mock/local | CompletionPort + memory policy | **Hybrid** |
| Media upload | WIP Supabase | MediaPort | **Hybrid** |
| CRM | Port mock | Wire on lead events | **External** |

---

## Native ownership triggers (when to internalize)

Internalize **only when all true**:

1. Integration cost (UX tax or $$$) exceeds build cost of **orchestration slice**  
2. Capability is **differentiation**, not commodity  
3. Abstraction port exists and has 2+ provider implementations OR proof mock is insufficient  
4. Team capacity after converge + operational baseline  
5. Clear metric (conversion, retention, time-on-landing) justifies scope  

**Anti-trigger:** “competitor built it” or “architectural elegance.”

---

## Booking — exemplar case study

| Layer | Integration-first | Selective native |
|-------|-------------------|------------------|
| Slot discovery | Calendly embed **or** API read | Native drawer asks date/time |
| Confirmation | Provider email | Native confirmation drawer + event |
| Composer sync | — | Native `composer.mode.changed` |
| Reminders | Provider | Intent to WA/ email via ports |
| Calendar write | Google Calendar API | Optional — not v1 native |

**Today:** appointment-feed is **native UX mock** — correct for learning.  
**Risk:** copying Calendly fields into components without `BookingPort`.

---

## Commerce — exemplar case study

| Layer | External | Native |
|-------|----------|--------|
| Inventory | Shopify | — |
| Payment | Stripe | — |
| Product card in feed | — | Native |
| Cart drawer | — | Native |
| Checkout button | Stripe hosted | Native CTA → external checkout |

Ecommerce WIP in dirty tree must not merge provider SKUs into Tier 1 without port.

---

## Messaging — exemplar case study

| Layer | External | Native |
|-------|----------|--------|
| Message transport | WhatsApp | — |
| Deep link build | WA API / wa.me | Port wrapper |
| “Contact” intent | — | Native CTA + events |
| Pre-filled context from composer | — | Native policy |

Already instrumented: `whatsapp.clicked`, `user.intent.signal` — **keep native semantics**.

---

## Relationship to existing code

| Code | Ownership implication |
|------|----------------------|
| `lib/integrations/*` | Expand ports; wire gradually |
| `lib/surfaces/*` | Stay native |
| `lib/brand-dna/*` | Stay native (presentation contract) |
| `lib/db/*` WIP | Own data; external Supabase |
| `lib/rules/*` | Native policy over integrations |
| Feed `window.open` | **Replace over time** with port calls |

---

## Summary map (quick reference)

| | Stay external | Abstract | Go native |
|---|---------------|----------|-----------|
| **Infra** | Supabase ops, Vercel, CDN | MediaPort | Data model, permissions |
| **Distribution** | IG, YT, WA delivery | IdentityLinkPort | Public hub URL |
| **UX** | — | — | Composer, drawers, morph |
| **Commerce** | Stripe, Shopify backend | CatalogPort | Cart/checkout surface |
| **Booking** | Calendar storage | BookingPort | Flow UX |
| **Identity** | OAuth crypto | Verify adapters | Username hub |
| **AI** | LLM API | CompletionPort | Memory/context policy |
| **Analytics** | Dashboard SaaS | — | Event bus semantics |

**Related:** `ABSTRACTION_BOUNDARIES.md`, `EXECUTIVE_PLATFORM_DIRECTION.md`
