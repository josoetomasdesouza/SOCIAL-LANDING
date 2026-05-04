import type { ProfessionalService, AppointmentBrand, BusinessConfig } from "@/lib/business-types"

// Config no formato BusinessConfig para os feeds
export const professionalsConfig: BusinessConfig = {
  model: "professional",
  name: "Dr. Ricardo Almeida",
  logo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
  coverImage: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=400&fit=crop",
  description: "Advogado especialista em Direito Empresarial e Contratos",
  primaryColor: "#1F2937",
  whatsapp: "5511999990000",
  instagram: "@drricardoalmeida",
  address: "Av. Paulista, 1000 - Sala 1502 - Sao Paulo, SP",
  openingHours: "Seg-Sex: 9h-18h"
}

// Lista de profissionais (para exibir no feed)
export const professionals = [
  {
    id: "prof-1",
    name: "Dr. Ricardo Almeida",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
    title: "Advogado Empresarial",
    rating: 4.9,
    reviewCount: 156,
    specialties: ["Direito Empresarial", "Contratos", "Trabalhista"]
  }
]

export const professionalBrand: AppointmentBrand = {
  id: "prof-1",
  name: "Dr. Ricardo Almeida",
  logo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
  coverImage: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=400&fit=crop",
  description: "Advogado especialista em Direito Empresarial e Contratos",
  address: "Av. Paulista, 1000 - Sala 1502 - Sao Paulo, SP",
  phone: "(11) 3456-7890",
  whatsapp: "(11) 99999-0000",
  workingHours: "Segunda a Sexta, 9h as 18h",
  rating: 4.9,
  totalReviews: 156,
}

export const professionalServices: ProfessionalService[] = [
  {
    id: "serv-1",
    name: "Consulta Inicial",
    description: "Avaliacao do seu caso com orientacao juridica personalizada",
    duration: "1 hora",
    price: 350,
    category: "Consulta",
  },
  {
    id: "serv-2",
    name: "Analise de Contrato",
    description: "Revisao completa de contratos empresariais com parecer tecnico",
    duration: "2-3 dias",
    price: 800,
    category: "Contratos",
  },
  {
    id: "serv-3",
    name: "Abertura de Empresa",
    description: "Assessoria completa para abertura de LTDA, MEI ou SA",
    duration: "15-30 dias",
    price: 2500,
    category: "Empresarial",
  },
  {
    id: "serv-4",
    name: "Defesa Trabalhista",
    description: "Representacao em processos trabalhistas",
    duration: "Variavel",
    price: 0, // Sob consulta
    category: "Trabalhista",
  },
]

export const professionalAvailability = {
  "2024-01-22": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  "2024-01-23": ["09:00", "10:00", "14:00", "15:00"],
  "2024-01-24": ["10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
  "2024-01-25": ["09:00", "10:00", "11:00", "14:00"],
  "2024-01-26": ["09:00", "10:00", "11:00"],
}

export const professionalReviews = [
  {
    id: "rev-1",
    author: "Marcos Silva",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    comment: "Excelente profissional! Resolveu meu caso empresarial com muita competencia.",
    date: "2024-01-10",
    service: "Analise de Contrato",
  },
  {
    id: "rev-2",
    author: "Fernanda Costa",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    comment: "Muito atencioso e explicou tudo de forma clara. Recomendo!",
    date: "2024-01-08",
    service: "Consulta Inicial",
  },
  {
    id: "rev-3",
    author: "Carlos Eduardo",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 4,
    comment: "Otimo advogado, me ajudou muito na abertura da minha empresa.",
    date: "2024-01-05",
    service: "Abertura de Empresa",
  },
]

export const professionalPosts = [
  {
    id: "prof-post-1",
    type: "social" as const,
    title: "Dica juridica",
    description: "Voce sabia que a revisao de contratos pode evitar prejuizos de milhares de reais? Sempre consulte um advogado antes de assinar!",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=800&fit=crop",
    date: "2024-01-15",
    likes: 89,
    comments: 12,
    shares: 5,
  },
  {
    id: "prof-post-2",
    type: "video" as const,
    title: "Como proteger sua empresa",
    description: "Nesse video explico os principais pontos de atencao ao assinar contratos empresariais.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop",
    date: "2024-01-12",
    likes: 156,
    comments: 23,
    shares: 18,
    duration: "8:45",
    views: 2340,
  },
]
