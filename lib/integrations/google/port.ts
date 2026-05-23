import type { GoogleIntegrationError, GoogleOAuthTokens, GoogleUserProfile } from "./types"

export interface GooglePort {
  readonly provider: "google"
  isConfigured(): boolean
  getAuthorizationUrl(state: string): string | GoogleIntegrationError
  exchangeCode(code: string): Promise<GoogleOAuthTokens | GoogleIntegrationError>
  getUserProfile(tokens: GoogleOAuthTokens): Promise<GoogleUserProfile | GoogleIntegrationError>
}
