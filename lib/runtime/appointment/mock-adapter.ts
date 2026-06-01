import { appointmentContent } from "@/lib/mock-data/business-content"
import {
  barberShopArrivalContext,
  barberShopConfig,
  barberShopHeroOperationalContext,
  barbers,
  barberServices,
  hairStyles,
} from "@/lib/mock-data/appointment-data"
import type { BusinessPost } from "@/components/business/business-social-landing"
import type {
  AppointmentRuntimeBundle,
  AppointmentRuntimeSource,
  RuntimeFeedItem,
  RuntimeFeedSection,
  RuntimeProfessional,
  RuntimeService,
  RuntimeStyleCatalogItem,
} from "./types"
import { APPOINTMENT_PILOT_SLUG, APPOINTMENT_RUNTIME_VERSION } from "./types"

export interface BuildAppointmentRuntimeBundleOptions {
  slug?: string
  source?: AppointmentRuntimeSource
  updatedAt?: string
}

function slugifyName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function mapProfessional(professional: (typeof barbers)[number]): RuntimeProfessional {
  return {
    id: professional.id,
    name: professional.name,
    avatar: professional.avatar,
    role: professional.role,
    rating: professional.rating,
    reviewCount: professional.reviewCount,
    specialties: [...professional.specialties],
    availability: professional.availability.map((day) => ({
      date: day.date,
      slots: day.slots.map((slot) => ({
        time: slot.time,
        available: slot.available,
      })),
    })),
  }
}

function mapService(service: (typeof barberServices)[number]): RuntimeService {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    duration: service.duration,
    price: service.price,
    image: service.image,
    category: service.category,
    popular: service.popular,
  }
}

function mapStyle(style: (typeof hairStyles)[number]): RuntimeStyleCatalogItem {
  return {
    id: style.id,
    name: style.name,
    image: style.image,
    category: style.category,
    tags: [...style.tags],
  }
}

function mapFeedItem(post: BusinessPost): RuntimeFeedItem {
  return {
    id: post.id,
    kind: post.type,
    title: post.title,
    image: post.image ?? "",
    description: post.description,
    metadata: {
      duration: post.duration,
      views: post.views,
      price: post.price,
      originalPrice: post.originalPrice,
      rating: post.rating,
      reviewerName: post.reviewerName,
      reviewerAvatar: post.reviewerAvatar,
      source: post.source,
      date: post.date,
    },
  }
}

function buildFeedSections(): RuntimeFeedSection[] {
  return [
    { id: "videos", items: appointmentContent.videos.map(mapFeedItem) },
    { id: "reviews", items: appointmentContent.reviews.map(mapFeedItem) },
    { id: "news", items: appointmentContent.news.map(mapFeedItem) },
    { id: "social", items: appointmentContent.social.map(mapFeedItem) },
  ]
}

export function buildAppointmentRuntimeBundleFromMock(
  options: BuildAppointmentRuntimeBundleOptions = {}
): AppointmentRuntimeBundle {
  const slug = options.slug ?? APPOINTMENT_PILOT_SLUG

  return {
    version: APPOINTMENT_RUNTIME_VERSION,
    establishment: {
      id: `establishment-${slug}`,
      slug,
      model: "appointment",
      name: barberShopConfig.name,
      brand: {
        logo: barberShopConfig.logo,
        coverImage: barberShopConfig.coverImage,
        primaryColor: barberShopConfig.primaryColor,
        description: barberShopConfig.description,
      },
      contact: {
        whatsapp: barberShopConfig.whatsapp,
        instagram: barberShopConfig.instagram,
        address: barberShopConfig.address,
      },
      hours: barberShopConfig.openingHours,
    },
    operational: {
      liveState: barberShopHeroOperationalContext.liveState,
      placeHint: barberShopHeroOperationalContext.placeHint,
      momentHint: barberShopHeroOperationalContext.momentHint,
      hoursHint: barberShopHeroOperationalContext.hoursHint,
    },
    arrival: {
      drawerTitle: barberShopArrivalContext.drawerTitle,
      addressLine: barberShopArrivalContext.addressLine,
      referenceHint: barberShopArrivalContext.referenceHint,
      routeHint: barberShopArrivalContext.routeHint,
      parkingHint: barberShopArrivalContext.parkingHint,
      arrivalMood: barberShopArrivalContext.arrivalMood,
      mapsQuery: barberShopArrivalContext.mapsQuery,
    },
    professionals: barbers.map(mapProfessional),
    services: barberServices.map(mapService),
    styles: hairStyles.map(mapStyle),
    feed: {
      stories: appointmentContent.stories.map((story) => ({
        id: story.id,
        label: story.name,
        image: story.image,
        isPrimary: story.isMain,
      })),
      sections: buildFeedSections(),
    },
    meta: {
      source: options.source ?? "mock-fallback",
      slug,
      updatedAt: options.updatedAt ?? new Date(0).toISOString(),
    },
  }
}

export function resolveAppointmentPilotSlugFromName(name: string) {
  return slugifyName(name)
}

/** Stable seed bundle for runtime-mode smoke in Etapa 2. */
export function buildAppointmentRuntimeSeedBundle(
  options: Omit<BuildAppointmentRuntimeBundleOptions, "source"> = {}
): AppointmentRuntimeBundle {
  return buildAppointmentRuntimeBundleFromMock({
    ...options,
    source: "runtime",
    updatedAt: "2026-06-01T00:00:00.000Z",
  })
}
