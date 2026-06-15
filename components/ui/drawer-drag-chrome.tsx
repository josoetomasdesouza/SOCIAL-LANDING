"use client"

import { cn } from "@/lib/utils"
import type { DrawerDragHandleProps } from "@/lib/ui/use-drawer-sheet-drag"

export function DrawerDragHandleBar({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center pt-2 pb-1", className)}>
      <div className="h-px w-[68px] rounded-full bg-gradient-to-r from-stone-700/10 via-stone-700/34 to-stone-700/10 shadow-[0_1px_1px_rgba(255,255,255,0.42),0_0_8px_rgba(28,25,23,0.06)]" />
    </div>
  )
}

interface DrawerDragZoneProps {
  children?: React.ReactNode
  dragHandleProps: DrawerDragHandleProps
  className?: string
}

export function DrawerDragZone({ children, dragHandleProps, className }: DrawerDragZoneProps) {
  return (
    <div
      data-drawer-drag-zone
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

interface DrawerScrollBodyProps {
  scrollRef?: React.Ref<HTMLDivElement>
  isPulling?: boolean
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function DrawerScrollBody({
  scrollRef,
  isPulling = false,
  className,
  style,
  children,
}: DrawerScrollBodyProps) {
  return (
    <div
      ref={scrollRef}
      data-drawer-scroll-body
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-y-none",
        "[&_img]:select-none [&_img]:[-webkit-user-drag:none]",
        isPulling ? "touch-none" : "touch-pan-y",
        className
      )}
      style={style}
      onDragStart={(event) => event.preventDefault()}
    >
      {children}
    </div>
  )
}
