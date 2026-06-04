# WS-19B — Conversational Coverage (Top 40)

**Workstream:** WS-19A Fase 3 / PR4  
**Objetivo:** Medir escape e wrong lane **sem alterar** comportamento do kernel.  
**Corpus machine-readable:** `docs/audit/ws19b-conversational-coverage.json`  
**Runner:** `pnpm qa:kernel-stub` (Phase 1 evals + relatório WS-19B)

---

## Tese

A conversa já tem **lane**, **strategy executor** e **topic ownership**. O PR4 adiciona **observabilidade** — não inteligência nova.

---

## Métricas (separadas)

| Métrica | Definição | Gate |
|---------|-----------|------|
| **Escape Rate** | % turns com queda de experiência (`escaped`) | **< 5%** no Top 40 |
| **Wrong Lane Rate** | % turns com `expected_lane/strategy ≠ actual` | **0** nos cenários `critical: true` |

`escape_reason` **não** inclui `wrong_lane`.

### Escape reasons

| `escape_reason` | Quando |
|-----------------|--------|
| `situated_fallback` | Copy do fallback situado legado (Augusta / discovery genérico) |
| `augusta_generic` | Loop *veja serviços e profissionais no feed quando quiser* |
| `broad_clarify_unexpected` | Broad clarify quando a estratégia esperada não é clarify |
| `transactional_unexpected` | Delegate 08c quando não era esperado |
| `empty_or_null` | Resposta nula; reply vazio **exceto** `delegate_08c` (handoff intencional) |

### Registo por eval

```txt
eval_id
expected_lane / actual_lane
expected_strategy / actual_strategy
escaped (+ escape_reason se true)
wrong_lane
```

Implementação: `lib/conversation-kernel/eval-metrics.ts` · `scripts/convergence/ws19b-metrics-runner.ts`

---

## Top 40

40 cenários derivados dos evals Phase 1 (`matrixRef` E-G* / E-M-APT-*), calibrados com `classifyTurn()` no turno final.

Cada entrada inclui:

| Campo | Uso |
|-------|-----|
| `id` | B-01…B-40 |
| `prompt` / `prior_turns` | Turno(s) executados |
| `chip` | Contexto selecionado (opcional) |
| `expected_lane` | `AnswerabilityClass` esperada |
| `expected_strategy` | `ResponseStrategy` esperada |
| `forbidden_patterns` | Regex que não podem aparecer na reply |
| `escape_expected` | `false` no corpus inicial |
| `critical` | Wrong lane neste cenário falha o gate |

---

## Fora de escopo (PR4)

- LLM / endpoint visitante  
- Novas lanes ou mudanças em `topic-ownership` / `conversation-priority`  
- `conversational-ai.tsx`  
- Melhoria de copy  

---

## Próximo (pós Escape < 5% estável)

Fase 4 — LLM bounded (redação apenas; lane continua no kernel).
