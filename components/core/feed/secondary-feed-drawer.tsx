"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import { ChevronUp, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UniversalPost } from "@/lib/core"
import { DynamicContentCard } from "../content-cards/dynamic-content-card"

interface SecondaryFeedDrawerProps {
  isOpen: boolean
  onClose: () => void
  posts: UniversalPost[]
  initialPost: UniversalPost | null
  category: string
  brandLogo: string
  brandName: string
  onAddToCart?: (post: UniversalPost) => void
  categoryLabels?: Record<string, string>
}

const defaultCategoryLabels: Record<string, string> = {
  all: "Conteudos",
  video: "Videos",
  "video-vertical": "Shorts",
  product: "Produtos",
  news: "Noticias",
  review: "Avaliacoes",
  social: "Posts",
}

export function SecondaryFeedDrawer({
  isOpen,
  onClose,
  posts,
  initialPost,
  category,
  brandLogo,
  brandName,
  onAddToCart,
  categoryLabels = defaultCategoryLabels,
}: SecondaryFeedDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialPostRef = useRef<HTMLDivElement>(null)

  const filteredPosts = useMemo(() => {
    if (category === "all") return posts
    return posts.filter((post) => post.type === category || (category === "video" && post.type === "video-vertical"))
  }, [posts, category])

  const orderedPosts = useMemo(() => {
    if (!initialPost) return filteredPosts
    const index = filteredPosts.findIndex((post) => post.id === initialPost.id)
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

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
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

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px] mx-auto px-4 sm:px-5 py-6">
            <div className="space-y-8">
              {orderedPosts.map((post, index) => {
                const isInitial = initialPost?.id === post.id

                return (
                  <article
                    key={post.id}
                    ref={isInitial ? initialPostRef : undefined}
                    className={cn(
                      "pb-8 border-b border-border/30",
                      index === 0 && "scroll-mt-20"
                    )}
                  >
                    <DynamicContentCard
                      post={post}
                      index={index}
                      brandLogo={brandLogo}
                      brandName={brandName}
                      variant="drawer"
                      onAddToCart={onAddToCart}
                    />
                  </article>
                )
              })}
            </div>

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
