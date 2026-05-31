"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { socialPatternClasses } from "../social-patterns"
import type { AppointmentHeroOperationalContext } from "@/lib/mock-data/appointment-data"

export interface AppointmentHeroHighlight {
  label: string
  onSelect: () => void
}

interface AppointmentOperationalHeroProps {
  brandName: string
  coverImage: string
  coverAlt: string
  operationalContext: AppointmentHeroOperationalContext
  headline: string
  primaryActionLabel: string
  onPrimaryAction: () => void
  onPlaceHintSelect?: () => void
  highlights: AppointmentHeroHighlight[]
}

export function AppointmentOperationalHero({
  brandName,
  coverImage,
  coverAlt,
  operationalContext,
  headline,
  primaryActionLabel,
  onPrimaryAction,
  onPlaceHintSelect,
  highlights,
}: AppointmentOperationalHeroProps) {
  const { liveState, placeHint, momentHint, hoursHint } = operationalContext

  return (
    <section
      aria-label={`Presença da ${brandName}`}
      className="flex min-h-[40vh] max-h-[55vh] flex-col overflow-hidden border-b border-border/30 -mx-4 sm:-mx-5"
      data-testid="appointment-operational-hero"
    >
      <div className="relative min-h-[22vh] max-h-[38vh] flex-[1_1_38%] w-full overflow-hidden">
        <Image src={coverImage} alt={coverAlt} fill priority className="object-cover" sizes="(max-width: 600px) 100vw, 600px" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

        <div className="absolute inset-x-0 bottom-0 px-4 pb-3.5 sm:px-5">
          <p className="text-lg font-semibold leading-tight text-white drop-shadow-sm">{brandName}</p>
          <p
            className="mt-2 max-w-[95%] text-[13px] leading-[1.55] text-pretty text-white/90 drop-shadow-md"
            data-testid="appointment-operational-context-line"
          >
            <span className="inline-flex items-center gap-1.5 font-medium text-white">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/95" />
              {liveState}
            </span>
            {placeHint ? (
              <>
                {" · "}
                {onPlaceHintSelect ? (
                  <button
                    type="button"
                    onClick={onPlaceHintSelect}
                    className="group inline-flex cursor-pointer items-center gap-0.5 font-medium text-white underline decoration-white/50 underline-offset-[3px] transition-colors hover:text-white hover:decoration-white/85"
                    data-testid="appointment-arrival-place-hint"
                    aria-label={`Ver como chegar ${placeHint}`}
                  >
                    {placeHint}
                    <span
                      aria-hidden
                      className="text-[11px] leading-none opacity-75 transition-opacity group-hover:opacity-100"
                    >
                      ›
                    </span>
                  </button>
                ) : (
                  <span className="text-white/88">{placeHint}</span>
                )}
              </>
            ) : null}
            {momentHint ? <span className="text-white/88"> · {momentHint}</span> : null}
            {hoursHint ? <span className="text-white/88"> · {hoursHint}</span> : null}
          </p>
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
