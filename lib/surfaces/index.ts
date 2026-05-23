export type {
  SurfaceComposerMode,
  SurfaceEventReason,
  SurfaceKind,
  SurfaceTransitionContext,
} from "./surface-events"
export { emitSurfaceComposerModeObserved, SURFACE_EVENT_REASONS } from "./surface-events"

export type {
  SurfaceLayerState,
  SurfaceReducerAction,
  SurfaceReducerState,
} from "./surface-reducer"
export {
  deriveEcommerceComposerMode,
  initialSurfaceReducerState,
  surfaceReducer,
  surfaceReducerStatesEqual,
} from "./surface-reducer"

export type { SurfaceMachineConfig, SurfaceMachineSnapshot } from "./surface-machine"
export {
  closeSurfaceLayer,
  createSurfaceMachine,
  openSurfaceLayer,
  SURFACE_MACHINE_APPLY_TO_TIER1,
  transitionEcommerceDrawers,
  transitionSurfaceMachine,
} from "./surface-machine"
