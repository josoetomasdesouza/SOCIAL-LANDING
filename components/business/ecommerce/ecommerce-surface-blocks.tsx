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
  onCardClick?: () => void
  onToggleFavorite?: () => void
  onPrimaryAction?: () => void
  primaryActionLabel?: string
  primaryActionDisabled?: boolean
}

export function EcommerceProductSurfaceCard({
  product,
  variant = "feed",
  isFavorite = false,
  onCardClick,
  onToggleFavorite,
  onPrimaryAction,
  primaryActionLabel = "Adicionar",
  primaryActionDisabled = false,
}: EcommerceProductSurfaceCardProps) {
  const isConversation = variant === "conversation"
  const discount = getDiscount(product)
  const isCardInteractive = typeof onCardClick === "function"

  return (
    <article className="w-full text-left">
      <div
        role={isCardInteractive ? "button" : undefined}
        tabIndex={isCardInteractive ? 0 : undefined}
        onClick={onCardClick}
        onKeyDown={(event) => {
          if (!isCardInteractive) return
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            onCardClick()
          }
        }}
        className={cn(isCardInteractive && "cursor-pointer")}
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
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
            <Badge className="absolute left-2 top-2 border-0 bg-red-500 text-white">
              -{discount}%
            </Badge>
          ) : null}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onToggleFavorite?.()
            }}
            className="absolute right-2 top-2 rounded-full bg-white/85 p-2 text-gray-600 shadow-sm transition-colors hover:bg-white"
            aria-label={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
          >
            <Heart
              className={cn(
                "mx-auto h-4 w-4",
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
              )}
            />
          </button>
        </div>

        <div className="mt-2">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground">{product.name}</h3>

          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-muted-foreground">
              {product.rating} ({product.reviewCount})
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-base font-bold text-accent">{formatPrice(product.price)}</span>
            {product.originalPrice ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        className="mt-3 h-9 w-full"
        disabled={primaryActionDisabled}
        onClick={(event) => {
          event.stopPropagation()
          onPrimaryAction?.()
        }}
      >
        <ShoppingBag className="mr-1 h-4 w-4" />
        {primaryActionLabel}
      </Button>
    </article>
  )
}

interface EcommerceProductResultsCarouselProps {
  products: Product[]
  favorites?: Set<string>
  onSelectProduct: (productId: string) => void
  onToggleFavorite?: (productId: string) => void
}

export function EcommerceProductResultsCarousel({
  products,
  favorites,
  onSelectProduct,
  onToggleFavorite,
}: EcommerceProductResultsCarouselProps) {
  if (products.length === 0) return null

  return (
    <ConversationSurfaceAdapter mode="immersive" className="space-y-3">
      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-3 pr-4">
          {products.map((product) => (
            <div key={product.id} className="w-[220px] shrink-0">
              <EcommerceProductSurfaceCard
                product={product}
                variant="conversation"
                isFavorite={favorites?.has(product.id) ?? false}
                onCardClick={() => onSelectProduct(product.id)}
                onToggleFavorite={
                  onToggleFavorite ? () => onToggleFavorite(product.id) : undefined
                }
                onPrimaryAction={() => onSelectProduct(product.id)}
                primaryActionLabel="Ver"
              />
            </div>
          ))}
        </div>
      </div>
    </ConversationSurfaceAdapter>
  )
}

interface EcommerceConversationProductDetailProps {
  product: Product
  isFavorite?: boolean
  onToggleFavorite?: () => void
  onPrimaryAction: () => void
}

export function EcommerceConversationProductDetail({
  product,
  isFavorite = false,
  onToggleFavorite,
  onPrimaryAction,
}: EcommerceConversationProductDetailProps) {
  return (
    <ConversationSurfaceAdapter mode="immersive" className="space-y-4">
      <div className="mx-auto w-full max-w-[340px]">
        <EcommerceProductSurfaceCard
          product={product}
          variant="conversation"
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onPrimaryAction={onPrimaryAction}
          primaryActionLabel="Continuar"
        />
      </div>

      <div className="rounded-[20px] border border-border/50 bg-background/70 p-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
      </div>
    </ConversationSurfaceAdapter>
  )
}

interface EcommerceConversationStepPlaceholderProps {
  product: Product
}

export function EcommerceConversationStepPlaceholder({
  product,
}: EcommerceConversationStepPlaceholderProps) {
  return (
    <ConversationSurfaceAdapter mode="immersive" className="space-y-4">
      <div className="mx-auto w-full max-w-[340px]">
        <EcommerceProductSurfaceCard
          product={product}
          variant="conversation"
          primaryActionLabel="Em breve"
          primaryActionDisabled
        />
      </div>

      <div className="rounded-[20px] border border-border/50 bg-secondary/20 p-4">
        <p className="text-sm font-medium text-foreground">Proxima etapa pronta para entrar no fluxo.</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Opcoes, carrinho e confirmacao assistida entram na proxima microfase, sem sair da conversa.
        </p>
      </div>
    </ConversationSurfaceAdapter>
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
  step: "product-entry" | "product-detail" | "product-options"
  products?: Product[]
  product?: Product | null
  favorites?: Set<string>
  onSelectProduct: (productId: string) => void
  onAdvance: () => void
  onToggleFavorite?: (productId: string) => void
}

export function EcommerceProductOperationalSurface({
  step,
  products = [],
  product,
  favorites,
  onSelectProduct,
  onAdvance,
  onToggleFavorite,
}: EcommerceProductOperationalSurfaceProps) {
  if (step === "product-entry") {
    return (
      <EcommerceProductResultsCarousel
        products={products}
        favorites={favorites}
        onSelectProduct={onSelectProduct}
        onToggleFavorite={onToggleFavorite}
      />
    )
  }

  if (!product) {
    return null
  }

  if (step === "product-options") {
    return <EcommerceConversationStepPlaceholder product={product} />
  }

  return (
    <EcommerceConversationProductDetail
      product={product}
      isFavorite={favorites?.has(product.id) ?? false}
      onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(product.id) : undefined}
      onPrimaryAction={onAdvance}
    />
  )
}
