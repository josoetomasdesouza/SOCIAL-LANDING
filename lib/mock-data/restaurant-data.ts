import type { MenuItem, DeliveryInfo, BusinessConfig } from "@/lib/business-types"

export const restaurantConfig: BusinessConfig = {
  model: "restaurant",
  name: "Sabor da Casa",
  logo: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop",
  description: "Comida brasileira com ingredientes frescos",
  primaryColor: "#DC2626",
  whatsapp: "5511999999999",
  instagram: "@sabordacasa",
  address: "Rua das Flores, 123 - Jardins, SP",
  openingHours: "Seg-Dom: 11h-23h"
}

export const deliveryInfo: DeliveryInfo = {
  minOrder: 30,
  deliveryFee: 8.90,
  estimatedTime: "30-45 min",
  freeDeliveryMinimum: 80
}

export const menuItems: MenuItem[] = [
  // Entradas
  {
    id: "item-1",
    name: "Coxinha de Frango",
    description: "Massa crocante recheada com frango desfiado temperado",
    price: 8.90,
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&h=400&fit=crop",
    category: "Entradas",
    tags: [],
    popular: true
  },
  {
    id: "item-2",
    name: "Pao de Queijo (6 un)",
    description: "Tradicional mineiro, feito com queijo da serra",
    price: 15.90,
    image: "https://images.unsplash.com/photo-1598142982120-45e4a0e7dc61?w=600&h=400&fit=crop",
    category: "Entradas",
    tags: ["Sem Gluten"]
  },
  {
    id: "item-3",
    name: "Bolinho de Bacalhau",
    description: "Crocante por fora, macio por dentro, com bacalhau de qualidade",
    price: 12.90,
    image: "https://images.unsplash.com/photo-1626645738196-c2a72c7a5b55?w=600&h=400&fit=crop",
    category: "Entradas",
    tags: []
  },

  // Pratos Principais
  {
    id: "item-4",
    name: "Picanha na Brasa",
    description: "Picanha grelhada no ponto, acompanha arroz, feijao tropeiro e vinagrete",
    price: 79.90,
    image: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?w=600&h=400&fit=crop",
    category: "Pratos Principais",
    tags: [],
    popular: true,
    customizations: [
      {
        id: "cust-1",
        name: "Ponto da carne",
        required: true,
        maxSelections: 1,
        options: [
          { id: "mal", name: "Mal passado", price: 0 },
          { id: "ao-ponto", name: "Ao ponto", price: 0 },
          { id: "bem", name: "Bem passado", price: 0 }
        ]
      },
      {
        id: "cust-2",
        name: "Acompanhamentos extras",
        required: false,
        maxSelections: 3,
        options: [
          { id: "farofa", name: "Farofa", price: 5 },
          { id: "batata", name: "Batata frita", price: 8 },
          { id: "queijo", name: "Queijo coalho", price: 12 }
        ]
      }
    ]
  },
  {
    id: "item-5",
    name: "Moqueca de Peixe",
    description: "Peixe fresco ao leite de coco com pimentoes, tomate e coentro",
    price: 69.90,
    image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&h=400&fit=crop",
    category: "Pratos Principais",
    tags: ["Sem Gluten"],
    popular: true
  },
  {
    id: "item-6",
    name: "Feijoada Completa",
    description: "Receita tradicional com carnes nobres, acompanha arroz, couve e laranja",
    price: 59.90,
    image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&h=400&fit=crop",
    category: "Pratos Principais",
    tags: []
  },
  {
    id: "item-7",
    name: "Risoto de Camarao",
    description: "Arroz arborio cremoso com camaroes salteados no alho",
    price: 72.90,
    image: "https://images.unsplash.com/photo-1633337474564-1d9478ca4e2e?w=600&h=400&fit=crop",
    category: "Pratos Principais",
    tags: []
  },
  {
    id: "item-8",
    name: "Frango a Parmegiana",
    description: "File de frango empanado, molho de tomate e queijo gratinado",
    price: 49.90,
    image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&h=400&fit=crop",
    category: "Pratos Principais",
    tags: []
  },

  // Saladas
  {
    id: "item-9",
    name: "Salada Caesar",
    description: "Alface romana, croutons, parmesao e molho caesar caseiro",
    price: 32.90,
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&h=400&fit=crop",
    category: "Saladas",
    tags: ["Vegetariano"],
    customizations: [
      {
        id: "cust-3",
        name: "Adicionar proteina",
        required: false,
        maxSelections: 1,
        options: [
          { id: "frango", name: "Frango grelhado", price: 12 },
          { id: "camarao", name: "Camarao", price: 18 }
        ]
      }
    ]
  },
  {
    id: "item-10",
    name: "Salada Tropical",
    description: "Mix de folhas, manga, abacaxi, nozes e molho de maracuja",
    price: 28.90,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop",
    category: "Saladas",
    tags: ["Vegano"]
  },

  // Sobremesas
  {
    id: "item-11",
    name: "Pudim de Leite",
    description: "Classico pudim de leite condensado com calda de caramelo",
    price: 16.90,
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&h=400&fit=crop",
    category: "Sobremesas",
    tags: [],
    popular: true
  },
  {
    id: "item-12",
    name: "Petit Gateau",
    description: "Bolo quente de chocolate com sorvete de creme",
    price: 24.90,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=400&fit=crop",
    category: "Sobremesas",
    tags: []
  },

  // Bebidas
  {
    id: "item-13",
    name: "Suco Natural",
    description: "Laranja, abacaxi, maracuja ou limao",
    price: 12.90,
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&h=400&fit=crop",
    category: "Bebidas",
    tags: ["Natural"]
  },
  {
    id: "item-14",
    name: "Caipirinha",
    description: "Limao, cachaca, acucar e gelo",
    price: 22.90,
    image: "https://images.unsplash.com/photo-1541546006121-5c3bc5e8c7b9?w=600&h=400&fit=crop",
    category: "Bebidas",
    tags: ["Alcoolico"]
  },
  {
    id: "item-15",
    name: "Refrigerante",
    description: "Coca-Cola, Guarana ou Sprite (350ml)",
    price: 7.90,
    image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&h=400&fit=crop",
    category: "Bebidas",
    tags: []
  }
]

export const categories = [
  { id: "entradas", name: "Entradas", count: 3 },
  { id: "pratos", name: "Pratos Principais", count: 5 },
  { id: "saladas", name: "Saladas", count: 2 },
  { id: "sobremesas", name: "Sobremesas", count: 2 },
  { id: "bebidas", name: "Bebidas", count: 3 }
]

// Alias exports para compatibilidade
export const menuCategories = categories
export const restaurantBrand = restaurantConfig

// Posts do restaurante
export const restaurantPosts = [
  {
    id: "rest-post-1",
    type: "social" as const,
    title: "Feijoada de sabado!",
    description: "Nossa tradicional feijoada completa esta de volta! Venha saborear com a familia.",
    image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?w=800&h=800&fit=crop",
    date: "2024-01-20",
    likes: 345,
    comments: 67,
    shares: 23,
  },
]
