import type { Event, EventBrand, BusinessConfig } from "@/lib/business-types"

// Config no formato BusinessConfig para os feeds
export const eventsConfig: BusinessConfig = {
  model: "events",
  name: "Festival Sunset",
  logo: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=600&fit=crop",
  description: "O maior festival de musica eletronica do Brasil",
  primaryColor: "#7C3AED",
  instagram: "@festivalsunset"
}

// Categorias de eventos
export const eventCategories = [
  { id: "festival", name: "Festivais", count: 5 },
  { id: "show", name: "Shows", count: 12 },
  { id: "teatro", name: "Teatro", count: 8 },
  { id: "workshop", name: "Workshops", count: 6 },
  { id: "festa", name: "Festas", count: 15 }
]

export const eventBrand: EventBrand = {
  id: "event-1",
  name: "Festival Sunset",
  logo: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=600&fit=crop",
  description: "O maior festival de musica eletronica do Brasil",
  category: "Festival",
}

export const events: Event[] = [
  {
    id: "evt-1",
    name: "Festival Sunset 2024",
    description: "3 dias de muita musica com os melhores DJs do mundo. Open bar incluso no ingresso VIP.",
    date: "2024-03-15",
    endDate: "2024-03-17",
    time: "16:00",
    location: {
      name: "Parque Villa-Lobos",
      address: "Av. Prof. Fonseca Rodrigues, 2001",
      city: "Sao Paulo",
      state: "SP",
    },
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
    tickets: [
      { id: "t1", name: "Pista", price: 350, available: true },
      { id: "t2", name: "Area VIP", price: 750, available: true },
      { id: "t3", name: "Camarote", price: 1500, available: false },
    ],
    lineup: ["Calvin Harris", "David Guetta", "Alok", "Vintage Culture"],
    isHighlighted: true,
  },
  {
    id: "evt-2",
    name: "Pool Party Verao",
    description: "Festa na piscina com drinks, musica boa e muito sol. Dress code: branco.",
    date: "2024-02-10",
    time: "14:00",
    location: {
      name: "Club Med",
      address: "Praia do Forte",
      city: "Bahia",
      state: "BA",
    },
    image: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&h=600&fit=crop",
    tickets: [
      { id: "t4", name: "Entrada", price: 180, available: true },
      { id: "t5", name: "Open Bar", price: 380, available: true },
    ],
    isHighlighted: true,
  },
  {
    id: "evt-3",
    name: "Stand Up Comedy Night",
    description: "Noite de risadas com os melhores comediantes do Brasil. Classificacao: 18+",
    date: "2024-02-03",
    time: "21:00",
    location: {
      name: "Teatro Gazeta",
      address: "Av. Paulista, 900",
      city: "Sao Paulo",
      state: "SP",
    },
    image: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800&h=600&fit=crop",
    tickets: [
      { id: "t6", name: "Plateia", price: 80, available: true },
      { id: "t7", name: "Frisa", price: 120, available: true },
    ],
  },
  {
    id: "evt-4",
    name: "Workshop de Fotografia",
    description: "Aprenda tecnicas avancadas de fotografia com profissionais renomados. Equipamento incluso.",
    date: "2024-02-17",
    time: "09:00",
    location: {
      name: "Espaco Cultural",
      address: "Rua Augusta, 1200",
      city: "Sao Paulo",
      state: "SP",
    },
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=600&fit=crop",
    tickets: [
      { id: "t8", name: "Inscricao", price: 450, available: true },
    ],
  },
]

export const eventPosts = [
  {
    id: "evt-post-1",
    type: "video" as const,
    title: "Aftermovie 2023",
    description: "Relembre os melhores momentos do Festival Sunset 2023! Ingressos para 2024 ja disponiveis.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=450&fit=crop",
    date: "2024-01-20",
    likes: 5670,
    comments: 234,
    shares: 456,
    duration: "4:32",
    views: 89000,
  },
  {
    id: "evt-post-2",
    type: "social" as const,
    title: "Lineup confirmado",
    description: "Finalmente! O lineup completo do Festival Sunset 2024 esta aqui. Quem voce mais quer ver?",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=800&fit=crop",
    date: "2024-01-18",
    likes: 3420,
    comments: 567,
    shares: 234,
  },
]
