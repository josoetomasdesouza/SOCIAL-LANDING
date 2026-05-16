"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Send, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ConversationFeedCarousel,
  type ConversationFeedCarouselProduct,
} from "@/components/business/conversation-feed-carousel"
import type { ConversationMessage, ConversationOption, ConversationAction, BusinessModel } from "@/lib/business-types"

// Avatar do usuario (padrao)
const USER_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"

interface ConversationalAIProps {
  brandLogo: string
  brandName: string
  businessModel: BusinessModel
  initialMessages?: ConversationMessage[]
  mockSearchProducts?: ConversationFeedCarouselProduct[]
  placeholder?: string
  onAction?: (action: ConversationAction) => void
  onSendMessage?: (message: string) => void
  className?: string
  autoScrollMessages?: boolean
}

type ChatMessage = ConversationMessage & {
  mockProducts?: ConversationFeedCarouselProduct[]
}

// Fluxos pre-definidos por modelo de negocio
const AI_FLOWS: Record<BusinessModel, ConversationMessage[]> = {
  appointment: [
    { id: "1", role: "ai", content: "Oi! Vi que voce esta explorando nossos servicos. Posso te mostrar alguns estilos que estao em alta esse mes?" },
  ],
  ecommerce: [
    { id: "1", role: "ai", content: "Esse produto tem sido muito procurado! Ja vendemos mais de 500 unidades so essa semana. Quer saber o que as pessoas estao achando?" },
  ],
  courses: [
    { id: "1", role: "ai", content: "Esse curso ja formou mais de 2.000 alunos! Quer ver um preview gratuito de uma das aulas?" },
  ],
  restaurant: [
    { id: "1", role: "ai", content: "Esse prato e um dos favoritos da casa! Combina muito bem com nosso vinho da casa. Quer adicionar ao pedido?" },
  ],
  realestate: [
    { id: "1", role: "ai", content: "Esse imovel recebeu 15 visitas so essa semana! Quer agendar uma visita antes que seja reservado?" },
  ],
  professionals: [
    { id: "1", role: "ai", content: "Dr. Silva tem horarios disponiveis ainda essa semana. Posso verificar a agenda pra voce?" },
  ],
  events: [
    { id: "1", role: "ai", content: "Os ingressos VIP estao quase esgotados! Restam apenas 23 disponiveis. Quer garantir o seu?" },
  ],
  gym: [
    { id: "1", role: "ai", content: "Nosso plano trimestral esta com 30% de desconto essa semana! Quer conhecer a estrutura antes de assinar?" },
  ],
  health: [
    { id: "1", role: "ai", content: "Dra. Ana tem um horario disponivel amanha as 14h. Esse horario funciona pra voce?" },
  ],
}

// Respostas contextuais baseadas em keywords
const CONTEXTUAL_RESPONSES: Record<string, string[]> = {
  preco: [
    "Claro! Esse item custa {price}. Posso te ajudar com mais alguma informacao?",
    "O valor e {price}, mas temos condicoes especiais de pagamento. Quer saber mais?"
  ],
  desconto: [
    "Temos algumas promocoes ativas! Quer ver as opcoes com desconto?",
    "Se voce fechar hoje, consigo aplicar um cupom de 10% pra voce!"
  ],
  horario: [
    "Temos horarios disponiveis hoje e amanha. Qual periodo seria melhor pra voce?",
    "Deixa eu verificar... Temos opcoes de manha e tarde. Qual prefere?"
  ],
  entrega: [
    "A entrega para sua regiao leva em media 3-5 dias uteis. O frete e gratis acima de R$ 199!",
    "Calculei aqui: entrega prevista para {date}. Quer finalizar o pedido?"
  ],
  avaliacoes: [
    "Esse item tem 4.8 estrelas com mais de 200 avaliacoes! Quer ver alguns comentarios?",
    "Os clientes adoram! 95% recomendam. Posso mostrar os depoimentos?"
  ],
  pagamento: [
    "Aceitamos cartao, Pix e boleto. No Pix tem 5% de desconto!",
    "Da pra parcelar em ate 12x sem juros. Quer seguir pra pagamento?"
  ],
}

export function ConversationalAI({
  brandLogo,
  brandName,
  businessModel,
  initialMessages,
  mockSearchProducts = [],
  placeholder = "Digite sua mensagem...",
  onAction,
  onSendMessage,
  className = "",
  autoScrollMessages = true,
}: ConversationalAIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages || AI_FLOWS[businessModel] || []
  )
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (!autoScrollMessages) return
    scrollToBottom()
  }, [autoScrollMessages, messages])

  const shouldShowMockProductResults = (message: string) => {
    if (businessModel !== "ecommerce" || mockSearchProducts.length === 0) return false

    const lowerMessage = message.toLowerCase()
    const isProductIntent =
      lowerMessage.includes("produto") ||
      lowerMessage.includes("produtos") ||
      lowerMessage.includes("skincare")
    const isFacialIntent =
      lowerMessage.includes("facial") ||
      lowerMessage.includes("faciais") ||
      lowerMessage.includes("rosto") ||
      lowerMessage.includes("pele")

    return isProductIntent && isFacialIntent
  }

  const buildAiResponse = (message: string): ChatMessage => {
    if (shouldShowMockProductResults(message)) {
      return {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: "Encontrei alguns produtos que combinam com isso.",
        mockProducts: mockSearchProducts,
      }
    }

    return {
      id: `ai-${Date.now()}`,
      role: "ai",
      content: findContextualResponse(message),
    }
  }

  const findContextualResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()
    
    for (const [keyword, responses] of Object.entries(CONTEXTUAL_RESPONSES)) {
      if (lowerMessage.includes(keyword)) {
        return responses[Math.floor(Math.random() * responses.length)]
      }
    }
    
    // Resposta padrao se nenhum keyword for encontrado
    const defaultResponses = [
      "Entendi! Deixa eu verificar isso pra voce...",
      "Boa pergunta! Vou te ajudar com isso.",
      "Claro, posso te ajudar com isso. Me conta mais detalhes?",
    ]
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const trimmedValue = inputValue.trim()
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedValue,
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)
    
    onSendMessage?.(trimmedValue)

    // Simula resposta da IA apos delay
    setTimeout(() => {
      const aiResponse = buildAiResponse(userMessage.content)
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleOptionClick = (option: ConversationOption) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: option.label
    }
    setMessages(prev => [...prev, userMessage])

    if (option.action) {
      onAction?.(option.action)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isExpanded && messages.length > 0) {
    // Modo compacto - mostra apenas ultima mensagem da IA
    const lastAiMessage = [...messages].reverse().find(m => m.role === "ai")
    
    return (
      <div className={`${className}`}>
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full text-left"
        >
          <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors">
            <Image
              src={brandLogo}
              alt={brandName}
              width={32}
              height={32}
              className="rounded-full ring-2 ring-accent/20 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground line-clamp-2">
                {lastAiMessage?.content}
              </p>
              <p className="text-xs text-accent mt-1 font-medium">
                Toque para continuar a conversa
              </p>
            </div>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center gap-2">
          <Image
            src={brandLogo}
            alt={brandName}
            width={28}
            height={28}
            className="rounded-full"
          />
          <div>
            <p className="text-sm font-medium text-foreground">{brandName}</p>
            <p className="text-xs text-muted-foreground">Online agora</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="p-3 space-y-3 max-h-[300px] overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <Image
              src={message.role === "user" ? USER_AVATAR : brandLogo}
              alt={message.role === "user" ? "Voce" : brandName}
              width={28}
              height={28}
              className="rounded-full flex-shrink-0"
            />
            <div className={`flex max-w-[80%] flex-col space-y-2 ${message.role === "user" ? "items-end" : ""}`}>
              <div
                className={`px-3 py-2 rounded-2xl text-sm ${
                  message.role === "user"
                    ? "bg-accent text-accent-foreground rounded-br-md"
                    : "bg-secondary text-foreground rounded-bl-md"
                }`}
              >
                {message.content}
              </div>

              {message.role === "ai" && message.mockProducts && message.mockProducts.length > 0 && (
                <ConversationFeedCarousel products={message.mockProducts} />
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2">
            <Image
              src={brandLogo}
              alt={brandName}
              width={28}
              height={28}
              className="rounded-full"
            />
            <div className="bg-secondary px-4 py-2 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {/* Quick options */}
        {messages.length > 0 && messages[messages.length - 1].options && (
          <div className="flex flex-wrap gap-2 pt-2">
            {messages[messages.length - 1].options?.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className="px-3 py-1.5 text-sm bg-accent/10 text-accent rounded-full hover:bg-accent/20 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50 bg-secondary/20">
        <div className="flex items-center gap-2">
          <Image
            src={USER_AVATAR}
            alt="Voce"
            width={28}
            height={28}
            className="rounded-full flex-shrink-0"
          />
          <div className="flex-1 flex items-center gap-2 bg-background rounded-full px-4 py-2 border border-border/50">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="text-accent hover:text-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
