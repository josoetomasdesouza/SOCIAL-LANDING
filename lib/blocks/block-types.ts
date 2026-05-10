import type { BusinessModel } from "@/lib/business-types"

export const ALL_BLOCK_SEGMENTS = [
  "appointment",
  "ecommerce",
  "courses",
  "restaurant",
  "realestate",
  "professionals",
  "events",
  "gym",
  "health",
  "influencer",
  "personal",
  "institutional",
] as const satisfies readonly BusinessModel[]

export const UNIVERSAL_BLOCK_IDS = [
  "stories",
  "videos",
  "reviews",
  "tips",
  "updates",
  "highlights",
  "institutional",
  "brand-posts",
  "conversion",
] as const

export const APPOINTMENT_BLOCK_IDS = [
  "services",
  "professionals",
  "availability",
  "results",
] as const

export const RESTAURANT_BLOCK_IDS = [
  "menu",
  "combos",
  "delivery",
  "environment",
] as const

export const ECOMMERCE_BLOCK_IDS = [
  "products",
  "categories",
  "offers",
  "favorites",
] as const

export const COURSES_BLOCK_IDS = [
  "courses",
  "tracks",
  "lessons",
  "instructors",
] as const

export const SEGMENT_SPECIFIC_BLOCK_IDS = {
  appointment: APPOINTMENT_BLOCK_IDS,
  restaurant: RESTAURANT_BLOCK_IDS,
  ecommerce: ECOMMERCE_BLOCK_IDS,
  courses: COURSES_BLOCK_IDS,
} as const

export type BlockCategory =
  | "social"
  | "editorial"
  | "proof"
  | "institutional"
  | "catalog"
  | "operations"
  | "commercial"

export type BlockGoal =
  | "awareness"
  | "engagement"
  | "education"
  | "trust"
  | "consideration"
  | "conversion"

export type BlockPriorityLevel = "critical" | "high" | "medium"

export type UniversalBlockId = (typeof UNIVERSAL_BLOCK_IDS)[number]
export type AppointmentBlockId = (typeof APPOINTMENT_BLOCK_IDS)[number]
export type RestaurantBlockId = (typeof RESTAURANT_BLOCK_IDS)[number]
export type EcommerceBlockId = (typeof ECOMMERCE_BLOCK_IDS)[number]
export type CoursesBlockId = (typeof COURSES_BLOCK_IDS)[number]

export type SegmentSpecificBlockId =
  | AppointmentBlockId
  | RestaurantBlockId
  | EcommerceBlockId
  | CoursesBlockId

export type BlockId = UniversalBlockId | SegmentSpecificBlockId

export interface BlockDefinition {
  id: BlockId
  title: string
  category: BlockCategory
  goal: BlockGoal
  compatibleSegments: readonly BusinessModel[]
  acceptsManualPosts: boolean
  acceptsAutoContent: boolean
  canGenerateStories: boolean
  priorityLevel: BlockPriorityLevel
}
