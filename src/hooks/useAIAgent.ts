import { useState, useCallback } from 'react'
import { Message, AIResponse } from '@lib/ai/types'
import { getDefaultAIProvider } from '@lib/ai/providers/factory'
import { AGENT_TOOLS, isDestructiveTool } from '@lib/ai/tools'
import { executeTool } from '@lib/ai/toolExecutor'
import { createSystemPrompt } from '@lib/claude'
import { useAuth } from './useAuth'
import { usePockets } from './usePockets'
import toast from 'react-hot-toast'

export interface AgentMessage extends Message {
  isLoading?: boolean
  toolCalls?: Array<{
    name: string
    arguments: Record<string, unknown>
    result?: unknown
    error?: string
  }>
}

export function useAIAgent() {
  const { user, profile } = useAuth()
  const { data: pockets = [] } = usePockets()
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Send message dan get AI response
   */
  const sendMessage = useCallback(
    async (userMessage: string, selectedPocketId?: string) => {
      if (!user || !profile) {
        toast.error('User information not available')
        return
      }

      setIsLoading(true)

      try {
        // Add user message
        const newUserMessage: AgentMessage = {
          role: 'user',
          content: userMessage,
        }
        setMessages((prev) => [...prev, newUserMessage])

        // Get AI provider
        const provider = getDefaultAIProvider()

        // Create system prompt
        const systemPrompt = createSystemPrompt(
          profile.display_name || profile.username || user.email || 'User',
          pockets.map((p) => ({ id: p.id, name: p.name, balance: p.balance }))
        )

        // Prepare messages for AI
        const messagesForAI: Message[] = [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          newUserMessage,
        ]

        // Get response from AI
        let response: AIResponse
        try {
          response = await provider.chat(messagesForAI, AGENT_TOOLS)
        } catch (error) {
          toast.error('AI Service error: ' + String(error))
          throw error
        }

        // Add assistant response
        const assistantMessage: AgentMessage = {
          role: 'assistant',
          content: response.content,
          toolCalls: response.tool_calls?.map((tc) => ({
            name: tc.name,
            arguments: tc.arguments,
          })),
        }
        setMessages((prev) => [...prev, assistantMessage])

        // Execute tool calls if any
        if (response.tool_calls && response.tool_calls.length > 0) {
          for (const toolCall of response.tool_calls) {
            // Check if tool is destructive and ask for confirmation
            if (isDestructiveTool(toolCall.name)) {
              const shouldProceed = window.confirm(
                `AI ingin execute tool "${toolCall.name}" dengan arguments: ${JSON.stringify(toolCall.arguments)}.\n\nLanjutkan?`
              )

              if (!shouldProceed) {
                // Add user rejection message
                const rejectionMessage: AgentMessage = {
                  role: 'user',
                  content: `User rejected tool execution for ${toolCall.name}`,
                }
                setMessages((prev) => [...prev, rejectionMessage])
                continue
              }
            }

            // Execute tool
            const result = await executeTool({
              tool_name: toolCall.name,
              arguments: toolCall.arguments,
              user_id: user.id,
              pocket_id: selectedPocketId,
            })

            // Update tool call with result
            setMessages((prev) => {
              const updatedMessages = [...prev]
              const lastAssistantMsg = updatedMessages[updatedMessages.length - 1]
              if (lastAssistantMsg.toolCalls) {
                const toolCallIndex = lastAssistantMsg.toolCalls.findIndex(
                  (tc) => tc.name === toolCall.name
                )
                if (toolCallIndex >= 0) {
                  if (result.success) {
                    lastAssistantMsg.toolCalls[toolCallIndex].result = result.data
                  } else {
                    lastAssistantMsg.toolCalls[toolCallIndex].error = result.error
                  }
                }
              }
              return updatedMessages
            })

            // Add tool result to conversation
            const toolResultMessage: AgentMessage = {
              role: 'user',
              content: `Tool ${toolCall.name} executed: ${JSON.stringify(result)}`,
            }
            setMessages((prev) => [...prev, toolResultMessage])

            // Get follow-up response from AI based on tool result
            const followUpMessages: Message[] = [
              { role: 'system', content: systemPrompt },
              ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
              newUserMessage,
              { role: 'assistant', content: response.content },
              toolResultMessage,
            ]

            const followUpResponse = await provider.chat(followUpMessages, AGENT_TOOLS)

            const followUpMessage: AgentMessage = {
              role: 'assistant',
              content: followUpResponse.content,
            }
            setMessages((prev) => [...prev, followUpMessage])
          }
        }
      } catch (error) {
        console.error('AI Agent error:', error)
        toast.error('Agent error: ' + String(error))
      } finally {
        setIsLoading(false)
      }
    },
    [user, profile, messages, pockets]
  )

  /**
   * Clear conversation
   */
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  }
}
