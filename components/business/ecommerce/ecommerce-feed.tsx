"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ShoppingBag, Heart, Star, Truck, ChevronRight, Plus, Minus, Check, X, Play, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BusinessSocialLanding, type BusinessSection } from "../business-social-landing"
import { ActionDrawer } from "../action-drawer"
import { EcommerceCheckout } from "../checkout-flows"
import { ContextSelectable } from "../context-selectable"
import type { ConversationContextItem } from "../conversational-ai"
import { ConversationSelectionProvider, useConversationSelectionState } from "../conversation-selection-context"
import { ecommerceConfig, products, productReviews, productCategories } from "@/lib/mock-data/ecommerce-data"
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
}: { 
  onSelectProduct: (product: Product) => void
  onAddToCart: (product: Product) => void
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  const featuredProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 4)
  
  return (
    <div className="space-y-6">
      {/* Ofertas em destaque */}
      <div className="grid grid-cols-2 gap-3">
        {featuredProducts.map((product) => {
          const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
          const contextItem = {
            id: `ecommerce-product-${product.id}`,
            title: product.name,
            image: product.images[0],
            subtitle: "Produto",
          }
          return (
            <ContextSelectable
              key={product.id}
              as="div"
              onClick={() => onSelectProduct(product)}
              onLongPress={() => onToggleConversationContext?.(contextItem)}
              selected={isInConversation?.(contextItem.id) ?? false}
              className="relative group"
            >
              <div className="w-full text-left">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  {discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0">-{discount}%</Badge>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-foreground line-clamp-2">{product.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{product.rating} ({product.reviewCount})</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-bold text-accent">R$ {product.price.toFixed(2).replace(".", ",")}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">R$ {product.originalPrice.toFixed(2).replace(".", ",")}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onToggleFavorite(product.id)}
                className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
              >
                <Heart className={`w-4 h-4 ${favorites.has(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
              </button>
              <Button
                size="sm"
                className="w-full mt-2 h-9"
                onClick={() => onAddToCart(product)}
              >
                <ShoppingBag className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </ContextSelectable>
          )
        })}
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
// DRAWER: DETALHES DO PRODUTO
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
}: { 
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, quantity: number, selectedVariants: SelectedVariant[]) => void
  isFavorite: boolean
  onToggleFavorite: () => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariantsById>({})

  useEffect(() => {
    if (isOpen) {
      setSelectedImage(0)
      setQuantity(1)
      setSelectedVariants({})
    }
  }, [isOpen, product?.id])
  
  if (!product) return null
  
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
  const reviews = productReviews.filter(r => r.productId === product.id)
  const resolvedVariants = getSelectedVariants(product, selectedVariants)
  const missingRequiredVariant = product.variants?.some((variant) => !selectedVariants[variant.id]) || false
  const unitPrice = product.price + getVariantPriceModifier(resolvedVariants)
  const totalPrice = unitPrice * quantity
  const productContextItem = {
    id: `ecommerce-product-${product.id}`,
    title: product.name,
    image: product.images[0],
    subtitle: "Produto",
  }
  
  return (
    <ActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      size="lg"
      reserveComposerSpace
    >
      <div className="space-y-6">
        {/* Imagens */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
            <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover" />
            {discount > 0 && (
              <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0 text-sm">-{discount}%</Badge>
            )}
            <button
              onClick={onToggleFavorite}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </button>
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden ring-2 transition-colors ${selectedImage === idx ? "ring-accent" : "ring-transparent"}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Info */}
        <ContextSelectable
          as="div"
          onLongPress={() => onToggleConversationContext?.(productContextItem)}
          selected={isInConversation?.(productContextItem.id) ?? false}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{product.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">({product.reviewCount} avaliacoes)</span>
          </div>
          <h2 className="text-xl font-bold">{product.name}</h2>
          <p className="text-muted-foreground mt-2">{product.fullDescription || product.description}</p>
        </ContextSelectable>
        
        {/* Preco */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-accent">R$ {unitPrice.toFixed(2).replace(".", ",")}</span>
          {product.originalPrice && (
            <span className="text-lg text-muted-foreground line-through">R$ {product.originalPrice.toFixed(2).replace(".", ",")}</span>
          )}
        </div>
        
        {/* Variacoes */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-4">
            {product.variants.map((variant) => (
              <div key={variant.id}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h4 className="font-medium">{variant.name}</h4>
                  <Badge>Obrigatorio</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {variant.options.map((option) => {
                    const isSelected = selectedVariants[variant.id] === option.id

                    return (
                      <button
                        key={option.id}
                        disabled={!option.available}
                        onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.id]: option.id }))}
                        className={`p-3 rounded-xl border text-left transition-colors ${
                          isSelected ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
                        } ${!option.available ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <p className="font-medium text-sm">{option.value}</p>
                        {option.priceModifier ? (
                          <p className="text-xs text-muted-foreground">
                            {option.priceModifier > 0 ? "+" : "-"} R$ {Math.abs(option.priceModifier).toFixed(2).replace(".", ",")}
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
        )}

        {/* Quantidade */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Quantidade:</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(quantity + 1)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Avaliacoes resumidas */}
        {reviews.length > 0 && (
          <ContextSelectable
            as="div"
            onLongPress={() => onToggleConversationContext?.(productContextItem)}
            selected={isInConversation?.(productContextItem.id) ?? false}
            className="bg-secondary/50 rounded-xl p-4"
          >
            <h4 className="font-medium mb-3">Avaliacoes recentes</h4>
            {reviews.slice(0, 2).map((review) => (
              <div key={review.id} className="flex items-start gap-3 mb-3 last:mb-0">
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image src={review.userAvatar} alt={review.userName} fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{review.userName}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                </div>
              </div>
            ))}
          </ContextSelectable>
        )}
        
        {/* Botao de compra */}
        <Button
          className="w-full h-12"
          disabled={missingRequiredVariant}
          onClick={() => {
            onAddToCart(product, quantity, resolvedVariants)
            onClose()
          }}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          {missingRequiredVariant ? "Escolha as opcoes obrigatorias" : `Adicionar R$ ${totalPrice.toFixed(2).replace(".", ",")}`}
        </Button>
      </div>
    </ActionDrawer>
  )
}

// ========================================
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
  const { setComposerMode } = conversationSelection
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productDrawerOpen, setProductDrawerOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [checkoutDrawerOpen, setCheckoutDrawerOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  
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
  
  // Secoes do feed
  const sections: BusinessSection[] = [
    {
      id: "products",
      title: "Ofertas em Destaque",
      icon: <ShoppingBag className="w-5 h-5 text-accent" />,
      type: "primary-action",
      customContent: (
        <ProductsModule 
          onSelectProduct={(p) => { setSelectedProduct(p); setProductDrawerOpen(true) }}
          onAddToCart={(product) => {
            if (product.variants && product.variants.length > 0) {
              setSelectedProduct(product)
              setProductDrawerOpen(true)
              return
            }

            handleAddToCartAndOpenCart(product)
          }}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
      )
    },
    {
      id: "categories",
      title: "Categorias",
      type: "specific",
      customContent: <CategoriesModule onSelectCategory={() => {}} />
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
          : cartItemCount > 0
            ? "hidden"
            : "default"

    setComposerMode(nextMode)

    return () => {
      setComposerMode("default")
    }
  }, [cartDrawerOpen, cartItemCount, checkoutDrawerOpen, productDrawerOpen, setComposerMode])
  
  return (
    <ConversationSelectionProvider value={conversationSelection}>
      <>
      <BusinessSocialLanding
        config={ecommerceConfig}
        stories={ecommerceContent.stories}
        sections={sections}
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
      
      {/* Barra fixa do carrinho */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-40">
          <div className="max-w-lg mx-auto">
            <Button className="w-full h-12" onClick={() => setCartDrawerOpen(true)}>
              <ShoppingBag className="w-5 h-5 mr-2" />
              Ver carrinho ({cartItemCount} {cartItemCount === 1 ? "item" : "itens"})
            </Button>
          </div>
        </div>
      )}
      
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
