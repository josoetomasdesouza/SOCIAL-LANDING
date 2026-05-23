/**
 * Surface state machine types — declarative transitions for future adoption.
 * No runtime side effects.
 */

import type { SurfaceComposerMode, SurfaceKind } from "./surface-events"
import type { SurfaceReducerAction, SurfaceReducerState } from "./surface-reducer"
import { deriveEcommerceComposerMode, surfaceReducer } from "./surface-reducer"

export interface SurfaceMachineConfig {
  readonly vertical: string
  readonly initialComposerMode?: SurfaceComposerMode
}

export interface SurfaceMachineSnapshot {
  readonly state: SurfaceReducerState
  readonly lastAction: SurfaceReducerAction | null
}

export function createSurfaceMachine(config: SurfaceMachineConfig): SurfaceMachineSnapshot {
  return {
    state: {
      composerMode: config.initialComposerMode ?? "default",
      layers: [],
      vertical: config.vertical,
      revision: 0,
    },
    lastAction: null,
  }
}

export function transitionSurfaceMachine(
  snapshot: SurfaceMachineSnapshot,
  action: SurfaceReducerAction
): SurfaceMachineSnapshot {
  return {
    state: surfaceReducer(snapshot.state, action),
    lastAction: action,
  }
}

export function transitionEcommerceDrawers(
  snapshot: SurfaceMachineSnapshot,
  drawers: {
    cartDrawerOpen: boolean
    checkoutDrawerOpen: boolean
    productDrawerOpen: boolean
  }
): SurfaceMachineSnapshot {
  const mode = deriveEcommerceComposerMode(drawers)
  return transitionSurfaceMachine(snapshot, {
    type: "COMPOSER_MODE_SET",
    mode,
    reason: "ecommerce.drawer.policy",
  })
}

export function openSurfaceLayer(
  snapshot: SurfaceMachineSnapshot,
  layer: { id: string; kind: SurfaceKind; priority?: number }
): SurfaceMachineSnapshot {
  return transitionSurfaceMachine(snapshot, {
    type: "SURFACE_OPEN",
    layer: {
      id: layer.id,
      kind: layer.kind,
      open: true,
      priority: layer.priority ?? 0,
    },
  })
}

export function closeSurfaceLayer(
  snapshot: SurfaceMachineSnapshot,
  layerId: string
): SurfaceMachineSnapshot {
  return transitionSurfaceMachine(snapshot, {
    type: "SURFACE_CLOSE",
    layerId,
  })
}

/** Guard — machine output must never be applied to Tier 1 automatically in this phase */
export const SURFACE_MACHINE_APPLY_TO_TIER1 = false as const
