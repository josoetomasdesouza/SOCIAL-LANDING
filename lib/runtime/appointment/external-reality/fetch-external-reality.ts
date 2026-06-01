import {
  EXTERNAL_REALITY_MEMORY_CACHE_TTL_MS,
  resolveAppointmentExternalPlaceId,
  resolveGooglePlacesApiKey,
} from "./google-places-config"
import { fetchGooglePlacesPlaceDetails } from "./google-places-client"
import {
  readExternalRealityFileCache,
  readExternalRealityMemoryCache,
  writeExternalRealityFileCache,
  writeExternalRealityMemoryCache,
} from "./snapshot-cache"
import { validateExternalRealitySnapshot } from "./validate"
import type { ExternalRealitySnapshot } from "./types"

export type ExternalRealityFetchSource = "cache-memory" | "cache-file" | "api"

export type ExternalRealityFetchFailureReason =
  | "missing-api-key"
  | "missing-place-id"
  | "timeout"
  | "http-error"
  | "invalid-json"
  | "invalid-payload"
  | "validation-failed"
  | "cache-invalid"

export type ExternalRealityFetchResult =
  | {
      status: "live"
      snapshot: ExternalRealitySnapshot
      source: ExternalRealityFetchSource
    }
  | {
      status: "fallback"
      reason: ExternalRealityFetchFailureReason
      detail?: string
    }

export interface FetchExternalRealitySnapshotOptions {
  placeId?: string
  apiKey?: string
  slug?: string
  timeoutMs?: number
  useMemoryCache?: boolean
  useFileCache?: boolean
  writeFileCache?: boolean
  rootDir?: string
  fetchImpl?: typeof fetch
}

function readValidatedFileCache(
  slug: string,
  rootDir?: string
): ExternalRealitySnapshot | null {
  const cached = readExternalRealityFileCache(slug, rootDir)

  if (!cached) {
    return null
  }

  const validation = validateExternalRealitySnapshot(cached)
  return validation.ok ? cached : null
}

export async function fetchExternalRealitySnapshot(
  options: FetchExternalRealitySnapshotOptions = {}
): Promise<ExternalRealityFetchResult> {
  const placeId = resolveAppointmentExternalPlaceId(options.placeId)

  if (!placeId) {
    return { status: "fallback", reason: "missing-place-id" }
  }

  if (options.useMemoryCache !== false) {
    const cached = readExternalRealityMemoryCache(placeId)

    if (cached) {
      return { status: "live", snapshot: cached, source: "cache-memory" }
    }
  }

  if (options.useFileCache !== false && options.slug) {
    const cached = readValidatedFileCache(options.slug, options.rootDir)

    if (cached) {
      writeExternalRealityMemoryCache(
        placeId,
        cached,
        EXTERNAL_REALITY_MEMORY_CACHE_TTL_MS
      )
      return { status: "live", snapshot: cached, source: "cache-file" }
    }
  }

  const apiKey = resolveGooglePlacesApiKey(options.apiKey)

  if (!apiKey) {
    return { status: "fallback", reason: "missing-api-key" }
  }

  const apiResult = await fetchGooglePlacesPlaceDetails({
    placeId,
    apiKey,
    timeoutMs: options.timeoutMs,
    fetchImpl: options.fetchImpl,
  })

  if (apiResult.status === "fallback") {
    return apiResult
  }

  writeExternalRealityMemoryCache(
    placeId,
    apiResult.snapshot,
    EXTERNAL_REALITY_MEMORY_CACHE_TTL_MS
  )

  if (options.writeFileCache && options.slug) {
    writeExternalRealityFileCache(options.slug, apiResult.snapshot, options.rootDir)
  }

  return {
    status: "live",
    snapshot: apiResult.snapshot,
    source: "api",
  }
}
