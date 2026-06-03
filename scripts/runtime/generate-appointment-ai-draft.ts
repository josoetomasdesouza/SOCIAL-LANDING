import { readExternalRealityFileCache } from "../../lib/runtime/appointment/external-reality/snapshot-cache"
import { isOperationalAdaptationKind } from "../../lib/runtime/appointment/operational-ai/primitives"
import { resolveOperationalAiProviderId } from "../../lib/runtime/appointment/operational-ai/resolve-provider.server"
import { writeOperationalAiDraft } from "../../lib/runtime/appointment/operational-ai/write-draft.server"
import { APPOINTMENT_PILOT_SLUG } from "../../lib/runtime/appointment/types"

function hasFlag(flag: string) {
  return process.argv.includes(flag)
}

function readArg(prefix: string) {
  const match = process.argv.find((arg) => arg.startsWith(`${prefix}=`))
  return match?.slice(prefix.length + 1)
}

async function main() {
  const slug = readArg("--slug") ?? APPOINTMENT_PILOT_SLUG
  const adaptationKind = readArg("--kind") ?? "operational_hints_refresh"
  const dryRun = !hasFlag("--execute")
  const force = hasFlag("--force")
  const operatorBrief = readArg("--brief")
  const provider = resolveOperationalAiProviderId()

  if (!isOperationalAdaptationKind(adaptationKind)) {
    console.error(`FAIL unknown adaptation kind: ${adaptationKind}`)
    process.exit(1)
  }

  const externalSnapshot =
    adaptationKind === "external_review_map" ? readExternalRealityFileCache(slug) : undefined

  if (adaptationKind === "external_review_map" && !externalSnapshot) {
    console.error(
      "FAIL external_review_map requires cached external snapshot — run runtime:appointment:sync-external first"
    )
    process.exit(1)
  }

  let result

  try {
    result = await writeOperationalAiDraft({
      slug,
      adaptationKind,
      dryRun,
      force,
      operatorBrief,
      externalSnapshot,
    })
  } catch (error) {
    console.error(`FAIL operational ai draft write — ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }

  if (!result.ok) {
    console.error("FAIL operational ai draft write — validation errors")
    for (const error of result.validationErrors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  const envelope = result.envelope

  console.log(
    JSON.stringify(
      {
        status: dryRun ? "dry-run" : "executed",
        provider,
        slug: result.slug,
        adaptationKind: result.adaptationKind,
        primitiveId: result.primitiveId,
        draftKey: result.draftKey,
        draftPath: result.draftPath,
        derivedFrom: result.derivedFrom,
        roundTripOk: result.roundTripOk,
        resolvedProvider: provider,
        patch: envelope?.patch ?? null,
        sample: envelope
          ? {
              momentHint: envelope.draftBundle.operational.momentHint,
              derivedFrom: envelope.draftBundle.meta.publication?.derivedFrom,
              draftUpdatedAt: envelope.draftBundle.meta.publication?.draftUpdatedAt,
            }
          : null,
        note: dryRun
          ? "Dry-run only. Pass --execute to write runtime/{slug}/draft via storage adapter."
          : "Draft written. Review before promote — IA pode propor draft mas nunca publicar.",
        providerNote:
          provider === "llm"
            ? "LLM provider active via APPOINTMENT_AI_PROVIDER=llm"
            : "Fixture provider default (set APPOINTMENT_AI_PROVIDER=llm to opt in)",
      },
      null,
      2
    )
  )
}

void main()
