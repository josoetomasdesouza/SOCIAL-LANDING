import type { ExternalReviewCandidate } from "./types"

export const EXTERNAL_REVIEW_MAX_TEXT_LENGTH = 240 as const

export function passesEditorialReviewGate(review: ExternalReviewCandidate): boolean {
  const text = review.text.trim()
  const author = review.author.trim()

  if (!text || !author) {
    return false
  }

  if (text.length > EXTERNAL_REVIEW_MAX_TEXT_LENGTH) {
    return false
  }

  return review.rating >= 1 && review.rating <= 5
}

export function filterEditorialReviews(
  reviews: ExternalReviewCandidate[]
): ExternalReviewCandidate[] {
  return reviews.filter(passesEditorialReviewGate)
}
