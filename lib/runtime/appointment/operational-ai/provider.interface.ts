import type { OperationalAiInput, OperationalAiPatch, OperationalAiProviderId } from "./types"

export interface OperationalAiPatchGenerationResult {
  patch: OperationalAiPatch
  model?: string
  rawResponse?: string
}

export interface OperationalAiProvider {
  readonly id: OperationalAiProviderId
  generatePatch(input: OperationalAiInput): Promise<OperationalAiPatchGenerationResult>
}
