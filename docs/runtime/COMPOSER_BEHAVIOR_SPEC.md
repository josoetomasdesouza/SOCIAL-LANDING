# Composer Behavior Spec — Official Tier 1

**Status:** ✅ Official post–WS-02.5  
**Baseline:** `673395d` (PR #52)

---

## Philosophy

The composer is a **persistent conversational surface** at the bottom of the feed — not a chat widget bolted on. It participates in layout (default), overlays content (overlay), or yields entirely to transactional drawers (hidden).

---

## Modes (frozen literals)

| Mode | Visibility | z-index | Typical trigger |
|------|------------|---------|-----------------|
| `default` | In feed layout flow | `z-30` | Feed at rest |
| `overlay` | Fixed over feed content | `z-[70]` | Feed drawer open; some product views |
| `hidden` | Not shown | — | Checkout, booking, confirmation drawers |

**Rule:** no fourth mode without baseline version bump + GO.

---

## DOM contract

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-conversation-composer="true"` | Composer shell | Measurement target for clearance |
| `--composer-scroll-clearance-px` | `:root` | Published clearance for CSS consumers |

---

## Visibility rules

### Default
- Composer visible at bottom of `BusinessSocialLanding`  
- Page scroll may use `useComposerScrollPaddingBottom()` for feed content  
- Footprint tracking active unless drawer blocks it  

### Overlay
- Composer floats above feed (`fixed bottom-0`)  
- Drawers at `z-50` reserve clearance via metrics  
- Feed drawer open → mode saved in ref → restored on close  

### Hidden
- Composer section not interactive in layout  
- Feeds set via `setComposerMode("hidden")` in drawer effects  
- **Must restore** `default` (or prior mode) on drawer close / unmount cleanup  

---

## Clearance & metrics

Published via `ConversationSelectionContext.setComposerScrollMetrics`:

| Metric | Definition |
|--------|------------|
| `composerCompactFootprintPx` | Viewport bottom → composer top |
| `composerBottomInsetPx` | Composer bottom → viewport bottom |
| `composerScrollClearancePx` | `footprint + bottomInset` (symmetric) |

### Resolution (`composer-scroll-clearance.ts`)

| Function | Role |
|----------|------|
| `resolveComposerScrollClearancePx` | Sum footprint + inset |
| `resolveComposerScrollPaddingBottom` | Mode-aware padding string |
| `resolveComposerPinnedFooterBottomInsetPx` | CTA align to send button (16px default) |
| `COMPOSER_SCROLL_CLEARANCE_FALLBACK` | `10dvh` before first measure |

### Overlay hook

`useComposerOverlayClearance({ reserveComposerClearance })`:

- `true` (default): reserve padding when composer overlays  
- `false`: surface fully covers composer (rare)  

---

## Morph interaction

| Step | Composer behavior |
|------|-------------------|
| Long-press PostCard | `morph.started` |
| Morph in flight | Layer at morph z-index; composer target rect resolved |
| Morph complete | Item added to conversation context; composer shows context chip |
| Second message | `ai.surface.opened` once (first message only per session pattern) |

Morph duration: **480ms** — composer must not jump; target rect resolved at completion.

---

## Contextual persistence

| Feature | Behavior |
|---------|----------|
| Context items | Chips from morph / long-press persist in composer |
| Selection provider | `ConversationSelectionProvider` wraps each feed |
| Toggle | Long-press adds/removes context item |
| Resolver props | Vertical-specific placeholders via feed props (not core change) |

---

## Feed integration matrix

| Feed event | Composer mode |
|------------|---------------|
| Feed drawer opens | → `overlay` (save prior) |
| Feed drawer closes | → restore saved mode |
| ActionDrawer checkout open | → `hidden` |
| ActionDrawer closes | → `default` (cleanup in effect) |
| Story viewer | Independent — composer hidden per feed logic |

---

## Expected behavior checklist

- [ ] Composer visible on feed load (default vertical)  
- [ ] Composer hides during checkout — not merely obscured  
- [ ] Composer returns after drawer close without page reload  
- [ ] Overlay mode: last scroll line visible above composer  
- [ ] Hidden mode: pinned CTA aligns with composer slot  
- [ ] No silent disappearance (hidden without drawer open = bug)  

---

## Instrumentation

| Event | When |
|-------|------|
| `composer.mode.changed` | Mode transition (booking drawer step 6 in qa:events) |
| `ai.surface.opened` | First composer message in session |
| `morph.started/completed` | Long-press morph |

---

## Anti-patterns

- Composer visible under pinned checkout CTA  
- `hidden` without restoring on unmount  
- Hard-coded clearance px in feeds (use context/utils)  
- Adding composer mode from instrumentation scripts  

---

## Allowed evolution

- New `placeholder` / `contextItems` per vertical  
- Inject resolver via props (WS-08) without altering render core  
- Metric publishing bugfixes with qa:events  

## Frozen (GO required)

- Mode literal additions  
- z-index stack order  
- Shell `pb-4` / compact footprint geometry  
- Skip-publish-when-hidden semantics  
