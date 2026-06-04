import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildAppointmentModelContextPack } from "@/lib/conversation-kernel/appointment/build-appointment-model-context-pack"
import { isKernelResponseValid } from "@/lib/conversation-kernel/types"
import {
  resolveRuleKernelStub,
  touchKernelSessionFromMessage,
} from "@/lib/conversation-kernel/rule-kernel-stub"
import type { KernelResponse, ModelContextPack, SelectedContextItem } from "@/lib/conversation-kernel/types"
import { createKernelSession } from "@/lib/conversation-kernel/types"
import type { EstablishmentDialogueContext } from "@/lib/mock-data/appointment-establishment-dialogue-context"
import { barberShopArrivalContext, barberShopConfig, barberShopHeroOperationalContext } from "@/lib/mock-data/appointment-data"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const MATRIX_PATH = path.join(ROOT, "docs/audit/ws19a-conversation-kernel-eval-matrix.json")

const PHASE1_IDS = new Set([
  "E-G00",
  "E-G01",
  "E-G02",
  "E-G03",
  "E-G04",
  "E-G05",
  "E-G06",
  "E-G07",
  "E-G08",
  "E-G09",
  "E-G10",
  "E-G18",
  "E-G19",
  "E-G20",
  "E-G21",
  "E-G22",
  "E-M-APT-15",
  "E-M-APT-16",
  "E-M-APT-17",
  "E-M-APT-18",
  "E-X11",
  "E-X12",
  "E-G23",
  "E-G24",
  "E-G25",
  "E-G26",
  "E-G27",
  "E-G28",
  "E-G29",
  "E-G30",
  "E-G31",
  "E-G32",
  "E-G33",
  "E-G34",
  "E-G35",
  "E-G36",
  "E-G37",
  "E-G38",
  "E-X17",
])

const AUGUSTA_FORBIDDEN = /veja servi(c|o)s e profissionais no feed quando quiser/i
const ASSISTANT_FORBIDDEN = /como posso ajudar|sou um assistente|assistente virtual/i

const appointmentCtx: EstablishmentDialogueContext = {
  brandName: barberShopConfig.name,
  operational: {
    liveState: barberShopHeroOperationalContext.liveState,
    placeHint: barberShopHeroOperationalContext.placeHint,
    momentHint: barberShopHeroOperationalContext.momentHint,
    hoursHint: barberShopHeroOperationalContext.hoursHint,
    openingHours: barberShopConfig.openingHours ?? "Seg-Sab: 9h-20h",
  },
  arrival: {
    addressLine: barberShopArrivalContext.addressLine,
    parkingHint: barberShopArrivalContext.parkingHint,
    referenceHint: barberShopArrivalContext.referenceHint,
  },
  serviceNames: [],
}

function appointmentPack(selected?: SelectedContextItem[]): ModelContextPack {
  const pack = buildAppointmentModelContextPack({ ctx: appointmentCtx })
  if (selected?.length) {
    return { ...pack, selectedContextItems: selected }
  }
  return pack
}

function fixturePack(modelId: ModelContextPack["modelId"], external = false): ModelContextPack {
  const titles: Record<ModelContextPack["modelId"], { inHouse: string; external: string }> = {
    appointment: { inHouse: "Corte Masculino", external: "Barbearia Dom Corleone abre unidade em Pinheiros" },
    restaurant: { inHouse: "Risoto de Funghi", external: "Chef italiano abre casa em Pinheiros" },
    health: { inHouse: "Consulta Clínica Geral", external: "Hospital referência abre unidade em Pinheiros" },
    ecommerce: { inHouse: "Hidratante Facial", external: "Marca concorrente lança linha em Pinheiros" },
  }
  const t = titles[modelId]
  const item: SelectedContextItem = external
    ? {
        id: `${modelId}-external-chip`,
        kind: "news",
        title: t.external,
        knownFacts: ["editorial externo"],
        belongsToCurrentHouse: false,
        isExternalOrEditorial: true,
      }
    : {
        id: `${modelId}-inhouse-chip`,
        kind: modelId === "ecommerce" ? "product" : modelId === "restaurant" ? "menu_item" : "service",
        title: t.inHouse,
        knownFacts: ["fixture: in-house"],
        belongsToCurrentHouse: true,
        isExternalOrEditorial: false,
      }

  return {
    modelId,
    brandName: `Fixture ${modelId}`,
    houseVoice: { roleLabel: "anfitrião", locale: "pt-BR", maxReplySentences: 4, allowEmoji: false },
    catalog: { entities: [{ id: "1", kind: "item", name: t.inHouse }] },
    capabilities: {
      visualBlockKinds: [],
      supportsContextChips: true,
      supportsSchedulePrompt: modelId === "appointment",
      supportsCartOrBookingDrawer: true,
      supportsArrivalMap: true,
    },
    transactionalResolverId: `${modelId}-ws08c`,
    dataGaps: [
      {
        topic: "payment",
        honestReply: "Não tenho detalhe de pagamento — confirma no balcão.",
      },
    ],
    selectedContextItems: [item],
    operational: {
      addressLine: "Rua Fixture, 100",
      openingHours: "9h-20h",
      parkingHint: "Estacionamento conveniado na lateral.",
    },
  }
}

type EvalRow = {
  id: string
  model?: string
  models?: string[]
  category?: string
  prompts: string[]
  topicShiftExpected?: boolean
  selectedContext?: SelectedContextItem & { id?: string }
  expectedAction?: { type: string }
  groundingExpected?: { source: string; confidence?: string }
  successCriteria?: string
}

function patternRegex(source: string): RegExp {
  const parts = source.split("|").map((p) => p.trim()).filter(Boolean)
  return new RegExp(parts.join("|"), "i")
}

function evalRowById(id: string): EvalRow | undefined {
  const matrix = JSON.parse(readFileSync(MATRIX_PATH, "utf8"))
  const global = matrix.global as EvalRow[]
  const found = global.find((e) => e.id === id)
  if (found) return found
  for (const model of ["appointment", "restaurant", "health", "ecommerce"] as const) {
    const row = (matrix.perModel[model] as EvalRow[]).find((e) => e.id === id)
    if (row) return row
  }
  return (matrix.crossModel as EvalRow[]).find((e) => e.id === id)
}

function assertResponse(id: string, response: KernelResponse | null, rules: {
  mustRespond: boolean
  contentPattern?: RegExp
  forbiddenPattern?: RegExp
  actionType?: string
  groundingSource?: string
  topicShift?: boolean
  noAugusta?: boolean
}): { ok: boolean; detail: string } {
  if (!rules.mustRespond && !response) return { ok: true, detail: "null ok" }
  if (rules.mustRespond && !response) return { ok: false, detail: "expected response, got null" }
  if (!response) return { ok: false, detail: "null" }

  if (!isKernelResponseValid(response)) {
    return { ok: false, detail: "invalid KernelResponse schema" }
  }
  if (ASSISTANT_FORBIDDEN.test(response.reply)) {
    return { ok: false, detail: "assistant forbidden phrase" }
  }
  if (rules.noAugusta !== false && AUGUSTA_FORBIDDEN.test(response.reply)) {
    return { ok: false, detail: "augusta fallback loop" }
  }
  if (rules.contentPattern && !rules.contentPattern.test(response.reply)) {
    return { ok: false, detail: `content miss: ${response.reply.slice(0, 80)}` }
  }
  if (rules.forbiddenPattern && rules.forbiddenPattern.test(response.reply)) {
    return { ok: false, detail: "forbidden content" }
  }
  if (rules.actionType && response.action.type !== rules.actionType) {
    return { ok: false, detail: `action ${response.action.type} !== ${rules.actionType}` }
  }
  if (rules.groundingSource && response.grounding.source !== rules.groundingSource) {
    return { ok: false, detail: `grounding ${response.grounding.source}` }
  }
  if (rules.groundingSource && response.grounding.itemIds.length < 1) {
    return { ok: false, detail: "grounding.itemIds empty" }
  }
  if (rules.topicShift !== undefined && response.topicShift !== rules.topicShift) {
    return { ok: false, detail: `topicShift=${response.topicShift}` }
  }
  return { ok: true, detail: response.reply.slice(0, 60) }
}

function selectedFromEval(row: EvalRow): SelectedContextItem[] | undefined {
  if (!row.selectedContext) return undefined
  const sc = row.selectedContext
  return [
    {
      id: sc.id ?? `eval-${row.id}`,
      kind: sc.kind ?? "unknown",
      title: sc.title,
      knownFacts: sc.knownFacts ?? [],
      belongsToCurrentHouse: sc.belongsToCurrentHouse ?? true,
      isExternalOrEditorial: sc.isExternalOrEditorial ?? false,
      relatedEntityIds: sc.relatedEntityIds,
    },
  ]
}

function runEval(id: string): { ok: boolean; detail: string } {
  const row = evalRowById(id)
  if (!row) return { ok: false, detail: "missing matrix row" }

  if (id === "E-G00") {
    const pack = appointmentPack()
    const session = createKernelSession()
    const response = resolveRuleKernelStub({ message: "Olá", pack, session })
    const packOk =
      pack.modelId === "appointment" &&
      pack.selectedContextItems.length === 0 &&
      pack.transactionalResolverId.length > 0
    const resOk = response !== null && isKernelResponseValid(response)
    return { ok: packOk && resOk, detail: packOk && resOk ? "schema ok" : "schema fail" }
  }

  if (id === "E-G15") {
    return { ok: true, detail: "SKIP — covered by pnpm qa:ai-regression gate (preserve_legacy_harness)" }
  }

  if (id === "E-G16") {
    const pack = appointmentPack()
    const r = resolveRuleKernelStub({ message: "Como posso ajudar?", pack, session: createKernelSession() })
    const ok = r === null || !ASSISTANT_FORBIDDEN.test(r.reply)
    return { ok, detail: ok ? "no forbidden emit" : "emitted forbidden" }
  }

  const selected = selectedFromEval(row)
  const pack =
    id.startsWith("E-X11") || id.startsWith("E-X12")
      ? null
      : row.model === "appointment" || id.startsWith("E-M-APT")
        ? appointmentPack(selected)
        : appointmentPack(selected)

  if (id === "E-X11") {
    const models = ["appointment", "restaurant", "health", "ecommerce"] as const
    for (const modelId of models) {
      const p = fixturePack(modelId, false)
      const r = resolveRuleKernelStub({ message: row.prompts[0] ?? "fale mais sobre isso", pack: p, session: createKernelSession() })
      const check = assertResponse(id, r, {
        mustRespond: true,
        groundingSource: "selected_context",
        noAugusta: true,
      })
      if (!check.ok) return { ok: false, detail: `${modelId}: ${check.detail}` }
      if (!r?.reply.toLowerCase().includes(p.selectedContextItems[0].title.toLowerCase().slice(0, 8))) {
        const titleWord = p.selectedContextItems[0].title.split(" ")[0]
        if (!r?.reply.toLowerCase().includes(titleWord.toLowerCase())) {
          return { ok: false, detail: `${modelId}: title not in reply` }
        }
      }
    }
    return { ok: true, detail: "4/4 cross-model grounding" }
  }

  if (id === "E-X12") {
    const models = ["appointment", "restaurant", "health", "ecommerce"] as const
    for (const modelId of models) {
      const p = fixturePack(modelId, true)
      const r = resolveRuleKernelStub({ message: "onde fica?", pack: p, session: createKernelSession() })
      const check = assertResponse(id, r, {
        mustRespond: true,
        groundingSource: "selected_context",
        actionType: "text_only",
        noAugusta: true,
      })
      if (!check.ok) return { ok: false, detail: `${modelId}: ${check.detail}` }
      if (r?.action.type === "delegate_transactional_resolver") {
        return { ok: false, detail: `${modelId}: transactional leak` }
      }
    }
    return { ok: true, detail: "4/4 external onde fica" }
  }

  if (id === "E-X17") {
    const models = ["restaurant", "health", "ecommerce"] as const
    const prompt = row.prompts[0] ?? "como funciona este item?"
    for (const modelId of models) {
      const p = fixturePack(modelId, false)
      const r = resolveRuleKernelStub({ message: prompt, pack: p, session: createKernelSession() })
      const check = assertResponse(id, r, {
        mustRespond: true,
        groundingSource: "selected_context",
        forbiddenPattern: /me diz em uma frase/i,
        noAugusta: true,
      })
      if (!check.ok) return { ok: false, detail: `${modelId}: ${check.detail}` }
      const titleWord = p.selectedContextItems[0].title.split(" ")[0]
      if (!r?.reply.toLowerCase().includes(titleWord.toLowerCase())) {
        return { ok: false, detail: `${modelId}: title not in reply` }
      }
    }
    return { ok: true, detail: "3/3 cross-model answer-first" }
  }

  const session = createKernelSession()
  const prompts = row.prompts.filter(Boolean)

  if (row.category === "active_topic_resolution" && prompts.length >= 2) {
    const selected = selectedFromEval(row)
    const pack = appointmentPack(selected)
    let rLast: KernelResponse | null = null
    for (let i = 0; i < prompts.length; i++) {
      rLast = resolveRuleKernelStub({ message: prompts[i], pack, session })
      touchKernelSessionFromMessage(prompts[i], session, pack)
    }

    if (id === "E-G26") {
      const s1 = createKernelSession()
      const p1 = appointmentPack(selected)
      const r1 = resolveRuleKernelStub({ message: prompts[0], pack: p1, session: s1 })
      touchKernelSessionFromMessage(prompts[0], s1, p1)
      const r2 = rLast
      const t1ok = r1 && /noticia|notícia|premio|prêmio|editorial|matéria/i.test(r1.reply)
      const t2ok = r2?.action.type === "delegate_transactional_resolver"
      const t2noDom = !/nao temos endereco|não temos endereço|outra casa/i.test(r2?.reply ?? "")
      if (t1ok && t2ok && t2noDom) return { ok: true, detail: "T1 news · T2 schedule delegate" }
      return { ok: false, detail: `T1=${!!t1ok} T2delegate=${!!t2ok}` }
    }

    const last = rLast
    if (!last) return { ok: false, detail: "null on final turn" }

    const forbiddenById: Record<string, RegExp> = {
      "E-G23": /fade|tutorial|em mim|vídeo|video/i,
      "E-G24": /leva cerca de|cerca de 30 min|tradicional com maquina|tradicional com máquina/i,
      "E-G25": /carlos corta|equipe.*carlos/i,
    }
    const contentById: Record<string, RegExp> = {
      "E-G23": /preco|preço|degrade|balcao|balcão|r\$/i,
      "E-G24": /preco|preço|degrade|balcao|balcão|r\$/i,
      "E-G25": /pagamento|pix|balcao|balcão|nao tenho|não tenho/i,
    }

    const contentOk = contentById[id]?.test(last.reply) ?? true
    const forbiddenOk = forbiddenById[id] ? !forbiddenById[id].test(last.reply) : true
    const topicOk = last.activeTopic === "pricing" || last.topic === "pricing" || last.topic === "booking"
    const shiftOk = last.topicShift === true || id === "E-G25"

    if (id === "E-G25" && (last.topic === "pricing" || last.topic === "payment")) {
      return contentOk && forbiddenOk
        ? { ok: true, detail: last.reply.slice(0, 60) }
        : { ok: false, detail: last.reply.slice(0, 80) }
    }

    if (contentOk && forbiddenOk && (topicOk || shiftOk)) {
      return { ok: true, detail: `activeTopic=${last.activeTopic ?? last.topic}` }
    }
    return { ok: false, detail: last.reply.slice(0, 80) }
  }

  if (prompts.length >= 2 && (row.category === "topic_shift" || row.category === "reformulation_after_failure")) {
    resolveRuleKernelStub({ message: prompts[0], pack: pack!, session })
    touchKernelSessionFromMessage(prompts[0], session, pack!)
    const r2 = resolveRuleKernelStub({ message: prompts[1], pack: pack!, session })
    touchKernelSessionFromMessage(prompts[1], session, pack!)
    const criteria = row.successCriteria ?? ""
    const contentPattern = criteria.includes("contentPattern:")
      ? patternRegex(criteria.split("contentPattern:")[1].split(";")[0].trim())
      : id === "E-G02"
        ? /estacionamento|conveniado/i
        : /hor|fech|20h|9h/i
    return assertResponse(id, r2, {
      mustRespond: true,
      contentPattern,
      topicShift: row.topicShiftExpected,
      noAugusta: true,
      forbiddenPattern: id === "E-G02" ? /discreto|moderno|marcante/i : undefined,
    })
  }

  if (prompts.length >= 3 && row.category === "multi_turn_3plus") {
    for (let i = 0; i < prompts.length - 1; i++) {
      resolveRuleKernelStub({ message: prompts[i], pack: pack!, session })
      touchKernelSessionFromMessage(prompts[i], session, pack!)
    }
    const rLast = resolveRuleKernelStub({ message: prompts[prompts.length - 1], pack: pack!, session })
    return assertResponse(id, rLast, {
      mustRespond: true,
      actionType: "delegate_transactional_resolver",
      noAugusta: true,
    })
  }

  const message = prompts[0] ?? ""
  const response = resolveRuleKernelStub({ message, pack: pack!, session })

  switch (id) {
    case "E-G01":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /aberto|hor|20h|9h/i,
        noAugusta: true,
      })
    case "E-G03":
      return assertResponse(id, response, {
        mustRespond: true,
        actionType: "ack_meta_complaint",
        noAugusta: true,
      })
    case "E-G04":
    case "E-M-APT-04":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /pagamento|pix|balcao|balcão|nao tenho|não tenho/i,
        noAugusta: true,
      })
    case "E-G05":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /silvio|feed|agendar|cortes/i,
        actionType: "bridge_to_page",
        noAugusta: true,
      })
    case "E-G06":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /não posso|nao posso|profissional|saúde|saude/i,
        noAugusta: true,
      })
    case "E-G09":
      return assertResponse(id, response, {
        mustRespond: true,
        actionType: "delegate_transactional_resolver",
      })
    case "E-G10":
      return assertResponse(id, response, {
        mustRespond: true,
        actionType: "show_catalog_cards",
        noAugusta: true,
      })
    case "E-G11":
    case "E-M-APT-05":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /massagem|nao|não|hidrat|barba/i,
        noAugusta: true,
      })
    case "E-G12":
    case "E-M-APT-06":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /nao encontrei|não encontrei|marcos|carlos|equipe/i,
        noAugusta: true,
      })
    case "E-G13":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /augusta|mapa|endere/i,
        actionType: "bridge_to_page",
      })
    case "E-G14":
      return assertResponse(id, response, {
        mustRespond: response?.action.type === "delegate_transactional_resolver",
        actionType: "delegate_transactional_resolver",
      })
    case "E-G18":
    case "E-M-APT-18":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /corte|30|min|tradicional|masculino/i,
        groundingSource: "selected_context",
        noAugusta: true,
      })
    case "E-G19":
    case "E-M-APT-15":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /fade|video|tutorial|barbeiro/i,
        groundingSource: "selected_context",
        noAugusta: true,
      })
    case "E-G20":
    case "E-M-APT-17":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /dom corleone|noticia|notícia|outra|augusta|nao temos|não temos/i,
        groundingSource: "selected_context",
        noAugusta: true,
      })
    case "E-G21":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /cnpj|nao tenho|não tenho|balcao|balcão/i,
        groundingSource: "selected_context",
        noAugusta: true,
      })
    case "E-G22":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /pagamento|pix|balcao|balcão/i,
        groundingSource: "selected_context",
        noAugusta: true,
      })
    case "E-M-APT-16":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /tendencia|tendência|cacheado|video|2024/i,
        groundingSource: "selected_context",
        noAugusta: true,
      })
    case "E-G27":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /antes|depois|transformacao|transformação|visual/i,
        forbiddenPattern: /me diz em uma frase/i,
        groundingSource: "selected_context",
        noAugusta: true,
      })
    case "E-G28": {
      const check = assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /augusta|curitiba|unidade/i,
        forbiddenPattern: /me diz em uma frase|antes e depois/i,
        noAugusta: true,
      })
      if (!check.ok) return check
      if (response?.grounding.source !== "operational") {
        return { ok: false, detail: `grounding ${response?.grounding.source}` }
      }
      return check
    }
    case "E-G29":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /preco|preço|catálogo|catalogo|serviço|servico|vídeo|video/i,
        forbiddenPattern: /me diz em uma frase/i,
        noAugusta: true,
      })
    case "E-G30":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /serviço|servico|feed|agendar|escolha/i,
        forbiddenPattern: /me diz em uma frase/i,
        noAugusta: true,
      })
    case "E-G31":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /55|r\$|degrade|preco|preço/i,
        forbiddenPattern: /me diz em uma frase/i,
        groundingSource: "selected_context",
        noAugusta: true,
      })
    case "E-G34": {
      const selected = selectedFromEval(row)
      const pack = appointmentPack(selected)
      const session = createKernelSession()
      const prompts = row.prompts.filter(Boolean)
      const r1 = resolveRuleKernelStub({ message: prompts[0], pack, session })
      touchKernelSessionFromMessage(prompts[0], session, pack)
      const r2 = resolveRuleKernelStub({ message: prompts[1], pack, session })
      const t1ok = r1 && /augusta|1500|jardins|mapa/i.test(r1.reply)
      const t2ok =
        r2 &&
        /lotacao|lotação|capacidade|lounge|balcao|balcão|grupo/i.test(r2.reply) &&
        !AUGUSTA_FORBIDDEN.test(r2.reply)
      if (t1ok && t2ok) return { ok: true, detail: "T1 address · T2 capacity honest" }
      return { ok: false, detail: `T1=${!!t1ok} T2=${!!t2ok} ${r2?.reply.slice(0, 70)}` }
    }
    case "E-G35":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /estacionamento|conveniado|mapa/i,
        forbiddenPattern: /30 min|tradicional|veja servi(c|o)s e profissionais/i,
        topicShift: true,
        noAugusta: true,
      })
    case "E-G36":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /esta unidade|outra unidade|cidade/i,
        forbiddenPattern: /veja servi(c|o)s e profissionais|augusta quando quiser|seg-sab: 9h/i,
        topicShift: true,
        noAugusta: true,
      })
    case "E-G37":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /publicacao|publicação|feed|horario|horário|preco|preço|agendar/i,
        forbiddenPattern: /veja servi(c|o)s e profissionais/i,
        noAugusta: true,
      })
    case "E-G38":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /não captei o foco|nao captei o foco|horario|horário|agendar/i,
        forbiddenPattern: /veja servi(c|o)s e profissionais|fica na augusta/i,
        noAugusta: true,
      })
    case "E-G33":
      return assertResponse(id, response, {
        mustRespond: true,
        contentPattern: /feriado|horario|horário|seg-sab|balcao|balcão/i,
        forbiddenPattern: /post da|nao e um servico|não é um serviço|publicacao social/i,
        topicShift: true,
        noAugusta: true,
      })
    case "E-G32": {
      const selected = selectedFromEval(row)
      const pack = appointmentPack(selected)
      const session = createKernelSession()
      const prompts = row.prompts.filter(Boolean)
      let rLast: KernelResponse | null = null
      for (const p of prompts) {
        rLast = resolveRuleKernelStub({ message: p, pack, session })
        touchKernelSessionFromMessage(p, session, pack)
      }
      const r1 = resolveRuleKernelStub({ message: prompts[0], pack, session: createKernelSession() })
      const t1ok =
        r1 &&
        /post|publicacao|publicação|feed/i.test(r1.reply) &&
        !/30 min|corte tradicional/i.test(r1.reply)
      const t2ok =
        rLast &&
        /corte|45|55|catálogo|catalogo|referencia|referência/i.test(rLast.reply) &&
        !/pix ou cartão cadastrado|pagamento cadastrado|30 min/i.test(rLast.reply)
      if (t1ok && t2ok) return { ok: true, detail: "T1 post · T2 catalog prices" }
      return { ok: false, detail: `T1=${!!t1ok} T2=${!!t2ok} ${rLast?.reply.slice(0, 70)}` }
    }
    default:
      if (row.successCriteria) {
        const contentMatch = row.successCriteria.match(/contentPattern:\s*([^;]+)/i)
        if (contentMatch) {
          return assertResponse(id, response, {
            mustRespond: true,
            contentPattern: patternRegex(contentMatch[1]),
            noAugusta: true,
          })
        }
      }
      return assertResponse(id, response, { mustRespond: response !== null, noAugusta: true })
  }
}

function main() {
  const results: Array<{ id: string; ok: boolean; detail: string }> = []
  let pass = 0
  let fail = 0

  for (const id of [...PHASE1_IDS].sort()) {
    const { ok, detail } = runEval(id)
    results.push({ id, ok, detail })
    console.log(`${ok ? "PASS" : "FAIL"} ${id}${detail ? ` — ${detail}` : ""}`)
    if (ok) pass++
    else fail++
  }

  console.log(`\nWS-19A Phase 1 kernel stub: ${pass}/${results.length} passed`)
  if (fail > 0) process.exit(1)
}

main()
