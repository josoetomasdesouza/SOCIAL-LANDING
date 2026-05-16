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
    <div className="w-full max-w-[312px] overflow-hidden rounded-[22px] border border-border/55 bg-background/80 shadow-[0_18px_34px_-26px_rgba(15,23,42,0.28)]">
      <div className="flex gap-2.5 overflow-x-auto px-3 py-3 scrollbar-hide">
        {products.map((product) => (
          <article
            key={product.id}
            className="min-w-[144px] max-w-[144px] shrink-0 rounded-2xl border border-border/50 bg-card/95 p-2.5"
          >
            <div className="flex gap-2.5">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary">
                <Image src={product.image} alt={product.title} fill className="object-cover" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-2 text-xs font-medium leading-4 text-foreground">
                  {product.title}
                </h4>

                {formatPrice(product.price) ? (
                  <p className="mt-1 text-xs font-semibold text-accent">{formatPrice(product.price)}</p>
                ) : null}

                <span className="mt-2 inline-flex h-7 items-center rounded-full border border-border/60 px-2.5 text-[11px] font-medium text-foreground/80">
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
