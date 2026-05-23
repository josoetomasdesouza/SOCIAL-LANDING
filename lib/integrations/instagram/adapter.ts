/**
 * Instagram adapter stub — fails closed until integration phase.
 */

import type { InstagramPort } from "./port"
import type { InstagramIntegrationError } from "./types"

function notConfigured(): InstagramIntegrationError {
  return { code: "NOT_CONFIGURED", message: "Instagram adapter is not configured" }
}

export class InstagramAdapter implements InstagramPort {
  readonly provider = "instagram" as const

  isConfigured(): boolean {
    return false
  }

  async getProfile() {
    return notConfigured()
  }

  async syncRecentMedia() {
    return notConfigured()
  }

  resolveDeepLink(handle: string): string {
    const normalized = handle.replace(/^@/, "")
    return `https://instagram.com/${normalized}`
  }
}

export const instagramAdapter = new InstagramAdapter()
