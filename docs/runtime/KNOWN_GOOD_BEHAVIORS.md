# Known Good Behaviors — Tier 1 Official

**Status:** ✅ Official post–WS-02.5  
**Baseline:** `main` @ `673395d` (PR #52 merged)  
**Authority:** Observable happy paths on `/demo` + code contract

If production behavior diverges from this document without an explicit baseline update, treat as **regression**.

---

## Global invariants

| ID | Behavior | Expected |
|----|----------|----------|
| G-01 | Drawer dismiss | Drag-down past threshold, **Escape**, or backdrop tap closes sheet |
| G-02 | No modal X | ActionDrawer / feed drawer **no close X button** (post–#52) |
| G-03 | Sheet height | Base `95dvh`; expands slightly on upward drag (max `100dvh`) |
| G-04 | Body scroll lock | `document.body.overflow = hidden` while drawer open |
| G-05 | Composer modes | Only `default`, `overlay`, `hidden` |
| G-06 | Pinned CTA | When composer `hidden`, footer pins to composer bottom slot |
| G-07 | Overlay clearance | When composer `overlay`, drawer scroll body gets symmetric padding |
| G-08 | Scroll end | Minimum `10dvh` clearance at scroll end (drawer stacks) |
| G-09 | Morph | Long-press PostCard → morph 480ms → composer context item |
| G-10 | Events | `drawer.opened/closed`, `surface.opened/closed`, `composer.mode.changed` emit |

---

## Drawer behavior

| ID | Behavior | Detail |
|----|----------|--------|
| D-01 | Open animation | Sheet slides from bottom; `transition-[height,transform] duration-300 ease-out` |
| D-02 | Drag handle | `[data-drawer-drag-zone]` with visual handle bar |
| D-03 | Pull to close | Min ~60px pull (`DRAWER_PULL_CLOSE_MIN_PX`) or 25% sheet height |
| D-04 | Pull resistance | Visual offset × 0.55 (`DRAWER_PULL_DRAG_RESISTANCE`) |
| D-05 | Backdrop fade | Opacity tracks drag (`getBackdropOpacity`) |
| D-06 | Internal scroll | `DrawerScrollBody` — `overflow-y-auto`, dynamic `paddingBottom` |
| D-07 | Pinned footer attr | `[data-action-drawer-pinned-footer]` when screen-pinned |
| D-08 | Feed drawer | `BusinessFeedDrawer` — opaque sheet; backdrop isolated from feed immersive |

---

## Composer behavior

| ID | Behavior | Detail |
|----|----------|--------|
| C-01 | Default | Composer visible at feed bottom (`z-30`) |
| C-02 | Overlay | Composer over content (`z-[70]`); drawers reserve clearance |
| C-03 | Hidden | Composer not rendered in layout; CTAs use pinned slot |
| C-04 | Footprint metrics | `footprintPx`, `bottomInsetPx`, `clearancePx` published to context |
| C-05 | CSS var | `--composer-scroll-clearance-px` on document root |
| C-06 | Fallback clearance | `10dvh` until first measurement |
| C-07 | Feed drawer restore | Closing feed drawer restores mode saved before overlay |
| C-08 | Hidden skip publish | Zero rect when hidden — no bogus clearance |

---

## Checkout behavior

| ID | Behavior | Detail |
|----|----------|--------|
| K-01 | Register footer | Checkout flows call `onRegisterFooter(node)`; cleanup on unmount |
| K-02 | Hidden composer | Feeds set `composerMode: "hidden"` during checkout/booking |
| K-03 | Scroll above CTA | Scroll padding = footer height + composer bottom inset |
| K-04 | Health pattern | `footer` prop directly on ActionDrawer (equivalent outcome) |
| K-05 | Restaurant cart | Header cart icon + badge; **no** fixed bottom “Ver pedido” bar |

---

## Scroll behavior

| ID | Behavior | Detail |
|----|----------|--------|
| S-01 | Drawer scroll | Content scrolls inside sheet; header/footer fixed |
| S-02 | Calendar auto-scroll | Barbearia: selecting date scrolls time slots above pinned footer |
| S-03 | Scroll-into-view inset | `scroll-into-view-with-bottom-inset.ts` respects pinned footer height |
| S-04 | Pull vs scroll | Drag-to-close only when scroll at top (tolerance 2px) |

---

## Morph behavior

| ID | Behavior | Detail |
|----|----------|--------|
| M-01 | Trigger | Long-press ~500ms on PostCard / ContextSelectable |
| M-02 | Duration | 480ms default (`PostToChatMorphLayer`) |
| M-03 | Easing | `easeOutCubic` |
| M-04 | Events | `morph.started` → `morph.completed` (ordered) |
| M-05 | Target | Resolves rect toward composer context slot |
| M-06 | Cancel | Scroll/resize cancels in-flight morph |

---

## Per-vertical happy paths

### E-commerce
1. Open product → drawer with clearance if composer overlay  
2. Close via drag / Escape / backdrop  
3. Header cart → cart drawer  
4. Checkout → CTA pinned, content scrollable above CTA  

### Restaurante
1. Open item → add to cart  
2. Cart via header badge (not bottom bar)  
3. Checkout drawer → pinned CTA  

### Barbearia
1. Agendar → booking drawer  
2. Select date → times scroll into view above confirm CTA  
3. Confirm → confirmation flow  

### Gym
1. Open plan/signup drawer  
2. CTA pinned when composer hidden  

### Imóveis
1. Property / visit drawer  
2. Schedule visit CTA pinned  

### Saúde
1. Select professional → drawer with calendar  
2. Footer “Confirmar agendamento” pinned  
3. Confirmation drawer on complete  

### Cursos / Eventos
1. Checkout drawer with `onRegisterFooter`  
2. Pinned payment CTA  

---

## Anti-patterns (never acceptable)

- CTA covering scrollable content without padding  
- Composer stuck `hidden` after drawer closes  
- Drawer that cannot dismiss  
- Duplicate footers (inline + pinned simultaneously visible)  
- `qa:events` < 8/8 without documented exception  
- Restoring close-X on ActionDrawer without baseline bump  

---

## Validation commands

```bash
pnpm dev
pnpm qa:events    # 8/8 PASS required on main post-merge
pnpm run build
```

Record results in [`TIER1_BASELINE.md`](./TIER1_BASELINE.md).
