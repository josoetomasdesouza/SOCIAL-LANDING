# WS-08B — Health AI Resolver — Validation Report

**Date:** 2026-05-24  
**Base main:** `4f1f57f` (WS-08A merged — PR #67)  
**Branch:** `workstream/ai-resolver-health`  
**Pattern:** Isolated resolver mirroring WS-08A restaurant wiring; **no** changes to `ecommerceMockConversationResolver` or restaurant resolver

---

## Summary

| Item | Result |
|------|--------|
| Health resolver isolated | ✅ `health-conversational-search.ts` |
| Visual blocks (results + schedule) | ✅ |
| `ecommerceMockConversationResolver` | ✅ untouched |
| Restaurant resolver | ✅ untouched |
| Tier 1 frozen | ✅ 0 errors |
| `pnpm ts:budget` | ✅ 0/0 |
| `pnpm exec tsc --noEmit` | ✅ 0 |
| `pnpm run build` | ✅ strict |
| `pnpm qa:events` | ✅ 8/8 |
| `pnpm qa:health` | ✅ 7/7 |

**Recommendation:** **GO WITH NOTES**

---

## Perceptual — before / after

| Aspect | Before WS-08B | After WS-08B |
|--------|---------------|--------------|
| Health composer replies | Generic mock text only | Editorial replies + inline care cards |
| Specialty discovery | Feed scroll only | "dermatologista", "nutricionista", etc. → professional cards |
| Service/procedure | N/A | "limpeza de pele", "botox" → service + linked professional |
| Guided recommendation | N/A | "melhorar minha pele" → dermatology path without triage tone |
| Professional context | N/A | Selected pro + "atende o quê?" → related services |
| Scheduling | Drawer via feed tap only | Composer CTA opens existing appointment drawer (no real booking) |
| Clinical safety | N/A | Copy avoids diagnosis, triage, or outcome promises |

---

## Files changed

| File | Change |
|------|--------|
| `lib/mock-data/health-conversational-search.ts` | New isolated resolver + visual block kinds |
| `lib/mock-data/health-data.ts` | Nutritionist, psychologist, aesthetic services, pricing fields |
| `components/business/health/health-conversation-results-block.tsx` | Composer care cards |
| `components/business/health/health-conversational-visual-block.tsx` | Visual block renderer factory |
| `components/business/health/health-feed.tsx` | Wire resolver + renderer + scheduling callbacks |
| `scripts/convergence/health-ai-resolver-validation.mjs` | Vertical QA |
| `package.json` | `qa:health` |
| `docs/os/WORKSTREAMS.md` | WS-08A ✅, WS-08B status |

**Not changed:** `conversational-search.ts`, `restaurant-conversational-search.ts`, `ecommerce-feed.tsx`, `restaurant-feed.tsx`, ActionDrawer/morph/composer/instrumentation cores.

---

## Supported intents

| Intent | Example prompt | Response |
|--------|----------------|----------|
| Specialty search | "dermatologista", "nutricionista", "psicóloga" | Professionals filtered by specialty |
| Service/procedure | "limpeza de pele", "botox", "consulta" | Service card + linked professional when available |
| Guided recommendation | "quero melhorar minha pele", "cuidar da alimentação" | Editorial copy + professionals/services (no triage) |
| Professional context | Pro in context + "esse profissional atende o quê?" | Related services for that professional |
| Soft scheduling | "quero agendar consulta" | Schedule CTA → existing `ProfessionalDrawer` |

---

## Drawer / scheduling flows

| Flow | Trigger | Action |
|------|---------|--------|
| Open professional drawer | Tap professional card in composer | `setProfessionalDrawerOpen(true)` |
| Open from service | Tap service card | Opens linked professional drawer |
| Schedule CTA (context) | Schedule prompt block with selected pro | Opens that professional's drawer |
| Schedule CTA (generic) | "Agendar" on results without context | Opens professional drawer |
| Real booking | Confirm in drawer | Existing mock confirmation flow (unchanged) |

---

## Residual risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Keyword overlap (e.g. "ansiedade") could feel clinical | Low | Copy always defers to consultation; no diagnosis language |
| Mock data limited specialties vs. UI chips (Ortopedia, Pediatria) | Low | Resolver maps UI specialty context slugs; no professionals for those yet — returns empty gracefully |
| Long-press context in QA is timing-sensitive | Low | QA uses 500ms pointer hold; manual smoke recommended |
| `healthProfessionals.slice(0,3)` in feed hides new pros | Low | Resolver searches full list; feed display unchanged by design |

---

## Notes (GO WITH NOTES)

1. **Feed vs. resolver parity:** Feed still shows 3 professionals; resolver searches all 5 — intentional to limit feed scope.
2. **Aesthetic keywords:** "botox" maps to "Avaliação Estética Facial" with consultation-first copy — not a procedure booking.
3. **Next vertical:** appointment AI resolver (WS-08C or WS-08 continuation) should follow same isolated pattern.

---

## Recommendation

**GO WITH NOTES** — Health vertical has isolated conversational resolver, perceptual guardrails in copy, full gate green, and zero cross-contamination with ecommerce/restaurant resolvers. Residual risks are mock-data and UX polish, not architectural.
