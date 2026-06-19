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

const serviceContext = {
  id: "appointment-service-service-1",
  title: "Corte Masculino",
  image: "",
  subtitle: "Servico",
}

const barberContext = {
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

async function resolve(
  message: string,
  contextItems: ConversationContextPayload[] = [],
  history: ConversationHistoryMessage[] = []
) {
  const result = await resolver({
    message,
    brandName: barberShopConfig.name,
    contextItems,
    history,
  })

  assert(result?.text, `Expected text for "${message}"`)
  return result
}

async function runLongConversationFixture() {
  const history: ConversationHistoryMessage[] = []

  async function turn(message: string, contextItems: ConversationContextPayload[] = []) {
    const result = await resolve(message, contextItems, history)
    history.push({ role: "user", content: message })
    history.push({
      role: "ai",
      content: result?.text ?? "",
      visualBlock: result?.visualBlock,
    })
    return result
  }

  const greeting = await turn("oi")
  assert.equal(greeting?.intelligence?.intent, "greeting")
  assert.equal(greeting?.visualBlock, undefined)

  const vague = await turn("quero cortar o cabelo")
  assert.equal(vague?.intelligence?.intent, "recommendation")
  assert.equal(vague?.visualBlock, undefined, "vague first request must not show cards too early")

  const refinement = await turn("algo mais executivo")
  assert.equal(refinement?.intelligence?.intent, "service_question")
  assert.equal(refinement?.visualBlock, undefined)
  assert.match(refinement?.text ?? "", /executivo|limpo|marcado/i)

  const shortPrice = await turn("quanto?")
  assert.equal(shortPrice?.intelligence?.intent, "price")
  assert.equal(shortPrice?.intelligence?.memoryUsed, true)
  assert.doesNotMatch(shortPrice?.text ?? "", /Não captei|Me conta em uma frase/i)

  const professionalPreference = await turn("com Carlos", [barberContext])
  assert.equal(professionalPreference?.intelligence?.intent, "professional_question")
  assert.doesNotMatch(professionalPreference?.text ?? "", /Não captei|Me conta em uma frase/i)

  const today = await turn("e hoje?", [barberContext])
  assert.equal(today?.intelligence?.intent, "availability")
  assert(today?.visualBlock, "availability with professional context should show schedule action")

  const rejected = await turn("não gostei", [barberContext])
  assert.equal(rejected?.intelligence?.intent, "vague_followup")
  assert.equal(rejected?.visualBlock, undefined, "simple rejection should not immediately throw new cards")
  assert.match(rejected?.text ?? "", /opção|ajust|alternativa|insistir/i)

  const alternative = await turn("tem outro?", [serviceContext])
  assert.notEqual(alternative?.intelligence?.intent, "fallback")
  assert(alternative?.visualBlock, "clear alternative request after rejection should show useful options")

  const confirm = await turn("esse mesmo", [serviceContext])
  assert.notEqual(confirm?.intelligence?.intent, "fallback")
  assert.doesNotMatch(confirm?.text ?? "", /Não captei|Me conta em uma frase/i)

  const nextAction = await turn("pode ser amanhã", [serviceContext])
  assert(
    nextAction?.intelligence?.intent === "availability" || nextAction?.intelligence?.intent === "booking",
    `expected next action intent, got ${nextAction?.intelligence?.intent}`
  )
  assert.doesNotMatch(nextAction?.text ?? "", /Não captei|Me conta em uma frase/i)
}

async function main() {
  const opening = await resolve("Quero cortar o cabelo.")
  assert.equal(opening?.intelligence?.intent, "recommendation")
  assert.equal(opening?.visualBlock, undefined)
  assert.match(opening?.text ?? "", /discreto|marcado|degrad/i)

  const executive = await resolve("Algo mais executivo.", [], [
    { role: "user", content: "Quero cortar o cabelo." },
    { role: "ai", content: opening?.text ?? "" },
  ])
  assert.equal(executive?.intelligence?.intent, "service_question")
  assert.equal(executive?.visualBlock, undefined)
  assert.match(executive?.text ?? "", /executivo|marcado|limpo/i)

  const price = await resolve("quanto custa?", [serviceContext], [
    { role: "user", content: "Algo mais executivo." },
    { role: "ai", content: executive?.text ?? "" },
  ])
  assert.equal(price?.intelligence?.intent, "price")
  assert.equal(price?.intelligence?.memoryUsed, true)
  assert.doesNotMatch(price?.text ?? "", /Não captei|Me conta em uma frase/i)

  const availability = await resolve("e hoje?", [barberContext], [
    { role: "user", content: "Quero com o Carlos." },
    { role: "ai", content: "Carlos Silva combina com isso." },
  ])
  assert.equal(availability?.intelligence?.intent, "availability")
  assert(availability?.visualBlock, "availability follow-up should delegate to schedule visual block")

  const vague = await resolve("qual o melhor?", [serviceContext], [
    { role: "user", content: "Quero cortar o cabelo." },
    { role: "ai", content: opening?.text ?? "" },
  ])
  assert.notEqual(vague?.intelligence?.intent, "fallback")
  assert.doesNotMatch(vague?.text ?? "", /Não captei|Me conta em uma frase/i)

  const legacy = await resolve("barba completa")
  assert(legacy?.visualBlock, "explicit service lookup should keep legacy appointment visual block")

  await runLongConversationFixture()

  console.log("Conversation Intelligence validation: PASS")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
