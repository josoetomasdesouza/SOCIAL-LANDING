# Governança — Social Landing

**Autoridade:** Este documento  
**Extensão:** [`docs/audit/STATE_GOVERNANCE.md`](../audit/STATE_GOVERNANCE.md), [`docs/audit/RUNTIME_GOVERNANCE.md`](../audit/RUNTIME_GOVERNANCE.md), [`docs/audit/EVOLUTION_RULES.md`](../audit/EVOLUTION_RULES.md)

---

## Postura

Evolução **gradual, reversível e governada**. O runtime opera como sistema multi-layer observável.

---

## O que IA/agentes podem fazer

| Domínio | Autonomia |
|---------|-----------|
| Copy, keywords, metadados SEO | Alta (com review) |
| Instrumentation Tier 2/3 | Média |
| Docs e handoffs | Alta |
| Novos blocos editor | Baixa — validação humana |
| Capabilities por vertical | Baixa — declarativas |

---

## O que NUNCA evolui sozinho

| Domínio | Razão |
|---------|-------|
| Morph timings/easing | Assinatura perceptiva |
| Z-index hierarchy | Layering |
| composerMode literals | Contrato congelado |
| data-* protocol | Comunicação inter-componentes |
| COMPOSER_SURFACE_COLOR | Identidade visual |
| Long-press 420ms | Gestual calibrado |
| Scroll lock | Integridade navegação |

---

## Modos de operação

| Modo | Quando | Comportamento |
|------|--------|---------------|
| **OBSERVE** | Auditoria, mapping | Zero mutação runtime |
| **IMPLEMENT** | Feature aprovada | Diff mínimo, branch isolada |
| **GOVERNANCE** | Docs, triage | Docs-only PRs |

---

## Frozen systems e frozen zones

- **Frozen systems (Tier 1):** contratos linha-a-linha em `docs/ai-handoffs/FROZEN_SYSTEMS.md`
- **Frozen zones (estratégicas):** áreas de alma do produto — ver [`FROZEN_ZONES.md`](FROZEN_ZONES.md)

Violação em qualquer uma = regressão institucional.

---

## Estado e eventos

- Event bus passivo — não comanda runtime
- Surface reducer — compare-only até flag explícita
- Shadow mode — acumular evidência antes de migrar
