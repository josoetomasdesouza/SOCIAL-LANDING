"use client"

import { motion } from "framer-motion"
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Smartphone } from "lucide-react"
import Image from "next/image"

interface BrandPreviewProps {
  data: {
    name?: string | null
    description?: string | null
    logo?: string | null
    primaryColor?: string | null
    businessModel?: string | null
  } | null
}

const MODEL_LABELS: Record<string, string> = {
  appointment: "Agendar",
  ecommerce: "Produtos",
  courses: "Cursos",
  restaurant: "Cardapio",
  realestate: "Imoveis",
  professionals: "Servicos",
  events: "Eventos",
  gym: "Planos",
  health: "Consultas"
}

export function BrandPreview({ data }: BrandPreviewProps) {
  const brandColor = data?.primaryColor || "#10B981"
  const brandName = data?.name || "Sua Marca"
  const brandDescription = data?.description || "Sua descricao aparecera aqui..."
  const businessLabel = data?.businessModel ? MODEL_LABELS[data.businessModel] : "Feed"
  
  return (
    <div className="space-y-4">
      {/* Label */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Smartphone className="w-4 h-4" />
        <span>Preview</span>
      </div>
      
      {/* Phone frame */}
      <div className="flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-[280px]"
        >
          {/* Phone bezel */}
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/10 to-foreground/5 rounded-[2.5rem] -m-2" />
          
          {/* Phone screen */}
          <div className="relative bg-background rounded-[2rem] overflow-hidden border border-border/50 shadow-2xl">
            {/* Status bar */}
            <div className="h-6 bg-background flex items-center justify-center">
              <div className="w-20 h-5 bg-foreground/10 rounded-full" />
            </div>
            
            {/* Header */}
            <div 
              className="h-12 flex items-center justify-between px-4"
              style={{ backgroundColor: brandColor }}
            >
              <div className="flex items-center gap-2">
                {data?.logo ? (
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
                    <Image
                      src={data.logo}
                      alt="Logo"
                      width={28}
                      height={28}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center text-white text-xs font-bold">
                    {brandName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-semibold text-white text-sm truncate max-w-[140px]">
                  {brandName}
                </span>
              </div>
              <MoreHorizontal className="w-5 h-5 text-white/80" />
            </div>
            
            {/* Stories */}
            <div className="px-3 py-2.5 flex gap-2.5 overflow-hidden border-b border-border/30">
              {["Inicio", businessLabel, "Videos", "Mais"].map((story, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div 
                    className="w-12 h-12 rounded-full p-[2px]"
                    style={{ background: i === 0 ? `linear-gradient(135deg, ${brandColor}, ${brandColor}88)` : "transparent" }}
                  >
                    <div className={`w-full h-full rounded-full ${i === 0 ? "bg-card border-2 border-card" : "bg-secondary"}`} />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{story}</span>
                </div>
              ))}
            </div>
            
            {/* Search */}
            <div className="px-3 py-2">
              <div className="h-8 bg-secondary rounded-full flex items-center px-3">
                <span className="text-xs text-muted-foreground">Buscar em {brandName}...</span>
              </div>
            </div>
            
            {/* Post */}
            <div className="px-3 py-2 space-y-2.5">
              {/* Post header */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                  style={{ backgroundColor: brandColor }}
                >
                  {brandName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs truncate">{brandName}</p>
                  <p className="text-[10px] text-muted-foreground">Agora</p>
                </div>
              </div>
              
              {/* Post text */}
              <p className="text-xs text-foreground line-clamp-2">
                {brandDescription}
              </p>
              
              {/* Post image */}
              <div className="aspect-[4/3] rounded-lg bg-secondary/50 flex items-center justify-center overflow-hidden">
                {data?.logo ? (
                  <Image
                    src={data.logo}
                    alt="Post"
                    width={80}
                    height={80}
                    className="object-contain opacity-20"
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-lg opacity-30"
                    style={{ backgroundColor: brandColor }}
                  />
                )}
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between text-muted-foreground pt-1">
                <div className="flex gap-3">
                  <Heart className="w-4 h-4" />
                  <MessageCircle className="w-4 h-4" />
                  <Share2 className="w-4 h-4" />
                </div>
                <Bookmark className="w-4 h-4" />
              </div>
              
              {/* Social proof */}
              <div className="flex items-center gap-1.5 pb-2">
                <div className="flex -space-x-1.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border-2 border-background"
                      style={{ backgroundColor: `${brandColor}${40 + i * 20}` }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  256 pessoas curtiram
                </span>
              </div>
            </div>
            
            {/* Bottom nav simulado */}
            <div className="h-10 border-t border-border/30 flex items-center justify-around px-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-5 h-5 rounded bg-secondary/50" />
              ))}
            </div>
            
            {/* Home indicator */}
            <div className="h-5 flex items-center justify-center">
              <div className="w-24 h-1 bg-foreground/20 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
