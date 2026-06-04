/**
 * Emergency UX — typo normalization before kernel / dialogue (browser + server).
 */
export function normalizeUserMessageForKernel(message: string): string {
  let m = message.trim()
  if (!m) return m

  m = m.replace(/\bfede\s+feminino\b/gi, "fade feminino")
  m = m.replace(/\bfedezinho\b/gi, "fade")
  m = m.replace(/\bfedi\b/gi, "fade")
  m = m.replace(/\bfede\b/gi, "fade")

  return m
}
