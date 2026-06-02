import { buildRuntimeDraftKey, buildRuntimeLiveKey } from "../../storage/keys"
import { getFilesystemStorage } from "../../storage/resolve-storage.server"
import {
  readAppointmentRuntimeDocumentByKey,
  writeAppointmentRuntimeDocumentByKey,
} from "../publication/load-document"
import { resolveAppointmentDraftDocumentPath } from "../publication/paths"
import { validateAppointmentDraftBundle } from "../publication/validate-draft"
import type { AppointmentRuntimeBundle } from "../types"
import { generateOperationalAiFixture } from "./fixture-generator"
import type {
  OperationalAdaptationKind,
  OperationalAiInput,
  OperationalAiOutputEnvelope,
} from "./types"

export interface WriteOperationalAiDraftOptions {
  slug: string
  adaptationKind: OperationalAdaptationKind
  rootDir?: string
  dryRun?: boolean
  force?: boolean
  operatorBrief?: string
  externalSnapshot?: OperationalAiInput["externalSnapshot"]
  baseBundle?: AppointmentRuntimeBundle
}

export interface WriteOperationalAiDraftResult {
  ok: boolean
  dryRun: boolean
  slug: string
  adaptationKind: OperationalAdaptationKind
  draftKey: string
  draftPath: string
  primitiveId: string
  derivedFrom: "ai"
  validationErrors: string[]
  roundTripOk: boolean
  envelope: OperationalAiOutputEnvelope | null
}

function resolveBaseBundle(
  slug: string,
  rootDir: string,
  baseBundle?: AppointmentRuntimeBundle
): AppointmentRuntimeBundle {
  if (baseBundle) {
    return structuredClone(baseBundle)
  }

  const live = readAppointmentRuntimeDocumentByKey(buildRuntimeLiveKey(slug), rootDir)

  if (!live) {
    throw new Error(`Live document not found for slug: ${slug}`)
  }

  return live
}

function assertDraftOnlyKey(draftKey: string, slug: string) {
  const liveKey = buildRuntimeLiveKey(slug)

  if (draftKey === liveKey) {
    throw new Error("Operational AI draft write must never target live storage keys")
  }

  if (!draftKey.endsWith("/draft") || !draftKey.startsWith("runtime/")) {
    throw new Error(`Operational AI draft write must target runtime/{slug}/draft, received: ${draftKey}`)
  }
}

export function writeOperationalAiDraft(
  options: WriteOperationalAiDraftOptions
): WriteOperationalAiDraftResult {
  const rootDir = options.rootDir ?? process.cwd()
  const dryRun = options.dryRun ?? true
  const storage = getFilesystemStorage(rootDir)
  const draftKey = buildRuntimeDraftKey(options.slug)
  const draftPath = resolveAppointmentDraftDocumentPath(options.slug, rootDir)
  const validationErrors: string[] = []

  assertDraftOnlyKey(draftKey, options.slug)

  if (storage.exists(draftKey) && !options.force && !dryRun) {
    throw new Error(`Draft already exists: ${draftPath} (use --force to overwrite)`)
  }

  const baseBundle = resolveBaseBundle(options.slug, rootDir, options.baseBundle)
  const envelope = generateOperationalAiFixture({
    slug: options.slug,
    baseBundle,
    adaptationKind: options.adaptationKind,
    operatorBrief: options.operatorBrief,
    externalSnapshot: options.externalSnapshot,
  })

  if (!envelope.validation.ok) {
    return {
      ok: false,
      dryRun,
      slug: options.slug,
      adaptationKind: options.adaptationKind,
      draftKey,
      draftPath,
      primitiveId: envelope.primitiveId,
      derivedFrom: "ai",
      validationErrors: envelope.validation.errors,
      roundTripOk: false,
      envelope,
    }
  }

  const draftValidation = validateAppointmentDraftBundle(envelope.draftBundle, options.slug)

  if (!draftValidation.ok) {
    return {
      ok: false,
      dryRun,
      slug: options.slug,
      adaptationKind: options.adaptationKind,
      draftKey,
      draftPath,
      primitiveId: envelope.primitiveId,
      derivedFrom: "ai",
      validationErrors: draftValidation.errors,
      roundTripOk: false,
      envelope,
    }
  }

  if (envelope.draftBundle.meta.publication?.derivedFrom !== "ai") {
    validationErrors.push('meta.publication.derivedFrom must be "ai" for operational AI drafts')
  }

  if (envelope.draftBundle.meta.publication?.publicationState !== "draft") {
    validationErrors.push('meta.publication.publicationState must be "draft"')
  }

  if (validationErrors.length > 0) {
    return {
      ok: false,
      dryRun,
      slug: options.slug,
      adaptationKind: options.adaptationKind,
      draftKey,
      draftPath,
      primitiveId: envelope.primitiveId,
      derivedFrom: "ai",
      validationErrors,
      roundTripOk: false,
      envelope,
    }
  }

  const hadDraftBeforeWrite = storage.exists(draftKey)
  const writeResult = writeAppointmentRuntimeDocumentByKey(
    draftKey,
    envelope.draftBundle,
    rootDir,
    { dryRun }
  )

  if (!writeResult.ok) {
    validationErrors.push(`storage adapter write failed for key: ${draftKey}`)
  }

  if (dryRun && !writeResult.dryRun) {
    validationErrors.push("dry-run write must not mutate storage")
  }

  if (dryRun && hadDraftBeforeWrite !== storage.exists(draftKey)) {
    validationErrors.push("dry-run write must not change draft existence")
  }

  let roundTripOk = dryRun

  if (!dryRun && writeResult.ok) {
    const roundTrip = readAppointmentRuntimeDocumentByKey(draftKey, rootDir)

    if (!roundTrip) {
      validationErrors.push("round-trip read failed after draft write")
      roundTripOk = false
    } else if (roundTrip.meta.publication?.derivedFrom !== "ai") {
      validationErrors.push("round-trip draft must declare derivedFrom=ai")
      roundTripOk = false
    } else if (
      JSON.stringify(roundTrip.meta.publication) !==
      JSON.stringify(envelope.draftBundle.meta.publication)
    ) {
      validationErrors.push("round-trip publication meta mismatch")
      roundTripOk = false
    } else if (JSON.stringify(roundTrip.operational) !== JSON.stringify(envelope.draftBundle.operational)) {
      validationErrors.push("round-trip operational payload mismatch")
      roundTripOk = false
    } else {
      roundTripOk = true
    }
  }

  return {
    ok: validationErrors.length === 0,
    dryRun,
    slug: options.slug,
    adaptationKind: options.adaptationKind,
    draftKey,
    draftPath,
    primitiveId: envelope.primitiveId,
    derivedFrom: "ai",
    validationErrors,
    roundTripOk,
    envelope,
  }
}
