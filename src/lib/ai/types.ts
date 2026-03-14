/**
 * AI Provider abstraction types
 * Provider-agnostic interfaces untuk switch antara Groq, Claude, OpenAI, Gemini
 */

/**
 * Role dalam conversation
 */
export type MessageRole = 'user' | 'assistant' | 'system'

/**
 * Message dalam conversation
 */
export interface Message {
  role: MessageRole
  content: string
}

/**
 * Tool call hasil dari AI
 */
export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

/**
 * Tool result / output
 */
export interface ToolResult {
  tool_call_id: string
  content: string
  is_error?: boolean
}

/**
 * Response dari AI provider
 */
export interface AIResponse {
  content: string
  tool_calls?: ToolCall[]
  stop_reason: 'end_turn' | 'tool_use' | 'max_tokens'
}

/**
 * Tool definition - consistent across all providers
 */
export interface Tool {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, {
      type: string
      description: string
      enum?: string[]
    }>
    required: string[]
  }
}

/**
 * Configuration untuk AI Provider
 */
export interface AIProviderConfig {
  apiKey: string
  model?: string
  temperature?: number
  maxTokens?: number
  [key: string]: unknown
}

/**
 * Abstract interface untuk AI Provider
 */
export interface AIProvider {
  /**
   * Send message ke AI dan get response
   */
  chat(
    messages: Message[],
    tools?: Tool[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<AIResponse>

  /**
   * Get list of available tools
   */
  getTools(): Tool[]

  /**
   * Get provider name
   */
  getName(): string

  /**
   * Get model name
   */
  getModel(): string
}

/**
 * Agent state untuk persistence
 */
export interface AgentState {
  conversation_id: string
  user_id: string
  pocket_id?: string
  messages: Message[]
  created_at: string
  updated_at: string
}

/**
 * Tool execution request
 */
export interface ToolExecutionRequest {
  tool_name: string
  arguments: Record<string, unknown>
  user_id: string
  pocket_id?: string
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult {
  success: boolean
  data?: unknown
  error?: string
  executed_at: string
}
