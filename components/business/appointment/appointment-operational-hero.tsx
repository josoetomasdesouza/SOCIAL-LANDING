"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useConversationSelectionContext } from "../conversation-selection-context"
import { shouldRenderThreadInFlow } from "@/lib/ui/composer-layout"

interface AppointmentOperationalHeroProps {
  brandName: string
  coverImage: string
  coverAlt: string
}

export function AppointmentOperationalHero({
  brandName,
  coverImage,
  coverAlt,
}: AppointmentOperationalHeroProps) {
  const conversationSelection = useConversationSelectionContext()
  const isEngagedContextCard =
    shouldRenderThreadInFlow(conversationSelection?.composerLayoutVersion ?? "v1") &&
    (conversationSelection?.composerThreadEngagedProgress ?? 0) > 0

  return (
    <section
      aria-label={`Presença da ${brandName}`}
      className={cn(
        "sl-liquid-hero-shell flex min-h-[26vh] max-h-[34vh] flex-col overflow-hidden border-b border-border/30 -mx-4 sm:-mx-5",
        "max-[360px]:min-h-[24vh] max-[360px]:max-h-[32vh]",
        isEngagedContextCard &&
          "min-h-0 max-h-none border-border/20 bg-secondary/15 transition-[max-height,opacity] duration-300 ease-out max-[360px]:min-h-0 max-[360px]:max-h-none"
      )}
      data-testid="appointment-operational-hero"
      data-appointment-hero-engaged={isEngagedContextCard ? "true" : undefined}
    >
      <div
        className={cn(
          "relative min-h-[16vh] max-h-[24vh] flex-[1_1_30%] w-full overflow-hidden",
          "max-[360px]:min-h-[15vh] max-[360px]:max-h-[22vh] max-[360px]:flex-[1_1_28%]",
          isEngagedContextCard &&
            "min-h-[11vh] max-h-[14vh] flex-none max-[360px]:min-h-[10vh] max-[360px]:max-h-[13vh]"
        )}
      >
        <Image src={coverImage} alt={coverAlt} fill priority className="object-cover" sizes="(max-width: 600px) 100vw, 600px" />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/62 via-black/20 to-black/0",
            isEngagedContextCard && "from-black/62 via-black/24 to-black/5"
          )}
        />
        {isEngagedContextCard ? (
          <div className="absolute inset-0 bg-background/35 backdrop-blur-[1px]" aria-hidden />
        ) : null}
      </div>
    </section>
  )
}
