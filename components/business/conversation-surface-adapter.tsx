"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ConversationSurfaceAdapterProps {
  children: ReactNode
  className?: string
  mode?: "default" | "immersive"
}

export function ConversationSurfaceAdapter({
  children,
  className,
  mode = "default",
}: ConversationSurfaceAdapterProps) {
  return (
    <div
      className={cn(
        "space-y-5",
        mode === "immersive" && "space-y-6",
        className
      )}
    >
      {children}
    </div>
  )
}
