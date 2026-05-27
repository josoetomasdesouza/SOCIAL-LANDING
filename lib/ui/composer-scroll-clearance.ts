"use client"

import { useMemo } from "react"
import { useConversationSelectionContext } from "@/components/business/conversation-selection-context"

export const COMPOSER_SCROLL_CLEARANCE_CSS_VAR = "--composer-scroll-clearance-px"

/** @deprecated Use COMPOSER_SCROLL_CLEARANCE_CSS_VAR */
export const COMPOSER_COMPACT_FOOTPRINT_CSS_VAR = COMPOSER_SCROLL_CLEARANCE_CSS_VAR

/** Fallback until the composer publishes its first measurement. */
export const COMPOSER_SCROLL_CLEARANCE_FALLBACK = "10dvh"

/** Matches `pb-4` on the composer shell — send button sits this far above the viewport bottom. */
export const COMPOSER_SHELL_BOTTOM_INSET_PX = 16

const MAX_SANE_COMPOSER_BOTTOM_INSET_PX = 160

/** Bottom offset for a pinned CTA so its button aligns with the compact composer send button. */
export function resolveComposerPinnedFooterBottomInsetPx(
  bottomInsetPx: number | undefined
): number {
  if (
    bottomInsetPx != null &&
    bottomInsetPx >= 8 &&
    bottomInsetPx <= MAX_SANE_COMPOSER_BOTTOM_INSET_PX
  ) {
    return bottomInsetPx
  }

  return COMPOSER_SHELL_BOTTOM_INSET_PX
}

export function resolveComposerPinnedFooterScrollPaddingPx(
  footerHeightPx: number,
  bottomInsetPx: number | undefined
): number {
  if (footerHeightPx <= 0) {
    return 0
  }

  return footerHeightPx + resolveComposerPinnedFooterBottomInsetPx(bottomInsetPx)
}

export interface ComposerScrollMetrics {
  footprintPx: number
  bottomInsetPx: number
  clearancePx: number
}

export interface ComposerScrollClearanceOptions {
  /**
   * When false, the surface sits above the composer (e.g. z-50 drawer over z-30 composer).
   * When true/undefined, reserve clearance for the compact composer overlay.
   */
  reserveComposerClearance?: boolean
}

/** @deprecated Use reserveComposerClearance instead */
export interface LegacyComposerScrollClearanceOptions {
  surfaceCoversComposer?: boolean
}

function normalizeClearanceOptions(
  options?: ComposerScrollClearanceOptions | LegacyComposerScrollClearanceOptions
): ComposerScrollClearanceOptions {
  if (!options) {
    return { reserveComposerClearance: true }
  }

  if ("surfaceCoversComposer" in options) {
    return { reserveComposerClearance: !options.surfaceCoversComposer }
  }

  return options
}

export function formatComposerScrollPaddingBottom(clearancePx: number): string {
  return `${Math.max(0, Math.ceil(clearancePx))}px`
}

/**
 * Symmetric clearance above the composer:
 * footprint (viewport bottom → composer top) + bottom inset (composer bottom → viewport bottom).
 */
export function resolveComposerScrollClearancePx(
  footprintPx: number,
  bottomInsetPx: number
): number {
  if (footprintPx <= 0) {
    return 0
  }

  return Math.max(0, Math.ceil(footprintPx + bottomInsetPx))
}

export function resolveComposerScrollPaddingBottom(
  composerMode: "default" | "overlay" | "hidden" | undefined,
  footprintPx: number,
  bottomInsetPx: number,
  clearancePx: number,
  options?: ComposerScrollClearanceOptions | LegacyComposerScrollClearanceOptions
): string {
  const normalizedOptions = normalizeClearanceOptions(options)

  if (composerMode === "hidden") {
    return "0px"
  }

  if (normalizedOptions.reserveComposerClearance === false) {
    return "0px"
  }

  const resolvedClearancePx =
    clearancePx > 0
      ? clearancePx
      : resolveComposerScrollClearancePx(footprintPx, bottomInsetPx)

  if (resolvedClearancePx > 0) {
    return formatComposerScrollPaddingBottom(resolvedClearancePx)
  }

  if (composerMode == null) {
    return "0px"
  }

  return COMPOSER_SCROLL_CLEARANCE_FALLBACK
}

export function useComposerScrollPaddingBottom(
  options?: ComposerScrollClearanceOptions | LegacyComposerScrollClearanceOptions
): string {
  const context = useConversationSelectionContext()
  const normalizedOptions = normalizeClearanceOptions(options)

  return useMemo(
    () =>
      resolveComposerScrollPaddingBottom(
        context?.composerMode,
        context?.composerCompactFootprintPx ?? 0,
        context?.composerBottomInsetPx ?? 0,
        context?.composerScrollClearancePx ?? 0,
        normalizedOptions
      ),
    [
      context?.composerBottomInsetPx,
      context?.composerCompactFootprintPx,
      context?.composerMode,
      context?.composerScrollClearancePx,
      normalizedOptions.reserveComposerClearance,
    ]
  )
}

export function useComposerOverlayClearance(
  options?: ComposerScrollClearanceOptions | LegacyComposerScrollClearanceOptions
) {
  const normalizedOptions = normalizeClearanceOptions(options)
  const paddingBottom = useComposerScrollPaddingBottom(normalizedOptions)
  const isActive =
    normalizedOptions.reserveComposerClearance !== false && paddingBottom !== "0px"

  return { paddingBottom, isActive }
}

export function setComposerScrollClearanceCssVar(clearancePx: number) {
  if (typeof document === "undefined") {
    return
  }

  document.documentElement.style.setProperty(
    COMPOSER_SCROLL_CLEARANCE_CSS_VAR,
    `${Math.max(0, Math.ceil(clearancePx))}px`
  )
}

export function clearComposerScrollClearanceCssVar() {
  if (typeof document === "undefined") {
    return
  }

  document.documentElement.style.setProperty(COMPOSER_SCROLL_CLEARANCE_CSS_VAR, "0px")
}

/** @deprecated Use setComposerScrollClearanceCssVar */
export function setComposerCompactFootprintCssVar(clearancePx: number) {
  setComposerScrollClearanceCssVar(clearancePx)
}

/** @deprecated Use clearComposerScrollClearanceCssVar */
export function clearComposerCompactFootprintCssVar() {
  clearComposerScrollClearanceCssVar()
}
