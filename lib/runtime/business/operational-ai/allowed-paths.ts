import type { BusinessOperationalAiKind } from "./types"

export const BUSINESS_OPERATIONAL_AI_ALLOWED_PATHS: Record<BusinessOperationalAiKind, readonly string[]> = {
  business_profile: [
    "business.name",
    "business.description",
  ],
  brand_voice: [
    "brand.positioning",
    "brand.toneOfVoice",
  ],
  services: [
    "services[]",
    "services[].name",
    "services[].description",
    "services[].category",
    "services[].price",
    "services[].durationMinutes",
    "services[].tags",
  ],
  operations: [
    "hours",
    "hours.summary",
    "hours.timezone",
    "hours.weekly",
    "location.label",
    "location.address",
    "location.placeHint",
    "location.mapsQuery",
    "location.referenceHint",
    "location.routeHint",
    "location.parkingHint",
    "location.arrivalMood",
    "channels.whatsapp",
    "channels.instagram",
    "channels.email",
    "channels.phone",
    "channels.website",
    "policies.booking",
    "policies.cancellation",
    "policies.payment",
    "policies.delivery",
    "policies.privacy",
    "policies.custom",
  ],
  faq: [
    "knowledge.faq",
    "knowledge.faq[]",
    "knowledge.faq[].question",
    "knowledge.faq[].answer",
  ],
  full_draft: [
    "business.name",
    "business.description",
    "brand.positioning",
    "brand.toneOfVoice",
    "services[]",
    "services[].name",
    "services[].description",
    "services[].category",
    "services[].price",
    "services[].durationMinutes",
    "services[].tags",
    "hours",
    "hours.summary",
    "hours.timezone",
    "hours.weekly",
    "location.label",
    "location.address",
    "location.placeHint",
    "location.mapsQuery",
    "location.referenceHint",
    "location.routeHint",
    "location.parkingHint",
    "location.arrivalMood",
    "channels.whatsapp",
    "channels.instagram",
    "channels.email",
    "channels.phone",
    "channels.website",
    "policies.booking",
    "policies.cancellation",
    "policies.payment",
    "policies.delivery",
    "policies.privacy",
    "policies.custom",
    "knowledge.faq",
    "knowledge.faq[]",
    "knowledge.faq[].question",
    "knowledge.faq[].answer",
  ],
}

export const BUSINESS_OPERATIONAL_AI_LOCKED_PATHS = [
  "version",
  "vertical",
  "slug",
  "status",
  "business.id",
  "brand.logo",
  "brand.coverImage",
  "brand.primaryColor",
  "brand.suggestedColors",
  "brand.visualIdentity",
  "brand.dna",
  "team",
  "knowledge.highlights",
  "knowledge.sourceNotes",
  "meta",
] as const

export function pathMatchesPattern(changedPath: string, pattern: string): boolean {
  if (changedPath === pattern) {
    return true
  }

  const arrayFieldMatch = /^(.+)\[\]\.(.+)$/.exec(pattern)

  if (arrayFieldMatch) {
    const [, prefix, suffix] = arrayFieldMatch
    return new RegExp(`^${escapeRegExp(prefix)}\\[[^\\]]+\\]\\.${escapeRegExp(suffix)}(?:$|\\.)`).test(changedPath)
  }

  if (pattern.endsWith("[]")) {
    const prefix = pattern.slice(0, -2)
    return changedPath.startsWith(`${prefix}[`)
  }

  return changedPath.startsWith(`${pattern}.`)
}

export function isBusinessOperationalAiPathAllowed(
  changedPath: string,
  kind: BusinessOperationalAiKind
): boolean {
  return BUSINESS_OPERATIONAL_AI_ALLOWED_PATHS[kind].some((pattern) =>
    pathMatchesPattern(changedPath, pattern)
  )
}

export function isBusinessOperationalAiPathLocked(path: string): boolean {
  return BUSINESS_OPERATIONAL_AI_LOCKED_PATHS.some((pattern) => pathMatchesPattern(path, pattern))
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
