# WS-08C — Appointment AI Resolver — Report

**Date:** 2026-05-31  
**Base main:** `ecc93dc` (WS-08.8 merged — PR #72)  
**Branch:** `workstream/ai-resolver-appointment`  
**Type:** First semi-stateful vertical resolver (session-local only)

---

## Summary

| Item | Result |
|------|--------|
| Isolated resolver | ✅ `appointment-conversational-search.ts` |
| Visual blocks | ✅ results + schedule prompt |
| Feed wiring | ✅ `appointment-feed.tsx` (no Tier 1 core) |
| `pnpm qa:appointment` | ✅ 8/8 |
| Harness AP-* flows | ✅ 7/7 + 26/26 global |
| Runtime Tier 1 | ✅ Untouched |

**Recommendation:** **GO WITH NOTES** — semi-stateful path validated; monitor context continuity in human review.

---

## Intents implemented

| Intent | Example | Behavior |
|--------|---------|----------|
| Guided recommendation | `preciso cortar o cabelo` | Popular services + top barbers (≤3) |
| Service lookup | `degrade` | Service card + matching barbers |
| Barber specialty | keywords / style context | Filtered barber cards |
| Context follow-up | barber chip + `quais servicos?` | Related services for barber |
| Period refinement | barber chip + `tem algo a tarde?` | Soft schedule prompt (no rigid form) |
| Alternate professional | `e outro profissional?` | Other barbers excluding context |
| Soft schedule | `quero agendar` + barber context | `Ver horarios com {name}` → calendar drawer |
| Fallback | `voces tem estacionamento` | Mock editorial reply; no booking block |

---

## Context continuity analysis

| Mechanism | Scope | Reset trigger |
|-----------|-------|---------------|
| Composer chips | Current vertical session | Vertical reload / feed unmount |
| Resolver input | `contextItems` only | Chip removal / reload |
| Booking drawer state | React state in feed | `bookingStep = null`, vertical change |
| Conversation history | `localStorage` per brand | Cleared in QA; not used for booking intent |

**Observed risk (S2):** Multi-turn refinement within one session can stack chips — acceptable for demo; no cross-vertical leak (harness AP-06 passes).

**Observed strength:** Schedule CTA opens existing `BarberDetailsDrawer` — no duplicate booking surface; no real confirmation from AI path.

---

## Cognitive risks observed

| Risk | Severity | Mitigation |
|------|----------|------------|
| Chatbot booking tone | S2 | Editorial copy; CTA = "Ver horarios" not "Confirmar" |
| CRM/form feel | S2 | Cards mirror feed aesthetic; no field collection in composer |
| Context stale after reload | S1 | Harness AP-06 + `openVertical` localStorage clear |
| Period refinement without barber | S2 | Falls back to barber list, not false precision |
| Semi-stateful drawer + composer | S2 | Composer `hidden` on datetime step (existing pattern) |

---

## Validation matrix

| Gate | Result |
|------|--------|
| `pnpm ts:budget` | 0/0 |
| `pnpm exec tsc --noEmit` | 0 errors |
| `pnpm run build` | PASS |
| `pnpm qa:events` | 8/8 |
| `pnpm qa:restaurant` | 6/6 |
| `pnpm qa:health` | 7/7 |
| `pnpm qa:ai-regression` | 26/26 |
| `pnpm qa:appointment` | 8/8 |
| `pnpm qa:ai-observation` | PASS |

---

## Files added/changed

| File | Purpose |
|------|---------|
| `lib/mock-data/appointment-conversational-search.ts` | Resolver |
| `components/business/appointment/appointment-conversation-results-block.tsx` | Results UI |
| `components/business/appointment/appointment-conversational-visual-block.tsx` | Block renderer |
| `components/business/appointment/appointment-feed.tsx` | Wire + profissionais row |
| `scripts/convergence/appointment-ai-resolver-validation.mjs` | Vertical QA |
| `scripts/qa/fixtures/ai-canonical-flows.json` | AP-01–07 |
| `package.json` | `qa:appointment` |

---

## GO WITH NOTES — human follow-up

1. Manual pass: composer tone during multi-turn barber → period → schedule (checklist B2).
2. Confirm drawer `Confirmar agendamento` remains user-initiated only (not AI-triggered).
3. Next workstream: extend `qa:ai-observation` to include appointment when observation matrix is updated.

---

## Recommendation

**GO** — Era 3 cognitive baseline consolidated on main @ `ca00dc7`.

**GO explícito** para iniciar auditoria cognitiva profunda (Hero Google-like).

See: [`ERA3_COGNITIVE_BASELINE_SNAPSHOT.md`](./ERA3_COGNITIVE_BASELINE_SNAPSHOT.md)
