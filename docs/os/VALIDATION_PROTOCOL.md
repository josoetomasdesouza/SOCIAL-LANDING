# Validation Protocol — Social Landing

**Autoridade:** Este documento  
**Versão:** 1.1  
**Data:** 2026-05-24  
**Atualização WS-04:** gates mínimos de CI documentados abaixo

---

## Propósito

Toda tarefa futura — implementação, convergência, docs ou infra — **deve registrar evidência de validação** antes de considerar o workstream concluído ou pronto para merge.

Este protocolo não substitui review humano. Complementa PRs e handoffs.

---

## Quando aplicar

| Tipo de tarefa | Protocolo obrigatório |
|----------------|----------------------|
| Mudança runtime (componentes, lib) | ✅ Completo |
| Convergência vertical | ✅ Completo + perceptual |
| Docs-only | ✅ Resumido (sem perceptual) |
| CI/infra | ✅ Técnico |
| Peel / hygiene | ✅ Resumido |

---

## Registro obrigatório (template)

Copiar para corpo de PR, handoff ou `EVOLUTION_LOG.md`:

```markdown
## Validation Record — [WS-XX / título]

### Objetivo
[Uma frase: o que esta entrega resolve e por quê agora]

### Arquivos alterados
- `path/to/file.tsx`
- ...

### Áreas explicitamente NÃO tocadas
- [ ] ActionDrawer core
- [ ] Morph runtime
- [ ] Composer core
- [ ] E-commerce resolver
- [ ] [outras zonas relevantes]

### Validação técnica
- [ ] `npm run build` passou
- [ ] `pnpm qa:events` passou (quando runtime tocado)
- [ ] `tsc --noEmit` passou (quando TS tocado)
- [ ] Nenhum arquivo fora do escopo do WS no diff

### Validação perceptiva (quando UI/runtime tocado)
- [ ] `/demo` → vertical(is) afetada(s) — happy path
- [ ] Composer: default / overlay / hidden conforme esperado
- [ ] Drawer: drag-close, scroll, footer pinned (se aplicável)
- [ ] Morph: long-press PostCard (se aplicável)
- [ ] Desktop + mobile (ou defer documentado)

### Eventos / logs (quando aplicável)
- [ ] `pnpm qa:events` output colado ou link
- [ ] Event replay 8/8 checklist
- [ ] Nenhum erro console novo não documentado

### Riscos residuais
| Risco | Severidade | Aceite |
|-------|------------|--------|
| ... | 🟢/🟡/🔴 | sim/não/defer |

### Próximo passo recomendado
[Workstream seguinte na sequência — sem executar automaticamente]
```

---

## Critérios mínimos por classe de mudança

### Tier 1 frozen (ver `FREEZE_ZONES.md`)

Exige **GO humano explícito** + validation record completo + re-run perceptual documentado.

Checklist extra:

- [ ] Diff mínimo — linhas alteradas justificadas
- [ ] Rollback descrito (revert commit ou flag)
- [ ] Timings/z-index/scroll lock **inalterados** ou mudança documentada com before/after
- [ ] `FROZEN_ZONES.md` / `FREEZE_ZONES.md` consultados

### Stack A parity (WS-03)

- [ ] `composerMode` correto nos drawers afetados
- [ ] CTA pinned quando composer `hidden`
- [ ] Clearance quando composer `overlay`
- [ ] Nenhuma regressão em vertical não tocada

### Stack B migration (WS-06, WS-07)

- [ ] Protocolo `CONTROLLED_MIGRATION_PATTERN.md`
- [ ] Script QA dedicado ou extensão de `qa:personal`
- [ ] Stabilization window antes da próxima vertical

### Docs-only

- [ ] Nenhum arquivo fora de `docs/` no diff
- [ ] Links internos válidos
- [ ] Precedência OS respeitada (não contradizer `PRIORITIES.md`)

### CI/infra (WS-04)

- [ ] Workflow `.github/workflows/qa-minimum.yml` verde
- [ ] Diff restrito a `.github/`, `docs/` e `scripts/runtime/` (harness QA — sem componentes runtime)
- [ ] **Não** incluir `tsc --noEmit` neste WS (reservado WS-05)

---

## Gates mínimos de merge (WS-04 — CI)

A partir de WS-04, PRs que tocam runtime **devem** passar no workflow `QA Minimum`:

| Gate | Comando | Bloqueia merge? | Workstream |
|------|---------|-----------------|------------|
| Production build | `pnpm run build` | ✅ Sim | WS-04 |
| Global event protocol | `pnpm qa:events` (8/8) | ✅ Sim | WS-04 |
| TypeScript | `pnpm run typecheck` | ❌ **Não ainda** | WS-05 |
| ESLint | `pnpm lint` | ❌ Não neste WS | Futuro |
| Matrix 12 verticais | — | ❌ Proibido | — |

**Notas:**

- `qa:events` exige dev server (`next dev`) — passive events só em `NODE_ENV=development`
- URL do demo: **`http://localhost:3000/demo`** — `127.0.0.1` bloqueia HMR do Next 16 e impede hidratação em headless
- Build roda **antes** do dev server; typecheck no build continua skipped (`ignoreBuildErrors`) até WS-05
- Docs-only PRs: CI roda mas falha de runtime gate não aplica se paths não tocarem app (workflow roda em todo PR — aceitável na fase mínima)

**Referência:** [`.github/workflows/qa-minimum.yml`](../../.github/workflows/qa-minimum.yml)

---

## Falha de validação

Se qualquer item obrigatório falhar:

1. **Não mergear**
2. Documentar falha no PR
3. Classificar: blocker vs defer
4. Blocker → fix na mesma branch; defer → issue/WS futuro com razão

---

## Integração com PR template

PRs runtime devem incluir seção **Validation Record** (template acima).

PRs docs-only podem usar versão resumida (objetivo + arquivos + áreas não tocadas + build N/A).

---

## Referências

- [`FREEZE_ZONES.md`](FREEZE_ZONES.md) — zonas congeladas runtime
- [`WORKSTREAMS.md`](WORKSTREAMS.md) — trilhas e gates
- [`docs/audit/REAL_USAGE_RE_RUN_PLAN.md`](../audit/REAL_USAGE_RE_RUN_PLAN.md) — casos manuais
- [`HANDOFFS.md`](HANDOFFS.md) — protocolo de entrega entre sessões
