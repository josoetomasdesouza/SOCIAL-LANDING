# TypeScript Hardening — Social Landing

**Workstream:** WS-05 (+ WS-05.5 stabilization)  
**Autoridade:** [`TS_GATES.md`](TS_GATES.md)  
**Baseline:** [`TS_ERROR_BASELINE.md`](TS_ERROR_BASELINE.md)  
**Plano:** [`TS_HARDENING_PLAN.md`](TS_HARDENING_PLAN.md)

---

## Princípio

> O objetivo inicial **não é zero erros**. É **não piorar**.

Este pacote documenta o estado TypeScript pós-convergência runtime e institucionaliza um **error budget** incremental.

---

## Comandos

| Comando | Propósito |
|---------|-----------|
| `pnpm run typecheck` | `tsc --noEmit` completo (91 erros baseline — informativo) |
| `pnpm ts:budget` | Gate CI — bloqueia **novos** erros |
| `pnpm ts:baseline:refresh` | Regenera baseline (somente após redução intencional) |

---

## Relação com CI

Workflow [`qa-minimum.yml`](../../.github/workflows/qa-minimum.yml):

1. `pnpm ts:budget` — error budget
2. `pnpm run build` — production build
3. `pnpm qa:events` — protocolo perceptivo 8/8

---

## Zonas congeladas

Erros em paths Tier 1 frozen são **intoleráveis**. Ver [`FREEZE_ZONES.md`](../os/FREEZE_ZONES.md).

Baseline atual: **0 erros Tier 1** ✅
