import type { AppointmentRuntimeBundle } from "../types"
import { buildRuntimeDraftKey } from "../../storage/keys"
import { getFilesystemStorage } from "../../storage/resolve-storage.server"
import { readAppointmentRuntimeDocumentByKey } from "./load-document"
import { validateAppointmentDraftBundle } from "./validate-draft"

export function loadAppointmentRuntimeDraftFromDisk(
  slug: string,
  rootDir: string = process.cwd()
): AppointmentRuntimeBundle | null {
  const storage = getFilesystemStorage(rootDir)
  const draftKey = buildRuntimeDraftKey(slug)

  if (!storage.exists(draftKey)) {
    return null
  }

  const draft = readAppointmentRuntimeDocumentByKey(draftKey, rootDir)

  if (!draft) {
    return null
  }

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
