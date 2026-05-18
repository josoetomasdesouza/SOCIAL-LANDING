"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, Loader2, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ConversationContextPayload, ConversationMessage } from "@/lib/business-types"
import { ConversationContextChipVisual } from "@/components/business/conversation-context-chip-visual"
import type {
  ConversationResponseResolver,
  ConversationVisualBlock,
  ConversationVisualBlockRenderer,
} from "@/lib/mock-data/conversational-search"

const COMPOSER_MASK_TOP_OFFSET_PX = 8
const COMPOSER_SURFACE_COLOR = "rgba(32,40,49,0.92)"
const CONVERSATION_DOODLE_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180' fill='none'%3E%3Cg stroke='%23242931' stroke-opacity='0.36' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 34c6-8 18-8 24 0 6 8 18 8 24 0'/%3E%3Cpath d='M112 22l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2 5-10Z'/%3E%3Cpath d='M36 96c0-7 6-13 13-13s13 6 13 13-6 13-13 13-13-6-13-13Z'/%3E%3Cpath d='M119 82c10-12 28-12 38 0'/%3E%3Cpath d='M121 92c8 9 20 9 28 0'/%3E%3Cpath d='M22 145c11-10 31-10 42 0'/%3E%3Cpath d='M74 126h20c7 0 12 5 12 12s-5 12-12 12H74c-7 0-12-5-12-12s5-12 12-12Z'/%3E%3Cpath d='M132 132c0-8 7-15 15-15s15 7 15 15-7 15-15 15-15-7-15-15Z'/%3E%3Cpath d='M92 60c0-6 5-11 11-11s11 5 11 11-5 11-11 11-11-5-11-11Z'/%3E%3C/g%3E%3C/svg%3E\")"

export type ConversationContextItem = ConversationContextPayload

interface ConversationalAIProps {
  brandLogo: string
  brandName: string
  initialMessages?: ConversationMessage[]
  placeholder?: string
  onSendMessage?: (message: string) => void
  className?: string
  contextItems?: ConversationContextItem[]
  hiddenContextIds?: string[]
  onRemoveContext?: (contextId: string) => void
  onCloseConversation?: () => void
  responseResolver?: ConversationResponseResolver
  renderVisualBlock?: ConversationVisualBlockRenderer
}

type ConversationRuntimeMessage = ConversationMessage & {
  visualBlock?: ConversationVisualBlock
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
  hiddenContextIds = [],
  onRemoveContext,
  onCloseConversation,
  responseResolver,
  renderVisualBlock,
}: ConversationalAIProps) {
  const [messages, setMessages] = useState<ConversationRuntimeMessage[]>(initialMessages || [])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const replyTimeoutRef = useRef<number | null>(null)
  const activeContextIdsRef = useRef<string[]>([])
  const pendingContextIdsRef = useRef<string[]>([])
  const composerShellRef = useRef<HTMLDivElement>(null)
  const composerMaskRef = useRef<HTMLDivElement>(null)
  const hiddenContextIdSet = useMemo(() => new Set(hiddenContextIds), [hiddenContextIds])

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping, isMinimized])

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current !== null) {
        window.clearTimeout(replyTimeoutRef.current)
      }
    }
  }, [])

  const hasConversation = messages.length > 0 || isTyping
  const resolvedPlaceholder = contextItems.length > 0 ? "Pergunte sobre os itens selecionados..." : placeholder
  const showContextRow = !hasConversation && contextItems.length > 0
  const showExpandedConversation = hasConversation && !isMinimized

  useLayoutEffect(() => {
    const shellElement = composerShellRef.current
    const maskElement = composerMaskRef.current

    if (!shellElement || !maskElement) {
      return
    }

    const updateMaskBounds = () => {
      const composerShellTop = shellElement.getBoundingClientRect().top
      const resolvedTop = Math.max(0, Math.round(composerShellTop - COMPOSER_MASK_TOP_OFFSET_PX))
      maskElement.style.top = `${resolvedTop}px`
    }

    updateMaskBounds()

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => updateMaskBounds()) : null

    resizeObserver?.observe(shellElement)
    window.addEventListener("resize", updateMaskBounds, { passive: true })

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener("resize", updateMaskBounds)
    }
  }, [contextItems.length, hasConversation, isMinimized])

  const buildContextEvent = (items: ConversationContextItem[]): ConversationRuntimeMessage => ({
    id: `context-${Date.now()}`,
    role: "context_event",
    content: items.map((item) => item.title).join(", "),
    contexts: items,
  })

  const appendContextEvent = (previousMessages: ConversationRuntimeMessage[], items: ConversationContextItem[]) => {
    if (items.length === 0) {
      return previousMessages
    }

    const lastMessage = previousMessages[previousMessages.length - 1]

    if (lastMessage?.role === "context_event") {
      const lastContexts = lastMessage.contexts ?? (lastMessage.context ? [lastMessage.context] : [])
      const nextItemsById = new Set(items.map((item) => item.id))
      const mergedContexts = [...items, ...lastContexts.filter((item) => !nextItemsById.has(item.id))]

      return [
        ...previousMessages.slice(0, -1),
        {
          ...lastMessage,
          content: mergedContexts.map((item) => item.title).join(", "),
          contexts: mergedContexts,
          context: mergedContexts[0],
        },
      ]
    }

    return [...previousMessages, buildContextEvent(items)]
  }

  const clearPendingContextIds = (contextIds: string[]) => {
    if (contextIds.length === 0) return

    const idsToClear = new Set(contextIds)
    pendingContextIdsRef.current = pendingContextIdsRef.current.filter((id) => !idsToClear.has(id))
  }

  useEffect(() => {
    const previousActiveContextIds = new Set(activeContextIdsRef.current)
    const nextContextIds = contextItems.map((item) => item.id)
    const removedContextIds = activeContextIdsRef.current.filter((id) => !nextContextIds.includes(id))
    const addedContextItems = contextItems.filter((item) => !previousActiveContextIds.has(item.id))

    clearPendingContextIds(removedContextIds)

    if (addedContextItems.length > 0) {
      const addedIds = new Set(addedContextItems.map((item) => item.id))
      pendingContextIdsRef.current = [
        ...addedContextItems.map((item) => item.id),
        ...pendingContextIdsRef.current.filter((id) => !addedIds.has(id)),
      ]

      if (hasConversation) {
        setMessages((prev) => appendContextEvent(prev, addedContextItems))
        clearPendingContextIds(addedContextItems.map((item) => item.id))
      }
    }

    activeContextIdsRef.current = nextContextIds
  }, [contextItems, hasConversation])

  const buildResolvedReply = (userMessage: string): ConversationRuntimeMessage => {
    const resolvedReply = responseResolver?.({
      message: userMessage,
      brandName,
      contextItems,
    })

    if (resolvedReply) {
      return {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: resolvedReply.text,
        visualBlock: resolvedReply.visualBlock,
      }
    }

    return {
      id: `ai-${Date.now()}`,
      role: "ai",
      content: buildMockReply(brandName, userMessage, contextItems),
    }
  }

  const handleSendMessage = () => {
    const nextMessage = inputValue.trim()
    if (!nextMessage || isTyping) return

    const pendingContextItems = contextItems.filter((item) => pendingContextIdsRef.current.includes(item.id))
    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: nextMessage,
    }

    clearPendingContextIds(pendingContextItems.map((item) => item.id))
    setMessages((prev) => [...appendContextEvent(prev, pendingContextItems), userMessage])
    setInputValue("")
    setIsTyping(true)
    setIsMinimized(false)
    onSendMessage?.(nextMessage)

    replyTimeoutRef.current = window.setTimeout(() => {
      const aiMessage = buildResolvedReply(nextMessage)

      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
      replyTimeoutRef.current = null
    }, 700)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSendMessage()
  }

  const handleCloseConversation = () => {
    if (replyTimeoutRef.current !== null) {
      window.clearTimeout(replyTimeoutRef.current)
      replyTimeoutRef.current = null
    }

    setMessages([])
    setInputValue("")
    setIsTyping(false)
    setIsMinimized(false)
    activeContextIdsRef.current = []
    pendingContextIdsRef.current = []
    onCloseConversation?.()
  }

  const handleRemoveContextItem = (contextId: string) => {
    clearPendingContextIds([contextId])
    activeContextIdsRef.current = activeContextIdsRef.current.filter((id) => id !== contextId)
    onRemoveContext?.(contextId)
    setMessages((prev) =>
      prev.flatMap((message) => {
        if (message.role !== "context_event") {
          return [message]
        }

        const nextContexts = (message.contexts ?? (message.context ? [message.context] : [])).filter(
          (item) => item.id !== contextId
        )

        if (nextContexts.length === 0) {
          return []
        }

        return [
          {
            ...message,
            content: nextContexts.map((item) => item.title).join(", "),
            contexts: nextContexts,
            context: nextContexts[0],
          },
        ]
      })
    )
  }

  const renderContextChip = (item: ConversationContextItem) => {
    const isHidden = hiddenContextIdSet.has(item.id)

    return (
      <ConversationContextChipVisual
        key={item.id}
        item={item}
        hidden={isHidden}
        dataConversationContextChip={item.id}
        removeMode={onRemoveContext ? "interactive" : "none"}
        onRemove={onRemoveContext ? () => handleRemoveContextItem(item.id) : undefined}
        removeAriaLabel={`Remover ${item.title}`}
      />
    )
  }

  const conversationPanelPatternStyle = {
    backgroundImage: CONVERSATION_DOODLE_PATTERN,
    backgroundPosition: "center",
    backgroundRepeat: "repeat",
    backgroundSize: "180px 180px",
    opacity: 0.12,
  } as const
  const composerSurfaceStyle = { backgroundColor: COMPOSER_SURFACE_COLOR } as const
  const messageTextBubbleStyle = {
    width: "fit-content",
    maxWidth: "78%",
    whiteSpace: "normal",
    overflowWrap: "break-word",
    wordBreak: "normal",
  } as const

  return (
    <>
      <div
        ref={composerMaskRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 top-0 z-[29]"
        style={{
          background:
            "linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.78) 28%, rgba(255, 255, 255, 0.42) 58%, rgba(255, 255, 255, 0.14) 82%, rgba(255, 255, 255, 0) 100%)",
        }}
      />
      <div className={cn("pointer-events-none fixed inset-x-0 bottom-0 z-30", className)}>
      <div
        ref={composerShellRef}
        className="mx-auto max-w-lg px-4 pb-4 sm:max-w-xl md:max-w-2xl lg:max-w-[600px]"
      >
        <section
          data-conversation-composer="true"
          className="pointer-events-auto overflow-hidden rounded-[28px] border border-white/[0.08] shadow-[0_28px_68px_-34px_rgba(2,6,23,0.72),0_12px_28px_-22px_rgba(15,23,42,0.42)] backdrop-blur-[18px]"
          style={composerSurfaceStyle}
        >
          {hasConversation && (
            <div className="border-b border-white/[0.07]" style={composerSurfaceStyle}>
              <div className="px-4 pt-3 pb-2">
                <div className="relative flex items-center justify-center">
                  <div className="h-1 w-11 rounded-full bg-white/12" />
                  <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsMinimized((prev) => !prev)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white/62 transition-colors hover:bg-white/6 hover:text-white/90"
                    aria-label={isMinimized ? "Expandir conversa" : "Minimizar conversa"}
                  >
                    {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseConversation}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white/62 transition-colors hover:bg-white/6 hover:text-white/90"
                    aria-label="Fechar conversa"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  </div>
                </div>
              </div>
              {showExpandedConversation ? (
                <div className="relative overflow-hidden border-t border-white/[0.04]" style={composerSurfaceStyle}>
                  <div className="relative max-h-[34vh] overflow-y-auto" style={composerSurfaceStyle}>
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={conversationPanelPatternStyle} />
                    <div className="relative z-10 px-4 py-4">
                    {messages.map((message, index) => {
                    const previousMessage = messages[index - 1]
                    const sharesGroupWithPrevious =
                      previousMessage?.role === message.role && message.role !== "context_event"
                    const spacingClass =
                      index === 0 ? "" : sharesGroupWithPrevious ? "mt-2.5" : "mt-5"

                    if (message.role === "context_event") {
                      const eventContexts = message.contexts ?? (message.context ? [message.context] : [])

                      if (eventContexts.length === 0) {
                        return null
                      }

                      return (
                        <div key={message.id} className={cn(spacingClass, "py-0.5")}>
                          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                            {eventContexts.map((item) => renderContextChip(item))}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={message.id}
                        className={cn(spacingClass, "flex", message.role === "user" ? "justify-end" : "justify-start")}
                      >
                        <div className={cn("flex w-full max-w-full flex-col gap-2", message.role === "user" ? "items-end" : "items-start")}>
                          <div className={cn("w-full", message.role === "user" ? "text-right" : "text-left")}>
                            <div
                              className={cn(
                                "inline-block text-[15px] leading-[1.45] align-top",
                                message.role === "user"
                                  ? "rounded-[24px] rounded-br-[10px] border border-white/[0.07] bg-[rgba(62,70,79,0.96)] px-4 py-3.5 text-left text-white/[0.96] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.72)]"
                                  : "px-0 py-0.5 text-left text-white/[0.94]"
                              )}
                              style={messageTextBubbleStyle}
                            >
                              {message.content}
                            </div>
                          </div>

                          {message.role === "ai" && message.visualBlock
                            ? renderVisualBlock?.(message.visualBlock)
                            : null}
                        </div>
                      </div>
                    )
                  })}

                  {isTyping && (
                    <div className={cn(messages.length > 0 && "mt-5", "flex justify-start")}>
                      <div className="flex max-w-[82%] items-center gap-1 px-0 py-0.5 text-white/[0.74]">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/42 [animation-delay:-0.2s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/42 [animation-delay:-0.1s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/42" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 pb-3">
                  <p className="text-xs text-white/54">
                    {showContextRow ? "Contexto pronto para continuar a conversa." : "A conversa continua aqui quando voce enviar a proxima mensagem."}
                  </p>
                </div>
              )}
            </div>
          )}

          {!hasConversation && showContextRow && (
            <div className="border-b border-white/[0.07] px-4 py-2.5">
              <div data-conversation-context-rail="true" className="flex gap-2 overflow-x-auto scrollbar-hide">
                {contextItems.map((item) => renderContextChip(item))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-3 px-3 py-2.5" style={composerSurfaceStyle}>
            <button
              type="button"
              disabled
              className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10"
              aria-label="Marca"
            >
              <Image src={brandLogo} alt={brandName} fill className="object-cover" />
            </button>
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
              className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-white/92 outline-none placeholder:text-white/58"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.96] text-[rgba(7,16,24,0.94)] shadow-[0_16px_32px_-20px_rgba(0,0,0,0.52)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Enviar mensagem"
            >
              {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </section>
      </div>
      </div>
    </>
  )
}
