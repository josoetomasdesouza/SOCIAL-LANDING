"use client"

import { Star, FileText, ShoppingBag, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Brand } from "@/lib/types"

interface StatsCardsProps {
  brand: Brand
}

export function StatsCards({ brand }: StatsCardsProps) {
  const stats = [
    {
      icon: Star,
      value: brand.rating.toFixed(1),
      label: "Avaliação média",
      sublabel: `${brand.totalReviews.toLocaleString("pt-BR")} avaliações`,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: FileText,
      value: brand.totalPosts.toLocaleString("pt-BR"),
      label: "Conteúdos",
      sublabel: "Vídeos, notícias e mais",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: ShoppingBag,
      value: brand.totalProducts.toLocaleString("pt-BR"),
      label: "Produtos",
      sublabel: "No catálogo",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Users,
      value: "2.5M",
      label: "Seguidores",
      sublabel: "Nas redes sociais",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
  ]

  return (
    <section className="py-8 -mt-16 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card 
              key={stat.label} 
              className="p-4 md:p-6 bg-card border-border hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-foreground truncate">
                    {stat.label}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {stat.sublabel}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
