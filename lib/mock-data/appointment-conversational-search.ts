import type { Professional, Service } from "@/lib/business-types"
import { barbers, barberServices } from "@/lib/mock-data/appointment-data"
import type {
  ConversationResponseResolver,
  ConversationResponseResolverResult,
} from "@/lib/mock-data/conversational-search"
import { normalizeSurfaceFlowText } from "@/lib/surface-flow/product-entity"

export const APPOINTMENT_BOOKING_RESULTS_KIND = "appointment-booking-results"
export const APPOINTMENT_SCHEDULE_PROMPT_KIND = "appointment-schedule-prompt"

const BARBER_CONTEXT_PREFIX = "appointment-barber-"
const SERVICE_CONTEXT_PREFIX = "appointment-service-"
const STYLE_CONTEXT_PREFIX = "appointment-style-"

export interface AppointmentSearchResult {
  id: string
  kind: "barber" | "service"
  title: string
  image: string
  subtitle?: string
  price?: number
  ctaLabel?: string
}

export interface AppointmentBookingResultsPayload {
  items: AppointmentSearchResult[]
  intent: "service" | "barber" | "recommendation" | "context" | "period"
}

export interface AppointmentSchedulePromptPayload {
  barberId?: string
  serviceId?: string
  barberName?: string
  serviceName?: string
  periodHint?: "morning" | "afternoon" | "evening"
}

const SERVICE_KEYWORDS: Record<string, string[]> = {
  "service-1": ["corte masculino", "corte tradicional"],
  "service-2": ["degrade", "fade", "degradê"],
  "service-3": ["barba completa", "barba"],
  "service-4": ["corte e barba", "corte + barba", "combo"],
  "service-5": ["pigmentacao", "pigmentação"],
  "service-6": ["hidratacao", "hidratação capilar"],
  "service-7": ["desenho"],
  "service-8": ["platinado", "descoloracao", "descoloração"],
}

const BARBER_SPECIALTY_KEYWORDS: Record<string, string[]> = {
  Degrade: ["degrade", "fade"],
  Barba: ["barba", "barbear"],
  Pigmentacao: ["pigmentacao", "pigmentação"],
  "Corte Social": ["social", "corte social"],
  Desenho: ["desenho", "arte"],
  Afro: ["afro", "black power"],
  Dreadlocks: ["dread", "dreadlock"],
  Tranças: ["tranca", "trança", "braid"],
  "Corte Masculino": ["corte masculino", "corte"],
}

const RECOMMENDATION_CUES = [
  "preciso cortar",
  "cortar o cabelo",
  "cuidar da barba",
  "arrumar a barba",
  "quero relaxar",
  "cuidar do visual",
  "nao sei o que fazer",
  "nao sei o que escolher",
  "me ajuda",
  "indica",
  "recomenda",
  "sugere",
]

function normalizeText(value: string) {
  return normalizeSurfaceFlowText(value)
}

function barberToSearchResult(barber: Professional): AppointmentSearchResult {
  return {
    id: barber.id,
    kind: "barber",
    title: barber.name,
    image: barber.avatar,
    subtitle: barber.specialties?.slice(0, 2).join(" · ") ?? barber.role,
    ctaLabel: "Ver horarios",
  }
}

function serviceToSearchResult(service: Service): AppointmentSearchResult {
  return {
    id: service.id,
    kind: "service",
    title: service.name,
    image: service.image || "",
    subtitle: `${service.duration} min`,
    price: service.price,
    ctaLabel: "Ver opcoes",
  }
}

function getContextBarbers(contextItems: { id: string }[]) {
  const ids = new Set(
    contextItems
      .map((item) =>
        item.id.startsWith(BARBER_CONTEXT_PREFIX) ? item.id.slice(BARBER_CONTEXT_PREFIX.length) : null
      )
      .filter(Boolean) as string[]
  )

  return barbers.filter((barber) => ids.has(barber.id))
}

function getContextServices(contextItems: { id: string }[]) {
  const ids = new Set(
    contextItems
      .map((item) =>
        item.id.startsWith(SERVICE_CONTEXT_PREFIX) ? item.id.slice(SERVICE_CONTEXT_PREFIX.length) : null
      )
      .filter(Boolean) as string[]
  )

  return barberServices.filter((service) => ids.has(service.id))
}

function getStyleCategoryHints(contextItems: { id: string }[]) {
  const styleIds = contextItems
    .filter((item) => item.id.startsWith(STYLE_CONTEXT_PREFIX))
    .map((item) => item.id.slice(STYLE_CONTEXT_PREFIX.length))

  if (styleIds.length === 0) return []

  const categories = new Set<string>()
  for (const styleId of styleIds) {
    if (styleId.includes("1") || styleId.includes("2")) categories.add("Degrade")
    if (styleId.includes("4")) categories.add("Curto")
    if (styleId.includes("5")) categories.add("Barba")
  }

  return [...categories]
}

function buildBookingResultsResponse(
  text: string,
  items: AppointmentSearchResult[],
  intent: AppointmentBookingResultsPayload["intent"]
): ConversationResponseResolverResult | null {
  if (items.length === 0) return null

  return {
    text,
    visualBlock: {
      kind: APPOINTMENT_BOOKING_RESULTS_KIND,
      payload: {
        items: items.slice(0, 3),
        intent,
      } satisfies AppointmentBookingResultsPayload,
    },
  }
}

function buildSchedulePromptResponse(
  text: string,
  payload: AppointmentSchedulePromptPayload
): ConversationResponseResolverResult {
  return {
    text,
    visualBlock: {
      kind: APPOINTMENT_SCHEDULE_PROMPT_KIND,
      payload: payload satisfies AppointmentSchedulePromptPayload,
    },
  }
}

function matchesScheduleIntent(message: string) {
  const normalized = normalizeText(message)
  const cues = [
    "agendar",
    "marcar horario",
    "marcar horário",
    "reservar horario",
    "reservar horário",
    "ver horario",
    "ver horários",
    "quero horario",
    "quero horário",
  ]
  return cues.some((cue) => normalized.includes(cue))
}

function matchesPeriodRefinementIntent(message: string) {
  const normalized = normalizeText(message)
  const cues = [
    "a tarde",
    "de tarde",
    "tarde",
    "vespertino",
    "depois do almoco",
    "depois do almoço",
    "de manha",
    "de manhã",
    "manha",
    "manhã",
    "a noite",
    "de noite",
    "noite",
    "tem algo",
    "algum horario",
    "algum horário",
  ]
  return cues.some((cue) => normalized.includes(cue))
}

function resolvePeriodHint(message: string): AppointmentSchedulePromptPayload["periodHint"] {
  const normalized = normalizeText(message)
  if (normalized.includes("tarde") || normalized.includes("vespertino") || normalized.includes("almoco") || normalized.includes("almoço")) {
    return "afternoon"
  }
  if (normalized.includes("manha") || normalized.includes("manhã")) {
    return "morning"
  }
  if (normalized.includes("noite")) {
    return "evening"
  }
  return undefined
}

function matchesAlternateProfessionalIntent(message: string) {
  const normalized = normalizeText(message)
  const cues = [
    "outro profissional",
    "outro barbeiro",
    "alguem mais",
    "alguém mais",
    "alternativa",
    "e outro",
    "tem mais alguem",
    "tem mais alguém",
  ]
  return cues.some((cue) => normalized.includes(cue))
}

function matchesContextualFollowUpIntent(message: string) {
  const normalized = normalizeText(message)
  const cues = [
    "quais servicos",
    "quais serviços",
    "o que faz",
    "o que ele faz",
    "o que ela faz",
    "esse profissional",
    "esse barbeiro",
    "quem faz",
    "combina com",
    "faz esse servico",
    "faz esse serviço",
  ]
  return cues.some((cue) => normalized.includes(cue))
}

function findServiceFromMessage(message: string) {
  const normalized = normalizeText(message)

  for (const [serviceId, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(normalizeText(keyword)))) {
      return barberServices.find((service) => service.id === serviceId) ?? null
    }
  }

  return (
    barberServices.find((service) => {
      const serviceName = normalizeText(service.name)
      return normalized.includes(serviceName) || serviceName.split(" ").some((word) => word.length > 4 && normalized.includes(word))
    }) ?? null
  )
}

function findBarbersBySpecialty(message: string, limit = 3) {
  const normalized = normalizeText(message)
  const matchedSpecialties = new Set<string>()

  for (const [specialty, keywords] of Object.entries(BARBER_SPECIALTY_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(normalizeText(keyword)))) {
      matchedSpecialties.add(specialty)
    }
  }

  if (matchedSpecialties.size === 0) {
    return []
  }

  return barbers
    .filter((barber) => barber.specialties?.some((spec) => matchedSpecialties.has(spec)))
    .slice(0, limit)
}

function findBarbersForService(service: Service, excludeIds: Set<string> = new Set(), limit = 3) {
  const serviceName = normalizeText(service.name)
  const category = normalizeText(service.category)

  return barbers
    .filter((barber) => {
      if (excludeIds.has(barber.id)) return false

      return barber.specialties?.some((spec) => {
        const normalizedSpec = normalizeText(spec)
        return (
          serviceName.includes(normalizedSpec) ||
          normalizedSpec.includes(category) ||
          (category === "corte" && normalizedSpec.includes("corte")) ||
          (category === "barba" && normalizedSpec.includes("barba"))
        )
      })
    })
    .slice(0, limit)
}

function getRelatedServicesForBarber(barber: Professional, limit = 3) {
  const specialties = new Set((barber.specialties ?? []).map(normalizeText))

  return barberServices
    .filter((service) => {
      const category = normalizeText(service.category)
      const serviceName = normalizeText(service.name)

      for (const specialty of specialties) {
        if (serviceName.includes(specialty) || specialty.includes(category) || category.includes(specialty.split(" ")[0])) {
          return true
        }
      }

      return service.popular === true
    })
    .slice(0, limit)
}

function matchesRecommendationIntent(message: string) {
  const normalized = normalizeText(message)
  return RECOMMENDATION_CUES.some((cue) => normalized.includes(normalizeText(cue)))
}

/** WS-08D discovery — defer to establishment dialogue (no booking block). */
function matchesEstablishmentDialogueDeferral(message: string) {
  const normalized = normalizeText(message)
  const cues = [
    "nao sei qual corte",
    "qual corte fazer",
    "vai ficar bonito",
    "ficar bonito",
    "uma opiniao",
    "quero opiniao",
    "so fala isso",
    "mudar meu visual",
    "mudar visual",
    "algo moderno",
    "mais moderno",
    "combina comigo",
    "cabelo sem forma",
    "ficar mais bonito",
  ]
  return cues.some((cue) => normalized.includes(cue))
}

function defaultServiceForBarber(barber: Professional) {
  const related = getRelatedServicesForBarber(barber, 1)
  return related[0] ?? barberServices.find((service) => service.popular) ?? barberServices[0]
}

export function createAppointmentMockConversationResolver(): ConversationResponseResolver {
  return ({ message, contextItems }) => {
    if (matchesEstablishmentDialogueDeferral(message)) {
      return null
    }

    const contextBarbers = getContextBarbers(contextItems)
    const contextServices = getContextServices(contextItems)
    const styleHints = getStyleCategoryHints(contextItems)

    if (matchesScheduleIntent(message)) {
      if (contextBarbers.length === 1) {
        const barber = contextBarbers[0]
        const service = contextServices[0] ?? defaultServiceForBarber(barber)

        return buildSchedulePromptResponse(
          `Posso te mostrar horarios com ${barber.name} — sem compromisso, so para voce ver o que encaixa.`,
          {
            barberId: barber.id,
            serviceId: service.id,
            barberName: barber.name,
            serviceName: service.name,
          }
        )
      }

      const matchedService = findServiceFromMessage(message) ?? contextServices[0] ?? null
      if (matchedService) {
        const barbersForService = findBarbersForService(matchedService, new Set(), 3)
        return buildBookingResultsResponse(
          `Para ${matchedService.name}, estes profissionais costumam encaixar bem — toque para ver horarios.`,
          barbersForService.length > 0
            ? barbersForService.map(barberToSearchResult)
            : barbers.slice(0, 3).map(barberToSearchResult),
          "service"
        )
      }

      return buildBookingResultsResponse(
        "Separei caminhos para ver horarios — escolha quem combina com voce, sem pressa.",
        barbers.filter((barber) => barber.rating >= 4.7).slice(0, 3).map(barberToSearchResult),
        "recommendation"
      )
    }

    if (matchesPeriodRefinementIntent(message)) {
      const periodHint = resolvePeriodHint(message)
      const periodLabel =
        periodHint === "afternoon" ? "a tarde" : periodHint === "morning" ? "de manha" : periodHint === "evening" ? "a noite" : "nesse periodo"

      if (contextBarbers.length === 1) {
        const barber = contextBarbers[0]
        const service = contextServices[0] ?? defaultServiceForBarber(barber)

        return buildSchedulePromptResponse(
          `Vejo opcoes ${periodLabel} com ${barber.name} — posso abrir a agenda para voce explorar com calma.`,
          {
            barberId: barber.id,
            serviceId: service.id,
            barberName: barber.name,
            serviceName: service.name,
            periodHint,
          }
        )
      }

      return buildBookingResultsResponse(
        `Para ${periodLabel}, estes profissionais costumam ter mais flexibilidade — veja quem combina com voce.`,
        barbers.slice(0, 3).map(barberToSearchResult),
        "period"
      )
    }

    if (matchesAlternateProfessionalIntent(message)) {
      const excludeIds = new Set(contextBarbers.map((barber) => barber.id))
      const service = contextServices[0] ?? findServiceFromMessage(message) ?? null
      const alternatives = service
        ? findBarbersForService(service, excludeIds, 3)
        : barbers.filter((barber) => !excludeIds.has(barber.id)).slice(0, 3)

      if (alternatives.length > 0) {
        return buildBookingResultsResponse(
          "Separei outras opcoes na equipe — cada profissional tem seu estilo, veja quem conversa com voce.",
          alternatives.map(barberToSearchResult),
          "context"
        )
      }
    }

    if (contextBarbers.length > 0 && matchesContextualFollowUpIntent(message)) {
      const barber = contextBarbers[0]
      const relatedServices = getRelatedServicesForBarber(barber, 3)

      return buildBookingResultsResponse(
        `${barber.name} trabalha bem com estes servicos — escolha o que faz sentido para voce hoje.`,
        relatedServices.length > 0 ? relatedServices.map(serviceToSearchResult) : [barberToSearchResult(barber)],
        "context"
      )
    }

    if (contextServices.length > 0 && matchesContextualFollowUpIntent(message)) {
      const service = contextServices[0]
      const barbersForService = findBarbersForService(service, new Set(), 3)

      return buildBookingResultsResponse(
        `Para ${service.name}, estes profissionais costumam ser boas referencias na casa.`,
        barbersForService.length > 0
          ? barbersForService.map(barberToSearchResult)
          : barbers.slice(0, 3).map(barberToSearchResult),
        "context"
      )
    }

    const matchedService = findServiceFromMessage(message)
    if (matchedService) {
      const barbersForService = findBarbersForService(matchedService, new Set(), 2)
      const items: AppointmentSearchResult[] = [serviceToSearchResult(matchedService), ...barbersForService.map(barberToSearchResult)]

      return buildBookingResultsResponse(
        `${matchedService.name} e um caminho comum por aqui — veja servico e quem costuma fazer.`,
        items.slice(0, 3),
        "service"
      )
    }

    const specialtyMessage = styleHints.length > 0 ? styleHints.join(" ") : message
    const matchedBarbers = findBarbersBySpecialty(specialtyMessage, 3)
    if (matchedBarbers.length > 0) {
      return buildBookingResultsResponse(
        "Encontrei profissionais que combinam com isso — veja quem faz sentido para voce.",
        matchedBarbers.map(barberToSearchResult),
        "barber"
      )
    }

    if (matchesRecommendationIntent(message)) {
      const popularServices = barberServices.filter((service) => service.popular).slice(0, 2).map(serviceToSearchResult)
      const topBarbers = barbers.filter((barber) => barber.rating >= 4.8).slice(0, 2).map(barberToSearchResult)

      return buildBookingResultsResponse(
        "Posso te mostrar caminhos leves para comecar — servicos populares e quem costuma atender bem por aqui.",
        [...popularServices, ...topBarbers].slice(0, 3),
        "recommendation"
      )
    }

    return null
  }
}

export const appointmentMockConversationResolver = createAppointmentMockConversationResolver()
