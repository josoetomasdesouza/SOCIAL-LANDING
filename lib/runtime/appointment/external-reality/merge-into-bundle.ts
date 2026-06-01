import type { AppointmentRuntimeBundle, RuntimeFeedItem } from "../types"
import {
  deriveHoursHintFromWeekdayDescriptions,
  deriveLiveStateFromHours,
  deriveMapsQueryFromSnapshot,
} from "./derive-fields"
import { filterEditorialReviews } from "./editorial-gate"
import { EXTERNAL_REALITY_MAX_REVIEWS, EXTERNAL_REALITY_PROVIDER_GOOGLE_PLACES } from "./types"
import type {
  ExternalRealitySnapshot,
  ExternalRealitySyncStatus,
  ExternalReviewCandidate,
  RuntimeExternalMeta,
} from "./types"

export interface MergeExternalRealityOptions {
  status?: ExternalRealitySyncStatus
  syncedAt?: string
}

function buildRuntimeExternalMeta(
  snapshot: ExternalRealitySnapshot | null,
  status: ExternalRealitySyncStatus,
  syncedAt: string
): RuntimeExternalMeta {
  if (snapshot) {
    return {
      provider: snapshot.provider,
      placeId: snapshot.placeId,
      syncedAt,
      status,
    }
  }

  return {
    provider: EXTERNAL_REALITY_PROVIDER_GOOGLE_PLACES,
    placeId: "",
    syncedAt,
    status,
  }
}

function mapExternalReviewToFeedItem(review: ExternalReviewCandidate): RuntimeFeedItem {
  return {
    id: review.id,
    kind: "review",
    title: review.text.trim(),
    image: "",
    metadata: {
      rating: review.rating,
      reviewerName: review.author.trim(),
    },
  }
}

function mergeReviewsSection(
  bundle: AppointmentRuntimeBundle,
  snapshot: ExternalRealitySnapshot
) {
  const editorialReviews = filterEditorialReviews(snapshot.reviews)

  if (editorialReviews.length === 0) {
    return
  }

  if (editorialReviews.length !== snapshot.reviews.length) {
    return
  }

  const reviewsSection = bundle.feed.sections.find((section) => section.id === "reviews")

  if (!reviewsSection) {
    return
  }

  reviewsSection.items = editorialReviews
    .slice(0, EXTERNAL_REALITY_MAX_REVIEWS)
    .map(mapExternalReviewToFeedItem)
}

/**
 * Merge external reality into an existing runtime bundle.
 * Editorial grammar fields are preserved; only allowed runtime fields are enriched.
 */
export function mergeExternalRealityIntoBundle(
  base: AppointmentRuntimeBundle,
  snapshot: ExternalRealitySnapshot | null,
  options: MergeExternalRealityOptions = {}
): AppointmentRuntimeBundle {
  const merged: AppointmentRuntimeBundle = structuredClone(base)
  const status = options.status ?? (snapshot ? "live" : "fallback")
  const syncedAt = options.syncedAt ?? snapshot?.fetchedAt ?? merged.meta.updatedAt

  merged.meta = {
    ...merged.meta,
    external: buildRuntimeExternalMeta(snapshot, status, syncedAt),
  }

  if (status !== "live" || !snapshot) {
    return merged
  }

  const formattedAddress = snapshot.place.formattedAddress.trim()

  if (formattedAddress) {
    merged.establishment = {
      ...merged.establishment,
      contact: {
        ...merged.establishment.contact,
        address: formattedAddress,
      },
    }

    merged.arrival = {
      ...merged.arrival,
      addressLine: formattedAddress,
      mapsQuery: deriveMapsQueryFromSnapshot(snapshot),
    }
  } else {
    merged.arrival = {
      ...merged.arrival,
      mapsQuery: deriveMapsQueryFromSnapshot(snapshot),
    }
  }

  const liveState = deriveLiveStateFromHours(snapshot.hours)

  if (liveState) {
    merged.operational = {
      ...merged.operational,
      liveState,
    }
  }

  const hoursHint = deriveHoursHintFromWeekdayDescriptions(snapshot.hours.weekdayDescriptions)

  if (hoursHint) {
    merged.operational = {
      ...merged.operational,
      hoursHint,
    }
  }

  mergeReviewsSection(merged, snapshot)

  return merged
}

export const PRESERVED_EDITORIAL_FIELDS = [
  "operational.placeHint",
  "operational.momentHint",
  "arrival.drawerTitle",
  "arrival.referenceHint",
  "arrival.routeHint",
  "arrival.parkingHint",
  "arrival.arrivalMood",
] as const

export function getPreservedEditorialFieldValues(bundle: AppointmentRuntimeBundle) {
  return {
    placeHint: bundle.operational.placeHint,
    momentHint: bundle.operational.momentHint,
    drawerTitle: bundle.arrival.drawerTitle,
    referenceHint: bundle.arrival.referenceHint,
    routeHint: bundle.arrival.routeHint,
    parkingHint: bundle.arrival.parkingHint,
    arrivalMood: bundle.arrival.arrivalMood,
  }
}

export function preservedEditorialFieldsMatch(
  left: AppointmentRuntimeBundle,
  right: AppointmentRuntimeBundle
) {
  return (
    JSON.stringify(getPreservedEditorialFieldValues(left)) ===
    JSON.stringify(getPreservedEditorialFieldValues(right))
  )
}
