"use client"

import Image from "next/image"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { HealthProfessional, HealthService } from "@/lib/business-types"
import type { HealthSearchResult } from "@/lib/mock-data/health-conversational-search"

interface HealthConversationResultsBlockProps {
  items: HealthSearchResult[]
  professionals: HealthProfessional[]
  services: HealthService[]
  onSelectProfessional: (professional: HealthProfessional) => void
  onSelectService: (service: HealthService) => void
}

function resolveProfessional(professionals: HealthProfessional[], result: HealthSearchResult) {
  return professionals.find((prof) => prof.id === result.id) ?? null
}

function resolveService(services: HealthService[], result: HealthSearchResult) {
  return services.find((service) => service.id === result.id) ?? null
}

const CONVERSATION_RESULT_CARD_CLASS =
  "flex gap-3 p-3 rounded-xl border border-border/45 bg-white shadow-[0_6px_18px_-16px_rgba(15,23,42,0.12)]"

export function HealthConversationResultsBlock({
  items,
  professionals,
  services,
  onSelectProfessional,
  onSelectService,
}: HealthConversationResultsBlockProps) {
  return (
    <div className="flex flex-col gap-2" data-testid="health-conversation-results-block">
      {items.map((result) => {
        if (result.kind === "professional") {
          const professional = resolveProfessional(professionals, result)
          if (!professional) return null

          return (
            <div
              key={`prof-${result.id}`}
              className={CONVERSATION_RESULT_CARD_CLASS}
            >
              <button
                type="button"
                onClick={() => onSelectProfessional(professional)}
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
                onClick={() => onSelectProfessional(professional)}
              >
                <Calendar className="w-4 h-4 mr-1" />
                {result.ctaLabel ?? "Agendar"}
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
                  <p className="text-xs text-muted-foreground line-clamp-2">{result.subtitle}</p>
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
              {result.ctaLabel ?? "Ver"}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
