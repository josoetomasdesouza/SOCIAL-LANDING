"use client"

import Image from "next/image"

export interface ConversationFeedCarouselProduct {
  id: string
  title: string
  image: string
  price?: number
  ctaLabel?: string
}

interface ConversationFeedCarouselProps {
  products: ConversationFeedCarouselProduct[]
}

function formatPrice(price?: number) {
  if (typeof price !== "number") return null
  return `R$ ${price.toFixed(2).replace(".", ",")}`
}

export function ConversationFeedCarousel({ products }: ConversationFeedCarouselProps) {
  if (products.length === 0) return null

  return (
    <div className="w-full max-w-[320px] overflow-hidden rounded-2xl border border-border/60 bg-card/80">
      <div className="flex gap-3 overflow-x-auto px-3 py-3 scrollbar-hide">
        {products.map((product) => (
          <article
            key={product.id}
            className="min-w-[148px] max-w-[148px] flex-shrink-0 rounded-xl border border-border/60 bg-background/95 p-2.5 shadow-sm"
          >
            <div className="flex gap-2.5">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                <Image src={product.image} alt={product.title} fill className="object-cover" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-2 text-xs font-medium leading-4 text-foreground">
                  {product.title}
                </h4>

                {formatPrice(product.price) && (
                  <p className="mt-1 text-xs font-semibold text-accent">{formatPrice(product.price)}</p>
                )}

                <button
                  type="button"
                  className="mt-2 inline-flex h-7 items-center rounded-full border border-border px-2.5 text-[11px] font-medium text-foreground/80"
                >
                  {product.ctaLabel || "Ver"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
