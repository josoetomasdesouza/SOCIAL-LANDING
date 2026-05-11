"use client"

export const socialPatternClasses = {
  sectionSpacing: "mb-8",
  compactSurface: "rounded-[22px] border border-border/50 bg-secondary/25 p-4",
  editorialContext: "text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground",
  editorialHeadline: "text-[15px] leading-6 text-foreground text-pretty",
  editorialSubheadline: "text-sm leading-5 text-muted-foreground text-pretty",
  itemSurface: "rounded-xl bg-background/70 px-3 py-2.5",
  primaryAction: "h-11 rounded-2xl px-5",
} as const

export interface SocialEditorialContent {
  contextLabel?: string
  headline: string
  subheadline?: string
}
