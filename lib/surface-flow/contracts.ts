export type SurfaceMode = "feed" | "conversation" | "drawer"

export type SurfaceIntent = "discover" | "deepen" | "execute"

export interface ProductEntity {
  id: string
  title: string
  image: string
  summary?: string
  price?: number
  originalPrice?: number
  category?: string
  rating?: number
  reviewCount?: number
  keywords?: string[]
}

export interface ProductFlow {
  productId: string
  entrySurface: SurfaceMode
  intent: SurfaceIntent
  detailTarget: "product-drawer"
  executeTarget?: "cart" | "checkout"
  requiresVariantSelection?: boolean
}

export type ProductFlowAction = "open_detail" | "add_to_cart" | "start_checkout"

export interface ProductFlowRequest {
  productId?: string
  action: ProductFlowAction
  sourceSurface: SurfaceMode
  intent: SurfaceIntent
  quantity?: number
  selectedVariants?: Record<string, string>
  openCartAfterAdd?: boolean
}

export interface ProductFlowContext {
  hasVariants: boolean
  requiredVariantIds?: string[]
}

export type ProductFlowResult =
  | {
      type: "open_detail"
      productId: string
      reason: "view_detail" | "requires_variant_selection"
    }
  | {
      type: "add_to_cart"
      productId: string
      quantity: number
      selectedVariants?: Record<string, string>
      openCartAfterAdd: boolean
    }
  | {
      type: "start_checkout"
    }
  | {
      type: "noop"
      reason: string
    }

export interface ConversationalSearchProductResult {
  id: string
  title: string
  image: string
  price?: number
  ctaLabel?: string
}
