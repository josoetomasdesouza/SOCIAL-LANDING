import type { WhatsAppPort } from "./port"

export class WhatsAppMockAdapter implements WhatsAppPort {
  readonly provider = "whatsapp" as const

  isConfigured(): boolean {
    return true
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

  async sendMessage(request: Parameters<WhatsAppPort["sendMessage"]>[0]) {
    return {
      messageId: `wa-mock-${Date.now()}`,
      sentAt: new Date().toISOString(),
    }
  }

  formatContact(phone: string) {
    return { phone: phone.replace(/\D/g, ""), displayLabel: "WhatsApp" }
  }
}

export const whatsappMockAdapter = new WhatsAppMockAdapter()
