import type { BusinessConfig, BusinessModel } from "@/lib/business-types"
import type {
  BusinessPost,
  BusinessSection,
  BusinessStory,
} from "@/components/business/business-social-landing"
import type {
  BusinessRuntime,
  BusinessRuntimeService,
  BusinessRuntimeVertical,
} from "../core"

export interface BusinessRuntimeSocialLandingProjection {
  config: BusinessConfig
  stories: BusinessStory[]
  sections: BusinessSection[]
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop"

type BusinessRuntimePolicyKey = keyof Pick<
  BusinessRuntime["policies"],
  "booking" | "cancellation" | "payment" | "delivery" | "privacy"
>

const POLICY_TITLES: Record<BusinessRuntimePolicyKey, string> = {
  booking: "Atendimento",
  cancellation: "Alterações",
  payment: "Pagamento",
  delivery: "Entrega",
  privacy: "Privacidade",
}

interface VerticalLandingCopy {
  ctaTitle: string
  ctaDescription: string
  serviceTitle: string
  serviceFallback: string
  proofTitle: string
  contextTitle: string
  faqTitle: string
}

const VERTICAL_COPY: Record<BusinessRuntimeVertical, VerticalLandingCopy> = {
  appointment: {
    ctaTitle: "Agendar horário",
    ctaDescription: "Escolha um serviço, tire dúvidas e combine o melhor horário pelo canal da marca.",
    serviceTitle: "Serviços para agendar",
    serviceFallback: "Atendimento com orientação clara para escolher o serviço certo.",
    proofTitle: "Por que agendar aqui",
    contextTitle: "Antes de ir",
    faqTitle: "Dúvidas antes de agendar",
  },
  beauty: {
    ctaTitle: "Reservar meu cuidado",
    ctaDescription: "Veja os serviços, entenda o estilo da marca e fale pelo canal mais rápido.",
    serviceTitle: "Cuidados e serviços",
    serviceFallback: "Cuidado pessoal com escuta, acabamento e orientação para a rotina.",
    proofTitle: "Diferenciais do studio",
    contextTitle: "Como funciona o atendimento",
    faqTitle: "Dúvidas sobre o cuidado",
  },
  restaurant: {
    ctaTitle: "Pedir ou reservar",
    ctaDescription: "Confira os pratos, horários e canais para pedir, reservar ou falar com a casa.",
    serviceTitle: "Cardápio em destaque",
    serviceFallback: "Pratos e experiências pensados para comer bem sem complicação.",
    proofTitle: "Por que vale conhecer",
    contextTitle: "Funcionamento da casa",
    faqTitle: "Dúvidas sobre pedidos",
  },
  clinic: {
    ctaTitle: "Falar com a clínica",
    ctaDescription: "Entenda especialidades, horários e canais antes de marcar seu atendimento.",
    serviceTitle: "Atendimentos disponíveis",
    serviceFallback: "Atendimento profissional com clareza, acolhimento e orientação.",
    proofTitle: "Confiança e cuidado",
    contextTitle: "Informações para o atendimento",
    faqTitle: "Dúvidas frequentes",
  },
  barber: {
    ctaTitle: "Marcar meu corte",
    ctaDescription: "Escolha o serviço, veja a equipe e fale pelo canal mais rápido.",
    serviceTitle: "Cortes e serviços",
    serviceFallback: "Serviços de barbearia com estilo, precisão e atendimento direto.",
    proofTitle: "Diferenciais da barbearia",
    contextTitle: "Antes de chegar",
    faqTitle: "Dúvidas sobre o atendimento",
  },
  gym: {
    ctaTitle: "Conhecer planos",
    ctaDescription: "Veja modalidades, horários e canais para começar com acompanhamento.",
    serviceTitle: "Planos e modalidades",
    serviceFallback: "Rotina de treino com energia, clareza e acompanhamento.",
    proofTitle: "Por que treinar aqui",
    contextTitle: "Como funciona",
    faqTitle: "Dúvidas sobre treinos",
  },
  generic: {
    ctaTitle: "Falar com a marca",
    ctaDescription: "Entenda a proposta, veja os canais e converse para dar o próximo passo.",
    serviceTitle: "O que oferecemos",
    serviceFallback: "Uma proposta clara para entender a marca e agir sem fricção.",
    proofTitle: "Diferenciais",
    contextTitle: "Informações úteis",
    faqTitle: "Dúvidas frequentes",
  },
}

function projectVerticalToBusinessModel(vertical: BusinessRuntimeVertical): BusinessModel {
  switch (vertical) {
    case "restaurant":
      return "restaurant"
    case "clinic":
      return "health"
    case "gym":
      return "gym"
    case "beauty":
    case "barber":
    case "appointment":
      return "appointment"
    case "generic":
      return "institutional"
  }
}

function toStoryImage(runtime: BusinessRuntime, image?: string) {
  return image || runtime.brand.logo || runtime.brand.coverImage || FALLBACK_IMAGE
}

function toPostImage(runtime: BusinessRuntime, image?: string) {
  return image || runtime.brand.coverImage || runtime.brand.logo || FALLBACK_IMAGE
}

function formatWeeklyHours(runtime: BusinessRuntime) {
  if (runtime.hours.summary) {
    return runtime.hours.summary
  }

  if (!runtime.hours.weekly || runtime.hours.weekly.length === 0) {
    return undefined
  }

  return runtime.hours.weekly
    .map((day) => {
      const intervals = day.intervals.map((interval) => `${interval.opens}-${interval.closes}`).join(", ")
      return `${day.day}: ${intervals}`
    })
    .join(" | ")
}

function formatAddress(runtime: BusinessRuntime) {
  return [runtime.location.address, runtime.location.label].filter(Boolean).join(" - ") || undefined
}

function projectServiceToPost(runtime: BusinessRuntime, service: BusinessRuntimeService): BusinessPost {
  const detail = [
    service.description,
    service.durationMinutes ? `${service.durationMinutes} min` : undefined,
    service.category,
    service.tags?.length ? service.tags.join(", ") : undefined,
  ].filter(Boolean).join(" · ")

  return {
    id: service.id,
    type: "product",
    title: service.name,
    description: detail || VERTICAL_COPY[runtime.vertical].serviceFallback,
    image: toPostImage(runtime, service.image),
    price: service.price,
  }
}

function buildPrimaryActionPost(runtime: BusinessRuntime): BusinessPost {
  const copy = VERTICAL_COPY[runtime.vertical]
  const channel = runtime.channels.whatsapp
    ? "WhatsApp disponível"
    : runtime.channels.phone
      ? `Telefone: ${runtime.channels.phone}`
      : runtime.channels.instagram
        ? `Instagram: ${runtime.channels.instagram}`
        : runtime.channels.website
          ? `Site: ${runtime.channels.website}`
          : "Canal de contato disponível na página"
  const hours = formatWeeklyHours(runtime)

  return {
    id: "primary-action",
    type: "social",
    title: copy.ctaTitle,
    description: [copy.ctaDescription, channel, hours].filter(Boolean).join(" · "),
    image: toPostImage(runtime),
  }
}

function buildBrandNarrativePosts(runtime: BusinessRuntime): BusinessPost[] {
  const brand = runtime.brand
  const description = [
    brand.valueProposition || brand.description || runtime.business.description,
    brand.positioning,
    brand.personality ? `Personalidade: ${brand.personality}` : undefined,
    brand.toneOfVoice ? `Tom: ${brand.toneOfVoice}` : undefined,
    brand.targetAudience ? `Para: ${brand.targetAudience}` : undefined,
  ].filter(Boolean).join(" · ")

  const posts: BusinessPost[] = [
    {
      id: "brand-narrative",
      type: "social",
      title: brand.positioning || brand.valueProposition || brand.description || runtime.business.name,
      description: description || VERTICAL_COPY[runtime.vertical].serviceFallback,
      image: toPostImage(runtime),
    },
  ]

  if (brand.keywords?.length || brand.visualIdentity?.style || brand.suggestedColors?.primary) {
    posts.push({
      id: "brand-bundle",
      type: "news",
      title: "Sinais da marca",
      description: [
        brand.visualIdentity?.style ? `Estilo ${brand.visualIdentity.style}` : undefined,
        brand.suggestedColors?.primary ? `Cor principal ${brand.suggestedColors.primary}` : undefined,
        brand.keywords?.length ? brand.keywords.join(", ") : undefined,
      ].filter(Boolean).join(" · "),
      image: toPostImage(runtime),
    })
  }

  return posts
}

function buildStories(runtime: BusinessRuntime): BusinessStory[] {
  const storyHighlights = runtime.knowledge.highlights
    .filter((highlight) => highlight.kind === "story")
    .slice(0, 5)
    .map((highlight, index) => ({
      id: highlight.id,
      name: highlight.title,
      image: toStoryImage(runtime, highlight.image),
      isMain: index === 0,
    }))

  if (storyHighlights.length > 0) {
    return storyHighlights
  }

  const serviceStories = runtime.services.slice(0, 4).map((service, index) => ({
    id: `service-story-${service.id}`,
    name: service.name,
    image: toStoryImage(runtime, service.image),
    isMain: index === 0,
  }))

  return [
    {
      id: "main-story",
      name: "Início",
      image: toStoryImage(runtime),
      isMain: true,
    },
    ...serviceStories,
  ].slice(0, 5)
}

function buildKnowledgePosts(runtime: BusinessRuntime): BusinessPost[] {
  return runtime.knowledge.highlights
    .filter((highlight) => highlight.kind !== "story")
    .slice(0, 8)
    .map((highlight) => ({
      id: highlight.id,
      type: highlight.kind === "news" ? "news" : highlight.kind === "proof" ? "review" : "social",
      title: highlight.title,
      description: highlight.body,
      image: toPostImage(runtime, highlight.image),
    }))
}

function buildTeamPosts(runtime: BusinessRuntime): BusinessPost[] {
  return runtime.team.slice(0, 6).map((member) => ({
    id: `team-${member.id}`,
    type: "social",
    title: `${member.name} · ${member.role}`,
    description: [
      member.bio,
      member.specialties?.join(", "),
      member.rating ? `Avaliação ${member.rating}${member.reviewCount ? ` (${member.reviewCount})` : ""}` : undefined,
      member.availabilitySummary,
    ].filter(Boolean).join(" · "),
    image: toPostImage(runtime, member.avatar),
  }))
}

function buildPolicyPosts(runtime: BusinessRuntime): BusinessPost[] {
  const standardPolicies = (Object.keys(POLICY_TITLES) as BusinessRuntimePolicyKey[])
    .flatMap((key) => {
      const body = runtime.policies[key]
      return body
        ? [{
            id: `policy-${key}`,
            type: "news" as const,
            title: POLICY_TITLES[key],
            description: body,
            image: toPostImage(runtime),
          }]
        : []
    })

  const customPolicies = runtime.policies.custom?.map((policy) => ({
    id: `policy-${policy.id}`,
    type: "news" as const,
    title: policy.title,
    description: policy.body,
    image: toPostImage(runtime),
  })) ?? []

  return [...standardPolicies, ...customPolicies]
}

function buildFaqPosts(runtime: BusinessRuntime): BusinessPost[] {
  return runtime.knowledge.faq?.slice(0, 6).map((item) => ({
    id: `faq-${item.id}`,
    type: "news",
    title: item.question,
    description: item.answer,
    image: toPostImage(runtime),
  })) ?? []
}

function buildContextPosts(runtime: BusinessRuntime): BusinessPost[] {
  const posts: BusinessPost[] = []

  const hours = formatWeeklyHours(runtime)
  if (hours) {
    posts.push({
      id: "hours-context",
      type: "news",
      title: "Horários",
      description: hours,
      image: toPostImage(runtime),
    })
  }

  const locationHints = [
    runtime.location.placeHint,
    runtime.location.referenceHint,
    runtime.location.routeHint,
    runtime.location.parkingHint,
    runtime.location.arrivalMood,
    runtime.location.mapsQuery,
  ].filter(Boolean)

  if (locationHints.length > 0) {
    posts.push({
      id: "location-context",
      type: "news",
      title: "Localização",
      description: locationHints.join(" · "),
      image: toPostImage(runtime),
    })
  }

  const channels = [
    runtime.channels.whatsapp ? `WhatsApp: ${runtime.channels.whatsapp}` : undefined,
    runtime.channels.instagram ? `Instagram: ${runtime.channels.instagram}` : undefined,
    runtime.channels.email ? `Email: ${runtime.channels.email}` : undefined,
    runtime.channels.phone ? `Telefone: ${runtime.channels.phone}` : undefined,
    runtime.channels.website ? `Site: ${runtime.channels.website}` : undefined,
  ].filter(Boolean)

  if (channels.length > 0) {
    posts.push({
      id: "channels-context",
      type: "social",
      title: "Canais",
      description: channels.join(" · "),
      image: toPostImage(runtime),
    })
  }

  return posts
}

function pushSection(sections: BusinessSection[], id: string, title: string, posts: BusinessPost[]) {
  if (posts.length === 0) {
    return
  }

  sections.push({
    id,
    title,
    type: "content",
    posts,
  })
}

function buildServicePosts(runtime: BusinessRuntime): BusinessPost[] {
  if (runtime.services.length > 0) {
    return runtime.services.slice(0, 8).map((service) => projectServiceToPost(runtime, service))
  }

  return [
    {
      id: "service-fallback",
      type: "social",
      title: VERTICAL_COPY[runtime.vertical].serviceTitle,
      description: VERTICAL_COPY[runtime.vertical].serviceFallback,
      image: toPostImage(runtime),
    },
  ]
}

export function projectBusinessRuntimeToSocialLanding(
  runtime: BusinessRuntime
): BusinessRuntimeSocialLandingProjection {
  const config: BusinessConfig = {
    model: projectVerticalToBusinessModel(runtime.vertical),
    name: runtime.brand.name || runtime.business.name,
    logo: runtime.brand.logo || FALLBACK_IMAGE,
    coverImage: runtime.brand.coverImage || runtime.brand.logo || FALLBACK_IMAGE,
    description: runtime.brand.description || runtime.business.description || "",
    primaryColor: runtime.brand.primaryColor,
    whatsapp: runtime.channels.whatsapp,
    instagram: runtime.channels.instagram,
    address: formatAddress(runtime),
    openingHours: formatWeeklyHours(runtime),
  }

  const sections: BusinessSection[] = []
  const copy = VERTICAL_COPY[runtime.vertical]

  pushSection(
    sections,
    "primary-action",
    copy.ctaTitle,
    [buildPrimaryActionPost(runtime)]
  )
  pushSection(sections, "brand", "Proposta da marca", buildBrandNarrativePosts(runtime))
  pushSection(sections, "services", copy.serviceTitle, buildServicePosts(runtime))
  pushSection(sections, "knowledge", copy.proofTitle, buildKnowledgePosts(runtime))
  pushSection(sections, "team", runtime.vertical === "restaurant" ? "Quem prepara" : "Equipe", buildTeamPosts(runtime))
  pushSection(sections, "context", copy.contextTitle, buildContextPosts(runtime))
  pushSection(sections, "policies", "Políticas", buildPolicyPosts(runtime))
  pushSection(sections, "faq", copy.faqTitle, buildFaqPosts(runtime))

  if (sections.length === 0) {
    sections.push({
      id: "about",
      title: "Sobre",
      type: "content",
      posts: [
        {
          id: "about-post",
          type: "social",
          title: runtime.business.name,
          description: runtime.business.description || runtime.brand.description,
          image: toPostImage(runtime),
        },
      ],
    })
  }

  return {
    config,
    stories: buildStories(runtime),
    sections,
  }
}
