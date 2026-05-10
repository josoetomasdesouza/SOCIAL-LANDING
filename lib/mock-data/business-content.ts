// ========================================
// CONTEUDO GERAL PARA TODOS OS MODELOS DE NEGOCIO
// Videos, Noticias, Avaliacoes, Posts Sociais
// ========================================

import type { UniversalPost as BusinessPost, UniversalStory as BusinessStory } from "@/lib/core"

// ========================================
// APPOINTMENT (BARBEARIA)
// ========================================
export const appointmentContent = {
  stories: [
    { id: "apt-story-1", name: "Agendar", image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop", isMain: true },
    { id: "apt-story-2", name: "Cortes", image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=200&h=200&fit=crop" },
    { id: "apt-story-3", name: "Barba", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop" },
    { id: "apt-story-4", name: "Ofertas", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop" },
    { id: "apt-story-5", name: "Kids", image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=200&h=200&fit=crop" },
  ] as BusinessStory[],
  
  videos: [
    { id: "apt-vid-1", type: "video" as const, title: "Tutorial: Fade Perfeito em 5 Minutos", description: "Nosso barbeiro chefe mostra a tecnica do fade mais pedido da casa", image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=450&fit=crop", duration: "5:23", views: 45000 },
    { id: "apt-vid-2", type: "video" as const, title: "Tendencias de Corte Masculino 2024", description: "Os estilos que estao bombando esse ano", image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&h=450&fit=crop", duration: "8:45", views: 32000 },
    { id: "apt-vid-3", type: "video-vertical" as const, title: "Antes e Depois: Transformacao completa", description: "Cliente saiu outro homem!", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=700&fit=crop", duration: "0:45", views: 120000 },
  ] as BusinessPost[],
  
  news: [
    { id: "apt-news-1", type: "news" as const, title: "Barbearia Dom Corleone e eleita a melhor da cidade pelo 3o ano consecutivo", description: "Premiacao foi entregue ontem em cerimonia no centro de convencoes", image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=450&fit=crop", source: "Jornal da Cidade", date: "2024-01-15" },
    { id: "apt-news-2", type: "news" as const, title: "Barbeiro local participa de campeonato mundial", description: "Representante brasileiro vai competir em Las Vegas", source: "Portal de Noticias", date: "2024-01-10" },
  ] as BusinessPost[],
  
  reviews: [
    { id: "apt-rev-1", type: "review" as const, title: "Melhor barbearia que ja fui! O Carlos e um artista do fade.", reviewerName: "Marcos Silva", reviewerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "apt-rev-2", type: "review" as const, title: "Atendimento impecavel, ambiente muito agradavel. Volto sempre!", reviewerName: "Pedro Henrique", reviewerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "apt-rev-3", type: "review" as const, title: "Precos justos e qualidade excepcional. Recomendo demais!", reviewerName: "Lucas Oliveira", reviewerAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face", rating: 4 },
  ] as BusinessPost[],
  
  social: [
    { id: "apt-soc-1", type: "social" as const, title: "Sabado de casa cheia! Obrigado pela confianca de sempre.", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=800&fit=crop" },
    { id: "apt-soc-2", type: "social" as const, title: "Nosso espaco foi renovado! Vem conhecer o novo lounge.", image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=800&fit=crop" },
  ] as BusinessPost[],
}

// ========================================
// ECOMMERCE
// ========================================
export const ecommerceContent = {
  stories: [
    { id: "ecom-story-1", name: "Ofertas", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop", isMain: true },
    { id: "ecom-story-2", name: "Novidades", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop" },
    { id: "ecom-story-3", name: "Mais Vendidos", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop" },
    { id: "ecom-story-4", name: "Frete Gratis", image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&h=200&fit=crop" },
    { id: "ecom-story-5", name: "Colecao", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop" },
  ] as BusinessStory[],
  
  videos: [
    { id: "ecom-vid-1", type: "video" as const, title: "Unboxing: Nova colecao de verao chegou!", description: "Veja em primeira mao as pecas que vao bombar na estacao", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop", duration: "6:12", views: 89000 },
    { id: "ecom-vid-2", type: "video" as const, title: "Como escolher o tamanho ideal", description: "Guia completo para nao errar na compra online", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=450&fit=crop", duration: "4:30", views: 156000 },
    { id: "ecom-vid-3", type: "video-vertical" as const, title: "Trend Alert: As cores da temporada", description: "Vista-se como as celebridades!", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=700&fit=crop", duration: "0:58", views: 234000 },
  ] as BusinessPost[],
  
  news: [
    { id: "ecom-news-1", type: "news" as const, title: "Loja conquista selo de sustentabilidade ambiental", description: "Marca e reconhecida por praticas ESG e uso de materiais reciclados", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=450&fit=crop", source: "Revista Sustentavel", date: "2024-01-18" },
    { id: "ecom-news-2", type: "news" as const, title: "Black Friday: loja registra recorde de vendas", description: "Mais de 50 mil pedidos foram processados em apenas 24 horas", source: "Portal E-commerce", date: "2024-01-12" },
  ] as BusinessPost[],
  
  reviews: [
    { id: "ecom-rev-1", type: "review" as const, title: "Entrega super rapida! Chegou antes do prazo e a qualidade e incrivel.", reviewerName: "Juliana Santos", reviewerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "ecom-rev-2", type: "review" as const, title: "Produtos identicos as fotos. Atendimento excelente pelo chat.", reviewerName: "Fernanda Lima", reviewerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "ecom-rev-3", type: "review" as const, title: "Troca foi muito facil de fazer. Recomendo a loja!", reviewerName: "Carla Mendes", reviewerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face", rating: 4 },
  ] as BusinessPost[],
  
  social: [
    { id: "ecom-soc-1", type: "social" as const, title: "Nova colecao disponivel! Qual e a sua cor favorita?", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop" },
    { id: "ecom-soc-2", type: "social" as const, title: "Bastidores do photoshoot da campanha de verao", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop" },
  ] as BusinessPost[],
}

// ========================================
// COURSES (EDUCACAO)
// ========================================
export const coursesContent = {
  stories: [
    { id: "course-story-1", name: "Cursos", image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=200&h=200&fit=crop", isMain: true },
    { id: "course-story-2", name: "Gratis", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&h=200&fit=crop" },
    { id: "course-story-3", name: "Tecnologia", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=200&h=200&fit=crop" },
    { id: "course-story-4", name: "Negocios", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=200&fit=crop" },
    { id: "course-story-5", name: "Certificados", image: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=200&h=200&fit=crop" },
  ] as BusinessStory[],
  
  videos: [
    { id: "course-vid-1", type: "video" as const, title: "Aula Gratis: Introducao ao Python para Iniciantes", description: "Aprenda os fundamentos da programacao em 30 minutos", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop", duration: "32:15", views: 890000 },
    { id: "course-vid-2", type: "video" as const, title: "Como montar seu portfolio profissional", description: "Dicas para impressionar recrutadores", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop", duration: "18:45", views: 234000 },
    { id: "course-vid-3", type: "video-vertical" as const, title: "3 dicas para estudar melhor", description: "Tecnicas de produtividade que funcionam!", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=700&fit=crop", duration: "1:02", views: 567000 },
  ] as BusinessPost[],
  
  news: [
    { id: "course-news-1", type: "news" as const, title: "Plataforma atinge marca de 1 milhao de alunos formados", description: "Sucesso e atribuido a metodologia pratica e suporte personalizado", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=450&fit=crop", source: "Portal Educacao", date: "2024-01-20" },
    { id: "course-news-2", type: "news" as const, title: "Parceria com Microsoft oferece certificacoes gratuitas", description: "Programa vai beneficiar estudantes de baixa renda", source: "Tech News", date: "2024-01-15" },
  ] as BusinessPost[],
  
  reviews: [
    { id: "course-rev-1", type: "review" as const, title: "Consegui meu primeiro emprego em tech gracas ao curso! Metodologia incrivel.", reviewerName: "Rafael Costa", reviewerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "course-rev-2", type: "review" as const, title: "Conteudo muito didatico. Os projetos praticos fazem toda diferenca.", reviewerName: "Amanda Rodrigues", reviewerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "course-rev-3", type: "review" as const, title: "Suporte excelente! Toda duvida e respondida em menos de 24h.", reviewerName: "Bruno Almeida", reviewerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", rating: 5 },
  ] as BusinessPost[],
  
  social: [
    { id: "course-soc-1", type: "social" as const, title: "Mais uma turma formada! Parabens aos novos desenvolvedores!", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=800&fit=crop" },
    { id: "course-soc-2", type: "social" as const, title: "Live especial hoje as 19h: Como conseguir sua primeira vaga em tech", image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=800&fit=crop" },
  ] as BusinessPost[],
}

// ========================================
// RESTAURANT
// ========================================
export const restaurantContent = {
  stories: [
    { id: "rest-story-1", name: "Cardapio", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop", isMain: true },
    { id: "rest-story-2", name: "Promocoes", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop" },
    { id: "rest-story-3", name: "Delivery", image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=200&h=200&fit=crop" },
    { id: "rest-story-4", name: "Sobremesas", image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=200&h=200&fit=crop" },
    { id: "rest-story-5", name: "Bebidas", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop" },
  ] as BusinessStory[],
  
  videos: [
    { id: "rest-vid-1", type: "video" as const, title: "Bastidores: Como preparamos nossa famosa picanha", description: "Chef revela os segredos do ponto perfeito", image: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=450&fit=crop", duration: "4:32", views: 78000 },
    { id: "rest-vid-2", type: "video" as const, title: "Tour pelo nosso salao renovado", description: "Veja o novo ambiente que preparamos para voce", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=450&fit=crop", duration: "3:15", views: 45000 },
    { id: "rest-vid-3", type: "video-vertical" as const, title: "Drinks de verao: aprenda a fazer em casa!", description: "Receita exclusiva do nosso bartender", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=700&fit=crop", duration: "0:55", views: 123000 },
  ] as BusinessPost[],
  
  news: [
    { id: "rest-news-1", type: "news" as const, title: "Restaurante recebe estrela Michelin pela primeira vez", description: "Reconhecimento veio apos 10 anos de dedicacao a gastronomia local", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=450&fit=crop", source: "Guia Michelin", date: "2024-01-22" },
    { id: "rest-news-2", type: "news" as const, title: "Chef e convidado para evento gastronomico internacional", description: "Representante brasileiro vai cozinhar em Paris", source: "Portal Gourmet", date: "2024-01-18" },
  ] as BusinessPost[],
  
  reviews: [
    { id: "rest-rev-1", type: "review" as const, title: "A melhor picanha da cidade! Atendimento impecavel e ambiente aconchegante.", reviewerName: "Roberto Dias", reviewerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "rest-rev-2", type: "review" as const, title: "Comida deliciosa e porcoes generosas. Vale cada centavo!", reviewerName: "Patricia Souza", reviewerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "rest-rev-3", type: "review" as const, title: "Delivery chegou rapido e quente. Sobremesa de cortesia foi uma surpresa!", reviewerName: "Carlos Andrade", reviewerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", rating: 4 },
  ] as BusinessPost[],
  
  social: [
    { id: "rest-soc-1", type: "social" as const, title: "Feijoada de sabado esta de volta! Reserve sua mesa.", image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?w=800&h=800&fit=crop" },
    { id: "rest-soc-2", type: "social" as const, title: "Nossa equipe agradece a preferencia de voces!", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=800&fit=crop" },
  ] as BusinessPost[],
}

// ========================================
// REALESTATE (IMOBILIARIA)
// ========================================
export const realestateContent = {
  stories: [
    { id: "real-story-1", name: "Imoveis", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop", isMain: true },
    { id: "real-story-2", name: "Apartamentos", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&h=200&fit=crop" },
    { id: "real-story-3", name: "Casas", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=200&fit=crop" },
    { id: "real-story-4", name: "Comercial", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop" },
    { id: "real-story-5", name: "Lancamentos", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=200&fit=crop" },
  ] as BusinessStory[],
  
  videos: [
    { id: "real-vid-1", type: "video" as const, title: "Tour Virtual: Cobertura duplex com vista para o mar", description: "400m2 de puro luxo no melhor bairro da cidade", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=450&fit=crop", duration: "5:45", views: 34000 },
    { id: "real-vid-2", type: "video" as const, title: "Dicas para comprar seu primeiro imovel", description: "O que voce precisa saber antes de fechar negocio", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop", duration: "12:30", views: 89000 },
    { id: "real-vid-3", type: "video-vertical" as const, title: "Antes e depois: Reforma completa do apartamento", description: "Transformacao incrivel em 60 dias", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=700&fit=crop", duration: "1:15", views: 156000 },
  ] as BusinessPost[],
  
  news: [
    { id: "real-news-1", type: "news" as const, title: "Mercado imobiliario aquece e precos sobem 15% no ano", description: "Especialistas apontam momento favoravel para investimentos", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop", source: "Economia Hoje", date: "2024-01-25" },
    { id: "real-news-2", type: "news" as const, title: "Novo bairro planejado promete revolucionar a cidade", description: "Projeto inclui areas verdes, comercio e moradia integrados", source: "Jornal da Construcao", date: "2024-01-20" },
  ] as BusinessPost[],
  
  reviews: [
    { id: "real-rev-1", type: "review" as const, title: "Atendimento excepcional! Encontraram o apartamento perfeito para minha familia.", reviewerName: "Marcelo Santos", reviewerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "real-rev-2", type: "review" as const, title: "Corretora muito atenciosa e conhece bem a regiao. Super recomendo!", reviewerName: "Ana Paula Ferreira", reviewerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "real-rev-3", type: "review" as const, title: "Processo de compra foi muito tranquilo. Equipe juridica excelente.", reviewerName: "Ricardo Monteiro", reviewerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", rating: 5 },
  ] as BusinessPost[],
  
  social: [
    { id: "real-soc-1", type: "social" as const, title: "Mais uma familia realizando o sonho da casa propria! Parabens!", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=800&fit=crop" },
    { id: "real-soc-2", type: "social" as const, title: "Novo empreendimento chegando! Cadastre-se para condições especiais de lancamento.", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=800&fit=crop" },
  ] as BusinessPost[],
}

// ========================================
// EVENTS
// ========================================
export const eventsContent = {
  stories: [
    { id: "evt-story-1", name: "Proximos", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=200&h=200&fit=crop", isMain: true },
    { id: "evt-story-2", name: "Shows", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=200&fit=crop" },
    { id: "evt-story-3", name: "Festivais", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=200&h=200&fit=crop" },
    { id: "evt-story-4", name: "VIP", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=200&fit=crop" },
    { id: "evt-story-5", name: "Bastidores", image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&h=200&fit=crop" },
  ] as BusinessStory[],
  
  videos: [
    { id: "evt-vid-1", type: "video" as const, title: "Aftermovie: Festival de Verao 2024", description: "Reviva os melhores momentos do maior festival do ano", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=450&fit=crop", duration: "8:45", views: 456000 },
    { id: "evt-vid-2", type: "video" as const, title: "Entrevista exclusiva com o headliner", description: "Artista fala sobre expectativas para o show", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop", duration: "15:20", views: 234000 },
    { id: "evt-vid-3", type: "video-vertical" as const, title: "Spoiler: cenario do proximo show", description: "Veja em primeira mao!", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=700&fit=crop", duration: "0:45", views: 789000 },
  ] as BusinessPost[],
  
  news: [
    { id: "evt-news-1", type: "news" as const, title: "Festival anuncia lineup completo e surpreende fas", description: "Grandes nomes nacionais e internacionais confirmados", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=450&fit=crop", source: "Portal de Eventos", date: "2024-01-28" },
    { id: "evt-news-2", type: "news" as const, title: "Ingressos esgotam em tempo recorde", description: "Mais de 50 mil tickets vendidos em apenas 2 horas", source: "Entretenimento News", date: "2024-01-25" },
  ] as BusinessPost[],
  
  reviews: [
    { id: "evt-rev-1", type: "review" as const, title: "Melhor festival que ja fui! Organizacao impecavel e som perfeito.", reviewerName: "Gabriel Martins", reviewerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "evt-rev-2", type: "review" as const, title: "Area VIP valeu muito a pena. Open bar de qualidade!", reviewerName: "Larissa Oliveira", reviewerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "evt-rev-3", type: "review" as const, title: "Estrutura excelente, banheiros limpos e seguranca top.", reviewerName: "Diego Costa", reviewerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", rating: 5 },
  ] as BusinessPost[],
  
  social: [
    { id: "evt-soc-1", type: "social" as const, title: "Quem vai estar la? Marca o amigo que vai com voce!", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=800&fit=crop" },
    { id: "evt-soc-2", type: "social" as const, title: "Countdown: faltam apenas 7 dias para o grande dia!", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=800&fit=crop" },
  ] as BusinessPost[],
}

// ========================================
// GYM (ACADEMIA)
// ========================================
export const gymContent = {
  stories: [
    { id: "gym-story-1", name: "Matricula", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop", isMain: true },
    { id: "gym-story-2", name: "Musculacao", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&h=200&fit=crop" },
    { id: "gym-story-3", name: "Aulas", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&h=200&fit=crop" },
    { id: "gym-story-4", name: "Personal", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop" },
    { id: "gym-story-5", name: "Estrutura", image: "https://images.unsplash.com/photo-1570829460005-c840387bb1ca?w=200&h=200&fit=crop" },
  ] as BusinessStory[],
  
  videos: [
    { id: "gym-vid-1", type: "video" as const, title: "Treino completo de perna em 45 minutos", description: "Siga esse treino e sinta a diferenca em poucas semanas", image: "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=800&h=450&fit=crop", duration: "45:00", views: 234000 },
    { id: "gym-vid-2", type: "video" as const, title: "Tour pela academia: conheca nossa estrutura", description: "Mais de 2000m2 de equipamentos de ultima geracao", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=450&fit=crop", duration: "6:30", views: 67000 },
    { id: "gym-vid-3", type: "video-vertical" as const, title: "Dica rapida: como fazer supino corretamente", description: "Evite lesoes com essa tecnica", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=700&fit=crop", duration: "0:58", views: 456000 },
  ] as BusinessPost[],
  
  news: [
    { id: "gym-news-1", type: "news" as const, title: "Academia e eleita a melhor da cidade pelo 5o ano", description: "Estrutura, limpeza e atendimento foram os destaques", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=450&fit=crop", source: "Revista Fitness", date: "2024-01-30" },
    { id: "gym-news-2", type: "news" as const, title: "Nova unidade sera inaugurada no proximo mes", description: "Expansao atende demanda crescente por estrutura de qualidade", source: "Jornal Local", date: "2024-01-25" },
  ] as BusinessPost[],
  
  reviews: [
    { id: "gym-rev-1", type: "review" as const, title: "Melhor academia que ja treinei! Equipamentos sempre funcionando e limpos.", reviewerName: "Rodrigo Ferreira", reviewerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "gym-rev-2", type: "review" as const, title: "Personal trainer incrivel! Perdi 15kg em 3 meses.", reviewerName: "Camila Ribeiro", reviewerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "gym-rev-3", type: "review" as const, title: "Aulas de spinning sao otimas! Professor muito animado.", reviewerName: "Thiago Nunes", reviewerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", rating: 5 },
  ] as BusinessPost[],
  
  social: [
    { id: "gym-soc-1", type: "social" as const, title: "Segunda-feira e dia de começar a semana com tudo! Quem treina hoje?", image: "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=800&h=800&fit=crop" },
    { id: "gym-soc-2", type: "social" as const, title: "Mais um aluno atingindo suas metas! Parabens pelo foco e dedicacao!", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=800&fit=crop" },
  ] as BusinessPost[],
}

// ========================================
// HEALTH (CLINICA/SAUDE)
// ========================================
export const healthContent = {
  stories: [
    { id: "health-story-1", name: "Agendar", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&h=200&fit=crop", isMain: true },
    { id: "health-story-2", name: "Especialidades", image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop" },
    { id: "health-story-3", name: "Exames", image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=200&h=200&fit=crop" },
    { id: "health-story-4", name: "Convenios", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&h=200&fit=crop" },
    { id: "health-story-5", name: "Telemedicina", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop" },
  ] as BusinessStory[],
  
  videos: [
    { id: "health-vid-1", type: "video" as const, title: "Dicas de saude: Como prevenir doencas no verao", description: "Medico explica cuidados essenciais para a estacao", image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=450&fit=crop", duration: "8:15", views: 123000 },
    { id: "health-vid-2", type: "video" as const, title: "Conheca nossa nova unidade", description: "Tour completo pelos espacos e equipamentos", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=450&fit=crop", duration: "5:30", views: 45000 },
    { id: "health-vid-3", type: "video-vertical" as const, title: "5 sinais de que voce precisa ir ao medico", description: "Nao ignore esses sintomas!", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=700&fit=crop", duration: "1:02", views: 567000 },
  ] as BusinessPost[],
  
  news: [
    { id: "health-news-1", type: "news" as const, title: "Clinica adquire equipamento de ultima geracao para diagnosticos", description: "Investimento de R$ 2 milhoes melhora precisao de exames", image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=450&fit=crop", source: "Portal Saude", date: "2024-02-01" },
    { id: "health-news-2", type: "news" as const, title: "Medico da clinica e premiado em congresso internacional", description: "Reconhecimento por pesquisa inovadora em tratamento", source: "Revista Medicina", date: "2024-01-28" },
  ] as BusinessPost[],
  
  reviews: [
    { id: "health-rev-1", type: "review" as const, title: "Atendimento humanizado que faz a diferenca. Medicos atenciosos e pontuais.", reviewerName: "Marina Lopes", reviewerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "health-rev-2", type: "review" as const, title: "Agendamento facil pelo app e tempo de espera minimo. Excelente!", reviewerName: "Jose Roberto Silva", reviewerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "health-rev-3", type: "review" as const, title: "Estrutura moderna e limpa. Equipe de enfermagem muito profissional.", reviewerName: "Sandra Alves", reviewerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", rating: 5 },
  ] as BusinessPost[],
  
  social: [
    { id: "health-soc-1", type: "social" as const, title: "Janeiro Branco: mes de conscientizacao sobre saude mental. Cuide-se!", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=800&fit=crop" },
    { id: "health-soc-2", type: "social" as const, title: "Nossa equipe esta pronta para cuidar de voce e sua familia.", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=800&fit=crop" },
  ] as BusinessPost[],
}

// ========================================
// PROFESSIONALS (ADVOGADO, CONTADOR, ETC)
// ========================================
export const professionalsContent = {
  stories: [
    { id: "prof-story-1", name: "Agendar", image: "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=200&h=200&fit=crop", isMain: true },
    { id: "prof-story-2", name: "Servicos", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&h=200&fit=crop" },
    { id: "prof-story-3", name: "Casos", image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=200&h=200&fit=crop" },
    { id: "prof-story-4", name: "Equipe", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop" },
    { id: "prof-story-5", name: "Blog", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=200&h=200&fit=crop" },
  ] as BusinessStory[],
  
  videos: [
    { id: "prof-vid-1", type: "video" as const, title: "Seus direitos: O que fazer em caso de demissao", description: "Advogado trabalhista explica passo a passo", image: "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800&h=450&fit=crop", duration: "12:45", views: 89000 },
    { id: "prof-vid-2", type: "video" as const, title: "Imposto de Renda 2024: principais mudancas", description: "Contador detalha novidades e como declarar corretamente", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop", duration: "18:30", views: 156000 },
    { id: "prof-vid-3", type: "video-vertical" as const, title: "Dica rapida: como consultar processo online", description: "Acompanhe seu caso de casa", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=700&fit=crop", duration: "0:55", views: 234000 },
  ] as BusinessPost[],
  
  news: [
    { id: "prof-news-1", type: "news" as const, title: "Escritorio ganha causa milionaria para cliente", description: "Decisao inedita abre precedente importante no setor", image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&h=450&fit=crop", source: "Jornal Juridico", date: "2024-02-02" },
    { id: "prof-news-2", type: "news" as const, title: "Advogado e convidado para palestra em congresso internacional", description: "Especialista vai falar sobre novas leis trabalhistas", source: "Portal Direito", date: "2024-01-30" },
  ] as BusinessPost[],
  
  reviews: [
    { id: "prof-rev-1", type: "review" as const, title: "Ganhamos a causa gracas ao trabalho excepcional! Super profissional e dedicado.", reviewerName: "Fernando Gomes", reviewerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "prof-rev-2", type: "review" as const, title: "Atendimento personalizado e sempre disponivel para tirar duvidas.", reviewerName: "Lucia Ferreira", reviewerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", rating: 5 },
    { id: "prof-rev-3", type: "review" as const, title: "Resolveram meu caso em tempo recorde. Honorarios justos e transparentes.", reviewerName: "Paulo Mendes", reviewerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", rating: 5 },
  ] as BusinessPost[],
  
  social: [
    { id: "prof-soc-1", type: "social" as const, title: "Mais uma vitoria para nosso cliente! Justica feita.", image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&h=800&fit=crop" },
    { id: "prof-soc-2", type: "social" as const, title: "Novo artigo no blog: Como proteger seu patrimonio. Link na bio!", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=800&fit=crop" },
  ] as BusinessPost[],
}

// ========================================
// INFLUENCER
// ========================================
export const influencerContent = {
  stories: [
    { id: "inf-story-1", name: "Links", image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200&h=200&fit=crop", isMain: true },
    { id: "inf-story-2", name: "Collabs", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=200&fit=crop" },
    { id: "inf-story-3", name: "Viagens", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
    { id: "inf-story-4", name: "Lifestyle", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop" },
    { id: "inf-story-5", name: "Bastidores", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop" },
  ] as BusinessStory[],
  
  videos: [
    { id: "inf-vid-1", type: "video" as const, title: "Um dia na minha rotina de criadora de conteudo", description: "Mostro como e o meu dia a dia criando para voces", thumbnail: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=450&fit=crop", duration: "15:23", views: 450000 },
    { id: "inf-vid-2", type: "video" as const, title: "Tour pelo meu escritorio/estudio", description: "Finalmente mostrando onde a magia acontece", thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=450&fit=crop", duration: "12:45", views: 320000 },
    { id: "inf-vid-3", type: "video-vertical" as const, title: "Get ready with me para evento", description: "Me arrumem comigo!", thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=700&fit=crop", duration: "0:58", views: 890000 },
  ] as BusinessPost[],
  
  news: [
    { id: "inf-news-1", type: "news" as const, title: "Influenciadora brasileira e destaque em revista internacional", summary: "Criadora de conteudo e reconhecida por seu trabalho inovador", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=450&fit=crop", source: "Revista Vogue", date: "2024-02-10" },
    { id: "inf-news-2", type: "news" as const, title: "Top 10 influencers mais engajados do Brasil em 2024", summary: "Lista anual traz novos nomes e veteranos do mercado", image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=450&fit=crop", source: "Forbes Brasil", date: "2024-02-05" },
  ] as BusinessPost[],
  
  reviews: [] as BusinessPost[],
  
  socialPosts: [
    { id: "inf-soc-1", content: "Gratidao por cada um de voces! 500k de seguidores, isso e surreal!", image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=800&fit=crop", likes: 45000, comments: 2300 },
    { id: "inf-soc-2", content: "Novo projeto vindo ai... quem esta ansioso?", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=800&fit=crop", likes: 38000, comments: 1800 },
  ],
}

// ========================================
// PERSONAL (PAGINA PESSOAL)
// ========================================
export const personalContent = {
  stories: [
    { id: "pers-story-1", name: "Sobre", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop", isMain: true },
    { id: "pers-story-2", name: "Projetos", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&h=200&fit=crop" },
    { id: "pers-story-3", name: "Hobbies", image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200&h=200&fit=crop" },
    { id: "pers-story-4", name: "Viagens", image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&h=200&fit=crop" },
    { id: "pers-story-5", name: "Fotos", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop" },
  ] as BusinessStory[],
  
  videos: [] as BusinessPost[],
  news: [] as BusinessPost[],
  reviews: [] as BusinessPost[],
  socialPosts: [],
}

// ========================================
// INSTITUTIONAL (MARCA INSTITUCIONAL)
// ========================================
export const institutionalContent = {
  stories: [
    { id: "inst-story-1", name: "Sobre", image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop", isMain: true },
    { id: "inst-story-2", name: "Missao", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop" },
    { id: "inst-story-3", name: "Equipe", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop" },
    { id: "inst-story-4", name: "Projetos", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&h=200&fit=crop" },
    { id: "inst-story-5", name: "Impacto", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop" },
  ] as BusinessStory[],
  
  videos: [
    { id: "inst-vid-1", type: "video" as const, title: "Conheca o Instituto Futuro Verde", description: "Nossa historia e missao em 5 minutos", thumbnail: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&h=450&fit=crop", duration: "5:30", views: 25000 },
    { id: "inst-vid-2", type: "video" as const, title: "Impacto 2023: O que conquistamos juntos", description: "Retrospectiva dos projetos do ano", thumbnail: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=450&fit=crop", duration: "8:15", views: 18000 },
  ] as BusinessPost[],
  
  news: [
    { id: "inst-news-1", type: "news" as const, title: "Instituto recebe premio de melhor ONG ambiental do pais", summary: "Reconhecimento veio apos 14 anos de trabalho continuo", image: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&h=450&fit=crop", source: "G1", date: "2024-02-15" },
    { id: "inst-news-2", type: "news" as const, title: "Projeto Escola Verde atinge 100 escolas beneficiadas", summary: "Marco historico para o programa de educacao ambiental", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=450&fit=crop", source: "Folha", date: "2024-02-08" },
  ] as BusinessPost[],
  
  reviews: [] as BusinessPost[],
  socialPosts: [],
}

// ========================================
// FUNCAO HELPER PARA OBTER CONTEUDO POR MODELO
// ========================================
export function getBusinessContent(model: string) {
  const contentMap: Record<string, typeof appointmentContent> = {
    appointment: appointmentContent,
    ecommerce: ecommerceContent,
    courses: coursesContent,
    restaurant: restaurantContent,
    realestate: realestateContent,
    events: eventsContent,
    gym: gymContent,
    health: healthContent,
    professionals: professionalsContent,
    influencer: influencerContent,
    personal: personalContent,
    institutional: institutionalContent,
  }
  return contentMap[model] || appointmentContent
}
