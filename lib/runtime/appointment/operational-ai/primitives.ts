import { OPERATIONAL_PRIMITIVE_ALLOWED_PATHS, OPERATIONAL_PRIMITIVE_LOCKED_PATHS } from "./allowed-paths"
import {
  OPERATIONAL_ADAPTATION_KINDS,
  OPERATIONAL_PRIMITIVE_IDS,
  type OperationalAdaptationKind,
} from "./types"

export interface OperationalPrimitiveDefinition {
  id: string
  kind: OperationalAdaptationKind
  description: string
  allowedPaths: readonly string[]
  lockedPaths: readonly string[]
  requiresExternalSnapshot: boolean
  preservesEntityIds: boolean
}

export const OPERATIONAL_PRIMITIVES: Record<OperationalAdaptationKind, OperationalPrimitiveDefinition> =
  Object.fromEntries(
    OPERATIONAL_ADAPTATION_KINDS.map((kind) => [
      kind,
      {
        id: OPERATIONAL_PRIMITIVE_IDS[kind],
        kind,
        description: describePrimitive(kind),
        allowedPaths: OPERATIONAL_PRIMITIVE_ALLOWED_PATHS[kind],
        lockedPaths: OPERATIONAL_PRIMITIVE_LOCKED_PATHS[kind],
        requiresExternalSnapshot: kind === "external_review_map",
        preservesEntityIds: true,
      } satisfies OperationalPrimitiveDefinition,
    ])
  ) as Record<OperationalAdaptationKind, OperationalPrimitiveDefinition>

function describePrimitive(kind: OperationalAdaptationKind): string {
  switch (kind) {
    case "operational_hints_refresh":
      return "Refresh operational hints without touching feed topology"
    case "arrival_copy_variation":
      return "Bounded arrival copy variation preserving drawer grammar"
    case "brand_description_polish":
      return "Polish establishment brand description"
    case "service_copy_polish":
      return "Polish service descriptions by existing service id"
    case "external_review_map":
      return "Map external snapshot reviews into reviews feed section"
    case "story_caption_refresh":
      return "Refresh story labels preserving story ids and media"
    case "full_draft_variation":
      return "Compose a draft bundle variation across allowed operational fields"
    default:
      return kind
  }
}

export function getOperationalPrimitive(kind: OperationalAdaptationKind): OperationalPrimitiveDefinition {
  return OPERATIONAL_PRIMITIVES[kind]
}

export function isOperationalAdaptationKind(value: string): value is OperationalAdaptationKind {
  return (OPERATIONAL_ADAPTATION_KINDS as readonly string[]).includes(value)
}
