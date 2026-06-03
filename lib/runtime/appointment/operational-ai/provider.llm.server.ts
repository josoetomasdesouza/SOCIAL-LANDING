import { buildOperationalAiLlmMessages } from "./prompts/build-prompt.server"
import { parseOperationalAiPatchResponse } from "./parse-output.server"
import type { OperationalAiProvider } from "./provider.interface"
import { OPERATIONAL_AI_PROVIDER_LLM, type OperationalAiInput } from "./types"

const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1"
const DEFAULT_LLM_MODEL = "gpt-4o-mini"
const DEFAULT_LLM_TIMEOUT_MS = 30_000

function resolveLlmApiKey(): string {
  const key =
    process.env.APPOINTMENT_AI_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    ""

  if (!key) {
    throw new Error("LLM provider requires APPOINTMENT_AI_API_KEY or OPENAI_API_KEY")
  }

  return key
}

function resolveLlmModel(): string {
  return process.env.APPOINTMENT_AI_MODEL?.trim() || DEFAULT_LLM_MODEL
}

function resolveLlmBaseUrl(): string {
  return process.env.APPOINTMENT_AI_BASE_URL?.trim().replace(/\/$/, "") || DEFAULT_OPENAI_BASE_URL
}

async function callOpenAiCompatibleChat(input: OperationalAiInput) {
  const apiKey = resolveLlmApiKey()
  const model = resolveLlmModel()
  const baseUrl = resolveLlmBaseUrl()
  const messages = buildOperationalAiLlmMessages(input)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), DEFAULT_LLM_TIMEOUT_MS)

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: messages.system },
          { role: "user", content: messages.user },
        ],
      }),
      signal: controller.signal,
    })

    const payload = (await response.json()) as {
      error?: { message?: string }
      choices?: Array<{ message?: { content?: string | null } }>
    }

    if (!response.ok) {
      throw new Error(payload.error?.message ?? `LLM request failed with status ${response.status}`)
    }

    const content = payload.choices?.[0]?.message?.content

    if (!content?.trim()) {
      throw new Error("LLM response missing message content")
    }

    return {
      content,
      model,
    }
  } finally {
    clearTimeout(timeout)
  }
}

export const llmOperationalAiProvider: OperationalAiProvider = {
  id: OPERATIONAL_AI_PROVIDER_LLM,
  async generatePatch(input) {
    const response = await callOpenAiCompatibleChat(input)
    const patch = parseOperationalAiPatchResponse(response.content, input.adaptationKind)

    return {
      patch,
      model: response.model,
      rawResponse: response.content,
    }
  },
}
