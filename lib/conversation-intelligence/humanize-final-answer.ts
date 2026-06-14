const INTERNAL_COMMAND_PATTERNS = [
  /\bmostrar\s+(opções|opcoes|alternativas?|horários|horarios|profissionais?)[^.!?]*(?:[.!?]|$)/giu,
  /\bacionar\s+[^.!?]*(?:[.!?]|$)/giu,
  /\bactionRequest\b[^.!?]*(?:[.!?]|$)/giu,
  /\bvisualBlock\b[^.!?]*(?:[.!?]|$)/giu,
]

const PHRASE_REWRITES: Array<[RegExp, string]> = [
  [/\bPosso responder isso como conversa geral\.\s*Me diz um pouco mais do que você quer saber e eu sigo direto no assunto\.?/giu, "Me dá só um detalhe a mais do que você quer decidir, e eu respondo direto."],
  [/\bIsso é outro assunto, então melhor responder curto e direto\.\s*Se você quiser, seguimos nesse tema sem misturar com a conversa anterior\.?/giu, "Vou responder esse ponto direto, sem misturar com o que vinha antes. Se você quiser retomar o assunto anterior depois, eu continuo de onde parou."],
  [/\bSe eu tivesse que escolher um desses jogos, eu olharia o confronto com mais contexto e rivalidade\.\s*Entre os jogos citados, eu tenderia a escolher Marrocos x Brasil pela expectativa e repercussão\.?/giu, "Eu escolheria Marrocos x Brasil. É o jogo que tende a ter mais expectativa e assunto depois."],
  [/\bHoje aparecem estes jogos:\s*\n\n\*/giu, "Para hoje, a lista é:\n\n*"],
  [/(^|\n)\s*Resposta direta,\s*sem precisar abrir mais nada\.?\s*/giu, "$1"],
  [/\bEu deixaria a agenda entrar como apoio, só para confirmar uma opção real\./giu, "Eu olharia os horários só quando fizer sentido escolher de verdade."],
  [/\bEntendi como continuação do assunto anterior\b/giu, "Beleza, voltando ao assunto anterior"],
  [/\bEntendi como continuação do que falamos\b/giu, "Beleza, voltando ao assunto anterior"],
  [/\bcontinuação do que falamos\b/giu, "assunto anterior"],
  [/\bcontinuação do assunto anterior\b/giu, "assunto anterior"],
  [/\bPelo calendário esportivo consultado agora\b/giu, "Pelo calendário de hoje"],
  [/\bCorte Masculino\b/gu, "corte masculino"],
  [/\bCorte executivo\b/gu, "um corte executivo"],
  [/\bdireção de estilo\b/giu, "referência de visual"],
  [/\bdireção de visual\b/giu, "referência para o visual"],
  [/\bdireção visual\b/giu, "referência visual"],
  [/\breferência de visual\b/giu, "referência para o visual"],
  [/\bcomo direção\b/giu, "como referência"],
  [/\bantes de levar para agenda\b/giu, "antes de olhar horários"],
  [/\bagenda entrar como apoio\b/giu, "olhar horários com calma"],
  [/\bporque serviço ou profissional já estão claros\b/giu, "porque já temos uma boa base"],
  [/\bserviço ou profissional já estão claros\b/giu, "já temos uma boa base"],
  [/\btransformar tudo em agenda\b/giu, "correr para o horário"],
  [/\bsem transformar tudo em lista\b/giu, "sem abrir coisa demais"],
  [/\bvirar escolha meio no escuro\b/giu, "ficar confusa"],
  [/\bvalor precisa vir ligado ao serviço certo\b/giu, "valor depende do serviço escolhido"],
  [/\bmostrar outro card\b/giu, "abrir outra opção"],
  [/\brota anterior\b/giu, "opção anterior"],
  [/\bessa rota\b/giu, "essa opção"],
  [/\ba rota\b/giu, "a opção"],
  [/\bcontexto atual\b/giu, "assunto anterior"],
  [/\bcontexto atual\b/giu, "assunto anterior"],
  [/\bintenção\b/giu, "pedido"],
  [/\bintencao\b/giu, "pedido"],
  [/\btool\b/giu, "recurso"],
]

const ACCENT_REWRITES: Array<[RegExp, string]> = [
  [/\bvoce\b/giu, "você"],
  [/\bopcao\b/giu, "opção"],
  [/\bopcoes\b/giu, "opções"],
  [/\bservico\b/giu, "serviço"],
  [/\bservicos\b/giu, "serviços"],
  [/\bhorario\b/giu, "horário"],
  [/\bhorarios\b/giu, "horários"],
  [/\bpreco\b/giu, "preço"],
  [/\bnao\b/giu, "não"],
  [/\bacao\b/giu, "ação"],
  [/\bacoes\b/giu, "ações"],
  [/\besta\b/giu, "está"],
]

const FINAL_REWRITES: Array<[RegExp, string]> = [
  [/\bEntendi como continuação do assunto anterior\b/giu, "Beleza, voltando ao assunto anterior"],
  [/\bcontinuação do assunto anterior\b/giu, "assunto anterior"],
]

function applyRewrites(text: string, rewrites: Array<[RegExp, string]>) {
  return rewrites.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), text)
}

function normalizeSpacing(text: string) {
  return text
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/([.!?])(?=\S)/g, "$1 ")
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+—\s+/g, " — ")
    .trim()
}

function polishSentenceBoundaries(text: string) {
  return text
    .replace(/,\s*,/g, ",")
    .replace(/\.\s*\./g, ".")
    .replace(/\s+([?!.])/g, "$1")
    .replace(/;\s*([a-zá-ú])/giu, "; $1")
}

function stripInternalCommands(text: string) {
  return INTERNAL_COMMAND_PATTERNS.reduce((current, pattern) => current.replace(pattern, ""), text)
}

function softenTechnicalTone(text: string) {
  return text
    .replace(/\bConsiderando que estamos falando de\b/giu, "Como estamos falando de")
    .replace(/\bPara esse serviço, eu olharia\b/giu, "Eu olharia")
    .replace(/\bPelo que você descreveu, eu trataria\b/giu, "Pelo que você descreveu, eu começaria por")
    .replace(/\bSó vale amarrar primeiro\b/giu, "Antes, vale definir")
    .replace(/\bsem saber o que será feito\b/giu, "sem saber exatamente o que você quer fazer")
}

export function humanizeFinalAnswer(text: string) {
  const original = text.trim()
  let humanized = original

  humanized = stripInternalCommands(humanized)
  humanized = applyRewrites(humanized, PHRASE_REWRITES)
  humanized = softenTechnicalTone(humanized)
  humanized = applyRewrites(humanized, ACCENT_REWRITES)
  humanized = applyRewrites(humanized, FINAL_REWRITES)
  humanized = polishSentenceBoundaries(humanized)
  humanized = normalizeSpacing(humanized)

  return humanized || original
}
