import type { WhatsAppPort } from "./port"
import type { WhatsAppIntegrationError } from "./types"

function notConfigured(): WhatsAppIntegrationError {
  return { code: "NOT_CONFIGURED", message: "WhatsApp Business API adapter is not configured" }
}

export class WhatsAppAdapter implements WhatsAppPort {
  readonly provider = "whatsapp" as const

  isConfigured(): boolean {
    return false
  }

  buildDeepLink(phone: string, text?: string): string {
    const digits = phone.replace(/\D/g, "")
    const base = `https://wa.me/${digits}`
    return text ? `${base}?text=${encodeURIComponent(text)}` : base
  }

  validatePhone(phone: string): boolean {
    const digits = phone.replace(/\D/g, "")
    return digits.length >= 10
  }

  async sendMessage() {
    return notConfigured()
  }

  formatContact(phone: string) {
    return { phone: phone.replace(/\D/g, "") }
  }
}

export const whatsappAdapter = new WhatsAppAdapter()
