# Regras Operacionais — Social Landing

**Autoridade:** Este documento  
**Extensão:** [`docs/ai-handoffs/CHANGE_PROTOCOL.md`](../ai-handoffs/CHANGE_PROTOCOL.md), [`docs/ai-handoffs/EVOLUTION_PROTOCOL.md`](../ai-handoffs/EVOLUTION_PROTOCOL.md), [`EVOLUTION_MANDATE.md`](EVOLUTION_MANDATE.md)

---

## Regra absoluta

**Não implementar antes de analisar.**

1. Estado atual do código
2. Contratos existentes nos handoffs
3. Sistemas envolvidos e relações invisíveis
4. Último estado bom conhecido
5. Riscos visuais e arquiteturais

---

## Preparação obrigatória (toda tarefa)

```bash
git status --short --branch
git branch --show-current
git log --oneline -5
```

- Confirmar branch de trabalho — **nunca editar `main` diretamente**
- Identificar arquivos críticos e áreas congeladas
- Descrever o **menor diff possível**

---

## Classificação de risco

| Zona | Exemplos | Protocolo |
|------|----------|-----------|
| 🟢 Verde | Docs, copy, mocks isolados | Implementar com review leve |
| 🟡 Amarelo | Novos blocos, instrumentation | Análise + [`PRODUCT_DRIFT_CHECKLIST.md`](PRODUCT_DRIFT_CHECKLIST.md) |
| 🔴 Vermelho | Morph, composer, z-index, scroll lock, frozen zones | [`FROZEN_ZONES.md`](FROZEN_ZONES.md) + protocolo frozen + GO humano |

---

## Áreas congeladas (Tier 1)

Mudanças em feed, stories, composer, drawers, morph, blur, overlays, spacing, z-index, scroll, medição, auto-grow exigem leitura de:

- `docs/ai-handoffs/FROZEN_SYSTEMS.md`
- `docs/ai-handoffs/composer-continuity-contract.md`

---

## Pós-implementação

- Validar que contratos perceptivos não regrediram
- Atualizar handoffs se criou regra, risco ou decisão nova
- Registrar em `docs/ai-handoffs/EVOLUTION_LOG.md` se sensível
