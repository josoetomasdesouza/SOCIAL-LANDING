import type { ReactNode } from "react"

export type UniversalPostType =
  | "video"
  | "video-vertical"
  | "product"
  | "news"
  | "review"
  | "social"

export interface UniversalBrand {
  id?: string
  name: string
  slug?: string
  logo: string
  coverImage?: string
  headline?: string
  description?: string
  verified?: boolean
  rating?: number
  totalReviews?: number
  totalPosts?: number
  totalProducts?: number
  primaryColor?: string
  brandColor?: string
  whatsappNumber?: string
  whatsapp?: string
  instagram?: string
  address?: string
  openingHours?: string
  socialLinks?: {
    instagram?: string
    twitter?: string
    youtube?: string
    linkedin?: string
  }
}

export interface UniversalPost {
  id: string
  type: UniversalPostType
  title?: string
  content?: string
  description?: string
  image?: string
  media?: string
  thumbnail?: string
  timestamp?: string
  videoUrl?: string
  date?: string
  likes?: number
  comments?: number
  shares?: number
  author?: {
    name: string
    avatar: string
  }
  duration?: string
  views?: number
  isVertical?: boolean
  price?: number
  originalPrice?: number
  rating?: number
  reviewerName?: string
  reviewerAvatar?: string
  source?: string
  hasImage?: boolean
}

export interface UniversalStory {
  id: string
  name: string
  image: string
  isMain?: boolean
  targetSectionId?: string
  action?: string
}

export interface UniversalCTA {
  label: string
  action: string
  href?: string
  variant?: "primary" | "secondary" | "outline" | "ghost"
}

export type OperationalModuleId =
  | "appointment.booking"
  | "appointment.calendar"
  | "appointment.staff"
  | "appointment.availability"
  | "restaurant.menu"
  | "restaurant.cart"
  | "restaurant.checkout"
  | "restaurant.delivery"
  | "ecommerce.products"
  | "ecommerce.cart"
  | "ecommerce.payment"
  | "courses.lessons"
  | "courses.modules"
  | "courses.enrollment"
  | "real_estate.properties"
  | "real_estate.lead"
  | "real_estate.visits"
  | string

export interface UniversalSectionConfig {
  id: string
  title: string
  icon?: ReactNode
  type: "primary-action" | "content" | "specific" | "custom"
  contentType?: UniversalPostType | string
  moduleId?: OperationalModuleId
  posts?: UniversalPost[]
  customContent?: ReactNode
  renderContent?: (onOpenDrawer: (post: UniversalPost) => void) => ReactNode
}

export interface UniversalFlowStep {
  id: string
  label: string
  moduleId?: OperationalModuleId
  action?: string
}

export interface UniversalSegmentConfig {
  id: string
  name: string
  objective: string
  primaryCTA: UniversalCTA
  contentPriorities: Array<UniversalPostType | string>
  operationalFlow: UniversalFlowStep[]
  requiredModules: OperationalModuleId[]
  sections?: UniversalSectionConfig[]
  stories?: UniversalStory[]
  rules?: Record<string, unknown>
}
