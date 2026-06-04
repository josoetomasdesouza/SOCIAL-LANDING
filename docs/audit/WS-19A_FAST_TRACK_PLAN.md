# WS-19A — Fast track: conversa natural e segura (sem LLM)

**Objetivo:** visitante com respostas grounded e tom natural **dentro das lanes**, sem Augusta/transactional errado, sem abrir LLM antes da hora.

**Princípio:** estrutura determinística primeiro → corpus + métrica → LLM só redige (Fase B).

**Ciclo:** 2026-06-04 · branch `workstream/ws-19a-phase1-5` · HEAD `b4b7e44`

---

## Estado agora (2026-06-04)

| Item | Status |
|------|--------|
| **PR #79** | Phase 1.5 + anti-null + **priority foundation** (`b4b7e44`) |
| CI `b4b7e44` | ✅ QA Minimum + Vercel |
| E-G39 / E-G40 (vídeo smoke) | ✅ Incluídos no #79 — **não abrir novo escopo no #79** |
| `conversation-priority.ts` + `topic-detection.ts` | ✅ Fundação no #79 |
| `strategy-executor.ts` | ⏳ **PR2b** (após `main` alinhada) |
| Escape Rate no runner | ⏳ **PR4** |
| LLM visitante | 🔴 NO-GO até Escape &lt; 5% Top 40 |

**Gates obrigatórios cada PR:** `pnpm ts:budget` · `pnpm qa:kernel-stub` · `pnpm qa:appointment`

**Congelamento #79:** `GO` manter `b4b7e44` · `NO-GO` novos commits no PR #79 · `GO merge` somente com CI verde (atingido).

---

## Sequência de PRs (pós-merge)

```txt
#79  = WS-19A Phase 1.5 + priority foundation (+ E-G39/40, adapter guards)
PR2b = strategy-executor
PR3  = priority cleanup + multi-turn hardening
PR4  = Escape Rate + WS-19B Top 40
```

---

## Fases (ordem fixa — não pular)

### Fase 0 — Fechar 1.5 (agora)

```txt
[x] Push b4b7e44 no PR #79 (E-G39/40 + conversation-priority + adapter guard)
[x] CI verde (QA Minimum + Vercel) @ b4b7e44
[ ] Merge PR #79
[ ] Smoke manual pós-merge (§9 WS-19A_PHASE1_5 + 6 cenários abaixo)
[ ] Opcional: pnpm qa:ai-regression antes de tag
```

**GO pós-merge:** 41/41 kernel-stub · appointment 22/22 · zero Augusta no smoke.

**Não fazer antes do merge:** novos commits no #79.

### Fase 1 — Prioridade (fundação no #79; cleanup no PR3)

**Já no #79:** `conversation-priority.ts`, `topic-detection.ts`, `shouldIntentBeatChip`, E-G39/40, adapter transactional guard.

**PR3 (restante):** remover duplicação residual classifier/stub · evals multi-turn de regressão chip+keyword · documentar tabela de pesos no charter 1.5.

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

- Novos commits no **#79** após `b4b7e44`
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

## Smoke manual mínimo (pós-merge #79)

1. Vídeo tendências → mulheres? → resposta no clipe, sem broad loop  
2. Vídeo fade → “esse fade em mulheres?” → sem cards Degrade  
3. Serviço + estacionamento → operacional  
4. Post + “essa barbearia em Curitiba?” → clarificar  
5. Sem chip → “me fala aí” → broad clarify  
6. Nenhum passo: *veja serviços e profissionais no feed quando quiser*

---

## Handoff pós-merge

1. `git checkout main && git pull`  
2. Abrir branch `workstream/ws-19a-pr2b-strategy-executor` a partir de `main`  
3. Aplicar correção deste doc se ainda não estiver em `main` (commit docs-only permitido)  
4. PR2b — sem misturar com fechamento do #79
