"use client"

import {
  useComposerOverlayClearance,
  type ComposerScrollClearanceOptions,
} from "@/lib/ui/composer-scroll-clearance"

interface ComposerOverlayClearanceSpacerProps extends ComposerScrollClearanceOptions {
  className?: string
}

/** Reserves space above the compact composer for the last element in a scroll column. */
export function ComposerOverlayClearanceSpacer({
  reserveComposerClearance = true,
  className,
}: ComposerOverlayClearanceSpacerProps) {
  const { paddingBottom, isActive } = useComposerOverlayClearance({ reserveComposerClearance })

  if (!isActive) {
    return null
  }

  return (
    <div
      aria-hidden
      className={className ?? "pointer-events-none shrink-0"}
      style={{ height: paddingBottom, minHeight: paddingBottom }}
    />
  )
}
