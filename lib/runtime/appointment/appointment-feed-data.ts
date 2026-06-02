import { loadAppointmentRuntimeForFeed } from "./load-feed"
import {
  projectBundleToBusinessConfig,
  projectBundleToLegacyContent,
  projectBundleToProfessionals,
  projectBundleToServices,
  projectBundleToStyles,
} from "./legacy-projection"

const appointmentRuntimeBundle = loadAppointmentRuntimeForFeed()

export const appointmentBarberShopConfig = projectBundleToBusinessConfig(appointmentRuntimeBundle)
export const appointmentHeroOperationalContext = appointmentRuntimeBundle.operational
export const appointmentArrivalContext = appointmentRuntimeBundle.arrival
export const appointmentBarbers = projectBundleToProfessionals(appointmentRuntimeBundle)
export const appointmentBarberServices = projectBundleToServices(appointmentRuntimeBundle)
export const appointmentHairStyles = projectBundleToStyles(appointmentRuntimeBundle)
export const appointmentFeedContent = projectBundleToLegacyContent(appointmentRuntimeBundle)
