"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CarouselItem {
  id: string
  image: string
  title: string
  subtitle?: string
  price?: number
  selected?: boolean
}

interface MiniCarouselProps {
  title?: string
  items: CarouselItem[]
  onSelect?: (item: CarouselItem) => void
  selectedId?: string
  showPrice?: boolean
  showSelection?: boolean
  className?: string
}

export function MiniCarousel({
  title,
  items,
  onSelect,
  selectedId,
  showPrice = false,
  showSelection = true,
  className = ""
}: MiniCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
      setTimeout(checkScroll, 300)
    }
  }

  return (
    <div className={`${className}`}>
      {title && (
        <p className="text-sm font-medium text-foreground mb-3">{title}</p>
      )}
      
      <div className="relative group">
        {/* Scroll buttons */}
        {canScrollLeft && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        {canScrollRight && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Items */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
        >
          {items.map((item) => {
            const isSelected = selectedId === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onSelect?.(item)}
                className={`flex-shrink-0 w-28 text-left transition-all ${
                  isSelected ? "scale-105" : "hover:scale-102"
                }`}
              >
                <div className="relative">
                  <div className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                    isSelected ? "border-accent" : "border-transparent"
                  }`}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Selection indicator */}
                  {showSelection && isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-accent-foreground" />
                    </div>
                  )}
                </div>
                
                <p className="text-xs font-medium text-foreground mt-2 line-clamp-1">
                  {item.title}
                </p>
                
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {item.subtitle}
                  </p>
                )}
                
                {showPrice && item.price && (
                  <p className="text-xs font-semibold text-accent mt-0.5">
                    R$ {item.price.toFixed(2).replace(".", ",")}
                  </p>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Variante para estilos de corte (barbearia)
interface StyleCarouselProps {
  styles: Array<{
    id: string
    name: string
    image: string
    category: string
  }>
  onSelect?: (style: { id: string; name: string; image: string }) => void
  selectedId?: string
}

export function StyleCarousel({ styles, onSelect, selectedId }: StyleCarouselProps) {
  const items: CarouselItem[] = styles.map(style => ({
    id: style.id,
    image: style.image,
    title: style.name,
    subtitle: style.category
  }))

  return (
    <MiniCarousel
      title="Escolha um estilo"
      items={items}
      onSelect={(item) => onSelect?.({ id: item.id, name: item.title, image: item.image })}
      selectedId={selectedId}
      showSelection
    />
  )
}

// Variante para produtos relacionados
interface ProductCarouselProps {
  products: Array<{
    id: string
    name: string
    image: string
    price: number
  }>
  onSelect?: (product: { id: string; name: string }) => void
}

export function ProductCarousel({ products, onSelect }: ProductCarouselProps) {
  const items: CarouselItem[] = products.map(product => ({
    id: product.id,
    image: product.image,
    title: product.name,
    price: product.price
  }))

  return (
    <MiniCarousel
      title="Voce tambem pode gostar"
      items={items}
      onSelect={(item) => onSelect?.({ id: item.id, name: item.title })}
      showPrice
      showSelection={false}
    />
  )
}
