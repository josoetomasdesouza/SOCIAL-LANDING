/**
 * Pure rule evaluator — no mutations, no side effects.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleEngineOptions,
  RuleEvaluationResult,
  RuleViolation,
} from "./rule-types"

export function evaluateRules<TSubject>(
  rules: readonly RuleDefinition<TSubject>[],
  subject: TSubject,
  context: RuleContext,
  options?: RuleEngineOptions
): RuleEvaluationResult {
  const violations: RuleViolation[] = []
  const evaluatedRuleIds: string[] = []

  for (const rule of rules) {
    evaluatedRuleIds.push(rule.id)
    const violation = rule.evaluate(subject, context)
    if (violation) {
      violations.push(violation)
      if (options?.stopOnBlock && violation.severity === "block") {
        break
      }
    }
  }

  const allowed = !violations.some((violation) => violation.severity === "block")
  return { allowed, violations, evaluatedRuleIds }
}

export function evaluateSingleRule<TSubject>(
  rule: RuleDefinition<TSubject>,
  subject: TSubject,
  context: RuleContext
): RuleEvaluationResult {
  return evaluateRules([rule], subject, context)
}

export function formatRuleViolations(violations: readonly RuleViolation[]): string {
  return violations.map((v) => `[${v.severity}] ${v.ruleId}: ${v.message}`).join("\n")
}
