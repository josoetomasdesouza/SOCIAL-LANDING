import type {
  ConversationIntelligenceMeta,
  ConversationIntelligenceResult,
  ConversationInterpretation,
  ConversationMemory,
  LlmBrainReply,
  NextConversationMove,
} from "./types"
import type { ConversationResponseResolverResult } from "@/lib/mock-data/conversational-search"
import {
  buildClarifyingReply,
  buildNaturalPrefix,
  buildStateAwareFollowUpReply,
} from "./templates"

function firstContextLabel(memory: ConversationMemory, interpretation: ConversationInterpretation) {
  return (
    interpretation.groundedContext[0]?.title ??
    memory.selectedContextItems[0]?.title ??
    interpretation.state.currentService ??
    interpretation.state.currentProfessional ??
    null
  )
}

function needsResolver(interpretation: ConversationInterpretation) {
  return (
    interpretation.intent === "booking" ||
    interpretation.intent === "availability" ||
    interpretation.intent === "price" ||
    interpretation.shouldShowVisualBlock
  )
}

function buildMeta(
  interpretation: ConversationInterpretation,
  action: ConversationIntelligenceMeta["action"],
  memoryUsed: boolean,
  nextMove?: NextConversationMove,
  brainReply?: LlmBrainReply
): ConversationIntelligenceMeta {
  return {
    intent: interpretation.intent,
    confidence: interpretation.confidence,
    memoryUsed,
    action,
    nextMove,
    conversationMode: brainReply?.conversationMode,
    actionRequest: brainReply?.actionRequest,
  }
}

function moveText(nextMove?: NextConversationMove) {
  if (!nextMove) return null

  if (nextMove.type === "ask_clarifying_question") return nextMove.question
  if (nextMove.type === "deepen_topic") return nextMove.prompt
  if (nextMove.type === "suggest_action") return nextMove.action
  if (nextMove.type === "confirm_understanding") return nextMove.summary
  if (nextMove.type === "offer_options") return `Posso seguir por ${nextMove.options.join(" ou ")}.`
  if (nextMove.type === "close_loop") return nextMove.message
  return null
}

function stitchConductedReply(base: string, nextMove?: NextConversationMove) {
  const trimmed = base.trim()
  const move = moveText(nextMove)

  if (!move || trimmed.includes(move) || nextMove?.type === "close_loop") return trimmed
  if (trimmed.endsWith("?")) return trimmed

  return `${trimmed} ${move}`
}

function isQuestionContractReply(brainReply?: LlmBrainReply) {
  return brainReply?.actionRequest?.reason?.startsWith("question_contract_") === true
}

function shouldPreserveBrainReply(brainReply?: LlmBrainReply) {
  return isQuestionContractReply(brainReply) ||
    brainReply?.actionRequest?.reason === "operational_question_answer_first_no_card"
}

function naturalizeResolverText(
  result: ConversationResponseResolverResult,
  memory: ConversationMemory,
  interpretation: ConversationInterpretation,
  message: string
) {
  const contextLabel = firstContextLabel(memory, interpretation)
  const text = result.text.trim()
  const prefix = buildNaturalPrefix({ interpretation, contextLabel, message })

  if (prefix) {
    return `${prefix} ${text}`
  }

  if (interpretation.intent === "price" && contextLabel && result.visualBlock) {
    return `Sobre ${contextLabel}: o melhor é olhar as opções próximas desse perfil. ${text}`
  }

  if (interpretation.intent === "availability" && contextLabel) {
    return `Como ${contextLabel} já estava na conversa, dá para checar horários agora. ${text}`
  }

  if (interpretation.intent === "booking" && contextLabel) {
    return `Perfeito, dá para seguir por ${contextLabel}. ${text}`
  }

  if (interpretation.intent === "vague_followup" && contextLabel) {
    return `Certo, ajuste anotado. Pensando em ${contextLabel}, ${text.charAt(0).toLowerCase()}${text.slice(1)}`
  }

  return text
}

export function buildConversationalReply({
  message,
  brandName,
  memory,
  interpretation,
  nextMove,
  brainReply,
  resolverResult,
}: {
  message: string
  brandName: string
  memory: ConversationMemory
  interpretation: ConversationInterpretation
  nextMove?: NextConversationMove
  brainReply?: LlmBrainReply
  resolverResult?: ConversationResponseResolverResult | null
}): ConversationIntelligenceResult | null {
  const contextLabel = firstContextLabel(memory, interpretation)
  const memoryUsed = Boolean(contextLabel || memory.activeIntent || memory.conversationSummary)

  if (brainReply?.conversationMode === "close" || nextMove?.type === "close_loop") {
    return {
      text: brainReply?.text ?? (nextMove?.type === "close_loop" ? nextMove.message : "Perfeito. Fecho esse ponto por aqui."),
      intelligence: buildMeta(interpretation, "answer_only", memoryUsed, nextMove, brainReply),
    }
  }

  if (resolverResult) {
    const shouldKeepVisualBlock =
      (brainReply?.shouldShowVisualBlock === true &&
        interpretation.shouldShowVisualBlock) ||
      (brainReply?.shouldShowVisualBlock === true && interpretation.intent === "service_question") ||
      (brainReply?.shouldShowVisualBlock === true && interpretation.intent === "professional_question") ||
      (brainReply?.shouldShowVisualBlock === true && interpretation.intent === "vague_followup" && interpretation.state.rejectedOptions.length > 0)
    const toolText = naturalizeResolverText(resolverResult, memory, interpretation, message)
    const baseText = brainReply?.text
      ? resolverResult.visualBlock
        ? `${brainReply.text} ${toolText}`
        : brainReply.text
      : toolText

    return {
      text: shouldPreserveBrainReply(brainReply) ? baseText : stitchConductedReply(baseText, nextMove),
      visualBlock: shouldKeepVisualBlock ? resolverResult.visualBlock : undefined,
      intelligence: buildMeta(
        interpretation,
        shouldKeepVisualBlock && resolverResult.visualBlock ? "show_visual_block" : "delegate_resolver",
        memoryUsed,
        nextMove,
        brainReply
      ),
    }
  }

  if (brainReply) {
    const shouldPreserveBrainText =
      interpretation.intent === "off_domain" ||
      interpretation.intent === "user_confused_by_assistant" ||
      shouldPreserveBrainReply(brainReply)

    return {
      text: shouldPreserveBrainText ? brainReply.text : stitchConductedReply(brainReply.text, nextMove),
      intelligence: buildMeta(
        interpretation,
        brainReply.conversationMode === "clarify" ? "ask_clarifying" : "answer_only",
        memoryUsed,
        nextMove,
        brainReply
      ),
    }
  }

  if (interpretation.shouldAskClarifyingQuestion) {
    if (interpretation.intent === "recommendation") {
      return {
        text: buildClarifyingReply({
          brandName,
          memory,
          interpretation,
          message,
        }),
        intelligence: buildMeta(interpretation, "ask_clarifying", memoryUsed, nextMove, brainReply),
      }
    }

    return {
      text: buildClarifyingReply({
        brandName,
        memory,
        interpretation,
        message,
      }),
      intelligence: buildMeta(interpretation, "ask_clarifying", memoryUsed, nextMove, brainReply),
    }
  }

  if (interpretation.intent === "price") {
    return {
      text: stitchConductedReply(
        contextLabel
          ? `Considerando ${contextLabel}, eu não cravaria valor sem escolher o serviço exato.`
          : buildClarifyingReply({
              brandName,
              memory,
              interpretation,
              message,
            }),
        nextMove
      ),
      intelligence: buildMeta(interpretation, contextLabel ? "answer_only" : "ask_clarifying", memoryUsed, nextMove, brainReply),
    }
  }

  if (interpretation.intent === "service_question") {
    const preference = memory.userPreferences.at(-1)
    return {
      text: stitchConductedReply(
        preference
          ? `Para um visual mais ${preference}, eu evitaria algo muito marcado e olharia um corte mais limpo.`
          : `Pelo que você comentou, eu iria por um caminho mais limpo antes de abrir opções demais.`,
        nextMove
      ),
      intelligence: buildMeta(interpretation, "answer_only", memoryUsed, nextMove, brainReply),
    }
  }

  if (interpretation.intent === "recommendation") {
    const reference = contextLabel ?? interpretation.state.currentService ?? "esse perfil"
    return {
      text: stitchConductedReply(
        `Pelo que você vem descrevendo, eu começaria por ${reference} sem exagerar no contraste.`,
        nextMove
      ),
      intelligence: buildMeta(interpretation, "answer_only", memoryUsed, nextMove, brainReply),
    }
  }

  if (interpretation.intent === "vague_followup") {
    return {
      text: contextLabel
        ? buildStateAwareFollowUpReply({
            state: interpretation.state,
            contextLabel,
            message,
          })
        : buildStateAwareFollowUpReply({
            state: interpretation.state,
            message,
          }),
      intelligence: buildMeta(interpretation, contextLabel ? "answer_only" : "ask_clarifying", memoryUsed, nextMove, brainReply),
    }
  }

  if (needsResolver(interpretation)) {
    return null
  }

  if (interpretation.intent === "greeting") {
    return {
      text: `Oi. Quer começar por serviço, preço ou horário na ${brandName}?`,
      intelligence: buildMeta(interpretation, "answer_only", memoryUsed, nextMove, brainReply),
    }
  }

  return null
}
