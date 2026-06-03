import type { OperationalAiProvider } from "./provider.interface"
import { fixtureOperationalAiProvider } from "./provider.fixture"
import { llmOperationalAiProvider } from "./provider.llm.server"
import {
  OPERATIONAL_AI_PROVIDER_FIXTURE,
  OPERATIONAL_AI_PROVIDER_LLM,
  type OperationalAiProviderId,
} from "./types"

export function resolveOperationalAiProviderId(
  override?: OperationalAiProviderId
): OperationalAiProviderId {
  if (override) {
    return override
  }

  const raw = process.env.APPOINTMENT_AI_PROVIDER?.trim().toLowerCase()

  if (raw === "llm" || raw === "openai") {
    return OPERATIONAL_AI_PROVIDER_LLM
  }

  return OPERATIONAL_AI_PROVIDER_FIXTURE
}

export function resolveOperationalAiProvider(
  override?: OperationalAiProviderId
): OperationalAiProvider {
  const providerId = resolveOperationalAiProviderId(override)

  if (providerId === OPERATIONAL_AI_PROVIDER_LLM) {
    return llmOperationalAiProvider
  }

  return fixtureOperationalAiProvider
}

export function isOperationalAiLlmEnabled(): boolean {
  return resolveOperationalAiProviderId() === OPERATIONAL_AI_PROVIDER_LLM
}
