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
  selectionStyle?: "default" | "media" | "textual"
}

export function ContextSelectable({
  children,
  className,
  onClick,
  onLongPress,
  selected = false,
  as = "div",
  selectionStyle = "default",
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
  const selectionStyles = {
    default: {
      pressing:
        "scale-[0.998] shadow-[0_12px_28px_-20px_rgba(15,23,42,0.16)] after:opacity-100 after:bg-foreground/[0.012] dark:after:bg-white/[0.022]",
      selected:
        "z-[1] -translate-y-[2px] scale-[1.005] bg-background/82 shadow-[0_22px_40px_-22px_rgba(15,23,42,0.2)] after:opacity-100 after:bg-accent/[0.026]",
    },
    media: {
      pressing:
        "scale-[0.997] shadow-[0_16px_32px_-20px_rgba(15,23,42,0.18)] after:opacity-100 after:bg-black/[0.028] dark:after:bg-white/[0.026]",
      selected:
        "z-[1] -translate-y-[2px] scale-[1.004] shadow-[0_28px_52px_-26px_rgba(15,23,42,0.24)] after:opacity-100 after:bg-black/[0.034] dark:after:bg-white/[0.03]",
    },
    textual: {
      pressing:
        "scale-[0.999] shadow-[0_12px_24px_-20px_rgba(15,23,42,0.13)] after:opacity-100 after:bg-background/38 dark:after:bg-white/[0.022]",
      selected:
        "z-[1] -translate-y-[1.5px] scale-[1.003] bg-background/90 shadow-[0_20px_36px_-26px_rgba(15,23,42,0.17)] after:opacity-100 after:bg-accent/[0.02]",
    },
  } as const

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
        "relative isolate will-change-transform transition-[background-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] after:opacity-0 after:transition-[opacity,background-color] after:duration-200 after:ease-[cubic-bezier(0.22,1,0.36,1)]",
        isPressing && selectionStyles[selectionStyle].pressing,
        selected && selectionStyles[selectionStyle].selected,
        className
      )}
    >
      {children}
    </Component>
  )
}
