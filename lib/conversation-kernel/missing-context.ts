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
  const m = normalizeKernelText(message).trim()

  if (!chip) {
    return hasToken(message, "essa cidade", "isso aqui", "la em", "lá em", "pra minha cidade")
  }

  if (/^essa$/i.test(m)) return true

  if (
    hasToken(message, "e la", "e lá", "la em", "lá em", "minha cidade") ||
    /^e\s+isso/i.test(m)
  ) {
    return true
  }

  if (hasToken(message, "fale mais", "sobre isso", "sobre esse", "sobre o conteudo", "sobre o conteúdo")) {
    return false
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
  const locationReply = `Você quer saber se a ${pack.brandName} fica na cidade que citou ou se existe outra unidade por lá?`

  const genericReply = `Sobre esse item do feed: é a publicação em si ou algo prático (horário, preço, como chegar)?`

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
