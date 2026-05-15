"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Loader2, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ConversationMessage, BusinessModel } from "@/lib/business-types"

const USER_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"

type ContextItemType = "video" | "video-vertical" | "product" | "news" | "review" | "social"

export interface ConversationContextItem {
  id: string
  title: string
  type: ContextItemType
  description?: string
}

interface ConversationalAIProps {
  brandLogo: string
  brandName: string
  businessModel: BusinessModel
  initialMessages?: ConversationMessage[]
  placeholder?: string
  onSendMessage?: (message: string) => void
  onRemoveContext?: (id: string) => void
  onClearContext?: () => void
  contextItems?: ConversationContextItem[]
  className?: string
}

const MODEL_BRAND_HINTS: Record<BusinessModel, string> = {
  appointment: "servicos, estilos e horarios",
  ecommerce: "produtos, ofertas e conteudos",
  courses: "cursos, aulas e trilhas",
  restaurant: "pratos, reservas e destaques",
  realestate: "imoveis, bairros e visitas",
  professionals: "servicos, casos e conteudos",
  events: "ingressos, lineup e setores",
  gym: "planos, aulas e estrutura",
  health: "especialidades, consultas e conteudos",
  influencer: "links, posts e conteudos",
  personal: "projetos, posts e destaques",
  institutional: "projetos, conteudos e a marca",
}

const REVIEW_KEYWORDS = [
  "atendimento",
  "acabamento",
  "corte",
  "barba",
  "entrega",
  "qualidade",
  "ambiente",
  "preco",
  "duracao",
  "resultado",
]

const normalizeText = (value: string) =>
  value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

const truncateTitle = (value: string, max = 48) =>
  value.length > max ? `${value.slice(0, max - 1)}...` : value

const getDominantType = (items: ConversationContextItem[]): ContextItemType | null => {
  if (items.length === 0) return null

  const counts = items.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.type] = (accumulator[item.type] || 0) + 1
    return accumulator
  }, {})

  const [dominantType] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return dominantType as ContextItemType
}

const getReviewHighlights = (items: ConversationContextItem[]) => {
  const haystack = normalizeText(
    items.map((item) => `${item.title} ${item.description || ""}`).join(" ")
  )

  const matches = REVIEW_KEYWORDS.filter((keyword) => haystack.includes(keyword))
  const highlights = matches.slice(0, 2)

  if (highlights.length === 0) {
    return "a experiencia geral"
  }

  if (highlights.length === 1) {
    return highlights[0]
  }

  return `${highlights[0]} e ${highlights[1]}`
}

const buildFallbackResponse = (brandName: string, businessModel: BusinessModel, message: string) => {
  const normalizedMessage = normalizeText(message)
  const hint = MODEL_BRAND_HINTS[businessModel]

  if (normalizedMessage.includes("onde") || normalizedMessage.includes("como")) {
    return `Posso te orientar pela ${brandName}. Se quiser, eu te guio pelos principais ${hint}.`
  }

  if (normalizedMessage.includes("melhor") || normalizedMessage.includes("indica") || normalizedMessage.includes("recom")) {
    return `Posso te ajudar a encontrar o melhor caminho dentro da ${brandName}. Comecamos por ${hint}.`
  }

  return `Posso te ajudar a encontrar produtos, servicos ou conteudos da ${brandName}.`
}

const buildContextualResponse = ({
  brandName,
  businessModel,
  contextItems,
  message,
}: {
  brandName: string
  businessModel: BusinessModel
  contextItems: ConversationContextItem[]
  message: string
}) => {
  if (contextItems.length === 0) {
    return buildFallbackResponse(brandName, businessModel, message)
  }

  const normalizedMessage = normalizeText(message)
  const titles = contextItems.map((item) => `"${truncateTitle(item.title, 42)}"`)
  const firstTitle = titles[0]
  const secondTitle = titles[1]
  const uniqueTypes = new Set(contextItems.map((item) => item.type))
  const dominantType = getDominantType(contextItems)
  const wantsComparison =
    contextItems.length > 1 &&
    (normalizedMessage.includes("compar") ||
      normalizedMessage.includes("diferen") ||
      normalizedMessage.includes("qual") ||
      normalizedMessage.includes("melhor"))

  if (uniqueTypes.size > 1) {
    return wantsComparison && secondTitle
      ? `Cruzando ${firstTitle} com ${secondTitle}, a conversa fica mais sobre a marca como um todo do que sobre um item isolado. Posso aprofundar por qual deles voce quer comecar.`
      : `Estou considerando ${titles.join(", ")} ao mesmo tempo. Isso me da um contexto mais amplo sobre a ${brandName} e ajuda a responder de forma mais contextual.`
  }

  switch (dominantType) {
    case "product":
      if (wantsComparison && secondTitle) {
        return `Entre os itens selecionados, ${firstTitle} parece o ponto de partida mais forte agora. Se quiser, eu comparo melhor com ${secondTitle}.`
      }

      return contextItems.length > 1
        ? `Entre os itens selecionados, ${firstTitle} chama mais atencao neste momento. Posso continuar a partir dele ou cruzar com os outros produtos escolhidos.`
        : `Sobre ${firstTitle}, ele parece um bom atalho para explorar os produtos da ${brandName} sem complicar a jornada.`

    case "review":
      return contextItems.length > 1
        ? `Essas avaliacoes destacam principalmente ${getReviewHighlights(contextItems)}. ${firstTitle} ajuda bem a sentir esse tom da experiencia.`
        : `${firstTitle} destaca principalmente ${getReviewHighlights(contextItems)}, o que ja passa uma leitura contextual bem clara da experiencia com a ${brandName}.`

    case "video":
    case "video-vertical":
      return contextItems.length > 1
        ? `Nos conteudos selecionados, ${firstTitle} e o melhor ponto de entrada. Se quiser, eu junto os principais pontos dele com ${secondTitle || "os outros videos"}.`
        : `${firstTitle} parece o conteudo mais direto para explicar esse assunto. Posso resumir os pontos principais sem sair da experiencia do feed.`

    case "news":
      return contextItems.length > 1
        ? `Pelas materias selecionadas, ${firstTitle} puxa o contexto principal. Se quiser, eu conecto essa leitura com ${secondTitle || "as outras noticias"}.`
        : `${firstTitle} ja da um bom resumo do que a ${brandName} quer destacar agora. Posso seguir por esse recorte.`

    case "social":
    default:
      return contextItems.length > 1
        ? `Entre os posts selecionados, ${firstTitle} transmite melhor o tom da ${brandName}. Posso continuar a conversa a partir dele.`
        : `${firstTitle} ajuda a sentir o estilo da ${brandName} de um jeito mais leve e natural.`
  }
}

export function ConversationalAI({
  brandLogo,
  brandName,
  businessModel,
  initialMessages,
  placeholder = "Fale com a marca...",
  onSendMessage,
  onRemoveContext,
  onClearContext,
  contextItems = [],
  className = "",
}: ConversationalAIProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>(initialMessages || [])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isConversationOpen, setIsConversationOpen] = useState(Boolean(initialMessages?.length))
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const lastAiMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "ai"),
    [messages]
  )

  const resolvedPlaceholder = contextItems.length > 0
    ? `Pergunte sobre ${truncateTitle(contextItems[0].title, 32)}${contextItems.length > 1 ? " e mais" : ""}...`
    : placeholder

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping, isConversationOpen])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleSendMessage = () => {
    const trimmedMessage = inputValue.trim()
    if (!trimmedMessage || isTyping) return

    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedMessage,
    }

    setMessages((previous) => [...previous, userMessage])
    setInputValue("")
    setIsTyping(true)
    setIsConversationOpen(true)
    onSendMessage?.(trimmedMessage)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      const aiResponse: ConversationMessage = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: buildContextualResponse({
          brandName,
          businessModel,
          contextItems,
          message: trimmedMessage,
        }),
      }

      setMessages((previous) => [...previous, aiResponse])
      setIsTyping(false)
    }, 700)
  }

  return (
    <div className={cn("fixed inset-x-0 bottom-0 z-40 px-3 pb-3", className)}>
      <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px] pointer-events-none">
        {!isConversationOpen && lastAiMessage && (
          <div className="mb-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsConversationOpen(true)}
              className="w-full rounded-2xl border border-border/50 bg-card/95 px-4 py-3 text-left shadow-sm backdrop-blur-xl"
            >
              <div className="flex items-start gap-3">
                <Image
                  src={brandLogo}
                  alt={brandName}
                  width={32}
                  height={32}
                  className="rounded-full ring-1 ring-border/50"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-foreground">{lastAiMessage.content}</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {isConversationOpen && (messages.length > 0 || isTyping) && (
          <div className="mb-2 overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-sm backdrop-blur-xl pointer-events-auto">
            <div className="flex items-center justify-between border-b border-border/50 bg-secondary/20 px-4 py-3">
              <div className="flex items-center gap-3">
                <Image
                  src={brandLogo}
                  alt={brandName}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{brandName}</p>
                  <p className="text-xs text-muted-foreground">Online agora</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConversationOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Minimizar conversa"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[34vh] space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex items-end gap-2.5", message.role === "user" && "flex-row-reverse")}
                >
                  <Image
                    src={message.role === "user" ? USER_AVATAR : brandLogo}
                    alt={message.role === "user" ? "Voce" : brandName}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                  <div
                    className={cn(
                      "max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                      message.role === "user"
                        ? "rounded-br-md bg-accent text-accent-foreground"
                        : "rounded-bl-md bg-secondary text-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-end gap-2.5">
                  <Image src={brandLogo} alt={brandName} width={28} height={28} className="rounded-full" />
                  <div className="rounded-2xl rounded-bl-md bg-secondary px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "120ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "240ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <div className="rounded-[28px] border border-border/60 bg-background/95 p-3 shadow-2xl backdrop-blur-xl pointer-events-auto">
          {contextItems.length > 0 && (
            <div className="mb-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Contexto da conversa</p>
                {contextItems.length > 1 && onClearContext && (
                  <button
                    type="button"
                    onClick={onClearContext}
                    className="text-xs font-medium text-accent transition-colors hover:text-accent/80"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {contextItems.map((item) => (
                  <div
                    key={item.id}
                    className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-secondary px-3 py-2"
                  >
                    <span className="max-w-[180px] truncate text-xs text-foreground">{truncateTitle(item.title, 34)}</span>
                    {onRemoveContext && (
                      <button
                        type="button"
                        onClick={() => onRemoveContext(item.id)}
                        className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                        aria-label={`Remover ${item.title} do contexto`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end gap-2">
            <Image src={USER_AVATAR} alt="Voce" width={32} height={32} className="rounded-full" />
            <div className="flex flex-1 items-end gap-2 rounded-[24px] border border-border/60 bg-secondary/40 px-4 py-2.5">
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder={resolvedPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Enviar mensagem"
              >
                {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
