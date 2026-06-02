export type AppointmentPublicationState = "draft" | "live"

export type AppointmentPublicationDerivedFrom = "live" | "mock-adapter" | "manual"

export interface AppointmentPublicationMeta {
  publicationState: AppointmentPublicationState
  derivedFrom?: AppointmentPublicationDerivedFrom
  draftUpdatedAt?: string
  promotedAt?: string
}

export const APPOINTMENT_LIVE_VERSION = "v1" as const

export interface AppointmentPublicationValidationResult {
  ok: boolean
  errors: string[]
}
