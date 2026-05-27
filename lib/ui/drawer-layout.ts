export const DRAWER_SHEET_HEIGHT = "95dvh"
export const DRAWER_SHEET_MAX_HEIGHT = "100dvh"
export const DRAWER_PULL_DRAG_RESISTANCE = 0.55

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
): { height: string; transform?: string } {
  const baseHeight = options?.baseHeight ?? DRAWER_SHEET_HEIGHT
  const maxHeight = options?.maxHeight ?? DRAWER_SHEET_MAX_HEIGHT

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
