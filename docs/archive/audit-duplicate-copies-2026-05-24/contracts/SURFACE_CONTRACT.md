# Surface Contract — Social Landing

**Status:** SKELETON  
**Baseline:** `main` @ `e002921`

---

## Status atual

| Aspecto | Estado |
|---------|--------|
| Surface model | Implicit in drawers + composer + story viewer |
| Shadow reducer | Parallel policy — compare-only |
| Layer ids | feed:video:{postId}, action ids per vertical |
| Apply to runtime | **DISABLED** permanently this phase |

---

## Autoridade runtime atual

| Surface | Owner |
|---------|-------|
| Feed drawer layer | BusinessFeedDrawer + BSL |
| Action surfaces | ActionDrawer per vertical |
| Stack B surfaces | shadcn + bridge |
| Story viewer | BSL storyViewerOpen (z-100) |
| Composer surface | ConversationalAI (not a "layer" in shadow registry same way) |

---

## Observadores passivos

| Observer | Sinal |
|----------|-------|
| `surface.opened/closed` | paired with drawer events (Stack A) |
| Bridge | Stack B same pairing |
| Shadow | openLayerIds, predictedComposerMode |
| Shadow debugger | `__SURFACE_SHADOW__` DEV |

---

## Eventos conhecidos

| Evento | Notas |
|--------|-------|
| `surface.opened` | Emitted with drawer.opened |
| `surface.closed` | Emitted with drawer.closed |
| Shadow ignores surface.opened in reducer | avoids double count |

---

## Estados canônicos

| Concept | Definition |
|---------|------------|
| Layer | Identified surface with stable id |
| Open layer set | Drawers/surfaces currently open |
| Composer mode | Cross-cutting — see COMPOSER_CONTRACT |
| Vertical context | Resets layers on vertical change |

---

## Estados derivados

| Derivado | Fonte |
|----------|-------|
| predictedComposerMode | shadow reducer layers |
| z-index stack | implicit from open surfaces |
| composer elevation | composerMode + feedDrawerOpen |

---

## Transient states aceitos

| Transient | Aceito? |
|-----------|---------|
| SD-02 id mismatch on close | ✅ shadow normalizes |
| orphan overlay brief | investigate timeline |
| story + drawer never same post | ✅ |

---

## Divergências conhecidas

| ID | Kind |
|----|------|
| SD-01 | composer_mode_mismatch — revalidate post-P0-03 |
| SD-02 | drawer_registry_mismatch |
| SF-D1 | shadow never applies — **required** |

---

## Riscos

| Risco | Severidade |
|-------|------------|
| SURFACE_SHADOW_APPLY_TO_RUNTIME=true | crítico — BLOCKED |
| Treat shadow predicted as truth | alto |
| Two surface registries permanent | alto |

---

## Blockers

- Stack B still shadcn semantics under bridge
- Layer priority doc incomplete

---

## Perguntas abertas

1. Is composer a "layer" in future model?
2. Story viewer in shadow registry?
3. When shadow and runtime disagree — who wins in future? (decision deferred)

---

## O que NÃO pode ser alterado ainda

- `SURFACE_SHADOW_APPLY_TO_RUNTIME = false`
- `SURFACE_MACHINE_APPLY_TO_TIER1 = false`
- Apply shadow predicted state to React
- Merge surface + composer reducers without contracts

---

## Referências

- `SHADOW_MODE_REPORT.md`
- `SURFACE_DIVERGENCES.md`
- `RUNTIME_STATE_MAP.md`
