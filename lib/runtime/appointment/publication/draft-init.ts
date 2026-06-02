import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

import { buildAppointmentRuntimeSeedBundle } from "../mock-adapter"
import type { AppointmentRuntimeBundle } from "../types"
import { readAppointmentRuntimeDocument } from "./load-document"
import { resolveAppointmentDraftDocumentPath, resolveAppointmentLiveDocumentPath } from "./paths"
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
  const draftPath = resolveAppointmentDraftDocumentPath(options.slug, rootDir)

  if (existsSync(draftPath) && !options.force) {
    throw new Error(`Draft already exists: ${draftPath} (use --force to overwrite)`)
  }

  let draft: AppointmentRuntimeBundle
  let derivedFrom: AppointmentPublicationDerivedFrom

  if (options.fromMock) {
    draft = createDraftBundleFromMock(options.slug)
    derivedFrom = "mock-adapter"
  } else {
    const livePath = resolveAppointmentLiveDocumentPath(options.slug, rootDir)

    if (!existsSync(livePath)) {
      throw new Error(`Live document not found: ${livePath}`)
    }

    draft = createDraftBundleFromLive(readAppointmentRuntimeDocument(livePath))
    derivedFrom = "live"
  }

  assertAppointmentDraftBundle(draft, options.slug)

  mkdirSync(dirname(draftPath), { recursive: true })
  writeFileSync(draftPath, `${JSON.stringify(draft, null, 2)}\n`, "utf8")

  return {
    draftPath,
    slug: options.slug,
    derivedFrom,
  }
}
