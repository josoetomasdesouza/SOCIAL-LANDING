import { detectStrongTopic, resolveActiveTopic } from "./active-topic"
import {
  classifyAnswerability,
  replyFromOperational,
  replyFromSelectedContext,
  replyHonestGap,
  replyNeedsClarification,
  type AnswerabilityClass,
  type AnswerabilityDecision,
} from "./answerability-classifier"
import { resolveBroadClarification } from "./broad-clarification"
import { resolveMissingContextClarification } from "./missing-context"
import type { KernelResponse, KernelSession, ModelContextPack } from "./types"

/** Executor strategy — WS-19A Phase 1.5 §3.3 */
export type ResponseStrategy =
  | "direct"
  | "honest_gap"
  | "clarify_target"
  | "clarify_broad"
  | "delegate_08c"
  | "blocked"
  | "defer_legacy"

export interface TurnClassification {
  lane: AnswerabilityClass
  strategy: ResponseStrategy
  reason: string
}

const AUGUSTA_FORBIDDEN = /veja servi(c|o)s e profissionais no feed quando quiser/i

export function resolveStrategyFromDecision(decision: AnswerabilityDecision): ResponseStrategy {
  switch (decision.class) {
    case "blocked":
      return "blocked"
    case "should_delegate_transactional":
      return "delegate_08c"
    case "answerable_from_active_topic":
    case "answerable_from_operational_context":
    case "answerable_from_catalog":
    case "answerable_from_selected_context":
      return "direct"
    case "answerable_with_honest_gap":
      return "honest_gap"
    case "in_domain_missing_context":
      return "clarify_target"
    case "needs_clarification":
      if (decision.reason === "broad_clarify") return "clarify_broad"
      if (decision.reason === "defer_to_legacy") return "defer_legacy"
      return "clarify_target"
    default:
      return "defer_legacy"
  }
}

export function classifyTurn(
  message: string,
  pack: ModelContextPack,
  session: KernelSession
): TurnClassification {
  const decision = classifyAnswerability(message, pack, session)
  return {
    lane: decision.class,
    strategy: resolveStrategyFromDecision(decision),
    reason: decision.reason,
  }
}

export function executeStrategy(
  message: string,
  pack: ModelContextPack,
  session: KernelSession,
  decision: AnswerabilityDecision
): KernelResponse | null {
  switch (decision.class) {
    case "blocked":
      return {
        reply: "Não posso diagnosticar condição de saúde aqui — procure um profissional de saúde ou o balcão da casa.",
        intent: "domain_blocked",
        topic: "clinical",
        domainZone: "off_domain_blocked",
        topicShift: false,
        structure: { acknowledged: true, answered: true },
        confidence: "high",
        action: { type: "text_only" },
        source: "rule_table",
        grounding: { source: "none", itemIds: [], confidence: "medium" },
        answerability: "blocked",
      }

    case "should_delegate_transactional":
      return {
        reply: "",
        intent: "transactional",
        topic: "booking",
        domainZone: "in_domain",
        topicShift: false,
        structure: { acknowledged: true, answered: true },
        confidence: "high",
        action: { type: "delegate_transactional_resolver" },
        source: "rule_table",
        grounding: { source: "none", itemIds: [], confidence: "medium" },
        activeTopic: detectStrongTopic(message) ?? session.activeTopic ?? "schedule",
        answerability: "should_delegate_transactional",
      }

    case "answerable_from_active_topic": {
      const active = resolveActiveTopic(message, pack, session)
      if (active && !AUGUSTA_FORBIDDEN.test(active.reply)) {
        return { ...active, answerability: "answerable_from_active_topic" }
      }
      return null
    }

    case "answerable_from_operational_context": {
      const op = replyFromOperational(message, pack)
      if (op && !AUGUSTA_FORBIDDEN.test(op.reply)) {
        const shifted =
          pack.selectedContextItems.length > 0 ||
          session.awaitingFocus ||
          session.discoveryTurns > 0 ||
          session.lastTopic === "discovery"
        return shifted ? { ...op, topicShift: true } : op
      }
      return null
    }

    case "answerable_from_catalog": {
      const chip = pack.selectedContextItems[0]
      if (chip) {
        const r = replyFromSelectedContext(message, pack, chip)
        if (!AUGUSTA_FORBIDDEN.test(r.reply)) return r
      }
      return null
    }

    case "answerable_with_honest_gap": {
      const r = replyHonestGap(message, pack)
      if (!AUGUSTA_FORBIDDEN.test(r.reply)) return r
      return null
    }

    case "answerable_from_selected_context": {
      const chip = pack.selectedContextItems[0]
      if (!chip) return null
      const r = replyFromSelectedContext(message, pack, chip)
      if (!AUGUSTA_FORBIDDEN.test(r.reply)) return r
      return null
    }

    case "in_domain_missing_context": {
      const chip = pack.selectedContextItems[0]
      const r = resolveMissingContextClarification(pack, message, chip)
      if (!AUGUSTA_FORBIDDEN.test(r.reply)) {
        return { ...r, answerability: "in_domain_missing_context" }
      }
      return null
    }

    case "needs_clarification":
      if (decision.reason === "broad_clarify") {
        const broad = resolveBroadClarification(pack)
        if (!AUGUSTA_FORBIDDEN.test(broad.reply)) return broad
        return null
      }
      if (decision.reason === "defer_to_legacy") return null
      return replyNeedsClarification(message, pack)

    default:
      return null
  }
}

/** classify → strategy → answer (Answer First Gate). */
export function resolveAnswerFirstGate(
  message: string,
  pack: ModelContextPack,
  session: KernelSession
): KernelResponse | null {
  const decision = classifyAnswerability(message, pack, session)
  return executeStrategy(message, pack, session, decision)
}
