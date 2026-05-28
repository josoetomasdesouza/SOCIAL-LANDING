# Master Roadmap — Social Landing

**Autoridade:** Este documento  
**Versão:** 1.0  
**Data:** 2026-05-24  
**Estágio atual:** Runtime Convergence

---

## Estágio atual

**Runtime Convergence** — o produto possui núcleo Tier 1 estável (feed, composer, morph, event bus) e 12 verticais demo funcionais, mas ainda opera com **duas famílias de drawer**, paridade incompleta entre verticais e trilhas de trabalho misturadas na árvore local.

O foco **não** é adicionar features de produto neste ciclo.

---

## Foco atual (era em curso)

| Prioridade | Tema |
|------------|------|
| 1 | **Hygiene operacional** — isolar WIPs, deduplicar docs, peel da árvore suja |
| 2 | **Stack única** — convergir influencer/institutional para `ActionDrawer` |
| 3 | **CI mínimo** — workflows GitHub + scripts `pnpm qa:*` institucionalizados |
| 4 | **Type safety** — gate incremental de TypeScript (`ignoreBuildErrors` → off) |

Referência operacional: [`SYSTEM_STATE.md`](SYSTEM_STATE.md), [`WORKSTREAMS.md`](WORKSTREAMS.md).

---

## Próximas eras (ordem obrigatória)

### Era 1 — Operational Hygiene

**Objetivo:** Estado do repositório reflete trilhas reais; nenhum WIP sem branch nomeada.

- Peel workstreams (`docs/audit/DIRTY_TREE_TRIAGE.md`)
- Consolidar docs duplicados (`docs/audit/* 2.md`)
- Merge docs baseline pendentes
- **Gate de saída:** árvore limpa ou WIPs 100% isolados em branches

**Workstreams:** WS-01

---

### Era 2 — Stack Convergence

**Objetivo:** Uma família de drawer (`ActionDrawer`) em todas as verticais demo.

- Merge e validação PR #52 (`fix/drawer-perceptual-hygiene`)
- Paridade Stack A: checkout pinned CTAs, composer clearance
- Migração influencer → institutional (sequencial, 1 vertical/ciclo)
- **Gate de saída:** 12/12 verticais em Stack A; matriz em `VERTICAL_BEHAVIOR_MATRIX.md` atualizada

**Workstreams:** WS-02, WS-03, WS-06, WS-07

---

### Era 3 — QA/CI Minimum

**Objetivo:** Regressões básicas detectadas automaticamente antes do merge.

- `.github/workflows/qa-minimum.yml`
- Template PR com output 8/8 eventos
- Scripts converge por vertical (personal → influencer → institutional)
- **Gate de saída:** CI verde em PRs docs + runtime; `pnpm qa:events` obrigatório

**Workstreams:** WS-04

---

### Era 4 — TypeScript Gate

**Objetivo:** Build falha em erros de tipo reais.

- Remover `ignoreBuildErrors: true` incrementalmente
- `tsc --noEmit` no CI mínimo
- **Gate de saída:** zero erros TS em paths Tier 1

**Workstreams:** WS-05

---

### Era 5 — Multi-Vertical AI

**Objetivo:** Conversação contextual além do e-commerce — **uma vertical por PR**.

- Resolver + visual block por domínio
- Não alterar `ecommerceMockConversationResolver` existente
- **Gate de saída:** ≥3 verticais com resolver dedicado + re-run perceptual

**Workstreams:** WS-08

---

### Era 6 — DB/Storage Integration

**Objetivo:** Persistência operacional sem contaminar runtime Tier 1.

- PR isolado db-media
- Preencher `docs/architecture/social-landing-storage-schema-alignment.md`
- Smokes SQL só no PR db
- **Gate humano explícito** antes de iniciar

**Workstreams:** WS-09

---

### Era 7 — Identity Layer (futuro)

**Objetivo:** Username, claim, ownership semântico.

- Ver `docs/foundation/FUTURE_USERNAME_IDENTITY_NOTE.md`
- **NO-GO** até Eras 1–4 concluídas

---

## Dependências entre eras

```txt
Era 1 (Hygiene)
  └─► Era 2 (Stack) ──► Era 3 (CI) ──► Era 4 (TS)
                              └─► Era 5 (AI) — após Stack estável
Era 1 ──► Era 6 (DB) — paralelo permitido, merge independente
Era 7 — somente após Eras 1–4
```

---

## O que este roadmap NÃO autoriza

| Ação | Razão |
|------|-------|
| BookingPort / pagamento real | Fora de escopo — ver `PRIORITIES.md` NO-GO |
| Shadow aplicado ao runtime | Evidência insuficiente |
| Batch migrate 2+ verticais | Risco de regressão |
| Merge db + runtime + vertical num PR | Contaminação de trilhas |

---

## Manutenção

- Atualizar este documento ao concluir cada era
- Registrar marcos em `docs/ai-handoffs/EVOLUTION_LOG.md`
- Repriorizar via `PRIORITIES.md` + revisão humana
