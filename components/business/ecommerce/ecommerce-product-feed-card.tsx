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
    ? "relative overflow-hidden rounded-[26px] border border-white/[0.045] bg-white/[0.032] px-3 py-3 text-left shadow-[0_18px_38px_-32px_rgba(0,0,0,0.72)] backdrop-blur-[10px]"
    : "relative overflow-hidden rounded-[26px] border border-black/[0.04] bg-background/72 px-3 py-3 text-left shadow-[0_16px_30px_-26px_rgba(15,23,42,0.18)] backdrop-blur-[10px]"
  const ambientOverlayClassName = isComposerContext
    ? "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]"
    : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.88),transparent_52%),linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,255,255,0.18))] opacity-70"
  const mediaSurfaceClassName = isComposerContext
    ? "bg-white/[0.035] shadow-[0_16px_28px_-20px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.05]"
    : "bg-secondary/55 shadow-[0_14px_26px_-20px_rgba(15,23,42,0.16)] ring-1 ring-black/[0.04]"
  const eyebrowClassName = isComposerContext
    ? "text-[10px] font-medium uppercase tracking-[0.18em] text-white/42"
    : "text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80"
  const titleClassName = isComposerContext
    ? "line-clamp-2 text-[15px] font-medium leading-5 text-white/96"
    : "line-clamp-2 text-[15px] font-medium leading-5 text-foreground"
  const descriptionClassName = isComposerContext
    ? "line-clamp-2 text-sm leading-5 text-white/54"
    : "line-clamp-2 text-sm leading-5 text-muted-foreground/90"
  const priceClassName = isComposerContext
    ? "text-[17px] font-medium tracking-[-0.01em] text-white/90"
    : "text-[17px] font-medium tracking-[-0.01em] text-foreground/88"
  const originalPriceClassName = isComposerContext
    ? "text-[11px] text-white/32 line-through"
    : "text-[11px] text-muted-foreground/80 line-through"
  const favoriteButtonClassName = isComposerContext
    ? "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05] text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md transition-colors hover:bg-white/[0.09] hover:text-white/88"
    : "inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.05] bg-background/72 text-muted-foreground/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-md transition-colors hover:bg-background/88 hover:text-foreground/88"
  const addButtonClassName = isComposerContext
    ? "mt-auto h-9 w-9 rounded-full border border-white/[0.08] bg-white/[0.06] text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md hover:bg-white/[0.1] hover:text-white"
    : "mt-auto h-9 w-9 rounded-full border border-black/[0.05] bg-background/76 text-foreground/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-md hover:bg-background/90 hover:text-foreground"
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
      <div aria-hidden="true" className={ambientOverlayClassName} />
      <div className="relative z-[1] flex items-start gap-3">
        <div className={`relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[22px] ${mediaSurfaceClassName}`}>
          <Image
            src={product.images[0]}
            alt={imageAlt}
            fill
            sizes="88px"
            className="object-cover saturate-[0.97] transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_36%,rgba(15,23,42,0.08))]"
          />
          {discount > 0 ? (
            <Badge className="absolute left-2 top-2 rounded-full border-0 bg-red-500/80 px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_10px_20px_-16px_rgba(239,68,68,0.9)] backdrop-blur-sm">
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
                  className={`h-4 w-4 ${favorites.has(product.id) ? "fill-red-500 text-red-500" : isComposerContext ? "text-white/64" : "text-muted-foreground/80"}`}
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
