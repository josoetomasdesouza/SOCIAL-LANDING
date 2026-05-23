/**
 * Instagram integration types — port layer only.
 */

export interface InstagramProfile {
  readonly handle: string
  readonly profileUrl: string
  readonly displayName?: string
}

export interface InstagramMediaItem {
  readonly id: string
  readonly mediaUrl: string
  readonly permalink: string
  readonly caption?: string
  readonly mediaType: "image" | "video" | "carousel"
  readonly timestamp?: string
}

export interface InstagramSyncResult {
  readonly items: readonly InstagramMediaItem[]
  readonly syncedAt: string
}

export type InstagramIntegrationErrorCode =
  | "NOT_CONFIGURED"
  | "AUTH_REQUIRED"
  | "RATE_LIMITED"
  | "PROVIDER_ERROR"

export interface InstagramIntegrationError {
  readonly code: InstagramIntegrationErrorCode
  readonly message: string
}
