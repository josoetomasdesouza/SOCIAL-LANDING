"use client"

import { useState, useCallback, useMemo, useEffect, ReactNode } from "react"
import Image from "next/image"
import { ChevronDown, ChevronLeft, ChevronRight, X, Search, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import type { BusinessConfig, BusinessModel } from "@/lib/business-types"
import { BusinessFeedDrawer } from "./business-feed-drawer"
import { DynamicContentCard } from "@/components/core"
import type { UniversalPost, UniversalSectionConfig, UniversalStory } from "@/lib/core"

// ========================================
// TIPOS
// ========================================
export type BusinessPost = UniversalPost
export type BusinessStory = UniversalStory
export type BusinessSection = UniversalSectionConfig

interface BusinessSocialLandingProps {
  config: BusinessConfig
  stories: BusinessStory[]
  sections: BusinessSection[]
  onPostClick?: (post: BusinessPost) => void
  onStoryClick?: (story: BusinessStory) => void
  renderPostDrawer?: (post: BusinessPost | null, onClose: () => void) => ReactNode
  footerLinks?: { label: string; href: string }[]
  conversationalAI?: ReactNode
}

// ========================================
// HEADER
// ========================================
function BusinessHeader({ config }: { config: BusinessConfig }) {
  const userAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px] mx-auto px-4 sm:px-5">
        <div className="flex items-center justify-between h-16">
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
  onViewSection?: (storyName: string) => void
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
            onViewSection?.(currentStory.name)
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
  const brandColor = config.primaryColor || "#F97316"
  
  return (
    <section className="py-5 border-b border-border/50 bg-background">
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
  showChat = true
}: { 
  post: BusinessPost
  index: number
  brandLogo: string
  onClick?: () => void
  showChat?: boolean
}) {
  return (
    <DynamicContentCard
      post={post}
      index={index}
      brandLogo={brandLogo}
      showChat={showChat}
      onClick={onClick}
    />
  )
}

// ========================================
// SECTION
// ========================================
function BusinessSectionComponent({ 
  section, 
  config, 
  onPostClick 
}: { 
  section: BusinessSection
  config: BusinessConfig
  onPostClick?: (post: BusinessPost) => void
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
  onPostClick,
  onStoryClick,
  renderPostDrawer,
  footerLinks,
  conversationalAI
}: BusinessSocialLandingProps) {
  const [selectedPost, setSelectedPost] = useState<BusinessPost | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [feedDrawerOpen, setFeedDrawerOpen] = useState(false)
  const [feedDrawerCategory, setFeedDrawerCategory] = useState<string>("all")
  
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
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <BusinessHeader config={config} />
      
      {/* Spacer for fixed header */}
      <div className="h-16" />
      
      {/* Main Content - Centralizado estilo rede social */}
      <main className="max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px] mx-auto">
        {/* Stories */}
        <BusinessStories stories={stories} config={config} onStoryClick={handleStoryClick} />
        
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
            />
          ))}
        </div>
        
        {/* Conversational AI (fixed or inline) */}
        {conversationalAI}
      </main>
      
      {/* Footer */}
      <BusinessFooter config={config} links={footerLinks} />
      
      {/* Story Viewer Modal */}
      <StoryViewer
        isOpen={storyViewerOpen}
        onClose={() => setStoryViewerOpen(false)}
        stories={stories}
        initialIndex={storyInitialIndex}
        categoryName={stories[storyInitialIndex]?.name || "Story"}
        brandLogo={config.logo}
        onViewSection={(storyName) => {
          // Normaliza o nome do story (remove acentos e espacos)
          const normalizedName = storyName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")
          
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
              break
            }
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
      />
      
      {/* Custom Post Drawer - para itens especificos do negocio */}
      {renderPostDrawer && drawerOpen && renderPostDrawer(selectedPost, handleCloseDrawer)}
    </div>
  )
}
