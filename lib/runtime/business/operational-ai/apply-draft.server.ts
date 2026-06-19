import {
  loadBusinessRuntimeDraft,
  updateBusinessRuntimeDraft,
} from "../drafts/storage.server"
import { generateBusinessOperationalAiFixture } from "./generate-output"
import type {
  BusinessOperationalAiKind,
  BusinessOperationalAiOutputEnvelope,
} from "./types"

export interface ApplyBusinessOperationalAiDraftResult {
  draftId: string
  runtime: ReturnType<typeof generateBusinessOperationalAiFixture>["draftRuntime"]
  ai: BusinessOperationalAiOutputEnvelope
  updatedAt: string
}

export function applyBusinessOperationalAiToDraft(
  draftId: string,
  options: {
    rootDir?: string
    kind: BusinessOperationalAiKind
    operatorBrief?: string
    now?: string
  }
): ApplyBusinessOperationalAiDraftResult {
  const record = loadBusinessRuntimeDraft(draftId, options)

  if (!record) {
    throw new Error(`BusinessRuntime draft not found: ${draftId}`)
  }

  const ai = generateBusinessOperationalAiFixture({
    draftId,
    runtime: record.runtime,
    kind: options.kind,
    operatorBrief: options.operatorBrief,
  })

  if (!ai.validation.ok) {
    throw new Error(`Business operational AI validation failed: ${ai.validation.errors.join("; ")}`)
  }

  const updatedRecord = updateBusinessRuntimeDraft(draftId, ai.draftRuntime, {
    rootDir: options.rootDir,
    now: options.now,
  })

  return {
    draftId,
    runtime: updatedRecord.runtime,
    ai,
    updatedAt: updatedRecord.updatedAt,
  }
}
