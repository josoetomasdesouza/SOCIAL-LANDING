import { NextRequest, NextResponse } from "next/server"

// Tipos para a resposta da API
export interface ExtractedBrandData {
  name: string | null
  description: string | null
  logo: string | null
  favicon: string | null
  primaryColor: string | null
  industry: string | null
  businessModel: string | null
  website: string
  socialLinks: {
    instagram?: string
    facebook?: string
    twitter?: string
    youtube?: string
    linkedin?: string
    tiktok?: string
    whatsapp?: string
  }
  confidence: number // 0-100: quao completos sao os dados
  missingFields: string[] // campos que precisam ser preenchidos
}

// Keywords para detectar o tipo de negocio
const BUSINESS_MODEL_KEYWORDS: Record<string, string[]> = {
  appointment: [
    "barbearia", "barber", "salao", "salon", "beleza", "beauty", "manicure", 
    "pedicure", "cabelo", "hair", "corte", "spa", "estetica", "massagem"
  ],
  ecommerce: [
    "loja", "store", "shop", "comprar", "buy", "produto", "product", 
    "carrinho", "cart", "ecommerce", "marketplace", "venda", "frete"
  ],
  courses: [
    "curso", "course", "aula", "class", "aprender", "learn", "educacao",
    "education", "treinamento", "training", "mentoria", "ebook", "workshop"
  ],
  restaurant: [
    "restaurante", "restaurant", "comida", "food", "delivery", "cardapio",
    "menu", "pizza", "hamburguer", "sushi", "chef", "culinaria", "gastronomia"
  ],
  realestate: [
    "imovel", "imobiliaria", "real estate", "apartamento", "casa", "house",
    "aluguel", "venda", "corretor", "broker", "property", "condominio"
  ],
  professionals: [
    "advogado", "lawyer", "contador", "accountant", "consultor", "consultant",
    "coach", "psicologo", "terapeuta", "arquiteto", "engenheiro", "freelancer"
  ],
  events: [
    "evento", "event", "show", "festival", "ingresso", "ticket", "festa",
    "party", "casamento", "wedding", "conferencia", "conference", "palestra"
  ],
  gym: [
    "academia", "gym", "fitness", "crossfit", "personal", "treino", "workout",
    "musculacao", "pilates", "yoga", "esporte", "sport", "saude"
  ],
  health: [
    "clinica", "clinic", "medico", "doctor", "dentista", "dentist", "saude",
    "health", "hospital", "consulta", "exame", "laboratorio", "fisioterapia"
  ],
  influencer: [
    "influencer", "creator", "criador", "conteudo", "content", "youtuber",
    "tiktoker", "instagram", "seguidores", "followers", "parceria", "collab",
    "publi", "midia kit", "lifestyle", "vlog", "blog", "podcast"
  ],
  personal: [
    "portfolio", "sobre mim", "about me", "curriculo", "cv", "resume",
    "freelancer", "desenvolvedor", "developer", "designer", "fotografo",
    "artista", "artist", "musico", "musician", "escritor", "writer"
  ],
  institutional: [
    "institucional", "institutional", "ong", "fundacao", "foundation",
    "associacao", "association", "governo", "government", "prefeitura",
    "ministerio", "secretaria", "missao", "mission", "valores", "values",
    "quem somos", "about us", "nossa historia", "our history"
  ]
}

// Detecta o modelo de negocio baseado no conteudo
function detectBusinessModel(content: string): string | null {
  const lowerContent = content.toLowerCase()
  
  let bestMatch: { model: string; count: number } | null = null
  
  for (const [model, keywords] of Object.entries(BUSINESS_MODEL_KEYWORDS)) {
    const count = keywords.filter(kw => lowerContent.includes(kw)).length
    if (count > 0 && (!bestMatch || count > bestMatch.count)) {
      bestMatch = { model, count }
    }
  }
  
  return bestMatch?.model || null
}

// Extrai cor dominante do site (simplificado - busca em meta tags e CSS)
function extractPrimaryColor(html: string): string | null {
  // Procura por theme-color meta tag
  const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i)
  if (themeColorMatch) return themeColorMatch[1]
  
  // Procura por msapplication-TileColor
  const tileColorMatch = html.match(/<meta[^>]*name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i)
  if (tileColorMatch) return tileColorMatch[1]
  
  // Procura por cores em CSS inline comuns (brand, primary, main)
  const cssColorMatch = html.match(/--(?:brand|primary|main|accent)(?:-color)?:\s*([#][0-9a-fA-F]{3,6}|rgb[a]?\([^)]+\))/i)
  if (cssColorMatch) return cssColorMatch[1]
  
  return null
}

// Extrai links de redes sociais
function extractSocialLinks(html: string, baseUrl: string): ExtractedBrandData["socialLinks"] {
  const socialLinks: ExtractedBrandData["socialLinks"] = {}
  
  // Padroes para cada rede social
  const patterns: Record<keyof ExtractedBrandData["socialLinks"], RegExp> = {
    instagram: /https?:\/\/(?:www\.)?instagram\.com\/([^"'\s<>]+)/gi,
    facebook: /https?:\/\/(?:www\.)?facebook\.com\/([^"'\s<>]+)/gi,
    twitter: /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/([^"'\s<>]+)/gi,
    youtube: /https?:\/\/(?:www\.)?youtube\.com\/(?:c\/|channel\/|user\/|@)?([^"'\s<>]+)/gi,
    linkedin: /https?:\/\/(?:www\.)?linkedin\.com\/(?:company\/|in\/)?([^"'\s<>]+)/gi,
    tiktok: /https?:\/\/(?:www\.)?tiktok\.com\/@?([^"'\s<>]+)/gi,
    whatsapp: /https?:\/\/(?:api\.)?whatsapp\.com\/(?:send\?phone=)?([^"'\s<>]+)/gi
  }
  
  for (const [network, pattern] of Object.entries(patterns)) {
    const match = html.match(pattern)
    if (match && match[0]) {
      socialLinks[network as keyof typeof socialLinks] = match[0]
    }
  }
  
  return socialLinks
}

// Resolve URL relativa para absoluta
function resolveUrl(url: string, baseUrl: string): string {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  if (url.startsWith("//")) return `https:${url}`
  if (url.startsWith("/")) return `${new URL(baseUrl).origin}${url}`
  return `${baseUrl}/${url}`
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: "URL e obrigatoria" },
        { status: 400 }
      )
    }
    
    // Normaliza a URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`
    }
    
    // Faz o fetch do site
    const response = await fetch(normalizedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BrandOS/1.0; +https://brandos.com)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      redirect: "follow"
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Nao foi possivel acessar o site: ${response.status}` },
        { status: 400 }
      )
    }
    
    const html = await response.text()
    const baseUrl = response.url // URL final apos redirects
    
    // Extrai meta tags
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i)
    const appleTouchMatch = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i)
    
    // Extrai nome da marca
    let name = ogTitleMatch?.[1] || titleMatch?.[1] || null
    if (name) {
      // Remove sufixos comuns como " | Site", " - Home", etc
      name = name.replace(/\s*[-|–—]\s*(Home|Inicio|Site|Oficial|Official|Welcome|Bem-vindo).*$/i, "").trim()
    }
    
    // Extrai descricao
    const description = ogDescMatch?.[1] || descMatch?.[1] || null
    
    // Extrai logo (prefere og:image, depois apple-touch-icon, depois favicon)
    let logo = ogImageMatch?.[1] || appleTouchMatch?.[1] || null
    if (logo) logo = resolveUrl(logo, baseUrl)
    
    // Extrai favicon
    let favicon = faviconMatch?.[1] || null
    if (favicon) favicon = resolveUrl(favicon, baseUrl)
    if (!favicon) favicon = `${new URL(baseUrl).origin}/favicon.ico`
    
    // Extrai cor primaria
    const primaryColor = extractPrimaryColor(html)
    
    // Extrai redes sociais
    const socialLinks = extractSocialLinks(html, baseUrl)
    
    // Detecta o modelo de negocio
    const contentForAnalysis = `${name || ""} ${description || ""} ${html.substring(0, 50000)}`
    const businessModel = detectBusinessModel(contentForAnalysis)
    
    // Detecta industria (simplificado)
    let industry: string | null = null
    if (businessModel) {
      const industryMap: Record<string, string> = {
        appointment: "Beleza e Bem-estar",
        ecommerce: "Comercio e Varejo",
        courses: "Educacao",
        restaurant: "Alimentacao",
        realestate: "Imobiliario",
        professionals: "Servicos Profissionais",
        events: "Eventos e Entretenimento",
        gym: "Fitness e Saude",
        health: "Saude"
      }
      industry = industryMap[businessModel]
    }
    
    // Calcula confianca e campos faltantes
    const missingFields: string[] = []
    let confidence = 0
    
    if (name) confidence += 20; else missingFields.push("name")
    if (description) confidence += 15; else missingFields.push("description")
    if (logo) confidence += 20; else missingFields.push("logo")
    if (primaryColor) confidence += 10; else missingFields.push("primaryColor")
    if (businessModel) confidence += 25; else missingFields.push("businessModel")
    if (Object.keys(socialLinks).length > 0) confidence += 10
    
    const extractedData: ExtractedBrandData = {
      name,
      description,
      logo,
      favicon,
      primaryColor,
      industry,
      businessModel,
      website: baseUrl,
      socialLinks,
      confidence,
      missingFields
    }
    
    return NextResponse.json(extractedData)
    
  } catch (error) {
    console.error("Erro ao extrair dados:", error)
    return NextResponse.json(
      { error: "Erro ao processar o site. Verifique se a URL esta correta." },
      { status: 500 }
    )
  }
}
