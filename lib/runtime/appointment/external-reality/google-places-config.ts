/** Server-only configuration — never import from client components. */

export const GOOGLE_PLACES_DETAILS_URL = "https://places.googleapis.com/v1/places" as const

export const GOOGLE_PLACES_FIELD_MASK = [
  "displayName",
  "formattedAddress",
  "location",
  "regularOpeningHours",
  "rating",
  "userRatingCount",
  "reviews",
  "googleMapsUri",
].join(",")

export const DEFAULT_GOOGLE_PLACES_TIMEOUT_MS = 8_000

export const EXTERNAL_REALITY_MEMORY_CACHE_TTL_MS = 60 * 60 * 1000

export function resolveGooglePlacesApiKey(
  explicitKey?: string
): string | undefined {
  const key = explicitKey ?? process.env.GOOGLE_PLACES_API_KEY
  const trimmed = key?.trim()
  return trimmed ? trimmed : undefined
}

export function resolveAppointmentExternalPlaceId(
  explicitPlaceId?: string
): string | undefined {
  const placeId = explicitPlaceId ?? process.env.APPOINTMENT_EXTERNAL_PLACE_ID
  const trimmed = placeId?.trim()
  return trimmed ? trimmed : undefined
}

export function normalizeGooglePlaceId(placeId: string): string {
  const trimmed = placeId.trim()
  return trimmed.startsWith("places/") ? trimmed.slice("places/".length) : trimmed
}

export function buildGooglePlacesDetailsRequestUrl(placeId: string): string {
  return `${GOOGLE_PLACES_DETAILS_URL}/${encodeURIComponent(normalizeGooglePlaceId(placeId))}`
}
