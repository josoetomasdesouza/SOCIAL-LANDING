export type AppointmentPublicationPreviewMode = "live" | "draft"

export function resolveAppointmentPublicationPreviewMode(): AppointmentPublicationPreviewMode {
  const raw = process.env.APPOINTMENT_PUBLICATION_PREVIEW?.trim().toLowerCase()

  if (raw === "draft") {
    return "draft"
  }

  return "live"
}

export function isAppointmentPublicationDraftPreviewEnabled(): boolean {
  return resolveAppointmentPublicationPreviewMode() === "draft"
}
