"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { ShoppingBag, Star, Truck, Plus, Minus, X, Play, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BusinessSocialLanding, type BusinessSection } from "../business-social-landing"
import { ActionDrawer } from "../action-drawer"
import { EcommerceCheckout } from "../checkout-flows"
import { ContextSelectable } from "../context-selectable"
import { createConversationalSearchVisualBlockRenderer } from "../conversational-search-results"
import type { ConversationContextItem } from "../conversational-ai"
import { ConversationSelectionProvider, useConversationSelectionState } from "../conversation-selection-context"
import { EcommerceProductFeedCard } from "./ecommerce-product-feed-card"
import { EcommerceConversationProductsBlock } from "./ecommerce-conversation-products-block"
import { EcommerceProductDetailPanel } from "./ecommerce-product-detail-panel"
import { ecommerceMockConversationResolver } from "@/lib/mock-data/conversational-search"
import {
  getProductExplorationMemory,
  hasQuietRevisitAwareness,
  orderProductsWithExplorationAwareness,
  recordProductExploration,
  type ProductExplorationMemory,
} from "@/lib/session/ecommerce-exploration-memory"
import { ecommerceConfig, products, productCategories } from "@/lib/mock-data/ecommerce-data"
import { ecommerceContent } from "@/lib/mock-data/business-content"
import type { Product, VariantOption } from "@/lib/business-types"

type SelectedVariantsById = Record<string, string>
type SelectedVariant = {
  id: string
  name: string
  option: VariantOption
}

interface CartItem {
  id: string
  cartKey: string
  name: string
  image: string
  price: number
  quantity: number
  selectedVariants?: SelectedVariant[]
}

function getSelectedVariants(product: Product, selectedById: SelectedVariantsById): SelectedVariant[] {
  return product.variants
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
}

function getVariantPriceModifier(selectedVariants: SelectedVariant[] = []) {
  return selectedVariants.reduce((sum, variant) => sum + (variant.option.priceModifier || 0), 0)
}

function getCartItemUnitPrice(item: CartItem) {
  return item.price + getVariantPriceModifier(item.selectedVariants)
}

function getCartKey(product: Product, selectedVariants: SelectedVariant[]) {
  const variantKey = selectedVariants
    .map((variant) => `${variant.id}:${variant.option.id}`)
    .sort()
    .join("|")

  return `${product.id}:${variantKey}`
}

// ========================================
// MODULO: PRODUTOS EM DESTAQUE (OBJETIVO PRINCIPAL)
// ========================================
function ProductsModule({ 
  onSelectProduct,
  onAddToCart,
  favorites,
  onToggleFavorite,
  onToggleConversationContext,
  isInConversation,
  explorationMemory,
}: { 
  onSelectProduct: (product: Product) => void
  onAddToCart: (product: Product) => void
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
  explorationMemory: ProductExplorationMemory
}) {
  const featuredProducts = useMemo(() => {
    const candidates = products.filter((product) => product.originalPrice && product.originalPrice > product.price)
    return orderProductsWithExplorationAwareness(candidates).slice(0, 4)
  }, [explorationMemory])
  
  return (
    <div className="space-y-6">
      {/* Ofertas em destaque */}
      <div className="flex flex-col gap-3">
        {featuredProducts.map((product) => (
          <EcommerceProductFeedCard
            key={product.id}
            product={product}
            onSelectProduct={onSelectProduct}
            onAddToCart={onAddToCart}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onToggleConversationContext={onToggleConversationContext}
            isInConversation={isInConversation}
            showQuietRevisitAwareness={hasQuietRevisitAwareness(product.id, explorationMemory)}
          />
        ))}
      </div>
      
      {/* Frete gratis */}
      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
        <Truck className="w-6 h-6 text-green-600" />
        <div>
          <p className="font-medium text-green-700 dark:text-green-400">Frete gratis</p>
          <p className="text-sm text-green-600 dark:text-green-500">Em compras acima de R$ 199</p>
        </div>
      </div>
    </div>
  )
}

// ========================================
// MODULO: CATEGORIAS
// ========================================
function CategoriesModule({
  onSelectCategory,
  onToggleConversationContext,
  isInConversation,
}: {
  onSelectCategory: (category: string) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:-mx-5 sm:px-5">
      {productCategories.map((category) => {
        const contextItem = {
          id: `ecommerce-category-${category.id}`,
          title: category.name,
          image: ecommerceConfig.logo,
          subtitle: "Categoria",
        }

        return (
          <ContextSelectable
            key={category.id}
            as="div"
            dataMorphSourceId={contextItem.id}
            onClick={() => onSelectCategory(category.id)}
            onLongPress={() => onToggleConversationContext?.(contextItem)}
            selected={isInConversation?.(contextItem.id) ?? false}
            className="flex flex-col items-center gap-2 flex-shrink-0 p-4 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors min-w-[100px]"
          >
            <span className="text-2xl">{category.icon}</span>
            <span className="text-sm font-medium text-foreground">{category.name}</span>
            <span className="text-xs text-muted-foreground">{category.count} itens</span>
          </ContextSelectable>
        )
      })}
    </div>
  )
}

// ========================================
function ProductDetailDrawer({ 
  product, 
  isOpen, 
  onClose,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  onToggleConversationContext,
  isInConversation,
  hasVisibleCartBar = false,
}: { 
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, quantity: number, selectedVariants: SelectedVariant[]) => void
  isFavorite: boolean
  onToggleFavorite: () => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
  hasVisibleCartBar?: boolean
}) {
  if (!product) return null

  const composerInsetPx = 104
  const cartBarInsetPx = hasVisibleCartBar ? 88 : 0
  
  return (
    <ActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      size="lg"
      visibleBottomInsetPx={composerInsetPx + cartBarInsetPx}
      fillVisibleBottomInset
    >
      <EcommerceProductDetailPanel
        product={product}
        onAddToCart={onAddToCart}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onToggleConversationContext={onToggleConversationContext}
        isInConversation={isInConversation}
        onClose={onClose}
      />
    </ActionDrawer>
  )
}

// DRAWER: CARRINHO
// ========================================
function CartDrawerComponent({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity, 
  onRemove,
  onCheckout
}: { 
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (id: string, qty: number) => void
  onRemove: (id: string) => void
  onCheckout: () => void
}) {
  const total = cart.reduce((sum, item) => sum + getCartItemUnitPrice(item) * item.quantity, 0)
  const freeShippingThreshold = 199
  const remaining = Math.max(0, freeShippingThreshold - total)
  
  return (
    <ActionDrawer isOpen={isOpen} onClose={onClose} title={`Carrinho (${cart.length})`} size="lg">
      <div className="flex flex-col h-full">
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Seu carrinho esta vazio</h3>
            <p className="text-muted-foreground">Adicione produtos para continuar</p>
          </div>
        ) : (
          <>
            {remaining > 0 && (
              <div className="bg-accent/10 rounded-xl p-3 mb-4">
                <p className="text-sm text-accent text-center">
                  Faltam <strong>R$ {remaining.toFixed(2).replace(".", ",")}</strong> para frete gratis!
                </p>
              </div>
            )}
            
            <div className="flex-1 space-y-3 overflow-auto">
              {cart.map((item) => (
                <div key={item.cartKey} className="flex gap-3 p-3 bg-secondary/50 rounded-xl">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                    {item.selectedVariants && item.selectedVariants.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.selectedVariants.map((variant) => (
                          <p key={variant.id} className="text-xs text-muted-foreground line-clamp-1">
                            {variant.name}: {variant.option.value}
                          </p>
                        ))}
                      </div>
                    )}
                    <p className="font-bold text-accent mt-1">R$ {getCartItemUnitPrice(item).toFixed(2).replace(".", ",")}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => onRemove(item.cartKey)} className="p-1 text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.cartKey, item.quantity - 1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.cartKey, item.quantity + 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 mt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frete</span>
                <span className={remaining <= 0 ? "text-green-600 font-medium" : ""}>
                  {remaining <= 0 ? "Gratis" : "Calculado no checkout"}
                </span>
              </div>
              <Button className="w-full h-12" onClick={onCheckout}>
                Finalizar compra
              </Button>
            </div>
          </>
        )}
      </div>
    </ActionDrawer>
  )
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export function EcommerceFeed() {
  const conversationSelection = useConversationSelectionState()
  const { setComposerMode, setComposerOffsetClassName } = conversationSelection
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productDrawerOpen, setProductDrawerOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [checkoutDrawerOpen, setCheckoutDrawerOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [explorationMemory, setExplorationMemory] = useState<ProductExplorationMemory>({})
  
  useEffect(() => {
    setExplorationMemory(getProductExplorationMemory())
  }, [])
  
  // Handlers
  const handleAddToCart = (product: Product, quantity: number = 1, selectedVariants: SelectedVariant[] = []) => {
    const cartKey = getCartKey(product, selectedVariants)

    setCart(prev => {
      const existing = prev.find(item => item.cartKey === cartKey)
      if (existing) {
        return prev.map(item => item.cartKey === cartKey ? { ...item, quantity: item.quantity + quantity } : item)
      }
      return [...prev, { id: product.id, cartKey, name: product.name, image: product.images[0], price: product.price, quantity, selectedVariants }]
    })
  }
  
  const handleAddToCartAndOpenCart = (product: Product, quantity: number = 1, selectedVariants: SelectedVariant[] = []) => {
    handleAddToCart(product, quantity, selectedVariants)
    setCartDrawerOpen(true)
  }
  
  const handleUpdateQuantity = (cartKey: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(item => item.cartKey !== cartKey))
    } else {
      setCart(prev => prev.map(item => item.cartKey === cartKey ? { ...item, quantity: qty } : item))
    }
  }
  
  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const handleOpenProductDrawer = useCallback((product: Product) => {
    setExplorationMemory(recordProductExploration(product.id))
    setSelectedProduct(product)
    setProductDrawerOpen(true)
  }, [])

  const renderConversationVisualBlock = useMemo(
    () =>
      createConversationalSearchVisualBlockRenderer({
        renderProducts: (matchedProducts) => {
          const resolvedProducts = matchedProducts
            .map((matchedProduct) => products.find((candidate) => candidate.id === matchedProduct.id))
            .filter((product): product is Product => Boolean(product))

          if (resolvedProducts.length === 0) {
            return null
          }

          return (
            <EcommerceConversationProductsBlock
              products={resolvedProducts}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onToggleConversationContext={conversationSelection.toggleConversationContextItem}
              isInConversation={conversationSelection.isConversationSelected}
              onAddToCart={handleAddToCart}
            />
          )
        },
      }),
    [
      conversationSelection.isConversationSelected,
      conversationSelection.toggleConversationContextItem,
      favorites,
      handleAddToCart,
      handleToggleFavorite,
    ]
  )
  
  // Secoes do feed
  const sections: BusinessSection[] = [
    {
      id: "products",
      title: "Ofertas em Destaque",
      icon: <ShoppingBag className="w-5 h-5 text-accent" />,
      type: "primary-action",
      customContent: (
        <ProductsModule 
          onSelectProduct={handleOpenProductDrawer}
          onAddToCart={(product) => {
            if (product.variants && product.variants.length > 0) {
              handleOpenProductDrawer(product)
              return
            }

            handleAddToCartAndOpenCart(product)
          }}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onToggleConversationContext={conversationSelection.toggleConversationContextItem}
          isInConversation={conversationSelection.isConversationSelected}
          explorationMemory={explorationMemory}
        />
      )
    },
    {
      id: "categories",
      title: "Categorias",
      type: "specific",
      customContent: (
        <CategoriesModule
          onSelectCategory={() => {}}
          onToggleConversationContext={conversationSelection.toggleConversationContextItem}
          isInConversation={conversationSelection.isConversationSelected}
        />
      )
    },
    {
      id: "videos",
      title: "Dicas e Tutoriais",
      icon: <Play className="w-5 h-5 text-accent" />,
      type: "content",
      posts: ecommerceContent.videos
    },
    {
      id: "reviews",
      title: "O Que Dizem",
      icon: <Star className="w-5 h-5 text-accent" />,
      type: "content",
      posts: ecommerceContent.reviews
    },
    {
      id: "news",
      title: "Na Midia",
      icon: <Newspaper className="w-5 h-5 text-accent" />,
      type: "content",
      posts: ecommerceContent.news
    },
    {
      id: "social",
      title: "Bastidores",
      type: "content",
      posts: ecommerceContent.social
    }
  ]

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    const nextMode =
      checkoutDrawerOpen || cartDrawerOpen
        ? "hidden"
        : productDrawerOpen
          ? "overlay"
          : "default"

    setComposerMode(nextMode)
    setComposerOffsetClassName(undefined)

    return () => {
      setComposerMode("default")
      setComposerOffsetClassName(undefined)
    }
  }, [
    cartDrawerOpen,
    checkoutDrawerOpen,
    productDrawerOpen,
    setComposerMode,
    setComposerOffsetClassName,
  ])
  
  return (
    <ConversationSelectionProvider value={conversationSelection}>
      <>
      <BusinessSocialLanding
        config={ecommerceConfig}
        stories={ecommerceContent.stories}
        sections={sections}
        conversationResponseResolver={ecommerceMockConversationResolver}
        renderConversationVisualBlock={renderConversationVisualBlock}
        onHeaderCartClick={() => setCartDrawerOpen(true)}
        headerCartCount={cartItemCount}
        onStoryClick={(story) => {
          if (story.isMain) {
            // Abre carrinho ou produtos
          }
        }}
        footerLinks={[
          { label: "Sobre", href: "#" },
          { label: "Produtos", href: "#" },
          { label: "Contato", href: "#" },
        ]}
      />
      
      {/* Drawers */}
      <ProductDetailDrawer
        product={selectedProduct}
        isOpen={productDrawerOpen}
        onClose={() => setProductDrawerOpen(false)}
        onAddToCart={handleAddToCartAndOpenCart}
        isFavorite={selectedProduct ? favorites.has(selectedProduct.id) : false}
        onToggleFavorite={() => selectedProduct && handleToggleFavorite(selectedProduct.id)}
        onToggleConversationContext={conversationSelection.toggleConversationContextItem}
        isInConversation={conversationSelection.isConversationSelected}
      />
      
      <CartDrawerComponent
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={(cartKey) => setCart(prev => prev.filter(item => item.cartKey !== cartKey))}
        onCheckout={() => {
          setCartDrawerOpen(false)
          setCheckoutDrawerOpen(true)
        }}
      />
      
      <ActionDrawer
        isOpen={checkoutDrawerOpen}
        onClose={() => setCheckoutDrawerOpen(false)}
        title="Finalizar Compra"
        size="lg"
      >
        <EcommerceCheckout
          items={cart.map((item) => ({
            ...item,
            name: item.selectedVariants && item.selectedVariants.length > 0
              ? `${item.name} (${item.selectedVariants.map((variant) => `${variant.name}: ${variant.option.value}`).join(", ")})`
              : item.name,
            price: getCartItemUnitPrice(item),
          }))}
          onComplete={() => {
            setCheckoutDrawerOpen(false)
            setCart([])
          }}
          onBack={() => {
            setCheckoutDrawerOpen(false)
            setCartDrawerOpen(true)
          }}
        />
      </ActionDrawer>
      </>
    </ConversationSelectionProvider>
  )
}
