import type {
  ConversationResponseResolver,
  ConversationResponseResolverInput,
  ConversationResponseResolverResult,
} from "@/lib/mock-data/conversational-search"
import { deriveConversationMemory } from "./memory"
import { interpretConversationTurn } from "./interpreter"
import { buildConversationalReply } from "./reply-builder"
import { conductConversationTurn } from "./conductor"
import { resolveLlmBrainReply, type LlmBrainProvider } from "./llm-provider"
import { guardAgainstRepetition } from "./anti-repetition"
import { shapeHumanCommunication } from "./human-communication-layer"
import { applyConversationalHumanity } from "./conversational-humanity-layer"
import { deriveQuestionContract, satisfyUserQuestion } from "./question-satisfaction-layer"
import { humanizeFinalAnswer } from "./humanize-final-answer"
import { deriveTopicStack } from "./topic-manager"
import { routeConversationTool, type UniversalToolProvider } from "./tool-router"
import { guardInternalLanguage } from "./internal-language-guard"
import { classifyHumanMessageNature, type HumanMessageNatureResult } from "./message-nature-classifier"
import { preserveUserProgress } from "./user-progress-preservation"
import type {
  ConversationCatalogSummary,
  ConversationIntelligenceMeta,
  ConversationInterpretation,
  ConversationMemory,
  QuestionContract,
  ConversationState,
  NextConversationMove,
  UniversalToolRoutingResult,
} from "./types"

function isPreferenceOnlyServiceQuestion(interpretation: ConversationInterpretation) {
  if (interpretation.intent !== "service_question") return false

  const hasPreference = interpretation.entities.some((entity) => entity.type === "preference" && entity.source === "message")
  const hasContext = interpretation.groundedContext.length > 0

  return hasPreference && !hasContext
}

function shouldDelegateToResolver(interpretation: ConversationInterpretation) {
  if (interpretation.shouldAskClarifyingQuestion) return false
  if (isPreferenceOnlyServiceQuestion(interpretation)) return false

  return (
    interpretation.intent === "booking" ||
    interpretation.intent === "availability" ||
    interpretation.intent === "price" ||
    interpretation.intent === "service_question" ||
    interpretation.intent === "professional_question" ||
    interpretation.intent === "operational_question" ||
    (interpretation.shouldShowVisualBlock && interpretation.intent !== "recommendation")
  )
}

function isAlternativeRequest(message: string) {
  const normalized = message
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

  return (
    normalized.includes("tem outro") ||
    normalized.includes("tem outra") ||
    normalized.includes("outro profissional") ||
    normalized.includes("outra opcao") ||
    normalized.includes("outra opção")
  )
}

function normalizeMessage(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function buildMessageNatureReply({
  message,
  brandName,
  messageNature,
}: {
  message: string
  brandName: string
  messageNature: HumanMessageNatureResult
}): { text: string; intent: ConversationIntelligenceMeta["intent"]; toolRoute?: UniversalToolRoutingResult["tool"]; action: ConversationIntelligenceMeta["action"] } | null {
  const normalized = normalizeMessage(message)

  if (messageNature.nature === "GREETING") {
    return {
      text: `Oi! Me conta o que você quer resolver hoje: pode ser uma dúvida sobre visual, serviços ou agendamento.`,
      intent: "greeting",
      toolRoute: "answer_from_reasoning",
      action: "answer_only",
    }
  }

  if (messageNature.nature === "OBSERVATION" && messageNature.confidence >= 0.85) {
    if (normalized.includes("30 dias") || normalized.includes("nao corto") || normalized.includes("não corto") || normalized.includes("cabelo")) {
      return {
        text: "Então já deu tempo de repensar o visual. Você está sentindo que precisa só aparar e alinhar ou quer aproveitar para mudar um pouco?",
        intent: "recommendation",
        toolRoute: "answer_from_reasoning",
        action: "answer_only",
      }
    }

    return {
      text: "Entendi. Isso soa mais como um contexto seu do que como uma pergunta operacional. Quer que eu te ajude a transformar isso em uma decisão?",
      intent: "recommendation",
      toolRoute: "answer_from_reasoning",
      action: "answer_only",
    }
  }

  if (messageNature.nature === "STORY") {
    return {
      text: "Isso muda bastante a decisão, porque não é só corte: tem a imagem que você quer manter. Você quer preservar esse comprimento ou só deixar mais alinhado?",
      intent: "recommendation",
      toolRoute: "answer_from_reasoning",
      action: "answer_only",
    }
  }

  if (messageNature.nature === "EMOTION") {
    return {
      text: "Faz sentido ter esse cuidado. Eu não iria direto para uma mudança radical; começaria por algo controlado, que melhora o visual sem te deixar estranho no espelho.",
      intent: "recommendation",
      toolRoute: normalized.includes("cortar") || normalized.includes("cabelo") || normalized.includes("visual") ? "service_lookup" : "answer_from_reasoning",
      action: "answer_only",
    }
  }

  if (messageNature.nature === "BOOKING_INTENT") {
    return {
      text: "Não tenho confirmação de horário ainda. Antes de consultar agenda, preciso saber o que você quer fazer: corte, barba ou combo?",
      intent: "booking",
      toolRoute: "booking",
      action: "ask_clarifying",
    }
  }

  if (messageNature.nature === "REQUEST") {
    if (normalized.includes("servico") || normalized.includes("serviço")) {
      return {
        text: "Não tenho confirmação de preço ou horário ainda. Posso te orientar pelos serviços: você quer ver opções de corte, barba ou combo?",
        intent: "service_question",
        toolRoute: "service_lookup",
        action: "answer_only",
      }
    }
    if (normalized.includes("profissional")) {
      return {
        text: "Não tenho confirmação de disponibilidade de profissional ainda. Posso te orientar: você quer alguém para corte, barba ou combo?",
        intent: "professional_question",
        toolRoute: "professional_lookup",
        action: "answer_only",
      }
    }
  }

  if (messageNature.nature === "QUESTION" && (normalized.includes("fecha") || normalized.includes("fecham") || normalized.includes("horas a barbearia") || normalized.includes("abre hoje") || normalized.includes("abre sabado") || normalized.includes("abre sábado") || normalized.includes("funciona hoje"))) {
    return {
      text: normalized.includes("hoje") || normalized.includes("sabado") || normalized.includes("sábado")
        ? `Sim, há confirmação de horário de funcionamento: ${brandName} costuma funcionar de segunda a sábado, das 9h às 20h.`
        : `${brandName} costuma funcionar de segunda a sábado, das 9h às 20h.`,
      intent: "operational_question",
      toolRoute: normalized.includes("hoje") || normalized.includes("sabado") || normalized.includes("sábado") ? "schedule" : "answer_from_reasoning",
      action: "answer_only",
    }
  }

  return null
}

function toolForProgressQuery(queryType: ReturnType<typeof preserveUserProgress>["queryType"]): UniversalToolRoutingResult["tool"] {
  if (queryType === "availability") return "schedule"
  if (queryType === "price" || queryType === "payment_method") return "catalog"
  if (queryType === "service_info") return "service_lookup"
  if (queryType === "business_info" || queryType === "location" || queryType === "opening_hours") return "answer_from_reasoning"
  return "answer_from_reasoning"
}

function contractForProgressQuery(queryType: ReturnType<typeof preserveUserProgress>["queryType"]): QuestionContract {
  const base = {
    mustAnswer: ["preservar objetivo do usuário sem inventar dado confirmado"],
    mustNotSay: ["contexto interno", "actionRequest", "visualBlock", "topicStack"],
  }

  if (queryType === "availability") {
    return {
      questionType: "yes_no_schedule_availability",
      expectedAnswerShape: "operational_fail_closed",
      ...base,
    }
  }

  if (queryType === "price") {
    return {
      questionType: "price_lookup",
      expectedAnswerShape: "operational_fail_closed",
      ...base,
    }
  }

  if (queryType === "payment_method") {
    return {
      questionType: "payment_lookup",
      expectedAnswerShape: "operational_fail_closed",
      ...base,
    }
  }

  if (queryType === "service_info") {
    return {
      questionType: "yes_no_service_availability",
      expectedAnswerShape: "operational_fail_closed",
      ...base,
    }
  }

  return {
    questionType: "none",
    expectedAnswerShape: "none",
    ...base,
  }
}

function shouldTryProgressPreservation({
  messageNature,
  interpretation,
  questionContract,
}: {
  messageNature: HumanMessageNatureResult
  interpretation: ConversationInterpretation
  questionContract: QuestionContract
}) {
  return messageNature.nature === "OPERATIONAL_QUERY" ||
    interpretation.intent === "price" ||
    interpretation.intent === "availability" ||
    questionContract.questionType === "contextual_operational_followup" ||
    questionContract.questionType === "topic_return"
}

function toResolverResult(
  result: ReturnType<typeof buildConversationalReply>,
  input: ConversationResponseResolverInput,
  communication: FinalizeCommunicationContext
): ConversationResponseResolverResult | null {
  if (!result) return null
  const finalized = finalizeCommunication({
    candidateText: result.text,
    input,
    intent: result.intelligence?.intent,
    conversationMode: result.intelligence?.conversationMode,
    actionRequest: result.intelligence?.actionRequest,
    visualBlock: result.visualBlock,
    seed: `${input.message}-${input.history?.length ?? 0}`,
    ...communication,
  })

  return {
    text: finalized.text,
    visualBlock: result.visualBlock,
    intelligence: result.intelligence
      ? {
        ...result.intelligence,
        formatProfile: finalized.formatProfile,
        humanity: finalized.humanity,
        questionSatisfaction: finalized.questionSatisfaction,
      }
      : result.intelligence,
  }
}

interface FinalizeCommunicationContext {
  memory: ConversationMemory
  state: ConversationState
  nextMove?: NextConversationMove
  toolRoute?: UniversalToolRoutingResult["tool"]
  brandName: string
  vertical: string
  catalogSummary?: ConversationCatalogSummary
  questionContract?: QuestionContract
}

function finalizeCommunication({
  candidateText,
  input,
  intent,
  conversationMode,
  actionRequest,
  visualBlock,
  seed,
  memory,
  state,
  nextMove,
  toolRoute,
  brandName,
  vertical,
  catalogSummary,
  questionContract,
}: {
  candidateText: string
  input: ConversationResponseResolverInput
  intent?: ConversationIntelligenceMeta["intent"]
  conversationMode?: ConversationIntelligenceMeta["conversationMode"]
  actionRequest?: ConversationIntelligenceMeta["actionRequest"]
  visualBlock?: ConversationResponseResolverResult["visualBlock"]
  seed: string
} & FinalizeCommunicationContext) {
  const guarded = guardAgainstRepetition({
    candidateText,
    history: input.history ?? [],
    intent,
    seed,
  })
  const communication = shapeHumanCommunication({
    rawText: guarded.text,
    userMessage: input.message,
    history: input.history ?? [],
    memory,
    state,
    intent: intent ?? "fallback",
    conversationMode,
    nextMove,
    toolRoute,
    actionRequest,
    visualBlock,
    vertical,
    brandName,
  })
  const humanized = humanizeFinalAnswer(communication.text)
  const humanityResult = applyConversationalHumanity({
    text: humanized,
    userMessage: input.message,
    history: input.history ?? [],
    memory,
    state,
    intent: intent ?? "fallback",
    conversationMode,
    nextMove,
    toolRoute,
    actionRequest,
    vertical,
    brandName,
  })
  const finalGuard = guardAgainstRepetition({
    candidateText: humanityResult.text,
    history: input.history ?? [],
    intent,
    seed: `${seed}-humanized`,
  })
  const satisfied = satisfyUserQuestion({
    userMessage: input.message,
    answerText: humanizeFinalAnswer(finalGuard.text),
    history: input.history ?? [],
    toolRoute,
    brandName,
    catalogSummary: input.catalogSummary ?? catalogSummary,
    questionContract,
    memory,
  })

  return {
    text: guardInternalLanguage(humanizeFinalAnswer(satisfied.text)),
    formatProfile: communication.formatProfile,
    humanity: humanityResult.humanity,
    questionSatisfaction: satisfied.questionSatisfaction,
  }
}

function toUniversalResolverResult(
  routed: UniversalToolRoutingResult,
  input: ConversationResponseResolverInput,
  communication: FinalizeCommunicationContext
): ConversationResponseResolverResult | null {
  if (!routed.answer) return null
  const intelligence: ConversationIntelligenceMeta = {
    intent: "off_domain",
    confidence: routed.confidence,
    memoryUsed: Boolean((input.history ?? []).length),
    action: "answer_only",
    conversationMode: "answer",
    topicStack: input.history ? undefined : undefined,
    toolRoute: routed.tool,
  }
  const finalized = finalizeCommunication({
    candidateText: routed.answer,
    input,
    intent: intelligence.intent,
    conversationMode: intelligence.conversationMode,
    actionRequest: intelligence.actionRequest,
    seed: `${input.message}-${routed.tool}-${input.history?.length ?? 0}`,
    ...communication,
  })

  return {
    text: finalized.text,
    intelligence: {
      ...intelligence,
      formatProfile: finalized.formatProfile,
      humanity: finalized.humanity,
      questionSatisfaction: finalized.questionSatisfaction,
    },
  }
}

export function createConversationIntelligenceResolver({
  brandName,
  baseResolver,
  actionResolver,
  brainProvider,
  toolProvider,
  catalogSummary,
}: {
  brandName: string
  baseResolver: ConversationResponseResolver
  actionResolver?: ConversationResponseResolver
  brainProvider?: LlmBrainProvider
  toolProvider?: UniversalToolProvider
  catalogSummary?: ConversationCatalogSummary
}): ConversationResponseResolver {
  return async (input: ConversationResponseResolverInput): Promise<ConversationResponseResolverResult | null> => {
    const memory = deriveConversationMemory({
      history: input.history,
      contextItems: input.contextItems,
    })
    const interpretation = interpretConversationTurn({
      message: input.message,
      contextItems: input.contextItems,
      conversationMemory: memory,
      brandName: input.brandName || brandName,
      history: input.history,
    })
    const nextMove = conductConversationTurn({
      message: input.message,
      history: input.history ?? [],
      memory,
      state: interpretation.state,
      interpretedIntent: interpretation.intent,
      contextItems: input.contextItems,
      lastAssistantQuestion: interpretation.state.lastAssistantQuestion,
      lastShownVisualBlockKind: interpretation.state.lastShownVisualBlockKind,
    })
    const topicStack = deriveTopicStack({
      message: input.message,
      history: input.history,
    })
    const messageNature = classifyHumanMessageNature({
      message: input.message,
      history: input.history,
    })
    const natureReply = buildMessageNatureReply({
      message: input.message,
      brandName: input.brandName || brandName,
      messageNature,
    })
    if (natureReply) {
      const neutralContract: QuestionContract = {
        questionType: "none",
        expectedAnswerShape: "none",
        mustAnswer: [],
        mustNotSay: ["não há confirmação", "nao ha confirmacao", "catálogo disponível", "catalogo disponivel"],
      }
      const finalized = finalizeCommunication({
        candidateText: natureReply.text,
        input,
        intent: natureReply.intent,
        conversationMode: natureReply.action === "ask_clarifying" ? "clarify" : "answer",
        actionRequest: { type: "none", reason: `message_nature_${messageNature.nature.toLowerCase()}` },
        seed: `${input.message}-${messageNature.nature}-${input.history?.length ?? 0}`,
        memory,
        state: interpretation.state,
        nextMove,
        toolRoute: natureReply.toolRoute,
        brandName: input.brandName || brandName,
        vertical: "appointment",
        catalogSummary: input.catalogSummary ?? catalogSummary,
        questionContract: neutralContract,
      })

      return {
        text: finalized.text,
        intelligence: {
          intent: natureReply.intent,
          confidence: Math.max(interpretation.confidence, messageNature.confidence),
          memoryUsed: Boolean(memory.conversationSummary),
          action: natureReply.action,
          nextMove,
          conversationMode: natureReply.action === "ask_clarifying" ? "clarify" : "answer",
          actionRequest: { type: "none", reason: `message_nature_${messageNature.nature.toLowerCase()}` },
          topicStack,
          toolRoute: natureReply.toolRoute,
          messageNature,
          formatProfile: finalized.formatProfile,
          humanity: finalized.humanity,
          questionSatisfaction: finalized.questionSatisfaction,
        },
      }
    }
    if (messageNature.nature === "QUESTION" && normalizeMessage(input.message).includes("quantas pessoas")) {
      const progressPreservation = preserveUserProgress({
        userMessage: input.message,
        failClosedText: "Não tenho confirmação desse dado.",
        messageNature,
        memory,
        brandName: input.brandName || brandName,
      })
      const neutralContract: QuestionContract = {
        questionType: "none",
        expectedAnswerShape: "none",
        mustAnswer: [],
        mustNotSay: ["contexto interno", "actionRequest", "visualBlock", "topicStack"],
      }
      const finalized = finalizeCommunication({
        candidateText: progressPreservation.text,
        input,
        intent: "operational_question",
        conversationMode: "clarify",
        actionRequest: { type: "none", reason: "progress_preservation_business_info" },
        seed: `${input.message}-progress-business-info-${input.history?.length ?? 0}`,
        memory,
        state: interpretation.state,
        nextMove,
        toolRoute: "answer_from_reasoning",
        brandName: input.brandName || brandName,
        vertical: "appointment",
        catalogSummary: input.catalogSummary ?? catalogSummary,
        questionContract: neutralContract,
      })

      return {
        text: finalized.text,
        intelligence: {
          intent: "operational_question",
          confidence: Math.max(interpretation.confidence, messageNature.confidence),
          memoryUsed: Boolean(memory.conversationSummary),
          action: "ask_clarifying",
          nextMove,
          conversationMode: "clarify",
          actionRequest: { type: "none", reason: "progress_preservation_business_info" },
          topicStack,
          toolRoute: "answer_from_reasoning",
          messageNature,
          progressPreservation,
          formatProfile: finalized.formatProfile,
          humanity: finalized.humanity,
          questionSatisfaction: finalized.questionSatisfaction,
        },
      }
    }
    const questionContract = deriveQuestionContract({
      userMessage: input.message,
      history: input.history,
      memory,
      catalogSummary: input.catalogSummary ?? catalogSummary,
    })
    if (shouldTryProgressPreservation({ messageNature, interpretation, questionContract }) && questionContract.expectedAnswerShape !== "operational_fail_closed") {
      const progressPreservation = preserveUserProgress({
        userMessage: input.message,
        failClosedText: "Não tenho confirmação desse dado.",
        questionContract,
        messageNature,
        memory,
        brandName: input.brandName || brandName,
      })

      if (progressPreservation.applies) {
        const toolRoute = toolForProgressQuery(progressPreservation.queryType)
        const progressContract = contractForProgressQuery(progressPreservation.queryType)
        const finalized = finalizeCommunication({
          candidateText: progressPreservation.text,
          input,
          intent: interpretation.intent,
          conversationMode: "clarify",
          actionRequest: { type: "none", reason: "progress_preservation_recoverable_operational_query" },
          seed: `${input.message}-progress-operational-${input.history?.length ?? 0}`,
          memory,
          state: interpretation.state,
          nextMove,
          toolRoute,
          brandName: input.brandName || brandName,
          vertical: "appointment",
          catalogSummary: input.catalogSummary ?? catalogSummary,
          questionContract: progressContract,
        })

        return {
          text: finalized.text,
          intelligence: {
            intent: interpretation.intent,
            confidence: interpretation.confidence,
            memoryUsed: Boolean(memory.conversationSummary),
            action: "ask_clarifying",
            nextMove,
            conversationMode: "clarify",
            actionRequest: { type: "none", reason: "progress_preservation_recoverable_operational_query" },
            topicStack,
            toolRoute,
            messageNature,
            progressPreservation,
            formatProfile: finalized.formatProfile,
            humanity: finalized.humanity,
            questionSatisfaction: finalized.questionSatisfaction,
          },
        }
      }
    }
    if (questionContract.expectedAnswerShape === "operational_fail_closed") {
      const satisfied = satisfyUserQuestion({
        userMessage: input.message,
        answerText: "",
        history: input.history ?? [],
        brandName: input.brandName || brandName,
        catalogSummary: input.catalogSummary ?? catalogSummary,
        questionContract,
        memory,
      })
      const progressPreservation = preserveUserProgress({
        userMessage: input.message,
        failClosedText: satisfied.text,
        questionContract,
        messageNature,
        memory,
        brandName: input.brandName || brandName,
      })
      const finalText = progressPreservation.applies ? progressPreservation.text : satisfied.text

      return {
        text: guardInternalLanguage(humanizeFinalAnswer(finalText)),
        intelligence: {
          intent: interpretation.intent,
          confidence: interpretation.confidence,
          memoryUsed: Boolean(memory.conversationSummary),
          action: "answer_only",
          nextMove,
          conversationMode: "answer",
          questionSatisfaction: satisfied.questionSatisfaction,
          progressPreservation,
        },
      }
    }
    const toolRoute = await routeConversationTool({
      message: input.message,
      history: input.history,
      topicStack,
    }, {
      provider: toolProvider,
    })

    if (toolRoute.shouldAnswerImmediately && questionContract.questionType !== "yes_no_service") {
      const universalResult = toUniversalResolverResult(toolRoute, input, {
        memory,
        state: interpretation.state,
        nextMove,
        toolRoute: toolRoute.tool,
        brandName: input.brandName || brandName,
        vertical: "appointment",
        catalogSummary: input.catalogSummary ?? catalogSummary,
        questionContract,
      })
      if (universalResult) {
        universalResult.intelligence = universalResult.intelligence
          ? { ...universalResult.intelligence, topicStack, toolRoute: toolRoute.tool }
          : universalResult.intelligence
        return universalResult
      }
    }

    const brainInput = {
      message: input.message,
      history: input.history ?? [],
      memory,
      state: interpretation.state,
      interpretedIntent: interpretation.intent,
      nextMove,
      contextItems: input.contextItems,
      brandName: input.brandName || brandName,
      vertical: "appointment",
      catalogSummary: input.catalogSummary ?? catalogSummary,
      topicStack,
      toolRoute: toolRoute.tool,
      questionContract,
    }
    const brainReply = brainProvider
      ? await Promise.resolve(brainProvider(brainInput))
      : await resolveLlmBrainReply(brainInput)
    const isClearAlternativeRequest =
      interpretation.intent === "vague_followup" &&
      isAlternativeRequest(input.message) &&
      interpretation.groundedContext.length > 0
    const shouldUseLegacyResolver =
      brainReply.shouldUseLegacyResolver &&
      (brainReply.actionRequest?.type ?? "none") !== "none" &&
      (shouldDelegateToResolver(interpretation) || isClearAlternativeRequest || brainReply.actionRequest?.type === "show_options")

    if (!shouldUseLegacyResolver) {
      return toResolverResult(
        buildConversationalReply({
          message: input.message,
          brandName: input.brandName || brandName,
          memory,
          interpretation,
          nextMove,
          brainReply,
        }),
        input,
        {
          memory,
          state: interpretation.state,
          nextMove,
          toolRoute: toolRoute.tool,
          brandName: input.brandName || brandName,
          vertical: "appointment",
          catalogSummary: input.catalogSummary ?? catalogSummary,
          questionContract,
        }
      )
    }

    const shouldPreferActionResolver =
      Boolean(actionResolver) &&
      (
        ((interpretation.intent === "booking" || interpretation.intent === "availability") &&
          interpretation.groundedContext.length > 0) ||
        (interpretation.intent === "service_question" && !isPreferenceOnlyServiceQuestion(interpretation)) ||
          interpretation.intent === "professional_question" ||
          isClearAlternativeRequest
      )
    const actionResult = shouldPreferActionResolver ? await Promise.resolve(actionResolver?.(input) ?? null) : null
    const baseResult = actionResult?.visualBlock ? actionResult : await Promise.resolve(baseResolver(input))
    const naturalResult = buildConversationalReply({
      message: input.message,
      brandName: input.brandName || brandName,
      memory,
      interpretation,
      nextMove,
      brainReply,
      resolverResult: baseResult,
    })

    return toResolverResult(naturalResult, input, {
      memory,
      state: interpretation.state,
      nextMove,
      toolRoute: toolRoute.tool,
      brandName: input.brandName || brandName,
      vertical: "appointment",
      catalogSummary: input.catalogSummary ?? catalogSummary,
      questionContract,
    }) ?? baseResult
  }
}
