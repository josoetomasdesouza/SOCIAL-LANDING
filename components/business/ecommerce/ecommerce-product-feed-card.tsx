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
    ? "relative overflow-hidden rounded-[28px] border border-white/[0.035] bg-white/[0.025] px-3.5 py-3.5 text-left shadow-[0_18px_36px_-30px_rgba(0,0,0,0.66)]"
    : "relative overflow-hidden rounded-[28px] border border-black/[0.03] bg-background/45 px-3.5 py-3.5 text-left shadow-[0_12px_28px_-24px_rgba(15,23,42,0.14)]"
  const ambientOverlayClassName = isComposerContext
    ? "pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03),transparent_38%,rgba(255,255,255,0.015))]"
    : "pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.42),transparent_34%,rgba(255,255,255,0.16))] opacity-60"
  const mediaSurfaceClassName = isComposerContext
    ? "bg-white/[0.03] shadow-[0_20px_34px_-24px_rgba(0,0,0,0.52)] ring-1 ring-white/[0.045]"
    : "bg-secondary/42 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.14)] ring-1 ring-black/[0.035]"
  const titleClassName = isComposerContext
    ? "line-clamp-2 text-[18px] font-medium leading-[1.3] tracking-[-0.015em] text-white/94"
    : "line-clamp-2 text-[18px] font-medium leading-[1.3] tracking-[-0.015em] text-foreground/92"
  const descriptionClassName = isComposerContext
    ? "line-clamp-2 text-[14px] leading-[1.5] text-white/52"
    : "line-clamp-2 text-[14px] leading-[1.5] text-muted-foreground/88"
  const priceClassName = isComposerContext
    ? "text-[15px] font-medium tracking-[-0.01em] text-white/84"
    : "text-[15px] font-medium tracking-[-0.01em] text-foreground/82"
  const originalPriceClassName = isComposerContext
    ? "text-[12px] text-white/28 line-through"
    : "text-[12px] text-muted-foreground/72 line-through"
  const favoriteButtonClassName = isComposerContext
    ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.035] text-white/56 transition-colors hover:bg-white/[0.07] hover:text-white/84"
    : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.04] bg-background/58 text-muted-foreground/78 transition-colors hover:bg-background/72 hover:text-foreground/84"
  const addButtonClassName = isComposerContext
    ? "mt-auto h-10 w-10 rounded-full border border-white/[0.06] bg-white/[0.04] text-white/72 hover:bg-white/[0.08] hover:text-white"
    : "mt-auto h-10 w-10 rounded-full border border-black/[0.04] bg-background/62 text-foreground/74 hover:bg-background/76 hover:text-foreground"
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
      <div aria-hidden="true" className={ambientOverlayClassName} />
      <div className="relative z-[1] flex items-start gap-3.5">
        <div className={`relative h-[108px] w-[124px] shrink-0 overflow-hidden rounded-[24px] ${mediaSurfaceClassName}`}>
          <Image
            src={product.images[0]}
            alt={imageAlt}
            fill
            sizes="124px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),transparent_32%,rgba(15,23,42,0.06))]"
          />
          {discount > 0 ? (
            <Badge className="absolute left-2 top-2 rounded-full border-0 bg-black/28 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-[0_12px_24px_-18px_rgba(15,23,42,0.55)] backdrop-blur-md">
              -{discount}%
            </Badge>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className={titleClassName}>{product.name}</p>
              {contextualDescription ? (
                <p className={`mt-2 ${descriptionClassName}`}>{contextualDescription}</p>
              ) : null}
              <div className="mt-4 flex items-baseline gap-2.5">
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
                  className={`h-4 w-4 ${favorites.has(product.id) ? "fill-red-500 text-red-500" : isComposerContext ? "text-white/60" : "text-muted-foreground/76"}`}
                />
              </button>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                className={addButtonClassName}
                onClick={(event) => {
                  event.stopPropagation()
                  onAddToCart(product)
                }}
                aria-label={`Adicionar ${product.name} ao carrinho`}
              >
                <Plus className="h-[15px] w-[15px]" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ContextSelectable>
  )
}
