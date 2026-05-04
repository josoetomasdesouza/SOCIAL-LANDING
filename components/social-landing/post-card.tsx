"use client"

import Image from "next/image"
import { Heart, MessageCircle, Share, Play, Star, ExternalLink, ShoppingBag, Newspaper, Bookmark } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Post } from "@/lib/types"
import { formatDateShort } from "@/lib/format-date"

interface PostCardProps {
  post: Post
  onClick: () => void
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return num.toString()
}

// Video Horizontal Card (YouTube style) - SEM CAIXA
function VideoHorizontalCard({ post, onClick }: PostCardProps) {
  return (
    <div 
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden rounded-xl">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Play Button - Red YouTube style */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-10 rounded-lg bg-red-600 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration Badge */}
        {post.duration && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded font-medium">
            {post.duration}
          </div>
        )}
      </div>

      {/* Content - YouTube style: avatar + title */}
      <div className="flex gap-3 mt-3">
        {post.author && (
          <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
            <Image src={post.author.avatar} alt={post.author.name} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground text-sm line-clamp-2 leading-snug">
            {post.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {post.author?.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {post.views && `${formatNumber(post.views)} views • `}{formatDateShort(post.date)}
          </p>
        </div>
      </div>
    </div>
  )
}

// Video Vertical Card (TikTok/Reels style) - SEM CAIXA, FULL BLEED
function VideoVerticalCard({ post, onClick }: PostCardProps) {
  return (
    <div 
      className="group cursor-pointer row-span-2"
      onClick={onClick}
    >
      <div className="relative aspect-[9/16] overflow-hidden rounded-xl">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Play Button - Centered, subtle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-7 h-7 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Right side engagement (TikTok style) */}
        <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4">
          <button className="flex flex-col items-center gap-1 text-white">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">{formatNumber(post.likes)}</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">{formatNumber(post.comments)}</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Share className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">{formatNumber(post.shares)}</span>
          </button>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-12 p-4">
          {post.author && (
            <div className="flex items-center gap-2 mb-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white">
                <Image src={post.author.avatar} alt={post.author.name} fill className="object-cover" />
              </div>
              <span className="text-white text-sm font-semibold">@{post.author.name.toLowerCase().replace(/\s/g, '')}</span>
            </div>
          )}
          <p className="text-white text-sm line-clamp-2">
            {post.description}
          </p>
          {post.duration && (
            <div className="flex items-center gap-2 mt-2 text-white/70 text-xs">
              <Play className="w-3 h-3 fill-current" />
              {post.duration}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Product Card (Marketplace style) - CAIXA SUTIL
function ProductCard({ post, onClick }: PostCardProps) {
  return (
    <div 
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary/30">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Discount Badge */}
        {post.originalPrice && post.price && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold border-0">
            -{Math.round((1 - post.price / post.originalPrice) * 100)}%
          </Badge>
        )}

        {/* Quick action */}
        <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
          <Heart className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="mt-3">
        <h3 className="font-medium text-foreground text-sm line-clamp-2 leading-snug">
          {post.title}
        </h3>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            R$ {post.price?.toFixed(2)}
          </span>
          {post.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              R$ {post.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Installments hint */}
        <p className="text-xs text-muted-foreground mt-1">
          ou 3x de R$ {((post.price || 0) / 3).toFixed(2)}
        </p>
      </div>
    </div>
  )
}

// News with Image Card (Threads style) - LINHA DE SEPARACAO
function NewsImageCard({ post, onClick }: PostCardProps) {
  return (
    <div 
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Source overlay */}
        {post.source && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
            <span className="text-white text-xs font-medium">{post.source}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-3">
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
          {post.description}
        </p>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span>{formatDateShort(post.date)}</span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            {formatNumber(post.likes)}
          </span>
          <span className="flex items-center gap-1">
            <Share className="w-3.5 h-3.5" />
            {formatNumber(post.shares)}
          </span>
        </div>
      </div>
    </div>
  )
}

// News without Image Card - FOCO EM TEXTO
function NewsTextCard({ post, onClick }: PostCardProps) {
  return (
    <div 
      className="group cursor-pointer p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
      onClick={onClick}
    >
      {/* Source tag */}
      {post.source && (
        <div className="flex items-center gap-2 mb-2">
          <Newspaper className="w-4 h-4 text-accent" />
          <span className="text-xs font-medium text-accent uppercase tracking-wide">
            {post.source}
          </span>
        </div>
      )}

      {/* Title */}
      <h3 className="font-semibold text-foreground leading-snug group-hover:text-accent transition-colors">
        {post.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
        {post.description}
      </p>

      {/* Meta */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
        <span>{formatDateShort(post.date)}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            {formatNumber(post.likes)}
          </span>
          <span className="flex items-center gap-1">
            <Share className="w-3.5 h-3.5" />
            {formatNumber(post.shares)}
          </span>
        </div>
      </div>
    </div>
  )
}

// Review Card (Google style) - CARD SUTIL
function ReviewCard({ post, onClick }: PostCardProps) {
  return (
    <div 
      className="group cursor-pointer p-4 rounded-xl border border-border/50 hover:border-border transition-colors"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {post.author && (
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image src={post.author.avatar} alt={post.author.name} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground text-sm">
              {post.author?.name || post.reviewerName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDateShort(post.date)}
            </span>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < (post.rating || 0) 
                    ? "text-yellow-400 fill-yellow-400" 
                    : "text-muted-foreground/20 fill-muted-foreground/20"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Review Content */}
      <p className="text-sm text-muted-foreground mt-3 line-clamp-4 leading-relaxed">
        &ldquo;{post.description}&rdquo;
      </p>

      {/* Helpful */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
          <Heart className="w-3.5 h-3.5" />
          Util ({formatNumber(post.likes)})
        </button>
      </div>
    </div>
  )
}

// Social Card (Instagram style) - SEM CAIXA
function SocialCard({ post, onClick }: PostCardProps) {
  return (
    <div 
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Author Header */}
      <div className="flex items-center gap-3 mb-3">
        {post.author && (
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-pink-500 ring-offset-2 ring-offset-background">
            <Image src={post.author.avatar} alt={post.author.name} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-foreground text-sm">{post.author?.name}</span>
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="6" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="12" cy="18" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-3">
        <button className="hover:text-red-500 transition-colors">
          <Heart className="w-6 h-6" />
        </button>
        <button className="hover:text-accent transition-colors">
          <MessageCircle className="w-6 h-6" />
        </button>
        <button className="hover:text-accent transition-colors">
          <Share className="w-6 h-6" />
        </button>
        <button className="hover:text-accent transition-colors ml-auto">
          <Bookmark className="w-6 h-6" />
        </button>
      </div>

      {/* Likes */}
      <p className="font-semibold text-sm mt-2">
        {formatNumber(post.likes)} curtidas
      </p>

      {/* Caption */}
      <p className="text-sm mt-1">
        <span className="font-semibold">{post.author?.name}</span>{" "}
        <span className="text-muted-foreground">{post.description}</span>
      </p>

      {/* Comments link */}
      <p className="text-sm text-muted-foreground mt-1">
        Ver todos os {formatNumber(post.comments)} comentarios
      </p>

      {/* Date */}
      <p className="text-xs text-muted-foreground mt-1 uppercase">
        {formatDateShort(post.date)}
      </p>
    </div>
  )
}

// Main PostCard component - routes to specific card type
export function PostCard({ post, onClick }: PostCardProps) {
  switch (post.type) {
    case "video":
      if (post.isVertical) {
        return <VideoVerticalCard post={post} onClick={onClick} />
      }
      return <VideoHorizontalCard post={post} onClick={onClick} />
    
    case "product":
      return <ProductCard post={post} onClick={onClick} />
    
    case "news":
      if (post.hasImage === false || !post.image) {
        return <NewsTextCard post={post} onClick={onClick} />
      }
      return <NewsImageCard post={post} onClick={onClick} />
    
    case "review":
      return <ReviewCard post={post} onClick={onClick} />
    
    case "social":
    default:
      return <SocialCard post={post} onClick={onClick} />
  }
}
