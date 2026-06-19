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

const history: ConversationHistoryMessage[] = []

async function turn(message: string, contextItems: ConversationContextPayload[] = []) {
  const result = await resolver({
    message,
    brandName: barberShopConfig.name,
    contextItems,
    history,
  })

  assert(result?.text, `Expected text for "${message}"`)
  assert(result.intelligence?.conversationMode, `Expected brain mode for "${message}"`)
  history.push({ role: "user", content: message })
  history.push({ role: "ai", content: result.text, visualBlock: result.visualBlock })
  return result
}

function assertNoEarlyTool(result: Awaited<ReturnType<typeof turn>>, label: string) {
  assert.equal(result?.visualBlock, undefined, `${label}: visualBlock appeared too early`)
  assert.notEqual(result?.intelligence?.actionRequest?.type, "show_schedule", `${label}: schedule action too early`)
  assert.notEqual(result?.intelligence?.actionRequest?.type, "show_professionals", `${label}: professionals action too early`)
}

async function main() {
  const t1 = await turn("oi")
  assert.equal(t1?.intelligence?.conversationMode, "clarify")
  assertNoEarlyTool(t1, "t1")

  const t2 = await turn("quero cortar o cabelo")
  assert.equal(t2?.intelligence?.conversationMode, "clarify")
  assertNoEarlyTool(t2, "t2")
  assert.match(t2?.text ?? "", /antes|visual|discreto|marcada/i)

  const t3 = await turn("algo mais executivo")
  assert.equal(t3?.intelligence?.conversationMode, "reflect")
  assertNoEarlyTool(t3, "t3")

  const t4 = await turn("quanto?")
  assert.equal(t4?.intelligence?.conversationMode, "reflect")
  assert.equal(t4?.intelligence?.actionRequest?.type, "show_price")
  assert.equal(t4?.visualBlock, undefined, "price reflection should not force cards")

  const t5 = await turn("me mostra as opções", [serviceContext])
  assert.notEqual(t5?.intelligence?.actionRequest?.type, "none")
  assert(t5?.text.includes("opções") || t5?.text.includes("opção") || t5?.text.includes("serviço"))

  const t6 = await turn("qual você recomenda?")
  assert.equal(t6?.visualBlock, undefined, "open recommendation still text-first")
  assert.notEqual(t6?.intelligence?.conversationMode, "act")

  const t7 = await turn("prefiro com Carlos", [barberContext])
  assert(t7?.intelligence?.actionRequest, "professional preference should create an action request")

  const t8 = await turn("e hoje?", [barberContext])
  assert.equal(t8?.intelligence?.actionRequest?.type, "show_schedule")
  assert.equal(t8?.intelligence?.conversationMode, "act")
  assert(t8?.visualBlock, "clear schedule action should show visual support")

  const t9 = await turn("mais cedo", [barberContext])
  assert.equal(t9?.intelligence?.actionRequest?.type, "show_schedule")
  assert(t9?.text.length > 60, "short time follow-up should use state and context")

  const t10 = await turn("não gostei", [barberContext])
  assert.equal(t10?.visualBlock, undefined)
  assert.equal(t10?.intelligence?.conversationMode, "reflect")
  assert.match(t10?.text ?? "", /não insist|alternativa|discreta|outro profissional/i)

  const t11 = await turn("tem outro?", [serviceContext])
  assert.equal(t11?.intelligence?.actionRequest?.type, "show_professionals")
  assert(t11?.visualBlock, "clear alternative should call legacy tool")

  const t12 = await turn("e se for com outro profissional?", [serviceContext])
  assert.equal(t12?.intelligence?.actionRequest?.type, "show_professionals")
  assert(t12?.visualBlock, "professional alternative should show tool support")

  const t13 = await turn("esse mesmo", [serviceContext])
  assert(t13?.intelligence?.actionRequest?.type === "show_schedule" || t13?.intelligence?.conversationMode === "act")

  const t14 = await turn("pode ser amanhã", [serviceContext])
  assert.equal(t14?.intelligence?.actionRequest?.type, "show_schedule")
  assert(t14?.visualBlock, "confirmed next action should show schedule support")

  const t15 = await turn("obrigado, era isso")
  assert.equal(t15?.intelligence?.conversationMode, "close")
  assert.equal(t15?.intelligence?.actionRequest?.type, "none")
  assert.equal(t15?.visualBlock, undefined)

  console.log("LLM Brain validation: PASS")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
