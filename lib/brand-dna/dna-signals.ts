/**
 * Brand DNA signals — declarative hints for future Goal/AI layers.
 * Read-only derivations. No adaptive behavior.
 */

import type { BrandDNA, BrandDNASnapshot } from "./dna-types"

export type BrandSignalStrength = "low" | "medium" | "high"

export interface BrandSignal {
  readonly key: string
  readonly value: string | number | boolean
  readonly strength: BrandSignalStrength
  readonly source: "dna.voice" | "dna.behavior" | "dna.colors"
}

export function deriveBrandSignals(dna: BrandDNA | BrandDNASnapshot): readonly BrandSignal[] {
  const signals: BrandSignal[] = [
    {
      key: "voice.tone",
      value: dna.voice.tone,
      strength: "high",
      source: "dna.voice",
    },
    {
      key: "voice.intensity",
      value: dna.voice.intensity,
      strength: "medium",
      source: "dna.voice",
    },
    {
      key: "behavior.preferConversationFirst",
      value: dna.behavior.preferConversationFirst,
      strength: "high",
      source: "dna.behavior",
    },
    {
      key: "behavior.ctaStyle",
      value: dna.behavior.ctaStyle,
      strength: "medium",
      source: "dna.behavior",
    },
    {
      key: "behavior.aiProfile",
      value: dna.behavior.aiProfile,
      strength: "medium",
      source: "dna.behavior",
    },
    {
      key: "colors.primary",
      value: dna.colors.primary,
      strength: "high",
      source: "dna.colors",
    },
  ]

  if (dna.behavior.allowAggressivePromo) {
    signals.push({
      key: "risk.aggressivePromo",
      value: true,
      strength: "high",
      source: "dna.behavior",
    })
  }

  return signals
}

export function getBrandSignal(
  dna: BrandDNA | BrandDNASnapshot,
  key: string
): BrandSignal | undefined {
  return deriveBrandSignals(dna).find((signal) => signal.key === key)
}

export function brandSignalsToRecord(
  dna: BrandDNA | BrandDNASnapshot
): Readonly<Record<string, string | number | boolean>> {
  const record: Record<string, string | number | boolean> = {}
  for (const signal of deriveBrandSignals(dna)) {
    record[signal.key] = signal.value
  }
  return record
}
