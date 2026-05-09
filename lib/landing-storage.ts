export interface StoredLandingBlock {
  id: string
  type: string
  visible: boolean
  content: Record<string, string | string[]>
}

export interface StoredLanding {
  slug: string
  name: string
  category: string
  businessModel?: string
  description: string
  whatsapp?: string
  instagram?: string
  email?: string
  website?: string
  logo?: string
  cover?: string
  color?: string
  primaryColor?: string
  sourceUrl?: string
  status?: "draft" | "published"
  blocks?: StoredLandingBlock[]
  publishedAt?: string
  updatedAt: string
}

export type LandingDraft = StoredLanding

const STORAGE_KEY = "social-landing:landings"

export const CATEGORY_ALIASES: Record<string, string> = {
  appointment: "salon",
  courses: "education",
  professionals: "professional",
}

export function normalizeCategory(category?: string | null) {
  if (!category) return "institutional"
  return CATEGORY_ALIASES[category] || category
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "minha-marca"
}

export const slugifyLandingName = slugify

function readAll(): Record<string, StoredLanding> {
  if (typeof window === "undefined") return {}

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAll(landings: Record<string, StoredLanding>) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(landings))
}

export function saveLanding(landing: StoredLanding) {
  const landings = readAll()
  const category = normalizeCategory(landing.category || landing.businessModel)
  landings[landing.slug] = {
    ...landing,
    category,
    businessModel: category,
    updatedAt: new Date().toISOString(),
  }
  writeAll(landings)
  return landings[landing.slug]
}

export const saveLandingDraft = saveLanding

export function getLanding(slug: string) {
  return readAll()[slug] || null
}

export const getLandingDraft = getLanding

export function getLandingUrl(slug: string) {
  return `/${slug}`
}

export function createLandingDraft(input: {
  slug?: string
  name: string
  businessModel: string
  description?: string
  whatsapp?: string
  instagram?: string
  email?: string
  website?: string
  logo?: string
  cover?: string
  primaryColor?: string
  sourceUrl?: string
  status?: "draft" | "published"
}): LandingDraft {
  const slug = input.slug || slugify(input.name)
  const category = normalizeCategory(input.businessModel)

  return {
    slug,
    name: input.name,
    category,
    businessModel: category,
    description: input.description || "",
    whatsapp: input.whatsapp,
    instagram: input.instagram,
    email: input.email,
    website: input.website,
    logo: input.logo,
    cover: input.cover,
    color: input.primaryColor,
    primaryColor: input.primaryColor,
    sourceUrl: input.sourceUrl,
    status: input.status || "draft",
    publishedAt: input.status === "published" ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  }
}

export function buildEditorUrl(landing: Pick<StoredLanding, "slug" | "category" | "name" | "description"> & Partial<StoredLanding>, focus?: string) {
  const params = new URLSearchParams({
    slug: landing.slug,
    category: normalizeCategory(landing.category),
    name: landing.name,
    description: landing.description || "",
  })

  if (landing.whatsapp) params.set("whatsapp", landing.whatsapp)
  if (landing.instagram) params.set("instagram", landing.instagram)
  if (landing.email) params.set("email", landing.email)
  if (landing.website) params.set("website", landing.website)
  if (focus) params.set("focus", focus)

  return `/criar/editor?${params.toString()}`
}

export function buildLandingEditorUrl(input: {
  slug: string
  businessModel?: string
  category?: string
  name: string
  description?: string
  whatsapp?: string
  instagram?: string
  email?: string
  website?: string
  focus?: string
  generateAI?: boolean
}) {
  const params = new URLSearchParams({
    slug: input.slug,
    category: normalizeCategory(input.businessModel || input.category),
    name: input.name,
    description: input.description || "",
  })

  if (input.whatsapp) params.set("whatsapp", input.whatsapp)
  if (input.instagram) params.set("instagram", input.instagram)
  if (input.email) params.set("email", input.email)
  if (input.website) params.set("website", input.website)
  if (input.focus) params.set("focus", input.focus)
  if (input.generateAI) params.set("generateAI", "true")

  return `/criar/editor?${params.toString()}`
}
