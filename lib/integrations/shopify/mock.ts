import type { ShopifyPort } from "./port"
import type { ShopifySyncResult } from "./types"

export class ShopifyMockAdapter implements ShopifyPort {
  readonly provider = "shopify" as const

  isConfigured(): boolean {
    return true
  }

  async syncProducts(_shopDomain: string, limit = 5): Promise<ShopifySyncResult> {
    return {
      syncedAt: new Date().toISOString(),
      products: Array.from({ length: limit }, (_, index) => ({
        id: `shopify-mock-${index + 1}`,
        title: `Mock Product ${index + 1}`,
        handle: `mock-product-${index + 1}`,
        price: 49.9 + index * 10,
        currency: "BRL",
        imageUrl: `https://picsum.photos/seed/shop-${index}/400/400`,
      })),
    }
  }

  async getProduct(_shopDomain: string, productId: string) {
    return {
      id: productId,
      title: "Mock Product",
      handle: "mock-product",
      price: 99.9,
      currency: "BRL",
    }
  }
}

export const shopifyMockAdapter = new ShopifyMockAdapter()
