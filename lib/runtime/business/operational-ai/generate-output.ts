import { mergeBusinessOperationalAiPatch } from "./merge-patch"
import { generateBusinessOperationalFixturePatch } from "./provider.fixture"
import {
  BUSINESS_OPERATIONAL_AI_PRIMITIVE_IDS,
  BUSINESS_OPERATIONAL_AI_PROVIDER_FIXTURE,
  type BusinessOperationalAiInput,
  type BusinessOperationalAiOutputEnvelope,
  type BusinessOperationalAiPatch,
  type BusinessOperationalAiProviderId,
} from "./types"
import { validateBusinessOperationalAiOutput } from "./validate-output"

function buildBusinessOperationalAiEnvelope(
  input: BusinessOperationalAiInput,
  patch: BusinessOperationalAiPatch,
  provider: BusinessOperationalAiProviderId,
  model?: string
): BusinessOperationalAiOutputEnvelope {
  const draftRuntime = mergeBusinessOperationalAiPatch(input.runtime, patch)
  const validation = validateBusinessOperationalAiOutput({
    baseRuntime: input.runtime,
    mergedRuntime: draftRuntime,
    patch,
    kind: input.kind,
  })

  return {
    provider,
    kind: input.kind,
    primitiveId: BUSINESS_OPERATIONAL_AI_PRIMITIVE_IDS[input.kind],
    patch,
    draftRuntime,
    ai: {
      provider,
      kind: input.kind,
      primitiveId: BUSINESS_OPERATIONAL_AI_PRIMITIVE_IDS[input.kind],
      generatedAt: new Date().toISOString(),
      operatorBrief: input.operatorBrief,
      model,
    },
    validation,
  }
}

export function generateBusinessOperationalAiFixture(
  input: BusinessOperationalAiInput
): BusinessOperationalAiOutputEnvelope {
  const patch = generateBusinessOperationalFixturePatch(input)

  return buildBusinessOperationalAiEnvelope(
    input,
    patch,
    BUSINESS_OPERATIONAL_AI_PROVIDER_FIXTURE,
    "fixture-deterministic"
  )
}
