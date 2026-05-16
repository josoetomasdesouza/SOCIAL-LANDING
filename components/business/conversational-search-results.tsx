"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type {
  ConversationVisualBlock,
  ConversationVisualBlockRenderer,
  ConversationalSearchProductResult,
  ConversationalSearchResultsPayload,
} from "@/lib/mock-data/conversational-search"
import { CONVERSATIONAL_SEARCH_RESULTS_KIND } from "@/lib/mock-data/conversational-search"
import { ConversationalSearchExpandedCard } from "./conversational-search-expanded-card"

interface ConversationalSearchResultsProps {
  products: ConversationalSearchProductResult[]
  onProductAction?: (product: ConversationalSearchProductResult) => void
}

interface CreateConversationalSearchVisualBlockRendererOptions {
  onProductAction?: (product: ConversationalSearchProductResult) => void
}

function formatPrice(price?: number) {
  if (typeof price !== "number") return null
  return `R$ ${price.toFixed(2).replace(".", ",")}`
}

export function ConversationalSearchResults({
  products,
  onProductAction,
}: ConversationalSearchResultsProps) {
  if (products.length === 0) return null

  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)

  useEffect(() => {
    if (!expandedProductId) return

    if (!products.some((product) => product.id === expandedProductId)) {
      setExpandedProductId(null)
    }
  }, [expandedProductId, products])

  const expandedProduct = useMemo(
    () => products.find((product) => product.id === expandedProductId) ?? null,
    [expandedProductId, products]
  )

  return (
    <div className="-ml-[38px] w-[min(calc(100vw-3rem),34rem)] max-w-none space-y-3">
      <div className="overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex gap-2 pr-5">
          {products.map((product) => {
            const isExpanded = product.id === expandedProductId

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => setExpandedProductId((current) => (current === product.id ? null : product.id))}
                className={cn(
                  "w-[136px] shrink-0 rounded-[20px] border border-border/35 bg-secondary/35 p-2 text-left transition-colors",
                  "hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                  isExpanded && "border-accent/45 bg-secondary/55"
                )}
                aria-expanded={isExpanded}
                aria-controls={isExpanded ? `conversation-product-expanded-${product.id}` : undefined}
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
                      Detalhes
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {expandedProduct ? (
        <div id={`conversation-product-expanded-${expandedProduct.id}`}>
          <ConversationalSearchExpandedCard
            product={expandedProduct}
            onClose={() => setExpandedProductId(null)}
            onPrimaryAction={onProductAction}
          />
        </div>
      ) : null}
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

export function createConversationalSearchVisualBlockRenderer(
  options: CreateConversationalSearchVisualBlockRendererOptions = {}
): ConversationVisualBlockRenderer {
  return (visualBlock: ConversationVisualBlock) => {
    if (visualBlock.kind !== CONVERSATIONAL_SEARCH_RESULTS_KIND) {
      return null
    }

    if (!isConversationalSearchResultsPayload(visualBlock.payload)) {
      return null
    }

    return (
      <ConversationalSearchResults
        products={visualBlock.payload.products}
        onProductAction={options.onProductAction}
      />
    )
  }
}

export const renderConversationalSearchVisualBlock = createConversationalSearchVisualBlockRenderer()
