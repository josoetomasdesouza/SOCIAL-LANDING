"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

const socialAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
]

const socialNames = ["Ana", "Julia", "Mariana", "Carla", "Fernanda", "Beatriz", "Camila", "Patricia", "Lucia", "Amanda"]

const contextualSocialProof: Record<string, string[]> = {
  video: [
    "assistindo agora",
    "salvaram para ver depois",
    "compartilharam com amigas",
    "ja assistiram esse tutorial",
    "marcaram nos comentarios",
  ],
  "video-vertical": [
    "assistindo agora",
    "curtiram esse video",
    "compartilharam",
    "salvaram nos favoritos",
    "marcaram amigos",
  ],
  product: [
    "adicionaram ao carrinho hoje",
    "compraram esse mes",
    "estao de olho nesse produto",
    "favoritaram essa semana",
    "compraram e amaram",
  ],
  news: [
    "leram essa materia",
    "compartilharam essa noticia",
    "estao acompanhando",
    "salvaram para ler depois",
    "comentaram sobre isso",
  ],
  review: [
    "acharam essa avaliacao util",
    "concordaram com essa opiniao",
    "tiveram experiencia parecida",
    "tambem avaliaram esse produto",
    "curtiram essa avaliacao",
  ],
  social: [
    "curtiram essa publicacao",
    "comentaram aqui",
    "compartilharam com alguem",
    "salvaram esse post",
    "marcaram amigos",
  ],
}

interface SocialProofProps {
  type: string
  index: number
  className?: string
}

export function SocialProof({ type, index, className }: SocialProofProps) {
  const messages = contextualSocialProof[type] || contextualSocialProof.social
  const message = messages[index % messages.length]
  const name1 = socialNames[index % socialNames.length]
  const name2 = socialNames[(index + 3) % socialNames.length]
  const avatarIndexes = [(index * 2) % 5, (index * 2 + 1) % 5, (index * 2 + 2) % 5]

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex -space-x-2">
        {avatarIndexes.map((avatarIdx, i) => (
          <div key={i} className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-background shadow-sm">
            <Image src={socialAvatars[avatarIdx]} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground/80">{name1}</span>
        {", "}
        <span className="font-medium text-foreground/80">{name2}</span>
        {" e outras pessoas "}
        {message}
      </p>
    </div>
  )
}
