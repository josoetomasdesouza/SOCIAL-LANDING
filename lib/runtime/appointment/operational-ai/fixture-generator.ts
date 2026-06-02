import { filterEditorialReviews } from "../external-reality/editorial-gate"
import { EXTERNAL_REALITY_MAX_REVIEWS } from "../external-reality/types"
import type { AppointmentRuntimeBundle, RuntimeFeedItem } from "../types"
import { getOperationalPrimitive } from "./primitives"
import { attachOperationalDraftMeta, mergeOperationalPatch } from "./merge-patch"
import {
  OPERATIONAL_AI_PROVIDER_FIXTURE,
  OPERATIONAL_PRIMITIVE_IDS,
  type OperationalAiInput,
  type OperationalAiOutputEnvelope,
  type OperationalAiPatch,
} from "./types"
import { validateOperationalAiOutput } from "./validate-output"

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

function buildOperationalHintsPatch(
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

function buildArrivalCopyPatch(base: AppointmentRuntimeBundle, brief?: string): OperationalAiPatch {
  const marker = suffixFromBrief(brief, "referencia atualizada")

  return {
    arrival: {
      referenceHint: `${base.arrival.referenceHint} ${marker}`.slice(0, 180),
      arrivalMood: base.arrival.arrivalMood ?? "Fluxo calmo no fim da tarde.",
    },
  }
}

function buildBrandDescriptionPatch(base: AppointmentRuntimeBundle, brief?: string): OperationalAiPatch {
  const marker = suffixFromBrief(brief, "presenca na augusta")

  return {
    establishment: {
      brand: {
        description: `${base.establishment.brand.description} — ${marker}`.slice(0, 220),
      },
    },
  }
}

function buildServiceCopyPatch(base: AppointmentRuntimeBundle, brief?: string): OperationalAiPatch {
  const marker = suffixFromBrief(brief, "atendimento cuidadoso")

  return {
    services: base.services.slice(0, 2).map((service) => ({
      id: service.id,
      description: `${service.description} (${marker})`.slice(0, 180),
    })),
  }
}

function buildStoryLabelPatch(base: AppointmentRuntimeBundle, brief?: string): OperationalAiPatch {
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

function buildExternalReviewPatch(
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

function buildFullDraftPatch(base: AppointmentRuntimeBundle, brief?: string): OperationalAiPatch {
  const hints = buildOperationalHintsPatch(base, brief)
  const brand = buildBrandDescriptionPatch(base, brief)
  const stories = buildStoryLabelPatch(base, brief)

  return {
    operational: hints.operational,
    establishment: brand.establishment,
    feed: stories.feed,
  }
}

export function generateOperationalAiFixture(input: OperationalAiInput): OperationalAiOutputEnvelope {
  const primitive = getOperationalPrimitive(input.adaptationKind)
  const generatedAt = new Date().toISOString()
  let patch: OperationalAiPatch

  switch (input.adaptationKind) {
    case "operational_hints_refresh":
      patch = buildOperationalHintsPatch(input.baseBundle, input.operatorBrief)
      break
    case "arrival_copy_variation":
      patch = buildArrivalCopyPatch(input.baseBundle, input.operatorBrief)
      break
    case "brand_description_polish":
      patch = buildBrandDescriptionPatch(input.baseBundle, input.operatorBrief)
      break
    case "service_copy_polish":
      patch = buildServiceCopyPatch(input.baseBundle, input.operatorBrief)
      break
    case "external_review_map":
      patch = input.externalSnapshot
        ? buildExternalReviewPatch(input.baseBundle, input.externalSnapshot)
        : {}
      break
    case "story_caption_refresh":
      patch = buildStoryLabelPatch(input.baseBundle, input.operatorBrief)
      break
    case "full_draft_variation":
      patch = buildFullDraftPatch(input.baseBundle, input.operatorBrief)
      break
    default:
      patch = buildOperationalHintsPatch(input.baseBundle, input.operatorBrief)
  }

  const merged = mergeOperationalPatch(input.baseBundle, patch)
  const draftBundle = attachOperationalDraftMeta(merged, input.slug)
  const validation = validateOperationalAiOutput({
    slug: input.slug,
    baseBundle: input.baseBundle,
    mergedBundle: draftBundle,
    patch,
    adaptationKind: input.adaptationKind,
  })

  if (primitive.requiresExternalSnapshot && !input.externalSnapshot) {
    validation.ok = false
    validation.errors.push("external_review_map requires externalSnapshot input")
  }

  return {
    provider: OPERATIONAL_AI_PROVIDER_FIXTURE,
    adaptationKind: input.adaptationKind,
    primitiveId: OPERATIONAL_PRIMITIVE_IDS[input.adaptationKind],
    patch,
    draftBundle,
    ai: {
      provider: OPERATIONAL_AI_PROVIDER_FIXTURE,
      adaptationKind: input.adaptationKind,
      primitiveId: OPERATIONAL_PRIMITIVE_IDS[input.adaptationKind],
      generatedAt,
      sourceBundle: "live",
      operatorBrief: input.operatorBrief,
      model: "fixture-deterministic",
    },
    validation,
  }
}
