# WS-19A — Fast track: conversa natural e segura (sem LLM)

**Objetivo:** visitante com respostas grounded e tom natural **dentro das lanes**, sem Augusta/transactional errado, sem abrir LLM antes da hora.

**Princípio:** estrutura determinística primeiro → corpus + métrica → LLM só redige (Fase B).

---

## Estado agora (2026-05-24)

| Item | Status |
|------|--------|
| PR #79 Phase 1.5 base | ✅ CI verde (merge pendente decisão humana) |
| Smoke vídeo (tendências, fade+mulheres) | ✅ Código local + E-G39, E-G40 |
| `conversation-priority.ts` | 🟡 Fundação (este commit) |
| `strategy-executor.ts` | ⏳ PR2b |
| Escape Rate no runner | ⏳ PR4 |
| LLM visitante | 🔴 NO-GO até Escape &lt; 5% Top 40 |

**Gates obrigatórios cada PR:** `pnpm ts:budget` · `pnpm qa:kernel-stub` · `pnpm qa:appointment`

---

## Fases (ordem fixa — não pular)

### Fase 0 — Fechar 1.5 (1–2 dias)

```txt
[ ] Merge PR #79
[ ] Push commit: smoke E-G39/40 + conversation-priority + adapter guard
[ ] Smoke manual §9 + 4 cenários (estacionamento, post Curitiba, ambiguidade, me fala aí)
[ ] Opcional: pnpm qa:ai-regression antes de tag
```

**GO:** 41/41 kernel-stub · appointment 22/22 · zero Augusta no smoke.

### Fase 1 — Prioridade única (PR2, ~2–3 dias)

**Entrega:** intenção vs chip em um só módulo; fim de colisão fade→Degrade por override.

| Tarefa | Arquivo |
|--------|---------|
| Tabela `ConversationPriority` | `lib/conversation-kernel/conversation-priority.ts` |
| `shouldIntentBeatChip()` usado no classifier | `answerability-classifier.ts` |
| Remover duplicação em `active-topic` | `active-topic.ts` |
| Evals regressão chip+keyword | E-G39, E-G40 + 2 casos “quero marcar fade” (delegate OK) |

**Não fazer:** refactor monolítico do stub; mudar Tier 1.

### Fase 2 — Strategy executor (PR2b, ~3–4 dias)

```txt
classifyTurn() → lane (já existe)
executeStrategy(lane, strategy) → KernelResponse (extrair de classifier/stub)
```

| Strategy | Origem atual |
|----------|----------------|
| `direct` | `replyFromSelectedContext`, operational |
| `honest_gap` | `replyHonestGap` |
| `clarify_target` | `missing-context.ts` |
| `clarify_broad` | `broad-clarification.ts` |
| `delegate_08c` | transactional delegate |

**GO:** stub só orquestra; copy de resposta só no executor.

### Fase 3 — Corpus + Escape (PR4, ~3–5 dias)

| Tarefa | Entrega |
|--------|---------|
| Draft `WS-19B` Top 40 | `docs/audit/WS-19B_CONVERSATIONAL_COVERAGE.md` |
| Runner flags `lane`, `escaped` | `ws19a-kernel-eval-runner-core.ts` |
| Gate release | Escape Rate &lt; 5% no Top 40 |

### Fase 4 — LLM bounded (charter amend)

**Pré-requisitos:** Fases 0–3 GO · amend WS-19A · endpoint visitante.

```txt
POST /api/conversation/turn
  body: { pack, session, classification, facts[], forbidden[] }
  → LLM redige 1–2 frases
  → policy gate (regex + ids)
```

Kernel **nunca** delega lane ao LLM.

---

## O que NÃO fazer (quebra ou mascara)

- LLM no adapter para “consertar” null
- Regex infinita sem `conversation-priority`
- Broad clarify com chip editorial selecionado
- Transactional quando `isVideoChipContentInquiry` / post content inquiry
- Touch `conversational-ai.tsx` na Fase 0–3

---

## Métricas de “natural” (produto)

| Métrica | Alvo |
|---------|------|
| Answer Rate | ≥ 95% turns in-domain |
| Escape Rate | &lt; 5% (Augusta, situated_fallback, broad indevido, transactional indevido) |
| Wrong Lane | 0 no Top 40 |

**Naturalidade de frase** só sobe de forma segura na Fase 4 (LLM bounded).

---

## Smoke manual mínimo (repita após cada PR)

1. Vídeo tendências → mulheres? → resposta no clipe, sem broad loop  
2. Vídeo fade → “esse fade em mulheres?” → sem cards Degrade  
3. Serviço + estacionamento → operacional  
4. Post + “essa barbearia em Curitiba?” → clarificar  
5. Sem chip → “me fala aí” → broad clarify  
6. Nenhum passo: *veja serviços e profissionais no feed quando quiser*

---

## Próximo commit esperado

`feat(WS-19A): smoke evals E-G39/40, conversation-priority foundation, adapter guards`
