# Integration Strategy Analysis — Social Landing

**Date:** 2026-05-24  
**Mode:** STRATEGIC FOUNDATION ANALYSIS ONLY  
**Thesis:** **Integration-first → selective native ownership**  
**Constraints:** No implementation · no runtime · no schema · no feature work

---

## Strategic thesis

Social Landing should **start integrated** for:

- speed to market  
- distribution via existing platforms (Meta, YouTube, Shopify, etc.)  
- validation before capital-heavy build  
- learning provider semantics and user behavior  

And **selectively internalize** capabilities that become:

- UX-critical to the social-native experience  
- strategic moat (orchestration, identity, context, trust)  
- economically painful to rent forever at scale  

**Not a rebuild.** Not “replace everything.” An **orchestration platform** that owns the experience layer and rents commodity infra until native ownership pays off.

---

## Current integration landscape (baseline)

| Layer | State today | Wired to `/demo` runtime? |
|-------|-------------|---------------------------|
| `lib/integrations/*` | Port + adapter + mock for 6 providers | **No** — isolation layer only |
| WhatsApp | `wa.me` deep links + `whatsapp.clicked` events | **Yes** — direct URL, not port |
| Instagram / social | Display strings + `window.open` links | **Yes** — mock/display |
| Booking | In-feed state machines (appointment, gym, etc.) | **Yes** — **native mock**, no Calendly |
| Ecommerce | In-feed cart UX | **Yes** — native mock, no Shopify wire |
| YouTube / embeds | Link-out pattern in mocks | Display only |
| Stripe | Not present | — |
| Supabase / media | `lib/db/*` WIP (dirty tree) | **No** on main |
| Vercel Analytics | Dependency present | Passive |
| Google OAuth | Port exists, not wired | No |
| CRM | Port exists, not wired | No |
| Shopify | Port exists, not wired | No |

**Gap:** Abstraction layer exists in code but **runtime still bypasses it** — strategic risk of “ports on paper, coupling in UI.”

---

## Fase 1 — Integration mapping by role

### Classification matrix

| Integration / capability | Primary role(s) | Strategic? | Substitutable? | Lock-in risk | Hard to internalize? |
|--------------------------|-----------------|------------|----------------|--------------|----------------------|
| **Meta (IG, Threads, WA Business)** | identity, distribution, messaging, trust | **Yes** | Partially | **High** | **Yes** (API/policy) |
| **WhatsApp (wa.me / Business API)** | messaging, distribution | **Yes** | Low for delivery | **High** | **Yes** |
| **Instagram embeds / Graph** | distribution, media, identity | **Yes** | Medium | High | Yes |
| **YouTube** | media, distribution | Medium | **Yes** | Low | Yes (hosting) |
| **Google (OAuth, Calendar)** | identity, booking infra | Medium | **Yes** | Medium | Medium |
| **Stripe** | commerce, trust/compliance | Medium | **Yes** | Medium | **Yes** (PCI) |
| **Shopify / ecommerce SaaS** | commerce, orchestration | Medium | **Yes** | Medium | Yes (catalog/inventory) |
| **Booking SaaS (Calendly, etc.)** | UX-critical, orchestration | Medium | **Yes** | Low–Medium | Medium |
| **Supabase** | infrastructure, media, auth host | Low–Medium | **Yes** | Medium | Yes (Postgres ops) |
| **Vercel / hosting** | infrastructure | Low | **Yes** | Low | Yes |
| **CRM (HubSpot-style)** | orchestration, analytics | Low | **Yes** | Low | Low |
| **Social embeds (generic)** | UX, distribution | Low | **Yes** | Low | N/A |
| **Conversational AI (future LLM APIs)** | orchestration, UX-critical | **Yes** | Partially | Medium | Partial (model layer) |
| **Native surface/composer/drawer** | UX-critical, orchestration | **Yes** | **No** | N/A — already owned | Already native |
| **Event bus / instrumentation** | analytics, orchestration | **Yes** | Partial | Low | Already native |

---

### By role (10 categories)

#### 1. Infrastructure

| Item | Verdict |
|------|---------|
| Supabase, Vercel, CDN, email SMTP | **Stay external** — commodity |
| Drizzle/Postgres schema | **Own** data model; **rent** ops initially |

**Strategic:** data ownership yes; server ops no (early).

---

#### 2. Distribution

| Item | Verdict |
|------|---------|
| Meta apps, YouTube, IG links | **Stay external** — distribution is their moat |
| Social Landing public URL | **Own** — hub orchestration |

**Strategic:** be the **destination that aggregates** distribution channels, not replace them.

---

#### 3. UX-critical

| Item | Verdict |
|------|---------|
| Feed + composer + morph + drawers | **Native** (Tier 1) — non-negotiable |
| Booking flow UX in appointment vertical | **Native orchestration**; provider for calendar sync optional |
| Cart/checkout **experience** | **Native** surface; payment external |
| Long-press, context chips, AI overlay | **Native** |

**Strategic:** anything that defines “social-native landing” must not be a third-party iframe UX.

---

#### 4. Identity

| Item | Verdict |
|------|---------|
| Meta handles, OAuth | **Integrate** verify + link |
| Platform username / claimed pages | **Future native** (see `FUTURE_USERNAME_IDENTITY_NOTE.md`) |
| Session auth | **Integrate** (Supabase Auth / OAuth) — don’t build OIDC |

**Strategic:** own **identity graph**; rent **credential verification** initially.

---

#### 5. Commerce

| Item | Verdict |
|------|---------|
| Stripe payments | **Stay external** forever (likely) |
| Product catalog source | **Integrate** Shopify/etc. early |
| In-feed product cards, cart drawer | **Native** presentation |
| Order orchestration | **Hybrid** — own intent; external fulfillment |

**Lock-in risk:** Shopify theme logic in components — avoid.

---

#### 6. Messaging

| Item | Verdict |
|------|---------|
| WhatsApp message **delivery** | **Stay external** |
| Intent routing (“contact”, “book”, “buy”) | **Native orchestration** |
| Conversation context / composer memory | **Native** (partially localStorage today) |

**Dangerous:** building a WA client. **Safe:** owning **when and why** user is sent to WA with instrumented events.

---

#### 7. Analytics

| Item | Verdict |
|------|---------|
| Passive event bus (`lib/events`) | **Native** — strategic |
| Vercel Analytics | **External** — commodity |
| Product analytics (Amplitude-style) | **External** early |
| REAL_USAGE / convergence QA | **Native process** |

**Strategic:** own **semantic events** (drawer, surface, intent); rent aggregation UI.

---

#### 8. Media

| Item | Verdict |
|------|---------|
| Supabase storage (WIP) | **External infra**, **own** access model |
| YouTube hosting | **Stay external** |
| Upload pipeline / signed URLs | **Hybrid** — own API surface, rent blob store |

**Hard to internalize:** global CDN at scale. **Own:** permissions, brand-scoped URLs.

---

#### 9. Orchestration

| Item | Verdict |
|------|---------|
| Vertical feeds routing user intent | **Native** — core |
| `lib/integrations` ports | **Native abstraction** — expand |
| CRM lead sync | **Integrate** |
| Rule engine (`lib/rules`) | **Native** — policy layer above providers |
| Surface machine / reducer | **Native** — experience state |

**This is the future platform shape:** orchestration layer, not integration spaghetti.

---

#### 10. Trust / compliance

| Item | Verdict |
|------|---------|
| Payments (Stripe) | **External** |
| GDPR/consent banners | **Hybrid** — own UX, external legal tooling optional |
| Claim verification (Meta) | **Integrate** |
| Audit logs (db WIP) | **Native** record; external SIEM optional |

---

## Strategic vs substitutable vs dangerous

### Strategic (protect and eventually own semantics)

- Conversational composer + context morph  
- Surface/drawer orchestration  
- Semantic event model  
- Brand-scoped identity hub  
- Intent → action routing  
- AI context/memory policy  

### Substitutable (integrate; swap providers)

- Calendar backends  
- CRM  
- Product catalog sync  
- OAuth IdP  
- Blob storage vendor  
- LLM provider (with abstraction)  

### Dangerous (high lock-in or trap)

| Trap | Why |
|------|-----|
| Provider UI inside Tier 1 (iframe checkout, embed composer) | Breaks social-native UX; hard to unwind |
| Leaking Shopify product IDs into drawer event payloads | Semantic coupling |
| WhatsApp as **only** identity key | Phone ≠ username; blocks Meta handle strategy |
| Skipping ports and calling APIs from feed components | Already a gap vs `lib/integrations` |
| “Temporary” Calendly until native — without orchestration interface | Eternal embed |
| Building payment vault | Compliance sinkhole |

### Hard to internalize (don’t try early)

- WhatsApp message transport  
- Instagram content graph at scale  
- Payment processing / PCI  
- Global video CDN  
- Full ecommerce ERP (inventory, shipping labels)  
- Meta verification bureaucracy  

---

## Integration-first principles (operating rules)

1. **Integrate at the boundary** — ports/adapters, not in Tier 1 feeds  
2. **Own the orchestration narrative** — user never feels “handed off to SaaS UI” without Social Landing framing  
3. **Instrument every handoff** — events before external open (already: `whatsapp.clicked`)  
4. **Default external for commodity** — prove value before build  
5. **Native when UX or moat** — composer, booking **flow**, cart **surface**, identity **hub**  
6. **Never native for compliance sinks** — payments, message delivery  

---

## Current decisions that help or hurt

| Decision | Effect |
|----------|--------|
| `lib/integrations` port pattern | **Helps** — foundation exists |
| Runtime bypassing ports (`wa.me` direct) | **Hurts** — coupling |
| Tier 1 freeze | **Helps** — prevents provider creep into core |
| Native mock booking in feeds | **Neutral** — good UX lab; need orchestration port before Calendly |
| db/media WIP with `external_sources` | **Helps** — provenance model for crawled/integrated content |
| Brand DNA separate from integrations | **Helps** — visual identity ≠ provider config |

---

## Success criterion (this document)

- [x] Integrations classified by strategic role  
- [x] Lock-in and internalization difficulty assessed  
- [x] Grounded in actual repo state (`lib/integrations`, runtime patterns)  
- [x] No implementation prescribed  

**Related:** `NATIVE_OWNERSHIP_MAP.md`, `ABSTRACTION_BOUNDARIES.md`, `EXECUTIVE_PLATFORM_DIRECTION.md`
