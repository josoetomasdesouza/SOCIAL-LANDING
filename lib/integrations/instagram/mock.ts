/**
 * Instagram mock — offline/dev previews only.
 */

import type { InstagramPort } from "./port"
import type { InstagramProfile, InstagramSyncResult } from "./types"

export class InstagramMockAdapter implements InstagramPort {
  readonly provider = "instagram" as const

  isConfigured(): boolean {
    return true
  }

  async getProfile(handle: string): Promise<InstagramProfile> {
    const normalized = handle.replace(/^@/, "")
    return {
      handle: normalized,
      profileUrl: `https://instagram.com/${normalized}`,
      displayName: normalized,
    }
  }

  async syncRecentMedia(handle: string, limit = 3): Promise<InstagramSyncResult> {
    const normalized = handle.replace(/^@/, "")
    return {
      syncedAt: new Date().toISOString(),
      items: Array.from({ length: limit }, (_, index) => ({
        id: `ig-mock-${index + 1}`,
        mediaUrl: `https://picsum.photos/seed/${normalized}-${index}/400/400`,
        permalink: `https://instagram.com/p/mock-${index + 1}`,
        caption: `Mock post ${index + 1}`,
        mediaType: "image" as const,
      })),
    }
  }

  resolveDeepLink(handle: string): string {
    const normalized = handle.replace(/^@/, "")
    return `https://instagram.com/${normalized}`
  }
}

export const instagramMockAdapter = new InstagramMockAdapter()
