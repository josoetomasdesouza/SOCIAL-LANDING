export {
  EXTERNAL_REALITY_MAX_REVIEWS,
  EXTERNAL_REALITY_PROVIDER_GOOGLE_PLACES,
} from "./types"

export type {
  ExternalHoursData,
  ExternalPlaceData,
  ExternalPlaceLocation,
  ExternalRatingSummary,
  ExternalRealityProviderId,
  ExternalRealitySnapshot,
  ExternalRealitySyncStatus,
  ExternalReviewCandidate,
  RuntimeExternalMeta,
} from "./types"

export {
  normalizeExternalRealitySnapshot,
  normalizeExternalReviewCandidates,
  normalizeRuntimeExternalMeta,
} from "./normalize"

export {
  assertExternalRealitySnapshot,
  assertRuntimeExternalMeta,
  isExternalRealitySnapshot,
  isRuntimeExternalMeta,
  validateExternalRealitySnapshot,
  validateRuntimeExternalMeta,
} from "./validate"

export type { ExternalRealityValidationResult } from "./validate"

export {
  buildGooglePlacesDetailsRequestUrl,
  DEFAULT_GOOGLE_PLACES_TIMEOUT_MS,
  GOOGLE_PLACES_FIELD_MASK,
  normalizeGooglePlaceId,
  resolveAppointmentExternalPlaceId,
  resolveGooglePlacesApiKey,
} from "./google-places-config"

export {
  mapGooglePlacesDetailsToExternalRealitySnapshot,
} from "./google-places-map"
export type {
  GooglePlacesPlaceDetailsPayload,
  GooglePlacesReviewPayload,
} from "./google-places-map"

export {
  fetchGooglePlacesPlaceDetails,
} from "./google-places-client"
export type {
  FetchGooglePlacesSnapshotOptions,
  GooglePlacesFetchFailureReason,
  GooglePlacesFetchResult,
} from "./google-places-client"

export {
  fetchExternalRealitySnapshot,
} from "./fetch-external-reality"
export type {
  ExternalRealityFetchFailureReason,
  ExternalRealityFetchResult,
  ExternalRealityFetchSource,
  FetchExternalRealitySnapshotOptions,
} from "./fetch-external-reality"

export {
  clearExternalRealityMemoryCache,
  readExternalRealityFileCache,
  readExternalRealityMemoryCache,
  resolveExternalRealitySnapshotCachePath,
  writeExternalRealityFileCache,
  writeExternalRealityMemoryCache,
} from "./snapshot-cache"
