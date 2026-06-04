# Composer Continuity Contract — v2 Delta (WS-21)

**Status:** 🟡 DRAFT — companion to [`COMPOSER_BEHAVIOR_SPEC_v2_DRAFT.md`](../runtime/COMPOSER_BEHAVIOR_SPEC_v2_DRAFT.md)  
**Baseline:** `433cbba` · PR D2 doc-only  
**Rule:** **Delta only** — do not rewrite `composer-continuity-contract.md` v1.0 in place until frozen zone review.

```txt
v1.0 continuity contract remains authoritative for RUNTIME v1.
This delta describes what changes when composer-layout=v2 is implemented.
```

---

## 1. Architecture layer model (supersedes Seção 1 partial)

### v1 composition (unchanged for drawers/morph)

```
BusinessSocialLanding
  ├── BusinessSection[]           ← feed editorial
  ├── [NEW] Thread in-flow zone   ← data-conversation-thread-anchor
  ├── ConversationalAI            ← sticky shell ONLY (compact)
  ├── PostToChatMorphLayer        ← unchanged
  ├── BusinessFeedDrawer          ← unchanged
  └── ActionDrawer(s)             ← unchanged
```

### State location (note — not prescription to refactor)

| State | v1 | v2 |
|-------|----|----|
| Messages / typing | `conversational-ai.tsx` local | May remain local; **render** target moves to thread anchor |
| composerMode | context + feeds | **Unchanged** |
| Morph | context-selectable + morph layer | **Unchanged** |

---

## 2. Seção 2 — Frozen areas: changes

### UNCHANGED (still frozen)

| Block | Notes |
|-------|-------|
| CONGELADO — Morph | Entire block frozen |
| CONGELADO — Scroll Lock (drawers) | Drawer pattern frozen |
| CONGELADO — Long-press 420ms | Frozen |
| CONGELADO — composerMode API | Frozen literals |
| CONGELADO — Z-Index Hierarchy | Relative order frozen; see mask note below |

### SUPERSEDED (v2 path only)

| v1 frozen block | v2 status |
|-----------------|-----------|
| **CONGELADO — Sistema de Drag do Sheet** (composer) | **Deprecated** — remove from frozen list for v2; do not extend |
| **COMPOSER_SURFACE_COLOR** legacy baseline | Superseded by smoke-fume tokens for v2 engaged path |

### NEW frozen (v2)

- Thread anchor placement after sections  
- Monoscroll — no composer-internal message scroll  
- Sticky shell compact height when engaged  

---

## 3. Seção 4 — Data attributes delta

### 4.1 Additions

| Attribute | Applied by | Consumed by | If missing |
|-----------|------------|-------------|------------|
| `data-conversation-thread-anchor="true"` | `BusinessSocialLanding` | Thread render/portal | Thread renders nowhere — silent failure |

### 4.1 Unchanged

All v1 attributes remain on **sticky shell** — never move to thread:

- `data-conversation-composer`
- `data-conversation-context-chip`
- `data-conversation-context-chip-target`
- `data-conversation-context-rail`
- `data-post-context-source` (ContextSelectable)

### 4.4 `sheetMetrics` shape — supersession

```typescript
// v1 — full shape (runtime v1)
interface SheetMetrics {
  compact: number
  auto: number
  medium: number      // DEPRECATED v2
  expanded: number    // DEPRECATED v2
  closeThreshold: number  // DEPRECATED v2
}

// v2 — logical contract (implementation may alias during migration)
interface ComposerCompactMetrics {
  compact: number     // sticky shell only
  bottomInset: number
}
```

**Rule:** v2 path MUST NOT use `medium`, `expanded`, or `closeThreshold` for layout decisions.

---

## 4. Seção 6 — Timings delta

### Unchanged

All morph, drawer, long-press timings frozen.

### Deprecated (composer only)

| Timing | v1 | v2 |
|--------|----|----|
| Sheet height transition 300ms | Composer expand/collapse | **N/A** — shell stable |
| Snap height constants | §6 constants block | **Deprecated** composer path |

```typescript
// DEPRECATED for composer v2 — drawer physics unchanged
const SHEET_MAX_VIEWPORT_RATIO = 0.9
const SHEET_MID_VIEWPORT_RATIO = 0.55
const COMPACT_BODY_MIN_RATIO = 0.22
const CLOSE_THRESHOLD_OFFSET_PX = 72
```

---

## 5. Seção 7 — Anti-refactor rules delta

### Still valid

Rules 1–5, 9–10 (morph singleton, drawer scroll lock, modes, data-*, context_event, refs).

### Superseded

| Rule | v2 |
|------|-----|
| 6 — Do not simplify `measureSheetLayout` | **N/A v2** — replace with compact shell measure only |
| 7 — Do not remove composer `useLayoutEffect` chain | **Reduce** to shell + rail + form refs; remove topArea/message measure refs in v2 |
| 8 — (unchanged) framer-motion | Still valid |

---

## 6. Seção 9 — Regression matrix additions

| Area changed | Risk | Severity |
|--------------|------|----------|
| Thread anchor missing | No conversation visible | **CRITICAL** |
| Portal before anchor mount | Empty thread | HIGH |
| Footprint includes thread | Feed pb wrong | HIGH |
| Thread visible @ overlay | Dual-interface confusion | MEDIUM |
| `ai.surface.opened` on shell expand | Wrong analytics | LOW |

Remove v2-relevant regressions tied only to sheet snap stuck height.

---

## 7. Seção 11 — Checklist delta (A9)

### REMOVE (composer v2)

- [ ] Sheet do compositor arrasta e snapa em 3 posições  
- [ ] Sheet fecha quando arrastado abaixo do `closeThreshold`  
- [ ] Sheet transição 300ms ao expandir/colapsar  
- [ ] Messages do chat fazem scroll automático **dentro do composer**  
- [ ] Drag do sheet não afeta scroll da página  
- [ ] Drag inicia apenas no handle  

### ADD (composer v2)

- [ ] Thread in-flow aparece após sections, antes do footer  
- [ ] Primeiro send abre thread — morph alone não abre  
- [ ] Monoscroll: page scroll atravessa feed + thread sem scroll interno no composer  
- [ ] Sticky shell permanece compact (~124px) com chip durante multi-turn  
- [ ] Scroll up após multi-turn alcança hero/sections  
- [ ] Overlay: thread oculta; composer visível z-70  
- [ ] Hidden: thread + composer ausentes; footprint 0  
- [ ] Restore pós-drawer: thread + mode + scroll coerentes  
- [ ] Sem máscara full-page dim sobre feed quando thread engaged  
- [ ] `ai.surface.opened` correlaciona com thread visible — não shell expand  

### UNCHANGED

Morph, drawer scroll lock, z-index order, chip rail, mode transitions, localStorage history, feed drawer behavior.

---

## 8. z-index note (Seção 5)

| Layer | v2 change |
|-------|-----------|
| z-29 composer gradient mask | **Minimal or off** when thread engaged |
| z-30/60/70 composer shell | Unchanged |
| z-65 morph | Unchanged |
| z-50 drawers | Unchanged — **drawer sheet ≠ composer** |

---

## 9. Supersession table (continuity contract)

| v1 section | v2 action |
|------------|-----------|
| §1 Camadas — ConversationalAI monolith | **Split** conceptual: shell + thread anchor |
| §2 Drag do Sheet frozen | **Deprecated** (composer) |
| §4.4 sheetMetrics | **Narrow** to compact |
| §6 snap constants | **Deprecated** (composer) |
| §7 rules 6–7 | **Replace** with compact measure rules |
| §11 sheet/drag checks | **Remove** |
| §11 scroll messages in composer | **Replace** with page scroll-to-turn |
| Apêndice z-29 mask | **Conditional** off when engaged |

---

## 10. Runtime status

| Path | Contract |
|------|----------|
| `composer-layout=v1` (default) | v1.0 continuity contract full |
| `composer-layout=v2` (pilot) | v1.0 **plus** this delta |
| Post-G3 | Merge delta into continuity contract v2.0 |

**No runtime change until R0+ after G0.**

---

*Continuity contract v2 delta · WS-21 D2 · Behavior/contract only.*
