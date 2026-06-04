import type { KernelResponse, ModelContextPack } from "./types"

export const BROAD_CLARIFICATION_REPLY =
  "Não captei o foco — é sobre horário, como chegar, preços, um item do feed ou agendar?"

/** Last-resort lane when stub + legacy return null — never Augusta copy (WS-19A Fase 1.5). */
export function resolveBroadClarification(pack: ModelContextPack): KernelResponse {
  return {
    reply: BROAD_CLARIFICATION_REPLY,
    intent: "discover",
    domainZone: "in_domain",
    topic: "broad_clarify",
    topicShift: pack.selectedContextItems.length > 0,
    structure: {
      acknowledged: true,
      answered: false,
      followUpQuestion: "horário, como chegar, preços, item do feed ou agendar?",
    },
    confidence: "medium",
    action: { type: "text_only" },
    source: "rule_table",
    answerability: "needs_clarification",
    grounding: { source: "none", itemIds: [], confidence: "low" },
  }
}
