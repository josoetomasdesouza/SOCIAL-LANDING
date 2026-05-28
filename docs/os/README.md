# Social Landing — Sistema Operacional de Produto

**Versão:** 1.2  
**Data:** 2026-05-24  
**Status:** Autoridade institucional — qualquer agente deve ler isto antes de tocar o projeto.

---

## O que é isto

Este diretório é o **sistema operacional** da Social Landing: a camada que transforma ideias dispersas em decisões coerentes, repetíveis e anti-drift.

Não é burocracia. É **memória institucional mínima** com ordem de leitura clara.

**Equilíbrio:** governança acelera evolução coerente — ver [`EVOLUTION_MANDATE.md`](EVOLUTION_MANDATE.md).

---

## Ordem oficial de precedência

Em caso de conflito entre fontes:

1. **`docs/os/`** — constituição
2. **`docs/foundation/`** — direção estratégica
3. **`docs/audit/`** — legislação detalhada
4. **`docs/ai-handoffs/`** — contratos operacionais Tier 1
5. **Prompts temporários** — contexto de sessão, não autoridade
6. **Inferência do agente** — último recurso; nunca sobrescreve níveis 1–4

**Regra inviolável:** agentes nunca sobrescrevem princípios constitucionais por conveniência técnica.

---

## Modelo constituição → legislação → execução

```txt
docs/os/           → constituição      (filosofia, precedência, lint)
docs/foundation/   → direção estratégica
docs/audit/        → legislação detalhada
docs/ai-handoffs/  → contratos operacionais
```

O agente entende **primeiro a filosofia**, depois **as regras**, depois **a execução**.

---

## Camadas do OS (16 pilares)

| # | Pilar | Documento | Quando ler |
|---|-------|-----------|------------|
| 0 | **Master roadmap** | [`MASTER_ROADMAP.md`](MASTER_ROADMAP.md) | Eras, sequência, gates de convergência |
| 0b | **System state** | [`SYSTEM_STATE.md`](SYSTEM_STATE.md) | Stable / experimental / blocked / riscos |
| 0c | **Validation protocol** | [`VALIDATION_PROTOCOL.md`](VALIDATION_PROTOCOL.md) | Antes de fechar qualquer WS ou PR |
| 0d | **Freeze zones (runtime)** | [`FREEZE_ZONES.md`](FREEZE_ZONES.md) | Paths congelados na convergência |
| 1 | North Star | [`NORTH_STAR.md`](NORTH_STAR.md) | Sempre — primeira leitura |
| 2 | **Evolução obrigatória** | [`EVOLUTION_MANDATE.md`](EVOLUTION_MANDATE.md) | Sempre — evitar paralisia por governança |
| 3 | Filosofia do produto | [`PRODUCT_PHILOSOPHY.md`](PRODUCT_PHILOSOPHY.md) | Features, escopo, integrações |
| 4 | Filosofia da experiência | [`EXPERIENCE_PHILOSOPHY.md`](EXPERIENCE_PHILOSOPHY.md) | UX, composer, feed, morph |
| 5 | Identidade visual | [`VISUAL_IDENTITY.md`](VISUAL_IDENTITY.md) | UI, spacing, z-index, blur |
| 6 | Regras arquiteturais | [`ARCHITECTURE_RULES.md`](ARCHITECTURE_RULES.md) | Código, módulos, Tier 1/2 |
| 7 | Boundaries | [`BOUNDARIES.md`](BOUNDARIES.md) | Ports, providers, o que não internalizar |
| 8 | Regras operacionais | [`OPERATIONAL_RULES.md`](OPERATIONAL_RULES.md) | Antes/durante implementação |
| 9 | Governança | [`GOVERNANCE.md`](GOVERNANCE.md) | Estado, evolução, frozen systems |
| 10 | Anti-drift | [`ANTI_DRIFT.md`](ANTI_DRIFT.md) | Riscos, árvore suja, regressões |
| 11 | **Frozen zones** | [`FROZEN_ZONES.md`](FROZEN_ZONES.md) | Refactor amplo — revisão estratégica |
| 12 | **Product drift checklist** | [`PRODUCT_DRIFT_CHECKLIST.md`](PRODUCT_DRIFT_CHECKLIST.md) | Lint filosófico por feature |
| 13 | Workstreams | [`WORKSTREAMS.md`](WORKSTREAMS.md) | Branches, isolamento, peel |
| 14 | Handoffs | [`HANDOFFS.md`](HANDOFFS.md) | Protocolos, logs, PRs |
| 15 | Prioridades | [`PRIORITIES.md`](PRIORITIES.md) | O que fazer agora vs depois |
| 16 | Claude operating system | [`CLAUDE_OPERATING_SYSTEM.md`](CLAUDE_OPERATING_SYSTEM.md) | Bootstrap de agentes |

---

## Ordem de leitura obrigatória

### Bootstrap mínimo (qualquer tarefa)

1. `NORTH_STAR.md`
2. `MASTER_ROADMAP.md`
3. `SYSTEM_STATE.md`
4. `WORKSTREAMS.md`
5. `FREEZE_ZONES.md`
6. `EVOLUTION_MANDATE.md`
7. `PRIORITIES.md`
8. `ANTI_DRIFT.md`
9. `FROZEN_ZONES.md`
10. `OPERATIONAL_RULES.md`
11. `VALIDATION_PROTOCOL.md`
12. `CLAUDE_OPERATING_SYSTEM.md`

### Por tipo de tarefa

| Tarefa | Ler também |
|--------|------------|
| UI / feed / composer / morph | `EXPERIENCE_PHILOSOPHY.md`, `VISUAL_IDENTITY.md`, `FROZEN_ZONES.md`, `PRODUCT_DRIFT_CHECKLIST.md` |
| Feature nova de produto | `PRODUCT_DRIFT_CHECKLIST.md`, `NORTH_STAR.md` |
| Arquitetura / lib / API | `ARCHITECTURE_RULES.md`, `BOUNDARIES.md` |
| Integração externa | `BOUNDARIES.md`, `PRODUCT_PHILOSOPHY.md` |
| Docs / PR / handoff | `HANDOFFS.md`, `WORKSTREAMS.md` |
| Runtime / estado / eventos | `GOVERNANCE.md`, `ARCHITECTURE_RULES.md` |

---

## Documentação profunda (referência, não substituto)

| Área | Caminho |
|------|---------|
| Memória operacional Tier 1 | `docs/ai-handoffs/` |
| Auditoria e contratos runtime | `docs/audit/` |
| Direção estratégica | `docs/foundation/` |
| Convergência de superfícies | `docs/convergence/` |
| Arquitetura de dados/persistência | `docs/architecture/` |
| Índice arquitetural | `docs/ARCHITECTURE.md` |

Ver **Ordem oficial de precedência** acima. Pilares OS = constituição; subdiretórios = legislação e contratos.

---

## Manutenção

- Refinar pilares conforme o projeto evolui — **nunca** deixar drift entre OS e código.
- Decisões sensíveis → atualizar pilar relevante + `docs/ai-handoffs/EVOLUTION_LOG.md`.
- Novos agentes ou ferramentas → registrar em `CLAUDE_OPERATING_SYSTEM.md`.
