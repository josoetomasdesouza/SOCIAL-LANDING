"use client"

import { useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

const LONG_PRESS_MS = 420

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false

  return Boolean(
    target.closest("button, a, input, textarea, select, label, [data-no-context-select='true']")
  )
}

interface ContextSelectableProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  onLongPress?: () => void
  selected?: boolean
  as?: "article" | "div" | "button"
}

export function ContextSelectable({
  children,
  className,
  onClick,
  onLongPress,
  selected = false,
  as = "div",
}: ContextSelectableProps) {
  const timerRef = useRef<number | null>(null)
  const longPressTriggeredRef = useRef(false)
  const ignoreInteractionRef = useRef(false)

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    ignoreInteractionRef.current = isInteractiveTarget(event.target)
    longPressTriggeredRef.current = false

    if (ignoreInteractionRef.current || !onLongPress) return

    timerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true
      onLongPress()

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(12)
      }
    }, LONG_PRESS_MS)
  }

  const handlePointerEnd = () => {
    clearTimer()
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (ignoreInteractionRef.current) {
      ignoreInteractionRef.current = false
      return
    }

    if (longPressTriggeredRef.current) {
      event.preventDefault()
      event.stopPropagation()
      longPressTriggeredRef.current = false
      return
    }

    onClick?.()
  }

  const Component = as
  const isButton = Component === "button"

  return (
    <Component
      {...(isButton ? { type: "button" as const } : {})}
      onClick={handleClick}
      onContextMenu={(event) => {
        if (longPressTriggeredRef.current) {
          event.preventDefault()
        }
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
        if (isButton || (!onClick && !onLongPress)) return

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onClick?.()
        }
      }}
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerEnd}
      onPointerUp={handlePointerEnd}
      {...(!isButton && (onClick || onLongPress)
        ? {
            role: "button" as const,
            tabIndex: 0,
            "aria-pressed": selected,
          }
        : {})}
      className={cn(
        "relative transition-[background-color,border-color,box-shadow,transform]",
        selected &&
          "rounded-[28px] bg-accent/[0.035] ring-2 ring-accent/35 ring-offset-2 ring-offset-background shadow-[0_14px_32px_-28px_rgba(0,0,0,0.45)]",
        className
      )}
    >
      {children}
    </Component>
  )
}
