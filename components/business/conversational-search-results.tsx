"use client"

import Image from "next/image"
import type {
  ConversationVisualBlock,
  ConversationVisualBlockRenderer,
  ConversationalSearchProductResult,
  ConversationalSearchResultsPayload,
} from "@/lib/mock-data/conversational-search"
import { CONVERSATIONAL_SEARCH_RESULTS_KIND } from "@/lib/mock-data/conversational-search"

interface ConversationalSearchResultsProps {
  products: ConversationalSearchProductResult[]
}

function formatPrice(price?: number) {
  if (typeof price !== "number") return null
  return `R$ ${price.toFixed(2).replace(".", ",")}`
}

export function ConversationalSearchResults({ products }: ConversationalSearchResultsProps) {
  if (products.length === 0) return null

  return (
    <div className="w-full max-w-[316px] overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 px-0.5 py-0.5">
        {products.map((product) => (
          <article
            key={product.id}
            className="min-w-[142px] max-w-[142px] shrink-0 rounded-[20px] border border-border/35 bg-secondary/35 p-2"
          >
            <div className="flex gap-2">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[14px] bg-background/80">
                <Image src={product.image} alt={product.title} fill className="object-cover" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-2 text-[11px] font-medium leading-4 text-foreground">
                  {product.title}
                </h4>

                {formatPrice(product.price) ? (
                  <p className="mt-1 text-[11px] font-medium text-foreground/80">{formatPrice(product.price)}</p>
                ) : null}

                <span className="mt-1.5 inline-flex items-center text-[11px] font-medium text-muted-foreground">
                  {product.ctaLabel || "Ver"}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function isConversationalSearchResultsPayload(
  payload: unknown
): payload is ConversationalSearchResultsPayload {
  if (!payload || typeof payload !== "object") return false

  const candidateProducts = (payload as { products?: unknown }).products

  return Array.isArray(candidateProducts)
}

export const renderConversationalSearchVisualBlock: ConversationVisualBlockRenderer = (
  visualBlock: ConversationVisualBlock
) => {
  if (visualBlock.kind !== CONVERSATIONAL_SEARCH_RESULTS_KIND) {
    return null
  }

  if (!isConversationalSearchResultsPayload(visualBlock.payload)) {
    return null
  }

  return <ConversationalSearchResults products={visualBlock.payload.products} />
}
