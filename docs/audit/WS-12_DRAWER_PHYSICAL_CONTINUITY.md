# WS-12 — Drawer Physical Continuity

**Data:** 2026-05-31  
**Baseline:** `main` @ `a3cac5d`  
**Escopo:** momentum + settle em **todos** os drawers via `useDrawerSheetDrag`  
**Regra:** continuidade física — não motion showcase

---

## Veredicto

**GO** — drawer obedece física implícita; fechamento completa momentum; snap-back suave.

---

## Gates §8 (pré-código)

| # | Resposta |
|---|----------|
| G1 | ✅ Restaura continuidade física — reforça PERCEPTUAL_INVARIANTS §1, §5, §7 |
| G2 | ✅ Silêncio preservado — motion invisible, não decorativa |
| G3 | ✅ Sem competição emocional nova |
| G4 | ✅ Não transforma conversa em ferramenta |
| G5 | ✅ Não explica demais |
| G6 | ✅ Feed-first intacto |
| G7 | ✅ Universaliza **mecânica física** (não gramática perceptiva) — todos drawers, hook único |
| G8 | **Não:** redesign, bounce teatral, novos gestures, hierarchy/copy changes |

**Teste central:** aumenta continuidade física, não animação chamativa — **PASS**.

---

## Problema

Ao soltar drawer com impulso:

```txt
resetDrag() imediato → onClose() → unmount
= teletransporte perceptivo
```

Cérebro esperava: momentum → desaceleração → peso.

---

## Implementação mínima

| Peça | Mudança |
|------|---------|
| `use-drawer-sheet-drag.ts` | Velocity tracking · settle rAF · delay `onClose` até animação |
| `drawer-layout.ts` | `easeOutCubic` · thresholds · `shouldCloseDrawerFromRelease` |

### Comportamento

| Release | Antes | Depois |
|---------|-------|--------|
| Flick down | Some instantâneo | Continua ~280ms ease-out → fecha |
| Pull parcial | Snap binário | Settle back ~220ms |
| Threshold | Só posição | Posição **ou** velocity ≥ 0.65 px/ms |

### Constantes (calibradas, não teatrais)

- Close settle: **280ms** ease-out cubic
- Open settle: **220ms** ease-out cubic
- Flick velocity: **0.65 px/ms**

**Drawers afetados:** `action-drawer`, `business-feed-drawer`, `feed-drawer` (hook compartilhado).

---

## Validação

| Gate | Resultado |
|------|-----------|
| `pnpm typecheck` | ✅ |
| `pnpm qa:appointment` | ✅ 8/8 |
| `ws12-drawer-physics-unit.mjs` | ✅ |
| `ws12-drawer-momentum-validation.mjs` | ✅ |

### Métricas playwright @ 390

| Caso | Resultado |
|------|-----------|
| Flick close | Drawer visível **262ms** após release (antes ~0ms) |
| Partial pull | **Ainda aberto** após settle-back |

---

## Casos obrigatórios

| Caso | Observação |
|------|------------|
| Drag lento + soltar parcial | Settle-back suave — drawer permanece |
| Flick rápido | Momentum continua — fecha com peso |
| Reversão (pull + voltar) | Offset retorna sem snap agressivo |
| Drawer longo (booking) | Mesma física via hook |

---

## Before / after perceptivo

| | Antes | Depois |
|---|-------|--------|
| Flick release | Desaparece | Desliza com inércia |
| Backdrop | Corte seco | Fade acompanha offset |
| Sensação | Modal binário | Sheet “solto no espaço” |

---

## Critérios de falha — nenhum acionado

- Drawer ainda some ❌
- Motion fake/showcase ❌
- Snap agressivo ❌
- Momentum exagerado ❌

---

## Conclusão

```txt
O drawer parece obedecer física implícita,
não estados binários.
```

Próximo WS funcional: repetir gates §8 · evitar sofisticar o invisível.

---

*Continuidade física — inevitável, não inteligente.*
