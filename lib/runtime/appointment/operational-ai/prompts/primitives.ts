import type { OperationalAdaptationKind } from "../types"

export const OPERATIONAL_AI_PRIMITIVE_PROMPTS: Record<OperationalAdaptationKind, string> = {
  operational_hints_refresh:
    "Refresh operational hints (liveState, placeHint, momentHint, hoursHint) with subtle contextual copy. Keep placeHint anchored to the neighborhood.",
  arrival_copy_variation:
    "Vary arrival copy (referenceHint, arrivalMood, optional route/parking hints) without changing drawerTitle or mapsQuery.",
  brand_description_polish:
    "Polish establishment.brand.description only. Keep it editorial and place-rooted, not promotional.",
  service_copy_polish:
    "Polish descriptions for existing services by id. Do not add/remove services or change price/duration/name.",
  external_review_map:
    "Map editorial review items into feed.sections for the existing reviews section only. Preserve section id and review item kind.",
  story_caption_refresh:
    "Refresh feed.stories labels for existing story ids. Do not change story images or ids.",
  full_draft_variation:
    "Compose a bounded variation across operational hints, arrival mood, brand description, up to two service descriptions, and up to two story labels. No structural drift.",
}

export function buildOperationalAiPrimitivePrompt(kind: OperationalAdaptationKind): string {
  return OPERATIONAL_AI_PRIMITIVE_PROMPTS[kind]
}
