import type {
  ConversationResponseResolverInput,
  ConversationResponseResolverResult,
} from "@/lib/mock-data/conversational-search"
import { normalizeSurfaceFlowText } from "@/lib/surface-flow/product-entity"
import type { EstablishmentDialogueContext } from "@/lib/mock-data/appointment-establishment-dialogue-context"

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

export function resolveEstablishmentDialogueV1(
  input: ConversationResponseResolverInput,
  ctx: EstablishmentDialogueContext
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
  ctx: EstablishmentDialogueContext
): ConversationResponseResolverResult {
  const place = ctx.operational.placeHint
  return {
    text: `A ${ctx.brandName} fica ${place} — veja servicos e profissionais no feed quando quiser.`,
  }
}
