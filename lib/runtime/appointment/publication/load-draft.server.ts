import { existsSync } from "node:fs"

import type { AppointmentRuntimeBundle } from "../types"
import { readAppointmentRuntimeDocument } from "./load-document"
import { resolveAppointmentDraftDocumentPath } from "./paths"
import { validateAppointmentDraftBundle } from "./validate-draft"

export function loadAppointmentRuntimeDraftFromDisk(
  slug: string,
  rootDir: string = process.cwd()
): AppointmentRuntimeBundle | null {
  const draftPath = resolveAppointmentDraftDocumentPath(slug, rootDir)

  if (!existsSync(draftPath)) {
    return null
  }

  const draft = readAppointmentRuntimeDocument(draftPath)
  const validation = validateAppointmentDraftBundle(draft, slug)

  if (!validation.ok) {
    return null
  }

  return {
    ...structuredClone(draft),
    meta: {
      source: "runtime",
      slug: draft.meta.slug,
      updatedAt: draft.meta.updatedAt,
      ...(draft.meta.external ? { external: draft.meta.external } : {}),
    },
  }
}
