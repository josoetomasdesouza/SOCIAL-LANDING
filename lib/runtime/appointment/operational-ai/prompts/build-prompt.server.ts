import { getAllowedPathsForKind } from "../allowed-paths"
import type { OperationalAiInput } from "../types"
import { buildOperationalAiPrimitivePrompt } from "./primitives"
import { buildOperationalAiPatchSchemaInstructions } from "./schema"
import { OPERATIONAL_AI_FORBIDDEN_OUTPUTS, OPERATIONAL_AI_SYSTEM_PROMPT } from "./system"

function serializeBundleContext(input: OperationalAiInput): Record<string, unknown> {
  const { baseBundle, adaptationKind } = input
  const allowed = new Set(getAllowedPathsForKind(adaptationKind))
  const context: Record<string, unknown> = {
    slug: input.slug,
    adaptationKind,
    operatorBrief: input.operatorBrief ?? null,
  }

  if (allowed.has("operational.liveState") || allowed.has("operational.placeHint")) {
    context.operational = baseBundle.operational
  }

  if ([...allowed].some((path) => path.startsWith("arrival."))) {
    context.arrival = baseBundle.arrival
  }

  if (allowed.has("establishment.brand.description")) {
    context.establishment = { brand: { description: baseBundle.establishment.brand.description } }
  }

  if ([...allowed].some((path) => path.startsWith("services"))) {
    context.services = baseBundle.services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
    }))
  }

  if ([...allowed].some((path) => path.startsWith("feed.stories"))) {
    context.stories = baseBundle.feed.stories.map((story) => ({
      id: story.id,
      label: story.label,
    }))
  }

  if (adaptationKind === "external_review_map") {
    context.reviewsSection = baseBundle.feed.sections.find((section) => section.id === "reviews")
    context.externalSnapshot = input.externalSnapshot ?? null
  }

  return context
}

export function buildOperationalAiLlmMessages(input: OperationalAiInput) {
  const primitivePrompt = buildOperationalAiPrimitivePrompt(input.adaptationKind)
  const schemaInstructions = buildOperationalAiPatchSchemaInstructions(input.adaptationKind)
  const bundleContext = serializeBundleContext(input)

  const userPrompt = [
    `Primitive: ${input.adaptationKind}`,
    primitivePrompt,
    "",
    schemaInstructions,
    "",
    "Anti-drift rules:",
    ...OPERATIONAL_AI_FORBIDDEN_OUTPUTS.map((rule) => `- ${rule}`),
    "",
    "Base bundle context (read-only):",
    JSON.stringify(bundleContext, null, 2),
    "",
    'Respond with JSON only: { "patch": { ... } }',
  ].join("\n")

  return {
    system: OPERATIONAL_AI_SYSTEM_PROMPT,
    user: userPrompt,
  }
}
