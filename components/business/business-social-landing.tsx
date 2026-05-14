"use client"

import { useState, useCallback, useMemo, useEffect, useRef, type ReactNode } from "react"
import Image from "next/image"
import { Heart, MessageCircle, Share, Bookmark, Play, Star, Newspaper, ChevronDown, ChevronLeft, ChevronRight, X, Search, ShoppingBag, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { BusinessConfig } from "@/lib/business-types"
import { SimulatedChat, SimpleChatInput } from "@/components/social-landing/inline-chat"
import { BusinessFeedDrawer } from "./business-feed-drawer"
import {
  createConversationContextItemFromPost,
  getConversationChipLabel,
  normalizeConversationChipText,
  type ConversationContextItem,
  useConversationContextSelectionState,
} from "./conversation-context"
import { useConversationLongPress } from "./use-conversation-long-press"

// ========================================
// TIPOS
// ========================================
export interface BusinessPost {
  id: string
  type: "video" | "video-vertical" | "product" | "news" | "review" | "social"
  title: string
  description?: string
  image: string
  duration?: string
  views?: number
  price?: number
  originalPrice?: number
  rating?: number
  reviewerName?: string
  reviewerAvatar?: string
  source?: string
  date?: string
}

export interface BusinessStory {
  id: string
  name: string
  image: string
  isMain?: boolean // Se true, e o objetivo principal (destacado)
}

export interface BusinessSection {
  id: string
  title: string
  icon?: ReactNode
  type: "primary-action" | "content" | "specific"
  posts?: BusinessPost[]
  customContent?: ReactNode // Para modulos especificos do negocio (sem drawer)
  renderContent?: (onOpenDrawer: (post: BusinessPost) => void) => ReactNode // Para conteudo com drawer
}

interface BusinessSocialLandingProps {
  config: BusinessConfig
  stories: BusinessStory[]
  sections: BusinessSection[]
  topContent?: ReactNode
  onPostClick?: (post: BusinessPost) => void
  onStoryClick?: (story: BusinessStory) => void
  onStoryAction?: (story: BusinessStory) => boolean | void
  renderPostDrawer?: (post: BusinessPost | null, onClose: () => void) => ReactNode
  footerLinks?: { label: string; href: string }[]
  conversationalAI?: ReactNode
  reserveHeaderSpace?: boolean | "compact"
  conversationContextItems?: ConversationContextItem[]
  onConversationContextToggle?: (item: ConversationContextItem) => void
  onConversationContextRemove?: (itemId: string) => void
}

// ========================================
// AVATARES E PROVA SOCIAL
// ========================================
const socialAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
]

const socialNames = ["Ana", "Julia", "Mariana", "Carla", "Fernanda", "Beatriz", "Camila", "Patricia"]

const contextualSocialProof: Record<string, string[]> = {
  video: ["assistindo agora", "salvaram para ver depois", "compartilharam com amigas"],
  "video-vertical": ["assistindo agora", "curtiram esse video", "compartilharam"],
  product: ["adicionaram ao carrinho hoje", "compraram esse mes", "estao de olho nesse produto"],
  news: ["leram essa materia", "compartilharam essa noticia", "estao acompanhando"],
  review: ["acharam essa avaliacao util", "concordaram com essa opiniao", "tiveram experiencia parecida"],
  social: ["curtiram essa publicacao", "comentaram aqui", "compartilharam com alguem"],
}

// ========================================
// COMPONENTES AUXILIARES
// ========================================
function SocialProofWithAvatars({ type, index }: { type: string; index: number }) {
  const messages = contextualSocialProof[type] || contextualSocialProof.social
  const message = messages[index % messages.length]
  const name1 = socialNames[index % socialNames.length]
  const name2 = socialNames[(index + 3) % socialNames.length]
  const avatarIndexes = [(index * 2) % 5, (index * 2 + 1) % 5, (index * 2 + 2) % 5]
  
  return (
    <div className="flex items-center gap-2.5 mt-3">
      <div className="flex -space-x-2">
        {avatarIndexes.map((avatarIdx, i) => (
          <div key={i} className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-background shadow-sm">
            <Image src={socialAvatars[avatarIdx]} alt="" fill className="object-cover" />
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

function SocialActions({ onComment }: { onComment?: () => void }) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  
  return (
    <div className="flex items-center justify-between mt-3">
      <div className="flex items-center gap-3">
        <button onClick={() => setLiked(!liked)} className="p-1.5 hover:bg-secondary rounded-full transition-colors">
          <Heart className={cn("w-5 h-5", liked ? "fill-red-500 text-red-500" : "text-foreground")} />
        </button>
        <button onClick={onComment} className="p-1.5 hover:bg-secondary rounded-full transition-colors">
          <MessageCircle className="w-5 h-5 text-foreground" />
        </button>
        <button className="p-1.5 hover:bg-secondary rounded-full transition-colors">
          <Share className="w-5 h-5 text-foreground" />
        </button>
      </div>
      <button onClick={() => setSaved(!saved)} className="p-1.5 hover:bg-secondary rounded-full transition-colors">
        <Bookmark className={cn("w-5 h-5", saved ? "fill-foreground" : "")} />
      </button>
    </div>
  )
}

// ========================================
// HEADER
// ========================================
function BusinessHeader({ config }: { config: BusinessConfig }) {
  const userAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px] mx-auto px-4 sm:px-5">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-border/50">
              <Image src={config.logo} alt={config.name} fill className="object-cover" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground text-base leading-tight">{config.name}</h1>
              {config.description && (
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{config.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button className="p-2.5 hover:bg-secondary rounded-full transition-colors">
              <Search className="w-5 h-5 text-foreground" />
            </button>
            <button className="p-2.5 hover:bg-secondary rounded-full transition-colors">
              <ShoppingBag className="w-5 h-5 text-foreground" />
            </button>
            <div className="relative w-8 h-8 rounded-full overflow-hidden ml-1">
              <Image src={userAvatar} alt="Perfil" fill className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// ========================================
// STORY VIEWER (Modal fullscreen estilo Instagram)
// ========================================
interface StoryViewerProps {
  isOpen: boolean
  onClose: () => void
  stories: BusinessStory[]
  initialIndex: number
  categoryName: string
  brandLogo: string
  onViewSection?: (story: BusinessStory) => void
}

function StoryViewer({ isOpen, onClose, stories, initialIndex, categoryName, brandLogo, onViewSection }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setCurrentIndex(initialIndex)
    setProgress(0)
  }, [initialIndex, stories])

  useEffect(() => {
    if (!isOpen) return

    const duration = 5000
    const interval = 50
    const increment = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1)
            return 0
          } else {
            onClose()
            return 100
          }
        }
        return prev + increment
      })
    }, interval)

    return () => clearInterval(timer)
  }, [isOpen, currentIndex, stories.length, onClose])

  useEffect(() => {
    setProgress(0)
  }, [currentIndex])

  if (!isOpen || stories.length === 0) return null

  const currentStory = stories[currentIndex]

  const goNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onClose()
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Progress bars */}
      <div className="absolute top-6 left-5 right-5 flex gap-1.5 z-10">
        {stories.map((_, i) => (
          <div key={i} className="h-0.5 flex-1 rounded-full bg-white/25 overflow-hidden">
            <div 
              className={cn("h-full bg-white transition-all", i < currentIndex ? "w-full" : i === currentIndex ? "" : "w-0")}
              style={i === currentIndex ? { width: `${progress}%` } : undefined}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-12 left-5 right-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image src={brandLogo} alt="" fill className="object-cover" />
          </div>
          <span className="text-white font-medium text-sm">{categoryName}</span>
          <span className="text-white/60 text-xs">{currentIndex + 1}/{stories.length}</span>
        </div>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-white/90 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Story content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image src={currentStory.image} alt={currentStory.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        <div className="absolute bottom-32 left-6 right-6 text-white">
          <h3 className="font-semibold text-xl mb-3 leading-tight text-balance">{currentStory.name}</h3>
          <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">Veja o conteudo de {currentStory.name}</p>
        </div>

        {/* Ver publicacao button */}
        <button
          onClick={() => {
            onClose()
            onViewSection?.(currentStory)
          }}
          className="absolute bottom-16 left-6 right-6 flex items-center justify-center gap-2 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl text-white font-medium transition-colors"
        >
          <span>Ver publicacao</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation areas */}
      <button onClick={goPrev} className="absolute left-0 top-24 bottom-48 w-1/3 z-10" aria-label="Anterior" />
      <button onClick={goNext} className="absolute right-0 top-24 bottom-48 w-2/3 z-10" aria-label="Proximo" />

      {/* Navigation arrows (desktop) */}
      {currentIndex > 0 && (
        <button onClick={goPrev} className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/15 hover:bg-white/25 rounded-full items-center justify-center text-white z-20 transition-colors backdrop-blur-sm">
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {currentIndex < stories.length - 1 && (
        <button onClick={goNext} className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/15 hover:bg-white/25 rounded-full items-center justify-center text-white z-20 transition-colors backdrop-blur-sm">
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}

// ========================================
// STORIES
// ========================================
function BusinessStories({ stories, config, onStoryClick }: { 
  stories: BusinessStory[]
  config: BusinessConfig
  onStoryClick?: (story: BusinessStory, index: number) => void 
}) {
  // Gera gradiente baseado na cor da marca
  const brandColor = config.brandColor || "#F97316"
  
  return (
    <section className="pt-0 pb-5 border-b border-border/50 bg-background">
      <div className="px-4 sm:px-5">
        <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 sm:-mx-5 sm:px-5">
          {stories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => onStoryClick?.(story, index)}
              className="flex flex-col items-center gap-2.5 flex-shrink-0 group"
            >
              {/* Story ring - cor da identidade visual da marca (72px igual Natura) */}
              <div 
                className="relative w-[72px] h-[72px] rounded-full p-[2.5px] shadow-sm group-active:scale-95 transition-transform"
                style={{ 
                  background: `linear-gradient(135deg, ${brandColor}, ${brandColor}E6, ${brandColor}CC)` 
                }}
              >
                <div className="w-full h-full rounded-full bg-background p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-secondary">
                    <Image 
                      src={story.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.name)}&background=random&size=144`} 
                      alt={story.name} 
                      width={64}
                      height={64}
                      className="object-cover w-full h-full" 
                    />
                  </div>
                </div>
              </div>
              {/* Label */}
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[72px] text-center">
                {story.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// ========================================
// SEARCH BAR
// ========================================
function BusinessSearchBar({ placeholder }: { placeholder?: string }) {
  return (
    <section className="py-5 bg-background">
      <div className="px-4 sm:px-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder || "O que voce quer encontrar?"}
            className="w-full h-12 pl-12 pr-4 bg-secondary border-0 rounded-2xl text-[15px] placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent"
          />
        </div>
      </div>
    </section>
  )
}

// ========================================
// POST CARDS
// ========================================
function PostCard({ 
  post, 
  index, 
  brandLogo, 
  onClick,
  showChat = true,
  isContextSelected = false,
  onContextToggle
}: { 
  post: BusinessPost
  index: number
  brandLogo: string
  onClick?: () => void
  showChat?: boolean
  isContextSelected?: boolean
  onContextToggle?: (post: BusinessPost) => void
}) {
  const userAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"
  
  const chatMessages: Record<string, { messages: { content: string; isUser: boolean }[]; placeholder: string }> = {
    video: {
      messages: [{ content: "Esse tutorial tem dicas incriveis! Quer que eu resuma os pontos principais?", isUser: false }],
      placeholder: "O que achou do video?"
    },
    "video-vertical": {
      messages: [{ content: "Esse conteudo viralizou essa semana! Quer ver mais como esse?", isUser: false }],
      placeholder: "Curti! Tem mais?"
    },
    product: {
      messages: [
        { content: "Esse produto esta entre os mais vendidos! Sabia que ele tem ingredientes exclusivos da Amazonia?", isUser: false },
        { content: "Serio? Conta mais!", isUser: true },
        { content: "Sim! E feito com castanha e oleo de buriti. Quer que eu explique os beneficios?", isUser: false }
      ],
      placeholder: "Vale a pena pra mim?"
    },
    news: {
      messages: [{ content: "Essa noticia saiu em varios portais essa semana. Quer saber mais detalhes?", isUser: false }],
      placeholder: "Me conta mais"
    },
    review: {
      messages: [{ content: "Essa avaliacao foi muito curtida! Voce ja experimentou esse produto?", isUser: false }],
      placeholder: "Ainda nao, e bom?"
    },
    social: {
      messages: [{ content: "Esse post teve muito engajamento! O que achou?", isUser: false }],
      placeholder: "Adorei!"
    }
  }
  
  const chatConfig = chatMessages[post.type] || chatMessages.social
  const { longPressHandlers, shouldHandleActivation } = useConversationLongPress({
    onLongPress: () => onContextToggle?.(post),
  })

  const handlePostActivation = useCallback(() => {
    if (!shouldHandleActivation()) return
    onClick?.()
  }, [onClick, shouldHandleActivation])
  
  // Renderiza card baseado no tipo
  if (post.type === "video" || post.type === "video-vertical") {
    const isVertical = post.type === "video-vertical"
    return (
      <article
        className={cn(
          "relative mb-8 rounded-[28px] transition-all duration-200",
          isContextSelected && "ring-2 ring-accent/20 ring-offset-2 ring-offset-background shadow-lg"
        )}
        {...longPressHandlers}
      >
        {isContextSelected && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <MessageCircle className="h-3.5 w-3.5" />
            Na conversa
          </div>
        )}
        <div 
          onClick={handlePostActivation}
          className={cn(
            "relative rounded-2xl overflow-hidden cursor-pointer group",
            isVertical ? "aspect-[9/16]" : "aspect-video"
          )}
        >
          <Image src={post.image} alt={post.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-foreground ml-1" />
            </div>
          </div>
          {post.duration && (
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded-md">
              <span className="text-xs text-white font-medium">{post.duration}</span>
            </div>
          )}
        </div>
        <div className="mt-3">
          <h3 className="font-semibold text-foreground text-[15px] line-clamp-2">{post.title}</h3>
          {post.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.description}</p>}
        </div>
        <SocialProofWithAvatars type={post.type} index={index} />
        <SocialActions />
        {showChat && (index % 3 === 0) && (
          <div className="mt-4">
            <SimulatedChat
              messages={chatConfig.messages}
              brandLogo={brandLogo}
              userAvatar={userAvatar}
              placeholder={chatConfig.placeholder}
            />
          </div>
        )}
        {showChat && (index % 3 !== 0) && (
          <div className="mt-4">
            <SimpleChatInput brandLogo={brandLogo} userAvatar={userAvatar} placeholder={chatConfig.placeholder} />
          </div>
        )}
      </article>
    )
  }
  
  if (post.type === "product") {
    const discount = post.originalPrice ? Math.round((1 - post.price! / post.originalPrice) * 100) : 0
    return (
      <article
        className={cn(
          "relative mb-8 rounded-[28px] transition-all duration-200",
          isContextSelected && "ring-2 ring-accent/20 ring-offset-2 ring-offset-background shadow-lg"
        )}
        {...longPressHandlers}
      >
        {isContextSelected && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <MessageCircle className="h-3.5 w-3.5" />
            Na conversa
          </div>
        )}
        <div onClick={handlePostActivation} className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group">
          <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0">-{discount}%</Badge>
          )}
        </div>
        <div className="mt-3">
          <h3 className="font-semibold text-foreground text-[15px] line-clamp-2">{post.title}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-accent">
              R$ {post.price?.toFixed(2).replace(".", ",")}
            </span>
            {post.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                R$ {post.originalPrice.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>
        </div>
        <SocialProofWithAvatars type="product" index={index} />
        <SocialActions />
        {showChat && (
          <div className="mt-4">
            <SimulatedChat
              messages={chatConfig.messages}
              brandLogo={brandLogo}
              userAvatar={userAvatar}
              placeholder={chatConfig.placeholder}
            />
          </div>
        )}
      </article>
    )
  }
  
  if (post.type === "news") {
    return (
      <article
        className={cn(
          "relative mb-8 rounded-[28px] transition-all duration-200",
          isContextSelected && "ring-2 ring-accent/20 ring-offset-2 ring-offset-background shadow-lg"
        )}
        {...longPressHandlers}
      >
        {isContextSelected && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <MessageCircle className="h-3.5 w-3.5" />
            Na conversa
          </div>
        )}
        {post.image && (
          <div onClick={handlePostActivation} className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group">
            <Image src={post.image} alt={post.title} fill className="object-cover" />
            {post.source && (
              <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground border-0">{post.source}</Badge>
            )}
          </div>
        )}
        <div className={post.image ? "mt-3" : "p-4 bg-secondary/50 rounded-2xl"}>
          {!post.image && post.source && (
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium text-accent">{post.source}</span>
            </div>
          )}
          <h3 className="font-semibold text-foreground text-[15px] line-clamp-2">{post.title}</h3>
          {post.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{post.description}</p>}
        </div>
        <SocialProofWithAvatars type="news" index={index} />
        <SocialActions />
        {showChat && (
          <div className="mt-4">
            <SimpleChatInput brandLogo={brandLogo} userAvatar={userAvatar} placeholder={chatConfig.placeholder} />
          </div>
        )}
      </article>
    )
  }
  
  if (post.type === "review") {
    return (
      <article
        className={cn(
          "relative mb-8 rounded-[28px] p-4 bg-card border border-border/50 transition-all duration-200",
          isContextSelected && "ring-2 ring-accent/20 ring-offset-2 ring-offset-background shadow-lg"
        )}
        {...longPressHandlers}
      >
        {isContextSelected && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <MessageCircle className="h-3.5 w-3.5" />
            Na conversa
          </div>
        )}
        <div className="flex items-start gap-3">
          {post.reviewerAvatar && (
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image src={post.reviewerAvatar} alt={post.reviewerName || ""} fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{post.reviewerName}</span>
              {post.rating && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("w-3.5 h-3.5", i < post.rating! ? "fill-yellow-400 text-yellow-400" : "text-border")} />
                  ))}
                </div>
              )}
            </div>
            <p className="text-[15px] text-foreground mt-2">{post.title}</p>
            {post.description && <p className="text-sm text-muted-foreground mt-1">{post.description}</p>}
          </div>
        </div>
        <SocialProofWithAvatars type="review" index={index} />
        <SocialActions />
        {showChat && (
          <div className="mt-4">
            <SimpleChatInput brandLogo={brandLogo} userAvatar={userAvatar} placeholder={chatConfig.placeholder} />
          </div>
        )}
      </article>
    )
  }
  
  // Social post (default)
  return (
    <article
      className={cn(
        "relative mb-8 rounded-[28px] transition-all duration-200",
        isContextSelected && "ring-2 ring-accent/20 ring-offset-2 ring-offset-background shadow-lg"
      )}
      {...longPressHandlers}
    >
      {isContextSelected && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <MessageCircle className="h-3.5 w-3.5" />
          Na conversa
        </div>
      )}
      {post.image && (
        <div onClick={handlePostActivation} className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer">
          <Image src={post.image} alt={post.title} fill className="object-cover" />
        </div>
      )}
      <div className="mt-3">
        <p className="text-[15px] text-foreground">{post.title}</p>
        {post.description && <p className="text-sm text-muted-foreground mt-1">{post.description}</p>}
      </div>
      <SocialProofWithAvatars type="social" index={index} />
      <SocialActions />
      {showChat && (
        <div className="mt-4">
          <SimpleChatInput brandLogo={brandLogo} userAvatar={userAvatar} placeholder={chatConfig.placeholder} />
        </div>
      )}
    </article>
  )
}

// ========================================
// SECTION
// ========================================
function BusinessSectionComponent({ 
  section, 
  config, 
  onPostClick,
  selectedContextPostIds,
  onContextToggle
}: { 
  section: BusinessSection
  config: BusinessConfig
  onPostClick?: (post: BusinessPost) => void
  selectedContextPostIds: Set<string>
  onContextToggle: (post: BusinessPost) => void
}) {
  // Gera ID para scroll baseado no titulo da secao
  const sectionId = section.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")
  
  return (
    <section className="mb-10" data-section={sectionId} id={`section-${sectionId}`}>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5">
        {section.icon}
        <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
      </div>
      
      {/* Custom Content (for specific modules - sem drawer) */}
      {section.customContent && section.customContent}
      
      {/* Render Content (com drawer) - passa onPostClick para o conteudo */}
      {section.renderContent && onPostClick && section.renderContent(onPostClick)}
      
      {/* Posts */}
      {section.posts && section.posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          index={index}
          brandLogo={config.logo}
          onClick={() => onPostClick?.(post)}
          showChat={false}
          isContextSelected={selectedContextPostIds.has(post.id)}
          onContextToggle={onContextToggle}
        />
      ))}
    </section>
  )
}

function FixedConversationComposer({
  brandName,
  brandLogo,
  selectedPosts,
  onRemovePost,
}: {
  brandName: string
  brandLogo: string
  selectedPosts: ConversationContextItem[]
  onRemovePost: (postId: string) => void
}) {
  const [draftMessage, setDraftMessage] = useState("")
  const hasSelection = selectedPosts.length > 0
  const composerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const composerElement = composerRef.current
    if (!composerElement) return

    const rootStyle = document.documentElement.style
    const updateComposerHeight = () => {
      rootStyle.setProperty("--social-conversation-composer-height", `${composerElement.offsetHeight}px`)
    }

    updateComposerHeight()

    if (typeof ResizeObserver === "undefined") {
      return () => {
        rootStyle.setProperty("--social-conversation-composer-height", "0px")
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      updateComposerHeight()
    })

    resizeObserver.observe(composerElement)

    return () => {
      resizeObserver.disconnect()
      rootStyle.setProperty("--social-conversation-composer-height", "0px")
    }
  }, [hasSelection, selectedPosts.length])

  return (
    <div
      ref={composerRef}
      className="fixed inset-x-0 bottom-0 z-[70] bg-background"
    >
      <div className="mx-auto max-w-lg px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+12px)] sm:max-w-xl md:max-w-2xl lg:max-w-[600px]">
        <div className="bg-background">
          <div className="px-1 pb-1">
            {hasSelection ? (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Conversando sobre:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedPosts.map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => onRemovePost(post.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                      title={normalizeConversationChipText(post.title) || getConversationChipLabel(post)}
                    >
                      <span className="max-w-[140px] truncate sm:max-w-[180px]">
                        {getConversationChipLabel(post)}
                      </span>
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm font-medium text-foreground">
                Aperte e segure um post e converse sobre ele
              </p>
            )}
          </div>

          <form
            className="mt-2 flex items-center gap-3 px-1 py-1"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-border/50">
              <Image src={brandLogo} alt={brandName} fill className="object-cover" />
            </div>

            <div className="flex-1">
              <input
                type="text"
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                placeholder={
                  hasSelection
                    ? "Pergunte sobre os conteudos selecionados..."
                    : `Converse com ${brandName}...`
                }
                className="h-11 w-full rounded-full border border-border/60 bg-secondary/60 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/40 focus:bg-secondary"
              />
            </div>

            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 rounded-full"
              aria-label="Enviar mensagem"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ========================================
// FOOTER
// ========================================
function BusinessFooter({ config, links }: { config: BusinessConfig; links?: { label: string; href: string }[] }) {
  return (
    <footer className="bg-card border-t border-border/50 py-16">
      <div className="max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px] mx-auto px-4 sm:px-5 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image src={config.logo} alt={config.name} fill className="object-cover" />
          </div>
          <span className="font-semibold text-foreground">{config.name}</span>
        </div>
        
        {links && links.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        )}
        
        <p className="text-sm text-muted-foreground">
          {new Date().getFullYear()} {config.name}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}

// ========================================
// MAIN COMPONENT
// ========================================
export function BusinessSocialLanding({
  config,
  stories,
  sections,
  topContent,
  onPostClick,
  onStoryClick,
  onStoryAction,
  renderPostDrawer,
  footerLinks,
  conversationalAI,
  reserveHeaderSpace = true,
  conversationContextItems,
  onConversationContextToggle,
  onConversationContextRemove,
}: BusinessSocialLandingProps) {
  const {
    contextItems: internalContextItems,
    toggleContextItem: toggleInternalContextItem,
    removeContextItem: removeInternalContextItem,
  } = useConversationContextSelectionState()
  const [selectedPost, setSelectedPost] = useState<BusinessPost | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [feedDrawerOpen, setFeedDrawerOpen] = useState(false)
  const [feedDrawerCategory, setFeedDrawerCategory] = useState<string>("all")
  
  // Story viewer state
  const [storyViewerOpen, setStoryViewerOpen] = useState(false)
  const [storyInitialIndex, setStoryInitialIndex] = useState(0)
  const headerSpacerClass = "h-14"
  
  // Coleta todos os posts de conteudo para o FeedDrawer
  const allContentPosts = useMemo(() => {
    const posts: BusinessPost[] = []
    sections.forEach(section => {
      if (section.type === "content" && section.posts) {
        posts.push(...section.posts)
      }
    })
    return posts
  }, [sections])
  const contextItems = conversationContextItems ?? internalContextItems
  const selectedContextIds = useMemo(
    () => new Set(contextItems.map((item) => item.id)),
    [contextItems]
  )
  
  const handlePostClick = useCallback((post: BusinessPost) => {
    // Se for post de conteudo (video, news, review, social), abre o FeedDrawer
    const contentTypes = ["video", "video-vertical", "news", "review", "social"]
    if (contentTypes.includes(post.type)) {
      setSelectedPost(post)
      setFeedDrawerCategory(post.type)
      setFeedDrawerOpen(true)
    } else {
      // Para outros tipos (products, etc), usa o drawer customizado
      setSelectedPost(post)
      setDrawerOpen(true)
      onPostClick?.(post)
    }
  }, [onPostClick])

  const handleContextItemToggle = useCallback((item: ConversationContextItem) => {
    if (onConversationContextToggle) {
      onConversationContextToggle(item)
      return
    }

    toggleInternalContextItem(item)
  }, [onConversationContextToggle, toggleInternalContextItem])

  const handleContextToggle = useCallback((post: BusinessPost) => {
    handleContextItemToggle(createConversationContextItemFromPost(post))
  }, [handleContextItemToggle])

  const handleRemoveContextPost = useCallback((postId: string) => {
    if (onConversationContextRemove) {
      onConversationContextRemove(postId)
      return
    }

    removeInternalContextItem(postId)
  }, [onConversationContextRemove, removeInternalContextItem])
  
  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false)
    setSelectedPost(null)
  }, [])
  
  const handleCloseFeedDrawer = useCallback(() => {
    setFeedDrawerOpen(false)
    setSelectedPost(null)
  }, [])
  
  const handleStoryClick = useCallback((story: BusinessStory, index: number) => {
    setStoryInitialIndex(index)
    setStoryViewerOpen(true)
    onStoryClick?.(story)
  }, [onStoryClick])
  
  return (
    <div
      className="min-h-screen bg-background"
      style={{ paddingBottom: "calc(var(--social-conversation-composer-height, 0px) + 16px)" }}
    >
      {/* Fixed Header */}
      <BusinessHeader config={config} />
      
      {/* Spacer for fixed header */}
      {reserveHeaderSpace && <div className={headerSpacerClass} />}
      
      {/* Main Content - Centralizado estilo rede social */}
      <main className="max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px] mx-auto">
        {/* Stories */}
        <div className={reserveHeaderSpace ? "-mt-3" : undefined}>
          <BusinessStories stories={stories} config={config} onStoryClick={handleStoryClick} />
        </div>

        {/* Top content slot */}
        {topContent}
        
        {/* Search Bar */}
        <BusinessSearchBar placeholder={`Buscar em ${config.name}...`} />
        
        {/* Sections */}
        <div className="px-4 sm:px-5 py-6">
          {sections.map((section) => (
            <BusinessSectionComponent
              key={section.id}
              section={section}
              config={config}
              onPostClick={handlePostClick}
              selectedContextPostIds={selectedContextIds}
              onContextToggle={handleContextToggle}
            />
          ))}
        </div>
        
        {/* Conversational AI (fixed or inline) */}
        {conversationalAI}
      </main>
      
      {/* Footer */}
      <BusinessFooter config={config} links={footerLinks} />

      <FixedConversationComposer
        brandName={config.name}
        brandLogo={config.logo}
        selectedPosts={contextItems}
        onRemovePost={handleRemoveContextPost}
      />
      
      {/* Story Viewer Modal */}
      <StoryViewer
        isOpen={storyViewerOpen}
        onClose={() => setStoryViewerOpen(false)}
        stories={stories}
        initialIndex={storyInitialIndex}
        categoryName={stories[storyInitialIndex]?.name || "Story"}
        brandLogo={config.logo}
        onViewSection={(story) => {
          if (onStoryAction?.(story)) {
            return
          }

          // Normaliza o nome do story (remove acentos e espacos)
          const storyName = story.name
          const normalizedName = storyName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")
          const normalizedSearchTerm = normalizedName.replace(/-/g, " ")
          const singularSearchTerm = normalizedSearchTerm.endsWith("s")
            ? normalizedSearchTerm.slice(0, -1)
            : normalizedSearchTerm
          const normalizeText = (value?: string) =>
            value?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || ""
          
          const matchingPost = allContentPosts.find((post) => {
            const searchableText = normalizeText(`${post.title} ${post.description || ""} ${post.type}`)
            return searchableText.includes(normalizedSearchTerm) || searchableText.includes(singularSearchTerm)
          })
          
          if (matchingPost) {
            handlePostClick(matchingPost)
            return
          }
          
          // Procura a secao correspondente pelo data-section
          const sectionElement = document.querySelector(`[data-section="${normalizedName}"]`)
          if (sectionElement) {
            sectionElement.scrollIntoView({ behavior: "smooth", block: "start" })
            return
          }
          
          // Fallback: procura por ID
          const sectionById = document.getElementById(`section-${normalizedName}`)
          if (sectionById) {
            sectionById.scrollIntoView({ behavior: "smooth", block: "start" })
            return
          }
          
          // Ultimo fallback: procura pelo texto no h2
          const sections = document.querySelectorAll("section h2")
          for (const section of sections) {
            const sectionText = section.textContent?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || ""
            if (sectionText.includes(normalizedName.replace(/-/g, " "))) {
              section.scrollIntoView({ behavior: "smooth", block: "start" })
              return
            }
          }
          
          if (allContentPosts.length > 0) {
            setSelectedPost(allContentPosts[0])
            setFeedDrawerCategory("all")
            setFeedDrawerOpen(true)
          }
        }}
      />
      
      {/* Feed Drawer - para conteudos (videos, noticias, avaliacoes, posts) */}
      <BusinessFeedDrawer
        isOpen={feedDrawerOpen}
        onClose={handleCloseFeedDrawer}
        posts={allContentPosts}
        initialPost={selectedPost}
        category={feedDrawerCategory}
        brandLogo={config.logo}
        brandName={config.name}
        selectedContextIds={selectedContextIds}
        onContextToggle={handleContextToggle}
      />
      
      {/* Custom Post Drawer - para itens especificos do negocio */}
      {renderPostDrawer && drawerOpen && renderPostDrawer(selectedPost, handleCloseDrawer)}
    </div>
  )
}
