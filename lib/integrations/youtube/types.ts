export interface YouTubeChannel {
  readonly channelId: string
  readonly handle?: string
  readonly title?: string
}

export interface YouTubeVideoItem {
  readonly videoId: string
  readonly title: string
  readonly watchUrl: string
  readonly thumbnailUrl?: string
  readonly publishedAt?: string
}

export interface YouTubeSyncResult {
  readonly videos: readonly YouTubeVideoItem[]
  readonly syncedAt: string
}

export type YouTubeIntegrationErrorCode = "NOT_CONFIGURED" | "AUTH_REQUIRED" | "PROVIDER_ERROR"

export interface YouTubeIntegrationError {
  readonly code: YouTubeIntegrationErrorCode
  readonly message: string
}
