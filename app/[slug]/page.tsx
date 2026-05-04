"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useMemo, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  Phone, Mail, Instagram, MapPin, Clock, Star, 
  MessageCircle, Share2, Heart, ArrowLeft, Edit,
  ExternalLink, ChevronRight, Loader2
} from "lucide-react"

// Dados mockados - em producao viriam do banco
const MOCK_LANDINGS: Record<string, {
  name: string
  category: string
  description: string
  logo?: string
  cover?: string
  color: string
  whatsapp?: string
  instagram?: string
  email?: string
  address?: string
  hours?: string
  rating?: number
  reviews?: number
}> = {
  "cafe-do-joao": {
    name: "Cafe do Joao",
    category: "restaurant",
    description: "Cafe artesanal torrado na hora, ambiente acolhedor no coracao da cidade. Servimos os melhores graos selecionados desde 2010.",
    cover: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=400&fit=crop",
    color: "#8B4513",
    whatsapp: "(11) 99999-9999",
    instagram: "@cafedojoao",
    email: "contato@cafedojoao.com.br",
    address: "Rua das Flores, 123 - Centro",
    hours: "Seg-Sex: 7h-19h | Sab: 8h-14h",
    rating: 4.8,
    reviews: 247
  }
}

function SlugContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string

  // Busca dados da landing (em producao, seria uma API call)
  // Por enquanto, tenta ler da URL ou usa mock
  const landing = useMemo(() => {
    // Verifica se tem dados na URL (vindos do editor/chat)
    const urlName = searchParams.get("name")
    if (urlName) {
      return {
        name: urlName,
        category: searchParams.get("category") || "institutional",
        description: searchParams.get("description") || "",
        color: "#10b981",
        whatsapp: searchParams.get("whatsapp") || undefined,
        instagram: searchParams.get("instagram") || undefined,
      }
    }
    
    // Fallback para mock ou dados gerados
    return MOCK_LANDINGS[slug] || {
      name: slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      category: "institutional",
      description: "Bem-vindo a nossa pagina! Estamos construindo algo incrivel.",
      color: "#10b981",
    }
  }, [slug, searchParams])

  const brandColor = landing.color

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-xl border-b border-border/50"
        style={{ backgroundColor: `${brandColor}10` }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: brandColor }}
            >
              {landing.name.charAt(0)}
            </div>
            <span className="font-semibold">{landing.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/criar/editor?slug=${slug}`}>
                <Edit className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Cover */}
      {landing.cover && (
        <div className="relative h-48 w-full">
          <Image
            src={landing.cover}
            alt={landing.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 pb-8">
        {/* Profile Section */}
        <div className={`${landing.cover ? "-mt-16" : "mt-6"} relative z-10`}>
          <div 
            className="w-24 h-24 rounded-full border-4 border-background flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-lg"
            style={{ backgroundColor: brandColor }}
          >
            {landing.name.charAt(0)}
          </div>
          
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold">{landing.name}</h1>
            
            {landing.rating && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{landing.rating}</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  ({landing.reviews} avaliacoes)
                </span>
              </div>
            )}
            
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              {landing.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {landing.whatsapp && (
            <Button 
              className="flex-1 h-12"
              style={{ backgroundColor: brandColor }}
              asChild
            >
              <a href={`https://wa.me/55${landing.whatsapp.replace(/\D/g, "")}`} target="_blank">
                <Phone className="w-5 h-5 mr-2" />
                WhatsApp
              </a>
            </Button>
          )}
          {landing.instagram && (
            <Button variant="outline" className="flex-1 h-12" asChild>
              <a href={`https://instagram.com/${landing.instagram.replace("@", "")}`} target="_blank">
                <Instagram className="w-5 h-5 mr-2" />
                Instagram
              </a>
            </Button>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-6 space-y-3">
          {landing.hours && (
            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${brandColor}20` }}
              >
                <Clock className="w-5 h-5" style={{ color: brandColor }} />
              </div>
              <div>
                <p className="font-medium text-sm">Horario de Funcionamento</p>
                <p className="text-muted-foreground text-sm">{landing.hours}</p>
              </div>
            </div>
          )}

          {landing.address && (
            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${brandColor}20` }}
              >
                <MapPin className="w-5 h-5" style={{ color: brandColor }} />
              </div>
              <div>
                <p className="font-medium text-sm">Endereco</p>
                <p className="text-muted-foreground text-sm">{landing.address}</p>
              </div>
            </div>
          )}

          {landing.email && (
            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${brandColor}20` }}
              >
                <Mail className="w-5 h-5" style={{ color: brandColor }} />
              </div>
              <div>
                <p className="font-medium text-sm">E-mail</p>
                <p className="text-muted-foreground text-sm">{landing.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div 
          className="mt-8 p-6 rounded-2xl text-center"
          style={{ backgroundColor: `${brandColor}10` }}
        >
          <MessageCircle className="w-10 h-10 mx-auto mb-3" style={{ color: brandColor }} />
          <h3 className="font-semibold mb-2">Fale conosco</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Tire suas duvidas ou faca seu pedido
          </p>
          <Button 
            className="w-full h-12"
            style={{ backgroundColor: brandColor }}
            asChild
          >
            <a href={landing.whatsapp ? `https://wa.me/55${landing.whatsapp.replace(/\D/g, "")}` : "#"}>
              Iniciar conversa
              <ChevronRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            Feito com Social Landing
          </p>
          <Button variant="link" size="sm" className="text-xs" asChild>
            <Link href="/criar">
              Crie a sua gratuitamente
            </Link>
          </Button>
        </footer>
      </main>
    </div>
  )
}

// Loading fallback
function SlugLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  )
}

// Export com Suspense
export default function SlugPage() {
  return (
    <Suspense fallback={<SlugLoading />}>
      <SlugContent />
    </Suspense>
  )
}
