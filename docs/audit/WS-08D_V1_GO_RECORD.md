# WS-08D V1 — Registro de GO (implementação)

**Data:** 2026-06-03  
**Baseline:** `origin/main` @ `dc4281b`  
**Workstream:** WS-08D — Establishment Conversational Dialogue (Appointment Pilot)

---

## Decisão

```txt
GO implementação WS-08D V1
```

**Escopo aprovado:** V1-core somente.

---

## Restrições obrigatórias

| Regra | Valor |
|-------|--------|
| Ordem de resolução | `[2] WS-08C` → `[1] diálogo V1` → `[3] fallback situado` |
| Tier 1 | **Não alterar** `conversational-ai.tsx` |
| Invariantes | **Não alterar** |
| WS-18A / runtime / publication / storage / external | **Fora** |
| Drawer no composer | **Proibido** |
| LLM / CRM / memória / multi-turn avançado | **Proibido** |

---

## Categorias

| Permitidas | Proibidas nesta PR |
|------------|-------------------|
| T-01 Cumprimentos | T-06 Descoberta (gaps) |
| T-02 Small talk | T-07 Estilo |
| T-03 Horários | T-11 Reagendamento |
| T-04 Localização (texto) | T-12 Dúvidas gerais |
| T-05 Primeira visita | |
| T-13 Fora de domínio | |
| P-FB01 Fallback situado | |

---

## Execução

- Plano técnico PR: [`WS-08D_V1_PR_EXECUTION_PLAN.md`](./WS-08D_V1_PR_EXECUTION_PLAN.md)
- Branch: `workstream/ws-08d-v1-establishment-dialogue`

---

## Charter

Critério I2 (§11) satisfeito por este registro + decisão explícita na governança do projeto.
