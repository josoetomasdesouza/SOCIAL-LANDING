import type { BusinessModel } from "@/lib/business-types"

import { BLOCK_REGISTRY_BY_ID } from "./block-registry"
import {
  APPOINTMENT_BLOCK_IDS,
  COURSES_BLOCK_IDS,
  ECOMMERCE_BLOCK_IDS,
  RESTAURANT_BLOCK_IDS,
  UNIVERSAL_BLOCK_IDS,
  type BlockDefinition,
  type BlockId,
} from "./block-types"

function withUniversalBlocks(
  segmentSpecificBlocks: readonly BlockId[],
): readonly BlockId[] {
  return [...UNIVERSAL_BLOCK_IDS, ...segmentSpecificBlocks]
}

// Os segmentos ainda sem blocos especificos entram apenas com a base universal.
export const RECOMMENDED_BLOCK_IDS_BY_SEGMENT: Record<BusinessModel, readonly BlockId[]> = {
  appointment: withUniversalBlocks(APPOINTMENT_BLOCK_IDS),
  ecommerce: withUniversalBlocks(ECOMMERCE_BLOCK_IDS),
  courses: withUniversalBlocks(COURSES_BLOCK_IDS),
  restaurant: withUniversalBlocks(RESTAURANT_BLOCK_IDS),
  realestate: UNIVERSAL_BLOCK_IDS,
  professionals: UNIVERSAL_BLOCK_IDS,
  events: UNIVERSAL_BLOCK_IDS,
  gym: UNIVERSAL_BLOCK_IDS,
  health: UNIVERSAL_BLOCK_IDS,
  influencer: UNIVERSAL_BLOCK_IDS,
  personal: UNIVERSAL_BLOCK_IDS,
  institutional: UNIVERSAL_BLOCK_IDS,
}

export const RECOMMENDED_BLOCKS_BY_SEGMENT: Record<
  BusinessModel,
  readonly BlockDefinition[]
> = (Object.keys(RECOMMENDED_BLOCK_IDS_BY_SEGMENT) as BusinessModel[]).reduce(
  (segments, segment) => {
    segments[segment] = RECOMMENDED_BLOCK_IDS_BY_SEGMENT[segment].map(
      (blockId) => BLOCK_REGISTRY_BY_ID[blockId],
    )
    return segments
  },
  {} as Record<BusinessModel, readonly BlockDefinition[]>,
)

export function getRecommendedBlockIdsForSegment(
  segment: BusinessModel,
): readonly BlockId[] {
  return RECOMMENDED_BLOCK_IDS_BY_SEGMENT[segment]
}

export function getRecommendedBlocksForSegment(
  segment: BusinessModel,
): readonly BlockDefinition[] {
  return RECOMMENDED_BLOCKS_BY_SEGMENT[segment]
}
