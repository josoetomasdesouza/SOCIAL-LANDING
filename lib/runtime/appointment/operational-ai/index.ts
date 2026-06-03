export type {
  AppointmentAiMeta,
  OperationalAdaptationKind,
  OperationalAiConstraints,
  OperationalAiInput,
  OperationalAiOutputEnvelope,
  OperationalAiPatch,
  OperationalAiProviderId,
  OperationalAiValidationResult,
} from "./types"

export type { OperationalAiProvider } from "./provider.interface"

export {
  OPERATIONAL_ADAPTATION_KINDS,
  OPERATIONAL_AI_PROVIDER_FIXTURE,
  OPERATIONAL_AI_PROVIDER_LLM,
  OPERATIONAL_PRIMITIVE_IDS,
} from "./types"

export {
  OPERATIONAL_PRIMITIVE_ALLOWED_PATHS,
  OPERATIONAL_PRIMITIVE_LOCKED_PATHS,
  OPERATIONAL_AI_INFRA_CHANGED_PATHS,
  getAllowedPathsForKind,
  isChangedPathAllowed,
  isInfraChangedPath,
  pathMatchesPattern,
} from "./allowed-paths"

export {
  OPERATIONAL_PRIMITIVES,
  getOperationalPrimitive,
  isOperationalAdaptationKind,
} from "./primitives"

export { generateOperationalAiFixture, generateOperationalAiOutput } from "./generate-output.server"
export { parseOperationalAiPatchResponse } from "./parse-output.server"
export { resolveOperationalAiProviderId, isOperationalAiLlmEnabled } from "./resolve-provider.server"
export { OPERATIONAL_AI_PROMPT_PACK_VERSION } from "./prompts/system"
export { mergeOperationalPatch, attachOperationalDraftMeta } from "./merge-patch"

export {
  OPERATIONAL_AI_FIELD_MAX_LENGTH,
  OPERATIONAL_AI_PROHIBITED_PHRASES,
  collectGrammarPaths,
  containsProhibitedPhrase,
  validateOperationalGrammarField,
} from "./grammar-gate"

export {
  buildInvalidPatchExample,
  buildValidPatchExample,
  collectChangedPaths,
  validateIdPreservation,
  validateOperationalAiOutput,
  validatePatchShape,
  validateSectionKindPreservation,
  validateTopologyPreservation,
} from "./validate-output"

export { runOperationalAiParityChecks } from "./parity"
export { writeOperationalAiDraft } from "./write-draft.server"
export type {
  WriteOperationalAiDraftOptions,
  WriteOperationalAiDraftResult,
} from "./write-draft.server"
