import {
  buildGooglePlacesDetailsRequestUrl,
  DEFAULT_GOOGLE_PLACES_TIMEOUT_MS,
  GOOGLE_PLACES_FIELD_MASK,
  normalizeGooglePlaceId,
  resolveGooglePlacesApiKey,
} from "./google-places-config"
import {
  mapGooglePlacesDetailsToExternalRealitySnapshot,
  type GooglePlacesPlaceDetailsPayload,
} from "./google-places-map"
import { validateExternalRealitySnapshot } from "./validate"
import type { ExternalRealitySnapshot } from "./types"

export type GooglePlacesFetchFailureReason =
  | "missing-api-key"
  | "missing-place-id"
  | "timeout"
  | "http-error"
  | "invalid-json"
  | "invalid-payload"
  | "validation-failed"

export type GooglePlacesFetchSuccessSource = "api"

export type GooglePlacesFetchResult =
  | {
      status: "live"
      snapshot: ExternalRealitySnapshot
      source: GooglePlacesFetchSuccessSource
    }
  | {
      status: "fallback"
      reason: GooglePlacesFetchFailureReason
      detail?: string
    }

export interface FetchGooglePlacesSnapshotOptions {
  placeId: string
  apiKey?: string
  timeoutMs?: number
  fetchedAt?: string
  fetchImpl?: typeof fetch
}

function assertServerRuntime() {
  if (typeof window !== "undefined") {
    throw new Error("Google Places client is server-only")
  }
}

export async function fetchGooglePlacesPlaceDetails(
  options: FetchGooglePlacesSnapshotOptions
): Promise<GooglePlacesFetchResult> {
  assertServerRuntime()

  const apiKey = resolveGooglePlacesApiKey(options.apiKey)
  const placeId = normalizeGooglePlaceId(options.placeId)

  if (!apiKey) {
    return { status: "fallback", reason: "missing-api-key" }
  }

  if (!placeId) {
    return { status: "fallback", reason: "missing-place-id" }
  }

  const fetchImpl = options.fetchImpl ?? fetch
  const timeoutMs = options.timeoutMs ?? DEFAULT_GOOGLE_PLACES_TIMEOUT_MS
  const url = buildGooglePlacesDetailsRequestUrl(placeId)

  let response: Response

  try {
    response = await fetchImpl(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": GOOGLE_PLACES_FIELD_MASK,
      },
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return { status: "fallback", reason: "timeout" }
    }

    if (error instanceof Error && error.name === "AbortError") {
      return { status: "fallback", reason: "timeout" }
    }

    return {
      status: "fallback",
      reason: "http-error",
      detail: error instanceof Error ? error.message : "fetch failed",
    }
  }

  if (!response.ok) {
    return {
      status: "fallback",
      reason: "http-error",
      detail: `status ${response.status}`,
    }
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    return { status: "fallback", reason: "invalid-json" }
  }

  if (!payload || typeof payload !== "object") {
    return { status: "fallback", reason: "invalid-payload" }
  }

  const snapshot = mapGooglePlacesDetailsToExternalRealitySnapshot(
    placeId,
    payload as GooglePlacesPlaceDetailsPayload,
    options.fetchedAt
  )

  const validation = validateExternalRealitySnapshot(snapshot)

  if (!validation.ok) {
    return {
      status: "fallback",
      reason: "validation-failed",
      detail: validation.errors.join("; "),
    }
  }

  return {
    status: "live",
    snapshot,
    source: "api",
  }
}
