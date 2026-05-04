import type { HealthProfessional, HealthService, HealthBrand, BusinessConfig, Insurance } from "@/lib/business-types"

// Config no formato BusinessConfig para os feeds
export const healthConfig: BusinessConfig = {
  model: "health",
  name: "Clinica Vida Plena",
  logo: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=100&h=100&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=400&fit=crop",
  description: "Cuidando da sua saude com excelencia",
  primaryColor: "#059669",
  whatsapp: "5511345678901",
  instagram: "@clinicavidaplena",
  address: "Av. Brasil, 1500 - Centro Medico",
  openingHours: "Seg-Sab: 7h-19h"
}

// Lista de convenios aceitos
export const insurances: Insurance[] = [
  { id: "ins-1", name: "Unimed" },
  { id: "ins-2", name: "Bradesco Saude" },
  { id: "ins-3", name: "SulAmerica" },
  { id: "ins-4", name: "Amil" },
  { id: "ins-5", name: "NotreDame" }
]

export const healthBrand: HealthBrand = {
  id: "health-1",
  name: "Clinica Vida Plena",
  logo: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=100&h=100&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=400&fit=crop",
  description: "Cuidando da sua saude com excelencia",
  address: "Av. Brasil, 1500 - Centro Medico",
  phone: "(11) 3456-7890",
  workingHours: "Segunda a Sabado, 7h as 19h",
  specialties: ["Clinica Geral", "Cardiologia", "Dermatologia", "Pediatria", "Ortopedia"],
  acceptedInsurance: ["Unimed", "Bradesco Saude", "SulAmerica", "Amil", "NotreDame"],
}

export const healthProfessionals: HealthProfessional[] = [
  {
    id: "doc-1",
    name: "Dra. Maria Silva",
    specialty: "Cardiologia",
    crm: "123456-SP",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
    bio: "Cardiologista com 15 anos de experiencia. Especialista em arritmias e insuficiencia cardiaca.",
    rating: 4.9,
    totalConsults: 2340,
    availability: {
      "2024-01-22": ["08:00", "09:00", "10:00", "14:00", "15:00"],
      "2024-01-23": ["08:00", "09:00", "14:00", "15:00", "16:00"],
      "2024-01-24": ["08:00", "10:00", "11:00", "14:00"],
    },
  },
  {
    id: "doc-2",
    name: "Dr. Carlos Santos",
    specialty: "Clinica Geral",
    crm: "234567-SP",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
    bio: "Medico generalista focado em medicina preventiva e acompanhamento de saude da familia.",
    rating: 4.8,
    totalConsults: 5670,
    availability: {
      "2024-01-22": ["07:00", "08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      "2024-01-23": ["07:00", "08:00", "09:00", "14:00", "15:00"],
      "2024-01-24": ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"],
    },
  },
  {
    id: "doc-3",
    name: "Dra. Ana Oliveira",
    specialty: "Dermatologia",
    crm: "345678-SP",
    avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
    bio: "Dermatologista especializada em dermatologia clinica e estetica. Membro da SBD.",
    rating: 4.9,
    totalConsults: 1890,
    availability: {
      "2024-01-22": ["09:00", "10:00", "11:00", "15:00", "16:00"],
      "2024-01-24": ["09:00", "10:00", "14:00", "15:00"],
      "2024-01-25": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
    },
  },
]

export const healthServices: HealthService[] = [
  {
    id: "serv-1",
    name: "Consulta Clinica Geral",
    description: "Avaliacao completa de saude com medico generalista",
    duration: "30 min",
    price: 250,
    professional: "Dr. Carlos Santos",
  },
  {
    id: "serv-2",
    name: "Consulta Cardiologica",
    description: "Avaliacao cardiologica completa com eletrocardiograma",
    duration: "45 min",
    price: 450,
    professional: "Dra. Maria Silva",
  },
  {
    id: "serv-3",
    name: "Consulta Dermatologica",
    description: "Avaliacao de pele, cabelos e unhas",
    duration: "30 min",
    price: 350,
    professional: "Dra. Ana Oliveira",
  },
  {
    id: "serv-4",
    name: "Check-up Completo",
    description: "Avaliacao completa com exames laboratoriais e de imagem",
    duration: "2 horas",
    price: 1500,
  },
  {
    id: "serv-5",
    name: "Telemedicina",
    description: "Consulta online por video com nossos especialistas",
    duration: "20 min",
    price: 150,
    isOnline: true,
  },
]

export const healthPosts = [
  {
    id: "health-post-1",
    type: "social" as const,
    title: "Dica de saude",
    description: "Voce sabia que dormir bem e tao importante quanto se alimentar corretamente? Confira nossas dicas para melhorar a qualidade do seu sono.",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=800&fit=crop",
    date: "2024-01-18",
    likes: 456,
    comments: 34,
    shares: 12,
  },
  {
    id: "health-post-2",
    type: "video" as const,
    title: "Como prevenir doencas cardiacas",
    description: "Nossa cardiologista Dra. Maria Silva explica os principais cuidados para manter seu coracao saudavel.",
    image: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=800&h=450&fit=crop",
    date: "2024-01-15",
    likes: 789,
    comments: 56,
    shares: 89,
    duration: "6:45",
    views: 12300,
  },
]
