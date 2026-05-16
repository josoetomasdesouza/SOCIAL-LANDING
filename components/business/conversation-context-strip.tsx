"use client"

import Image from "next/image"
import { X } from "lucide-react"
import type { ConversationContextPayload } from "@/lib/business-types"

export type ConversationOSContextItem = ConversationContextPayload

interface ConversationContextStripProps {
  items: ConversationOSContextItem[]
  onRemoveContext?: (contextId: string) => void
}

export function ConversationContextStrip({
  items,
  onRemoveContext,
}: ConversationContextStripProps) {
  if (items.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex h-11 min-w-[156px] shrink-0 items-center gap-2 rounded-full border border-border/50 bg-secondary/55 pr-1.5"
        >
          <div className="relative h-11 w-11 overflow-hidden rounded-full">
            <Image src={item.image} alt={item.title} fill className="object-cover" />
          </div>

          <div className="min-w-0 flex-1">
            {item.subtitle ? (
              <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {item.subtitle}
              </p>
            ) : null}
            <p className="truncate text-xs font-medium text-foreground">{item.title}</p>
          </div>

          {onRemoveContext ? (
            <button
              type="button"
              onClick={() => onRemoveContext(item.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground transition-colors hover:text-foreground"
              aria-label={`Remover ${item.title}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
