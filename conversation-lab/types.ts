export type LabSeverity = "P0" | "P1" | "P2" | "P3"

export type LabDomain =
  | "barbearia"
  | "estetica"
  | "restaurante"
  | "consultorio"
  | "loja"
  | "produto"
  | "futebol"
  | "clima"
  | "noticia"
  | "tecnologia"
  | "relacionamento"
  | "financas"
  | "saude_leve"
  | "comparacao_compra"
  | "mudanca_assunto"
  | "retomada_assunto"

export type LabTool =
  | "none"
  | "catalog"
  | "booking"
  | "schedule"
  | "service_lookup"
  | "product_lookup"
  | "web_search"
  | "weather"
  | "sports"
  | "news"
  | "time"
  | "reasoning"

export interface ScenarioSeed {
  id: string
  title: string
  domain: LabDomain
  persona: string
  initialGoal: string
  cognitivePattern: string
  businessVertical?: "appointment" | "restaurant" | "health" | "commerce" | "general"
  topicShifts: string[]
  implicitFollowUps: string[]
  operationalQuestions: string[]
  generalQuestions: string[]
  ambiguousQuestions: string[]
}

export interface LabTopicFrame {
  topic: string
  state: "active" | "paused" | "closed"
}

export interface LabConversationTurn {
  index: number
  user: string
  assistant: string
  expectedTool: LabTool
  actualTool: LabTool
  topicStackBefore: LabTopicFrame[]
  topicStackAfter: LabTopicFrame[]
  actionRequest: "none" | "show_options" | "show_schedule" | "show_price" | "show_professionals"
  visualBlock: boolean
  expectedBehavior: string
  injectedFailure?: string
}

export interface LabConversation {
  id: string
  mode?: "mock" | "real-agent"
  scenarioId: string
  scenarioTitle: string
  persona: string
  initialGoal: string
  domain: LabDomain
  cognitivePattern: string
  generatedAt: string
  turns: LabConversationTurn[]
}

export interface LabFinding {
  severity: LabSeverity
  category:
    | "question_satisfaction"
    | "continuity"
    | "tool_use"
    | "naturalness"
    | "no_leak"
    | "invented_data"
  message: string
  turnIndex: number
  user: string
  assistant: string
}

export interface EvaluatorResult {
  name: string
  score: number
  findings: LabFinding[]
}

export interface ConversationJudgement {
  conversationId: string
  scenarioId: string
  scenarioTitle: string
  persona: string
  overallScore: number
  satisfactionRate: number
  findings: LabFinding[]
  evaluatorResults: EvaluatorResult[]
}

export interface LabSummary {
  generatedAt: string
  sourceFile: string
  conversationCount: number
  turnCount: number
  satisfactionRate: number
  severityCounts: Record<LabSeverity, number>
  categoryCounts: Record<LabFinding["category"], number>
  progressMetrics?: {
    blocked_response_rate: number
    slot_recovery_rate: number
    progress_delta_distribution: Record<"ADVANCES" | "NEUTRAL" | "BLOCKS", number>
    invented_data_count: number
  }
  worstConversations: Array<{
    conversationId: string
    scenarioTitle: string
    overallScore: number
    findingCount: number
  }>
}
