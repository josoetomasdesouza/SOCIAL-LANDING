/**
 * Brand DNA — immutable identity contract (foundation only).
 * No adaptive behavior. No IA mutations.
 */

export type BrandTone =
  | "warm"
  | "premium"
  | "playful"
  | "institutional"
  | "minimal"
  | "bold"
  | "editorial"

export type BrandIntensity = "subtle" | "balanced" | "expressive"

export type BrandVisualStyle = "social-native" | "editorial" | "commerce-soft" | "institutional-lite"

export type BrandCtaStyle = "conversational" | "direct" | "soft" | "premium-minimal"

export type BrandAiBehaviorProfile = "concise" | "helpful" | "consultative" | "sales-assist"

export interface BrandColorDNA {
  readonly primary: string
  readonly secondary?: string
  readonly accent?: string
  readonly surface?: string
  /** Frozen composer anchor — do not mutate via evolution in v1 */
  readonly composerSurface?: string
}

export interface BrandTypographyDNA {
  readonly preset?: "default" | "editorial" | "modern" | "classic"
  readonly headlineWeight?: "medium" | "semibold" | "bold"
}

export interface BrandVoiceDNA {
  readonly tone: BrandTone
  readonly intensity: BrandIntensity
  readonly formality: "informal" | "neutral" | "formal"
  readonly language: string
  readonly keywords?: readonly string[]
  readonly avoidPhrases?: readonly string[]
}

export interface BrandBehaviorDNA {
  readonly ctaStyle: BrandCtaStyle
  readonly visualStyle: BrandVisualStyle
  readonly aiProfile: BrandAiBehaviorProfile
  readonly preferConversationFirst: boolean
  readonly allowAggressivePromo: boolean
}

export interface BrandDNA {
  readonly brandId: string
  readonly brandName: string
  readonly version: number
  readonly colors: BrandColorDNA
  readonly typography?: BrandTypographyDNA
  readonly voice: BrandVoiceDNA
  readonly behavior: BrandBehaviorDNA
  readonly updatedAt?: string
}

export interface BrandDNASnapshot extends BrandDNA {
  readonly readonly: true
}

export type BrandDNAField =
  | "colors.primary"
  | "colors.composerSurface"
  | "voice.tone"
  | "behavior.ctaStyle"
  | "behavior.aiProfile"

export const BRAND_DNA_PROTECTED_FIELDS: readonly BrandDNAField[] = [
  "colors.composerSurface",
] as const
