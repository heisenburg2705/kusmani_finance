import { useRef, useEffect, useState } from 'react'
import { useAIAgent, AgentMessage } from '@hooks/useAIAgent'
import { formatRupiah } from '@lib/formatters'

interface AgentChatProps {
  selectedPocketId?: string
}

export function AgentChat({ selectedPocketId }: AgentChatProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useAIAgent()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    const userInput = input
    setInput('')
    sendMessage(userInput, selectedPocketId)
  }

  return (
    <div className="card flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">🤖 AI Financial Agent</h2>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 py-2">
        {messages.length === 0 && (
          <div className="text-center py-8 text-slate-600">
            <p className="mb-2">👋 Halo! Saya adalah AI Financial Agent Anda.</p>
            <p className="text-sm">Coba tanyakan: "Berapa saldo saya?" atau "Catat pengeluaran makan 50rb"</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-200 text-slate-900 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>

              {/* Tool Execution Display */}
              {message.toolCalls && message.toolCalls.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-300/50 space-y-1">
                  {message.toolCalls.map((toolCall, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-slate-300/30 p-2 rounded font-mono"
                    >
                      <p>
                        <strong>🔧 {toolCall.name}</strong>
                      </p>
                      {toolCall.result && (
                        <p className="text-green-700">✓ Success: {JSON.stringify(toolCall.result).slice(0, 50)}...</p>
                      )}
                      {toolCall.error && (
                        <p className="text-red-700">✗ Error: {toolCall.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {message.isLoading && <p className="text-xs mt-1">⏳ Processing...</p>}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-200 text-slate-900 px-4 py-3 rounded-lg rounded-bl-none">
              <p className="text-sm">💭 AI is thinking...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t border-slate-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanya AI agent..."
          className="flex-1 input-field"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="btn-primary px-6"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? '⏳' : '➤'}
        </button>
      </form>

      {/* Help Text */}
      <div className="mt-2 text-xs text-slate-500 space-y-1">
        <p>💡 Tips:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>"Catat pengeluaran makan 35rb"</li>
          <li>"Berapa saldo saya?"</li>
          <li>"Analisis pengeluaran 30 hari terakhir"</li>
        </ul>
      </div>
    </div>
  )
}
