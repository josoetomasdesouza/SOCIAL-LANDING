"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Post, Category } from "@/lib/types"

interface StoriesProps {
  categories: Category[]
  posts: Post[]
  brandLogo: string
  onNavigateToPost?: (post: Post) => void
}

interface StoryViewerProps {
  isOpen: boolean
  onClose: () => void
  posts: Post[]
  initialIndex: number
  categoryName: string
  fallbackImage: string
  onViewPost: (post: Post) => void
}

function StoryViewer({ isOpen, onClose, posts, initialIndex, categoryName, fallbackImage, onViewPost }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [progress, setProgress] = useState(0)

  // Reset index when posts change
  useEffect(() => {
    setCurrentIndex(initialIndex)
    setProgress(0)
  }, [initialIndex, posts])

  // Auto-advance timer
  useEffect(() => {
    if (!isOpen) return

    const duration = 5000 // 5 seconds per story
    const interval = 50 // Update every 50ms
    const increment = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Go to next story
          if (currentIndex < posts.length - 1) {
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
  }, [isOpen, currentIndex, posts.length, onClose])

  // Reset progress when changing story
  useEffect(() => {
    setProgress(0)
  }, [currentIndex])

  if (!isOpen || posts.length === 0) return null

  const currentPost = posts[currentIndex]
  const currentPostImage = currentPost.image || currentPost.thumbnail || fallbackImage

  const goNext = () => {
    if (currentIndex < posts.length - 1) {
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

  const handleViewPost = () => {
    onClose()
    onViewPost(currentPost)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Progress bars */}
      <div className="absolute top-6 left-5 right-5 flex gap-1.5 z-10">
        {posts.map((_, i) => (
          <div 
            key={i} 
            className="h-0.5 flex-1 rounded-full bg-white/25 overflow-hidden"
          >
            <div 
              className={cn(
                "h-full bg-white transition-all",
                i < currentIndex ? "w-full" : i === currentIndex ? "" : "w-0"
              )}
              style={i === currentIndex ? { width: `${progress}%` } : undefined}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-12 left-5 right-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="text-white font-medium text-sm">{categoryName}</span>
          <span className="text-white/60 text-xs">{currentIndex + 1}/{posts.length}</span>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-white/90 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Story content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src={currentPostImage}
          alt={currentPost.title}
          fill
          className="object-cover"
          priority
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        {/* Content */}
        <div className="absolute bottom-32 left-6 right-6 text-white">
          <h3 className="font-semibold text-xl mb-3 leading-tight text-balance">{currentPost.title}</h3>
          <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">{currentPost.description}</p>
        </div>

        {/* Ver publicacao button */}
        <button
          onClick={handleViewPost}
          className="absolute bottom-16 left-6 right-6 flex items-center justify-center gap-2 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl text-white font-medium transition-colors"
        >
          <span>Ver publicacao</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation areas (tap zones) */}
      <button 
        onClick={goPrev}
        className="absolute left-0 top-24 bottom-40 w-1/3 z-10"
        aria-label="Anterior"
      />
      <button 
        onClick={goNext}
        className="absolute right-0 top-24 bottom-40 w-2/3 z-10"
        aria-label="Proximo"
      />

      {/* Navigation arrows (desktop) */}
      {currentIndex > 0 && (
        <button 
          onClick={goPrev}
          className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/15 hover:bg-white/25 rounded-full items-center justify-center text-white z-20 transition-colors backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {currentIndex < posts.length - 1 && (
        <button 
          onClick={goNext}
          className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/15 hover:bg-white/25 rounded-full items-center justify-center text-white z-20 transition-colors backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}

const categoryLabels: Record<string, string> = {
  all: "Destaques",
  video: "Videos",
  product: "Produtos",
  news: "Noticias",
  review: "Avaliacoes",
  social: "Redes Sociais",
}

// IDs das secoes no feed para scroll
const sectionIds: Record<string, string> = {
  all: "section-destaques",
  video: "section-videos",
  shorts: "section-shorts",
  product: "section-produtos",
  news: "section-noticias",
  review: "section-avaliacoes",
  social: "section-social",
}

export function Stories({ categories, posts, brandLogo, onNavigateToPost }: StoriesProps) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerPosts, setViewerPosts] = useState<Post[]>([])
  const [initialIndex, setInitialIndex] = useState(0)
  const [currentCategory, setCurrentCategory] = useState("")

  // Pegar primeira imagem de cada categoria para usar como thumbnail do story
  const categoryThumbnails = useMemo(() => {
    const thumbnails: Record<string, string> = {}
    
    categories.forEach(cat => {
      if (cat.slug === "all") {
        thumbnails[cat.slug] = brandLogo
      } else {
        const firstPost = posts.find(p => p.type === cat.slug && p.image)
        thumbnails[cat.slug] = firstPost?.image || firstPost?.thumbnail || brandLogo
      }
    })
    
    return thumbnails
  }, [categories, posts, brandLogo])

  const handleStoryClick = (category: Category) => {
    const postsWithMedia = posts.filter((post) => post.image || post.thumbnail)
    const filteredPosts = category.slug === "all"
      ? postsWithMedia.slice(0, 10)
      : postsWithMedia.filter(p => p.type === category.slug).slice(0, 10)
    
    if (filteredPosts.length > 0) {
      setViewerPosts(filteredPosts)
      setInitialIndex(0)
      setCurrentCategory(categoryLabels[category.slug] || category.name)
      setViewerOpen(true)
    }
  }

  const handleViewPost = (post: Post) => {
    // Primeiro tenta rolar ate a secao
    const sectionId = post.type === "video" && post.isVertical
      ? sectionIds.shorts
      : sectionIds[post.type] || "section-destaques"
    const section = document.getElementById(sectionId)
    
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    // Se tiver callback, chama para abrir o drawer
    if (onNavigateToPost) {
      // Delay para dar tempo do scroll
      setTimeout(() => {
        onNavigateToPost(post)
      }, 500)
    }
  }

  return (
    <>
      <section className="py-5 border-b border-border/50 bg-background">
        <div className="px-4 sm:px-5">
          <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 sm:-mx-5 sm:px-5">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleStoryClick(category)}
                className="flex flex-col items-center gap-2.5 flex-shrink-0 group"
              >
                {/* Story ring - tamanho premium */}
                <div className="relative w-[72px] h-[72px] rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-pink-500 p-[2.5px] shadow-sm group-active:scale-95 transition-transform">
                  <div className="w-full h-full rounded-full bg-background p-[2px]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-secondary">
                      <Image
                        src={categoryThumbnails[category.slug] || brandLogo}
                        alt={categoryLabels[category.slug] || category.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                </div>
                {/* Label */}
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {categoryLabels[category.slug] || category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Story Viewer Modal */}
      <StoryViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        posts={viewerPosts}
        initialIndex={initialIndex}
        categoryName={currentCategory}
        fallbackImage={brandLogo}
        onViewPost={handleViewPost}
      />
    </>
  )
}
