import { strict as assert } from "node:assert"
import type { ConversationContextPayload } from "@/lib/business-types"
import type { ConversationHistoryMessage } from "@/lib/conversation-intelligence/types"
import { createAppointmentConversationResolverWithDialogue } from "@/lib/mock-data/appointment-conversation-resolver-composed"
import {
  barberServices,
  barbers,
  barberShopArrivalContext,
  barberShopConfig,
  barberShopHeroOperationalContext,
} from "@/lib/mock-data/appointment-data"

const serviceContext: ConversationContextPayload = {
  id: "appointment-service-service-1",
  title: "Corte Masculino",
  image: "",
  subtitle: "Servico",
}

const barberContext: ConversationContextPayload = {
  id: "appointment-barber-barber-1",
  title: "Carlos Silva",
  image: "",
  subtitle: "Barbeiro",
}

const resolver = createAppointmentConversationResolverWithDialogue({
  brandName: barberShopConfig.name,
  operational: {
    liveState: barberShopHeroOperationalContext.liveState,
    placeHint: barberShopHeroOperationalContext.placeHint,
    momentHint: barberShopHeroOperationalContext.momentHint,
    hoursHint: barberShopHeroOperationalContext.hoursHint,
    openingHours: barberShopConfig.openingHours || "Seg-Sab: 9h-20h",
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

function sentenceCount(text: string) {
  return text.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length
}

function assertConducted(result: Awaited<ReturnType<typeof turn>>, label: string) {
  assert(result?.text, `${label}: expected text`)
  assert(result?.intelligence?.nextMove, `${label}: expected nextMove`)
  assert(sentenceCount(result.text) >= 2 || result.text.includes("?"), `${label}: response felt too dry: ${result.text}`)
}

const history: ConversationHistoryMessage[] = []

async function turn(message: string, contextItems: ConversationContextPayload[] = []) {
  const result = await resolver({
    message,
    brandName: barberShopConfig.name,
    contextItems,
    history,
  })

  assert(result?.text, `Expected text for "${message}"`)
  history.push({ role: "user", content: message })
  history.push({
    role: "ai",
    content: result.text,
    visualBlock: result.visualBlock,
  })
  return result
}

async function main() {
  const t1 = await turn("oi")
  assertConducted(t1, "turn 1")
  assert.equal(t1?.visualBlock, undefined)

  const t2 = await turn("quero cortar o cabelo")
  assertConducted(t2, "turn 2")
  assert.equal(t2?.intelligence?.intent, "recommendation")
  assert.equal(t2?.visualBlock, undefined, "no cards on vague request")
  assert.match(t2?.text ?? "", /discreto|marcado|visual|moderno/i)

  const t3 = await turn("algo mais executivo")
  assertConducted(t3, "turn 3")
  assert.equal(t3?.visualBlock, undefined)
  assert.match(t3?.text ?? "", /executivo|limpo|marcado|prioridade/i)

  const t4 = await turn("quanto?")
  assertConducted(t4, "turn 4")
  assert.equal(t4?.intelligence?.intent, "price")
  assert.equal(t4?.intelligence?.memoryUsed, true)
  assert.doesNotMatch(t4?.text ?? "", /Não captei|Me conta em uma frase/i)

  const t5 = await turn("qual você recomenda?")
  assertConducted(t5, "turn 5")
  assert.notEqual(t5?.intelligence?.intent, "fallback")
  assert.equal(t5?.visualBlock, undefined, "recommendation should still lead with text")

  const t6 = await turn("prefiro com Carlos", [barberContext])
  assertConducted(t6, "turn 6")
  assert.equal(t6?.intelligence?.intent, "professional_question")
  assert.doesNotMatch(t6?.text ?? "", /Não captei|Me conta em uma frase/i)

  const t7 = await turn("e hoje?", [barberContext])
  assertConducted(t7, "turn 7")
  assert.equal(t7?.intelligence?.intent, "availability")
  assert(t7?.visualBlock, "availability with professional context should show action")

  const t8 = await turn("mais cedo", [barberContext])
  assertConducted(t8, "turn 8")
  assert.equal(t8?.intelligence?.intent, "availability")
  assert.doesNotMatch(t8?.text ?? "", /Não captei|Me conta em uma frase/i)

  const t9 = await turn("não gostei", [barberContext])
  assertConducted(t9, "turn 9")
  assert.equal(t9?.visualBlock, undefined, "rejection should not immediately throw cards")
  assert.match(t9?.text ?? "", /não insist|alternativa|opção|outro profissional/i)

  const t10 = await turn("e se for com outro profissional?", [serviceContext])
  assertConducted(t10, "turn 10")
  assert.notEqual(t10?.intelligence?.intent, "fallback")
  assert(t10?.visualBlock, "clear professional alternative should show useful options")

  const t11 = await turn("esse mesmo", [serviceContext])
  assertConducted(t11, "turn 11")
  assert.notEqual(t11?.intelligence?.intent, "fallback")
  assert.doesNotMatch(t11?.text ?? "", /Não captei|Me conta em uma frase/i)

  const t12 = await turn("obrigado, era isso")
  assert(t12?.intelligence?.nextMove?.type === "close_loop", "final turn should close loop")
  assert.match(t12?.text ?? "", /retomar|perfeito|continuo/i)

  console.log("Conversation Conductor validation: PASS")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
