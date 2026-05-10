import type { ReactNode } from "react"
import type { UniversalPostType } from "@/lib/core"
import type { BusinessPost, BusinessSection } from "./business-social-landing"

type ContentSectionKey = "video" | "review" | "news" | "social"

type ContentSectionsContent = {
  videos?: BusinessPost[]
  reviews?: BusinessPost[]
  news?: BusinessPost[]
  social?: BusinessPost[]
}

type ContentSectionDefinition = {
  id?: string
  title?: string
  icon?: ReactNode
}

const contentSectionOrder: ContentSectionKey[] = ["video", "review", "news", "social"]

const contentPostKeyBySection = {
  video: "videos",
  review: "reviews",
  news: "news",
  social: "social",
} satisfies Record<ContentSectionKey, keyof ContentSectionsContent>

const defaultDefinitions = {
  video: { id: "videos", title: "Videos" },
  review: { id: "reviews", title: "Avaliacoes" },
  news: { id: "news", title: "Na Midia" },
  social: { id: "social", title: "Bastidores" },
} satisfies Record<ContentSectionKey, Required<Pick<ContentSectionDefinition, "id" | "title">>>

export function buildContentSections({
  content,
  contentPriorities,
  definitions = {},
}: {
  content: ContentSectionsContent
  contentPriorities: Array<UniversalPostType | string>
  definitions?: Partial<Record<ContentSectionKey, ContentSectionDefinition>>
}): BusinessSection[] {
  const priorities = new Set(contentPriorities)

  return contentSectionOrder.flatMap((sectionKey) => {
    if (!priorities.has(sectionKey)) {
      return []
    }

    const definition = {
      ...defaultDefinitions[sectionKey],
      ...definitions[sectionKey],
    }
    const posts = content[contentPostKeyBySection[sectionKey]]

    return [{
      id: definition.id,
      title: definition.title,
      icon: definition.icon,
      type: "content" as const,
      posts,
    }]
  })
}
