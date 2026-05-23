import type { GooglePort } from "./port"
import type { GoogleIntegrationError } from "./types"

function notConfigured(): GoogleIntegrationError {
  return { code: "NOT_CONFIGURED", message: "Google OAuth adapter is not configured" }
}

export class GoogleAdapter implements GooglePort {
  readonly provider = "google" as const

  isConfigured(): boolean {
    return false
  }

  getAuthorizationUrl(): GoogleIntegrationError {
    return notConfigured()
  }

  async exchangeCode() {
    return notConfigured()
  }

  async getUserProfile() {
    return notConfigured()
  }
}

export const googleAdapter = new GoogleAdapter()
