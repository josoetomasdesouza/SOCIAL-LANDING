"use client"

import Image from "next/image"
import { Play, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Brand } from "@/lib/types"

interface HeroProps {
  brand: Brand
  onExplore: () => void
}

export function Hero({ brand, onExplore }: HeroProps) {
  return (
    <section className="relative min-h-[85vh] flex items-end pt-16">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={brand.coverImage}
          alt={brand.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-2xl">
          {/* Brand Logo Large */}
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden ring-4 ring-accent mb-6 shadow-2xl">
            <Image
              src={brand.logo}
              alt={brand.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 text-balance">
            {brand.headline}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl text-pretty">
            {brand.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 text-base"
              onClick={onExplore}
            >
              <Play className="w-4 h-4" />
              Explorar conteúdos
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="gap-2 text-base"
            >
              Ver produtos
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
          <button 
            onClick={onExplore}
            className="p-3 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-card transition-colors"
            aria-label="Rolar para baixo"
          >
            <ArrowDown className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </section>
  )
}
