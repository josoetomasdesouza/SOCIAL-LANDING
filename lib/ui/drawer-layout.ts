export const DRAWER_SHEET_HEIGHT = "95dvh"
export const DRAWER_SHEET_MAX_HEIGHT = "100dvh"
export const DRAWER_PULL_DRAG_RESISTANCE = 0.55

/** Downward flick velocity (px/ms) that completes close with momentum. */
export const DRAWER_FLICK_CLOSE_VELOCITY_PX_MS = 0.65
export const DRAWER_SETTLE_CLOSE_MS = 280
export const DRAWER_SETTLE_OPEN_MS = 220
/** Composer dock — height collapse when parking on the dock strip. */
export const DRAWER_DOCK_PARK_SETTLE_MS = 420

export function easeOutCubic(progress: number) {
  const t = Math.min(1, Math.max(0, progress))
  return 1 - Math.pow(1 - t, 3)
}

/** Soft deceleration — drawer “parks” on the dock. */
export function easeOutQuart(progress: number) {
  const t = Math.min(1, Math.max(0, progress))
  return 1 - Math.pow(1 - t, 4)
}

export function resolveDrawerCloseSettleTargetRaw(sheetHeightPx: number) {
  return sheetHeightPx / DRAWER_PULL_DRAG_RESISTANCE + 24
}

/** Bottom-anchored composer dock — settle to compact height, not off-screen. */
export function resolveComposerDockDrawerCloseTargetRaw(dismissHeightPx: number) {
  if (dismissHeightPx <= 0) {
    return 0
  }

  return dismissHeightPx / DRAWER_PULL_DRAG_RESISTANCE
}

export function shouldCloseDrawerFromRelease({
  deltaY,
  velocityY,
  closeThresholdPx,
  pulling,
}: {
  deltaY: number
  velocityY: number
  closeThresholdPx: number
  pulling: boolean
}) {
  if (!pulling || deltaY <= 0) {
    return false
  }

  return deltaY >= closeThresholdPx || velocityY >= DRAWER_FLICK_CLOSE_VELOCITY_PX_MS
}

export function getVisualPullOffset(rawOffsetPx: number) {
  if (rawOffsetPx <= 0) return rawOffsetPx
  return rawOffsetPx * DRAWER_PULL_DRAG_RESISTANCE
}

export function resolveDrawerSheetHeight(
  dragOffsetPx: number,
  baseHeight: string = DRAWER_SHEET_HEIGHT,
  maxHeight: string = DRAWER_SHEET_MAX_HEIGHT
): string {
  if (dragOffsetPx >= 0) return baseHeight

  const expandPx = -dragOffsetPx
  return `min(${maxHeight}, calc(${baseHeight} + ${expandPx}px))`
}

export function getDrawerSheetTransform(
  dragOffsetPx: number,
  translateX?: string
): string | undefined {
  const parts: string[] = []

  if (translateX) {
    parts.push(translateX)
  }

  if (dragOffsetPx > 0) {
    parts.push(`translateY(${getVisualPullOffset(dragOffsetPx)}px)`)
  }

  return parts.length > 0 ? parts.join(" ") : undefined
}

export function resolveDrawerSheetStyle(
  dragOffsetPx: number,
  options?: {
    baseHeight?: string
    maxHeight?: string
    translateX?: string
  }
): { height: string; maxHeight?: string; transform?: string } {
  const baseHeight = options?.baseHeight ?? DRAWER_SHEET_HEIGHT
  const maxHeight = options?.maxHeight ?? DRAWER_SHEET_MAX_HEIGHT

  if (baseHeight === "auto") {
    return {
      height: "auto",
      maxHeight,
      transform: getDrawerSheetTransform(dragOffsetPx, options?.translateX),
    }
  }

  return {
    height: resolveDrawerSheetHeight(dragOffsetPx, baseHeight, maxHeight),
    transform: getDrawerSheetTransform(dragOffsetPx, options?.translateX),
  }
}

export function getDrawerMaxUpDragPx(viewportHeight?: number) {
  if (viewportHeight != null) {
    return Math.round(viewportHeight * 0.05)
  }

  if (typeof window !== "undefined") {
    return Math.round(window.innerHeight * 0.05)
  }

  return 40
}
