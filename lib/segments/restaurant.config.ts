import type { UniversalSegmentConfig } from "@/lib/core"

export const restaurantSegmentConfig: UniversalSegmentConfig = {
  id: "restaurant",
  name: "Restaurante",
  objective: "Converter visitantes em pedidos de delivery, retirada ou reservas a partir do cardapio.",
  primaryCTA: {
    label: "Fazer pedido",
    action: "restaurant.cart.open",
    variant: "primary",
  },
  contentPriorities: ["product", "review", "video", "social", "news"],
  requiredModules: [
    "restaurant.menu",
    "restaurant.cart",
    "restaurant.checkout",
    "restaurant.delivery",
  ],
  operationalFlow: [
    { id: "browse-menu", label: "Explorar cardapio", moduleId: "restaurant.menu", action: "restaurant.menu.browse" },
    { id: "add-items", label: "Adicionar itens", moduleId: "restaurant.cart", action: "restaurant.cart.add" },
    { id: "choose-delivery", label: "Escolher entrega ou retirada", moduleId: "restaurant.delivery", action: "restaurant.delivery.select" },
    { id: "checkout", label: "Finalizar pedido", moduleId: "restaurant.checkout", action: "restaurant.checkout.start" },
  ],
  rules: {
    supportsDelivery: true,
    supportsPickup: true,
    requiresAddressForDelivery: true,
    acceptsItemCustomization: true,
  },
}
