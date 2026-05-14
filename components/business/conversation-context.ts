"use client"

import { useCallback, useMemo, useState } from "react"

export interface ConversationContextItem {
  id: string
  type: string
  title?: string
  description?: string
  reviewerName?: string
  source?: string
  fallbackLabel?: string
}

interface PostLikeConversationSource {
  id: string
  type: string
  title?: string
  description?: string
  reviewerName?: string
  source?: string
}

const fallbackConversationLabels: Record<string, string> = {
  video: "Video",
  "video-vertical": "Video",
  product: "Produto",
  news: "Noticia",
  review: "Review",
  social: "Post",
  service: "Servico",
  course: "Curso",
  property: "Imovel",
  professional: "Profissional",
  content: "Conteudo",
}

export function normalizeConversationChipText(value?: string) {
  return value?.replace(/\s+/g, " ").trim() || ""
}

function compactConversationLabel(value?: string) {
  const normalizedValue = normalizeConversationChipText(value)
  if (!normalizedValue) return ""

  const firstSentence = normalizedValue.split(/[.!?]/)[0]?.trim() || normalizedValue
  return firstSentence.split(/\s[-|:]\s/)[0]?.trim() || firstSentence
}

export function getConversationChipLabel(item: ConversationContextItem) {
  const titleLabel = compactConversationLabel(item.title)
  const descriptionLabel = compactConversationLabel(item.description)
  const reviewerLabel = item.reviewerName
    ? compactConversationLabel(`Review ${item.reviewerName}`)
    : ""
  const sourceLabel = compactConversationLabel(item.source)
  const fallbackLabel = item.fallbackLabel || fallbackConversationLabels[item.type] || fallbackConversationLabels.content

  if (item.type === "review") {
    return reviewerLabel || titleLabel || descriptionLabel || fallbackLabel
  }

  if (item.type === "news") {
    return titleLabel || descriptionLabel || sourceLabel || fallbackLabel
  }

  return titleLabel || descriptionLabel || fallbackLabel
}

export function createConversationContextItemFromPost(
  post: PostLikeConversationSource
): ConversationContextItem {
  return {
    id: post.id,
    type: post.type,
    title: post.title,
    description: post.description,
    reviewerName: post.reviewerName,
    source: post.source,
    fallbackLabel: fallbackConversationLabels[post.type] || fallbackConversationLabels.content,
  }
}

export function useConversationContextSelectionState(initialItems: ConversationContextItem[] = []) {
  const [contextItems, setContextItems] = useState<ConversationContextItem[]>(initialItems)

  const selectedContextIds = useMemo(
    () => new Set(contextItems.map((item) => item.id)),
    [contextItems]
  )

  const toggleContextItem = useCallback((item: ConversationContextItem) => {
    setContextItems((currentItems) => {
      const isAlreadySelected = currentItems.some((currentItem) => currentItem.id === item.id)

      if (isAlreadySelected) {
        return currentItems.filter((currentItem) => currentItem.id !== item.id)
      }

      return [...currentItems, item]
    })
  }, [])

  const removeContextItem = useCallback((itemId: string) => {
    setContextItems((currentItems) => currentItems.filter((item) => item.id !== itemId))
  }, [])

  return {
    contextItems,
    selectedContextIds,
    toggleContextItem,
    removeContextItem,
  }
}
