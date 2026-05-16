"use client"

import { useEffect, useMemo, useRef, useCallback } from "react"
import Image from "next/image"
import { X, Heart, MessageCircle, Share, ChevronRight, ChevronUp, Play, Star, Bookmark, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Post } from "@/lib/types"
import {
  getContextualSpotlightClasses,
  type ContextualReferenceItem,
  useContextualNavigation,
} from "./use-contextual-navigation"

interface FeedDrawerProps {
  isOpen: boolean
  onClose: () => void
  posts: Post[]
  initialPost: Post | null
  category: string
  brandLogo?: string
}

// Avatar do usuario
const userAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"

// Avatares de usuarios para prova social
const socialAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
]

// Nomes para prova social
const socialNames = ["Ana", "Julia", "Mariana", "Carla", "Fernanda", "Beatriz", "Camila", "Patricia", "Lucia", "Amanda"]

// Prova social CONTEXTUAL por tipo de conteudo
const contextualSocialProof: Record<string, string[]> = {
  video: [
    "assistindo agora",
    "salvaram para ver depois",
    "compartilharam com amigas",
    "ja assistiram esse tutorial",
    "marcaram nos comentarios",
  ],
  product: [
    "adicionaram ao carrinho hoje",
    "compraram esse mes",
    "estao de olho nesse produto",
    "favoritaram essa semana",
    "compraram e amaram",
  ],
  news: [
    "leram essa materia",
    "compartilharam essa noticia",
    "estao acompanhando",
    "salvaram para ler depois",
    "comentaram sobre isso",
  ],
  review: [
    "acharam essa avaliacao util",
    "concordaram com essa opiniao",
    "tiveram experiencia parecida",
    "tambem avaliaram esse produto",
    "curtiram essa avaliacao",
  ],
  social: [
    "curtiram essa publicacao",
    "comentaram aqui",
    "compartilharam com alguem",
    "salvaram esse post",
    "marcaram amigos",
  ],
}

// Input placeholders contextuais
const inputPlaceholders: Record<string, string[]> = {
  video: ["vale a pena assistir?", "tem mais videos assim?", "gostei, quero ver mais"],
  product: ["esse e bom pra pele seca?", "qual a diferenca desse?", "vale a pena pra mim?"],
  news: ["onde posso ler mais?", "tem mais sobre isso?", "interessante, conta mais"],
  review: ["posso confiar nessa avaliacao?", "tem mais avaliacoes?", "quero ver outras opinioes"],
  social: ["quero saber mais!", "como participo?", "adorei, tem mais?"],
}

// Mensagens iniciais da IA - curiosidades e perguntas
const aiInitialMessages: Record<string, string[]> = {
  video: [
    "Esse video mostra uma tecnica que poucas pessoas conhecem. Quer descobrir o segredo?",
    "Curiosidade: esse tutorial foi feito com produtos 100% naturais da Amazonia.",
    "Sabia que essa rotina leva menos de 5 minutos? Perfeita pra quem tem pressa.",
  ],
  product: [
    "Esse produto tem extrato de castanha da Amazonia, um ingrediente exclusivo. Quer saber mais?",
    "Curiosidade: esse foi o mais vendido do mes. O que te chamou atencao nele?",
    "Sabia que a Natura planta 1 arvore a cada produto Ekos vendido?",
  ],
  news: [
    "Essa iniciativa ja impactou mais de 2 mil familias. Quer conhecer outras acoes?",
    "A Natura trabalha com comunidades locais ha mais de 20 anos. Sabia disso?",
  ],
  review: [
    "Muitas pessoas tiveram experiencia parecida. Quer ver mais avaliacoes?",
    "Essa avaliacao foi marcada como util por centenas de pessoas.",
  ],
  social: [
    "Esse post ta gerando bastante conversa. O que voce achou?",
    "A comunidade Natura adorou isso. Quer participar tambem?",
  ],
}

const categoryLabels: Record<string, string> = {
  all: "Conteudos",
  video: "Videos",
  product: "Produtos",
  news: "Noticias",
  review: "Avaliacoes",
  social: "Posts",
}

const contentTypeLabels: Record<string, string> = {
  video: "Video",
  "video-vertical": "Short",
  product: "Produto",
  news: "Conteudo",
  review: "Avaliacao",
  social: "Post",
}

const relatedTypePriority: Record<string, string[]> = {
  video: ["product", "news", "social"],
  "video-vertical": ["product", "social", "video"],
  product: ["review", "video", "social"],
  news: ["video", "social", "review"],
  review: ["product", "news", "social"],
  social: ["product", "video", "news"],
}

const getPostDisplayType = (post: Post) => {
  if (post.type === "video" && post.isVertical) {
    return "video-vertical"
  }

  return post.type
}

const getContextualDescription = (post: Post) => {
  if (post.type === "product" && post.price) {
    return `R$ ${post.price.toFixed(2).replace(".", ",")}`
  }

  if (post.type === "video" && post.duration) {
    return post.duration
  }

  if (post.type === "news" && post.source) {
    return post.source
  }

  if (post.type === "review" && post.author?.name) {
    return `por ${post.author.name}`
  }

  return post.description
}

const buildContextualReferences = (currentPost: Post, candidates: Post[]): ContextualReferenceItem[] => {
  const currentType = getPostDisplayType(currentPost)
  const otherPosts = candidates.filter((candidate) => candidate.id !== currentPost.id)
  const priorityOrder = [currentType, ...(relatedTypePriority[currentType] || [])]

  const prioritizedPosts = priorityOrder.flatMap((type) =>
    otherPosts.filter((candidate) => getPostDisplayType(candidate) === type)
  )

  const orderedPosts = [...prioritizedPosts, ...otherPosts]
  const uniquePosts = Array.from(new Map(orderedPosts.map((post) => [post.id, post])).values())

  return uniquePosts.slice(0, 2).map((post) => ({
    id: post.id,
    title: post.title,
    eyebrow: contentTypeLabels[getPostDisplayType(post)] || "Conteudo",
    image: post.image || post.thumbnail,
    description: getContextualDescription(post),
  }))
}

// Componente de Avatares Agrupados + Prova Social
function SocialProofWithAvatars({ type, index }: { type: string; index: number }) {
  const messages = contextualSocialProof[type] || contextualSocialProof.social
  const message = messages[index % messages.length]
  const name1 = socialNames[index % socialNames.length]
  const name2 = socialNames[(index + 3) % socialNames.length]
  const avatarIndexes = [(index * 2) % 5, (index * 2 + 1) % 5, (index * 2 + 2) % 5]
  
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex -space-x-2">
        {avatarIndexes.map((avatarIdx, i) => (
          <div 
            key={i}
            className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-background shadow-sm"
          >
            <Image 
              src={socialAvatars[avatarIdx]} 
              alt="" 
              fill 
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground/80">{name1}</span>
        {", "}
        <span className="font-medium text-foreground/80">{name2}</span>
        {" e outras pessoas "}
        {message}
      </p>
    </div>
  )
}

// Social Actions - Botoes de interacao
function SocialActions() {
  return (
    <div className="flex items-center gap-1">
      <button className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all duration-200 active:scale-90">
        <Heart className="w-6 h-6" />
      </button>
      <button className="p-2 hover:bg-accent/10 hover:text-accent rounded-full transition-all duration-200 active:scale-90">
        <MessageCircle className="w-6 h-6" />
      </button>
      <button className="p-2 hover:bg-accent/10 hover:text-accent rounded-full transition-all duration-200 active:scale-90">
        <Share className="w-6 h-6" />
      </button>
      <button className="p-2 hover:bg-accent/10 hover:text-accent rounded-full transition-all duration-200 ml-auto active:scale-90">
        <Bookmark className="w-6 h-6" />
      </button>
    </div>
  )
}

// Chat Input com avatar do usuario
function ChatInput({ placeholder, brandLogo }: { placeholder: string; brandLogo?: string }) {
  return (
    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/30">
      <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-border/50 flex-shrink-0">
        <Image 
          src={userAvatar} 
          alt="Voce" 
          fill 
          className="object-cover"
        />
      </div>
      <div className="flex-1 flex items-center gap-2 bg-secondary/50 rounded-full px-4 py-2.5">
        <input 
          type="text"
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/70 focus:outline-none"
        />
        <button className="p-1.5 text-accent hover:text-accent/80 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Conversa simulada com IA
function SimulatedConversation({
  aiMessage,
  brandLogo,
  placeholder,
  relatedContent = [],
  onNavigateToContext,
}: {
  aiMessage: string
  brandLogo?: string
  placeholder: string
  relatedContent?: ContextualReferenceItem[]
  onNavigateToContext?: (contentId: string) => void
}) {
  const brandLogoUrl = brandLogo || "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=100&h=100&fit=crop"
  
  return (
    <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
      {/* Mensagem da IA */}
      <div className="flex items-start gap-3">
        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-accent/30 flex-shrink-0">
          <Image 
            src={brandLogoUrl} 
            alt="Natura" 
            fill 
            className="object-cover"
          />
        </div>
        <div className="flex-1 bg-accent/5 rounded-2xl rounded-tl-sm px-4 py-3">
          <p className="text-sm text-foreground leading-relaxed">{aiMessage}</p>
        </div>
      </div>
      
      {relatedContent.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
            Ver no feed
          </p>
          <div className="grid gap-2">
            {relatedContent.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigateToContext?.(item.id)}
                className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-3 py-2.5 text-left transition-all duration-200 hover:border-accent/30 hover:bg-accent/5 active:scale-[0.99]"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={52}
                    height={52}
                    className="h-[52px] w-[52px] rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-accent/10 text-[11px] font-semibold uppercase tracking-wide text-accent">
                    {item.eyebrow.slice(0, 3)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent/80">
                    {item.eyebrow}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>

                <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input do usuario */}
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-border/50 flex-shrink-0">
          <Image 
            src={userAvatar} 
            alt="Voce" 
            fill 
            className="object-cover"
          />
        </div>
        <div className="flex-1 flex items-center gap-2 bg-secondary/50 rounded-full px-4 py-2.5">
          <input 
            type="text"
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/70 focus:outline-none"
          />
          <button className="p-1.5 text-accent hover:text-accent/80 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function FeedDrawer({ isOpen, onClose, posts, initialPost, category, brandLogo }: FeedDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialPostRef = useRef<HTMLArticleElement>(null)
  const { highlightedContentId, navigateToContent, registerContentNode } =
    useContextualNavigation<HTMLArticleElement>()

  const filteredPosts = useMemo(() => {
    if (category === "all") return posts
    return posts.filter((post) => post.type === category)
  }, [posts, category])

  const orderedPosts = useMemo(() => {
    if (!initialPost) return filteredPosts
    const index = filteredPosts.findIndex((p) => p.id === initialPost.id)
    if (index === -1) return filteredPosts
    return [...filteredPosts.slice(index), ...filteredPosts.slice(0, index)]
  }, [filteredPosts, initialPost])

  useEffect(() => {
    if (isOpen && initialPostRef.current) {
      setTimeout(() => {
        initialPostRef.current?.scrollIntoView({ behavior: "auto", block: "start" })
      }, 100)
    }
  }, [isOpen, initialPost])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        ref={containerRef}
        className="absolute inset-x-0 bottom-0 top-0 md:top-auto md:max-h-[92vh] bg-background rounded-t-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/98 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2.5">
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-foreground tracking-tight">
                {categoryLabels[category] || "Conteudos"}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-secondary transition-all duration-200 active:scale-95"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Feed Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px] mx-auto px-4 sm:px-5 py-6">
            <div className="space-y-8">
              {orderedPosts.map((post, index) => {
                const isInitial = initialPost?.id === post.id
                const placeholders = inputPlaceholders[post.type] || inputPlaceholders.social
                const placeholder = placeholders[index % placeholders.length]
                const aiMessages = aiInitialMessages[post.type] || aiInitialMessages.social
                const aiMessage = aiMessages[index % aiMessages.length]
                const showConversation = index % 3 === 0 // Mostrar conversa em alguns posts

                return (
                  <article 
                    key={post.id}
                    ref={(node) => {
                      registerContentNode(post.id)(node)

                      if (isInitial) {
                        initialPostRef.current = node
                      }
                    }}
                    tabIndex={-1}
                    className={cn(
                      "pb-8 border-b border-border/30",
                      index === 0 && "scroll-mt-20",
                      getContextualSpotlightClasses(highlightedContentId === post.id)
                    )}
                  >
                    {/* MIDIA */}
                    {post.image && (post.type !== "news" || post.hasImage !== false) && (
                      <div className={cn(
                        "relative overflow-hidden rounded-2xl mb-4",
                        post.type === "video" && post.isVertical 
                          ? "aspect-[9/16] max-h-[500px]" 
                          : post.type === "video"
                            ? "aspect-video"
                            : post.type === "product"
                              ? "aspect-square"
                              : "aspect-video"
                      )}>
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                        
                        {/* Video Play Button */}
                        {post.type === "video" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                              <Play className="w-7 h-7 fill-white text-white ml-1" />
                            </div>
                          </div>
                        )}

                        {/* Video Duration - dentro da midia */}
                        {post.type === "video" && post.duration && (
                          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/80 text-white text-sm rounded-lg font-medium">
                            <Play className="w-3 h-3 fill-white" />
                            {post.duration}
                          </div>
                        )}

                        {/* Product Discount Badge */}
                        {post.type === "product" && post.originalPrice && post.price && (
                          <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-sm font-bold rounded-lg">
                            -{Math.round((1 - post.price / post.originalPrice) * 100)}%
                          </div>
                        )}
                      </div>
                    )}

                    {/* TITULO */}
                    <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight leading-snug">
                      {post.title}
                    </h3>

                    {/* DESCRICAO */}
                    <p className="text-[15px] text-muted-foreground mb-4 leading-relaxed">
                      {post.description}
                    </p>

                    {/* PRECO (apenas produtos) */}
                    {post.type === "product" && post.price && (
                      <div className="mb-4">
                        {post.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through mr-2">
                            R$ {post.originalPrice.toFixed(2)}
                          </span>
                        )}
                        <span className="text-xl font-bold text-accent">
                          R$ {post.price.toFixed(2)}
                        </span>
                        {post.price && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ou 3x de R$ {(post.price / 3).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* RATING (apenas reviews) */}
                    {post.type === "review" && post.rating && (
                      <div className="flex items-center gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i}
                            className={cn(
                              "w-5 h-5",
                              i < post.rating! 
                                ? "text-yellow-400 fill-yellow-400" 
                                : "text-muted-foreground/20"
                            )}
                          />
                        ))}
                        {post.author && (
                          <span className="text-sm text-muted-foreground ml-2">
                            por {post.author.name}
                          </span>
                        )}
                      </div>
                    )}

                    {/* PROVA SOCIAL COM AVATARES */}
                    <SocialProofWithAvatars type={post.type} index={index} />

                    {/* BOTOES DE INTERACAO */}
                    <div className="mt-3">
                      <SocialActions />
                    </div>

                    {/* CONVERSA COM IA (opcional) */}
                    {showConversation ? (
                      <SimulatedConversation 
                        aiMessage={aiMessage}
                        brandLogo={brandLogo}
                        placeholder={placeholder}
                          relatedContent={buildContextualReferences(post, orderedPosts)}
                          onNavigateToContext={navigateToContent}
                      />
                    ) : (
                      <ChatInput 
                        placeholder={placeholder} 
                        brandLogo={brandLogo}
                      />
                    )}

                    {/* CTA (apenas produtos) */}
                    {post.type === "product" && (
                      <Button className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-base font-semibold rounded-xl">
                        Adicionar ao carrinho
                      </Button>
                    )}
                  </article>
                )
              })}
            </div>

            {/* End of Feed */}
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-sm">
                Voce chegou ao fim
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
