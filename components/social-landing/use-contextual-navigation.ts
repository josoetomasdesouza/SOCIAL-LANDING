"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface ContextualReferenceItem {
  id: string
  title: string
  eyebrow: string
  image?: string
  description?: string
}

export function useContextualNavigation<T extends HTMLElement>() {
  const contentRegistryRef = useRef(new Map<string, T>())
  const clearHighlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const highlightStartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [highlightedContentId, setHighlightedContentId] = useState<string | null>(null)

  const registerContentNode = useCallback(
    (contentId: string) => (node: T | null) => {
      if (node) {
        contentRegistryRef.current.set(contentId, node)
        return
      }

      contentRegistryRef.current.delete(contentId)
    },
    []
  )

  const navigateToContent = useCallback((contentId: string) => {
    const targetNode = contentRegistryRef.current.get(contentId)

    if (!targetNode) {
      return false
    }

    if (highlightStartTimeoutRef.current) {
      clearTimeout(highlightStartTimeoutRef.current)
    }

    if (clearHighlightTimeoutRef.current) {
      clearTimeout(clearHighlightTimeoutRef.current)
    }

    setHighlightedContentId(null)

    targetNode.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    })

    targetNode.focus({ preventScroll: true })

    highlightStartTimeoutRef.current = setTimeout(() => {
      setHighlightedContentId(contentId)
    }, 180)

    clearHighlightTimeoutRef.current = setTimeout(() => {
      setHighlightedContentId((currentId) => (currentId === contentId ? null : currentId))
    }, 2600)

    return true
  }, [])

  useEffect(() => {
    return () => {
      if (highlightStartTimeoutRef.current) {
        clearTimeout(highlightStartTimeoutRef.current)
      }

      if (clearHighlightTimeoutRef.current) {
        clearTimeout(clearHighlightTimeoutRef.current)
      }
    }
  }, [])

  return {
    highlightedContentId,
    navigateToContent,
    registerContentNode,
  }
}

export function getContextualSpotlightClasses(isHighlighted: boolean) {
  return cn(
    "scroll-mt-24 rounded-[28px] outline-none transition-[transform,box-shadow,background-color,ring-color] duration-500 ease-out",
    isHighlighted &&
      "bg-accent/5 ring-1 ring-accent/35 scale-[1.01] shadow-lg shadow-accent/20"
  )
}
