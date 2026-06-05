"use client"

import { useState, useCallback, useMemo, useEffect, useRef, Fragment, ReactNode, cloneElement, isValidElement } from "react"
import Image from "next/image"
import { Heart, MessageCircle, Share, Bookmark, Play, Star, Newspaper, ChevronDown, ChevronLeft, ChevronRight, X, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { BusinessConfig } from "@/lib/business-types"
import { BusinessFeedDrawer } from "./business-feed-drawer"
import { ConversationalAI, type ConversationContextItem } from "./conversational-ai"
import { ContextSelectable } from "./context-selectable"
import { CustomContentBridge } from "./custom-content-bridge"
import {
  useConversationSelectionContext,
  useConversationSelectionState,
  type ConversationComposerMode,
} from "./conversation-selection-context"
import { useConversationContextMorph } from "./conversation-context-morph"
import { useComposerScrollPaddingBottom, COMPOSER_SCROLL_CLEARANCE_CSS_VAR } from "@/lib/ui/composer-scroll-clearance"
import { shouldRenderThreadInFlow } from "@/lib/ui/composer-layout"
import {
  CONVERSATION_ROOM_ORBIT_LEADING_CLASS,
  CONVERSATION_ROOM_ORBIT_SECTION_CLASS,
  CONVERSATION_ROOM_ORBIT_STORIES_CLASS,
} from "@/lib/ui/conversation-room-envelope"
import type {
  ConversationResponseResolver,
  ConversationVisualBlockRenderer,
} from "@/lib/mock-data/conversational-search"

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
  /** Optional slot before stories — vertical-specific presence layer (e.g. operational hero). */
  leadingContent?: ReactNode
  topContent?: ReactNode
  onPostClick?: (post: BusinessPost) => void
  onStoryClick?: (story: BusinessStory) => void
  onStoryAction?: (story: BusinessStory) => boolean | void
  renderPostDrawer?: (post: BusinessPost | null, onClose: () => void) => ReactNode
  footerLinks?: { label: string; href: string }[]
  conversationalAI?: ReactNode
  conversationResponseResolver?: ConversationResponseResolver
  renderConversationVisualBlock?: ConversationVisualBlockRenderer
  reserveHeaderSpace?: boolean | "compact"
  onHeaderCartClick?: () => void
  headerCartCount?: number
  /** Optional class on stories strip — vertical-specific cadence (e.g. appointment @ 320). */
  storiesClassName?: string
  /** Optional class on sections wrapper — vertical-specific cadence. */
  sectionsClassName?: string
}

const conversationContextLabels: Record<BusinessPost["type"], string> = {
  video: "Video",
  "video-vertical": "Short",
  product: "Produto",
  news: "Noticia",
  review: "Avaliacao",
  social: "Post",
}

function getConversationContextTitle(post: BusinessPost) {
  return post.title || post.description || post.reviewerName || "Conteudo selecionado"
}

function toConversationContextItem(post: BusinessPost, fallbackImage: string): ConversationContextItem {
  return {
    id: post.id,
    title: getConversationContextTitle(post),
    image: post.image || post.reviewerAvatar || fallbackImage,
    subtitle: conversationContextLabels[post.type],
  }
}

function getBusinessAccentColor(config: BusinessConfig) {
  return (config as BusinessConfig & { brandColor?: string }).brandColor || config.primaryColor || "#F97316"
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
// FEED INTRO
// ========================================
function BusinessFeedIntro({
  config,
  onCartClick,
  cartCount = 0,
}: {
  config: BusinessConfig
  onCartClick?: () => void
  cartCount?: number
}) {
  const userAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"
  
  return (
    <section className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-border/60">
            <Image src={config.logo} alt={config.name} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold leading-tight text-foreground">{config.name}</h1>
            {config.description && (
              <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">{config.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex shrink-0 items-center gap-1 pt-0.5">
          <button
            type="button"
            aria-label={cartCount > 0 ? `Abrir carrinho com ${cartCount} itens` : "Abrir carrinho"}
            onClick={onCartClick}
            className="relative rounded-full p-2.5 transition-colors hover:bg-secondary"
          >
            <ShoppingBag className="h-5 w-5 text-foreground" />
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-accent-foreground">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </button>
          <div className="relative ml-1 h-8 w-8 overflow-hidden rounded-full">
            <Image src={userAvatar} alt="Perfil" fill className="object-cover" />
          </div>
        </div>
      </div>
    </section>
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
function BusinessStories({ stories, config, onStoryClick, className }: { 
  stories: BusinessStory[]
  config: BusinessConfig
  onStoryClick?: (story: BusinessStory, index: number) => void
  className?: string
}) {
  // Gera gradiente baseado na cor da marca
  const brandColor = getBusinessAccentColor(config)
  
  return (
    <section className={cn("border-y border-border/50 bg-background py-5", className)}>
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
// POST CARDS
// ========================================
function PostCard({ 
  post, 
  index, 
  onClick,
  onLongPress,
  selectedInConversation = false,
}: { 
  post: BusinessPost
  index: number
  onClick?: () => void
  onLongPress?: (post: BusinessPost) => void
  selectedInConversation?: boolean
}) {
  // Renderiza card baseado no tipo
  if (post.type === "video" || post.type === "video-vertical") {
    const isVertical = post.type === "video-vertical"
    return (
      <ContextSelectable
        as="article"
        className="mb-8 rounded-[28px]"
        dataMorphSourceId={post.id}
        onClick={onClick}
        onLongPress={() => onLongPress?.(post)}
        selected={selectedInConversation}
        selectionStyle="media"
      >
        <div 
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
      </ContextSelectable>
    )
  }
  
  if (post.type === "product") {
    const discount = post.originalPrice ? Math.round((1 - post.price! / post.originalPrice) * 100) : 0
    return (
      <ContextSelectable
        as="article"
        className="mb-8 rounded-[28px]"
        dataMorphSourceId={post.id}
        onClick={onClick}
        onLongPress={() => onLongPress?.(post)}
        selected={selectedInConversation}
        selectionStyle="media"
      >
        <div className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group">
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
      </ContextSelectable>
    )
  }
  
  if (post.type === "news") {
    return (
      <ContextSelectable
        as="article"
        className="mb-8 rounded-[28px]"
        dataMorphSourceId={post.id}
        onClick={onClick}
        onLongPress={() => onLongPress?.(post)}
        selected={selectedInConversation}
        selectionStyle="media"
      >
        {post.image && (
          <div className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group">
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
      </ContextSelectable>
    )
  }
  
  if (post.type === "review") {
    return (
      <ContextSelectable
        as="article"
        className="mb-8 p-4 bg-card rounded-2xl border border-border/50"
        dataMorphSourceId={post.id}
        onClick={onClick}
        onLongPress={() => onLongPress?.(post)}
        selected={selectedInConversation}
      >
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
      </ContextSelectable>
    )
  }
  
  // Social post (default)
  return (
    <ContextSelectable
      as="article"
      className="mb-8 rounded-[28px]"
      dataMorphSourceId={post.id}
      onClick={onClick}
      onLongPress={() => onLongPress?.(post)}
      selected={selectedInConversation}
      selectionStyle="media"
    >
      {post.image && (
        <div className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer">
          <Image src={post.image} alt={post.title} fill className="object-cover" />
        </div>
      )}
      <div className="mt-3">
        <p className="text-[15px] text-foreground">{post.title}</p>
        {post.description && <p className="text-sm text-muted-foreground mt-1">{post.description}</p>}
      </div>
      <SocialProofWithAvatars type="social" index={index} />
      <SocialActions />
    </ContextSelectable>
  )
}

// ========================================
// SECTION
// ========================================
function renderSectionCustomContent(
  customContent: ReactNode,
  injection: {
    onToggleConversationContext: (item: ConversationContextItem) => void
    isInConversation: (id: string) => boolean
  }
) {
  if (!isValidElement(customContent)) {
    return customContent
  }

  const injectionProps = injection as Record<string, unknown>

  if (customContent.type === CustomContentBridge) {
    return cloneElement(customContent, injectionProps)
  }

  const needsBridge = typeof customContent.type === "string" || customContent.type === Fragment

  if (needsBridge) {
    return (
      <CustomContentBridge {...injection}>
        {customContent}
      </CustomContentBridge>
    )
  }

  return cloneElement(customContent, injectionProps)
}

function BusinessSectionComponent({ 
  section, 
  config, 
  onPostClick,
  onPostLongPress,
  selectedContextIds,
  onToggleConversationContext,
  isConversationSelected,
  engagedContextMode = false,
}: { 
  section: BusinessSection
  config: BusinessConfig
  onPostClick?: (post: BusinessPost) => void
  onPostLongPress?: (post: BusinessPost) => void
  selectedContextIds: Set<string>
  onToggleConversationContext: (item: ConversationContextItem) => void
  isConversationSelected: (id: string) => boolean
  engagedContextMode?: boolean
}) {
  // Gera ID para scroll baseado no titulo da secao
  const sectionId = section.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")
  const renderedCustomContent = renderSectionCustomContent(section.customContent, {
    onToggleConversationContext,
    isInConversation: isConversationSelected,
  })
  
  return (
    <section
      className={cn(
        "mb-10 transition-[transform,filter,opacity] duration-300 ease-out",
        engagedContextMode && cn("mb-6", CONVERSATION_ROOM_ORBIT_SECTION_CLASS)
      )}
      data-section={sectionId}
      id={`section-${sectionId}`}
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5">
        {section.icon}
        <h2
          className={cn(
            "text-lg font-bold text-foreground",
            engagedContextMode && "text-base font-semibold text-muted-foreground"
          )}
        >
          {section.title}
        </h2>
      </div>
      
      {/* Custom Content (for specific modules - sem drawer) */}
      {renderedCustomContent}
      
      {/* Render Content (com drawer) - passa onPostClick para o conteudo */}
      {section.renderContent && onPostClick && section.renderContent(onPostClick)}
      
      {/* Posts */}
      {section.posts && section.posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          index={index}
          onClick={() => onPostClick?.(post)}
          onLongPress={onPostLongPress}
          selectedInConversation={selectedContextIds.has(post.id)}
        />
      ))}
    </section>
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
  leadingContent,
  topContent,
  onPostClick,
  onStoryClick,
  onStoryAction,
  renderPostDrawer,
  footerLinks,
  conversationalAI,
  conversationResponseResolver,
  renderConversationVisualBlock,
  onHeaderCartClick,
  headerCartCount = 0,
  storiesClassName,
  sectionsClassName,
}: BusinessSocialLandingProps) {
  const sharedConversationSelection = useConversationSelectionContext()
  const localConversationSelection = useConversationSelectionState()
  const conversationSelection = sharedConversationSelection || localConversationSelection
  const localMorph = useConversationContextMorph(
    {
      selectedContextIds: localConversationSelection.selectedContextIds,
      toggleConversationContextItem: localConversationSelection.toggleConversationContextItem,
      removeConversationContext: localConversationSelection.removeConversationContext,
    },
    config.model
  )
  const hasSharedMorph = sharedConversationSelection !== null
  const [selectedPost, setSelectedPost] = useState<BusinessPost | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [feedDrawerOpen, setFeedDrawerOpen] = useState(false)
  const [feedDrawerCategory, setFeedDrawerCategory] = useState<string>("all")
  const {
    conversationContext,
    selectedContextIds,
    removeConversationContext,
    clearConversationContext,
    isConversationSelected,
    composerMode,
    composerOffsetClassName,
    composerLayoutVersion,
    setComposerMode,
    composerThreadEngagedProgress,
  } = conversationSelection
  const toggleConversationContextItemWithMorph = hasSharedMorph
    ? sharedConversationSelection.toggleConversationContextItemWithMorph
    : localMorph.toggleConversationContextItemWithMorph
  const hiddenContextIds = hasSharedMorph
    ? sharedConversationSelection.hiddenContextIds
    : localMorph.hiddenContextIds
  const pageScrollPaddingBottom = useComposerScrollPaddingBottom()
  const isLayoutV2 = shouldRenderThreadInFlow(composerLayoutVersion)
  const isAppointmentEngagedContext =
    config.model === "appointment" && isLayoutV2 && composerThreadEngagedProgress > 0
  const [threadPortalTarget, setThreadPortalTarget] = useState<HTMLDivElement | null>(null)
  const shouldTrackComposerFootprint =
    composerMode !== "hidden" && !(drawerOpen && !feedDrawerOpen)
  const composerModeBeforeFeedDrawerRef = useRef<ConversationComposerMode>("default")

  const syncFeedDrawerComposerOpen = useCallback(() => {
    if (composerMode === "hidden") {
      return
    }
    composerModeBeforeFeedDrawerRef.current = composerMode
    if (composerMode !== "overlay") {
      setComposerMode("overlay")
    }
  }, [composerMode, setComposerMode])

  const syncFeedDrawerComposerClose = useCallback(() => {
    const savedMode = composerModeBeforeFeedDrawerRef.current
    if (composerMode !== "hidden" && composerMode === "overlay" && savedMode !== "overlay") {
      setComposerMode(savedMode)
    }
  }, [composerMode, setComposerMode])

  useEffect(() => {
    if (feedDrawerOpen && composerMode === "default") {
      setComposerMode("overlay")
    }
  }, [feedDrawerOpen, composerMode, setComposerMode])

  // Story viewer state
  const [storyViewerOpen, setStoryViewerOpen] = useState(false)
  const [storyInitialIndex, setStoryInitialIndex] = useState(0)
  
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

  const toggleConversationContext = useCallback((post: BusinessPost) => {
    const contextItem = toConversationContextItem(post, config.logo)
    toggleConversationContextItemWithMorph(contextItem)
  }, [config.logo, toggleConversationContextItemWithMorph])
  
  const handlePostClick = useCallback((post: BusinessPost) => {
    // Se for post de conteudo (video, news, review, social), abre o FeedDrawer
    const contentTypes = ["video", "video-vertical", "news", "review", "social"]
    if (contentTypes.includes(post.type)) {
      setSelectedPost(post)
      setFeedDrawerCategory(post.type)
      syncFeedDrawerComposerOpen()
      setFeedDrawerOpen(true)
    } else {
      // Para outros tipos (products, etc), usa o drawer customizado
      setSelectedPost(post)
      setDrawerOpen(true)
      onPostClick?.(post)
    }
  }, [onPostClick, syncFeedDrawerComposerOpen])
  
  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false)
    setSelectedPost(null)
  }, [])
  
  const handleCloseFeedDrawer = useCallback(() => {
    setFeedDrawerOpen(false)
    setSelectedPost(null)
    syncFeedDrawerComposerClose()
  }, [syncFeedDrawerComposerClose])
  
  const handleStoryClick = useCallback((story: BusinessStory, index: number) => {
    setStoryInitialIndex(index)
    setStoryViewerOpen(true)
    onStoryClick?.(story)
  }, [onStoryClick])

  const handleRemoveConversationContext = useCallback((contextId: string) => {
    removeConversationContext(contextId)
  }, [removeConversationContext])

  const handleCloseConversation = useCallback(() => {
    clearConversationContext()
  }, [clearConversationContext])
  
  return (
    <div
      className={cn(
        "min-h-screen bg-background",
        isAppointmentEngagedContext && "bg-[#faf8f5]"
      )}
      style={{ paddingBottom: pageScrollPaddingBottom }}
      data-composer-layout-version={composerLayoutVersion}
      data-conversation-room-engaged={isAppointmentEngagedContext ? "true" : undefined}
    >
      {/* Main Content - Centralizado estilo rede social */}
      <main
        className="max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px] mx-auto"
        data-appointment-engaged-context={isAppointmentEngagedContext ? "true" : undefined}
      >
        {/* Feed intro */}
        <BusinessFeedIntro config={config} onCartClick={onHeaderCartClick} cartCount={headerCartCount} />

        {/* Leading content slot — padded so -mx-4 bleed (e.g. operational hero) stays within main column */}
        {leadingContent ? (
          <div
            className={cn(
              "px-4 sm:px-5 transition-[transform,filter,opacity] duration-300 ease-out",
              isAppointmentEngagedContext && CONVERSATION_ROOM_ORBIT_LEADING_CLASS
            )}
          >
            {leadingContent}
          </div>
        ) : null}

        {/* Stories */}
        <BusinessStories
          stories={stories}
          config={config}
          onStoryClick={handleStoryClick}
          className={cn(
            storiesClassName,
            isAppointmentEngagedContext && cn("border-border/30 py-3", CONVERSATION_ROOM_ORBIT_STORIES_CLASS)
          )}
        />

        {/* Top content slot */}
        {topContent}
        
        {/* Sections */}
        <div
          className={cn(
            "px-4 sm:px-5 py-6 transition-[opacity] duration-300 ease-out",
            isAppointmentEngagedContext && "py-4",
            sectionsClassName
          )}
        >
          {sections.map((section) => (
            <BusinessSectionComponent
              key={section.id}
              section={section}
              config={config}
              onPostClick={handlePostClick}
              onPostLongPress={toggleConversationContext}
              selectedContextIds={selectedContextIds}
              onToggleConversationContext={toggleConversationContextItemWithMorph}
              isConversationSelected={isConversationSelected}
              engagedContextMode={isAppointmentEngagedContext}
            />
          ))}
        </div>

        {isLayoutV2 ? (
          <div
            ref={setThreadPortalTarget}
            data-conversation-thread-anchor="true"
            className={cn(
              "relative px-0 sm:px-0",
              isAppointmentEngagedContext && "z-[1]",
              composerMode !== "default" && "hidden"
            )}
            style={{ paddingBottom: `var(${COMPOSER_SCROLL_CLEARANCE_CSS_VAR}, 0px)` }}
            aria-hidden={composerMode !== "default" ? true : undefined}
          />
        ) : null}
        
      </main>
      
      {/* Footer */}
      <BusinessFooter config={config} links={footerLinks} />

      {/* Conversational AI (fixed or inline) */}
      {conversationalAI || (
        <ConversationalAI
          brandLogo={config.logo}
          brandName={config.name}
          className={cn(
            composerMode === "overlay" ? "z-[70]" : feedDrawerOpen ? "z-[60]" : "z-30",
            (drawerOpen && !feedDrawerOpen) || composerMode === "hidden" ? "hidden" : undefined,
            composerOffsetClassName
          )}
          placeholder={`Pergunte sobre ${config.name}...`}
          contextItems={conversationContext}
          hiddenContextIds={hiddenContextIds}
          onRemoveContext={handleRemoveConversationContext}
          onCloseConversation={handleCloseConversation}
          responseResolver={conversationResponseResolver}
          renderVisualBlock={renderConversationVisualBlock}
          trackCompactFootprint={shouldTrackComposerFootprint}
          disableHostMockFallback={Boolean(conversationResponseResolver)}
          threadPortalTarget={isLayoutV2 ? threadPortalTarget : null}
        />
      )}

      {!hasSharedMorph ? localMorph.morphLayer : null}
      
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
            syncFeedDrawerComposerOpen()
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
        selectedContextIds={[...selectedContextIds]}
        onPostLongPress={toggleConversationContext}
      />
      
      {/* Custom Post Drawer - para itens especificos do negocio */}
      {renderPostDrawer && drawerOpen && renderPostDrawer(selectedPost, handleCloseDrawer)}
    </div>
  )
}
