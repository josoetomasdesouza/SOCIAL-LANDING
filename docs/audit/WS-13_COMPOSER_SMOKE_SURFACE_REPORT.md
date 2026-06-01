# WS-13 — Relatório: Composer Vidro Fumê + Expansion Layering

**Status:** Documentação oficial da decisão perceptiva  
**Implementação:** `ede3515` — `feat(composer): promote smoke-fume surface and restore expansion layering`  
**Documentação:** este relatório (commit docs)  
**Data:** 2026-05-31  
**Workstream:** WS-13 (presença contínua / perceptual)  
**Baseline anterior:** `af791bb` (docs pós M-01 morph)

---

## 0. Natureza da mudança

**Isto não é uma nova feature.** É um **ajuste de materialidade** do composer Tier 1: tokens de superfície, máscara de página e interpolação por altura do sheet.

| O que é | O que não é |
|---------|-------------|
| Superfície controlada (`smoke-fume`) com opt-out explícito | Glassmorphism / liquid glass / showcase de UI |
| Restauração de `expansionProgress` para continuidade atmosférica | Nova capacidade conversacional ou layout |
| Registro institucional de regras, riscos e rollback | Promoção de feature para roadmap |

O **`smoke-fume`** é tratado como **superfície controlada**: intensidade nomeada, override por env/query/localStorage, revertível sem refactor. Default de produção = integração editorial ao feed, não efeito decorativo.

**Anti-padrão explícito:** bordas luminosas, vidro branco, glow, blur exibicionista ou camadas translúcidas que competem com o conteúdo. O gate perceptivo rejeita “UI sofisticada demais” — ver riscos (§9).

---

## 1. Resumo executivo

Decisão perceptiva registrada: o experimento **vidro fumê escuro** (`smoke-fume`) passa a ser a **superfície controlada default** do composer — ajuste de material, não feature nova.

Paralelamente, **`expansionProgress`** foi **restaurado** (`ede3515`) para interpolar blur, máscara e material conforme o sheet cresce (drag, auto-grow, snap). Comportamento originado em `0906e92`, removido em refactors intermediários, reintegrado ao smoke-fume.

**Objetivo:** composer **integrado** ao feed (conteúdo legível atrás do vidro), **sem** glass iOS showcase, com continuidade atmosférica na expansão.

**Fora de escopo (preservado):** motion polish, refactor morph, layout/spacing/timing do composer, lógica conversacional.

---

## 2. Contexto e linha do tempo

| Etapa | O quê | Resultado |
|-------|--------|-----------|
| WS-13 observacional | Experimento `composer-smoke` reversível | A/B validado em Appointment @ 390×844 |
| Problemas resolvidos no tuning | Flag default OFF; máscara branca z-29 bloqueava backdrop-filter; inner surfaces opacas | Feed passou a ler atrás do vidro |
| Regras validadas pelo produto | Compacto plano / expandido gradiente / inner transparente / máscara aberta | Aprovado para produção |
| Commit `ede3515` | Promoção + `expansionProgress` | 6 arquivos, +557 linhas |
| Pendente | Sessão B humana (gate perceptivo composer) | Não bloqueia merge técnico |

### Histórico do `expansionProgress`

| Commit | Comportamento |
|--------|---------------|
| `0906e92` *Refine layered composer expansion* | Introduz `expansionProgress`: blur 12→20px, máscara escura progressiva, handle dinâmico |
| `7b2a652` *Normalize composer surface styling* | Blur/máscara fixos; handle ainda ligado ao progress |
| Pré-`ede3515` | Progress removido; material estático |
| `ede3515` | Progress restaurado integrado ao smoke-fume |

---

## 3. Decisões de produto (regras finais)

### 3.1 Modos de material

| Modo | Quando | Material |
|------|--------|----------|
| **Compacto** | Pill padrão, colapsado, chips sem corpo de chat (`!shouldShowConversationBody`) | Vidro escuro **plano** `rgba(10,14,20,0.82)` — sem gradiente |
| **Expandido** | Corpo da conversa aberto, sheet no máximo | Gradiente fumê `rgba(30,34,40,0.78) → rgba(8,12,18,0.92)` |
| **Durante drag / auto-grow** | `expansionProgress` entre 0 e 1 | Interpolação contínua — **sem salto** |
| **Inner surfaces** | Smoke ativo | `transparent` — material **só** na shell `<section>` |
| **Page mask (z-29)** | Smoke ativo | Fade branco **aberto** (+ haze escuro leve se conversa engajada) |

### 3.2 Superfície controlada — intensidades

| Intensidade | Default | Papel |
|-------------|---------|-------|
| `smoke-fume` | **Sim (produção)** | Superfície controlada validada — materialidade editorial |
| `smoke-subtle` | Não | Variante debug/A-B apenas |
| `off` | Opt-out explícito | Baseline sólida `rgba(45,50,58,0.95)` — rollback runtime |

### 3.3 Interpolação por `expansionProgress` (smoke-fume)

Fórmula:

```txt
progress = clamp((currentHeight - compact) / (expanded - compact), 0, 1)
```

| Propriedade | progress = 0 (compacto) | progress = 1 (expandido) |
|-------------|-------------------------|---------------------------|
| Blur shell | 18px | 26px |
| Saturação | 1.06 | 1.14 |
| Superfície | Plano `rgba(10,14,20,0.82)` | Gradiente fumê completo |
| Máscara feed | Fade mínimo (scale ~0.22) | Fade pleno (scale ~1.0) |
| Handle largura | 40px | 26px |
| Handle opacidade | ~0.30–0.36 | ~0.16–0.22 |
| Doodle interno | opacity 0.22 | opacity ~0.34 |

---

## 4. Arquitetura técnica

### 4.1 Módulo central

**`lib/ui/composer-surface-material.ts`** — fonte única de verdade.

| Export | Responsabilidade |
|--------|------------------|
| `DEFAULT_COMPOSER_SURFACE_INTENSITY` | `"smoke-fume"` |
| `resolveComposerSurfaceIntensity()` | env → query → localStorage → default |
| `resolveComposerSurfaceMaterial()` | className + inner style por intensidade |
| `resolveComposerExpansionProgress()` | Cálculo 0→1 pela altura do sheet |
| `resolveComposerExpansionSectionStyle()` | Material + blur interpolados |
| `resolveComposerPageMaskBackground()` | Gradiente da máscara z-29 |
| `resolveComposerHandleVisuals()` | Opacidade/largura do drag handle |

**Deprecated (compat):** `lib/ui/composer-smoke-experiment.ts` — re-exports para imports legados.

### 4.2 Wiring runtime

**`components/business/conversational-ai.tsx`**

```txt
resolvedSheetHeight
  → expansionProgress
  → composerSectionStyle (shell)
  → composerPageMaskBackground (z-29)
  → composerHandleVisuals (handle)
  → conversationPanelPatternStyle (doodle opacity)
```

- **`updateMaskBounds`**: topo da máscara segue o topo do shell (`ResizeObserver` + `COMPOSER_MASK_TOP_OFFSET_PX`)
- **`data-composer-surface`**: `"smoke-fume"` | `"smoke-subtle"` | undefined (baseline)
- Inner surfaces (`topArea`, `messages`, `contextRail`, `form`): `composerInnerSurfaceStyle` → transparent em smoke

### 4.3 Demo / overrides

**`app/demo/page.tsx`** — persiste override da URL no mount:

```txt
/demo?composer-smoke=smoke-fume|smoke-subtle|off
```

### 4.4 Camadas z-index (inalteradas)

| z | Elemento |
|---|----------|
| 29 | Page mask (gradiente) |
| 30 | Composer shell |
| 75 | Morph layer |

---

## 5. Arquivos alterados (commit `ede3515`)

| Arquivo | Mudança |
|---------|---------|
| `lib/ui/composer-surface-material.ts` | **Novo** — tokens, intensidades, expansion |
| `lib/ui/composer-smoke-experiment.ts` | **Novo** — re-exports deprecados |
| `components/business/conversational-ai.tsx` | Wiring smoke + expansion + inner transparent |
| `app/demo/page.tsx` | Sync override URL → localStorage |
| `docs/runtime/PERCEPTUAL_INVARIANTS.md` | Invariante **P-06** (a/b/c) |
| `docs/audit/experiments/composer-smoke/README.md` | Doc do experimento → produção |

**Não commitados (artefatos locais):**

- Screenshots A/B em `docs/audit/experiments/composer-smoke/*.png`
- `.review/`, `.next/`, buildinfo

---

## 6. Invariantes perceptivos (P-06)

Documentados em [`docs/runtime/PERCEPTUAL_INVARIANTS.md`](../runtime/PERCEPTUAL_INVARIANTS.md).

| ID | Invariante |
|----|------------|
| P-06 | Material só na shell; inner transparente; máscara aberta |
| P-06a | Compacto plano vs expandido gradiente; interpolação contínua no drag |
| P-06b | Opt-out explícito — ausência de override **não** reverte para baseline |

---

## 7. Como ativar / desativar / inspecionar

### Produção (default)

Abrir `/demo` → **Agendamento** → composer já em `smoke-fume` sem query param.

### Overrides

```js
// opt-out baseline
localStorage.setItem("sl-composer-smoke-experiment", "off"); location.reload()

// forçar fumê (redundante com default)
localStorage.setItem("sl-composer-smoke-experiment", "smoke-fume"); location.reload()
```

```txt
URL:  /demo?composer-smoke=off|smoke-subtle|smoke-fume
Env:  NEXT_PUBLIC_COMPOSER_SMOKE_EXPERIMENT=off|smoke-subtle|smoke-fume
```

### DevTools

```js
document.querySelector('[data-conversation-composer="true"]')?.dataset.composerSurface
// "smoke-fume" | "smoke-subtle" | undefined
```

### Plano de teste manual

1. `/demo` → Agendamento — composer compacto: feed visível atrás, vidro plano
2. Enviar mensagem — sheet abre: gradiente aparece, máscara intensifica
3. Arrastar handle — blur/máscara **animam junto** (sem salto)
4. Colapsar — volta ao pill compacto sem layout jump
5. `?composer-smoke=off` — barra sólida baseline
6. Mobile 390×844 — validar `backdrop-filter` em Safari/Chrome real (headless sub-renderiza)

---

## 8. O que **não** mudou (Tier 1 preservado)

- Timings de sheet (300ms height transition)
- Drag/snap/close thresholds
- Morph feed ↔ drawer (M-01 fix em `b88172c`)
- z-index hierarchy
- Layout, spacing, chips, input, motion do composer
- Lógica conversacional / resolver / context

---

## 9. Riscos e limitações

| Risco | Mitigação |
|-------|-----------|
| `backdrop-filter` inconsistente em headless / browsers antigos | Validar em device real; doc no README do experimento |
| Máscara z-29 vs backdrop | Smoke usa fade **aberto** — corrigido no tuning |
| Override localStorage persiste entre sessões | Comportamento intencional para debug; opt-out documentado |
| Regressão perceptiva “glass showcase” | Gate Sessão B humana pendente |

---

## 10. Rollback

### Runtime (sem deploy de código)

```js
localStorage.setItem("sl-composer-smoke-experiment", "off"); location.reload()
```

```txt
URL:  /demo?composer-smoke=off
Env:  NEXT_PUBLIC_COMPOSER_SMOKE_EXPERIMENT=off
```

### Código

```txt
git revert ede3515    # reverte implementação (superfície + expansionProgress)
```

Ou alterar `DEFAULT_COMPOSER_SURFACE_INTENSITY` para `"off"` em `lib/ui/composer-surface-material.ts`.

### Documentação

Este relatório permanece como registro histórico da decisão; rollback de código não remove o audit trail.

---

## 11. Baseline e gates

| Item | Referência |
|------|------------|
| Implementação smoke-fume + expansion | `ede3515` |
| Morph M-01 (Tier 1, inalterado nesta mudança) | `b88172c` |
| Invariantes composer surface | P-06 em `PERCEPTUAL_INVARIANTS.md` (via `ede3515`) |
| Typecheck pré-implementação | ✅ em `ede3515` |
| qa:appointment | Não re-executado em `ede3515` |
| Sessão B humana (gate perceptivo) | Pendente |

---

## 12. Próximos passos sugeridos

1. **Review perceptivo** Sessão B — composer integrado vs sofisticado demais
2. **Commit opcional** — screenshots A/B (`ab-*.png`) se quiser baseline visual no repo
3. **Monitorar** feedback em verticais além de Appointment (e-commerce, restaurant, etc.)

---

## 13. Referências cruzadas

| Documento | Relação |
|-----------|---------|
| [`PERCEPTUAL_INVARIANTS.md`](../runtime/PERCEPTUAL_INVARIANTS.md) | P-06 oficial |
| [`experiments/composer-smoke/README.md`](./experiments/composer-smoke/README.md) | Tokens + alternância |
| [`composer-continuity-contract.md`](../ai-handoffs/composer-continuity-contract.md) | z-29 mask, blur contracts |
| [`WS-13_PRESENCA_CONTINUA_OBSERVACIONAL.md`](./WS-13_PRESENCA_CONTINUA_OBSERVACIONAL.md) | Contexto workstream |
| Commit `0906e92` | Origem do expansion layering |
| Commit `b88172c` | M-01 morph (baseline imediato anterior) |

---

*Relatório institucional — decisão perceptiva WS-13, ajuste de materialidade do composer (não feature).*
