"use client"

import { useMemo } from "react"
import Image from "next/image"
import { 
  Search, ShoppingBag, Phone, MessageCircle, Heart, Share2, Bookmark,
  Play, ChevronRight, Star, Target, Eye, Loader2, MapPin, Clock,
  Truck, Tag, CreditCard, Shield, ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { mergeWithMock, MOCK_SECTIONS } from "./mock-data"

// ========================================
// TIPOS
// ========================================
interface LivePreviewProps {
  data: {
    name?: string
    category?: string
    description?: string
    whatsapp?: string
    instagram?: string
    email?: string
    logo?: string
    cover?: string
  }
  isLoading?: boolean
  loadingStep?: string
  className?: string
}

// Badge para dados mock
function MockBadge() {
  return (
    <span className="inline-flex items-center px-1 py-0.5 rounded text-[8px] font-medium bg-amber-100 text-amber-700 ml-1">
      Exemplo
    </span>
  )
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export function LivePreview({ data, isLoading, loadingStep, className = "" }: LivePreviewProps) {
  const categoryKey = data.category || "institutional"
  
  // Mescla dados do usuario com mock
  const merged = useMemo(() => mergeWithMock(data, categoryKey), [data, categoryKey])
  const { config, stories, posts, sections, isMock } = merged
  const brandColor = config.brandColor

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("relative bg-background rounded-[2.5rem] border-[8px] border-foreground/10 shadow-2xl overflow-hidden", className)}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground/10 rounded-b-xl z-50" />
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: brandColor }} />
            <p className="text-sm text-muted-foreground">{loadingStep || "Gerando preview..."}</p>
          </div>
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/20 rounded-full" />
      </div>
    )
  }

  return (
    <div className={cn("relative bg-background rounded-[2.5rem] border-[8px] border-foreground/10 shadow-2xl overflow-hidden", className)}>
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground/10 rounded-b-xl z-50" />
      
      {/* Conteudo */}
      <div className="h-full overflow-y-auto scrollbar-hide pt-6">
        
        {/* HEADER */}
        <header className="bg-background border-b border-border/50 px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2" style={{ ['--tw-ring-color' as any]: brandColor }}>
                <Image src={config.logo} alt={config.name} fill className="object-cover" />
              </div>
              <div className="max-w-[150px]">
                <div className="flex items-center">
                  <h1 className="font-semibold text-foreground text-sm leading-tight truncate">{config.name}</h1>
                  {isMock.name && <MockBadge />}
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{config.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-secondary rounded-full">
                <Search className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-secondary rounded-full">
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* STORIES */}
        <section className="py-3 border-b border-border/50 bg-background">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide px-3">
            {stories.map((story, index) => (
              <div key={story.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={cn(
                  "relative w-14 h-14 rounded-full p-[2px]",
                  index === 0 ? "bg-gradient-to-br" : "bg-border/50"
                )} style={index === 0 ? { background: `linear-gradient(135deg, ${brandColor}, ${brandColor}80)` } : {}}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-background p-[1px]">
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      <Image src={story.image} alt={story.label} fill className="object-cover" />
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{story.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SEARCH BAR */}
        <div className="px-3 py-3 bg-background">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder={`Buscar em ${config.name}...`}
              className="w-full h-9 pl-9 pr-4 rounded-full bg-secondary/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none"
              readOnly
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        {(config.phone || config.instagram) && (
          <div className="px-3 pb-3 flex gap-2">
            {config.phone && (
              <button 
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-full text-white text-sm font-medium"
                style={{ backgroundColor: brandColor }}
              >
                <Phone className="w-4 h-4" />
                WhatsApp
              </button>
            )}
            {config.instagram && (
              <button className="flex-1 flex items-center justify-center gap-2 h-10 rounded-full border border-border text-sm font-medium">
                Instagram
              </button>
            )}
          </div>
        )}

        {/* SECTIONS */}
        <div className="space-y-4 pb-6">
          {sections.map((section: any) => (
            <Section key={section.id} section={section} brandColor={brandColor} isMock={!data.name} />
          ))}

          {/* POSTS (conteudo) */}
          <div className="px-3 space-y-3">
            {posts.slice(0, 3).map((post: any) => (
              <PostCard key={post.id} post={post} brandColor={brandColor} />
            ))}
          </div>

          {/* CONTACT */}
          <section className="px-3">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" style={{ color: brandColor }} />
              Contato
            </h3>
            <div className="bg-secondary/30 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-muted-foreground" />
                <span>{config.phone}</span>
                {isMock.phone && <MockBadge />}
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3 h-3 text-muted-foreground" />
                <span>{config.email}</span>
                {isMock.email && <MockBadge />}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span>{config.address}</span>
                {isMock.address && <MockBadge />}
              </div>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="border-t border-border/50 py-4 text-center">
          <p className="text-[10px] text-muted-foreground">Feito com Social Landing</p>
        </footer>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/20 rounded-full" />
    </div>
  )
}

// ========================================
// SECTION COMPONENT
// ========================================
function Section({ section, brandColor, isMock }: { section: any; brandColor: string; isMock: boolean }) {
  const renderContent = () => {
    switch (section.type) {
      case "about":
        return (
          <div className="bg-secondary/30 rounded-xl p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">{section.content}</p>
            {section.buttons && (
              <div className="flex gap-2 mt-3">
                {section.buttons.map((btn: string, i: number) => (
                  <button 
                    key={i}
                    className={cn(
                      "flex-1 h-8 rounded-full text-xs font-medium",
                      i === 0 ? "text-white" : "border border-border"
                    )}
                    style={i === 0 ? { backgroundColor: brandColor } : {}}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            )}
            {isMock && <div className="mt-2 flex justify-end"><MockBadge /></div>}
          </div>
        )

      case "pillars":
        return (
          <div className="grid grid-cols-3 gap-2">
            {section.items?.map((item: any) => (
              <div key={item.id} className="bg-secondary/30 rounded-xl p-2 text-center">
                <div 
                  className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  {item.icon === "target" && <Target className="w-4 h-4" style={{ color: item.color }} />}
                  {item.icon === "eye" && <Eye className="w-4 h-4" style={{ color: item.color }} />}
                  {item.icon === "heart" && <Heart className="w-4 h-4" style={{ color: item.color }} />}
                </div>
                <h4 className="text-[10px] font-semibold">{item.title}</h4>
                <p className="text-[8px] text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
              </div>
            ))}
          </div>
        )

      case "metrics":
        return (
          <div className="grid grid-cols-2 gap-2">
            {section.items?.slice(0, 4).map((item: any) => (
              <div key={item.id} className="bg-secondary/30 rounded-xl p-3 text-center">
                <span className="text-lg font-bold" style={{ color: brandColor }}>{item.value}</span>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        )

      case "team":
        return (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {section.items?.map((member: any) => (
              <div key={member.id} className="flex-shrink-0 text-center w-16">
                <div className="relative w-14 h-14 rounded-full overflow-hidden mx-auto ring-2 ring-border/50">
                  <Image src={member.image} alt={member.name} fill className="object-cover" />
                </div>
                <p className="text-[10px] font-medium mt-1 truncate">{member.name}</p>
                <p className="text-[8px] text-muted-foreground truncate">{member.role}</p>
              </div>
            ))}
          </div>
        )

      case "products":
        return (
          <div className="space-y-2">
            {section.items?.slice(0, 3).map((product: any) => (
              <div key={product.id} className="flex gap-3 bg-secondary/30 rounded-xl p-2">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                  {product.badge && (
                    <span className="absolute top-1 left-1 px-1 py-0.5 rounded text-[8px] font-medium bg-red-500 text-white">
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold truncate">{product.name}</h4>
                  <p className="text-[10px] text-muted-foreground truncate">{product.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold" style={{ color: brandColor }}>{product.price}</span>
                    {product.oldPrice && (
                      <span className="text-[10px] text-muted-foreground line-through">{product.oldPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case "categories":
        return (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {section.items?.map((cat: any) => (
              <button 
                key={cat.id} 
                className="flex-shrink-0 px-3 py-2 rounded-full bg-secondary/50 border border-border/50 text-xs"
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        )

      case "info":
        return (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {section.items?.map((info: any, i: number) => (
              <div key={i} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-secondary/30 text-[10px]">
                {info.icon === "truck" && <Truck className="w-3 h-3" style={{ color: brandColor }} />}
                {info.icon === "tag" && <Tag className="w-3 h-3" style={{ color: brandColor }} />}
                {info.icon === "clock" && <Clock className="w-3 h-3" style={{ color: brandColor }} />}
                {info.icon === "shield" && <Shield className="w-3 h-3" style={{ color: brandColor }} />}
                {info.icon === "credit-card" && <CreditCard className="w-3 h-3" style={{ color: brandColor }} />}
                <span>{info.label}</span>
              </div>
            ))}
          </div>
        )

      case "links":
        return (
          <div className="space-y-2">
            {section.items?.map((link: any) => (
              <button 
                key={link.id}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <span className="text-xs font-medium">{link.label}</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )

      case "faq":
        return (
          <div className="space-y-2">
            {section.items?.slice(0, 2).map((faq: any) => (
              <div key={faq.id} className="bg-secondary/30 rounded-xl p-3">
                <h4 className="text-xs font-semibold flex items-center justify-between">
                  {faq.question}
                  <ChevronRight className="w-4 h-4" />
                </h4>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <section className="px-3">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
        {section.title}
        {isMock && <MockBadge />}
      </h3>
      {renderContent()}
    </section>
  )
}

// ========================================
// POST CARD
// ========================================
function PostCard({ post, brandColor }: { post: any; brandColor: string }) {
  return (
    <div className="bg-secondary/20 rounded-xl overflow-hidden border border-border/50">
      {/* Image */}
      <div className="relative aspect-video">
        <Image src={post.image} alt={post.title} fill className="object-cover" />
        {post.type === "video" && (
          <>
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-5 h-5 text-foreground ml-0.5" />
              </div>
            </div>
            {post.duration && (
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px]">
                {post.duration}
              </span>
            )}
          </>
        )}
        {post.discount && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-red-500 text-white text-[10px] font-medium">
            -{post.discount}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="text-xs font-semibold">{post.title}</h4>
        {post.description && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{post.description}</p>
        )}
        
        {/* Price */}
        {post.price && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-bold" style={{ color: brandColor }}>{post.price}</span>
            {post.oldPrice && (
              <span className="text-[10px] text-muted-foreground line-through">{post.oldPrice}</span>
            )}
          </div>
        )}

        {/* Review */}
        {post.type === "review" && (
          <div className="flex items-center gap-2 mt-2">
            <div className="relative w-6 h-6 rounded-full overflow-hidden">
              <Image src={post.image} alt={post.author || ""} fill className="object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-medium">{post.author}</p>
              <div className="flex">
                {Array(post.rating || 5).fill(0).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Social Proof */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
          <div className="flex -space-x-1">
            {[1,2,3].map(i => (
              <div key={i} className="w-5 h-5 rounded-full bg-secondary border border-background" />
            ))}
          </div>
          <span className="text-[9px] text-muted-foreground">Ana e outros curtiram</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
          <div className="flex gap-3">
            <Heart className="w-4 h-4 text-muted-foreground" />
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            <Share2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <Bookmark className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}

export { LivePreview as default }
