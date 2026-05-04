import type { GymPlan, GymClass, GymBrand, BusinessConfig } from "@/lib/business-types"

// Config no formato BusinessConfig para os feeds
export const gymConfig: BusinessConfig = {
  model: "fitness",
  name: "Power Fitness",
  logo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=400&fit=crop",
  description: "Transforme seu corpo, transforme sua vida",
  primaryColor: "#EF4444",
  whatsapp: "5511345678901",
  instagram: "@powerfitness",
  address: "Rua dos Atletas, 500 - Vila Olimpia",
  openingHours: "5h-23h (Seg-Sex) | 7h-20h (Sab-Dom)"
}

// Lista de personal trainers
export const personalTrainers = [
  {
    id: "pt-1",
    name: "Carlos Silva",
    avatar: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&h=100&fit=crop&crop=face",
    specialty: "Spinning",
    rating: 4.9,
    price: 150
  },
  {
    id: "pt-2",
    name: "Ana Paula",
    avatar: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=100&h=100&fit=crop&crop=face",
    specialty: "Yoga",
    rating: 4.8,
    price: 120
  }
]

export const gymBrand: GymBrand = {
  id: "gym-1",
  name: "Power Fitness",
  logo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=400&fit=crop",
  description: "Transforme seu corpo, transforme sua vida",
  address: "Rua dos Atletas, 500 - Vila Olimpia",
  phone: "(11) 3456-7890",
  workingHours: "5h as 23h (Seg-Sex) | 7h as 20h (Sab-Dom)",
  amenities: ["Estacionamento", "Vestiarios", "Lanchonete", "Wi-Fi", "Ar condicionado"],
}

export const gymPlans: GymPlan[] = [
  {
    id: "plan-1",
    name: "Basico",
    description: "Acesso a area de musculacao e cardio",
    price: 89.90,
    period: "mensal",
    features: ["Musculacao", "Cardio", "Vestiario"],
  },
  {
    id: "plan-2",
    name: "Plus",
    description: "Acesso completo com aulas coletivas",
    price: 149.90,
    period: "mensal",
    features: ["Musculacao", "Cardio", "Aulas coletivas", "Vestiario", "Avaliacao fisica"],
    isPopular: true,
  },
  {
    id: "plan-3",
    name: "Premium",
    description: "Experiencia completa com personal trainer",
    price: 299.90,
    period: "mensal",
    features: ["Tudo do Plus", "Personal trainer", "Nutricionista", "Acesso 24h", "Area VIP"],
  },
  {
    id: "plan-4",
    name: "Anual Plus",
    description: "Plano Plus com desconto anual",
    price: 119.90,
    period: "mensal",
    features: ["Tudo do Plus", "12 meses", "Sem fidelidade apos 12 meses"],
    discount: 20,
  },
]

export const gymClasses: GymClass[] = [
  {
    id: "class-1",
    name: "Spinning",
    description: "Aula intensa de ciclismo indoor",
    instructor: "Carlos Silva",
    duration: "45 min",
    schedule: [
      { day: "Segunda", times: ["07:00", "18:00", "19:00"] },
      { day: "Quarta", times: ["07:00", "18:00", "19:00"] },
      { day: "Sexta", times: ["07:00", "18:00"] },
    ],
    image: "https://images.unsplash.com/photo-1520334363269-e70f7e5ef6de?w=400&h=300&fit=crop",
    spots: 20,
    category: "Cardio",
  },
  {
    id: "class-2",
    name: "Yoga",
    description: "Equilibrio entre corpo e mente",
    instructor: "Ana Paula",
    duration: "60 min",
    schedule: [
      { day: "Terca", times: ["08:00", "17:00"] },
      { day: "Quinta", times: ["08:00", "17:00"] },
      { day: "Sabado", times: ["09:00"] },
    ],
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
    spots: 15,
    category: "Bem-estar",
  },
  {
    id: "class-3",
    name: "CrossFit",
    description: "Treinamento funcional de alta intensidade",
    instructor: "Pedro Rocha",
    duration: "50 min",
    schedule: [
      { day: "Segunda", times: ["06:00", "17:00", "18:00"] },
      { day: "Quarta", times: ["06:00", "17:00", "18:00"] },
      { day: "Sexta", times: ["06:00", "17:00"] },
    ],
    image: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=300&fit=crop",
    spots: 12,
    category: "Funcional",
  },
  {
    id: "class-4",
    name: "Muay Thai",
    description: "Arte marcial tailandesa",
    instructor: "Marcos Lima",
    duration: "60 min",
    schedule: [
      { day: "Terca", times: ["19:00", "20:00"] },
      { day: "Quinta", times: ["19:00", "20:00"] },
    ],
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=300&fit=crop",
    spots: 16,
    category: "Luta",
  },
]

export const gymPosts = [
  {
    id: "gym-post-1",
    type: "video" as const,
    title: "Treino completo em 30 minutos",
    description: "Nao tem tempo? Esse treino e perfeito pra voce! Nosso personal mostra como otimizar seu tempo na academia.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=450&fit=crop",
    date: "2024-01-18",
    likes: 890,
    comments: 67,
    shares: 45,
    duration: "12:34",
    views: 15600,
  },
  {
    id: "gym-post-2",
    type: "social" as const,
    title: "Transformacao",
    description: "Mais uma aluna conquistando seus objetivos! Parabens Mariana pelos 3 meses de dedicacao.",
    image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&h=800&fit=crop",
    date: "2024-01-15",
    likes: 1234,
    comments: 89,
    shares: 23,
  },
]
