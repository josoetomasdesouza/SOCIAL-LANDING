import { normalizeKernelText } from "./active-topic"
import { isSocialFeedChip } from "./model-context-pack"
import type { KernelResponse, ModelContextPack, SelectedContextItem } from "./types"

function hasToken(message: string, ...tokens: string[]): boolean {
  const m = normalizeKernelText(message)
  return tokens.some((t) => m.includes(normalizeKernelText(t)))
}

function isLocationBranchCue(message: string): boolean {
  return hasToken(
    message,
    "curitiba",
    "outra cidade",
    "unidade em",
    "tem em ",
    "tem essa",
    "filial em",
    "barbearia em"
  )
}

/** Referent ambiguous — in_domain but needs clarify before answer (WS-19A Fase 1.5). */
export function isInDomainMissingContext(message: string, chip?: SelectedContextItem): boolean {
  if (!chip) {
    return hasToken(message, "essa cidade", "isso aqui", "la em", "lá em", "pra minha cidade")
  }

  if (isSocialFeedChip(chip) && isLocationBranchCue(message) && hasToken(message, "tem essa", "essa barbearia", "essa unidade")) {
    return true
  }

  if (isSocialFeedChip(chip) && hasToken(message, "pra minha cidade", "na minha cidade", "isso pra")) {
    return true
  }

  return false
}

export function resolveMissingContextClarification(
  pack: ModelContextPack,
  message: string,
  chip?: SelectedContextItem
): KernelResponse {
  const locationReply = `Você quer saber se esta unidade da ${pack.brandName} fica na cidade que você citou ou se existe outra unidade da barbearia por lá?`

  const genericReply = `Sobre o item do feed: você quer falar da publicação em si ou de algo prático da casa (horário, preço, como chegar)?`

  const reply =
    chip && isSocialFeedChip(chip) && isLocationBranchCue(message)
      ? locationReply
      : genericReply

  return {
    reply,
    intent: "discover",
    domainZone: "in_domain",
    topic: "missing_context",
    topicShift: Boolean(chip),
    structure: {
      acknowledged: true,
      answered: false,
      followUpQuestion: "esta unidade ou outra unidade?",
    },
    confidence: "medium",
    action: { type: "text_only" },
    source: "rule_table",
    answerability: "needs_clarification",
    grounding: chip
      ? { source: "selected_context", itemIds: [chip.id], confidence: "medium" }
      : { source: "none", itemIds: [], confidence: "low" },
  }
}
