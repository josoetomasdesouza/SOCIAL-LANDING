import type { WhatsAppContact, WhatsAppIntegrationError, WhatsAppMessageRequest, WhatsAppMessageResult } from "./types"

export interface WhatsAppPort {
  readonly provider: "whatsapp"
  isConfigured(): boolean
  buildDeepLink(phone: string, text?: string): string
  validatePhone(phone: string): boolean
  sendMessage(request: WhatsAppMessageRequest): Promise<WhatsAppMessageResult | WhatsAppIntegrationError>
  formatContact(phone: string): WhatsAppContact
}
