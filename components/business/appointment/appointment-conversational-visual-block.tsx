"use client"

import type { ReactNode } from "react"
import type { Professional, Service } from "@/lib/business-types"
import type { ConversationVisualBlock, ConversationVisualBlockRenderer } from "@/lib/mock-data/conversational-search"
import {
  APPOINTMENT_BOOKING_RESULTS_KIND,
  APPOINTMENT_SCHEDULE_PROMPT_KIND,
  type AppointmentBookingResultsPayload,
  type AppointmentSchedulePromptPayload,
} from "@/lib/mock-data/appointment-conversational-search"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { AppointmentConversationResultsBlock } from "./appointment-conversation-results-block"

function isAppointmentBookingResultsPayload(payload: unknown): payload is AppointmentBookingResultsPayload {
  if (!payload || typeof payload !== "object") return false
  return Array.isArray((payload as AppointmentBookingResultsPayload).items)
}

function isAppointmentSchedulePromptPayload(payload: unknown): payload is AppointmentSchedulePromptPayload {
  if (!payload || typeof payload !== "object") return false
  return "barberId" in (payload as AppointmentSchedulePromptPayload) || "barberName" in (payload as AppointmentSchedulePromptPayload)
}

interface AppointmentConversationalVisualBlockOptions {
  barbers: Professional[]
  services: Service[]
  onSelectBarber: (barber: Professional) => void
  onSelectService: (service: Service) => void
  onScheduleBooking: (payload: { barberId?: string; serviceId?: string }) => void
}

export function createAppointmentConversationalVisualBlockRenderer(
  options: AppointmentConversationalVisualBlockOptions
): ConversationVisualBlockRenderer {
  return (visualBlock: ConversationVisualBlock): ReactNode => {
    if (visualBlock.kind === APPOINTMENT_BOOKING_RESULTS_KIND) {
      if (!isAppointmentBookingResultsPayload(visualBlock.payload)) return null

      return (
        <AppointmentConversationResultsBlock
          items={visualBlock.payload.items}
          barbers={options.barbers}
          services={options.services}
          onSelectBarber={options.onSelectBarber}
          onSelectService={options.onSelectService}
        />
      )
    }

    if (visualBlock.kind === APPOINTMENT_SCHEDULE_PROMPT_KIND) {
      if (!isAppointmentSchedulePromptPayload(visualBlock.payload)) return null

      const { barberId, serviceId, barberName } = visualBlock.payload

      return (
        <div data-testid="appointment-schedule-prompt-block">
          <Button
            className="w-full"
            onClick={() => {
              options.onScheduleBooking({ barberId, serviceId })
            }}
            disabled={!barberId}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {barberName ? `Ver horarios com ${barberName}` : "Ver horarios disponiveis"}
          </Button>
        </div>
      )
    }

    return null
  }
}
