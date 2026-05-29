import type { Property, RealEstateBrand, BusinessConfig, RealEstateAgent } from "@/lib/business-types"

// Config no formato BusinessConfig para os feeds
export const realestateConfig: BusinessConfig = {
  model: "realestate",
  name: "Prime Imoveis",
  logo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&h=100&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop",
  description: "Encontre o imovel dos seus sonhos",
  primaryColor: "#1E40AF",
  whatsapp: "5521999999999",
  instagram: "@primeimoveis"
}

export const realEstateBrand: RealEstateBrand = {
  id: "realestate-1",
  name: "Prime Imoveis",
  logo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&h=100&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop",
  description: "Encontre o imovel dos seus sonhos",
  specialties: ["Apartamentos", "Casas", "Comercial", "Terrenos"],
  regions: ["Zona Sul", "Zona Oeste", "Centro", "Litoral"],
  creci: "12345-J",
}

export const propertyTypes = [
  { id: "apartamento", name: "Apartamentos", icon: "🏢" },
  { id: "casa", name: "Casas", icon: "🏠" },
  { id: "comercial", name: "Comercial", icon: "🏪" },
  { id: "terreno", name: "Terrenos", icon: "🌳" },
  { id: "cobertura", name: "Coberturas", icon: "🌆" },
]

const agents: Record<"marina" | "carlos", RealEstateAgent> = {
  marina: {
    id: "agent-marina",
    name: "Marina Santos",
    phone: "(21) 99999-1111",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
    email: "marina@primeimoveis.com.br",
    creci: "12345-J",
  },
  carlos: {
    id: "agent-carlos",
    name: "Carlos Mendes",
    phone: "(21) 99999-2222",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    email: "carlos@primeimoveis.com.br",
    creci: "67890-J",
  },
}

function propertyFeatures(
  bedrooms: number,
  bathrooms: number,
  parkingSpaces: number,
  area: number,
): Property["features"] {
  return { bedrooms, bathrooms, parkingSpaces, area }
}

export const properties: Property[] = [
  {
    id: "prop-1",
    title: "Apartamento Vista Mar - 3 Quartos",
    description: "Apartamento de alto padrao com vista panoramica para o mar. Acabamento de primeira linha, varanda gourmet e 2 vagas de garagem.",
    type: "sale",
    propertyType: "apartment",
    price: 1250000,
    address: {
      street: "Av. Beira Mar",
      neighborhood: "Copacabana",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "22070-011",
    },
    features: propertyFeatures(3, 2, 2, 120),
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    area: 120,
    amenities: ["Vista mar", "Varanda gourmet", "Ar condicionado", "Armarios embutidos", "Piscina", "Academia"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    ],
    agent: agents.marina,
    status: "available",
  },
  {
    id: "prop-2",
    title: "Casa em Condominio Fechado",
    description: "Casa ampla em condominio com seguranca 24h. Piscina privativa, churrasqueira e jardim. Proxima a escolas e shopping.",
    type: "sale",
    propertyType: "house",
    price: 2800000,
    address: {
      street: "Cond. Jardins",
      neighborhood: "Barra da Tijuca",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "22631-004",
    },
    bedrooms: 4,
    bathrooms: 5,
    parkingSpaces: 4,
    area: 350,
    features: propertyFeatures(4, 5, 4, 350),
    amenities: ["Piscina", "Churrasqueira", "Jardim", "Seguranca 24h", "Area gourmet", "Suite master"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    ],
    agent: agents.carlos,
    status: "available",
  },
  {
    id: "prop-3",
    title: "Sala Comercial - Centro Empresarial",
    description: "Sala comercial em predio AAA com infraestrutura completa. Ideal para escritorios e consultorios.",
    type: "rent",
    propertyType: "commercial",
    price: 5500,
    address: {
      street: "Av. Rio Branco",
      neighborhood: "Centro",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "20040-002",
    },
    bathrooms: 2,
    parkingSpaces: 1,
    area: 80,
    features: propertyFeatures(0, 2, 1, 80),
    amenities: ["Ar central", "Recepcao", "Seguranca", "Estacionamento rotativo", "Fibra optica"],
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    ],
    agent: agents.marina,
    status: "available",
  },
  {
    id: "prop-4",
    title: "Cobertura Duplex com Terraço",
    description: "Cobertura duplex de luxo com terraco panoramico, jacuzzi e espaco gourmet. Vista 360 graus da cidade.",
    type: "sale",
    propertyType: "apartment",
    price: 4500000,
    address: {
      street: "Rua Prudente de Morais",
      neighborhood: "Ipanema",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "22420-041",
    },
    bedrooms: 4,
    bathrooms: 4,
    parkingSpaces: 3,
    area: 280,
    features: propertyFeatures(4, 4, 3, 280),
    amenities: ["Terraco", "Jacuzzi", "Vista 360", "Espaco gourmet", "Lareira", "Home office"],
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    ],
    agent: agents.carlos,
    status: "available",
  },
  {
    id: "prop-5",
    title: "Apartamento Studio - Proximo ao Metro",
    description: "Studio moderno e compacto, perfeito para jovens profissionais. A 2 minutos do metro.",
    type: "rent",
    propertyType: "apartment",
    price: 2200,
    address: {
      street: "Rua Voluntarios da Patria",
      neighborhood: "Botafogo",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "22270-010",
    },
    bedrooms: 1,
    bathrooms: 1,
    parkingSpaces: 0,
    area: 35,
    features: propertyFeatures(1, 1, 0, 35),
    amenities: ["Mobiliado", "Proximo ao metro", "Portaria 24h", "Academia no predio"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    ],
    agent: agents.marina,
    status: "available",
  },
]

export const realEstatePosts = [
  {
    id: "re-post-1",
    type: "social" as const,
    title: "Novo empreendimento",
    description: "Lancamento exclusivo na Barra! Unidades a partir de 2 quartos com lazer completo. Venha conhecer!",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=800&fit=crop",
    date: "2024-01-18",
    likes: 234,
    comments: 45,
    shares: 12,
  },
]

// Filtros para demo
export const propertyFilters = propertyTypes
