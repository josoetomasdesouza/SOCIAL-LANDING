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

export {
  deriveHoursHintFromWeekdayDescriptions,
  deriveLiveStateFromHours,
  deriveMapsQueryFromSnapshot,
} from "./derive-fields"

export {
  EXTERNAL_REVIEW_MAX_TEXT_LENGTH,
  filterEditorialReviews,
  passesEditorialReviewGate,
} from "./editorial-gate"

export {
  PRESERVED_EDITORIAL_FIELDS,
  getPreservedEditorialFieldValues,
  mergeExternalRealityIntoBundle,
  preservedEditorialFieldsMatch,
} from "./merge-into-bundle"
export type { MergeExternalRealityOptions } from "./merge-into-bundle"

export { runExternalRealityMergeParityChecks } from "./merge-parity"

export {
  EXTERNAL_REALITY_GOOGLE_FIXTURE_RELATIVE_PATH,
  resolveExternalRealityMergedPreviewPath,
  syncExternalReality,
} from "./sync-external-reality"

export type { ExternalRealitySyncReport } from "./sync-report"
export { resolveExternalRealitySyncReportPath } from "./sync-report"

export { resolveAppointmentExternalRealityEnabled } from "./apply-runtime-overlay"

export {
  EXTERNAL_REALITY_STALE_AFTER_MS,
  applyExternalRealityRuntimeOverlay,
  resolveExternalRealityOverlayStatus,
} from "./apply-runtime-overlay.server"
export type { ApplyExternalRealityRuntimeOverlayOptions } from "./apply-runtime-overlay.server"

export { runExternalRealityOverlayParityChecks } from "./overlay-parity"

export { runExternalRealitySyncParityChecks } from "./sync-parity"

export type { SyncExternalRealityOptions } from "./sync-external-reality"
