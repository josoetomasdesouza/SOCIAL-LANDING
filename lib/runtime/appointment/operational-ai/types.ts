import type { ExternalRealitySnapshot } from "../external-reality/types"
import type { AppointmentRuntimeBundle } from "../types"

export const OPERATIONAL_AI_PROVIDER_FIXTURE = "fixture" as const

export type OperationalAiProvider =
  | typeof OPERATIONAL_AI_PROVIDER_FIXTURE
  | "openai"
  | "anthropic"
  | (string & {})

export const OPERATIONAL_ADAPTATION_KINDS = [
  "operational_hints_refresh",
  "arrival_copy_variation",
  "brand_description_polish",
  "service_copy_polish",
  "external_review_map",
  "story_caption_refresh",
  "full_draft_variation",
] as const

export type OperationalAdaptationKind = (typeof OPERATIONAL_ADAPTATION_KINDS)[number]

export const OPERATIONAL_PRIMITIVE_IDS = {
  operational_hints_refresh: "P-01",
  arrival_copy_variation: "P-02",
  brand_description_polish: "P-03",
  service_copy_polish: "P-04",
  external_review_map: "P-05",
  story_caption_refresh: "P-06",
  full_draft_variation: "P-07",
} as const satisfies Record<OperationalAdaptationKind, string>

export interface OperationalAiConstraints {
  lockedPaths?: string[]
  maxFieldLength?: number
}

export interface OperationalAiInput {
  slug: string
  baseBundle: AppointmentRuntimeBundle
  adaptationKind: OperationalAdaptationKind
  externalSnapshot?: ExternalRealitySnapshot | null
  operatorBrief?: string
  constraints?: OperationalAiConstraints
}

export interface AppointmentAiMeta {
  provider: OperationalAiProvider
  adaptationKind: OperationalAdaptationKind
  primitiveId: string
  generatedAt: string
  sourceBundle: "live" | "draft" | "mock-adapter"
  operatorBrief?: string
  model?: string
}

export interface OperationalAiValidationResult {
  ok: boolean
  errors: string[]
  warnings: string[]
}

export interface OperationalAiPatch {
  operational?: AppointmentRuntimeBundle["operational"]
  arrival?: Partial<AppointmentRuntimeBundle["arrival"]>
  establishment?: {
    brand?: Partial<AppointmentRuntimeBundle["establishment"]["brand"]>
  }
  services?: Array<Pick<AppointmentRuntimeBundle["services"][number], "id" | "description">>
  feed?: {
    stories?: Array<Pick<AppointmentRuntimeBundle["feed"]["stories"][number], "id" | "label">>
    sections?: AppointmentRuntimeBundle["feed"]["sections"]
  }
}

export interface OperationalAiOutputEnvelope {
  provider: OperationalAiProvider
  adaptationKind: OperationalAdaptationKind
  primitiveId: string
  patch: OperationalAiPatch
  draftBundle: AppointmentRuntimeBundle
  ai: AppointmentAiMeta
  validation: OperationalAiValidationResult
}
