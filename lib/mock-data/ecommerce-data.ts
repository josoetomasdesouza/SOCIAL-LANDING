import type { Product, ProductReview, BusinessConfig } from "@/lib/business-types"

export const ecommerceConfig: BusinessConfig = {
  model: "ecommerce",
  name: "Natura",
  logo: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=100&h=100&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=600&fit=crop",
  description: "Cosmeticos naturais e sustentaveis",
  primaryColor: "#FF6B00",
  whatsapp: "5511999999999",
  instagram: "@naturabrasil"
}

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Creme Hidratante Ekos Castanha",
    description: "Hidratacao intensa com manteiga de castanha da Amazonia",
    fullDescription: "O Creme Hidratante Corporal Ekos Castanha proporciona hidratacao intensa e prolongada para peles secas. Formulado com manteiga de castanha da Amazonia, extraida de forma sustentavel de comunidades ribeirinhas. Sua textura rica e cremosa absorve rapidamente, deixando a pele macia, nutrida e perfumada por ate 48 horas.",
    price: 79.90,
    originalPrice: 99.90,
    images: [
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=600&fit=crop"
    ],
    category: "Corpo",
    subcategory: "Hidratantes",
    rating: 4.8,
    reviewCount: 1247,
    stock: 150,
    sku: "EKO-CAST-400",
    specifications: [
      { label: "Volume", value: "400ml" },
      { label: "Tipo de pele", value: "Seca" },
      { label: "Fragrancia", value: "Castanha" },
      { label: "Vegano", value: "Sim" }
    ],
    variants: [
      {
        id: "size",
        name: "Tamanho",
        options: [
          { id: "200ml", value: "200ml", priceModifier: -30, available: true },
          { id: "400ml", value: "400ml", priceModifier: 0, available: true }
        ]
      }
    ],
    shipping: {
      freeShippingMinimum: 199,
      estimatedDays: 5,
      price: 15.90
    }
  },
  {
    id: "prod-2",
    name: "Perfume Essencial Masculino",
    description: "Fragrancia amadeirada com notas de vetiver e sândalo",
    fullDescription: "O Perfume Essencial Masculino e uma fragrancia sofisticada e marcante. Com notas de saida de bergamota e cardamomo, coracao de iris e gerânio, e fundo de vetiver, sandalo e ambar. Ideal para homens modernos que buscam elegância e personalidade.",
    price: 189.90,
    originalPrice: 229.90,
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=600&fit=crop"
    ],
    category: "Perfumaria",
    subcategory: "Masculino",
    rating: 4.9,
    reviewCount: 892,
    stock: 75,
    sku: "ESS-MASC-100",
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Familia olfativa", value: "Amadeirado" },
      { label: "Fixacao", value: "Longa duracao" }
    ],
    shipping: {
      freeShippingMinimum: 199,
      estimatedDays: 3,
      price: 12.90
    }
  },
  {
    id: "prod-3",
    name: "Oleo Trifasico Ekos Murumuru",
    description: "Nutricao intensa para cabelos secos e danificados",
    fullDescription: "O Oleo Trifasico Ekos Murumuru combina tres fases de tratamento em um unico produto. A fase oleosa nutre profundamente, a fase aquosa hidrata e a fase de silicone sela as cuticulas. Resultado: cabelos macios, brilhantes e sem frizz.",
    price: 69.90,
    images: [
      "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&h=600&fit=crop"
    ],
    category: "Cabelos",
    subcategory: "Tratamento",
    rating: 4.7,
    reviewCount: 456,
    stock: 200,
    sku: "EKO-MUR-100",
    specifications: [
      { label: "Volume", value: "100ml" },
      { label: "Tipo de cabelo", value: "Seco/Danificado" }
    ],
    shipping: {
      freeShippingMinimum: 199,
      estimatedDays: 5,
      price: 15.90
    }
  },
  {
    id: "prod-4",
    name: "Kit Presente Flor de Cerejeira",
    description: "Sabonete + hidratante + colonia em embalagem especial",
    fullDescription: "O Kit Presente Flor de Cerejeira e perfeito para presentear quem voce ama. Contem sabonete liquido de 250ml, hidratante corporal de 200ml e colonia de 75ml, todos com a delicada fragrancia de flor de cerejeira. Acompanha caixa presente exclusiva.",
    price: 149.90,
    originalPrice: 189.90,
    images: [
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop"
    ],
    category: "Presentes",
    subcategory: "Kits",
    rating: 4.9,
    reviewCount: 234,
    stock: 50,
    sku: "KIT-CEREJ-01",
    specifications: [
      { label: "Conteudo", value: "3 itens" },
      { label: "Embalagem", value: "Caixa presente" }
    ],
    shipping: {
      freeShippingMinimum: 199,
      estimatedDays: 5,
      price: 18.90
    }
  },
  {
    id: "prod-5",
    name: "Protetor Solar Facial FPS 70",
    description: "Protecao alta com toque seco e acabamento matte",
    fullDescription: "O Protetor Solar Facial Natura oferece altissima protecao contra raios UVA e UVB. Sua formula leve tem rapida absorcao, toque seco e acabamento matte, ideal para usar sob maquiagem. Enriquecido com vitamina E antioxidante.",
    price: 89.90,
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop"
    ],
    category: "Rosto",
    subcategory: "Protecao Solar",
    rating: 4.6,
    reviewCount: 567,
    stock: 180,
    sku: "SOL-FAC-50",
    specifications: [
      { label: "Volume", value: "50ml" },
      { label: "FPS", value: "70" },
      { label: "Acabamento", value: "Matte" }
    ],
    shipping: {
      freeShippingMinimum: 199,
      estimatedDays: 3,
      price: 12.90
    }
  }
]

export const productReviews: ProductReview[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    userName: "Maria Clara",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    title: "Melhor hidratante que ja usei!",
    comment: "Minha pele estava muito ressecada e depois de uma semana usando esse creme, ja notei uma diferenca enorme. O cheiro e maravilhoso e a hidratacao dura o dia todo. Super recomendo!",
    date: "2024-01-10",
    helpful: 45,
    verified: true
  },
  {
    id: "rev-2",
    productId: "prod-1",
    userName: "Juliana Santos",
    userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 4,
    title: "Otima hidratacao",
    comment: "Gostei bastante do produto, hidrata muito bem. Tirei uma estrela porque achei o cheiro um pouco forte, mas fora isso e perfeito.",
    date: "2024-01-08",
    helpful: 23,
    verified: true
  },
  {
    id: "rev-3",
    productId: "prod-2",
    userName: "Rafael Oliveira",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    title: "Fragrancia incrivel",
    comment: "Uso ha 3 meses e sempre recebo elogios. A fixacao e excelente, dura o dia inteiro. Vale cada centavo!",
    date: "2024-01-05",
    helpful: 67,
    verified: true
  }
]

export const categories = [
  { id: "corpo", name: "Corpo", count: 45, icon: "🧴" },
  { id: "rosto", name: "Rosto", count: 32, icon: "✨" },
  { id: "perfumaria", name: "Perfumaria", count: 28, icon: "🌸" },
  { id: "cabelos", name: "Cabelos", count: 24, icon: "💇" },
  { id: "presentes", name: "Presentes", count: 18, icon: "🎁" },
  { id: "maquiagem", name: "Maquiagem", count: 15, icon: "💄" }
]

// Alias exports para compatibilidade
export const ecommerceProducts = products
export const ecommerceReviews = productReviews
export const ecommerceCategories = categories
export const productCategories = categories
