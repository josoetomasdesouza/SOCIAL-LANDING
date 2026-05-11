"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SocialCompactHeroProps {
  brandLogo: string
  brandName: string
  eyebrow?: string
  headline: string
  subheadline: string
  primaryActionLabel: string
  onPrimaryAction: () => void
  highlights: string[]
}

export function SocialCompactHero({
  brandLogo,
  brandName,
  eyebrow,
  headline,
  subheadline,
  primaryActionLabel,
  onPrimaryAction,
  highlights,
}: SocialCompactHeroProps) {
  return (
    <section className="px-4 sm:px-5 pt-4">
      <div className="rounded-[28px] border border-border/60 bg-card/95 shadow-sm">
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-border/60">
              <Image src={brandLogo} alt={brandName} fill className="object-cover" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">{brandName}</p>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  Destaque
                </span>
              </div>

              {eyebrow && (
                <p className="truncate text-xs text-muted-foreground">{eyebrow}</p>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <h2 className="text-[1.6rem] font-semibold leading-tight text-balance text-foreground">
              {headline}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              {subheadline}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {highlights.slice(0, 3).map((highlight) => (
              <span
                key={highlight}
                className="rounded-full border border-border/60 bg-secondary/70 px-3 py-1.5 text-xs font-medium text-foreground/80"
              >
                {highlight}
              </span>
            ))}
          </div>

          <div className="mt-5">
            <Button className="h-11 rounded-2xl px-5" onClick={onPrimaryAction}>
              {primaryActionLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
