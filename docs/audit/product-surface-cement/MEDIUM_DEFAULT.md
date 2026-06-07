# Surface cement — Medium default consolidation

**Date:** 2026-06-07  
**Branch:** `product-surface-cement-prototype`  
**Status:** Approved intensity locked; no rollout beyond canvas + drawer.

## What changed

| Area | Change |
|------|--------|
| `app/globals.css` | Medium texture is the default `--surface-cement-texture` / drawer vars. Soft/Strong moved to dev-only `[data-surface-cement-intensity]` overrides. |
| `lib/ui/surface-cement.ts` | Removed runtime intensity selector. Added `resolveSurfaceCementDevIntensity()` — returns `soft`/`strong` only when explicitly in URL. |
| `business-social-landing.tsx` | Sets `data-surface-cement-intensity` only for dev alternates; ON uses Medium via CSS with no attribute. |
| `business-feed-drawer.tsx` | Same as canvas. |
| `scripts/visual/product-surface-cement-capture.mjs` | Simplified OFF vs ON capture + runtime validation (no git checkout). |

## Flag (unchanged)

```
/demo?composer-layout=v2&surface-cement=on   → Medium canvas + drawer
/demo?composer-layout=v2&surface-cement=off  → 100% flat (default)
```

Dev-only exploration (not production path):

```
&surface-cement-intensity=soft|strong
```

## Scope preserved

- **Applied:** feed canvas root, feed drawer sheet  
- **Not touched:** composer, thread engaged, junction, overlays, user bubbles, hero media, cards, internal feeds, `/criar`

## Validation (Playwright)

Captures regerated in `docs/audit/product-surface-cement/`:

- idle, engaged, drawer open, composer over feed  
- OFF: no `.surface-cement-canvas`, flat background  
- ON: gradient texture, no dev intensity attribute, composer/thread not isolated from canvas containment incorrectly  

See `manifest.json` for automated check results.

## Not in this commit

- Merge to main  
- Rollout to cards or other surfaces  
- Default ON (still opt-in via flag)
