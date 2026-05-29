# TypeScript Gates — Social Landing

**Versão:** 1.0  
**Data:** 2026-05-24  
**Workstream:** WS-05

---

## Propósito

Definir o que **bloqueia merge**, o que é **warning**, e o que é **tolerado temporariamente** — sem exigir zero erros TypeScript.

---

## Gates de merge (CI)

| Gate | Comando | Bloqueia? | WS |
|------|---------|-----------|-----|
| Production build | `pnpm run build` | ✅ Sim | WS-04 |
| Global event protocol | `pnpm qa:events` | ✅ Sim | WS-04 |
| **TypeScript error budget** | `pnpm ts:budget` | ✅ Sim | **WS-05** |
| TypeScript zero-errors | `pnpm run typecheck` | ❌ **Não** | WS-05.5+ |
| ESLint | `pnpm lint` | ❌ Não | Futuro |

Workflow: [`.github/workflows/qa-minimum.yml`](../../.github/workflows/qa-minimum.yml)

---

## Error budget (política WS-05)

| Regra | Comportamento |
|-------|---------------|
| Erros no baseline | ✅ Tolerados |
| **Novos** erros (fingerprint não listado) | ❌ **Bloqueia merge** |
| Total de erros **aumenta** | ❌ **Bloqueia merge** |
| Erros **corrigidos** (total diminui) | ✅ Passa — refresh baseline em PR dedicado |

Baseline machine-readable: [`scripts/typescript/ts-error-baseline.json`](../../scripts/typescript/ts-error-baseline.json)

---

## Classificação de severidade

| Classe | Merge policy | Ação |
|--------|--------------|------|
| **Tier 1 frozen** | ❌ Intolerável (0 permitido) | Fix imediato; GO humano se runtime |
| **Runtime critical** | ⚠️ Baseline tolerado; novos bloqueados | Reduzir em PRs cirúrgicos |
| **Safe legacy** | Tolerado no baseline | Reduzir quando mock/types alinharem |
| **Experimental (Stack B)** | Tolerado no baseline | Corrigir durante WS-06/07 migration |
| **Third-party / noise** | `skipLibCheck` | Monitorar upgrades |

---

## Warnings (não bloqueiam)

| Item | Status | Notas |
|------|--------|-------|
| `ignoreBuildErrors: true` | ⚠️ Ativo | Build passa com erros TS; remoção incremental WS-05.5+ |
| 91 erros baseline | ⚠️ Documentado | Não bloqueia enquanto no budget |
| `pnpm run typecheck` exit 2 | ℹ️ Esperado | Informativo local/audit |

---

## O que este PR **não** faz

- ❌ Não remove `ignoreBuildErrors`
- ❌ Não exige `tsc` zero-errors
- ❌ Não refatora runtime Tier 1
- ❌ Não altera UX perceptiva

---

## Atualizar baseline (procedimento)

Somente quando erros foram **corrigidos intencionalmente**:

```bash
pnpm ts:baseline:refresh
git add scripts/typescript/ts-error-baseline.json
```

PR de redução deve incluir classificação no corpo e **não** misturar refactors amplos.

---

## Referências

- [`TS_ERROR_BASELINE.md`](TS_ERROR_BASELINE.md)
- [`TS_HARDENING_PLAN.md`](TS_HARDENING_PLAN.md)
- [`VALIDATION_PROTOCOL.md`](../os/VALIDATION_PROTOCOL.md)
