"use client"

import Image from "next/image"
import { ChevronRight, Heart, Plus } from "lucide-react"
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

  // ── FEED: horizontal editorial layout ──────────────────────────────────
  if (!isComposerContext) {
    return (
      <ContextSelectable
        as="div"
        dataMorphSourceId={contextItem.id}
        onClick={() => onSelectProduct(product)}
        onLongPress={() => onToggleConversationContext?.(contextItem)}
        selected={isInConversation?.(contextItem.id) ?? false}
        className="relative group rounded-2xl bg-card overflow-hidden shadow-[0_1px_6px_-1px_rgba(0,0,0,0.07)]"
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id) }}
          className="absolute right-3 top-3 z-10 rounded-full p-1 text-muted-foreground/35 transition-colors hover:text-muted-foreground/70"
          aria-label={`Salvar ${product.name}`}
        >
          <Heart
            className={`h-[16px] w-[16px] ${favorites.has(product.id) ? "fill-red-500/90 text-red-500" : ""}`}
          />
        </button>

        <div className="flex items-stretch">
          {/* Image */}
          <div className="relative w-[120px] min-h-[120px] flex-shrink-0 self-stretch bg-muted">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {discount > 0 && (
              <Badge className="absolute left-2 top-2 border-0 bg-foreground/65 text-[10px] font-medium text-background">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Text — discovery-first; cart lives in drawer */}
          <div className="flex min-w-0 flex-1 items-center gap-2 p-4 pr-3">
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-foreground">
                {product.name}
              </p>
              {product.description && (
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              )}
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[14px] font-medium tracking-tight text-foreground/90">
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-muted-foreground/80 line-through">
                    R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/55" aria-hidden />
          </div>
        </div>
      </ContextSelectable>
    )
  }

  // ── COMPOSER: compact horizontal row ───────────────────────────────────
  return (
    <ContextSelectable
      as="div"
      dataMorphSourceId={contextItem.id}
      onClick={() => onSelectProduct(product)}
      onLongPress={() => onToggleConversationContext?.(contextItem)}
      selected={isInConversation?.(contextItem.id) ?? false}
      className="relative group overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.06]"
    >
      <div className="flex">
        {/* Image – flush left */}
        <div className="relative w-[80px] min-h-[80px] flex-shrink-0 self-stretch">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {discount > 0 && (
            <Badge className="absolute left-1.5 top-1.5 border-0 bg-black/50 text-[9px] font-medium text-white/90">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Text */}
        <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-3">
          <p className="line-clamp-2 text-[13px] font-medium leading-snug text-white/90">
            {product.name}
          </p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[13px] font-bold tracking-tight text-white/95">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] text-white/35 line-through">
                R$ {product.originalPrice.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 flex-col items-center justify-between py-3 pr-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id) }}
            className="rounded-full p-0.5 text-white/30 transition-colors hover:text-white/70"
            aria-label={`Favoritar ${product.name}`}
          >
            <Heart className={`h-4 w-4 ${favorites.has(product.id) ? "fill-red-500 text-red-500" : ""}`} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAddToCart(product) }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] transition-colors hover:bg-white/[0.12]"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <Plus className="h-3.5 w-3.5 text-white/60" />
          </button>
        </div>
      </div>
    </ContextSelectable>
  )
}
