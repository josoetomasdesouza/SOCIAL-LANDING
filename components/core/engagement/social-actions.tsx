"use client"

import { useState } from "react"
import { Bookmark, Heart, MessageCircle, Share } from "lucide-react"
import { cn } from "@/lib/utils"

interface SocialActionsProps {
  variant?: "feed" | "drawer"
  className?: string
  onLike?: (liked: boolean) => void
  onComment?: () => void
  onShare?: () => void
  onSave?: (saved: boolean) => void
}

export function SocialActions({
  variant = "feed",
  className,
  onLike,
  onComment,
  onShare,
  onSave,
}: SocialActionsProps) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleLike = () => {
    const nextLiked = !liked
    setLiked(nextLiked)
    onLike?.(nextLiked)
  }

  const handleSave = () => {
    const nextSaved = !saved
    setSaved(nextSaved)
    onSave?.(nextSaved)
  }

  if (variant === "drawer") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <button
          onClick={handleLike}
          className={cn(
            "p-2 rounded-full transition-all duration-200 active:scale-90",
            liked ? "text-red-500" : "hover:bg-red-500/10 hover:text-red-500"
          )}
        >
          <Heart className={cn("w-6 h-6", liked && "fill-current")} />
        </button>
        <button onClick={onComment} className="p-2 hover:bg-accent/10 hover:text-accent rounded-full transition-all duration-200 active:scale-90">
          <MessageCircle className="w-6 h-6" />
        </button>
        <button onClick={onShare} className="p-2 hover:bg-accent/10 hover:text-accent rounded-full transition-all duration-200 active:scale-90">
          <Share className="w-6 h-6" />
        </button>
        <button
          onClick={handleSave}
          className={cn(
            "p-2 rounded-full transition-all duration-200 ml-auto active:scale-90",
            saved ? "text-accent" : "hover:bg-accent/10 hover:text-accent"
          )}
        >
          <Bookmark className={cn("w-6 h-6", saved && "fill-current")} />
        </button>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-between mt-3", className)}>
      <div className="flex items-center gap-3">
        <button onClick={handleLike} className="p-1.5 hover:bg-secondary rounded-full transition-colors">
          <Heart className={cn("w-5 h-5", liked ? "fill-red-500 text-red-500" : "text-foreground")} />
        </button>
        <button onClick={onComment} className="p-1.5 hover:bg-secondary rounded-full transition-colors">
          <MessageCircle className="w-5 h-5 text-foreground" />
        </button>
        <button onClick={onShare} className="p-1.5 hover:bg-secondary rounded-full transition-colors">
          <Share className="w-5 h-5 text-foreground" />
        </button>
      </div>
      <button onClick={handleSave} className="p-1.5 hover:bg-secondary rounded-full transition-colors">
        <Bookmark className={cn("w-5 h-5", saved ? "fill-foreground" : "")} />
      </button>
    </div>
  )
}
