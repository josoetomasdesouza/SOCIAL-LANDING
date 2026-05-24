# Anti-Drift — Social Landing

**Autoridade:** Este documento  
**Extensão:** [`docs/audit/DIRTY_TREE_TRIAGE.md`](../audit/DIRTY_TREE_TRIAGE.md), [`docs/audit/EVOLUTION_MODEL_RISK_REVIEW.md`](../audit/EVOLUTION_MODEL_RISK_REVIEW.md)

---

## O que é drift

Desvio entre **intenção documentada**, **código runtime** e **processo operacional** — sem decisão consciente.

---

## Drifts conhecidos (vigilância ativa)

| Drift | Risco | Mitigação |
|-------|-------|-----------|
| Ports existem, runtime bypassa | Acoplamento permanente | Wire via orchestrator |
| Árvore suja multi-workstream | Merge impossível | Peel por branch isolada |
| Docs duplicados/conflitantes | Decisões contraditórias | OS prevalece; dedupe |
| Dois feeds / três drawers | Fragmentação arquitetural | Convergência controlada |
| Agentes ignoram frozen | Regressão Tier 1 | Bootstrap OS obrigatório |

---

## Sinais de alerta

- PR mistura runtime + docs + deps + vertical
- Mudança em morph/composer sem ler frozen
- Novo `window.open` sem evento semântico
- Feature nasce em `main` sem branch
- Decisão sensível sem `EVOLUTION_LOG`

---

## Protocolo anti-drift

1. **Isolar** — um workstream por branch
2. **Bootstrap** — ler OS antes de codar
3. **Lint filosófico** — [`PRODUCT_DRIFT_CHECKLIST.md`](PRODUCT_DRIFT_CHECKLIST.md) antes de features
4. **Frozen zones** — [`FROZEN_ZONES.md`](FROZEN_ZONES.md) antes de refactors amplos
5. **Diff mínimo** — menor mudança que resolve
6. **Instrumentar** — eventos antes de handoffs
7. **Registrar** — decisões em handoffs
8. **Nunca merge wholesale** — árvore suja não entra em main

---

## Degradação lenta de identidade

O produto não morre por falta de features. Morre por **degradação lenta de identidade** — cada “sim” no Product Drift Checklist empurra nessa direção.

---

## Teste rápido

Antes de commitar, pergunte:

> Se outro agente ler só os docs OS amanhã, a minha mudança faz sentido institucionalmente?

Se não → documentar ou repensar.
