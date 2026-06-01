import type { ExternalHoursData, ExternalRealitySnapshot } from "./types"

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

export function deriveLiveStateFromHours(hours: ExternalHoursData): string | undefined {
  if (hours.openNow === true) {
    return "Aberto agora"
  }

  if (hours.openNow === false) {
    return "Fechado agora"
  }

  return undefined
}

export function deriveHoursHintFromWeekdayDescriptions(
  weekdayDescriptions?: string[]
): string | undefined {
  if (!weekdayDescriptions?.length) {
    return undefined
  }

  const todayName = WEEKDAY_NAMES[new Date().getDay()]
  const line =
    weekdayDescriptions.find((entry) => entry.startsWith(`${todayName}:`)) ??
    weekdayDescriptions[0]

  const match = line.match(/[–—-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i)

  if (!match) {
    return undefined
  }

  let hour = Number.parseInt(match[1], 10)
  const ampm = match[3]?.toUpperCase()

  if (ampm === "PM" && hour < 12) {
    hour += 12
  }

  if (ampm === "AM" && hour === 12) {
    hour = 0
  }

  return `até ${hour}h`
}

export function deriveMapsQueryFromSnapshot(snapshot: ExternalRealitySnapshot): string {
  const mapsUri = snapshot.place.mapsUri?.trim()

  if (mapsUri) {
    return mapsUri
  }

  return [snapshot.place.displayName, snapshot.place.formattedAddress]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ")
}
