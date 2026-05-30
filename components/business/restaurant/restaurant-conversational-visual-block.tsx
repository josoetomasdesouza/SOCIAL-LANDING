"use client"

import type { ReactNode } from "react"
import type { MenuItem } from "@/lib/business-types"
import type { ConversationVisualBlock, ConversationVisualBlockRenderer } from "@/lib/mock-data/conversational-search"
import {
  RESTAURANT_CART_PROMPT_KIND,
  RESTAURANT_MENU_RESULTS_KIND,
  type RestaurantCartPromptPayload,
  type RestaurantMenuResultsPayload,
} from "@/lib/mock-data/restaurant-conversational-search"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import { RestaurantConversationMenuBlock } from "./restaurant-conversation-menu-block"

function isRestaurantMenuResultsPayload(payload: unknown): payload is RestaurantMenuResultsPayload {
  if (!payload || typeof payload !== "object") return false
  return Array.isArray((payload as RestaurantMenuResultsPayload).items)
}

function isRestaurantCartPromptPayload(payload: unknown): payload is RestaurantCartPromptPayload {
  if (!payload || typeof payload !== "object") return false
  return typeof (payload as RestaurantCartPromptPayload).action === "string"
}

interface RestaurantConversationalVisualBlockOptions {
  menuItems: MenuItem[]
  onSelectItem: (item: MenuItem) => void
  onAddToCart: (item: MenuItem) => void
  onOpenCart: () => void
  onOpenCheckout: () => void
}

export function createRestaurantConversationalVisualBlockRenderer(
  options: RestaurantConversationalVisualBlockOptions
): ConversationVisualBlockRenderer {
  return (visualBlock: ConversationVisualBlock): ReactNode => {
    if (visualBlock.kind === RESTAURANT_MENU_RESULTS_KIND) {
      if (!isRestaurantMenuResultsPayload(visualBlock.payload)) return null

      return (
        <RestaurantConversationMenuBlock
          items={visualBlock.payload.items}
          menuItems={options.menuItems}
          onSelectItem={options.onSelectItem}
          onAddToCart={options.onAddToCart}
        />
      )
    }

    if (visualBlock.kind === RESTAURANT_CART_PROMPT_KIND) {
      if (!isRestaurantCartPromptPayload(visualBlock.payload)) return null

      const isCheckout = visualBlock.payload.action === "open-checkout"

      return (
        <div data-testid="restaurant-cart-prompt-block">
          <Button
            className="w-full"
            onClick={() => (isCheckout ? options.onOpenCheckout() : options.onOpenCart())}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            {isCheckout ? "Ir para pagamento" : `Ver pedido (${visualBlock.payload.itemCount})`}
          </Button>
        </div>
      )
    }

    return null
  }
}
