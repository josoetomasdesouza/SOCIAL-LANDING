import type { ConversationInterpretation, ConversationMemory, ConversationState } from "./types"

function pickVariant(options: string[], seed: string | number) {
  const text = String(seed)
  const score = [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return options[score % options.length]
}

export function buildClarifyingReply({
  brandName,
  memory,
  interpretation,
  message,
}: {
  brandName: string
  memory: ConversationMemory
  interpretation: ConversationInterpretation
  message: string
}) {
  const state = interpretation.state
  const service = state.currentService

  if (interpretation.intent === "recommendation") {
    return pickVariant(
      [
        "Boa. Para eu te indicar melhor, você quer algo mais discreto para o dia a dia ou um corte mais marcado?",
        "Certo, me ajuda com uma coisa: você quer um visual mais limpo ou algo mais evidente, tipo degradê?",
        "Fechado. Eu começaria entendendo o estilo: mais executivo e discreto, ou mais marcado nas laterais?",
      ],
      `${message}-${memory.turnCount}`
    )
  }

  if (interpretation.intent === "price" && !service) {
    return pickVariant(
      [
        "Consigo te ajudar com valor, sim. Só preciso saber se estamos falando de corte, barba ou combo.",
        "Para não chutar preço, me diz primeiro o serviço: corte, barba ou corte com barba?",
        `Boa pergunta. Na ${brandName}, o valor depende do serviço; você está pensando em corte ou barba?`,
      ],
      `${message}-${memory.turnCount}`
    )
  }

  return pickVariant(
    [
      `Para seguir sem te jogar opções aleatórias da ${brandName}, você quer falar de serviço, horário ou profissional?`,
      "Boa. Me dá só uma direção: você quer escolher o serviço, ver horário ou comparar profissionais?",
      "Certo. Antes de eu mostrar cards, me diz se o foco agora é preço, horário ou indicação.",
    ],
    `${message}-${memory.turnCount}`
  )
}

export function buildStateAwareFollowUpReply({
  state,
  contextLabel,
  message,
}: {
  state: ConversationState
  contextLabel?: string | null
  message: string
}) {
  if (state.acceptedOption) {
    return pickVariant(
      [
        "Perfeito. Com isso decidido, dá para olhar horário.",
        "Fechado. Agora vale ver disponibilidade.",
        "Boa. Se esse caminho está ok, dá para avançar para horários sem abrir mais opções.",
      ],
      message
    )
  }

  if (state.rejectedOptions.length > 0) {
    return pickVariant(
      [
        "Tranquilo. Se essa opção não bateu, eu procuraria uma alternativa mais alinhada antes de marcar.",
        "Vamos sair dessa opção e olhar outro caminho, sem insistir no que não encaixou.",
        "Boa, melhor ajustar agora. Posso buscar outra opção com o mesmo objetivo, mas outro perfil.",
      ],
      message
    )
  }

  if (contextLabel) {
    return pickVariant(
      [
        `Faz sentido. Em cima de ${contextLabel}, eu ajustaria o caminho antes de abrir novas opções.`,
        `Considerando ${contextLabel}, dá para refinar sem recomeçar a conversa.`,
        `Boa. Uso ${contextLabel} como referência e penso no caminho a partir disso.`,
      ],
      message
    )
  }

  return pickVariant(
    [
      "Me diz se você quer comparar, ver preço ou procurar outro horário.",
      "Certo. Quer ajustar opção, preço ou agenda?",
      "Boa. Para continuar sem perder contexto: quer outra opção ou quer avançar para horário?",
    ],
    message
  )
}

export function buildNaturalPrefix({
  interpretation,
  contextLabel,
  message,
}: {
  interpretation: ConversationInterpretation
  contextLabel?: string | null
  message: string
}) {
  if (interpretation.intent === "availability" && contextLabel) {
    return pickVariant(
      [
        `Como você já estava olhando ${contextLabel}, faz sentido checar horário agora.`,
        `Partindo de ${contextLabel}, dá para ver disponibilidade.`,
        `Boa. Mantendo ${contextLabel} como referência, eu olharia agenda agora.`,
      ],
      message
    )
  }

  if (interpretation.intent === "booking" && contextLabel) {
    return pickVariant(
      [
        `Perfeito, dá para seguir por ${contextLabel}.`,
        `Fechado, ${contextLabel} parece um bom caminho para avançar.`,
        `Boa escolha. Com ${contextLabel}, já dá para avançar.`,
      ],
      message
    )
  }

  if (interpretation.intent === "price" && contextLabel) {
    return pickVariant(
      [
        `Sobre ${contextLabel}, melhor olhar o serviço mais próximo desse perfil.`,
        `Para ${contextLabel}, eu usaria o serviço como referência de valor.`,
        `Pensando em ${contextLabel}, o preço precisa vir amarrado ao serviço certo.`,
      ],
      message
    )
  }

  return null
}
