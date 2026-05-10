import type { UniversalSegmentConfig } from "@/lib/core"
import { appointmentSegmentConfig } from "./appointment.config"
import { coursesSegmentConfig } from "./courses.config"
import { ecommerceSegmentConfig } from "./ecommerce.config"
import { realEstateSegmentConfig } from "./real-estate.config"
import { restaurantSegmentConfig } from "./restaurant.config"

export const segmentRegistry = {
  appointment: appointmentSegmentConfig,
  restaurant: restaurantSegmentConfig,
  ecommerce: ecommerceSegmentConfig,
  courses: coursesSegmentConfig,
  real_estate: realEstateSegmentConfig,
} satisfies Record<string, UniversalSegmentConfig>

export type SegmentRegistry = typeof segmentRegistry
export type SegmentId = keyof SegmentRegistry

export const segmentConfigs = Object.values(segmentRegistry)

export function getSegmentConfig(segmentId: SegmentId): UniversalSegmentConfig {
  return segmentRegistry[segmentId]
}
