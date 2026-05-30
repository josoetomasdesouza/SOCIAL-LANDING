# TypeScript Error Baseline — Social Landing

**Versão:** 2.0  
**Capturado:** 2026-05-30 (WS-07.6 refresh)  
**Workstream:** WS-07.6  
**Comando:** `pnpm exec tsc --noEmit`  
**Total:** **0 erros**

---

## Resumo executivo

| Métrica | WS-07 | WS-07.6 |
|---------|-------|---------|
| Total de erros | 8 | **0** ✅ |
| Arquivos afetados | 4 | **0** |
| Erros Tier 1 frozen | **0** ✅ | **0** ✅ |
| `ignoreBuildErrors` | `true` | **`false`** ✅ |

**Conclusão:** Baseline zerado. Build strict passa com typecheck ativo.

---

## WS-07.6 — correções aplicadas

| Arquivo | Erros antes | Erros depois | Ação |
|---------|-------------|--------------|------|
| `components/business/gym/gym-feed.tsx` | 3 | **0** | `plan.popular` → `plan.isPopular` (alinha mock + tipo) |
| `components/business/personal/personal-feed.tsx` | 2 | **0** | `BusinessConfig`; `BusinessSection[]`; `type: "specific"` |
| `components/business/professionals/professionals-feed.tsx` | 1 | **0** | Exibir `priceRange` (campo canônico do tipo) |
| `components/business/appointment-calendar.tsx` | 2 | **0** | Cast `DayAvailability[]`; slots tipados como `TimeSlot[]` |

---

## WS-07 — correções aplicadas

| Arquivo | Erros antes | Erros depois | Ação |
|---------|-------------|--------------|------|
| `components/business/institutional/institutional-feed.tsx` | 2 | **0** | ActionDrawer migration; `BusinessConfig`; `BusinessPost` mapping |

---

## `ignoreBuildErrors` — decisão WS-07.6

| Teste | Resultado |
|-------|-----------|
| `pnpm exec tsc --noEmit` | **0 erros** |
| `pnpm run build` com `ignoreBuildErrors: false` | **PASS** (TypeScript step runs) |

**Decisão:** `ignoreBuildErrors` **removido** (`false`) em `next.config.mjs`.

Nenhum bloqueio adicional identificado para typecheck strict no build.

---

## Histórico de redução

| Workstream | Total |
|------------|-------|
| WS-05 (inicial) | 91 |
| WS-05.5a | 71 |
| WS-05.5b | 30 |
| WS-05.5c | 16 |
| WS-06 | 10 |
| WS-07 | 8 |
| **WS-07.6** | **0** |

---

## Related

- [`TS_GATES.md`](./TS_GATES.md)  
- [`TS_HARDENING_PLAN.md`](./TS_HARDENING_PLAN.md)  
- [`scripts/typescript/ts-error-baseline.json`](../../scripts/typescript/ts-error-baseline.json)
