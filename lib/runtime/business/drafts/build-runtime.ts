import { randomUUID } from "node:crypto"

import {
  BUSINESS_RUNTIME_VERSION,
  type BusinessRuntime,
  type BusinessRuntimeVertical,
} from "../core"
import { buildBusinessBrandBundle } from "../brand-bundle"
import type { BusinessRuntimeDraftInput } from "./types"

const DEFAULT_PRIMARY_COLOR = "#F97316"

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
}

export function createBusinessRuntimeDraftId(name: string, idSeed: string = randomUUID()) {
  const prefix = slugify(name) || "business"
  const suffix = idSeed.replace(/-/g, "").slice(0, 8)
  return `${prefix}-${suffix}`
}

export function resolveBusinessRuntimeVertical(input: BusinessRuntimeDraftInput): BusinessRuntimeVertical {
  const model = input.businessModel?.toLowerCase() ?? ""
  const text = [input.name, input.description, input.industry, model]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  if (text.includes("barber") || text.includes("barbearia")) {
    return "barber"
  }

  if (
    text.includes("beauty") ||
    text.includes("beleza") ||
    text.includes("salão") ||
    text.includes("salao") ||
    text.includes("manicure")
  ) {
    return "beauty"
  }

  if (model === "restaurant") {
    return "restaurant"
  }

  if (model === "gym") {
    return "gym"
  }

  if (model === "health" || model === "clinic") {
    return "clinic"
  }

  if (model === "appointment") {
    return "appointment"
  }

  return "generic"
}

export function buildBusinessRuntimeDraft(
  input: BusinessRuntimeDraftInput,
  options: {
    draftId?: string
    now?: string
  } = {}
): BusinessRuntime {
  const now = options.now ?? new Date().toISOString()
  const draftId = options.draftId ?? createBusinessRuntimeDraftId(input.name)
  const vertical = resolveBusinessRuntimeVertical(input)
  const description = input.description?.trim() || "Draft inicial criado pelo onboarding."
  const primaryColor = input.primaryColor?.trim() || DEFAULT_PRIMARY_COLOR
  const website = input.website?.trim() || undefined
  const instagram = input.socialLinks?.instagram || input.channels?.instagram
  const whatsapp = input.socialLinks?.whatsapp || input.channels?.whatsapp
  const brand = buildBusinessBrandBundle({
    brandId: draftId,
    name: input.name.trim(),
    description,
    vertical,
    primaryColor,
    logo: input.logo || undefined,
    coverImage: input.coverImage || input.logo || undefined,
    industry: input.industry,
    website,
  })

  return {
    version: BUSINESS_RUNTIME_VERSION,
    vertical,
    slug: draftId,
    status: "draft",
    business: {
      id: draftId,
      name: input.name.trim(),
      description,
      category: input.industry || input.businessModel || vertical,
    },
    brand,
    services: [],
    team: [],
    hours: {},
    location: {},
    channels: {
      ...input.channels,
      website,
      instagram,
      whatsapp,
    },
    policies: {},
    knowledge: {
      summary: description,
      highlights: [
        {
          id: "draft-intro",
          title: input.name.trim(),
          body: description,
          kind: "post",
          image: input.coverImage || input.logo || undefined,
        },
      ],
      sourceNotes: ["created-from-onboarding-draft"],
    },
    meta: {
      source: "manual",
      updatedAt: now,
    },
  }
}
