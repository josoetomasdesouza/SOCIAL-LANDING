# AGENTS.md — Social Landing

**Obrigatório para todo agente** (Cursor, Claude Code, Codex, CI bots com escrita).

---

## Antes de qualquer tarefa

Leia o Sistema Operacional de Produto:

```
docs/os/README.md          ← índice, precedência, ordem de leitura
docs/os/NORTH_STAR.md      ← direção
docs/os/PRIORITIES.md      ← o que fazer agora
docs/os/ANTI_DRIFT.md      ← o que evitar
docs/os/FROZEN_ZONES.md    ← alma do produto — revisão estratégica
docs/os/OPERATIONAL_RULES.md
docs/os/CLAUDE_OPERATING_SYSTEM.md
```

Features de produto: aplicar `docs/os/PRODUCT_DRIFT_CHECKLIST.md` **antes** de implementar.

Adicione os pilares relevantes ao tipo de tarefa (ver tabela em `docs/os/README.md`).

---

## Regras invioláveis

1. Nunca editar `main` diretamente — usar branch isolada
2. Tier 1 e frozen zones = protocolo frozen + revisão estratégica
3. Features de produto = Product Drift Checklist antes de codar
4. Diff mínimo — sem refactors não solicitados
5. Decisões sensíveis → `docs/ai-handoffs/EVOLUTION_LOG.md`
6. Respeitar NO-GO em `docs/os/PRIORITIES.md`

---

## Documentação

| Camada | Caminho | Papel |
|--------|---------|-------|
| **OS (constituição)** | `docs/os/` | Direção, regras, prioridades |
| Handoffs operacionais | `docs/ai-handoffs/` | Contratos Tier 1 detalhados |
| Auditoria runtime | `docs/audit/` | Governança, contratos, riscos |
| Fundação estratégica | `docs/foundation/` | Integração, ownership, direção |
| Arquitetura | `docs/architecture/` | Dados, persistência, providers |

Em conflito, seguir **ordem oficial de precedência** em `docs/os/README.md`:

1. `docs/os/` → 2. `docs/foundation/` → 3. `docs/audit/` → 4. `docs/ai-handoffs/` → 5. prompts → 6. inferência

Nunca sobrescrever constituição por conveniência técnica.

---

## Bootstrap git (toda sessão)

```bash
git status --short --branch
git branch --show-current
git log --oneline -5
```

---

## Commits

Só commitar quando explicitamente solicitado pelo humano.
