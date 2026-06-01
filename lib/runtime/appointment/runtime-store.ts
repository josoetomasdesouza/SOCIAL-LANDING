import barbaNegraV1 from "@/data/runtime/appointment/barba-negra.v1.json"
import type { AppointmentRuntimeBundle } from "./types"
import { APPOINTMENT_PILOT_SLUG } from "./types"

const RUNTIME_SEEDS: Record<string, AppointmentRuntimeBundle> = {
  [APPOINTMENT_PILOT_SLUG]: barbaNegraV1 as AppointmentRuntimeBundle,
}

export function getAppointmentRuntimeSeedSlugs() {
  return Object.keys(RUNTIME_SEEDS)
}

export function getAppointmentRuntimeSeedDocument(slug: string) {
  return RUNTIME_SEEDS[slug] ?? null
}

export function hasAppointmentRuntimeSeed(slug: string) {
  return slug in RUNTIME_SEEDS
}
