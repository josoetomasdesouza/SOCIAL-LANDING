import { appointmentContent } from "@/lib/mock-data/business-content"
import type { BusinessPost } from "@/components/business/business-social-landing"
import {
  barberShopArrivalContext,
  barberShopConfig,
  barberShopHeroOperationalContext,
  barbers,
  barberServices,
  hairStyles,
} from "@/lib/mock-data/appointment-data"
import { buildAppointmentRuntimeBundleFromMock } from "./mock-adapter"
import {
  projectBundleToBusinessConfig,
  projectBundleToLegacyContent,
  projectBundleToProfessionals,
  projectBundleToServices,
  projectBundleToStyles,
} from "./legacy-projection"
import { validateAppointmentRuntimeBundle } from "./validate"

const bundle = buildAppointmentRuntimeBundleFromMock()
const projectedConfig = projectBundleToBusinessConfig(bundle)
const projectedContent = projectBundleToLegacyContent(bundle)
const projectedProfessionals = projectBundleToProfessionals(bundle)
const projectedServices = projectBundleToServices(bundle)
const projectedStyles = projectBundleToStyles(bundle)
const validation = validateAppointmentRuntimeBundle(bundle)

function jsonEqual(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function normalizeBusinessPost(post: BusinessPost) {
  return JSON.stringify(post, Object.keys(post).sort())
}

function postsMatch(left: BusinessPost[], right: BusinessPost[]) {
  if (left.length !== right.length) {
    return false
  }

  return left.every((post, index) => normalizeBusinessPost(post) === normalizeBusinessPost(right[index]!))
}

const parityOk =
  validation.ok &&
  projectedConfig.name === barberShopConfig.name &&
  projectedConfig.logo === barberShopConfig.logo &&
  projectedConfig.primaryColor === barberShopConfig.primaryColor &&
  projectedConfig.whatsapp === barberShopConfig.whatsapp &&
  projectedConfig.openingHours === barberShopConfig.openingHours &&
  bundle.operational.liveState === barberShopHeroOperationalContext.liveState &&
  bundle.operational.placeHint === barberShopHeroOperationalContext.placeHint &&
  bundle.arrival.drawerTitle === barberShopArrivalContext.drawerTitle &&
  bundle.arrival.mapsQuery === barberShopArrivalContext.mapsQuery &&
  bundle.professionals.length === barbers.length &&
  bundle.services.length === barberServices.length &&
  bundle.styles.length === hairStyles.length &&
  bundle.feed.stories.length === appointmentContent.stories.length &&
  projectedProfessionals.length === barbers.length &&
  projectedServices.length === barberServices.length &&
  projectedStyles.length === hairStyles.length &&
  jsonEqual(projectedContent.stories, appointmentContent.stories) &&
  postsMatch(projectedContent.videos, appointmentContent.videos) &&
  postsMatch(projectedContent.reviews, appointmentContent.reviews) &&
  postsMatch(projectedContent.news, appointmentContent.news) &&
  postsMatch(projectedContent.social, appointmentContent.social)

/** Compile-time guard — fails `pnpm typecheck` if adapter parity breaks. */
const _appointmentRuntimeParityGuard: true = parityOk ? true : (false as never)

void _appointmentRuntimeParityGuard

export function getAppointmentRuntimeParityErrors(): string[] {
  const errors: string[] = [...validation.errors]

  if (projectedConfig.name !== barberShopConfig.name) {
    errors.push("projected business config name mismatch")
  }

  if (bundle.professionals.length !== barbers.length) {
    errors.push("professionals count mismatch")
  }

  if (bundle.services.length !== barberServices.length) {
    errors.push("services count mismatch")
  }

  if (!jsonEqual(projectedContent.stories, appointmentContent.stories)) {
    errors.push("projected stories mismatch")
  }

  if (!postsMatch(projectedContent.videos, appointmentContent.videos)) {
    errors.push("projected videos mismatch")
  }

  if (!postsMatch(projectedContent.reviews, appointmentContent.reviews)) {
    errors.push("projected reviews mismatch")
  }

  return errors
}

export function runAppointmentRuntimeParityChecks() {
  const errors = getAppointmentRuntimeParityErrors()

  return {
    ok: errors.length === 0,
    errors,
    snapshot: {
      professionals: bundle.professionals.length,
      services: bundle.services.length,
      styles: bundle.styles.length,
      stories: bundle.feed.stories.length,
      feedSections: bundle.feed.sections.length,
      source: bundle.meta.source,
      slug: bundle.meta.slug,
    },
  }
}
