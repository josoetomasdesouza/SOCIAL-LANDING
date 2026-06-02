export type {
  AppointmentAiMeta,
  OperationalAdaptationKind,
  OperationalAiConstraints,
  OperationalAiInput,
  OperationalAiOutputEnvelope,
  OperationalAiPatch,
  OperationalAiProvider,
  OperationalAiValidationResult,
} from "./types"

export {
  OPERATIONAL_ADAPTATION_KINDS,
  OPERATIONAL_AI_PROVIDER_FIXTURE,
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

export { generateOperationalAiFixture } from "./fixture-generator"
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
