import { BaseAIProvider } from './base'
import { AIResponse, Message, Tool, AIProviderConfig } from '../types'
import Anthropic from '@anthropic-ai/sdk'

/**
 * Claude AI Provider
 * Premium option - use when need better reasoning
 * Easy swap from Groq
 */
export class ClaudeAIProvider extends BaseAIProvider {
  private client: Anthropic

  constructor(config: AIProviderConfig) {
    super(config)
    this.providerName = 'Claude'
    this.modelName = config.model || 'claude-3-5-sonnet-20241022'
    this.client = new Anthropic({ apiKey: this.config.apiKey })
  }

  async chat(
    messages: Message[],
    tools?: Tool[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<AIResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.modelName,
        max_tokens: options?.maxTokens ?? this.config.maxTokens ?? 2048,
        temperature: options?.temperature ?? this.config.temperature ?? 0.7,
        system: messages[0]?.role === 'system' ? messages[0].content : undefined,
        messages: messages[0]?.role === 'system' ? messages.slice(1) : messages,
        tools: tools ? (this.convertTools(tools) as any) : undefined,
      })

      return this.parseResponse(response)
    } catch (error) {
      console.error('Claude API error:', error)
      throw error
    }
  }

  /**
   * Convert tools to Claude format
   */
  protected convertTools(tools: Tool[]) {
    return tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema,
    }))
  }

  /**
   * Parse Claude response
   */
  protected parseResponse(response: any): AIResponse {
    const textBlock = response.content.find((block: any) => block.type === 'text')
    const toolUseBlocks = response.content.filter((block: any) => block.type === 'tool_use')

    return {
      content: textBlock?.text || '',
      tool_calls: toolUseBlocks.length > 0
        ? toolUseBlocks.map((block: any) => ({
            id: block.id,
            name: block.name,
            arguments: block.input,
          }))
        : undefined,
      stop_reason: response.stop_reason === 'tool_use' ? 'tool_use' : 'end_turn',
    }
  }
}
