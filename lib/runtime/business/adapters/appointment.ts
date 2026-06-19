import type { AppointmentRuntimeBundle } from "@/lib/runtime/appointment"
import { BUSINESS_RUNTIME_VERSION, type BusinessRuntime } from "../core"

function summarizeAvailability(bundle: AppointmentRuntimeBundle, professionalId: string) {
  const professional = bundle.professionals.find((item) => item.id === professionalId)
  const availableDays = professional?.availability.filter((day) =>
    day.slots.some((slot) => slot.available)
  )

  if (!availableDays || availableDays.length === 0) {
    return undefined
  }

  return `${availableDays.length} dia(s) com disponibilidade no runtime de origem`
}

export function projectAppointmentRuntimeToBusinessRuntime(
  bundle: AppointmentRuntimeBundle
): BusinessRuntime {
  const establishment = bundle.establishment
  const brand = establishment.brand
  const updatedAt = bundle.meta.updatedAt
  const publicationState = bundle.meta.publication?.publicationState

  return {
    version: BUSINESS_RUNTIME_VERSION,
    vertical: "appointment",
    slug: establishment.slug || bundle.meta.slug,
    status: publicationState === "draft" ? "draft" : "published",
    business: {
      id: establishment.id,
      name: establishment.name,
      description: brand.description,
      category: establishment.model,
      currentState: bundle.operational.liveState,
    },
    brand: {
      name: establishment.name,
      description: brand.description,
      logo: brand.logo,
      coverImage: brand.coverImage,
      primaryColor: brand.primaryColor,
      positioning: bundle.operational.placeHint,
      visualIdentity: {
        style: "social-native",
        accent: brand.primaryColor,
      },
    },
    services: bundle.services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      durationMinutes: service.duration,
      image: service.image,
      tags: service.popular ? ["popular"] : [],
    })),
    team: bundle.professionals.map((professional) => ({
      id: professional.id,
      name: professional.name,
      role: professional.role,
      avatar: professional.avatar,
      rating: professional.rating,
      reviewCount: professional.reviewCount,
      specialties: [...professional.specialties],
      availabilitySummary: summarizeAvailability(bundle, professional.id),
    })),
    hours: {
      summary: establishment.hours ?? bundle.operational.hoursHint,
    },
    location: {
      label: bundle.operational.placeHint,
      address: establishment.contact.address ?? bundle.arrival.addressLine,
      placeHint: bundle.operational.placeHint,
      mapsQuery: bundle.arrival.mapsQuery,
      referenceHint: bundle.arrival.referenceHint,
      routeHint: bundle.arrival.routeHint,
      parkingHint: bundle.arrival.parkingHint,
      arrivalMood: bundle.arrival.arrivalMood,
    },
    channels: {
      whatsapp: establishment.contact.whatsapp,
      instagram: establishment.contact.instagram,
      email: establishment.contact.email,
    },
    policies: {},
    knowledge: {
      summary: bundle.operational.momentHint ?? brand.description,
      highlights: [
        ...bundle.feed.stories.map((story) => ({
          id: story.id,
          title: story.label,
          image: story.image,
          kind: "story" as const,
          metadata: story.isPrimary === undefined ? undefined : { isPrimary: story.isPrimary },
        })),
        ...bundle.styles.map((style) => ({
          id: style.id,
          title: style.name,
          body: style.tags.join(", "),
          image: style.image,
          kind: "gallery" as const,
          metadata: {
            category: style.category,
          },
        })),
        ...bundle.feed.sections.flatMap((section) =>
          section.items.map((item) => ({
            id: item.id,
            title: item.title,
            body: item.description,
            image: item.image,
            kind:
              item.kind === "news"
                ? ("news" as const)
                : item.kind === "review"
                  ? ("proof" as const)
                  : ("post" as const),
            metadata: item.metadata,
          }))
        ),
      ],
      faq: [
        {
          id: "hours",
          question: "Quais são os horários?",
          answer: establishment.hours ?? "Horários disponíveis no atendimento do negócio.",
        },
        {
          id: "location",
          question: "Onde fica?",
          answer: bundle.arrival.addressLine,
        },
      ],
      sourceNotes: ["projected-from-appointment-runtime"],
    },
    meta: {
      source: "adapter",
      updatedAt,
      mappingNotes: [
        {
          sourcePath: "professionals.rating/reviewCount/availability",
          decision: "map-now",
          reason: "rating/reviewCount and an availability summary are generic team attributes.",
        },
        {
          sourcePath: "styles",
          decision: "map-now",
          reason: "style catalog items become generic gallery highlights.",
        },
        {
          sourcePath: "arrival",
          decision: "map-now",
          reason: "arrival hints map to generic location hints.",
        },
        {
          sourcePath: "operational.liveState",
          decision: "map-now",
          reason: "current state maps to the generic business.currentState field.",
        },
        {
          sourcePath: "feed.metadata",
          decision: "map-now",
          reason: "feed metadata is preserved on generic knowledge highlights.",
        },
        {
          sourcePath: "meta.external",
          decision: "preserve-in-meta",
          reason: "external provider data should not become core fields yet.",
        },
        {
          sourcePath: "meta.publication",
          decision: "preserve-in-meta",
          reason: "publication details are not part of BusinessRuntime v1 status beyond draft/published/archived.",
        },
      ],
      preservedSourceData: {
        external: bundle.meta.external,
        publication: bundle.meta.publication,
      },
    },
  }
}
