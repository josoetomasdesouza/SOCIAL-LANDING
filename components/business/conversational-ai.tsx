"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Loader2, Plus, Send, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ConversationAction, ConversationMessage, BusinessModel } from "@/lib/business-types"

const USER_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"

export interface ConversationContextItem {
  id: string
  title: string
  image: string
  subtitle?: string
}

interface ConversationalAIProps {
  brandLogo: string
  brandName: string
  businessModel?: BusinessModel
  initialMessages?: ConversationMessage[]
  placeholder?: string
  onAction?: (action: ConversationAction) => void
  onSendMessage?: (message: string) => void
  className?: string
  contextItems?: ConversationContextItem[]
  onRemoveContext?: (contextId: string) => void
}

function summarizeContext(items: ConversationContextItem[]) {
  const titles = items
    .map((item) => item.title.trim())
    .filter(Boolean)
    .slice(0, 2)

  if (titles.length === 0) return ""
  if (titles.length === 1) return titles[0]
  return `${titles[0]} e ${titles[1]}`
}

function buildMockReply(brandName: string, userMessage: string, contextItems: ConversationContextItem[]) {
  const responseIndex = userMessage.trim().length % 3
  const contextLabel = summarizeContext(contextItems)

  if (contextLabel) {
    const contextualReplies = [
      `Sobre ${contextLabel}, isso parece combinar bem com o que voce selecionou. Posso te mostrar o melhor caminho.`,
      `${contextLabel} ajuda bastante nessa escolha. Se quiser, eu resumo o que faz mais sentido.`,
      `Levando em conta ${contextLabel}, eu seguiria por uma opcao mais direta. Posso te indicar agora.`,
    ]

    return contextualReplies[responseIndex]
  }

  const genericReplies = [
    `${brandName} pode te ajudar com isso rapidinho. Posso te mostrar a melhor opcao?`,
    `Claro. Posso te orientar sobre ${brandName} de um jeito bem direto.`,
    `Sem problema. Eu resumo o principal sobre ${brandName} pra voce.`,
  ]

  return genericReplies[responseIndex]
}

export function ConversationalAI({
  brandLogo,
  brandName,
  initialMessages,
  placeholder = "Pergunte sobre a marca...",
  onSendMessage,
  className,
  contextItems = [],
  onRemoveContext,
}: ConversationalAIProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>(initialMessages || [])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const hasConversation = messages.length > 0 || isTyping
  const resolvedPlaceholder = contextItems.length > 0 ? "Pergunte sobre os itens selecionados..." : placeholder

  const handleSendMessage = () => {
    const nextMessage = inputValue.trim()
    if (!nextMessage || isTyping) return

    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: nextMessage,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)
    onSendMessage?.(nextMessage)

    window.setTimeout(() => {
      const aiMessage: ConversationMessage = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: buildMockReply(brandName, nextMessage, contextItems),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 700)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSendMessage()
  }

  return (
    <div className={cn("pointer-events-none fixed inset-x-0 bottom-0 z-30", className)}>
      <div className="mx-auto flex max-w-lg flex-col gap-3 px-4 pb-4 sm:max-w-xl md:max-w-2xl lg:max-w-[600px]">
        {hasConversation && (
          <section className="pointer-events-auto overflow-hidden rounded-[30px] border border-border/60 bg-background/92 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.45)] backdrop-blur-xl animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <div className="px-4 pt-3">
              <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-border/80" />
              <div className="flex items-center justify-between gap-3 pb-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src={brandLogo}
                    alt={brandName}
                    width={36}
                    height={36}
                    className="rounded-full border border-border/60 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{brandName}</p>
                    <p className="text-xs text-muted-foreground">Conversa principal</p>
                  </div>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
                  Na conversa
                </Badge>
              </div>
            </div>

            {contextItems.length > 0 && (
              <div className="border-y border-border/50 px-4 py-3">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {contextItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative flex w-[132px] shrink-0 overflow-hidden rounded-2xl border border-border/50 bg-secondary/40"
                    >
                      <div className="relative h-[88px] w-[72px] shrink-0 bg-secondary">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between p-2.5">
                        {item.subtitle ? (
                          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            {item.subtitle}
                          </span>
                        ) : null}
                        <p className="line-clamp-3 text-xs font-medium leading-snug text-foreground">
                          {item.title}
                        </p>
                      </div>
                      {onRemoveContext ? (
                        <button
                          type="button"
                          onClick={() => onRemoveContext(item.id)}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background"
                          aria-label={`Remover ${item.title}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={cn("space-y-3 overflow-y-auto px-4 py-4", contextItems.length > 0 ? "max-h-[28vh]" : "max-h-[34vh]")}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex items-end gap-2.5", message.role === "user" && "justify-end")}
                >
                  {message.role !== "user" ? (
                    <Image
                      src={brandLogo}
                      alt={brandName}
                      width={28}
                      height={28}
                      className="rounded-full border border-border/60 object-cover"
                    />
                  ) : null}

                  <div
                    className={cn(
                      "max-w-[82%] rounded-[24px] px-4 py-3 text-sm leading-relaxed shadow-sm",
                      message.role === "user"
                        ? "rounded-br-md bg-foreground text-background"
                        : "rounded-bl-md bg-secondary text-foreground"
                    )}
                  >
                    {message.content}
                  </div>

                  {message.role === "user" ? (
                    <Image
                      src={USER_AVATAR}
                      alt="Voce"
                      width={28}
                      height={28}
                      className="rounded-full border border-border/60 object-cover"
                    />
                  ) : null}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-end gap-2.5">
                  <Image
                    src={brandLogo}
                    alt={brandName}
                    width={28}
                    height={28}
                    className="rounded-full border border-border/60 object-cover"
                  />
                  <div className="rounded-[24px] rounded-bl-md bg-secondary px-4 py-3 text-foreground shadow-sm">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </section>
        )}

        <div className="pointer-events-auto rounded-[30px] border border-border/60 bg-background/95 p-3 shadow-[0_18px_40px_-26px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
            <button
              type="button"
              disabled
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground/70"
              aria-label="Adicionar contexto"
            >
              <Plus className="h-5 w-5" />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-secondary/70 px-4 py-2.5">
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
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Enviar mensagem"
              >
                {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
