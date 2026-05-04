// Format date consistently - use static format to avoid hydration mismatch
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getUTCDate()
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const month = months[date.getUTCMonth()]
  return `${day} ${month}`
}

export function formatDateLong(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getUTCDate()
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  const month = months[date.getUTCMonth()]
  const year = date.getUTCFullYear()
  return `${day} de ${month} de ${year}`
}
