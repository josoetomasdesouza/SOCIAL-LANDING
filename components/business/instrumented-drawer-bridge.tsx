"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { Drawer } from "@/components/ui/drawer"
import { observeDrawerClosed, observeDrawerOpened } from "@/lib/events/instrumentation"

type DrawerKind = "action" | "feed" | "cart" | "checkout" | "product" | "other"

interface InstrumentedDrawerBridgeProps {
  drawerId: string
  drawerKind?: DrawerKind
  title?: string
  vertical?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

/**
 * Passive instrumentation wrapper for Stack B shadcn/vaul drawers.
 * Does not control open state, scroll lock, or visual — only emits events on transitions.
 */
export function InstrumentedDrawerBridge({
  drawerId,
  drawerKind = "other",
  title,
  vertical,
  open,
  onOpenChange,
  children,
}: InstrumentedDrawerBridgeProps) {
  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      observeDrawerOpened({
        drawerId,
        drawerKind,
        title,
        vertical,
        source: "instrumentation",
      })
    } else if (!open && wasOpenRef.current) {
      observeDrawerClosed({
        drawerId,
        drawerKind,
        vertical,
        source: "instrumentation",
      })
    }
    wasOpenRef.current = open
  }, [open, drawerId, drawerKind, title, vertical])

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {children}
    </Drawer>
  )
}
