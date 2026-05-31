# Era 3 — Cognitive Baseline Snapshot

**Date:** 2026-05-31  
**Merge commit:** `ca00dc7` (PR #73 — WS-08C Appointment AI Resolver)  
**Status:** ✅ **Consolidada** — baseline cognitivo oficial antes da auditoria estratégica

> **Mapa de eras (projeto):** Este marco fecha o milestone **Era 5 — Multi-Vertical AI** (`MASTER_ROADMAP.md`) com 4 resolvers oficiais + harness. Nomenclatura **Era 3** = camada cognitiva governada da plataforma.

---

## 1. Baseline consolidada

| Pilar | Estado |
|-------|--------|
| Runtime Tier 1 | ✅ Intacto (`conversational-ai`, `business-social-landing`, composer, drawer) |
| AI resolvers | ✅ 4 verticais oficiais |
| Regression harness | ✅ `pnpm qa:ai-regression` 26/26 |
| AI governance | ✅ Constitution, failure modes, observation matrix, regression rules |
| Semi-stateful path | ✅ Appointment (session-local only; no persistência real) |

---

## 2. Verticais AI oficiais

| Vertical | Resolver | QA | Harness |
|----------|----------|-----|---------|
| E-commerce | `ecommerceMockConversationResolver` (frozen) | observation | EC-01–06 |
| Restaurant | `restaurantMockConversationResolver` | `qa:restaurant` 6/6 | RS-01–06 |
| Health | `healthMockConversationResolver` | `qa:health` 7/7 | HL-01–06 |
| Appointment | `appointmentMockConversationResolver` | `qa:appointment` 8/8 | AP-01–07 |

---

## 3. Gates oficiais (main @ `ca00dc7`)

| Gate | Resultado |
|------|-----------|
| `pnpm ts:budget` | 0/0 |
| `pnpm exec tsc --noEmit` | 0 erros |
| `pnpm run build` | PASS strict |
| `pnpm qa:events` | 8/8 |
| `pnpm qa:restaurant` | 6/6 |
| `pnpm qa:health` | 7/7 |
| `pnpm qa:appointment` | 8/8 |
| `pnpm qa:ai-regression` | 26/26 PASS |

---

## 4. Invariantes perceptivos confirmados

| Invariante | Evidência |
|------------|-----------|
| Context reset pós-reload | AP-06 harness + `qa:appointment` step 7 |
| `Confirmar agendamento` só via drawer | CTA ausente em `conversational-ai.tsx` e visual blocks; presente apenas em `BarberDetailsDrawer` footer |
| Fallback editorial | EC/RS/HL/AP-05 sem visual blocks de resolver |
| Sem regressão cross-vertical | Harness isolado por vertical + `localStorage` clear |

---

## 5. Workstreams fechados (WS-08 arc)

| WS | Commit | PR |
|----|--------|-----|
| WS-08A Restaurant | `4f1f57f` | #67 |
| WS-08B Health | `41b4ff7` | #68 |
| WS-08.5 Governance | `9bc2a6c` | #69 |
| WS-08.6 Runtime Snapshot | `d229970` | #70 |
| WS-08.7 Observation | `3eab7c1` | #71 |
| WS-08.8 Regression Harness | `ecc93dc` | #72 |
| WS-08C Appointment | `ca00dc7` | #73 |

---

## 6. Próximo passo autorizado

**GO explícito** para iniciar **auditoria cognitiva profunda — Hero Google-like**.

**Não autorizado neste gate:**
- Nova vertical AI
- Alterações runtime Tier 1
- Início de implementação pós-auditoria (aguardar GO humano pós-relatório)

---

## Related

- [`WORKSTREAMS.md`](../os/WORKSTREAMS.md)
- [`AI_RESOLVER_CONSTITUTION.md`](../ai/AI_RESOLVER_CONSTITUTION.md)
- [`AI_CANONICAL_FLOWS.md`](../ai/AI_CANONICAL_FLOWS.md)
- [`WS-08C_APPOINTMENT_AI_REPORT.md`](./WS-08C_APPOINTMENT_AI_REPORT.md)
