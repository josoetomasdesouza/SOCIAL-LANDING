/**
 * Instagram port — no Graph API implementation yet.
 */

import type { InstagramIntegrationError, InstagramMediaItem, InstagramProfile, InstagramSyncResult } from "./types"

export interface InstagramPort {
  readonly provider: "instagram"
  isConfigured(): boolean
  getProfile(handle: string): Promise<InstagramProfile | InstagramIntegrationError>
  syncRecentMedia(handle: string, limit?: number): Promise<InstagramSyncResult | InstagramIntegrationError>
  resolveDeepLink(handle: string): string
}

export type InstagramMediaPreview = Pick<InstagramMediaItem, "id" | "mediaUrl" | "permalink" | "caption">
