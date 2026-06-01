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
