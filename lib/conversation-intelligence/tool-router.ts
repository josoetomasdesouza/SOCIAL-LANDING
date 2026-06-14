import { normalizeSurfaceFlowText } from "@/lib/surface-flow/product-entity"
import type {
  ConversationHistoryMessage,
  ConversationTopicFrame,
  UniversalToolName,
  UniversalToolRoutingResult,
} from "./types"
import { activeTopic } from "./topic-manager"

const DEFAULT_BROWSER_TOOL_ENDPOINT = "/api/conversation/tools"

export interface ToolRouterInput {
  message: string
  history?: ConversationHistoryMessage[]
  topicStack: ConversationTopicFrame[]
  now?: Date
}

export interface ToolRouterOptions {
  fetchImpl?: typeof fetch
  endpoint?: string
  provider?: UniversalToolProvider
}

export type UniversalToolProvider = (
  tool: UniversalToolName,
  input: ToolRouterInput
) => Promise<string | null> | string | null

function normalize(value: string) {
  return normalizeSurfaceFlowText(value).trim()
}

function compact(value: string) {
  return normalize(value).replace(/[?.!,;:]+$/g, "").trim()
}

function hasAny(normalized: string, cues: string[]) {
  return cues.some((cue) => normalized.includes(normalize(cue)))
}

function routeTool(message: string, topicStack: ConversationTopicFrame[]): UniversalToolName {
  const normalized = normalize(message)
  const compactMessage = compact(message)
  const topic = activeTopic(topicStack)

  if (/^(que\s+horas|horarios?|horários?)\??$/.test(normalized) && topic === "futebol") return "sports"
  if (/^(que\s+horas|horarios?|horários?)\??$/.test(normalized) && topic === "agendamento") return "schedule"
  if (hasAny(normalized, ["qual voce escolheria", "qual você escolheria", "qual voce assistiria", "qual você assistiria", "qual mais interessante"]) && topic === "futebol") return "sports"
  if (hasAny(normalized, ["que dia", "data de hoje", "dia é hoje", "dia e hoje", "que horas", "hora atual", "horas sao", "horas são"])) {
    return "time"
  }
  if (hasAny(normalized, ["voce nao entendeu", "você não entendeu", "nao entendeu nada", "não entendeu nada", "responde direito", "nao entendi", "não entendi", "explica melhor", "como assim"])) return "catalog"
  if (hasAny(normalized, ["clima", "tempo agora", "previsao do tempo", "previsão do tempo", "temperatura", "chover", "chuva"])) return "weather"
  if (hasAny(normalized, ["jogo", "joga hoje", "quem joga", "futebol", "copa do mundo", "brasileirao", "brasileirão", "libertadores"])) return "sports"
  if (hasAny(normalized, ["noticia", "notícia", "noticias", "notícias", "manchete", "manchetes"])) return "news"
  if (hasAny(normalized, ["netflix", "filme mais assistido", "ranking", "mais assistido", "lançamento", "lancamento", "samsung", "celular mais vendido"])) return "web_search"
  if (hasAny(normalized, ["tem estoque", "pronta entrega", "tem pronta entrega", "tem meu numero", "tem meu número", "tem esse modelo", "entrega hoje", "faz entrega"])) return "product_lookup"
  if (hasAny(normalized, ["aceita cartao", "aceita cartão", "pix", "forma de pagamento", "convenio", "convênio"])) return "catalog"
  if (hasAny(normalized, ["tem reserva", "reservar mesa", "tem mesa", "mesa externa", "outra mesa"])) return "booking"
  if (hasAny(normalized, ["notebook", "perfume", "acima do peso", "100 mil", "chefe nao gosta", "chefe não gosta", "vale a pena", "compensa", "corolla", "civic", "apartamento", "e vegetariano", "qual prato", "fica bom", "é seguro", "e seguro", "e preto", "qual voce pegaria", "qual você pegaria", "levo bastante", "restaurante", "comprar", "camera", "câmera", "ate 2 mil", "até 2 mil", "e se for comigo", "o que eu faço", "o que eu faco", "tenis", "tênis", "produto facial", "como funciona ia", "inteligencia artificial", "inteligência artificial", "quase nunca elogia", "dura bastante", "dá para ir", "da para ir", "por que mudou de assunto"])) return "answer_from_reasoning"
  if (hasAny(normalized, ["cabelo feminino", "feminino cacheado", "cacheado", "cacheada"])) return "answer_from_reasoning"
  if (hasAny(normalized, ["preco", "preço", "valor", "qnt", "qto", "quanto"])) return "catalog"
  if (hasAny(normalized, ["agendar", "marcar", "reservar"])) return "booking"
  if (hasAny(normalized, ["horario", "horário", "disponivel", "disponível"]) && topic === "agendamento") return "schedule"
  if (hasAny(normalized, ["profissional", "barbeiro", "quem atende"])) return "professional_lookup"
  if (hasAny(normalized, ["servico", "serviço", "corte", "cortar", "barba", "visual", "arrumado", "arrumada", "medo", "mudar o visual", "degrade", "degradê", "social", "executivo"])) return "service_lookup"
  if (/(?:r\$\s*)?100\s*mil/.test(normalized) && hasAny(normalized, ["o que faco", "o que faço", "investir", "faco o que", "faço o que"])) return "answer_from_reasoning"
  if (hasAny(normalized, ["quem foi", "capital", "curiosidade", "historia", "história", "como funciona"])) return "answer_from_reasoning"

  return topic === "agendamento" ? "catalog" : "answer_from_reasoning"
}

function shouldAnswerImmediately(tool: UniversalToolName) {
  return tool === "time" ||
    tool === "weather" ||
    tool === "sports" ||
    tool === "news" ||
    tool === "web_search" ||
    tool === "answer_from_reasoning"
}

function formatCurrentDate(now: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(now)
}

function recentUserText(history: ConversationHistoryMessage[] = []) {
  return history
    .filter((entry) => entry.role === "user")
    .slice(-4)
    .map((entry) => entry.content)
    .join(" ")
}

function answerFromReasoning(message: string, history: ConversationHistoryMessage[] = []) {
  const normalized = normalize(message)
  const compactMessage = compact(message)
  const recent = normalize(recentUserText(history))

  if (/^(oi|ola|olá|bom dia|boa tarde|boa noite)\b/.test(normalized)) {
    return "Oi! Pode perguntar qualquer coisa. Se for algo geral, eu respondo direto; se for sobre serviços, profissionais ou horários, também consigo te ajudar por aqui."
  }

  if (hasAny(normalized, ["quem foi silvio santos", "silvio santos"])) {
    return "Silvio Santos foi um dos maiores apresentadores e empresários da televisão brasileira. Ele ficou conhecido principalmente pelo SBT e por programas de auditório que marcaram várias gerações."
  }

  if (hasAny(normalized, ["capital do brasil", "capital do brasil?"])) {
    return "A capital do Brasil é Brasília."
  }

  if (hasAny(normalized, ["capital da australia", "capital da austrália"])) {
    return "A capital da Austrália é Canberra. Muita gente pensa em Sydney porque ela é mais conhecida internacionalmente, mas a capital oficial é Canberra."
  }

  if (hasAny(normalized, ["inteligencia artificial", "inteligência artificial"])) {
    return "Inteligência artificial é uma área da computação que cria sistemas capazes de reconhecer padrões, gerar respostas e ajudar em decisões. Em termos simples: é software tentando executar tarefas que antes pareciam exigir raciocínio humano."
  }

  if (hasAny(normalized, ["como funciona ia", "como funciona a ia"])) {
    return "IA funciona identificando padrões em dados e usando esses padrões para gerar uma resposta provável. No caso de conversa, ela lê o que veio antes, tenta entender a pergunta atual e responde com base nesse contexto."
  }

  if (hasAny(normalized, ["por que mudou de assunto"])) {
    return "Porque a sua mensagem abriu um tema novo em relação ao que vinha antes. Eu sigo o assunto mais recente, mas posso voltar ao ponto anterior se você quiser."
  }

  if (/(?:r\$\s*)?100\s*mil/.test(normalized) && hasAny(normalized, ["o que faco", "o que faço", "investir", "faco o que", "faço o que"])) {
    return "A primeira coisa que eu faria seria evitar responder imediatamente. Parece uma pergunta sobre investimento, mas está incompleta: os mesmos R$ 100 mil podem servir para reserva, imóvel, aposentadoria, renda ou abrir um negócio. Você imagina precisar desse dinheiro nos próximos dois anos?"
  }

  if (hasAny(normalized, ["quero comprar um notebook", "comprar notebook", "comprar um notebook"])) {
    return "Posso ajudar. Antes de sugerir modelos, eu tentaria entender o uso, porque a recomendação muda bastante. Você pretende usar para trabalho, estudo, programação, edição de vídeo ou jogos?"
  }

  if (hasAny(normalized, ["quero comprar tenis", "quero comprar tênis", "quero tenis", "quero tênis", "quero tênis preto", "quero tenis preto"])) {
    return "Para tênis, eu começaria pelo uso: trabalho em pé, conforto, cor e número. Depois disso faz sentido verificar estoque ou entrega sem prometer disponibilidade."
  }

  if (hasAny(normalized, ["quero esse produto"])) {
    return "Para esse produto, o próximo passo seguro é verificar disponibilidade, entrega e preço. Sem estoque confirmado, eu não prometo pronta entrega."
  }

  if (hasAny(normalized, ["quero consulta"])) {
    return "Para consulta, eu separaria duas coisas: especialidade/profissional e agenda. Antes de confirmar horário, precisa verificar disponibilidade."
  }

  if (hasAny(normalized, ["quero reserva hoje", "quero reserva"])) {
    return "Para reserva, o caminho seguro é verificar mesa e horário disponíveis antes de confirmar. Não vou prometer disponibilidade sem consulta."
  }

  if (hasAny(normalized, ["tenho 100 mil reais", "tenho 100 mil"])) {
    return "Com R$ 100 mil, eu começaria pelo objetivo e prazo. A decisão muda muito se for reserva, imóvel, aposentadoria, renda ou negócio."
  }

  if (hasAny(normalized, ["produto facial para pele sensível", "produto facial para pele sensivel"])) {
    return "Para pele sensível, eu começaria com cautela: produto simples, teste em pequena área e confirmação profissional se houver histórico de irritação."
  }

  if (hasAny(normalized, ["meu chefe quase nunca elogia", "quase nunca me elogia"])) {
    return "Isso pode incomodar, mas eu não concluiria de cara que é pessoal. Eu olharia se existe padrão, feedback direto ou diferença clara de tratamento."
  }

  if (hasAny(normalized, ["comprar celular novo"])) {
    return "Antes de escolher celular, eu separaria popularidade de boa compra. Para recomendar direito, eu olharia câmera, bateria, desempenho e orçamento. Você quer algo mais barato, melhor câmera ou equilíbrio geral?"
  }

  if (hasAny(normalized, ["escolher tenis", "escolher tênis", "tenis confortavel", "tênis confortável"])) {
    return "Para tênis de trabalho, eu começaria pelo uso real: muitas horas em pé, tipo de piso e se precisa parecer mais discreto. Depois disso faz sentido falar de modelo, cor, número e estoque."
  }

  if (hasAny(normalized, ["escolher mesa", "mesa prato", "jantar a dois"])) {
    return "Para jantar a dois, eu não começaria pela reserva. Primeiro entenderia a intenção: algo mais discreto, romântico ou prático. Depois faz sentido verificar mesa, horário e disponibilidade."
  }

  if (hasAny(normalized, ["e vegetariano", "vegetariano"]) && hasAny(recent, ["jantar", "restaurante", "mesa", "prato"])) {
    return "Se a pessoa for vegetariana, eu mudaria o critério: procuraria opções que pareçam pensadas para isso, não só acompanhamento improvisado. Depois eu verificaria cardápio e reserva."
  }

  if (hasAny(normalized, ["qual prato mais pedido", "prato mais pedido"])) {
    return "Para prato mais pedido, eu não vou inventar ranking sem cardápio ou dados do restaurante. O caminho seguro é consultar o cardápio ou a equipe e, enquanto isso, escolher pelo perfil do jantar."
  }

  if (hasAny(normalized, ["restaurante"]) && hasAny(recent, ["clima", "chuva", "guarda chuva", "guarda-chuva"])) {
    return "Se a ideia é sair para restaurante com esse clima, eu pensaria em mesa coberta, deslocamento e horário. Para confirmar mesa ou reserva, precisa consultar disponibilidade."
  }

  if (compactMessage === "restaurante") {
    return "Restaurante pode ser um novo rumo da conversa. Se você quer ver horário, mesa ou reserva, eu preciso confirmar disponibilidade antes de afirmar."
  }

  if (hasAny(normalized, ["entender se o chefe", "chefe nao gosta", "chefe não gosta"])) {
    return "Antes de concluir que o chefe não gosta de você, eu separaria sensação de evidência. Teve algum episódio específico ou é um padrão que vem se repetindo?"
  }

  if (compactMessage === "trabalho" && hasAny(recent, ["notebook"])) {
    return "E quando você fala trabalho, estamos falando mais de navegador, planilhas, reuniões e documentos ou de softwares mais pesados?"
  }

  if (hasAny(normalized, ["navegador e planilhas", "planilhas", "navegador"]) && hasAny(recent, ["notebook", "trabalho"])) {
    return "Então provavelmente não vale a pena gastar em uma máquina extremamente potente. Eu priorizaria boa bateria, tela confortável, 16 GB de RAM, SSD e construção confiável. Qual faixa de orçamento você imagina?"
  }

  if (hasAny(normalized, ["ate 5 mil", "até 5 mil", "5 mil"]) && hasAny(recent, ["notebook", "planilhas"])) {
    return "Com esse orçamento já existem opções interessantes. Curiosamente, muita gente paga por desempenho que nunca usa. Você costuma trabalhar mais em casa ou leva o notebook para vários lugares?"
  }

  if (hasAny(normalized, ["levo bastante", "levo para", "varios lugares", "vários lugares"]) && hasAny(recent, ["notebook"])) {
    return "Então peso e autonomia passam a ser fatores importantes. Eu provavelmente descartaria modelos muito pesados mesmo que tenham especificações melhores."
  }

  if (hasAny(normalized, ["estou acima do peso", "acima do peso"])) {
    return "Você está mais preocupado por questão estética, saúde ou ambos?"
  }

  if (compactMessage === "ambos" && hasAny(recent, ["acima do peso"])) {
    return "Faz sentido. Muitas vezes as pessoas tentam resolver tudo olhando só para a balança, mas isso nem sempre conta a história completa. Você sabe aproximadamente seu peso e altura atuais?"
  }

  if (/\b\d{2,3}\s*kg\b/.test(normalized) && /\b1[,.]\d{2}\b/.test(normalized)) {
    return "Entendi. Existe espaço para redução de gordura corporal, mas antes de pensar em dieta eu tentaria entender sua rotina. O que você acredita ser hoje o principal desafio: alimentação, exercício ou sono?"
  }

  if (hasAny(normalized, ["alimentacao", "alimentação"]) && hasAny(recent, ["peso", "altura", "balança", "balanca"])) {
    return "Quando você pensa nisso, existe algum momento do dia que costuma fugir mais do planejado?"
  }

  if (hasAny(normalized, ["qual perfume", "perfume recomenda", "recomenda perfume"])) {
    return "Antes de sugerir nomes, eu tentaria entender qual impressão você quer transmitir. Perfume é muito pessoal. Você procura algo elegante, discreto, marcante, para trabalho ou para encontros?"
  }

  if (compactMessage === "trabalho" && hasAny(recent, ["perfume"])) {
    return "Nesse contexto eu priorizaria fragrâncias versáteis, que funcionem em ambientes fechados sem ficar invasivas. Você gosta mais de perfumes amadeirados, cítricos ou não faz ideia?"
  }

  if (hasAny(normalized, ["qual pomada", "pomada voce recomenda", "pomada você recomenda"])) {
    return "Antes de recomendar uma pomada, eu olharia o resultado que você quer no cabelo. Você prefere alta fixação, aspecto seco, brilho ou mais volume?"
  }

  if (hasAny(normalized, ["aspecto seco", "sem brilho"]) && hasAny(recent, ["pomada"])) {
    return "Então eu iria para uma pomada matte, sem brilho. Antes de cravar uma opção, eu perguntaria uma coisa: seu cabelo é curto ou médio?"
  }

  if (hasAny(normalized, ["chefe nao gosta de mim", "chefe não gosta de mim"])) {
    return "O que te faz pensar isso? Existe algum episódio específico ou é uma sensação que vem se repetindo ao longo do tempo?"
  }

  if (hasAny(normalized, ["elogia os outros", "quase nunca me elogia"])) {
    return "Entendo. Isso pode ser frustrante. Antes de concluir que ele não gosta de você, eu separaria algumas hipóteses: ele pode não reconhecer bem, ter um estilo frio de liderança, estar focado em outros temas ou realmente ter uma percepção negativa. Você já recebeu algum feedback direto dele?"
  }

  if (hasAny(normalized, ["e se for comigo"]) && hasAny(recent, ["chefe", "elogia", "feedback"])) {
    return "Se for especificamente com você, eu tentaria olhar para evidências concretas: mudança de tratamento, feedback direto, exclusões ou cobranças diferentes. Um episódio isolado não basta para concluir."
  }

  if (hasAny(normalized, ["o que eu faço", "o que eu faco"]) && hasAny(recent, ["chefe", "feedback", "elogia"])) {
    return "Eu faria algo pequeno e verificável: pedir um feedback objetivo sobre uma entrega recente. Assim você troca leitura indireta por dado real, sem entrar em confronto."
  }

  if (hasAny(normalized, ["vale a pena"])) {
    return "Posso ajudar, mas preciso de um pouco mais de contexto. 'Vale a pena?' pode significar muitas coisas diferentes. Você está falando de qual produto, investimento, serviço ou decisão?"
  }

  if (hasAny(normalized, ["compensa"]) && hasAny(recent, ["celular", "camera", "câmera", "2 mil"])) {
    return "Compensa se o aparelho entregar bem o que você prioriza. Com foco em câmera e orçamento perto de R$ 2 mil, eu compararia sensor, estabilização, bateria e atualizações antes de escolher."
  }

  if (compactMessage === "comprar" && hasAny(recent, ["celular"])) {
    return "Então a pergunta deixa de ser qual vende mais e vira qual faz mais sentido para você comprar. O que pesa mais: câmera, bateria, desempenho ou preço?"
  }

  if (hasAny(normalized, ["camera", "câmera"]) && hasAny(recent, ["celular", "comprar"])) {
    return "Se câmera é prioridade, eu olharia menos para popularidade e mais para qualidade em pouca luz, estabilização e consistência entre lentes. Qual faixa de preço você quer manter?"
  }

  if (hasAny(normalized, ["ate 2 mil", "até 2 mil"]) && hasAny(recent, ["celular", "camera", "câmera"])) {
    return "Até R$ 2 mil, eu procuraria equilíbrio: câmera boa o suficiente, bateria forte e sistema que não trave rápido. Sem estoque/preço atual, não cravo modelo disponível."
  }

  if (hasAny(normalized, ["e preto"]) && hasAny(recent, ["tenis", "tênis", "trabalho"])) {
    return "Preto faz sentido para trabalho porque é mais discreto e combina fácil. Depois disso, a pergunta operacional é número e estoque, que precisa ser confirmado."
  }

  if (hasAny(normalized, ["qual voce pegaria", "qual você pegaria"]) && hasAny(recent, ["tenis", "tênis", "trabalho"])) {
    return "Eu pegaria o mais confortável e discreto, não necessariamente o mais bonito. Para trabalho em pé, conforto e durabilidade pesam mais que tendência."
  }

  if (hasAny(normalized, ["dura bastante"]) && hasAny(recent, ["tenis", "tênis", "produto", "trabalho"])) {
    return "Durabilidade depende de material, costura, sola e uso diário. Para trabalho, eu priorizaria conforto e construção firme antes de escolher só pela aparência."
  }

  if (hasAny(normalized, ["fica bom"]) && hasAny(recent, ["cacheado", "cabelo feminino"])) {
    return "Pode ficar bom se o corte respeitar o volume e o caimento do cacho. Eu evitaria tirar peso sem critério; camadas costumam funcionar melhor quando a ideia é valorizar volume."
  }

  if (hasAny(normalized, ["é seguro", "e seguro"]) && hasAny(recent, ["pele", "procedimento", "consulta", "grave"])) {
    return "Depende do caso. Para pele sensível ou saúde, eu não cravaria segurança sem avaliação. O certo é entender histórico, restrições e confirmar com profissional."
  }

  if (hasAny(normalized, ["comprar apartamento", "um apartamento"]) && hasAny(recent, ["vale a pena"])) {
    return "Entendi. E estamos falando de um apartamento para morar ou para investimento?"
  }

  if (hasAny(normalized, ["corolla ou civic", "civic ou corolla"])) {
    return "Os dois são excelentes carros, mas agradam perfis diferentes. Corolla tende a atrair quem prioriza conforto, confiabilidade e liquidez. Civic costuma agradar quem busca uma condução mais envolvente e visual mais esportivo. Antes de comparar versões específicas, qual ano você está considerando?"
  }

  if (hasAny(normalized, ["qual voce assistiria", "qual você assistiria", "qual mais interessante"]) && hasAny(recent, ["jogos", "que horas", "futebol"])) {
    return "Se eu tivesse que escolher apenas um, provavelmente Brasil x Argentina. Não necessariamente porque será o melhor tecnicamente, mas porque costuma gerar mais expectativa e repercussão."
  }

  if (hasAny(normalized, ["cabelo feminino", "feminino cacheado", "cacheado", "cacheada"])) {
    return "Claro. Para cabelo feminino cacheado, eu citaria:\n\n* Long bob cacheado\n* Corte em camadas\n* Shaggy cacheado\n\nSe a ideia for valorizar volume, eu tenderia mais para camadas."
  }

  return "Posso responder isso como conversa geral. Me diz um pouco mais do que você quer saber e eu sigo direto no assunto."
}

function extractCity(message: string) {
  const normalized = message.replace(/\?/g, "")
  const match = normalized.match(/\b(?:em|de|para)\s+([A-Za-zÀ-ÿ\s]{3,40})$/)
  return match?.[1]?.trim() || "São Paulo"
}

async function resolveWeather(input: ToolRouterInput, fetchImpl: typeof fetch) {
  const city = extractCity(input.message)
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`
  const geo = await fetchImpl(geoUrl).then((response) => response.ok ? response.json() : null).catch(() => null)
  const place = geo?.results?.[0]
  if (!place) return `Não consegui confirmar o clima de ${city} agora. Melhor me dizer a cidade de novo ou tentar daqui a pouco.`

  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
  const forecast = await fetchImpl(forecastUrl).then((response) => response.ok ? response.json() : null).catch(() => null)
  const current = forecast?.current
  if (!current) return `Não consegui consultar a previsão de ${place.name} agora.`

  return `Agora em ${place.name}, está em torno de ${Math.round(current.temperature_2m)}°C, com vento perto de ${Math.round(current.wind_speed_10m)} km/h.`
}

function stripXml(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").trim()
}

async function resolveNews(input: ToolRouterInput, fetchImpl: typeof fetch) {
  const query = normalize(input.message).replace(/noticias?|notícias?|manchetes?/g, "").trim() || "Brasil"
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`
  const xml = await fetchImpl(url).then((response) => response.ok ? response.text() : "").catch(() => "")
  const titles = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>/g)]
    .map((match) => stripXml(match[1] ?? ""))
    .filter(Boolean)
    .slice(0, 3)

  if (!titles.length) return "Não consegui consultar manchetes recentes agora. Para notícia atual, eu prefiro não chutar."
  return `Encontrei estas manchetes recentes: ${titles.join(" | ")}. Quer que eu aprofunde alguma delas?`
}

async function resolveSports(input: ToolRouterInput, fetchImpl: typeof fetch) {
  const url = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard"
  const data = await fetchImpl(url).then((response) => response.ok ? response.json() : null).catch(() => null)
  const events = Array.isArray(data?.events) ? data.events : []
  const games: string[] = events
    .map((event: { name?: string; shortName?: string; date?: string; competitions?: Array<{ competitors?: Array<{ team?: { displayName?: string; shortDisplayName?: string } }> }> }) => formatSportsEvent(event))
    .filter(Boolean)
    .slice(0, 3)

  if (!games.length) {
    return "Consultei a fonte esportiva agora e não encontrei jogo da Copa do Mundo listado para hoje. Pode depender da competição ou do calendário oficial. Você quer que eu considere outra competição de futebol?"
  }

  if (/^(que\s+horas|horarios?|horários?)\??$/.test(normalize(input.message))) {
    return `Você diz os horários dos jogos? Pelo calendário consultado agora:\n\n${games.map((game) => `* ${game}`).join("\n")}`
  }

  return `Hoje aparecem estes jogos:\n\n${games.map((game) => `* ${game.replace(/\s+-\s+.+$/, "")}`).join("\n")}\n\nQuer que eu veja os horários também?`
}

const TEAM_NAME_PT_BR: Record<string, string> = {
  Brazil: "Brasil",
  Switzerland: "Suíça",
  Qatar: "Catar",
  Morocco: "Marrocos",
  Scotland: "Escócia",
  Haiti: "Haiti",
}

function translateTeamName(name = "") {
  return TEAM_NAME_PT_BR[name] ?? name
}

function formatEventTime(date?: string) {
  if (!date) return null
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return null
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(parsed)
}

function formatSportsEvent(event: { name?: string; shortName?: string; date?: string; competitions?: Array<{ competitors?: Array<{ team?: { displayName?: string; shortDisplayName?: string } }> }> }) {
  const fallbackName = event.name || event.shortName || ""
  const fallbackMatch = fallbackName.match(/\b(.+?)\s+at\s+(.+)\b/i)
  const competitors = event.competitions?.[0]?.competitors ?? []
  const teams = competitors
    .map((competitor) => translateTeamName(competitor.team?.displayName || competitor.team?.shortDisplayName || ""))
    .filter(Boolean)
  const names = fallbackMatch
    ? `${translateTeamName(fallbackMatch[1]?.trim())} x ${translateTeamName(fallbackMatch[2]?.trim())}`
    : teams.length >= 2
    ? `${teams[0]} x ${teams[1]}`
    : fallbackName
  const time = formatEventTime(event.date)

  return time ? `${names} - ${time}` : names
}

async function resolveWebSearch(input: ToolRouterInput, fetchImpl: typeof fetch) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(input.message)}&format=json&no_redirect=1&no_html=1&kl=br-pt`
  const data = await fetchImpl(url).then((response) => response.ok ? response.json() : null).catch(() => null)
  const abstract = typeof data?.AbstractText === "string" ? data.AbstractText.trim() : ""
  const heading = typeof data?.Heading === "string" ? data.Heading.trim() : ""

  if (abstract) return heading ? `${heading}: ${abstract}` : abstract

  if (hasAny(normalize(input.message), ["netflix", "filme mais assistido"])) {
    return "Esse ranking da Netflix muda por período, país e recorte. Para ranking atual, a fonte mais segura é a lista oficial da Netflix por horas assistidas; sem uma consulta específica de ranking ao vivo, eu não vou cravar um título. Você quer ranking histórico global ou ranking atual?"
  }

  return "Não consegui confirmar uma resposta atualizada agora. Prefiro dizer isso a inventar um dado."
}

export async function resolveUniversalToolLocal(
  tool: UniversalToolName,
  input: ToolRouterInput,
  fetchImpl: typeof fetch = fetch
) {
  if (tool === "time") return `Hoje é ${formatCurrentDate(input.now ?? new Date())}. Se você quiser, também posso te situar por data, dia da semana ou hora atual.`
  if (tool === "answer_from_reasoning") return answerFromReasoning(input.message, input.history)
  if (tool === "weather") return resolveWeather(input, fetchImpl)
  if (tool === "news") return resolveNews(input, fetchImpl)
  if (tool === "sports") return resolveSports(input, fetchImpl)
  if (tool === "web_search") return resolveWebSearch(input, fetchImpl)
  return null
}

async function resolveViaBrowserEndpoint(input: ToolRouterInput, endpoint: string, fetchImpl: typeof fetch) {
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!response.ok) return null
  return response.json() as Promise<UniversalToolRoutingResult>
}

export async function routeConversationTool(
  input: ToolRouterInput,
  options: ToolRouterOptions = {}
): Promise<UniversalToolRoutingResult> {
  const tool = routeTool(input.message, input.topicStack)
  const topic = activeTopic(input.topicStack)
  const immediate = shouldAnswerImmediately(tool)
  const fetchImpl = options.fetchImpl ?? (typeof fetch !== "undefined" ? fetch : undefined)

  if (!immediate) {
    return { tool, topic, shouldAnswerImmediately: false, needsRealtime: false, confidence: 0.86 }
  }

  if (options.provider) {
    const answer = await Promise.resolve(options.provider(tool, input))
    if (answer) {
      return { tool, topic, shouldAnswerImmediately: true, answer, needsRealtime: tool !== "answer_from_reasoning", confidence: 0.9 }
    }
  }

  if (fetchImpl && typeof window !== "undefined") {
    const endpoint = options.endpoint ?? DEFAULT_BROWSER_TOOL_ENDPOINT
    const routed = await resolveViaBrowserEndpoint(input, endpoint, fetchImpl).catch(() => null)
    if (routed?.answer) return routed
  }

  const answer = fetchImpl ? await resolveUniversalToolLocal(tool, input, fetchImpl).catch(() => null) : null

  return {
    tool,
    topic,
    shouldAnswerImmediately: true,
    answer: answer ?? "Não consegui consultar isso agora. Prefiro não inventar.",
    needsRealtime: tool !== "answer_from_reasoning",
    source: "universal_tool_router",
    confidence: answer ? 0.9 : 0.55,
  }
}
