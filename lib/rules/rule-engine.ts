/**
 * Rule Engine facade — evaluate only, never apply changes.
 */

import { evaluateRules } from "./rule-evaluator"
import { getAllRegisteredRules, getRulesForScope } from "./rule-registry"
import type { RuleContext, RuleEngineOptions, RuleEvaluationResult } from "./rule-types"

export class RuleEngine {
  evaluate<TSubject>(
    subject: TSubject,
    context: RuleContext,
    options?: RuleEngineOptions
  ): RuleEvaluationResult {
    const rules = getRulesForScope(context.scope) as Parameters<typeof evaluateRules<TSubject>>[0]
    if (rules.length === 0) {
      return { allowed: true, violations: [], evaluatedRuleIds: [] }
    }
    return evaluateRules(rules, subject, context, options)
  }

  evaluateAll<TSubject>(
    subject: TSubject,
    context: RuleContext,
    options?: RuleEngineOptions
  ): RuleEvaluationResult {
    const rules = getAllRegisteredRules() as Parameters<typeof evaluateRules<TSubject>>[0]
    return evaluateRules(rules, subject, context, options)
  }
}

export const ruleEngine = new RuleEngine()

export function evaluateBrandDnaProposal(
  subject: Parameters<RuleEngine["evaluate"]>[0],
  brandId?: string
): RuleEvaluationResult {
  return ruleEngine.evaluate(subject, { scope: "brand.dna", brandId, actor: "system" })
}

export function evaluateAiProposal(
  subject: Parameters<RuleEngine["evaluate"]>[0],
  brandId?: string
): RuleEvaluationResult {
  return ruleEngine.evaluate(subject, { scope: "ai.proposal", brandId, actor: "ai" }, { stopOnBlock: true })
}
