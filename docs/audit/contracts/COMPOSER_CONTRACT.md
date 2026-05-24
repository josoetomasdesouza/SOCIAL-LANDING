# Composer Contract — Social Landing

**Status:** SKELETON — extração em progresso  
**Baseline:** `main` @ `e002921`  
**Natureza:** especificação observável — **não impõe runtime**

---

## Status atual

| Aspecto | Estado |
|---------|--------|
| Implementação | Estável Tier 1 |
| API congelada | `composerMode`: `"default" \| "overlay" \| "hidden"` |
| Priority rules | **Implícitas** — feeds vs BSL competem |
| Shadow alignment | Parcial pós-P0-03 |
| Contrato formal | Este documento (inicial) |

---

## Autoridade runtime atual

| Responsabilidade | Owner |
|------------------|-------|
| `composerMode` state | `ConversationSelectionContext` |
| `setComposerMode` | Vertical feeds (useEffect), BSL (feedDrawerOpen) |
| Visual / measurement / drag | `ConversationalAI` (local ~15+ state) |
| z-index elevation | `BusinessSocialLanding` reads composerMode + feedDrawerOpen |
| Offset (cart bar etc.) | `composerOffsetClassName` via context |

---

## Observadores passivos

| Observer | Sinal |
|----------|-------|
| Event Bus | `composer.mode.changed` { from, to, source } |
| Shadow | `deriveComposerModeFromLayers()` — **não** escuta composer.mode.changed para prever |
| Rule Engine | `brand.dna.protect-composer-surface`, `ai.block-tier1-mutation` |

---

## Eventos conhecidos

| Evento | Quando |
|--------|--------|
| `composer.mode.changed` | Qualquer `setComposerMode` (dedupe from===to) |
| `ai.surface.opened` | Primeira mensagem enviada |
| `surface.shadow.divergence` | composer_mode_mismatch (DEV) |

---

## Estados canônicos

| Estado | Semântica perceptiva |
|--------|---------------------|
| `default` | Composer integrado ao feed, z-30 |
| `overlay` | Composer acima de drawer/superfície, z-60/70 |
| `hidden` | Composer oculto — checkout, booking crítico |

**Congelado:** literais acima — não renomear, não expandir sem CONTRACT_CHANGE.

---

## Estados derivados

| Derivado | Fonte |
|----------|-------|
| z-index class | composerMode + feedDrawerOpen + storyViewer |
| hidden class | composerMode === "hidden" |
| chip rail visibility | morphActive inverse (CP-05) |
| sheet height | measurement refs + contextItems |

---

## Transient states aceitos

| Transient | Duração | Aceito? |
|-----------|---------|---------|
| overlay pending while drawer animates | ~300ms | ✅ |
| default restore after close cleanup | 1 frame | ✅ |
| competing setComposerMode from 2 effects | <100ms | ✅ se resultado correto |
| hidden → overlay rapid (booking back) | variable | investigar timeline |

---

## Divergências conhecidas

| ID | Descrição | Classificação |
|----|-----------|---------------|
| SD-01 | feed drawer overlay — **mitigado P0-03** | revalidar REAL_USAGE |
| SD-04 | ecommerce policy vs shadow layers | observacional |
| Priority implicit | feeds vs BSL hidden wins? | **perguntas abertas** |

---

## Riscos

| Risco | Severidade |
|-------|------------|
| 9+ useEffects setam composerMode independente | médio |
| Race fast drawer toggle | médio |
| Centralizar sem priority doc | alto — BLOCKED |
| Alterar COMPOSER_SURFACE_COLOR | alto — frozen |

---

## Blockers

- Priority rules não documentadas formalmente → **BLOCKED** para reducer apply
- REAL_USAGE re-run pendente pós-P0-03

---

## Perguntas abertas

1. Quando feed drawer e ActionDrawer abertos — qual mode wins?
2. BSL restore on close: restaura mode anterior ou sempre default?
3. Stack B shadcn drawers devem chamar setComposerMode? (hoje: parcial)
4. overlay z-60 vs z-70 — quando cada um?

---

## O que NÃO pode ser alterado ainda

- Literais `composerMode`
- `COMPOSER_SURFACE_COLOR` (`rgba(45,50,58,0.96)`)
- Measurement layer internals sem TIER1_RISK protocol
- Drag/snap timings
- Reducer substituindo setComposerMode

---

## Referências

- `GLOBAL_CONTRACTS.md` § Composer
- `RUNTIME_STATE_MAP.md` — composerMode
- `STATE_GOVERNANCE.md`
- `docs/ai-handoffs/composer-continuity-contract.md`
