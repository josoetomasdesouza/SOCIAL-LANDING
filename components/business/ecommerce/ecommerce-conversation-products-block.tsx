"use client"

import { useMemo, useState } from "react"
import type { Product } from "@/lib/business-types"
import type { ConversationContextItem } from "../conversational-ai"
import { EcommerceProductDetailPanel, type EcommerceSelectedVariant } from "./ecommerce-product-detail-panel"
import { EcommerceProductFeedCard } from "./ecommerce-product-feed-card"

interface EcommerceConversationProductsBlockProps {
  products: Product[]
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
  onAddToCart: (product: Product, quantity: number, selectedVariants: EcommerceSelectedVariant[]) => void
}

export function EcommerceConversationProductsBlock({
  products,
  favorites,
  onToggleFavorite,
  onToggleConversationContext,
  isInConversation,
  onAddToCart,
}: EcommerceConversationProductsBlockProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  )

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <EcommerceProductFeedCard
            key={product.id}
            product={product}
            renderContext="composer"
            onSelectProduct={(selectedProduct) => setSelectedProductId(selectedProduct.id)}
            onAddToCart={(selected) => {
              if (selected.variants && selected.variants.length > 0) {
                setSelectedProductId(selected.id)
                return
              }

              onAddToCart(selected, 1, [])
            }}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onToggleConversationContext={onToggleConversationContext}
            isInConversation={isInConversation}
          />
        ))}
      </div>

      {selectedProduct ? (
        <EcommerceProductDetailPanel
          product={selectedProduct}
          onAddToCart={(product, quantity, selectedVariants) => {
            onAddToCart(product, quantity, selectedVariants)
            setSelectedProductId(null)
          }}
          isFavorite={favorites.has(selectedProduct.id)}
          onToggleFavorite={() => onToggleFavorite(selectedProduct.id)}
          onToggleConversationContext={onToggleConversationContext}
          isInConversation={isInConversation}
          renderContext="composer"
          onClose={() => setSelectedProductId(null)}
        />
      ) : null}
    </div>
  )
}
