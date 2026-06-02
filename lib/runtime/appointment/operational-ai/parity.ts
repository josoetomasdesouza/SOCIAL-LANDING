import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { buildRuntimeDraftKey, buildRuntimeLiveKey } from "../../storage/keys"
import { getFilesystemStorage } from "../../storage/resolve-storage.server"
import { writeAppointmentRuntimeDocumentByKey, readAppointmentRuntimeDocumentByKey } from "../publication/load-document"
import { getAppointmentRuntimeSeedDocument } from "../runtime-store"
import { APPOINTMENT_PILOT_SLUG } from "../types"
import type { ExternalRealitySnapshot } from "../external-reality/types"
import { OPERATIONAL_ADAPTATION_KINDS } from "./types"
import { generateOperationalAiFixture } from "./fixture-generator"
import { mergeOperationalPatch, attachOperationalDraftMeta } from "./merge-patch"
import {
  buildInvalidPatchExample,
  buildValidPatchExample,
  validateOperationalAiOutput,
} from "./validate-output"
import { writeOperationalAiDraft } from "./write-draft.server"

function buildFixtureSnapshot(): ExternalRealitySnapshot {
  return {
    provider: "google-places",
    placeId: "ChIJ-operational-ai-fixture",
    fetchedAt: new Date().toISOString(),
    place: {
      displayName: "Barba Negra",
      formattedAddress: "Rua Augusta 150, Sao Paulo",
    },
    hours: { openNow: true },
    rating: { average: 4.6, total: 120 },
    reviews: [
      {
        id: "review-fixture-1",
        author: "Joao",
        rating: 5,
        text: "Ambiente calmo e corte preciso na Augusta.",
        relativeTime: "1 week ago",
      },
      {
        id: "review-fixture-2",
        author: "Maria",
        rating: 4,
        text: "Atendimento atento, chegada facil pelo Jardins.",
        relativeTime: "2 weeks ago",
      },
    ],
  }
}

export function runOperationalAiParityChecks() {
  const errors: string[] = []
  const slug = APPOINTMENT_PILOT_SLUG
  const baseBundle = getAppointmentRuntimeSeedDocument(slug)

  if (!baseBundle) {
    return {
      ok: false,
      errors: ["operational-ai parity: missing runtime seed"],
      snapshot: {},
    }
  }

  const snapshot: Record<string, boolean> = {}

  for (const adaptationKind of OPERATIONAL_ADAPTATION_KINDS) {
    const result = generateOperationalAiFixture({
      slug,
      baseBundle,
      adaptationKind,
      operatorBrief: "parity fixture",
      externalSnapshot: adaptationKind === "external_review_map" ? buildFixtureSnapshot() : undefined,
    })

    snapshot[adaptationKind] = result.validation.ok

    if (!result.validation.ok) {
      errors.push(
        ...result.validation.errors.map((error) => `${adaptationKind}: ${error}`)
      )
    }

    if (result.draftBundle.meta.publication?.derivedFrom !== "ai") {
      errors.push(`${adaptationKind}: draft must declare derivedFrom=ai`)
    }

    if (result.provider !== "fixture") {
      errors.push(`${adaptationKind}: provider must remain fixture in Etapa 1`)
    }

    const baseProfessionalIds = baseBundle.professionals.map((entry) => entry.id).join(",")
    const draftProfessionalIds = result.draftBundle.professionals.map((entry) => entry.id).join(",")

    if (baseProfessionalIds !== draftProfessionalIds) {
      errors.push(`${adaptationKind}: professional ids must be preserved`)
    }

    const baseSectionIds = baseBundle.feed.sections.map((section) => section.id).join(",")
    const draftSectionIds = result.draftBundle.feed.sections.map((section) => section.id).join(",")

    if (baseSectionIds !== draftSectionIds) {
      errors.push(`${adaptationKind}: feed section ids must be preserved`)
    }
  }

  const missingSnapshot = generateOperationalAiFixture({
    slug,
    baseBundle,
    adaptationKind: "external_review_map",
  })

  if (missingSnapshot.validation.ok) {
    errors.push("external_review_map must fail without externalSnapshot")
  }

  const validPatch = buildValidPatchExample(baseBundle)
  const validMerged = attachOperationalDraftMeta(
    mergeOperationalPatch(baseBundle, validPatch),
    slug
  )
  const validValidation = validateOperationalAiOutput({
    slug,
    baseBundle,
    mergedBundle: validMerged,
    patch: validPatch,
    adaptationKind: "operational_hints_refresh",
  })

  if (!validValidation.ok) {
    errors.push(...validValidation.errors.map((error) => `valid patch example: ${error}`))
  }

  const invalidPatch = buildInvalidPatchExample()
  const invalidMerged = attachOperationalDraftMeta(
    mergeOperationalPatch(baseBundle, invalidPatch),
    slug
  )
  const invalidValidation = validateOperationalAiOutput({
    slug,
    baseBundle,
    mergedBundle: invalidMerged,
    patch: invalidPatch,
    adaptationKind: "operational_hints_refresh",
  })

  if (invalidValidation.ok) {
    errors.push("invalid patch example must be rejected")
  } else {
    const hasLockedPathRejection = invalidValidation.errors.some(
      (error) =>
        error.includes("allowed paths") ||
        error.includes("patch shape") ||
        error.includes("grammar")
    )

    if (!hasLockedPathRejection) {
      errors.push("invalid patch example must reject locked paths or grammar drift")
    }
  }

  const marketingMerged = attachOperationalDraftMeta(
    mergeOperationalPatch(baseBundle, {
      establishment: {
        brand: {
          description: "Melhor barbearia da cidade — clique aqui",
        },
      },
    }),
    slug
  )
  const marketingValidation = validateOperationalAiOutput({
    slug,
    baseBundle,
    mergedBundle: marketingMerged,
    patch: {
      establishment: {
        brand: {
          description: "Melhor barbearia da cidade — clique aqui",
        },
      },
    },
    adaptationKind: "brand_description_polish",
  })

  if (marketingValidation.ok) {
    errors.push("marketing drift copy must be rejected")
  }

  const workspaceDir = mkdtempSync(join(tmpdir(), "operational-ai-draft-write-"))
  const storageSlug = "operational-ai-draft-parity"

  try {
    const liveSeed = structuredClone(baseBundle)
    liveSeed.meta.slug = storageSlug
    liveSeed.establishment.slug = storageSlug
    liveSeed.establishment.id = `establishment-${storageSlug}`

    const liveWrite = writeAppointmentRuntimeDocumentByKey(
      buildRuntimeLiveKey(storageSlug),
      liveSeed,
      workspaceDir
    )

    if (!liveWrite.ok) {
      errors.push("draft write parity: failed to seed live document")
    }

    const dryRunResult = writeOperationalAiDraft({
      slug: storageSlug,
      adaptationKind: "operational_hints_refresh",
      rootDir: workspaceDir,
      dryRun: true,
      operatorBrief: "parity dry-run",
    })

    if (!dryRunResult.ok) {
      errors.push(...dryRunResult.validationErrors.map((error) => `draft dry-run: ${error}`))
    }

    if (!dryRunResult.dryRun) {
      errors.push("draft dry-run: result must stay dry-run")
    }

    if (getFilesystemStorage(workspaceDir).exists(buildRuntimeDraftKey(storageSlug))) {
      errors.push("draft dry-run: must not create draft key on disk")
    }

    const executeResult = writeOperationalAiDraft({
      slug: storageSlug,
      adaptationKind: "operational_hints_refresh",
      rootDir: workspaceDir,
      dryRun: false,
      force: true,
      operatorBrief: "parity execute",
    })

    if (!executeResult.ok) {
      errors.push(...executeResult.validationErrors.map((error) => `draft execute: ${error}`))
    }

    if (!executeResult.roundTripOk) {
      errors.push("draft execute: storage round-trip must succeed")
    }

    const liveAfterWrite = readAppointmentRuntimeDocumentByKey(
      buildRuntimeLiveKey(storageSlug),
      workspaceDir
    )

    if (!liveAfterWrite) {
      errors.push("draft execute: live document must remain readable")
    } else if (JSON.stringify(liveAfterWrite.operational) !== JSON.stringify(liveSeed.operational)) {
      errors.push("draft execute: live document must remain unchanged")
    }

    const persistedDraft = readAppointmentRuntimeDocumentByKey(
      buildRuntimeDraftKey(storageSlug),
      workspaceDir
    )

    if (!persistedDraft?.meta.publication || persistedDraft.meta.publication.derivedFrom !== "ai") {
      errors.push("draft execute: persisted draft must declare derivedFrom=ai")
    }
  } finally {
    rmSync(workspaceDir, { recursive: true, force: true })
  }

  return {
    ok: errors.length === 0,
    errors,
    snapshot: {
      slug,
      primitiveResults: snapshot,
      invalidPatchRejected: !invalidValidation.ok,
      marketingDriftRejected: !marketingValidation.ok,
      draftWriteDryRun: true,
      draftWriteRoundTrip: true,
    },
  }
}
