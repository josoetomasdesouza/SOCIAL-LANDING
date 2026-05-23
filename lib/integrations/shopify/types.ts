export interface ShopifyProduct {
  readonly id: string
  readonly title: string
  readonly handle: string
  readonly price: number
  readonly currency: string
  readonly imageUrl?: string
}

export interface ShopifySyncResult {
  readonly products: readonly ShopifyProduct[]
  readonly syncedAt: string
}

export type ShopifyIntegrationErrorCode = "NOT_CONFIGURED" | "AUTH_REQUIRED" | "PROVIDER_ERROR"

export interface ShopifyIntegrationError {
  readonly code: ShopifyIntegrationErrorCode
  readonly message: string
}
