import { validateAppointmentRuntimeBundle } from "../validate"
import type { AppointmentRuntimeBundle } from "../types"
import type { AppointmentPublicationValidationResult } from "./types"

export function validateAppointmentDraftBundle(
  bundle: AppointmentRuntimeBundle,
  expectedSlug: string
): AppointmentPublicationValidationResult {
  const errors = [...validateAppointmentRuntimeBundle(bundle, expectedSlug).errors]

  if (!bundle.meta.publication) {
    errors.push("meta.publication is required for draft documents")
  } else {
    if (bundle.meta.publication.publicationState !== "draft") {
      errors.push('meta.publication.publicationState must be "draft"')
    }

    if (!bundle.meta.publication.draftUpdatedAt?.trim()) {
      errors.push("meta.publication.draftUpdatedAt is required for draft documents")
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  }
}

export function validateAppointmentLiveBundle(
  bundle: AppointmentRuntimeBundle,
  expectedSlug: string
): AppointmentPublicationValidationResult {
  const errors = [...validateAppointmentRuntimeBundle(bundle, expectedSlug).errors]

  if (bundle.meta.publication?.publicationState === "draft") {
    errors.push("live document must not declare meta.publication.publicationState=draft")
  }

  if (bundle.meta.source !== "runtime") {
    errors.push('live document meta.source must be "runtime"')
  }

  return {
    ok: errors.length === 0,
    errors,
  }
}

export function assertAppointmentDraftBundle(
  bundle: AppointmentRuntimeBundle,
  expectedSlug: string
) {
  const result = validateAppointmentDraftBundle(bundle, expectedSlug)

  if (!result.ok) {
    throw new Error(`Invalid appointment draft bundle:\n- ${result.errors.join("\n- ")}`)
  }
}

export function assertAppointmentLiveBundle(
  bundle: AppointmentRuntimeBundle,
  expectedSlug: string
) {
  const result = validateAppointmentLiveBundle(bundle, expectedSlug)

  if (!result.ok) {
    throw new Error(`Invalid appointment live bundle:\n- ${result.errors.join("\n- ")}`)
  }
}
