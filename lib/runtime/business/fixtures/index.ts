import { buildAppointmentRuntimeSeedBundle } from "@/lib/runtime/appointment"
import { projectAppointmentRuntimeToBusinessRuntime } from "../adapters/appointment"
import { BUSINESS_RUNTIME_VERSION, type BusinessRuntime } from "../core"

export const appointmentBusinessRuntimeFixture = projectAppointmentRuntimeToBusinessRuntime(
  buildAppointmentRuntimeSeedBundle()
)

export const beautyBusinessRuntimeFixture: BusinessRuntime = {
  version: BUSINESS_RUNTIME_VERSION,
  vertical: "beauty",
  slug: "studio-bela",
  status: "draft",
  business: {
    id: "business-studio-bela",
    name: "Studio Bela",
    description: "Beleza leve, atendimento próximo e rotina simples.",
    category: "beauty",
  },
  brand: {
    name: "Studio Bela",
    description: "Um studio de beleza com cuidado humano e resultado natural.",
    primaryColor: "#D946EF",
    logo: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&h=500&fit=crop",
    positioning: "Beleza sem pressa, com orientação clara.",
    toneOfVoice: "warm",
    visualIdentity: {
      style: "social-native",
      accent: "#D946EF",
    },
  },
  services: [
    {
      id: "service-corte-feminino",
      name: "Corte Feminino",
      description: "Corte com escuta, finalização e orientação para manter em casa.",
      category: "Cabelo",
      price: 90,
      durationMinutes: 60,
    },
    {
      id: "service-escova",
      name: "Escova",
      description: "Finalização leve para rotina ou ocasião especial.",
      category: "Cabelo",
      price: 65,
      durationMinutes: 45,
    },
  ],
  team: [
    {
      id: "team-marina",
      name: "Marina Costa",
      role: "Hair stylist",
      specialties: ["Corte", "Finalização", "Cabelos naturais"],
      rating: 4.9,
      reviewCount: 82,
    },
  ],
  hours: {
    summary: "Ter-Sáb: 10h-19h",
    weekly: [
      { day: "Terça", intervals: [{ opens: "10:00", closes: "19:00" }] },
      { day: "Sábado", intervals: [{ opens: "10:00", closes: "17:00" }] },
    ],
  },
  location: {
    label: "em Pinheiros",
    address: "Rua dos Pinheiros, 500 - São Paulo",
    placeHint: "em Pinheiros",
    mapsQuery: "Studio Bela Rua dos Pinheiros São Paulo",
    referenceHint: "perto da estação",
  },
  channels: {
    whatsapp: "5511999990000",
    instagram: "@studiobela",
    email: "agenda@studiobela.com",
    website: "https://studiobela.example",
  },
  policies: {
    cancellation: "Remarcações devem ser feitas com antecedência.",
    payment: "Consultar formas de pagamento disponíveis.",
  },
  knowledge: {
    summary: "Studio com foco em cuidado natural e orientação prática.",
    highlights: [
      {
        id: "story-inicio",
        title: "Início",
        kind: "story",
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop",
      },
      {
        id: "proof-natural",
        title: "Resultado natural, sem exagero",
        body: "A proposta é sair bonita e ainda se reconhecer no espelho.",
        kind: "proof",
      },
    ],
    faq: [
      {
        id: "faq-duration",
        question: "Quanto tempo dura o atendimento?",
        answer: "A maioria dos serviços dura entre 45 e 60 minutos.",
      },
    ],
  },
  meta: {
    source: "fixture",
    updatedAt: "2026-06-16T00:00:00.000Z",
  },
}

export const restaurantBusinessRuntimeFixture: BusinessRuntime = {
  version: BUSINESS_RUNTIME_VERSION,
  vertical: "restaurant",
  slug: "casa-sabor",
  status: "draft",
  business: {
    id: "business-casa-sabor",
    name: "Casa Sabor",
    description: "Restaurante de comida afetiva com salão e delivery.",
    category: "restaurant",
  },
  brand: {
    name: "Casa Sabor",
    description: "Comida de verdade, atendimento próximo e pratos para compartilhar.",
    primaryColor: "#EA580C",
    logo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=500&fit=crop",
    positioning: "Restaurante de bairro com experiência acolhedora.",
    toneOfVoice: "warm",
    visualIdentity: {
      style: "commerce-soft",
      accent: "#EA580C",
    },
  },
  services: [
    {
      id: "dish-picanha",
      name: "Picanha da Casa",
      description: "Prato principal para dividir, com acompanhamentos clássicos.",
      category: "Pratos principais",
      price: 79.9,
    },
    {
      id: "dish-pudim",
      name: "Pudim de Leite",
      description: "Sobremesa cremosa feita na casa.",
      category: "Sobremesas",
      price: 16.9,
    },
  ],
  team: [
    {
      id: "team-chef-lia",
      name: "Lia Ramos",
      role: "Chef",
      specialties: ["Comida brasileira", "Pratos para compartilhar"],
      rating: 4.8,
      reviewCount: 146,
    },
  ],
  hours: {
    weekly: [
      { day: "Segunda", intervals: [{ opens: "11:00", closes: "23:00" }] },
      { day: "Domingo", intervals: [{ opens: "11:00", closes: "22:00" }] },
    ],
  },
  location: {
    label: "no Centro",
    address: "Rua das Flores, 123 - Centro",
    placeHint: "no Centro",
    mapsQuery: "Casa Sabor Rua das Flores 123",
    parkingHint: "estacionamento próximo",
  },
  channels: {
    whatsapp: "5511988887777",
    instagram: "@casasabor",
    email: "reservas@casasabor.com",
    phone: "1133334444",
  },
  policies: {
    delivery: "Delivery conforme região de atendimento.",
    payment: "Confirmar formas de pagamento com a equipe.",
  },
  knowledge: {
    summary: "Restaurante com foco em salão acolhedor, pratos para dividir e delivery.",
    highlights: [
      {
        id: "story-cardapio",
        title: "Cardápio",
        kind: "story",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop",
      },
      {
        id: "post-prato",
        title: "Pratos para compartilhar",
        body: "A casa funciona bem para almoço em família e jantar casual.",
        kind: "post",
      },
    ],
    faq: [
      {
        id: "faq-delivery",
        question: "Faz delivery?",
        answer: "Sim, conforme a região. A disponibilidade deve ser confirmada no atendimento.",
      },
    ],
  },
  meta: {
    source: "fixture",
    updatedAt: "2026-06-16T00:00:00.000Z",
  },
}

export const businessRuntimeFixtures = [
  appointmentBusinessRuntimeFixture,
  beautyBusinessRuntimeFixture,
  restaurantBusinessRuntimeFixture,
] as const
