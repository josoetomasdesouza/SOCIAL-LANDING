export interface WhatsAppContact {
  readonly phone: string
  readonly displayLabel?: string
}

export interface WhatsAppMessageRequest {
  readonly to: string
  readonly body: string
  readonly templateId?: string
}

export interface WhatsAppMessageResult {
  readonly messageId: string
  readonly sentAt: string
}

export type WhatsAppIntegrationErrorCode = "NOT_CONFIGURED" | "INVALID_PHONE" | "PROVIDER_ERROR"

export interface WhatsAppIntegrationError {
  readonly code: WhatsAppIntegrationErrorCode
  readonly message: string
}
