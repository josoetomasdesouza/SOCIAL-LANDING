"use client"

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { getDrawerMaxUpDragPx, getVisualPullOffset } from "@/lib/ui/drawer-layout"

export const DRAWER_PULL_CLOSE_MIN_PX = 60
export const DRAWER_PULL_ACTIVATION_PX = 4
const SCROLL_TOP_TOLERANCE_PX = 2
const DRAWER_DRAG_ZONE_SELECTOR = "[data-drawer-drag-zone]"
const DRAWER_INTERACTIVE_SELECTOR =
  "button, a, input, textarea, select, label, [role='slider'], [contenteditable='true'], [data-no-drawer-pull='true']"

export type DrawerDragHandleProps = {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void
}

type DragSource = "handle" | "sheet"

type DragState = {
  pointerId: number
  startY: number
  source: DragSource
  pulling: boolean
}

type SheetGestureState = {
  pointerId: number
  pullOriginY: number
  lastClientY: number
  bypassScrollTopCheck: boolean
}

function getCloseThresholdPx(sheetHeightPx: number) {
  return Math.min(DRAWER_PULL_CLOSE_MIN_PX, sheetHeightPx * 0.25)
}

function releaseHandlePointerCapture(event: ReactPointerEvent<HTMLElement>) {
  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId)
  }
}

function isScrollElementAtTop(scrollEl: HTMLDivElement | null) {
  return !scrollEl || scrollEl.scrollTop <= SCROLL_TOP_TOLERANCE_PX
}

function isDrawerInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest(DRAWER_INTERACTIVE_SELECTOR))
}

function isDrawerHandleTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest(DRAWER_DRAG_ZONE_SELECTOR))
}

function shouldBypassScrollTopCheck(target: EventTarget | null, scrollEl: HTMLDivElement | null) {
  if (!(target instanceof Element) || !scrollEl) return true
  return !scrollEl.contains(target)
}

export function useDrawerSheetDrag(onClose: () => void, active = true) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef<DragState | null>(null)
  const sheetGestureRef = useRef<SheetGestureState | null>(null)
  const onCloseRef = useRef(onClose)
  const activeRef = useRef(active)
  const [rawDragOffsetPx, setRawDragOffsetPx] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const [scrollReady, setScrollReady] = useState(false)
  const [sheetReady, setSheetReady] = useState(false)

  onCloseRef.current = onClose
  activeRef.current = active

  const clearPullVisual = useCallback(() => {
    setRawDragOffsetPx(0)
    setIsPulling(false)
    if (dragStateRef.current?.source === "sheet") {
      dragStateRef.current = null
    }
  }, [])

  const resetDrag = useCallback(() => {
    dragStateRef.current = null
    sheetGestureRef.current = null
    setRawDragOffsetPx(0)
    setIsPulling(false)
  }, [])

  const resolveCloseThreshold = useCallback(() => {
    const height = sheetRef.current?.offsetHeight ?? 400
    return getCloseThresholdPx(height)
  }, [])

  const finishDrag = useCallback(
    (clientY: number, pointerId: number) => {
      const dragState = dragStateRef.current
      if (!dragState || dragState.pointerId !== pointerId) {
        sheetGestureRef.current = null
        return
      }

      const deltaY = clientY - dragState.startY
      const shouldClose = dragState.pulling && deltaY >= resolveCloseThreshold()
      resetDrag()

      if (shouldClose) {
        onCloseRef.current()
      }
    },
    [resetDrag, resolveCloseThreshold]
  )

  const applyHandleDragDelta = useCallback((clientY: number, dragState: DragState) => {
    const maxUpPx = getDrawerMaxUpDragPx()
    setRawDragOffsetPx(Math.max(-maxUpPx, clientY - dragState.startY))
  }, [])

  const startHandleDrag = useCallback((clientY: number, pointerId: number) => {
    if (!activeRef.current) return

    sheetGestureRef.current = null
    dragStateRef.current = {
      pointerId,
      startY: clientY,
      source: "handle",
      pulling: true,
    }
    setIsPulling(false)
  }, [])

  const beginSheetGesture = useCallback(
    (clientY: number, pointerId: number, bypassScrollTopCheck: boolean) => {
      if (!activeRef.current) return

      dragStateRef.current = null
      sheetGestureRef.current = {
        pointerId,
        pullOriginY: clientY,
        lastClientY: clientY,
        bypassScrollTopCheck,
      }
    },
    []
  )

  const updateSheetPull = useCallback(
    (clientY: number, pointerId: number) => {
      const gesture = sheetGestureRef.current
      if (!gesture || gesture.pointerId !== pointerId) return false

      gesture.lastClientY = clientY

      const scrollEl = scrollRef.current
      const canPull =
        gesture.bypassScrollTopCheck || isScrollElementAtTop(scrollEl)

      if (!canPull) {
        clearPullVisual()
        return false
      }

      const deltaY = clientY - gesture.pullOriginY
      if (deltaY <= 0) {
        clearPullVisual()
        return false
      }

      if (deltaY < DRAWER_PULL_ACTIVATION_PX) {
        return true
      }

      dragStateRef.current = {
        pointerId,
        startY: gesture.pullOriginY,
        source: "sheet",
        pulling: true,
      }
      setIsPulling(true)
      setRawDragOffsetPx(deltaY)
      return true
    },
    [clearPullVisual]
  )

  const anchorPullOriginAtTop = useCallback(() => {
    const gesture = sheetGestureRef.current
    const scrollEl = scrollRef.current
    if (!gesture || !scrollEl || !isScrollElementAtTop(scrollEl)) return

    gesture.pullOriginY = gesture.lastClientY
    gesture.bypassScrollTopCheck = false
  }, [])

  useEffect(() => {
    if (!active) {
      resetDrag()
      setScrollReady(false)
      setSheetReady(false)
    }
  }, [active, resetDrag])

  useEffect(() => {
    if (!active) return

    const handleWindowPointerMove = (event: PointerEvent) => {
      const handleDrag = dragStateRef.current
      if (handleDrag?.source === "handle" && handleDrag.pointerId === event.pointerId) {
        applyHandleDragDelta(event.clientY, handleDrag)
        event.preventDefault()
        return
      }

      const shouldPrevent = updateSheetPull(event.clientY, event.pointerId)
      if (!shouldPrevent) return

      event.preventDefault()

      const sheetEl = sheetRef.current
      if (
        sheetEl &&
        dragStateRef.current?.source === "sheet" &&
        dragStateRef.current.pointerId === event.pointerId &&
        !sheetEl.hasPointerCapture(event.pointerId)
      ) {
        sheetEl.setPointerCapture(event.pointerId)
      }
    }

    const handleWindowTouchMove = (event: TouchEvent) => {
      const gesture = sheetGestureRef.current
      const touch = event.touches[0]
      if (!gesture || !touch) return

      const shouldPrevent = updateSheetPull(touch.clientY, gesture.pointerId)
      if (!shouldPrevent) return

      event.preventDefault()
    }

    const handleWindowPointerEnd = (event: PointerEvent) => {
      const sheetEl = sheetRef.current
      if (sheetEl?.hasPointerCapture(event.pointerId)) {
        sheetEl.releasePointerCapture(event.pointerId)
      }

      const handleDrag = dragStateRef.current
      if (handleDrag?.source === "handle" && handleDrag.pointerId === event.pointerId) {
        finishDrag(event.clientY, event.pointerId)
        return
      }

      finishDrag(event.clientY, event.pointerId)
    }

    window.addEventListener("pointermove", handleWindowPointerMove, { passive: false })
    window.addEventListener("touchmove", handleWindowTouchMove, { passive: false })
    window.addEventListener("pointerup", handleWindowPointerEnd)
    window.addEventListener("pointercancel", handleWindowPointerEnd)

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove)
      window.removeEventListener("touchmove", handleWindowTouchMove)
      window.removeEventListener("pointerup", handleWindowPointerEnd)
      window.removeEventListener("pointercancel", handleWindowPointerEnd)
    }
  }, [active, applyHandleDragDelta, finishDrag, updateSheetPull])

  useEffect(() => {
    if (!active || !sheetReady) return

    const sheetEl = sheetRef.current
    const scrollEl = scrollRef.current
    if (!sheetEl) return

    const onScroll = () => {
      anchorPullOriginAtTop()
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return
      if (!sheetEl.contains(event.target as Node)) return
      if (isDrawerHandleTarget(event.target) || isDrawerInteractiveTarget(event.target)) return

      beginSheetGesture(
        event.clientY,
        event.pointerId,
        shouldBypassScrollTopCheck(event.target, scrollEl)
      )
    }

    const onDragStart = (event: DragEvent) => {
      if (!sheetEl.contains(event.target as Node)) return
      event.preventDefault()
    }

    sheetEl.addEventListener("pointerdown", onPointerDown, { capture: true })
    sheetEl.addEventListener("dragstart", onDragStart, { capture: true })
    scrollEl?.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      sheetEl.removeEventListener("pointerdown", onPointerDown, { capture: true })
      sheetEl.removeEventListener("dragstart", onDragStart, { capture: true })
      scrollEl?.removeEventListener("scroll", onScroll)
    }
  }, [active, sheetReady, scrollReady, beginSheetGesture, anchorPullOriginAtTop])

  const dragHandleProps: DrawerDragHandleProps = {
    onPointerDown: (event) => {
      if (event.button !== 0) return

      event.currentTarget.setPointerCapture(event.pointerId)
      startHandleDrag(event.clientY, event.pointerId)
    },
    onPointerUp: (event) => {
      releaseHandlePointerCapture(event)
      finishDrag(event.clientY, event.pointerId)
    },
    onPointerCancel: (event) => {
      releaseHandlePointerCapture(event)
      finishDrag(event.clientY, event.pointerId)
    },
  }

  const setScrollRef = useCallback((node: HTMLDivElement | null) => {
    scrollRef.current = node
    setScrollReady(node !== null)
  }, [])

  const setSheetRef = useCallback(
    (node: HTMLDivElement | null) => {
      sheetRef.current = node
      setSheetReady(node !== null)
    },
    []
  )

  return {
    sheetRef: setSheetRef,
    scrollRef,
    setScrollRef,
    rawDragOffsetPx,
    dragOffsetPx: rawDragOffsetPx,
    resetDrag,
    isDragging: isPulling || rawDragOffsetPx !== 0,
    isPulling,
    dragHandleProps,
    getBackdropOpacity: (baseOpacity = 0.5) => {
      const visualOffset = getVisualPullOffset(rawDragOffsetPx)
      return visualOffset > 0
        ? Math.max(0.2, baseOpacity - visualOffset / 320)
        : baseOpacity
    },
  }
}
