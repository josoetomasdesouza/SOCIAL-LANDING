"use client"

import { motion } from "framer-motion"
import { 
  Scissors, ShoppingBag, GraduationCap, UtensilsCrossed, 
  Building2, Briefcase, Ticket, Dumbbell, Stethoscope,
  Check, Sparkles, User, Globe
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BusinessModelSelectorProps {
  selected: string | null
  onSelect: (model: string) => void
}

const BUSINESS_MODELS = [
  {
    id: "appointment",
    name: "Agendamentos",
    description: "Barbearia, Salao, Spa",
    icon: Scissors
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Loja, Produtos",
    icon: ShoppingBag
  },
  {
    id: "courses",
    name: "Cursos",
    description: "Educacao, EAD",
    icon: GraduationCap
  },
  {
    id: "restaurant",
    name: "Restaurante",
    description: "Delivery, Cardapio",
    icon: UtensilsCrossed
  },
  {
    id: "realestate",
    name: "Imobiliaria",
    description: "Imoveis, Corretagem",
    icon: Building2
  },
  {
    id: "professionals",
    name: "Profissionais",
    description: "Advogado, Consultor",
    icon: Briefcase
  },
  {
    id: "events",
    name: "Eventos",
    description: "Shows, Ingressos",
    icon: Ticket
  },
  {
    id: "gym",
    name: "Academia",
    description: "Fitness, Personal",
    icon: Dumbbell
  },
  {
    id: "health",
    name: "Saude",
    description: "Clinica, Consultorio",
    icon: Stethoscope
  },
  {
    id: "influencer",
    name: "Influencer",
    description: "Creator, Personalidade",
    icon: Sparkles
  },
  {
    id: "personal",
    name: "Pessoal",
    description: "Portfolio, Pagina pessoal",
    icon: User
  },
  {
    id: "institutional",
    name: "Institucional",
    description: "Marca, ONG, Governo",
    icon: Globe
  }
]

export function BusinessModelSelector({ selected, onSelect }: BusinessModelSelectorProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
      {BUSINESS_MODELS.map((model, index) => {
        const Icon = model.icon
        const isSelected = selected === model.id
        
        return (
          <motion.button
            key={model.id}
            onClick={() => onSelect(model.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border transition-all duration-200",
              isSelected 
                ? "border-accent bg-accent/10 shadow-sm shadow-accent/20" 
                : "border-border/50 bg-card/50 hover:border-border hover:bg-card"
            )}
          >
            {/* Check badge */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center shadow-sm"
              >
                <Check className="w-3 h-3 text-accent-foreground" strokeWidth={3} />
              </motion.div>
            )}
            
            {/* Icon */}
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
              isSelected 
                ? "bg-accent text-accent-foreground" 
                : "bg-secondary text-foreground"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            
            {/* Text */}
            <div className="text-center">
              <p className={cn(
                "text-sm font-medium transition-colors",
                isSelected ? "text-accent" : "text-foreground"
              )}>
                {model.name}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                {model.description}
              </p>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
