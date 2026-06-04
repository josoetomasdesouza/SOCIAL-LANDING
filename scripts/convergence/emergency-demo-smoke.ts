/**
 * Emergency patch — browser-path smoke (kernel + augusta guard).
 */
import { appointmentContent } from "@/lib/mock-data/business-content"
import { barberShopConfig, barberShopArrivalContext, barberShopHeroOperationalContext } from "@/lib/mock-data/appointment-data"
import { createAppointmentConversationResolverWithDialogue } from "@/lib/mock-data/appointment-conversation-resolver-composed"
import type { ConversationContextPayload } from "@/lib/business-types"

const ctx = {
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
  serviceNames: [] as string[],
  feedPosts: [...appointmentContent.videos, ...appointmentContent.news, ...appointmentContent.social],
}

const resolver = createAppointmentConversationResolverWithDialogue(ctx)

function chip(id: string, title: string, subtitle: string): ConversationContextPayload[] {
  return [{ id, title, image: "", subtitle }]
}

const cases = [
  {
    id: "A-video-fede",
    message: "o que é fede?",
    chips: chip("v-fade", "Tutorial: Fade Perfeito em 5 Minutos", "video"),
    forbid: [/fica na augusta/i, /veja servicos e profissionais no feed/i, /—/],
    require: [/fade|vídeo|video|tutorial/i],
  },
  {
    id: "B-tendencias-carecas",
    message: "carecas",
    chips: chip("v-tend", "Tendencias de Corte Masculino 2024", "video"),
    forbid: [/fica na augusta/i, /—/],
    require: [/careca|calvo|masculino|tendencia|tendência/i],
  },
  {
    id: "C-post-fale-mais",
    message: "fale mais",
    chips: chip("p1", "Sabado de casa cheia! Obrigado pela confianca.", "social_post"),
    forbid: [/fica na augusta/i],
    require: [/post|feed|sabado|confianca/i],
  },
  {
    id: "D-servico-estacionamento",
    message: "tem estacionamento?",
    chips: chip("s1", "Corte Masculino", "service"),
    forbid: [/fica na augusta/i, /30 min/i],
    require: [/estacionamento|parking|mapa|vaga/i],
  },
  {
    id: "E-sem-chip",
    message: "me fala aí",
    chips: [] as ConversationContextPayload[],
    forbid: [/fica na augusta/i, /—/],
    require: [/horário|horario|preço|preco|agendar|feed|foco/i],
  },
  {
    id: "F-video-o-que-e-fade",
    message: "o que é fade?",
    chips: chip("v-fade", "Tutorial: Fade Perfeito em 5 Minutos", "video"),
    forbid: [/Degrade e um caminho/i, /—/, /Entendi\. Você está falando desse conteúdo/i],
    require: [/fade|vídeo|video|tutorial|técnica|tecnica/i],
  },
  {
    id: "G-curitiba-sem-chip",
    message: "tem essa barbearia em curitiba",
    chips: [] as ConversationContextPayload[],
    forbid: [/Carlos Silva/i, /Ver horarios/i, /Entendi\. Você está falando/i],
    require: [/curitiba|augusta|unidade|são paulo|sao paulo/i],
  },
  {
    id: "H-video-tecnica",
    message: "qual é a tecnica?",
    chips: chip("apt-vid-1", "Tutorial: Fade Perfeito em 5 Minutos", "video"),
    forbid: [/Entendi\. Você está falando desse conteúdo/i, /Carlos Silva/i],
    require: [/técnica|tecnica|fade|máquina|maquina|tesoura/i],
  },
  {
    id: "I-video-desse-conteudo",
    message: "desse conteudo",
    chips: chip("apt-vid-1", "Tutorial: Fade Perfeito em 5 Minutos", "video"),
    forbid: [/Entendi\. Você está falando desse conteúdo/i],
    require: [/fade|vídeo|video|tutorial|barbeiro|agendar/i],
  },
]

async function main(): Promise<void> {
  let pass = 0
  for (const c of cases) {
    const r = await resolver({ message: c.message, brandName: ctx.brandName, contextItems: c.chips })
    const text = r?.text ?? ""
    const okForbid = !c.forbid.some((re) => re.test(text))
    const okRequire = c.require.some((re) => re.test(text))
    const okDash = !/—/.test(text)
    const ok = okForbid && okRequire && okDash && text.length > 10
    console.log(`${ok ? "PASS" : "FAIL"} ${c.id}: ${text.slice(0, 120)}`)
    if (ok) pass += 1
  }
  console.log(`\nEmergency demo smoke: ${pass}/${cases.length}`)
  process.exit(pass === cases.length ? 0 : 1)
}

main()
