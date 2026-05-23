/**
 * Rule Engine — types only (foundation phase).
 * Rules evaluate proposals; they do NOT mutate runtime or Tier 1.
 */

export type RuleSeverity = "info" | "warn" | "block"

export type RuleScope =
  | "brand.dna"
  | "publication"
  | "ai.proposal"
  | "integration"
  | "surface"
  | "global"

export interface RuleContext {
  readonly scope: RuleScope
  readonly brandId?: string
  readonly actor?: "human" | "system" | "ai"
  readonly metadata?: Readonly<Record<string, string | number | boolean>>
}

export interface RuleViolation {
  readonly ruleId: string
  readonly severity: RuleSeverity
  readonly message: string
  readonly field?: string
}

export interface RuleEvaluationResult {
  readonly allowed: boolean
  readonly violations: readonly RuleViolation[]
  readonly evaluatedRuleIds: readonly string[]
}

export interface RuleDefinition<TSubject = unknown> {
  readonly id: string
  readonly description: string
  readonly scope: RuleScope
  readonly severity: RuleSeverity
  readonly evaluate: (subject: TSubject, context: RuleContext) => RuleViolation | null
}

export interface RuleEngineOptions {
  readonly stopOnBlock?: boolean
}
