export type PostType = "video" | "product" | "news" | "review" | "social"

export interface Brand {
  id: string
  name: string
  slug: string
  logo: string
  coverImage: string
  headline: string
  description: string
  verified: boolean
  rating: number
  totalReviews: number
  totalPosts: number
  totalProducts: number
  whatsappNumber?: string
  socialLinks: {
    instagram?: string
    twitter?: string
    youtube?: string
    linkedin?: string
  }
}

export interface Post {
  id: string
  type: PostType
  title: string
  description: string
  image: string
  thumbnail?: string
  date: string
  likes: number
  comments: number
  shares: number
  author?: {
    name: string
    avatar: string
  }
  // Video specific
  duration?: string
  views?: number
  isVertical?: boolean // TikTok style vertical video
  // Product specific
  price?: number
  originalPrice?: number
  // Review specific
  rating?: number
  reviewerName?: string
  // News specific
  source?: string
  hasImage?: boolean // For news without image
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  count: number
}
