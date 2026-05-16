"use client"

import { useState } from "react"
import { BusinessSocialLanding } from "../business-social-landing"
import { getBusinessContent } from "@/lib/mock-data/business-content"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ContextSelectable } from "../context-selectable"
import type { ConversationContextItem } from "../conversational-ai"
import { 
  Link2, Instagram, Linkedin, Github, Mail, 
  MapPin, Briefcase, GraduationCap, Heart, Music,
  Camera, Book, Plane, Coffee, Send, Check
} from "lucide-react"
import Image from "next/image"

// Configuracao do Usuario
const personalConfig = {
  id: "personal-demo",
  name: "Lucas Mendes",
  logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=400&fit=crop",
  description: "Desenvolvedor | Entusiasta de tecnologia | Amante de cafe e viagens | Sao Paulo, Brasil",
  brandColor: "#6366F1",
  location: "Sao Paulo, SP",
  occupation: "Software Engineer @ Tech Company"
}

// Stories do Usuario
const personalStories = [
  { id: "1", name: "Sobre", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", isMain: true },
  { id: "2", name: "Projetos", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=100&h=100&fit=crop" },
  { id: "3", name: "Hobbies", image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop" },
  { id: "4", name: "Viagens", image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100&h=100&fit=crop" },
  { id: "5", name: "Fotos", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop" }
]

// Links sociais
const personalLinks = [
  { id: "1", title: "LinkedIn", url: "https://linkedin.com", icon: Linkedin, color: "#0A66C2" },
  { id: "2", title: "GitHub", url: "https://github.com", icon: Github, color: "#333" },
  { id: "3", title: "Instagram", url: "https://instagram.com", icon: Instagram, color: "#E4405F" },
  { id: "4", title: "Email", url: "mailto:lucas@email.com", icon: Mail, color: "#EA4335" }
]

// Interesses
const personalInterests = [
  { id: "1", name: "Tecnologia", icon: Briefcase },
  { id: "2", name: "Fotografia", icon: Camera },
  { id: "3", name: "Musica", icon: Music },
  { id: "4", name: "Leitura", icon: Book },
  { id: "5", name: "Viagens", icon: Plane },
  { id: "6", name: "Cafe", icon: Coffee }
]

// Projetos/Portfolio
const personalProjects = [
  { 
    id: "1", 
    title: "App de Produtividade", 
    description: "Aplicativo mobile para gestao de tarefas", 
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
    tags: ["React Native", "TypeScript"]
  },
  { 
    id: "2", 
    title: "Dashboard Analytics", 
    description: "Painel de metricas em tempo real", 
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    tags: ["Next.js", "D3.js"]
  },
  { 
    id: "3", 
    title: "E-commerce Platform", 
    description: "Plataforma completa de vendas online", 
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    tags: ["Node.js", "PostgreSQL"]
  }
]

// Galeria de fotos
const personalPhotos = [
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop"
]

function AboutModule({
  onContact,
  onToggleConversationContext,
  isInConversation,
}: {
  onContact: () => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  const contextItem = {
    id: "personal-about",
    title: "Sobre mim",
    image: personalConfig.logo,
    subtitle: "Sobre",
  }

  return (
    <div className="space-y-4">
      <ContextSelectable
        as="div"
        onLongPress={() => onToggleConversationContext?.(contextItem)}
        selected={isInConversation?.(contextItem.id) ?? false}
        className="p-4 rounded-xl bg-card border border-border"
      >
        <div className="flex items-center gap-3 mb-3">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{personalConfig.location}</span>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{personalConfig.occupation}</span>
        </div>
        <p className="text-muted-foreground">
          Ola! Sou um desenvolvedor apaixonado por criar solucoes que fazem diferenca.
          Quando nao estou codando, voce me encontra viajando, fotografando ou
          experimentando cafes especiais pela cidade.
        </p>
      </ContextSelectable>
      <Button className="w-full" onClick={() => onContact()}>
        <Mail className="w-4 h-4 mr-2" />
        Entrar em contato
      </Button>
    </div>
  )
}

function InterestsModule({
  onToggleConversationContext,
  isInConversation,
}: {
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {personalInterests.map((interest) => {
        const Icon = interest.icon
        const contextItem = {
          id: `personal-interest-${interest.id}`,
          title: interest.name,
          image: personalConfig.logo,
          subtitle: "Interesse",
        }

        return (
          <ContextSelectable
            key={interest.id}
            as="div"
            onLongPress={() => onToggleConversationContext?.(contextItem)}
            selected={isInConversation?.(contextItem.id) ?? false}
            className="flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-card"
          >
            <Icon className="w-4 h-4 text-accent" />
            <span className="text-sm">{interest.name}</span>
          </ContextSelectable>
        )
      })}
    </div>
  )
}

function ProjectsModule({
  onSelectProject,
  onToggleConversationContext,
  isInConversation,
}: {
  onSelectProject: (project: (typeof personalProjects)[0]) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  return (
    <div className="space-y-3">
      {personalProjects.map((project) => {
        const contextItem = {
          id: `personal-project-${project.id}`,
          title: project.title,
          image: project.image,
          subtitle: "Projeto",
        }

        return (
          <ContextSelectable
            key={project.id}
            as="div"
            onClick={() => onSelectProject(project)}
            onLongPress={() => onToggleConversationContext?.(contextItem)}
            selected={isInConversation?.(contextItem.id) ?? false}
            className="w-full flex gap-4 p-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all text-left"
          >
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={project.image} alt={project.title} width={80} height={80} className="object-cover w-full h-full" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium line-clamp-1">{project.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              <div className="flex gap-1 mt-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded bg-secondary">{tag}</span>
                ))}
              </div>
            </div>
          </ContextSelectable>
        )
      })}
    </div>
  )
}

function PhotosModule({
  onToggleConversationContext,
  isInConversation,
}: {
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
      {personalPhotos.map((photo, index) => {
        const contextItem = {
          id: `personal-photo-${index}`,
          title: `Momento ${index + 1}`,
          image: photo,
          subtitle: "Foto",
        }

        return (
          <ContextSelectable
            key={photo}
            as="div"
            onLongPress={() => onToggleConversationContext?.(contextItem)}
            selected={isInConversation?.(contextItem.id) ?? false}
            className="aspect-square overflow-hidden"
          >
            <Image src={photo} alt={`Foto ${index + 1}`} width={200} height={200} className="object-cover w-full h-full hover:scale-110 transition-transform duration-300" />
          </ContextSelectable>
        )
      })}
    </div>
  )
}

export function PersonalFeed() {
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false)
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<typeof personalProjects[0] | null>(null)
  const [contactSent, setContactSent] = useState(false)
  
  const content = getBusinessContent("personal")
  
  const handleSendMessage = () => {
    setContactSent(true)
    setTimeout(() => {
      setContactSent(false)
      setContactDrawerOpen(false)
    }, 2000)
  }
  
  // Secoes do feed
  const sections = [
    // Sobre (objetivo principal - apresentacao)
    {
      id: "about",
      title: "Sobre mim",
      type: "custom" as const,
      posts: [],
      customContent: <AboutModule onContact={() => setContactDrawerOpen(true)} />
    },
    // Links
    {
      id: "links",
      title: "Redes Sociais",
      type: "custom" as const,
      posts: [],
      customContent: (
        <div className="flex justify-center gap-4">
          {personalLinks.map((link) => {
            const Icon = link.icon
            return (
              <button
                key={link.id}
                onClick={() => window.open(link.url, "_blank")}
                className="w-14 h-14 rounded-xl flex items-center justify-center border border-border bg-card hover:bg-secondary/50 transition-all"
                style={{ borderColor: `${link.color}30` }}
              >
                <Icon className="w-6 h-6" style={{ color: link.color }} />
              </button>
            )
          })}
        </div>
      )
    },
    // Interesses
    {
      id: "interests",
      title: "Interesses",
      type: "custom" as const,
      posts: [],
      customContent: <InterestsModule />
    },
    // Projetos/Portfolio
    {
      id: "projects",
      title: "Projetos",
      type: "custom" as const,
      posts: [],
      customContent: (
        <ProjectsModule
          onSelectProject={(project) => {
            setSelectedProject(project)
            setProjectDrawerOpen(true)
          }}
        />
      )
    },
    // Galeria de fotos
    {
      id: "photos",
      title: "Momentos",
      type: "custom" as const,
      posts: [],
      customContent: <PhotosModule />
    }
  ]
  
  return (
    <>
      <BusinessSocialLanding
        config={personalConfig}
        stories={personalStories}
        sections={sections}
      />
      
      {/* Contact Drawer */}
      <Drawer open={contactDrawerOpen} onOpenChange={setContactDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Enviar mensagem</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 space-y-4">
            {contactSent ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold">Mensagem enviada!</h3>
                <p className="text-muted-foreground">Responderei em breve.</p>
              </div>
            ) : (
              <>
                <Input placeholder="Seu nome" />
                <Input placeholder="Seu email" type="email" />
                <Textarea placeholder="Sua mensagem..." rows={4} />
                <Button className="w-full" onClick={handleSendMessage}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar mensagem
                </Button>
              </>
            )}
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
                <p className="text-muted-foreground">{selectedProject.description}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm">{tag}</span>
                  ))}
                </div>
                <Button className="w-full" variant="outline">
                  <Github className="w-4 h-4 mr-2" />
                  Ver no GitHub
                </Button>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}
