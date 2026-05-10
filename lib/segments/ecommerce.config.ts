import type { UniversalSegmentConfig } from "@/lib/core"

export const ecommerceSegmentConfig: UniversalSegmentConfig = {
  id: "ecommerce",
  name: "E-commerce",
  objective: "Converter visitantes em compras com descoberta de produtos, carrinho e pagamento.",
  primaryCTA: {
    label: "Comprar agora",
    action: "ecommerce.products.open",
    variant: "primary",
  },
  contentPriorities: ["product", "review", "video", "social", "news"],
  requiredModules: [
    "ecommerce.products",
    "ecommerce.cart",
    "ecommerce.payment",
  ],
  operationalFlow: [
    { id: "browse-products", label: "Explorar produtos", moduleId: "ecommerce.products", action: "ecommerce.products.browse" },
    { id: "add-to-cart", label: "Adicionar ao carrinho", moduleId: "ecommerce.cart", action: "ecommerce.cart.add" },
    { id: "review-cart", label: "Revisar carrinho", moduleId: "ecommerce.cart", action: "ecommerce.cart.review" },
    { id: "payment", label: "Realizar pagamento", moduleId: "ecommerce.payment", action: "ecommerce.payment.start" },
  ],
  rules: {
    requiresCart: true,
    supportsFavorites: true,
    supportsDiscounts: true,
    requiresPaymentStep: true,
  },
}
