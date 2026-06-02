import { existsSync, readFileSync } from "node:fs"

import type { AppointmentRuntimeBundle } from "../types"

export function appointmentRuntimeDocumentExists(path: string): boolean {
  return existsSync(path)
}

export function readAppointmentRuntimeDocument(path: string): AppointmentRuntimeBundle {
  const raw = readFileSync(path, "utf8")
  return JSON.parse(raw) as AppointmentRuntimeBundle
}
