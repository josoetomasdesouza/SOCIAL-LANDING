import { getOperationalPrimitive } from "./primitives"
import { attachOperationalDraftMeta, mergeOperationalPatch } from "./merge-patch"
import { generateFixturePatch } from "./provider.fixture"
import { resolveOperationalAiProvider } from "./resolve-provider.server"
import {
  OPERATIONAL_AI_PROVIDER_FIXTURE,
  OPERATIONAL_PRIMITIVE_IDS,
  type OperationalAiInput,
  type OperationalAiOutputEnvelope,
  type OperationalAiPatch,
  type OperationalAiProviderId,
} from "./types"
import { validateOperationalAiOutput } from "./validate-output"

function buildOperationalAiEnvelope(
  input: OperationalAiInput,
  patch: OperationalAiPatch,
  providerId: OperationalAiProviderId,
  model?: string
): OperationalAiOutputEnvelope {
  const primitive = getOperationalPrimitive(input.adaptationKind)
  const generatedAt = new Date().toISOString()
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
    provider: providerId,
    adaptationKind: input.adaptationKind,
    primitiveId: OPERATIONAL_PRIMITIVE_IDS[input.adaptationKind],
    patch,
    draftBundle,
    ai: {
      provider: providerId,
      adaptationKind: input.adaptationKind,
      primitiveId: OPERATIONAL_PRIMITIVE_IDS[input.adaptationKind],
      generatedAt,
      sourceBundle: "live",
      operatorBrief: input.operatorBrief,
      model,
    },
    validation,
  }
}

export async function generateOperationalAiOutput(
  input: OperationalAiInput,
  options?: { provider?: OperationalAiProviderId }
): Promise<OperationalAiOutputEnvelope> {
  const provider = resolveOperationalAiProvider(options?.provider)
  const generation = await provider.generatePatch(input)

  return buildOperationalAiEnvelope(input, generation.patch, provider.id, generation.model)
}

export function generateOperationalAiFixture(input: OperationalAiInput): OperationalAiOutputEnvelope {
  const patch = generateFixturePatch(input)

  return buildOperationalAiEnvelope(
    input,
    patch,
    OPERATIONAL_AI_PROVIDER_FIXTURE,
    "fixture-deterministic"
  )
}
