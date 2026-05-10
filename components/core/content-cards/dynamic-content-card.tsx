"use client"

import Image from "next/image"
import { Newspaper, Play, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SimulatedChat, SimpleChatInput } from "@/components/social-landing/inline-chat"
import { cn } from "@/lib/utils"
import type { UniversalPost } from "@/lib/core"
import { SocialActions } from "../engagement/social-actions"
import { SocialProof } from "../engagement/social-proof"

const userAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"

const feedChatMessages: Record<string, { messages: { text: string; isUser: boolean }[]; placeholder: string }> = {
  video: {
    messages: [{ text: "Esse tutorial tem dicas incriveis! Quer que eu resuma os pontos principais?", isUser: false }],
    placeholder: "O que achou do video?",
  },
  "video-vertical": {
    messages: [{ text: "Esse conteudo viralizou essa semana! Quer ver mais como esse?", isUser: false }],
    placeholder: "Curti! Tem mais?",
  },
  product: {
    messages: [
      { text: "Esse produto esta entre os mais vendidos! Sabia que ele tem ingredientes exclusivos da Amazonia?", isUser: false },
      { text: "Serio? Conta mais!", isUser: true },
      { text: "Sim! E feito com castanha e oleo de buriti. Quer que eu explique os beneficios?", isUser: false },
    ],
    placeholder: "Vale a pena pra mim?",
  },
  news: {
    messages: [{ text: "Essa noticia saiu em varios portais essa semana. Quer saber mais detalhes?", isUser: false }],
    placeholder: "Me conta mais",
  },
  review: {
    messages: [{ text: "Essa avaliacao foi muito curtida! Voce ja experimentou esse produto?", isUser: false }],
    placeholder: "Ainda nao, e bom?",
  },
  social: {
    messages: [{ text: "Esse post teve muito engajamento! O que achou?", isUser: false }],
    placeholder: "Adorei!",
  },
}

const drawerInputPlaceholders: Record<string, string[]> = {
  video: ["vale a pena assistir?", "tem mais videos assim?", "gostei, quero ver mais"],
  "video-vertical": ["adorei esse!", "tem mais assim?", "quero ver mais"],
  product: ["esse e bom pra mim?", "qual a diferenca desse?", "vale a pena?"],
  news: ["onde posso ler mais?", "tem mais sobre isso?", "interessante, conta mais"],
  review: ["posso confiar nessa avaliacao?", "tem mais avaliacoes?", "quero ver outras opinioes"],
  social: ["quero saber mais!", "como participo?", "adorei, tem mais?"],
}

const drawerAiInitialMessages: Record<string, string[]> = {
  video: [
    "Esse video mostra tecnicas que poucas pessoas conhecem. Quer descobrir mais?",
    "Curiosidade: esse tutorial foi um dos mais salvos da semana.",
    "Sabia que esse conteudo ajudou milhares de pessoas?",
  ],
  "video-vertical": [
    "Esse conteudo viralizou essa semana! Quer ver mais como esse?",
    "Esse video tem dicas rapidas e praticas. Curtiu?",
    "Conteudo rapido e direto ao ponto. Quer mais assim?",
  ],
  product: [
    "Esse produto esta entre os mais vendidos! Quer saber mais?",
    "Curiosidade: esse foi o favorito dos clientes esse mes.",
    "Muita gente esta de olho nesse produto. Posso te ajudar?",
  ],
  news: [
    "Essa noticia esta gerando muita repercussao. Quer saber mais?",
    "Esse assunto esta em alta. Posso te contar os detalhes?",
    "Muita gente comentou sobre isso. Quer participar da conversa?",
  ],
  review: [
    "Muitas pessoas tiveram experiencia parecida. Quer ver mais avaliacoes?",
    "Essa avaliacao foi marcada como util por centenas de pessoas.",
    "Os clientes adoram compartilhar suas experiencias. Veja mais!",
  ],
  social: [
    "Esse post ta gerando bastante conversa. O que voce achou?",
    "A comunidade adorou isso. Quer participar tambem?",
    "Esse conteudo teve muito engajamento. Curte?",
  ],
}

interface DynamicContentCardProps {
  post: UniversalPost
  index: number
  brandLogo: string
  brandName?: string
  variant?: "feed" | "drawer"
  showChat?: boolean
  onClick?: () => void
  onAddToCart?: (post: UniversalPost) => void
}

type RenderablePost = UniversalPost & { title: string }

interface DynamicContentCardRenderProps extends Omit<DynamicContentCardProps, "post"> {
  post: RenderablePost
}

function normalizePost(post: UniversalPost): RenderablePost {
  return {
    ...post,
    title: post.title || post.content || "",
    image: post.image || post.media,
  }
}

function renderImage(post: RenderablePost, className: string) {
  if (!post.image) return null

  return <Image src={post.image} alt={post.title} fill className={className} />
}

function FeedChat({
  post,
  index,
  brandLogo,
  showChat,
}: {
  post: RenderablePost
  index: number
  brandLogo: string
  showChat: boolean
}) {
  if (!showChat) return null

  const chatConfig = feedChatMessages[post.type] || feedChatMessages.social

  if (post.type === "video" || post.type === "video-vertical") {
    return (
      <div className="mt-4">
        {index % 3 === 0 ? (
          <SimulatedChat messages={chatConfig.messages} brandLogo={brandLogo} userAvatar={userAvatar} placeholder={chatConfig.placeholder} />
        ) : (
          <SimpleChatInput brandLogo={brandLogo} userAvatar={userAvatar} placeholder={chatConfig.placeholder} />
        )}
      </div>
    )
  }

  if (post.type === "product") {
    return (
      <div className="mt-4">
        <SimulatedChat messages={chatConfig.messages} brandLogo={brandLogo} userAvatar={userAvatar} placeholder={chatConfig.placeholder} />
      </div>
    )
  }

  return (
    <div className="mt-4">
      <SimpleChatInput brandLogo={brandLogo} userAvatar={userAvatar} placeholder={chatConfig.placeholder} />
    </div>
  )
}

function DynamicFeedCard({ post, index, brandLogo, showChat = true, onClick }: DynamicContentCardRenderProps) {
  if (post.type === "video" || post.type === "video-vertical") {
    const isVertical = post.type === "video-vertical"

    return (
      <article className="mb-8">
        <div
          onClick={onClick}
          className={cn(
            "relative rounded-2xl overflow-hidden cursor-pointer group",
            isVertical ? "aspect-[9/16]" : "aspect-video"
          )}
        >
          {renderImage(post, "object-cover")}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-foreground ml-1" />
            </div>
          </div>
          {post.duration && (
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded-md">
              <span className="text-xs text-white font-medium">{post.duration}</span>
            </div>
          )}
        </div>
        <div className="mt-3">
          <h3 className="font-semibold text-foreground text-[15px] line-clamp-2">{post.title}</h3>
          {post.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.description}</p>}
        </div>
        <SocialProof type={post.type} index={index} className="mt-3" />
        <SocialActions />
        <FeedChat post={post} index={index} brandLogo={brandLogo} showChat={showChat} />
      </article>
    )
  }

  if (post.type === "product") {
    const discount = post.originalPrice && post.price ? Math.round((1 - post.price / post.originalPrice) * 100) : 0

    return (
      <article className="mb-8">
        <div onClick={onClick} className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group">
          {renderImage(post, "object-cover group-hover:scale-105 transition-transform duration-300")}
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0">-{discount}%</Badge>
          )}
        </div>
        <div className="mt-3">
          <h3 className="font-semibold text-foreground text-[15px] line-clamp-2">{post.title}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            {post.price !== undefined && (
              <span className="text-lg font-bold text-accent">
                R$ {post.price.toFixed(2).replace(".", ",")}
              </span>
            )}
            {post.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                R$ {post.originalPrice.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>
        </div>
        <SocialProof type="product" index={index} className="mt-3" />
        <SocialActions />
        <FeedChat post={post} index={index} brandLogo={brandLogo} showChat={showChat} />
      </article>
    )
  }

  if (post.type === "news") {
    return (
      <article className="mb-8">
        {post.image && (
          <div onClick={onClick} className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group">
            {renderImage(post, "object-cover")}
            {post.source && (
              <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground border-0">{post.source}</Badge>
            )}
          </div>
        )}
        <div className={post.image ? "mt-3" : "p-4 bg-secondary/50 rounded-2xl"}>
          {!post.image && post.source && (
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium text-accent">{post.source}</span>
            </div>
          )}
          <h3 className="font-semibold text-foreground text-[15px] line-clamp-2">{post.title}</h3>
          {post.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{post.description}</p>}
        </div>
        <SocialProof type="news" index={index} className="mt-3" />
        <SocialActions />
        <FeedChat post={post} index={index} brandLogo={brandLogo} showChat={showChat} />
      </article>
    )
  }

  if (post.type === "review") {
    return (
      <article className="mb-8 p-4 bg-card rounded-2xl border border-border/50">
        <div className="flex items-start gap-3">
          {post.reviewerAvatar && (
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image src={post.reviewerAvatar} alt={post.reviewerName || ""} fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{post.reviewerName}</span>
              {post.rating && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("w-3.5 h-3.5", i < post.rating! ? "fill-yellow-400 text-yellow-400" : "text-border")} />
                  ))}
                </div>
              )}
            </div>
            <p className="text-[15px] text-foreground mt-2">{post.title}</p>
            {post.description && <p className="text-sm text-muted-foreground mt-1">{post.description}</p>}
          </div>
        </div>
        <SocialProof type="review" index={index} className="mt-3" />
        <SocialActions />
        <FeedChat post={post} index={index} brandLogo={brandLogo} showChat={showChat} />
      </article>
    )
  }

  return (
    <article className="mb-8">
      {post.image && (
        <div onClick={onClick} className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer">
          {renderImage(post, "object-cover")}
        </div>
      )}
      <div className="mt-3">
        <p className="text-[15px] text-foreground">{post.title}</p>
        {post.description && <p className="text-sm text-muted-foreground mt-1">{post.description}</p>}
      </div>
      <SocialProof type="social" index={index} className="mt-3" />
      <SocialActions />
      <FeedChat post={post} index={index} brandLogo={brandLogo} showChat={showChat} />
    </article>
  )
}

function DynamicDrawerCard({ post, index, brandLogo, brandName, onAddToCart }: DynamicContentCardRenderProps) {
  const placeholders = drawerInputPlaceholders[post.type] || drawerInputPlaceholders.social
  const placeholder = placeholders[index % placeholders.length]
  const aiMessages = drawerAiInitialMessages[post.type] || drawerAiInitialMessages.social
  const aiMessage = aiMessages[index % aiMessages.length]
  const showConversation = index % 3 === 0

  return (
    <>
      {post.image && (
        <div className={cn(
          "relative overflow-hidden rounded-2xl mb-4",
          post.type === "video-vertical"
            ? "aspect-[9/16] max-h-[500px]"
            : post.type === "video"
              ? "aspect-video"
              : post.type === "product"
                ? "aspect-square"
                : "aspect-video"
        )}>
          {renderImage(post, "object-cover")}

          {(post.type === "video" || post.type === "video-vertical") && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <Play className="w-7 h-7 fill-white text-white ml-1" />
              </div>
            </div>
          )}

          {(post.type === "video" || post.type === "video-vertical") && post.duration && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/80 text-white text-sm rounded-lg font-medium">
              <Play className="w-3 h-3 fill-white" />
              {post.duration}
            </div>
          )}

          {post.type === "product" && post.originalPrice && post.price && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-sm font-bold rounded-lg">
              -{Math.round((1 - post.price / post.originalPrice) * 100)}%
            </div>
          )}

          {post.type === "news" && post.source && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-lg">
              {post.source}
            </div>
          )}
        </div>
      )}

      {post.type === "news" && !post.image && (
        <div className="p-4 bg-secondary/50 rounded-2xl mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Newspaper className="w-4 h-4 text-accent" />
            <span className="text-xs font-medium text-accent">{post.source || brandName}</span>
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight leading-snug">
        {post.title}
      </h3>

      {post.description && (
        <p className="text-[15px] text-muted-foreground mb-4 leading-relaxed">
          {post.description}
        </p>
      )}

      {post.type === "product" && post.price && (
        <div className="mb-4">
          {post.originalPrice && (
            <span className="text-sm text-muted-foreground line-through mr-2">
              R$ {post.originalPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
          <span className="text-xl font-bold text-accent">
            R$ {post.price.toFixed(2).replace(".", ",")}
          </span>
          <span className="text-sm text-muted-foreground ml-2">
            ou 3x de R$ {(post.price / 3).toFixed(2).replace(".", ",")}
          </span>
        </div>
      )}

      {post.type === "review" && post.rating && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-5 h-5",
                  i < post.rating!
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted-foreground/20"
                )}
              />
            ))}
          </div>
          {post.reviewerName && (
            <span className="text-sm text-muted-foreground">
              por {post.reviewerName}
            </span>
          )}
        </div>
      )}

      <SocialProof type={post.type} index={index} />

      <SocialActions variant="drawer" className="mt-3" />

      <div className="mt-4 pt-4 border-t border-border/30">
        {showConversation ? (
          <SimulatedChat
            messages={[{ text: aiMessage, isUser: false }]}
            brandLogo={brandLogo}
            userAvatar={userAvatar}
            placeholder={placeholder}
          />
        ) : (
          <SimpleChatInput
            brandLogo={brandLogo}
            userAvatar={userAvatar}
            placeholder={placeholder}
          />
        )}
      </div>

      {post.type === "product" && (
        <Button
          onClick={() => onAddToCart?.(post)}
          className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-base font-semibold rounded-xl"
        >
          Adicionar ao carrinho
        </Button>
      )}
    </>
  )
}

export function DynamicContentCard(props: DynamicContentCardProps) {
  const post = normalizePost(props.post)

  if (props.variant === "drawer") {
    return <DynamicDrawerCard {...props} post={post} />
  }

  return <DynamicFeedCard {...props} post={post} />
}
