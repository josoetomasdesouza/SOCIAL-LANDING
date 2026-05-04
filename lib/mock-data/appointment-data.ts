import type { Professional, Service, StyleExample, BusinessConfig } from "@/lib/business-types"

// Configuracao da barbearia
export const barberShopConfig: BusinessConfig = {
  model: "appointment",
  name: "Barba Negra",
  logo: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=100&h=100&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&h=600&fit=crop",
  description: "Barbearia tradicional com atendimento premium",
  primaryColor: "#8B4513",
  whatsapp: "5511999999999",
  instagram: "@barbanegra",
  address: "Rua Augusta, 1500 - Sao Paulo, SP",
  openingHours: "Seg-Sab: 9h-20h"
}

// Profissionais
export const barbers: Professional[] = [
  {
    id: "barber-1",
    name: "Carlos Silva",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    role: "Barbeiro Senior",
    rating: 4.9,
    reviewCount: 328,
    specialties: ["Degrade", "Barba", "Pigmentacao"],
    availability: generateAvailability("barber-1")
  },
  {
    id: "barber-2",
    name: "Rafael Santos",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    role: "Barbeiro",
    rating: 4.8,
    reviewCount: 245,
    specialties: ["Corte Social", "Desenho", "Barba"],
    availability: generateAvailability("barber-2")
  },
  {
    id: "barber-3",
    name: "Lucas Oliveira",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    role: "Barbeiro",
    rating: 4.7,
    reviewCount: 189,
    specialties: ["Afro", "Dreadlocks", "Tranças"],
    availability: generateAvailability("barber-3")
  },
  {
    id: "barber-4",
    name: "Pedro Costa",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    role: "Barbeiro Junior",
    rating: 4.6,
    reviewCount: 87,
    specialties: ["Corte Masculino", "Barba"],
    availability: generateAvailability("barber-4")
  }
]

// Servicos
export const barberServices: Service[] = [
  {
    id: "service-1",
    name: "Corte Masculino",
    description: "Corte tradicional com maquina e tesoura",
    duration: 30,
    price: 45,
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop",
    category: "Corte",
    popular: true
  },
  {
    id: "service-2",
    name: "Degrade",
    description: "Corte com degrade nas laterais e nuca",
    duration: 45,
    price: 55,
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=300&fit=crop",
    category: "Corte",
    popular: true
  },
  {
    id: "service-3",
    name: "Barba Completa",
    description: "Aparar, modelar e hidratar a barba",
    duration: 30,
    price: 35,
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop",
    category: "Barba"
  },
  {
    id: "service-4",
    name: "Corte + Barba",
    description: "Combo corte masculino e barba completa",
    duration: 60,
    price: 70,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop",
    category: "Combo",
    popular: true
  },
  {
    id: "service-5",
    name: "Pigmentacao de Barba",
    description: "Coloracao para cobrir falhas ou grisalhos",
    duration: 45,
    price: 80,
    image: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=400&h=300&fit=crop",
    category: "Tratamento"
  },
  {
    id: "service-6",
    name: "Hidratacao Capilar",
    description: "Tratamento profundo para cabelos",
    duration: 30,
    price: 40,
    image: "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400&h=300&fit=crop",
    category: "Tratamento"
  },
  {
    id: "service-7",
    name: "Desenho na Barba/Cabelo",
    description: "Arte personalizada com maquina",
    duration: 20,
    price: 25,
    image: "https://images.unsplash.com/photo-1534297635766-a262cdcb8ee4?w=400&h=300&fit=crop",
    category: "Extra"
  },
  {
    id: "service-8",
    name: "Platinado",
    description: "Descoloracao completa do cabelo",
    duration: 90,
    price: 120,
    image: "https://images.unsplash.com/photo-1620122830785-9c5d86e3ad03?w=400&h=300&fit=crop",
    category: "Coloracao"
  }
]

// Estilos de corte
export const hairStyles: StyleExample[] = [
  {
    id: "style-1",
    name: "Degrade Medio",
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop",
    category: "Degrade",
    tags: ["moderno", "versatil"]
  },
  {
    id: "style-2",
    name: "Degrade Alto",
    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=400&fit=crop",
    category: "Degrade",
    tags: ["arrojado", "jovem"]
  },
  {
    id: "style-3",
    name: "Pompadour",
    image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=400&h=400&fit=crop",
    category: "Classico",
    tags: ["elegante", "volume"]
  },
  {
    id: "style-4",
    name: "Buzz Cut",
    image: "https://images.unsplash.com/photo-1534297635766-a262cdcb8ee4?w=400&h=400&fit=crop",
    category: "Curto",
    tags: ["pratico", "militar"]
  },
  {
    id: "style-5",
    name: "Undercut",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop",
    category: "Moderno",
    tags: ["estiloso", "contraste"]
  },
  {
    id: "style-6",
    name: "Social Classico",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    category: "Classico",
    tags: ["executivo", "formal"]
  },
  {
    id: "style-7",
    name: "Afro Natural",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    category: "Afro",
    tags: ["natural", "volume"]
  },
  {
    id: "style-8",
    name: "Mullet Moderno",
    image: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400&h=400&fit=crop",
    category: "Tendencia",
    tags: ["ousado", "retro"]
  }
]

// Funcao para gerar disponibilidade fake
function generateAvailability(barberId: string) {
  const availability = []
  const today = new Date()
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    // Pula domingos
    if (date.getDay() === 0) continue
    
    const slots = []
    const startHour = 9
    const endHour = date.getDay() === 6 ? 18 : 20 // Sabado fecha mais cedo
    
    for (let hour = startHour; hour < endHour; hour++) {
      // Simula alguns horarios ja ocupados
      const isAvailable = Math.random() > 0.3
      
      slots.push({ time: `${hour.toString().padStart(2, "0")}:00`, available: isAvailable })
      slots.push({ time: `${hour.toString().padStart(2, "0")}:30`, available: Math.random() > 0.4 })
    }
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    
    availability.push({
      date: `${year}-${month}-${day}`,
      slots
    })
  }
  
  return availability
}

// Posts relacionados a barbearia (para o feed)
export const barberPosts = [
  {
    id: "barber-post-1",
    type: "video" as const,
    title: "Degrade perfeito em 5 minutos",
    description: "Aprenda a tecnica que nossos barbeiros usam para criar o degrade mais suave",
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&h=450&fit=crop",
    date: "2024-01-15",
    likes: 1234,
    comments: 89,
    shares: 45,
    duration: "5:32",
    views: 23400,
    isVertical: false
  },
  {
    id: "barber-post-2",
    type: "video" as const,
    title: "Transformacao completa",
    description: "De cabelo grande para um visual totalmente novo #antesedepois",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=1067&fit=crop",
    date: "2024-01-14",
    likes: 5678,
    comments: 234,
    shares: 123,
    duration: "0:45",
    views: 89000,
    isVertical: true
  },
  {
    id: "barber-post-3",
    type: "review" as const,
    title: "Melhor barbearia da regiao",
    description: "Atendimento impecavel, ambiente muito agradavel. O Carlos e um verdadeiro artista!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    date: "2024-01-13",
    likes: 45,
    comments: 3,
    shares: 2,
    rating: 5,
    reviewerName: "Marcos P."
  }
]
