"use client"

import { Clock3, MapPin, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SocialContactCTAProps {
  eyebrow?: string
  headline: string
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
  eyebrow = "Contato rapido",
  headline,
  whatsapp,
  openingHours,
  location,
  primaryActionLabel,
  onPrimaryAction,
}: SocialContactCTAProps) {
  const whatsappHref = `https://wa.me/${whatsapp.replace(/\D/g, "")}`
  const whatsappLabel = formatWhatsAppLabel(whatsapp)

  return (
    <section className="mb-8">
      <div className="rounded-[22px] border border-border/50 bg-secondary/25 p-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
          <p className="text-[15px] leading-6 text-foreground text-pretty">{headline}</p>
        </div>

        <div className="mt-4 space-y-2.5">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl bg-background/70 px-3 py-2.5 transition-colors hover:bg-background"
          >
            <MessageCircle className="h-4 w-4 text-accent" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">WhatsApp</p>
              <p className="truncate text-sm font-medium text-foreground">{whatsappLabel}</p>
            </div>
          </a>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-background/70 px-3 py-2.5">
              <Clock3 className="h-4 w-4 text-accent" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Horario</p>
                <p className="truncate text-sm font-medium text-foreground">{openingHours}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-background/70 px-3 py-2.5">
              <MapPin className="h-4 w-4 text-accent" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Local</p>
                <p className="truncate text-sm font-medium text-foreground">{location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Button type="button" className="h-11 rounded-2xl px-5" onClick={onPrimaryAction}>
            {primaryActionLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}
