# Prioridades — Social Landing

**Autoridade:** Este documento  
**Extensão:** [`docs/audit/NEXT_EVOLUTION_DECISION.md`](../audit/NEXT_EVOLUTION_DECISION.md), [`docs/audit/BEHAVIOR_FIX_PRIORITY.md`](../audit/BEHAVIOR_FIX_PRIORITY.md)

---

## Estado atual (2026-05-24)

Fase: **governança de evolução** pós-estabilização runtime incremental.

Maior risco operacional: **contaminação de trilhas** no working tree — não regressão Tier 1.

---

## Agora (GO)

| Prioridade | Ação |
|------------|------|
| P0 | Consolidar OS em `docs/os/` + bootstrap agentes |
| P0 | Merge docs baseline (`docs/strategic-operational-baseline`) |
| P1 | Peel workstreams da árvore suja |
| P1 | QA scripts institucionalizados (`pnpm qa:*`) |
| P2 | REAL_USAGE re-run pós-avanços |

---

## Parcialmente permitido

- Shadow compare-only accumulation
- Temporal mapping sessions
- Docs/contracts evolution
- Instrumentation Tier 2/3

---

## Explicitamente NÃO agora (NO-GO)

| Ação | Razão |
|------|-------|
| Aplicar shadow ao runtime | Evidência insuficiente |
| Reducer migration Tier 1 | Dual stack drawer existe |
| State unification | Contratos skeleton only |
| Port wiring em massa | Hygiene/converge first |
| BookingPort runtime | Fora de escopo atual |
| Identity engine | Future note only |
| Native commerce rebuild | Orchestration-first |

---

## Próxima vertical

**Influencer readiness** — preparar, não migrar até GO humano explícito.

---

## Como repriorizar

1. Atualizar este documento
2. Registrar em `EVOLUTION_LOG.md`
3. Revisar `NEXT_EVOLUTION_DECISION.md` se mudança estrutural
