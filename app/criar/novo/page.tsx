"use client"

import { Suspense, useState, useRef, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Send, Sparkles, Check, ArrowRight, Phone, Instagram, 
  Mail, Globe, ChevronRight, Loader2, ExternalLink,
  Scissors, ShoppingBag, GraduationCap, UtensilsCrossed,
  Building2, Briefcase, Ticket, Dumbbell, Stethoscope,
  User, Crown, ArrowLeft, Camera, Clock, Plus, MessageCircle,
  MapPin, Video, FileText, HelpCircle, Star, Users, Newspaper,
  Upload, Wand2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { LivePreview } from "@/components/criar/live-preview"
import { buildLandingEditorUrl, createLandingDraft, getLandingUrl, saveLandingDraft, slugifyLandingName } from "@/lib/landing-storage"

// Categorias disponiveis
const CATEGORIES = [
  { id: "influencer", name: "Influencer", icon: Crown, description: "Creator, artista" },
  { id: "personal", name: "Pessoal", icon: User, description: "Portfolio, pagina pessoal" },
  { id: "institutional", name: "Institucional", icon: Globe, description: "Marca, ONG" },
  { id: "restaurant", name: "Restaurante", icon: UtensilsCrossed, description: "Cafe, bar, delivery" },
  { id: "ecommerce", name: "Loja", icon: ShoppingBag, description: "Produtos, marketplace" },
  { id: "appointment", name: "Agendamento", icon: Scissors, description: "Salao, barbearia" },
  { id: "health", name: "Saude", icon: Stethoscope, description: "Clinica, consultorio" },
  { id: "professionals", name: "Servicos", icon: Briefcase, description: "Advogado, consultor" },
  { id: "courses", name: "Cursos", icon: GraduationCap, description: "Educacao online" },
  { id: "events", name: "Eventos", icon: Ticket, description: "Festas, shows" },
  { id: "gym", name: "Fitness", icon: Dumbbell, description: "Academia, personal" },
  { id: "realestate", name: "Imoveis", icon: Building2, description: "Imobiliaria, corretor" },
]

// Itens de completude organizados por grupo
const COMPLETENESS_ITEMS = [
  // Dados basicos (preenchidos no chat)
  { field: "name", label: "Nome", value: 10, icon: User, group: "basico", canAI: false },
  { field: "category", label: "Categoria", value: 5, icon: Briefcase, group: "basico", canAI: false },
  { field: "description", label: "Descricao", value: 8, icon: MessageCircle, group: "basico", canAI: false },
  
  // Contato (dados sensiveis - NAO pode IA)
  { field: "whatsapp", label: "WhatsApp", value: 8, icon: Phone, group: "contato", canAI: false },
  { field: "email", label: "E-mail", value: 5, icon: Mail, group: "contato", canAI: false },
  { field: "phone", label: "Telefone fixo", value: 3, icon: Phone, group: "contato", canAI: false },
  { field: "address", label: "Endereco", value: 5, icon: MapPin, group: "contato", canAI: false },
  
  // Redes sociais
  { field: "instagram", label: "Instagram", value: 5, icon: Instagram, group: "redes", canAI: false },
  { field: "facebook", label: "Facebook", value: 3, icon: Globe, group: "redes", canAI: false },
  { field: "twitter", label: "X (Twitter)", value: 3, icon: Globe, group: "redes", canAI: false },
  { field: "linkedin", label: "LinkedIn", value: 3, icon: Globe, group: "redes", canAI: false },
  { field: "youtube", label: "YouTube", value: 4, icon: Globe, group: "redes", canAI: false },
  { field: "tiktok", label: "TikTok", value: 3, icon: Globe, group: "redes", canAI: false },
  { field: "website", label: "Site oficial", value: 4, icon: Globe, group: "redes", canAI: false },
  
  // Identidade visual
  { field: "logo", label: "Logotipo", value: 10, icon: Camera, group: "identidade", canAI: false },
  { field: "cover", label: "Foto de capa", value: 5, icon: Camera, group: "identidade", canAI: false },
  
  // Midia (fotos, videos, arquivos)
  { field: "media", label: "Midia (fotos/videos)", value: 8, icon: Upload, group: "midia", canAI: false },
  { field: "gallery", label: "Galeria de imagens", value: 5, icon: Camera, group: "midia", canAI: false },
  { field: "videos", label: "Videos", value: 5, icon: Video, group: "midia", canAI: false },
  { field: "documents", label: "Documentos/Arquivos", value: 3, icon: FileText, group: "midia", canAI: false },
  
  // Conteudo (pode ser gerado por IA)
  { field: "about", label: "Sobre", value: 6, icon: MessageCircle, group: "conteudo", canAI: true },
  { field: "services", label: "Servicos", value: 5, icon: Briefcase, group: "conteudo", canAI: true },
  { field: "products", label: "Produtos", value: 5, icon: ShoppingBag, group: "conteudo", canAI: true },
  { field: "faq", label: "Perguntas frequentes", value: 4, icon: HelpCircle, group: "conteudo", canAI: true },
  { field: "testimonials", label: "Depoimentos", value: 4, icon: Star, group: "conteudo", canAI: false },
  { field: "achievements", label: "Conquistas", value: 3, icon: Crown, group: "conteudo", canAI: false },
  { field: "team", label: "Equipe", value: 3, icon: Users, group: "conteudo", canAI: true },
  { field: "hours", label: "Horarios", value: 3, icon: Clock, group: "conteudo", canAI: true },
  
  // Links externos
  { field: "news_links", label: "Links de noticias", value: 3, icon: Newspaper, group: "links", canAI: false },
  { field: "portfolio_links", label: "Portfolio", value: 3, icon: ExternalLink, group: "links", canAI: false },
  { field: "press_links", label: "Imprensa", value: 2, icon: Newspaper, group: "links", canAI: false },
]

// Grupos de completude
const COMPLETENESS_GROUPS = [
  { id: "identidade", label: "Identidade visual", description: "Logo e capa" },
  { id: "contato", label: "Contato", description: "Dados de contato" },
  { id: "redes", label: "Redes sociais", description: "Seus perfis" },
  { id: "midia", label: "Midia", description: "Fotos, videos e arquivos" },
  { id: "conteudo", label: "Conteudo", description: "Pode usar IA" },
  { id: "links", label: "Links", description: "Referencias externas" },
]

// Helpers de formatacao
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, "")
  if (numbers.length <= 2) return numbers.length > 0 ? `(${numbers}` : ""
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}

const formatInstagram = (value: string) => {
  let clean = value.replace(/\s/g, "")
  if (clean.includes("instagram.com/")) {
    clean = clean.split("instagram.com/")[1]?.split("/")[0]?.split("?")[0] || ""
  }
  clean = clean.replace("@", "")
  return clean ? `@${clean}` : ""
}

// Tipos de mensagem
type MessageType = "ai" | "user" | "input" | "categories" | "generating" | "preview"

interface Message {
  id: string
  type: MessageType
  content?: string
  inputType?: "text" | "textarea" | "phone" | "social" | "email"
  placeholder?: string
  field?: string
  optional?: boolean
  categories?: typeof CATEGORIES
}

// Fluxo de conversa
const CONVERSATION_FLOW: Message[] = [
  {
    id: "welcome",
    type: "ai",
    content: "Ola! Vou te ajudar a criar sua Social Landing em menos de 2 minutos. Vamos comecar?"
  },
  {
    id: "ask-name",
    type: "ai",
    content: "Qual o nome da sua marca, negocio ou seu nome?"
  },
  {
    id: "input-name",
    type: "input",
    inputType: "text",
    placeholder: "Ex: Cafe do Joao, Studio Maria, Joao Silva...",
    field: "name"
  },
  {
    id: "ask-category",
    type: "ai",
    content: "Otimo! Agora me conta: qual dessas categorias melhor descreve voce?"
  },
  {
    id: "select-category",
    type: "categories",
    categories: CATEGORIES
  },
  {
    id: "ask-description",
    type: "ai",
    content: "Perfeito! Agora me conta em 1-2 frases o que voce faz ou oferece:"
  },
  {
    id: "input-description",
    type: "input",
    inputType: "textarea",
    placeholder: "Ex: Cafe artesanal torrado na hora com ambiente acolhedor no centro da cidade...",
    field: "description"
  },
  {
    id: "ask-whatsapp",
    type: "ai",
    content: "Qual seu WhatsApp pra receber contatos? (pode pular se preferir)"
  },
  {
    id: "input-whatsapp",
    type: "input",
    inputType: "phone",
    placeholder: "(11) 99999-9999",
    field: "whatsapp",
    optional: true
  },
  {
    id: "ask-instagram",
    type: "ai",
    content: "Tem Instagram? Cole o @ ou link (opcional)"
  },
  {
    id: "input-instagram",
    type: "input",
    inputType: "social",
    placeholder: "@seuinstagram",
    field: "instagram",
    optional: true
  },
  {
    id: "generating",
    type: "ai",
    content: "Perfeito! Agora vou criar sua Social Landing com IA..."
  },
  {
    id: "generating-animation",
    type: "generating"
  }
]

function CriarNovoContent() {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [formData, setFormData] = useState(() => ({
    name: searchParams.get("name") || "",
    category: searchParams.get("category") || searchParams.get("businessModel") || "",
    description: searchParams.get("description") || "",
    whatsapp: searchParams.get("whatsapp") || "",
    instagram: searchParams.get("instagram") || "",
    email: searchParams.get("email") || "",
    website: searchParams.get("website") || ""
  }))
  const [inputValue, setInputValue] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [generatedSlug, setGeneratedSlug] = useState(() => {
    const slug = searchParams.get("slug")
    const name = searchParams.get("name")
    return slug || (name ? slugifyLandingName(name) : "")
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  // Calcula completude real
  const completeness = useMemo(() => {
    let score = 0
    if (formData.name) score += 15
    if (formData.category) score += 10
    if (formData.description) score += 15
    if (formData.whatsapp) score += 15
    if (formData.instagram) score += 10
    if (formData.email) score += 10
    // logo e photos serao adicionados depois
    return Math.min(100, Math.round((score / 75) * 100))
  }, [formData])

  // Itens faltantes para completude organizados por grupo
  const missingItemsByGroup = useMemo(() => {
    const filledFields = new Set([
      formData.name ? "name" : null,
      formData.category ? "category" : null,
      formData.description ? "description" : null,
      formData.whatsapp ? "whatsapp" : null,
      formData.instagram ? "instagram" : null,
      formData.email ? "email" : null,
    ].filter(Boolean))
    
    // Agrupa itens faltantes por grupo
    const byGroup: Record<string, typeof COMPLETENESS_ITEMS> = {}
    COMPLETENESS_ITEMS.forEach(item => {
      if (!filledFields.has(item.field) && item.group !== "basico") {
        if (!byGroup[item.group]) byGroup[item.group] = []
        byGroup[item.group].push(item)
      }
    })
    
    return byGroup
  }, [formData])

  // Top 4 itens mais importantes para mostrar
  const topMissingItems = useMemo(() => {
    const priorityOrder = ["logo", "whatsapp", "email", "media", "instagram", "cover", "about", "services"]
    const allMissing = Object.values(missingItemsByGroup).flat()
    
    return priorityOrder
      .map(field => allMissing.find(item => item.field === field))
      .filter(Boolean)
      .slice(0, 4) as typeof COMPLETENESS_ITEMS
  }, [missingItemsByGroup])

  // Itens que podem ser gerados por IA
  const aiGenerableItems = useMemo(() => {
    return Object.values(missingItemsByGroup)
      .flat()
      .filter(item => item.canAI)
  }, [missingItemsByGroup])

  // Estado do painel expandido
  const [showAllItems, setShowAllItems] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  // Gerar conteudo com IA
  const handleGenerateWithAI = async () => {
    setIsGeneratingAI(true)
    // Simula geracao (em producao, chamaria API)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGeneratingAI(false)
    // Redireciona para editor com flag de AI
    window.location.href = getEditorUrl(undefined, { generateAI: true })
  }

  // Auto-scroll para ultima mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Adiciona mensagens iniciais
  useEffect(() => {
    const hasPrefill = Boolean(formData.name || formData.category || formData.description)
    const timer = setTimeout(() => {
      if (hasPrefill) {
        const prefillMessages: Message[] = [
          { id: "welcome-prefill", type: "ai", content: "Encontrei alguns dados da sua marca. Ja montei um preview para voce revisar." },
          { id: "generating-animation", type: "generating" },
        ]
        setMessages(prefillMessages)
        setCurrentStep(CONVERSATION_FLOW.length)
        startGeneration()
        return
      }

      addNextMessages()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Foca no input quando aparece
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [messages])

  const addNextMessages = () => {
    const nextMessages: Message[] = []
    let step = currentStep

    while (step < CONVERSATION_FLOW.length) {
      const msg = CONVERSATION_FLOW[step]
      nextMessages.push(msg)
      step++

      // Para quando encontrar um input ou categorias
      if (msg.type === "input" || msg.type === "categories" || msg.type === "generating") {
        break
      }
    }

    setMessages(prev => [...prev, ...nextMessages])
    setCurrentStep(step)

    // Se chegou na geracao
    if (nextMessages.some(m => m.type === "generating")) {
      startGeneration()
    }
  }

  const handleSubmit = (value?: string) => {
    const currentMessage = messages[messages.length - 1]
    const submitValue = value || inputValue

    if (!submitValue && !currentMessage.optional) return

    // Adiciona resposta do usuario
    if (submitValue) {
      setMessages(prev => [...prev, { 
        id: `user-${Date.now()}`, 
        type: "user", 
        content: submitValue 
      }])

      // Salva no formData
      if (currentMessage.field) {
        setFormData(prev => ({ ...prev, [currentMessage.field!]: submitValue }))
      }
    }

    setInputValue("")

    // Continua o fluxo
    setTimeout(() => {
      addNextMessages()
    }, 300)
  }

  const handleCategorySelect = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId)
    if (!category) return

    setFormData(prev => ({ ...prev, category: categoryId }))
    setMessages(prev => [...prev, { 
      id: `user-${Date.now()}`, 
      type: "user", 
      content: category.name 
    }])

    setTimeout(() => {
      addNextMessages()
    }, 300)
  }

  const handleSkip = () => {
    // Pula silenciosamente sem adicionar mensagem do usuario
    const currentMessage = messages[messages.length - 1]
    if (currentMessage.field) {
      setFormData(prev => ({ ...prev, [currentMessage.field!]: "" }))
    }
    setInputValue("")
    setTimeout(() => {
      addNextMessages()
    }, 300)
  }

  const startGeneration = () => {
    setIsGenerating(true)

    // Simula geracao (aqui chamaria a API real)
    setTimeout(() => {
      const slug = slugifyLandingName(formData.name || "minha-marca")

      setGeneratedSlug(slug)
      setIsGenerating(false)
      setIsComplete(true)
    }, 3000)
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    
    const slug = generatedSlug || slugifyLandingName(formData.name || "minha-marca")
    const draft = createLandingDraft({
      slug,
      name: formData.name || "Minha marca",
      businessModel: formData.category || "institutional",
      description: formData.description,
      whatsapp: formData.whatsapp,
      instagram: formData.instagram,
      website: formData.website,
      email: formData.email,
      status: "published",
    })
    saveLandingDraft(draft)
    setGeneratedSlug(slug)

    // Mantem um delay curto para preservar o feedback visual de publicacao.
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsPublishing(false)
    setIsPublished(true)
  }

  // Gera URL do editor com todos os dados do formulario
  const getEditorUrl = (focusField?: string, options?: { generateAI?: boolean }) => {
    return buildLandingEditorUrl({
      slug: generatedSlug || slugifyLandingName(formData.name || "minha-marca"),
      businessModel: formData.category,
      name: formData.name,
      description: formData.description,
      whatsapp: formData.whatsapp,
      instagram: formData.instagram,
      email: formData.email,
      website: formData.website,
      focus: focusField,
      generateAI: options?.generateAI,
    })
  }

  const handleAddMissingItem = (field: string) => {
    window.location.href = getEditorUrl(field)
  }

  const handleGoBack = () => {
    // Precisa ter pelo menos 3 mensagens (boas-vindas + input + resposta)
    if (messages.length < 3 || currentStep <= 1) return
    
    // Encontra os indices dos inputs/categories (perguntas da IA)
    const inputIndices: number[] = []
    messages.forEach((msg, i) => {
      if (msg.type === "input" || msg.type === "categories") {
        inputIndices.push(i)
      }
    })
    
    // Se tiver pelo menos 2 perguntas, volta para a anterior
    if (inputIndices.length >= 2) {
      // Pega o indice da penultima pergunta
      const targetIndex = inputIndices[inputIndices.length - 2]
      
      // Mantem mensagens ate a penultima pergunta (inclusive)
      const prevMessages = messages.slice(0, targetIndex + 1)
      
      // Calcula o step baseado na quantidade de respostas do usuario
      const userResponses = prevMessages.filter(m => m.type === "user").length
      
      setMessages(prevMessages)
      setCurrentStep(userResponses + 1)
      setInputValue("")
      
      // Limpa o campo do formData relacionado a ultima resposta
      const lastInput = messages[inputIndices[inputIndices.length - 1]]
      if (lastInput?.field) {
        setFormData(prev => ({ ...prev, [lastInput.field!]: "" }))
      }
    }
  }

  const renderMessage = (message: Message, index: number) => {
    switch (message.type) {
      case "ai":
        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-3 items-start"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-secondary/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
              <p className="text-sm sm:text-base">{message.content}</p>
            </div>
          </motion.div>
        )

      case "user":
        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <div className="bg-accent text-accent-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
              <p className="text-sm sm:text-base">{message.content}</p>
            </div>
          </motion.div>
        )

      case "input":
        const isLastMessage = index === messages.length - 1
        if (!isLastMessage) return null

        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
              className="flex gap-2"
            >
              {message.inputType === "textarea" ? (
                <Textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={message.placeholder}
                  className="flex-1 min-h-[80px] bg-secondary/50 border-border/50 focus:border-accent resize-none"
                />
              ) : (
                <Input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type={message.inputType === "phone" ? "tel" : "text"}
                  value={inputValue}
                  onChange={(e) => {
                    let value = e.target.value
                    if (message.inputType === "phone") {
                      value = formatPhone(value)
                    } else if (message.inputType === "social") {
                      value = formatInstagram(value)
                    }
                    setInputValue(value)
                  }}
                  placeholder={message.placeholder}
                  className="flex-1 bg-secondary/50 border-border/50 focus:border-accent"
                />
              )}
              <div className="flex flex-col gap-2">
                <Button 
                  type="submit" 
                  size="icon"
                  className="bg-accent hover:bg-accent/90"
                  disabled={!inputValue && !message.optional}
                >
                  <Send className="w-4 h-4" />
                </Button>
                {message.optional && (
                  <Button 
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleSkip}
                    className="text-muted-foreground"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
            {/* Acoes secundarias */}
            <div className="flex items-center justify-between mt-2">
              {currentStep > 3 ? (
                <button 
                  onClick={handleGoBack}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Voltar
                </button>
              ) : <div />}
              {message.optional && (
                <p className="text-xs text-muted-foreground">
                  Clique na seta para pular
                </p>
              )}
            </div>
          </motion.div>
        )

      case "categories":
        const isLast = index === messages.length - 1
        if (!isLast) return null

        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2"
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border/50 hover:border-accent hover:bg-accent/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                </button>
              )
            })}
          </motion.div>
        )

      case "generating":
        if (!isGenerating && !isComplete) return null

        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-accent/10 animate-ping" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-medium">Criando sua Social Landing...</p>
                  <p className="text-sm text-muted-foreground">Isso leva menos de 30 segundos</p>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="animate-pulse">Gerando conteudo com IA</span>
                </div>
              </div>
            ) : isComplete ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Sucesso */}
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">Sua landing esta pronta!</h3>
                    <p className="text-muted-foreground mt-1">Veja como ficou</p>
                  </div>
                </div>

                {/* Preview em tempo real */}
                <div className="flex justify-center">
                  <LivePreview 
                    data={{
                      name: formData.name,
                      category: formData.category,
                      description: formData.description,
                      whatsapp: formData.whatsapp,
                      instagram: formData.instagram,
                    }}
                    className="w-[280px] h-[500px]"
                  />
                </div>

                {/* URL */}
                <div className="bg-secondary/50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">/{generatedSlug || slugifyLandingName(formData.name || "minha-marca")}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-accent" asChild>
                    <Link href={getLandingUrl(generatedSlug || slugifyLandingName(formData.name || "minha-marca"))} target="_blank">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>

                {/* Completude */}
                <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Completude</span>
                    <span className="text-sm text-accent font-semibold">{completeness}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${completeness}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-accent rounded-full" 
                    />
                  </div>
                  
                  {/* Botao Completar com IA */}
                  {aiGenerableItems.length > 0 && (
                    <button
                      onClick={handleGenerateWithAI}
                      disabled={isGeneratingAI}
                      className="w-full mb-4 p-3 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 hover:border-accent/50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                            {isGeneratingAI ? (
                              <Loader2 className="w-5 h-5 text-accent animate-spin" />
                            ) : (
                              <Wand2 className="w-5 h-5 text-accent" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium">Completar com IA</p>
                            <p className="text-xs text-muted-foreground">
                              Gera {aiGenerableItems.length} itens automaticamente
                            </p>
                          </div>
                        </div>
                        <Sparkles className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                      </div>
                    </button>
                  )}

                  {topMissingItems.length > 0 && (
                    <>
                      <p className="text-xs text-muted-foreground mb-3">
                        Adicione mais informacoes:
                      </p>
                      <div className="space-y-2">
                        {topMissingItems.map((item, i) => {
                          const Icon = item.icon
                          return (
                            <button
                              key={i}
                              onClick={() => handleAddMissingItem(item.field)}
                              className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                                </div>
                                <span>Adicionar {item.label.toLowerCase()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-accent text-xs font-medium">+{item.value}%</span>
                                <Plus className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                              </div>
                            </button>
                          )
                        })}
                      </div>
                      
                      {/* Ver mais */}
                      {Object.keys(missingItemsByGroup).length > 0 && (
                        <button
                          onClick={() => setShowAllItems(!showAllItems)}
                          className="w-full mt-3 p-2 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
                        >
                          {showAllItems ? "Ver menos" : `Ver todos (${Object.values(missingItemsByGroup).flat().length} itens)`}
                          <ChevronRight className={`w-3 h-3 transition-transform ${showAllItems ? "rotate-90" : ""}`} />
                        </button>
                      )}
                      
                      {/* Lista expandida por grupo */}
                      {showAllItems && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 space-y-4 border-t border-border/50 pt-4"
                        >
                          {COMPLETENESS_GROUPS.map(group => {
                            const items = missingItemsByGroup[group.id]
                            if (!items || items.length === 0) return null
                            
                            return (
                              <div key={group.id}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {group.label}
                                  </span>
                                  {group.id === "conteudo" && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent">
                                      IA
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-1.5">
                                  {items.map((item, i) => {
                                    const Icon = item.icon
                                    return (
                                      <button
                                        key={i}
                                        onClick={() => handleAddMissingItem(item.field)}
                                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors text-sm group"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Icon className="w-4 h-4 text-muted-foreground" />
                                          <span className="text-sm">{item.label}</span>
                                        </div>
                                        <span className="text-accent text-xs">+{item.value}%</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </motion.div>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                {isPublished ? (
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                      <Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="font-medium text-green-500">Publicado com sucesso!</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href={getEditorUrl()}>
                          Editar
                        </Link>
                      </Button>
                      <Button className="flex-1 bg-accent hover:bg-accent/90" asChild>
                        <Link href={getLandingUrl(generatedSlug)}>
                          Ver minha landing
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={getEditorUrl()}>
                        Editar mais
                      </Link>
                    </Button>
                    <Button 
                      className="flex-1 bg-accent hover:bg-accent/90"
                      onClick={handlePublish}
                      disabled={isPublishing}
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Publicando...
                        </>
                      ) : (
                        <>
                          Publicar
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : null}
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/criar" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="font-medium text-sm">Social Landing</span>
          </div>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Content - Two Columns on Desktop */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        {/* Chat Column */}
        <main className="flex-1 px-4 py-6 lg:pr-8 lg:border-r border-border/50 lg:max-w-xl">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, index) => renderMessage(msg, index))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Progress - Mobile and inside chat on desktop */}
          {!isComplete && (
            <div className="mt-8 lg:mt-12">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Progresso</span>
                <span>{Math.round((currentStep / CONVERSATION_FLOW.length) * 100)}%</span>
              </div>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / CONVERSATION_FLOW.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </main>

        {/* Preview Column - Always visible on desktop */}
        <aside className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:py-8 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)]">
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs text-muted-foreground">Preview em tempo real</p>
            <LivePreview 
              data={{
                name: formData.name,
                category: formData.category,
                description: formData.description,
                whatsapp: formData.whatsapp,
                instagram: formData.instagram,
                email: formData.email,
              }}
              isLoading={isGenerating}
              loadingStep={isGenerating ? "Gerando com IA..." : undefined}
              className="w-[300px] h-[600px]"
            />
          </div>
        </aside>
      </div>
    </div>
  )
}

function CriarNovoLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-muted-foreground">Carregando assistente...</p>
      </div>
    </div>
  )
}

export default function CriarNovoPage() {
  return (
    <Suspense fallback={<CriarNovoLoading />}>
      <CriarNovoContent />
    </Suspense>
  )
}
