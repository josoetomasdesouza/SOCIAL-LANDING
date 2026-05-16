"use client"

import { useRef, useState, type ReactNode } from "react"
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
  const [isPressing, setIsPressing] = useState(false)

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    ignoreInteractionRef.current = isInteractiveTarget(event.target)
    longPressTriggeredRef.current = false
    setIsPressing(!ignoreInteractionRef.current && Boolean(onLongPress))

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
    setIsPressing(false)
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
        "relative isolate will-change-transform transition-[background-color,border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] before:pointer-events-none before:absolute before:inset-[2px] before:rounded-[inherit] before:content-[''] before:opacity-0 before:transition-[opacity,box-shadow,background-color] before:duration-200 before:ease-[cubic-bezier(0.22,1,0.36,1)]",
        isPressing &&
          "scale-[0.992] before:opacity-100 before:bg-white/35 dark:before:bg-white/[0.035] before:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]",
        selected &&
          "before:opacity-100 before:bg-accent/[0.055] before:ring-1 before:ring-inset before:ring-accent/20 before:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] shadow-[0_20px_44px_-36px_rgba(15,23,42,0.42)]",
        className
      )}
    >
      {children}
    </Component>
  )
}
