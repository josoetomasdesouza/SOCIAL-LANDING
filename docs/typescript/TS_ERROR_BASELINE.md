# TypeScript Error Baseline — Social Landing

**Versão:** 1.0  
**Capturado:** 2026-05-24  
**Workstream:** WS-05  
**Comando:** `pnpm exec tsc --noEmit`  
**Total:** **91 erros** em **15 arquivos**

---

## Resumo executivo

| Métrica | Valor |
|---------|-------|
| Total de erros | 91 |
| Arquivos afetados | 15 |
| Erros Tier 1 frozen | **0** ✅ |
| Erros runtime critical | 12 |
| Erros safe legacy | 55 |
| Erros experimental (Stack B) | 24 |

**Conclusão:** TypeScript debt está **concentrado em mock data e verticais Stack B**, não no runtime Tier 1 convergido.

---

## Classificação por risco

### Tier 1 critical — intolerável

Paths congelados em [`FREEZE_ZONES.md`](../os/FREEZE_ZONES.md):

| Path | Erros |
|------|-------|
| `components/business/action-drawer.tsx` | 0 |
| `components/business/post-to-chat-morph-layer.tsx` | 0 |
| `components/business/business-social-landing.tsx` | 0 |
| `components/business/conversational-ai.tsx` | 0 |
| `lib/ui/composer-scroll-clearance.ts` | 0 |
| `lib/ui/use-drawer-sheet-drag.ts` | 0 |
| `components/business/appointment/appointment-feed.tsx` | 0 |
| `lib/events/instrumentation.ts` | 0 |

**Status:** ✅ Nenhum erro TS nos paths Tier 1 documentados.

---

### Runtime critical — shared contracts

| Arquivo | Erros | Códigos principais | Risco |
|---------|-------|-------------------|-------|
| `lib/business-types.ts` | 9 | TS2687, TS2717, TS2561 | Contratos duplicados/inconsistentes (`crm`, `logo`, `availability`, `duration`) |
| `lib/rules/rule-registry.ts` | 3 | TS2322 | Generics `RuleDefinition<T>` vs `unknown` |

**Impacto:** Pode afetar múltiplas verticais; fixes devem ser **localizados e add-only** quando possível.

---

### Safe legacy — mock data + utilitários periféricos

| Arquivo | Erros | Notas |
|---------|-------|-------|
| `lib/mock-data/realestate-data.ts` | 20 | Schema drift vs `Property`, `PropertyFeatures` |
| `lib/mock-data/events-data.ts` | 12 | Tipos `Artist`, boolean vs number |
| `lib/mock-data/health-data.ts` | 8 | `HealthProfessional` / `HealthService` incompletos |
| `lib/mock-data/business-content.ts` | 7 | `thumbnail`, `socialPosts`, casts `BusinessPost[]` |
| `lib/mock-data/professionals-data.ts` | 5 | `BusinessModel`, `price` em services |
| `lib/mock-data/gym-data.ts` | 1 | `"fitness"` vs `BusinessModel` |
| `components/business/appointment-calendar.tsx` | 2 | TS7006 implicit `any` |

**Impacto:** Runtime funciona via `ignoreBuildErrors`; erros são **dívida de contrato**, não bugs perceptivos conhecidos.

---

### Experimental — Stack B feeds (migration targets)

| Arquivo | Erros | WS futuro |
|---------|-------|-----------|
| `components/business/realestate/realestate-feed.tsx` | 9 | WS-03 parity |
| `components/business/influencer/influencer-feed.tsx` | 6 | WS-06 |
| `components/business/gym/gym-feed.tsx` | 3 | Stack B |
| `components/business/institutional/institutional-feed.tsx` | 2 | WS-07 |
| `components/business/personal/personal-feed.tsx` | 2 | Stack B |
| `components/business/professionals/professionals-feed.tsx` | 2 | Stack B |

**Padrão dominante:** `BusinessConfig` incompleto, `BusinessSection.type: "custom"` não no union, propriedades mock ausentes nos tipos.

---

## Distribuição por código TS

| Código | Count | Significado |
|--------|-------|-------------|
| TS2322 | 24 | Type not assignable |
| TS2339 | 13 | Property does not exist |
| TS2741 | 13 | Property missing in type |
| TS2739 | 13 | Type missing properties |
| TS2352 | 4 | Conversion may be mistake |
| TS2353 | 4 | Unknown object properties |
| TS2687 | 4 | Modifier mismatch (declarations) |
| TS2717 | 4 | Subsequent property type mismatch |
| TS2740 | 3 | Type missing properties (object) |
| TS7006 | 3 | Implicit any |
| TS2551 | 3 | Property typo (`popular` vs `isPopular`) |
| TS2561 | 1 | Unknown property in literal |
| TS2820 | 1 | Type literal mismatch |
| TS18048 | 1 | Possibly undefined |

---

## Error budget (machine baseline)

Fingerprints versionados em:

[`scripts/typescript/ts-error-baseline.json`](../../scripts/typescript/ts-error-baseline.json)

Gate CI: `pnpm ts:budget` — bloqueia novos fingerprints, não exige zero.

---

## Tier 1 vs não-Tier-1

```
Tier 1 frozen     ████████████████████  0 erros  (0%)
Runtime critical  ██                    12 erros (13%)
Safe legacy       ███████████           55 erros (60%)
Experimental      █████                 24 erros (26%)
```

---

## Referências

- [`TS_GATES.md`](TS_GATES.md)
- [`TS_HARDENING_PLAN.md`](TS_HARDENING_PLAN.md)
- [`docs/runtime/TIER1_BASELINE.md`](../runtime/TIER1_BASELINE.md)
