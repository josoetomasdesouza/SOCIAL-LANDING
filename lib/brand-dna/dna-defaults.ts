/**
 * Default Brand DNA baselines — declarative, no runtime mutation.
 */

import type { BrandDNA, BrandBehaviorDNA, BrandColorDNA, BrandVoiceDNA } from "./dna-types"

export const DEFAULT_COMPOSER_SURFACE_DNA = "rgba(45,50,58,0.96)" as const

export const DEFAULT_BRAND_COLOR_DNA: BrandColorDNA = {
  primary: "#1a1a2e",
  secondary: "#16213e",
  accent: "#e94560",
  surface: "#0f0f23",
  composerSurface: DEFAULT_COMPOSER_SURFACE_DNA,
}

export const DEFAULT_BRAND_VOICE_DNA: BrandVoiceDNA = {
  tone: "warm",
  intensity: "balanced",
  formality: "informal",
  language: "pt-BR",
  keywords: [],
  avoidPhrases: ["compre agora", "oferta imperdível", "clique aqui"],
}

export const DEFAULT_BRAND_BEHAVIOR_DNA: BrandBehaviorDNA = {
  ctaStyle: "conversational",
  visualStyle: "social-native",
  aiProfile: "helpful",
  preferConversationFirst: true,
  allowAggressivePromo: false,
}

export function createDefaultBrandDNA(input: {
  brandId: string
  brandName: string
  overrides?: Partial<Pick<BrandDNA, "colors" | "voice" | "behavior">>
}): BrandDNA {
  return {
    brandId: input.brandId,
    brandName: input.brandName,
    version: 1,
    colors: { ...DEFAULT_BRAND_COLOR_DNA, ...input.overrides?.colors },
    voice: { ...DEFAULT_BRAND_VOICE_DNA, ...input.overrides?.voice },
    behavior: { ...DEFAULT_BRAND_BEHAVIOR_DNA, ...input.overrides?.behavior },
    updatedAt: new Date().toISOString(),
  }
}

export function createBrandDNASnapshot(dna: BrandDNA): BrandDNA & { readonly: true } {
  return Object.freeze({
    ...dna,
    colors: { ...dna.colors },
    voice: { ...dna.voice, keywords: dna.voice.keywords ? [...dna.voice.keywords] : undefined },
    behavior: { ...dna.behavior },
    typography: dna.typography ? { ...dna.typography } : undefined,
  }) as BrandDNA & { readonly: true }
}
