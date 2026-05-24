# Executive Platform Direction — Social Landing

**Date:** 2026-05-24  
**Mode:** STRATEGIC FOUNDATION ANALYSIS ONLY  
**Thesis:** **Hybrid orchestration platform** — integration-first velocity, selective native moat

---

## One-line direction

Social Landing should be a **social-native orchestration layer** that **connects** best-in-class external capabilities while **owning** the conversational experience, intent routing, identity hub, and semantic continuity — **not** a monolith that rebuilds Stripe, WhatsApp, or Shopify.

---

## Fase 4 — Executive answers

### 1. Integradora · nativa · híbrida · orchestration layer?

**Answer: Híbrida — with orchestration layer as the primary identity.**

| Label | Fit |
|-------|-----|
| Integradora pura | ❌ Commodity; no moat |
| Plataforma nativa pura | ❌ Too slow; wrong economics |
| **Híbrida** | ✅ |
| **Orchestration layer** | ✅ **Best description of north star** |

**Public framing:**  
*“Your social landing — one continuous experience that connects WhatsApp, Instagram, booking, and commerce where it matters.”*

---

### 2. Maior risco estratégico?

**Experience fragmentation via eternal integrations** — OR — **premature native rebuild**.

More acute **today:**

> **Ports exist (`lib/integrations`) but runtime bypasses them** — temporary coupling hardens into architecture while the team focuses correctly on converge/hygiene.

Secondary risks:

- Meta policy / API dependency for identity  
- Operational fatigue (docs, worktrees) diluting integration discipline  
- Ecommerce/booking WIP merging provider semantics into Tier 1  

---

### 3. Maior diferencial potencial?

**Social-native conversational landing** that:

- morphs feed content into composer context  
- orchestrates drawers/surfaces with semantic events  
- routes intent to external rails **without breaking continuity**  
- becomes the **canonical hub** for brand identity across Meta ecosystem  

**Not:** another link-in-bio clone.  
**Not:** another Shopify theme.  
**Moat:** perceptual + orchestration + context — hard to copy with iframe stack.

---

### 4. O que jamais internalizar cedo?

1. Payment processing (Stripe stays)  
2. WhatsApp message transport  
3. Video hosting / CDN  
4. Full ecommerce back-office  
5. OAuth/crypto implementation  
6. Global scheduling infrastructure  
7. Large-scale social graph / recommender  
8. Meta verification bureaucracy as custom build  

---

### 5. O que provavelmente será inevitavelmente nativo?

1. **Composer + surface orchestration** — already native  
2. **Semantic event model** — already native  
3. **Intent routing** (contact, book, buy, watch)  
4. **AI context / memory policy** (brand-scoped)  
5. **Identity hub** (username + verified links) — see username note  
6. **Booking & commerce UX flows** (drawers, not backends)  
7. **Publication / landing assembly** (schema WIP)  
8. **Trust / claim presentation**  

---

### 6. O que mais ameaça foco?

| Threat | Severity |
|--------|----------|
| Starting influencer + commerce + identity + db **simultaneously** | Critical |
| Building native booking **backend** before vertical converge stable | High |
| CI/QA/doc weight without merge discipline | Medium |
| “Let’s wire all integrations now” | High |
| Dirty tree merges mixing db + ecommerce + shadow | Critical |

**Focus guardrail:** one workstream at a time; ports before provider wires.

---

### 7. O que mais fortalece moat?

| Moat lever | Status |
|------------|--------|
| Conversational continuity | Strong — Tier 1 investment |
| Event-native instrumentation | Strong — QA institutionalizing |
| Controlled migration pattern | Strong — personal proof |
| Integration port layer | **Latent** — needs wiring |
| Identity hub | Future |
| Brand DNA + rules engine | Foundation |
| Meta ecosystem as **verified graph** | Future |

**Insight:** Moat is **experience orchestration + data semantics**, not owning WhatsApp.

---

### 8. Timing saudável de internalização

| Stage | Focus | Native work |
|-------|-------|-------------|
| **Now – Q2** | Operational baseline, converge hygiene, QA infra | **None new** — protect Tier 1 |
| **Next** | Influencer/institutional converge (when GO) | Drawer UX only |
| **+ db-media merge** | MediaPort, auth integrate | Data ownership, not provider rebuild |
| **+ Identity RFC** | Username hub design | No code until approved |
| **+ First provider wire** | WhatsApp port in feeds (mock parity) | Orchestration only |
| **+ BookingPort** | Before any Calendly | Mock + native drawer |
| **12–24mo** | Selective native slices with metrics | Booking UX, commerce surface, AI memory |

**Rule:** internalize **orchestration slices** when integration tax is measured — not anticipated.

---

### 9. Produto preparado para esse futuro?

**Partially — better than most at experience layer; gap at integration boundary.**

| Prepared | Not prepared |
|----------|--------------|
| Tier 1 native sophistication | Ports wired to runtime |
| `lib/integrations` pattern | Booking/Payment ports |
| Event bus | Domain event catalog for commerce/booking |
| landing-schema / db WIP sketch | Merged operational db |
| QA infrastructure (post #38) | Integration contract tests in CI |
| Convergence discipline | Provider configuration UI |

**Score:** **Experience-ready, integration-boundary immature** — correct order if boundary is next after hygiene.

---

### 10. Decisões AGORA para preservar opcionalidade

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | **Tag PRs** `integration` vs `orchestration` vs `converge` | Prevents scope blur |
| 2 | **No provider SDK in Tier 1** — review gate | Boundary |
| 3 | **Define BookingPort + mock** before Calendly mention in code | Avoid eternal embed |
| 4 | **Wire WhatsApp via port** on next contact CTA touch | Lowest-risk first wire |
| 5 | **Domain event names** for future commerce/booking | Before ecommerce merge |
| 6 | **Complete dirty tree peel** before db/ecommerce merge | Prevent mixed semantics |
| 7 | **Extend `INTEGRATION_PROVIDERS` registry** formally | Discoverability |
| 8 | **Do not start identity engine** — keep username note only | Focus |
| 9 | **Copy Personal converge protocol** — not integration explosion | Velocity |
| 10 | **Document handoff in PR** when adding external dependency | Audit trail |

---

## Strategic positioning summary

```
TODAY                         FUTURE (selective native)
─────                         ─────────────────────────
/demo native UX               Production landings @ hub URL
Mock booking/cart             Orchestrated + external fulfill
wa.me direct                  WhatsAppPort + events
lib/integrations unused       Ports wired; mocks default
12 vertical demos             Vertical templates + provider config
No auth                       OAuth integrate; identity hub native
```

---

## What success looks like (12-month horizon)

- User completes **book / buy / contact** without feeling “kicked out” of landing  
- Every handoff instrumented with domain events  
- Swapping Shopify → native catalog read behind `CatalogPort` does not touch Tier 1  
- Meta handles **verified**, not copy-pasted  
- Team spends **80%** on orchestration/experience, **20%** on adapter maintenance  

---

## What failure looks like

- Calendly iframe permanent in drawer  
- Five feeds with five WhatsApp URL builders  
- Ecommerce merge couples product card to Shopify types  
- “Native rebuild” pitchforks Tier 1 during identity project  
- Integration-first becomes **excuse never to own UX**  

---

## Relationship to other foundation docs

| Document | Role |
|----------|------|
| `INTEGRATION_STRATEGY_ANALYSIS.md` | Integration inventory & roles |
| `NATIVE_OWNERSHIP_MAP.md` | What to own vs rent |
| `ABSTRACTION_BOUNDARIES.md` | Layers, ports, anti-patterns |
| `FUTURE_USERNAME_IDENTITY_NOTE.md` | Identity slice of native ownership |
| `docs/convergence/CONTROLLED_MIGRATION_PATTERN.md` | Near-term execution discipline |

---

## Immediate strategic recommendation (no implementation)

1. **Finish operational baseline** — docs PR, dirty tree peel  
2. **Define missing ports on paper** — Booking, PaymentIntent, IdentityVerification  
3. **First wire: WhatsAppPort** — smallest surface, highest alignment with Meta strategy  
4. **Defer** Calendly, Stripe UI, Graph API until port + mock exist  
5. **Never** conflate this direction with influencer converge authorization  

---

## Final verdict

Social Landing should evolve from:

> **“integrações conectadas”**

to:

> **“plataforma de orquestração inteligente”**

by **owning the social-native experience and intent graph**, while **renting commodity rails** until selective native ownership is **evidence-backed** — not ideology-backed.

**Platform identity:** **Hybrid orchestration layer.**  
**Not now:** native commerce engine, auth platform, or messaging client.  
**Protect:** Tier 1, event semantics, port boundaries, operational focus.

---

## Document pack index

1. `INTEGRATION_STRATEGY_ANALYSIS.md`  
2. `NATIVE_OWNERSHIP_MAP.md`  
3. `ABSTRACTION_BOUNDARIES.md`  
4. `EXECUTIVE_PLATFORM_DIRECTION.md` (this file)  

**Status:** Analysis complete — no code, no runtime, no commits.
