import { buildRuntimeDraftKey, buildRuntimeLiveKey } from "../../storage/keys"
import { getFilesystemStorage } from "../../storage/resolve-storage.server"
import { buildAppointmentRuntimeSeedBundle } from "../mock-adapter"
import type { AppointmentRuntimeBundle } from "../types"
import {
  readAppointmentRuntimeDocumentByKey,
  writeAppointmentRuntimeDocumentByKey,
} from "./load-document"
import { resolveAppointmentDraftDocumentPath } from "./paths"
import type { AppointmentPublicationDerivedFrom } from "./types"
import { assertAppointmentDraftBundle } from "./validate-draft"

export interface InitAppointmentDraftOptions {
  slug: string
  rootDir?: string
  fromMock?: boolean
  force?: boolean
}

export interface InitAppointmentDraftResult {
  draftPath: string
  slug: string
  derivedFrom: AppointmentPublicationDerivedFrom
}

export function createDraftBundleFromLive(live: AppointmentRuntimeBundle): AppointmentRuntimeBundle {
  const draft = structuredClone(live)

  draft.meta = {
    ...draft.meta,
    source: "runtime",
    publication: {
      publicationState: "draft",
      derivedFrom: "live",
      draftUpdatedAt: new Date().toISOString(),
    },
  }

  return draft
}

export function createDraftBundleFromMock(slug: string): AppointmentRuntimeBundle {
  const bundle = buildAppointmentRuntimeSeedBundle({ slug })

  return {
    ...bundle,
    meta: {
      ...bundle.meta,
      publication: {
        publicationState: "draft",
        derivedFrom: "mock-adapter",
        draftUpdatedAt: new Date().toISOString(),
      },
    },
  }
}

export function initAppointmentDraft(options: InitAppointmentDraftOptions): InitAppointmentDraftResult {
  const rootDir = options.rootDir ?? process.cwd()
  const storage = getFilesystemStorage(rootDir)
  const draftKey = buildRuntimeDraftKey(options.slug)
  const draftPath = resolveAppointmentDraftDocumentPath(options.slug, rootDir)

  if (storage.exists(draftKey) && !options.force) {
    throw new Error(`Draft already exists: ${draftPath} (use --force to overwrite)`)
  }

  let draft: AppointmentRuntimeBundle
  let derivedFrom: AppointmentPublicationDerivedFrom

  if (options.fromMock) {
    draft = createDraftBundleFromMock(options.slug)
    derivedFrom = "mock-adapter"
  } else {
    const live = readAppointmentRuntimeDocumentByKey(buildRuntimeLiveKey(options.slug), rootDir)

    if (!live) {
      throw new Error(`Live document not found for slug: ${options.slug}`)
    }

    draft = createDraftBundleFromLive(live)
    derivedFrom = "live"
  }

  assertAppointmentDraftBundle(draft, options.slug)

  const writeResult = writeAppointmentRuntimeDocumentByKey(draftKey, draft, rootDir)

  if (!writeResult.ok) {
    throw new Error(`Failed to write draft document: ${draftPath}`)
  }

  return {
    draftPath,
    slug: options.slug,
    derivedFrom,
  }
}
