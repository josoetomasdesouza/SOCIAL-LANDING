"use client"

import Image from "next/image"
import { Heart, MessageCircle, Share, Play, Star, Bookmark, Newspaper, Flame, Sparkles, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Post } from "@/lib/types"
import { formatDateShort } from "@/lib/format-date"
import { SimpleChatInput, SimulatedChat } from "./inline-chat"

interface SectionFeedProps {
  posts: Post[]
  brandLogo: string
  onPostClick: (post: Post) => void
}

// Avatares de usuarios para prova social
const socialAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
]

// Nomes para prova social
const socialNames = ["Ana", "Julia", "Mariana", "Carla", "Fernanda", "Beatriz", "Camila", "Patricia", "Lucia", "Amanda"]

// Prova social CONTEXTUAL por tipo de conteudo
const contextualSocialProof: Record<string, string[]> = {
  video: [
    "assistindo agora",
    "salvaram para ver depois",
    "compartilharam com amigas",
    "ja assistiram esse tutorial",
    "marcaram nos comentarios",
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

// Componente de Avatares Agrupados + Prova Social
function SocialProofWithAvatars({ type, index }: { type: string; index: number }) {
  const messages = contextualSocialProof[type] || contextualSocialProof.social
  const message = messages[index % messages.length]
  const name1 = socialNames[index % socialNames.length]
  const name2 = socialNames[(index + 3) % socialNames.length]
  
  // Seleciona 3 avatares diferentes baseado no index
  const avatarIndexes = [(index * 2) % 5, (index * 2 + 1) % 5, (index * 2 + 2) % 5]
  
  return (
    <div className="flex items-center gap-2.5 mt-3">
      {/* Avatares agrupados */}
      <div className="flex -space-x-2">
        {avatarIndexes.map((avatarIdx, i) => (
          <div 
            key={i}
            className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-background shadow-sm"
          >
            <Image 
              src={socialAvatars[avatarIdx]} 
              alt="" 
              fill 
              className="object-cover"
            />
          </div>
        ))}
      </div>
      
      {/* Mensagem contextual */}
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

// Input placeholders contextuais
const inputPlaceholders: Record<string, string[]> = {
  video: ["vale a pena assistir?", "tem mais videos assim?", "gostei, quero ver mais"],
  product: ["esse e bom pra pele seca?", "qual a diferenca desse?", "vale a pena pra mim?", "tem em outra cor?"],
  news: ["onde posso ler mais?", "tem mais sobre isso?", "interessante, conta mais"],
  review: ["posso confiar nessa avaliacao?", "tem mais avaliacoes?", "quero ver outras opinioes"],
  social: ["quero saber mais!", "como participo?", "adorei, tem mais?"],
}

const getPlaceholder = (type: string, index: number) => {
  const placeholders = inputPlaceholders[type] || inputPlaceholders.social
  return placeholders[index % placeholders.length]
}

// Conversas simuladas MELHORADAS - com curiosidades e perguntas instigantes
const simulatedConversations: Record<string, { messages: { text: string; isUser: boolean }[]; placeholder: string }[]> = {
  product: [
    {
      messages: [
        { text: "Curiosidade: esse hidratante tem extrato de castanha da Amazonia, um ingrediente que so existe aqui. Ele foi o mais vendido do mes passado. Quer saber por que?", isUser: false },
        { text: "Quero sim!", isUser: true },
        { text: "A castanha amazonica tem propriedades que ajudam a rejuvenescer a pele em ate 40%. Posso te contar mais sobre como ele funciona?", isUser: false },
      ],
      placeholder: "sim, me conta..."
    },
    {
      messages: [
        { text: "Sabia que esse perfume foi inspirado na flora brasileira? Ele tem notas de priprioca, uma raiz da Amazonia que da um toque unico. Voce gosta de fragancias mais frescas ou intensas?", isUser: false },
        { text: "Gosto mais de frescas", isUser: true },
        { text: "Esse e perfeito entao! E fresco mas duradouro, ideal pra usar no dia a dia. Quer experimentar?", isUser: false },
      ],
      placeholder: "quero experimentar..."
    },
    {
      messages: [
        { text: "Esse batom e feito com cera de abelha brasileira, super hidratante. A cor Vermelho Natura e a mais pedida pelas clientes. Qual seu tom de pele?", isUser: false },
      ],
      placeholder: "meu tom e..."
    }
  ],
  video: [
    {
      messages: [
        { text: "Esse video mostra um truque de skincare que poucas pessoas conhecem. Ja pensou em incluir uma mascara de argila na sua rotina?", isUser: false },
        { text: "Nunca usei mascara de argila", isUser: true },
        { text: "Vale experimentar! A argila verde e otima pra pele oleosa, e a branca pra sensivel. Posso indicar a melhor pra voce?", isUser: false },
      ],
      placeholder: "indica pra mim..."
    },
    {
      messages: [
        { text: "Sabia que a rotina de skincare mostrada aqui usa apenas 3 produtos? Menos e mais quando se trata de cuidados com a pele. Qual sua maior duvida sobre skincare?", isUser: false },
      ],
      placeholder: "minha duvida e..."
    }
  ],
  news: [
    {
      messages: [
        { text: "Essa noticia mostra um projeto que impacta mais de 2 mil familias ribeirinhas. A Natura trabalha com comunidades locais ha mais de 20 anos. Quer conhecer outras iniciativas?", isUser: false },
      ],
      placeholder: "quero conhecer..."
    },
    {
      messages: [
        { text: "Voce sabia que a Natura planta 1 arvore a cada produto vendido da linha Ekos? Ja sao mais de 40 milhoes de arvores. O que achou dessa iniciativa?", isUser: false },
      ],
      placeholder: "achei incrivel..."
    }
  ]
}

const getSimulatedConversation = (type: string, index: number) => {
  const conversations = simulatedConversations[type]
  if (!conversations || conversations.length === 0) return null
  return conversations[index % conversations.length]
}

// Section Header
function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <h2 className="font-semibold text-foreground text-base tracking-tight">{title}</h2>
    </div>
  )
}

// Social Actions - Botoes de interacao
function SocialActions({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all duration-200 active:scale-90">
        <Heart className="w-[22px] h-[22px]" />
      </button>
      <button className="p-2 hover:bg-accent/10 hover:text-accent rounded-full transition-all duration-200 active:scale-90">
        <MessageCircle className="w-[22px] h-[22px]" />
      </button>
      <button className="p-2 hover:bg-accent/10 hover:text-accent rounded-full transition-all duration-200 active:scale-90">
        <Share className="w-[22px] h-[22px]" />
      </button>
      <button className="p-2 hover:bg-accent/10 hover:text-accent rounded-full transition-all duration-200 ml-auto active:scale-90">
        <Bookmark className="w-[22px] h-[22px]" />
      </button>
    </div>
  )
}

// =============================================================================
// CARDS - Sequencia padronizada:
// 1. Midia (imagem/video)
// 2. Titulo (se tiver)
// 3. Descricao (se tiver)
// 4. Prova social de interacoes (com avatares)
// 5. Botoes de interacao
// 6. Conversa com IA (opcional)
// =============================================================================

// Video Horizontal Card (YouTube style)
function VideoHorizontalCard({ post, index, brandLogo, showConversation, onClick }: { post: Post; index: number; brandLogo: string; showConversation?: boolean; onClick: () => void }) {
  const conversation = showConversation ? getSimulatedConversation("video", index) : null
  
  return (
    <article className="mb-8">
      {/* 1. MIDIA */}
      <div 
        className="group cursor-pointer"
        onClick={onClick}
      >
        <div className="relative aspect-video overflow-hidden rounded-2xl shadow-sm">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-10 rounded-xl bg-black/70 backdrop-blur-sm flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-lg">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>

          {/* Duration - DENTRO do video no cantinho */}
          {post.duration && (
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 text-white text-xs rounded-lg font-medium shadow-sm">
              {post.duration}
            </div>
          )}
        </div>
      </div>

      {/* 2. TITULO */}
      <div className="mt-4">
        <h3 className="font-semibold text-foreground text-[15px] line-clamp-2 leading-snug tracking-tight">
          {post.title}
        </h3>
      </div>

      {/* 3. DESCRICAO (se tiver) */}
      {post.description && (
        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
          {post.description}
        </p>
      )}

      {/* 4. PROVA SOCIAL COM AVATARES */}
      <SocialProofWithAvatars type="video" index={index} />

      {/* 5. BOTOES DE INTERACAO */}
      <SocialActions className="mt-2" />

      {/* 6. CONVERSA COM IA */}
      {conversation ? (
        <SimulatedChat 
          brandLogo={brandLogo} 
          messages={conversation.messages} 
          placeholder={conversation.placeholder}
        />
      ) : (
        <SimpleChatInput placeholder={getPlaceholder("video", index)} />
      )}
    </article>
  )
}

// Video Vertical Card (TikTok style)
function VideoVerticalCard({ post, index, brandLogo, showConversation, onClick }: { post: Post; index: number; brandLogo: string; showConversation?: boolean; onClick: () => void }) {
  const conversation = showConversation ? getSimulatedConversation("video", index) : null
  
  return (
    <article className="mb-8">
      {/* 1. MIDIA */}
      <div 
        className="group cursor-pointer"
        onClick={onClick}
      >
        <div className="relative aspect-[9/16] overflow-hidden rounded-2xl max-h-[520px] shadow-sm">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
          />
          
          {/* Play central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </div>

          {/* Duration - DENTRO do video no cantinho inferior direito */}
          {post.duration && (
            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 text-white text-xs rounded-lg font-medium shadow-sm flex items-center gap-1">
              <Play className="w-3 h-3 fill-white" />
              {post.duration}
            </div>
          )}
        </div>
      </div>

      {/* 2. TITULO */}
      <div className="mt-4">
        <h3 className="font-semibold text-foreground text-[15px] line-clamp-2 tracking-tight">
          {post.title}
        </h3>
      </div>

      {/* 3. DESCRICAO (se tiver) */}
      {post.description && (
        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
          {post.description}
        </p>
      )}

      {/* 4. PROVA SOCIAL COM AVATARES */}
      <SocialProofWithAvatars type="video" index={index} />

      {/* 5. BOTOES DE INTERACAO */}
      <SocialActions className="mt-2" />

      {/* 6. CONVERSA COM IA */}
      {conversation ? (
        <SimulatedChat 
          brandLogo={brandLogo} 
          messages={conversation.messages} 
          placeholder={conversation.placeholder}
        />
      ) : (
        <SimpleChatInput placeholder={getPlaceholder("video", index)} />
      )}
    </article>
  )
}

// Product Card
function ProductCard({ post, index, brandLogo, showConversation, onClick }: { post: Post; index: number; brandLogo: string; showConversation?: boolean; onClick: () => void }) {
  const conversation = showConversation ? getSimulatedConversation("product", index) : null
  
  return (
    <article className="mb-8">
      {/* 1. MIDIA */}
      <div 
        className="group cursor-pointer"
        onClick={onClick}
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary/30 shadow-sm">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
          
          {/* Discount Badge - DENTRO da midia */}
          {post.originalPrice && post.price && (
            <Badge className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold border-0 shadow-sm px-2.5 py-1">
              -{Math.round((1 - post.price / post.originalPrice) * 100)}%
            </Badge>
          )}
        </div>
      </div>

      {/* 2. TITULO */}
      <div className="mt-4">
        <h3 className="font-semibold text-foreground text-[15px] line-clamp-2 leading-snug tracking-tight">
          {post.title}
        </h3>
      </div>

      {/* 3. DESCRICAO (preco no caso de produto) */}
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-xl font-bold text-foreground">
          R$ {post.price?.toFixed(2).replace(".", ",")}
        </span>
        {post.originalPrice && (
          <span className="text-sm text-muted-foreground line-through">
            R$ {post.originalPrice.toFixed(2).replace(".", ",")}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        ou 3x de R$ {((post.price || 0) / 3).toFixed(2).replace(".", ",")}
      </p>

      {/* 4. PROVA SOCIAL COM AVATARES */}
      <SocialProofWithAvatars type="product" index={index} />

      {/* 5. BOTOES DE INTERACAO */}
      <SocialActions className="mt-2" />

      {/* 6. CONVERSA COM IA */}
      {conversation ? (
        <SimulatedChat 
          brandLogo={brandLogo} 
          messages={conversation.messages} 
          placeholder={conversation.placeholder}
        />
      ) : (
        <SimpleChatInput placeholder={getPlaceholder("product", index)} />
      )}
    </article>
  )
}

// News Card with Image
function NewsImageCard({ post, index, brandLogo, showConversation, onClick }: { post: Post; index: number; brandLogo: string; showConversation?: boolean; onClick: () => void }) {
  const conversation = showConversation ? getSimulatedConversation("news", index) : null
  
  return (
    <article className="mb-8">
      {/* 1. MIDIA */}
      <div 
        className="group cursor-pointer"
        onClick={onClick}
      >
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-sm">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
          
          {/* Source badge - DENTRO da midia */}
          {post.source && (
            <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full shadow-sm">
              <span className="text-white text-xs font-medium">{post.source}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. TITULO */}
      <div className="mt-4">
        <h3 className="font-semibold text-foreground text-[15px] line-clamp-2 group-hover:text-accent transition-colors leading-snug tracking-tight">
          {post.title}
        </h3>
      </div>

      {/* 3. DESCRICAO */}
      <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
        {post.description}
      </p>

      {/* 4. PROVA SOCIAL COM AVATARES */}
      <SocialProofWithAvatars type="news" index={index} />

      {/* 5. BOTOES DE INTERACAO */}
      <SocialActions className="mt-2" />

      {/* 6. CONVERSA COM IA */}
      {conversation ? (
        <SimulatedChat 
          brandLogo={brandLogo} 
          messages={conversation.messages} 
          placeholder={conversation.placeholder}
        />
      ) : (
        <SimpleChatInput placeholder={getPlaceholder("news", index)} />
      )}
    </article>
  )
}

// News Card without Image
function NewsTextCard({ post, index, brandLogo, showConversation, onClick }: { post: Post; index: number; brandLogo: string; showConversation?: boolean; onClick: () => void }) {
  const conversation = showConversation ? getSimulatedConversation("news", index) : null
  
  return (
    <article className="mb-8">
      <div 
        className="group cursor-pointer p-5 rounded-2xl bg-secondary/40 hover:bg-secondary/60 transition-all duration-200 shadow-sm"
        onClick={onClick}
      >
        {/* Source */}
        {post.source && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
              <Newspaper className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              {post.source}
            </span>
          </div>
        )}

        {/* 2. TITULO */}
        <h3 className="font-semibold text-foreground text-[15px] leading-snug group-hover:text-accent transition-colors tracking-tight">
          {post.title}
        </h3>

        {/* 3. DESCRICAO */}
        <p className="text-sm text-muted-foreground mt-2.5 line-clamp-3 leading-relaxed">
          {post.description}
        </p>

        {/* 4. PROVA SOCIAL COM AVATARES */}
        <SocialProofWithAvatars type="news" index={index} />

        {/* 5. BOTOES DE INTERACAO */}
        <SocialActions className="pt-4 border-t border-border/30 mt-4" />
      </div>

      {/* 6. CONVERSA COM IA */}
      {conversation ? (
        <SimulatedChat 
          brandLogo={brandLogo} 
          messages={conversation.messages} 
          placeholder={conversation.placeholder}
        />
      ) : (
        <SimpleChatInput placeholder={getPlaceholder("news", index)} />
      )}
    </article>
  )
}

// Review Card
function ReviewCard({ post, index, brandLogo, onClick }: { post: Post; index: number; brandLogo: string; onClick: () => void }) {
  return (
    <article className="mb-8">
      <div 
        className="group cursor-pointer p-5 rounded-2xl border border-border/50 hover:border-border hover:shadow-sm transition-all duration-200"
        onClick={onClick}
      >
        {/* Header com avatar do reviewer */}
        <div className="flex items-start gap-3.5">
          {post.author && (
            <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-secondary shadow-sm ring-2 ring-border/30">
              <Image src={post.author.avatar} alt={post.author.name} fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-sm">
                {post.author?.name || post.reviewerName}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDateShort(post.date)}
              </span>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-0.5 mt-1.5">
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

        {/* 3. DESCRICAO (review text) */}
        <p className="text-sm text-muted-foreground mt-4 line-clamp-4 leading-relaxed">
          &ldquo;{post.description}&rdquo;
        </p>

        {/* 4. PROVA SOCIAL COM AVATARES */}
        <SocialProofWithAvatars type="review" index={index} />

        {/* 5. BOTOES DE INTERACAO */}
        <SocialActions className="pt-4 border-t border-border/30 mt-4" />
      </div>

      {/* 6. CONVERSA COM IA */}
      <SimpleChatInput placeholder={getPlaceholder("review", index)} />
    </article>
  )
}

// Social Card (Instagram style)
function SocialCard({ post, index, brandLogo, onClick }: { post: Post; index: number; brandLogo: string; onClick: () => void }) {
  return (
    <article className="mb-8">
      {/* 1. MIDIA */}
      <div 
        className="group cursor-pointer"
        onClick={onClick}
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl shadow-sm">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      </div>

      {/* 2. TITULO */}
      {post.title && (
        <div className="mt-4">
          <h3 className="font-semibold text-foreground text-[15px] line-clamp-2 leading-snug tracking-tight">
            {post.title}
          </h3>
        </div>
      )}

      {/* 3. DESCRICAO */}
      <p className="text-sm text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
        {post.description}
      </p>

      {/* 4. PROVA SOCIAL COM AVATARES */}
      <SocialProofWithAvatars type="social" index={index} />

      {/* 5. BOTOES DE INTERACAO */}
      <SocialActions className="mt-2" />

      {/* 6. CONVERSA COM IA */}
      <SimpleChatInput placeholder={getPlaceholder("social", index)} />
    </article>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SectionFeed({ posts, brandLogo, onPostClick }: SectionFeedProps) {
  // Organiza os posts por categoria
  const videoHorizontal = posts.filter(p => p.type === "video" && !p.isVertical)
  const videoVertical = posts.filter(p => p.type === "video" && p.isVertical)
  const products = posts.filter(p => p.type === "product")
  const newsWithImage = posts.filter(p => p.type === "news" && p.hasImage !== false && p.image)
  const newsWithoutImage = posts.filter(p => p.type === "news" && (p.hasImage === false || !p.image))
  const reviews = posts.filter(p => p.type === "review")
  const social = posts.filter(p => p.type === "social")

  return (
    <div className="space-y-10 px-4 sm:px-5 py-6">
      {/* Secao: Mais vistos hoje (video horizontal) */}
      {videoHorizontal.length > 0 && (
        <section id="section-videos">
          <SectionHeader icon={Flame} title="Mais vistos hoje" />
          {videoHorizontal.slice(0, 2).map((post, index) => (
            <VideoHorizontalCard 
              key={post.id} 
              post={post} 
              index={index} 
              brandLogo={brandLogo}
              showConversation={index === 0}
              onClick={() => onPostClick(post)}
            />
          ))}
        </section>
      )}

      {/* Secao: Para um mundo melhor (noticias) */}
      {(newsWithImage.length > 0 || newsWithoutImage.length > 0) && (
        <section id="section-noticias">
          <SectionHeader icon={Globe} title="Para um mundo melhor" />
          {newsWithoutImage.slice(0, 1).map((post, index) => (
            <NewsTextCard 
              key={post.id} 
              post={post} 
              index={index} 
              brandLogo={brandLogo}
              showConversation={index === 0}
              onClick={() => onPostClick(post)}
            />
          ))}
          {newsWithImage.slice(0, 1).map((post, index) => (
            <NewsImageCard 
              key={post.id} 
              post={post} 
              index={index} 
              brandLogo={brandLogo}
              showConversation
              onClick={() => onPostClick(post)}
            />
          ))}
        </section>
      )}

      {/* Secao: Tendencia em perfumaria (produtos) */}
      {products.length > 0 && (
        <section id="section-produtos">
          <SectionHeader icon={Sparkles} title="Tendencia em perfumaria" />
          {products.slice(0, 2).map((post, index) => (
            <ProductCard 
              key={post.id} 
              post={post} 
              index={index} 
              brandLogo={brandLogo}
              showConversation={index === 0}
              onClick={() => onPostClick(post)}
            />
          ))}
        </section>
      )}

      {/* Secao: Shorts (video vertical) */}
      {videoVertical.length > 0 && (
        <section id="section-shorts">
          <SectionHeader icon={Play} title="Em alta agora" />
          {videoVertical.slice(0, 2).map((post, index) => (
            <VideoVerticalCard 
              key={post.id} 
              post={post} 
              index={index} 
              brandLogo={brandLogo}
              showConversation={index === 0}
              onClick={() => onPostClick(post)}
            />
          ))}
        </section>
      )}

      {/* Secao: O que estao dizendo (reviews) */}
      {reviews.length > 0 && (
        <section id="section-avaliacoes">
          <SectionHeader icon={Star} title="O que estao dizendo" />
          {reviews.slice(0, 3).map((post, index) => (
            <ReviewCard 
              key={post.id} 
              post={post} 
              index={index} 
              brandLogo={brandLogo}
              onClick={() => onPostClick(post)}
            />
          ))}
        </section>
      )}

      {/* Secao: Da comunidade (social) */}
      {social.length > 0 && (
        <section id="section-social">
          <SectionHeader icon={Heart} title="Da comunidade" />
          {social.slice(0, 2).map((post, index) => (
            <SocialCard 
              key={post.id} 
              post={post} 
              index={index} 
              brandLogo={brandLogo}
              onClick={() => onPostClick(post)}
            />
          ))}
        </section>
      )}

      {/* Mais produtos */}
      {products.length > 2 && (
        <section>
          <SectionHeader icon={Sparkles} title="Voce tambem pode gostar" />
          {products.slice(2, 4).map((post, index) => (
            <ProductCard 
              key={post.id} 
              post={post} 
              index={index + 2} 
              brandLogo={brandLogo}
              showConversation={index === 0}
              onClick={() => onPostClick(post)}
            />
          ))}
        </section>
      )}

      {/* Mais noticias */}
      {newsWithImage.length > 1 && (
        <section>
          <SectionHeader icon={Newspaper} title="Na midia" />
          {newsWithImage.slice(1, 3).map((post, index) => (
            <NewsImageCard 
              key={post.id} 
              post={post} 
              index={index + 1} 
              brandLogo={brandLogo}
              onClick={() => onPostClick(post)}
            />
          ))}
        </section>
      )}
    </div>
  )
}
