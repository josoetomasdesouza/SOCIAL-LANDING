import {
  EXTERNAL_REALITY_MAX_REVIEWS,
  type ExternalHoursData,
  type ExternalPlaceData,
  type ExternalPlaceLocation,
  type ExternalRatingSummary,
  type ExternalRealitySnapshot,
  type ExternalReviewCandidate,
  type RuntimeExternalMeta,
} from "./types"

function trimString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeLocation(value: unknown): ExternalPlaceLocation | undefined {
  if (!value || typeof value !== "object") {
    return undefined
  }

  const record = value as Record<string, unknown>
  const lat = typeof record.lat === "number" ? record.lat : Number(record.lat)
  const lng = typeof record.lng === "number" ? record.lng : Number(record.lng)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return undefined
  }

  return { lat, lng }
}

function normalizePlace(value: unknown): ExternalPlaceData {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {}

  const displayName = trimString(record.displayName) ?? ""
  const formattedAddress = trimString(record.formattedAddress) ?? ""
  const mapsUri =
    trimString(record.mapsUri) ??
    trimString(record.googleMapsUri)

  const location = normalizeLocation(record.location)

  return {
    displayName,
    formattedAddress,
    ...(mapsUri ? { mapsUri } : {}),
    ...(location ? { location } : {}),
  }
}

function normalizeHours(value: unknown): ExternalHoursData {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {}
  const hours: ExternalHoursData = {}

  if (typeof record.openNow === "boolean") {
    hours.openNow = record.openNow
  }

  if (Array.isArray(record.weekdayDescriptions)) {
    const weekdayDescriptions = record.weekdayDescriptions
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .slice(0, 7)

    if (weekdayDescriptions.length > 0) {
      hours.weekdayDescriptions = weekdayDescriptions
    }
  }

  return hours
}

function normalizeRating(value: unknown): ExternalRatingSummary {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {}
  const rating: ExternalRatingSummary = {}

  const average = typeof record.average === "number" ? record.average : Number(record.average)
  if (Number.isFinite(average)) {
    rating.average = Math.min(5, Math.max(0, average))
  }

  const total = typeof record.total === "number" ? record.total : Number(record.total)
  if (Number.isFinite(total) && total >= 0) {
    rating.total = Math.floor(total)
  }

  return rating
}

function normalizeReview(value: unknown): ExternalReviewCandidate | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const record = value as Record<string, unknown>
  const id = trimString(record.id)
  const author = trimString(record.author)
  const text = trimString(record.text)
  const rating = typeof record.rating === "number" ? record.rating : Number(record.rating)

  if (!id || !author || !text || !Number.isFinite(rating)) {
    return null
  }

  const relativeTime = trimString(record.relativeTime)

  return {
    id,
    author,
    rating: Math.min(5, Math.max(1, rating)),
    text,
    ...(relativeTime ? { relativeTime } : {}),
  }
}

export function normalizeExternalReviewCandidates(
  value: unknown
): ExternalReviewCandidate[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map(normalizeReview)
    .filter((review): review is ExternalReviewCandidate => review !== null)
    .slice(0, EXTERNAL_REALITY_MAX_REVIEWS)
}

export function normalizeExternalRealitySnapshot(
  value: unknown
): ExternalRealitySnapshot {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {}

  return {
    provider: trimString(record.provider) ?? "",
    placeId: trimString(record.placeId) ?? "",
    fetchedAt: trimString(record.fetchedAt) ?? "",
    place: normalizePlace(record.place),
    hours: normalizeHours(record.hours),
    rating: normalizeRating(record.rating),
    reviews: normalizeExternalReviewCandidates(record.reviews),
  }
}

export function normalizeRuntimeExternalMeta(value: unknown): RuntimeExternalMeta {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {}

  const status = trimString(record.status)
  const normalizedStatus =
    status === "live" || status === "fallback" || status === "stale" ? status : "fallback"

  return {
    provider: trimString(record.provider) ?? "",
    placeId: trimString(record.placeId) ?? "",
    syncedAt: trimString(record.syncedAt) ?? "",
    status: normalizedStatus,
  }
}
