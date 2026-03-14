import { BaseAIProvider } from './base'
import { AIResponse, Message, Tool, AIProviderConfig } from '../types'

/**
 * Groq AI Provider - using gpt-oss-120b model
 * Groq is fast and perfect for development/testing
 * Easily switchable to other providers later
 */
export class GroqAIProvider extends BaseAIProvider {
  private apiUrl = 'https://api.groq.com/openai/v1/chat/completions'

  constructor(config: AIProviderConfig) {
    super(config)
    this.providerName = 'Groq'
    this.modelName = config.model || 'mixtral-8x7b-32768'
  }

  async chat(
    messages: Message[],
    tools?: Tool[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<AIResponse> {
    try {
      const payload = {
        model: this.modelName,
        messages: messages,
        temperature: options?.temperature ?? this.config.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? this.config.maxTokens ?? 2048,
        tools: tools ? this.convertTools(tools) : undefined,
        tool_choice: tools ? 'auto' : undefined,
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Groq API error: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      return this.parseResponse(data)
    } catch (error) {
      console.error('Groq API error:', error)
      throw error
    }
  }

  /**
   * Convert tools to Groq format (compatible with OpenAI format)
   */
  protected convertTools(tools: Tool[]) {
    return tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.input_schema,
      },
    }))
  }

  /**
   * Parse Groq response (OpenAI compatible format)
   */
  protected parseResponse(response: unknown): AIResponse {
    const data = response as {
      choices: Array<{
        message: {
          content: string | null
          tool_calls?: Array<{
            id: string
            function: {
              name: string
              arguments: string
            }
          }>
        }
        finish_reason: string
      }>
    }

    const message = data.choices[0].message
    const finishReason = data.choices[0].finish_reason as 'end_turn' | 'tool_use' | 'max_tokens'

    return {
      content: message.content || '',
      tool_calls: message.tool_calls
        ? message.tool_calls.map((call) => ({
            id: call.id,
            name: call.function.name,
            arguments: JSON.parse(call.function.arguments),
          }))
        : undefined,
      stop_reason: finishReason === 'tool_calls' ? 'tool_use' : (finishReason as any),
    }
  }
}
