"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { observeDrawerClosed, observeDrawerOpened } from "@/lib/events/instrumentation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { resolveDrawerScrollPaddingBottom } from "@/lib/ui/drawer-scroll-clearance"

interface ActionDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  /** Stable id for drawer/surface events; defaults to title when omitted */
  drawerId?: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg" | "full"
  matchFeedWidth?: boolean
  reserveComposerSpace?: boolean
  visibleBottomInsetPx?: number
  fillVisibleBottomInset?: boolean
}

const SHEET_TOP_SAFE_MARGIN_PX = 16
const DRAG_CLOSE_THRESHOLD_PX = 72
const COMPOSER_SCROLL_CLEARANCE_PX = 12

const sizeMaxHeights = {
  sm: "40dvh",
  md: "60dvh",
  lg: "80dvh",
  full: "95dvh",
} as const

export function ActionDrawer({
  isOpen,
  onClose,
  title,
  drawerId,
  subtitle,
  children,
  footer,
  size = "md",
  matchFeedWidth = false,
  visibleBottomInsetPx = 0,
  fillVisibleBottomInset = false,
}: ActionDrawerProps) {
  const wasOpenRef = useRef(false)
  const dragStateRef = useRef<{ pointerId: number; startY: number } | null>(null)
  const [dragOffsetPx, setDragOffsetPx] = useState(0)
  const eventDrawerId = drawerId ?? title

  const resetDrag = useCallback(() => {
    dragStateRef.current = null
    setDragOffsetPx(0)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
      resetDrag()
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen, resetDrag])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      observeDrawerOpened({
        drawerId: eventDrawerId,
        drawerKind: "action",
        title,
        source: "action-drawer",
      })
    } else if (!isOpen && wasOpenRef.current) {
      observeDrawerClosed({
        drawerId: eventDrawerId,
        drawerKind: "action",
        source: "action-drawer",
      })
    }
    wasOpenRef.current = isOpen
  }, [isOpen, title, eventDrawerId])

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return

    dragStateRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [])

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) return

    const deltaY = Math.max(0, event.clientY - dragState.startY)
    setDragOffsetPx(deltaY)
  }, [])

  const handlePointerEnd = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = dragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) return

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      const deltaY = Math.max(0, event.clientY - dragState.startY)
      resetDrag()

      if (deltaY >= DRAG_CLOSE_THRESHOLD_PX) {
        onClose()
      }
    },
    [onClose, resetDrag]
  )

  if (!isOpen) return null

  const widthClasses = matchFeedWidth
    ? "left-1/2 right-auto w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px]"
    : "inset-x-0"
  const innerWidthClasses = "w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px] mx-auto"
  const reservedBottomSpace = Math.max(0, visibleBottomInsetPx)
  const shouldBlendBottomInset = fillVisibleBottomInset && reservedBottomSpace > 0
  const drawerBottom = shouldBlendBottomInset ? 0 : reservedBottomSpace
  const visibleSheetMaxHeight = `min(${sizeMaxHeights[size]}, calc(100dvh - ${SHEET_TOP_SAFE_MARGIN_PX}px))`
  const drawerMaxHeight = shouldBlendBottomInset
    ? `min(calc(100dvh - ${SHEET_TOP_SAFE_MARGIN_PX}px), calc(${visibleSheetMaxHeight} + ${reservedBottomSpace}px))`
    : visibleSheetMaxHeight
  const contentScrollPaddingBottom = resolveDrawerScrollPaddingBottom(
    reservedBottomSpace,
    COMPOSER_SCROLL_CLEARANCE_PX
  )
  const drawerTransform = matchFeedWidth
    ? `translate(-50%, ${dragOffsetPx}px)`
    : `translateY(${dragOffsetPx}px)`

  return (
    <>
      <div
        className="fixed inset-x-0 top-0 z-50 bg-black/50 transition-opacity"
        style={{
          bottom: drawerBottom,
          opacity: dragOffsetPx > 0 ? Math.max(0.2, 0.5 - dragOffsetPx / 320) : undefined,
        }}
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed bottom-0 z-50 flex flex-col overflow-hidden bg-card rounded-t-3xl shadow-2xl",
          widthClasses,
          dragOffsetPx > 0 ? "transition-none" : "transition-transform duration-300 ease-out"
        )}
        style={{
          transform: drawerTransform,
          bottom: drawerBottom,
          maxHeight: drawerMaxHeight,
        }}
      >
        <div
          className="flex shrink-0 touch-none cursor-grab flex-col active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>

          <div className="border-b border-border/50">
            <div className={`${innerWidthClasses} flex items-center justify-between px-5 pb-4`}>
              <div className="min-w-0 pr-3">
                <h3 className="truncate text-lg font-semibold text-foreground">{title}</h3>
                {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-9 w-9 shrink-0 rounded-full p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          style={{ paddingBottom: contentScrollPaddingBottom }}
        >
          <div className={`${innerWidthClasses} p-5`}>{children}</div>
        </div>

        {footer ? (
          <div
            className="shrink-0 border-t border-border/50 bg-card"
            style={{ paddingBottom: shouldBlendBottomInset ? reservedBottomSpace : undefined }}
          >
            <div className={`${innerWidthClasses} p-5`}>{footer}</div>
          </div>
        ) : null}

        {shouldBlendBottomInset && !footer ? (
          <div aria-hidden="true" className="shrink-0 bg-card" style={{ height: reservedBottomSpace }} />
        ) : null}
      </div>
    </>
  )
}

// Drawer especifico para carrinho
interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: Array<{
    id: string
    name: string
    image: string
    price: number
    quantity: number
  }>
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  onCheckout: () => void
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout
}: CartDrawerProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <ActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Seu carrinho"
      subtitle={`${itemCount} ${itemCount === 1 ? "item" : "itens"}`}
      size="lg"
      footer={
        <div className="space-y-3">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>R$ {total.toFixed(2).replace(".", ",")}</span>
          </div>
          <Button
            onClick={onCheckout}
            className="w-full h-12 text-base font-medium"
            disabled={items.length === 0}
          >
            Finalizar compra
          </Button>
        </div>
      }
    >
      {items.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Seu carrinho esta vazio</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground line-clamp-2">{item.name}</p>
                <p className="text-sm font-semibold text-accent mt-1">
                  R$ {item.price.toFixed(2).replace(".", ",")}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80"
                  >
                    -
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="ml-auto text-sm text-destructive hover:underline"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ActionDrawer>
  )
}

// Drawer para detalhes de produto
interface ProductDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    description: string
    fullDescription?: string
    price: number
    originalPrice?: number
    images: string[]
    rating: number
    reviewCount: number
    specifications?: Array<{ label: string; value: string }>
  } | null
  onAddToCart: () => void
  onBuyNow: () => void
}

export function ProductDetailDrawer({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onBuyNow
}: ProductDetailDrawerProps) {
  if (!product) return null

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  return (
    <ActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      size="full"
      footer={
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onAddToCart}
            className="flex-1 h-12"
          >
            Adicionar ao carrinho
          </Button>
          <Button
            onClick={onBuyNow}
            className="flex-1 h-12"
          >
            Comprar agora
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="relative aspect-square rounded-2xl overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-sm font-bold px-2 py-1 rounded-lg">
              -{discount}%
            </div>
          )}
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">
                R$ {product.originalPrice.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            ou 12x de R$ {(product.price / 12).toFixed(2).replace(".", ",")} sem juros
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-5 h-5 ${star <= Math.round(product.rating) ? "text-yellow-400" : "text-gray-200"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {product.rating.toFixed(1)} ({product.reviewCount} avaliacoes)
          </span>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-2">Descricao</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.fullDescription || product.description}
          </p>
        </div>

        {product.specifications && product.specifications.length > 0 && (
          <div>
            <h4 className="font-semibold text-foreground mb-3">Especificacoes</h4>
            <div className="space-y-2">
              {product.specifications.map((spec, index) => (
                <div key={index} className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">{spec.label}</span>
                  <span className="text-sm font-medium text-foreground">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ActionDrawer>
  )
}
