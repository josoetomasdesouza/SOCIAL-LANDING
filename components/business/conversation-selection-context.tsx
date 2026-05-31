"use client"

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react"
import { observeComposerModeChanged } from "@/lib/events/instrumentation"
import type { ComposerScrollMetrics } from "@/lib/ui/composer-scroll-clearance"
import type { ConversationContextItem } from "./conversational-ai"
import { useConversationContextMorph } from "./conversation-context-morph"

export type ConversationComposerMode = "default" | "overlay" | "hidden"

interface ConversationSelectionController {
  conversationContext: ConversationContextItem[]
  selectedContextIds: Set<string>
  upsertConversationContextItem: (item: ConversationContextItem) => void
  toggleConversationContextItem: (item: ConversationContextItem) => void
  /** Shared morph pipeline — same gesture continuity as feed posts. */
  toggleConversationContextItemWithMorph: (item: ConversationContextItem) => void
  hiddenContextIds: string[]
  removeConversationContext: (contextId: string) => void
  clearConversationContext: () => void
  isConversationSelected: (id: string) => boolean
  composerMode: ConversationComposerMode
  setComposerMode: (mode: ConversationComposerMode) => void
  /** Viewport-bottom → composer-top, in px. */
  composerCompactFootprintPx: number
  /** Composer-bottom → viewport-bottom, in px (pb-4 / safe-area gap). */
  composerBottomInsetPx: number
  /** footprint + bottomInset — symmetric clearance for overlaid content. */
  composerScrollClearancePx: number
  setComposerScrollMetrics: (metrics: ComposerScrollMetrics) => void
  composerOffsetClassName?: string
  setComposerOffsetClassName: (className?: string) => void
}

const ConversationSelectionContext = createContext<ConversationSelectionController | null>(null)

export function useConversationSelectionState(): ConversationSelectionController {
  const [conversationContext, setConversationContext] = useState<ConversationContextItem[]>([])
  const [composerMode, setComposerModeState] = useState<ConversationComposerMode>("default")
  const [composerCompactFootprintPx, setComposerCompactFootprintPxState] = useState(0)
  const [composerBottomInsetPx, setComposerBottomInsetPxState] = useState(0)
  const [composerScrollClearancePx, setComposerScrollClearancePxState] = useState(0)
  const [composerOffsetClassName, setComposerOffsetClassName] = useState<string | undefined>(undefined)
  const composerModeRef = useRef<ConversationComposerMode>("default")

  const setComposerScrollMetrics = useCallback(
    ({ footprintPx, bottomInsetPx, clearancePx }: ComposerScrollMetrics) => {
      setComposerCompactFootprintPxState((previous) => (previous === footprintPx ? previous : footprintPx))
      setComposerBottomInsetPxState((previous) => (previous === bottomInsetPx ? previous : bottomInsetPx))
      setComposerScrollClearancePxState((previous) => (previous === clearancePx ? previous : clearancePx))
    },
    []
  )

  const setComposerMode = useCallback((mode: ConversationComposerMode) => {
    const from = composerModeRef.current
    composerModeRef.current = mode
    setComposerModeState(mode)
    observeComposerModeChanged({
      from,
      to: mode,
      source: "conversation-context",
    })
  }, [])

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
    toggleConversationContextItemWithMorph: toggleConversationContextItem,
    hiddenContextIds: [],
    removeConversationContext,
    clearConversationContext,
    isConversationSelected,
    composerMode,
    setComposerMode,
    composerCompactFootprintPx,
    composerBottomInsetPx,
    composerScrollClearancePx,
    setComposerScrollMetrics,
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
  vertical,
}: {
  children: ReactNode
  value: Omit<ConversationSelectionController, "toggleConversationContextItemWithMorph" | "hiddenContextIds"> &
    Partial<Pick<ConversationSelectionController, "toggleConversationContextItemWithMorph" | "hiddenContextIds">>
  /** When set, wires shared PostToChatMorphLayer for drawer + feed continuity. */
  vertical?: string
}) {
  if (vertical) {
    return (
      <ConversationSelectionProviderWithMorphLayer value={value} vertical={vertical}>
        {children}
      </ConversationSelectionProviderWithMorphLayer>
    )
  }

  const passthroughValue = useMemo<ConversationSelectionController>(
    () => ({
      ...value,
      toggleConversationContextItemWithMorph:
        value.toggleConversationContextItemWithMorph ?? value.toggleConversationContextItem,
      hiddenContextIds: value.hiddenContextIds ?? [],
    }),
    [value]
  )

  return (
    <ConversationSelectionContext.Provider value={passthroughValue}>{children}</ConversationSelectionContext.Provider>
  )
}

function ConversationSelectionProviderWithMorphLayer({
  children,
  value,
  vertical,
}: {
  children: ReactNode
  value: Omit<ConversationSelectionController, "toggleConversationContextItemWithMorph" | "hiddenContextIds">
  vertical: string
}) {
  const morph = useConversationContextMorph(
    {
      selectedContextIds: value.selectedContextIds,
      toggleConversationContextItem: value.toggleConversationContextItem,
      removeConversationContext: value.removeConversationContext,
    },
    vertical
  )

  const enrichedValue = useMemo<ConversationSelectionController>(
    () => ({
      ...value,
      toggleConversationContextItemWithMorph: morph.toggleConversationContextItemWithMorph,
      hiddenContextIds: morph.hiddenContextIds,
    }),
    [value, morph.toggleConversationContextItemWithMorph, morph.hiddenContextIds]
  )

  return (
    <ConversationSelectionContext.Provider value={enrichedValue}>
      {children}
      {morph.morphLayer}
    </ConversationSelectionContext.Provider>
  )
}

/** @deprecated Use ConversationSelectionProvider with `vertical` prop. */
export function ConversationSelectionProviderWithMorph({
  children,
  vertical,
}: {
  children: ReactNode
  vertical: string
}) {
  const selection = useConversationSelectionState()

  return (
    <ConversationSelectionProvider value={selection} vertical={vertical}>
      {children}
    </ConversationSelectionProvider>
  )
}
