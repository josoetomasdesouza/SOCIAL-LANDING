import type {
  ConversationResponseResolverInput,
  ConversationResponseResolverResult,
} from "@/lib/mock-data/conversational-search"
import { normalizeSurfaceFlowText } from "@/lib/surface-flow/product-entity"
import type {
  EstablishmentDialogueContext,
  EstablishmentDialogueSession,
} from "@/lib/mock-data/appointment-establishment-dialogue-context"

function normalizeMessage(message: string) {
  return normalizeSurfaceFlowText(message).trim()
}

function textOnly(content: string): ConversationResponseResolverResult {
  return { text: content }
}

function matchOutOfDomain(normalized: string) {
  const cues = [
    "limpeza de rosto",
    "limpeza facial",
    "produto para limpeza",
    "produto de limpeza",
    "manicure",
    "unha",
    "spa ",
    "ganhou o jogo",
    "quem ganhou",
    "restaurante perto",
    "indica restaurante",
    "atendem mulher",
    "atende mulher",
    "cabelo feminino",
  ]
  return cues.some((cue) => normalized.includes(cue))
}

function buildOutOfDomainReply(normalized: string, ctx: EstablishmentDialogueContext) {
  if (normalized.includes("limpeza") || (normalized.includes("produto") && normalized.includes("rosto"))) {
    return "Por aqui nao fazemos limpeza de rosto — o mais proximo e hidratacao capilar, se fizer sentido."
  }
  if (normalized.includes("manicure") || normalized.includes("unha")) {
    return "A casa e focada em corte e barba — manicure nao esta no que oferecemos."
  }
  if (normalized.includes("jogo") || normalized.includes("ganhou")) {
    return "Isso foge do que a gente trata aqui — na Augusta cuidamos de corte e barba."
  }
  if (normalized.includes("restaurante")) {
    return "Nao consigo indicar restaurante — aqui e so a Barba Negra na Augusta."
  }
  if (normalized.includes("mulher") || normalized.includes("feminino")) {
    return "O foco da casa e barbearia masculina — melhor confirmar no balcao o que encaixa hoje."
  }
  return `Isso foge do que a gente trata por aqui — na Augusta cuidamos de corte e barba.`
}

function matchHours(normalized: string) {
  return (
    normalized.includes("aberto") ||
    normalized.includes("atendendo") ||
    normalized.includes("fecham") ||
    normalized.includes("que horas") ||
    normalized.includes("ate que horas") ||
    normalized.includes("horario") && (normalized.includes("fech") || normalized.includes("funcion")) ||
    normalized.includes("funciona domingo") ||
    normalized.includes("domingo")
  )
}

function buildHoursReply(normalized: string, ctx: EstablishmentDialogueContext) {
  const { liveState, hoursHint, openingHours, placeHint } = ctx.operational

  if (normalized.includes("domingo")) {
    return `A gente nao abre domingo — de segunda a sabado, ${openingHours}.`
  }

  if (normalized.includes("fecham") || normalized.includes("ate que horas") || normalized.includes("que horas")) {
    const hint = hoursHint ? `vai ${hoursHint}` : "segue o horario do dia"
    return `Hoje a casa ${placeHint} ${hint}; em geral funciona ${openingHours}.`
  }

  const hours = hoursHint ? `, ${hoursHint}` : ""
  return `${liveState} — por aqui ${placeHint}${hours}. (${openingHours} no geral.)`
}

function matchParking(normalized: string) {
  return (
    normalized.includes("estacionamento") ||
    normalized.includes("parar o carro") ||
    normalized.includes("onde paro") ||
    normalized.includes("vaga")
  )
}

function matchLocationAddress(normalized: string) {
  return (
    normalized.includes("onde fica") ||
    normalized.includes("qual o endereco") ||
    normalized.includes("qual endereco") ||
    normalized.includes("endereco") ||
    normalized.includes("na augusta mesmo") ||
    normalized.includes("e na augusta")
  )
}

function matchArrivalText(normalized: string) {
  return (
    normalized.includes("como chego") ||
    normalized.includes("como chegar") ||
    normalized.includes("como ir") ||
    normalized.includes("como eu chego")
  )
}

function matchMetro(normalized: string) {
  return normalized.includes("metro") || normalized.includes("metrô")
}

function buildLocationReply(normalized: string, ctx: EstablishmentDialogueContext) {
  const { addressLine, parkingHint, placeHint } = {
    ...ctx.arrival,
    placeHint: ctx.operational.placeHint,
  }

  if (matchParking(normalized) && parkingHint) {
    return parkingHint
  }

  if (matchMetro(normalized)) {
    return `Nao tenho a linha exata aqui — estamos ${placeHint}, ${addressLine}; o hero traz o mapa se quiser.`
  }

  if (normalized.includes("augusta mesmo") || normalized.includes("na augusta")) {
    return `Isso — ${ctx.brandName} ${placeHint}, ${addressLine}.`
  }

  return `Ficamos em ${addressLine} — ${placeHint}, perto da Paulista.`
}

function buildArrivalTextReply(ctx: EstablishmentDialogueContext) {
  return "Na Augusta, perto da Paulista — toque em Ver como chegar no topo para ver referencia e rota."
}

function matchFirstVisit(normalized: string) {
  return (
    normalized.includes("nunca fui") ||
    normalized.includes("primeira vez") ||
    normalized.includes("como funciona") ||
    (normalized.includes("preciso") && normalized.includes("agendar") && normalized.includes("antes"))
  )
}

function buildFirstVisitReply(normalized: string, ctx: EstablishmentDialogueContext) {
  if (normalized.includes("agendar") && normalized.includes("antes")) {
    const moment = ctx.operational.momentHint ? ` ${ctx.operational.momentHint}` : ""
    return `Nao precisa decidir tudo no chat — da para ver horarios na casa; encaixe leve costuma aparecer no dia.`
  }
  if (normalized.includes("como funciona")) {
    return "Por aqui voce explora o feed, segura um profissional se quiser, e ve disponibilidade sem compromisso."
  }
  return "Bem-vindo — na primeira visita, o usual e escolher um servico ou barbeiro no feed e explorar com calma."
}

function matchGreeting(normalized: string) {
  if (
    matchOutOfDomain(normalized) ||
    matchHours(normalized) ||
    matchFirstVisit(normalized) ||
    matchSmallTalk(normalized)
  ) {
    return false
  }

  const cues = [
    "^ola$",
    "^oi$",
    "^oi ",
    "^ola ",
    "bom dia",
    "boa tarde",
    "boa noite",
    "^e ai$",
    "^eai$",
    "^valeu$",
    "^obrigad",
  ]
  return cues.some((cue) => {
    if (cue.startsWith("^")) {
      const pattern = cue.replace(/\^/g, "").replace(/\$/g, "")
      return normalized === pattern || normalized.startsWith(`${pattern} `)
    }
    return normalized.includes(cue)
  })
}

function buildGreetingReply(normalized: string, ctx: EstablishmentDialogueContext) {
  const place = ctx.operational.placeHint

  if (normalized.includes("obrigad") || normalized.includes("valeu")) {
    return `Por nada — a casa fica ${place} quando quiser voltar.`
  }
  if (normalized.includes("bom dia")) {
    return `Bom dia. A casa esta ${place} — quando quiser, explore servicos ou profissionais por aqui.`
  }
  if (normalized.includes("boa tarde")) {
    return `Boa tarde. A ${ctx.brandName} fica ${place} — fica a vontade para ver o feed.`
  }
  if (normalized.includes("boa noite")) {
    return `Boa noite. Passa aqui ${place} com calma — o espaco esta no feed se quiser inspirar o visual.`
  }
  if (normalized.includes("e ai") || normalized === "eai") {
    return `E ai — tudo certo por aqui ${place}. Fica a vontade.`
  }
  return `Ola — bem-vindo a ${ctx.brandName}, ${place}. Fica a vontade para ver o que a casa oferece.`
}

function matchSmallTalk(normalized: string) {
  return (
    normalized.includes("tudo bem") ||
    normalized.includes("como voces estao") ||
    normalized.includes("como vcs estao") ||
    normalized.includes("gostei") ||
    normalized.includes("ambiente") ||
    normalized.includes("legal o lugar") ||
    normalized.includes("bacana")
  )
}

function buildSmallTalkReply(normalized: string, ctx: EstablishmentDialogueContext) {
  if (normalized.includes("gostei") || normalized.includes("ambiente") || normalized.includes("bacana") || normalized.includes("legal")) {
    return "Que bom que curtiu — a ideia e mesmo ficar confortavel na Augusta."
  }
  if (normalized.includes("como voces") || normalized.includes("como vcs")) {
    return "A equipe esta bem, obrigado. O movimento na Augusta costuma ficar mais tranquilo depois das 18h."
  }
  return "Tudo certo por aqui — obrigado por perguntar. A casa segue na Augusta se quiser explorar."
}

function pickServiceHints(ctx: EstablishmentDialogueContext, limit = 2) {
  const names = ctx.serviceNames.filter(Boolean)
  if (names.length === 0) return "servicos no feed"
  if (names.length === 1) return names[0]
  return `${names[0]} ou ${names[1]}`
}

function matchMetaRepetition(normalized: string) {
  return (
    normalized.includes("so fala isso") ||
    normalized.includes("voce so fala") ||
    normalized.includes("vc so fala") ||
    normalized.includes("sempre fala") ||
    normalized.includes("repete") ||
    normalized.includes("mesma coisa") ||
    normalized.includes("so diz isso")
  )
}

function matchInsecurityBeauty(normalized: string) {
  return (
    normalized.includes("ficar bonito") ||
    normalized.includes("ficar feio") ||
    normalized.includes("vou ficar bonito") ||
    normalized.includes("vai ficar bonito") ||
    normalized.includes("sera que vou ficar")
  )
}

function matchOpinionRequest(normalized: string) {
  return (
    normalized.includes("opiniao") ||
    normalized.includes("uma opiniao") ||
    normalized.includes("quero opiniao") ||
    normalized.includes("preciso de opiniao") ||
    (normalized.includes("o que acha") && !normalized.includes("agendar"))
  )
}

function matchStyleDiscovery(normalized: string) {
  if (
    matchHours(normalized) ||
    matchOutOfDomain(normalized) ||
    matchArrivalText(normalized) ||
    matchParking(normalized) ||
    matchLocationAddress(normalized)
  ) {
    return false
  }

  const cues = [
    "mudar meu visual",
    "mudar o visual",
    "mudar visual",
    "nao sei qual corte",
    "qual corte fazer",
    "sem forma",
    "cabelo sem forma",
    "mais moderno",
    "algo moderno",
    "combina comigo",
    "o que combina comigo",
    "ficar mais bonito",
    "quero ficar mais bonito",
    "visual completo",
    "estilo novo",
    "novo visual",
    "corte novo",
  ]
  return cues.some((cue) => normalized.includes(cue))
}

function parseDiscoveryFocus(normalized: string): "hair" | "beard" | "both" | "discreet" | "modern" | "bold" | null {
  if (normalized.includes("os dois") || normalized.includes("visual completo") || normalized.includes("tudo")) {
    return "both"
  }
  if (normalized.includes("barba") && !normalized.includes("cabelo")) return "beard"
  if (normalized.includes("cabelo") || normalized.includes("corte")) return "hair"
  if (normalized.includes("discreto")) return "discreet"
  if (normalized.includes("moderno")) return "modern"
  if (normalized.includes("marcante") || normalized.includes("ousad")) return "bold"
  return null
}

function buildDiscoverySteerReply(ctx: EstablishmentDialogueContext, focus: "hair" | "beard" | "both" | "discreet" | "modern" | "bold") {
  const uniqueServices: string[] = []
  const seen = new Set<string>()
  for (const name of ctx.serviceNames) {
    const trimmed = name?.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    uniqueServices.push(trimmed)
  }

  const servicePairLabel = () => {
    if (uniqueServices.length === 0) return "servicos no feed"
    if (uniqueServices.length === 1) return uniqueServices[0]
    return `${uniqueServices[0]} ou ${uniqueServices[1]}`
  }

  const services = servicePairLabel()

  if (focus === "modern") {
    const anchor = uniqueServices.find((name) => /degrad/i.test(name)) ?? uniqueServices[0]
    if (!anchor) {
      return "Fechado — explora o feed e ve um barbeiro com referencias parecidas."
    }
    const companion = uniqueServices.find((name) => name !== anchor)
    const hint = companion ? `${anchor} ou ${companion}` : anchor
    return `Fechado — ${hint} costuma ser um bom ponto de partida; explora no feed e ve um barbeiro com referencias parecidas.`
  }

  if (focus === "beard") {
    return `Beleza — barba costuma comecar com ${services} no feed; segura um barbeiro e compara referencias.`
  }
  if (focus === "both") {
    return `Combinado — olha ${services} no feed e escolhe um barbeiro com estilo parecido com o que voce imagina.`
  }
  if (focus === "discreet" || focus === "bold") {
    return `Entendi — comeca por ${services} no feed e ve fotos de referencia antes de decidir o corte.`
  }
  return `Show — para cabelo, ${services} no feed ajudam a comecar; segura um barbeiro se quiser comparar estilos.`
}

function buildDiscoveryReply(
  normalized: string,
  ctx: EstablishmentDialogueContext,
  session: EstablishmentDialogueSession
): string | null {
  if (matchMetaRepetition(normalized)) {
    session.discoveryTurns = 1
    session.awaitingFocus = true
    return "Boa, voce tem razao 😄. Me conta o que voce quer resolver hoje que eu tento te orientar melhor."
  }

  const focusAnswer = parseDiscoveryFocus(normalized)
  if (focusAnswer && (session.awaitingFocus || session.discoveryTurns > 0)) {
    session.discoveryTurns = Math.min(session.discoveryTurns + 1, 3)
    session.awaitingFocus = false
    return buildDiscoverySteerReply(ctx, focusAnswer)
  }

  if (session.discoveryTurns >= 2) {
    const services = pickServiceHints(ctx)
    return `Pra fechar leve: olha ${services} no feed ou segura um barbeiro — sem prometer resultado, so caminho claro.`
  }

  if (matchInsecurityBeauty(normalized)) {
    session.discoveryTurns = 1
    session.awaitingFocus = true
    return "A gente nao promete milagre 😄, mas um bom corte ajuda bastante. Voce esta pensando em mudar cabelo, barba ou os dois?"
  }

  if (matchOpinionRequest(normalized)) {
    session.discoveryTurns = 1
    session.awaitingFocus = true
    return "Claro. Me diz uma coisa: voce quer opiniao sobre cabelo, barba ou visual completo?"
  }

  if (normalized.includes("mudar") && normalized.includes("visual")) {
    session.discoveryTurns = 1
    session.awaitingFocus = true
    return "Boa. Voce quer algo mais discreto, mais moderno ou uma mudanca mais marcante?"
  }

  if (normalized.includes("nao sei qual corte") || normalized.includes("qual corte fazer")) {
    session.discoveryTurns = 1
    session.awaitingFocus = true
    return "Normal — comeca pelo estilo: quer algo social, degrade ou manter comprimento? Qual caminho te parece mais proximo?"
  }

  if (normalized.includes("mais moderno") || normalized.includes("algo moderno")) {
    session.discoveryTurns = 2
    session.awaitingFocus = false
    const anchor =
      ctx.serviceNames.find((name) => /degrad/i.test(name)) ?? ctx.serviceNames[0] ?? "Degrade"
    return `Fechado — ${anchor} costuma ser um bom ponto de partida; explora no feed e ve um barbeiro com referencias parecidas.`
  }

  if (matchStyleDiscovery(normalized)) {
    session.discoveryTurns = 1
    session.awaitingFocus = true
    if (normalized.includes("combina comigo") || normalized.includes("ficar mais bonito")) {
      return "Boa pergunta — sem adivinhar rosto 😄. Voce quer mexer em cabelo, barba ou os dois?"
    }
    if (normalized.includes("sem forma")) {
      return "Entendo — cabelo sem forma e chato. Quer dar forma com corte social, degrade ou manter um pouco de comprimento?"
    }
    return "Boa. Voce quer algo mais discreto, mais moderno ou uma mudanca mais marcante?"
  }

  if (session.discoveryTurns === 1 && session.awaitingFocus) {
    session.discoveryTurns = 2
    return "Me ajuda com uma palavra: cabelo, barba ou visual completo?"
  }

  return null
}

function matchDiscoveryIntent(normalized: string, session: EstablishmentDialogueSession) {
  if (matchMetaRepetition(normalized)) return true
  if (matchInsecurityBeauty(normalized) || matchOpinionRequest(normalized) || matchStyleDiscovery(normalized)) {
    return true
  }
  if (session.awaitingFocus || session.discoveryTurns > 0) {
    return parseDiscoveryFocus(normalized) !== null
  }
  return false
}

export function resolveEstablishmentDialogueV1(
  input: ConversationResponseResolverInput,
  ctx: EstablishmentDialogueContext,
  session: EstablishmentDialogueSession = { discoveryTurns: 0, awaitingFocus: false }
): ConversationResponseResolverResult | null {
  const normalized = normalizeMessage(input.message)
  if (!normalized) return null

  if (matchOutOfDomain(normalized)) {
    return textOnly(buildOutOfDomainReply(normalized, ctx))
  }

  if (matchHours(normalized)) {
    return textOnly(buildHoursReply(normalized, ctx))
  }

  if (matchArrivalText(normalized)) {
    return textOnly(buildArrivalTextReply(ctx))
  }

  if (matchParking(normalized) || matchLocationAddress(normalized) || matchMetro(normalized)) {
    return textOnly(buildLocationReply(normalized, ctx))
  }

  if (matchFirstVisit(normalized)) {
    return textOnly(buildFirstVisitReply(normalized, ctx))
  }

  if (matchDiscoveryIntent(normalized, session)) {
    const discoveryText = buildDiscoveryReply(normalized, ctx, session)
    if (discoveryText) {
      return textOnly(discoveryText)
    }
  }

  if (matchGreeting(normalized)) {
    return textOnly(buildGreetingReply(normalized, ctx))
  }

  if (matchSmallTalk(normalized)) {
    return textOnly(buildSmallTalkReply(normalized, ctx))
  }

  return null
}

export function situatedFallbackV1(
  _input: ConversationResponseResolverInput,
  ctx: EstablishmentDialogueContext,
  session?: EstablishmentDialogueSession
): ConversationResponseResolverResult {
  if (session && (session.awaitingFocus || session.discoveryTurns > 0)) {
    return {
      text: "Me conta em uma linha: cabelo, barba ou visual completo? A gente te aponta pro feed sem enrolar.",
    }
  }

  return {
    text: "Não captei o foco. É horário, como chegar, preço, um item do feed ou agendar?",
  }
}
