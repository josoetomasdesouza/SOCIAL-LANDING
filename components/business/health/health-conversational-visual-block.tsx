"use client"

import type { ReactNode } from "react"
import type { HealthProfessional, HealthService } from "@/lib/business-types"
import type { ConversationVisualBlock, ConversationVisualBlockRenderer } from "@/lib/mock-data/conversational-search"
import {
  HEALTH_CARE_RESULTS_KIND,
  HEALTH_SCHEDULE_PROMPT_KIND,
  type HealthCareResultsPayload,
  type HealthSchedulePromptPayload,
} from "@/lib/mock-data/health-conversational-search"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { HealthConversationResultsBlock } from "./health-conversation-results-block"

function isHealthCareResultsPayload(payload: unknown): payload is HealthCareResultsPayload {
  if (!payload || typeof payload !== "object") return false
  return Array.isArray((payload as HealthCareResultsPayload).items)
}

function isHealthSchedulePromptPayload(payload: unknown): payload is HealthSchedulePromptPayload {
  if (!payload || typeof payload !== "object") return false
  return "professionalId" in (payload as HealthSchedulePromptPayload) || "professionalName" in (payload as HealthSchedulePromptPayload)
}

interface HealthConversationalVisualBlockOptions {
  professionals: HealthProfessional[]
  services: HealthService[]
  onSelectProfessional: (professional: HealthProfessional) => void
  onSelectService: (service: HealthService) => void
  onScheduleProfessional: (professionalId: string) => void
}

export function createHealthConversationalVisualBlockRenderer(
  options: HealthConversationalVisualBlockOptions
): ConversationVisualBlockRenderer {
  return (visualBlock: ConversationVisualBlock): ReactNode => {
    if (visualBlock.kind === HEALTH_CARE_RESULTS_KIND) {
      if (!isHealthCareResultsPayload(visualBlock.payload)) return null

      return (
        <HealthConversationResultsBlock
          items={visualBlock.payload.items}
          professionals={options.professionals}
          services={options.services}
          onSelectProfessional={options.onSelectProfessional}
          onSelectService={options.onSelectService}
        />
      )
    }

    if (visualBlock.kind === HEALTH_SCHEDULE_PROMPT_KIND) {
      if (!isHealthSchedulePromptPayload(visualBlock.payload)) return null

      const professionalId = visualBlock.payload.professionalId

      return (
        <div data-testid="health-schedule-prompt-block">
          <Button
            className="w-full"
            onClick={() => {
              if (professionalId) {
                options.onScheduleProfessional(professionalId)
              }
            }}
            disabled={!professionalId}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {visualBlock.payload.professionalName
              ? `Agendar com ${visualBlock.payload.professionalName}`
              : "Agendar consulta"}
          </Button>
        </div>
      )
    }

    return null
  }
}
