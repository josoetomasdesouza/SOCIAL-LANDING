import type { UniversalSegmentConfig } from "@/lib/core"

export const appointmentSegmentConfig: UniversalSegmentConfig = {
  id: "appointment",
  name: "Agendamento",
  objective: "Converter visitantes em horarios agendados com profissional e servico definidos.",
  primaryCTA: {
    label: "Agendar horario",
    action: "appointment.booking.open",
    variant: "primary",
  },
  contentPriorities: ["review", "video", "social", "news"],
  requiredModules: [
    "appointment.booking",
    "appointment.calendar",
    "appointment.staff",
    "appointment.availability",
  ],
  operationalFlow: [
    { id: "select-service", label: "Escolher servico", moduleId: "appointment.booking", action: "appointment.service.select" },
    { id: "select-staff", label: "Escolher profissional", moduleId: "appointment.staff", action: "appointment.staff.select" },
    { id: "select-slot", label: "Escolher data e horario", moduleId: "appointment.calendar", action: "appointment.slot.select" },
    { id: "confirm-booking", label: "Confirmar agendamento", moduleId: "appointment.booking", action: "appointment.booking.confirm" },
  ],
  rules: {
    requiresStaffSelection: true,
    requiresAvailability: true,
    supportsRescheduling: true,
    confirmationChannel: "whatsapp",
  },
}
