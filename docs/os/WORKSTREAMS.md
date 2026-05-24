# Workstreams — Social Landing

**Autoridade:** Este documento  
**Extensão:** [`docs/audit/WORKSTREAM_CLASSIFICATION.md`](../audit/WORKSTREAM_CLASSIFICATION.md), [`docs/audit/WORKSTREAM_ISOLATION_PLAN.md`](../audit/WORKSTREAM_ISOLATION_PLAN.md)

---

## Princípio

**Um workstream por branch.** Nunca misturar vertical + infra + docs + runtime na mesma PR.

---

## Nomenclatura de branches

```
workstream/<nome-descritivo>
docs/<pacote-descritivo>
chore/<infra-descritivo>
```

Exemplos existentes:

- `workstream/personal-phase3-actiondrawer`
- `workstream/ecommerce-product-card`
- `docs/strategic-operational-baseline`
- `chore/qa-infrastructure`

---

## Baseline de partida

Branches nascem de **`origin/main` limpo** — nunca de árvore suja local.

---

## Classificação típica

| Tipo | Exemplos | Isolamento |
|------|----------|------------|
| Vertical feature | ecommerce card, influencer drawer | Branch dedicada |
| Convergência | Personal Phase 3 | Protocolo controlado |
| Docs/governance | audit pack, OS baseline | PR docs-only |
| Infra/QA | scripts, CI | `chore/*` |
| Runtime observation | shadow, instrumentation | Sem mutação Tier 1 |

---

## Peel protocol (árvore suja)

1. Inventariar paths (`DIRTY_TREE_TRIAGE`)
2. Classificar por workstream
3. Criar branch limpa por workstream
4. Cherry-pick ou reapply seletivo
5. Dedupe docs vs main

---

## Proibido

- Merge de dirty tree inteira
- WIP de vertical A contaminando vertical B
- Docs exploratórios (~40 audit files) em PR único
