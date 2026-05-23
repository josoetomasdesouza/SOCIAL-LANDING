import type { YouTubePort } from "./port"
import type { YouTubeIntegrationError } from "./types"

function notConfigured(): YouTubeIntegrationError {
  return { code: "NOT_CONFIGURED", message: "YouTube Data API adapter is not configured" }
}

export class YouTubeAdapter implements YouTubePort {
  readonly provider = "youtube" as const

  isConfigured(): boolean {
    return false
  }

  resolveWatchUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`
  }

  async getChannel() {
    return notConfigured()
  }

  async syncRecentVideos() {
    return notConfigured()
  }
}

export const youtubeAdapter = new YouTubeAdapter()
