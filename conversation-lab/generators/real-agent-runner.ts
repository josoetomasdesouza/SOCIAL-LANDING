import { createAppointmentConversationResolverWithDialogue } from "@/lib/mock-data/appointment-conversation-resolver-composed"
import {
  barberServices,
  barberShopArrivalContext,
  barberShopConfig,
  barberShopHeroOperationalContext,
  barbers,
} from "@/lib/mock-data/appointment-data"
import type { ConversationHistoryMessage } from "@/lib/mock-data/conversational-search"
import type { LabConversation, LabConversationTurn, LabTool } from "../types"

function mapToolRoute(toolRoute: unknown): LabTool {
  if (toolRoute === "catalog") return "catalog"
  if (toolRoute === "booking") return "booking"
  if (toolRoute === "schedule") return "schedule"
  if (toolRoute === "professional_lookup") return "service_lookup"
  if (toolRoute === "service_lookup") return "service_lookup"
  if (toolRoute === "product_lookup") return "product_lookup"
  if (toolRoute === "web_search") return "web_search"
  if (toolRoute === "weather") return "weather"
  if (toolRoute === "sports") return "sports"
  if (toolRoute === "news") return "news"
  if (toolRoute === "time") return "time"
  if (toolRoute === "answer_from_reasoning") return "reasoning"
  return "none"
}

function buildRealResolver() {
  return createAppointmentConversationResolverWithDialogue({
    brandName: barberShopConfig.name,
    operational: {
      liveState: barberShopHeroOperationalContext.liveState,
      placeHint: barberShopHeroOperationalContext.placeHint,
      momentHint: barberShopHeroOperationalContext.momentHint,
      hoursHint: barberShopHeroOperationalContext.hoursHint,
      openingHours: barberShopConfig.openingHours ?? "Seg-Sab: 9h-20h",
    },
    arrival: {
      addressLine: barberShopArrivalContext.addressLine,
      parkingHint: barberShopArrivalContext.parkingHint,
      referenceHint: barberShopArrivalContext.referenceHint,
    },
    serviceNames: barberServices.map((service) => service.name),
    services: barberServices,
    professionals: barbers,
    feedPosts: [],
  })
}

function mapActionRequest(actionRequest: unknown): LabConversationTurn["actionRequest"] {
  if (!actionRequest || typeof actionRequest !== "object") return "none"
  const type = "type" in actionRequest ? actionRequest.type : undefined
  if (type === "show_options" || type === "show_schedule" || type === "show_price" || type === "show_professionals") {
    return type
  }
  return "none"
}

function toolFromActionRequest(actionRequest: LabConversationTurn["actionRequest"]): LabTool {
  if (actionRequest === "show_schedule") return "schedule"
  if (actionRequest === "show_price") return "catalog"
  if (actionRequest === "show_professionals") return "service_lookup"
  if (actionRequest === "show_options") return "product_lookup"
  return "none"
}

function toolFromQuestionSatisfaction(questionType: unknown): LabTool {
  if (questionType === "yes_no_service" || questionType === "yes_no_service_availability") return "service_lookup"
  if (questionType === "yes_no_professional_availability") return "service_lookup"
  if (questionType === "yes_no_product_stock" || questionType === "delivery_lookup") return "product_lookup"
  if (questionType === "yes_no_reservation" || questionType === "booking_intent") return "booking"
  if (questionType === "yes_no_schedule_availability") return "schedule"
  if (questionType === "price_lookup" || questionType === "payment_lookup") return "catalog"
  if (questionType === "ambiguous_short_followup" || questionType === "topic_return" || questionType === "direct_answer") return "reasoning"
  if (questionType === "sports_schedule_followup" || questionType === "sports_opinion_followup") return "sports"
  if (questionType === "contextual_operational_followup") return "schedule"
  return "none"
}

export async function runRealAgentConversation(conversation: LabConversation): Promise<LabConversation> {
  const resolver = buildRealResolver()
  const history: ConversationHistoryMessage[] = []
  const realTurns: LabConversationTurn[] = []

  for (const turn of conversation.turns) {
    const result = await resolver({
      message: turn.user,
      brandName: barberShopConfig.name,
      contextItems: [],
      history,
    })
    const assistant = result?.text?.trim() || "Não consegui responder esse turno."
    const intelligence = result?.intelligence
    const actionRequest = mapActionRequest(intelligence?.actionRequest)
    const routedTool = mapToolRoute(intelligence?.toolRoute)
    const contractTool = toolFromQuestionSatisfaction(intelligence?.questionSatisfaction?.questionType)
    const actionTool = toolFromActionRequest(actionRequest)
    const actualTool = contractTool !== "none" ? contractTool : routedTool !== "none" ? routedTool : actionTool
    const realTurn: LabConversationTurn = {
      ...turn,
      assistant,
      actualTool,
      actionRequest,
      visualBlock: Boolean(result?.visualBlock),
      injectedFailure: undefined,
    }

    realTurns.push(realTurn)
    history.push({ role: "user", content: turn.user })
    history.push({ role: "ai", content: assistant, visualBlock: result?.visualBlock })
  }

  return {
    ...conversation,
    id: conversation.id.replace(/^mock-/, "real-"),
    mode: "real-agent",
    turns: realTurns,
  }
}

export async function runRealAgentConversations(conversations: LabConversation[]) {
  const realConversations: LabConversation[] = []

  for (const conversation of conversations) {
    realConversations.push(await runRealAgentConversation(conversation))
  }

  return realConversations
}
