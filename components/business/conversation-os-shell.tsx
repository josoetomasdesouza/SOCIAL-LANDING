"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ConversationMessage } from "@/lib/business-types"
import type {
  ConversationResponseResolver,
  ConversationVisualBlockRenderer,
} from "@/lib/mock-data/conversational-search"
import { ConversationComposerBar } from "./conversation-composer-bar"
import {
  ConversationContextStrip,
  type ConversationOSContextItem,
} from "./conversation-context-strip"
import { ConversationOperationalPanel } from "./conversation-operational-panel"
import {
  ConversationTimeline,
  type ConversationRuntimeMessage,
} from "./conversation-timeline"
import type {
  ConversationOperationalActions,
  ConversationOperationalState,
} from "@/hooks/use-conversation-operational-flow"
import type {
  ConversationProductFlowActions,
  ConversationProductFlowState,
} from "@/hooks/use-conversation-product-flow"

export type ConversationContextItem = ConversationOSContextItem

interface ConversationOSShellProps {
  brandLogo: string
  brandName: string
  initialMessages?: ConversationMessage[]
  placeholder?: string
  onSendMessage?: (message: string) => void
  className?: string
  contextItems?: ConversationContextItem[]
  onRemoveContext?: (contextId: string) => void
  onCloseConversation?: () => void
  responseResolver?: ConversationResponseResolver
  renderTimelineVisualBlock?: ConversationVisualBlockRenderer
  operationalState: ConversationOperationalState
  operationalActions: ConversationOperationalActions
  productFlowState: ConversationProductFlowState
  productFlowActions: ConversationProductFlowActions
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

export function ConversationOSShell({
  brandLogo,
  brandName,
  initialMessages,
  placeholder = "Pergunte sobre a marca...",
  onSendMessage,
  className,
  contextItems = [],
  onRemoveContext,
  onCloseConversation,
  responseResolver,
  renderTimelineVisualBlock,
  operationalState,
  operationalActions,
  productFlowState,
  productFlowActions,
}: ConversationOSShellProps) {
  const [messages, setMessages] = useState<ConversationRuntimeMessage[]>(initialMessages || [])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const replyTimeoutRef = useRef<number | null>(null)
  const activeContextIdsRef = useRef<string[]>([])
  const pendingContextIdsRef = useRef<string[]>([])

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping, isMinimized, operationalState.activePanel])

  useEffect(() => {
    if (operationalState.activePanel !== "none") {
      setIsMinimized(false)
    }
  }, [operationalState.activePanel])

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
  const showOperationalPanel = operationalState.activePanel !== "none" && showExpandedConversation
  const isImmersive = operationalState.surfaceMode === "immersive" && showExpandedConversation

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
    operationalActions.reset()
    productFlowActions.reset()
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

  const operationalPanelTitle = productFlowState.activeProductId
    ? `Produto em preparacao: ${productFlowState.activeProductId}`
    : "Painel operacional"

  return (
    <div className={cn("pointer-events-none fixed inset-x-0 bottom-0 z-30", className)}>
      <div className="mx-auto max-w-lg px-4 pb-4 sm:max-w-xl md:max-w-2xl lg:max-w-[600px]">
        <section
          className={cn(
            "pointer-events-auto overflow-hidden rounded-[28px] border border-border/60 bg-background/94 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.42)] backdrop-blur-xl",
            isImmersive && "flex h-[82vh] flex-col"
          )}
        >
          {hasConversation && (
            <div className="border-b border-border/50">
              <div className="px-4 pt-3 pb-2">
                <div className="relative flex items-center justify-center">
                  <div className="h-1 w-11 rounded-full bg-border/80" />
                  <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1">
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
              </div>

              {showExpandedConversation ? (
                <div className={cn(isImmersive && "min-h-0 flex flex-1 flex-col")}>
                  <div
                    className={cn(
                      "overflow-y-auto px-4 py-4",
                      isImmersive ? "min-h-0 max-h-[30vh] flex-shrink-0" : "max-h-[32vh]"
                    )}
                  >
                    <ConversationTimeline
                      brandLogo={brandLogo}
                      brandName={brandName}
                      messages={messages}
                      isTyping={isTyping}
                      renderTimelineVisualBlock={renderTimelineVisualBlock}
                      onRemoveContext={handleRemoveContextItem}
                    />
                    <div ref={messagesEndRef} />
                  </div>

                  <ConversationOperationalPanel
                    mode={operationalState.surfaceMode}
                    isVisible={showOperationalPanel}
                    title={operationalPanelTitle}
                    canGoBack={operationalState.backStack.length > 0}
                    onBack={operationalActions.back}
                  >
                    <div className="rounded-2xl border border-dashed border-border bg-secondary/35 p-4">
                      <p className="text-sm font-medium text-foreground">
                        Foundation pronta para o fluxo operacional.
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        O drawer nao abre mais a partir da conversa nesta fase. O produto selecionado ja entra no
                        Conversation OS como estado interno para as proximas microfases.
                      </p>
                    </div>
                  </ConversationOperationalPanel>
                </div>
              ) : (
                <div className="px-4 pb-3">
                  <p className="text-xs text-muted-foreground">
                    {showContextRow
                      ? "Contexto pronto para continuar a conversa."
                      : "A conversa continua aqui quando voce enviar a proxima mensagem."}
                  </p>
                </div>
              )}
            </div>
          )}

          {!hasConversation && showContextRow && (
            <div className="border-b border-border/50 px-4 py-2.5">
              <ConversationContextStrip items={contextItems} onRemoveContext={handleRemoveContextItem} />
            </div>
          )}

          <ConversationComposerBar
            brandLogo={brandLogo}
            brandName={brandName}
            value={inputValue}
            placeholder={resolvedPlaceholder}
            isTyping={isTyping}
            onChange={setInputValue}
            onSubmit={handleSendMessage}
          />
        </section>
      </div>
    </div>
  )
}
