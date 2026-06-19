import type {
  BusinessRuntime,
  BusinessRuntimeChannelSet,
  BusinessRuntimeHours,
  BusinessRuntimeLocation,
  BusinessRuntimePolicies,
  BusinessRuntimeService,
} from "../core"

export const BUSINESS_OPERATIONAL_AI_PROVIDER_FIXTURE = "fixture" as const

export type BusinessOperationalAiProviderId =
  | typeof BUSINESS_OPERATIONAL_AI_PROVIDER_FIXTURE
  | (string & {})

export const BUSINESS_OPERATIONAL_AI_KINDS = [
  "business_profile",
  "brand_voice",
  "services",
  "operations",
  "faq",
  "full_draft",
] as const

export type BusinessOperationalAiKind = (typeof BUSINESS_OPERATIONAL_AI_KINDS)[number]

export const BUSINESS_OPERATIONAL_AI_PRIMITIVE_IDS = {
  business_profile: "BR-OP-01",
  brand_voice: "BR-OP-02",
  services: "BR-OP-03",
  operations: "BR-OP-04",
  faq: "BR-OP-05",
  full_draft: "BR-OP-06",
} as const satisfies Record<BusinessOperationalAiKind, string>

export interface BusinessOperationalAiInput {
  draftId: string
  runtime: BusinessRuntime
  kind: BusinessOperationalAiKind
  operatorBrief?: string
}

export interface BusinessOperationalAiPatch {
  business?: Pick<BusinessRuntime["business"], "name" | "description">
  brand?: Pick<BusinessRuntime["brand"], "positioning" | "toneOfVoice">
  services?: Array<Partial<Omit<BusinessRuntimeService, "id">> & { id?: string }>
  hours?: BusinessRuntimeHours
  location?: BusinessRuntimeLocation
  channels?: BusinessRuntimeChannelSet
  policies?: BusinessRuntimePolicies
  knowledge?: {
    faq?: NonNullable<BusinessRuntime["knowledge"]["faq"]>
  }
}

export interface BusinessOperationalAiValidationResult {
  ok: boolean
  errors: string[]
  warnings: string[]
  changedPaths: string[]
}

export interface BusinessOperationalAiMeta {
  provider: BusinessOperationalAiProviderId
  kind: BusinessOperationalAiKind
  primitiveId: string
  generatedAt: string
  operatorBrief?: string
  model?: string
}

export interface BusinessOperationalAiOutputEnvelope {
  provider: BusinessOperationalAiProviderId
  kind: BusinessOperationalAiKind
  primitiveId: string
  patch: BusinessOperationalAiPatch
  draftRuntime: BusinessRuntime
  ai: BusinessOperationalAiMeta
  validation: BusinessOperationalAiValidationResult
}
