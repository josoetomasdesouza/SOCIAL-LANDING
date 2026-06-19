const INTERNAL_LANGUAGE_CUES = [
  "resolver",
  "classifier",
  "classificador",
  "intent",
  "toolRoute",
  "actionRequest",
  "questionContract",
  "topicStack",
  "fallback",
  "pipeline",
  "LLM brain",
  "routing",
  "metadata",
]

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

export function hasInternalLanguage(value: string) {
  const normalized = normalize(value)
  return INTERNAL_LANGUAGE_CUES.some((cue) => normalized.includes(normalize(cue)))
}

export function guardInternalLanguage(text: string) {
  if (!hasInternalLanguage(text)) return text

  if (hasInternalLanguage(text) && /pergunt|por que|decid|mudou|usou|veio/i.test(text)) {
    return "Pelo que temos disponível e pela conversa até aqui, eu respondi tentando manter o assunto mais provável. Se ficou ambíguo, eu posso reformular de forma mais direta."
  }

  return "Pelo que temos disponível, eu não tenho confirmação suficiente para prometer esse ponto. O caminho seguro é verificar antes de afirmar."
}
