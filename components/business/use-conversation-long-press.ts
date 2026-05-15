"use client"

import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react"

interface UseConversationLongPressOptions {
  onLongPress: () => void
  duration?: number
  moveThreshold?: number
}

export function useConversationLongPress({
  onLongPress,
  duration = 450,
  moveThreshold = 10,
}: UseConversationLongPressOptions) {
  const longPressTimerRef = useRef<number | null>(null)
  const longPressTriggeredRef = useRef(false)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  useEffect(() => clearLongPressTimer, [clearLongPressTimer])

  const shouldIgnoreLongPress = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (!(event.target instanceof HTMLElement) || !(event.currentTarget instanceof HTMLElement)) {
      return false
    }

    const interactiveTarget = event.target.closest("button, input, textarea, a")
    return interactiveTarget !== null && interactiveTarget !== event.currentTarget
  }, [])

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (shouldIgnoreLongPress(event)) return
    if (event.pointerType === "mouse" && event.button !== 0) return

    longPressTriggeredRef.current = false
    pointerStartRef.current = { x: event.clientX, y: event.clientY }
    clearLongPressTimer()
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true
      onLongPress()
    }, duration)
  }, [clearLongPressTimer, duration, onLongPress, shouldIgnoreLongPress])

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (!pointerStartRef.current || longPressTimerRef.current === null) return

    const distanceX = Math.abs(event.clientX - pointerStartRef.current.x)
    const distanceY = Math.abs(event.clientY - pointerStartRef.current.y)

    if (distanceX > moveThreshold || distanceY > moveThreshold) {
      clearLongPressTimer()
    }
  }, [clearLongPressTimer, moveThreshold])

  const handlePointerEnd = useCallback(() => {
    pointerStartRef.current = null
    clearLongPressTimer()
  }, [clearLongPressTimer])

  const shouldHandleActivation = useCallback(() => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false
      return false
    }

    return true
  }, [])

  return {
    longPressHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
      onPointerLeave: handlePointerEnd,
    },
    shouldHandleActivation,
  }
}
