"use client"

import { cn } from "@/lib/utils"
import type { DrawerDragHandleProps } from "@/lib/ui/use-drawer-sheet-drag"

export function DrawerDragHandleBar({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center pt-3 pb-2", className)}>
      <div className="h-1 w-10 rounded-full bg-border" />
    </div>
  )
}

interface DrawerDragZoneProps {
  children: React.ReactNode
  dragHandleProps: DrawerDragHandleProps
  className?: string
}

export function DrawerDragZone({ children, dragHandleProps, className }: DrawerDragZoneProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 touch-none cursor-grab flex-col active:cursor-grabbing",
        className
      )}
      {...dragHandleProps}
    >
      <DrawerDragHandleBar />
      {children}
    </div>
  )
}
