import { normalizeExternalRealitySnapshot } from "./normalize"
import { EXTERNAL_REALITY_PROVIDER_GOOGLE_PLACES } from "./types"
import type { ExternalRealitySnapshot } from "./types"

interface GoogleLocalizedText {
  text?: string
  languageCode?: string
}

/** Minimal Place Details payload — not a provider dump type. */
export interface GooglePlacesPlaceDetailsPayload {
  displayName?: GoogleLocalizedText
  formattedAddress?: string
  location?: {
    latitude?: number
    longitude?: number
  }
  regularOpeningHours?: {
    openNow?: boolean
    weekdayDescriptions?: string[]
  }
  rating?: number
  userRatingCount?: number
  googleMapsUri?: string
  reviews?: GooglePlacesReviewPayload[]
}

export interface GooglePlacesReviewPayload {
  name?: string
  relativePublishTimeDescription?: string
  rating?: number
  text?: GoogleLocalizedText
  authorAttribution?: {
    displayName?: string
  }
}

function readLocalizedText(value: GoogleLocalizedText | undefined): string {
  return value?.text?.trim() ?? ""
}

export function mapGooglePlacesDetailsToExternalRealitySnapshot(
  placeId: string,
  payload: GooglePlacesPlaceDetailsPayload,
  fetchedAt: string = new Date().toISOString()
): ExternalRealitySnapshot {
  return normalizeExternalRealitySnapshot({
    provider: EXTERNAL_REALITY_PROVIDER_GOOGLE_PLACES,
    placeId,
    fetchedAt,
    place: {
      displayName: readLocalizedText(payload.displayName),
      formattedAddress: payload.formattedAddress?.trim() ?? "",
      googleMapsUri: payload.googleMapsUri?.trim(),
      location:
        payload.location?.latitude !== undefined &&
        payload.location?.longitude !== undefined
          ? {
              lat: payload.location.latitude,
              lng: payload.location.longitude,
            }
          : undefined,
    },
    hours: {
      openNow: payload.regularOpeningHours?.openNow,
      weekdayDescriptions: payload.regularOpeningHours?.weekdayDescriptions,
    },
    rating: {
      average: payload.rating,
      total: payload.userRatingCount,
    },
    reviews: (payload.reviews ?? []).map((review, index) => ({
      id: review.name?.trim() || `google-review-${index + 1}`,
      author: review.authorAttribution?.displayName?.trim() || "Guest",
      rating: review.rating ?? 0,
      text: readLocalizedText(review.text),
      relativeTime: review.relativePublishTimeDescription?.trim(),
    })),
  })
}
