import type { ConversationContextPayload, Professional, Service } from "@/lib/business-types"
import type { BusinessPost } from "@/components/business/business-social-landing"
import type { EstablishmentDialogueContext } from "@/lib/mock-data/appointment-establishment-dialogue-context"
import { barberServices, barbers } from "@/lib/mock-data/appointment-data"
import { appointmentContent } from "@/lib/mock-data/business-content"
import { buildSelectedContextItems } from "../model-context-pack"
import type { ModelContextPack, SelectedContextItem } from "../types"

export interface AppointmentPackBuildInput {
  ctx: EstablishmentDialogueContext
  contextItems?: ConversationContextPayload[]
  services?: Service[]
  professionals?: Professional[]
  feedPosts?: BusinessPost[]
}

function enrichSelectedFromFeed(
  items: SelectedContextItem[],
  feedPosts: BusinessPost[]
): SelectedContextItem[] {
  return items.map((item) => {
    const post = feedPosts.find((p) => p.id === item.id)
    if (!post) return item

    const knownFacts = [...item.knownFacts]
    if (post.type === "video" || post.type === "video-vertical") {
      knownFacts.push("formato: video tutorial")
      if (post.title.toLowerCase().includes("fade")) knownFacts.push("tema: fade")
      if (post.title.toLowerCase().includes("tendência") || post.title.toLowerCase().includes("tendencia")) {
        knownFacts.push("tema: tendencias corte masculino")
      }
      if (post.id === "apt-vid-3" || post.title.toLowerCase().includes("antes e depois")) {
        knownFacts.push("formato: antes e depois")
        knownFacts.push("tema: transformacao visual")
        return {
          ...item,
          knownFacts,
          summary: post.description ?? "transformacao antes/depois do visual na cadeira",
        }
      }
    }
    if (post.type === "social") {
      knownFacts.push("formato: publicacao social")
      return {
        ...item,
        kind: "social_post" as const,
        knownFacts,
        summary: post.description ?? item.summary ?? post.title,
      }
    }
    if (post.type === "news" && post.title.toLowerCase().includes("dom corleone")) {
      knownFacts.push("entidade: Dom Corleone")
      return {
        ...item,
        kind: "news" as const,
        knownFacts,
        belongsToCurrentHouse: false,
        isExternalOrEditorial: true,
      }
    }

    return { ...item, knownFacts, summary: post.description ?? item.summary }
  })
}

export function buildAppointmentModelContextPack(input: AppointmentPackBuildInput): ModelContextPack {
  const services = input.services ?? barberServices
  const professionals = input.professionals ?? barbers
  const feedPosts = input.feedPosts ?? [
    ...appointmentContent.videos,
    ...appointmentContent.news,
    ...appointmentContent.reviews,
  ]

  const selectedContextItems = enrichSelectedFromFeed(
    buildSelectedContextItems(input.contextItems ?? [], input.ctx.brandName),
    feedPosts
  )

  return {
    modelId: "appointment",
    brandName: input.ctx.brandName,
    pilotSlug: "establishment.appointment",
    houseVoice: {
      roleLabel: "anfitrião da barbearia",
      locale: "pt-BR",
      maxReplySentences: 4,
      allowEmoji: false,
    },
    operational: {
      liveState: input.ctx.operational.liveState,
      placeHint: input.ctx.operational.placeHint,
      momentHint: input.ctx.operational.momentHint,
      hoursHint: input.ctx.operational.hoursHint,
      openingHours: input.ctx.operational.openingHours,
      addressLine: input.ctx.arrival.addressLine,
      parkingHint: input.ctx.arrival.parkingHint,
      contactHint: "WhatsApp no rodapé",
    },
    catalog: {
      entities: [
        ...services.map((s) => ({
          id: s.id,
          kind: "service",
          name: s.name,
          category: s.category,
          attributes: {
            duration: s.duration,
            price: s.price,
            description: s.description,
          },
        })),
        ...professionals.map((p) => ({
          id: p.id,
          kind: "professional",
          name: p.name,
          category: p.role,
          attributes: { specialties: p.specialties?.join(", ") ?? "" },
        })),
      ],
      exclusions: ["massagem"],
    },
    capabilities: {
      visualBlockKinds: ["appointment-booking-results", "appointment-schedule-prompt"],
      supportsContextChips: true,
      supportsSchedulePrompt: true,
      supportsCartOrBookingDrawer: true,
      supportsArrivalMap: true,
    },
    transactionalResolverId: "appointment-ws08c",
    dataGaps: [
      {
        topic: "payment",
        honestReply:
          "Não tenho detalhe de PIX ou cartão cadastrado aqui — confirma no balcão ou no WhatsApp da casa.",
      },
      { topic: "cnpj", honestReply: "CNPJ não está no perfil público — confirma no balcão." },
    ],
    selectedContextItems,
  }
}
