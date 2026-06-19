import type { ConversationContextPayload } from "@/lib/business-types"
import { normalizeSurfaceFlowText } from "@/lib/surface-flow/product-entity"
import type {
  ConversationCatalogSummary,
  LlmBrainProviderInput,
  ConversationMemory,
  ConversationState,
  LlmBrainReply,
  NextConversationMove,
  QuestionContract,
} from "./types"

function normalize(value: string) {
  return normalizeSurfaceFlowText(value).trim()
}

function hasAny(normalized: string, cues: string[]) {
  return cues.some((cue) => normalized.includes(normalize(cue)))
}

function pickVariant(options: string[], seed: string | number) {
  const text = String(seed)
  const score = [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return options[Math.abs(score) % options.length]
}

function contextLabel(contextItems: ConversationContextPayload[], state: ConversationState) {
  return contextItems[0]?.title ?? state.currentService ?? state.currentProfessional ?? null
}

function catalogConfirmsService(target: string, catalogSummary?: ConversationCatalogSummary) {
  const targetWords = normalize(target)
    .split(/\s+/)
    .filter((word) => word.length > 2)

  return (catalogSummary?.services ?? []).some((service) => {
    const haystack = normalize(`${service.name} ${service.detail ?? ""}`)
    return targetWords.length > 0 && targetWords.every((word) => haystack.includes(word))
  })
}

function serviceQuestionContractReply({
  message,
  brandName,
  catalogSummary,
  questionContract,
}: {
  message: string
  brandName: string
  catalogSummary?: ConversationCatalogSummary
  questionContract: QuestionContract
}): LlmBrainReply {
  const target = questionContract.target ?? "esse serviço"
  const confirmed = catalogConfirmsService(target, catalogSummary)
  const verb = hasAny(normalize(target), ["cabelo", "barba", "corte"]) ? "corta" : "faz"
  const correction = hasAny(normalize(message), ["eu perguntei", "perguntei se"])

  return {
    text: confirmed
      ? `${correction ? "Respondendo diretamente: " : ""}sim, ${brandName} tem ${target} no catálogo confirmado.`
      : correction
        ? `Respondendo diretamente: não aparece confirmação de ${target} no catálogo atual. Antes de prometer esse atendimento, precisa verificar com a equipe.`
        : `Eu não tenho confirmação de que ${brandName} ${verb} ${target}. O correto é verificar com a equipe antes de falar em horário ou preço.`,
    actionRequest: { type: "none", reason: "question_contract_yes_no_service" },
    shouldUseLegacyResolver: false,
    shouldShowVisualBlock: false,
    conversationMode: "answer",
  }
}

function isAlternativeRequest(normalized: string) {
  return hasAny(normalized, ["tem outro", "tem outra", "outro profissional", "outra opcao", "outra opção"])
}

function isAcceptedTurn(normalized: string) {
  return hasAny(normalized, ["pode ser", "esse mesmo", "fechado", "vamos nesse", "quero esse"])
}

function isExplicitServiceLookup(normalized: string) {
  return hasAny(normalized, ["barba completa", "combo", "sobrancelha", "acabamento", "degrade", "degradê"])
}

function hasEnoughScheduleContext(state: ConversationState, contextItems: ConversationContextPayload[]) {
  return Boolean(state.currentProfessional || state.currentService || contextItems.length > 0)
}

function isNetflixQuestion(normalized: string) {
  return hasAny(normalized, ["netflix", "filme mais assistido", "mais assistido na netflix"])
}

function isImpossibleAppointmentRequest(normalized: string) {
  return hasAny(normalized, [
    "agendar ontem",
    "horario ontem",
    "horário ontem",
    "de graca",
    "de graça",
    "gratis",
    "grátis",
    "3 da manha",
    "3 da manhã",
    "madrugada",
  ])
}

function isCelebrityStyleQuestion(normalized: string) {
  return (
    hasAny(normalized, ["cristiano ronaldo", "ator", "atriz", "famoso", "celebridade"]) &&
    hasAny(normalized, ["corte", "barbeiro", "barba", "visual"])
  )
}

function isRepeatedAssistantCriticism(normalized: string) {
  return hasAny(normalized, [
    "voce nao entendeu",
    "você não entendeu",
    "nao entendeu nada",
    "não entendeu nada",
    "responde direito",
  ])
}

function isFreeVisualAnxiety(normalized: string) {
  return hasAny(normalized, [
    "deixo crescer",
    "pareco mais velho",
    "pareço mais velho",
    "mudar o visual",
    "tenho medo",
    "duvida",
    "dúvida",
  ])
}

function isHairChangeOpenTurn(normalized: string) {
  return hasAny(normalized, ["pensando em cortar", "pensando cortar", "cortar o cabelo", "cortar cabelo"]) &&
    !hasAny(normalized, ["horario", "horário", "preco", "preço", "quanto"])
}

function isBoredWithLook(normalized: string) {
  return hasAny(normalized, ["enjoei", "cansei do visual", "mesma imagem", "quero mudar um pouco"])
}

function isModernStyleFollowUp(normalized: string) {
  return hasAny(normalized, ["mais moderno", "moderno", "menos tradicional"])
}

function isCurlyHairFollowUp(normalized: string) {
  return hasAny(normalized, ["cacheado", "cacheada", "ondulado", "ondulada"])
}

function isHairPomadeQuestion(normalized: string) {
  return hasAny(normalized, ["pomada", "cera para cabelo", "finalizador"]) &&
    hasAny(normalized, ["recomenda", "qual", "melhor", "indica"])
}

function isMatteFinishFollowUp(normalized: string) {
  return hasAny(normalized, ["aspecto seco", "efeito seco", "matte", "sem brilho"])
}

function isOpenMoneyQuestion(normalized: string) {
  return /(?:r\$\s*)?100\s*mil/.test(normalized) &&
    hasAny(normalized, ["o que faço", "o que faco", "investir", "faço o que", "faco o que"])
}

function confusedReply(memory: ConversationMemory): LlmBrainReply {
  const previousUser = memory.lastUserMessage ? normalize(memory.lastUserMessage) : ""

  if (isNetflixQuestion(previousUser)) {
    return {
      text:
        "Você tem razão, eu respondi mal. Você perguntou sobre Netflix e eu puxei para a barbearia sem necessidade. Reformulando: esse ranking muda com o tempo porque depende do recorte, como filme em inglês, filme em outro idioma, país específico ou total de horas assistidas. Quer olhar pelo ranking histórico global?",
      actionRequest: { type: "none", reason: "reformulate_after_user_confusion" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "answer",
      nextQuestion: "Você quer que eu responda considerando ranking histórico global?",
    }
  }

  if (isRepeatedAssistantCriticism(previousUser)) {
    return {
      text:
        "Reformulando sem rodeio: você quer mudar o visual. Eu começaria com uma mudança discreta e controlada, não uma transformação radical. Primeiro escolhemos se a prioridade é parecer mais jovem, mais alinhado ou mais marcante. Qual desses três caminhos faz mais sentido?",
      actionRequest: { type: "none", reason: "second_reformulation_after_criticism" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "answer",
      nextQuestion: "Qual desses três caminhos faz mais sentido para você?",
    }
  }

  if (memory.conversationSummary.includes("mudar o visual")) {
    return {
      text:
        "Você tem razão. Resposta direta: se a ideia é mudar o visual sem se arrepender, eu começaria por algo controlado, fácil de ajustar depois. Em vez de abrir lista, escolheria entre um visual mais limpo e um pouco mais marcante. Quer ir pelo discreto ou pelo mais perceptível?",
      actionRequest: { type: "none", reason: "direct_reformulation_after_criticism" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "answer",
      nextQuestion: "Você quer uma mudança discreta ou mais perceptível?",
    }
  }

  return {
    text:
      "Você tem razão, eu não fui claro. Reformulando: vou responder primeiro o que você acabou de pedir, em palavras mais simples, sem repetir a explicação anterior. Quer uma versão bem direta?",
    actionRequest: { type: "none", reason: "reformulate_after_user_confusion" },
    shouldUseLegacyResolver: false,
    shouldShowVisualBlock: false,
    conversationMode: "answer",
    nextQuestion: "Quer que eu explique de forma mais direta?",
  }
}

function verticalTargets(vertical: string) {
  if (vertical === "restaurant") {
    return {
      domain: "cardápio, preferência ou pedido",
      offDomain: "cardápio, reserva ou pedido",
      greeting: "escolher um prato, entender combinações ou montar um pedido",
      focusQuestion: "O foco é escolher prato, comparar opções ou montar pedido?",
    }
  }

  if (vertical === "health") {
    return {
      domain: "especialidade, profissional ou horário",
      offDomain: "especialidade, profissional ou horário",
      greeting: "entender qual cuidado você precisa, escolher profissional ou olhar horário",
      focusQuestion: "O foco é cuidado, profissional ou horário?",
    }
  }

  if (vertical === "ecommerce") {
    return {
      domain: "produto, comparação ou próxima compra",
      offDomain: "produto, comparação ou escolha",
      greeting: "escolher um produto, comparar opções ou tirar dúvida antes de comprar",
      focusQuestion: "O foco é escolher produto, comparar opções ou entender detalhes?",
    }
  }

  return {
    domain: "serviço, preço ou horário",
    offDomain: "corte, barba ou horário",
    greeting: "escolher um serviço, entender preço ou já olhar horário",
    focusQuestion: "O foco é serviço, preço ou horário?",
  }
}

function closeReply(): LlmBrainReply {
  return {
    text: "Perfeito. Fecho esse ponto por aqui, e se você quiser retomar depois eu continuo desse mesmo contexto.",
    actionRequest: { type: "none", reason: "user_closed_loop" },
    shouldUseLegacyResolver: false,
    shouldShowVisualBlock: false,
    conversationMode: "close",
  }
}

function clarifyStyleReply(message: string, memory: ConversationMemory, nextMove: NextConversationMove): LlmBrainReply {
  const opening = pickVariant(
    memory.turnCount > 0
      ? [
          "Pelo que você vinha buscando, dá para afinar isso sem abrir uma lista ainda.",
          "Certo, a ideia que você vinha trazendo já aponta para uma direção de visual.",
          "Sim, dá para seguir por aí com um pouco mais de critério, mantendo o que você já sinalizou.",
        ]
      : [
          "Boa. Eu não começaria te jogando uma lista de opções.",
          "Vamos por partes: primeiro o visual, depois as opções.",
          "Certo. Antes de escolher serviço, vale entender a imagem que você quer passar.",
        ],
    `${message}-${memory.turnCount}`
  )

  return {
    text: `${opening} ${nextMove.type === "ask_clarifying_question" ? nextMove.question : "Você quer algo mais discreto para o dia a dia ou algo mais moderno, com lateral mais marcada?"}`,
    actionRequest: { type: "none", reason: `open_recommendation_before_tools:${message.slice(0, 24)}` },
    shouldUseLegacyResolver: false,
    shouldShowVisualBlock: false,
    conversationMode: "clarify",
    nextQuestion: nextMove.type === "ask_clarifying_question" ? nextMove.question : undefined,
  }
}

export function generateConversationalBrainReply({
  message,
  history,
  memory,
  state,
  interpretedIntent,
  nextMove,
  contextItems,
  brandName,
  vertical,
  catalogSummary,
  questionContract,
}: LlmBrainProviderInput): LlmBrainReply {
  const normalized = normalize(message)
  const label = contextLabel(contextItems, state)
  const targets = verticalTargets(vertical)

  if (nextMove.type === "close_loop") {
    return closeReply()
  }

  if (questionContract?.questionType === "yes_no_service") {
    return serviceQuestionContractReply({ message, brandName, catalogSummary, questionContract })
  }

  if (interpretedIntent === "user_confused_by_assistant") {
    return confusedReply(memory)
  }

  if (interpretedIntent === "off_domain") {
    if (isNetflixQuestion(normalized)) {
      return {
        text:
          "Boa pergunta. Isso muda bastante por período e país, porque a Netflix separa rankings por idioma, recorte e horas assistidas. Em ranking histórico global, o mais confiável costuma ser a lista oficial atualizada pela própria Netflix. Por aqui eu ajudo melhor com a Barba Negra, mas perguntas gerais simples também cabem.",
        actionRequest: { type: "none", reason: "general_off_domain_answer_no_tool" },
        shouldUseLegacyResolver: false,
        shouldShowVisualBlock: false,
        conversationMode: "answer",
        nextQuestion: "Você quer considerar ranking global histórico ou ranking atual?",
      }
    }

    return {
      text: `Boa pergunta. Isso fica fora do que a ${brandName} resolve no dia a dia, então eu responderia curto porque não quero puxar à força para a barbearia. Se for um dado que muda, vale conferir uma fonte atualizada; por aqui eu sigo melhor em ${targets.offDomain}.`,
      actionRequest: { type: "none", reason: "off_domain_reconnect_only" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "answer",
      nextQuestion: `Quer voltar para ${targets.offDomain}?`,
    }
  }

  if (interpretedIntent === "greeting") {
    return {
      text: pickVariant(
        [
          `Oi. Quer ajuda para ${targets.greeting}?`,
          `Oi, me diz por onde começamos: ${targets.greeting}?`,
          `Olá. Posso te ajudar a ${targets.greeting}; o que você quer resolver primeiro?`,
        ],
        `${message}-${history.length}`
      ),
      actionRequest: { type: "none", reason: "greeting_needs_user_direction" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "clarify",
      nextQuestion: targets.focusQuestion,
    }
  }

  if (isOpenMoneyQuestion(normalized)) {
    return {
      text: "A primeira coisa que eu faria seria evitar responder imediatamente. Parece uma pergunta sobre investimento, mas está incompleta: os mesmos R$ 100 mil podem servir para reserva, imóvel, aposentadoria, renda ou abrir um negócio. Se eu pudesse fazer uma pergunta só, seria: você imagina precisar desse dinheiro nos próximos dois anos?",
      actionRequest: { type: "none", reason: "open_money_question_needs_goal_before_product" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "clarify",
      nextQuestion: "Você imagina precisar desse dinheiro nos próximos dois anos?",
    }
  }

  if (isHairPomadeQuestion(normalized)) {
    return {
      text: "Antes de recomendar pomada, eu tentaria entender o resultado que você quer. Muita gente compra alta fixação quando só queria controlar alguns fios. Você quer efeito natural, aspecto seco, brilho, volume ou fixação forte?",
      actionRequest: { type: "none", reason: "product_recommendation_needs_desired_finish" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "clarify",
      nextQuestion: "Você quer efeito natural, aspecto seco, brilho, volume ou fixação forte?",
    }
  }

  if (isMatteFinishFollowUp(normalized)) {
    return {
      text: "Nesse caso eu procuraria produtos matte. Eles costumam entregar textura e controle sem deixar aquele aspecto brilhante de gel ou pomada tradicional. Seu cabelo é curto ou médio?",
      actionRequest: { type: "none", reason: "matte_finish_product_followup" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "recommend",
      nextQuestion: "Seu cabelo é curto ou médio?",
    }
  }

  if (isBoredWithLook(normalized)) {
    return {
      text: "Isso costuma acontecer mais do que parece. Muitas vezes não existe nada errado com o corte atual; só vem a sensação de ver a mesma imagem no espelho há tempo demais. Antes de mudar, eu tentaria entender o objetivo: você quer parecer mais moderno, mais sério, mais elegante ou apenas diferente?",
      actionRequest: { type: "none", reason: "bored_with_look_needs_goal" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "clarify",
      nextQuestion: "Você quer parecer mais moderno, mais sério, mais elegante ou apenas diferente?",
    }
  }

  if (isModernStyleFollowUp(normalized)) {
    return {
      text: "Aí já ajuda bastante. Quando alguém fala mais moderno, normalmente está buscando textura, laterais mais limpas ou um visual menos tradicional. Seu cabelo é liso, ondulado ou cacheado?",
      actionRequest: { type: "none", reason: "modern_style_needs_hair_type" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "clarify",
      nextQuestion: "Seu cabelo é liso, ondulado ou cacheado?",
    }
  }

  if (isCurlyHairFollowUp(normalized)) {
    return {
      text: "Então eu teria cuidado para não copiar cortes que funcionam melhor em cabelo liso. Em cabelo cacheado, camadas ou um degradê mais suave costumam preservar melhor movimento e volume. Você tem alguma foto de referência ou está começando do zero?",
      actionRequest: { type: "none", reason: "curly_hair_style_needs_reference" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "recommend",
      nextQuestion: "Você tem alguma foto de referência ou está começando do zero?",
    }
  }

  if (isHairChangeOpenTurn(normalized)) {
    return {
      text: "O que está te fazendo pensar nisso? Está incomodado com o comprimento atual ou simplesmente querendo mudar um pouco o visual?",
      actionRequest: { type: "none", reason: "open_hair_change_needs_motive" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "clarify",
      nextQuestion: "Está incomodado com o comprimento atual ou querendo mudar o visual?",
    }
  }

  if (vertical === "ecommerce" && hasAny(normalized, ["presente", "skincare", "hidratante", "produto"])) {
    return {
      text:
        "Boa virada: se você já estava olhando skincare para você, agora não é só escolher produto, é pensar em presente. Eu manteria esse território, mas mudaria a pergunta porque entra perfil da pessoa, sensibilidade e quanto você quer impressionar.",
      actionRequest: { type: "none", reason: "ecommerce_topic_shift_needs_profile" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "clarify",
      nextQuestion: "A pessoa prefere algo básico, premium ou mais sensorial?",
    }
  }

  if (isFreeVisualAnxiety(normalized)) {
    const mentionsFear = hasAny(normalized, ["tenho medo", "medo"])
    const mentionsOlder = hasAny(normalized, ["pareco mais velho", "pareço mais velho"])
    const mentionsGrow = hasAny(normalized, ["deixo crescer"])

    return {
      text: mentionsFear
        ? "Esse medo é normal. Eu evitaria uma virada radical logo de cara e começaria com algo reversível, que muda a percepção sem te deixar preso ao resultado."
        : mentionsOlder
          ? "Se a sensação é parecer mais velho, eu fugiria de um visual pesado demais e buscaria algo mais limpo, com laterais controladas e acabamento leve."
          : mentionsGrow
            ? "Boa dúvida. Antes de cortar ou deixar crescer, eu olharia o que você quer transmitir: mais cuidado no dia a dia ou uma mudança mais evidente."
            : "Para mudar o visual sem ansiedade, eu começaria pelo que você quer sentir quando se olhar no espelho, não por uma lista pronta.",
      actionRequest: { type: "none", reason: "free_visual_anxiety_consultative_reply" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "recommend",
      nextQuestion: mentionsFear
        ? "Você toparia uma mudança discreta primeiro?"
        : "Você quer algo mais discreto ou mais perceptível?",
    }
  }

  if (isImpossibleAppointmentRequest(normalized)) {
    if (hasAny(normalized, ["ontem"])) {
      return {
        text:
          "Ontem não dá para agendar porque já passou. O melhor é procurar um horário real daqui para frente, talvez hoje ou amanhã, sem eu inventar disponibilidade.",
        actionRequest: { type: "none", reason: "impossible_past_booking" },
        shouldUseLegacyResolver: false,
        shouldShowVisualBlock: false,
        conversationMode: "clarify",
        nextQuestion: "Quer que eu considere hoje ou amanhã?",
      }
    }

    if (hasAny(normalized, ["de graca", "de graça", "gratis", "grátis"])) {
      return {
        text:
          "De graça eu não consigo prometer, porque preço e cortesia dependem da política da casa. Posso te ajudar a achar uma opção mais simples ou comparar serviços antes de decidir.",
        actionRequest: { type: "none", reason: "impossible_free_service_request" },
        shouldUseLegacyResolver: false,
        shouldShowVisualBlock: false,
        conversationMode: "answer",
        nextQuestion: "Quer ver uma opção mais econômica?",
      }
    }

    return {
      text:
        "Três da manhã provavelmente foge do horário normal de atendimento. Eu não vou inventar disponibilidade; o melhor é olhar um horário real dentro do funcionamento da casa.",
      actionRequest: { type: "none", reason: "impossible_out_of_hours_request" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "clarify",
      nextQuestion: "Quer tentar hoje em horário comercial?",
    }
  }

  if (isCelebrityStyleQuestion(normalized)) {
    const referenceLabel = hasAny(normalized, ["cristiano ronaldo"])
      ? "o corte do Cristiano Ronaldo"
      : hasAny(normalized, ["ator", "atriz"])
        ? "o corte desse ator"
        : "essa referência"

    return {
      text:
        `Boa referência. Eu não copiaria literalmente ${referenceLabel}; usaria isso como direção de volume, lateral e acabamento. Primeiro traduzimos para o seu cabelo, depois escolhemos quem executa melhor.`,
      actionRequest: { type: "none", reason: "celebrity_style_reference_needs_translation" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "recommend",
      nextQuestion: "Você quer algo mais parecido no volume, na lateral ou no acabamento?",
    }
  }

  if (label && hasAny(normalized, ["mostra as opcoes", "mostra as opções", "ver opcoes", "ver opções", "opcoes", "opções"])) {
    return {
      text: `Beleza. Como ${label} já está na mesa, dá para abrir poucas opções e comparar sem bagunçar a decisão.`,
      actionRequest: { type: "show_options", reason: "user_explicitly_requested_options_with_context" },
      shouldUseLegacyResolver: true,
      shouldShowVisualBlock: true,
      conversationMode: "act",
      nextQuestion: "Quer comparar por estilo, preço ou disponibilidade?",
    }
  }

  if (interpretedIntent === "recommendation" && contextItems.length === 0) {
    return clarifyStyleReply(message, memory, nextMove)
  }

  if (
    interpretedIntent === "service_question" &&
    !contextItems.length &&
    hasAny(normalized, ["quero cortar", "cortar cabelo", "cortar o cabelo"])
  ) {
    return clarifyStyleReply(message, memory, nextMove)
  }

  if (interpretedIntent === "service_question" && !contextItems.length && isExplicitServiceLookup(normalized)) {
    return {
      text: `Isso já soa como serviço específico. Aqui vale buscar opções reais, em vez de ficar só falando por cima.`,
      actionRequest: { type: "show_options", reason: "explicit_service_lookup" },
      shouldUseLegacyResolver: true,
      shouldShowVisualBlock: true,
      conversationMode: "act",
      nextQuestion: "Quer comparar preço ou horários desse serviço?",
    }
  }

  if (interpretedIntent === "service_question" && !contextItems.length) {
    const service = state.currentService ?? "esse corte"
    return {
      text: `Pelo que você descreveu, eu trataria ${service} como direção de estilo antes de levar para agenda. Se a ideia é algo mais executivo, eu evitaria contraste forte e iria numa versão limpa, fácil de manter.`,
      actionRequest: { type: "none", reason: "service_style_reflection_before_cards" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "reflect",
      nextQuestion: "Quer que eu siga por uma linha mais discreta ou mais moderna?",
    }
  }

  if (interpretedIntent === "price") {
    const service = label ?? state.currentService
    if (!service) {
      return {
        text: "Consigo te ajudar com preço, mas para não chutar eu preciso amarrar isso ao serviço, produto ou atendimento certo. Você quer confirmar preço de qual item?",
        actionRequest: { type: "none", reason: "price_missing_service_context" },
        shouldUseLegacyResolver: false,
        shouldShowVisualBlock: false,
        conversationMode: "clarify",
        nextQuestion: "Considero corte ou combo com barba?",
      }
    }

    return {
      text: `Considerando que estamos falando de ${service}, o valor precisa vir ligado ao serviço certo. Para o perfil que você descreveu, eu olharia primeiro uma opção mais limpa e só depois compararia alternativas.`,
      actionRequest: { type: "show_price", reason: "price_has_service_context" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "reflect",
      nextQuestion: "Quer que eu te mostre opções alinhadas com esse perfil?",
    }
  }

  if (interpretedIntent === "availability" || interpretedIntent === "booking" || isAcceptedTurn(normalized)) {
    const canAct = hasEnoughScheduleContext(state, contextItems)
    return {
      text: canAct
        ? `Agora dá para olhar horários para agendar, porque serviço ou profissional já estão claros. Eu deixaria a agenda entrar como apoio, só para confirmar uma opção real. Quer que eu filtre por hoje?`
        : "Dá para olhar horário, mas primeiro eu escolheria serviço ou profissional para não te mostrar agenda solta.",
      actionRequest: {
        type: canAct ? "show_schedule" : "none",
        reason: canAct ? "schedule_context_ready" : "schedule_missing_context",
      },
      shouldUseLegacyResolver: canAct,
      shouldShowVisualBlock: canAct,
      conversationMode: canAct ? "act" : "clarify",
      nextQuestion: canAct ? undefined : "Você prefere escolher serviço ou profissional primeiro?",
    }
  }

  if (interpretedIntent === "operational_question") {
    const isParkingQuestion = hasAny(normalized, ["estacionamento", "vaga", "carro", "parking"])
    return {
      text: isParkingQuestion
        ? `Sobre estacionamento: eu não tenho confirmação de vaga ou convênio no catálogo atual. O melhor é verificar com a equipe antes de você decidir o horário.`
        : `Eu responderia essa dúvida prática primeiro, sem misturar com corte ou agenda. Se não estiver confirmado no catálogo, o correto é verificar com a equipe.`,
      actionRequest: { type: "none", reason: "operational_question_answer_first_no_card" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "answer",
    }
  }

  if (interpretedIntent === "professional_question" && contextItems.length === 0 && !isAlternativeRequest(normalized)) {
    const professionalTarget =
      vertical === "health"
        ? "especialidade ou profissional"
        : vertical === "restaurant"
          ? "atendimento ou recomendação da casa"
          : "profissional"

    return {
      text: `Antes de escolher ${professionalTarget}, eu amarraria isso ao motivo do atendimento. Assim você não recebe nomes soltos sem saber quem combina com o objetivo.`,
      actionRequest: { type: "none", reason: "professional_question_needs_context_before_cards" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "clarify",
      nextQuestion: "Você quer me dizer o objetivo ou a preferência principal?",
    }
  }

  if (isAlternativeRequest(normalized) || interpretedIntent === "professional_question") {
    return {
      text: `Justo. Se essa rota não encaixou, eu trocaria sem insistir. Dá para procurar outro profissional ou uma alternativa mais discreta dentro do mesmo serviço.`,
      actionRequest: {
        type: interpretedIntent === "professional_question" || isAlternativeRequest(normalized) ? "show_professionals" : "none",
        reason: "user_wants_alternative_or_professional_change",
      },
      shouldUseLegacyResolver: true,
      shouldShowVisualBlock: true,
      conversationMode: "act",
      nextQuestion: "Quer manter o serviço e trocar só o profissional?",
    }
  }

  if (hasAny(normalized, ["nao gostei", "não gostei"])) {
    return {
      text: "Justo. Não vou insistir nessa opção. Pelo que você vinha buscando, talvez ela tenha ficado moderna demais; eu iria para algo mais discreto antes de mostrar outro card.",
      actionRequest: { type: "none", reason: "rejection_should_reflect_before_new_cards" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "reflect",
      nextQuestion: "Quer uma alternativa mais discreta ou outro profissional?",
    }
  }

  if (hasAny(normalized, ["algo discreto", "mais discreto", "discreto", "discreta", "arrumado", "arrumada"])) {
    return {
      text: "Discreto combina com um corte mais limpo, sem contraste forte. Eu iria por lateral controlada, topo alinhado e acabamento natural, para ficar arrumado sem parecer mudança brusca. Você quer manter bem clássico ou aceita um detalhe mais moderno?",
      actionRequest: { type: "none", reason: "style_preference_discreet_answer" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "recommend",
      nextQuestion: "Você quer manter bem clássico ou aceita um detalhe mais moderno?",
    }
  }

  if (history.length > 0 || memory.activeIntent) {
    return {
      text: `Beleza, voltando ao ponto anterior. Eu refinaria a escolha sem recomeçar tudo do zero.`,
      actionRequest: { type: "none", reason: "ambiguous_followup_uses_memory" },
      shouldUseLegacyResolver: false,
      shouldShowVisualBlock: false,
      conversationMode: "reflect",
      nextQuestion: "Você quer ajustar opção, preço ou horário?",
    }
  }

  return {
    text: `Para te ajudar bem na ${brandName}, eu ligaria isso a ${targets.domain} antes de escolher no impulso. Me diz o foco principal e eu sigo por um caminho mais simples.`,
    actionRequest: { type: "none", reason: "safe_default_no_tool" },
    shouldUseLegacyResolver: false,
    shouldShowVisualBlock: false,
    conversationMode: "clarify",
    nextQuestion: targets.focusQuestion,
  }
}
