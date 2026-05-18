"use client"

import Image from "next/image"
import { Heart, ShoppingBag, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
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
  const isComposer = renderContext === "composer"

  return (
    <ContextSelectable
      as="div"
      onClick={() => onSelectProduct(product)}
      onLongPress={() => onToggleConversationContext?.(contextItem)}
      selected={isInConversation?.(contextItem.id) ?? false}
      className={cn(
        "relative group",
        isComposer &&
          "rounded-[24px] border border-white/[0.08] bg-[rgba(49,55,64,0.82)] p-2.5 shadow-[0_24px_54px_-34px_rgba(0,0,0,0.58)]"
      )}
    >
      <div className="w-full text-left">
        <div
          className={cn(
            "relative aspect-square overflow-hidden rounded-xl bg-secondary",
            isComposer && "bg-black/20"
          )}
        >
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
          <p className={cn("line-clamp-2 text-sm font-medium text-foreground", isComposer && "text-white/[0.96]")}>
            {product.name}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className={cn("text-xs text-muted-foreground", isComposer && "text-slate-300")}>
              {product.rating} ({product.reviewCount})
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-bold text-accent">R$ {product.price.toFixed(2).replace(".", ",")}</span>
            {product.originalPrice ? (
              <span className={cn("text-xs text-muted-foreground line-through", isComposer && "text-slate-400")}>
                R$ {product.originalPrice.toFixed(2).replace(".", ",")}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onToggleFavorite(product.id)}
        className={cn(
          "absolute right-2 top-2 rounded-full bg-white/80 p-2 transition-colors hover:bg-white",
          isComposer && "bg-white/[0.9] hover:bg-white"
        )}
        aria-label={`Favoritar ${product.name}`}
      >
        <Heart
          className={`h-4 w-4 ${favorites.has(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`}
        />
      </button>
      <Button
        size="sm"
        className={cn(
          "mt-2 h-9 w-full",
          isComposer && "bg-white/[0.96] text-[rgba(7,16,24,0.94)] hover:bg-white/90"
        )}
        onClick={() => onAddToCart(product)}
      >
        <ShoppingBag className="mr-1 h-4 w-4" />
        Adicionar
      </Button>
    </ContextSelectable>
  )
}
