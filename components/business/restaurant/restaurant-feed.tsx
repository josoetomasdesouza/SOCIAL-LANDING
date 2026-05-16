"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Check, Star, Flame, Leaf, ShoppingBag, Plus, Minus, Play, Truck, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BusinessSocialLanding, type BusinessSection } from "../business-social-landing"
import { ActionDrawer } from "../action-drawer"
import { ContextSelectable } from "../context-selectable"
import type { ConversationContextItem } from "../conversational-ai"
import { ConversationSelectionProvider, useConversationSelectionState } from "../conversation-selection-context"
import { restaurantConfig, menuItems, deliveryInfo } from "@/lib/mock-data/restaurant-data"
import { restaurantContent } from "@/lib/mock-data/business-content"
import type { CustomizationOption, MenuItem } from "@/lib/business-types"

interface CartItem extends MenuItem {
  cartKey: string
  quantity: number
  selectedCustomizations?: SelectedCustomization[]
}

type CheckoutStep = "address" | "payment" | "confirmation"
type DeliveryType = "delivery" | "pickup"
type SelectedCustomizationsById = Record<string, string[]>
type SelectedCustomization = {
  id: string
  name: string
  options: CustomizationOption[]
}

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`

function getSelectedCustomizations(item: MenuItem, selectedById: SelectedCustomizationsById): SelectedCustomization[] {
  return item.customizations
    ?.map((customization) => ({
      id: customization.id,
      name: customization.name,
      options: customization.options.filter((option) => selectedById[customization.id]?.includes(option.id)),
    }))
    .filter((customization) => customization.options.length > 0) || []
}

function getCustomizationTotal(selectedCustomizations: SelectedCustomization[] = []) {
  return selectedCustomizations.reduce(
    (sum, customization) => sum + customization.options.reduce((optionSum, option) => optionSum + option.price, 0),
    0
  )
}

function getCartItemUnitPrice(item: CartItem) {
  return item.price + getCustomizationTotal(item.selectedCustomizations)
}

function getCartKey(item: MenuItem, selectedCustomizations: SelectedCustomization[]) {
  const customizationKey = selectedCustomizations
    .map((customization) => `${customization.id}:${customization.options.map((option) => option.id).sort().join(",")}`)
    .sort()
    .join("|")

  return `${item.id}:${customizationKey}`
}

// ========================================
// MODULO: MENU EM DESTAQUE (OBJETIVO PRINCIPAL)
// ========================================
function MenuModule({ 
  onSelectItem,
  onAddToCart,
  onToggleConversationContext,
  isInConversation,
}: { 
  onSelectItem: (item: MenuItem) => void
  onAddToCart: (item: MenuItem) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  const popularItems = menuItems.filter(item => item.popular).slice(0, 4)
  
  return (
    <div className="space-y-4">
      {/* Destaques */}
      <div className="grid grid-cols-2 gap-3">
        {popularItems.map((item) => {
          const contextItem = {
            id: `menu-item-${item.id}`,
            title: item.name,
            image: item.image || restaurantConfig.logo,
            subtitle: "Prato",
          }

          return (
          <ContextSelectable
            as="div"
            key={item.id}
            onClick={() => onSelectItem(item)}
            onLongPress={() => onToggleConversationContext?.(contextItem)}
            selected={isInConversation?.(contextItem.id) ?? false}
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
          </ContextSelectable>
        )})}
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
function CategoriesModule({
  onSelectCategory,
  onToggleConversationContext,
  isInConversation,
}: {
  onSelectCategory: (category: string) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  const categories = [
    { id: "entradas", name: "Entradas", icon: "🥗", count: 5 },
    { id: "pratos", name: "Pratos", icon: "🍛", count: 8 },
    { id: "bebidas", name: "Bebidas", icon: "🥤", count: 6 },
    { id: "sobremesas", name: "Sobremesas", icon: "🍮", count: 4 },
  ]
  
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:-mx-5 sm:px-5">
      {categories.map((cat) => {
        const contextItem = {
          id: `restaurant-category-${cat.id}`,
          title: cat.name,
          image: restaurantConfig.logo,
          subtitle: "Categoria",
        }

        return (
          <ContextSelectable
            key={cat.id}
            as="div"
            onClick={() => onSelectCategory(cat.id)}
            onLongPress={() => onToggleConversationContext?.(contextItem)}
            selected={isInConversation?.(contextItem.id) ?? false}
            className="flex flex-col items-center gap-2 flex-shrink-0 p-4 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors min-w-[90px]"
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className="text-sm font-medium text-foreground">{cat.name}</span>
          </ContextSelectable>
        )
      })}
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
  onAddToCart,
  onToggleConversationContext,
  isInConversation,
}: { 
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: MenuItem, qty: number, selectedCustomizations: SelectedCustomization[]) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  const [quantity, setQuantity] = useState(1)
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomizationsById>({})

  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setSelectedCustomizations({})
    }
  }, [isOpen, item?.id])
  
  if (!item) return null

  const resolvedCustomizations = getSelectedCustomizations(item, selectedCustomizations)
  const customizationTotal = getCustomizationTotal(resolvedCustomizations)
  const itemTotal = (item.price + customizationTotal) * quantity
  const missingRequiredCustomization = item.customizations?.some(
    (customization) => customization.required && !selectedCustomizations[customization.id]?.length
  ) || false
  const itemContextItem = {
    id: `menu-item-${item.id}`,
    title: item.name,
    image: item.image || restaurantConfig.logo,
    subtitle: "Prato",
  }

  const handleSelectCustomization = (customizationId: string, optionId: string, maxSelections: number) => {
    setSelectedCustomizations((prev) => {
      const current = prev[customizationId] || []
      const isSelected = current.includes(optionId)
      const nextSelection = isSelected
        ? current.filter((id) => id !== optionId)
        : maxSelections === 1
          ? [optionId]
          : [...current, optionId].slice(0, maxSelections)

      return {
        ...prev,
        [customizationId]: nextSelection,
      }
    })
  }
  
  return (
    <ActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={item.name}
      size="md"
      reserveComposerSpace
    >
      <div className="space-y-6">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
          <Image src={item.image || ""} alt={item.name} fill className="object-cover" />
        </div>
        
        <ContextSelectable
          as="div"
          onLongPress={() => onToggleConversationContext?.(itemContextItem)}
          selected={isInConversation?.(itemContextItem.id) ?? false}
        >
          <div className="flex flex-wrap gap-2 mb-2">
            {item.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          <h3 className="text-xl font-bold">{item.name}</h3>
          <p className="text-muted-foreground mt-2">{item.description}</p>
        </ContextSelectable>

        {item.customizations && item.customizations.length > 0 && (
          <div className="space-y-4">
            {item.customizations.map((customization) => (
              <div key={customization.id}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h4 className="font-medium">{customization.name}</h4>
                  <Badge variant={customization.required ? "default" : "secondary"}>
                    {customization.required ? "Obrigatorio" : `Ate ${customization.maxSelections}`}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {customization.options.map((option) => {
                    const isSelected = selectedCustomizations[customization.id]?.includes(option.id) || false

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelectCustomization(customization.id, option.id, customization.maxSelections)}
                        className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-colors ${
                          isSelected ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-sm">{option.name}</p>
                          {option.price > 0 && (
                            <p className="text-xs text-muted-foreground">+ {formatCurrency(option.price)}</p>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-accent bg-accent" : "border-muted-foreground/40"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-accent-foreground" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-accent">{formatCurrency(item.price + customizationTotal)}</span>
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
        
        <Button
          className="w-full h-12"
          disabled={missingRequiredCustomization}
          onClick={() => { onAddToCart(item, quantity, resolvedCustomizations); onClose() }}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          {missingRequiredCustomization ? "Escolha as opcoes obrigatorias" : `Adicionar ${formatCurrency(itemTotal)}`}
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
  const subtotal = cart.reduce((sum, item) => sum + getCartItemUnitPrice(item) * item.quantity, 0)
  const freeDeliveryMinimum = deliveryInfo.freeDeliveryMinimum ?? 0
  const deliveryFee = freeDeliveryMinimum > 0 && subtotal >= freeDeliveryMinimum ? 0 : deliveryInfo.deliveryFee
  const total = subtotal + deliveryFee
  
  return (
    <ActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Pedido (${cart.length})`}
      size="lg"
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
              <div key={item.cartKey} className="flex gap-3 p-3 bg-secondary/50 rounded-xl">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={item.image || ""} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-1">{item.name}</p>
                  {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {item.selectedCustomizations.map((customization) => (
                        <p key={customization.id} className="text-xs text-muted-foreground line-clamp-1">
                          {customization.name}: {customization.options.map((option) => option.name).join(", ")}
                        </p>
                      ))}
                    </div>
                  )}
                  <p className="font-bold text-accent">{formatCurrency(getCartItemUnitPrice(item))}</p>
                </div>
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
  const conversationSelection = useConversationSelectionState()
  const { setComposerMode, setComposerOffsetClassName } = conversationSelection
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("address")
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("delivery")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [formData, setFormData] = useState({ address: "", complement: "", phone: "", note: "" })
  const [cart, setCart] = useState<CartItem[]>([])
  
  const handleAddToCart = (item: MenuItem, qty: number = 1, selectedCustomizations: SelectedCustomization[] = []) => {
    const cartKey = getCartKey(item, selectedCustomizations)

    setCart(prev => {
      const existing = prev.find(i => i.cartKey === cartKey)
      if (existing) {
        return prev.map(i => i.cartKey === cartKey ? { ...i, quantity: i.quantity + qty } : i)
      }
      return [...prev, { ...item, cartKey, quantity: qty, selectedCustomizations }]
    })
  }
  
  const handleUpdateQuantity = (cartKey: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.cartKey !== cartKey))
    } else {
      setCart(prev => prev.map(i => i.cartKey === cartKey ? { ...i, quantity: qty } : i))
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
  const subtotal = cart.reduce((sum, item) => sum + getCartItemUnitPrice(item) * item.quantity, 0)
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

  useEffect(() => {
    const nextMode =
      checkoutOpen || cartDrawerOpen
        ? "hidden"
        : itemDrawerOpen
          ? "overlay"
          : "default"

    setComposerMode(nextMode)
    setComposerOffsetClassName(!itemDrawerOpen && cartCount > 0 ? "bottom-[88px]" : undefined)

    return () => {
      setComposerMode("default")
      setComposerOffsetClassName(undefined)
    }
  }, [cartCount, cartDrawerOpen, checkoutOpen, itemDrawerOpen, setComposerMode, setComposerOffsetClassName])

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
    <ConversationSelectionProvider value={conversationSelection}>
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
        onAddToCart={(item, quantity, selectedCustomizations) => {
          handleAddToCart(item, quantity, selectedCustomizations)
          setCartDrawerOpen(true)
        }}
        onToggleConversationContext={conversationSelection.toggleConversationContextItem}
        isInConversation={conversationSelection.isConversationSelected}
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
              <div key={item.cartKey} className="flex justify-between gap-3 text-sm">
                <div>
                  <span>{item.quantity}x {item.name}</span>
                  {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                    <div className="mt-0.5 space-y-0.5">
                      {item.selectedCustomizations.map((customization) => (
                        <p key={customization.id} className="text-xs text-muted-foreground">
                          {customization.name}: {customization.options.map((option) => option.name).join(", ")}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <span>{formatCurrency(getCartItemUnitPrice(item) * item.quantity)}</span>
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
    </ConversationSelectionProvider>
  )
}
