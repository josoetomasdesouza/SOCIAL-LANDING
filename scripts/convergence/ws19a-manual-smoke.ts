/**
 * WS-19A post-merge smoke — resolver path (kernel + adapter), no browser.
 * Run: npx --yes tsx scripts/convergence/ws19a-manual-smoke.ts
 */
import { appointmentContent } from "@/lib/mock-data/business-content"
import { barberShopConfig, barberShopArrivalContext, barberShopHeroOperationalContext } from "@/lib/mock-data/appointment-data"
import { createAppointmentConversationResolverWithDialogue } from "@/lib/mock-data/appointment-conversation-resolver-composed"
import type { ConversationContextPayload } from "@/lib/business-types"

const AUGUSTA = /veja servi(c|o)s e profissionais no feed quando quiser/i
const DEGRADE_BOOKING = /caminho comum por aqui|appointment-booking/i
const BROAD = /não captei o foco|nao captei o foco/i

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
  feedPosts: [
    ...appointmentContent.videos,
    ...appointmentContent.news,
    ...appointmentContent.reviews,
    ...appointmentContent.social,
  ],
}

const resolver = createAppointmentConversationResolverWithDialogue(ctx)

function chip(id: string, title: string, subtitle?: string): ConversationContextPayload[] {
  return [{ id, title, image: "", subtitle: subtitle ?? "video" }]
}

function run(
  id: string,
  message: string,
  contextItems: ConversationContextPayload[],
  expect: { forbid?: RegExp[]; require?: RegExp[]; noBooking?: boolean }
): boolean {
  const result = resolver({ message, brandName: ctx.brandName, contextItems })
  const text = result?.text ?? ""
  const booking = result && typeof result === "object" && "kind" in result

  let ok = true
  const details: string[] = []

  for (const r of expect.forbid ?? []) {
    if (r.test(text) || (booking && expect.noBooking !== false && DEGRADE_BOOKING.test(JSON.stringify(result)))) {
      ok = false
      details.push(`forbidden ${r}`)
    }
  }
  if (expect.noBooking && booking) {
    ok = false
    details.push("unexpected booking payload")
  }
  for (const r of expect.require ?? []) {
    if (!r.test(text)) {
      ok = false
      details.push(`missing ${r}`)
    }
  }
  if (AUGUSTA.test(text)) {
    ok = false
    details.push("Augusta loop")
  }

  console.log(`${ok ? "PASS" : "FAIL"} ${id}`)
  console.log(`  Q: ${message}`)
  console.log(`  A: ${text.slice(0, 140)}${text.length > 140 ? "…" : ""}`)
  if (!ok) console.log(`  → ${details.join("; ")}`)
  return ok
}

const cases = [
  () =>
    run("1-video-tendencias-mulheres", "tem tendencias para mulheres?", chip("apt-vid-2", "Tendencias de Corte Masculino 2024"), {
      forbid: [BROAD, DEGRADE_BOOKING],
      require: [/masculino|mulher|feminino|tend/i],
      noBooking: true,
    }),
  () =>
    run("2-video-fade-mulheres", "esse fade é feito tambem em mulheres?", chip("apt-vid-1", "Tutorial: Fade Perfeito em 5 Minutos"), {
      forbid: [BROAD, DEGRADE_BOOKING],
      require: [/fade|mulher|feminino|vídeo|video|masculino/i],
      noBooking: true,
    }),
  () =>
    run("3-servico-estacionamento", "Tem estacionamento?", chip("appointment-service-1", "Corte Masculino", "serviço"), {
      forbid: [DEGRADE_BOOKING, /30 min.*tradicional/i],
      require: [/estacionamento|conveniado|mapa/i],
      noBooking: true,
    }),
  () =>
    run("4-post-curitiba", "Tem essa barbearia em Curitiba?", chip("apt-soc-2", "Nosso espaco foi renovado!"), {
      forbid: [AUGUSTA, DEGRADE_BOOKING],
      require: [/unidade|franquia|cidade|curitiba|esta unidade/i],
      noBooking: true,
    }),
  () =>
    run("5-ambiguidade-isso", "o que significa isso pra minha cidade?", chip("apt-soc-1", "Sabado de casa cheia!"), {
      forbid: [AUGUSTA],
      require: [/publicacao|publicação|feed|horario|horário|preco|preço|agendar|unidade|cidade/i],
      noBooking: true,
    }),
  () =>
    run("6-me-fala-ai-sem-chip", "me fala ai", [], {
      forbid: [AUGUSTA],
      require: [BROAD],
      noBooking: true,
    }),
]

const results = cases.map((c) => c())
const passed = results.filter(Boolean).length
console.log(`\n--- WS-19A manual smoke: ${passed}/${results.length} ---`)
process.exit(passed === results.length ? 0 : 1)
