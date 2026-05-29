# TypeScript Error Baseline — Social Landing

**Versão:** 1.3  
**Capturado:** 2026-05-24 (WS-05.5c refresh)  
**Workstream:** WS-05.5c  
**Comando:** `pnpm exec tsc --noEmit`  
**Total:** **16 erros** em **6 arquivos** (was 30 @ WS-05.5b)

---

## Resumo executivo

| Métrica | WS-05 | WS-05.5A | WS-05.5b | WS-05.5c |
|---------|-------|----------|----------|----------|
| Total de erros | 91 | 71 | 30 | **16** (−14) |
| Arquivos afetados | 15 | 12 | 10 | **6** |
| Erros Tier 1 frozen | 0 | **0** ✅ | **0** ✅ | **0** ✅ |
| Erros runtime critical | 12 | **0** ✅ | **0** ✅ | **0** ✅ |
| Erros safe legacy | 55 | 45 | 14 | **2** |
| Erros experimental (Stack B) | 24 | 26 | 16 | **14** |

**Conclusão:** Safe legacy mock cleanup concluído. Dívida restante = Stack B feeds (14) + `appointment-calendar` (2).

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
| `components/business/influencer/influencer-feed.tsx` | 6 | WS-06 |
| `components/business/gym/gym-feed.tsx` | 3 | Stack B |
| `components/business/institutional/institutional-feed.tsx` | 2 | WS-07 |
| `components/business/personal/personal-feed.tsx` | 2 | Stack B |
| `components/business/professionals/professionals-feed.tsx` | 1 | Stack B |

---

## Error budget

Machine baseline: [`scripts/typescript/ts-error-baseline.json`](../../scripts/typescript/ts-error-baseline.json) — **16 fingerprints**

Gate: `pnpm ts:budget`

---

## Referências

- [`TS_GATES.md`](TS_GATES.md)
- [`TS_HARDENING_PLAN.md`](TS_HARDENING_PLAN.md)
