"use client"

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from "react"
import type { ConversationContextItem } from "./conversational-ai"
import { getConversationContextChipRect } from "./conversation-context-chip-dom"

export type ConversationComposerMode = "default" | "overlay" | "hidden"

export interface ConversationMorphRect {
  left: number
  top: number
  width: number
  height: number
  borderRadius: number
}

export interface ConversationMorphPreview {
  id: string
  title: string
  subtitle?: string
  image: string
}

export interface ConversationActiveMorph {
  key: number
  contextId: string
  preview: ConversationMorphPreview
  fromRect: ConversationMorphRect
  toRect: ConversationMorphRect
}

interface PendingConversationMorph {
  key: number
  contextId: string
  preview: ConversationMorphPreview
  sourceRect: ConversationMorphRect
}

const MORPH_TARGET_MIN_SIZE = 48
const MORPH_TARGET_HEIGHT = 48
const MORPH_TARGET_WIDTH = 188
const MORPH_SPAWN_SCALE = 1.08

function isVisibleRect(rect: DOMRect) {
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0
}

function getComposerMaxWidth(viewportWidth: number) {
  if (viewportWidth >= 1024) return 600
  if (viewportWidth >= 768) return 672
  if (viewportWidth >= 640) return 576
  return 512
}

function getComposerFallbackRect(): ConversationMorphRect {
  const composerElement = document.querySelector<HTMLElement>('[data-conversation-composer="true"]')

  if (composerElement) {
    const composerRect = composerElement.getBoundingClientRect()

    if (isVisibleRect(composerRect)) {
      return {
        left: composerRect.left + 16,
        top: composerRect.top + 12,
        width: Math.max(MORPH_TARGET_MIN_SIZE, Math.min(MORPH_TARGET_WIDTH, composerRect.width - 32)),
        height: Math.max(MORPH_TARGET_MIN_SIZE, MORPH_TARGET_HEIGHT),
        borderRadius: 999,
      }
    }
  }

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const composerWidth = Math.min(viewportWidth, getComposerMaxWidth(viewportWidth))
  const horizontalInset = Math.max(16, (viewportWidth - composerWidth) / 2 + 16)

  return {
    left: horizontalInset,
    top: viewportHeight - 128,
    width: Math.max(MORPH_TARGET_MIN_SIZE, Math.min(MORPH_TARGET_WIDTH, Math.max(156, composerWidth - 32))),
    height: Math.max(MORPH_TARGET_MIN_SIZE, MORPH_TARGET_HEIGHT),
    borderRadius: 999,
  }
}

function createMorphSpawnRect(sourceRect: ConversationMorphRect, targetRect: ConversationMorphRect): ConversationMorphRect {
  const spawnWidth = Math.max(MORPH_TARGET_MIN_SIZE, targetRect.width * MORPH_SPAWN_SCALE)
  const spawnHeight = Math.max(MORPH_TARGET_MIN_SIZE, targetRect.height * MORPH_SPAWN_SCALE)
  const sourceCenterX = sourceRect.left + sourceRect.width / 2
  const sourceCenterY = sourceRect.top + sourceRect.height / 2

  return {
    left: sourceCenterX - spawnWidth / 2,
    top: sourceCenterY - spawnHeight / 2,
    width: spawnWidth,
    height: spawnHeight,
    borderRadius: 999,
  }
}

interface ConversationSelectionController {
  conversationContext: ConversationContextItem[]
  selectedContextIds: Set<string>
  upsertConversationContextItem: (item: ConversationContextItem) => void
  toggleConversationContextItem: (item: ConversationContextItem) => void
  removeConversationContext: (contextId: string) => void
  clearConversationContext: () => void
  isConversationSelected: (id: string) => boolean
  composerMode: ConversationComposerMode
  setComposerMode: (mode: ConversationComposerMode) => void
  composerOffsetClassName?: string
  setComposerOffsetClassName: (className?: string) => void
  hiddenContextIds: string[]
  activeMorph: ConversationActiveMorph | null
  queueConversationContextMorph: (item: ConversationContextItem, sourceElement: HTMLElement | null) => void
  completeConversationContextMorph: (contextId: string, morphKey: number) => void
}

const ConversationSelectionContext = createContext<ConversationSelectionController | null>(null)

export function useConversationSelectionState(): ConversationSelectionController {
  const [conversationContext, setConversationContext] = useState<ConversationContextItem[]>([])
  const [composerMode, setComposerMode] = useState<ConversationComposerMode>("default")
  const [composerOffsetClassName, setComposerOffsetClassName] = useState<string | undefined>(undefined)
  const [hiddenContextIds, setHiddenContextIds] = useState<string[]>([])
  const [activeMorph, setActiveMorph] = useState<ConversationActiveMorph | null>(null)
  const [queuedMorph, setQueuedMorph] = useState<PendingConversationMorph | null>(null)

  const selectedContextIds = useMemo(
    () => new Set(conversationContext.map((item) => item.id)),
    [conversationContext]
  )

  useLayoutEffect(() => {
    if (!queuedMorph) {
      return
    }

    const targetRect = getConversationContextChipRect(queuedMorph.contextId) ?? getComposerFallbackRect()

    setActiveMorph({
      key: queuedMorph.key,
      contextId: queuedMorph.contextId,
      preview: queuedMorph.preview,
      fromRect: createMorphSpawnRect(queuedMorph.sourceRect, targetRect),
      toRect: targetRect,
    })
    setQueuedMorph(null)
  }, [queuedMorph])

  const clearMorphStateForContext = useCallback((contextId: string) => {
    setHiddenContextIds((prev) => prev.filter((id) => id !== contextId))
    setQueuedMorph((prev) => (prev?.contextId === contextId ? null : prev))
    setActiveMorph((prev) => (prev?.contextId === contextId ? null : prev))
  }, [])

  const upsertConversationContextItem = useCallback((item: ConversationContextItem) => {
    setConversationContext((prev) => {
      const deduped = prev.filter((existingItem) => existingItem.id !== item.id)
      return [item, ...deduped].slice(0, 6)
    })
  }, [])

  const toggleConversationContextItem = useCallback((item: ConversationContextItem) => {
    if (selectedContextIds.has(item.id)) {
      setConversationContext((prev) => prev.filter((existingItem) => existingItem.id !== item.id))
      clearMorphStateForContext(item.id)
      return
    }

    setConversationContext((prev) => [item, ...prev.filter((existingItem) => existingItem.id !== item.id)].slice(0, 6))
  }, [clearMorphStateForContext, selectedContextIds])

  const removeConversationContext = useCallback((contextId: string) => {
    setConversationContext((prev) => prev.filter((item) => item.id !== contextId))
    clearMorphStateForContext(contextId)
  }, [clearMorphStateForContext])

  const clearConversationContext = useCallback(() => {
    setConversationContext([])
    setHiddenContextIds([])
    setQueuedMorph(null)
    setActiveMorph(null)
  }, [])

  const isConversationSelected = useCallback(
    (id: string) => selectedContextIds.has(id),
    [selectedContextIds]
  )

  const queueConversationContextMorph = useCallback((item: ConversationContextItem, sourceElement: HTMLElement | null) => {
    if (typeof window === "undefined" || !sourceElement) {
      return
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    const sourceRect = sourceElement.getBoundingClientRect()

    if (!isVisibleRect(sourceRect)) {
      return
    }

    const morphKey = Date.now()

    setHiddenContextIds((currentIds) => (currentIds.includes(item.id) ? currentIds : [...currentIds, item.id]))
    setQueuedMorph({
      key: morphKey,
      contextId: item.id,
      preview: {
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        image: item.image,
      },
      sourceRect: {
        left: sourceRect.left,
        top: sourceRect.top,
        width: sourceRect.width,
        height: sourceRect.height,
        borderRadius: 999,
      },
    })
  }, [])

  const completeConversationContextMorph = useCallback((contextId: string, morphKey: number) => {
    setHiddenContextIds((currentIds) => currentIds.filter((id) => id !== contextId))
    setActiveMorph((currentMorph) => (currentMorph?.key === morphKey ? null : currentMorph))
  }, [])

  return {
    conversationContext,
    selectedContextIds,
    upsertConversationContextItem,
    toggleConversationContextItem,
    removeConversationContext,
    clearConversationContext,
    isConversationSelected,
    composerMode,
    setComposerMode,
    composerOffsetClassName,
    setComposerOffsetClassName,
    hiddenContextIds,
    activeMorph,
    queueConversationContextMorph,
    completeConversationContextMorph,
  }
}

export function useConversationSelectionContext() {
  return useContext(ConversationSelectionContext)
}

export function ConversationSelectionProvider({
  children,
  value,
}: {
  children: ReactNode
  value: ConversationSelectionController
}) {
  return <ConversationSelectionContext.Provider value={value}>{children}</ConversationSelectionContext.Provider>
}
