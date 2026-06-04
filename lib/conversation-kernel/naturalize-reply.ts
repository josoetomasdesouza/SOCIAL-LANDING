/**
 * Post-process user-facing copy: informal PT-BR, no em/en dash between clauses.
 */
export function naturalizeReplyText(text: string): string {
  if (!text?.trim()) return text

  let t = text.trim()

  t = t.replace(/\s*[—–]\s*/g, (_match, offset: number, full: string) => {
    const before = full.slice(0, offset).trimEnd()
    const last = before.slice(-1)
    if (last === "." || last === "!" || last === "?") return " "
    return ". "
  })

  t = t.replace(/\s*;\s*/g, ", ")
  t = t.replace(/\.{2,}/g, ".")
  t = t.replace(/\s+/g, " ")
  t = t.replace(/\.\s+\./g, ".")
  t = t.replace(/,\s*,/g, ",")
  t = t.replace(/([.!?])\s+([a-zà-ú])/g, (_m, punct: string, letter: string) => `${punct} ${letter.toUpperCase()}`)

  return t.trim()
}
