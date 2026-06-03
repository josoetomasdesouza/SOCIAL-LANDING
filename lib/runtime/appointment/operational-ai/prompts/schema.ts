import { getAllowedPathsForKind } from "../allowed-paths"
import { OPERATIONAL_AI_PROHIBITED_PHRASES } from "../grammar-gate"
import type { OperationalAdaptationKind } from "../types"

export function buildOperationalAiPatchSchemaInstructions(kind: OperationalAdaptationKind): string {
  const allowedPaths = getAllowedPathsForKind(kind)

  return [
    'Return JSON: { "patch": OperationalAiPatch }',
    "OperationalAiPatch may include only:",
    "- operational?: { liveState?, placeHint?, momentHint?, hoursHint? }",
    "- arrival?: { addressLine?, referenceHint?, routeHint?, parkingHint?, arrivalMood? }",
    "- establishment?: { brand?: { description? } }",
    "- services?: Array<{ id, description }> — ids must exist in base bundle",
    "- feed?: { stories?: Array<{ id, label }>, sections?: Section[] } — sections only for external_review_map",
    "",
    `Allowed changed paths for ${kind}:`,
    ...allowedPaths.map((path) => `- ${path}`),
    "",
    "Forbidden patch keys:",
    "- arrival.drawerTitle",
    "- arrival.mapsQuery",
    "- establishment.brand.logo",
    "- establishment.brand.coverImage",
    "- establishment.brand.primaryColor (unless primitive allows description only)",
    "- services[].price / duration / name",
    "- feed.stories[].image",
    "- meta.*",
    "",
    "Forbidden phrases:",
    ...OPERATIONAL_AI_PROHIBITED_PHRASES.map((phrase) => `- ${phrase}`),
  ].join("\n")
}
