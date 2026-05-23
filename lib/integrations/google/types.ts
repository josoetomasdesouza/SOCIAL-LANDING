export interface GoogleOAuthTokens {
  readonly accessToken: string
  readonly refreshToken?: string
  readonly expiresAt?: string
}

export interface GoogleUserProfile {
  readonly id: string
  readonly email?: string
  readonly name?: string
}

export type GoogleIntegrationErrorCode = "NOT_CONFIGURED" | "AUTH_REQUIRED" | "PROVIDER_ERROR"

export interface GoogleIntegrationError {
  readonly code: GoogleIntegrationErrorCode
  readonly message: string
}
