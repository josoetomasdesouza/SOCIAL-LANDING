export const OPERATIONAL_AI_PROHIBITED_PHRASES = [
  "melhor barbearia",
  "melhor de sao paulo",
  "melhor de são paulo",
  "nao perca",
  "não perca",
  "clique aqui",
  "promocao imperdivel",
  "promoção imperdível",
  "compre agora",
  "chatgpt",
  "gerado por ia",
  "gerado por inteligencia artificial",
] as const

export const OPERATIONAL_AI_FIELD_MAX_LENGTH: Record<string, number> = {
  "operational.liveState": 48,
  "operational.placeHint": 32,
  "operational.momentHint": 48,
  "operational.hoursHint": 32,
  "arrival.addressLine": 120,
  "arrival.referenceHint": 180,
  "arrival.routeHint": 180,
  "arrival.parkingHint": 120,
  "arrival.arrivalMood": 120,
  "establishment.brand.description": 220,
  "services[].description": 180,
  "feed.stories[].label": 48,
  "feed.sections[reviews].items[].title": 240,
}

const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}]/u

export function containsProhibitedPhrase(text: string): string | null {
  const normalized = text.trim().toLowerCase()

  for (const phrase of OPERATIONAL_AI_PROHIBITED_PHRASES) {
    if (normalized.includes(phrase)) {
      return phrase
    }
  }

  return null
}

export function containsEmojiSpam(text: string): boolean {
  const matches = text.match(new RegExp(EMOJI_PATTERN, "gu"))
  return (matches?.length ?? 0) > 1
}

export function validateOperationalGrammarField(path: string, value: string): string[] {
  const errors: string[] = []
  const trimmed = value.trim()

  if (!trimmed) {
    errors.push(`grammar: ${path} must not be empty`)
    return errors
  }

  const prohibited = containsProhibitedPhrase(trimmed)

  if (prohibited) {
    errors.push(`grammar: ${path} contains prohibited phrase "${prohibited}"`)
  }

  if (containsEmojiSpam(trimmed)) {
    errors.push(`grammar: ${path} contains emoji spam`)
  }

  const maxLength = resolveMaxLength(path)

  if (maxLength && trimmed.length > maxLength) {
    errors.push(`grammar: ${path} exceeds max length ${maxLength}`)
  }

  if (path.startsWith("operational.") && /[!?]{2,}/.test(trimmed)) {
    errors.push(`grammar: ${path} must avoid shouty punctuation`)
  }

  return errors
}

function resolveMaxLength(path: string): number | undefined {
  if (OPERATIONAL_AI_FIELD_MAX_LENGTH[path]) {
    return OPERATIONAL_AI_FIELD_MAX_LENGTH[path]
  }

  if (path.includes("services[") && path.endsWith(".description")) {
    return OPERATIONAL_AI_FIELD_MAX_LENGTH["services[].description"]
  }

  if (path.includes("feed.stories[") && path.endsWith(".label")) {
    return OPERATIONAL_AI_FIELD_MAX_LENGTH["feed.stories[].label"]
  }

  if (path.includes("feed.sections[reviews].items[") && path.endsWith(".title")) {
    return OPERATIONAL_AI_FIELD_MAX_LENGTH["feed.sections[reviews].items[].title"]
  }

  return undefined
}

export function collectGrammarPaths(bundle: {
  operational: { liveState: string; placeHint: string; momentHint?: string; hoursHint?: string }
  arrival: {
    addressLine: string
    referenceHint: string
    routeHint?: string
    parkingHint?: string
    arrivalMood?: string
  }
  establishment: { brand: { description: string } }
  services: Array<{ id: string; description: string }>
  feed: {
    stories: Array<{ id: string; label: string }>
    sections: Array<{ id: string; items: Array<{ id: string; title: string }> }>
  }
}): Array<{ path: string; value: string }> {
  const entries: Array<{ path: string; value: string }> = [
    { path: "operational.liveState", value: bundle.operational.liveState },
    { path: "operational.placeHint", value: bundle.operational.placeHint },
  ]

  if (bundle.operational.momentHint) {
    entries.push({ path: "operational.momentHint", value: bundle.operational.momentHint })
  }

  if (bundle.operational.hoursHint) {
    entries.push({ path: "operational.hoursHint", value: bundle.operational.hoursHint })
  }

  entries.push(
    { path: "arrival.addressLine", value: bundle.arrival.addressLine },
    { path: "arrival.referenceHint", value: bundle.arrival.referenceHint },
    { path: "establishment.brand.description", value: bundle.establishment.brand.description }
  )

  if (bundle.arrival.routeHint) {
    entries.push({ path: "arrival.routeHint", value: bundle.arrival.routeHint })
  }

  if (bundle.arrival.parkingHint) {
    entries.push({ path: "arrival.parkingHint", value: bundle.arrival.parkingHint })
  }

  if (bundle.arrival.arrivalMood) {
    entries.push({ path: "arrival.arrivalMood", value: bundle.arrival.arrivalMood })
  }

  for (const service of bundle.services) {
    entries.push({
      path: `services[${service.id}].description`,
      value: service.description,
    })
  }

  for (const story of bundle.feed.stories) {
    entries.push({
      path: `feed.stories[${story.id}].label`,
      value: story.label,
    })
  }

  const reviewsSection = bundle.feed.sections.find((section) => section.id === "reviews")

  if (reviewsSection) {
    for (const item of reviewsSection.items) {
      entries.push({
        path: `feed.sections[reviews].items[${item.id}].title`,
        value: item.title,
      })
    }
  }

  return entries
}
