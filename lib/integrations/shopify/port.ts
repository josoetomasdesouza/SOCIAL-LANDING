import type { ShopifyIntegrationError, ShopifyProduct, ShopifySyncResult } from "./types"

export interface ShopifyPort {
  readonly provider: "shopify"
  isConfigured(): boolean
  syncProducts(shopDomain: string, limit?: number): Promise<ShopifySyncResult | ShopifyIntegrationError>
  getProduct(shopDomain: string, productId: string): Promise<ShopifyProduct | ShopifyIntegrationError>
}
