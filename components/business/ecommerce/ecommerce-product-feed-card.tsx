"use client"

import Image from "next/image"
import { Heart, ShoppingBag, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ContextSelectable } from "../context-selectable"
import type { ConversationContextItem } from "../conversational-ai"
import type { Product } from "@/lib/business-types"

export function toEcommerceProductConversationContextItem(product: Product): ConversationContextItem {
  return {
    id: `ecommerce-product-${product.id}`,
    title: product.name,
    image: product.images[0],
    subtitle: "Produto",
  }
}

interface EcommerceProductFeedCardProps {
  product: Product
  onSelectProduct: (product: Product) => void
  onAddToCart: (product: Product) => void
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
  renderContext?: "feed" | "composer"
}

export function EcommerceProductFeedCard({
  product,
  onSelectProduct,
  onAddToCart,
  favorites,
  onToggleFavorite,
  onToggleConversationContext,
  isInConversation,
  renderContext = "feed",
}: EcommerceProductFeedCardProps) {
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
  const contextItem = toEcommerceProductConversationContextItem(product)
  const isComposerContext = renderContext === "composer"
  const cardSurfaceClassName = isComposerContext
    ? "rounded-2xl border border-white/[0.06] bg-white/[0.04] p-2.5"
    : ""
  const mediaSurfaceClassName = isComposerContext ? "bg-white/[0.04]" : "bg-secondary"
  const titleClassName = isComposerContext ? "line-clamp-2 text-sm font-medium text-white/94" : "line-clamp-2 text-sm font-medium text-foreground"
  const metaClassName = isComposerContext ? "text-xs text-white/58" : "text-xs text-muted-foreground"
  const priceClassName = isComposerContext ? "font-bold text-white/96" : "font-bold text-accent"
  const originalPriceClassName = isComposerContext ? "text-xs text-white/35 line-through" : "text-xs text-muted-foreground line-through"
  const favoriteButtonClassName = isComposerContext
    ? "absolute right-2 top-2 rounded-full bg-white/[0.12] p-2 transition-colors hover:bg-white/[0.18]"
    : "absolute right-2 top-2 rounded-full bg-white/80 p-2 transition-colors hover:bg-white"
  const addButtonClassName = isComposerContext
    ? "mt-2 h-9 w-full bg-white/[0.14] text-white hover:bg-white/[0.2]"
    : "mt-2 h-9 w-full"

  return (
    <ContextSelectable
      as="div"
      onClick={() => onSelectProduct(product)}
      onLongPress={() => onToggleConversationContext?.(contextItem)}
      selected={isInConversation?.(contextItem.id) ?? false}
      className={`relative group ${cardSurfaceClassName}`}
    >
      <div className="w-full text-left">
        <div className={`relative aspect-square overflow-hidden rounded-xl ${mediaSurfaceClassName}`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {discount > 0 ? (
            <Badge className="absolute left-2 top-2 border-0 bg-red-500 text-white">-{discount}%</Badge>
          ) : null}
        </div>
        <div className="mt-2">
          <p className={titleClassName}>{product.name}</p>
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className={metaClassName}>
              {product.rating} ({product.reviewCount})
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={priceClassName}>R$ {product.price.toFixed(2).replace(".", ",")}</span>
            {product.originalPrice ? (
              <span className={originalPriceClassName}>
                R$ {product.originalPrice.toFixed(2).replace(".", ",")}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onToggleFavorite(product.id)
        }}
        className={favoriteButtonClassName}
        aria-label={`Favoritar ${product.name}`}
      >
        <Heart
          className={`h-4 w-4 ${favorites.has(product.id) ? "fill-red-500 text-red-500" : isComposerContext ? "text-white/70" : "text-gray-600"}`}
        />
      </button>
      <Button
        size="sm"
        className={addButtonClassName}
        onClick={(event) => {
          event.stopPropagation()
          onAddToCart(product)
        }}
      >
        <ShoppingBag className="mr-1 h-4 w-4" />
        Adicionar
      </Button>
    </ContextSelectable>
  )
}
