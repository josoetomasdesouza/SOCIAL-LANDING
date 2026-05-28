# Drawer Behavior Spec — Official Tier 1

**Status:** ✅ Official post–WS-02.5  
**Baseline:** `673395d` (PR #52)  
**Stacks:** ActionDrawer + BusinessFeedDrawer (Stack A)

---

## Philosophy

Drawers are **feed-native sheets**, not traditional centered modals. They emerge from the bottom, respect the composer footprint, and dismiss through gesture — not chrome buttons.

---

## Components

| Component | Path | Role |
|-----------|------|------|
| ActionDrawer | `action-drawer.tsx` | Business flows, checkout, booking |
| BusinessFeedDrawer | `business-feed-drawer.tsx` | Content posts (video, review, news) |
| Drawer chrome | `drawer-drag-chrome.tsx` | Handle bar, drag zone, scroll body |
| Drag hook | `use-drawer-sheet-drag.ts` | Pointer gestures, threshold, backdrop opacity |
| Layout | `drawer-layout.ts` | Height, transform, pull resistance |

Stack B (`feed-drawer.tsx`, vaul) — **not** this spec; must converge to these semantics in WS-06/07.

---

## Opening

| Property | Value |
|----------|-------|
| Entry | Sheet fixed `bottom-0`, `rounded-t-3xl`, `z-50` |
| Base height | `95dvh` (`DRAWER_SHEET_HEIGHT`) |
| Max height | `100dvh` on upward pull |
| Width | Full bleed mobile; `max-w-lg` … `max-w-[600px]` centered on sm+ |
| Animation | `transition-[height,transform] duration-300 ease-out` (when not dragging) |
| Body lock | `overflow: hidden` on `document.body` |
| Events | `drawer.opened` + `surface.opened` |

---

## Closing

| Method | Supported | Notes |
|--------|-----------|-------|
| Drag down | ✅ | Handle zone or sheet pull when scroll at top |
| Escape | ✅ | `keydown` listener while open |
| Backdrop tap | ✅ | `onClick` on backdrop (feed drawer: target === currentTarget) |
| Close X button | ❌ | **Removed** post–#52 — intentional |

### Drag-close mechanics

| Constant | Value |
|----------|-------|
| Activation | 4px pull (`DRAWER_PULL_ACTIVATION_PX`) |
| Close threshold | min(60px, 25% sheet height) |
| Visual pull | `translateY(offset × 0.55)` |
| Upward drag cap | ~5% viewport (`getDrawerMaxUpDragPx`) |

### Backdrop

- ActionDrawer: `bg-black/50`, opacity fades with drag  
- BusinessFeedDrawer: `bg-black/70 backdrop-blur-sm`; opacity isolated from immersive feed sheet  

---

## Pinned footer (composer `hidden`)

**Condition:** `footer` prop present AND `composerMode === "hidden"`

| Rule | Implementation |
|------|----------------|
| Pin position | Fixed footer aligned to composer bottom slot |
| Bottom inset | `resolveComposerPinnedFooterBottomInsetPx()` — default 16px (`pb-4`) |
| Scroll padding | Footer height + bottom inset on scroll body |
| DOM marker | `data-action-drawer-pinned-footer` |
| Inline footer | Not rendered inside sheet when pinned — rendered as fixed sibling |

**Intent:** CTA sits where the composer send button would be — not flush against physical screen bottom.

---

## Scroll interno

| Element | Behavior |
|---------|------------|
| Container | `DrawerScrollBody` — `flex-1 min-h-0 overflow-y-auto` |
| Padding bottom | Dynamic via `style.paddingBottom` |
| Composer overlay | Uses `useComposerOverlayClearance` padding |
| Composer hidden + footer | Uses `resolveComposerPinnedFooterScrollPaddingPx` |
| Global minimum | `10dvh` fallback via clearance utils |
| Pull vs scroll | Drag-to-close disabled when scrollTop > 2px (unless bypass for handle) |

---

## Clearance & overlay

When `composerMode === "overlay"` and drawer open:

1. Composer sits at `z-[70]`, drawer at `z-50`  
2. `reserveComposerClearance: true` on overlay hook  
3. Live metrics published via RAF when drawer opens (`setComposerScrollMetrics`)  
4. Clearance = footprint (viewport bottom → composer top) + bottom inset  

When `composerMode === "hidden"`:

- No composer clearance on drawer — pinned footer pattern instead  

---

## Timing perceptivo

| Transition | Duration | Easing |
|------------|----------|--------|
| Sheet open/close (non-drag) | 300ms | `ease-out` |
| Height expand on up-drag | Immediate (no transition while dragging) | — |
| Backdrop opacity | Tracks drag progress | Linear relative to pull |
| Drag release snap | 300ms | `ease-out` |

**Target feel:** native bottom sheet — not dialog, not full-page route.

---

## Instrumentation

| Event | Payload highlights |
|-------|-------------------|
| `drawer.opened` | `drawerId`, `drawerKind`: action \| feed \| cart \| … |
| `drawer.closed` | Same id/kind |
| `surface.opened/closed` | Paired surface id |

QA: steps 3–4 of `pnpm qa:events` (Escape dismiss).

---

## Size variants

| `size` prop | Use |
|-------------|-----|
| `sm` | Short confirmations |
| `md` | Default |
| `lg` | Checkout, booking, calendars |
| `full` | Rare full-height flows |

---

## Allowed evolution (patch-only)

- Wiring new `footer` / `children` from feeds  
- Bugfix with validation record  
- z-index adjacency fixes with perceptual QA  

## Forbidden without GO

- Reintroducing close X as primary dismiss  
- Changing 95dvh without baseline update  
- Removing Escape support  
- Pin footer when composer not hidden  
