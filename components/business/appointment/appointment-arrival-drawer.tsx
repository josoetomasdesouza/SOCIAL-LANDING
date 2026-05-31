"use client"

import { observeWhatsAppClicked } from "@/lib/events/instrumentation"
import { Button } from "@/components/ui/button"
import { ActionDrawer } from "../action-drawer"
import { socialPatternClasses } from "../social-patterns"
import type { AppointmentArrivalContext } from "@/lib/mock-data/appointment-data"

interface AppointmentArrivalDrawerProps {
  isOpen: boolean
  onClose: () => void
  arrival: AppointmentArrivalContext
  whatsapp?: string
}

export function AppointmentArrivalDrawer({
  isOpen,
  onClose,
  arrival,
  whatsapp,
}: AppointmentArrivalDrawerProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(arrival.mapsQuery)}`
  const whatsappUrl = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : undefined

  return (
    <ActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      drawerId="appointment-arrival"
      title={arrival.drawerTitle}
      subtitle={arrival.addressLine}
      size="sm"
      footer={
        <div className="flex flex-col gap-2">
          <Button type="button" className={socialPatternClasses.primaryAction + " w-full"} asChild>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              Abrir no Maps
            </a>
          </Button>
          {whatsappUrl ? (
            <Button type="button" variant="outline" className="h-11 w-full rounded-2xl" asChild>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  observeWhatsAppClicked({
                    phone: whatsapp ?? "",
                    context: "contextual-arrival",
                    href: whatsappUrl,
                    source: "action-drawer",
                  })
                }
              >
                Chamar no WhatsApp
              </a>
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-2.5" data-testid="appointment-arrival-drawer">
        <p className={socialPatternClasses.editorialHeadline}>{arrival.referenceHint}</p>

        <div className="space-y-1.5">
          {arrival.routeHint ? (
            <p className={socialPatternClasses.editorialSubheadline}>{arrival.routeHint}</p>
          ) : null}

          {arrival.parkingHint ? (
            <p className={socialPatternClasses.editorialSubheadline}>{arrival.parkingHint}</p>
          ) : null}

          {arrival.arrivalMood ? (
            <p className={socialPatternClasses.editorialSubheadline}>{arrival.arrivalMood}</p>
          ) : null}
        </div>
      </div>
    </ActionDrawer>
  )
}
