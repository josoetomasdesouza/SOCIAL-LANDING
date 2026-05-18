export interface ConversationContextChipRect {
  left: number
  top: number
  width: number
  height: number
  borderRadius: number
}

function isVisibleRect(rect: DOMRect) {
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0
}

function getEscapedSelectorValue(value: string) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value)
  }

  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function getElementBorderRadius(element: HTMLElement) {
  const computedStyles = window.getComputedStyle(element)
  const resolvedBorderRadius = Number.parseFloat(computedStyles.borderRadius)

  return Number.isFinite(resolvedBorderRadius) ? resolvedBorderRadius : 999
}

export function getConversationContextChipRect(contextId: string): ConversationContextChipRect | null {
  if (typeof document === "undefined") {
    return null
  }

  const escapedContextId = getEscapedSelectorValue(contextId)
  const chipSelector = `[data-conversation-context-chip="${escapedContextId}"]`
  const railChipElement = document.querySelector<HTMLElement>(`[data-conversation-context-rail="true"] ${chipSelector}`)
  const composerChipElement =
    railChipElement ??
    document.querySelector<HTMLElement>(`[data-conversation-composer="true"] ${chipSelector}`) ??
    document.querySelector<HTMLElement>(chipSelector)

  if (!composerChipElement) {
    return null
  }

  const chipRect = composerChipElement.getBoundingClientRect()

  if (!isVisibleRect(chipRect)) {
    return null
  }

  return {
    left: chipRect.left,
    top: chipRect.top,
    width: chipRect.width,
    height: chipRect.height,
    borderRadius: getElementBorderRadius(composerChipElement),
  }
}
