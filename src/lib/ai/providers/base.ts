import { AIProvider, AIResponse, Message, Tool, AIProviderConfig } from '../types'

/**
 * Abstract base class untuk semua AI Providers
 * Implement interface ini untuk support provider baru
 */
export abstract class BaseAIProvider implements AIProvider {
  protected config: AIProviderConfig
  protected tools: Tool[] = []
  protected modelName: string = 'unknown'
  protected providerName: string = 'unknown'

  constructor(config: AIProviderConfig) {
    this.config = config
    this.validateConfig()
  }

  /**
   * Validate provider configuration
   * Override untuk custom validation per provider
   */
  protected validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error(`${this.providerName}: Missing API key`)
    }
  }

  /**
   * Send message ke AI provider
   * Implement di subclass
   */
  abstract chat(
    messages: Message[],
    tools?: Tool[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<AIResponse>

  /**
   * Get tools for this provider
   */
  getTools(): Tool[] {
    return this.tools
  }

  /**
   * Set tools untuk provider
   */
  setTools(tools: Tool[]): void {
    this.tools = tools
  }

  /**
   * Get provider name
   */
  getName(): string {
    return this.providerName
  }

  /**
   * Get model name
   */
  getModel(): string {
    return this.modelName
  }

  /**
   * Convert tools to provider-specific format
   * Override jika provider punya format berbeda
   */
  protected convertTools(tools: Tool[]): unknown {
    return tools
  }

  /**
   * Parse response from provider
   * Override jika response format berbeda
   */
  protected abstract parseResponse(response: unknown): AIResponse
}
