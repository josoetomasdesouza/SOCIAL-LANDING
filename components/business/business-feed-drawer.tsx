"use client"

import { SecondaryFeedDrawer } from "@/components/core"
import type { UniversalPost } from "@/lib/core"
import type { BusinessPost } from "./business-social-landing"

interface BusinessFeedDrawerProps {
  isOpen: boolean
  onClose: () => void
  posts: BusinessPost[]
  initialPost: BusinessPost | null
  category: string
  brandLogo: string
  brandName: string
  onAddToCart?: (post: BusinessPost) => void
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
}: BusinessFeedDrawerProps) {
  return (
    <SecondaryFeedDrawer
      isOpen={isOpen}
      onClose={onClose}
      posts={posts}
      initialPost={initialPost}
      category={category}
      brandLogo={brandLogo}
      brandName={brandName}
      onAddToCart={onAddToCart as ((post: UniversalPost) => void) | undefined}
    />
  )
}
