"use client"

import { useMemo } from "react"
import {
  resolveComposerFeedThreadJunctionStyle,
  resolveComposerSurfaceIntensity,
} from "@/lib/ui/composer-surface-material"

interface ComposerFeedThreadJunctionProps {
  progress: number
}

export function ComposerFeedThreadJunction({ progress }: ComposerFeedThreadJunctionProps) {
  const intensity = resolveComposerSurfaceIntensity()
  const style = useMemo(
    () => resolveComposerFeedThreadJunctionStyle(intensity, progress),
    [intensity, progress]
  )

  if (progress <= 0) {
    return null
  }

  return (
    <div
      aria-hidden
      data-composer-feed-thread-junction="true"
      data-composer-thread-engaged-progress={progress.toFixed(2)}
      className="pointer-events-none relative z-[1] -mx-0 transition-opacity duration-300 ease-out"
      style={style}
    />
  )
}
