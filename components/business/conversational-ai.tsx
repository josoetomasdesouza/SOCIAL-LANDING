"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
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
import { useConversationSelectionContext } from "./conversation-selection-context"
import {
  clearComposerScrollClearanceCssVar,
  COMPOSER_SCROLL_CLEARANCE_CSS_VAR,
  resolveComposerScrollClearancePx,
  setComposerScrollClearanceCssVar,
} from "@/lib/ui/composer-scroll-clearance"
import { ComposerFeedThreadJunction } from "./composer-feed-thread-junction"
import {
  COMPOSER_SURFACE_BASELINE,
  COMPOSER_SURFACE_OVERRIDE_STORAGE_KEY,
  DEFAULT_COMPOSER_SURFACE_INTENSITY,
  isComposerSmokeSurfaceActive,
  resolveComposerExpansionProgress,
  resolveComposerExpansionSectionStyle,
  resolveComposerHandleVisuals,
  resolveComposerPageMaskBackground,
  resolveComposerSurfaceIntensity,
  resolveComposerSurfaceMaterial,
  resolveThreadEngagedProgress,
  type ComposerSurfaceIntensity,
} from "@/lib/ui/composer-surface-material"
import {
  DEFAULT_COMPOSER_LAYOUT_VERSION,
  shouldRenderThreadInFlow,
  shouldUseStickyShellCompactOnly,
} from "@/lib/ui/composer-layout"

const USER_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
const COMPOSER_MASK_TOP_OFFSET_PX = 8
const SHEET_TOP_SAFE_MARGIN_PX = 16
const CONVERSATION_DOODLE_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180' fill='none'%3E%3Cg stroke='%23242931' stroke-opacity='0.36' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 34c6-8 18-8 24 0 6 8 18 8 24 0'/%3E%3Cpath d='M112 22l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2 5-10Z'/%3E%3Cpath d='M36 96c0-7 6-13 13-13s13 6 13 13-6 13-13 13-13-6-13-13Z'/%3E%3Cpath d='M119 82c10-12 28-12 38 0'/%3E%3Cpath d='M121 92c8 9 20 9 28 0'/%3E%3Cpath d='M22 145c11-10 31-10 42 0'/%3E%3Cpath d='M74 126h20c7 0 12 5 12 12s-5 12-12 12H74c-7 0-12-5-12-12s5-12 12-12Z'/%3E%3Cpath d='M132 132c0-8 7-15 15-15s15 7 15 15-7 15-15 15-15-7-15-15Z'/%3E%3Cpath d='M92 60c0-6 5-11 11-11s11 5 11 11-5 11-11 11-11-5-11-11Z'/%3E%3C/g%3E%3C/svg%3E\")"
const SHEET_MAX_VIEWPORT_RATIO = 0.9
const SHEET_MID_VIEWPORT_RATIO = 0.55
const COMPACT_BODY_MIN_RATIO = 0.22
const COMPACT_BODY_MIN_PX = 136
const COMPACT_BODY_MAX_PX = 196
const CLOSE_THRESHOLD_OFFSET_PX = 72
const PREVIEW_DRAG_INTENT_THRESHOLD_PX = 4
const CONVERSATION_HISTORY_STORAGE_PREFIX = "business-conversation-history:"
const HANDLE_IDLE_DELAY_MS = 1200
const ECOMMERCE_PRODUCT_CONTEXT_PREFIX = "ecommerce-product-"

const SINGLE_PRODUCT_PLACEHOLDERS = [
  "Pergunte o que combina com isso...",
  "Explore opcoes similares...",
  "Continue a descoberta...",
] as const

function isEcommerceProductContext(item: ConversationContextItem) {
  return item.id.startsWith(ECOMMERCE_PRODUCT_CONTEXT_PREFIX)
}

function resolveContextualComposerPlaceholder(
  contextItems: ConversationContextItem[],
  fallbackPlaceholder: string
) {
  if (contextItems.length === 0) {
    return fallbackPlaceholder
  }

  const productContexts = contextItems.filter(isEcommerceProductContext)

  if (productContexts.length === 1 && contextItems.length === 1) {
    const stableIndex =
      productContexts[0].id.charCodeAt(productContexts[0].id.length - 1) %
      SINGLE_PRODUCT_PLACEHOLDERS.length

    return SINGLE_PRODUCT_PLACEHOLDERS[stableIndex]
  }

  if (productContexts.length > 0) {
    return "Continue explorando a partir do que voce selecionou..."
  }

  return "Pergunte sobre os itens selecionados..."
}

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
  /** Publishes compact composer footprint for scroll clearance on overlaid surfaces. */
  trackCompactFootprint?: boolean
  /** Appointment: never fall back to generic host mock rotation. */
  disableHostMockFallback?: boolean
  /** WS-21 v2: in-flow thread portal mount target from BusinessSocialLanding. */
  threadPortalTarget?: HTMLElement | null
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
    `Não captei o foco. É horário, como chegar, preço, um item do feed ou agendar na ${brandName}?`,
    `Me conta em uma frase o que você quer na ${brandName}: horário, serviço, preço ou agendar.`,
    `Posso ajudar com horário, como chegar, preços ou agendar na ${brandName}. O que você precisa?`,
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
  trackCompactFootprint = true,
  disableHostMockFallback = false,
  threadPortalTarget = null,
}: ConversationalAIProps) {
  const conversationSelectionContext = useConversationSelectionContext()
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
  const [isHandleActive, setIsHandleActive] = useState(false)
  const [sheetMetrics, setSheetMetrics] = useState<SheetMetrics>({
    compact: 0,
    auto: 0,
    medium: 0,
    expanded: 0,
    closeThreshold: 0,
  })
  const [surfaceIntensity, setSurfaceIntensity] = useState<ComposerSurfaceIntensity>(
    DEFAULT_COMPOSER_SURFACE_INTENSITY
  )
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
  const handleIdleTimeoutRef = useRef<number | null>(null)
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
  const resolvedPlaceholder = useMemo(
    () => resolveContextualComposerPlaceholder(contextItems, placeholder),
    [contextItems, placeholder]
  )
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
  const composerLayoutVersion =
    conversationSelectionContext?.composerLayoutVersion ?? DEFAULT_COMPOSER_LAYOUT_VERSION
  const composerMode = conversationSelectionContext?.composerMode ?? "default"
  const isLayoutV2 = shouldRenderThreadInFlow(composerLayoutVersion)
  const isStickyShellCompactOnly = shouldUseStickyShellCompactOnly(composerLayoutVersion)
  const isThreadAnchorVisible = composerMode === "default"
  const shouldPortalThread = isLayoutV2 && isThreadAnchorVisible && hasEngagedConversation
  const conversationTurnCount = useMemo(
    () => messages.filter((message) => message.role === "user" || message.role === "ai").length,
    [messages]
  )
  const targetThreadEngagedProgress = useMemo(
    () =>
      resolveThreadEngagedProgress({
        isLayoutV2,
        composerMode,
        hasEngagedConversation,
        conversationTurnCount,
      }),
    [composerMode, conversationTurnCount, hasEngagedConversation, isLayoutV2]
  )
  const [threadEngagedProgress, setThreadEngagedProgress] = useState(0)

  useEffect(() => {
    if (targetThreadEngagedProgress <= 0) {
      setThreadEngagedProgress(0)
      return
    }

    const frame = window.requestAnimationFrame(() => {
      setThreadEngagedProgress(targetThreadEngagedProgress)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [targetThreadEngagedProgress])

  useEffect(() => {
    if (!conversationSelectionContext || !isLayoutV2) {
      return
    }

    conversationSelectionContext.setComposerThreadEngagedProgress(threadEngagedProgress)

    return () => {
      conversationSelectionContext.setComposerThreadEngagedProgress(0)
    }
  }, [conversationSelectionContext, isLayoutV2, threadEngagedProgress])

  const isEngagedPerceptual = isLayoutV2 && threadEngagedProgress > 0
  const shellContextRowItems = useMemo(
    () => (isLayoutV2 ? contextItems.filter((item) => !hiddenContextIdSet.has(item.id)) : contextRowItems),
    [contextItems, contextRowItems, hiddenContextIdSet, isLayoutV2]
  )
  const showContextRowOnShell = isLayoutV2
    ? shellContextRowItems.length > 0
    : showContextRow
  const measureShowContextRow = isLayoutV2 ? showContextRowOnShell : showContextRow
  const shellShouldShowConversationBody = isStickyShellCompactOnly ? false : shouldShowConversationBody
  const shellShouldRenderConversationBody = isStickyShellCompactOnly ? false : shouldRenderConversationBody
  const shellShouldShowTopArea = isStickyShellCompactOnly ? false : shouldShowTopArea
  const shellShouldApplySheetHeight = isStickyShellCompactOnly ? true : shouldApplySheetHeight
  const isResumeAutoGrowActive = resumeSessionStartIndex !== null
  const autoGrowMessages = useMemo(() => {
    if (resumeSessionStartIndex === null) {
      return messages
    }

    return messages.slice(Math.min(resumeSessionStartIndex, messages.length))
  }, [messages, resumeSessionStartIndex])

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get("composer-smoke")
    if (fromQuery === "off" || fromQuery === "smoke-fume" || fromQuery === "smoke-subtle") {
      window.localStorage.setItem(COMPOSER_SURFACE_OVERRIDE_STORAGE_KEY, fromQuery)
    }
    setSurfaceIntensity(resolveComposerSurfaceIntensity())
  }, [])

  const composerSurfaceMaterial = resolveComposerSurfaceMaterial(surfaceIntensity)
  const composerSectionSurfaceClass = composerSurfaceMaterial.sectionClassName
  const composerInnerSurfaceStyle = composerSurfaceMaterial.innerSurfaceStyle
  const isSmokeShell = isComposerSmokeSurfaceActive(surfaceIntensity)

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

  const scrollInFlowThreadToLatestTurn = useCallback(() => {
    const endElement = messagesEndRef.current
    if (!endElement || typeof window === "undefined") {
      return
    }

    const contextClearancePx = conversationSelectionContext?.composerScrollClearancePx ?? 0
    const cssClearancePx = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(COMPOSER_SCROLL_CLEARANCE_CSS_VAR)
    )
    const clearancePx = Math.max(
      0,
      contextClearancePx > 0 ? contextClearancePx : Number.isFinite(cssClearancePx) ? cssClearancePx : 0
    )

    endElement.style.scrollMarginBottom = `${clearancePx}px`

    const shellElement = composerShellRef.current?.querySelector<HTMLElement>(
      '[data-conversation-composer="true"]'
    )
    const endRect = endElement.getBoundingClientRect()
    const shellTop = shellElement?.getBoundingClientRect().top
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight
    const visibleTopLimit = (shellTop ?? viewportHeight - clearancePx) - 8
    const overlapPx = endRect.bottom - visibleTopLimit

    if (overlapPx > 0) {
      window.scrollTo({
        top: window.scrollY + overlapPx,
        behavior: "smooth",
      })
      window.setTimeout(() => {
        const followEnd = messagesEndRef.current
        const followShell = composerShellRef.current?.querySelector<HTMLElement>(
          '[data-conversation-composer="true"]'
        )
        if (!followEnd || !followShell) {
          return
        }

        const followRect = followEnd.getBoundingClientRect()
        const followShellTop = followShell.getBoundingClientRect().top
        const followOverlap = followRect.bottom - (followShellTop - 8)

        if (followOverlap > 0) {
          window.scrollTo({
            top: window.scrollY + followOverlap,
            behavior: "auto",
          })
        }
      }, 400)
      return
    }

    endElement.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [conversationSelectionContext?.composerScrollClearancePx])

  useEffect(() => {
    if (shouldPortalThread) {
      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(scrollInFlowThreadToLatestTurn)
      })
      return () => window.cancelAnimationFrame(frame)
    }

    if (shellShouldShowConversationBody) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [
    scrollInFlowThreadToLatestTurn,
    shellShouldShowConversationBody,
    shouldPortalThread,
    messages,
    isTyping,
  ])

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
      if (handleIdleTimeoutRef.current !== null) {
        window.clearTimeout(handleIdleTimeoutRef.current)
      }
    }
  }, [])

  const clearHandleIdleTimeout = useCallback(() => {
    if (handleIdleTimeoutRef.current !== null) {
      window.clearTimeout(handleIdleTimeoutRef.current)
      handleIdleTimeoutRef.current = null
    }
  }, [])

  const primeHandleVisibility = useCallback(
    (lingerMs: number = HANDLE_IDLE_DELAY_MS) => {
      clearHandleIdleTimeout()
      setIsHandleActive(true)
      handleIdleTimeoutRef.current = window.setTimeout(() => {
        setIsHandleActive(false)
        handleIdleTimeoutRef.current = null
      }, lingerMs)
    },
    [clearHandleIdleTimeout]
  )

  const measureSheetLayout = useCallback(() => {
    if (typeof window === "undefined") {
      return
    }

    const viewportHeight = window.visualViewport?.height ?? window.innerHeight
    const shellBottom = composerShellRef.current?.getBoundingClientRect().bottom ?? viewportHeight
    const bottomOffset = Math.max(0, viewportHeight - shellBottom)
    const availableViewportHeight = Math.max(0, viewportHeight - bottomOffset - SHEET_TOP_SAFE_MARGIN_PX)
    const expanded = Math.round(availableViewportHeight * SHEET_MAX_VIEWPORT_RATIO)
    const topAreaHeight = shellShouldShowTopArea ? topAreaRef.current?.offsetHeight ?? 0 : 0
    const contextHeight = measureShowContextRow ? contextRailRef.current?.offsetHeight ?? 0 : 0
    const formHeight = composerFormRef.current?.offsetHeight ?? 0
    const chromeHeight = topAreaHeight + contextHeight + formHeight
    const messagesContentElement = messagesContentRef.current
    const messagesContentStyle = messagesContentElement ? window.getComputedStyle(messagesContentElement) : null
    const messagesContentPaddingY = messagesContentStyle
      ? parseFloat(messagesContentStyle.paddingTop) + parseFloat(messagesContentStyle.paddingBottom)
      : 0
    const measuredConversationContentHeight = shellShouldShowConversationBody
      ? isResumeAutoGrowActive
        ? autoGrowMeasureRef.current?.offsetHeight ?? 0
        : messagesMeasureRef.current?.offsetHeight ?? messagesContentRef.current?.scrollHeight ?? 0
      : 0
    const conversationContentHeight = shellShouldShowConversationBody
      ? measuredConversationContentHeight + (isCompactResumePreview ? messagesContentPaddingY : 0)
      : 0
    const compactBodyHeight = shellShouldShowConversationBody
      ? isCompactResumePreview
        ? conversationContentHeight
        : Math.min(
            COMPACT_BODY_MAX_PX,
            Math.max(COMPACT_BODY_MIN_PX, Math.round(availableViewportHeight * COMPACT_BODY_MIN_RATIO))
          )
      : 0
    const compact = Math.min(expanded, shellShouldShowConversationBody ? chromeHeight + compactBodyHeight : chromeHeight)
    const auto = shellShouldShowConversationBody
      ? Math.min(expanded, Math.max(compact, chromeHeight + conversationContentHeight))
      : compact
    const medium = Math.min(
      expanded,
      Math.max(compact, Math.round(availableViewportHeight * SHEET_MID_VIEWPORT_RATIO))
    )
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
  }, [
    isResumeAutoGrowActive,
    measureShowContextRow,
    shellShouldShowConversationBody,
    shellShouldShowTopArea,
  ])

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
  }, [measureSheetLayout, hasEngagedConversation, measureShowContextRow])

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
  const resolvedSheetHeight = isStickyShellCompactOnly
    ? sheetMetrics.compact
    : dragHeight ?? resolvedAutoHeight
  const forceCompactShell = isStickyShellCompactOnly || !shellShouldShowConversationBody
  const expansionProgress = isStickyShellCompactOnly
    ? 0
    : resolveComposerExpansionProgress(
        sheetMetrics.compact,
        sheetMetrics.expanded,
        resolvedSheetHeight
      )
  const composerSectionStyle = resolveComposerExpansionSectionStyle(
    surfaceIntensity,
    expansionProgress,
    forceCompactShell
  )
  const composerPageMaskBackground =
    isLayoutV2 && hasEngagedConversation
      ? "transparent"
      : resolveComposerPageMaskBackground(
          surfaceIntensity,
          forceCompactShell ? 0 : expansionProgress,
          hasEngagedConversation
        )
  const composerHandleVisuals = resolveComposerHandleVisuals(
    forceCompactShell ? 0 : expansionProgress,
    hasEngagedConversation,
    isHandleActive
  )

  const publishComposerScrollMetrics = useCallback(() => {
    if (!trackCompactFootprint || typeof window === "undefined") {
      return
    }

    const viewportHeight = window.visualViewport?.height ?? window.innerHeight
    const composerWrapper = composerShellRef.current
    const composerSection = composerWrapper?.querySelector<HTMLElement>(
      '[data-conversation-composer="true"]'
    )

    if (!composerSection) {
      return
    }

    const sectionRect = composerSection.getBoundingClientRect()
    const wrapperRect = composerWrapper?.getBoundingClientRect()

    if (sectionRect.height <= 0 || sectionRect.width <= 0) {
      return
    }

    let footprintPx = Math.round(Math.max(0, viewportHeight - sectionRect.top))
    let bottomInsetPx = Math.round(Math.max(0, viewportHeight - sectionRect.bottom))

    if (footprintPx < 48) {
      const wrapperBottomInset = wrapperRect
        ? Math.round(Math.max(0, viewportHeight - wrapperRect.bottom))
        : 16
      footprintPx = Math.max(
        footprintPx,
        sheetMetrics.compact + Math.max(wrapperBottomInset, bottomInsetPx, 16)
      )
      bottomInsetPx = Math.max(bottomInsetPx, wrapperBottomInset, 16)
    }

    const clearancePx = resolveComposerScrollClearancePx(footprintPx, bottomInsetPx)

    conversationSelectionContext?.setComposerScrollMetrics({
      footprintPx,
      bottomInsetPx,
      clearancePx,
    })
    setComposerScrollClearanceCssVar(clearancePx)
  }, [conversationSelectionContext, sheetMetrics.compact, trackCompactFootprint])

  useEffect(() => {
    if (trackCompactFootprint) {
      return
    }

    conversationSelectionContext?.setComposerScrollMetrics({
      footprintPx: 0,
      bottomInsetPx: 0,
      clearancePx: 0,
    })
    clearComposerScrollClearanceCssVar()
  }, [conversationSelectionContext, trackCompactFootprint])

  const setComposerScrollMetricsRef = useRef(conversationSelectionContext?.setComposerScrollMetrics)
  setComposerScrollMetricsRef.current = conversationSelectionContext?.setComposerScrollMetrics

  useEffect(() => {
    return () => {
      setComposerScrollMetricsRef.current?.({
        footprintPx: 0,
        bottomInsetPx: 0,
        clearancePx: 0,
      })
      clearComposerScrollClearanceCssVar()
    }
  }, [])

  useEffect(() => {
    const clearancePx = conversationSelectionContext?.composerScrollClearancePx ?? 0
    if (clearancePx > 0) {
      setComposerScrollClearanceCssVar(clearancePx)
    }
  }, [conversationSelectionContext?.composerScrollClearancePx])

  useLayoutEffect(() => {
    publishComposerScrollMetrics()
    const frame = window.requestAnimationFrame(publishComposerScrollMetrics)
    return () => window.cancelAnimationFrame(frame)
  }, [
    publishComposerScrollMetrics,
    resolvedSheetHeight,
    className,
    contextItems.length,
    hiddenContextIds.length,
    hasEngagedConversation,
    measureShowContextRow,
    trackCompactFootprint,
    isStickyShellCompactOnly,
    shouldPortalThread,
  ])

  useEffect(() => {
    if (!shouldPortalThread) {
      return
    }

    publishComposerScrollMetrics()
    const frame = window.requestAnimationFrame(() => {
      publishComposerScrollMetrics()
      window.requestAnimationFrame(scrollInFlowThreadToLatestTurn)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [
    publishComposerScrollMetrics,
    scrollInFlowThreadToLatestTurn,
    shouldPortalThread,
    messages,
    isTyping,
  ])

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
    publishComposerScrollMetrics()

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            updateMaskBounds()
            publishComposerScrollMetrics()
          })
        : null

    resizeObserver?.observe(shellElement)
    window.addEventListener("resize", updateMaskBounds, { passive: true })

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener("resize", updateMaskBounds)
    }
  }, [className, contextItems.length, hasEngagedConversation, measureShowContextRow, publishComposerScrollMetrics, resolvedSheetHeight])

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

  const buildResolvedReply = async (userMessage: string): Promise<ConversationRuntimeMessage> => {
    const resolvedReply = await Promise.resolve(
      responseResolver?.({
        message: userMessage,
        brandName,
        contextItems,
      })
    )

    if (resolvedReply) {
      return {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: resolvedReply.text,
        visualBlock: resolvedReply.visualBlock,
      }
    }

    const fallbackText = disableHostMockFallback
      ? "Posso ajudar com horário, como chegar, preço ou agendar. O que você quer saber?"
      : buildMockReply(brandName, userMessage, contextItems)

    return {
      id: `ai-${Date.now()}`,
      role: "ai",
      content: fallbackText,
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
      void buildResolvedReply(nextMessage).then((aiMessage) => {
        setMessages((prev) => [...prev, aiMessage])
        setIsTyping(false)
        setIsConversationCollapsed(false)
        setIsCompactResumePreview(false)
        replyTimeoutRef.current = null
      })
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

    primeHandleVisibility()

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

  const conversationPanelPatternStyle = isSmokeShell
    ? ({
        backgroundColor: "transparent",
        backgroundImage: CONVERSATION_DOODLE_PATTERN,
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
        backgroundSize: "180px 180px",
        opacity: 0.22 + (forceCompactShell ? 0 : expansionProgress) * 0.12,
      } as const)
    : ({
        backgroundColor: COMPOSER_SURFACE_BASELINE,
        backgroundImage: CONVERSATION_DOODLE_PATTERN,
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
        backgroundSize: "180px 180px",
        opacity: 0.22 + (forceCompactShell ? 0 : expansionProgress) * 0.12,
      } as const)
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
      inFlowThread?: boolean
    }
  ) => {
    const inFlowThread = options?.inFlowThread === true
    const previousMessage = messageList[index - 1]
    const sharesGroupWithPrevious =
      previousMessage?.role === message.role && message.role !== "context_event"
    const spacingClass = index === 0 ? "" : sharesGroupWithPrevious ? "mt-3" : "mt-7"

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
                  ? inFlowThread
                    ? "max-w-[88%] border-r-2 border-foreground/15 pr-3 text-right text-[15px] font-medium leading-[1.5] text-foreground/90"
                    : "rounded-[24px] rounded-br-[10px] border border-white/[0.07] bg-[rgba(62,70,79,0.96)] px-4 py-3.5 text-left text-white/[0.96] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.72)]"
                  : inFlowThread
                    ? "max-w-[92%] border-l-2 border-accent/35 pl-3 py-0.5 text-left text-[16px] leading-[1.55] text-foreground/95"
                    : "px-0 py-0.5 text-left text-foreground/90"
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

  const renderTypingIndicator = (hasPreviousMessages: boolean, inFlowThread = false) => (
    <div className={cn(hasPreviousMessages && "mt-5", "flex justify-start")}>
      <div
        className={cn(
          "flex max-w-[82%] items-center gap-1 px-0 py-0.5",
          inFlowThread ? "text-foreground/55" : "text-white/[0.74]"
        )}
      >
        <span
          className={cn(
            "h-2 w-2 animate-bounce rounded-full [animation-delay:-0.2s]",
            inFlowThread ? "bg-foreground/45" : "bg-white/[0.58] shadow-[0_0_6px_rgba(255,255,255,0.16)]"
          )}
        />
        <span
          className={cn(
            "h-2 w-2 animate-bounce rounded-full [animation-delay:-0.1s]",
            inFlowThread ? "bg-foreground/45" : "bg-white/[0.58] shadow-[0_0_6px_rgba(255,255,255,0.16)]"
          )}
        />
        <span
          className={cn(
            "h-2 w-2 animate-bounce rounded-full",
            inFlowThread ? "bg-foreground/45" : "bg-white/[0.58] shadow-[0_0_6px_rgba(255,255,255,0.16)]"
          )}
        />
      </div>
    </div>
  )

  const threadPortalContent =
    shouldPortalThread && threadPortalTarget ? (
      <div data-composer-thread-engaged-progress={threadEngagedProgress.toFixed(2)}>
        <ComposerFeedThreadJunction progress={threadEngagedProgress} />
        <div
          className={cn(
            "relative py-6 sm:py-7",
            isEngagedPerceptual &&
              "rounded-t-[28px] bg-gradient-to-b from-secondary/25 via-background to-background px-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
          )}
        >
          {isEngagedPerceptual ? (
            <div
              aria-hidden
              className="mb-5 h-px w-full bg-gradient-to-r from-transparent via-border/70 to-transparent"
            />
          ) : null}
          <div ref={messagesMeasureRef}>
            {displayedMessages.map((message, index) =>
              renderConversationMessage(message, index, displayedMessages, { inFlowThread: true })
            )}

            {isTyping ? renderTypingIndicator(displayedMessages.length > 0, true) : null}

            <div
              ref={messagesEndRef}
              style={{ scrollMarginBottom: `var(${COMPOSER_SCROLL_CLEARANCE_CSS_VAR}, 0px)` }}
            />
          </div>
        </div>
      </div>
    ) : null

  return (
    <>
      <div
        ref={composerMaskRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 top-0 z-[29]"
        style={{
          background: composerPageMaskBackground,
        }}
      />
      <div className={cn("pointer-events-none fixed inset-x-0 bottom-0 z-30", className)}>
        <div
          ref={composerShellRef}
          className="mx-auto max-w-lg px-4 pb-4 sm:max-w-xl md:max-w-2xl lg:max-w-[600px]"
        >
          <section
            data-conversation-composer="true"
            data-composer-surface={
              isComposerSmokeSurfaceActive(surfaceIntensity) ? surfaceIntensity : undefined
            }
            data-composer-layout-version={composerLayoutVersion}
            data-composer-thread-engaged-progress={
              isLayoutV2 ? threadEngagedProgress.toFixed(2) : undefined
            }
            onPointerDownCapture={handleCompactComposerPress}
            className={cn(
              "pointer-events-auto flex min-h-0 max-h-[90vh] flex-col overflow-hidden transition-[height,border-radius,box-shadow] duration-300 ease-out",
              isEngagedPerceptual ? "rounded-b-[28px] rounded-t-[18px]" : "rounded-[28px]",
              composerSectionSurfaceClass,
              isEngagedPerceptual &&
                "shadow-[0_-16px_48px_-28px_rgba(15,23,42,0.28)] ring-1 ring-white/[0.08]",
              dragHeight !== null && "transition-none"
            )}
            style={{
              ...composerSectionStyle,
              ...(shellShouldApplySheetHeight && resolvedSheetHeight > 0
                ? { height: `${resolvedSheetHeight}px` }
                : {}),
            }}
          >
            {shellShouldShowTopArea && !isCompactComposer ? (
              <div
                ref={topAreaRef}
                className={cn(
                  "shrink-0 border-b px-4",
                  "border-white/[0.07] pt-3 pb-2"
                )}
                style={composerInnerSurfaceStyle}
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
                    className="h-1 rounded-full bg-gradient-to-r from-white/[0.08] via-white/[0.26] to-white/[0.08] transition-[width,opacity] duration-200 ease-out"
                    style={{
                      width: `${composerHandleVisuals.widthPx}px`,
                      opacity: composerHandleVisuals.opacity,
                    }}
                  />
                </div>
              </div>
            ) : null}

            {shellShouldRenderConversationBody ? (
              <div
                className={cn(
                  "relative min-h-0 flex-1 overflow-hidden",
                  shellShouldShowConversationBody && "border-t border-white/[0.035]"
                )}
                style={composerInnerSurfaceStyle}
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
                  className={cn("pointer-events-none absolute inset-0", !shellShouldShowConversationBody && "opacity-0")}
                  style={conversationPanelPatternStyle}
                />
                <div
                  ref={messagesContentRef}
                  className={cn(
                    "relative z-10 h-full overflow-y-auto px-4 py-4 overscroll-contain",
                    !shellShouldShowConversationBody && "pointer-events-none opacity-0"
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

            {(isLayoutV2 ? showContextRowOnShell : !hasEngagedConversation && showContextRow) && (
              <div
                ref={contextRailRef}
                className={cn("shrink-0 px-4 py-2.5", isEngagedPerceptual && "py-1.5 opacity-90")}
                style={composerInnerSurfaceStyle}
              >
                <div data-conversation-context-rail="true" className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {(isLayoutV2 ? shellContextRowItems : contextRowItems).map((item) => renderContextChip(item))}
                </div>
              </div>
            )}

            <form
              ref={composerFormRef}
              onSubmit={handleSubmit}
              className="flex shrink-0 items-center gap-3 px-3 py-2.5"
              style={composerInnerSurfaceStyle}
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
      {threadPortalContent && threadPortalTarget
        ? createPortal(threadPortalContent, threadPortalTarget)
        : null}
    </>
  )
}
