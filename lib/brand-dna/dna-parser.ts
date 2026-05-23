/**
 * Brand DNA parser — normalizes external/partial input into BrandDNA.
 * Pure functions only. No IA. No side effects.
 */

import { createDefaultBrandDNA, DEFAULT_BRAND_COLOR_DNA } from "./dna-defaults"
import type {
  BrandAiBehaviorProfile,
  BrandBehaviorDNA,
  BrandCtaStyle,
  BrandDNA,
  BrandIntensity,
  BrandTone,
  BrandVisualStyle,
  BrandVoiceDNA,
} from "./dna-types"

export interface BrandDNAInputPartial {
  readonly brandId?: string
  readonly brandName?: string
  readonly primaryColor?: string
  readonly accentColor?: string
  readonly tone?: string
  readonly intensity?: string
  readonly ctaStyle?: string
  readonly language?: string
}

const TONE_ALIASES: Record<string, BrandTone> = {
  warm: "warm",
  premium: "premium",
  playful: "playful",
  institutional: "institutional",
  minimal: "minimal",
  bold: "bold",
  editorial: "editorial",
}

const INTENSITY_ALIASES: Record<string, BrandIntensity> = {
  subtle: "subtle",
  balanced: "balanced",
  expressive: "expressive",
}

const CTA_STYLE_ALIASES: Record<string, BrandCtaStyle> = {
  conversational: "conversational",
  direct: "direct",
  soft: "soft",
  "premium-minimal": "premium-minimal",
}

function normalizeTone(value?: string): BrandTone {
  if (!value) return "warm"
  return TONE_ALIASES[value.toLowerCase()] ?? "warm"
}

function normalizeIntensity(value?: string): BrandIntensity {
  if (!value) return "balanced"
  return INTENSITY_ALIASES[value.toLowerCase()] ?? "balanced"
}

function normalizeCtaStyle(value?: string): BrandCtaStyle {
  if (!value) return "conversational"
  return CTA_STYLE_ALIASES[value.toLowerCase()] ?? "conversational"
}

function inferVisualStyle(tone: BrandTone): BrandVisualStyle {
  if (tone === "institutional") return "institutional-lite"
  if (tone === "editorial") return "editorial"
  if (tone === "premium") return "commerce-soft"
  return "social-native"
}

function inferAiProfile(tone: BrandTone): BrandAiBehaviorProfile {
  if (tone === "premium" || tone === "institutional") return "consultative"
  if (tone === "playful") return "helpful"
  return "concise"
}

export function parseBrandDNAInput(input: BrandDNAInputPartial): BrandDNA {
  const brandId = input.brandId ?? "unknown-brand"
  const brandName = input.brandName ?? "Marca"
  const tone = normalizeTone(input.tone)
  const intensity = normalizeIntensity(input.intensity)
  const ctaStyle = normalizeCtaStyle(input.ctaStyle)

  const voice: BrandVoiceDNA = {
    tone,
    intensity,
    formality: tone === "institutional" ? "formal" : "informal",
    language: input.language ?? "pt-BR",
  }

  const behavior: BrandBehaviorDNA = {
    ctaStyle,
    visualStyle: inferVisualStyle(tone),
    aiProfile: inferAiProfile(tone),
    preferConversationFirst: ctaStyle === "conversational" || ctaStyle === "soft",
    allowAggressivePromo: false,
  }

  return createDefaultBrandDNA({
    brandId,
    brandName,
    overrides: {
      colors: {
        ...DEFAULT_BRAND_COLOR_DNA,
        primary: input.primaryColor ?? DEFAULT_BRAND_COLOR_DNA.primary,
        accent: input.accentColor ?? DEFAULT_BRAND_COLOR_DNA.accent,
      },
      voice,
      behavior,
    },
  })
}

export interface BrandDNAParseResult {
  readonly dna: BrandDNA
  readonly warnings: readonly string[]
}

export function parseBrandDNAInputWithWarnings(input: BrandDNAInputPartial): BrandDNAParseResult {
  const warnings: string[] = []
  if (!input.brandId) warnings.push("brandId missing — using fallback")
  if (input.tone && !TONE_ALIASES[input.tone.toLowerCase()]) {
    warnings.push(`unknown tone "${input.tone}" — defaulted to warm`)
  }
  return { dna: parseBrandDNAInput(input), warnings }
}
