import { readFileSync } from "node:fs"
import { join } from "node:path"

import { loadAppointmentRuntimeFromRuntimeStore } from "../load"
import { validateAppointmentRuntimeBundle } from "../validate"
import { APPOINTMENT_PILOT_SLUG } from "../types"
import {
  mapGooglePlacesDetailsToExternalRealitySnapshot,
  type GooglePlacesPlaceDetailsPayload,
} from "./google-places-map"
import {
  mergeExternalRealityIntoBundle,
  preservedEditorialFieldsMatch,
} from "./merge-into-bundle"

function loadMergeFixtureSnapshot() {
  const fixturePath = join(
    process.cwd(),
    "lib/runtime/appointment/external-reality/fixtures/google-places-barba-negra.json"
  )
  const payload = JSON.parse(readFileSync(fixturePath, "utf8")) as GooglePlacesPlaceDetailsPayload

  return mapGooglePlacesDetailsToExternalRealitySnapshot(
    "ChIJ-fixture-barba-negra",
    payload,
    "2026-05-24T12:00:00.000Z"
  )
}

export function runExternalRealityMergeParityChecks() {
  const errors: string[] = []
  const base = loadAppointmentRuntimeFromRuntimeStore(APPOINTMENT_PILOT_SLUG)
  const snapshot = loadMergeFixtureSnapshot()

  const fallbackMerged = mergeExternalRealityIntoBundle(base, snapshot, {
    status: "fallback",
  })

  if (fallbackMerged.meta.external?.status !== "fallback") {
    errors.push("fallback merge must set meta.external.status=fallback")
  }

  if (fallbackMerged.establishment.contact.address !== base.establishment.contact.address) {
    errors.push("fallback merge must not change establishment.contact.address")
  }

  if (fallbackMerged.arrival.addressLine !== base.arrival.addressLine) {
    errors.push("fallback merge must not change arrival.addressLine")
  }

  if (!preservedEditorialFieldsMatch(base, fallbackMerged)) {
    errors.push("fallback merge must preserve editorial grammar fields")
  }

  const staleMerged = mergeExternalRealityIntoBundle(base, snapshot, {
    status: "stale",
  })

  if (staleMerged.establishment.contact.address !== base.establishment.contact.address) {
    errors.push("stale merge must not change establishment.contact.address")
  }

  const liveMerged = mergeExternalRealityIntoBundle(base, snapshot, {
    status: "live",
  })

  const liveValidation = validateAppointmentRuntimeBundle(liveMerged, APPOINTMENT_PILOT_SLUG)

  if (!liveValidation.ok) {
    errors.push(...liveValidation.errors.map((error) => `live merge invalid: ${error}`))
  }

  if (!preservedEditorialFieldsMatch(base, liveMerged)) {
    errors.push("live merge must preserve editorial grammar fields")
  }

  if (liveMerged.operational.placeHint !== base.operational.placeHint) {
    errors.push("live merge must preserve operational.placeHint")
  }

  if (liveMerged.arrival.drawerTitle !== base.arrival.drawerTitle) {
    errors.push("live merge must preserve arrival.drawerTitle")
  }

  if (liveMerged.establishment.contact.address !== snapshot.place.formattedAddress) {
    errors.push("live merge must enrich establishment.contact.address from snapshot")
  }

  if (liveMerged.arrival.addressLine !== snapshot.place.formattedAddress) {
    errors.push("live merge must enrich arrival.addressLine from snapshot")
  }

  if (liveMerged.arrival.mapsQuery !== snapshot.place.mapsUri) {
    errors.push("live merge must enrich arrival.mapsQuery from snapshot mapsUri")
  }

  if (liveMerged.operational.liveState !== "Aberto agora") {
    errors.push("live merge must derive operational.liveState from hours.openNow")
  }

  const reviewsSection = liveMerged.feed.sections.find((section) => section.id === "reviews")

  if (!reviewsSection || reviewsSection.items.length !== 3) {
    errors.push("live merge must cap reviews section at 3 items")
  }

  if (reviewsSection?.items[0]?.title !== "Ambiente excelente e atendimento impecável.") {
    errors.push("live merge must map external reviews into feed section")
  }

  const nullSnapshotMerged = mergeExternalRealityIntoBundle(base, null, {
    status: "fallback",
  })

  if (nullSnapshotMerged.meta.external?.status !== "fallback") {
    errors.push("null snapshot merge must set fallback meta.external")
  }

  if (nullSnapshotMerged.establishment.contact.address !== base.establishment.contact.address) {
    errors.push("null snapshot merge must not mutate bundle fields")
  }

  return {
    ok: errors.length === 0,
    errors,
    snapshot: {
      fallbackStatus: fallbackMerged.meta.external?.status,
      liveAddress: liveMerged.establishment.contact.address,
      liveReviewCount: reviewsSection?.items.length ?? 0,
      preservedPlaceHint: liveMerged.operational.placeHint,
    },
  }
}
