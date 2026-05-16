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

export interface ConversationalSearchProductResult {
  id: string
  title: string
  image: string
  price?: number
  ctaLabel?: string
}
