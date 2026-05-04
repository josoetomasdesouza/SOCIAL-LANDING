"use client"

import { Search, ShoppingBag } from "lucide-react"
import Image from "next/image"
import type { Brand } from "@/lib/types"

// Avatar padrao do usuario
const DEFAULT_USER_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"

interface HeaderProps {
  brand: Brand
  userAvatar?: string
}

export function Header({ brand, userAvatar = DEFAULT_USER_AVATAR }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px] mx-auto px-4 sm:px-5">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-border/50 shadow-sm">
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-base leading-tight tracking-tight">
                {brand.name.toLowerCase()}
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight tracking-wide">
                bem estar bem
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button className="p-2.5 hover:bg-secondary/80 rounded-full transition-all duration-200 active:scale-95">
              <Search className="w-5 h-5 text-foreground/80" />
            </button>
            <button className="p-2.5 hover:bg-secondary/80 rounded-full transition-all duration-200 relative active:scale-95">
              <ShoppingBag className="w-5 h-5 text-foreground/80" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-[10px] text-accent-foreground rounded-full flex items-center justify-center font-semibold shadow-sm">
                2
              </span>
            </button>
            {/* Avatar do usuario em vez de icone generico */}
            <button className="p-1.5 hover:bg-secondary/80 rounded-full transition-all duration-200 active:scale-95">
              <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-border/50 shadow-sm">
                <Image
                  src={userAvatar}
                  alt="Seu perfil"
                  fill
                  className="object-cover"
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
