# Claude Operating System — Social Landing

**Autoridade:** Este documento  
**Aplica a:** Claude Code, Cursor Agent, Codex, e qualquer agente autônomo no repositório.

---

## Missão do agente

Executar tarefas **dentro** do sistema operacional de produto — não improvisar arquitetura, UX ou processo.

---

## Bootstrap obrigatório (antes de QUALQUER tarefa)

### Passo 1 — OS core (sempre)

Ler nesta ordem:

1. [`docs/os/README.md`](README.md)
2. [`docs/os/NORTH_STAR.md`](NORTH_STAR.md)
3. [`docs/os/EVOLUTION_MANDATE.md`](EVOLUTION_MANDATE.md)
4. [`docs/os/PRIORITIES.md`](PRIORITIES.md)
5. [`docs/os/ANTI_DRIFT.md`](ANTI_DRIFT.md)
6. [`docs/os/OPERATIONAL_RULES.md`](OPERATIONAL_RULES.md)

### Passo 2 — Contexto da tarefa

| Se a tarefa envolve… | Ler também |
|---------------------|------------|
| UI / composer / morph | `EXPERIENCE_PHILOSOPHY.md`, `VISUAL_IDENTITY.md`, `FROZEN_ZONES.md` |
| Feature nova de produto | `PRODUCT_DRIFT_CHECKLIST.md` (obrigatório antes de codar) |
| Código / lib / API | `ARCHITECTURE_RULES.md`, `BOUNDARIES.md` |
| Integração | `BOUNDARIES.md`, `PRODUCT_PHILOSOPHY.md` |
| PR / docs | `HANDOFFS.md`, `WORKSTREAMS.md` |

### Precedência em conflito

Ver `docs/os/README.md` — constituição (`docs/os/`) sempre prevalece sobre inferência do agente.

### Passo 3 — Estado do repo

```bash
git status --short --branch
git branch --show-current
git log --oneline -5
```

Confirmar: branch correta, escopo isolado, baseline conhecido.

---

## Modos de operação

| Modo | Trigger | Comportamento |
|------|---------|---------------|
| **PLAN** | Tarefa ambígua ou Tier 1 | Analisar, propor diff mínimo, não codar |
| **IMPLEMENT** | Escopo claro, fora de frozen | Codar, testar, handoff |
| **DOCS** | Só documentação | Sem tocar runtime |
| **OBSERVE** | Auditoria | Zero mutação |

---

## Proibições absolutas

- Editar `main` diretamente
- Mudar frozen zone sem revisão estratégica
- Implementar feature sem Product Drift Checklist
- Sobrescrever `docs/os/` por inferência ou conveniência técnica
- Merge de árvore suja
- Bypass de ports para providers
- Decisão sensível sem `EVOLUTION_LOG`
- Ignorar prioridades NO-GO em `PRIORITIES.md`

---

## Pós-tarefa

1. Verificar regressão perceptiva (se UI)
2. Atualizar handoffs se criou regra/risco/decisão
3. Diff mínimo — sem refactors não solicitados
4. Não commitar unless explicitly asked

---

## Ativação Claude Code

**Pré-requisito:** OS consolidado em `docs/os/` (este pack).

Ao ativar Claude Code:

1. Garantir que `CLAUDE.md` na raiz aponta para este bootstrap
2. Primeira instrução de sessão: "Execute bootstrap OS antes de qualquer ação"
3. Não delegar tarefas Tier 1 sem evidência de leitura frozen

---

## Evolução deste documento

Quando novo agente/tool entrar no projeto, registrar:

- Nome do agente
- Entry point (AGENTS.md, CLAUDE.md, .cursor/rules)
- Desvios conhecidos e mitigações
