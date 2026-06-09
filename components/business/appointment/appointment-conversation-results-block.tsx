"use client"

import Image from "next/image"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Professional, Service } from "@/lib/business-types"
import type { AppointmentSearchResult } from "@/lib/mock-data/appointment-conversational-search"

interface AppointmentConversationResultsBlockProps {
  items: AppointmentSearchResult[]
  barbers: Professional[]
  services: Service[]
  onSelectBarber: (barber: Professional) => void
  onSelectService: (service: Service) => void
}

function resolveBarber(barbers: Professional[], result: AppointmentSearchResult) {
  return barbers.find((barber) => barber.id === result.id) ?? null
}

function resolveService(services: Service[], result: AppointmentSearchResult) {
  return services.find((service) => service.id === result.id) ?? null
}

const CONVERSATION_RESULT_CARD_CLASS =
  "flex gap-3 p-3 rounded-xl border border-border/45 bg-white shadow-[0_6px_18px_-16px_rgba(15,23,42,0.12)]"

export function AppointmentConversationResultsBlock({
  items,
  barbers,
  services,
  onSelectBarber,
  onSelectService,
}: AppointmentConversationResultsBlockProps) {
  return (
    <div className="flex flex-col gap-2" data-testid="appointment-conversation-results-block">
      {items.map((result) => {
        if (result.kind === "barber") {
          const barber = resolveBarber(barbers, result)
          if (!barber) return null

          return (
            <div
              key={`barber-${result.id}`}
              className={CONVERSATION_RESULT_CARD_CLASS}
            >
              <button
                type="button"
                onClick={() => onSelectBarber(barber)}
                className="flex flex-1 gap-3 text-left min-w-0"
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <Image src={result.image} alt={result.title} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-foreground line-clamp-1">{result.title}</p>
                  {result.subtitle ? (
                    <p className="text-xs text-muted-foreground line-clamp-1">{result.subtitle}</p>
                  ) : null}
                </div>
              </button>
              <Button
                size="sm"
                variant="secondary"
                className="self-center flex-shrink-0"
                onClick={() => onSelectBarber(barber)}
              >
                <Calendar className="w-4 h-4 mr-1" />
                {result.ctaLabel ?? "Ver horarios"}
              </Button>
            </div>
          )
        }

        const service = resolveService(services, result)
        if (!service) return null

        return (
          <div
            key={`service-${result.id}`}
            className={CONVERSATION_RESULT_CARD_CLASS}
          >
            <button
              type="button"
              onClick={() => onSelectService(service)}
              className="flex flex-1 gap-3 text-left min-w-0"
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                <Image src={result.image} alt={result.title} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-foreground line-clamp-1">{result.title}</p>
                {result.subtitle ? (
                  <p className="text-xs text-muted-foreground line-clamp-1">{result.subtitle}</p>
                ) : null}
                {typeof result.price === "number" ? (
                  <p className="text-sm font-semibold text-accent mt-1">
                    R$ {result.price.toFixed(2).replace(".", ",")}
                  </p>
                ) : null}
              </div>
            </button>
            <Button
              size="sm"
              variant="secondary"
              className="self-center flex-shrink-0"
              onClick={() => onSelectService(service)}
            >
              {result.ctaLabel ?? "Ver opcoes"}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
