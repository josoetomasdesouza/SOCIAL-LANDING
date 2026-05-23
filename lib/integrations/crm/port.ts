import type { CRMContact, CRMDeal, CRMIntegrationError, CRMLeadPayload } from "./types"

export interface CRMPort {
  readonly provider: "crm"
  isConfigured(): boolean
  createContact(contact: CRMContact): Promise<CRMContact | CRMIntegrationError>
  createDeal(deal: CRMDeal): Promise<CRMDeal | CRMIntegrationError>
  submitLead(payload: CRMLeadPayload): Promise<{ contactId: string } | CRMIntegrationError>
}
