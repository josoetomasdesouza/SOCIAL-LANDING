"use client"

import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { socialPatternClasses } from "./social-patterns"

type SocialContactIcon = "message-circle" | "mail" | "phone" | "clock" | "map-pin"

interface SocialContactItem {
  label: string
  value: string
  href?: string
  icon: SocialContactIcon
}

interface SocialContactCTAProps {
  contextLabel?: string
  eyebrow?: string
  headline: string
  subheadline?: string
  whatsapp?: string
  openingHours?: string
  location?: string
  primaryContact?: SocialContactItem
  secondaryItems?: SocialContactItem[]
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

function renderContactIcon(icon: SocialContactIcon) {
  switch (icon) {
    case "mail":
      return <Mail className="h-4 w-4 text-accent" />
    case "phone":
      return <Phone className="h-4 w-4 text-accent" />
    case "clock":
      return <Clock3 className="h-4 w-4 text-accent" />
    case "map-pin":
      return <MapPin className="h-4 w-4 text-accent" />
    case "message-circle":
    default:
      return <MessageCircle className="h-4 w-4 text-accent" />
  }
}

export function SocialContactCTA({
  contextLabel,
  eyebrow = "Contato rapido",
  headline,
  subheadline,
  whatsapp,
  openingHours,
  location,
  primaryContact,
  secondaryItems,
  primaryActionLabel,
  onPrimaryAction,
}: SocialContactCTAProps) {
  const resolvedContextLabel = contextLabel || eyebrow
  const resolvedPrimaryContact = primaryContact || (
    whatsapp
      ? {
          label: "WhatsApp",
          value: formatWhatsAppLabel(whatsapp),
          href: `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
          icon: "message-circle" as const,
        }
      : undefined
  )

  const resolvedSecondaryItems = secondaryItems || [
    ...(openingHours
      ? [{ label: "Horario", value: openingHours, icon: "clock" as const }]
      : []),
    ...(location
      ? [{ label: "Local", value: location, icon: "map-pin" as const }]
      : []),
  ]

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
          {resolvedPrimaryContact && (
            <a
              href={resolvedPrimaryContact.href}
              target={resolvedPrimaryContact.href ? "_blank" : undefined}
              rel={resolvedPrimaryContact.href ? "noreferrer" : undefined}
              className={`flex items-center gap-3 ${socialPatternClasses.itemSurface} transition-colors hover:bg-background`}
            >
              {renderContactIcon(resolvedPrimaryContact.icon)}
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{resolvedPrimaryContact.label}</p>
                <p className="truncate text-sm font-medium text-foreground">{resolvedPrimaryContact.value}</p>
              </div>
            </a>
          )}

          {resolvedSecondaryItems.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {resolvedSecondaryItems.slice(0, 2).map((item) => (
                <div key={`${item.label}-${item.value}`} className={`flex items-center gap-3 ${socialPatternClasses.itemSurface}`}>
                  {renderContactIcon(item.icon)}
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="truncate text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
