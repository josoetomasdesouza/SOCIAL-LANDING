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
    <section className="px-4 sm:px-5 pt-3">
      <div className="rounded-[24px] border border-border/60 bg-card/95 shadow-sm">
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-border/60">
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

          <div className="mt-3 space-y-1.5">
            <h2 className="text-[1.35rem] font-semibold leading-tight text-balance text-foreground">
              {headline}
            </h2>
            <p className="text-[13px] leading-5 text-muted-foreground text-pretty">
              {subheadline}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {highlights.slice(0, 2).map((highlight) => (
              <span
                key={highlight}
                className="rounded-full border border-border/60 bg-secondary/70 px-2.5 py-1 text-[11px] font-medium text-foreground/80"
              >
                {highlight}
              </span>
            ))}
          </div>

          <div className="mt-4">
            <Button className="h-10 rounded-2xl px-4 text-sm" onClick={onPrimaryAction}>
              {primaryActionLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
