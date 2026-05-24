# CLAUDE.md — Social Landing

Instruções para **Claude Code** neste repositório.

---

## Primeira ação de toda sessão

Execute o bootstrap do Sistema Operacional **antes de qualquer código ou análise destrutiva**:

1. Leia `docs/os/README.md`
2. Leia os 5 docs do bootstrap mínimo (listados em `AGENTS.md`)
3. Leia pilares adicionais conforme o tipo de tarefa
4. Rode `git status --short --branch` e confirme branch/escopo

Detalhes completos: [`docs/os/CLAUDE_OPERATING_SYSTEM.md`](docs/os/CLAUDE_OPERATING_SYSTEM.md)

---

## Contexto do projeto

Social Landing — camada de orquestração social-native (Next.js App Router, React 19, Tailwind).

Superfícies principais:

- `/demo` — business landing conversacional (Tier 1 sensível)
- `/` — social landing estática
- `/criar` — builder isolado
- `/[slug]` — profile simples

---

## Onde encontrar regras

| Necessidade | Documento |
|-------------|-----------|
| Direção estratégica | `docs/os/NORTH_STAR.md` |
| UX / morph / composer | `docs/os/EXPERIENCE_PHILOSOPHY.md` + `docs/ai-handoffs/FROZEN_SYSTEMS.md` |
| Arquitetura | `docs/os/ARCHITECTURE_RULES.md` |
| Integrações | `docs/os/BOUNDARIES.md` |
| Prioridades atuais | `docs/os/PRIORITIES.md` |

---

## Proibições

- Não tocar Tier 1 sem ler frozen systems
- Não merge dirty tree
- Não commitar sem pedido explícito
- Não ignorar `docs/os/PRIORITIES.md` NO-GO list

---

## Handoffs

Decisões sensíveis → `docs/ai-handoffs/EVOLUTION_LOG.md`
