"use client"

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"

export const DRAWER_DRAG_CLOSE_THRESHOLD_PX = 72
export const DRAWER_DRAG_MAX_UP_PX = 120

function applyUpwardResistance(offsetPx: number): number {
  if (offsetPx >= -DRAWER_DRAG_MAX_UP_PX) return offsetPx

  const excess = -offsetPx - DRAWER_DRAG_MAX_UP_PX
  return -(DRAWER_DRAG_MAX_UP_PX + excess * 0.3)
}

export type DrawerDragHandleProps = {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void
}

export function useDrawerSheetDrag(onClose: () => void) {
  const dragStateRef = useRef<{ pointerId: number; startY: number } | null>(null)
  const [dragOffsetPx, setDragOffsetPx] = useState(0)

  const resetDrag = useCallback(() => {
    dragStateRef.current = null
    setDragOffsetPx(0)
  }, [])

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return

    dragStateRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [])

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) return

    const deltaY = event.clientY - dragState.startY
    setDragOffsetPx(deltaY < 0 ? applyUpwardResistance(deltaY) : deltaY)
  }, [])

  const finalizePointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const dragState = dragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) return

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      const deltaY = event.clientY - dragState.startY
      resetDrag()

      if (deltaY >= DRAWER_DRAG_CLOSE_THRESHOLD_PX) {
        onClose()
      }
    },
    [onClose, resetDrag]
  )

  const dragHandleProps: DrawerDragHandleProps = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: finalizePointer,
    onPointerCancel: finalizePointer,
  }

  return {
    dragOffsetPx,
    resetDrag,
    isDragging: dragOffsetPx !== 0,
    dragHandleProps,
    getBackdropOpacity: (baseOpacity = 0.5) =>
      dragOffsetPx > 0 ? Math.max(0.2, baseOpacity - dragOffsetPx / 320) : baseOpacity,
  }
}

export function getDrawerSheetTransform(
  dragOffsetPx: number,
  options?: { centered?: boolean }
): string {
  if (options?.centered) {
    return `translate(-50%, ${dragOffsetPx}px)`
  }

  return `translateY(${dragOffsetPx}px)`
}
