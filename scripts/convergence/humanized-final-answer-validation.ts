import { strict as assert } from "node:assert"
import { humanizeFinalAnswer } from "@/lib/conversation-intelligence/humanize-final-answer"
import type { ConversationHistoryMessage } from "@/lib/conversation-intelligence/types"
import { createAppointmentConversationResolverWithDialogue } from "@/lib/mock-data/appointment-conversation-resolver-composed"
import {
  barberServices,
  barbers,
  barberShopArrivalContext,
  barberShopConfig,
  barberShopHeroOperationalContext,
} from "@/lib/mock-data/appointment-data"

const forbidden = [
  "actionRequest",
  "tool",
  "contexto",
  "intenção",
  "intencao",
  "visualBlock",
  "continuação",
  "continuacao",
  "continuação do que falamos",
  "continuacao do que falamos",
  "mostrar opções",
  "mostrar opcoes",
  "como direção",
  "como direcao",
  "direção de estilo",
  "direção de visual",
  "direção visual",
  "agenda entrar",
  "card",
]

const unaccentedPortuguese = [
  /\bvoce\b/i,
  /\bopcoes\b/i,
  /\bopcao\b/i,
  /\bservico\b/i,
  /\bservicos\b/i,
  /\bhorario\b/i,
  /\bhorarios\b/i,
  /\bpreco\b/i,
  /\bnao\b/i,
]

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function assertHuman(text: string, label: string) {
  const normalized = normalize(text)
  assert(text.trim().length > 0, `${label}: resposta vazia`)

  for (const cue of forbidden) {
    assert(!normalized.includes(normalize(cue)), `${label}: vazou "${cue}" em "${text}"`)
  }

  for (const pattern of unaccentedPortuguese) {
    assert(!pattern.test(text), `${label}: falta de acento em "${text}"`)
  }
}

const badSamples = [
  "Considerando que estamos falando de Corte executivo, o valor precisa vir ligado ao serviço certo. mostrar opções mais alinhadas com esse perfil",
  "Agora dá para olhar horários para agendar, porque serviço ou profissional já estão claros. Eu deixaria a agenda entrar como apoio, só para confirmar uma opção real.",
  "Separei outras opcoes na equipe — cada profissional tem seu estilo, veja quem conversa com voce. mostrar alternativas sem insistir na opção rejeitada",
  "Entendi como continuação do contexto atual. actionRequest show_schedule visualBlock true",
  "Pelo que você descreveu, eu trataria Corte Masculino como direção de estilo antes de levar para agenda.",
  "Não vou insistir nessa opção; eu iria para algo mais discreto antes de mostrar outro card.",
]

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

async function main() {
  for (const [index, sample] of badSamples.entries()) {
    const text = humanizeFinalAnswer(sample)
    assertHuman(text, `sample ${index + 1}`)
    console.log(`sample ${index + 1}: "${text}"`)
  }

  const history: ConversationHistoryMessage[] = []
  const turns = [
    "bom dia",
    "que dia é hoje?",
    "qual jogo tem hoje da copa do mundo?",
    "vai chover hoje em ponta grossa?",
    "qual filme mais assistido da netflix agora?",
    "beleza, voltando ao corte",
    "quero algo mais executivo",
    "quanto custa?",
    "tem horário hoje?",
    "não gostei",
    "tem outro profissional?",
  ]

  let sawPriceAction = false
  let sawScheduleAction = false
  let sawProfessionalsAction = false

  for (const [index, message] of turns.entries()) {
    const result = await resolver({
      message,
      brandName: barberShopConfig.name,
      contextItems: [],
      history,
    })
    const text = result?.text ?? ""
    assertHuman(text, `turn ${index + 1}`)

    sawPriceAction ||= result?.intelligence?.actionRequest?.type === "show_price"
    sawScheduleAction ||= result?.intelligence?.actionRequest?.type === "show_schedule"
    sawProfessionalsAction ||= result?.intelligence?.actionRequest?.type === "show_professionals"

    history.push({ role: "user", content: message })
    history.push({ role: "ai", content: text, visualBlock: result?.visualBlock })
    console.log(`${String(index + 1).padStart(2, "0")} user="${message}" ai="${text.slice(0, 140)}"`)
  }

  assert(sawPriceAction, "actionRequest show_price precisa ser preservado internamente")
  assert(sawScheduleAction, "actionRequest show_schedule precisa ser preservado internamente")
  assert(sawProfessionalsAction, "actionRequest show_professionals precisa ser preservado internamente")

  console.log("Humanized Final Answer Validation: PASS")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
