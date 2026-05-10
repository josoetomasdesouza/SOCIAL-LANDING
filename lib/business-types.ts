// ============================================
// TIPOS BASE PARA TODOS OS MODELOS DE NEGOCIO
// ============================================

export type BusinessModel = 
  | 'appointment'   // Barbearia, Salao, Manicure, etc
  | 'ecommerce'     // Produtos, Marketplace
  | 'courses'       // Cursos, Educacao Online
  | 'restaurant'    // Restaurante, Delivery, Lanchonete
  | 'realestate'    // Imobiliaria, Corretor
  | 'professionals' // Advogado, Contador, Consultor
  | 'events'        // Eventos, Ingressos, Festas
  | 'gym'           // Academia, Personal, Studio
  | 'health'        // Clinica, Medico, Dentista

// Alias para compatibilidade
export type BusinessModelAlias = 'professional' | 'fitness'
export type BusinessType = BusinessModel | 'influencer' | 'personal' | 'institutional'

// Tipos base para brands de diferentes modelos
export interface RealEstateBrand {
  id: string
  name: string
  logo: string
  coverImage: string
  description: string
  specialties: string[]
  regions: string[]
  creci: string
}

export interface EventBrand {
  id: string
  name: string
  logo: string
  coverImage: string
  description: string
  category: string
}

export interface AppointmentBrand {
  id: string
  name: string
  logo: string
  coverImage: string
  description: string
  address: string
  phone: string
  whatsapp: string
  workingHours: string
  rating: number
  totalReviews: number
}

export interface GymBrand {
  id: string
  name: string
  logo: string
  coverImage: string
  description: string
  address: string
  phone: string
  workingHours: string
  amenities: string[]
}

export interface GymPlan {
  id: string
  name: string
  description: string
  price: number
  period: string
  features: string[]
  isPopular?: boolean
  popular?: boolean
  discount?: number
}

export interface GymClass {
  id: string
  name: string
  description: string
  instructor: string
  duration: string
  schedule: Array<{ day: string; times: string[] }>
  image: string
  spots: number
  category: string
}

export interface HealthBrand {
  id: string
  name: string
  logo: string
  coverImage: string
  description: string
  address: string
  phone: string
  workingHours: string
  specialties: string[]
  acceptedInsurance: string[]
}

export interface HealthProfessional {
  id: string
  name: string
  specialty?: string
  title?: string
  crm?: string
  avatar: string
  bio: string
  rating: number
  reviewCount?: number
  totalConsults: number
  consultationPrice?: number
  telemedicine?: boolean
  specialties?: string[]
  education?: Education[]
  experience?: number
  insurances?: string[]
  availability: DayAvailability[] | Record<string, string[]>
}

export interface HealthService {
  id: string
  name: string
  description: string
  duration: string | number
  price: number
  category?: string
  professional?: string
  isOnline?: boolean
  preparation?: string
}

export interface Insurance {
  id: string
  name: string
  logo?: string
}

export interface BusinessConfig {
  model?: BusinessType | BusinessModelAlias
  name: string
  logo: string
  coverImage: string
  description: string
  primaryColor?: string
  brandColor?: string
  whatsapp?: string
  instagram?: string
  address?: string
  openingHours?: string
  phone?: string
  email?: string
  location?: string
  occupation?: string
  youtube?: string
  twitter?: string
  tiktok?: string
}

// ============================================
// MODELO 1: AGENDAMENTO (Barbearia, Salao, etc)
// ============================================

export interface Professional {
  id: string
  name: string
  avatar: string
  role: string // Barbeiro, Cabeleireiro, Manicure
  rating: number
  reviewCount: number
  specialties: string[]
  availability: DayAvailability[]
}

export interface DayAvailability {
  date: string // YYYY-MM-DD
  slots: TimeSlot[]
}

export interface TimeSlot {
  time: string // HH:MM
  available: boolean
}

export interface Service {
  id: string
  name: string
  description: string
  duration: number // em minutos
  price: number
  image?: string
  category: string
  popular?: boolean
}

export interface StyleExample {
  id: string
  name: string
  image: string
  category: string // Degradê, Social, Pompadour, etc
  tags: string[]
  trend?: boolean
}

export interface Appointment {
  id: string
  professionalId: string
  serviceId: string
  date: string
  time: string
  customerName: string
  customerPhone: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

// ============================================
// MODELO 2: E-COMMERCE (Produtos, Marketplace)
// ============================================

export interface Product {
  id: string
  name: string
  description: string
  fullDescription?: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  subcategory?: string
  rating: number
  reviewCount: number
  stock: number
  sku?: string
  specifications?: ProductSpec[]
  variants?: ProductVariant[]
  shipping?: ShippingInfo
  seller?: SellerInfo
}

export interface ProductSpec {
  label: string
  value: string
}

export interface ProductVariant {
  id: string
  name: string // Tamanho, Cor, etc
  options: VariantOption[]
}

export interface VariantOption {
  id: string
  value: string
  priceModifier?: number
  available: boolean
}

export interface ShippingInfo {
  freeShippingMinimum?: number
  estimatedDays: number
  price: number
}

export interface SellerInfo {
  name: string
  rating: number
  salesCount: number
}

export interface CartItem {
  productId: string
  quantity: number
  selectedVariants?: Record<string, string>
}

export interface ProductReview {
  id: string
  productId: string
  userName: string
  userAvatar: string
  author?: string
  avatar?: string
  rating: number
  title: string
  comment: string
  date: string
  helpful: number
  images?: string[]
  verified: boolean
}

// ============================================
// MODELO 3: CURSOS (Educacao Online)
// ============================================

export interface Course {
  id: string
  title: string
  description: string
  instructor: Instructor
  thumbnail: string
  previewVideo?: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  studentsCount: number
  duration: string // "12h 30min"
  lessons: number
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  tags: string[]
  curriculum: CourseModule[]
  certificate: boolean
  lifetime: boolean
  features: string[]
}

export interface Instructor {
  id: string
  name: string
  avatar: string
  title: string
  bio: string
  rating: number
  studentsCount: number
  coursesCount: number
}

export interface CourseModule {
  id: string
  title: string
  lessons: Lesson[]
  duration: string
}

export interface Lesson {
  id: string
  title: string
  duration: string
  type: 'video' | 'quiz' | 'exercise' | 'download'
  preview: boolean
}

// ============================================
// MODELO 4: RESTAURANTE (Cardapio, Delivery)
// ============================================

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string // Entrada, Principal, Sobremesa, Bebida
  tags: string[] // Vegano, Sem Gluten, Picante
  popular?: boolean
  customizations?: MenuCustomization[]
  nutritionalInfo?: NutritionalInfo
}

export interface MenuCustomization {
  id: string
  name: string // "Ponto da carne", "Adicionais"
  required: boolean
  maxSelections: number
  options: CustomizationOption[]
}

export interface CustomizationOption {
  id: string
  name: string
  price: number
}

export interface NutritionalInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface OrderItem {
  menuItemId: string
  quantity: number
  customizations?: Record<string, string[]>
  notes?: string
}

export interface DeliveryInfo {
  minOrder: number
  deliveryFee: number
  estimatedTime: string // "30-45 min"
  freeDeliveryMinimum: number
}

// ============================================
// MODELO 5: IMOBILIARIA (Imoveis)
// ============================================

export interface Property {
  id: string
  title: string
  description: string
  name?: string
  type: 'sale' | 'rent' | string
  purpose?: string
  propertyType?: 'house' | 'apartment' | 'commercial' | 'land' | string
  price: number
  rentPrice?: number
  condoFee?: number
  iptu?: number
  images: string[]
  video?: string
  virtualTour?: string
  address: PropertyAddress
  neighborhood?: string
  city?: string
  bedrooms?: number
  bathrooms?: number
  parkingSpaces?: number
  area?: number
  features: PropertyFeatures | string[]
  amenities?: string[]
  agent: RealEstateAgent
  status?: 'available' | 'reserved' | 'sold' | 'rented'
  isHighlighted?: boolean
}

export interface PropertyAddress {
  street: string
  neighborhood: string
  city: string
  state: string
  zipCode?: string
  latitude?: number
  longitude?: number
}

export interface PropertyFeatures {
  bedrooms: number
  bathrooms: number
  parkingSpaces: number
  area: number // m²
  totalArea?: number
  floor?: number
  furnished?: boolean
  petFriendly?: boolean
}

export interface RealEstateAgent {
  id?: string
  name: string
  avatar: string
  phone: string
  email?: string
  creci?: string
}

// ============================================
// MODELO 6: PROFISSIONAIS LIBERAIS
// ============================================

export interface ProfessionalService {
  id: string
  name: string
  description: string
  duration: string
  price: number
  priceRange?: string // "A partir de R$ 500"
  category: string
  includes?: string[]
}

export interface ConsultationType {
  id: string
  name: string
  description: string
  duration: number // minutos
  price: number
  online: boolean
  inPerson: boolean
}

export interface ProfessionalProfile {
  id: string
  name: string
  avatar: string
  title: string // "Advogado Trabalhista", "Contador"
  oab?: string // ou CRC, CREA, etc
  bio: string
  specialties: string[]
  education: Education[]
  experience: number // anos
  rating: number
  reviewCount: number
  consultationTypes: ConsultationType[]
}

export interface Education {
  degree: string
  institution: string
  year: number
}

// ============================================
// MODELO 7: EVENTOS (Ingressos)
// ============================================

export interface Event {
  id: string
  title?: string
  name?: string
  description: string
  image: string
  images?: string[]
  date: string
  endDate?: string
  time: string
  endTime?: string
  venue?: Venue
  location?: Venue
  category?: string // Show, Teatro, Festival, Palestra
  ageRating?: string
  tickets: TicketType[]
  lineup?: Array<Artist | string>
  artists?: string[]
  organizer?: Organizer
  status?: 'upcoming' | 'soldout' | 'cancelled' | 'ended'
  price?: number
  capacity?: number
  isHighlighted?: boolean
}

export interface Venue {
  name: string
  address: string
  city: string
  state?: string
  capacity?: number
  mapUrl?: string
}

export interface TicketType {
  id: string
  name: string // Pista, VIP, Camarote
  description?: string
  price: number
  serviceFee?: number
  available: number | boolean
  maxPerPurchase?: number
  benefits?: string[]
}

export interface Artist {
  name: string
  image: string
  role?: string
}

export interface Organizer {
  name: string
  logo: string
  verified: boolean
}

// ============================================
// MODELO 8: FITNESS (Academia, Personal)
// ============================================

export interface FitnessPlan {
  id: string
  name: string
  description: string
  price: number
  period: 'monthly' | 'quarterly' | 'semiannual' | 'annual'
  features: string[]
  popular?: boolean
  savings?: number
}

export interface FitnessClass {
  id: string
  name: string
  description: string
  instructor: string
  instructorAvatar: string
  duration: number // minutos
  intensity: 'low' | 'medium' | 'high'
  category: string // Musculacao, Yoga, Spinning, Crossfit
  image: string
  schedule: ClassSchedule[]
  spotsAvailable: number
  maxSpots: number
}

export interface ClassSchedule {
  dayOfWeek: number // 0-6
  time: string
}

export interface PersonalTrainer {
  id: string
  name: string
  avatar: string
  specialties: string[]
  certifications: string[]
  experience: number
  rating: number
  price: number // por sessao
  availability: DayAvailability[]
  bio: string
}

export interface Clinic {
  id: string
  name: string
  logo: string
  address: string
  phone: string
  specialties: string[]
  professionals: HealthProfessional[]
  services: HealthService[]
  insurances: Insurance[]
}

// ============================================
// IA CONVERSACIONAL - TIPOS
// ============================================

export interface ConversationFlow {
  id: string
  businessModel: BusinessModel
  trigger: ConversationTrigger
  messages: ConversationMessage[]
}

export interface ConversationTrigger {
  type: 'view_item' | 'add_to_cart' | 'start_booking' | 'ask_price' | 'compare' | 'custom'
  itemType?: string
  condition?: string
}

export interface ConversationMessage {
  id: string
  role: 'ai' | 'user' | 'action'
  content: string
  options?: ConversationOption[]
  action?: ConversationAction
  delay?: number // ms antes de mostrar
}

export interface ConversationOption {
  id: string
  label: string
  nextMessageId?: string
  action?: ConversationAction
}

export interface ConversationAction {
  type: 'show_carousel' | 'open_drawer' | 'open_calendar' | 'add_to_cart' | 'start_checkout' | 'call_whatsapp' | 'show_map' | 'play_video'
  payload?: Record<string, unknown>
}

// ============================================
// CONFIGURACAO DE MODELOS
// ============================================

export const BUSINESS_MODEL_CONFIG: Record<BusinessModel, {
  name: string
  description: string
  icon: string
  primaryAction: string
  secondaryActions: string[]
  contentTypes: string[]
}> = {
  appointment: {
    name: 'Agendamento',
    description: 'Barbearia, Salao, Manicure, Estetica',
    icon: 'Calendar',
    primaryAction: 'Agendar horario',
    secondaryActions: ['Ver estilos', 'Conhecer profissionais', 'Ver precos'],
    contentTypes: ['services', 'professionals', 'styles', 'reviews']
  },
  ecommerce: {
    name: 'E-commerce',
    description: 'Produtos, Marketplace, Loja Virtual',
    icon: 'ShoppingBag',
    primaryAction: 'Comprar agora',
    secondaryActions: ['Adicionar ao carrinho', 'Ver avaliacoes', 'Calcular frete'],
    contentTypes: ['products', 'categories', 'reviews', 'offers']
  },
  courses: {
    name: 'Cursos',
    description: 'Educacao Online, Treinamentos',
    icon: 'GraduationCap',
    primaryAction: 'Matricular-se',
    secondaryActions: ['Assistir preview', 'Ver curriculo', 'Conhecer instrutor'],
    contentTypes: ['courses', 'modules', 'instructors', 'testimonials']
  },
  restaurant: {
    name: 'Restaurante',
    description: 'Cardapio, Delivery, Reservas',
    icon: 'UtensilsCrossed',
    primaryAction: 'Fazer pedido',
    secondaryActions: ['Ver cardapio', 'Reservar mesa', 'Ver avaliacoes'],
    contentTypes: ['menu', 'categories', 'reviews', 'promotions']
  },
  realestate: {
    name: 'Imobiliaria',
    description: 'Imoveis, Aluguel, Venda',
    icon: 'Home',
    primaryAction: 'Agendar visita',
    secondaryActions: ['Ver fotos', 'Simular financiamento', 'Falar com corretor'],
    contentTypes: ['properties', 'neighborhoods', 'agents', 'tours']
  },
  professionals: {
    name: 'Profissionais',
    description: 'Advogado, Contador, Consultor',
    icon: 'Briefcase',
    primaryAction: 'Agendar consulta',
    secondaryActions: ['Tirar duvida', 'Ver servicos', 'Solicitar orcamento'],
    contentTypes: ['services', 'cases', 'articles', 'testimonials']
  },
  events: {
    name: 'Eventos',
    description: 'Shows, Festas, Ingressos',
    icon: 'Ticket',
    primaryAction: 'Comprar ingresso',
    secondaryActions: ['Ver lineup', 'Escolher setor', 'Ver mapa'],
    contentTypes: ['events', 'tickets', 'artists', 'venue']
  },
  gym: {
    name: 'Fitness',
    description: 'Academia, Personal, Studio',
    icon: 'Dumbbell',
    primaryAction: 'Assinar plano',
    secondaryActions: ['Agendar aula', 'Conhecer estrutura', 'Falar com personal'],
    contentTypes: ['plans', 'classes', 'trainers', 'facilities']
  },
  health: {
    name: 'Saude',
    description: 'Clinica, Medico, Dentista',
    icon: 'Heart',
    primaryAction: 'Agendar consulta',
    secondaryActions: ['Ver convenios', 'Telemedicina', 'Ver especialidades'],
    contentTypes: ['professionals', 'services', 'insurances', 'units']
  }
}
