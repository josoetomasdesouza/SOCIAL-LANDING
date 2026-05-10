import type { UniversalSegmentConfig } from "@/lib/core"
import { segmentRegistry, type SegmentId } from "./registry"

export function isValidSegmentId(segmentId: string): segmentId is SegmentId {
  return Object.prototype.hasOwnProperty.call(segmentRegistry, segmentId)
}

export function getSegmentConfig(segmentId: string): UniversalSegmentConfig | null {
  if (!isValidSegmentId(segmentId)) {
    return null
  }

  return segmentRegistry[segmentId]
}

export function getAllSegmentConfigs(): UniversalSegmentConfig[] {
  return Object.values(segmentRegistry)
}
