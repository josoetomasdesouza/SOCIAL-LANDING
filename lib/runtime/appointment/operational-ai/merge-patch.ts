import type { AppointmentRuntimeBundle } from "../types"
import type { OperationalAiPatch } from "./types"

export function mergeOperationalPatch(
  base: AppointmentRuntimeBundle,
  patch: OperationalAiPatch
): AppointmentRuntimeBundle {
  const merged = structuredClone(base)

  if (patch.operational) {
    merged.operational = {
      ...merged.operational,
      ...patch.operational,
    }
  }

  if (patch.arrival) {
    merged.arrival = {
      ...merged.arrival,
      ...patch.arrival,
    }
  }

  if (patch.establishment?.brand) {
    merged.establishment = {
      ...merged.establishment,
      brand: {
        ...merged.establishment.brand,
        ...patch.establishment.brand,
      },
    }
  }

  if (patch.services) {
    for (const servicePatch of patch.services) {
      const target = merged.services.find((service) => service.id === servicePatch.id)

      if (target && servicePatch.description !== undefined) {
        target.description = servicePatch.description
      }
    }
  }

  if (patch.feed?.stories) {
    for (const storyPatch of patch.feed.stories) {
      const target = merged.feed.stories.find((story) => story.id === storyPatch.id)

      if (target && storyPatch.label !== undefined) {
        target.label = storyPatch.label
      }
    }
  }

  if (patch.feed?.sections) {
    merged.feed.sections = structuredClone(patch.feed.sections)
  }

  return merged
}

export function attachOperationalDraftMeta(
  bundle: AppointmentRuntimeBundle,
  slug: string
): AppointmentRuntimeBundle {
  const draft = structuredClone(bundle)
  const updatedAt = new Date().toISOString()

  draft.meta = {
    ...draft.meta,
    source: "runtime",
    slug,
    updatedAt,
    publication: {
      publicationState: "draft",
      derivedFrom: "ai",
      draftUpdatedAt: updatedAt,
    },
  }

  return draft
}
