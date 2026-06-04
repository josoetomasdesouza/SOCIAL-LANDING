import { naturalizeReplyText } from "./naturalize-reply"

/** Situated fallback / mock copy — not legitimate branch or address answers. */
const AUGUSTA_GENERIC_PATTERN =
  /veja servi[cç]os e profissionais no feed|fica (na )?augusta[^.]{0,120}veja servi|me conta em uma linha|me diz em uma frase|pode te ajudar com isso rapidinho|melhor opcao\?/i

function isLegitimateOperationalReply(text: string): boolean {
  const n = text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
  return (
    /nao temos unidade|não temos unidade|cadastrada no piloto|mapa no topo|estamos em rua|desta pagina fica|desta página fica|horario de funcionamento|estacionamento/i.test(
      n
    )
  )
}

export const CHIP_AMBIGUITY_CLARIFY =
  "Você quer saber sobre esse conteúdo, preço, horário ou agendamento?"

export const NO_CHIP_CLARIFY =
  "Posso ajudar com horário, como chegar, preço ou agendar. O que você quer saber?"

export function isAugustaGenericEscape(text: string): boolean {
  if (!text?.trim()) return false
  if (isLegitimateOperationalReply(text)) return false
  return AUGUSTA_GENERIC_PATTERN.test(
    text
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
  )
}

export function blockAugustaEscape(text: string, hasChip: boolean): string {
  if (!text?.trim() || !isAugustaGenericEscape(text)) return text
  return hasChip ? CHIP_AMBIGUITY_CLARIFY : NO_CHIP_CLARIFY
}

/** @deprecated Use polishAppointmentReply */
export function blockAugustaEscapeForChipSelection(text: string, hasChip: boolean): string {
  return polishAppointmentReply(text, hasChip)
}

export function polishAppointmentReply(text: string, hasChip: boolean): string {
  if (!text?.trim()) return text
  const naturalized = naturalizeReplyText(text)
  return blockAugustaEscape(naturalized, hasChip)
}
