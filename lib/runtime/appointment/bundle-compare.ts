import type { AppointmentRuntimeBundle } from "./types"

function stableStringify(value: unknown) {
  return JSON.stringify(value, Object.keys(value as object).sort())
}

export function appointmentRuntimeBundlesMatch(
  left: AppointmentRuntimeBundle,
  right: AppointmentRuntimeBundle
) {
  return stableStringify(left) === stableStringify(right)
}

export function getAppointmentRuntimeBundleDiffErrors(
  left: AppointmentRuntimeBundle,
  right: AppointmentRuntimeBundle,
  labelLeft: string,
  labelRight: string
) {
  const errors: string[] = []

  if (left.version !== right.version) {
    errors.push(`${labelLeft}.version !== ${labelRight}.version`)
  }

  if (left.establishment.slug !== right.establishment.slug) {
    errors.push(`${labelLeft}.establishment.slug !== ${labelRight}.establishment.slug`)
  }

  if (left.professionals.length !== right.professionals.length) {
    errors.push(`${labelLeft}.professionals.length !== ${labelRight}.professionals.length`)
  }

  if (left.services.length !== right.services.length) {
    errors.push(`${labelLeft}.services.length !== ${labelRight}.services.length`)
  }

  if (left.feed.stories.length !== right.feed.stories.length) {
    errors.push(`${labelLeft}.feed.stories.length !== ${labelRight}.feed.stories.length`)
  }

  if (!appointmentRuntimeBundlesMatch(left, right)) {
    errors.push(`${labelLeft} bundle does not match ${labelRight}`)
  }

  return errors
}
