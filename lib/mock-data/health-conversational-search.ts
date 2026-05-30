import type { HealthProfessional, HealthService } from "@/lib/business-types"
import { healthProfessionals, healthServices } from "@/lib/mock-data/health-data"
import type {
  ConversationResponseResolver,
  ConversationResponseResolverResult,
  ConversationVisualBlock,
} from "@/lib/mock-data/conversational-search"
import { normalizeSurfaceFlowText } from "@/lib/surface-flow/product-entity"

export const HEALTH_CARE_RESULTS_KIND = "health-care-results"
export const HEALTH_SCHEDULE_PROMPT_KIND = "health-schedule-prompt"

const PROFESSIONAL_CONTEXT_PREFIX = "health-professional-"
const SPECIALTY_CONTEXT_PREFIX = "health-specialty-"

const SPECIALTY_SLUG_MAP: Record<string, string> = {
  "1": "Clinica Geral",
  "2": "Cardiologia",
  "3": "Ortopedia",
  "4": "Pediatria",
}

export interface HealthSearchResult {
  id: string
  kind: "professional" | "service"
  title: string
  image: string
  subtitle?: string
  price?: number
  ctaLabel?: string
}

export interface HealthCareResultsPayload {
  items: HealthSearchResult[]
  intent: "specialty" | "service" | "recommendation" | "context"
}

export interface HealthSchedulePromptPayload {
  professionalId?: string
  professionalName?: string
}

const SPECIALTY_KEYWORDS: Record<string, string[]> = {
  Dermatologia: ["dermatolog", "pele", "acne", "estetica facial"],
  Nutricao: ["nutricion", "nutricao", "alimentacao", "dieta", "emagrec"],
  Psicologia: ["psicolog", "terapia", "bem estar mental", "estresse"],
  Cardiologia: ["cardiolog", "coracao", "pressao alta"],
  "Clinica Geral": ["clinico", "clinica geral", "generalista", "medico de familia"],
}

const SERVICE_KEYWORDS: Record<string, string[]> = {
  "serv-6": ["limpeza de pele", "limpeza facial", "peeling"],
  "serv-7": ["botox", "harmonizacao", "preenchimento", "estetica"],
  "serv-1": ["consulta clinica", "consulta geral"],
  "serv-2": ["consulta cardio", "cardiologica"],
  "serv-3": ["consulta dermato", "dermatologica"],
  "serv-4": ["check up", "checkup", "check-up"],
  "serv-5": ["telemedicina", "consulta online", "video consulta"],
}

const RECOMMENDATION_CUES: Record<string, string[]> = {
  Dermatologia: ["melhorar minha pele", "cuidar da pele", "pele mais bonita", "manchas na pele"],
  Nutricao: ["cuidar da alimentacao", "comer melhor", "habitos alimentares", "plano alimentar"],
  Psicologia: ["cuidar da mente", "ansiedade", "equilibrio emocional", "conversar com alguem"],
  Cardiologia: ["cuidar do coracao", "saude do coracao"],
}

function normalizeText(value: string) {
  return normalizeSurfaceFlowText(value)
}

function professionalToSearchResult(prof: HealthProfessional): HealthSearchResult {
  return {
    id: prof.id,
    kind: "professional",
    title: prof.name,
    image: prof.avatar,
    subtitle: prof.specialty,
    price: prof.consultationPrice,
    ctaLabel: "Agendar",
  }
}

function serviceToSearchResult(service: HealthService): HealthSearchResult {
  return {
    id: service.id,
    kind: "service",
    title: service.name,
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=100&h=100&fit=crop",
    subtitle: service.professional ?? service.description,
    price: service.price,
    ctaLabel: "Ver detalhes",
  }
}

function getContextProfessionals(contextItems: { id: string }[]) {
  const ids = new Set(
    contextItems
      .map((item) =>
        item.id.startsWith(PROFESSIONAL_CONTEXT_PREFIX)
          ? item.id.slice(PROFESSIONAL_CONTEXT_PREFIX.length)
          : null
      )
      .filter(Boolean) as string[]
  )

  return healthProfessionals.filter((prof) => ids.has(prof.id))
}

function getContextSpecialties(contextItems: { id: string }[]) {
  return contextItems
    .map((item) => {
      if (!item.id.startsWith(SPECIALTY_CONTEXT_PREFIX)) return null
      const slug = item.id.slice(SPECIALTY_CONTEXT_PREFIX.length)
      return SPECIALTY_SLUG_MAP[slug] ?? null
    })
    .filter(Boolean) as string[]
}

function buildCareResultsResponse(
  text: string,
  items: HealthSearchResult[],
  intent: HealthCareResultsPayload["intent"]
): ConversationResponseResolverResult | null {
  if (items.length === 0) return null

  return {
    text,
    visualBlock: {
      kind: HEALTH_CARE_RESULTS_KIND,
      payload: {
        items: items.slice(0, 3),
        intent,
      } satisfies HealthCareResultsPayload,
    },
  }
}

function buildSchedulePromptResponse(
  text: string,
  payload: HealthSchedulePromptPayload
): ConversationResponseResolverResult {
  return {
    text,
    visualBlock: {
      kind: HEALTH_SCHEDULE_PROMPT_KIND,
      payload: payload satisfies HealthSchedulePromptPayload,
    },
  }
}

function matchesScheduleIntent(message: string) {
  const normalized = normalizeText(message)
  const cues = [
    "agendar",
    "marcar consulta",
    "marcar horario",
    "horario disponivel",
    "quero consulta",
    "reservar consulta",
  ]
  return cues.some((cue) => normalized.includes(cue))
}

function matchesContextualFollowUpIntent(message: string) {
  const normalized = normalizeText(message)
  const cues = [
    "atende o que",
    "o que atende",
    "quais servicos",
    "combina com qual",
    "qual servico",
    "esse profissional",
    "ela atende",
    "ele atende",
  ]
  return cues.some((cue) => normalized.includes(cue))
}

function resolveSpecialtyFromMessage(message: string) {
  const normalized = normalizeText(message)

  for (const [specialty, keywords] of Object.entries(SPECIALTY_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return specialty
    }
  }

  return null
}

function resolveRecommendationSpecialty(message: string) {
  const normalized = normalizeText(message)

  for (const [specialty, cues] of Object.entries(RECOMMENDATION_CUES)) {
    if (cues.some((cue) => normalized.includes(normalizeText(cue)))) {
      return specialty
    }
  }

  const guidedCues = ["quero", "preciso", "me ajuda", "nao sei", "indica", "recomenda", "sugere"]
  if (guidedCues.some((cue) => normalized.includes(cue))) {
    return resolveSpecialtyFromMessage(message)
  }

  return null
}

function findServiceFromMessage(message: string) {
  const normalized = normalizeText(message)

  for (const [serviceId, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return healthServices.find((service) => service.id === serviceId) ?? null
    }
  }

  if (normalized.includes("consulta")) {
    return healthServices.find((service) => service.id === "serv-1") ?? null
  }

  return (
    healthServices.find((service) => {
      const serviceName = normalizeText(service.name)
      return normalized.includes(serviceName) || serviceName.split(" ").some((word) => word.length > 4 && normalized.includes(word))
    }) ?? null
  )
}

function findProfessionalsBySpecialty(specialty: string, limit = 3) {
  return healthProfessionals
    .filter((prof) => normalizeText(prof.specialty).includes(normalizeText(specialty)) || normalizeText(specialty).includes(normalizeText(prof.specialty)))
    .slice(0, limit)
}

function namesMatch(left: string, right: string) {
  const a = normalizeText(left)
  const b = normalizeText(right)
  return a === b || a.includes(b) || b.includes(a)
}

function getRelatedServicesForProfessional(prof: HealthProfessional, limit = 3) {
  const specialty = normalizeText(prof.specialty)

  return healthServices
    .filter((service) => {
      if (service.professional && namesMatch(service.professional, prof.name)) {
        return true
      }

      if (service.category && namesMatch(service.category, prof.specialty)) {
        return true
      }

      const serviceName = normalizeText(service.name)
      return serviceName.includes(specialty) || specialty.split(" ").some((word) => word.length > 4 && serviceName.includes(word))
    })
    .slice(0, limit)
}

export function createHealthMockConversationResolver(): ConversationResponseResolver {
  return ({ message, contextItems }) => {
    const contextProfessionals = getContextProfessionals(contextItems)
    const contextSpecialties = getContextSpecialties(contextItems)

    if (matchesScheduleIntent(message)) {
      if (contextProfessionals.length === 1) {
        const prof = contextProfessionals[0]
        return buildSchedulePromptResponse(
          `Posso te ajudar a escolher um horario com ${prof.name} — em uma consulta voces conversam sobre o que faz sentido para voce.`,
          {
            professionalId: prof.id,
            professionalName: prof.name,
          }
        )
      }

      const specialty = resolveSpecialtyFromMessage(message) ?? contextSpecialties[0] ?? null
      const professionals = specialty
        ? findProfessionalsBySpecialty(specialty, 3)
        : healthProfessionals.slice(0, 3)

      return buildCareResultsResponse(
        "Separei profissionais com agenda aberta — toque em Agendar para escolher data e horario.",
        professionals.map(professionalToSearchResult),
        "recommendation"
      )
    }

    if (contextProfessionals.length > 0 && matchesContextualFollowUpIntent(message)) {
      const prof = contextProfessionals[0]
      const relatedServices = getRelatedServicesForProfessional(prof, 3)

      return buildCareResultsResponse(
        `${prof.name} atende em ${prof.specialty}. Estes servicos combinam bem para conversar em consulta — sem substituir uma avaliacao presencial.`,
        relatedServices.length > 0
          ? relatedServices.map(serviceToSearchResult)
          : [professionalToSearchResult(prof)],
        "context"
      )
    }

    const matchedService = findServiceFromMessage(message)
    if (matchedService) {
      const linkedProfessional = matchedService.professional
        ? healthProfessionals.find((prof) => prof.name === matchedService.professional)
        : null

      const items: HealthSearchResult[] = [serviceToSearchResult(matchedService)]
      if (linkedProfessional) {
        items.push(professionalToSearchResult(linkedProfessional))
      }

      return buildCareResultsResponse(
        `${matchedService.name} e um servico que conversamos com calma em consulta — veja as opcoes abaixo.`,
        items,
        "service"
      )
    }

    const specialtyFromMessage = resolveSpecialtyFromMessage(message)
    const specialties = [...new Set([...contextSpecialties, ...(specialtyFromMessage ? [specialtyFromMessage] : [])])]

    if (specialties.length > 0) {
      const specialty = specialties[0]
      const professionals = findProfessionalsBySpecialty(specialty, 3)

      return buildCareResultsResponse(
        `Encontrei profissionais em ${specialty} — uma consulta e o melhor caminho para tirar duvidas com calma.`,
        professionals.map(professionalToSearchResult),
        "specialty"
      )
    }

    const recommendationSpecialty = resolveRecommendationSpecialty(message)
    if (recommendationSpecialty) {
      const professionals = findProfessionalsBySpecialty(recommendationSpecialty, 3)
      const services = healthServices
        .filter((service) => {
          const specialty = normalizeText(recommendationSpecialty)
          const serviceName = normalizeText(service.name)
          return serviceName.includes(specialty.split(" ")[0]) || specialty.includes(serviceName.split(" ")[0])
        })
        .slice(0, 2)
        .map(serviceToSearchResult)

      const items = [
        ...professionals.map(professionalToSearchResult),
        ...services,
      ].slice(0, 3)

      return buildCareResultsResponse(
        "Posso te mostrar caminhos para conversar com a equipe — sem triagem ou diagnostico por aqui.",
        items,
        "recommendation"
      )
    }

    return null
  }
}

export const healthMockConversationResolver = createHealthMockConversationResolver()

