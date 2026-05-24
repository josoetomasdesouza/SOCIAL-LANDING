# Frozen Zones — Social Landing

**Autoridade:** Este documento  
**Extensão:** [`docs/ai-handoffs/FROZEN_SYSTEMS.md`](../ai-handoffs/FROZEN_SYSTEMS.md), [`docs/ai-handoffs/composer-continuity-contract.md`](../ai-handoffs/composer-continuity-contract.md)

---

## O que são frozen zones

Áreas que carregam **alma do produto**, continuidade perceptiva e diferenciação invisível.

Refactor amplo, simplificação “por conveniência” ou abstração prematura aqui **destrói identidade sem aviso**.

Frozen zones exigem **revisão estratégica humana** antes de qualquer mudança estrutural — não só diff técnico.

---

## Zonas congeladas

| Zona | Por quê | Autoridade detalhada |
|------|---------|----------------------|
| **Feed architecture** | Cadência editorial, continuidade social | `SYSTEM_ARCHITECTURE.md` |
| **Drawer system** | Layering, scroll, transições 300ms | `FROZEN_SYSTEMS.md` |
| **Conversational surfaces** | Composer emergente, não-modal | `composer-continuity-contract.md` |
| **Morph + motion language** | Assinatura perceptiva 480ms/420ms | `VISUAL_LANGUAGE.md` |
| **Instrumentation** | Eventos semânticos, observabilidade | `RUNTIME_GOVERNANCE.md` |
| **Identity system** | Hub de marca, ownership semântico | `NATIVE_OWNERSHIP_MAP.md` |
| **Cross-vertical abstractions** | Risco de generalizar demais cedo | `ABSTRACTION_BOUNDARIES.md` |

---

## O que exige revisão estratégica

Antes de refactor amplo em qualquer frozen zone:

1. Ler contratos detalhados (legislação + handoffs)
2. Classificar risco: 🟢 patch pontual vs 🔴 reestruturação
3. Descrever diff mínimo e rollback
4. Registrar intenção em `EVOLUTION_LOG.md`
5. **GO humano explícito** para 🔴

---

## Permitido sem revisão estratégica

- Bugfix pontual com diff mínimo
- Instrumentation Tier 2/3 add-only
- Copy e conteúdo mock
- Docs e handoffs

---

## Proibido em frozen zones

- “Cleanup” ou refactor não solicitado
- Unificação de stacks sem protocolo de convergência
- Mudança de timings, z-index ou scroll lock por inferência
- Abstração cross-vertical antes de evidência em 2+ verticais

---

## Teste de frozen zone

> Esta mudança altera **como o produto se sente** — ou só **como o código se organiza**?

Se altera sensação → frozen zone → protocolo completo.
