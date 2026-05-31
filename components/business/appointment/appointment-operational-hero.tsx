"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { socialPatternClasses } from "../social-patterns"

export interface AppointmentHeroHighlight {
  label: string
  onSelect: () => void
}

interface AppointmentOperationalHeroProps {
  brandName: string
  coverImage: string
  coverAlt: string
  operationalStatus: string
  headline: string
  primaryActionLabel: string
  onPrimaryAction: () => void
  highlights: AppointmentHeroHighlight[]
}

export function AppointmentOperationalHero({
  brandName,
  coverImage,
  coverAlt,
  operationalStatus,
  headline,
  primaryActionLabel,
  onPrimaryAction,
  highlights,
}: AppointmentOperationalHeroProps) {
  return (
    <section
      aria-label={`Presença da ${brandName}`}
      className="flex min-h-[40vh] max-h-[55vh] flex-col overflow-hidden border-b border-border/30 -mx-4 sm:-mx-5"
      data-testid="appointment-operational-hero"
    >
      <div className="relative min-h-[22vh] max-h-[38vh] flex-[1_1_38%] w-full overflow-hidden">
        <Image src={coverImage} alt={coverAlt} fill priority className="object-cover" sizes="(max-width: 600px) 100vw, 600px" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

        <div className="absolute inset-x-0 bottom-0 px-4 pb-3 sm:px-5">
          <p className="text-lg font-semibold leading-tight text-white">{brandName}</p>
          <p className={cn(socialPatternClasses.editorialContext, "mt-1 text-white/75")}>{operationalStatus}</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3 px-4 py-3 sm:px-5">
        <p className={socialPatternClasses.editorialHeadline}>{headline}</p>

        <Button type="button" className={socialPatternClasses.primaryAction + " w-full sm:w-auto"} onClick={onPrimaryAction}>
          {primaryActionLabel}
        </Button>

        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {highlights.map((highlight) => (
            <button
              key={highlight.label}
              type="button"
              onClick={highlight.onSelect}
              className="shrink-0 rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs font-medium text-foreground/90 transition-colors hover:bg-secondary/70"
            >
              {highlight.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
