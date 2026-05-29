# TypeScript Error Baseline — Social Landing

**Versão:** 1.2  
**Capturado:** 2026-05-24 (WS-05.5b refresh)  
**Workstream:** WS-05.5b  
**Comando:** `pnpm exec tsc --noEmit`  
**Total:** **30 erros** em **10 arquivos** (was 71 @ WS-05.5A)

---

## Resumo executivo

| Métrica | WS-05 | WS-05.5A | WS-05.5b |
|---------|-------|----------|----------|
| Total de erros | 91 | **71** | **30** (−41) |
| Arquivos afetados | 15 | 12 | **10** |
| Erros Tier 1 frozen | 0 | **0** ✅ | **0** ✅ |
| Erros runtime critical | 12 | **0** ✅ | **0** ✅ |
| Erros safe legacy | 55 | 45 | **14** |
| Erros experimental (Stack B) | 24 | 26 | **16** |

**Conclusão:** Mock data realestate/events alinhados aos contratos. Dívida restante em mock auxiliar + Stack B feeds — fora do escopo WS-05.5b.

---

## WS-05.5b — correções aplicadas

| Arquivo | Erros antes | Erros depois | Ação |
|---------|-------------|--------------|------|
| `lib/mock-data/realestate-data.ts` | 20 | **0** | `type`/`propertyType`, `features`/`amenities`, agent/address completos; flat legacy fields para feeds |
| `lib/mock-data/events-data.ts` | 12 | **0** | `title`, `venue`, `TicketType` numérico, `Artist[]`, campos obrigatórios |
| `lib/business-types.ts` | 0 | **0** | Optional legacy flat fields em `Property` (feed compat, sem editar Stack B) |
| `components/business/realestate/realestate-feed.tsx` | 9 | **0** | Resolvido indiretamente via `Property` legacy fields |

---

## WS-05.5A — correções aplicadas (PR #58)

| Arquivo | Erros antes | Erros depois | Ação |
|---------|-------------|--------------|------|
| `lib/business-types.ts` | 9 | **0** | Unificar interfaces duplicadas; corrigir `BUSINESS_MODEL_CONFIG` keys |
| `lib/rules/rule-registry.ts` | 3 | **0** | Return type `RuleDefinition<unknown>[]` com cast seguro |
| `lib/mock-data/health-data.ts` | 8 | **0** | Resolvido indiretamente via contratos unificados |

---

## Classificação por risco

### Tier 1 critical — intolerável

| Path | Erros |
|------|-------|
| ActionDrawer / morph / composer / instrumentation | **0** ✅ |

---

### Runtime critical — shared contracts

| Arquivo | Erros |
|---------|-------|
| `lib/business-types.ts` | **0** ✅ |
| `lib/rules/rule-registry.ts` | **0** ✅ |

---

### Safe legacy — mock data + utilitários

| Arquivo | Erros |
|---------|-------|
| `lib/mock-data/business-content.ts` | 7 |
| `lib/mock-data/professionals-data.ts` | 5 |
| `lib/mock-data/gym-data.ts` | 1 |
| `components/business/appointment-calendar.tsx` | 2 |

---

### Experimental — Stack B feeds

| Arquivo | Erros | WS futuro |
|---------|-------|-----------|
| `components/business/influencer/influencer-feed.tsx` | 6 | WS-06 |
| `components/business/gym/gym-feed.tsx` | 3 | Stack B |
| `components/business/institutional/institutional-feed.tsx` | 2 | WS-07 |
| `components/business/personal/personal-feed.tsx` | 2 | Stack B |
| `components/business/professionals/professionals-feed.tsx` | 2 | Stack B |

---

## Error budget

Machine baseline: [`scripts/typescript/ts-error-baseline.json`](../../scripts/typescript/ts-error-baseline.json) — **30 fingerprints**

Gate: `pnpm ts:budget`

---

## Referências

- [`TS_GATES.md`](TS_GATES.md)
- [`TS_HARDENING_PLAN.md`](TS_HARDENING_PLAN.md)
