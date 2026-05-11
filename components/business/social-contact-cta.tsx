"use client"

import { Clock3, MapPin, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { socialPatternClasses } from "./social-patterns"

interface SocialContactCTAProps {
  contextLabel?: string
  eyebrow?: string
  headline: string
  subheadline?: string
  whatsapp: string
  openingHours: string
  location: string
  primaryActionLabel: string
  onPrimaryAction: () => void
}

function formatWhatsAppLabel(whatsapp: string) {
  const digits = whatsapp.replace(/\D/g, "")
  const localDigits = digits.startsWith("55") ? digits.slice(2) : digits

  if (localDigits.length === 11) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 7)}-${localDigits.slice(7)}`
  }

  if (localDigits.length === 10) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 6)}-${localDigits.slice(6)}`
  }

  return whatsapp
}

export function SocialContactCTA({
  contextLabel,
  eyebrow = "Contato rapido",
  headline,
  subheadline,
  whatsapp,
  openingHours,
  location,
  primaryActionLabel,
  onPrimaryAction,
}: SocialContactCTAProps) {
  const whatsappHref = `https://wa.me/${whatsapp.replace(/\D/g, "")}`
  const whatsappLabel = formatWhatsAppLabel(whatsapp)
  const resolvedContextLabel = contextLabel || eyebrow

  return (
    <section className={socialPatternClasses.sectionSpacing}>
      <div className={socialPatternClasses.compactSurface}>
        <div className="space-y-1">
          <p className={socialPatternClasses.editorialContext}>{resolvedContextLabel}</p>
          <p className={socialPatternClasses.editorialHeadline}>{headline}</p>
          {subheadline && (
            <p className={socialPatternClasses.editorialSubheadline}>{subheadline}</p>
          )}
        </div>

        <div className="mt-4 space-y-2.5">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-3 ${socialPatternClasses.itemSurface} transition-colors hover:bg-background`}
          >
            <MessageCircle className="h-4 w-4 text-accent" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">WhatsApp</p>
              <p className="truncate text-sm font-medium text-foreground">{whatsappLabel}</p>
            </div>
          </a>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className={`flex items-center gap-3 ${socialPatternClasses.itemSurface}`}>
              <Clock3 className="h-4 w-4 text-accent" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Horario</p>
                <p className="truncate text-sm font-medium text-foreground">{openingHours}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 ${socialPatternClasses.itemSurface}`}>
              <MapPin className="h-4 w-4 text-accent" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Local</p>
                <p className="truncate text-sm font-medium text-foreground">{location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Button type="button" className={socialPatternClasses.primaryAction} onClick={onPrimaryAction}>
            {primaryActionLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}
