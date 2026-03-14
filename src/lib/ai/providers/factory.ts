import { AIProvider, AIProviderConfig } from '../types'
import { GroqAIProvider } from './groq'
import { ClaudeAIProvider } from './claude'

/**
 * AI Provider Factory
 * Creates provider instances based on environment or config
 *
 * Usage:
 *   const provider = createAIProvider('groq') // Uses VITE_GROQ_API_KEY
 *   const provider = createAIProvider('claude') // Uses VITE_CLAUDE_API_KEY
 *   const provider = createAIProvider('groq', { apiKey: '...' }) // Custom config
 */

export type ProviderType = 'groq' | 'claude' | 'openai' | 'gemini'

/**
 * Get API key from environment variables
 */
function getApiKeyFromEnv(provider: ProviderType): string {
  const envVars: Record<ProviderType, string> = {
    groq: import.meta.env.VITE_GROQ_API_KEY || '',
    claude: import.meta.env.VITE_CLAUDE_API_KEY || '',
    openai: import.meta.env.VITE_OPENAI_API_KEY || '',
    gemini: import.meta.env.VITE_GEMINI_API_KEY || '',
  }

  const apiKey = envVars[provider]
  if (!apiKey) {
    throw new Error(
      `Missing API key for ${provider}. Set VITE_${provider.toUpperCase()}_API_KEY environment variable`
    )
  }
  return apiKey
}

/**
 * Create AI Provider instance
 */
export function createAIProvider(
  provider: ProviderType,
  config?: Partial<AIProviderConfig>
): AIProvider {
  const apiKey = config?.apiKey || getApiKeyFromEnv(provider)

  const baseConfig: AIProviderConfig = {
    apiKey,
    temperature: config?.temperature ?? 0.7,
    maxTokens: config?.maxTokens ?? 2048,
    model: config?.model,
  }

  switch (provider) {
    case 'groq':
      return new GroqAIProvider(baseConfig)
    case 'claude':
      return new ClaudeAIProvider(baseConfig)
    // TODO: Implement OpenAI and Gemini providers
    // case 'openai':
    //   return new OpenAIProvider(baseConfig)
    // case 'gemini':
    //   return new GeminiProvider(baseConfig)
    default:
      throw new Error(`Unsupported AI provider: ${provider}`)
  }
}

/**
 * Get default provider from env or config
 * Default: Groq (development), Claude (production)
 */
export function getDefaultAIProvider(): AIProvider {
  // Development: use Groq for faster feedback and cost
  if (import.meta.env.DEV) {
    try {
      return createAIProvider('groq')
    } catch {
      console.warn('Groq API key not found, falling back to Claude')
    }
  }

  // Production: use Claude for better quality
  return createAIProvider('claude')
}

/**
 * List available providers
 */
export const AVAILABLE_PROVIDERS: Record<ProviderType, string> = {
  groq: 'Groq (Development, Fast, Cheap)',
  claude: 'Claude (Production, Premium)',
  openai: 'OpenAI (Coming soon)',
  gemini: 'Gemini (Coming soon)',
}
