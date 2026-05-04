"use client"

import { useState, useCallback } from "react"
import { Header } from "./header"
import { Stories } from "./stories"
import { SearchBar } from "./search-bar"
import { SectionFeed } from "./section-feed"
import { FeedDrawer } from "./feed-drawer"
import { Footer } from "./footer"
import type { Brand, Post, Category } from "@/lib/types"

interface SocialLandingProps {
  brand: Brand
  posts: Post[]
  categories: Category[]
}

export function SocialLanding({ brand, posts, categories }: SocialLandingProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [activeCategory, setActiveCategory] = useState("all")

  const handlePostClick = useCallback((post: Post) => {
    setSelectedPost(post)
    setActiveCategory(post.type)
    setDrawerOpen(true)
  }, [])

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false)
    setSelectedPost(null)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <Header brand={brand} />

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Main Content - Centralizado estilo rede social */}
      <main className="max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px] mx-auto">
        {/* Stories (Categories) */}
        <Stories 
          categories={categories} 
          posts={posts}
          brandLogo={brand.logo}
          onNavigateToPost={handlePostClick}
        />

        {/* Search Bar */}
        <SearchBar />

        {/* Section-based Feed */}
        <SectionFeed 
          posts={posts}
          brandLogo={brand.logo}
          onPostClick={handlePostClick}
        />
      </main>

      {/* Footer */}
      <Footer brand={brand} />

      {/* Feed Drawer (Secondary Feed) */}
      <FeedDrawer
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        posts={posts}
        initialPost={selectedPost}
        category={activeCategory}
        brandLogo={brand.logo}
      />
    </div>
  )
}
