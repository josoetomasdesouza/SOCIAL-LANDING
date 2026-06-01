export function resolveAppointmentExternalRealityEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_APPOINTMENT_EXTERNAL_REALITY?.trim().toLowerCase()

  return raw === "1" || raw === "true"
}
