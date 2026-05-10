"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Star, Flame, Leaf, ShoppingBag, Plus, Minus, Play, Truck, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BusinessSocialLanding, type BusinessSection } from "../business-social-landing"
import { ActionDrawer } from "../action-drawer"
import { restaurantConfig, menuItems, deliveryInfo } from "@/lib/mock-data/restaurant-data"
import { restaurantContent } from "@/lib/mock-data/business-content"
import type { MenuItem } from "@/lib/business-types"

interface CartItem extends MenuItem {
  quantity: number
}

type CheckoutStep = "address" | "payment" | "confirmation"
type DeliveryType = "delivery" | "pickup"

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`

// ========================================
// MODULO: MENU EM DESTAQUE (OBJETIVO PRINCIPAL)
// ========================================
function MenuModule({ 
  onSelectItem,
  onAddToCart
}: { 
  onSelectItem: (item: MenuItem) => void
  onAddToCart: (item: MenuItem) => void
}) {
  const popularItems = menuItems.filter(item => item.popular).slice(0, 4)
  
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
            <p className="text-sm font-medium">Entrega: {deliveryInfo.estimatedTime}</p>
            <p className="text-xs text-muted-foreground">Frete gratis acima de R$ {deliveryInfo.freeDeliveryMinimum}</p>
          </div>
        </div>
        <Badge variant="outline">{restaurantConfig.openingHours}</Badge>
      </div>
    </div>
  )
}

// ========================================
// MODULO: CATEGORIAS DO MENU
// ========================================
function CategoriesModule({ onSelectCategory }: { onSelectCategory: (category: string) => void }) {
  const categories = [
    { id: "entradas", name: "Entradas", icon: "🥗", count: 5 },
    { id: "pratos", name: "Pratos", icon: "🍛", count: 8 },
    { id: "bebidas", name: "Bebidas", icon: "🥤", count: 6 },
    { id: "sobremesas", name: "Sobremesas", icon: "🍮", count: 4 },
  ]
  
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

function OrderSummaryFooter({
  itemCount,
  subtotal,
  deliveryFee,
  total,
  ctaLabel,
  onCta,
  disabled = false
}: {
  itemCount: number
  subtotal: number
  deliveryFee: number
  total: number
  ctaLabel: string
  onCta: () => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{itemCount} {itemCount === 1 ? "item" : "itens"}</span>
          <span>Subtotal {formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Entrega</span>
          <span className={deliveryFee === 0 ? "text-green-600" : ""}>
            {deliveryFee === 0 ? "Gratis" : formatCurrency(deliveryFee)}
          </span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-1 border-t border-border/50">
          <span>Total</span>
          <span className="text-accent">{formatCurrency(total)}</span>
        </div>
      </div>
      <Button className="w-full h-12" onClick={onCta} disabled={disabled}>
        {ctaLabel}
      </Button>
    </div>
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
  const freeDeliveryMinimum = deliveryInfo.freeDeliveryMinimum ?? 0
  const deliveryFee = freeDeliveryMinimum > 0 && subtotal >= freeDeliveryMinimum ? 0 : deliveryInfo.deliveryFee
  const total = subtotal + deliveryFee
  
  return (
    <ActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Pedido (${cart.length})`}
      size="lg"
      matchFeedWidth
      footer={cart.length > 0 && (
        <OrderSummaryFooter
          itemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          total={total}
          ctaLabel="Finalizar pedido"
          onCta={onCheckout}
        />
      )}
    >
      <div>
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Seu pedido esta vazio</h3>
            <p className="text-muted-foreground">Adicione itens do menu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 bg-secondary/50 rounded-xl">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={item.image || ""} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-1">{item.name}</p>
                  <p className="font-bold text-accent">{formatCurrency(item.price)}</p>
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
        )}
      </div>
    </ActionDrawer>
  )
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export function RestaurantFeed() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("address")
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("delivery")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [formData, setFormData] = useState({ address: "", complement: "", phone: "", note: "" })
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
  
  const sections: BusinessSection[] = [
    {
      id: "menu",
      title: "Mais Pedidos",
      icon: <Flame className="w-5 h-5 text-accent" />,
      type: "primary-action",
      customContent: (
        <MenuModule 
          onSelectItem={(item) => { setSelectedItem(item); setItemDrawerOpen(true) }}
          onAddToCart={handleAddToCart}
        />
      )
    },
    {
      id: "categories",
      title: "Cardapio",
      type: "specific",
      customContent: <CategoriesModule onSelectCategory={() => {}} />
    },
    {
      id: "videos",
      title: "Nossa Cozinha",
      icon: <Play className="w-5 h-5 text-accent" />,
      type: "content",
      posts: restaurantContent.videos
    },
    {
      id: "reviews",
      title: "Avaliacoes",
      icon: <Star className="w-5 h-5 text-accent" />,
      type: "content",
      posts: restaurantContent.reviews
    },
    {
      id: "news",
      title: "Na Midia",
      icon: <Newspaper className="w-5 h-5 text-accent" />,
      type: "content",
      posts: restaurantContent.news
    },
    {
      id: "social",
      title: "Bastidores",
      type: "content",
      posts: restaurantContent.social
    }
  ]

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const freeDeliveryMinimum = deliveryInfo.freeDeliveryMinimum ?? 0
  const isFreeDelivery = freeDeliveryMinimum > 0 && subtotal >= freeDeliveryMinimum
  const checkoutDeliveryFee = deliveryType === "delivery" && !isFreeDelivery ? deliveryInfo.deliveryFee : 0
  const checkoutTotal = subtotal + checkoutDeliveryFee
  const canChoosePayment = deliveryType === "pickup"
    ? Boolean(formData.phone)
    : Boolean(formData.address && formData.phone)
  const checkoutTitle = checkoutStep === "address"
    ? "Entrega do pedido"
    : checkoutStep === "payment"
      ? "Pagamento"
      : "Confirmar pedido"
  const checkoutCtaLabel = checkoutStep === "address"
    ? "Escolher pagamento"
    : checkoutStep === "payment"
      ? "Selecione uma forma de pagamento"
      : "Confirmar pedido"
  const checkoutCtaDisabled = checkoutStep === "address"
    ? !canChoosePayment
    : checkoutStep === "payment"
      ? true
      : !paymentMethod

  const handleCheckoutCta = () => {
    if (checkoutStep === "address") {
      setCheckoutStep("payment")
      return
    }

    if (checkoutStep === "confirmation") {
      setCheckoutOpen(false)
      setCart([])
      setCheckoutStep("address")
      setPaymentMethod("")
      setFormData({ address: "", complement: "", phone: "", note: "" })
    }
  }
  
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
          setCheckoutStep("address")
          setPaymentMethod("")
          setCheckoutOpen(true)
        }}
      />
      
      <ActionDrawer
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title={checkoutTitle}
        size="lg"
        matchFeedWidth
        footer={
          <OrderSummaryFooter
            itemCount={cartCount}
            subtotal={subtotal}
            deliveryFee={checkoutDeliveryFee}
            total={checkoutTotal}
            ctaLabel={checkoutCtaLabel}
            onCta={handleCheckoutCta}
            disabled={checkoutCtaDisabled}
          />
        }
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Seu pedido</h4>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {checkoutStep === "address" && (
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeliveryType("delivery")}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    deliveryType === "delivery" ? "border-accent bg-accent/10 text-accent" : "border-border"
                  }`}
                >
                  Delivery
                </button>
                <button
                  onClick={() => setDeliveryType("pickup")}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    deliveryType === "pickup" ? "border-accent bg-accent/10 text-accent" : "border-border"
                  }`}
                >
                  Retirada
                </button>
              </div>

              {deliveryType === "delivery" && (
                <div className="space-y-3">
                  <Input
                    placeholder="Endereco completo"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  />
                  <Input
                    placeholder="Complemento (apt, bloco...)"
                    value={formData.complement}
                    onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
                  />
                </div>
              )}

              <Input
                placeholder="Telefone para contato"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />

              <Input
                placeholder="Observacoes do pedido (opcional)"
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              />
            </>
          )}

          {checkoutStep === "payment" && (
            <div className="space-y-2">
              {["Cartao na entrega", "Dinheiro", "PIX"].map((method) => (
                <button
                  key={method}
                  onClick={() => {
                    setPaymentMethod(method)
                    setCheckoutStep("confirmation")
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent transition-colors"
                >
                  <span>{method}</span>
                  <Check className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}

          {checkoutStep === "confirmation" && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Revise seu pedido</h3>
                <p className="text-sm text-muted-foreground">
                  {deliveryType === "delivery" ? `Entrega em ${deliveryInfo.estimatedTime}` : "Retirada no balcao"}
                </p>
                {paymentMethod && (
                  <p className="text-sm text-muted-foreground mt-1">Pagamento: {paymentMethod}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </ActionDrawer>
    </>
  )
}
