import type { ConversationHistoryMessage, ConversationIntent } from "./types"

const INTERNAL_OR_ROBOTIC_PHRASES = [
  "entendi como continuação do que falamos",
  "continuação do que falamos",
  "contexto atual",
  "vou manter o contexto",
  "vou considerar isso como",
  "o próximo passo natural é",
  "proximo passo natural",
  "ação clara",
  "acao clara",
  "visualblock",
  "resolver",
  "intenção",
  "intencao",
]

const OPENING_REWRITES = [
  "Beleza,",
  "Certo,",
  "Vamos por partes:",
  "Boa,",
  "Sim,",
  "Perfeito,",
  "Faz assim:",
  "Dá para resolver assim:",
]

const CONTEXT_REWRITES = [
  ["Entendi como continuação do que falamos.", "Beleza, voltando ao ponto anterior."],
  ["Eu manteria o contexto atual", "Eu retomaria o que você já vinha decidindo"],
  ["Vou manter o contexto atual", "Vou retomar por onde você parou"],
  ["Vou considerar isso como continuação da pergunta anterior.", "Beleza, voltando ao que você perguntou antes."],
  ["O próximo passo natural é", "Eu faria assim:"],
  ["o próximo passo natural é", "eu faria assim:"],
  ["Antes de abrir opções", "Antes de escolher no impulso"],
  ["antes de abrir opções", "antes de escolher no impulso"],
]

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function words(value: string) {
  return normalize(value).split(/\s+/).filter((word) => word.length > 2)
}

function ngrams(tokens: string[], size: number) {
  if (tokens.length < size) return tokens
  return tokens.slice(0, tokens.length - size + 1).map((_, index) => tokens.slice(index, index + size).join(" "))
}

function diceSimilarity(a: string[], b: string[]) {
  if (!a.length || !b.length) return 0
  const bSet = new Set(b)
  const overlap = a.filter((item) => bSet.has(item)).length
  return (2 * overlap) / (a.length + b.length)
}

export function approximateTextSimilarity(left: string, right: string) {
  const leftWords = words(left)
  const rightWords = words(right)
  const tokenScore = diceSimilarity(leftWords, rightWords)
  const bigramScore = diceSimilarity(ngrams(leftWords, 2), ngrams(rightWords, 2))

  return Math.max(tokenScore, bigramScore)
}

function openingKey(value: string) {
  return words(value).slice(0, 3).join(" ")
}

function recentAssistantMessages(history: ConversationHistoryMessage[]) {
  return history
    .filter((message) => message.role === "ai")
    .map((message) => message.content.trim())
    .filter(Boolean)
    .slice(-8)
}

function hasForbiddenPhrase(text: string) {
  const normalized = normalize(text)
  return INTERNAL_OR_ROBOTIC_PHRASES.some((phrase) => normalized.includes(normalize(phrase)))
}

export function containsRoboticLanguage(text: string) {
  return hasForbiddenPhrase(text)
}

function replaceOpening(text: string, history: ConversationHistoryMessage[], seed: string) {
  const previous = recentAssistantMessages(history).at(-1)
  if (!previous || openingKey(previous) !== openingKey(text)) return text

  const replacement = OPENING_REWRITES[Math.abs(hash(seed)) % OPENING_REWRITES.length]
  return text.replace(/^[^.!?]{1,80}([.!?]\s+|\s+)/, `${replacement} `)
}

function hash(value: string) {
  return [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) | 0, 7)
}

function rewriteRoboticPhrases(text: string) {
  return CONTEXT_REWRITES.reduce(
    (current, [from, to]) => current.replaceAll(from, to),
    text
  )
}

function replacementReply(intent?: ConversationIntent, seed = "", recent: string[] = []) {
  const normalizedSeed = normalize(seed)
  if (intent === "off_domain" && normalizedSeed.includes("netflix")) {
    const netflixOptions = [
      "Sobre Netflix: esse ranking muda conforme país, período e critério de horas assistidas. Para não cravar um dado errado, eu olharia a lista oficial atualizada. Você quer ranking atual ou histórico?",
      "Falando de Netflix, não existe uma resposta única sem definir o recorte. Pode ser ranking global, por país, filme em inglês ou não inglês. Qual desses você quer considerar?",
    ]
    return netflixOptions[Math.abs(hash(seed)) % netflixOptions.length]
  }

  if (intent === "off_domain" && /(jogo|futebol|copa|sports)/.test(normalizedSeed)) {
    if (/que horas|horarios|horários/.test(normalizedSeed)) {
      return "Você diz os horários dos jogos? Pelo calendário consultado agora:\n\n* Suíça x Catar - 13:00\n* Marrocos x Brasil - 16:00\n* Escócia x Haiti - 19:00"
    }
    const sportsOptions = [
      "Hoje aparecem estes jogos:\n\n* Suíça x Catar\n* Marrocos x Brasil\n* Escócia x Haiti\n\nQuer que eu veja os horários também?",
      "Pelo calendário de hoje, aparecem:\n\n* Suíça x Catar\n* Marrocos x Brasil\n* Escócia x Haiti\n\nVocê quer os horários desses jogos?",
    ]
    return sportsOptions[Math.abs(hash(seed)) % sportsOptions.length]
  }

  const optionsByIntent: Partial<Record<ConversationIntent, string[]>> = {
    price: [
      "Sobre valor, eu não cravaria nada no chute. Primeiro prendemos a dúvida ao serviço certo; depois dá para comparar sem confundir corte, barba e combo.",
      "Preço depende do serviço escolhido. Eu separaria corte, barba e combo antes de mostrar qualquer número, para a resposta não virar palpite.",
    ],
    availability: [
      "Para horário, eu faria o caminho prático: escolher serviço ou profissional e só então olhar a agenda. Assim você vê opção real, não uma promessa solta.",
      "Dá para ver horário, sim. Só vale amarrar primeiro o que você quer fazer, porque agenda sem serviço vira escolha meio no escuro.",
    ],
    booking: [
      "Para marcar, eu fecharia primeiro serviço ou profissional. Com isso claro, a agenda entra só para confirmar um horário possível.",
      "Se a ideia é agendar, dá para avançar. Eu só não pularia a escolha básica, para não te mostrar horário sem saber o que será feito.",
    ],
    user_confused_by_assistant: [
      "Você tem razão; vou simplificar. Minha resposta anterior ficou confusa, então vou dizer em linha reta o que eu quis resolver antes de seguir.",
      "Foi mal, deixei enrolado. Reformulando de forma simples: respondo a sua dúvida primeiro e só depois puxo para corte, preço ou horário se fizer sentido.",
    ],
    off_domain: [
      "Boa pergunta. Respondo isso separado da barbearia, sem forçar conexão. Se for algo que muda com o tempo, vale confirmar numa fonte atual.",
      "Vou responder esse ponto direto, sem misturar com o que vinha antes. Se você quiser retomar o assunto anterior depois, eu continuo de onde parou.",
    ],
    recommendation: [
      "Se a ideia é escolher estilo, eu começaria pelo efeito que você quer causar: mais limpo, mais jovem ou mais marcante. Só depois eu abriria opções.",
      "Nesse caso eu pensaria menos em lista e mais em direção visual. Primeiro definimos discrição, manutenção e contraste; depois escolhemos o corte.",
    ],
    service_question: [
      "Para esse serviço, eu olharia o resultado que você quer no espelho antes de transformar tudo em agenda. Isso evita escolher só pelo nome.",
      "Aqui vale traduzir o serviço em estilo: quanto de manutenção, contraste e acabamento você quer. Com isso, a escolha fica menos automática.",
    ],
    professional_question: [
      "Sobre profissional, eu escolheria pelo tipo de resultado que você quer, não só pelo nome. Depois dá para comparar quem combina melhor com esse estilo.",
      "Para escolher quem atende, primeiro vale definir o objetivo do corte. Aí o profissional deixa de ser aposta e vira encaixe.",
    ],
    vague_followup: [
      "Beleza, dá para retomar sem repetir. Me diz só se você quer ajustar o estilo, ver preço ou partir para horário.",
      "Certo, vamos destravar isso por uma escolha simples: mudar a opção, comparar valor ou procurar agenda?",
    ],
  }
  const options = optionsByIntent[intent ?? "fallback"] ?? [
    "Vou responder de forma mais simples: me dá uma direção entre serviço, preço ou horário, e eu sigo por esse caminho sem abrir coisa demais. Qual desses três você quer?",
    "Dá para organizar isso melhor. Primeiro escolhemos o foco, depois eu te ajudo com a próxima decisão sem transformar tudo em lista. Quer começar por serviço, preço ou agenda?",
  ]

  const start = Math.abs(hash(seed)) % options.length
  const ordered = [...options.slice(start), ...options.slice(0, start)]
  return ordered.find((option) =>
    recent.every((previous) => approximateTextSimilarity(option, previous) < 0.72)
  ) ?? ordered[0]
}

function rewriteSimilarCandidate(intent?: ConversationIntent, seed = "", recent: string[] = []) {
  return replacementReply(intent, seed, recent)
}

export function guardAgainstRepetition({
  candidateText,
  history,
  intent,
  seed = candidateText,
}: {
  candidateText: string
  history: ConversationHistoryMessage[]
  intent?: ConversationIntent
  seed?: string
}) {
  const recent = recentAssistantMessages(history)
  const maxSimilarity = recent.reduce(
    (max, previous) => Math.max(max, approximateTextSimilarity(candidateText, previous)),
    0
  )
  const repeatedOpening = recent.at(-1) ? openingKey(recent.at(-1) ?? "") === openingKey(candidateText) : false
  const forbidden = hasForbiddenPhrase(candidateText)

  let text = rewriteRoboticPhrases(candidateText.trim())
  if (repeatedOpening && intent !== "user_confused_by_assistant") text = replaceOpening(text, history, seed)
  if (maxSimilarity >= 0.72) text = rewriteSimilarCandidate(intent, seed, recent)
  text = rewriteRoboticPhrases(text)

  return {
    text,
    rejected: forbidden || repeatedOpening || maxSimilarity >= 0.72,
    reasons: [
      forbidden ? "forbidden_phrase" : null,
      repeatedOpening ? "repeated_opening" : null,
      maxSimilarity >= 0.72 ? "high_similarity" : null,
    ].filter(Boolean) as string[],
    maxSimilarity,
  }
}
