# TypeScript Hardening Plan — Social Landing

**Versão:** 1.0  
**Data:** 2026-05-24  
**Workstream:** WS-05 (gate) → WS-05.5 (stabilization) → WS-06+

---

## Objetivo real

> Criar **confiança progressiva** sem quebrar Tier 1.

**Não é:** zerar TypeScript, ligar strict total, refatorar tipos, cleanup geral.

**É:** mapear → classificar → isolar → gate incremental → reduzir gradualmente.

---

## Estado atual

| Item | Valor |
|------|-------|
| `strict: true` | ✅ `tsconfig.json` |
| `ignoreBuildErrors` | ⚠️ `true` em `next.config.mjs` — **mantido neste WS** |
| Erros baseline | 91 |
| Erros Tier 1 | 0 |
| CI gate | `pnpm ts:budget` (novos erros bloqueados) |

---

## Fases

### Fase 1 — WS-05 (este PR) ✅

| Etapa | Entrega |
|-------|---------|
| 1. Descobrir | `tsc --noEmit` → 91 erros catalogados |
| 2. Classificar | [`TS_ERROR_BASELINE.md`](TS_ERROR_BASELINE.md) |
| 3. Separar Tier 1 | 0 erros frozen — confirmado |
| 4. Baseline | `ts-error-baseline.json` |
| 5. Impedir novos | `pnpm ts:budget` no CI |
| 6. Reduzir | **Fora de escopo deste PR** |

---

### Fase 2 — WS-05.5 Stabilization (próximo mini-ciclo)

**Por quê:** TS revela contratos ruins, acoplamentos invisíveis e inconsistências entre verticais. Gate incremental sozinho não reduz dívida.

| Ordem | Alvo | Erros ~ | Risco | Estratégia |
|-------|------|---------|-------|------------|
| 1 | `lib/business-types.ts` | 9 | Médio | Unificar declarações duplicadas; **sem** alterar runtime behavior |
| 2 | `lib/rules/rule-registry.ts` | 3 | Baixo | Fix generics localizado |
| 3 | Mock data por vertical | 55 | Baixo | PRs isolados por arquivo mock |
| 4 | Stack B feeds | 24 | Médio | Alinhar com WS-06/07 migrations |

**Gate de saída WS-05.5:** baseline ≤ 50 erros OU `ignoreBuildErrors` removido com build verde.

---

### Fase 3 — Remoção de `ignoreBuildErrors`

**Pré-requisitos (todos obrigatórios):**

- [ ] Baseline ≤ threshold acordado (sugestão: ≤ 20 erros)
- [ ] 0 erros Tier 1 frozen (já atendido)
- [ ] `pnpm ts:budget` verde por 2 semanas na main
- [ ] `pnpm qa:events` 8/8 estável pós-remoção

**Procedimento:**

1. PR isolado: `ignoreBuildErrors: false`
2. Corrigir apenas erros que emergirem no build (não preemptive cleanup)
3. Re-run full validation record

**Não fazer neste WS-05.**

---

## Áreas congeladas (não tocar sem GO)

De [`FREEZE_ZONES.md`](../os/FREEZE_ZONES.md):

- ActionDrawer core
- Morph runtime
- Composer core
- Instrumentation contracts Tier 1
- E-commerce resolver atual

Fixes TS nestas áreas: **bugfix only**, diff mínimo, validation record completo.

---

## Áreas seguras para redução incremental

| Área | Segurança | Notas |
|------|-----------|-------|
| `lib/mock-data/*` | 🟢 Alta | Sem impacto perceptivo Tier 1 |
| Stack B feeds (influencer, institutional, personal) | 🟢 Alta | Corrigir durante migration |
| `appointment-calendar.tsx` | 🟢 Alta | 2 erros implicit any |
| `lib/business-types.ts` | 🟡 Média | Revisar impacto cross-vertical |
| Tier 1 paths | 🔴 Proibido salvo bug | 0 erros hoje |

---

## Error budget operacional

| Classe | Status |
|--------|--------|
| Tier 1 runtime | **Intolerável** (0 no baseline) |
| New errors | **Bloqueados** (CI) |
| Legacy safe | Tolerados temporariamente |
| Experimental | Isolados — fix na migration |

---

## Sequência recomendada pós-WS-05

```
WS-05 ✅ TS gate incremental
  ↓
WS-05.5 TS stabilization (redução cirúrgica)
  ↓
WS-06 Influencer migration
  ↓
WS-07 Institutional migration
  ↓
WS-08 AI expansion
```

**Não** ir direto para influencer antes de WS-05.5 — TS debt em `BusinessConfig` / `BusinessSection` afeta migrations.

---

## Riscos de regressão

| Risco | Mitigação |
|-------|-----------|
| Fix TS altera runtime invisível | PRs mínimos; proibido refactor amplo |
| Remover `ignoreBuildErrors` cedo demais | Manter até WS-05.5 threshold |
| Baseline stale após fixes | `pnpm ts:baseline:refresh` em PR dedicado |
| Misturar TS + UX | Um workstream por PR |

---

## Referências

- [`TS_GATES.md`](TS_GATES.md)
- [`TS_ERROR_BASELINE.md`](TS_ERROR_BASELINE.md)
- [`TECH_DEBT_REPORT.md`](../audit/TECH_DEBT_REPORT.md) TD-001
