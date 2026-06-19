import type { BusinessRuntime } from "../core"
import type {
  BusinessOperationalAiInput,
  BusinessOperationalAiPatch,
} from "./types"

function briefMarker(brief: string | undefined, fallback: string) {
  const normalized = brief?.trim()
  return (normalized || fallback).slice(0, 96)
}

function verticalNoun(runtime: BusinessRuntime) {
  switch (runtime.vertical) {
    case "restaurant":
      return "experiência da casa"
    case "beauty":
      return "cuidado"
    case "barber":
      return "atendimento da barbearia"
    case "clinic":
      return "atendimento da clínica"
    case "gym":
      return "rotina de treino"
    case "appointment":
      return "agendamento"
    case "generic":
      return "experiência da marca"
  }
}

function buildBusinessProfilePatch(runtime: BusinessRuntime, brief?: string): BusinessOperationalAiPatch {
  const marker = briefMarker(brief, `Proposta clara para ${verticalNoun(runtime)}.`)
  return {
    business: {
      name: runtime.business.name,
      description: `${runtime.business.description || runtime.brand.description} ${marker}`.trim().slice(0, 240),
    },
  }
}

function buildBrandVoicePatch(runtime: BusinessRuntime, brief?: string): BusinessOperationalAiPatch {
  const marker = briefMarker(brief, `${runtime.brand.name} com presença simples, humana e confiável.`)
  return {
    brand: {
      positioning: `${runtime.brand.positioning || runtime.brand.description} ${marker}`.trim().slice(0, 220),
      toneOfVoice: runtime.vertical === "clinic" ? "institutional" : runtime.vertical === "gym" ? "bold" : "warm",
    },
  }
}

function buildServicesPatch(runtime: BusinessRuntime, brief?: string): BusinessOperationalAiPatch {
  const marker = briefMarker(brief, `ajustado para uma escolha mais fácil`)

  if (runtime.services.length === 0) {
    return {
      services: [
        {
          name: runtime.vertical === "restaurant" ? "Oferta principal" : "Serviço principal",
          description: `${verticalNoun(runtime)} ${marker}`.slice(0, 180),
          category: runtime.vertical,
        },
      ],
    }
  }

  return {
    services: runtime.services.slice(0, 2).map((service) => ({
      id: service.id,
      name: service.name,
      description: `${service.description || service.name} · ${marker}`.slice(0, 180),
      category: service.category,
      price: service.price,
      durationMinutes: service.durationMinutes,
      tags: service.tags,
    })),
  }
}

function buildOperationsPatch(runtime: BusinessRuntime, brief?: string): BusinessOperationalAiPatch {
  const marker = briefMarker(brief, "confirmar disponibilidade pelo canal principal")
  return {
    hours: {
      ...runtime.hours,
      summary: runtime.hours.summary || "Horários sob consulta pelo canal principal",
    },
    location: {
      ...runtime.location,
      placeHint: runtime.location.placeHint || "localização informada no atendimento",
      referenceHint: runtime.location.referenceHint || marker,
    },
    channels: {
      ...runtime.channels,
    },
    policies: {
      ...runtime.policies,
      booking: runtime.policies.booking || "Atendimento confirmado pelo canal principal.",
      cancellation: runtime.policies.cancellation || "Alterações devem ser combinadas com antecedência.",
    },
  }
}

function buildFaqPatch(runtime: BusinessRuntime, brief?: string): BusinessOperationalAiPatch {
  const marker = briefMarker(brief, "Como falo com vocês?")
  const existingFaq = runtime.knowledge.faq ?? []
  return {
    knowledge: {
      faq: [
        ...existingFaq,
        {
          id: `faq-ai-${existingFaq.length + 1}`,
          question: marker.endsWith("?") ? marker : "Como funciona o atendimento?",
          answer: runtime.channels.whatsapp
            ? "Você pode falar pelo WhatsApp para confirmar detalhes e próximos passos."
            : "Use os canais da página para confirmar detalhes e próximos passos.",
        },
      ].slice(0, 8),
    },
  }
}

export function generateBusinessOperationalFixturePatch(
  input: BusinessOperationalAiInput
): BusinessOperationalAiPatch {
  switch (input.kind) {
    case "business_profile":
      return buildBusinessProfilePatch(input.runtime, input.operatorBrief)
    case "brand_voice":
      return buildBrandVoicePatch(input.runtime, input.operatorBrief)
    case "services":
      return buildServicesPatch(input.runtime, input.operatorBrief)
    case "operations":
      return buildOperationsPatch(input.runtime, input.operatorBrief)
    case "faq":
      return buildFaqPatch(input.runtime, input.operatorBrief)
    case "full_draft":
      return {
        ...buildBusinessProfilePatch(input.runtime, input.operatorBrief),
        ...buildBrandVoicePatch(input.runtime, input.operatorBrief),
        ...buildServicesPatch(input.runtime, input.operatorBrief),
        ...buildOperationsPatch(input.runtime, input.operatorBrief),
        ...buildFaqPatch(input.runtime, input.operatorBrief),
      }
  }
}
