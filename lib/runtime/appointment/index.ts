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
  loadAppointmentRuntime,
  loadAppointmentRuntimeFromMock,
  loadAppointmentRuntimeFromRuntimeStore,
  resolveAppointmentRuntimeMode,
} from "./load"

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
