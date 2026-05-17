"use client"

import Image from "next/image"
import { Bookmark, Heart, MessageCircle, Share2, ShoppingBag, Star, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Product, ProductReview } from "@/lib/business-types"
import { ConversationSurfaceAdapter } from "../conversation-surface-adapter"

function formatPrice(value?: number) {
  if (typeof value !== "number") return null
  return `R$ ${value.toFixed(2).replace(".", ",")}`
}

function getDiscount(product: Product) {
  if (!product.originalPrice || product.originalPrice <= product.price) {
    return 0
  }

  return Math.round((1 - product.price / product.originalPrice) * 100)
}

interface EcommerceProductSurfaceCardProps {
  product: Product
  variant?: "feed" | "conversation"
  isFavorite?: boolean
  onToggleFavorite?: () => void
  onPrimaryAction?: () => void
  primaryActionLabel?: string
}

export function EcommerceProductSurfaceCard({
  product,
  variant = "feed",
  isFavorite = false,
  onToggleFavorite,
  onPrimaryAction,
  primaryActionLabel = "Adicionar",
}: EcommerceProductSurfaceCardProps) {
  const isConversation = variant === "conversation"
  const discount = getDiscount(product)

  return (
    <article className="w-full text-left">
      <div
        className={cn(
          "relative aspect-square overflow-hidden bg-secondary",
          isConversation ? "rounded-[32px]" : "rounded-xl"
        )}
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className={cn(
            "object-cover transition-transform duration-300",
            !isConversation && "group-hover:scale-105"
          )}
        />
        {discount > 0 ? (
          <Badge
            className={cn(
              "absolute left-2 top-2 border-0 bg-red-500 text-white",
              isConversation && "left-3 top-3 rounded-full px-3 py-1 text-sm"
            )}
          >
            -{discount}%
          </Badge>
        ) : null}

        <button
          type="button"
          onClick={onToggleFavorite}
          className={cn(
            "absolute right-2 top-2 rounded-full bg-white/85 p-2 text-gray-600 shadow-sm transition-colors hover:bg-white",
            isConversation && "right-3 top-3 h-14 w-14 p-0"
          )}
          aria-label={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
        >
          <Heart
            className={cn(
              "mx-auto h-4 w-4",
              isConversation && "h-7 w-7",
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
            )}
          />
        </button>
      </div>

      <div className={cn("mt-2", isConversation && "mt-4")}>
        <h3
          className={cn(
            "text-foreground",
            isConversation
              ? "text-[18px] font-semibold leading-tight"
              : "line-clamp-2 text-sm font-medium"
          )}
        >
          {product.name}
        </h3>

        <div className={cn("mt-1 flex items-center gap-1", isConversation && "mt-2 gap-1.5")}>
          <Star
            className={cn(
              "fill-yellow-400 text-yellow-400",
              isConversation ? "h-5 w-5" : "h-3 w-3"
            )}
          />
          <span className={cn("text-muted-foreground", isConversation ? "text-base" : "text-xs")}>
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        <div className={cn("mt-1 flex items-baseline gap-2", isConversation && "mt-3")}>
          <span className={cn("font-bold text-accent", isConversation ? "text-[18px]" : "text-base")}>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice ? (
            <span className={cn("text-muted-foreground line-through", isConversation ? "text-base" : "text-xs")}>
              {formatPrice(product.originalPrice)}
            </span>
          ) : null}
        </div>

      </div>

      <Button
        type="button"
        size={isConversation ? "default" : "sm"}
        className={cn(
          "mt-3 w-full",
          isConversation && "h-14 rounded-[18px] text-[16px] shadow-[0_18px_40px_-26px_rgba(0,0,0,0.45)]"
        )}
        onClick={onPrimaryAction}
      >
        <ShoppingBag className={cn("mr-2", isConversation ? "h-5 w-5" : "h-4 w-4")} />
        {primaryActionLabel}
      </Button>
    </article>
  )
}

interface EcommerceFreeShippingBannerProps {
  product: Product
}

export function EcommerceFreeShippingBanner({ product }: EcommerceFreeShippingBannerProps) {
  if (!product.shipping?.freeShippingMinimum) {
    return null
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
      <Truck className="h-6 w-6 text-green-600" />
      <div>
        <p className="font-medium text-green-700 dark:text-green-400">Frete gratis</p>
        <p className="text-sm text-green-600 dark:text-green-500">
          Em compras acima de {formatPrice(product.shipping.freeShippingMinimum)}
        </p>
      </div>
    </div>
  )
}

interface EcommerceReviewSurfaceCardProps {
  review: ProductReview
  supportingAvatars?: string[]
}

export function EcommerceReviewSurfaceCard({
  review,
  supportingAvatars = [],
}: EcommerceReviewSurfaceCardProps) {
  return (
    <article className="rounded-[26px] border border-border/50 bg-card p-4 shadow-[0_20px_46px_-36px_rgba(0,0,0,0.35)]">
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
          <Image src={review.userAvatar} alt={review.userName} fill className="object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold text-foreground">{review.userName}</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={cn(
                    "h-4 w-4",
                    index < review.rating ? "fill-yellow-400 text-yellow-400" : "text-border"
                  )}
                />
              ))}
            </div>
          </div>

          <p className="mt-2 text-[15px] leading-relaxed text-foreground">{review.comment}</p>
        </div>
      </div>

      {supportingAvatars.length > 0 ? (
        <div className="mt-4 flex items-center gap-3">
          <div className="flex -space-x-2">
            {supportingAvatars.slice(0, 3).map((avatar, index) => (
              <div
                key={`${avatar}-${index}`}
                className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-background"
              >
                <Image src={avatar} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {review.helpful} pessoas acharam essa avaliacao util
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-5">
          <Heart className="h-6 w-6" />
          <MessageCircle className="h-6 w-6" />
          <Share2 className="h-6 w-6" />
        </div>
        <Bookmark className="h-6 w-6" />
      </div>
    </article>
  )
}

interface EcommerceProductOperationalSurfaceProps {
  product: Product
  reviews?: ProductReview[]
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export function EcommerceProductOperationalSurface({
  product,
  reviews = [],
  isFavorite = false,
  onToggleFavorite,
}: EcommerceProductOperationalSurfaceProps) {
  const review = reviews[0] || null
  const supportingAvatars = reviews.map((candidate) => candidate.userAvatar)
  const highlightedSpecs = product.specifications?.slice(0, 3) || []

  return (
    <ConversationSurfaceAdapter mode="immersive">
      <EcommerceProductSurfaceCard
        product={product}
        variant="conversation"
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        primaryActionLabel="Adicionar"
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
          {product.category}
        </Badge>
        {product.subcategory ? (
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
            {product.subcategory}
          </Badge>
        ) : null}
        {product.variants?.length ? (
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
            {product.variants.length} opcoes
          </Badge>
        ) : null}
        {highlightedSpecs.map((spec) => (
          <Badge
            key={`${spec.label}-${spec.value}`}
            variant="secondary"
            className="rounded-full px-3 py-1 text-xs font-medium"
          >
            {spec.label}: {spec.value}
          </Badge>
        ))}
      </div>

      <EcommerceFreeShippingBanner product={product} />

      {review ? (
        <EcommerceReviewSurfaceCard review={review} supportingAvatars={supportingAvatars} />
      ) : null}
    </ConversationSurfaceAdapter>
  )
}
