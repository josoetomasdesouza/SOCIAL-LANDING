"use client"

import Image from "next/image"
import { Heart, Plus } from "lucide-react"
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
  const contextualDescription = product.description?.trim() || product.fullDescription?.trim() || ""
  const cardSurfaceClassName = isComposerContext
    ? "relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-white/[0.04] px-3 py-3 text-left shadow-[0_18px_42px_-32px_rgba(0,0,0,0.72)]"
    : "relative overflow-hidden rounded-[24px] bg-card/96 px-3 py-3 text-left shadow-[0_20px_42px_-32px_rgba(15,23,42,0.28)] ring-1 ring-black/5"
  const mediaSurfaceClassName = isComposerContext ? "bg-white/[0.04]" : "bg-secondary/80"
  const eyebrowClassName = isComposerContext
    ? "text-[10px] font-medium uppercase tracking-[0.18em] text-white/42"
    : "text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80"
  const titleClassName = isComposerContext
    ? "line-clamp-2 text-[15px] font-medium leading-5 text-white/96"
    : "line-clamp-2 text-[15px] font-medium leading-5 text-foreground"
  const descriptionClassName = isComposerContext
    ? "line-clamp-2 text-sm leading-5 text-white/58"
    : "line-clamp-2 text-sm leading-5 text-muted-foreground"
  const priceClassName = isComposerContext ? "text-lg font-semibold tracking-[-0.01em] text-white/96" : "text-lg font-semibold tracking-[-0.01em] text-foreground"
  const originalPriceClassName = isComposerContext ? "text-xs text-white/35 line-through" : "text-xs text-muted-foreground line-through"
  const favoriteButtonClassName = isComposerContext
    ? "inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] text-white/70 transition-colors hover:bg-white/[0.14] hover:text-white"
    : "inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary/80 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
  const addButtonClassName = isComposerContext
    ? "mt-auto h-9 w-9 rounded-full bg-white/[0.14] text-white hover:bg-white/[0.2]"
    : "mt-auto h-9 w-9 rounded-full bg-secondary text-foreground hover:bg-secondary/80"
  const recommendationLabel = isComposerContext ? "Sugestao relacionada" : "Escolha da curadoria"
  const imageAlt = product.name

  return (
    <ContextSelectable
      as="div"
      dataMorphSourceId={contextItem.id}
      onClick={() => onSelectProduct(product)}
      onLongPress={() => onToggleConversationContext?.(contextItem)}
      selected={isInConversation?.(contextItem.id) ?? false}
      className={`group ${cardSurfaceClassName}`}
    >
      <div className="flex items-start gap-3">
        <div className={`relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[20px] ${mediaSurfaceClassName}`}>
          <Image
            src={product.images[0]}
            alt={imageAlt}
            fill
            sizes="88px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {discount > 0 ? (
            <Badge className="absolute left-2 top-2 rounded-full border-0 bg-red-500/92 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
              -{discount}%
            </Badge>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className={eyebrowClassName}>{recommendationLabel}</p>
              <p className={`mt-1 ${titleClassName}`}>{product.name}</p>
              {contextualDescription ? (
                <p className={`mt-1 ${descriptionClassName}`}>{contextualDescription}</p>
              ) : null}
              <div className="mt-3 flex items-baseline gap-2">
                <span className={priceClassName}>R$ {product.price.toFixed(2).replace(".", ",")}</span>
                {product.originalPrice ? (
                  <span className={originalPriceClassName}>
                    R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-2 self-stretch">
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
                  className={`h-4 w-4 ${favorites.has(product.id) ? "fill-red-500 text-red-500" : isComposerContext ? "text-white/70" : "text-muted-foreground"}`}
                />
              </button>

              <Button
                type="button"
                size="icon"
                className={addButtonClassName}
                onClick={(event) => {
                  event.stopPropagation()
                  onAddToCart(product)
                }}
                aria-label={`Adicionar ${product.name} ao carrinho`}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ContextSelectable>
  )
}
