import {
  createDefaultBrandDNA,
  DEFAULT_BRAND_BEHAVIOR_DNA,
  DEFAULT_BRAND_VOICE_DNA,
  type BrandTone,
  type BrandVisualStyle,
} from "@/lib/brand-dna"
import type { BusinessRuntimeBrand, BusinessRuntimeVertical } from "../core"

export interface BuildBusinessBrandBundleInput {
  brandId: string
  name: string
  description: string
  vertical: BusinessRuntimeVertical
  primaryColor: string
  logo?: string
  coverImage?: string
  industry?: string | null
  website?: string | null
}

function uniqueKeywords(values: Array<string | undefined>) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => value?.split(/[\s,.;|/]+/) ?? [])
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.length >= 4)
    )
  ).slice(0, 8)
}

function resolveTone(vertical: BusinessRuntimeVertical): BrandTone {
  switch (vertical) {
    case "restaurant":
    case "beauty":
    case "barber":
      return "warm"
    case "clinic":
      return "institutional"
    case "gym":
      return "bold"
    case "appointment":
      return "premium"
    case "generic":
      return "minimal"
  }
}

function resolveVisualStyle(vertical: BusinessRuntimeVertical): BrandVisualStyle {
  switch (vertical) {
    case "restaurant":
      return "commerce-soft"
    case "clinic":
      return "institutional-lite"
    case "generic":
      return "editorial"
    case "appointment":
    case "beauty":
    case "barber":
    case "gym":
      return "social-native"
  }
}

function resolveTargetAudience(vertical: BusinessRuntimeVertical, industry?: string | null) {
  if (industry) {
    return `Pessoas interessadas em ${industry}`
  }

  switch (vertical) {
    case "restaurant":
      return "Clientes locais que buscam boa experiência e conveniência"
    case "beauty":
    case "barber":
      return "Clientes que valorizam cuidado pessoal e confiança"
    case "clinic":
      return "Pacientes que buscam orientação clara e atendimento confiável"
    case "gym":
      return "Pessoas que querem rotina, energia e acompanhamento"
    case "appointment":
      return "Clientes que precisam resolver ou agendar com facilidade"
    case "generic":
      return "Pessoas que querem entender a marca rapidamente"
  }
}

function resolveValueProposition(input: BuildBusinessBrandBundleInput) {
  if (input.description) {
    return input.description
  }

  return `${input.name} ajuda seu público a entender, confiar e agir sem fricção.`
}

export function buildBusinessBrandBundle(input: BuildBusinessBrandBundleInput): BusinessRuntimeBrand {
  const tone = resolveTone(input.vertical)
  const visualStyle = resolveVisualStyle(input.vertical)
  const targetAudience = resolveTargetAudience(input.vertical, input.industry)
  const valueProposition = resolveValueProposition(input)
  const keywords = uniqueKeywords([
    input.name,
    input.description,
    input.industry ?? undefined,
    input.website ?? undefined,
    input.vertical,
  ])
  const secondary = `${input.primaryColor}CC`
  const accent = `${input.primaryColor}88`

  return {
    name: input.name,
    description: input.description,
    logo: input.logo,
    coverImage: input.coverImage ?? undefined,
    primaryColor: input.primaryColor,
    positioning: input.industry || valueProposition,
    toneOfVoice: tone,
    personality: tone === "institutional" ? "confiável e clara" : "próxima e humana",
    suggestedColors: {
      primary: input.primaryColor,
      secondary,
      accent,
    },
    visualIdentity: {
      style: visualStyle,
      accent: input.primaryColor,
    },
    keywords,
    targetAudience,
    valueProposition,
    dna: createDefaultBrandDNA({
      brandId: input.brandId,
      brandName: input.name,
      overrides: {
        colors: {
          primary: input.primaryColor,
          secondary,
          accent,
        },
        voice: {
          ...DEFAULT_BRAND_VOICE_DNA,
          tone,
          keywords,
        },
        behavior: {
          ...DEFAULT_BRAND_BEHAVIOR_DNA,
          visualStyle,
        },
      },
    }),
  }
}
