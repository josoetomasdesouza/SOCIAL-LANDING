# Future Foundation Note — Username & Cross-Platform Identity

**Date:** 2026-05-24  
**Status:** FUTURE FOUNDATION NOTE ONLY — **not approved for implementation**  
**Mode:** Architectural anticipation · zero runtime · zero schema · zero auth

---

## Purpose

Record strategic implications of **Meta-style usernames / cross-platform identity handles** for Social Landing **before** any feature work begins.

This note exists so **current decisions do not accidentally foreclose** a healthy identity layer later — without accelerating premature implementation.

---

## Context

Meta ecosystem evolution (Instagram, Threads, WhatsApp Business, claimed pages) increasingly treats **handles/usernames** as:

- portable identity signals  
- discovery and deep-link anchors  
- cross-app routing primitives  
- brand ownership evidence  

Social Landing may eventually:

- expose its own usernames  
- bind or verify Meta handles  
- route public URLs by username  
- connect omnichannel identity (IG / Threads / WA / claimed page)  
- use handles as social-graph and brand-ownership primitives  

**Today:** none of this is implemented. **This document is a guardrail, not a roadmap commit.**

---

## Current platform snapshot (baseline @ consolidated operational window)

| Area | Today | Username-ready? |
|------|-------|-----------------|
| Public routing | `app/[slug]/page.tsx` — slug-keyed mock landings (`cafe-do-joao`) | Partial — slug exists, not username semantics |
| Demo runtime | `/demo` — 12 vertical mocks, no persistent identity | No |
| Brand model (WIP schema) | `slug`, optional `domain`, `claimStatus`, `socialLinks` (incl. `threads`) | Partial — slug ≠ username; links are strings |
| Brand DNA | Visual/voice contract — tone, colors, CTA | No — presentation layer only |
| Influencer/personal mocks | Display `@handle` strings on feeds | Display only — not canonical identity |
| Auth | None on demo path | No |
| Deep links | External URLs in link blocks; WhatsApp events instrumented | No username routing |
| DB/media WIP (unmerged) | Entity IDs, brand members, claim status enum | Foundation sketch — not live |

**Verdict:** The platform has **slug + social link strings** but **no identity layer** separating display name, routing key, verified external handles, and canonical user/brand identity.

---

## Future impact map

### 1. Routing

| Future need | Implication |
|-------------|-------------|
| `/@username` or `/u/username` public pages | Slug routing may need **alias layer** or migration path from `[slug]` |
| Reserved namespaces | System routes (`/demo`, `/criar`) vs user handles — collision policy required |
| Canonical URL | One primary URL per identity; alternates redirect |
| Vertical vs brand routing | Demo verticals must not collide with production username namespace |

**Risk if ignored now:** Hard-coding slug as the only public key without alias table makes Meta handle binding awkward later.

---

### 2. Identity layer

A future healthy model likely separates:

| Concept | Role |
|---------|------|
| **Internal ID** | Stable UUID — never shown |
| **Display name** | Human label — mutable |
| **Routing username** | Unique, URL-safe, possibly user-chosen |
| **External handles** | Verified links to Meta platforms (`instagram`, `threads`, etc.) |
| **Aliases** | Historical slugs / renamed usernames |

**Today:** mocks collapse name + `@instagram` string into feed UI — fine for demo, **not** a foundation.

---

### 3. Claimed pages

`claimStatus` in landing-schema WIP hints at ownership verification.

Future username identity intersects claimed pages when:

- a Meta page/handle proves brand ownership  
- Social Landing username becomes the **canonical hub** linking verified externals  
- unclaimed vs verified vs disputed states affect public trust badges  

**Do not implement claim flows now.** Preserve enum extensibility in schema design when db-media lands.

---

### 4. Auth / social login

Usernames imply **account holders**. Future auth may use:

- Meta OAuth (IG/FB)  
- phone (WhatsApp-aligned)  
- email fallback  

**Current state:** no auth on `/demo`. **Avoid** baking identity assumptions into Tier 1 runtime before auth foundation exists.

---

### 5. Deep links

| Type | Example | Username role |
|------|---------|---------------|
| In-app | open drawer / vertical | Unrelated short-term |
| Cross-app | `instagram.com/{handle}` | External handle map |
| Owned | `social.landing/@brand` | Routing username |
| WA | `wa.me/...` | Phone ≠ username — mapping layer needed |

Event instrumentation (`whatsapp.clicked`) is compatible — do not conflate phone clicks with username identity.

---

### 6. Brand ownership

Future: one brand entity, many members, one **public username**, many **verified social proofs**.

Decisions to defer:

- username transfer on brand sale  
- multi-brand per user  
- username squatting / reservation  

---

### 7. Profile uniqueness

Global uniqueness is required if username becomes routing identity.

| Scope | Recommendation (future) |
|-------|-------------------------|
| Platform-wide username | Unique index |
| Display `@instagram` | Not unique — verification matters |
| Slug legacy | Redirect or alias |

---

### 8. Social graph

Handles enable:

- follow / discover by username  
- cross-landing references  
- influencer ↔ brand relationships  

**Not relevant** to current demo convergence. **Avoid** coupling drawer/event Tier 1 to graph primitives.

---

### 9. Meta ecosystem integration

Potential integrations (future only):

- Instagram Basic Display / Graph — handle verification  
- Threads profile linkage  
- WhatsApp Business profile ID  
- Meta claimed page metadata  

**Policy sensitivity:** verification must be explicit; never auto-trust string fields in `socialLinks`.

---

### 10. Omnichannel identity

User expectation: **same handle everywhere**.

Social Landing hub could show:

```
@brandname          ← routing username (ours)
Instagram @brandname ← verified external
Threads @brandname   ← verified external
WhatsApp Business   ← verified channel
```

Requires **verification state**, not copy-paste strings in mock feeds.

---

### 11. Public URLs

| Pattern | Fit |
|---------|-----|
| `/[slug]` today | Works for SEO slugs; may coexist as alias |
| `/@handle` | Social-native; Meta-aligned mental model |
| Custom domain | `brandSchema.domain` WIP — CNAME layer above username |

**SEO:** slug remains valuable; username may be primary with slug as redirect — decision deferred.

---

### 12. SEO / discovery

Usernames affect:

- sitemap entries  
- Open Graph `og:url`  
- structured data (`Organization`, `Person`)  
- handle search within platform  

Demo `/demo` should stay **noindex** when production username pages launch.

---

## Core questions answered

### 1. Username should be: display only · routing · canonical · alias?

**Recommended future model (layered — not pick-one):**

| Layer | Answer |
|-------|--------|
| **Canonical identity** | Internal `entityId` (immutable) |
| **Routing identity** | Platform username (unique, URL-safe) — **primary public key** |
| **Display** | Name + avatar — mutable, non-unique |
| **Alias layer** | Legacy slugs, renamed usernames, optional Meta handle mirrors |

**Do not** use display `@instagram` strings as canonical identity.

---

### 2. Future risks

| Risk | Severity |
|------|----------|
| Slug-only routing without alias migration | High |
| Treating mock `@handle` strings as verified identity | High |
| Username collision with system routes | Medium |
| Meta API / policy changes | Medium |
| Squatting, impersonation, trademark disputes | High at scale |
| Merging username + phone (WhatsApp) incorrectly | Medium |
| Premature schema lock before claim/verify model clear | High |
| Over-building identity engine before db-media + auth land | Medium |

---

### 3. Current decisions that could block future

| Decision | Blocker potential |
|----------|-------------------|
| Slug as sole public key with no alias table | Hard rename / Meta bind |
| Social links as free-text only (no verification enum) | Trust / claimed pages |
| Vertical demo IDs leaking into production namespace | Routing collision |
| Brand DNA as only “identity” concept | Confuses visual DNA with social identity |
| Dirty-tree db schema merged without `username` extension point | Migration pain |
| Deep coupling of events to display names vs stable IDs | Already mitigated on personal (`drawerId`) — **apply same discipline to identity** |

**Positive:** Stable technical IDs on drawers/surfaces (`personal:contact`) — **good precedent** for identity layer separation.

---

### 4. Is the system prepared today?

**Partially — intentionally incomplete.**

| Prepared | Not prepared |
|----------|--------------|
| Slug routing prototype | Username uniqueness |
| Schema WIP: `claimStatus`, `socialLinks.threads` | Verification pipeline |
| Stable internal IDs in runtime events | Public identity API |
| `/demo` isolated from production URLs | Auth |
| Brand DNA separation (visual vs identity) | Meta OAuth |

**Honest answer:** Ready for **demo and convergence**; **not ready** for username foundation without db-media + auth + routing design pass.

---

### 5. What NOT to do now

- Implement username registration or routing  
- Add Meta OAuth or Graph integration  
- Create identity engine / reducer for handles  
- Extend Tier 1 runtime for `@mention` UX  
- Build claimed-page verification UI  
- Add username fields to live mock feeds as if production  
- Merge db-media solely to “support usernames”  
- Start influencer migrate **because of** username future  

---

### 6. What to avoid to preserve optionality

| Avoid | Prefer |
|-------|--------|
| Hard-code slug === username | Document both concepts; plan alias |
| Verify nothing — trust UI strings | Keep strings; add verify enum later in schema |
| New public routes without namespace audit | Reserve `@`, `/u/`, system prefixes |
| Identity logic in drawer/composer Tier 1 | Separate identity module when time comes |
| Breaking stable `drawerId` / `surfaceId` pattern | Same pattern for future `identityId` vs `username` |
| Big-bang username launch | Alias redirects + gradual migration |

---

### 7. Should this become real foundation?

**Yes — but as a dedicated phase after operational baseline.**

Not a side feature. A **foundation phase** roughly comprising:

1. Identity schema (entity, username, aliases, external handles, verification)  
2. Auth + claim verification  
3. Public routing + SEO  
4. Meta integration adapter (read-only verify first)  
5. Omnichannel profile UI  

**Depends on:** db-media merged, auth decision, dirty tree hygiene, converge pipeline stable.

---

### 8. Healthy timing

| Phase | When | Identity work |
|-------|------|---------------|
| **Now** | Consolidated operational baseline | **This note only** |
| **Next** | Influencer converge (when authorized) | No username code |
| **After** | db-media + auth foundation | Schema extension design |
| **Then** | Identity foundation RFC (not implement) | 1–2 week design pass |
| **Later** | Username MVP (routing + profile) | After RFC approved |
| **Much later** | Meta verify + claimed pages + graph | Post-MVP |

**Earliest healthy implementation window:** after **db-media on main**, **auth strategy chosen**, and **influencer/institutional stabilization** — not before Q3-style maturity unless product forces earlier scoped MVP.

---

## Relationship to other future foundations

| Foundation | Interaction |
|------------|-------------|
| Brand DNA | Orthogonal — visual/voice; do not merge with username |
| Goal Engine | May consume identity context later — no dependency now |
| db/media WIP | Likely hosts brand/user tables — add username column **in design**, not now |
| QA infrastructure | Identity features will need verify smokes — not yet |
| Meta usernames | External adapter — not core runtime |

---

## Decision log (for future readers)

| Date | Decision |
|------|----------|
| 2026-05-24 | Record note only — no implementation |
| 2026-05-24 | Username future model: layered (entityId + routing username + aliases + verified externals) |
| 2026-05-24 | Do not block current converge/refactor work on identity |

---

## Success criterion (for this note)

- [x] Preserves future optionality  
- [x] No premature lock-in  
- [x] Maps structural impact areas  
- [x] Does not accelerate feature delivery  
- [x] Zero code / schema / runtime changes  

---

## Related documents

- `docs/convergence/NEXT_CONVERGENCE_READINESS.md` — immediate converge gates  
- `docs/audit/OPERATIONAL_HYGIENE_REPORT.md` — operational baseline  
- `lib/landing-schema/zod/brand.schema.ts` (WIP, dirty tree) — slug + claimStatus sketch  
- `lib/brand-dna/dna-types.ts` — visual identity only  

**When implementation is proposed:** open a separate **Identity Foundation RFC** — not an extension of this note.
