"use client"

import Image from "next/image"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MenuItem } from "@/lib/business-types"
import type { RestaurantMenuSearchResult } from "@/lib/mock-data/restaurant-conversational-search"

interface RestaurantConversationMenuBlockProps {
  items: RestaurantMenuSearchResult[]
  menuItems: MenuItem[]
  onSelectItem: (item: MenuItem) => void
  onAddToCart: (item: MenuItem) => void
}

function resolveMenuItem(menuItems: MenuItem[], result: RestaurantMenuSearchResult) {
  return menuItems.find((item) => item.id === result.id) ?? null
}

export function RestaurantConversationMenuBlock({
  items,
  menuItems,
  onSelectItem,
  onAddToCart,
}: RestaurantConversationMenuBlockProps) {
  return (
    <div className="flex flex-col gap-2" data-testid="restaurant-conversation-menu-block">
      {items.map((result) => {
        const item = resolveMenuItem(menuItems, result)
        if (!item) return null

        const hasCustomizations = Boolean(item.customizations?.length)

        return (
          <div
            key={item.id}
            className="flex gap-3 p-3 rounded-xl border border-white/10 bg-white/5"
          >
            <button
              type="button"
              onClick={() => onSelectItem(item)}
              className="flex flex-1 gap-3 text-left min-w-0"
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-white/95 line-clamp-1">{item.name}</p>
                {result.subtitle ? (
                  <p className="text-xs text-white/60 line-clamp-1">{result.subtitle}</p>
                ) : null}
                <p className="text-sm font-semibold text-accent mt-1">
                  R$ {item.price.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </button>
            <Button
              size="sm"
              variant="secondary"
              className="self-center flex-shrink-0"
              onClick={() => {
                if (hasCustomizations) {
                  onSelectItem(item)
                  return
                }
                onAddToCart(item)
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              {hasCustomizations ? "Ver" : "Add"}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
