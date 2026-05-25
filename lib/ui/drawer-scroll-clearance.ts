export const DRAWER_SCROLL_END_VIEWPORT_OFFSET = "10dvh"

export function resolveDrawerScrollPaddingBottom(
  reservedBottomInsetPx = 0,
  composerClearancePx = 12
): string {
  if (reservedBottomInsetPx > 0) {
    return `max(${DRAWER_SCROLL_END_VIEWPORT_OFFSET}, ${reservedBottomInsetPx + composerClearancePx}px)`
  }

  return DRAWER_SCROLL_END_VIEWPORT_OFFSET
}
