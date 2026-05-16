"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import type { ConversationContextItem } from "./conversational-ai"

export type ConversationComposerMode = "default" | "overlay" | "hidden"

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
}

const ConversationSelectionContext = createContext<ConversationSelectionController | null>(null)

export function useConversationSelectionState(): ConversationSelectionController {
  const [conversationContext, setConversationContext] = useState<ConversationContextItem[]>([])
  const [composerMode, setComposerMode] = useState<ConversationComposerMode>("default")
  const [composerOffsetClassName, setComposerOffsetClassName] = useState<string | undefined>(undefined)

  const selectedContextIds = useMemo(
    () => new Set(conversationContext.map((item) => item.id)),
    [conversationContext]
  )

  const upsertConversationContextItem = useCallback((item: ConversationContextItem) => {
    setConversationContext((prev) => {
      const deduped = prev.filter((existingItem) => existingItem.id !== item.id)
      return [item, ...deduped].slice(0, 6)
    })
  }, [])

  const toggleConversationContextItem = useCallback((item: ConversationContextItem) => {
    setConversationContext((prev) => {
      const alreadySelected = prev.some((existingItem) => existingItem.id === item.id)
      if (alreadySelected) {
        return prev.filter((existingItem) => existingItem.id !== item.id)
      }

      return [item, ...prev.filter((existingItem) => existingItem.id !== item.id)].slice(0, 6)
    })
  }, [])

  const removeConversationContext = useCallback((contextId: string) => {
    setConversationContext((prev) => prev.filter((item) => item.id !== contextId))
  }, [])

  const clearConversationContext = useCallback(() => {
    setConversationContext([])
  }, [])

  const isConversationSelected = useCallback(
    (id: string) => selectedContextIds.has(id),
    [selectedContextIds]
  )

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
