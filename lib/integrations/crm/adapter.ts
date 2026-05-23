import type { CRMPort } from "./port"
import type { CRMIntegrationError } from "./types"

function notConfigured(): CRMIntegrationError {
  return { code: "NOT_CONFIGURED", message: "CRM adapter is not configured" }
}

export class CRMAdapter implements CRMPort {
  readonly provider = "crm" as const

  isConfigured(): boolean {
    return false
  }

  async createContact() {
    return notConfigured()
  }

  async createDeal() {
    return notConfigured()
  }

  async submitLead() {
    return notConfigured()
  }
}

export const crmAdapter = new CRMAdapter()
