/**
 * Surface domain events — maps surface transitions to passive bus events.
 * Organizational layer only; does not drive Tier 1 composerMode yet.
 */

import { observeComposerModeChanged } from "@/lib/events/instrumentation"
import type { EventSource } from "@/lib/events/event-types"

export type SurfaceComposerMode = "default" | "overlay" | "hidden"

export type SurfaceKind = "feed" | "composer" | "action-drawer" | "feed-drawer" | "story" | "checkout"

export interface SurfaceTransitionContext {
  readonly vertical?: string
  readonly reason?: string
  readonly source?: EventSource
  readonly traceId?: string
}

export function emitSurfaceComposerModeObserved(
  from: SurfaceComposerMode,
  to: SurfaceComposerMode,
  context?: SurfaceTransitionContext
): void {
  observeComposerModeChanged({
    from,
    to,
    reason: context?.reason,
    vertical: context?.vertical,
    source: context?.source ?? "surface-engine",
    traceId: context?.traceId,
  })
}

export const SURFACE_EVENT_REASONS = {
  CART_OPEN: "cart.drawer.open",
  CHECKOUT_OPEN: "checkout.drawer.open",
  PRODUCT_OPEN: "product.drawer.open",
  FEED_DRAWER_OPEN: "feed.drawer.open",
  VERTICAL_UNMOUNT: "vertical.unmount",
  POLICY_DEFAULT: "surface.policy.default",
} as const

export type SurfaceEventReason = (typeof SURFACE_EVENT_REASONS)[keyof typeof SURFACE_EVENT_REASONS]
