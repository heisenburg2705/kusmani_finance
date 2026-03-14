import { BaseAIProvider } from './base'
import { AIResponse, Message, Tool, AIProviderConfig } from '../types'
import Anthropic from '@anthropic-ai/sdk'
import type { Message as AnthropicMessage } from '@anthropic-ai/sdk/resources/messages'

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
      const systemPrompt = messages[0]?.role === 'system' ? messages[0].content : undefined
      const chatMessages = messages[0]?.role === 'system' ? messages.slice(1) : messages

      // Convert to Anthropic message format (only user/assistant roles)
      const anthropicMessages = chatMessages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))

      const messageParams = {
        model: this.modelName,
        max_tokens: options?.maxTokens ?? this.config.maxTokens ?? 2048,
        temperature: options?.temperature ?? this.config.temperature ?? 0.7,
        system: systemPrompt,
        messages: anthropicMessages,
        ...(tools && { tools: this.convertTools(tools) }),
      } as Parameters<typeof this.client.messages.create>[0]

      const response = await this.client.messages.create(messageParams)

      // Handle non-streaming response
      if ('id' in response && 'content' in response) {
        return this.parseResponse(response as AnthropicMessage)
      }

      // If we get a stream, something went wrong since we didn't request streaming
      throw new Error('Unexpected streaming response from Claude API')
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
  protected parseResponse(response: AnthropicMessage): AIResponse {
    let textContent = ''
    const toolCalls = []

    for (const block of response.content) {
      if (block.type === 'text') {
        // Handle text block
        textContent += (block as unknown as { text: string }).text
      } else if (block.type === 'tool_use') {
        // Handle tool use block
        const toolUseBlock = block as unknown as { id: string; name: string; input: unknown }
        toolCalls.push({
          id: toolUseBlock.id,
          name: toolUseBlock.name,
          arguments: toolUseBlock.input as Record<string, unknown>,
        })
      }
    }

    // Determine stop reason - SDK uses 'stop_sequence' instead of 'tool_use'
    const stopReason = response.stop_reason === 'stop_sequence' && toolCalls.length > 0 ? 'tool_use' : 'end_turn'

    return {
      content: textContent,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      stop_reason: stopReason,
    }
  }
}
