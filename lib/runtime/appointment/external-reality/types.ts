/** Max reviews carried into runtime grammar (Etapa 3+). Internal cap at ingest. */
export const EXTERNAL_REALITY_MAX_REVIEWS = 3 as const

/** Known provider labels — snapshot shape stays provider-neutral. */
export const EXTERNAL_REALITY_PROVIDER_GOOGLE_PLACES = "google-places" as const

export type ExternalRealityProviderId =
  | typeof EXTERNAL_REALITY_PROVIDER_GOOGLE_PLACES
  | (string & {})

export type ExternalRealitySyncStatus = "live" | "fallback" | "stale"

export interface ExternalPlaceLocation {
  lat: number
  lng: number
}

/** Normalized place/address — not raw provider payload. */
export interface ExternalPlaceData {
  displayName: string
  formattedAddress: string
  mapsUri?: string
  location?: ExternalPlaceLocation
}

/** Hours signals for operational derivation — not a UI schedule table. */
export interface ExternalHoursData {
  openNow?: boolean
  /** Internal only — derive hints; never render as list in Tier 1. */
  weekdayDescriptions?: string[]
}

export interface ExternalRatingSummary {
  average?: number
  total?: number
}

export interface ExternalReviewCandidate {
  id: string
  author: string
  rating: number
  text: string
  relativeTime?: string
}

/**
 * Minimal external reality snapshot for Appointment enrichment.
 * Provider-normalized substrate — not a Google Places API dump.
 */
export interface ExternalRealitySnapshot {
  provider: ExternalRealityProviderId
  placeId: string
  fetchedAt: string

  place: ExternalPlaceData
  hours: ExternalHoursData
  rating: ExternalRatingSummary
  reviews: ExternalReviewCandidate[]
}

/** Observability meta embedded in bundle.meta.external (Etapa 5+). */
export interface RuntimeExternalMeta {
  provider: ExternalRealityProviderId
  placeId: string
  syncedAt: string
  status: ExternalRealitySyncStatus
}
