"use client"

import type { ReactNode } from "react"
import type {
  ConversationVisualBlock,
  ConversationVisualBlockRenderer,
  ConversationalSearchProductResult,
  ConversationalSearchResultsPayload,
} from "@/lib/mock-data/conversational-search"
import { CONVERSATIONAL_SEARCH_RESULTS_KIND } from "@/lib/mock-data/conversational-search"

function isConversationalSearchResultsPayload(
  payload: unknown
): payload is ConversationalSearchResultsPayload {
  if (!payload || typeof payload !== "object") return false

  const candidateProducts = (payload as { products?: unknown }).products

  return Array.isArray(candidateProducts)
}

interface ConversationalSearchVisualBlockRendererOptions {
  renderProducts?: (products: ConversationalSearchProductResult[]) => ReactNode
}

export function createConversationalSearchVisualBlockRenderer(
  options: ConversationalSearchVisualBlockRendererOptions = {}
): ConversationVisualBlockRenderer {
  return (visualBlock: ConversationVisualBlock) => {
    if (visualBlock.kind !== CONVERSATIONAL_SEARCH_RESULTS_KIND) {
      return null
    }

    if (!isConversationalSearchResultsPayload(visualBlock.payload)) {
      return null
    }

    return options.renderProducts?.(visualBlock.payload.products) ?? null
  }
}

export const renderConversationalSearchVisualBlock = createConversationalSearchVisualBlockRenderer()
