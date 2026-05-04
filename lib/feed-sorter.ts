import type { Post } from "./types"

type PostCategory = "heavy" | "medium" | "light"

// Categoriza posts por "peso visual"
function getVisualWeight(post: Post): PostCategory {
  if (post.type === "video") {
    return post.isVertical ? "heavy" : "medium"
  }
  if (post.type === "product" || post.type === "social") {
    return "medium"
  }
  if (post.type === "news") {
    return post.hasImage ? "medium" : "light"
  }
  // reviews são leves
  return "light"
}

// Retorna um tipo detalhado para evitar repetição
function getDetailedType(post: Post): string {
  if (post.type === "video") {
    return post.isVertical ? "video-vertical" : "video-horizontal"
  }
  if (post.type === "news") {
    return post.hasImage ? "news-image" : "news-text"
  }
  return post.type
}

/**
 * Ordena o feed para criar uma experiência visual equilibrada:
 * 1. Evita mais de 2 posts consecutivos do mesmo tipo
 * 2. Alterna entre conteúdos pesados e leves
 * 3. Garante diversidade a cada 6-8 posts
 */
export function sortFeedForVariety(posts: Post[]): Post[] {
  if (posts.length <= 3) return posts

  // Agrupa posts por tipo detalhado
  const byType = new Map<string, Post[]>()
  posts.forEach((post) => {
    const type = getDetailedType(post)
    if (!byType.has(type)) byType.set(type, [])
    byType.get(type)!.push(post)
  })

  const result: Post[] = []
  const used = new Set<string>()
  
  // Padrão de intensidade visual: heavy -> medium -> light -> medium -> repeat
  const intensityPattern: PostCategory[] = ["heavy", "medium", "light", "medium", "light", "heavy", "medium", "light"]
  let patternIndex = 0
  
  // Conta posts consecutivos do mesmo tipo
  let lastType: string | null = null
  let consecutiveCount = 0

  while (result.length < posts.length) {
    const targetIntensity = intensityPattern[patternIndex % intensityPattern.length]
    
    // Encontra um post que:
    // 1. Não foi usado
    // 2. Tem a intensidade desejada (ou fallback)
    // 3. Não é o mesmo tipo do anterior (se já tem 2 consecutivos)
    
    let found: Post | null = null
    
    // Primeiro, tenta encontrar um post com a intensidade desejada
    for (const [type, typePosts] of byType) {
      const available = typePosts.filter((p) => !used.has(p.id))
      if (available.length === 0) continue
      
      const post = available[0]
      const weight = getVisualWeight(post)
      
      // Se já tem 2 consecutivos do mesmo tipo, pula
      if (lastType === type && consecutiveCount >= 2) continue
      
      // Prioriza posts com a intensidade desejada
      if (weight === targetIntensity) {
        found = post
        break
      }
    }
    
    // Se não encontrou com a intensidade desejada, pega qualquer um válido
    if (!found) {
      for (const [type, typePosts] of byType) {
        const available = typePosts.filter((p) => !used.has(p.id))
        if (available.length === 0) continue
        
        // Se já tem 2 consecutivos do mesmo tipo, pula
        if (lastType === type && consecutiveCount >= 2) continue
        
        found = available[0]
        break
      }
    }
    
    // Se ainda não encontrou (todos os tipos têm 2 consecutivos), força qualquer um
    if (!found) {
      for (const [, typePosts] of byType) {
        const available = typePosts.filter((p) => !used.has(p.id))
        if (available.length > 0) {
          found = available[0]
          break
        }
      }
    }
    
    if (!found) break // Não há mais posts
    
    const foundType = getDetailedType(found)
    
    // Atualiza contadores
    if (foundType === lastType) {
      consecutiveCount++
    } else {
      consecutiveCount = 1
      lastType = foundType
    }
    
    result.push(found)
    used.add(found.id)
    patternIndex++
  }
  
  return result
}

/**
 * Verifica se o feed tem diversidade suficiente
 * Retorna true se a cada 6-8 posts há pelo menos 3 tipos diferentes
 */
export function validateFeedDiversity(posts: Post[]): boolean {
  const windowSize = 7
  
  for (let i = 0; i <= posts.length - windowSize; i++) {
    const window = posts.slice(i, i + windowSize)
    const types = new Set(window.map(getDetailedType))
    if (types.size < 3) return false
  }
  
  return true
}
