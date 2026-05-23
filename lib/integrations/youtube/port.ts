import type { YouTubeChannel, YouTubeIntegrationError, YouTubeSyncResult } from "./types"

export interface YouTubePort {
  readonly provider: "youtube"
  isConfigured(): boolean
  resolveWatchUrl(videoId: string): string
  getChannel(handleOrId: string): Promise<YouTubeChannel | YouTubeIntegrationError>
  syncRecentVideos(channelId: string, limit?: number): Promise<YouTubeSyncResult | YouTubeIntegrationError>
}
