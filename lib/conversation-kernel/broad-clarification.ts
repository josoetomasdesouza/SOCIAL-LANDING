import type { KernelResponse, KernelSession, ModelContextPack } from "./types"

export const BROAD_CLARIFICATION_REPLY =
  "Não captei o foco — é sobre horário, como chegar, preços, um item do feed ou agendar?"

const CONTEXTUAL_OPERATIONAL_REPLY =
  "Continuando no que falamos — quer estacionamento, horário de funcionamento ou o endereço no mapa?"

/** Last-resort lane when stub + legacy return null — never Augusta copy (WS-19A Fase 1.5). */
export function resolveBroadClarification(pack: ModelContextPack, session?: KernelSession): KernelResponse {
  const contextual =
    session?.activeTopic === "arrival" ||
    session?.sessionLane === "parking" ||
    session?.sessionLane === "hours"
  const reply = contextual ? CONTEXTUAL_OPERATIONAL_REPLY : BROAD_CLARIFICATION_REPLY
  return {
    reply,
    intent: "discover",
    domainZone: "in_domain",
    topic: "broad_clarify",
    topicShift: pack.selectedContextItems.length > 0,
    structure: {
      acknowledged: true,
      answered: false,
      followUpQuestion: contextual
        ? "estacionamento, horário ou endereço?"
        : "horário, como chegar, preços, item do feed ou agendar?",
    },
    confidence: "medium",
    action: { type: "text_only" },
    source: "rule_table",
    answerability: "needs_clarification",
    grounding: { source: "none", itemIds: [], confidence: "low" },
  }
}
