// ========================================
// DADOS MOCK POR CATEGORIA
// Baseados nos feeds reais de cada modelo
// ========================================

// ========================================
// TIPOS
// ========================================
export interface MockConfig {
  name: string
  description: string
  brandColor: string
  logo: string
  coverImage: string
  phone: string
  email: string
  address: string
}

export interface MockStory {
  id: string
  label: string
  icon: string
  image: string
}

export interface MockSection {
  id: string
  title: string
  type: "custom" | "content"
  icon?: string
  items?: any[]
  customContent?: any
}

export interface MockPost {
  id: string
  type: "video" | "image" | "product" | "news" | "review"
  title: string
  description?: string
  image: string
  price?: string
  oldPrice?: string
  discount?: string
  duration?: string
  rating?: number
  author?: string
  date?: string
}

// ========================================
// CONFIGS POR CATEGORIA
// ========================================
export const MOCK_CONFIGS: Record<string, MockConfig> = {
  institutional: {
    name: "Instituto Futuro Verde",
    description: "Transformando vidas atraves da educacao ambiental e desenvolvimento sustentavel.",
    brandColor: "#22C55E",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop",
    phone: "(11) 3456-7890",
    email: "contato@institutofuturoverde.org",
    address: "Av. Paulista, 1000 - Sao Paulo, SP"
  },
  restaurant: {
    name: "Sabor da Casa",
    description: "Comida caseira com sabor de familia. Delivery e reservas.",
    brandColor: "#EA580C",
    logo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop",
    phone: "(11) 99999-9999",
    email: "pedidos@sabordacasa.com",
    address: "Rua das Flores, 123 - Centro"
  },
  influencer: {
    name: "Julia Mendes",
    description: "Criadora de conteudo | Lifestyle | Moda | +500K seguidores",
    brandColor: "#EC4899",
    logo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop",
    phone: "(11) 99888-7777",
    email: "contato@juliamendes.com",
    address: "Sao Paulo, SP"
  },
  ecommerce: {
    name: "TechStore",
    description: "Tecnologia de ponta com os melhores precos. Entrega rapida.",
    brandColor: "#8B5CF6",
    logo: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop",
    phone: "0800 123 4567",
    email: "vendas@techstore.com",
    address: "Entrega para todo Brasil"
  },
  education: {
    name: "Escola Futuro",
    description: "Educacao que transforma. Cursos presenciais e online.",
    brandColor: "#3B82F6",
    logo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop",
    phone: "(11) 3333-4444",
    email: "matriculas@escolafuturo.edu.br",
    address: "Av. Brasil, 500 - Centro"
  },
  health: {
    name: "Clinica Vida",
    description: "Cuidado humanizado com excelencia medica. Todas as especialidades.",
    brandColor: "#06B6D4",
    logo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&h=400&fit=crop",
    phone: "(11) 4444-5555",
    email: "agendamento@clinicavida.com",
    address: "Rua dos Medicos, 200"
  },
  gym: {
    name: "Power Gym",
    description: "Transforme seu corpo, transforme sua vida. Planos a partir de R$79.",
    brandColor: "#EF4444",
    logo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=400&fit=crop",
    phone: "(11) 5555-6666",
    email: "matricula@powergym.com",
    address: "Rua do Esporte, 300"
  },
  events: {
    name: "EventosPro",
    description: "Os melhores eventos da cidade. Shows, festas e congressos.",
    brandColor: "#F59E0B",
    logo: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=400&fit=crop",
    phone: "(11) 6666-7777",
    email: "ingressos@eventospro.com",
    address: "Centro de Eventos"
  },
  realestate: {
    name: "Imob Premium",
    description: "Realizando sonhos desde 1990. Compra, venda e aluguel.",
    brandColor: "#10B981",
    logo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=400&fit=crop",
    phone: "(11) 7777-8888",
    email: "contato@imobpremium.com",
    address: "Av. Imobiliaria, 1000"
  },
  professional: {
    name: "Dr. Carlos Silva",
    description: "Advogado especialista em Direito Civil e Empresarial. OAB/SP 123456.",
    brandColor: "#6366F1",
    logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop",
    phone: "(11) 8888-9999",
    email: "contato@drcarlossilva.adv.br",
    address: "Rua dos Advogados, 50"
  },
  salon: {
    name: "Barbearia Vintage",
    description: "Cortes classicos e modernos. Agendamento online.",
    brandColor: "#D946EF",
    logo: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=400&fit=crop",
    phone: "(11) 9999-0000",
    email: "agenda@barbearivintage.com",
    address: "Rua do Estilo, 75"
  },
  personal: {
    name: "Joao Developer",
    description: "Full Stack Developer | React | Node | 5+ anos de experiencia",
    brandColor: "#0EA5E9",
    logo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop",
    phone: "(11) 91234-5678",
    email: "joao@developer.com",
    address: "Sao Paulo, SP"
  }
}

// ========================================
// STORIES POR CATEGORIA
// ========================================
export const MOCK_STORIES: Record<string, MockStory[]> = {
  institutional: [
    { id: "1", label: "Sobre", icon: "🏢", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop" },
    { id: "2", label: "Projetos", icon: "📋", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&h=100&fit=crop" },
    { id: "3", label: "Equipe", icon: "👥", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop" },
    { id: "4", label: "Impacto", icon: "📈", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop" },
    { id: "5", label: "Contato", icon: "✉️", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop" }
  ],
  restaurant: [
    { id: "1", label: "Cardapio", icon: "🍽️", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop" },
    { id: "2", label: "Promocoes", icon: "🏷️", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop" },
    { id: "3", label: "Delivery", icon: "🛵", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop" },
    { id: "4", label: "Sobremesas", icon: "🍰", image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=100&h=100&fit=crop" },
    { id: "5", label: "Bebidas", icon: "🍹", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=100&h=100&fit=crop" }
  ],
  influencer: [
    { id: "1", label: "Links", icon: "🔗", image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop" },
    { id: "2", label: "Videos", icon: "🎬", image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=100&h=100&fit=crop" },
    { id: "3", label: "Parcerias", icon: "🤝", image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop" },
    { id: "4", label: "Loja", icon: "🛍️", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop" },
    { id: "5", label: "Contato", icon: "✉️", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop" }
  ],
  ecommerce: [
    { id: "1", label: "Ofertas", icon: "🏷️", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&h=100&fit=crop" },
    { id: "2", label: "Novidades", icon: "✨", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop" },
    { id: "3", label: "Eletronicos", icon: "📱", image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=100&h=100&fit=crop" },
    { id: "4", label: "Casa", icon: "🏠", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop" },
    { id: "5", label: "Moda", icon: "👕", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop" }
  ],
  education: [
    { id: "1", label: "Cursos", icon: "📚", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=100&h=100&fit=crop" },
    { id: "2", label: "Professores", icon: "👨‍🏫", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=100&h=100&fit=crop" },
    { id: "3", label: "Eventos", icon: "📅", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=100&h=100&fit=crop" },
    { id: "4", label: "Depoimentos", icon: "⭐", image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=100&h=100&fit=crop" },
    { id: "5", label: "Matricula", icon: "📝", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&h=100&fit=crop" }
  ],
  health: [
    { id: "1", label: "Especialidades", icon: "🩺", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop" },
    { id: "2", label: "Medicos", icon: "👨‍⚕️", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop" },
    { id: "3", label: "Exames", icon: "🔬", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=100&h=100&fit=crop" },
    { id: "4", label: "Agendar", icon: "📅", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=100&h=100&fit=crop" },
    { id: "5", label: "Convenios", icon: "📋", image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100&h=100&fit=crop" }
  ],
  gym: [
    { id: "1", label: "Planos", icon: "💪", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop" },
    { id: "2", label: "Aulas", icon: "🏋️", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100&h=100&fit=crop" },
    { id: "3", label: "Personal", icon: "👤", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100&h=100&fit=crop" },
    { id: "4", label: "Horarios", icon: "🕐", image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=100&h=100&fit=crop" },
    { id: "5", label: "Resultados", icon: "📈", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=100&h=100&fit=crop" }
  ],
  events: [
    { id: "1", label: "Proximos", icon: "📅", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&h=100&fit=crop" },
    { id: "2", label: "Ingressos", icon: "🎟️", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop" },
    { id: "3", label: "Galeria", icon: "📸", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=100&h=100&fit=crop" },
    { id: "4", label: "VIP", icon: "👑", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&h=100&fit=crop" },
    { id: "5", label: "Local", icon: "📍", image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=100&h=100&fit=crop" }
  ],
  realestate: [
    { id: "1", label: "Venda", icon: "🏠", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&h=100&fit=crop" },
    { id: "2", label: "Aluguel", icon: "🔑", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100&h=100&fit=crop" },
    { id: "3", label: "Lancamentos", icon: "🆕", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop" },
    { id: "4", label: "Comercial", icon: "🏢", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=100&h=100&fit=crop" },
    { id: "5", label: "Contato", icon: "📞", image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=100&h=100&fit=crop" }
  ],
  professional: [
    { id: "1", label: "Servicos", icon: "💼", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    { id: "2", label: "Areas", icon: "📊", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=100&h=100&fit=crop" },
    { id: "3", label: "Casos", icon: "🏆", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=100&h=100&fit=crop" },
    { id: "4", label: "Artigos", icon: "📝", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&h=100&fit=crop" },
    { id: "5", label: "Agendar", icon: "📅", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop" }
  ],
  salon: [
    { id: "1", label: "Cortes", icon: "✂️", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=100&h=100&fit=crop" },
    { id: "2", label: "Barba", icon: "🧔", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=100&h=100&fit=crop" },
    { id: "3", label: "Equipe", icon: "👨‍🎨", image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=100&h=100&fit=crop" },
    { id: "4", label: "Precos", icon: "💰", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=100&h=100&fit=crop" },
    { id: "5", label: "Agendar", icon: "📅", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop" }
  ],
  personal: [
    { id: "1", label: "Sobre", icon: "👤", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
    { id: "2", label: "Projetos", icon: "💼", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop" },
    { id: "3", label: "Skills", icon: "🎯", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&h=100&fit=crop" },
    { id: "4", label: "Blog", icon: "📝", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&h=100&fit=crop" },
    { id: "5", label: "Contato", icon: "✉️", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop" }
  ]
}

// ========================================
// POSTS MOCK POR CATEGORIA
// ========================================
export const MOCK_POSTS: Record<string, MockPost[]> = {
  institutional: [
    { id: "1", type: "video", title: "Conheca nosso trabalho", description: "Veja como transformamos vidas", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop", duration: "3:45" },
    { id: "2", type: "news", title: "Projeto premiado em 2024", description: "Reconhecimento nacional", image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop", date: "15 Jan 2024" },
    { id: "3", type: "image", title: "Nossa equipe", description: "Profissionais dedicados", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop" }
  ],
  restaurant: [
    { id: "1", type: "product", title: "Picanha na Brasa", description: "500g com acompanhamentos", image: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&h=300&fit=crop", price: "R$ 89,90", oldPrice: "R$ 109,90", discount: "18%" },
    { id: "2", type: "product", title: "Feijoada Completa", description: "Serve 2 pessoas", image: "https://images.unsplash.com/photo-1547496502-affa22d38842?w=400&h=300&fit=crop", price: "R$ 69,90" },
    { id: "3", type: "video", title: "Nossa Cozinha", description: "Veja como preparamos", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop", duration: "2:30" },
    { id: "4", type: "review", title: "Comida maravilhosa!", author: "Maria S.", rating: 5, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" }
  ],
  influencer: [
    { id: "1", type: "video", title: "Get Ready With Me", description: "Rotina de maquiagem", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop", duration: "12:45" },
    { id: "2", type: "video", title: "Tour pelo closet", description: "Organizacao e dicas", image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=300&fit=crop", duration: "8:20" },
    { id: "3", type: "product", title: "Minha linha de skincare", description: "Link na bio", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop", price: "R$ 149,90" }
  ],
  ecommerce: [
    { id: "1", type: "product", title: "iPhone 15 Pro Max", description: "256GB - Titanio Natural", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop", price: "R$ 9.499", oldPrice: "R$ 10.999", discount: "14%" },
    { id: "2", type: "product", title: "MacBook Air M3", description: "8GB RAM - 256GB SSD", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop", price: "R$ 11.999" },
    { id: "3", type: "product", title: "AirPods Pro 2", description: "Com estojo MagSafe", image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=300&fit=crop", price: "R$ 1.899", oldPrice: "R$ 2.299", discount: "17%" },
    { id: "4", type: "review", title: "Entrega super rapida!", author: "Carlos M.", rating: 5, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" }
  ],
  education: [
    { id: "1", type: "product", title: "MBA em Gestao", description: "12 meses - Online", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop", price: "R$ 599/mes" },
    { id: "2", type: "video", title: "Aula demonstrativa", description: "Conheca nossa metodologia", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop", duration: "15:00" },
    { id: "3", type: "review", title: "Mudou minha carreira!", author: "Ana P.", rating: 5, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" }
  ],
  health: [
    { id: "1", type: "image", title: "Cardiologia", description: "Exames e consultas", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop" },
    { id: "2", type: "video", title: "Dicas de saude", description: "Dr. Silva explica", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&fit=crop", duration: "5:30" },
    { id: "3", type: "review", title: "Atendimento excelente", author: "Jose R.", rating: 5, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" }
  ],
  gym: [
    { id: "1", type: "product", title: "Plano Black", description: "Acesso total + Personal", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop", price: "R$ 199/mes", oldPrice: "R$ 299/mes", discount: "33%" },
    { id: "2", type: "video", title: "Treino HIIT", description: "20 min de queima total", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop", duration: "20:00" },
    { id: "3", type: "image", title: "Transformacao", description: "Antes e depois", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop" }
  ],
  events: [
    { id: "1", type: "product", title: "Festival de Verao 2024", description: "3 dias de musica", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop", price: "R$ 450", oldPrice: "R$ 600", discount: "25%" },
    { id: "2", type: "video", title: "Bastidores", description: "Montagem do palco", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop", duration: "4:00" },
    { id: "3", type: "image", title: "Galeria 2023", description: "Melhores momentos", image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop" }
  ],
  realestate: [
    { id: "1", type: "product", title: "Apartamento Alto Padrao", description: "200m2 - 4 suites - Vista mar", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop", price: "R$ 2.500.000" },
    { id: "2", type: "product", title: "Casa em Condominio", description: "350m2 - Piscina - Gourmet", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop", price: "R$ 1.800.000" },
    { id: "3", type: "video", title: "Tour Virtual", description: "Conheca sem sair de casa", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop", duration: "6:00" }
  ],
  professional: [
    { id: "1", type: "video", title: "Seus direitos", description: "Dicas juridicas", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop", duration: "8:00" },
    { id: "2", type: "news", title: "Nova lei aprovada", description: "Impactos para empresas", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop", date: "20 Mar 2024" },
    { id: "3", type: "review", title: "Profissional excepcional", author: "Empresa ABC", rating: 5, image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
  ],
  salon: [
    { id: "1", type: "product", title: "Corte + Barba", description: "Combo completo", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop", price: "R$ 75", oldPrice: "R$ 95", discount: "21%" },
    { id: "2", type: "video", title: "Fade perfeito", description: "Tecnica profissional", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop", duration: "10:00" },
    { id: "3", type: "review", title: "Melhor barbearia!", author: "Pedro H.", rating: 5, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" }
  ],
  personal: [
    { id: "1", type: "image", title: "E-commerce React", description: "Projeto completo", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop" },
    { id: "2", type: "video", title: "Tutorial Next.js", description: "Do zero ao deploy", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop", duration: "45:00" },
    { id: "3", type: "news", title: "Artigo publicado", description: "React Server Components", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop", date: "10 Abr 2024" }
  ]
}

// ========================================
// SECOES CUSTOMIZADAS POR CATEGORIA
// ========================================
export const MOCK_SECTIONS: Record<string, any[]> = {
  institutional: [
    {
      id: "about",
      title: "Quem Somos",
      type: "about",
      content: "Somos uma organizacao dedicada a transformar vidas atraves da educacao e desenvolvimento sustentavel. Ha mais de 14 anos atuamos em comunidades de todo o Brasil.",
      buttons: ["Fale conosco", "Relatorio Anual"]
    },
    {
      id: "pillars",
      title: "Nosso Proposito",
      type: "pillars",
      items: [
        { id: "1", title: "Missao", description: "Promover a educacao ambiental e o desenvolvimento sustentavel.", color: "#22C55E", icon: "target" },
        { id: "2", title: "Visao", description: "Ser referencia nacional em impacto socioambiental ate 2030.", color: "#3B82F6", icon: "eye" },
        { id: "3", title: "Valores", description: "Etica, transparencia, respeito e colaboracao.", color: "#EF4444", icon: "heart" }
      ]
    },
    {
      id: "impact",
      title: "Nosso Impacto",
      type: "metrics",
      items: [
        { id: "1", value: "15K+", label: "Pessoas impactadas" },
        { id: "2", value: "120", label: "Projetos realizados" },
        { id: "3", value: "45", label: "Cidades atendidas" },
        { id: "4", value: "14", label: "Anos de atuacao" }
      ]
    },
    {
      id: "team",
      title: "Nossa Equipe",
      type: "team",
      items: [
        { id: "1", name: "Maria Silva", role: "Diretora Executiva", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop" },
        { id: "2", name: "Carlos Santos", role: "Gerente de Projetos", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
        { id: "3", name: "Ana Oliveira", role: "Coord. Marketing", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" }
      ]
    },
    {
      id: "faq",
      title: "Perguntas Frequentes",
      type: "faq",
      items: [
        { id: "1", question: "Como posso contribuir?", answer: "Voce pode contribuir como voluntario ou doador. Entre em contato conosco." },
        { id: "2", question: "Onde voces atuam?", answer: "Atuamos em 45 cidades de 12 estados brasileiros." },
        { id: "3", question: "Como acompanhar os projetos?", answer: "Publicamos relatorios trimestrais em nosso site." }
      ]
    }
  ],
  restaurant: [
    {
      id: "popular",
      title: "Mais Pedidos",
      type: "products",
      items: [
        { id: "1", name: "Picanha na Brasa", description: "500g com acompanhamentos", price: "R$ 89,90", oldPrice: "R$ 109,90", image: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=300&h=200&fit=crop", badge: "Favorito" },
        { id: "2", name: "Feijoada Completa", description: "Serve 2 pessoas", price: "R$ 69,90", image: "https://images.unsplash.com/photo-1547496502-affa22d38842?w=300&h=200&fit=crop" },
        { id: "3", name: "Costela BBQ", description: "Molho especial", price: "R$ 79,90", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop", badge: "Novo" }
      ]
    },
    {
      id: "info",
      title: "Informacoes",
      type: "info",
      items: [
        { icon: "truck", label: "Entrega em 30-45 min" },
        { icon: "tag", label: "Frete gratis acima de R$50" },
        { icon: "clock", label: "Seg-Dom: 11h-23h" }
      ]
    },
    {
      id: "menu",
      title: "Cardapio",
      type: "categories",
      items: [
        { id: "1", name: "Carnes", icon: "🥩", count: 12 },
        { id: "2", name: "Peixes", icon: "🐟", count: 8 },
        { id: "3", name: "Massas", icon: "🍝", count: 10 },
        { id: "4", name: "Saladas", icon: "🥗", count: 6 },
        { id: "5", name: "Sobremesas", icon: "🍰", count: 8 }
      ]
    }
  ],
  influencer: [
    {
      id: "links",
      title: "Meus Links",
      type: "links",
      items: [
        { id: "1", label: "Minha loja", url: "#", icon: "shopping-bag", color: "#EC4899" },
        { id: "2", label: "YouTube", url: "#", icon: "youtube", color: "#EF4444" },
        { id: "3", label: "Podcast", url: "#", icon: "headphones", color: "#8B5CF6" },
        { id: "4", label: "Newsletter", url: "#", icon: "mail", color: "#3B82F6" }
      ]
    },
    {
      id: "metrics",
      title: "Numeros",
      type: "metrics",
      items: [
        { id: "1", value: "500K+", label: "Seguidores" },
        { id: "2", value: "8.5%", label: "Engajamento" },
        { id: "3", value: "50M+", label: "Views/mes" },
        { id: "4", value: "200+", label: "Parcerias" }
      ]
    },
    {
      id: "partners",
      title: "Parcerias",
      type: "brands",
      items: [
        { id: "1", name: "Nike", logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop" },
        { id: "2", name: "Apple", logo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&h=100&fit=crop" },
        { id: "3", name: "Samsung", logo: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=100&h=100&fit=crop" }
      ]
    }
  ],
  ecommerce: [
    {
      id: "offers",
      title: "Ofertas do Dia",
      type: "products",
      items: [
        { id: "1", name: "iPhone 15 Pro Max", description: "256GB", price: "R$ 9.499", oldPrice: "R$ 10.999", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&h=200&fit=crop", badge: "-14%" },
        { id: "2", name: "MacBook Air M3", description: "8GB - 256GB", price: "R$ 11.999", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop" },
        { id: "3", name: "AirPods Pro 2", description: "Com MagSafe", price: "R$ 1.899", oldPrice: "R$ 2.299", image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&h=200&fit=crop", badge: "-17%" }
      ]
    },
    {
      id: "categories",
      title: "Categorias",
      type: "categories",
      items: [
        { id: "1", name: "Celulares", icon: "📱", count: 45 },
        { id: "2", name: "Notebooks", icon: "💻", count: 32 },
        { id: "3", name: "TVs", icon: "📺", count: 28 },
        { id: "4", name: "Audio", icon: "🎧", count: 56 },
        { id: "5", name: "Games", icon: "🎮", count: 41 }
      ]
    },
    {
      id: "info",
      title: "Vantagens",
      type: "info",
      items: [
        { icon: "truck", label: "Frete gratis acima de R$299" },
        { icon: "shield", label: "Garantia estendida" },
        { icon: "credit-card", label: "12x sem juros" }
      ]
    }
  ]
}

const CATEGORY_ALIASES: Record<string, string> = {
  appointment: "salon",
  courses: "education",
  professionals: "professional",
}

export function normalizeMockCategory(category?: string) {
  if (!category) return "institutional"
  return CATEGORY_ALIASES[category] || category
}

// Funcao para mesclar dados do usuario com mock
export function mergeWithMock(userData: any, category: string) {
  const normalizedCategory = normalizeMockCategory(category)
  const mockConfig = MOCK_CONFIGS[normalizedCategory] || MOCK_CONFIGS.institutional
  const mockStories = MOCK_STORIES[normalizedCategory] || MOCK_STORIES.institutional
  const mockPosts = MOCK_POSTS[normalizedCategory] || MOCK_POSTS.institutional
  const mockSections = MOCK_SECTIONS[normalizedCategory] || MOCK_SECTIONS.institutional

  return {
    config: {
      name: userData.name || mockConfig.name,
      description: userData.description || mockConfig.description,
      brandColor: mockConfig.brandColor,
      logo: userData.logo || mockConfig.logo,
      coverImage: userData.cover || mockConfig.coverImage,
      phone: userData.whatsapp || mockConfig.phone,
      email: userData.email || mockConfig.email,
      address: userData.address || mockConfig.address,
      instagram: userData.instagram
    },
    stories: mockStories,
    posts: mockPosts,
    sections: mockSections,
    isMock: {
      name: !userData.name,
      description: !userData.description,
      logo: !userData.logo,
      cover: !userData.cover,
      phone: !userData.whatsapp,
      email: !userData.email,
      address: !userData.address,
      instagram: !userData.instagram
    }
  }
}
