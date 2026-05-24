# Handoffs — Social Landing

**Autoridade:** Este documento  
**Extensão:** [`docs/ai-handoffs/`](../ai-handoffs/)

---

## O que é handoff

Transferência de contexto entre humanos, agentes e sessões — **memória operacional** que impede re-decidir o mesmo problema.

---

## Documentos de handoff (Tier 1)

| Documento | Quando atualizar |
|-----------|------------------|
| `SYSTEM_ARCHITECTURE.md` | Mudança estrutural |
| `VISUAL_LANGUAGE.md` | Novo contrato perceptivo |
| `FROZEN_SYSTEMS.md` | Nova área congelada |
| `composer-continuity-contract.md` | Mudança composer/morph |
| `CHANGE_PROTOCOL.md` | Nova regra operacional |
| `EVOLUTION_PROTOCOL.md` | Nova disciplina de evolução |
| `EVOLUTION_LOG.md` | **Toda decisão sensível** |
| `PR_REVIEW_CHECKLIST.md` | Novo critério de review |

---

## Quando atualizar handoffs

- Nova regra ou contrato
- Decisão arquitetural irreversível
- Risco identificado que outros devem conhecer
- Hack temporário que precisa de registro
- Mudança em timings, z-index, frozen areas

---

## Formato de entrada no EVOLUTION_LOG

```markdown
## YYYY-MM-DD — Título curto

**Contexto:** ...
**Decisão:** ...
**Arquivos:** ...
**Risco:** ...
```

---

## Handoffs de integração

- Evento semântico antes de navegação externa
- PR documenta dependência externa nova
- Checklists operador: `docs/ai-handoffs/PR*_*.md`

---

## PR checklist mínimo

Ver [`docs/ai-handoffs/PR_REVIEW_CHECKLIST.md`](../ai-handoffs/PR_REVIEW_CHECKLIST.md).

- [ ] OS/bootstrap lido
- [ ] Branch isolada
- [ ] Diff mínimo
- [ ] Handoffs atualizados se aplicável
- [ ] Sem regressão perceptiva
