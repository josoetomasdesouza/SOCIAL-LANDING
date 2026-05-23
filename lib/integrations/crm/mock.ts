import type { CRMPort } from "./port"
import type { CRMContact, CRMDeal, CRMLeadPayload } from "./types"

export class CRMMockAdapter implements CRMPort {
  readonly provider = "crm" as const

  isConfigured(): boolean {
    return true
  }

  async createContact(contact: CRMContact) {
    return { ...contact, id: `crm-contact-${Date.now()}` }
  }

  async createDeal(deal: CRMDeal) {
    return { ...deal, id: `crm-deal-${Date.now()}` }
  }

  async submitLead(payload: CRMLeadPayload) {
    return { contactId: `crm-lead-${payload.contact.name.replace(/\s+/g, "-").toLowerCase()}` }
  }
}

export const crmMockAdapter = new CRMMockAdapter()
