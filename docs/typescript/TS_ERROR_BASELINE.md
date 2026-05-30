# TypeScript Error Baseline — Social Landing

**Versão:** 1.5  
**Capturado:** 2026-05-30 (WS-07 refresh)  
**Workstream:** WS-07  
**Comando:** `pnpm exec tsc --noEmit`  
**Total:** **8 erros** em **4 arquivos** (was 10 @ WS-06)

---

## Resumo executivo

| Métrica | WS-06 | WS-07 |
|---------|-------|-------|
| Total de erros | 10 | **8** (−2) |
| Arquivos afetados | 5 | **4** |
| Erros Tier 1 frozen | **0** ✅ | **0** ✅ |
| Erros Stack B feeds | 8 | **6** |
| `institutional-feed.tsx` | 2 | **0** ✅ |
| `influencer-feed.tsx` | 0 | **0** ✅ |

**Conclusão:** Institutional migrado para ActionDrawer; erros TS da vertical zerados. Influencer intacto.

---

## WS-07 — correções aplicadas

| Arquivo | Erros antes | Erros depois | Ação |
|---------|-------------|--------------|------|
| `components/business/institutional/institutional-feed.tsx` | 2 | **0** | ActionDrawer migration; `BusinessConfig`; `BusinessPost` mapping |

---

## WS-06 — correções aplicadas

| Arquivo | Erros antes | Erros depois | Ação |
|---------|-------------|--------------|------|
| `components/business/influencer/influencer-feed.tsx` | 6 | **0** | ActionDrawer migration; `BusinessConfig`; `BusinessPost` mapping |

---

## WS-05.5c — correções aplicadas

| Arquivo | Erros antes | Erros depois | Ação |
|---------|-------------|--------------|------|
| `lib/mock-data/business-content.ts` | 7 | **0** | `social` obrigatório; `image`/`description`; casts removidos; `thumbnail`/`socialPosts` legacy preservados |
| `lib/mock-data/professionals-data.ts` | 5 | **0** | `model: "professionals"`; `priceRange`/`includes`; tipo local `ProfessionalServiceMock` |
| `lib/mock-data/gym-data.ts` | 1 | **0** | `model: "gym"` |

---

## Classificação por risco

### Tier 1 critical — intolerável

| Path | Erros |
|------|-------|
| ActionDrawer / morph / composer / instrumentation | **0** ✅ |

---

### Safe legacy — utilitários

| Arquivo | Erros |
|---------|-------|
| `components/business/appointment-calendar.tsx` | 2 |

---

### Experimental — Stack B feeds

| Arquivo | Erros | WS futuro |
|---------|-------|-----------|
| `components/business/influencer/influencer-feed.tsx` | 0 | WS-06 ✅ |
| `components/business/gym/gym-feed.tsx` | 3 | Stack B |
| `components/business/institutional/institutional-feed.tsx` | 2 | WS-07 |
| `components/business/personal/personal-feed.tsx` | 2 | Stack B |
| `components/business/professionals/professionals-feed.tsx` | 1 | Stack B |

---

## Error budget

Machine baseline: [`scripts/typescript/ts-error-baseline.json`](../../scripts/typescript/ts-error-baseline.json) — **10 fingerprints**

Gate: `pnpm ts:budget`

---

## Referências

- [`TS_GATES.md`](TS_GATES.md)
- [`TS_HARDENING_PLAN.md`](TS_HARDENING_PLAN.md)
