import type { AppointmentRuntimeBundle } from "./types"
import { APPOINTMENT_PILOT_SLUG, APPOINTMENT_RUNTIME_VERSION } from "./types"

export interface AppointmentRuntimeValidationResult {
  ok: boolean
  errors: string[]
}

function pushUniqueId(ids: Set<string>, id: string, label: string, errors: string[]) {
  if (ids.has(id)) {
    errors.push(`duplicate id: ${label} (${id})`)
    return
  }

  ids.add(id)
}

export function validateAppointmentRuntimeBundle(
  bundle: AppointmentRuntimeBundle,
  expectedSlug: string = APPOINTMENT_PILOT_SLUG
): AppointmentRuntimeValidationResult {
  const errors: string[] = []
  const ids = new Set<string>()

  if (bundle.version !== APPOINTMENT_RUNTIME_VERSION) {
    errors.push(`version must be ${APPOINTMENT_RUNTIME_VERSION}`)
  }

  if (!bundle.establishment.id) {
    errors.push("establishment.id is required")
  }

  if (bundle.establishment.slug !== expectedSlug) {
    errors.push(`establishment.slug must be ${expectedSlug}`)
  }

  if (bundle.establishment.model !== "appointment") {
    errors.push("establishment.model must be appointment")
  }

  if (!bundle.establishment.name.trim()) {
    errors.push("establishment.name is required")
  }

  if (!bundle.meta.slug) {
    errors.push("meta.slug is required")
  }

  if (!bundle.meta.updatedAt) {
    errors.push("meta.updatedAt is required")
  }

  if (!bundle.operational.liveState.trim() || !bundle.operational.placeHint.trim()) {
    errors.push("operational context requires liveState and placeHint")
  }

  if (!bundle.arrival.drawerTitle.trim() || !bundle.arrival.mapsQuery.trim()) {
    errors.push("arrival context requires drawerTitle and mapsQuery")
  }

  if (bundle.professionals.length < 1) {
    errors.push("professionals must not be empty")
  }

  if (bundle.services.length < 1) {
    errors.push("services must not be empty")
  }

  if (bundle.styles.length < 1) {
    errors.push("styles must not be empty")
  }

  if (bundle.feed.stories.length < 1) {
    errors.push("feed.stories must not be empty")
  }

  if (bundle.feed.sections.length < 1) {
    errors.push("feed.sections must not be empty")
  }

  pushUniqueId(ids, bundle.establishment.id, "establishment", errors)

  for (const professional of bundle.professionals) {
    pushUniqueId(ids, professional.id, "professional", errors)

    if (!professional.id.startsWith("barber-")) {
      errors.push(`professional id must keep barber prefix: ${professional.id}`)
    }

    if (professional.availability.length < 1) {
      errors.push(`professional ${professional.id} must include availability`)
    }
  }

  for (const service of bundle.services) {
    pushUniqueId(ids, service.id, "service", errors)

    if (!service.id.startsWith("service-")) {
      errors.push(`service id must keep service prefix: ${service.id}`)
    }
  }

  for (const style of bundle.styles) {
    pushUniqueId(ids, style.id, "style", errors)
  }

  for (const story of bundle.feed.stories) {
    pushUniqueId(ids, story.id, "story", errors)
  }

  for (const section of bundle.feed.sections) {
    if (section.items.length < 1) {
      errors.push(`feed section ${section.id} must not be empty`)
    }

    for (const item of section.items) {
      pushUniqueId(ids, item.id, `feed.${section.id}`, errors)

      if (!item.kind || !item.title.trim()) {
        errors.push(`feed item ${item.id} requires kind and title`)
      }

      const requiresImage = item.kind === "video" || item.kind === "video-vertical" || item.kind === "social"

      if (requiresImage && !item.image?.trim()) {
        errors.push(`feed item ${item.id} requires image`)
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  }
}

export function assertAppointmentRuntimeBundle(
  bundle: AppointmentRuntimeBundle,
  expectedSlug: string = APPOINTMENT_PILOT_SLUG
) {
  const result = validateAppointmentRuntimeBundle(bundle, expectedSlug)

  if (!result.ok) {
    throw new Error(`Invalid AppointmentRuntimeBundle:\n- ${result.errors.join("\n- ")}`)
  }
}
