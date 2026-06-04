import type { ActiveTopic } from "./types"

export function normalizeKernelText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
}

function hasToken(message: string, ...tokens: string[]): boolean {
  const m = normalizeKernelText(message)
  return tokens.some((t) => {
    const token = normalizeKernelText(t)
    if (token.length <= 4) {
      return new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(m)
    }
    return m.includes(token)
  })
}

/** Fade no texto do vídeo selecionado — não keyword de catálogo (Degrade). */
export function isFadeReferencedAsVideoContent(message: string): boolean {
  return hasToken(
    message,
    "esse fade",
    "esse video",
    "esse vídeo",
    "no video",
    "no vídeo",
    "tutorial",
    "mulher",
    "mulheres",
    "feminino",
    "feito",
    "tambem",
    "também",
    "em mim",
    "combina",
    "fica em mim",
    "rosto",
    "cabelo",
    "tecnica",
    "técnica",
    "clipe",
    "mostra"
  )
}

export function detectStrongTopic(message: string): ActiveTopic | null {
  const m = normalizeKernelText(message)

  if (
    hasToken(m, "quero agendar", "quero marcar", "quero marcar esse", "marcar esse", "agendar esse") ||
    hasToken(m, "marcar um horario", "marcar um horário", "agendar um horario", "agendar um horário") ||
    (hasToken(m, "agendar", "marcar", "reservar") && hasToken(m, "horario", "horário", "esse")) ||
    hasToken(m, "vaga hoje", "tem vaga", "tem horario", "tem horário", "encaixe")
  ) {
    return "schedule"
  }

  if (
    hasToken(m, "preco", "preço", "valor", "quanto custa", "quanto e", "quanto é", "custa quanto") ||
    hasToken(m, "pix", "pagamento", "cartao", "cartão", "debito", "débito")
  ) {
    return "pricing"
  }

  if (
    hasToken(m, "barbeiro", "profissional", "quem faz", "equipe", "carlos", "rafael", "lucas") &&
    !hasToken(m, "noticia", "notícia", "premio", "prêmio")
  ) {
    return "professional"
  }

  if (hasToken(m, "servico", "serviço", "degrade", "corte masculino", "barba completa") && !hasToken(m, "barbeiro")) {
    return "service"
  }

  if (hasToken(m, "fade") && !hasToken(m, "barbeiro") && !isFadeReferencedAsVideoContent(message)) {
    return "service"
  }

  if (
    hasToken(m, "como chego", "como eu chego", "estacionamento", "estacionar", "endereco", "endereço") ||
    (hasToken(m, "onde fica", "onde fica esse", "onde fica essa") && !hasToken(m, "dom corleone", "noticia", "notícia"))
  ) {
    return "arrival"
  }

  if (hasToken(m, "quantas pessoas", "cabem no", "cabe no", "capacidade", "lotacao", "lotação")) {
    return null
  }

  if (
    hasToken(m, "feriado", "feriados", "fecham", "horario", "horário", "funciona nos", "funciona no", "todo sabado", "todo sábado") &&
    !hasToken(m, "post", "publicacao", "publicação")
  ) {
    return "arrival"
  }

  if (
    hasToken(m, "noticia", "notícia", "premio", "prêmio", "o que diz", "essa noticia", "essa notícia", "matéria", "materia")
  ) {
    return "news_editorial"
  }

  return null
}
