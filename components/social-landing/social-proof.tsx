"use client"

import Image from "next/image"
import { Star, Quote } from "lucide-react"
import { Card } from "@/components/ui/card"
import { formatDateShort } from "@/lib/format-date"

const reviews = [
  {
    id: "1",
    name: "Maria Clara",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
    text: "Produtos maravilhosos! Uso há anos e nunca me decepcionaram. A qualidade é incomparável.",
    date: "2024-01-10",
  },
  {
    id: "2",
    name: "João Pedro",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 5,
    text: "Comprei o perfume Essencial e estou impressionado. Fragrância única e duradoura!",
    date: "2024-01-08",
  },
  {
    id: "3",
    name: "Ana Beatriz",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 4,
    text: "Amo a linha Ekos! Os produtos são sustentáveis e têm cheiros incríveis. Recomendo.",
    date: "2024-01-05",
  },
]

export function SocialProof() {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Milhares de clientes satisfeitos compartilham suas experiências com nossos produtos.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6 bg-card border-border relative overflow-hidden group hover:shadow-lg transition-shadow">
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-accent/20 group-hover:text-accent/30 transition-colors" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground mb-6 line-clamp-4">
                &quot;{review.text}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-accent/50">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="font-semibold text-foreground block">
                    {review.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDateShort(review.date)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
