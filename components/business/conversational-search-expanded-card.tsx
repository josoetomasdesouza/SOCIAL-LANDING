"use client"

import Image from "next/image"
import { ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ConversationalSearchProductResult } from "@/lib/mock-data/conversational-search"

interface ConversationalSearchExpandedCardProps {
  product: ConversationalSearchProductResult
  onClose: () => void
  onPrimaryAction?: (product: ConversationalSearchProductResult) => void
}

function formatPrice(price?: number) {
  if (typeof price !== "number") return null
  return `R$ ${price.toFixed(2).replace(".", ",")}`
}

export function ConversationalSearchExpandedCard({
  product,
  onClose,
  onPrimaryAction,
}: ConversationalSearchExpandedCardProps) {
  const hasPrimaryAction = Boolean(product.action && onPrimaryAction)
  const resolvedPrice = formatPrice(product.price)

  return (
    <article className="rounded-[24px] border border-border/45 bg-background/95 p-3 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.32)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Sugestao da conversa
          </p>
          <h4 className="mt-1 text-sm font-semibold leading-5 text-foreground">{product.title}</h4>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/70 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={`Fechar detalhes de ${product.title}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex gap-3">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[18px] bg-secondary/45">
          <Image src={product.image} alt={product.title} fill className="object-cover" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {resolvedPrice ? (
            <p className="text-sm font-semibold text-foreground/90">{resolvedPrice}</p>
          ) : null}

          <p className="mt-2 line-clamp-4 text-xs leading-5 text-muted-foreground">
            {product.description || "Veja mais detalhes desse item e siga para o fluxo real quando fizer sentido."}
          </p>

          <div className="mt-auto pt-3">
            <Button
              type="button"
              onClick={() => onPrimaryAction?.(product)}
              disabled={!hasPrimaryAction}
              className="h-10 w-full rounded-full"
            >
              <span>{product.ctaLabel || "Ver agora"}</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
