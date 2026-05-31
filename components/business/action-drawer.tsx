"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { observeDrawerClosed, observeDrawerOpened } from "@/lib/events/instrumentation"
import { Button } from "@/components/ui/button"
import { DrawerDragZone, DrawerScrollBody } from "@/components/ui/drawer-drag-chrome"
import { cn } from "@/lib/utils"
import { useConversationSelectionContext } from "./conversation-selection-context"
import {
  useComposerOverlayClearance,
  resolveComposerScrollClearancePx,
  resolveComposerPinnedFooterBottomInsetPx,
  resolveComposerPinnedFooterScrollPaddingPx,
} from "@/lib/ui/composer-scroll-clearance"
import {
  DRAWER_SHEET_HEIGHT,
  DRAWER_SHEET_MAX_HEIGHT,
  resolveDrawerSheetStyle,
} from "@/lib/ui/drawer-layout"
import { useDrawerSheetDrag } from "@/lib/ui/use-drawer-sheet-drag"

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
  /** Keep page scroll position when body lock engages (contextual return continuity). */
  preservePageScroll?: boolean
}

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
  preservePageScroll = false,
}: ActionDrawerProps) {
  const wasOpenRef = useRef(false)
  const lockedPageScrollYRef = useRef(0)
  const pageScrollLockActiveRef = useRef(false)
  const eventDrawerId = drawerId ?? title
  const conversationSelection = useConversationSelectionContext()
  const { paddingBottom: composerClearance, isActive: composerOverlaysDrawer } =
    useComposerOverlayClearance({
      // Composer z-[70] sits on top of the drawer — reserve symmetric clearance.
      reserveComposerClearance: conversationSelection?.composerMode === "overlay",
    })

  useEffect(() => {
    if (!isOpen || conversationSelection?.composerMode !== "overlay") {
      return
    }

    const publishLiveComposerMetrics = () => {
      if (typeof window === "undefined") {
        return
      }

      const composerSection = document.querySelector<HTMLElement>('[data-conversation-composer="true"]')
      if (!composerSection) {
        return
      }

      const viewportHeight = window.visualViewport?.height ?? window.innerHeight
      const rect = composerSection.getBoundingClientRect()
      const footprintPx = Math.round(Math.max(0, viewportHeight - rect.top))
      const bottomInsetPx = Math.round(Math.max(0, viewportHeight - rect.bottom))
      const clearancePx = resolveComposerScrollClearancePx(footprintPx, bottomInsetPx)

      if (clearancePx <= 0) {
        return
      }

      conversationSelection?.setComposerScrollMetrics({
        footprintPx,
        bottomInsetPx,
        clearancePx,
      })
    }

    publishLiveComposerMetrics()
    const frame = window.requestAnimationFrame(publishLiveComposerMetrics)

    return () => window.cancelAnimationFrame(frame)
  }, [conversationSelection, isOpen])
  const { sheetRef, setScrollRef, rawDragOffsetPx, resetDrag, isDragging, isPulling, dragHandleProps, getBackdropOpacity } =
    useDrawerSheetDrag(onClose, isOpen)

  useEffect(() => {
    const releasePageScrollLock = () => {
      const scrollY = lockedPageScrollYRef.current
      lockedPageScrollYRef.current = 0
      pageScrollLockActiveRef.current = false
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      window.scrollTo(0, scrollY)
    }

    if (isOpen) {
      if (preservePageScroll) {
        lockedPageScrollYRef.current = window.scrollY
        pageScrollLockActiveRef.current = true
        document.body.style.overflow = "hidden"
        document.body.style.position = "fixed"
        document.body.style.top = `-${lockedPageScrollYRef.current}px`
        document.body.style.width = "100%"
      } else {
        document.body.style.overflow = "hidden"
      }
    } else {
      if (preservePageScroll && pageScrollLockActiveRef.current) {
        releasePageScrollLock()
      } else {
        document.body.style.overflow = ""
      }
      resetDrag()
    }

    return () => {
      if (preservePageScroll && pageScrollLockActiveRef.current) {
        releasePageScrollLock()
      } else {
        document.body.style.overflow = ""
        document.body.style.position = ""
        document.body.style.top = ""
        document.body.style.width = ""
      }
    }
  }, [isOpen, preservePageScroll, resetDrag])

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

  const composerHidden = conversationSelection?.composerMode === "hidden"
  const shouldPinFooterToScreen = Boolean(footer && composerHidden)
  const pinnedFooterRef = useRef<HTMLDivElement>(null)
  const [pinnedFooterHeightPx, setPinnedFooterHeightPx] = useState(0)

  useLayoutEffect(() => {
    if (!isOpen || !shouldPinFooterToScreen) {
      setPinnedFooterHeightPx(0)
      return
    }

    const measurePinnedFooter = () => {
      setPinnedFooterHeightPx(pinnedFooterRef.current?.offsetHeight ?? 0)
    }

    measurePinnedFooter()
    const frame = window.requestAnimationFrame(measurePinnedFooter)

    const footerElement = pinnedFooterRef.current
    const resizeObserver =
      footerElement && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measurePinnedFooter)
        : null
    if (footerElement && resizeObserver) {
      resizeObserver.observe(footerElement)
    }

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
    }
  }, [footer, isOpen, shouldPinFooterToScreen])

  if (!isOpen) return null

  const widthClasses = matchFeedWidth
    ? "left-1/2 right-auto w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px]"
    : "inset-x-0"
  const innerWidthClasses = "w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px] mx-auto"
  const pinnedFooterWidthClasses = matchFeedWidth
    ? "left-1/2 right-auto w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px] -translate-x-1/2"
    : "inset-x-0"
  const composerPinnedBottomInsetPx = resolveComposerPinnedFooterBottomInsetPx(
    conversationSelection?.composerBottomInsetPx
  )
  const sheetLayout = resolveDrawerSheetStyle(rawDragOffsetPx, {
    translateX: matchFeedWidth ? "translateX(-50%)" : undefined,
    ...(size === "sm"
      ? {
          baseHeight: "auto",
          maxHeight: composerHidden ? "86dvh" : "82dvh",
        }
      : size === "lg"
        ? { baseHeight: "85dvh" }
        : size === "full"
          ? { baseHeight: DRAWER_SHEET_MAX_HEIGHT, maxHeight: DRAWER_SHEET_MAX_HEIGHT }
          : { baseHeight: DRAWER_SHEET_HEIGHT }),
  })
  const isCompact = size === "sm"
  const scrollPaddingBottom = composerOverlaysDrawer
    ? composerClearance
    : shouldPinFooterToScreen && pinnedFooterHeightPx > 0
      ? `${resolveComposerPinnedFooterScrollPaddingPx(
          pinnedFooterHeightPx,
          conversationSelection?.composerBottomInsetPx
        )}px`
      : undefined

  const footerContent = footer ? (
    <div
      className={`${innerWidthClasses} ${isCompact ? "px-4 pt-2 pb-3" : "px-4 pt-4"} ${shouldPinFooterToScreen ? "pb-0" : composerOverlaysDrawer ? "pb-0" : isCompact ? "" : "pb-5"}`}
    >
      {footer}
    </div>
  ) : null

  return (
    <>
      <div
        className="fixed inset-x-0 top-0 z-50 bg-black/50 transition-opacity"
        style={{
          bottom: 0,
          opacity: getBackdropOpacity(0.5),
        }}
        onClick={onClose}
      />

      <div
        ref={sheetRef}
        className={cn(
          "fixed bottom-0 z-50 flex flex-col overflow-hidden bg-card rounded-t-3xl shadow-2xl",
          widthClasses,
          isDragging ? "transition-none" : "transition-[height,transform] duration-300 ease-out"
        )}
        style={{
          bottom: 0,
          height: sheetLayout.height,
          maxHeight: sheetLayout.maxHeight,
          transform: sheetLayout.transform,
        }}
      >
        <DrawerDragZone dragHandleProps={dragHandleProps}>
          <div className="border-b border-border/50">
            <div className={`${innerWidthClasses} ${isCompact ? "px-4 pb-3" : "px-5 pb-4"}`}>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-foreground">{title}</h3>
                {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
              </div>
            </div>
          </div>
        </DrawerDragZone>

        <DrawerScrollBody
          scrollRef={setScrollRef}
          isPulling={isPulling}
          className={isCompact ? "flex-none" : undefined}
          style={scrollPaddingBottom ? { paddingBottom: scrollPaddingBottom } : undefined}
        >
          <div className={`${innerWidthClasses} ${isCompact ? "px-4 pb-2 pt-2" : "p-5"}`}>{children}</div>
        </DrawerScrollBody>

        {footer && !shouldPinFooterToScreen ? (
          <div
            className={cn(
              "shrink-0 border-t bg-card",
              isCompact ? "border-border/30" : "border-border/50"
            )}
            style={composerOverlaysDrawer ? { paddingBottom: composerClearance } : undefined}
          >
            {footerContent}
          </div>
        ) : null}
      </div>

      {footer && shouldPinFooterToScreen ? (
        <div
          ref={pinnedFooterRef}
          data-action-drawer-pinned-footer="true"
          className={cn(
            "fixed z-[55] border-t border-border/50 bg-card/98 backdrop-blur-sm shadow-[0_-8px_30px_rgba(15,23,42,0.08)]",
            pinnedFooterWidthClasses
          )}
          style={{ bottom: composerPinnedBottomInsetPx }}
        >
          {footerContent}
        </div>
      ) : null}
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
