"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ConversationMessage } from "@/lib/business-types"
import type {
  ConversationVisualBlock,
  ConversationResponseResolver,
  ConversationVisualBlockRenderer,
} from "@/lib/mock-data/conversational-search"
import { CONVERSATIONAL_SEARCH_RESULTS_KIND } from "@/lib/mock-data/conversational-search"
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
  operationalSurface?: React.ReactNode
  activeProductPreview?: {
    title: string
    image: string
    price?: number
    description?: string
  } | null
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

function extractSearchResultProductIds(visualBlock?: ConversationVisualBlock) {
  if (!visualBlock || visualBlock.kind !== CONVERSATIONAL_SEARCH_RESULTS_KIND) {
    return []
  }

  const payload = visualBlock.payload as { products?: Array<{ id?: unknown }> } | undefined

  if (!Array.isArray(payload?.products)) {
    return []
  }

  return payload.products
    .map((product) => (typeof product.id === "string" ? product.id : null))
    .filter((productId): productId is string => Boolean(productId))
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
  operationalSurface,
  activeProductPreview,
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
    if (operationalState.activeFlow === "product") {
      setIsMinimized(false)
    }
  }, [operationalState.activeFlow])

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current !== null) {
        window.clearTimeout(replyTimeoutRef.current)
      }
    }
  }, [])

  const hasConversation = messages.length > 0 || isTyping
  const hasActiveProductFlow = operationalState.activeFlow === "product"
  const hasConversationSurface = hasConversation || hasActiveProductFlow
  const resolvedPlaceholder = hasActiveProductFlow
    ? productFlowState.activeProductId
      ? "Pergunte sobre este produto..."
      : "Escolha um produto ou refine sua busca..."
    : contextItems.length > 0
      ? "Pergunte sobre os itens selecionados..."
      : placeholder
  const showContextRow = !hasConversationSurface && contextItems.length > 0
  const showExpandedConversation = hasConversationSurface && !isMinimized
  const showOperationalPanel = hasActiveProductFlow && showExpandedConversation
  const isImmersive =
    (operationalState.surfaceMode === "immersive" || hasActiveProductFlow) && showExpandedConversation

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
      const resolvedProductIds = extractSearchResultProductIds(aiMessage.visualBlock)

      if (resolvedProductIds.length > 0) {
        productFlowActions.openSearchResults(resolvedProductIds)
        operationalActions.openProductFlow()
      }

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

  const operationalPanelTitle = activeProductPreview?.title || "Continuar com este produto"
  const operationalPanelSubtitle = activeProductPreview
    ? "A conversa entrou em modo assistido para voce explorar este item sem sair daqui."
    : "A conversa entrou em modo assistido para continuar sua jornada dentro deste contexto."
  const immersiveHeaderTitle = activeProductPreview?.title || "Modo assistido"
  const hasCustomOperationalSurface = Boolean(operationalSurface)
  const showImmersiveHeaderDetails = hasActiveProductFlow && !hasCustomOperationalSurface
  const showComposerProductContext = hasActiveProductFlow && !hasCustomOperationalSurface
  const resolvedOperationalSurface = operationalSurface || (
    activeProductPreview ? (
      <div className="space-y-4 pb-1">
        <div className="rounded-[24px] border border-border/55 bg-background/65 p-4 shadow-[0_20px_46px_-36px_rgba(0,0,0,0.4)]">
          <p className="text-sm font-medium text-foreground">{activeProductPreview.title}</p>
          {typeof activeProductPreview.price === "number" ? (
            <p className="mt-2 text-base font-semibold text-foreground">
              R$ {activeProductPreview.price.toFixed(2).replace(".", ",")}
            </p>
          ) : null}
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {activeProductPreview.description ||
              "O detalhe completo deste produto vai assumir esta area da conversa nas proximas fases."}
          </p>
        </div>
      </div>
    ) : (
      <div className="rounded-[24px] border border-border/55 bg-background/65 p-4 shadow-[0_20px_46px_-36px_rgba(0,0,0,0.4)]">
        <p className="text-sm font-medium text-foreground">O modo assistido da conversa ja esta pronto.</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Assim que um produto for selecionado, esta area assume a jornada operacional sem abrir drawer.
        </p>
      </div>
    )
  )

  return (
    <div className={cn("pointer-events-none fixed inset-x-0 bottom-0 z-30", className)}>
      {isImmersive ? (
        <div className="pointer-events-none fixed inset-0 bg-background/34 backdrop-blur-[8px]" />
      ) : null}
      <div className="mx-auto max-w-lg px-4 pb-4 sm:max-w-xl md:max-w-2xl lg:max-w-[600px]">
        <section
          className={cn(
            "pointer-events-auto overflow-hidden rounded-[28px] border border-border/60 bg-background/94 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.42)] backdrop-blur-xl",
            isImmersive &&
              "flex h-[82vh] max-h-[calc(100dvh-24px)] flex-col border-border/75 bg-background/97 shadow-[0_32px_90px_-32px_rgba(0,0,0,0.42)]"
          )}
        >
          {hasConversationSurface && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div
                className={cn(
                  "relative z-10 flex-shrink-0 border-b border-border/50 px-4 pt-3 pb-2",
                  showImmersiveHeaderDetails &&
                    "bg-gradient-to-b from-secondary/55 via-background to-background"
                )}
              >
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

                {showImmersiveHeaderDetails ? (
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        Modo assistido
                      </p>
                      <h2 className="truncate text-base font-semibold tracking-tight text-foreground">
                        {immersiveHeaderTitle}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Produto selecionado na conversa
                      </p>
                    </div>
                    <div className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                      Em andamento
                    </div>
                  </div>
                ) : null}
              </div>

              {showExpandedConversation ? (
                <div
                  className={cn(
                    "min-h-0",
                    isImmersive
                      ? "flex flex-1 flex-col overflow-y-auto overscroll-contain"
                      : "flex flex-col"
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-4 transition-all duration-300",
                      isImmersive
                        ? "flex-shrink-0 border-b border-border/40 bg-secondary/10 pb-3 opacity-65 saturate-50"
                        : "max-h-[32vh] overflow-y-auto"
                    )}
                  >
                    <div
                      className={cn(
                        isImmersive &&
                          "rounded-[24px] border border-border/40 bg-background/55 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
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
                  </div>

                  <ConversationOperationalPanel
                    mode={operationalState.surfaceMode}
                    isVisible={showOperationalPanel}
                    eyebrow="Produto selecionado"
                    title={operationalPanelTitle}
                    subtitle={operationalPanelSubtitle}
                    canGoBack={operationalState.backStack.length > 0}
                    onBack={operationalActions.back}
                    showHeader={!hasCustomOperationalSurface}
                    className={cn(hasCustomOperationalSurface && "bg-transparent px-4 py-4")}
                    contentClassName={cn(hasCustomOperationalSurface && "space-y-0")}
                  >
                    {resolvedOperationalSurface}
                  </ConversationOperationalPanel>
                </div>
              ) : (
                <div className="px-4 py-3">
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

          <div
            className={cn(
              "relative z-10 flex-shrink-0 border-t border-border/50 bg-background/94 backdrop-blur-xl",
              hasActiveProductFlow && "bg-gradient-to-b from-secondary/10 via-background to-background"
            )}
          >
            {showComposerProductContext ? (
              <div className="px-4 pt-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Conversa conectada ao produto atual
                </p>
              </div>
            ) : null}

            <ConversationComposerBar
              brandLogo={brandLogo}
              brandName={brandName}
              value={inputValue}
              placeholder={resolvedPlaceholder}
              isTyping={isTyping}
              onChange={setInputValue}
              onSubmit={handleSendMessage}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
