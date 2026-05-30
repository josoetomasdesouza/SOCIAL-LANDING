# Influencer Behavior Spec — Official post–WS-06

**Status:** ✅ Official post–WS-06.5  
**Baseline commit:** `6fe2b88` (PR #61 merged)  
**Stack:** ActionDrawer (Stack A) — **no** `InstrumentedDrawerBridge`  
**Authority:** Vertical snapshot; complements [`DRAWER_BEHAVIOR_SPEC.md`](./DRAWER_BEHAVIOR_SPEC.md)

---

## Scope

This spec defines **observed, accepted behavior** for the Influencer vertical on `/demo` after WS-06 convergence. It does not modify Tier 1 core law — it documents how influencer applies Stack A drawers in a social/editorial context.

---

## Drawer inventory

| Drawer ID | Title | Size | Trigger(s) |
|-----------|-------|------|------------|
| `influencer:links` | Todos os Links | `lg` | "Ver todos os links"; story **Links** |
| `influencer:media-kit` | Media Kit | `lg` | "Ver media kit comercial"; parcerias card; story **Collabs** |

Both use `ActionDrawer` with stable `drawerId`. Event source: `action-drawer`; `drawerKind: "action"`.

---

## Drawer behavior

Follows [`DRAWER_BEHAVIOR_SPEC.md`](./DRAWER_BEHAVIOR_SPEC.md) unless noted below.

| Property | Influencer value |
|----------|------------------|
| Entry | Bottom sheet, rounded top, drag handle |
| Height | `size="lg"` — **80vh cap** (Stack A), not vaul 95% |
| Body lock | `overflow: hidden` while open |
| Internal scroll | `DrawerScrollBody` — link list and media kit content scroll inside sheet |
| Open events | `drawer.opened` + `surface.opened` (matching IDs) |
| Close events | `drawer.closed` + `surface.closed` |

### Close semantics (official)

| Method | Supported | Notes |
|--------|-----------|-------|
| Escape | ✅ | ActionDrawer global listener |
| Backdrop tap | ✅ | Backdrop `onClick` → `onClose` |
| Drag down | ✅ | Handle zone / pull at scroll top |
| Close X button | ❌ | Intentionally absent — Stack A standard |

After close: `document.body.style.overflow` restored to `""`; feed scroll position preserved.

---

## composerMode overlay

When **any** influencer drawer is open:

```text
composerMode = "overlay"
```

When all drawers closed:

```text
composerMode = "default"
```

| Rule | Behavior |
|------|----------|
| Overlay clearance | Composer reserves clearance above drawer (`useComposerOverlayClearance`) |
| On unmount | Resets to `default` |
| Events | `composer.mode.changed` on open and close (observed in `qa:influencer`) |
| Hidden mode | **Not used** — influencer has no checkout/booking flow |

---

## Media kit flow

**Purpose:** Commercial/partnership snapshot — followers, engagement, contact CTA.

| Step | User action | System response |
|------|-------------|-----------------|
| 1 | Tap CTA or parcerias card | `influencer:media-kit` opens |
| 2 | View metrics + profile | Scroll inside sheet if needed |
| 3 | Tap "Entrar em contato" | `mailto:contato@camilatorres.com` (external) |
| 4 | Dismiss | Escape / backdrop / drag |

**Tone:** Editorial social sheet — **not** a corporate modal dialog. Metrics in soft cards; single primary CTA at bottom of content.

---

## Links drawer flow

| Step | User action | System response |
|------|-------------|-----------------|
| 1 | Tap "Ver todos os links" | `influencer:links` opens |
| 2 | Copy | Clipboard + check icon feedback (2s) |
| 3 | External open | `window.open(url, "_blank")` |
| 4 | Dismiss | Escape / backdrop / drag |

Inline links in feed section still open externally without drawer.

---

## Story interactions

Stories use `BusinessSocialLanding` story viewer **and** optional `onStoryClick` side effects:

| Story | Side effect on tap |
|-------|-------------------|
| **Links** (isMain) | Opens `influencer:links` **and** story viewer |
| **Collabs** | Opens `influencer:media-kit` **and** story viewer |
| Others | Story viewer only |

**Accepted delta (WS-06):** drawer + story viewer may coexist briefly; drawer remains primary interaction surface. Documented residual — not a regression target unless product revises story semantics.

---

## Collab (parcerias) flow

| Element | Behavior |
|---------|---------|
| Horizontal scroll cards | Brand logo, name, type badge |
| Card click | Opens **media kit** (not a separate collab drawer) |
| Context | User stays on same feed — sheet overlays editorial content |

**Rationale:** Collab drawer was never implemented (dead state pre–WS-06). Media kit is the prepared commercial surface.

---

## Accepted visual deltas vs Stack B (vaul)

| Delta | Before (vaul) | After (ActionDrawer) | Verdict |
|-------|---------------|----------------------|---------|
| Sheet height | ~95% snap | ~80vh `lg` | ACCEPTED_WITH_NOTE |
| Chrome | vaul default | Drag handle, Stack A backdrop | ACCEPTED |
| Event `drawerKind` | `other` | `action` | ACCEPTED |
| Event `source` | `instrumentation` | `action-drawer` | ACCEPTED |
| Close X | None on vaul influencer | None on ActionDrawer | Parity |

Do **not** chase vaul pixel parity in influencer — convergence target is Stack A semantics.

---

## Validation

```bash
pnpm dev
pnpm qa:influencer   # 8/8 — vertical drawer protocol
pnpm qa:events       # 8/8 — global Tier 1 regression
```

Manual: select **Influencer** on `/demo` → exercise links, media kit, parcerias, Escape dismiss.

---

## Related

- [`WS-06_INFLUENCER_VALIDATION_REPORT.md`](../audit/WS-06_INFLUENCER_VALIDATION_REPORT.md)  
- [`WS-06_5_INFLUENCER_BASELINE.md`](../audit/WS-06_5_INFLUENCER_BASELINE.md)  
- [`PERCEPTUAL_INVARIANTS.md`](./PERCEPTUAL_INVARIANTS.md) — social invariants I-S1…I-S3  
- [`scripts/convergence/influencer-actiondrawer-validation.mjs`](../../scripts/convergence/influencer-actiondrawer-validation.mjs)
