"use client"

import { useState } from "react"
import Image from "next/image"
import { Bookmark, Heart, MessageCircle, Minus, Plus, Share2, ShoppingBag, Star, Truck } from "lucide-react"
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

type SelectedVariantsById = Record<string, string>

type SelectedVariant = {
  id: string
  name: string
  option: NonNullable<Product["variants"]>[number]["options"][number]
}

function getSelectedVariants(product: Product, selectedById: SelectedVariantsById): SelectedVariant[] {
  return (
    product.variants
      ?.map((variant) => {
        const selectedOption = variant.options.find((option) => option.id === selectedById[variant.id])
        if (!selectedOption) return null

        return {
          id: variant.id,
          name: variant.name,
          option: selectedOption,
        }
      })
      .filter((variant): variant is SelectedVariant => Boolean(variant)) || []
  )
}

function getVariantPriceModifier(selectedVariants: SelectedVariant[] = []) {
  return selectedVariants.reduce((sum, variant) => sum + (variant.option.priceModifier || 0), 0)
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
  onPrimaryAction: (productId: string) => void
  onToggleFavorite?: (productId: string) => void
}

export function EcommerceProductResultsCarousel({
  products,
  favorites,
  onSelectProduct,
  onPrimaryAction,
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
                onPrimaryAction={() => onPrimaryAction(product.id)}
                primaryActionLabel="Adicionar"
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
  reviews?: ProductReview[]
  selectedVariantsById?: SelectedVariantsById
  quantity?: number
  onSelectVariant?: (variantId: string, optionId: string) => void
  onChangeQuantity?: (quantity: number) => void
  onPrimaryAction: () => void
  footer?: React.ReactNode
  hideActionButton?: boolean
}

export function EcommerceConversationProductDetail({
  product,
  isFavorite = false,
  onToggleFavorite,
  reviews = [],
  selectedVariantsById = {},
  quantity = 1,
  onSelectVariant,
  onChangeQuantity,
  onPrimaryAction,
  footer,
  hideActionButton = false,
}: EcommerceConversationProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const discount = getDiscount(product)
  const resolvedVariants = getSelectedVariants(product, selectedVariantsById)
  const missingRequiredVariant = product.variants?.some((variant) => !selectedVariantsById[variant.id]) || false
  const unitPrice = product.price + getVariantPriceModifier(resolvedVariants)
  const totalPrice = unitPrice * quantity

  return (
    <ConversationSurfaceAdapter mode="immersive" className="space-y-4">
      <div className="space-y-5">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
            <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover" />
            {discount > 0 ? (
              <Badge className="absolute left-3 top-3 border-0 bg-red-500 text-sm text-white">-{discount}%</Badge>
            ) : null}
            <button
              type="button"
              onClick={onToggleFavorite}
              className="absolute right-3 top-3 rounded-full bg-white/80 p-2 transition-colors hover:bg-white"
              aria-label={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
            >
              <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-500" : "text-gray-600")} />
            </button>
          </div>

          {product.images.length > 1 ? (
            <div className="flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "relative h-16 w-16 overflow-hidden rounded-lg ring-2 transition-colors",
                    selectedImage === index ? "ring-accent" : "ring-transparent"
                  )}
                  aria-label={`Ver imagem ${index + 1}`}
                >
                  <Image src={image} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{product.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">({product.reviewCount} avaliacoes)</span>
          </div>

          <div>
            <h2 className="text-xl font-bold">{product.name}</h2>
            <p className="mt-2 text-muted-foreground">{product.fullDescription || product.description}</p>
          </div>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-accent">{formatPrice(unitPrice)}</span>
          {product.originalPrice ? (
            <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
          ) : null}
        </div>

        {product.variants && product.variants.length > 0 ? (
          <div className="space-y-4">
            {product.variants.map((variant) => (
              <div key={variant.id}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h4 className="font-medium">{variant.name}</h4>
                  <Badge>Obrigatorio</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {variant.options.map((option) => {
                    const isSelected = selectedVariantsById[variant.id] === option.id

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={!option.available}
                        onClick={() => onSelectVariant?.(variant.id, option.id)}
                        className={cn(
                          "rounded-xl border p-3 text-left transition-colors",
                          isSelected ? "border-accent bg-accent/10" : "border-border hover:border-accent/50",
                          !option.available && "cursor-not-allowed opacity-50"
                        )}
                      >
                        <p className="text-sm font-medium">{option.value}</p>
                        {option.priceModifier ? (
                          <p className="text-xs text-muted-foreground">
                            {option.priceModifier > 0 ? "+" : "-"} {formatPrice(Math.abs(option.priceModifier))}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Preco base</p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Quantidade:</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onChangeQuantity?.(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onChangeQuantity?.(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="rounded-xl bg-secondary/50 p-4">
            <h4 className="mb-3 font-medium">Avaliacoes recentes</h4>
            {reviews.slice(0, 2).map((review) => (
              <div key={review.id} className="mb-3 flex items-start gap-3 last:mb-0">
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image src={review.userAvatar} alt={review.userName} fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{review.userName}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={cn(
                            "h-3 w-3",
                            index < review.rating ? "fill-yellow-400 text-yellow-400" : "text-border"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!hideActionButton ? (
          <Button
            type="button"
            className="h-12 w-full"
            disabled={missingRequiredVariant}
            onClick={onPrimaryAction}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            {missingRequiredVariant
              ? "Escolha as opcoes obrigatorias"
              : `Adicionar ${formatPrice(totalPrice)}`}
          </Button>
        ) : null}

        {footer}
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
    <div className="rounded-[20px] border border-border/50 bg-secondary/20 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Produto pronto para seguir no fluxo.</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Carrinho assistido e confirmacao entram na proxima microfase, sem sair da conversa.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Produto</p>
          <p className="mt-1 text-sm font-medium text-foreground">{product.name}</p>
        </div>
      </div>
    </div>
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
  step: "product-entry" | "product-detail" | "cart-summary"
  products?: Product[]
  product?: Product | null
  favorites?: Set<string>
  reviews?: ProductReview[]
  selectedVariantsById?: SelectedVariantsById
  quantity?: number
  onSelectProduct: (productId: string) => void
  onPrimaryAction: (productId: string) => void
  onAdvance: () => void
  onSelectVariant?: (variantId: string, optionId: string) => void
  onChangeQuantity?: (quantity: number) => void
  onToggleFavorite?: (productId: string) => void
}

export function EcommerceProductOperationalSurface({
  step,
  products = [],
  product,
  favorites,
  reviews = [],
  selectedVariantsById = {},
  quantity = 1,
  onSelectProduct,
  onPrimaryAction,
  onAdvance,
  onSelectVariant,
  onChangeQuantity,
  onToggleFavorite,
}: EcommerceProductOperationalSurfaceProps) {
  if (step === "product-entry") {
    return (
      <EcommerceProductResultsCarousel
        products={products}
        favorites={favorites}
        onSelectProduct={onSelectProduct}
        onPrimaryAction={onPrimaryAction}
        onToggleFavorite={onToggleFavorite}
      />
    )
  }

  if (!product) {
    return null
  }

  if (step === "cart-summary") {
    return (
      <EcommerceConversationProductDetail
        product={product}
        isFavorite={favorites?.has(product.id) ?? false}
        onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(product.id) : undefined}
        reviews={reviews}
        selectedVariantsById={selectedVariantsById}
        quantity={quantity}
        onSelectVariant={onSelectVariant}
        onChangeQuantity={onChangeQuantity}
        onPrimaryAction={onAdvance}
        hideActionButton
        footer={<EcommerceConversationStepPlaceholder product={product} />}
      />
    )
  }

  return (
    <EcommerceConversationProductDetail
      product={product}
      isFavorite={favorites?.has(product.id) ?? false}
      onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(product.id) : undefined}
      reviews={reviews}
      selectedVariantsById={selectedVariantsById}
      quantity={quantity}
      onSelectVariant={onSelectVariant}
      onChangeQuantity={onChangeQuantity}
      onPrimaryAction={onAdvance}
    />
  )
}
