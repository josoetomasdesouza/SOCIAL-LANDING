import type { BusinessConfig, Professional, Service, StyleExample } from "@/lib/business-types"
import type { BusinessPost, BusinessStory } from "@/components/business/business-social-landing"
import type {
  AppointmentRuntimeBundle,
  RuntimeFeedItem,
  RuntimeFeedSectionId,
  RuntimeProfessional,
  RuntimeService,
  RuntimeStory,
} from "./types"

export interface AppointmentLegacyContent {
  stories: BusinessStory[]
  videos: BusinessPost[]
  news: BusinessPost[]
  reviews: BusinessPost[]
  social: BusinessPost[]
}

function projectFeedItem(item: RuntimeFeedItem): BusinessPost {
  const metadata = item.metadata ?? {}
  const post: BusinessPost = {
    id: item.id,
    type: item.kind,
    title: item.title,
    description: item.description,
    image: item.image?.trim() ? item.image : "",
    duration: typeof metadata.duration === "string" ? metadata.duration : undefined,
    views: typeof metadata.views === "number" ? metadata.views : undefined,
    price: typeof metadata.price === "number" ? metadata.price : undefined,
    originalPrice: typeof metadata.originalPrice === "number" ? metadata.originalPrice : undefined,
    rating: typeof metadata.rating === "number" ? metadata.rating : undefined,
    reviewerName: typeof metadata.reviewerName === "string" ? metadata.reviewerName : undefined,
    reviewerAvatar: typeof metadata.reviewerAvatar === "string" ? metadata.reviewerAvatar : undefined,
    source: typeof metadata.source === "string" ? metadata.source : undefined,
    date: typeof metadata.date === "string" ? metadata.date : undefined,
  }

  if (!post.image) {
    delete (post as Partial<BusinessPost>).image
  }

  return post
}

function projectStory(story: RuntimeStory): BusinessStory {
  return {
    id: story.id,
    name: story.label,
    image: story.image,
    isMain: story.isPrimary,
  }
}

function projectProfessional(professional: RuntimeProfessional): Professional {
  return {
    id: professional.id,
    name: professional.name,
    avatar: professional.avatar,
    role: professional.role,
    rating: professional.rating,
    reviewCount: professional.reviewCount,
    specialties: professional.specialties,
    availability: professional.availability,
  }
}

function projectService(service: RuntimeService): Service {
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

function getSectionItems(bundle: AppointmentRuntimeBundle, sectionId: RuntimeFeedSectionId) {
  return bundle.feed.sections.find((section) => section.id === sectionId)?.items ?? []
}

export function projectBundleToBusinessConfig(bundle: AppointmentRuntimeBundle): BusinessConfig {
  const { establishment } = bundle

  return {
    model: "appointment",
    name: establishment.name,
    logo: establishment.brand.logo,
    coverImage: establishment.brand.coverImage,
    description: establishment.brand.description,
    primaryColor: establishment.brand.primaryColor,
    whatsapp: establishment.contact.whatsapp,
    instagram: establishment.contact.instagram,
    address: establishment.contact.address,
    openingHours: establishment.hours,
  }
}

export function projectBundleToLegacyContent(bundle: AppointmentRuntimeBundle): AppointmentLegacyContent {
  return {
    stories: bundle.feed.stories.map(projectStory),
    videos: getSectionItems(bundle, "videos").map(projectFeedItem),
    news: getSectionItems(bundle, "news").map(projectFeedItem),
    reviews: getSectionItems(bundle, "reviews").map(projectFeedItem),
    social: getSectionItems(bundle, "social").map(projectFeedItem),
  }
}

export function projectBundleToProfessionals(bundle: AppointmentRuntimeBundle): Professional[] {
  return bundle.professionals.map(projectProfessional)
}

export function projectBundleToServices(bundle: AppointmentRuntimeBundle): Service[] {
  return bundle.services.map(projectService)
}

export function projectBundleToStyles(bundle: AppointmentRuntimeBundle): StyleExample[] {
  return bundle.styles.map((style) => ({
    id: style.id,
    name: style.name,
    image: style.image,
    category: style.category,
    tags: style.tags,
  }))
}
