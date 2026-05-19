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
    ? "relative overflow-hidden rounded-[30px] border border-white/[0.03] bg-white/[0.02] px-3 py-3 text-left shadow-[0_16px_30px_-28px_rgba(0,0,0,0.58)]"
    : "relative overflow-hidden rounded-[30px] border border-black/[0.02] bg-background/34 px-3 py-3 text-left shadow-[0_10px_24px_-22px_rgba(15,23,42,0.12)]"
  const ambientOverlayClassName = isComposerContext
    ? "pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02),transparent_40%,rgba(255,255,255,0.01))]"
    : "pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.3),transparent_32%,rgba(255,255,255,0.12))] opacity-55"
  const mediaSurfaceClassName = isComposerContext
    ? "bg-white/[0.025] shadow-[0_18px_30px_-24px_rgba(0,0,0,0.46)] ring-1 ring-white/[0.04]"
    : "bg-secondary/36 shadow-[0_14px_24px_-20px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.03]"
  const titleClassName = isComposerContext
    ? "line-clamp-2 text-[17px] font-medium leading-[1.3] tracking-[-0.015em] text-white/92"
    : "line-clamp-2 text-[17px] font-medium leading-[1.3] tracking-[-0.015em] text-foreground/90"
  const descriptionClassName = isComposerContext
    ? "line-clamp-2 text-[14px] leading-[1.55] text-white/50"
    : "line-clamp-2 text-[14px] leading-[1.55] text-muted-foreground/84"
  const priceClassName = isComposerContext
    ? "text-[15px] font-medium tracking-[-0.01em] text-white/82"
    : "text-[15px] font-medium tracking-[-0.01em] text-foreground/80"
  const originalPriceClassName = isComposerContext
    ? "text-[12px] text-white/28 line-through"
    : "text-[12px] text-muted-foreground/72 line-through"
  const favoriteButtonClassName = isComposerContext
    ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.045] bg-white/[0.02] text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white/78"
    : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.03] bg-background/42 text-muted-foreground/72 transition-colors hover:bg-background/60 hover:text-foreground/80"
  const addButtonClassName = isComposerContext
    ? "my-auto h-10 w-10 rounded-full border border-white/[0.045] bg-white/[0.024] text-white/66 hover:bg-white/[0.055] hover:text-white/88"
    : "my-auto h-10 w-10 rounded-full border border-black/[0.03] bg-background/46 text-foreground/68 hover:bg-background/62 hover:text-foreground/86"
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
      <div className="relative z-[1] flex min-h-[132px] items-stretch gap-3">
        <div className={`relative h-auto w-[40%] min-w-[118px] max-w-[144px] shrink-0 overflow-hidden rounded-[26px] ${mediaSurfaceClassName}`}>
          <Image
            src={product.images[0]}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 40vw, 144px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_58%,rgba(255,255,255,0.1)_78%,rgba(255,255,255,0.18)),linear-gradient(180deg,rgba(255,255,255,0.12),transparent_34%,rgba(15,23,42,0.06))]"
          />
          {discount > 0 ? (
            <Badge className="absolute left-2 top-2 rounded-full border-0 bg-[rgba(125,97,74,0.76)] px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-[0_10px_18px_-16px_rgba(15,23,42,0.45)] backdrop-blur-sm">
              -{discount}%
            </Badge>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 py-1">
          <div className="flex h-full items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <p className={titleClassName}>{product.name}</p>
              {contextualDescription ? (
                <p className={`mt-2.5 ${descriptionClassName}`}>{contextualDescription}</p>
              ) : null}
              <div className="mt-4.5 flex items-baseline gap-2.5">
                <span className={priceClassName}>R$ {product.price.toFixed(2).replace(".", ",")}</span>
                {product.originalPrice ? (
                  <span className={originalPriceClassName}>
                    R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center self-stretch py-0.5">
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
                  className={`h-4 w-4 ${favorites.has(product.id) ? "fill-red-500 text-red-500" : isComposerContext ? "text-white/56" : "text-muted-foreground/70"}`}
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
