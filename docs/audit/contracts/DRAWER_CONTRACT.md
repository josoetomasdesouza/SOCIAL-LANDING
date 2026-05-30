# Drawer Contract — Social Landing

**Status:** SKELETON  
**Baseline:** `main` @ `e002921`

---

## Status atual

| Aspecto | Estado |
|---------|--------|
| Stack A | ActionDrawer + BusinessFeedDrawer — instrumentados |
| Stack B | ~~shadcn/vaul + InstrumentedDrawerBridge~~ **Removed** @ Era 2 |
| Scroll lock | ActionDrawer ref-count (Stack A) |
| Convergência | ✅ Era 2 complete |
| Dual semantics | **Resolved** — single stack (ActionDrawer) |

---

## Autoridade runtime atual

| Drawer | Owner state | Stack |
|--------|-------------|-------|
| Feed content drawer | `BusinessSocialLanding.feedDrawerOpen` | A |
| Action drawers | Vertical feed local state | A |
| Scroll lock | Per-drawer useEffect | A |

---

## Observadores passivos

| Observer | Sinal |
|----------|-------|
| Event Bus | `drawer.opened`, `drawer.closed` |
| Event Bus | `surface.opened`, `surface.closed` (paired) |
| Shadow | openDrawers[], activeSurfaceIds[] |
| ~~Bridge~~ | ~~Stack B emits via InstrumentedDrawerBridge~~ — removed |

---

## Eventos conhecidos

| Evento | Payload chave |
|--------|-----------------|
| `drawer.opened` | drawerId, drawerKind, title?, vertical? |
| `drawer.closed` | drawerId, drawerKind, vertical? |
| `surface.opened` | surfaceId (= layer id) |
| `surface.closed` | surfaceId |

---

## Estados canônicos

| Estado | Semântica |
|--------|-----------|
| closed | isOpen=false, overflow restored (single drawer) |
| open | isOpen=true, body overflow hidden |
| open + composer overlay | feed/action drawer policy |
| open + composer hidden | checkout/booking |

---

## Estados derivados

| Derivado | Fonte |
|----------|-------|
| Composer z-index | drawer open + composerMode |
| Feed scrollability | body.overflow |
| Shadow layer registry | drawer events |

---

## Transient states aceitos

| Transient | Aceito? |
|-----------|---------|
| overflow hidden while animating open | ✅ |
| SD-02 close id `feed:video:none` | ✅ shadow normalizes |
| Two ActionDrawers sequential | ✅ if close OK |
| Strict Mode double open event DEV | ✅ |

---

## Divergências conhecidas

| ID | Descrição |
|----|-----------|
| SD-02 | close id ≠ open id feed drawer |
| DR-02 RU-01 | refutado — false positive QA selector |
| DR-03/04 Stack B | **resolved via bridge** — ownership still shadcn |
| Backdrop mobile feed drawer | may not close — P2 UX |

---

## Riscos

| Risco | Severidade |
|-------|------------|
| Dual stack permanent | alto |
| Multi-drawer scroll lock race | médio latente |
| Bridge ≠ ActionDrawer lifecycle | alto até migração |
| Unificar drawers sem matriz | alto — BLOCKED |

---

## Blockers

- Stack B migration incomplete → Truth Mapping parcial
- ref-count scroll lock not implemented → P2 architectural

---

## Perguntas abertas

1. Backdrop close required globally ou VERTICAL_SPECIFIC?
2. Normalizar close drawerId runtime ou shadow-only forever?
3. vaul vs ActionDrawer scroll lock interaction post-migration?
4. Max concurrent drawers per vertical?

---

## O que NÃO pode ser alterado ainda

- Unificar 3 drawer implementations num PR
- Alterar z-50 hierarchy
- Remover InstrumentedDrawerBridge antes de migração equivalente
- body.overflow direct write sem ref-count plan

---

## Referências

- `GLOBAL_CONTRACTS.md` § Drawer
- `P0-01_SCROLL_LOCK_DIAGNOSIS.md`
- `MIGRATION_STRATEGY.md`
- `WORKSTREAM_ISOLATION_PLAN.md` — stack-b-convergence
