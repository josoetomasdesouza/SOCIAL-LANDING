/**
 * Rule registry — declarative rules, no automation.
 */

import { BRAND_DNA_PROTECTED_FIELDS } from "@/lib/brand-dna/dna-types"
import type { BrandDNA } from "@/lib/brand-dna/dna-types"
import type { RuleDefinition } from "./rule-types"

export interface BrandDNAChangeProposal {
  readonly field: string
  readonly nextValue: unknown
  readonly previousValue?: unknown
}

export interface AiProposalSubject {
  readonly action: string
  readonly target?: string
  readonly payload?: unknown
}

const protectComposerSurfaceRule: RuleDefinition<BrandDNAChangeProposal> = {
  id: "brand.dna.protect-composer-surface",
  description: "Composer surface color is frozen in Tier 1",
  scope: "brand.dna",
  severity: "block",
  evaluate: (subject) => {
    if (subject.field === "colors.composerSurface") {
      return {
        ruleId: "brand.dna.protect-composer-surface",
        severity: "block",
        message: "composerSurface is protected and cannot be changed by proposals",
        field: subject.field,
      }
    }
    return null
  },
}

const protectDnaFieldsRule: RuleDefinition<BrandDNAChangeProposal> = {
  id: "brand.dna.protect-core-fields",
  description: "Protected Brand DNA fields require human approval",
  scope: "brand.dna",
  severity: "block",
  evaluate: (subject) => {
    if ((BRAND_DNA_PROTECTED_FIELDS as readonly string[]).includes(subject.field)) {
      return {
        ruleId: "brand.dna.protect-core-fields",
        severity: "block",
        message: `Field ${subject.field} is in BRAND_DNA_PROTECTED_FIELDS`,
        field: subject.field,
      }
    }
    return null
  },
}

const blockAggressivePromoRule: RuleDefinition<BrandDNA> = {
  id: "brand.behavior.no-aggressive-promo",
  description: "Aggressive promo violates experience principles",
  scope: "brand.dna",
  severity: "warn",
  evaluate: (subject) => {
    if (subject.behavior.allowAggressivePromo) {
      return {
        ruleId: "brand.behavior.no-aggressive-promo",
        severity: "warn",
        message: "allowAggressivePromo=true conflicts with social-native experience",
      }
    }
    return null
  },
}

const blockAiTier1MutationRule: RuleDefinition<AiProposalSubject> = {
  id: "ai.block-tier1-mutation",
  description: "AI cannot mutate Tier 1 perceptual systems",
  scope: "ai.proposal",
  severity: "block",
  evaluate: (subject) => {
    const blockedTargets = ["morph", "composer.timing", "z-index", "scroll-lock", "drawer.unify"]
    if (subject.target && blockedTargets.some((t) => subject.target?.includes(t))) {
      return {
        ruleId: "ai.block-tier1-mutation",
        severity: "block",
        message: `AI proposal target "${subject.target}" is Tier 1 protected`,
        field: subject.target,
      }
    }
    return null
  },
}

const blockAiAutoPublishRule: RuleDefinition<AiProposalSubject> = {
  id: "ai.block-auto-publish",
  description: "AI cannot auto-publish without human gate",
  scope: "ai.proposal",
  severity: "block",
  evaluate: (subject) => {
    if (subject.action === "publish" || subject.action === "publish.apply") {
      return {
        ruleId: "ai.block-auto-publish",
        severity: "block",
        message: "Auto-publish requires human approval",
      }
    }
    return null
  },
}

export const RULE_REGISTRY = {
  brandDna: [protectComposerSurfaceRule, protectDnaFieldsRule, blockAggressivePromoRule],
  ai: [blockAiTier1MutationRule, blockAiAutoPublishRule],
} as const

export function getRulesForScope(scope: RuleDefinition["scope"]): RuleDefinition<unknown>[] {
  const all = [...RULE_REGISTRY.brandDna, ...RULE_REGISTRY.ai] as RuleDefinition<unknown>[]
  return all.filter((rule) => rule.scope === scope)
}

export function getAllRegisteredRules(): RuleDefinition<unknown>[] {
  return [...RULE_REGISTRY.brandDna, ...RULE_REGISTRY.ai] as RuleDefinition<unknown>[]
}
