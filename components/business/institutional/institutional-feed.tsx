"use client"

import { useState, type FormEvent } from "react"
import { BusinessSocialLanding } from "../business-social-landing"
import { getBusinessContent } from "@/lib/mock-data/business-content"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SimpleChatInput } from "@/components/social-landing/inline-chat"
import { 
  Target, Heart, Users, Award, Mail, Phone, MapPin,
  Building2, Linkedin, ChevronRight, Send, Check,
  FileText, Download, MessageCircle, Share, Bookmark
} from "lucide-react"
import Image from "next/image"

// Configuracao Institucional
const institutionalConfig = {
  id: "institutional-demo",
  name: "Instituto Futuro Verde",
  logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1200&h=400&fit=crop",
  description: "Transformando vidas atraves da educacao ambiental. Desde 2010 impactando comunidades em todo o Brasil.",
  brandColor: "#22C55E",
  phone: "(11) 3456-7890",
  email: "contato@futuroverde.org.br",
  address: "Av. Paulista, 1000 - Sao Paulo, SP"
}

// Stories Institucionais
const institutionalStories = [
  { id: "1", name: "Sobre", image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop", isMain: true },
  { id: "2", name: "Missao", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop" },
  { id: "3", name: "Equipe", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop" },
  { id: "4", name: "Projetos", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&h=100&fit=crop" },
  { id: "5", name: "Impacto", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop" }
]

// Missao, Visao, Valores
const institutionalPillars = [
  { 
    id: "mission", 
    title: "Missao", 
    description: "Promover a educacao ambiental e o desenvolvimento sustentavel em comunidades vulneraveis.",
    icon: Target,
    color: "#22C55E"
  },
  { 
    id: "vision", 
    title: "Visao", 
    description: "Ser referencia nacional em transformacao social atraves da consciencia ambiental.",
    icon: Award,
    color: "#3B82F6"
  },
  { 
    id: "values", 
    title: "Valores", 
    description: "Transparencia, comprometimento, respeito a diversidade e paixao pelo meio ambiente.",
    icon: Heart,
    color: "#EF4444"
  }
]

// Equipe
const institutionalTeam = [
  { id: "1", name: "Dra. Maria Silva", role: "Diretora Executiva", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop" },
  { id: "2", name: "Carlos Santos", role: "Coordenador de Projetos", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
  { id: "3", name: "Ana Oliveira", role: "Gerente de Comunicacao", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" },
  { id: "4", name: "Pedro Lima", role: "Coordenador Ambiental", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop" }
]

// Numeros de impacto
const institutionalImpact = [
  { id: "1", value: "15K+", label: "Pessoas impactadas" },
  { id: "2", value: "120", label: "Projetos realizados" },
  { id: "3", value: "45", label: "Cidades atendidas" },
  { id: "4", value: "14", label: "Anos de atuacao" }
]

// Projetos
const institutionalProjects = [
  { 
    id: "1", 
    title: "Escola Verde", 
    description: "Programa de educacao ambiental em escolas publicas",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
    status: "Em andamento"
  },
  { 
    id: "2", 
    title: "Reflorestamento Urbano", 
    description: "Plantio de arvores em areas degradadas da cidade",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop",
    status: "Em andamento"
  },
  { 
    id: "3", 
    title: "Agua Limpa", 
    description: "Despoluicao de rios em comunidades ribeirinhas",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop",
    status: "Concluido"
  }
]

// FAQs
const institutionalFAQs = [
  { id: "1", question: "Como posso apoiar o Instituto?", answer: "Voce pode contribuir como voluntario, parceiro ou atraves de doacoes. Entre em contato conosco para saber mais." },
  { id: "2", question: "Onde o Instituto atua?", answer: "Atuamos em todo o Brasil, com foco especial nas regioes Sudeste e Nordeste." },
  { id: "3", question: "Como participar dos projetos?", answer: "Cadastre-se em nosso site ou entre em contato. Temos oportunidades para voluntarios e parceiros." }
]

// Videos institucionais
const institutionalVideos = [
  {
    id: "1",
    title: "Nova linha de produtos sustentaveis - Ekos 2024",
    description: "Conheca nossa nova linha de produtos feitos com ingredientes 100% naturais da Amazonia.",
    thumbnail: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop",
    duration: "12:45",
    views: "45K",
    chat: {
      brandMessage: "Esse video mostra um truque de skincare que poucas pessoas conhecem. Ja pensou em incluir uma mascara de argila na sua rotina?",
      userResponse: "Nunca usei mascara de argila",
      brandReply: "Vale experimentar! A argila verde e otima pra pele oleosa, e a branca pra sensivel. Posso indicar a melhor pra voce?"
    }
  },
  {
    id: "2",
    title: "Tutorial completo: Maquiagem natural para o dia a dia",
    description: "Aprenda a fazer uma maquiagem natural e elegante com produtos Natura Una.",
    thumbnail: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop",
    duration: "18:30",
    views: "89K",
    chat: {
      brandMessage: "Esse tutorial mostra como valorizar sua beleza natural. Qual e o seu maior desafio com maquiagem?",
      userResponse: "tem mais videos assim?",
      brandReply: "Temos varios! Posso te indicar tutoriais especificos pra olhos, boca ou pele. O que voce prefere?"
    }
  }
]

// Produtos em destaque
const institutionalProducts = [
  {
    id: "1",
    name: "Creme Hidratante Ekos Castanha",
    price: 79.90,
    oldPrice: 99.90,
    installments: "3x de R$ 26,63",
    discount: 20,
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=400&fit=crop",
    socialProof: "Ana, Carla e outras pessoas adicionaram ao carrinho hoje",
    chat: {
      brandMessage: "Curiosidade: esse hidratante tem extrato de castanha da Amazonia, um ingrediente que so existe aqui. Ele foi o mais vendido do mes passado. Quer saber por que?",
      userResponse: "Quero sim!",
      brandReply: "A castanha amazonica tem propriedades que ajudam a rejuvenescer a pele em ate 40%. Posso te contar mais sobre como ele funciona?"
    }
  },
  {
    id: "2",
    name: "Perfume COCO NOIR",
    price: 189.90,
    oldPrice: 229.90,
    installments: "6x de R$ 31,65",
    discount: 17,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
    socialProof: "Julia, Fernanda e outras pessoas compraram essa semana"
  }
]

// Noticias na midia com fonte
const institutionalNews = [
  {
    id: "1",
    source: "Valor Economico",
    title: "Natura anuncia metas de carbono neutro ate 2030",
    summary: "A empresa se comprometeu a zerar suas emissoes de carbono em toda a cadeia produtiva nos proximos anos, investindo em tecnologias limpas e reflorestamento.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop",
    socialProof: "Ana, Carla e outras pessoas leram essa materia",
    chat: {
      brandMessage: "Essa noticia mostra um projeto que impacta mais de 2 mil familias ribeirinhas. A Natura trabalha com comunidades locais ha mais de 20 anos. Quer conhecer outras iniciativas?",
      userResponse: "quero conhecer..."
    }
  },
  {
    id: "2",
    source: "Forbes Brasil",
    title: "Natura e eleita empresa mais sustentavel do Brasil pelo 3o ano",
    summary: "Pelo terceiro ano consecutivo, a Natura lidera o ranking de sustentabilidade empresarial da Forbes Brasil, destacando-se pelo compromisso com o meio ambiente.",
    image: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600&h=400&fit=crop",
    socialProof: "Pedro, Marina e outras pessoas compartilharam"
  }
]

type BrandPostType = "tip" | "promotion" | "news" | "backstage"

interface BrandPost {
  id: string
  type: BrandPostType
  text: string
  imageUrl?: string
  publishedAt: string
  socialProof: string
}

const brandPostTypeOptions: Array<{ value: BrandPostType; label: string; badgeClassName: string }> = [
  { value: "tip", label: "Dica", badgeClassName: "bg-emerald-500/10 text-emerald-600" },
  { value: "promotion", label: "Promocao", badgeClassName: "bg-orange-500/10 text-orange-600" },
  { value: "news", label: "Noticia", badgeClassName: "bg-blue-500/10 text-blue-600" },
  { value: "backstage", label: "Bastidores", badgeClassName: "bg-violet-500/10 text-violet-600" },
]

const brandSocialNames = ["Ana", "Julia", "Marina", "Pedro", "Carla", "Lucas"]

const brandSocialAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
]

const brandPostSocialProof: Record<BrandPostType, string[]> = {
  tip: ["salvaram essa dica", "comentaram sobre esse cuidado", "mandaram para outras pessoas da comunidade"],
  promotion: ["compartilharam essa oportunidade", "marcaram outras pessoas aqui", "estao de olho nessa novidade"],
  news: ["acompanharam essa atualizacao", "comentaram sobre essa novidade", "salvaram para ver depois"],
  backstage: ["curtiram ver os bastidores", "reagiram a esse momento", "comentaram sobre essa cena"],
}

const brandPostChatPlaceholders: Record<BrandPostType, string> = {
  tip: "quero ver mais dicas assim",
  promotion: "essa novidade ainda esta valendo?",
  news: "quero saber mais sobre isso",
  backstage: "adorei ver esse bastidor",
}

function createBrandPostSocialProof(type: BrandPostType, seed: number) {
  const messages = brandPostSocialProof[type]
  const message = messages[seed % messages.length]
  const name1 = brandSocialNames[seed % brandSocialNames.length]
  const name2 = brandSocialNames[(seed + 2) % brandSocialNames.length]

  return `${name1}, ${name2} e outras pessoas ${message}`
}

function BrandSocialProofWithAvatars({ postIndex, text }: { postIndex: number; text: string }) {
  const avatarIndexes = [
    (postIndex * 2) % brandSocialAvatars.length,
    (postIndex * 2 + 1) % brandSocialAvatars.length,
    (postIndex * 2 + 2) % brandSocialAvatars.length,
  ]

  return (
    <div className="mt-3 flex items-center gap-2.5">
      <div className="flex -space-x-2">
        {avatarIndexes.map((avatarIdx) => (
          <div
            key={`${text}-${avatarIdx}`}
            className="relative h-6 w-6 overflow-hidden rounded-full border-2 border-background shadow-sm"
          >
            <Image src={brandSocialAvatars[avatarIdx]} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

function BrandSocialActions() {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  return (
    <div className="mt-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={() => setLiked(!liked)} className="rounded-full p-1.5 transition-colors hover:bg-secondary">
          <Heart className={liked ? "h-5 w-5 fill-red-500 text-red-500" : "h-5 w-5 text-foreground"} />
        </button>
        <button className="rounded-full p-1.5 text-foreground transition-colors hover:bg-secondary">
          <MessageCircle className="h-5 w-5" />
        </button>
        <button className="rounded-full p-1.5 text-foreground transition-colors hover:bg-secondary">
          <Share className="h-5 w-5" />
        </button>
      </div>
      <button onClick={() => setSaved(!saved)} className="rounded-full p-1.5 transition-colors hover:bg-secondary">
        <Bookmark className={saved ? "h-5 w-5 fill-foreground text-foreground" : "h-5 w-5 text-foreground"} />
      </button>
    </div>
  )
}

function BrandPostsComposer({
  brandName,
  brandLogo,
}: {
  brandName: string
  brandLogo: string
}) {
  const [text, setText] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [postType, setPostType] = useState<BrandPostType>("news")
  const [posts, setPosts] = useState<BrandPost[]>([])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedText = text.trim()
    const trimmedImageUrl = imageUrl.trim()

    if (!trimmedText) return

    const publishedAt = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })

    setPosts((currentPosts) => [
      {
        id: `brand-post-${Date.now()}`,
        type: postType,
        text: trimmedText,
        imageUrl: trimmedImageUrl || undefined,
        publishedAt,
        socialProof: createBrandPostSocialProof(postType, currentPosts.length),
      },
      ...currentPosts,
    ])

    setText("")
    setImageUrl("")
    setPostType("news")
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="rounded-2xl bg-card/70 p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-border/60">
            <Image src={brandLogo} alt={brandName} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{brandName}</p>
            <p className="text-sm text-muted-foreground">Crie uma publicacao para o feed do instituto</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="O que voce quer compartilhar hoje?"
            rows={3}
            className="min-h-24 rounded-2xl border-0 bg-secondary/50 shadow-none focus-visible:ring-2"
          />

          <Input
            type="url"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="Cole a URL de uma imagem para acompanhar o post (opcional)"
            className="rounded-xl border-0 bg-secondary/40 shadow-none focus-visible:ring-2"
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex-1 space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tipo de atualizacao</span>
              <select
                value={postType}
                onChange={(event) => setPostType(event.target.value as BrandPostType)}
                className="border-input bg-secondary/40 h-10 w-full rounded-xl border-0 px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {brandPostTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <Button type="submit" className="sm:min-w-32 sm:self-end" disabled={!text.trim()}>
              Publicar no feed
            </Button>
          </div>
        </div>
      </form>

      {posts.length === 0 ? (
        <div className="px-1 text-sm text-muted-foreground">
          A proxima atualizacao publicada aparece aqui para dar vida ao feed do instituto.
        </div>
      ) : (
        posts.map((post, index) => {
          const typeConfig = brandPostTypeOptions.find((option) => option.value === post.type)

          return (
            <article key={post.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-border/60">
                  <Image src={brandLogo} alt={brandName} fill className="object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="font-semibold text-foreground">{brandName}</p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${typeConfig?.badgeClassName}`}>
                      {typeConfig?.label}
                    </span>
                    <span className="text-xs text-muted-foreground">Hoje, {post.publishedAt}</span>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">{post.text}</p>
                </div>
              </div>

              {post.imageUrl && (
                <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-secondary/20">
                  <img
                    src={post.imageUrl}
                    alt={`Imagem do post ${typeConfig?.label?.toLowerCase() || "da marca"}`}
                    className="h-auto max-h-[360px] w-full object-cover"
                  />
                </div>
              )}

              <BrandSocialProofWithAvatars postIndex={index} text={post.socialProof} />
              <BrandSocialActions />

              {index === 0 && (
                <SimpleChatInput placeholder={brandPostChatPlaceholders[post.type]} />
              )}
            </article>
          )
        })
      )}
    </div>
  )
}

export function InstitutionalFeed() {
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false)
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false)
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<typeof institutionalProjects[0] | null>(null)
  const [faqOpen, setFaqOpen] = useState<string | null>(null)
  const [contactSent, setContactSent] = useState(false)
  
  const content = getBusinessContent("institutional")
  
  const handleSendContact = () => {
    setContactSent(true)
    setTimeout(() => {
      setContactSent(false)
      setContactDrawerOpen(false)
    }, 2000)
  }
  
  // Secoes do feed
  const sections = [
    // Sobre (objetivo principal - apresentacao institucional)
    {
      id: "about",
      title: "Quem Somos",
      type: "custom" as const,
      posts: [],
      customContent: (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            O Instituto Futuro Verde e uma organizacao sem fins lucrativos dedicada a 
            transformar vidas atraves da educacao ambiental. Desde 2010, trabalhamos 
            incansavelmente para criar um futuro mais sustentavel para as proximas geracoes.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => setContactDrawerOpen(true)}>
              <Mail className="w-4 h-4 mr-2" />
              Fale conosco
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Relatorio Anual
            </Button>
          </div>
        </div>
      )
    },
    // Missao, Visao, Valores
    {
      id: "pillars",
      title: "Proposito",
      type: "custom" as const,
      posts: [],
      customContent: (
        <div className="space-y-3">
          {institutionalPillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div key={pillar.id} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${pillar.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: pillar.color }} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{pillar.title}</h4>
                  <p className="text-sm text-muted-foreground">{pillar.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      )
    },
    // Numeros de Impacto
    {
      id: "impact",
      title: "Nosso Impacto",
      type: "custom" as const,
      posts: [],
      customContent: (
        <div className="grid grid-cols-2 gap-3">
          {institutionalImpact.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-accent/5 border border-accent/20 text-center">
              <p className="text-2xl font-bold text-accent">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      )
    },
    // Equipe
    {
      id: "team",
      title: "Nossa Equipe",
      type: "custom" as const,
      posts: [],
      customContent: (
        <div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {institutionalTeam.map((member) => (
              <div key={member.id} className="flex-shrink-0 text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-2 mx-auto ring-2 ring-border">
                  <Image src={member.image} alt={member.name} width={80} height={80} className="object-cover" />
                </div>
                <p className="text-sm font-medium line-clamp-1 max-w-20">{member.name.split(" ")[0]}</p>
                <p className="text-xs text-muted-foreground line-clamp-1 max-w-20">{member.role.split(" ")[0]}</p>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setTeamDrawerOpen(true)}
            className="w-full mt-3 text-sm text-accent hover:text-accent/80 transition-colors"
          >
            Ver equipe completa
          </button>
        </div>
      )
    },
    // Projetos
    {
      id: "projects",
      title: "Projetos",
      type: "custom" as const,
      posts: [],
      customContent: (
        <div className="space-y-3">
          {institutionalProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => {
                setSelectedProject(project)
                setProjectDrawerOpen(true)
              }}
              className="w-full flex gap-4 p-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all text-left"
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={project.image} alt={project.title} width={80} height={80} className="object-cover w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium line-clamp-1">{project.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    project.status === "Em andamento" 
                      ? "bg-blue-500/10 text-blue-500" 
                      : "bg-green-500/10 text-green-500"
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 self-center" />
            </button>
          ))}
        </div>
      )
    },
    {
      id: "brand-updates",
      title: "Ultimas do Instituto",
      type: "custom" as const,
      posts: [],
      customContent: (
        <BrandPostsComposer
          brandName={institutionalConfig.name}
          brandLogo={institutionalConfig.logo}
        />
      )
    },
    // Videos com chat - usa renderContent para permitir abrir drawer
    {
      id: "videos",
      title: "Nossos Videos",
      type: "content" as const,
      posts: institutionalVideos.map((video) => ({
        id: `video-${video.id}`,
        type: "video" as const,
        content: video.title,
        description: video.description,
        media: video.thumbnail,
        videoUrl: `https://youtube.com/watch?v=${video.id}`,
        duration: video.duration,
        views: video.views,
        likes: 0,
        comments: 0,
        shares: 0,
        timestamp: "Agora"
      }))
    },
    // Produtos em destaque - convertido para posts
    {
      id: "products",
      title: "Tendencia em perfumaria",
      type: "content" as const,
      posts: institutionalProducts.map((product) => ({
        id: `product-${product.id}`,
        type: "product" as const,
        content: product.name,
        description: `R$ ${product.price.toFixed(2).replace(".", ",")} - ${product.socialProof}`,
        media: product.image,
        price: product.price,
        likes: 0,
        comments: 0,
        shares: 0,
        timestamp: "Agora"
      }))
    },
    // Noticias na midia - convertido para posts
    {
      id: "news",
      title: "Para um mundo melhor",
      type: "content" as const,
      posts: institutionalNews.map((news) => ({
        id: `news-${news.id}`,
        type: "news" as const,
        content: news.title,
        description: news.summary,
        media: news.image,
        source: news.source,
        likes: 0,
        comments: 0,
        shares: 0,
        timestamp: "Agora"
      }))
    },
    // FAQ
    {
      id: "faq",
      title: "Perguntas Frequentes",
      type: "custom" as const,
      posts: [],
      customContent: (
        <div className="space-y-2">
          {institutionalFAQs.map((faq) => (
            <button
              key={faq.id}
              onClick={() => setFaqOpen(faqOpen === faq.id ? null : faq.id)}
              className="w-full text-left p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{faq.question}</span>
                <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                  faqOpen === faq.id ? "rotate-90" : ""
                }`} />
              </div>
              {faqOpen === faq.id && (
                <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
              )}
            </button>
          ))}
        </div>
      )
    },
    // Contato
    {
      id: "contact",
      title: "Contato",
      type: "custom" as const,
      posts: [],
      customContent: (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
            <Phone className="w-5 h-5 text-accent" />
            <span>{institutionalConfig.phone}</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
            <Mail className="w-5 h-5 text-accent" />
            <span>{institutionalConfig.email}</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
            <MapPin className="w-5 h-5 text-accent" />
            <span>{institutionalConfig.address}</span>
          </div>
        </div>
      )
    }
  ]
  
return (
  <>
<BusinessSocialLanding
  config={institutionalConfig}
  stories={institutionalStories}
  sections={sections}
  />
      
      {/* Contact Drawer */}
      <Drawer open={contactDrawerOpen} onOpenChange={setContactDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Fale Conosco</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 space-y-4">
            {contactSent ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold">Mensagem enviada!</h3>
                <p className="text-muted-foreground">Entraremos em contato em breve.</p>
              </div>
            ) : (
              <>
                <Input placeholder="Nome completo" />
                <Input placeholder="Email" type="email" />
                <Input placeholder="Telefone" type="tel" />
                <Textarea placeholder="Como podemos ajudar?" rows={4} />
                <Button className="w-full" onClick={handleSendContact}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar mensagem
                </Button>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
      
      {/* Team Drawer */}
      <Drawer open={teamDrawerOpen} onOpenChange={setTeamDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Nossa Equipe</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 space-y-4">
            {institutionalTeam.map((member) => (
              <div key={member.id} className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
                <div className="w-14 h-14 rounded-full overflow-hidden">
                  <Image src={member.image} alt={member.name} width={56} height={56} className="object-cover" />
                </div>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                <Button size="icon" variant="ghost" className="ml-auto">
                  <Linkedin className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
      
      {/* Project Drawer */}
      <Drawer open={projectDrawerOpen} onOpenChange={setProjectDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          {selectedProject && (
            <>
              <DrawerHeader>
                <DrawerTitle>{selectedProject.title}</DrawerTitle>
              </DrawerHeader>
              <div className="p-6 space-y-4">
                <div className="aspect-video rounded-xl overflow-hidden">
                  <Image 
                    src={selectedProject.image} 
                    alt={selectedProject.title} 
                    width={400} 
                    height={225} 
                    className="object-cover w-full h-full" 
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedProject.status === "Em andamento" 
                      ? "bg-blue-500/10 text-blue-500" 
                      : "bg-green-500/10 text-green-500"
                  }`}>
                    {selectedProject.status}
                  </span>
                </div>
                <p className="text-muted-foreground">{selectedProject.description}</p>
                <Button className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Ver relatorio completo
                </Button>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}
