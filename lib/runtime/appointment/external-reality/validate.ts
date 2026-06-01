import { EXTERNAL_REALITY_MAX_REVIEWS } from "./types"
import type { ExternalRealitySnapshot, RuntimeExternalMeta } from "./types"

export interface ExternalRealityValidationResult {
  ok: boolean
  errors: string[]
}

const ISO8601_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/

function isIso8601(value: string): boolean {
  if (!ISO8601_PATTERN.test(value)) {
    return false
  }

  return !Number.isNaN(Date.parse(value))
}

function validateLocation(
  location: ExternalRealitySnapshot["place"]["location"],
  errors: string[],
  prefix: string
) {
  if (!location) {
    return
  }

  if (location.lat < -90 || location.lat > 90) {
    errors.push(`${prefix}.location.lat must be between -90 and 90`)
  }

  if (location.lng < -180 || location.lng > 180) {
    errors.push(`${prefix}.location.lng must be between -180 and 180`)
  }
}

export function validateExternalRealitySnapshot(
  snapshot: ExternalRealitySnapshot
): ExternalRealityValidationResult {
  const errors: string[] = []

  if (!snapshot.provider.trim()) {
    errors.push("provider is required")
  }

  if (!snapshot.placeId.trim()) {
    errors.push("placeId is required")
  }

  if (!snapshot.fetchedAt.trim()) {
    errors.push("fetchedAt is required")
  } else if (!isIso8601(snapshot.fetchedAt)) {
    errors.push("fetchedAt must be ISO-8601")
  }

  if (!snapshot.place.displayName.trim()) {
    errors.push("place.displayName is required")
  }

  if (!snapshot.place.formattedAddress.trim()) {
    errors.push("place.formattedAddress is required")
  }

  validateLocation(snapshot.place.location, errors, "place")

  if (
    snapshot.hours.weekdayDescriptions &&
    snapshot.hours.weekdayDescriptions.length > 7
  ) {
    errors.push("hours.weekdayDescriptions must have at most 7 entries")
  }

  if (snapshot.rating.average !== undefined) {
    if (snapshot.rating.average < 0 || snapshot.rating.average > 5) {
      errors.push("rating.average must be between 0 and 5")
    }
  }

  if (snapshot.rating.total !== undefined && snapshot.rating.total < 0) {
    errors.push("rating.total must be >= 0")
  }

  if (snapshot.reviews.length > EXTERNAL_REALITY_MAX_REVIEWS) {
    errors.push(`reviews must have at most ${EXTERNAL_REALITY_MAX_REVIEWS} entries`)
  }

  const reviewIds = new Set<string>()

  for (const review of snapshot.reviews) {
    if (!review.id.trim()) {
      errors.push("review.id is required")
      continue
    }

    if (reviewIds.has(review.id)) {
      errors.push(`duplicate review id: ${review.id}`)
      continue
    }

    reviewIds.add(review.id)

    if (!review.author.trim()) {
      errors.push(`review ${review.id} requires author`)
    }

    if (!review.text.trim()) {
      errors.push(`review ${review.id} requires text`)
    }

    if (review.rating < 1 || review.rating > 5) {
      errors.push(`review ${review.id} rating must be between 1 and 5`)
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  }
}

export function assertExternalRealitySnapshot(snapshot: ExternalRealitySnapshot) {
  const result = validateExternalRealitySnapshot(snapshot)

  if (!result.ok) {
    throw new Error(`Invalid ExternalRealitySnapshot:\n- ${result.errors.join("\n- ")}`)
  }
}

export function validateRuntimeExternalMeta(
  meta: RuntimeExternalMeta
): ExternalRealityValidationResult {
  const errors: string[] = []

  if (!meta.provider.trim()) {
    errors.push("provider is required")
  }

  if (!meta.placeId.trim()) {
    errors.push("placeId is required")
  }

  if (!meta.syncedAt.trim()) {
    errors.push("syncedAt is required")
  } else if (!isIso8601(meta.syncedAt)) {
    errors.push("syncedAt must be ISO-8601")
  }

  if (meta.status !== "live" && meta.status !== "fallback" && meta.status !== "stale") {
    errors.push("status must be live, fallback, or stale")
  }

  return {
    ok: errors.length === 0,
    errors,
  }
}

export function assertRuntimeExternalMeta(meta: RuntimeExternalMeta) {
  const result = validateRuntimeExternalMeta(meta)

  if (!result.ok) {
    throw new Error(`Invalid RuntimeExternalMeta:\n- ${result.errors.join("\n- ")}`)
  }
}

export function isExternalRealitySnapshot(value: unknown): value is ExternalRealitySnapshot {
  if (!value || typeof value !== "object") {
    return false
  }

  return validateExternalRealitySnapshot(value as ExternalRealitySnapshot).ok
}

export function isRuntimeExternalMeta(value: unknown): value is RuntimeExternalMeta {
  if (!value || typeof value !== "object") {
    return false
  }

  return validateRuntimeExternalMeta(value as RuntimeExternalMeta).ok
}
