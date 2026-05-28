const PINNED_DRAWER_FOOTER_SELECTOR = '[data-action-drawer-pinned-footer="true"]'

function findOverflowScrollParent(element: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = element.parentElement

  while (current) {
    const { overflowY } = getComputedStyle(current)
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      current.scrollHeight > current.clientHeight
    ) {
      return current
    }
    current = current.parentElement
  }

  return null
}

/** Height of the fixed drawer footer overlaying the scroll body, from its top edge to the viewport bottom. */
export function measurePinnedDrawerFooterInsetPx(): number {
  if (typeof document === "undefined") {
    return 0
  }

  const pinnedFooter = document.querySelector<HTMLElement>(PINNED_DRAWER_FOOTER_SELECTOR)
  if (!pinnedFooter) {
    return 0
  }

  const rect = pinnedFooter.getBoundingClientRect()
  if (rect.height <= 0) {
    return 0
  }

  const viewportHeight = window.visualViewport?.height ?? window.innerHeight
  return Math.round(Math.max(0, viewportHeight - rect.top))
}

/**
 * Scrolls an element into the visible band of a drawer scroll body, keeping it above a pinned footer.
 */
export function scrollIntoViewAboveBottomInset(
  element: HTMLElement,
  options?: { behavior?: ScrollBehavior; marginPx?: number }
) {
  const behavior = options?.behavior ?? "smooth"
  const margin = options?.marginPx ?? 12
  const bottomInset = measurePinnedDrawerFooterInsetPx()

  const scrollParent =
    element.closest<HTMLElement>("[data-drawer-scroll-body]") ??
    findOverflowScrollParent(element)

  if (!scrollParent) {
    element.scrollIntoView({ behavior, block: "start" })
    return
  }

  const parentRect = scrollParent.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()
  const visibleTop = parentRect.top + margin
  const visibleBottom = parentRect.bottom - bottomInset - margin
  const visibleBandHeight = Math.max(0, visibleBottom - visibleTop)

  if (visibleBandHeight <= 0) {
    element.scrollIntoView({ behavior, block: "start" })
    return
  }

  let deltaY = 0

  if (elementRect.height <= visibleBandHeight) {
    if (elementRect.top < visibleTop) {
      deltaY = elementRect.top - visibleTop
    } else if (elementRect.bottom > visibleBottom) {
      deltaY = elementRect.bottom - visibleBottom
    }
  } else if (elementRect.top < visibleTop || elementRect.bottom > visibleBottom) {
    deltaY = elementRect.top - visibleTop
  }

  if (Math.abs(deltaY) > 2) {
    scrollParent.scrollBy({ top: deltaY, behavior })
  }
}
