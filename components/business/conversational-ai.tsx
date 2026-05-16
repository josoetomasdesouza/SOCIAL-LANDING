"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, Loader2, Plus, Send, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ConversationMessage } from "@/lib/business-types"

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
  initialMessages?: ConversationMessage[]
  placeholder?: string
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
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping, isMinimized])

  const hasConversation = messages.length > 0 || isTyping
  const resolvedPlaceholder = contextItems.length > 0 ? "Pergunte sobre os itens selecionados..." : placeholder
  const showContextRow = contextItems.length > 0
  const showExpandedConversation = hasConversation && !isMinimized

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
    setIsMinimized(false)
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

  const handleCloseConversation = () => {
    setMessages([])
    setIsTyping(false)
    setIsMinimized(false)
  }

  return (
    <div className={cn("pointer-events-none fixed inset-x-0 bottom-0 z-30", className)}>
      <div className="mx-auto max-w-lg px-4 pb-4 sm:max-w-xl md:max-w-2xl lg:max-w-[600px]">
        <section className="pointer-events-auto overflow-hidden rounded-[28px] border border-border/60 bg-background/94 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          {hasConversation && (
            <div className="border-b border-border/50">
              <div className="px-4 pt-3">
                <div className="mx-auto mb-2.5 h-1 w-11 rounded-full bg-border/80" />
              </div>

              <div className="flex items-center gap-3 px-4 pb-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Image
                    src={brandLogo}
                    alt={brandName}
                    width={34}
                    height={34}
                    className="rounded-full border border-border/60 object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{brandName}</p>
                      <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[10px] font-medium">
                        Na conversa
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {isMinimized ? "Conversa minimizada" : "Conversa principal"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsMinimized((prev) => !prev)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label={isMinimized ? "Expandir conversa" : "Minimizar conversa"}
                  >
                    {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseConversation}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Fechar conversa"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {showContextRow && (
                <div className="border-t border-border/50 px-4 py-2.5">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {contextItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex h-11 min-w-[156px] shrink-0 items-center gap-2 rounded-full border border-border/50 bg-secondary/55 pr-1.5"
                      >
                        <div className="relative h-11 w-11 overflow-hidden rounded-full">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>

                        <div className="min-w-0 flex-1">
                          {item.subtitle ? (
                            <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              {item.subtitle}
                            </p>
                          ) : null}
                          <p className="truncate text-xs font-medium text-foreground">{item.title}</p>
                        </div>

                        {onRemoveContext ? (
                          <button
                            type="button"
                            onClick={() => onRemoveContext(item.id)}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground transition-colors hover:text-foreground"
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

              {showExpandedConversation ? (
                <div className={cn("space-y-3 overflow-y-auto px-4 py-4", showContextRow ? "max-h-[26vh]" : "max-h-[32vh]")}>
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
                          "max-w-[82%] rounded-[22px] px-4 py-3 text-sm leading-relaxed shadow-sm",
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
                      <div className="rounded-[22px] rounded-bl-md bg-secondary px-4 py-3 text-foreground shadow-sm">
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
              ) : (
                <div className="px-4 pb-3">
                  <p className="text-xs text-muted-foreground">
                    {showContextRow ? "Contexto pronto para continuar a conversa." : "A conversa continua aqui quando voce enviar a proxima mensagem."}
                  </p>
                </div>
              )}
            </div>
          )}

          {!hasConversation && showContextRow && (
            <div className="border-b border-border/50 px-4 py-2.5">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {contextItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex h-11 min-w-[156px] shrink-0 items-center gap-2 rounded-full border border-border/50 bg-secondary/55 pr-1.5"
                  >
                    <div className="relative h-11 w-11 overflow-hidden rounded-full">
                      <Image src={item.image} alt={item.title} fill className="object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      {item.subtitle ? (
                        <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {item.subtitle}
                        </p>
                      ) : null}
                      <p className="truncate text-xs font-medium text-foreground">{item.title}</p>
                    </div>

                    {onRemoveContext ? (
                      <button
                        type="button"
                        onClick={() => onRemoveContext(item.id)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground transition-colors hover:text-foreground"
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

          <form onSubmit={handleSubmit} className="flex items-center gap-2.5 p-2.5">
            <button
              type="button"
              disabled
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground/70"
              aria-label="Adicionar contexto"
            >
              <Plus className="h-4 w-4" />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-secondary/75 px-4 py-2.5">
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
        </section>
      </div>
    </div>
  )
}
