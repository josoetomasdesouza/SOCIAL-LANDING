"use client"

import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from "react"
import { getRememberedMorphSourceElement } from "./context-selectable"
import type { ConversationContextItem } from "./conversational-ai"
import {
  PostToChatMorphLayer,
  type PostToChatMorphPreview,
  type PostToChatMorphRect,
} from "./post-to-chat-morph-layer"
import { observeMorphCompleted, observeMorphStarted } from "@/lib/events/instrumentation"

const MORPH_DURATION_MS = 480
const MORPH_TARGET_MIN_SIZE = 44
const MORPH_TARGET_HEIGHT = 44
const MORPH_TARGET_WIDTH = 188

interface ActivePostMorph {
  key: number
  contextId: string
  preview: PostToChatMorphPreview
  fromRect: PostToChatMorphRect
  toRect: PostToChatMorphRect
}

interface QueuedPostMorph {
  key: number
  contextId: string
  preview: PostToChatMorphPreview
  sourceRect: PostToChatMorphRect
}

function isVisibleRect(rect: DOMRect) {
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0
}

function getEscapedSelectorValue(value: string) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value)
  }

  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function getComposerMaxWidth(viewportWidth: number) {
  if (viewportWidth >= 1024) return 600
  if (viewportWidth >= 768) return 672
  if (viewportWidth >= 640) return 576
  return 512
}

function getComposerFallbackRect(): PostToChatMorphRect {
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

function getComposerChipRect(contextId: string): PostToChatMorphRect | null {
  const escapedContextId = getEscapedSelectorValue(contextId)
  const chipElements = Array.from(
    document.querySelectorAll<HTMLElement>(`[data-conversation-context-chip="${escapedContextId}"]`)
  )
  const chipElement = chipElements
    .map((element) => ({ element, rect: element.getBoundingClientRect() }))
    .filter(({ rect }) => isVisibleRect(rect))
    .at(-1)

  if (!chipElement) {
    const measurementTargetElement = document.querySelector<HTMLElement>(
      `[data-conversation-context-chip-target="${escapedContextId}"]`
    )

    if (!measurementTargetElement) {
      return null
    }

    const measurementRect = measurementTargetElement.getBoundingClientRect()

    if (!isVisibleRect(measurementRect)) {
      return null
    }

    return {
      left: measurementRect.left,
      top: measurementRect.top,
      width: measurementRect.width,
      height: measurementRect.height,
      borderRadius: 999,
    }
  }

  return {
    left: chipElement.rect.left,
    top: chipElement.rect.top,
    width: chipElement.rect.width,
    height: chipElement.rect.height,
    borderRadius: 999,
  }
}

function createMorphSpawnRect(sourceRect: PostToChatMorphRect, targetRect: PostToChatMorphRect): PostToChatMorphRect {
  const sourceCenterX = sourceRect.left + sourceRect.width / 2
  const sourceCenterY = sourceRect.top + sourceRect.height / 2

  return {
    left: sourceCenterX - targetRect.width / 2,
    top: sourceCenterY - targetRect.height / 2,
    width: targetRect.width,
    height: targetRect.height,
    borderRadius: targetRect.borderRadius,
  }
}

function getMorphSourceRect(sourceId: string): PostToChatMorphRect | null {
  const rememberedSourceElement = getRememberedMorphSourceElement(sourceId)

  if (rememberedSourceElement) {
    const rememberedSourceRect = rememberedSourceElement.getBoundingClientRect()

    if (isVisibleRect(rememberedSourceRect)) {
      return {
        left: rememberedSourceRect.left,
        top: rememberedSourceRect.top,
        width: rememberedSourceRect.width,
        height: rememberedSourceRect.height,
        borderRadius: 999,
      }
    }
  }

  const escapedSourceId = getEscapedSelectorValue(sourceId)
  const sourceElements = Array.from(
    document.querySelectorAll<HTMLElement>(`[data-post-context-source="${escapedSourceId}"]`)
  )
  const sourceElement = sourceElements
    .map((element) => ({ element, rect: element.getBoundingClientRect() }))
    .filter(({ rect }) => isVisibleRect(rect))
    .at(-1)

  if (!sourceElement) {
    return null
  }

  return {
    left: sourceElement.rect.left,
    top: sourceElement.rect.top,
    width: sourceElement.rect.width,
    height: sourceElement.rect.height,
    borderRadius: 999,
  }
}

type MorphSelectionDeps = {
  selectedContextIds: Set<string>
  toggleConversationContextItem: (item: ConversationContextItem) => void
  removeConversationContext: (contextId: string) => void
}

export function useConversationContextMorph(deps: MorphSelectionDeps, vertical: string) {
  const { selectedContextIds, toggleConversationContextItem, removeConversationContext } = deps
  const [activeMorph, setActiveMorph] = useState<ActivePostMorph | null>(null)
  const [hiddenContextIds, setHiddenContextIds] = useState<string[]>([])
  const [queuedMorph, setQueuedMorph] = useState<QueuedPostMorph | null>(null)

  const resolveMorphTargetRect = useCallback((contextId: string) => {
    return getComposerChipRect(contextId) ?? getComposerFallbackRect()
  }, [])

  useLayoutEffect(() => {
    if (!queuedMorph) {
      return
    }

    const targetRect = resolveMorphTargetRect(queuedMorph.contextId)

    observeMorphStarted({ itemId: queuedMorph.contextId, source: "long-press", vertical })
    setActiveMorph({
      key: queuedMorph.key,
      contextId: queuedMorph.contextId,
      preview: queuedMorph.preview,
      fromRect: createMorphSpawnRect(queuedMorph.sourceRect, targetRect),
      toRect: targetRect,
    })
    setQueuedMorph(null)
  }, [queuedMorph, resolveMorphTargetRect, vertical])

  const queueConversationContextMorph = useCallback((contextItem: ConversationContextItem) => {
    if (typeof window === "undefined") {
      return
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    const sourceRect = getMorphSourceRect(contextItem.id)

    if (!sourceRect) {
      return
    }

    const morphKey = Date.now()

    setHiddenContextIds((currentIds) =>
      currentIds.includes(contextItem.id) ? currentIds : [...currentIds, contextItem.id]
    )
    setQueuedMorph({
      key: morphKey,
      contextId: contextItem.id,
      preview: {
        id: contextItem.id,
        title: contextItem.title,
        subtitle: contextItem.subtitle,
        image: contextItem.image,
        showDismiss: true,
      },
      sourceRect,
    })
  }, [])

  const toggleConversationContextItemWithMorph = useCallback(
    (contextItem: ConversationContextItem) => {
      if (selectedContextIds.has(contextItem.id)) {
        removeConversationContext(contextItem.id)
        return
      }

      queueConversationContextMorph(contextItem)
      toggleConversationContextItem(contextItem)
    },
    [
      queueConversationContextMorph,
      removeConversationContext,
      selectedContextIds,
      toggleConversationContextItem,
    ]
  )

  const morphLayer = useMemo(() => {
    if (!activeMorph) {
      return null
    }

    return (
      <PostToChatMorphLayer
        key={activeMorph.key}
        animationKey={activeMorph.key}
        preview={activeMorph.preview}
        fromRect={activeMorph.fromRect}
        toRect={activeMorph.toRect}
        resolveToRect={() => resolveMorphTargetRect(activeMorph.contextId)}
        durationMs={MORPH_DURATION_MS}
        onComplete={() => {
          observeMorphCompleted({ itemId: activeMorph.contextId, vertical })
          setHiddenContextIds((currentIds) =>
            currentIds.filter((contextId) => contextId !== activeMorph.contextId)
          )
          setActiveMorph((currentMorph) => (currentMorph?.key === activeMorph.key ? null : currentMorph))
        }}
      />
    )
  }, [activeMorph, resolveMorphTargetRect, vertical])

  return {
    hiddenContextIds,
    toggleConversationContextItemWithMorph,
    morphLayer,
  }
}

export function ConversationContextMorphLayer({ layer }: { layer: ReactNode }) {
  return layer
}
