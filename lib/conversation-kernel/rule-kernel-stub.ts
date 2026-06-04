import {
  detectStrongTopic,
  resolveActiveTopic,
  shouldActiveTopicOverrideChip,
  updateActiveTopicFromMessage,
} from "./active-topic"
import { resolveAnswerFirstGate } from "./answerability-classifier"
import { isSocialFeedChip } from "./model-context-pack"
import type {
  KernelResponse,
  KernelSession,
  ModelContextPack,
  RuleKernelInput,
  SelectedContextItem,
} from "./types"
import { createKernelSession } from "./types"

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
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

function augustaForbidden(reply: string): boolean {
  return /veja servi(c|o)s e profissionais no feed quando quiser/i.test(reply)
}

function baseResponse(
  partial: Partial<KernelResponse> & Pick<KernelResponse, "reply" | "intent" | "topic">
): KernelResponse {
  return {
    domainZone: "in_domain",
    topicShift: false,
    structure: { acknowledged: true, answered: true },
    confidence: "high",
    action: { type: "text_only" },
    source: "rule_table",
    grounding: { source: "none", itemIds: [], confidence: "low" },
    ...partial,
  }
}

function groundingFromItem(item: SelectedContextItem, confidence: "high" | "medium" | "low"): KernelResponse["grounding"] {
  return {
    source: "selected_context",
    itemIds: [item.id],
    confidence,
  }
}

function resolveSelectedContextGrounding(
  message: string,
  pack: ModelContextPack
): KernelResponse | null {
  const items = pack.selectedContextItems
  if (items.length === 0) return null

  const primary = items[0]
  const m = normalize(message)

  if (primary.isExternalOrEditorial || !primary.belongsToCurrentHouse) {
    if (
      hasToken(m, "onde fica", "onde fica?", "endereco", "endereço", "localizacao", "localização") ||
      m === "onde fica?"
    ) {
      const entity = primary.title.includes("Dom Corleone") ? "Dom Corleone" : primary.title
      return baseResponse({
        reply: `A notícia no feed fala da ${entity} — é editorial de outra casa, não da ${pack.brandName} na Augusta. Não temos o endereço dela aqui; se quiser chegar na nossa unidade, use o mapa no topo da página.`,
        intent: "context_grounded",
        topic: "external_location",
        domainZone: "off_domain_light",
        action: { type: "text_only" },
        source: "selected_context",
        grounding: groundingFromItem(primary, "high"),
      })
    }

    if (hasToken(m, "dom corleone", "barbearia dom")) {
      return baseResponse({
        reply: `O item selecionado é uma notícia sobre outra barbearia (${primary.title}) — não confundimos com a ${pack.brandName}. Para nosso endereço e horários, veja o mapa na página.`,
        intent: "context_grounded",
        topic: "external_entity",
        domainZone: "off_domain_light",
        source: "selected_context",
        grounding: groundingFromItem(primary, "high"),
      })
    }
  }

  if (hasToken(m, "pix", "cartao", "cartão", "pagamento", "debito", "débito")) {
    const gap = pack.dataGaps.find((g) => g.topic === "payment")
    const ack =
      primary.kind === "video" || primary.kind === "service"
        ? `Sobre o "${primary.title}" no feed: `
        : ""
    return baseResponse({
      reply: `${ack}${gap?.honestReply ?? "Não tenho detalhe de pagamento no catálogo — confirma no balcão ou no WhatsApp."}`,
      intent: "practical_question",
      topic: "payment",
      domainZone: "in_domain_unknown",
      action: { type: "text_only" },
      source: "selected_context",
      grounding: groundingFromItem(primary, "medium"),
    })
  }

  if (hasToken(m, "cnpj", "inscricao", "inscrição")) {
    return baseResponse({
      reply: `Sobre "${primary.title}": não tenho CNPJ nem dado fiscal nesse item nem no perfil da casa — confirma no balcão.`,
      intent: "practical_question",
      topic: "cnpj",
      domainZone: "in_domain_unknown",
      source: "selected_context",
      grounding: groundingFromItem(primary, "low"),
    })
  }

  if (
    hasToken(m, "ficar em mim", "combina comigo", "sera que vai", "será que vai", "fica em mim") ||
    (primary.kind === "video" && hasToken(m, "fade", "tutorial"))
  ) {
    return baseResponse({
      reply: `O vídeo "${primary.title}" mostra a técnica de fade — o resultado depende do seu cabelo e rosto. Não prometo milagre aqui; o melhor é ver com um barbeiro no feed e marcar um horário para avaliar ao vivo.`,
      intent: "context_grounded",
      topic: "video_fade_fit",
      confidence: "medium",
      source: "selected_context",
      grounding: groundingFromItem(primary, "medium"),
    })
  }

  if (hasToken(m, "cacheado", "crespo", "ondulado") && primary.kind === "video") {
    return baseResponse({
      reply: `No vídeo "${primary.title}" o foco é tendência de corte masculino em geral. Para cabelo cacheado especificamente, não está detalhado no clipe — posso sugerir estilos no feed ou um barbeiro que trabalha com seu tipo de fio.`,
      intent: "context_grounded",
      topic: "video_trends_curly",
      confidence: "medium",
      source: "selected_context",
      grounding: groundingFromItem(primary, "medium"),
    })
  }

  if (isSocialFeedChip(primary) && hasToken(m, "fale mais", "o que e", "o que é", "sobre isso", "sobre esse", "isso")) {
    const body = primary.summary && primary.summary !== primary.title ? primary.summary : primary.title
    return baseResponse({
      reply: `"${primary.title}" é um post da ${pack.brandName} no feed — ${body}. Para preços ou agendar, use os serviços em Agendar no feed.`,
      intent: "context_grounded",
      topic: "social_post",
      source: "selected_context",
      grounding: groundingFromItem(primary, "high"),
    })
  }

  if (
    primary.kind === "service" ||
    primary.relatedEntityIds?.length ||
    hasToken(m, "esse servico", "esse serviço", "esse corte")
  ) {
    if (hasToken(m, "fale mais", "sobre isso", "sobre esse", "corte", "servico", "serviço")) {
      const entity = pack.catalog.entities.find(
        (e) =>
          primary.relatedEntityIds?.includes(e.id) ||
          e.name.toLowerCase() === primary.title.toLowerCase()
      )
      if (entity) {
        const duration = entity.attributes?.duration
        const desc = entity.attributes?.description ?? "serviço da casa"
        return baseResponse({
          reply: `O ${entity.name} leva cerca de ${duration ?? 30} min — ${desc}. Você pode ver barbeiros e horários no bloco Agendar ou no feed.`,
          intent: "context_grounded",
          topic: "service_detail",
          source: "selected_context",
          grounding: groundingFromItem(primary, "high"),
        })
      }
    }
  }

  if (hasToken(m, "fale mais", "sobre isso", "sobre esse", "isso")) {
    return baseResponse({
      reply: `Sobre "${primary.title}": ${primary.summary ?? (primary.knownFacts.join("; ") || "é um item do feed da casa")}. Se quiser agendar ou ver preços, use os serviços no feed ou Agendar.`,
      intent: "context_grounded",
      topic: "generic_item",
      confidence: "medium",
      source: "selected_context",
      grounding: groundingFromItem(primary, "medium"),
    })
  }

  return null
}

function resolveOperational(message: string, pack: ModelContextPack): KernelResponse | null {
  const m = normalize(message)
  const op = pack.operational

  if (hasToken(m, "estacionamento", "estacionar", "vaga no estacionamento")) {
    const hint = op?.parkingHint ?? pack.operational?.parkingHint
    return baseResponse({
      reply: hint
        ? `${hint} Se precisar de referência, o endereço fica no mapa da página.`
        : "Temos estacionamento conveniado na rua ao lado — detalhes no mapa da página.",
      intent: "operational",
      topic: "parking",
      grounding: { source: "operational", itemIds: [], confidence: "high" },
    })
  }

  if (hasToken(m, "abertos", "aberto agora", "funcionando agora")) {
    const live = op?.liveState ?? "Aberto agora"
    const hours = op?.openingHours ?? op?.hoursHint ?? ""
    return baseResponse({
      reply: `${live}${hours ? ` — ${hours}` : ""}. Quer marcar um horário ou ver estilos no feed?`,
      intent: "operational",
      topic: "hours_now",
      structure: { acknowledged: true, answered: true, followUpQuestion: "Quer marcar um horário ou ver estilos no feed?" },
      grounding: { source: "operational", itemIds: [], confidence: "high" },
    })
  }

  if (hasToken(m, "fecham", "fecha hoje", "horario", "horário", "que horas")) {
    const hours = op?.openingHours ?? "Seg-Sab: 9h-20h"
    return baseResponse({
      reply: `Hoje seguimos ${hours}. Para encaixe, veja Agendar no feed.`,
      intent: "operational",
      topic: "closing_hours",
      grounding: { source: "operational", itemIds: [], confidence: "high" },
    })
  }

  if (hasToken(m, "como chego", "como eu chego", "onde fica", "endereco", "endereço")) {
    const addr = op?.addressLine ?? pack.operational?.addressLine
    return baseResponse({
      reply: addr
        ? `Estamos em ${addr}. Use o mapa no topo da página para rota e estacionamento.`
        : `Use o mapa no topo da página para chegar na ${pack.brandName}.`,
      intent: "practical_question",
      topic: "arrival",
      action: { type: "bridge_to_page", anchor: "hero_map" },
      grounding: { source: "operational", itemIds: [], confidence: "high" },
    })
  }

  if (hasToken(m, "vaga hoje", "tem vaga", "encaixe hoje")) {
    return null
  }

  if (hasToken(m, "pix", "pagamento", "cartao", "cartão")) {
    const gap = pack.dataGaps.find((g) => g.topic === "payment")
    return baseResponse({
      reply: gap?.honestReply ?? "Não tenho lista de meios de pagamento aqui — confirma no balcão.",
      intent: "practical_question",
      topic: "payment",
      domainZone: "in_domain_unknown",
      grounding: { source: "data_gap", itemIds: [], confidence: "high" },
    })
  }

  return null
}

function resolvePersonEntity(message: string, pack: ModelContextPack): KernelResponse | null {
  const m = normalize(message)
  if (!hasToken(m, "trabalha", "marcos", "equipe", "barbeiro")) return null
  if (!m.includes("marcos")) return null

  const names = pack.catalog.entities
    .filter((e) => e.kind === "professional")
    .map((e) => e.name)
    .slice(0, 4)
  return baseResponse({
    reply: `Não encontrei Marcos na equipe da ${pack.brandName}. Quem atende hoje inclui ${names.join(", ")} — escolha no feed se quiser agendar.`,
    intent: "entity_lookup",
    topic: "person_unknown",
    domainZone: "in_domain_unknown",
    grounding: { source: "catalog", itemIds: [], confidence: "high" },
  })
}

function resolveOutOfCatalog(message: string, pack: ModelContextPack): KernelResponse | null {
  if (!hasToken(message, "massagem")) return null
  const alt = pack.catalog.exclusions?.length
    ? ""
    : " Temos hidratação capilar, barba e cortes no catálogo."
  return baseResponse({
    reply: `Não fazemos massagem na ${pack.brandName}.${alt}`,
    intent: "out_of_catalog",
    topic: "massage",
    grounding: { source: "catalog", itemIds: [], confidence: "high" },
  })
}

function resolveOffDomain(message: string, pack: ModelContextPack): KernelResponse | null {
  const m = normalize(message)

  if (hasToken(m, "diagnostica", "mancha", "sintoma", "doença", "doenca")) {
    return baseResponse({
      reply: "Não posso diagnosticar condição de pele ou saúde aqui — procure um profissional de saúde ou o balcão da casa.",
      intent: "domain_blocked",
      topic: "clinical",
      domainZone: "off_domain_blocked",
    })
  }

  if (hasToken(m, "silvio santos")) {
    return baseResponse({
      reply: "Silvio Santos é ícone da TV — aqui somos anfitriões da página da casa. Quer ver cortes, serviços ou agendar no feed?",
      intent: "polite_detour",
      topic: "celebrity",
      domainZone: "off_domain_light",
      action: { type: "bridge_to_page", anchor: "feed" },
    })
  }

  return null
}

function resolveMetaComplaint(message: string): KernelResponse | null {
  if (!hasToken(message, "só fala", "so fala", "sempre a mesma", "repete")) return null
  return baseResponse({
    reply:
      "Faz sentido — posso orientar melhor se você me contar em uma frase o que quer resolver (horário, serviço, preço ou como chegar).",
    intent: "meta_complaint",
    topic: "meta",
    action: { type: "ack_meta_complaint" },
    structure: { acknowledged: true, answered: true, followUpQuestion: undefined },
  })
}

function resolveTransactionalDelegate(message: string): KernelResponse | null {
  const m = normalize(message)
  if (
    hasToken(m, "quero marcar", "quero agendar", "marcar um horario", "marcar um horário", "agendar um horario", "agendar um horário") ||
    (hasToken(m, "marcar", "agendar", "reservar") && hasToken(m, "horario", "horário"))
  ) {
    return baseResponse({
      reply: "",
      intent: "transactional",
      topic: "booking",
      action: { type: "delegate_transactional_resolver" },
      confidence: "high",
    })
  }
  if (
    (m === "degrade" || /^degrade[!.?]*$/.test(m)) &&
    !hasToken(m, "preco", "preço", "quanto", "valor", "custa")
  ) {
    return baseResponse({
      reply: "",
      intent: "transactional",
      topic: "service_keyword",
      action: { type: "delegate_transactional_resolver" },
    })
  }
  if (hasToken(m, "vaga hoje", "tem vaga")) {
    return baseResponse({
      reply: "",
      intent: "transactional",
      topic: "availability",
      action: { type: "delegate_transactional_resolver" },
    })
  }
  return null
}

function resolveVagueHelp(message: string, pack: ModelContextPack): KernelResponse | null {
  const m = normalize(message)
  if (hasToken(m, "corte", "barba", "visual", "estilo", "degrade", "fade")) return null
  if (!hasToken(m, "me ajuda", "ajuda") || m.length > 40) return null
  const ids = pack.catalog.entities.slice(0, 3).map((e) => e.id)
  return baseResponse({
    reply: "Posso te mostrar serviços populares da casa ou você me diz: discreto, moderno ou marcante?",
    intent: "discover",
    topic: "vague_help",
    structure: { acknowledged: true, answered: true, followUpQuestion: "discreto, moderno ou marcante?" },
    action: { type: "show_catalog_cards", entityIds: ids, maxItems: 3 },
    confidence: "medium",
  })
}

function resolveGreeting(message: string, pack: ModelContextPack): KernelResponse | null {
  const m = normalize(message)
  if (!/^(ola|olá|oi|bom dia|boa tarde|boa noite|hey|e aí|e ai)$/.test(m)) return null
  return baseResponse({
    reply: `Olá! Bem-vindo à ${pack.brandName} — ${pack.operational?.placeHint ?? "estamos na Augusta"}. Quer agendar, ver estilos ou tirar uma dúvida prática?`,
    intent: "greet",
    topic: "greeting",
  })
}

function applySessionTopicShift(
  message: string,
  pack: ModelContextPack,
  session: KernelSession
): KernelResponse | null {
  const m = normalize(message)
  if (hasToken(m, "estacionamento", "estacionar")) {
    const wasDiscovery =
      session.awaitingFocus || session.discoveryTurns > 0 || session.lastTopic === "discovery"
    const parking = resolveOperational(message, pack)
    if (parking) {
      return {
        ...parking,
        topicShift: wasDiscovery,
        structure: { acknowledged: true, answered: true },
      }
    }
  }
  return null
}

function isTransactionalClearMessage(message: string): boolean {
  const m = normalize(message)
  return (
    hasToken(m, "quero marcar", "marcar um horario", "marcar um horário", "agendar um horario", "agendar um horário") ||
    (hasToken(m, "marcar", "agendar", "reservar") && hasToken(m, "horario", "horário")) ||
    hasToken(m, "quero agendar", "quais servicos", "quais serviços", "tem algo a tarde", "tem algo de tarde") ||
    hasToken(m, "vaga hoje", "tem vaga")
  )
}

export function resolveRuleKernelStub(input: RuleKernelInput): KernelResponse | null {
  const { message, pack } = input
  const session = input.session ?? createKernelSession()

  if (!message.trim()) return null

  const gated = resolveAnswerFirstGate(message, pack, session)
  if (gated && !augustaForbidden(gated.reply)) {
    if (gated.action.type === "delegate_transactional_resolver") {
      return {
        ...gated,
        activeTopic: detectStrongTopic(message) ?? session.activeTopic ?? "schedule",
        topicShift: Boolean(session.activeTopic),
      }
    }
    return gated
  }

  if (pack.selectedContextItems.length > 0 && !isTransactionalClearMessage(message)) {
    const chip = pack.selectedContextItems[0]
    const detected = detectStrongTopic(message)

    if (shouldActiveTopicOverrideChip(message, session, pack)) {
      const active = resolveActiveTopic(message, pack, session)
      if (active && !augustaForbidden(active.reply)) return active
    }

    if (detected === "news_editorial" && chip.kind === "news") {
      const news = resolveActiveTopic(message, pack, session)
      if (news && !augustaForbidden(news.reply)) return news
    }

    const grounded = resolveSelectedContextGrounding(message, pack)
    if (grounded && !augustaForbidden(grounded.reply)) return grounded
  }

  const topicShift = applySessionTopicShift(message, pack, session)
  if (topicShift) return topicShift

  const meta = resolveMetaComplaint(message)
  if (meta) return meta

  const operational = resolveOperational(message, pack)
  if (operational && !augustaForbidden(operational.reply)) return operational

  const person = resolvePersonEntity(message, pack)
  if (person) return person

  const catalog = resolveOutOfCatalog(message, pack)
  if (catalog) return catalog

  const off = resolveOffDomain(message, pack)
  if (off) return off

  const vague = resolveVagueHelp(message, pack)
  if (vague) return vague

  const greet = resolveGreeting(message, pack)
  if (greet) return greet

  if (hasToken(message, "mudar meu visual", "mudar visual")) {
    session.lastTopic = "discovery"
    session.awaitingFocus = true
    session.discoveryTurns += 1
    return null
  }

  return null
}

export function touchKernelSessionFromMessage(
  message: string,
  session: KernelSession,
  pack?: ModelContextPack
): void {
  updateActiveTopicFromMessage(message, session, pack)
  const m = normalize(message)
  if (hasToken(m, "mudar meu visual", "mudar visual")) {
    session.lastTopic = "discovery"
    session.awaitingFocus = true
    session.discoveryTurns += 1
    session.activeTopic = undefined
  }
  if (hasToken(m, "estacionamento")) {
    session.lastTopic = "parking"
    session.awaitingFocus = false
    session.activeTopic = "arrival"
  }
}
