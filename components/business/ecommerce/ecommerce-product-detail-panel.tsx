"use client"

import Image from "next/image"
import { ChevronLeft, Heart, Minus, Plus, ShoppingBag, Star, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ContextSelectable } from "../context-selectable"
import type { ConversationContextItem } from "../conversational-ai"
import type { Product, VariantOption } from "@/lib/business-types"
import { productReviews } from "@/lib/mock-data/ecommerce-data"
import { toEcommerceProductConversationContextItem } from "./ecommerce-product-feed-card"

type SelectedVariantsById = Record<string, string>

export interface EcommerceSelectedVariant {
  id: string
  name: string
  option: VariantOption
}

function getSelectedVariants(product: Product, selectedById: SelectedVariantsById): EcommerceSelectedVariant[] {
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
      .filter((variant): variant is EcommerceSelectedVariant => Boolean(variant)) || []
  )
}

function getVariantPriceModifier(selectedVariants: EcommerceSelectedVariant[] = []) {
  return selectedVariants.reduce((sum, variant) => sum + (variant.option.priceModifier || 0), 0)
}

interface EcommerceProductDetailPanelProps {
  product: Product
  onAddToCart: (product: Product, quantity: number, selectedVariants: EcommerceSelectedVariant[]) => void
  isFavorite: boolean
  onToggleFavorite: () => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
  renderContext?: "drawer" | "composer"
  onBack?: () => void
  onClose?: () => void
}

export function EcommerceProductDetailPanel({
  product,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  onToggleConversationContext,
  isInConversation,
  renderContext = "drawer",
  onBack,
  onClose,
}: EcommerceProductDetailPanelProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariantsById>({})

  useEffect(() => {
    setSelectedImage(0)
    setQuantity(1)
    setSelectedVariants({})
  }, [product.id, renderContext])

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
  const reviews = productReviews.filter((review) => review.productId === product.id)
  const resolvedVariants = getSelectedVariants(product, selectedVariants)
  const missingRequiredVariant = product.variants?.some((variant) => !selectedVariants[variant.id]) || false
  const unitPrice = product.price + getVariantPriceModifier(resolvedVariants)
  const totalPrice = unitPrice * quantity
  const productContextItem = toEcommerceProductConversationContextItem(product)
  const isComposerContext = renderContext === "composer"

  const panelClassName = isComposerContext
    ? "space-y-6 rounded-[24px] border border-white/[0.06] bg-white/[0.04] p-4 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.8)]"
    : "space-y-6"
  const mediaSurfaceClassName = isComposerContext ? "bg-white/[0.03]" : "bg-secondary"
  const titleClassName = isComposerContext ? "text-xl font-bold text-white/96" : "text-xl font-bold"
  const bodyCopyClassName = isComposerContext ? "mt-2 text-white/70" : "mt-2 text-muted-foreground"
  const metaTextClassName = isComposerContext ? "text-sm text-white/58" : "text-sm text-muted-foreground"
  const priceClassName = isComposerContext ? "text-3xl font-bold text-white/96" : "text-3xl font-bold text-accent"
  const originalPriceClassName = isComposerContext ? "text-lg text-white/38 line-through" : "text-lg text-muted-foreground line-through"
  const reviewsSurfaceClassName = isComposerContext ? "rounded-xl border border-white/[0.05] bg-white/[0.03] p-4" : "bg-secondary/50 rounded-xl p-4"
  const quantityButtonClassName = isComposerContext
    ? "h-8 w-8 border-white/[0.08] bg-white/[0.04] text-white hover:bg-white/[0.08]"
    : "h-8 w-8"
  const variantButtonBaseClassName = isComposerContext
    ? "border-white/[0.08] bg-white/[0.03] text-white/88 hover:border-white/[0.16]"
    : "border-border hover:border-accent/50"
  const variantButtonSelectedClassName = isComposerContext
    ? "border-white/[0.18] bg-white/[0.09]"
    : "border-accent bg-accent/10"
  const primaryButtonClassName = isComposerContext
    ? "h-12 w-full bg-white/[0.14] text-white hover:bg-white/[0.2]"
    : "h-12 w-full"

  return (
    <div className={panelClassName}>
      {isComposerContext ? (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack ?? onClose}
            className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-3 py-1.5 text-sm text-white/78 transition-colors hover:bg-white/[0.1] hover:text-white"
            aria-label="Voltar para recomendacoes"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-white/72 transition-colors hover:bg-white/[0.1] hover:text-white"
            aria-label="Fechar detalhes do produto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className={`relative aspect-square overflow-hidden rounded-xl ${mediaSurfaceClassName}`}>
          <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover" />
          {discount > 0 ? (
            <Badge className="absolute left-3 top-3 border-0 bg-red-500 text-sm text-white">-{discount}%</Badge>
          ) : null}
          <button
            type="button"
            onClick={onToggleFavorite}
            className={`absolute right-3 top-3 rounded-full p-2 transition-colors ${isComposerContext ? "bg-white/[0.12] hover:bg-white/[0.18]" : "bg-white/80 hover:bg-white"}`}
            aria-label={`Favoritar ${product.name}`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : isComposerContext ? "text-white/70" : "text-gray-600"}`} />
          </button>
        </div>
        {product.images.length > 1 ? (
          <div className="flex gap-2">
            {product.images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(index)}
                className={`relative h-16 w-16 overflow-hidden rounded-lg ring-2 transition-colors ${selectedImage === index ? "ring-accent" : "ring-transparent"}`}
              >
                <Image src={image} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <ContextSelectable
        as="div"
        dataMorphSourceId={productContextItem.id}
        onLongPress={() => onToggleConversationContext?.(productContextItem)}
        selected={isInConversation?.(productContextItem.id) ?? false}
      >
        <div className="mb-2 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className={isComposerContext ? "font-medium text-white/92" : "font-medium"}>{product.rating}</span>
          </div>
          <span className={metaTextClassName}>({product.reviewCount} avaliacoes)</span>
        </div>
        <h2 className={titleClassName}>{product.name}</h2>
        <p className={bodyCopyClassName}>{product.fullDescription || product.description}</p>
      </ContextSelectable>

      <div className="flex items-baseline gap-3">
        <span className={priceClassName}>R$ {unitPrice.toFixed(2).replace(".", ",")}</span>
        {product.originalPrice ? <span className={originalPriceClassName}>R$ {product.originalPrice.toFixed(2).replace(".", ",")}</span> : null}
      </div>

      {product.variants && product.variants.length > 0 ? (
        <div className="space-y-4">
          {product.variants.map((variant) => (
            <div key={variant.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h4 className={isComposerContext ? "font-medium text-white/92" : "font-medium"}>{variant.name}</h4>
                <Badge>Obrigatorio</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {variant.options.map((option) => {
                  const isSelected = selectedVariants[variant.id] === option.id

                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={!option.available}
                      onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.id]: option.id }))}
                      className={`rounded-xl border p-3 text-left transition-colors ${isSelected ? variantButtonSelectedClassName : variantButtonBaseClassName} ${!option.available ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <p className={isComposerContext ? "text-sm font-medium text-white/92" : "text-sm font-medium"}>{option.value}</p>
                      {option.priceModifier ? (
                        <p className={metaTextClassName}>
                          {option.priceModifier > 0 ? "+" : "-"} R$ {Math.abs(option.priceModifier).toFixed(2).replace(".", ",")}
                        </p>
                      ) : (
                        <p className={metaTextClassName}>Preco base</p>
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
        <span className={isComposerContext ? "text-sm font-medium text-white/86" : "text-sm font-medium"}>Quantidade:</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className={quantityButtonClassName}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className={isComposerContext ? "w-8 text-center font-medium text-white/92" : "w-8 text-center font-medium"}>{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className={quantityButtonClassName}
            onClick={() => setQuantity(quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {reviews.length > 0 ? (
        <ContextSelectable
          as="div"
          dataMorphSourceId={productContextItem.id}
          onLongPress={() => onToggleConversationContext?.(productContextItem)}
          selected={isInConversation?.(productContextItem.id) ?? false}
          className={reviewsSurfaceClassName}
        >
          <h4 className={isComposerContext ? "mb-3 font-medium text-white/92" : "mb-3 font-medium"}>Avaliacoes recentes</h4>
          {reviews.slice(0, 2).map((review) => (
            <div key={review.id} className="mb-3 flex items-start gap-3 last:mb-0">
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image src={review.userAvatar} alt={review.userName} fill className="object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={isComposerContext ? "text-sm font-medium text-white/92" : "text-sm font-medium"}>{review.userName}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-3 w-3 ${index < review.rating ? "fill-yellow-400 text-yellow-400" : isComposerContext ? "text-white/14" : "text-border"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className={isComposerContext ? "line-clamp-2 text-sm text-white/62" : "line-clamp-2 text-sm text-muted-foreground"}>{review.comment}</p>
              </div>
            </div>
          ))}
        </ContextSelectable>
      ) : null}

      <Button
        className={primaryButtonClassName}
        disabled={missingRequiredVariant}
        onClick={() => {
          onAddToCart(product, quantity, resolvedVariants)
          onClose?.()
        }}
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        {missingRequiredVariant ? "Escolha as opcoes obrigatorias" : `Adicionar R$ ${totalPrice.toFixed(2).replace(".", ",")}`}
      </Button>
    </div>
  )
}
