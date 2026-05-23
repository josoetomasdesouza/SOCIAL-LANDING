import type { ShopifyPort } from "./port"
import type { ShopifyIntegrationError } from "./types"

function notConfigured(): ShopifyIntegrationError {
  return { code: "NOT_CONFIGURED", message: "Shopify adapter is not configured" }
}

export class ShopifyAdapter implements ShopifyPort {
  readonly provider = "shopify" as const

  isConfigured(): boolean {
    return false
  }

  async syncProducts() {
    return notConfigured()
  }

  async getProduct() {
    return notConfigured()
  }
}

export const shopifyAdapter = new ShopifyAdapter()
