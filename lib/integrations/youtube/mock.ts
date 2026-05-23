import type { YouTubePort } from "./port"
import type { YouTubeSyncResult } from "./types"

export class YouTubeMockAdapter implements YouTubePort {
  readonly provider = "youtube" as const

  isConfigured(): boolean {
    return true
  }

  resolveWatchUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`
  }

  async getChannel(handleOrId: string) {
    return {
      channelId: handleOrId,
      handle: handleOrId.startsWith("@") ? handleOrId : `@${handleOrId}`,
      title: handleOrId,
    }
  }

  async syncRecentVideos(channelId: string, limit = 3): Promise<YouTubeSyncResult> {
    return {
      syncedAt: new Date().toISOString(),
      videos: Array.from({ length: limit }, (_, index) => ({
        videoId: `mock-${channelId}-${index + 1}`,
        title: `Mock video ${index + 1}`,
        watchUrl: this.resolveWatchUrl(`mock-${channelId}-${index + 1}`),
        thumbnailUrl: `https://picsum.photos/seed/yt-${index}/640/360`,
      })),
    }
  }
}

export const youtubeMockAdapter = new YouTubeMockAdapter()
