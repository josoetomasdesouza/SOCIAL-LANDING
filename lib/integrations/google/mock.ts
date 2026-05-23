import type { GooglePort } from "./port"
import type { GoogleOAuthTokens, GoogleUserProfile } from "./types"

export class GoogleMockAdapter implements GooglePort {
  readonly provider = "google" as const

  isConfigured(): boolean {
    return true
  }

  getAuthorizationUrl(state: string): string {
    return `https://accounts.google.com/o/oauth2/v2/auth?state=${encodeURIComponent(state)}&mock=true`
  }

  async exchangeCode(code: string): Promise<GoogleOAuthTokens> {
    return {
      accessToken: `mock-access-${code}`,
      refreshToken: "mock-refresh",
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    }
  }

  async getUserProfile(): Promise<GoogleUserProfile> {
    return { id: "google-mock-user", email: "demo@social.landing", name: "Demo User" }
  }
}

export const googleMockAdapter = new GoogleMockAdapter()
