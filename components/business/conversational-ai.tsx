"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Loader2, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ConversationContextPayload, ConversationMessage } from "@/lib/business-types"
import type {
  ConversationResponseResolver,
  ConversationVisualBlock,
  ConversationVisualBlockRenderer,
} from "@/lib/mock-data/conversational-search"

const USER_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
const SHEET_MAX_VIEWPORT_RATIO = 0.9
const SHEET_MID_VIEWPORT_RATIO = 0.55
const COMPACT_BODY_MIN_RATIO = 0.22
const COMPACT_BODY_MIN_PX = 136
const COMPACT_BODY_MAX_PX = 196
const CLOSE_THRESHOLD_OFFSET_PX = 72

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

interface SheetMetrics {
  compact: number
  auto: number
  medium: number
  expanded: number
  closeThreshold: number
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
  const [manualSnapHeight, setManualSnapHeight] = useState<number | null>(null)
  const [dragHeight, setDragHeight] = useState<number | null>(null)
  const [sheetMetrics, setSheetMetrics] = useState<SheetMetrics>({
    compact: 0,
    auto: 0,
    medium: 0,
    expanded: 0,
    closeThreshold: 0,
  })
  const hasConversation = messages.length > 0 || isTyping
  const resolvedPlaceholder = contextItems.length > 0 ? "Pergunte sobre os itens selecionados..." : placeholder
  const showContextRow = !hasConversation && contextItems.length > 0
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const topAreaRef = useRef<HTMLDivElement>(null)
  const contextRailRef = useRef<HTMLDivElement>(null)
  const messagesContentRef = useRef<HTMLDivElement>(null)
  const composerFormRef = useRef<HTMLFormElement>(null)
  const replyTimeoutRef = useRef<number | null>(null)
  const activeContextIdsRef = useRef<string[]>([])
  const pendingContextIdsRef = useRef<string[]>([])
  const dragStateRef = useRef<{
    pointerId: number
    startY: number
    startHeight: number
  } | null>(null)
  const hiddenContextIdSet = useMemo(() => new Set(hiddenContextIds), [hiddenContextIds])

  useEffect(() => {
    if (hasConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [hasConversation, messages, isTyping])

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current !== null) {
        window.clearTimeout(replyTimeoutRef.current)
      }
    }
  }, [])

  const measureSheetLayout = useCallback(() => {
    if (typeof window === "undefined") {
      return
    }

    const viewportHeight = window.visualViewport?.height ?? window.innerHeight
    const expanded = Math.round(viewportHeight * SHEET_MAX_VIEWPORT_RATIO)
    const topAreaHeight = topAreaRef.current?.offsetHeight ?? 0
    const contextHeight = showContextRow ? contextRailRef.current?.offsetHeight ?? 0 : 0
    const formHeight = composerFormRef.current?.offsetHeight ?? 0
    const chromeHeight = topAreaHeight + contextHeight + formHeight
    const compactBodyHeight = hasConversation
      ? Math.min(
          COMPACT_BODY_MAX_PX,
          Math.max(COMPACT_BODY_MIN_PX, Math.round(viewportHeight * COMPACT_BODY_MIN_RATIO))
        )
      : 0
    const compact = Math.min(expanded, hasConversation ? chromeHeight + compactBodyHeight : chromeHeight)
    const conversationContentHeight = hasConversation ? messagesContentRef.current?.scrollHeight ?? 0 : 0
    const auto = hasConversation
      ? Math.min(expanded, Math.max(compact, chromeHeight + conversationContentHeight))
      : compact
    const medium = Math.min(expanded, Math.max(compact, Math.round(viewportHeight * SHEET_MID_VIEWPORT_RATIO)))
    const closeThreshold = Math.max(chromeHeight * 0.72, compact - CLOSE_THRESHOLD_OFFSET_PX)

    setSheetMetrics((previousMetrics) => {
      if (
        previousMetrics.compact === compact &&
        previousMetrics.auto === auto &&
        previousMetrics.medium === medium &&
        previousMetrics.expanded === expanded &&
        previousMetrics.closeThreshold === closeThreshold
      ) {
        return previousMetrics
      }

      return {
        compact,
        auto,
        medium,
        expanded,
        closeThreshold,
      }
    })
  }, [hasConversation, showContextRow])

  useEffect(() => {
    measureSheetLayout()
  }, [measureSheetLayout])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handleResize = () => measureSheetLayout()
    handleResize()

    window.addEventListener("resize", handleResize)
    window.visualViewport?.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.visualViewport?.removeEventListener("resize", handleResize)
    }
  }, [measureSheetLayout])

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      measureSheetLayout()
    })

    const observedElements = [
      topAreaRef.current,
      contextRailRef.current,
      messagesContentRef.current,
      composerFormRef.current,
    ].filter(Boolean)

    observedElements.forEach((element) => resizeObserver.observe(element!))

    return () => {
      resizeObserver.disconnect()
    }
  }, [measureSheetLayout, hasConversation, showContextRow])

  useEffect(() => {
    if (!hasConversation && !showContextRow) {
      setManualSnapHeight(null)
      setDragHeight(null)
    }
  }, [hasConversation, showContextRow])

  useEffect(() => {
    if (manualSnapHeight === null) {
      return
    }

    const nextManualHeight = Math.min(
      sheetMetrics.expanded || manualSnapHeight,
      Math.max(sheetMetrics.compact || 0, manualSnapHeight)
    )

    if (nextManualHeight !== manualSnapHeight) {
      setManualSnapHeight(nextManualHeight)
    }
  }, [manualSnapHeight, sheetMetrics.compact, sheetMetrics.expanded])

  const snapHeights = useMemo(
    () =>
      [sheetMetrics.compact, sheetMetrics.medium, sheetMetrics.expanded].filter(
        (height, index, list) => height > 0 && list.indexOf(height) === index
      ),
    [sheetMetrics.compact, sheetMetrics.medium, sheetMetrics.expanded]
  )

  const resolvedAutoHeight = Math.min(
    sheetMetrics.expanded || Number.POSITIVE_INFINITY,
    Math.max(sheetMetrics.compact || 0, Math.max(sheetMetrics.auto, manualSnapHeight ?? 0))
  )

  const resolvedSheetHeight = dragHeight ?? resolvedAutoHeight

  const getNearestSnapHeight = useCallback(
    (height: number) => {
      if (snapHeights.length === 0) {
        return height
      }

      return snapHeights.reduce((closestHeight, currentHeight) =>
        Math.abs(currentHeight - height) < Math.abs(closestHeight - height) ? currentHeight : closestHeight
      )
    },
    [snapHeights]
  )

  const handleSheetPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (sheetMetrics.compact <= 0) {
      return
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: resolvedSheetHeight || sheetMetrics.compact,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleSheetPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return
    }

    event.preventDefault()

    const deltaY = event.clientY - dragState.startY
    const nextHeight = Math.min(sheetMetrics.expanded, Math.max(0, dragState.startHeight - deltaY))
    setDragHeight(nextHeight)
  }

  const handleSheetPointerRelease = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const currentHeight = dragHeight ?? dragState.startHeight
    dragStateRef.current = null

    if (currentHeight < sheetMetrics.closeThreshold) {
      commitSheetClose()
      return
    }

    setManualSnapHeight(getNearestSnapHeight(currentHeight))
    setDragHeight(null)
  }

  const handleSheetHandleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (snapHeights.length === 0) {
      return
    }

    if (event.key === "Home") {
      event.preventDefault()
      setManualSnapHeight(sheetMetrics.compact)
      return
    }

    if (event.key === "End") {
      event.preventDefault()
      setManualSnapHeight(sheetMetrics.expanded)
      return
    }

    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return
    }

    event.preventDefault()

    const currentHeight = resolvedSheetHeight || sheetMetrics.compact
    const currentIndex = snapHeights.reduce(
      (closestIndex, height, index) =>
        Math.abs(height - currentHeight) < Math.abs(snapHeights[closestIndex] - currentHeight)
          ? index
          : closestIndex,
      0
    )
    const nextIndex =
      event.key === "ArrowUp"
        ? Math.min(snapHeights.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1)

    setManualSnapHeight(snapHeights[nextIndex])
  }

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

  const handleCloseConversation = useCallback(() => {
    if (replyTimeoutRef.current !== null) {
      window.clearTimeout(replyTimeoutRef.current)
      replyTimeoutRef.current = null
    }

    setMessages([])
    setInputValue("")
    setIsTyping(false)
    activeContextIdsRef.current = []
    pendingContextIdsRef.current = []
    onCloseConversation?.()
  }, [onCloseConversation])

  const commitSheetClose = useCallback(() => {
    setManualSnapHeight(null)
    setDragHeight(null)
    handleCloseConversation()
  }, [handleCloseConversation])

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
    <div
      key={item.id}
      data-conversation-context-chip={item.id}
      aria-hidden={isHidden || undefined}
      className={cn(
        "flex h-11 min-w-[156px] shrink-0 items-center gap-2 rounded-full border border-border/50 bg-secondary/55 pr-1.5",
        isHidden && "pointer-events-none opacity-0"
      )}
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
          onClick={() => handleRemoveContextItem(item.id)}
          disabled={isHidden}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground transition-colors hover:text-foreground"
          aria-label={`Remover ${item.title}`}
          tabIndex={isHidden ? -1 : undefined}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
    )
  }

  return (
    <div className={cn("pointer-events-none fixed inset-x-0 bottom-0 z-30", className)}>
      <div className="mx-auto max-w-lg px-4 pb-4 sm:max-w-xl md:max-w-2xl lg:max-w-[600px]">
        <section
          data-conversation-composer="true"
          className={cn(
            "pointer-events-auto flex min-h-0 max-h-[90vh] flex-col overflow-hidden rounded-[28px] border border-border/60 bg-background/94 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.42)] backdrop-blur-xl transition-[height] duration-300 ease-out",
            dragHeight !== null && "transition-none"
          )}
          style={resolvedSheetHeight > 0 ? { height: `${resolvedSheetHeight}px` } : undefined}
        >
          <div
            ref={topAreaRef}
            className={cn("shrink-0 px-4 pt-3 pb-2", (hasConversation || showContextRow) && "border-b border-border/50")}
          >
            <div
              role="slider"
              aria-label="Ajustar altura do composer"
              aria-valuemin={Math.round(sheetMetrics.compact)}
              aria-valuemax={Math.round(sheetMetrics.expanded)}
              aria-valuenow={Math.round(resolvedSheetHeight || sheetMetrics.compact)}
              tabIndex={0}
              onPointerDown={handleSheetPointerDown}
              onPointerMove={handleSheetPointerMove}
              onPointerUp={handleSheetPointerRelease}
              onPointerCancel={handleSheetPointerRelease}
              onKeyDown={handleSheetHandleKeyDown}
              className="flex cursor-row-resize select-none touch-none items-center justify-center py-1.5 outline-none"
            >
              <div className="h-1 w-10 rounded-full bg-border/75 shadow-[0_1px_0_rgba(255,255,255,0.08)]" />
            </div>
          </div>

          {hasConversation ? (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div ref={messagesContentRef} className="space-y-3 px-4 py-4">
                {messages.map((message) => {
                  if (message.role === "context_event") {
                    const eventContexts = message.contexts ?? (message.context ? [message.context] : [])

                    if (eventContexts.length === 0) {
                      return null
                    }

                    return (
                      <div key={message.id} className="py-0.5">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                          {eventContexts.map((item) => renderContextChip(item))}
                        </div>
                      </div>
                    )
                  }

                  return (
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

                      <div className={cn("flex max-w-[82%] flex-col gap-2", message.role === "user" && "items-end")}>
                        <div
                          className={cn(
                            "rounded-[22px] px-4 py-3 text-sm leading-relaxed shadow-sm",
                            message.role === "user"
                              ? "rounded-br-md bg-foreground text-background"
                              : "rounded-bl-md bg-secondary text-foreground"
                          )}
                        >
                          {message.content}
                        </div>

                        {message.role === "ai" && message.visualBlock
                          ? renderVisualBlock?.(message.visualBlock)
                          : null}
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
                  )
                })}

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
            </div>
          ) : null}

          {!hasConversation && showContextRow && (
            <div ref={contextRailRef} className="border-b border-border/50 px-4 py-2.5">
              <div data-conversation-context-rail="true" className="flex gap-2 overflow-x-auto scrollbar-hide">
                {contextItems.map((item) => renderContextChip(item))}
              </div>
            </div>
          )}

          <form ref={composerFormRef} onSubmit={handleSubmit} className="flex shrink-0 items-center gap-3 px-3 py-2.5">
            <button
              type="button"
              disabled
              className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full"
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
              className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/80"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-[0_12px_24px_-16px_rgba(0,0,0,0.4)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Enviar mensagem"
            >
              {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
