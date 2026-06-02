export {
  APPOINTMENT_PILOT_SLUG,
  APPOINTMENT_RUNTIME_VERSION,
} from "./types"

export type {
  AppointmentRuntimeBundle,
  AppointmentRuntimeMode,
  AppointmentRuntimeSource,
  RuntimeArrivalContext,
  RuntimeEstablishment,
  RuntimeFeedItem,
  RuntimeFeedSection,
  RuntimeFeedSectionId,
  RuntimeOperationalContext,
  RuntimeProfessional,
  RuntimeService,
  RuntimeStory,
  RuntimeStyleCatalogItem,
} from "./types"

export {
  buildAppointmentRuntimeBundleFromMock,
  buildAppointmentRuntimeSeedBundle,
  resolveAppointmentPilotSlugFromName,
} from "./mock-adapter"
export type { BuildAppointmentRuntimeBundleOptions } from "./mock-adapter"

export {
  getAppointmentRuntimeReadiness,
  loadAppointmentRuntimeFromMock,
  resolveAppointmentRuntimeMode,
} from "./load"

export {
  loadAppointmentRuntime,
  loadAppointmentRuntimeFromRuntimeStore,
} from "./load.server"

export {
  getAppointmentRuntimeSeedDocument,
  getAppointmentRuntimeSeedSlugs,
  hasAppointmentRuntimeSeed,
} from "./runtime-store"

export { runAppointmentRuntimeStoreParityChecks } from "./runtime-parity"
export { getAppointmentRuntimeBundleDiffErrors } from "./bundle-compare"

export {
  assertAppointmentRuntimeBundle,
  validateAppointmentRuntimeBundle,
} from "./validate"
export type { AppointmentRuntimeValidationResult } from "./validate"

export {
  projectBundleToBusinessConfig,
  projectBundleToLegacyContent,
  projectBundleToProfessionals,
  projectBundleToServices,
  projectBundleToStyles,
} from "./legacy-projection"
export type { AppointmentLegacyContent } from "./legacy-projection"

export {
  appointmentArrivalContext,
  appointmentBarberServices,
  appointmentBarberShopConfig,
  appointmentBarbers,
  appointmentFeedContent,
  appointmentHairStyles,
  appointmentHeroOperationalContext,
} from "./appointment-feed-data"

export {
  EXTERNAL_REALITY_MAX_REVIEWS,
  EXTERNAL_REALITY_PROVIDER_GOOGLE_PLACES,
  assertExternalRealitySnapshot,
  assertRuntimeExternalMeta,
  isExternalRealitySnapshot,
  isRuntimeExternalMeta,
  normalizeExternalRealitySnapshot,
  normalizeExternalReviewCandidates,
  normalizeRuntimeExternalMeta,
  validateExternalRealitySnapshot,
  validateRuntimeExternalMeta,
} from "./external-reality"
export type {
  ExternalHoursData,
  ExternalPlaceData,
  ExternalPlaceLocation,
  ExternalRatingSummary,
  ExternalRealityProviderId,
  ExternalRealitySnapshot,
  ExternalRealitySyncStatus,
  ExternalRealityValidationResult,
  ExternalReviewCandidate,
  RuntimeExternalMeta,
} from "./external-reality"
