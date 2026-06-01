import type { RuntimeDayAvailability } from "./types"

const SEED_AVAILABILITY_ANCHOR = "2026-06-01T12:00:00.000Z"

function formatAvailabilityDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

/** Fixed availability for runtime seed — no Math.random(), stable across regenerations. */
export function buildDeterministicSeedAvailability(barberId: string): RuntimeDayAvailability[] {
  const availability: RuntimeDayAvailability[] = []
  const anchor = new Date(SEED_AVAILABILITY_ANCHOR)

  for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
    const date = new Date(anchor)
    date.setDate(anchor.getDate() + dayOffset)

    if (date.getDay() === 0) {
      continue
    }

    const slots: RuntimeDayAvailability["slots"] = []
    const endHour = date.getDay() === 6 ? 18 : 20

    for (let hour = 9; hour < endHour; hour += 1) {
      const seedBase = barberId.charCodeAt(barberId.length - 1) + hour + dayOffset

      slots.push({
        time: `${hour.toString().padStart(2, "0")}:00`,
        available: seedBase % 3 !== 0,
      })
      slots.push({
        time: `${hour.toString().padStart(2, "0")}:30`,
        available: (seedBase + 1) % 4 !== 0,
      })
    }

    availability.push({
      date: formatAvailabilityDate(date),
      slots,
    })
  }

  return availability
}
