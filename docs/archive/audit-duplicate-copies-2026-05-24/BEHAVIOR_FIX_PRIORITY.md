# Behavior Fix Priority — Social Landing

**Regra:** nenhuma correção implementada nesta fase.  
**Objetivo:** sequenciar trabalho **antes** do Runtime Truth Mapping.

---

## Legenda

| Prioridade | Critério |
|------------|----------|
| **P0** | Blocker global — impede truth mapping ou quebra Tier 1 perceptual |
| **P1** | Inconsistência perceptiva — usuário vê comportamento diferente entre verticals |
| **P2** | Consistência observacional — eventos/shadow/console |
| **P3** | Backlog — polish, demo UX, não bloqueia mapping |

---

## P0 — Blocker global

| ID | Problema | Contrato | Verticals | Ação recomendada (não executar ainda) |
|----|----------|----------|-----------|----------------------------------------|
| **P0-01** | realestate: `body overflow: hidden` após fechar drawer | DR-02 | real | Diagnosticar ActionDrawer cleanup; confirmar RU-01 manualmente; patch mínimo scroll unlock |
| **P0-02** | Duas stacks drawer (ActionDrawer vs shadcn) sem contrato | DR-03, DR-04, EV-04 | infl, pers, inst | **Decisão DD-01** primeiro; depois instrumentar ou migrar — não truth-map stack B como stack A |
| **P0-03** | appointment feed drawer: `composerMode` não → overlay | CP-O1, SD-01 | appt | Alinhar `useEffect` com ecommerce/restaurant OU documentar como VERTICAL_SPECIFIC em DD-02 |
| **P0-04** | Morph Strict Mode — **RESOLVIDO** `morph-stability-v1` | MF-02 | todas | ✅ Nenhuma ação — manter regressão guard |

---

## P1 — Inconsistência perceptiva

| ID | Problema | Contrato | Verticals | Ação recomendada |
|----|----------|----------|-----------|------------------|
| **P1-01** | appointment hero long-press: contexto sem morph | PC-03, MF-01 | appt | Trocar para `toggleConversationContextItemWithMorph` no hero — patch 1-liner após validação perceptual |
| **P1-02** | customContent Fragment prop leak | PC-03 | infl, pers, inst | Wrapper component que aceita `onToggleConversationContext` ou remover cloneElement target Fragment |
| **P1-03** | custom modules sem morph wiring | PC-03 | appt (hero), infl (parcial) | Auditar cada custom module; garantir ContextSelectable ou prop injection |
| **P1-04** | ConversationSelectionProvider ausente stack B | CP-03 | infl, pers, inst | Wrap feeds com provider OU aceitar DD-01 migração completa |
| **P1-05** | Sem navegação “voltar ao selector” em `/demo` | — | todas | DD-05: adicionar header/back — demo UX, não Tier 1 core |

---

## P2 — Consistência observacional

| ID | Problema | Contrato | Verticals | Ação recomendada |
|----|----------|----------|-----------|------------------|
| **P2-01** | realestate WhatsApp via `window.open` sem evento | CT-O1, EV-O1 | real | Usar `SocialContactCTA` ou `observeWhatsAppClicked` wrapper |
| **P2-02** | Surface shadow SD-01 appointment composerMode | SF-D2 | appt | Resolver via P0-03; re-run shadow compare |
| **P2-03** | Surface shadow SD-02 close layer id | SF-02 | todas (feed drawer) | Design decision: normalizar runtime ou shadow-only — antes de apply shadow |
| **P2-04** | Duplicate React key warnings DEV | — | todas | Fix keys em listas mock — baixo risco, alto ruído console |
| **P2-05** | institutional image src/alt warnings | — | inst | Corrigir props Image |
| **P2-06** | shadcn drawers sem passive events | EV-04, EV-05 | infl, pers, inst | Bridge rollout em progresso (personal ✅, influencer links ✅); restante institutional |
| **P2-07** | `influencer:media-kit` instrumentado sem trigger UI | EV-04 | infl | Wiring UX separado — `setMediaKitDrawerOpen(true)` nunca chamado; collab usa `setCollabDrawerOpen` sem drawer. **Não bloqueia bridge.** |

---

## P3 — Backlog

| ID | Problema | Notas |
|----|----------|-------|
| **P3-01** | Empty states não implementados | DD-06 — escopo produto |
| **P3-02** | Loading/skeleton ausente | DD-06 |
| **P3-03** | Política composer overlay inconsistente entre verticals business | Unificar após DD-02 |
| **P3-04** | influencer/personal CTAs mailto sem instrumentação | EV-O1 optional |
| **P3-05** | Documentar CTAs VERTICAL_SPECIFIC por feed | Docs only |
| **P3-06** | Commit shadow mode isolado | Quando user pedir — não misturar com ecommerce WIP |

---

## Sequência recomendada (pré Runtime Truth Mapping)

```
1. Decisões de design (DD-01, DD-02)     ← produto
2. P0-01 realestate scroll               ← diagnóstico + patch mínimo
3. P0-03 / P1-01 appointment alignment   ← composer + morph hero
4. P0-02 stack B strategy                ← migrate OR instrument
5. P1-02 Fragment leak                   ← stack B customContent
6. P2-01 realestate whatsapp             ← observability
7. P2-04 duplicate keys                  ← DEV hygiene
8. Re-run REAL_USAGE + shadow compare    ← gate
9. ✅ Aprovar início Runtime Truth Mapping
```

---

## O que NÃO corrigir antes do mapping

| Item | Motivo |
|------|--------|
| Refactor arquitetura surfaces | Fora de escopo |
| Aplicar shadow ao runtime | `SURFACE_SHADOW_APPLY_TO_RUNTIME = false` |
| Tier 1 timing/z-index/morph RAF | Só se regressão comprovada |
| Empty/loading UX | P3 — não blocker |
| ecommerce WIP / drizzle | Contaminação working tree |

---

## Gate checklist — Runtime Truth Mapping

Marcar **GO** apenas quando:

- [ ] DD-01 decidido (stack B)
- [ ] DD-02 decidido (composer overlay feed drawer)
- [ ] P0-01 resolvido ou explicitamente aceito como known issue
- [ ] P0-03 ou waiver documentado
- [ ] Morph path OK em todas verticals com PostCards (P1-01, P1-03)
- [ ] Shadow divergences SD-01/SD-02 triaged
- [ ] REAL_USAGE re-run pós-fixes críticos
- [ ] Nenhum P0 aberto

---

## Resumo executivo

| Prioridade | Count | Blocker mapping? |
|------------|-------|------------------|
| P0 | 3 abertos (+1 resolvido) | **Sim** (P0-01, P0-02, P0-03) |
| P1 | 5 | Parcial — perceptual |
| P2 | 6 | Não — observability |
| P3 | 6 | Não |

**Veredicto:** **NÃO avançar Runtime Truth Mapping** até fechar decisões DD-01/DD-02 e P0 abertos.

---

## Referências

- `GLOBAL_BEHAVIOR_AUDIT.md`
- `VERTICAL_BEHAVIOR_MATRIX.md`
- `GLOBAL_CONTRACTS.md`
- `REAL_USAGE_VALIDATION.md`
- `SURFACE_DIVERGENCES.md`
