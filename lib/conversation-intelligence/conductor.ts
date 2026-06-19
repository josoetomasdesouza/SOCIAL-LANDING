import type { ConversationContextPayload } from "@/lib/business-types"
import { normalizeSurfaceFlowText } from "@/lib/surface-flow/product-entity"
import type {
  ConversationHistoryMessage,
  ConversationIntent,
  ConversationMemory,
  ConversationState,
  NextConversationMove,
} from "./types"

function normalize(value: string) {
  return normalizeSurfaceFlowText(value).trim()
}

function hasAny(normalized: string, cues: string[]) {
  return cues.some((cue) => normalized.includes(normalize(cue)))
}

function isClosingTurn(normalized: string) {
  return hasAny(normalized, ["obrigado", "obrigada", "valeu", "era isso", "fechado assim", "depois vejo"])
}

function hasRecentVisualBlock(history: ConversationHistoryMessage[], lastShownVisualBlockKind?: string) {
  return Boolean(lastShownVisualBlockKind || history.slice(-4).some((message) => message.visualBlock))
}

function contextLabel(contextItems: ConversationContextPayload[], state: ConversationState) {
  return contextItems[0]?.title ?? state.currentService ?? state.currentProfessional ?? null
}

export function conductConversationTurn({
  message,
  history,
  memory,
  state,
  interpretedIntent,
  contextItems,
  lastAssistantQuestion,
  lastShownVisualBlockKind,
}: {
  message: string
  history: ConversationHistoryMessage[]
  memory: ConversationMemory
  state: ConversationState
  interpretedIntent: ConversationIntent
  contextItems: ConversationContextPayload[]
  lastAssistantQuestion?: string
  lastShownVisualBlockKind?: string
}): NextConversationMove {
  const normalized = normalize(message)
  const label = contextLabel(contextItems, state)
  const visualWasShown = hasRecentVisualBlock(history, lastShownVisualBlockKind)

  if (isClosingTurn(normalized)) {
    return {
      type: "close_loop",
      message: "Perfeito. Se quiser retomar depois, eu continuo a partir desse ponto.",
      reason: "user_explicitly_closed_or_paused",
    }
  }

  if (hasAny(normalized, ["nao gostei", "não gostei"])) {
    return {
      type: "offer_options",
      options: ["alternativa mais discreta", "outro profissional"],
      reason: "user_rejected_previous_option",
    }
  }

  if (hasAny(normalized, ["tem outro", "tem outra", "outro profissional", "outra opcao", "outra opção"])) {
    return {
      type: "suggest_action",
      action: "mostrar alternativas sem insistir na opção rejeitada",
      reason: "user_requested_alternative",
    }
  }

  if (hasAny(normalized, ["pode ser", "esse mesmo", "fechado", "vamos nesse", "quero esse"])) {
    return {
      type: "suggest_action",
      action: "avançar para horários ou confirmação da escolha",
      reason: "user_accepted_current_option",
    }
  }

  if (interpretedIntent === "greeting") {
    return {
      type: "deepen_topic",
      prompt: "Me conta se você quer escolher um serviço, entender preço ou já olhar horário.",
      reason: "greeting_needs_direction",
    }
  }

  if (interpretedIntent === "user_confused_by_assistant") {
    return {
      type: "confirm_understanding",
      summary: "Vou reformular de forma mais simples, sem repetir a resposta anterior.",
      reason: "user_did_not_understand_assistant",
    }
  }

  if (interpretedIntent === "recommendation" && !label && !visualWasShown) {
    return {
      type: "ask_clarifying_question",
      question:
        "Você está buscando algo mais discreto para o dia a dia ou algo mais moderno, com lateral mais marcada?",
      reason: "recommendation_needs_style_preference_before_cards",
    }
  }

  if (interpretedIntent === "service_question" && state.currentService && !visualWasShown) {
    return {
      type: "deepen_topic",
      prompt: "Antes de abrir opções, vale decidir se a prioridade é discrição, manutenção fácil ou um visual mais marcado.",
      reason: "service_preference_should_be_refined_before_action",
    }
  }

  if (interpretedIntent === "price") {
    return {
      type: label ? "suggest_action" : "ask_clarifying_question",
      action: label ? "mostrar opções mais alinhadas com esse perfil" : "definir o serviço antes do valor",
      question: label ? undefined : "Você quer comparar preço de corte, barba ou combo?",
      reason: label ? "price_has_context_and_can_offer_next_action" : "price_missing_service_context",
    } as NextConversationMove
  }

  if (interpretedIntent === "availability" || interpretedIntent === "booking") {
    return {
      type: "suggest_action",
      action: state.currentProfessional || label ? "olhar horários agora" : "escolher profissional ou serviço antes da agenda",
      reason: "schedule_intent_should_move_to_action",
    }
  }

  if (interpretedIntent === "professional_question") {
    return {
      type: "offer_options",
      options: ["manter o serviço e trocar profissional", "ver quem combina melhor com o estilo"],
      reason: "professional_question_benefits_from_choice",
    }
  }

  if (interpretedIntent === "off_domain") {
    return {
      type: "confirm_understanding",
      summary: "Isso foge um pouco da barbearia, mas posso reconectar com corte, barba ou horário se fizer sentido.",
      reason: "off_domain_should_answer_then_reconnect",
    }
  }

  if (lastAssistantQuestion && memory.turnCount > 0) {
    return {
      type: "confirm_understanding",
      summary: "Beleza, voltando ao que você tinha perguntado antes.",
      reason: "short_or_ambiguous_turn_after_assistant_question",
    }
  }

  return {
    type: "deepen_topic",
    prompt: "Para continuar bem, eu conectaria isso a serviço, preço ou horário.",
    reason: "default_keep_conversation_alive",
  }
}
