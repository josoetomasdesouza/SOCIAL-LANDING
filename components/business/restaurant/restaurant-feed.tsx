"use client"

import { useState } from "react"
import Image from "next/image"
import { Clock, MapPin, Star, Flame, Leaf, ShoppingBag, Plus, Minus, X, Play, Truck, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BusinessSocialLanding, type BusinessSection } from "../business-social-landing"
import { ActionDrawer } from "../action-drawer"
import { RestaurantCheckout } from "../checkout-flows"
import { restaurantConfig, menuItems, deliveryInfo } from "@/lib/mock-data/restaurant-data"
import { restaurantContent } from "@/lib/mock-data/business-content"
import type { BusinessConfig, DeliveryInfo, MenuItem } from "@/lib/business-types"
import type { UniversalSegmentConfig } from "@/lib/core"
import { restaurantSegmentConfig } from "@/lib/segments/restaurant.config"

interface CartItem extends MenuItem {
  quantity: number
}

type RestaurantCategory = {
  id: string
  name: string
  icon: string
  count: number
}

const restaurantCategories: RestaurantCategory[] = [
  { id: "entradas", name: "Entradas", icon: "🥗", count: 5 },
  { id: "pratos", name: "Pratos", icon: "🍛", count: 8 },
  { id: "bebidas", name: "Bebidas", icon: "🥤", count: 6 },
  { id: "sobremesas", name: "Sobremesas", icon: "🍮", count: 4 },
]

// ========================================
// MODULO: MENU EM DESTAQUE (OBJETIVO PRINCIPAL)
// ========================================
function MenuModule({
  items,
  delivery,
  config,
  onSelectItem,
  onAddToCart
}: {
  items: MenuItem[]
  delivery: DeliveryInfo
  config: BusinessConfig
  onSelectItem: (item: MenuItem) => void
  onAddToCart: (item: MenuItem) => void
}) {
  const popularItems = items.filter(item => item.popular).slice(0, 4)
  
  return (
    <div className="space-y-4">
      {/* Destaques */}
      <div className="grid grid-cols-2 gap-3">
        {popularItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="text-left group"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
              <Image src={item.image || ""} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              {item.tags?.includes("Picante") && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 gap-1">
                  <Flame className="w-3 h-3" />
                  Picante
                </Badge>
              )}
              {item.tags?.includes("Vegano") && (
                <Badge className="absolute top-2 left-2 bg-green-500 text-white border-0 gap-1">
                  <Leaf className="w-3 h-3" />
                  Vegano
                </Badge>
              )}
            </div>
            <div className="mt-2">
              <p className="font-medium text-foreground line-clamp-1">{item.name}</p>
              <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
              <p className="font-bold text-accent mt-1">R$ {item.price.toFixed(2).replace(".", ",")}</p>
            </div>
          </button>
        ))}
      </div>
      
      {/* Info de delivery */}
      <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-accent" />
          <div>
            <p className="text-sm font-medium">Entrega: {delivery.estimatedTime}</p>
            <p className="text-xs text-muted-foreground">Frete gratis acima de R$ {delivery.freeDeliveryMinimum}</p>
          </div>
        </div>
        <Badge variant="outline">{config.openingHours}</Badge>
      </div>
    </div>
  )
}

// ========================================
// MODULO: CATEGORIAS DO MENU
// ========================================
function CategoriesModule({
  categories,
  onSelectCategory
}: {
  categories: RestaurantCategory[]
  onSelectCategory: (category: string) => void
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:-mx-5 sm:px-5">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className="flex flex-col items-center gap-2 flex-shrink-0 p-4 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors min-w-[90px]"
        >
          <span className="text-2xl">{cat.icon}</span>
          <span className="text-sm font-medium text-foreground">{cat.name}</span>
        </button>
      ))}
    </div>
  )
}

// ========================================
// DRAWER: DETALHES DO ITEM
// ========================================
function ItemDetailDrawer({ 
  item, 
  isOpen, 
  onClose,
  onAddToCart
}: { 
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: MenuItem, qty: number) => void
}) {
  const [quantity, setQuantity] = useState(1)
  
  if (!item) return null
  
  return (
    <ActionDrawer isOpen={isOpen} onClose={onClose} title={item.name} size="md">
      <div className="space-y-6">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
          <Image src={item.image || ""} alt={item.name} fill className="object-cover" />
        </div>
        
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {item.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          <h3 className="text-xl font-bold">{item.name}</h3>
          <p className="text-muted-foreground mt-2">{item.description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-accent">R$ {item.price.toFixed(2).replace(".", ",")}</span>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <Button className="w-full h-12" onClick={() => { onAddToCart(item, quantity); onClose() }}>
          <ShoppingBag className="w-5 h-5 mr-2" />
          Adicionar R$ {(item.price * quantity).toFixed(2).replace(".", ",")}
        </Button>
      </div>
    </ActionDrawer>
  )
}

// ========================================
// DRAWER: CARRINHO
// ========================================
function CartDrawer({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity, 
  onCheckout
}: { 
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (id: string, qty: number) => void
  onCheckout: () => void
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = subtotal >= deliveryInfo.freeDeliveryMinimum ? 0 : deliveryInfo.deliveryFee
  const total = subtotal + deliveryFee
  
  return (
    <ActionDrawer isOpen={isOpen} onClose={onClose} title={`Pedido (${cart.length})`} size="lg">
      <div className="flex flex-col h-full">
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Seu pedido esta vazio</h3>
            <p className="text-muted-foreground">Adicione itens do menu</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-secondary/50 rounded-xl">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={item.image || ""} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{item.name}</p>
                    <p className="font-bold text-accent">R$ {item.price.toFixed(2).replace(".", ",")}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Entrega</span>
                <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                  {deliveryFee === 0 ? "Gratis" : `R$ ${deliveryFee.toFixed(2).replace(".", ",")}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-accent">R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
              <Button className="w-full h-12 mt-2" onClick={onCheckout}>
                Finalizar pedido
              </Button>
            </div>
          </>
        )}
      </div>
    </ActionDrawer>
  )
}

type RestaurantSectionData = {
  config: BusinessConfig
  content: typeof restaurantContent
  delivery: DeliveryInfo
  items: MenuItem[]
  categories: RestaurantCategory[]
}

type RestaurantSectionHandlers = {
  onSelectItem: (item: MenuItem) => void
  onAddToCart: (item: MenuItem) => void
  onSelectCategory: (category: string) => void
}

function buildRestaurantSections({
  segmentConfig,
  data,
  handlers,
}: {
  segmentConfig: UniversalSegmentConfig
  data: RestaurantSectionData
  handlers: RestaurantSectionHandlers
}): BusinessSection[] {
  const sections: BusinessSection[] = []
  const contentPriorities = new Set(segmentConfig.contentPriorities)

  if (segmentConfig.requiredModules.includes("restaurant.menu")) {
    sections.push({
      id: "menu",
      title: "Mais Pedidos",
      icon: <Flame className="w-5 h-5 text-accent" />,
      type: "primary-action",
      customContent: (
        <MenuModule
          items={data.items}
          delivery={data.delivery}
          config={data.config}
          onSelectItem={handlers.onSelectItem}
          onAddToCart={handlers.onAddToCart}
        />
      )
    })

    sections.push({
      id: "categories",
      title: "Cardapio",
      type: "specific",
      customContent: (
        <CategoriesModule
          categories={data.categories}
          onSelectCategory={handlers.onSelectCategory}
        />
      )
    })
  }

  if (contentPriorities.has("video")) {
    sections.push({
      id: "videos",
      title: "Nossa Cozinha",
      icon: <Play className="w-5 h-5 text-accent" />,
      type: "content",
      posts: data.content.videos
    })
  }

  if (contentPriorities.has("review")) {
    sections.push({
      id: "reviews",
      title: "Avaliacoes",
      icon: <Star className="w-5 h-5 text-accent" />,
      type: "content",
      posts: data.content.reviews
    })
  }

  if (contentPriorities.has("news")) {
    sections.push({
      id: "news",
      title: "Na Midia",
      icon: <Newspaper className="w-5 h-5 text-accent" />,
      type: "content",
      posts: data.content.news
    })
  }

  if (contentPriorities.has("social")) {
    sections.push({
      id: "social",
      title: "Bastidores",
      type: "content",
      posts: data.content.social
    })
  }

  return sections
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export function RestaurantFeed() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  
  const handleAddToCart = (item: MenuItem, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + qty } : i)
      }
      return [...prev, { ...item, quantity: qty }]
    })
  }
  
  const handleUpdateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.id !== id))
    } else {
      setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
    }
  }
  
  const sections = buildRestaurantSections({
    segmentConfig: restaurantSegmentConfig,
    data: {
      config: restaurantConfig,
      content: restaurantContent,
      delivery: deliveryInfo,
      items: menuItems,
      categories: restaurantCategories,
    },
    handlers: {
      onSelectItem: (item) => { setSelectedItem(item); setItemDrawerOpen(true) },
      onAddToCart: handleAddToCart,
      onSelectCategory: () => {},
    },
  })

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)
  
  return (
    <>
      <BusinessSocialLanding
        config={restaurantConfig}
        stories={restaurantContent.stories}
        sections={sections}
        onPostClick={() => {}}
        footerLinks={[
          { label: "Sobre", href: "#" },
          { label: "Cardapio", href: "#" },
          { label: "Contato", href: "#" },
        ]}
      />
      
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-40">
          <div className="max-w-lg mx-auto">
            <Button className="w-full h-12" onClick={() => setCartDrawerOpen(true)}>
              <ShoppingBag className="w-5 h-5 mr-2" />
              Ver pedido ({cartCount} {cartCount === 1 ? "item" : "itens"})
            </Button>
          </div>
        </div>
      )}
      
      <ItemDetailDrawer
        item={selectedItem}
        isOpen={itemDrawerOpen}
        onClose={() => setItemDrawerOpen(false)}
        onAddToCart={handleAddToCart}
      />
      
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={() => {
          setCartDrawerOpen(false)
          setCheckoutOpen(true)
        }}
      />
      
      <ActionDrawer
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Finalizar Pedido"
        size="lg"
      >
        <RestaurantCheckout
          items={cart}
          deliveryInfo={deliveryInfo}
          onComplete={() => {
            setCheckoutOpen(false)
            setCart([])
          }}
          onBack={() => {
            setCheckoutOpen(false)
            setCartDrawerOpen(true)
          }}
        />
      </ActionDrawer>
    </>
  )
}
