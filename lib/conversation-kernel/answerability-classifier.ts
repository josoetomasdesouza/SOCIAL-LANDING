import { normalizeKernelText } from "./active-topic"
import { isFadeReferencedAsVideoContent } from "./topic-detection"
import {
  isWeakOperationalFollowUp,
  resolvePendingClarificationTurn,
  shouldIntentBeatChip,
} from "./topic-ownership"
import { buildCatalogPriceHint } from "./catalog-hints"
import { isInDomainMissingContext } from "./missing-context"
import { isSocialFeedChip } from "./model-context-pack"
import type { KernelResponse, KernelSession, ModelContextPack, SelectedContextItem } from "./types"

export type AnswerabilityClass =
  | "answerable_from_selected_context"
  | "answerable_from_active_topic"
  | "answerable_from_catalog"
  | "answerable_from_operational_context"
  | "answerable_with_honest_gap"
  | "in_domain_missing_context"
  | "needs_clarification"
  | "should_delegate_transactional"
  | "blocked"

export interface AnswerabilityDecision {
  class: AnswerabilityClass
  reason: string
}

function hasToken(message: string, ...tokens: string[]): boolean {
  const m = normalize(message)
  return tokens.some((t) => {
    const token = normalize(t)
    if (token.length <= 5) {
      return new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(m)
    }
    return m.includes(token)
  })
}

function normalize(message: string): string {
  return normalizeKernelText(message)
}

function titleTokens(title: string): string[] {
  return normalize(title)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2)
}

function isCapacityOrFacilityQuestion(message: string): boolean {
  return hasToken(
    message,
    "quantas pessoas",
    "quantas pessoas cabem",
    "cabem no",
    "cabe no",
    "capacidade",
    "lotacao",
    "lotação",
    "acomoda",
    "grupo grande",
    "mesa para quantos",
    "coube"
  )
}

export function messageReferencesChip(message: string, item: SelectedContextItem): boolean {
  const m = normalize(message)
  if (isCapacityOrFacilityQuestion(message)) return false

  const tokens = titleTokens(item.title)
  const hits = tokens.filter((t) => m.includes(t))
  if (hits.length >= 2) return true

  if (isSocialFeedChip(item)) {
    return hasToken(
      m,
      "esse espaco",
      "esse espaço",
      "o lounge",
      "do post",
      "essa publicacao",
      "essa publicação",
      "nosso espaco",
      "nosso espaço",
      "fale mais",
      "o que e",
      "o que é",
      "sobre isso",
      "sobre esse"
    )
  }

  if (item.kind === "video") {
    if (/^(carecas|mulheres|cacheado|crespo|preco|preço|horario|horário|isso|esse)$/.test(m)) {
      return true
    }
    if (
      hasToken(
        m,
        "careca",
        "carecas",
        "calvo",
        "calvos",
        "calvicie",
        "cacheado",
        "crespo",
        "mulher",
        "mulheres",
        "feminino",
        "tecnica",
        "técnica",
        "desse conteudo",
        "desse conteúdo",
        "esse conteudo",
        "esse conteúdo",
        "sobre o conteudo",
        "sobre o conteúdo"
      )
    ) {
      return true
    }
    if (
      hasToken(
        m,
        "antes",
        "depois",
        "transformacao",
        "transformação",
        "video",
        "vídeo",
        "tendencia",
        "tendência",
        "fade",
        "esse",
        "isso",
        "feito",
        "tambem",
        "também",
        "homem",
        "homens",
        "card",
        "estilo",
        "corte",
        "comente",
        "perguntei",
        "como faz",
        "serve pra mim",
        "fale mais",
        "o que e",
        "o que é",
        "sobre o que",
        "estamos falando",
        "do que estamos",
        "do video",
        "do vídeo"
      )
    ) {
      if (hasToken(m, "sobre o que", "estamos falando", "do que estamos", "perguntei", "comentei", "card")) {
        return true
      }
      return /antes|depois|transformacao|transformação/.test(m) || hits.length >= 1
    }
  }
  return hits.length >= 1 && hasToken(m, "como", "qual", "oque", "o que", "fale", "sobre", "isso", "esse")
}

function isBeforeAfterChip(item: SelectedContextItem): boolean {
  const t = normalize(item.title + " " + (item.summary ?? ""))
  return /antes e depois|antes\/depois|transformacao|transformação/.test(t)
}

function isPricingQuestion(message: string): boolean {
  return hasToken(message, "preco", "preço", "valor", "quanto custa", "quanto e", "quanto é", "custa quanto")
}

function isOperationalHoursQuestion(message: string): boolean {
  const m = normalize(message)
  return (
    hasToken(
      message,
      "feriado",
      "feriados",
      "natal",
      "ano novo",
      "reveillon",
      "fecham",
      "fecha hoje",
      "horario",
      "horário",
      "que horas",
      "funciona nos",
      "funciona no",
      "aberto agora",
      "abertos agora",
      "todo sabado",
      "todo sábado",
      "domingo",
      "segunda feira"
    ) ||
    /^(e\s+)?(ate|até)\s+que\s+horas/.test(m) ||
    hasToken(m, "e ate que horas", "e até que horas", "e o horario", "e o horário")
  )
}

function isAboutSelectedFeedPost(message: string, chip: SelectedContextItem): boolean {
  if (!isSocialFeedChip(chip)) return false
  if (
    isOperationalHoursQuestion(message) ||
    isLocationBranchQuestion(message) ||
    isPricingQuestion(message) ||
    isCapacityOrFacilityQuestion(message)
  ) {
    return false
  }
  return (
    hasToken(message, "fale mais", "o que e", "o que é", "sobre isso", "sobre esse", "esse post", "essa publicacao", "essa publicação") ||
    messageReferencesChip(message, chip)
  )
}

export function isLocationBranchQuestion(message: string): boolean {
  return hasToken(
    message,
    "curitiba",
    "outra cidade",
    "outro estado",
    "unidade em",
    "tem em ",
    "tem essa",
    "filial em",
    "barbearia em",
    "cidade",
    "abre em",
    "unidade em"
  )
}

function isDirectQuestion(message: string, chip?: SelectedContextItem): boolean {
  const m = normalize(message)
  if (m.length < 4) return false
  if (/^(oi|ola|olá|hey|bom dia|boa tarde|boa noite)$/.test(m)) return false
  if (isCapacityOrFacilityQuestion(message)) return false

  const semantic =
    isPricingQuestion(message) ||
    isLocationBranchQuestion(message) ||
    hasToken(m, "como", "qual", "quando", "onde", "quanto", "aceita", "fecham", "aberto", "duracao", "duração", "funciona", "faz o", "faz a") ||
    /^tem\s/.test(m)

  if (chip && isSocialFeedChip(chip)) return semantic

  return semantic || /\?$/.test(message.trim())
}

function isVagueWithoutTarget(message: string, pack: ModelContextPack): boolean {
  if (isPricingQuestion(message) && pack.selectedContextItems.length === 0) return true
  return false
}

function isTransactionalIntent(message: string, pack?: ModelContextPack): boolean {
  const m = normalize(message)
  const chip = pack?.selectedContextItems[0]
  if (chip?.kind === "video") {
    if (hasToken(m, "degrade", "fade") && m.length < 20) return false
    if (isFadeReferencedAsVideoContent(message)) return false
  }
  if (chip && hasToken(m, "me fala", "fala ai", "fala aí", "isso", "essa", "oi") && m.length < 24) {
    return false
  }
  return (
    hasToken(
      m,
      "quero marcar",
      "quero agendar",
      "quero marcar esse",
      "marcar esse",
      "agendar esse",
      "marcar um horario",
      "marcar um horário",
      "agendar um horario",
      "agendar um horário"
    ) ||
    (hasToken(m, "marcar", "agendar", "reservar") && hasToken(m, "horario", "horário", "esse")) ||
    hasToken(m, "quais servicos", "quais serviços", "tem algo a tarde", "vaga hoje", "tem vaga") ||
    (hasToken(m, "degrade") && !isPricingQuestion(message) && m.length < 18)
  )
}

function isVagueRephrase(message: string): boolean {
  const m = normalize(message)
  return hasToken(m, "me fala", "fala ai", "fala aí", "nao entendi", "não entendi") && m.length < 28
}

function resetStaleOperationalSession(
  message: string,
  session: KernelSession,
  pack: ModelContextPack
): void {
  const m = normalize(message)
  const vague = isVagueRephrase(message)
  const retains =
    isWeakOperationalFollowUp(message) ||
    hasToken(m, "estacionamento", "estacionar", "horario", "horário", "fecham", "curitiba", "unidade") ||
    (vague && (session.sessionLane === "parking" || session.sessionLane === "hours")) ||
    Boolean(session.pendingClarification)

  if (pack.selectedContextItems.length === 0 && vague) {
    session.sessionLane = undefined
    session.activeTopic = undefined
    session.topicOwner = undefined
    session.pendingClarification = undefined
    return
  }

  if (!retains && (session.sessionLane || session.activeTopic === "arrival")) {
    session.sessionLane = undefined
    session.activeTopic = undefined
    session.topicOwner = undefined
  }
}

function classifyChipAnswerability(
  message: string,
  pack: ModelContextPack,
  session: KernelSession
): AnswerabilityDecision | null {
  const chip = pack.selectedContextItems[0]
  if (!chip) return null
  const m = normalize(message)

  if (isInDomainMissingContext(message, chip)) {
    return { class: "in_domain_missing_context", reason: "ambiguous_referent" }
  }

  if (isSocialFeedChip(chip) && isLocationBranchQuestion(message)) {
    return { class: "in_domain_missing_context", reason: "ambiguous_referent" }
  }

  if (shouldIntentBeatChip(message, session, pack)) return null

  if (isAboutSelectedFeedPost(message, chip)) {
    return { class: "answerable_from_selected_context", reason: "feed_post_inquiry" }
  }

  if (
    chip.kind === "video" &&
    (isFadeReferencedAsVideoContent(message) ||
      hasToken(
        m,
        "tecnica",
        "técnica",
        "tendencia",
        "tendência",
        "careca",
        "carecas",
        "cacheado",
        "combina",
        "comigo",
        "em mim",
        "ficar em mim",
        "serve pra mim",
        "vai ficar"
      ) ||
      messageReferencesChip(message, chip))
  ) {
    return { class: "answerable_from_selected_context", reason: "video_chip" }
  }

  if (hasToken(m, "me fala", "fala ai", "fala aí") && m.length < 28) {
    return { class: "answerable_from_selected_context", reason: "chip_vague_anchor" }
  }

  if (/^(isso|essa|oi)$/i.test(m.trim())) {
    return { class: "answerable_from_selected_context", reason: "chip_short_anchor" }
  }

  if (chip.kind === "service" && hasToken(m, "fale mais", "sobre esse", "corte", "servico", "serviço")) {
    return { class: "answerable_from_selected_context", reason: "service_inquiry" }
  }

  if (
    messageReferencesChip(message, chip) ||
    hasToken(m, "combina", "comigo", "ficar em mim", "fale mais", "sobre isso", "e isso", "sobre esse")
  ) {
    return { class: "answerable_from_selected_context", reason: "direct_about_chip" }
  }

  return null
}

export function classifyAnswerability(
  message: string,
  pack: ModelContextPack,
  session: KernelSession
): AnswerabilityDecision {
  resetStaleOperationalSession(message, session, pack)
  const m = normalize(message)

  if (hasToken(m, "diagnostica", "mancha", "sintoma", "doença", "doenca")) {
    return { class: "blocked", reason: "clinical" }
  }

  if (hasToken(m, "estacionamento", "estacionar", "vaga no estacionamento")) {
    return { class: "answerable_from_operational_context", reason: "parking" }
  }

  if (
    hasToken(m, "me fala", "fala ai", "fala aí", "nao entendi", "não entendi") &&
    m.length < 28 &&
    (session.sessionLane === "parking" || session.sessionLane === "hours")
  ) {
    return { class: "needs_clarification", reason: "contextual_broad" }
  }

  const chipEarly = pack.selectedContextItems[0]

  const chipLane = classifyChipAnswerability(message, pack, session)
  if (chipLane) return chipLane

  const pending = resolvePendingClarificationTurn(message, session)
  if (pending) {
    return pending as AnswerabilityDecision
  }

  if (isTransactionalIntent(message, pack)) {
    return { class: "should_delegate_transactional", reason: "booking_or_catalog_search" }
  }

  if (isOperationalHoursQuestion(message)) {
    return { class: "answerable_from_operational_context", reason: "hours_or_holidays" }
  }

  if (
    isLocationBranchQuestion(message) &&
    !(chipEarly && isSocialFeedChip(chipEarly) && isInDomainMissingContext(message, chipEarly))
  ) {
    return { class: "answerable_from_operational_context", reason: "branch_or_city" }
  }

  if (chipEarly && shouldIntentBeatChip(message, session, pack)) {
    if (
      isWeakOperationalFollowUp(message) &&
      (session.sessionLane === "hours" ||
        isOperationalHoursQuestion(message) ||
        /horas/.test(m))
    ) {
      return { class: "answerable_from_operational_context", reason: "hours_followup_over_session" }
    }
    return { class: "answerable_from_active_topic", reason: "topic_overrides_chip" }
  }

  if (!chipEarly && hasToken(m, "me fala", "fala ai", "fala aí", "nao entendi", "não entendi") && m.length < 28) {
    if (session.sessionLane === "parking" || session.sessionLane === "hours") {
      return { class: "needs_clarification", reason: "contextual_broad" }
    }
    return { class: "needs_clarification", reason: "broad_clarify" }
  }

  if (isVagueWithoutTarget(message, pack)) {
    return { class: "needs_clarification", reason: "missing_target" }
  }

  if (!chipEarly && isInDomainMissingContext(message)) {
    return { class: "in_domain_missing_context", reason: "ambiguous_referent_no_chip" }
  }

  if (isLocationBranchQuestion(message)) {
    return { class: "answerable_from_operational_context", reason: "branch_or_city" }
  }

  if (isOperationalHoursQuestion(message)) {
    return { class: "answerable_from_operational_context", reason: "hours_or_holidays" }
  }

  const chip = pack.selectedContextItems[0]

  if (isCapacityOrFacilityQuestion(message)) {
    return { class: "answerable_with_honest_gap", reason: "capacity_not_in_profile" }
  }

  if (chip && hasToken(m, "cnpj", "inscricao", "inscrição")) {
    return { class: "needs_clarification", reason: "defer_to_legacy" }
  }

  if (chip && isPricingQuestion(message)) {
    if (chip.kind === "service" || chip.relatedEntityIds?.length) {
      return { class: "answerable_from_catalog", reason: "service_price" }
    }
    return { class: "answerable_with_honest_gap", reason: "non_priced_chip" }
  }

  if (chip && isAboutSelectedFeedPost(message, chip)) {
    return { class: "answerable_from_selected_context", reason: "feed_post_inquiry" }
  }

  if (chip && isOperationalHoursQuestion(message)) {
    return { class: "answerable_from_operational_context", reason: "hours_with_chip" }
  }

  if (chip && isDirectQuestion(message, chip) && !isOperationalHoursQuestion(message)) {
    if (isBeforeAfterChip(chip) || messageReferencesChip(message, chip)) {
      return { class: "answerable_from_selected_context", reason: "direct_about_chip" }
    }
    if (chip.kind === "service" && hasToken(m, "como", "qual", "duracao", "duração", "fale", "servico", "serviço")) {
      return { class: "answerable_from_selected_context", reason: "service_inquiry" }
    }
    if (chip.kind === "video" && hasToken(m, "como", "faz", "funciona", "mostra")) {
      return { class: "answerable_from_selected_context", reason: "video_how" }
    }
    if (chip.kind === "video" && hasToken(m, "tecnica", "técnica")) {
      return { class: "answerable_from_selected_context", reason: "video_technique" }
    }
    if (
      chip.kind === "video" &&
      hasToken(m, "desse conteudo", "desse conteúdo", "esse conteudo", "esse conteúdo", "sobre o conteudo", "sobre o conteúdo", "do video", "do vídeo")
    ) {
      return { class: "answerable_from_selected_context", reason: "video_content_anchor" }
    }
    if (chip.kind === "product" || chip.kind === "menu_item") {
      return { class: "answerable_from_selected_context", reason: "catalog_item_question" }
    }
  }

  if (!chip && isPricingQuestion(message)) {
    return { class: "needs_clarification", reason: "price_without_chip" }
  }

  if (!chip && isDirectQuestion(message) && hasToken(m, "aberto", "horario", "horário", "fecham", "estacionamento", "chego")) {
    return { class: "answerable_from_operational_context", reason: "operational_no_chip" }
  }

  if (
    chip &&
    hasToken(m, "pix", "pagamento", "cartao", "cartão", "debito", "débito") &&
    !shouldIntentBeatChip(message, session, pack)
  ) {
    return { class: "needs_clarification", reason: "defer_to_legacy" }
  }

  if (
    chip?.kind === "video" &&
    hasToken(m, "careca", "carecas", "calvo", "calvos", "calvicie", "cacheado", "crespo", "mulher", "mulheres", "feminino") &&
    (session.lastTopic === "video_content" || messageReferencesChip(message, chip))
  ) {
    return { class: "answerable_from_selected_context", reason: "video_audience_followup" }
  }

  return { class: "needs_clarification", reason: "defer_to_legacy" }
}

function baseAnswer(
  partial: Partial<KernelResponse> & Pick<KernelResponse, "reply" | "intent" | "topic">,
  answerability: AnswerabilityClass
): KernelResponse {
  return {
    domainZone: "in_domain",
    topicShift: false,
    structure: { acknowledged: true, answered: true },
    confidence: "high",
    action: { type: "text_only" },
    source: "rule_table",
    grounding: { source: "none", itemIds: [], confidence: "medium" },
    answerability,
    ...partial,
  }
}

function groundingFromItem(item: SelectedContextItem, confidence: "high" | "medium" | "low"): KernelResponse["grounding"] {
  return { source: "selected_context", itemIds: [item.id], confidence }
}

function videoFocusesOnMasculineTrends(item: SelectedContextItem): boolean {
  const blob = normalize(`${item.title} ${item.summary ?? ""} ${item.knownFacts.join(" ")}`)
  return /masculino|homem|homens/.test(blob)
}

function replyVideoTrendsInquiry(
  message: string,
  item: SelectedContextItem,
  pack: ModelContextPack
): KernelResponse | null {
  const m = normalize(message)

  if (
    hasToken(m, "sobre o que estamos", "estamos falando", "do que estamos", "sobre o que", "falando disso")
  ) {
    const tema =
      item.knownFacts.find((f) => f.startsWith("tema:"))?.replace(/^tema:\s*/i, "").trim() ??
      item.summary ??
      "conteúdo do feed"
    return baseAnswer(
      {
        reply: `Estamos no vídeo "${item.title}" — ${tema}. Diga se quer falar do estilo do clipe, de outro público (ex.: feminino) ou de agendar na ${pack.brandName}.`,
        intent: "context_grounded",
        topic: "video_thread_recap",
        source: "selected_context",
        grounding: groundingFromItem(item, "high"),
      },
      "answerable_from_selected_context"
    )
  }

  if (item.kind === "video" && hasToken(m, "fade") && hasToken(m, "mulher", "mulheres", "feminino")) {
    return baseAnswer(
      {
        reply: `O vídeo "${item.title}" ensina fade em corte masculino — o passo a passo do clipe não é o mesmo para mulheres. Para feminino, veja outros posts no feed ou combine com o barbeiro em Agendar.`,
        intent: "context_grounded",
        topic: "video_fade_gender",
        source: "selected_context",
        grounding: groundingFromItem(item, "medium"),
      },
      "answerable_from_selected_context"
    )
  }

  if (hasToken(m, "mulher", "mulheres", "feminino") && videoFocusesOnMasculineTrends(item)) {
    return baseAnswer(
      {
        reply: `O "${item.title}" traz tendências de corte masculino — o clipe não cobre tendências femininas. Para mulheres, veja outros posts no feed ou agende e peça ao barbeiro o estilo que você quer.`,
        intent: "context_grounded",
        topic: "video_trends_gender_gap",
        source: "selected_context",
        grounding: groundingFromItem(item, "medium"),
      },
      "answerable_from_selected_context"
    )
  }

  if (
    hasToken(m, "careca", "carecas", "calvo", "calvos", "calvicie") &&
    videoFocusesOnMasculineTrends(item)
  ) {
    return baseAnswer(
      {
        reply: `O "${item.title}" fala de tendências de corte masculino com cabelo — não cobre estilos ou tendências para carecas/calvos. Para calvos, veja outros posts no feed ou agende e alinhe o visual com o barbeiro.`,
        intent: "context_grounded",
        topic: "video_trends_bald_gap",
        source: "selected_context",
        grounding: groundingFromItem(item, "medium"),
      },
      "answerable_from_selected_context"
    )
  }

  if (hasToken(m, "tendencia", "tendência", "homens", "homem", "comente", "card")) {
    const desc = item.summary ? ` — ${item.summary}` : ""
    return baseAnswer(
      {
        reply: `No "${item.title}" a linha é tendência de corte masculino${desc}. Se sua dúvida é outro público ou estilo, diga qual.`,
        intent: "context_grounded",
        topic: "video_trends_scope",
        source: "selected_context",
        grounding: groundingFromItem(item, "medium"),
      },
      "answerable_from_selected_context"
    )
  }

  return null
}

function replySocialPost(item: SelectedContextItem, pack: ModelContextPack): KernelResponse {
  const body = item.summary && item.summary !== item.title ? item.summary : item.title
  return baseAnswer(
    {
      reply: `"${item.title}" é um post da ${pack.brandName}: ${body}. Quer saber horário, preço ou agendar?`,
      intent: "context_grounded",
      topic: "social_post",
      source: "selected_context",
      grounding: groundingFromItem(item, "high"),
    },
    "answerable_from_selected_context"
  )
}

/** Single source for chip-grounded replies (classifier, stub, adapter fallback). */
export function resolveChipTurn(
  message: string,
  pack: ModelContextPack,
  item: SelectedContextItem
): KernelResponse {
  return replyFromSelectedContext(message, pack, item)
}

export function replyFromSelectedContext(message: string, pack: ModelContextPack, item: SelectedContextItem): KernelResponse {
  const m = normalize(message)

  if (isSocialFeedChip(item)) {
    return replySocialPost(item, pack)
  }

  if (isBeforeAfterChip(item) || hasToken(m, "antes e depois", "antes/depois", "como faz", "transformacao", "transformação")) {
    const desc = item.summary ? ` — ${item.summary}` : ""
    return baseAnswer(
      {
        reply: `O "${item.title}" é um antes e depois do visual na cadeira${desc}. Mostra o resultado do serviço em clipe curto; para algo parecido, escolha serviço e barbeiro no bloco Agendar.`,
        intent: "context_grounded",
        topic: "before_after",
        source: "selected_context",
        grounding: groundingFromItem(item, "high"),
      },
      "answerable_from_selected_context"
    )
  }

  const entity = pack.catalog.entities.find(
    (e) =>
      item.relatedEntityIds?.includes(e.id) ||
      normalize(e.name) === normalize(item.title)
  )

  if (item.kind === "service" && entity) {
    const duration = entity.attributes?.duration
    const price = entity.attributes?.price
    const desc = entity.attributes?.description ?? "serviço da casa"
    if (isPricingQuestion(message)) {
      return baseAnswer(
        {
          reply: `O ${item.title} está por volta de R$ ${price ?? "—"} no catálogo (${duration ?? 30} min). Confirma no balcão se precisar de detalhe extra.`,
          intent: "context_grounded",
          topic: "service_price",
          source: "selected_context",
          grounding: groundingFromItem(item, "high"),
        },
        "answerable_from_catalog"
      )
    }
    return baseAnswer(
      {
        reply: `O ${item.title} leva cerca de ${duration ?? 30} min — ${desc}. Veja barbeiros e horários em Agendar no feed.`,
        intent: "context_grounded",
        topic: "service_detail",
        source: "selected_context",
        grounding: groundingFromItem(item, "high"),
      },
      "answerable_from_selected_context"
    )
  }

  if ((item.kind === "product" || item.kind === "menu_item") && isDirectQuestion(message)) {
    return baseAnswer(
      {
        reply: `Sobre "${item.title}": ${item.knownFacts.join("; ") || "é um item do catálogo desta página"}. Se quiser preço ou disponibilidade, veja o card no feed ou pergunte de forma específica.`,
        intent: "context_grounded",
        topic: "catalog_item",
        source: "selected_context",
        grounding: groundingFromItem(item, "medium"),
      },
      "answerable_from_selected_context"
    )
  }

  if (item.kind === "video" && hasToken(m, "o que e", "o que é", "oque é") && hasToken(m, "fade", "tutorial")) {
    return baseAnswer(
      {
        reply: `O vídeo "${item.title}" mostra a técnica de fade — o resultado depende do seu cabelo e rosto. O melhor é ver com um barbeiro no feed e marcar um horário para avaliar ao vivo.`,
        intent: "context_grounded",
        topic: "video_fade_fit",
        source: "selected_context",
        grounding: groundingFromItem(item, "medium"),
      },
      "answerable_from_selected_context"
    )
  }

  if (item.kind === "video" && hasToken(m, "como", "faz", "funciona", "mostra")) {
    return baseAnswer(
      {
        reply: `No "${item.title}" o foco é o passo a passo no vídeo do feed${item.summary ? ` (${item.summary})` : ""}. Para reproduzir na prática, marque com um profissional da casa em Agendar.`,
        intent: "context_grounded",
        topic: "video_how",
        source: "selected_context",
        grounding: groundingFromItem(item, "high"),
      },
      "answerable_from_selected_context"
    )
  }

  if (item.kind === "video" && hasToken(m, "tecnica", "técnica")) {
    const detail =
      item.summary ??
      item.knownFacts.find((f) => f.startsWith("tema:"))?.replace(/^tema:\s*/i, "").trim() ??
      "fade degradê com máquina e tesoura"
    return baseAnswer(
      {
        reply: `No "${item.title}" a técnica é ${detail}. Em resumo: alturas na máquina, transição suave e acabamento na tesoura no topo.`,
        intent: "context_grounded",
        topic: "video_technique",
        source: "selected_context",
        grounding: groundingFromItem(item, "high"),
      },
      "answerable_from_selected_context"
    )
  }

  if (
    item.kind === "video" &&
    hasToken(
      m,
      "desse conteudo",
      "desse conteúdo",
      "esse conteudo",
      "esse conteúdo",
      "sobre o conteudo",
      "sobre o conteúdo",
      "do video",
      "do vídeo",
      "desse video",
      "desse vídeo"
    )
  ) {
    const detail = item.summary ?? "tutorial de fade no feed da casa"
    return baseAnswer(
      {
        reply: `Isso, do vídeo "${item.title}": ${detail}. Quer saber se combina com você ou já marcar com um barbeiro para fazer ao vivo?`,
        intent: "context_grounded",
        topic: "video_content_anchor",
        source: "selected_context",
        grounding: groundingFromItem(item, "high"),
      },
      "answerable_from_selected_context"
    )
  }

  if (item.kind === "video") {
    const videoTrends = replyVideoTrendsInquiry(message, item, pack)
    if (videoTrends) return videoTrends
  }

  return baseAnswer(
    {
      reply: `Sobre "${item.title}": ${item.summary ?? (item.knownFacts.join("; ") || "conteúdo do feed da casa")}.`,
      intent: "context_grounded",
      topic: "chip_direct",
      source: "selected_context",
      grounding: groundingFromItem(item, "medium"),
    },
    "answerable_from_selected_context"
  )
}

export function replyFromOperational(message: string, pack: ModelContextPack): KernelResponse | null {
  const place = pack.operational?.placeHint ?? "na Augusta"
  const address = pack.operational?.addressLine ?? pack.brandName
  const m = normalize(message)

  if (
    hasToken(m, "unidade", "esta unidade", "essa unidade") &&
    !hasToken(m, "curitiba", "outra cidade", "outro estado", "filial em")
  ) {
    return baseAnswer(
      {
        reply: `A ${pack.brandName} desta página fica ${place} (${address}). Para agendar aqui, use o mapa no topo ou os serviços no feed.`,
        intent: "practical_question",
        topic: "branch_this_unit",
        domainZone: "in_domain",
        grounding: { source: "operational", itemIds: [], confidence: "high" },
      },
      "answerable_from_operational_context"
    )
  }

  if (isLocationBranchQuestion(message)) {
    const cityMatch = m.match(/\b(em|na)\s+([a-z]+)\b/)
    const city = cityMatch?.[2] && !["augusta", "casa", "feed", "pagina", "página"].includes(cityMatch[2])
      ? cityMatch[2]
      : hasToken(m, "curitiba")
        ? "Curitiba"
        : "essa cidade"

    return baseAnswer(
      {
        reply: `A ${pack.brandName} desta página fica ${place} (${address}). Não temos unidade em ${city} cadastrada no piloto — para agendar aqui, use o mapa no topo ou os serviços no feed.`,
        intent: "practical_question",
        topic: "branch_city",
        domainZone: "in_domain_unknown",
        grounding: { source: "operational", itemIds: [], confidence: "high" },
      },
      "answerable_from_operational_context"
    )
  }

  if (hasToken(m, "estacionamento", "estacionar", "vaga no estacionamento")) {
    const hint = pack.operational?.parkingHint ?? "Estacionamento conveniado na rua ao lado."
    return baseAnswer(
      {
        reply: `${hint} Se precisar de referência, o endereço fica no mapa da página.`,
        intent: "operational",
        topic: "parking",
        grounding: { source: "operational", itemIds: [], confidence: "high" },
      },
      "answerable_from_operational_context"
    )
  }

  if (hasToken(m, "abertos", "aberto agora")) {
    const live = pack.operational?.liveState ?? "Aberto agora"
    const hours = pack.operational?.openingHours ?? ""
    return baseAnswer(
      {
        reply: `${live}${hours ? ` — ${hours}` : ""}.`,
        intent: "operational",
        topic: "hours_now",
        grounding: { source: "operational", itemIds: [], confidence: "high" },
      },
      "answerable_from_operational_context"
    )
  }

  if (isOperationalHoursQuestion(message)) {
    const hours = pack.operational?.openingHours ?? pack.operational?.hoursHint ?? "Seg-Sab: 9h-20h"
    const holiday = hasToken(m, "feriado", "feriados", "natal", "ano novo")
    const reply = holiday
      ? `Em dias normais seguimos ${hours}. Em feriados o horário pode ser diferente — não tenho calendário de feriados fechado aqui; confirma no WhatsApp ou no balcão da ${pack.brandName} antes de vir.`
      : `Funcionamos em geral ${hours}. Para um dia específico ou feriado, confirma no balcão ou no WhatsApp da casa.`
    return baseAnswer(
      {
        reply,
        intent: "operational",
        topic: "hours_holidays",
        grounding: { source: "operational", itemIds: [], confidence: "high" },
      },
      "answerable_from_operational_context"
    )
  }

  return null
}

function replyCapacityGap(pack: ModelContextPack, chip?: SelectedContextItem): KernelResponse {
  const t = chip ? normalize(chip.title + " " + (chip.summary ?? "")) : ""
  const lounge = /lounge|renovado|espaco|espaço/.test(t)
  const reply = chip
    ? `Sobre o espaço do post "${chip.title}": não tenho lotação ou capacidade máxima cadastrada aqui${lounge ? " do lounge" : ""}. Para visitar ou levar um grupo, confirma no balcão ou no WhatsApp da ${pack.brandName}.`
    : `Não tenho lotação do salão cadastrada no perfil — confirma no balcão ou no WhatsApp da ${pack.brandName}.`

  return baseAnswer(
    {
      reply,
      intent: "practical_question",
      topic: "capacity_gap",
      domainZone: "in_domain_unknown",
      source: chip ? "selected_context" : "rule_table",
      grounding: chip ? groundingFromItem(chip, "medium") : { source: "data_gap", itemIds: [], confidence: "high" },
    },
    "answerable_with_honest_gap"
  )
}

export function replyHonestGap(message: string, pack: ModelContextPack, item?: SelectedContextItem): KernelResponse {
  const chip = item ?? pack.selectedContextItems[0]
  const ack = chip ? `Sobre "${chip.title}" no feed: ` : ""
  const catalogHint = buildCatalogPriceHint(pack, message)

  if (isCapacityOrFacilityQuestion(message)) {
    const r = replyCapacityGap(pack, chip)
    return pack.selectedContextItems.length > 0 ? { ...r, topicShift: true } : r
  }

  if (isPricingQuestion(message)) {
    const chipNote = chip
      ? isSocialFeedChip(chip) || chip.kind === "video" || chip.kind === "news" || chip.kind === "review"
        ? "Esse item do feed não traz preço — é publicação ou conteúdo editorial. "
        : "Esse item não traz preço no catálogo. "
      : ""
    const hint = catalogHint ? ` ${catalogHint}` : " Toque em um serviço em Agendar ou confirme no balcão."
    return baseAnswer(
      {
        reply: `${ack}${chipNote}${hint}`.trim(),
        intent: "practical_question",
        topic: "price_not_on_chip",
        domainZone: "in_domain_unknown",
        source: chip ? "selected_context" : "rule_table",
        grounding: chip
          ? groundingFromItem(chip, "medium")
          : catalogHint
            ? { source: "catalog", itemIds: [], confidence: "medium" }
            : { source: "data_gap", itemIds: [], confidence: "high" },
      },
      "answerable_with_honest_gap"
    )
  }

  const gap = pack.dataGaps.find((g) => g.topic === "payment")
  const steer = catalogHint ? ` ${catalogHint}` : ""
  return baseAnswer(
    {
      reply: `${ack}${gap?.honestReply ?? "Não tenho esse dado no perfil público — confirma no balcão."}${steer}`.trim(),
      intent: "practical_question",
      topic: "data_gap",
      domainZone: "in_domain_unknown",
      grounding: { source: "data_gap", itemIds: chip ? [chip.id] : [], confidence: "high" },
    },
    "answerable_with_honest_gap"
  )
}

export function replyNeedsClarification(message: string, pack: ModelContextPack): KernelResponse {
  const catalogHint = isPricingQuestion(message) ? buildCatalogPriceHint(pack, message) : null
  const steer = catalogHint
    ? ` ${catalogHint}`
    : " Escolha um serviço ou produto no feed (Agendar ou card do item)."
  return baseAnswer(
    {
      reply: `Para te passar o valor certo,${steer}`,
      intent: "discover",
      topic: "clarify_target",
      structure: { acknowledged: true, answered: false, followUpQuestion: "Qual serviço ou item do feed?" },
      confidence: "medium",
    },
    "needs_clarification"
  )
}

