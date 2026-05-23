"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Loader2, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ConversationContextPayload, ConversationMessage } from "@/lib/business-types"
import type {
  ConversationResponseResolver,
  ConversationVisualBlock,
  ConversationVisualBlockRenderer,
} from "@/lib/mock-data/conversational-search"
import { observeAiSurfaceOpened } from "@/lib/events/instrumentation"

const USER_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
const COMPOSER_MASK_TOP_OFFSET_PX = 88
const COMPOSER_SURFACE_COLOR = "rgba(31,28,26,0.94)"
const SHEET_TOP_SAFE_MARGIN_PX = 16
const COMPOSER_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.68' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.009'/%3E%3C/svg%3E\")"
const CONVERSATION_DOODLE_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400' fill='none'%3E%3Cpath d='M50 370C30 200 370 240 350 20' stroke='white' stroke-opacity='0.014' stroke-width='1.6' stroke-linecap='round'/%3E%3Cpath d='M15 80A260 260 0 0 1 350 300' stroke='white' stroke-opacity='0.009' stroke-width='1.1' stroke-linecap='round'/%3E%3Cpath d='M395 45C300 88 245 195 185 268' stroke='white' stroke-opacity='0.010' stroke-width='1.3' stroke-linecap='round'/%3E%3Cpath d='M15 285C68 242 115 255 148 298' stroke='white' stroke-opacity='0.007' stroke-width='1.0' stroke-linecap='round'/%3E%3Cpath d='M128 12A98 98 0 0 1 288 52' stroke='white' stroke-opacity='0.007' stroke-width='1.0' stroke-linecap='round'/%3E%3C/svg%3E\")"
const SHEET_MAX_VIEWPORT_RATIO = 0.9
const SHEET_MID_VIEWPORT_RATIO = 0.55
const COMPACT_BODY_MIN_RATIO = 0.22
const COMPACT_BODY_MIN_PX = 136
const COMPACT_BODY_MAX_PX = 196
const CLOSE_THRESHOLD_OFFSET_PX = 72
const PREVIEW_DRAG_INTENT_THRESHOLD_PX = 4
const CONVERSATION_HISTORY_STORAGE_PREFIX = "business-conversation-history:"

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
  chromeOnlyCompact: number
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

function getConversationHistoryStorageKey(brandName: string) {
  const normalizedBrandName = brandName
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `${CONVERSATION_HISTORY_STORAGE_PREFIX}${normalizedBrandName || "default"}`
}

function readPersistedConversationMessages(
  storageKey: string,
  initialMessages?: ConversationMessage[]
): ConversationRuntimeMessage[] {
  if (typeof window === "undefined") {
    return initialMessages || []
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey)

    if (!storedValue) {
      return initialMessages || []
    }

    const parsedValue = JSON.parse(storedValue)
    return Array.isArray(parsedValue) ? (parsedValue as ConversationRuntimeMessage[]) : (initialMessages || [])
  } catch {
    return initialMessages || []
  }
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
  const conversationHistoryStorageKey = useMemo(
    () => getConversationHistoryStorageKey(brandName),
    [brandName]
  )
  const [messages, setMessages] = useState<ConversationRuntimeMessage[]>(initialMessages || [])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isHistoryHydrated, setIsHistoryHydrated] = useState(false)
  const [isConversationSessionActive, setIsConversationSessionActive] = useState(false)
  const [isConversationCollapsed, setIsConversationCollapsed] = useState(false)
  const [isCompactResumePreview, setIsCompactResumePreview] = useState(false)
  const [resumeSessionStartIndex, setResumeSessionStartIndex] = useState<number | null>(null)
  const [pendingContextIds, setPendingContextIds] = useState<string[]>([])
  const [manualSnapHeight, setManualSnapHeight] = useState<number | null>(null)
  const [dragHeight, setDragHeight] = useState<number | null>(null)
  const [sheetMetrics, setSheetMetrics] = useState<SheetMetrics>({
    compact: 0,
    chromeOnlyCompact: 0,
    auto: 0,
    medium: 0,
    expanded: 0,
    closeThreshold: 0,
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initialMessagesRef = useRef(initialMessages)
  const composerShellRef = useRef<HTMLDivElement>(null)
  const composerMaskRef = useRef<HTMLDivElement>(null)
  const topAreaRef = useRef<HTMLDivElement>(null)
  const contextRailRef = useRef<HTMLDivElement>(null)
  const messagesContentRef = useRef<HTMLDivElement>(null)
  const messagesMeasureRef = useRef<HTMLDivElement>(null)
  const autoGrowMeasureRef = useRef<HTMLDivElement>(null)
  const composerFormRef = useRef<HTMLFormElement>(null)
  const composerInputRef = useRef<HTMLInputElement>(null)
  const replyTimeoutRef = useRef<number | null>(null)
  const activeContextIdsRef = useRef<string[]>([])
  const pendingContextIdsRef = useRef<string[]>([])
  const dragStateRef = useRef<{
    pointerId: number
    startY: number
    startHeight: number
    startedCollapsed: boolean
    startedPreview: boolean
  } | null>(null)
  const hasConversation = messages.length > 0 || isTyping
  const resolvedPlaceholder = contextItems.length > 0 ? "Pergunte sobre os itens selecionados..." : placeholder
  const hasEngagedConversation = hasConversation && isConversationSessionActive
  const pendingContextIdSet = useMemo(() => new Set(pendingContextIds), [pendingContextIds])
  const immediatePendingContextIdSet = useMemo(() => {
    const previousActiveContextIds = new Set(activeContextIdsRef.current)

    return new Set(
      contextItems
        .filter((item) => !previousActiveContextIds.has(item.id))
        .map((item) => item.id)
    )
  }, [contextItems])
  const contextRowItems = useMemo(
    () =>
      contextItems.filter(
        (item) => pendingContextIdSet.has(item.id) || immediatePendingContextIdSet.has(item.id)
      ),
    [contextItems, immediatePendingContextIdSet, pendingContextIdSet]
  )
  const showContextRow =
    contextRowItems.length > 0 &&
    (!hasEngagedConversation || (isConversationCollapsed && immediatePendingContextIdSet.size > 0))
  const shouldShowConversationBody = hasEngagedConversation && !isConversationCollapsed
  const shouldRenderConversationBody = hasEngagedConversation
  const shouldShowTopArea = hasEngagedConversation || showContextRow
  const isCompactComposer = shouldShowTopArea && !shouldShowConversationBody
  const isCollapsedConversation = hasEngagedConversation && isConversationCollapsed
  const displayedMessages = useMemo(() => {
    if (!isCompactResumePreview) {
      return messages
    }

    const latestMessage =
      [...messages].reverse().find((message) => message.role !== "context_event") ??
      messages[messages.length - 1]

    return latestMessage ? [latestMessage] : []
  }, [isCompactResumePreview, messages])
  const hasSheetBody = shouldRenderConversationBody || showContextRow
  const shouldApplySheetHeight = shouldShowTopArea || hasSheetBody
  const hiddenContextIdSet = useMemo(() => new Set(hiddenContextIds), [hiddenContextIds])
  const isResumeAutoGrowActive = resumeSessionStartIndex !== null
  const autoGrowMessages = useMemo(() => {
    if (resumeSessionStartIndex === null) {
      return messages
    }

    return messages.slice(Math.min(resumeSessionStartIndex, messages.length))
  }, [messages, resumeSessionStartIndex])

  useEffect(() => {
    const restoredMessages = readPersistedConversationMessages(
      conversationHistoryStorageKey,
      initialMessagesRef.current
    )
    setMessages(restoredMessages)
    setInputValue("")
    setIsTyping(false)
    setIsConversationSessionActive(false)
    setIsConversationCollapsed(false)
    setIsCompactResumePreview(false)
    setResumeSessionStartIndex(null)
    setPendingContextIds([])
    activeContextIdsRef.current = []
    pendingContextIdsRef.current = []
    setIsHistoryHydrated(true)
  }, [conversationHistoryStorageKey])

  useEffect(() => {
    if (!isHistoryHydrated || typeof window === "undefined") {
      return
    }

    if (messages.length === 0) {
      window.localStorage.removeItem(conversationHistoryStorageKey)
      return
    }

    window.localStorage.setItem(conversationHistoryStorageKey, JSON.stringify(messages))
  }, [conversationHistoryStorageKey, isHistoryHydrated, messages])

  useEffect(() => {
    if (shouldShowConversationBody) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [shouldShowConversationBody, messages, isTyping])

  useLayoutEffect(() => {
    if (isCompactResumePreview) {
      composerInputRef.current?.focus({ preventScroll: true })
    }
  }, [isCompactResumePreview])

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
    const shellBottom = composerShellRef.current?.getBoundingClientRect().bottom ?? viewportHeight
    const bottomOffset = Math.max(0, viewportHeight - shellBottom)
    const availableViewportHeight = Math.max(0, viewportHeight - bottomOffset - SHEET_TOP_SAFE_MARGIN_PX)
    const expanded = Math.round(availableViewportHeight * SHEET_MAX_VIEWPORT_RATIO)
    const topAreaHeight = shouldShowTopArea ? topAreaRef.current?.offsetHeight ?? 0 : 0
    const contextHeight = showContextRow ? contextRailRef.current?.offsetHeight ?? 0 : 0
    const formHeight = composerFormRef.current?.offsetHeight ?? 0
    const chromeHeight = topAreaHeight + contextHeight + formHeight
    const messagesContentElement = messagesContentRef.current
    const messagesContentStyle = messagesContentElement ? window.getComputedStyle(messagesContentElement) : null
    const messagesContentPaddingY = messagesContentStyle
      ? parseFloat(messagesContentStyle.paddingTop) + parseFloat(messagesContentStyle.paddingBottom)
      : 0
    const measuredConversationContentHeight = shouldShowConversationBody
      ? isResumeAutoGrowActive
        ? autoGrowMeasureRef.current?.offsetHeight ?? 0
        : messagesMeasureRef.current?.offsetHeight ?? messagesContentRef.current?.scrollHeight ?? 0
      : 0
    const conversationContentHeight = shouldShowConversationBody
      ? measuredConversationContentHeight + (isCompactResumePreview ? messagesContentPaddingY : 0)
      : 0
    const compactBodyHeight = shouldShowConversationBody
      ? isCompactResumePreview
        ? conversationContentHeight
        : Math.min(
            COMPACT_BODY_MAX_PX,
            Math.max(COMPACT_BODY_MIN_PX, Math.round(availableViewportHeight * COMPACT_BODY_MIN_RATIO))
          )
      : 0
    const compact = Math.min(expanded, shouldShowConversationBody ? chromeHeight + compactBodyHeight : chromeHeight)
    const auto = shouldShowConversationBody
      ? Math.min(expanded, Math.max(compact, chromeHeight + conversationContentHeight))
      : compact
    const medium = Math.min(
      expanded,
      Math.max(compact, Math.round(availableViewportHeight * SHEET_MID_VIEWPORT_RATIO))
    )
    const closeThreshold = Math.max(chromeHeight * 0.72, compact - CLOSE_THRESHOLD_OFFSET_PX)

    const chromeOnlyCompact = Math.min(expanded, chromeHeight)

    setSheetMetrics((previousMetrics) => {
      if (
        previousMetrics.compact === compact &&
        previousMetrics.chromeOnlyCompact === chromeOnlyCompact &&
        previousMetrics.auto === auto &&
        previousMetrics.medium === medium &&
        previousMetrics.expanded === expanded &&
        previousMetrics.closeThreshold === closeThreshold
      ) {
        return previousMetrics
      }

      return {
        compact,
        chromeOnlyCompact,
        auto,
        medium,
        expanded,
        closeThreshold,
      }
    })
  }, [isResumeAutoGrowActive, shouldShowConversationBody, shouldShowTopArea, showContextRow])

  useEffect(() => {
    measureSheetLayout()
  }, [measureSheetLayout])

  useLayoutEffect(() => {
    measureSheetLayout()
  }, [className, measureSheetLayout])

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
      messagesMeasureRef.current,
      autoGrowMeasureRef.current,
      composerFormRef.current,
    ].filter(Boolean)

    observedElements.forEach((element) => resizeObserver.observe(element!))

    return () => {
      resizeObserver.disconnect()
    }
  }, [measureSheetLayout, hasEngagedConversation, showContextRow])

  useLayoutEffect(() => {
    measureSheetLayout()
  }, [measureSheetLayout, messages, isTyping, isCompactResumePreview, contextItems.length, hiddenContextIds.length])

  useEffect(() => {
    if (!hasEngagedConversation && !showContextRow) {
      setManualSnapHeight(null)
      setDragHeight(null)
      setIsConversationCollapsed(false)
      setIsCompactResumePreview(false)
      setResumeSessionStartIndex(null)
    }
  }, [hasEngagedConversation, showContextRow])

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

  const feedDimProgress = (() => {
    const lowerBound = sheetMetrics.chromeOnlyCompact || sheetMetrics.compact
    const range = sheetMetrics.expanded - lowerBound
    if (range <= 0) return 0
    const raw = (resolvedSheetHeight - lowerBound) / range
    return Math.max(0, Math.min(1, (raw - 0.4) / 0.6))
  })()

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

  useLayoutEffect(() => {
    const shellElement = composerShellRef.current
    const maskElement = composerMaskRef.current

    if (!shellElement || !maskElement) {
      return
    }

    const updateMaskBounds = () => {
      const composerShellTop = shellElement.getBoundingClientRect().top
      const resolvedTop = Math.max(
        SHEET_TOP_SAFE_MARGIN_PX,
        Math.round(composerShellTop - COMPOSER_MASK_TOP_OFFSET_PX)
      )
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
  }, [className, contextItems.length, hasEngagedConversation, resolvedSheetHeight, showContextRow])

  const buildContextEvent = useCallback((items: ConversationContextItem[]): ConversationRuntimeMessage => ({
    id: `context-${Date.now()}`,
    role: "context_event",
    content: items.map((item) => item.title).join(", "),
    contexts: items,
  }), [])

  const appendContextEvent = useCallback((
    previousMessages: ConversationRuntimeMessage[],
    items: ConversationContextItem[]
  ) => {
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
  }, [buildContextEvent])

  const setPendingContextIdsSnapshot = useCallback((nextPendingContextIds: string[]) => {
    pendingContextIdsRef.current = nextPendingContextIds
    setPendingContextIds(nextPendingContextIds)
  }, [])

  const clearPendingContextIds = useCallback((contextIds: string[]) => {
    if (contextIds.length === 0) return

    const idsToClear = new Set(contextIds)
    setPendingContextIdsSnapshot(pendingContextIdsRef.current.filter((id) => !idsToClear.has(id)))
  }, [setPendingContextIdsSnapshot])

  useEffect(() => {
    const previousActiveContextIds = new Set(activeContextIdsRef.current)
    const nextContextIds = contextItems.map((item) => item.id)
    const removedContextIds = activeContextIdsRef.current.filter((id) => !nextContextIds.includes(id))
    const addedContextItems = contextItems.filter((item) => !previousActiveContextIds.has(item.id))

    clearPendingContextIds(removedContextIds)

    if (addedContextItems.length > 0) {
      const addedIds = new Set(addedContextItems.map((item) => item.id))
      setPendingContextIdsSnapshot([
        ...addedContextItems.map((item) => item.id),
        ...pendingContextIdsRef.current.filter((id) => !addedIds.has(id)),
      ])

      if (hasEngagedConversation) {
        if (isConversationCollapsed) {
          setIsConversationSessionActive(false)
          setIsConversationCollapsed(false)
        } else {
          setMessages((prev) => appendContextEvent(prev, addedContextItems))
          clearPendingContextIds(addedContextItems.map((item) => item.id))
        }
      }
    }

    activeContextIdsRef.current = nextContextIds
  }, [appendContextEvent, clearPendingContextIds, contextItems, hasEngagedConversation, isConversationCollapsed, setPendingContextIdsSnapshot])

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
    const shouldResumeFromCurrentMessages =
      messages.length > 0 && (isConversationCollapsed || isCompactResumePreview || !isConversationSessionActive)

    clearPendingContextIds(pendingContextItems.map((item) => item.id))
    if (!isConversationSessionActive) observeAiSurfaceOpened({ action: "opened" })
    setIsConversationSessionActive(true)
    setIsCompactResumePreview(false)

    if (shouldResumeFromCurrentMessages) {
      setResumeSessionStartIndex(messages.length)
    }

    setIsConversationCollapsed(false)
    setMessages((prev) => [...appendContextEvent(prev, pendingContextItems), userMessage])
    setInputValue("")
    setIsTyping(true)
    onSendMessage?.(nextMessage)

    replyTimeoutRef.current = window.setTimeout(() => {
      const aiMessage = buildResolvedReply(nextMessage)

      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
      setIsConversationCollapsed(false)
      setIsCompactResumePreview(false)
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
    setIsConversationSessionActive(false)
    setIsConversationCollapsed(false)
    setIsCompactResumePreview(false)
    setResumeSessionStartIndex(null)
    setPendingContextIds([])
    activeContextIdsRef.current = []
    pendingContextIdsRef.current = []
    onCloseConversation?.()
  }, [onCloseConversation])

  const commitSheetClose = useCallback(() => {
    setManualSnapHeight(null)
    setDragHeight(null)
    setIsCompactResumePreview(false)

    if (hasEngagedConversation) {
      setIsConversationCollapsed(true)
      return
    }

    handleCloseConversation()
  }, [handleCloseConversation, hasEngagedConversation])

  const handleSheetPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (sheetMetrics.compact <= 0) {
      return
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: resolvedSheetHeight || sheetMetrics.compact,
      startedCollapsed: isConversationCollapsed,
      startedPreview: isCompactResumePreview,
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

    if (dragState.startedPreview && Math.abs(deltaY) >= PREVIEW_DRAG_INTENT_THRESHOLD_PX) {
      setIsCompactResumePreview(false)
      dragState.startedPreview = false
    }

    if (dragState.startedCollapsed && nextHeight > dragState.startHeight) {
      setIsConversationCollapsed(false)
      dragState.startedCollapsed = false
    }

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

    if (dragState.startedPreview && currentHeight <= dragState.startHeight) {
      setDragHeight(null)
      return
    }

    if (dragState.startedCollapsed && currentHeight <= dragState.startHeight) {
      setDragHeight(null)
      return
    }

    if (currentHeight < sheetMetrics.closeThreshold) {
      commitSheetClose()
      return
    }

    setIsConversationCollapsed(false)
    setManualSnapHeight(getNearestSnapHeight(currentHeight))
    setDragHeight(null)
  }

  const handleCompactComposerPress = (event: React.PointerEvent<HTMLElement>) => {
    if (!isCollapsedConversation || (event.pointerType === "mouse" && event.button !== 0)) {
      return
    }

    event.preventDefault()
    setDragHeight(null)
    setManualSnapHeight(null)
    setResumeSessionStartIndex(null)
    setIsCompactResumePreview(true)
    setIsConversationCollapsed(false)
  }

  const handleSheetHandleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (snapHeights.length === 0) {
      return
    }

    if (event.key === "Home") {
      event.preventDefault()
      setIsCompactResumePreview(false)
      setIsConversationCollapsed(false)
      setManualSnapHeight(sheetMetrics.compact)
      return
    }

    if (event.key === "End") {
      event.preventDefault()
      setIsCompactResumePreview(false)
      setIsConversationCollapsed(false)
      setManualSnapHeight(sheetMetrics.expanded)
      return
    }

    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return
    }

    event.preventDefault()
    setIsCompactResumePreview(false)
    setIsConversationCollapsed(false)

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

  const renderContextChip = (
    item: ConversationContextItem,
    options?: {
      measurementTarget?: boolean
    }
  ) => {
    const isMeasurementTarget = options?.measurementTarget === true
    const isHidden = !isMeasurementTarget && hiddenContextIdSet.has(item.id)

    return (
      <div
        key={item.id}
        data-conversation-context-chip={isMeasurementTarget ? undefined : item.id}
        data-conversation-context-chip-target={isMeasurementTarget ? item.id : undefined}
        aria-hidden={isHidden || undefined}
        className={cn(
          "flex h-11 min-w-[156px] shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.055] pr-1.5 shadow-[0_10px_24px_-20px_rgba(2,6,23,0.6)]",
          isHidden && "pointer-events-none opacity-0"
        )}
      >
        <div className="relative h-11 w-11 overflow-hidden rounded-full">
          <Image src={item.image} alt={item.title} fill className="object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          {item.subtitle ? (
            <p className="truncate text-[10px] font-medium uppercase tracking-wide text-white/42">
              {item.subtitle}
            </p>
          ) : null}
          <p className="truncate text-xs font-medium text-white/92">{item.title}</p>
        </div>

        {onRemoveContext ? (
          <button
            type="button"
            onClick={() => handleRemoveContextItem(item.id)}
            disabled={isHidden}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/56 transition-colors hover:bg-white/[0.12] hover:text-white/90"
            aria-label={`Remover ${item.title}`}
            tabIndex={isHidden ? -1 : undefined}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    )
  }

  const renderMeasurementContextChip = (item: ConversationContextItem) => (
    <div
      key={item.id}
      className="flex h-11 min-w-[156px] shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.055] pr-1.5 shadow-[0_10px_24px_-20px_rgba(2,6,23,0.6)]"
    >
      <div className="h-11 w-11 shrink-0 rounded-full bg-white/[0.08]" />

      <div className="min-w-0 flex-1">
        {item.subtitle ? (
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-white/42">
            {item.subtitle}
          </p>
        ) : null}
        <p className="truncate text-xs font-medium text-white/92">{item.title}</p>
      </div>

      {onRemoveContext ? (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/56">
          <X className="h-3.5 w-3.5" />
        </div>
      ) : null}
    </div>
  )

  const conversationPanelPatternStyle = {
    backgroundColor: COMPOSER_SURFACE_COLOR,
    backgroundImage: `${COMPOSER_GRAIN}, ${CONVERSATION_DOODLE_PATTERN}`,
    backgroundPosition: "center, center",
    backgroundRepeat: "repeat, repeat",
    backgroundSize: "200px 200px, 400px 400px",
  } as const
  const composerSurfaceStyle = { backgroundColor: COMPOSER_SURFACE_COLOR } as const
  const messageTextBubbleStyle = {
    width: "fit-content",
    maxWidth: "78%",
    whiteSpace: "normal",
    overflowWrap: "break-word",
    wordBreak: "normal",
  } as const

  const renderConversationMessage = (
    message: ConversationRuntimeMessage,
    index: number,
    messageList: ConversationRuntimeMessage[],
    options?: {
      measurementOnly?: boolean
    }
  ) => {
    const previousMessage = messageList[index - 1]
    const sharesGroupWithPrevious =
      previousMessage?.role === message.role && message.role !== "context_event"
    const spacingClass = index === 0 ? "" : sharesGroupWithPrevious ? "mt-2.5" : "mt-5"

    if (message.role === "context_event") {
      const eventContexts = message.contexts ?? (message.context ? [message.context] : [])

      if (eventContexts.length === 0) {
        return null
      }

      return (
        <div key={message.id} className={cn(spacingClass, "py-0.5")}>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {eventContexts.map((item) =>
              options?.measurementOnly ? renderMeasurementContextChip(item) : renderContextChip(item)
            )}
          </div>
        </div>
      )
    }

    return (
      <div
        key={message.id}
        className={cn(spacingClass, "flex", message.role === "user" ? "justify-end" : "justify-start")}
      >
        <div
          className={cn(
            "flex w-full max-w-full flex-col gap-2",
            message.role === "user" ? "items-end" : "items-start"
          )}
        >
          <div className={cn("w-full", message.role === "user" ? "text-right" : "text-left")}>
            <div
              className={cn(
                "inline-block text-[15px] leading-[1.45] align-top",
                message.role === "user"
                  ? "rounded-[24px] rounded-br-[10px] border border-white/[0.08] bg-[rgba(65,63,66,0.72)] px-4 py-3.5 text-left text-white/[0.96] shadow-[0_3px_8px_-4px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.07)]"
                  : "px-0 py-0.5 text-left text-white/[0.94]"
              )}
              style={messageTextBubbleStyle}
            >
              {message.content}
            </div>
          </div>

          {!options?.measurementOnly && message.role === "ai" && message.visualBlock
            ? renderVisualBlock?.(message.visualBlock)
            : null}
        </div>
      </div>
    )
  }

  const renderTypingIndicator = (hasPreviousMessages: boolean) => (
    <div className={cn(hasPreviousMessages && "mt-5", "flex justify-start")}>
      <div className="flex max-w-[82%] items-center gap-1 px-0 py-0.5 text-white/[0.74]">
        <span className="h-2 w-2 animate-bounce rounded-full bg-white/[0.58] shadow-[0_0_6px_rgba(255,255,255,0.16)] [animation-delay:-0.2s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-white/[0.58] shadow-[0_0_6px_rgba(255,255,255,0.16)] [animation-delay:-0.1s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-white/[0.58] shadow-[0_0_6px_rgba(255,255,255,0.16)]" />
      </div>
    </div>
  )

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[28]"
        style={{
          backgroundColor: `rgba(0,0,0,${(0.30 * feedDimProgress).toFixed(3)})`,
          backdropFilter: `blur(${(2.5 * feedDimProgress).toFixed(2)}px)`,
          transition: "background-color 320ms cubic-bezier(0.16,1,0.3,1), backdrop-filter 320ms cubic-bezier(0.16,1,0.3,1)",
        }}
      />
      <div
        ref={composerMaskRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 top-0 z-[29]"
        style={{
          background:
            "linear-gradient(to top, rgba(255, 255, 255, 0.44) 0%, rgba(255, 255, 255, 0.20) 14%, rgba(255, 255, 255, 0.08) 30%, rgba(255, 255, 255, 0.03) 48%, rgba(255, 255, 255, 0.01) 66%, rgba(255, 255, 255, 0) 100%)",
        }}
      />
      <div className={cn("pointer-events-none fixed inset-x-0 bottom-0 z-30", className)}>
        <div
          ref={composerShellRef}
          className="mx-auto max-w-lg px-4 pb-2 sm:max-w-xl md:max-w-2xl lg:max-w-[600px]"
        >
          <section
            data-conversation-composer="true"
            onPointerDownCapture={handleCompactComposerPress}
            className={cn(
              "pointer-events-auto flex min-h-0 max-h-[90vh] flex-col overflow-hidden rounded-[28px] border border-white/[0.08] shadow-[0_20px_52px_-32px_rgba(2,6,23,0.44),0_6px_18px_-18px_rgba(15,23,42,0.18)] backdrop-blur-[14px] transition-[height] duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
              dragHeight !== null && "transition-none"
            )}
            style={{
              backgroundColor: COMPOSER_SURFACE_COLOR,
              backgroundImage: shouldShowConversationBody
                ? `linear-gradient(to bottom, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.18) 100%), ${COMPOSER_GRAIN}, ${CONVERSATION_DOODLE_PATTERN}`
                : `${COMPOSER_GRAIN}, ${CONVERSATION_DOODLE_PATTERN}`,
              backgroundPosition: shouldShowConversationBody ? "top left, top left, top left" : "top left, top left",
              backgroundRepeat: shouldShowConversationBody ? "no-repeat, repeat, repeat" : "repeat, repeat",
              backgroundSize: shouldShowConversationBody ? "100% 100%, 200px 200px, 400px 400px" : "200px 200px, 400px 400px",
              ...(shouldApplySheetHeight && resolvedSheetHeight > 0 ? { height: `${resolvedSheetHeight}px` } : {}),
            }}
          >
            {shouldShowTopArea && !isCompactComposer ? (
              <div
                ref={topAreaRef}
                className={cn(
                  "shrink-0 border-b px-4",
                  "border-white/[0.022] pt-3 pb-2"
                )}
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
                  className="relative flex cursor-row-resize select-none touch-none items-center justify-center py-1.5 outline-none"
                >
                  <div
                    className="h-[2px] w-8 rounded-full bg-gradient-to-r from-white/[0.04] via-white/[0.11] to-white/[0.04]"
                  />
                </div>
              </div>
            ) : null}

            {shouldRenderConversationBody ? (
              <div
                className={cn(
                  "relative min-h-0 flex-1 overflow-hidden",
                  false && "border-t border-white/[0.018]"
                )}
                style={undefined}
              >
                {hasEngagedConversation && contextRowItems.length > 0 ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 z-0 flex gap-2 px-4 py-2.5 opacity-0"
                  >
                    {contextRowItems.map((item) => renderContextChip(item, { measurementTarget: true }))}
                  </div>
                ) : null}
                <div
                  aria-hidden="true"
                  className={cn("pointer-events-none absolute inset-0 z-0", !shouldShowConversationBody && "opacity-0")}
                />
                <div
                  ref={messagesContentRef}
                  className={cn(
                    "relative z-10 h-full overflow-y-auto px-4 py-4 overscroll-contain",
                    !shouldShowConversationBody && "pointer-events-none opacity-0"
                  )}
                >
                  <div ref={messagesMeasureRef}>
                    {displayedMessages.map((message, index) =>
                      renderConversationMessage(message, index, displayedMessages)
                    )}

                    {isTyping ? renderTypingIndicator(displayedMessages.length > 0) : null}

                    <div ref={messagesEndRef} />
                  </div>
                  {isResumeAutoGrowActive ? (
                    <div
                      ref={autoGrowMeasureRef}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 right-4 top-4 opacity-0"
                    >
                      {autoGrowMessages.map((message, index) =>
                        renderConversationMessage(message, index, autoGrowMessages, { measurementOnly: true })
                      )}

                      {isTyping ? renderTypingIndicator(autoGrowMessages.length > 0) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {!hasEngagedConversation && showContextRow && (
              <div
                ref={contextRailRef}
                className="shrink-0 px-4 py-2.5"
              >
                <div data-conversation-context-rail="true" className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {contextRowItems.map((item) => renderContextChip(item))}
                </div>
              </div>
            )}

            <form
              ref={composerFormRef}
              onSubmit={handleSubmit}
              className="flex shrink-0 items-center gap-3 px-3 py-2.5"
            >
              <button
                type="button"
                disabled
                className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10"
                aria-label="Usuario"
              >
                <Image src={USER_AVATAR} alt="Usuario" fill className="object-cover" />
              </button>
              <input
                ref={composerInputRef}
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
                className="h-10 min-w-0 flex-1 bg-transparent text-[16px] text-white/92 outline-none placeholder:text-white/58"
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
