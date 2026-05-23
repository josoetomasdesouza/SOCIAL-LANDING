/**
 * Surface state model — organizational reducer.
 *
 * Does NOT replace React composerMode in Tier 1.
 * Use for observability, policy derivation, and future gradual migration.
 */

import type { SurfaceComposerMode, SurfaceKind } from "./surface-events"

export interface SurfaceLayerState {
  readonly id: string
  readonly kind: SurfaceKind
  readonly open: boolean
  readonly priority: number
}

export interface SurfaceReducerState {
  readonly composerMode: SurfaceComposerMode
  readonly layers: readonly SurfaceLayerState[]
  readonly vertical?: string
  readonly revision: number
}

export type SurfaceReducerAction =
  | {
      readonly type: "SURFACE_OPEN"
      readonly layer: SurfaceLayerState
    }
  | {
      readonly type: "SURFACE_CLOSE"
      readonly layerId: string
    }
  | {
      readonly type: "COMPOSER_MODE_SET"
      readonly mode: SurfaceComposerMode
      readonly reason?: string
    }
  | {
      readonly type: "VERTICAL_SET"
      readonly vertical: string
    }
  | {
      readonly type: "RESET"
    }

export const initialSurfaceReducerState: SurfaceReducerState = {
  composerMode: "default",
  layers: [],
  revision: 0,
}

function deriveComposerModeFromLayers(layers: readonly SurfaceLayerState[]): SurfaceComposerMode {
  const openLayers = layers.filter((layer) => layer.open)
  if (openLayers.length === 0) {
    return "default"
  }

  const hasCheckoutOrCart = openLayers.some(
    (layer) => layer.kind === "checkout" || layer.id.includes("cart")
  )
  if (hasCheckoutOrCart) {
    return "hidden"
  }

  const hasBlockingDrawer = openLayers.some(
    (layer) => layer.kind === "action-drawer" || layer.kind === "feed-drawer"
  )
  if (hasBlockingDrawer) {
    return "overlay"
  }

  return "default"
}

function withRevision(state: SurfaceReducerState): SurfaceReducerState {
  return { ...state, revision: state.revision + 1 }
}

export function surfaceReducer(
  state: SurfaceReducerState,
  action: SurfaceReducerAction
): SurfaceReducerState {
  switch (action.type) {
    case "SURFACE_OPEN": {
      const withoutDuplicate = state.layers.filter((layer) => layer.id !== action.layer.id)
      const layers = [...withoutDuplicate, { ...action.layer, open: true }]
      const composerMode = deriveComposerModeFromLayers(layers)
      return withRevision({ ...state, layers, composerMode })
    }
    case "SURFACE_CLOSE": {
      const layers = state.layers.map((layer) =>
        layer.id === action.layerId ? { ...layer, open: false } : layer
      )
      const composerMode = deriveComposerModeFromLayers(layers)
      return withRevision({ ...state, layers, composerMode })
    }
    case "COMPOSER_MODE_SET":
      return withRevision({ ...state, composerMode: action.mode })
    case "VERTICAL_SET":
      return withRevision({
        ...initialSurfaceReducerState,
        vertical: action.vertical,
      })
    case "RESET":
      return withRevision(initialSurfaceReducerState)
    default:
      return state
  }
}

/** Read-only policy mirror of common ecommerce drawer pattern */
export function deriveEcommerceComposerMode(input: {
  cartDrawerOpen: boolean
  checkoutDrawerOpen: boolean
  productDrawerOpen: boolean
}): SurfaceComposerMode {
  if (input.checkoutDrawerOpen || input.cartDrawerOpen) {
    return "hidden"
  }
  if (input.productDrawerOpen) {
    return "overlay"
  }
  return "default"
}

export function surfaceReducerStatesEqual(
  a: SurfaceReducerState,
  b: SurfaceReducerState
): boolean {
  return a.composerMode === b.composerMode && a.revision === b.revision
}
