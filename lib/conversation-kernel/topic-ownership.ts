import {
  chipAnchorWeight,
  intentWeight,
  isEditorialChipAnchoredTurn,
  resolveIntentCategory,
} from "./conversation-priority"
import { detectStrongTopic, normalizeKernelText } from "./topic-detection"
import type { KernelResponse, KernelSession, ModelContextPack, TopicOwner } from "./types"

type OwnershipDecisionHint = {
  class: string
  reason: string
}

function hasToken(message: string, ...tokens: string[]): boolean {
  const m = normalizeKernelText(message)
  return tokens.some((t) => {
    const token = normalizeKernelText(t)
    if (token.length <= 4) {
      return new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(m)
    }
    return m.includes(token)
  })
}

export function isWeakOperationalFollowUp(message: string): boolean {
  const m = normalizeKernelText(message)
  return (
    /^(e\s+)?(ate|até)\s+que\s+horas/.test(m) ||
    hasToken(m, "e o horario", "e o horário", "e ate que horas", "e até que horas") ||
    (hasToken(m, "quanto custa", "e quanto custa", "qual o preco", "qual o preço") && m.length < 40)
  )
}

function isVagueRephrase(message: string): boolean {
  const m = normalizeKernelText(message)
  return hasToken(m, "me fala", "fala ai", "fala aí", "nao entendi", "não entendi") && m.length < 28
}

function isClarificationResolution(message: string): boolean {
  const m = normalizeKernelText(message)
  return hasToken(
    m,
    "esta unidade",
    "essa unidade",
    "unidade aqui",
    "a unidade",
    "so unidade",
    "só unidade",
    "unidade"
  )
}

/** Who wins this turn — does not choose reply copy. */
export function resolveTurnOwner(
  message: string,
  session: KernelSession,
  pack: ModelContextPack
): { owner: TopicOwner; intentCategory: string | null } {
  const chip = pack.selectedContextItems[0]
  if (!chip) {
    const intentCategory = resolveIntentCategory(message, session)
    return { owner: intentCategory ? "intent" : "chip", intentCategory }
  }

  if (session.pendingClarification && isClarificationResolution(message)) {
    return { owner: "session", intentCategory: "arrival" }
  }

  if (isEditorialChipAnchoredTurn(message, pack)) {
    return { owner: "chip", intentCategory: resolveIntentCategory(message, session) }
  }

  const intentCategory = resolveIntentCategory(message, session)
  const intentW = intentWeight(intentCategory)
  const chipW = chipAnchorWeight(chip)

  if (session.activeTopic && isWeakOperationalFollowUp(message)) {
    const lane =
      intentCategory === "hours" || session.sessionLane === "hours" || /horas/.test(normalizeKernelText(message))
        ? "hours"
        : intentCategory === "pricing"
          ? "pricing"
          : session.activeTopic
    return { owner: "session", intentCategory: lane }
  }

  if (session.activeTopic && isVagueRephrase(message)) {
    return { owner: "session", intentCategory: session.activeTopic }
  }

  if (chip.isExternalOrEditorial && intentCategory === "arrival") {
    return { owner: "chip", intentCategory }
  }

  if (intentCategory === "pricing" && chip.kind === "video" && !session.activeTopic) {
    if (isWeakOperationalFollowUp(message)) {
      return { owner: "intent", intentCategory: "pricing" }
    }
    return { owner: "chip", intentCategory }
  }

  if (intentCategory === "pricing" && chip.kind === "service") {
    if (!session.activeTopic || session.activeTopic === "service") {
      return { owner: "chip", intentCategory }
    }
  }

  if (intentCategory === "pricing" && chip.kind === "professional" && !session.activeTopic) {
    return { owner: "chip", intentCategory }
  }

  if (intentCategory === "service" && chip.kind === "service" && !session.activeTopic) {
    return { owner: "chip", intentCategory }
  }

  if (intentW === 0) {
    if (
      session.activeTopic &&
      session.activeTopic !== "news_editorial" &&
      isWeakOperationalFollowUp(message) &&
      hasToken(message, "preco", "preço", "pix", "pagamento", "valor", "quanto")
    ) {
      return { owner: "intent", intentCategory: "pricing" }
    }
    if (session.activeTopic && isWeakOperationalFollowUp(message) && hasToken(message, "horario", "horário", "vaga", "agendar", "marcar")) {
      return { owner: "session", intentCategory: session.activeTopic }
    }
    return { owner: "chip", intentCategory }
  }

  if (intentW > chipW) {
    return { owner: "intent", intentCategory }
  }

  if (session.activeTopic && intentCategory && intentW >= chipW) {
    return { owner: "session", intentCategory }
  }

  return { owner: "chip", intentCategory }
}

export function shouldIntentBeatChip(
  message: string,
  session: KernelSession,
  pack: ModelContextPack
): boolean {
  return resolveTurnOwner(message, session, pack).owner !== "chip"
}

/** Follow-up after missing_context clarify (e.g. user says "unidade"). */
export function resolvePendingClarificationTurn(
  message: string,
  session: KernelSession
): OwnershipDecisionHint | null {
  if (!session.pendingClarification || !isClarificationResolution(message)) {
    return null
  }

  if (session.pendingClarification === "branch_unit") {
    session.pendingClarification = undefined
    session.activeTopic = "arrival"
    session.topicOwner = "session"
    session.sessionLane = "arrival"
    return { class: "answerable_from_operational_context", reason: "branch_unit_resolved" }
  }

  return null
}

export function syncTopicOwnershipFromResponse(
  message: string,
  session: KernelSession,
  pack: ModelContextPack,
  response: KernelResponse | null,
  decision?: OwnershipDecisionHint
): void {
  const { owner, intentCategory } = resolveTurnOwner(message, session, pack)
  session.topicOwner = owner

  if (decision?.class === "in_domain_missing_context" && decision.reason === "ambiguous_referent") {
    const chip = pack.selectedContextItems[0]
    if (chip && hasToken(message, "curitiba", "tem essa", "essa barbearia")) {
      session.pendingClarification = "branch_unit"
    } else {
      session.pendingClarification = "feed_scope"
    }
    return
  }

  if (decision?.class === "answerable_from_operational_context") {
    session.activeTopic = "arrival"
    if (owner === "intent") session.topicOwner = "intent"
    if (hasToken(message, "estacionamento", "estacionar")) session.sessionLane = "parking"
    if (hasToken(message, "horario", "horário", "fecham", "horas", "ate que horas", "até que horas")) {
      session.sessionLane = "hours"
    }
  }

  if (!response) return

  const detected = detectStrongTopic(message)
  if (detected && owner !== "chip") {
    session.activeTopic = detected
    session.lastTopic = detected
  }

  if (owner === "chip" && pack.selectedContextItems[0]?.kind === "video") {
    session.lastTopic = "video_content"
  }

  if (intentCategory === "pricing" && owner === "intent") {
    session.activeTopic = "pricing"
    session.lastTopic = "pricing"
  }

  if (owner === "session" && session.activeTopic === "arrival") {
    if (hasToken(message, "estacionamento", "estacionar")) session.sessionLane = "parking"
    if (hasToken(message, "horario", "horário", "fecham", "ate que horas", "até que horas", "horas")) {
      session.sessionLane = "hours"
    }
  }
}
