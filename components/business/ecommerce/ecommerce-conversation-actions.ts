"use client"

import type {
  ConversationVisualBlockRenderer,
  ConversationalSearchProductResult,
} from "@/lib/mock-data/conversational-search"
import { createConversationalSearchVisualBlockRenderer } from "../conversational-search-results"

interface EcommerceConversationActionHandlers {
  openProductDrawer: (productId: string) => void
  navigateToSection: (sectionId: string) => void
}

function handleConversationProductAction(
  product: ConversationalSearchProductResult,
  handlers: EcommerceConversationActionHandlers
) {
  const action = product.action

  if (!action) return

  if (action.type === "open-product-drawer") {
    handlers.openProductDrawer(action.targetId)
    return
  }

  handlers.navigateToSection(action.targetId)
}

export function createEcommerceConversationVisualBlockRenderer(
  handlers: EcommerceConversationActionHandlers
): ConversationVisualBlockRenderer {
  return createConversationalSearchVisualBlockRenderer({
    onProductAction: (product) => handleConversationProductAction(product, handlers),
  })
}
