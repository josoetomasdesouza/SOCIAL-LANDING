"use client"

import { useState } from "react"
import Image from "next/image"
import { Scissors, ShoppingBag, BookOpen, UtensilsCrossed, Home, Briefcase, Ticket, Dumbbell, Heart, ChevronRight, Sparkles, User, Globe } from "lucide-react"
import type { BusinessType } from "@/lib/business-types"

interface BusinessOption {
  type: BusinessType
  name: string
  description: string
  icon: React.ElementType
  image: string
  color: string
}

const businessOptions: BusinessOption[] = [
  {
    type: "appointment",
    name: "Agendamento",
    description: "Barbearias, saloes, manicures",
    icon: Scissors,
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop",
    color: "from-amber-500 to-orange-600",
  },
  {
    type: "ecommerce",
    name: "E-commerce",
    description: "Lojas online, marketplace",
    icon: ShoppingBag,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
    color: "from-blue-500 to-indigo-600",
  },
  {
    type: "courses",
    name: "Cursos",
    description: "Educacao online, treinamentos",
    icon: BookOpen,
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=300&fit=crop",
    color: "from-emerald-500 to-teal-600",
  },
  {
    type: "restaurant",
    name: "Restaurante",
    description: "Cardapio digital, delivery",
    icon: UtensilsCrossed,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
    color: "from-red-500 to-rose-600",
  },
  {
    type: "realestate",
    name: "Imobiliaria",
    description: "Venda e aluguel de imoveis",
    icon: Home,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
    color: "from-violet-500 to-purple-600",
  },
  {
    type: "professionals",
    name: "Profissionais",
    description: "Advogados, consultores, coaches",
    icon: Briefcase,
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop",
    color: "from-slate-500 to-gray-700",
  },
  {
    type: "events",
    name: "Eventos",
    description: "Festas, shows, congressos",
    icon: Ticket,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
    color: "from-pink-500 to-fuchsia-600",
  },
  {
    type: "gym",
    name: "Academia",
    description: "Fitness, crossfit, studios",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
    color: "from-lime-500 to-green-600",
  },
  {
    type: "health",
    name: "Saude",
    description: "Clinicas, medicos, dentistas",
    icon: Heart,
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=300&fit=crop",
    color: "from-cyan-500 to-blue-600",
  },
  {
    type: "influencer",
    name: "Influencer",
    description: "Creators, personalidades, artistas",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop",
    color: "from-pink-500 to-rose-600",
  },
  {
    type: "personal",
    name: "Pessoal",
    description: "Portfolio, pagina pessoal",
    icon: User,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    color: "from-indigo-500 to-violet-600",
  },
  {
    type: "institutional",
    name: "Institucional",
    description: "Marcas, ONGs, governo",
    icon: Globe,
    image: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=400&h=300&fit=crop",
    color: "from-emerald-500 to-green-600",
  },
]

interface BusinessSelectorProps {
  onSelect: (type: BusinessType) => void
  selectedType?: BusinessType
}

export function BusinessSelector({ onSelect, selectedType }: BusinessSelectorProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-lg mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Social Landing</h1>
          <p className="text-muted-foreground">Escolha um modelo de negocio para visualizar a demonstracao</p>
        </div>
        
        {/* Options */}
        <div className="grid gap-4">
          {businessOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedType === option.type
            
            return (
              <button
                key={option.type}
                onClick={() => onSelect(option.type)}
                className={`relative overflow-hidden rounded-2xl text-left transition-all active:scale-[0.98] ${
                  isSelected ? "ring-2 ring-accent" : ""
                }`}
              >
                <div className="relative h-24">
                  <Image
                    src={option.image}
                    alt={option.name}
                    fill
                    className="object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${option.color} opacity-80`} />
                  
                  <div className="absolute inset-0 flex items-center justify-between px-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-white">
                        <h3 className="font-semibold text-lg">{option.name}</h3>
                        <p className="text-white/80 text-sm">{option.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-white/80" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        
        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Cada modelo possui fluxo de conversao especifico, IA conversacional e componentes adaptados ao tipo de negocio.
        </p>
      </div>
    </div>
  )
}
