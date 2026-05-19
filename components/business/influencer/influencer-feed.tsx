"use client"

import { useState } from "react"
import { BusinessSocialLanding } from "../business-social-landing"
import { getBusinessContent } from "@/lib/mock-data/business-content"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { SocialCompactHero } from "../social-compact-hero"
import { SocialContactCTA } from "../social-contact-cta"
import { 
  Link2, Instagram, Youtube, Twitter, Mail, 
  ExternalLink, Copy, Check, Users, Eye, Heart,
  MessageCircle, Send
} from "lucide-react"
import Image from "next/image"

// Configuracao do Influencer
const influencerConfig = {
  id: "influencer-demo",
  name: "Camila Torres",
  logo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&h=400&fit=crop",
  description: "Criadora de conteudo | Lifestyle & Viagens | +500k seguidores | Parcerias: contato@camilatorres.com",
  brandColor: "#E91E63",
  instagram: "@camilatorres",
  youtube: "CamilaTorresTV",
  twitter: "@camilatorres",
  tiktok: "@camilatorres"
}

// Stories do Influencer
const influencerStories = [
  { id: "1", name: "Links", image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop", isMain: true },
  { id: "2", name: "Collabs", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&h=100&fit=crop" },
  { id: "3", name: "Viagens", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { id: "4", name: "Lifestyle", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop" },
  { id: "5", name: "Bastidores", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop" }
]

// Links do Influencer (estilo Linktree)
const influencerLinks = [
  { id: "1", title: "Meu canal no YouTube", url: "https://youtube.com", icon: Youtube, color: "#FF0000" },
  { id: "2", title: "Instagram oficial", url: "https://instagram.com", icon: Instagram, color: "#E4405F" },
  { id: "3", title: "Twitter/X", url: "https://twitter.com", icon: Twitter, color: "#1DA1F2" },
  { id: "4", title: "Contato comercial", url: "mailto:contato@camilatorres.com", icon: Mail, color: "#EA4335" }
]

// Metricas do Influencer
const influencerMetrics = {
  followers: "532K",
  engagement: "4.8%",
  avgViews: "125K",
  avgLikes: "45K"
}

// Parcerias/Collabs
const influencerCollabs = [
  { id: "1", brand: "Nike", logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop", type: "Embaixadora" },
  { id: "2", brand: "Samsung", logo: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=100&h=100&fit=crop", type: "Parceria" },
  { id: "3", brand: "Sephora", logo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop", type: "Collab" },
  { id: "4", brand: "Airbnb", logo: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&h=100&fit=crop", type: "Parceria" }
]

export function InfluencerFeed() {
  const [selectedLink, setSelectedLink] = useState<typeof influencerLinks[0] | null>(null)
  const [linksDrawerOpen, setLinksDrawerOpen] = useState(false)
  const [collabDrawerOpen, setCollabDrawerOpen] = useState(false)
  const [mediaKitDrawerOpen, setMediaKitDrawerOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  
  const content = getBusinessContent("influencer")
  
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedLink(url)
    setTimeout(() => setCopiedLink(null), 2000)
  }
  
  // Secoes do feed
  const sections = [
    // Links (objetivo principal)
    {
      id: "links",
      title: "Meus Links",
      type: "custom" as const,
      posts: [],
      customContent: (
        <div className="space-y-3">
          <SocialCompactHero
            variant="editorial"
            brandLogo={influencerConfig.logo}
            brandName={influencerConfig.name}
            contextLabel="Quem e a Camila"
            headline="Viagem, lifestyle e bastidores contados do jeito que eu vivo."
            subheadline="Aqui voce encontra meus links, collabs, rotina real e os projetos que compartilho com a comunidade."
          />
          {influencerLinks.map((link) => {
            const Icon = link.icon
            return (
              <button
                key={link.id}
                onClick={() => window.open(link.url, "_blank")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all group"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${link.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: link.color }} />
                </div>
                <span className="flex-1 text-left font-medium">{link.title}</span>
                <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            )
          })}
          <button
            onClick={() => setLinksDrawerOpen(true)}
            className="w-full p-3 text-sm text-accent hover:text-accent/80 transition-colors"
          >
            Ver todos os links
          </button>
        </div>
      )
    },
    // Metricas
    {
      id: "metrics",
      title: "Numeros",
      type: "custom" as const,
      posts: [],
      customContent: (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Users className="w-5 h-5 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{influencerMetrics.followers}</p>
            <p className="text-xs text-muted-foreground">Seguidores</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Heart className="w-5 h-5 mx-auto mb-2 text-pink-500" />
            <p className="text-2xl font-bold">{influencerMetrics.engagement}</p>
            <p className="text-xs text-muted-foreground">Engajamento</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Eye className="w-5 h-5 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{influencerMetrics.avgViews}</p>
            <p className="text-xs text-muted-foreground">Views/post</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <MessageCircle className="w-5 h-5 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{influencerMetrics.avgLikes}</p>
            <p className="text-xs text-muted-foreground">Likes/post</p>
          </div>
        </div>
      )
    },
    // Parcerias
    {
      id: "collabs",
      title: "Parcerias",
      type: "custom" as const,
      posts: [],
      customContent: (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {influencerCollabs.map((collab) => (
            <button
              key={collab.id}
              onClick={() => setCollabDrawerOpen(true)}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden">
                <Image src={collab.logo} alt={collab.brand} width={64} height={64} className="object-cover" />
              </div>
              <p className="text-sm font-medium">{collab.brand}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{collab.type}</span>
            </button>
          ))}
        </div>
      )
    },
    {
      id: "contact",
      title: "Bora conversar",
      type: "custom" as const,
      posts: [],
      customContent: (
        <SocialContactCTA
          contextLabel="Bora conversar"
          headline="Quer falar sobre collab, acompanhar meus canais ou trocar ideia com a comunidade?"
          subheadline="Pega meus contatos principais e abre o media kit para ver formatos, alcance e oportunidades."
          primaryContact={{
            label: "Email",
            value: "contato@camilatorres.com",
            href: "mailto:contato@camilatorres.com",
            icon: "mail",
          }}
          secondaryItems={[
            {
              label: "Instagram",
              value: influencerConfig.instagram,
              icon: "instagram",
            },
            {
              label: "YouTube",
              value: influencerConfig.youtube,
              icon: "youtube",
            },
          ]}
          primaryActionLabel="Abrir media kit"
          onPrimaryAction={() => setMediaKitDrawerOpen(true)}
        />
      )
    },
    // Videos
    {
      id: "videos",
      title: "Ultimos Videos",
      type: "content" as const,
      posts: content.videos.map(v => ({
        id: v.id,
        type: "video" as const,
        title: v.title,
        content: v.description,
        image: v.thumbnail,
        author: { name: influencerConfig.name, avatar: influencerConfig.logo },
        stats: { likes: v.views, comments: Math.floor(v.views / 50) },
        metadata: { duration: v.duration }
      }))
    },
    // Posts
    {
      id: "posts",
      title: "Posts Recentes",
      type: "content" as const,
      posts: content.socialPosts.map(p => ({
        id: p.id,
        type: "social" as const,
        title: "",
        content: p.content,
        image: p.image,
        author: { name: influencerConfig.name, avatar: influencerConfig.logo },
        stats: { likes: p.likes, comments: p.comments }
      }))
    }
  ]
  
  return (
    <>
      <BusinessSocialLanding
        config={influencerConfig}
        stories={influencerStories}
        sections={sections}
      />
      
      {/* Media Kit Drawer */}
      <Drawer open={mediaKitDrawerOpen} onOpenChange={setMediaKitDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Media Kit</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden">
                <Image src={influencerConfig.logo} alt={influencerConfig.name} width={80} height={80} className="object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{influencerConfig.name}</h3>
                <p className="text-muted-foreground">{influencerConfig.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/50 text-center">
                <p className="text-3xl font-bold text-accent">{influencerMetrics.followers}</p>
                <p className="text-sm text-muted-foreground">Seguidores totais</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 text-center">
                <p className="text-3xl font-bold text-accent">{influencerMetrics.engagement}</p>
                <p className="text-sm text-muted-foreground">Taxa de engajamento</p>
              </div>
            </div>
            
            <Button className="w-full" onClick={() => window.open("mailto:contato@camilatorres.com")}>
              <Send className="w-4 h-4 mr-2" />
              Entrar em contato
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
      
      {/* Links Drawer */}
      <Drawer open={linksDrawerOpen} onOpenChange={setLinksDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Todos os Links</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 space-y-3">
            {influencerLinks.map((link) => {
              const Icon = link.icon
              return (
                <div key={link.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${link.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: link.color }} />
                  </div>
                  <span className="flex-1 font-medium">{link.title}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyLink(link.url)}
                  >
                    {copiedLink === link.url ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(link.url, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
