"use client"

import { useMemo } from "react"
import { PostCard } from "./post-card"
import type { Post } from "@/lib/types"
import { sortFeedForVariety } from "@/lib/feed-sorter"

interface FeedGridProps {
  posts: Post[]
  activeCategory: string
  onPostClick: (post: Post) => void
}

export function FeedGrid({ posts, activeCategory, onPostClick }: FeedGridProps) {
  const filteredPosts = useMemo(() => {
    // Filtra por categoria
    const filtered = activeCategory === "all" 
      ? posts 
      : posts.filter((post) => post.type === activeCategory)
    
    // Aplica ordenação inteligente apenas quando mostra todos
    if (activeCategory === "all") {
      return sortFeedForVariety(filtered)
    }
    
    return filtered
  }, [posts, activeCategory])

  if (filteredPosts.length === 0) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <p className="text-muted-foreground text-lg">
              Nenhum conteúdo encontrado nesta categoria.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masonry-like grid that accommodates different card sizes */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
          {filteredPosts.map((post) => (
            <div 
              key={post.id} 
              className="break-inside-avoid mb-6"
            >
              <PostCard 
                post={post} 
                onClick={() => onPostClick(post)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
