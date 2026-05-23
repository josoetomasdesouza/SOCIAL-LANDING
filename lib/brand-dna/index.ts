export type {
  BrandAiBehaviorProfile,
  BrandBehaviorDNA,
  BrandColorDNA,
  BrandCtaStyle,
  BrandDNA,
  BrandDNAField,
  BrandDNASnapshot,
  BrandIntensity,
  BrandTone,
  BrandTypographyDNA,
  BrandVisualStyle,
  BrandVoiceDNA,
} from "./dna-types"
export { BRAND_DNA_PROTECTED_FIELDS } from "./dna-types"

export {
  createBrandDNASnapshot,
  createDefaultBrandDNA,
  DEFAULT_BRAND_BEHAVIOR_DNA,
  DEFAULT_BRAND_COLOR_DNA,
  DEFAULT_BRAND_VOICE_DNA,
  DEFAULT_COMPOSER_SURFACE_DNA,
} from "./dna-defaults"

export type { BrandDNAInputPartial, BrandDNAParseResult } from "./dna-parser"
export { parseBrandDNAInput, parseBrandDNAInputWithWarnings } from "./dna-parser"

export type { BrandSignal, BrandSignalStrength } from "./dna-signals"
export { brandSignalsToRecord, deriveBrandSignals, getBrandSignal } from "./dna-signals"
