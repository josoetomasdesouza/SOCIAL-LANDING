"use client"

import { useEffect, useMemo, useRef, useCallback, useState, type RefObject } from "react"
import Image from "next/image"
import { X, Heart, MessageCircle, Share, ChevronUp, Play, Star, Bookmark, Send, Newspaper } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { BusinessPost } from "./business-social-landing"
import { SimulatedChat, SimpleChatInput } from "@/components/social-landing/inline-chat"
import { useConversationLongPress } from "./use-conversation-long-press"

interface BusinessFeedDrawerProps {
  isOpen: boolean
  onClose: () => void
  posts: BusinessPost[]
  initialPost: BusinessPost | null
  category: string
  brandLogo: string
  brandName: string
  onAddToCart?: (post: BusinessPost) => void
  selectedContextIds?: Set<string>
  onContextToggle?: (post: BusinessPost) => void
}

// Avatar do usuario
const userAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"

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
  "video-vertical": [
    "assistindo agora",
    "curtiram esse video",
    "compartilharam",
    "salvaram nos favoritos",
    "marcaram amigos",
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
  "video-vertical": ["adorei esse!", "tem mais assim?", "quero ver mais"],
  product: ["esse e bom pra mim?", "qual a diferenca desse?", "vale a pena?"],
  news: ["onde posso ler mais?", "tem mais sobre isso?", "interessante, conta mais"],
  review: ["posso confiar nessa avaliacao?", "tem mais avaliacoes?", "quero ver outras opinioes"],
  social: ["quero saber mais!", "como participo?", "adorei, tem mais?"],
}

// Mensagens iniciais da IA
const aiInitialMessages: Record<string, string[]> = {
  video: [
    "Esse video mostra tecnicas que poucas pessoas conhecem. Quer descobrir mais?",
    "Curiosidade: esse tutorial foi um dos mais salvos da semana.",
    "Sabia que esse conteudo ajudou milhares de pessoas?",
  ],
  "video-vertical": [
    "Esse conteudo viralizou essa semana! Quer ver mais como esse?",
    "Esse video tem dicas rapidas e praticas. Curtiu?",
    "Conteudo rapido e direto ao ponto. Quer mais assim?",
  ],
  product: [
    "Esse produto esta entre os mais vendidos! Quer saber mais?",
    "Curiosidade: esse foi o favorito dos clientes esse mes.",
    "Muita gente esta de olho nesse produto. Posso te ajudar?",
  ],
  news: [
    "Essa noticia esta gerando muita repercussao. Quer saber mais?",
    "Esse assunto esta em alta. Posso te contar os detalhes?",
    "Muita gente comentou sobre isso. Quer participar da conversa?",
  ],
  review: [
    "Muitas pessoas tiveram experiencia parecida. Quer ver mais avaliacoes?",
    "Essa avaliacao foi marcada como util por centenas de pessoas.",
    "Os clientes adoram compartilhar suas experiencias. Veja mais!",
  ],
  social: [
    "Esse post ta gerando bastante conversa. O que voce achou?",
    "A comunidade adorou isso. Quer participar tambem?",
    "Esse conteudo teve muito engajamento. Curte?",
  ],
}

const categoryLabels: Record<string, string> = {
  all: "Conteudos",
  video: "Videos",
  "video-vertical": "Shorts",
  product: "Produtos",
  news: "Noticias",
  review: "Avaliacoes",
  social: "Posts",
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
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  
  return (
    <div className="flex items-center gap-1">
      <button 
        onClick={() => setLiked(!liked)}
        className={cn(
          "p-2 rounded-full transition-all duration-200 active:scale-90",
          liked ? "text-red-500" : "hover:bg-red-500/10 hover:text-red-500"
        )}
      >
        <Heart className={cn("w-6 h-6", liked && "fill-current")} />
      </button>
      <button className="p-2 hover:bg-accent/10 hover:text-accent rounded-full transition-all duration-200 active:scale-90">
        <MessageCircle className="w-6 h-6" />
      </button>
      <button className="p-2 hover:bg-accent/10 hover:text-accent rounded-full transition-all duration-200 active:scale-90">
        <Share className="w-6 h-6" />
      </button>
      <button 
        onClick={() => setSaved(!saved)}
        className={cn(
          "p-2 rounded-full transition-all duration-200 ml-auto active:scale-90",
          saved ? "text-accent" : "hover:bg-accent/10 hover:text-accent"
        )}
      >
        <Bookmark className={cn("w-6 h-6", saved && "fill-current")} />
      </button>
    </div>
  )
}

function FeedDrawerPostArticle({
  post,
  index,
  isInitial,
  brandLogo,
  brandName,
  initialPostRef,
  onAddToCart,
  isContextSelected,
  onContextToggle,
}: {
  post: BusinessPost
  index: number
  isInitial: boolean
  brandLogo: string
  brandName: string
  initialPostRef: RefObject<HTMLElement | null>
  onAddToCart?: (post: BusinessPost) => void
  isContextSelected: boolean
  onContextToggle?: (post: BusinessPost) => void
}) {
  const placeholders = inputPlaceholders[post.type] || inputPlaceholders.social
  const placeholder = placeholders[index % placeholders.length]
  const aiMessages = aiInitialMessages[post.type] || aiInitialMessages.social
  const aiMessage = aiMessages[index % aiMessages.length]
  const showConversation = index % 3 === 0
  const { longPressHandlers, shouldHandleActivation } = useConversationLongPress({
    onLongPress: () => onContextToggle?.(post),
  })

  return (
    <article
      ref={isInitial ? initialPostRef : undefined}
      className={cn(
        "rounded-[28px] pb-8 border-b border-border/30 transition-all duration-200",
        isContextSelected && "bg-accent/5 ring-2 ring-accent/20 ring-offset-2 ring-offset-background shadow-lg",
        index === 0 && "scroll-mt-20"
      )}
      {...longPressHandlers}
    >
      {isContextSelected && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <MessageCircle className="h-3.5 w-3.5" />
          Na conversa
        </div>
      )}
      {/* MIDIA */}
      {post.image && (
        <div className={cn(
          "relative overflow-hidden rounded-2xl mb-4",
          post.type === "video-vertical"
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

          {(post.type === "video" || post.type === "video-vertical") && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <Play className="w-7 h-7 fill-white text-white ml-1" />
              </div>
            </div>
          )}

          {(post.type === "video" || post.type === "video-vertical") && post.duration && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/80 text-white text-sm rounded-lg font-medium">
              <Play className="w-3 h-3 fill-white" />
              {post.duration}
            </div>
          )}

          {post.type === "product" && post.originalPrice && post.price && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-sm font-bold rounded-lg">
              -{Math.round((1 - post.price / post.originalPrice) * 100)}%
            </div>
          )}

          {post.type === "news" && post.source && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-lg">
              {post.source}
            </div>
          )}
        </div>
      )}

      {post.type === "news" && !post.image && (
        <div className="p-4 bg-secondary/50 rounded-2xl mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Newspaper className="w-4 h-4 text-accent" />
            <span className="text-xs font-medium text-accent">{post.source || brandName}</span>
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight leading-snug">
        {post.title}
      </h3>

      {post.description && (
        <p className="text-[15px] text-muted-foreground mb-4 leading-relaxed">
          {post.description}
        </p>
      )}

      {post.type === "product" && post.price && (
        <div className="mb-4">
          {post.originalPrice && (
            <span className="text-sm text-muted-foreground line-through mr-2">
              R$ {post.originalPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
          <span className="text-xl font-bold text-accent">
            R$ {post.price.toFixed(2).replace(".", ",")}
          </span>
          {post.price && (
            <span className="text-sm text-muted-foreground ml-2">
              ou 3x de R$ {(post.price / 3).toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>
      )}

      {post.type === "review" && post.rating && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-0.5">
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
          </div>
          {post.reviewerName && (
            <span className="text-sm text-muted-foreground">
              por {post.reviewerName}
            </span>
          )}
        </div>
      )}

      <SocialProofWithAvatars type={post.type} index={index} />

      <div className="mt-3">
        <SocialActions />
      </div>

      <div className="mt-4 pt-4 border-t border-border/30">
        {showConversation ? (
          <SimulatedChat
            messages={[{ content: aiMessage, isUser: false }]}
            brandLogo={brandLogo}
            userAvatar={userAvatar}
            placeholder={placeholder}
          />
        ) : (
          <SimpleChatInput
            brandLogo={brandLogo}
            userAvatar={userAvatar}
            placeholder={placeholder}
          />
        )}
      </div>

      {post.type === "product" && (
        <Button
          onClick={() => {
            if (!shouldHandleActivation()) return
            onAddToCart?.(post)
          }}
          className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-base font-semibold rounded-xl"
        >
          Adicionar ao carrinho
        </Button>
      )}
    </article>
  )
}

export function BusinessFeedDrawer({ 
  isOpen, 
  onClose, 
  posts, 
  initialPost, 
  category, 
  brandLogo,
  brandName,
  onAddToCart,
  selectedContextIds,
  onContextToggle,
}: BusinessFeedDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialPostRef = useRef<HTMLElement>(null)

  const filteredPosts = useMemo(() => {
    if (category === "all") return posts
    return posts.filter((post) => post.type === category || (category === "video" && post.type === "video-vertical"))
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
        style={{ bottom: "var(--social-conversation-composer-height, 0px)" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/98 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2.5">
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-foreground tracking-tight">
                {categoryLabels[category] || "Conteudos"}
              </span>
              <span className="text-sm text-muted-foreground">
                • {filteredPosts.length} {filteredPosts.length === 1 ? "item" : "itens"}
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
                const isContextSelected = selectedContextIds?.has(post.id) || false

                return (
                  <FeedDrawerPostArticle
                    key={post.id}
                    post={post}
                    index={index}
                    isInitial={isInitial}
                    brandLogo={brandLogo}
                    brandName={brandName}
                    initialPostRef={initialPostRef}
                    onAddToCart={onAddToCart}
                    isContextSelected={isContextSelected}
                    onContextToggle={onContextToggle}
                  />
                )
              })}
            </div>

            {/* End of Feed */}
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-sm">
                Voce chegou ao fim dos {categoryLabels[category]?.toLowerCase() || "conteudos"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
