import { filterEditorialReviews } from "../external-reality/editorial-gate"
import { EXTERNAL_REALITY_MAX_REVIEWS } from "../external-reality/types"
import type { AppointmentRuntimeBundle, RuntimeFeedItem } from "../types"
import type { OperationalAiProvider } from "./provider.interface"
import {
  OPERATIONAL_AI_PROVIDER_FIXTURE,
  type OperationalAiInput,
  type OperationalAiPatch,
} from "./types"

function suffixFromBrief(brief: string | undefined, fallback: string): string {
  const normalized = brief?.trim()

  if (!normalized) {
    return fallback
  }

  return normalized.slice(0, 48)
}

function mapExternalReviewToFeedItem(review: {
  id: string
  text: string
  author: string
  rating: number
}): RuntimeFeedItem {
  return {
    id: review.id,
    kind: "review",
    title: review.text.trim(),
    image: "",
    metadata: {
      rating: review.rating,
      reviewerName: review.author.trim(),
    },
  }
}

export function buildOperationalHintsPatch(
  base: AppointmentRuntimeBundle,
  brief?: string
): OperationalAiPatch {
  const marker = suffixFromBrief(brief, "fixture")

  return {
    operational: {
      liveState: base.operational.liveState,
      placeHint: base.operational.placeHint,
      momentHint: `encaixe leve — ${marker}`,
      hoursHint: base.operational.hoursHint ?? "até 20h",
    },
  }
}

export function buildArrivalCopyPatch(base: AppointmentRuntimeBundle, brief?: string): OperationalAiPatch {
  const marker = suffixFromBrief(brief, "referencia atualizada")

  return {
    arrival: {
      referenceHint: `${base.arrival.referenceHint} ${marker}`.slice(0, 180),
      arrivalMood: base.arrival.arrivalMood ?? "Fluxo calmo no fim da tarde.",
    },
  }
}

export function buildBrandDescriptionPatch(base: AppointmentRuntimeBundle, brief?: string): OperationalAiPatch {
  const marker = suffixFromBrief(brief, "presenca na augusta")

  return {
    establishment: {
      brand: {
        description: `${base.establishment.brand.description} — ${marker}`.slice(0, 220),
      },
    },
  }
}

export function buildServiceCopyPatch(base: AppointmentRuntimeBundle, brief?: string): OperationalAiPatch {
  const marker = suffixFromBrief(brief, "atendimento cuidadoso")

  return {
    services: base.services.slice(0, 2).map((service) => ({
      id: service.id,
      description: `${service.description} (${marker})`.slice(0, 180),
    })),
  }
}

export function buildStoryLabelPatch(base: AppointmentRuntimeBundle, brief?: string): OperationalAiPatch {
  const marker = suffixFromBrief(brief, "hoje")

  return {
    feed: {
      stories: base.feed.stories.slice(0, 2).map((story) => ({
        id: story.id,
        label: `${story.label} · ${marker}`.slice(0, 48),
      })),
    },
  }
}

export function buildExternalReviewPatch(
  base: AppointmentRuntimeBundle,
  snapshot: NonNullable<OperationalAiInput["externalSnapshot"]>
): OperationalAiPatch {
  const editorialReviews = filterEditorialReviews(snapshot.reviews).slice(0, EXTERNAL_REALITY_MAX_REVIEWS)
  const reviewsSection = base.feed.sections.find((section) => section.id === "reviews")

  if (!reviewsSection || editorialReviews.length === 0) {
    return buildOperationalHintsPatch(base, "fallback-no-reviews")
  }

  const sections = base.feed.sections.map((section) => {
    if (section.id !== "reviews") {
      return structuredClone(section)
    }

    return {
      ...section,
      items: editorialReviews.map(mapExternalReviewToFeedItem),
    }
  })

  return {
    feed: {
      sections,
    },
  }
}

export function buildFullDraftPatch(base: AppointmentRuntimeBundle, brief?: string): OperationalAiPatch {
  const hints = buildOperationalHintsPatch(base, brief)
  const brand = buildBrandDescriptionPatch(base, brief)
  const stories = buildStoryLabelPatch(base, brief)

  return {
    operational: hints.operational,
    establishment: brand.establishment,
    feed: stories.feed,
  }
}

export function generateFixturePatch(input: OperationalAiInput): OperationalAiPatch {
  switch (input.adaptationKind) {
    case "operational_hints_refresh":
      return buildOperationalHintsPatch(input.baseBundle, input.operatorBrief)
    case "arrival_copy_variation":
      return buildArrivalCopyPatch(input.baseBundle, input.operatorBrief)
    case "brand_description_polish":
      return buildBrandDescriptionPatch(input.baseBundle, input.operatorBrief)
    case "service_copy_polish":
      return buildServiceCopyPatch(input.baseBundle, input.operatorBrief)
    case "external_review_map":
      return input.externalSnapshot
        ? buildExternalReviewPatch(input.baseBundle, input.externalSnapshot)
        : {}
    case "story_caption_refresh":
      return buildStoryLabelPatch(input.baseBundle, input.operatorBrief)
    case "full_draft_variation":
      return buildFullDraftPatch(input.baseBundle, input.operatorBrief)
    default:
      return buildOperationalHintsPatch(input.baseBundle, input.operatorBrief)
  }
}

export const fixtureOperationalAiProvider: OperationalAiProvider = {
  id: OPERATIONAL_AI_PROVIDER_FIXTURE,
  async generatePatch(input) {
    return {
      patch: generateFixturePatch(input),
      model: "fixture-deterministic",
    }
  },
}
