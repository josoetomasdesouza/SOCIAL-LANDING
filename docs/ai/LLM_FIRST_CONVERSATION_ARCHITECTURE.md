# LLM-First Conversation Architecture

**Status:** provider real opcional + fallback determinístico seguro  
**Escopo:** `lib/conversation-intelligence/*`  

---

## Princípio

A conversa é conduzida por um **Conversational Brain**. Resolvers, kernel e visual blocks são ferramentas auxiliares, não o centro do turno.

```txt
message
→ memory
→ state
→ interpreter
→ conductor
→ llm-provider
→ llm-brain local se provider falhar/sem env
→ tool resolver quando actionRequest é clara
→ reply-builder
```

## Brain

Arquivo: `lib/conversation-intelligence/llm-brain.ts`

Entrada:

- `message`
- `history`
- `memory`
- `state`
- `interpretedIntent`
- `nextMove`
- `contextItems`
- `brandName`
- `vertical`
- `catalogSummary`

Saída:

```ts
{
  text: string
  actionRequest?: {
    type: "show_options" | "show_schedule" | "show_price" | "show_professionals" | "none"
    reason: string
  }
  shouldUseLegacyResolver: boolean
  shouldShowVisualBlock: boolean
  conversationMode: "answer" | "reflect" | "clarify" | "recommend" | "act" | "close"
  nextQuestion?: string
}
```

## Ferramentas

O legacy resolver só roda quando:

1. `brain.shouldUseLegacyResolver === true`
2. `brain.actionRequest.type !== "none"`
3. a intenção tem ação clara, como agenda, profissionais ou alternativas.

Cards continuam apoio visual. O texto do brain vem primeiro.

## Compatibilidade

- Resolvers antigos seguem funcionando.
- `visualBlock` mantém o contrato existente.
- `intelligence` inclui metadados novos, mas todos opcionais.
- Sem env de provider, o fallback local preserva comportamento.

## Provider

Arquivo: `lib/conversation-intelligence/llm-provider.ts`

- `CONVERSATION_LLM_PROVIDER=openai` ou `auto`
- `OPENAI_API_KEY` habilita OpenAI no servidor
- `CONVERSATION_LLM_MODEL` define o modelo, com fallback para `gpt-4o-mini`
- Browser chama `/api/conversation/llm-brain`; nunca importa SDK nem chave
- Resposta inválida, erro de rede ou ausência de env cai em `generateConversationalBrainReply`

## Guardrails

- Nunca inventar preço, agenda, disponibilidade ou confirmação.
- Dados transacionais exigem `actionRequest`.
- `show_price` não força card visual.
- `visualBlock` só aparece quando o brain autoriza e a ação é concreta.
- Fora do domínio responde breve e reconecta quando fizer sentido.

## Streaming

`ConversationalAI` possui estrutura de futuro streaming:

- `isStreaming`
- `partialAssistantMessage`
- `commitPartialAssistantMessage`
- `clearPartialAssistantMessage`

Ainda não há streaming real do provider no runtime; o contrato UI já aceita mensagem parcial sem mudar composer/drawer.

## Quality Gate

`pnpm qa:conversation-quality` avalia se a conversa parece conduzida, não apenas correta.

Critérios por resposta:

- `continuity`
- `naturalness`
- `reasoning`
- `nextStep`
- `memoryUse`
- `toolDiscipline`

O QA falha se a IA responder seco, perder contexto, inventar dado transacional ou pedir tool/card cedo demais.
