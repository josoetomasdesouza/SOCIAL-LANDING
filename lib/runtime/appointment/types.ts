export const APPOINTMENT_RUNTIME_VERSION = 1 as const

/** Pilot slug for the Barba Negra demo vertical. */
export const APPOINTMENT_PILOT_SLUG = "barba-negra" as const

export type AppointmentRuntimeSource = "runtime" | "mock-fallback"

export type AppointmentRuntimeMode = "mock" | "runtime"

export interface RuntimeContact {
  whatsapp?: string
  instagram?: string
  email?: string
  address?: string
}

export interface RuntimeBrand {
  logo: string
  coverImage: string
  primaryColor: string
  description: string
}

export interface RuntimeEstablishment {
  id: string
  slug: string
  model: "appointment"
  name: string
  brand: RuntimeBrand
  contact: RuntimeContact
  hours?: string
}

export interface RuntimeOperationalContext {
  liveState: string
  placeHint: string
  momentHint?: string
  hoursHint?: string
}

export interface RuntimeArrivalContext {
  drawerTitle: string
  addressLine: string
  referenceHint: string
  routeHint?: string
  parkingHint?: string
  arrivalMood?: string
  mapsQuery: string
}

export interface RuntimeTimeSlot {
  time: string
  available: boolean
}

export interface RuntimeDayAvailability {
  date: string
  slots: RuntimeTimeSlot[]
}

export interface RuntimeProfessional {
  id: string
  name: string
  avatar: string
  role: string
  rating: number
  reviewCount: number
  specialties: string[]
  availability: RuntimeDayAvailability[]
}

export interface RuntimeService {
  id: string
  name: string
  description: string
  duration: number
  price: number
  image?: string
  category: string
  popular?: boolean
}

export interface RuntimeStyleCatalogItem {
  id: string
  name: string
  image: string
  category: string
  tags: string[]
}

export type RuntimeFeedItemKind =
  | "video"
  | "video-vertical"
  | "product"
  | "news"
  | "review"
  | "social"

export type RuntimeFeedSectionId = "videos" | "reviews" | "news" | "social"

export interface RuntimeFeedItem {
  id: string
  kind: RuntimeFeedItemKind
  title: string
  image: string
  description?: string
  metadata?: Record<string, string | number | boolean | undefined>
}

export interface RuntimeStory {
  id: string
  label: string
  image: string
  isPrimary?: boolean
}

export interface RuntimeFeedSection {
  id: RuntimeFeedSectionId
  items: RuntimeFeedItem[]
}

export interface AppointmentRuntimeBundle {
  version: typeof APPOINTMENT_RUNTIME_VERSION
  establishment: RuntimeEstablishment
  operational: RuntimeOperationalContext
  arrival: RuntimeArrivalContext
  professionals: RuntimeProfessional[]
  services: RuntimeService[]
  styles: RuntimeStyleCatalogItem[]
  feed: {
    stories: RuntimeStory[]
    sections: RuntimeFeedSection[]
  }
  meta: {
    source: AppointmentRuntimeSource
    slug: string
    updatedAt: string
  }
}
