"use client"

import { Grid3X3, Play, ShoppingBag, Newspaper, Star, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/types"

interface CategoryFilterProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (slug: string) => void
}

const iconMap: Record<string, React.ElementType> = {
  grid: Grid3X3,
  play: Play,
  "shopping-bag": ShoppingBag,
  newspaper: Newspaper,
  star: Star,
  share: Share2,
}

export function CategoryFilter({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <section className="sticky top-16 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || Grid3X3
            const isActive = activeCategory === category.slug
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.slug)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  isActive 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {category.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
