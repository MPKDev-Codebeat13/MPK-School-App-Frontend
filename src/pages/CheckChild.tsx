import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { API_BASE_URL } from '../lib/api'
import Sidebar from '../components/Sidebar'
import { Bot, Send } from 'lucide-react'

const CheckChild: React.FC = () => {
  const { accessToken: token } = useAuth()
  const { theme } = useTheme()

  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [loadingAi, setLoadingAi] = useState(false)

  const handleAiQuerySubmit = async () => {
    if (!aiQuery.trim()) return
    setLoadingAi(true)
    setAiResponse(null)
    try {
      const response = await fetch(API_BASE_URL + '/parent/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: aiQuery.trim() }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        setAiResponse(errorData.error || 'Failed to get AI response.')
        setLoadingAi(false)
        return
      }
      const data = await response.json()
      setAiResponse(data.answer)
    } catch (error) {
      setAiResponse('Error getting AI response.')
    }
    setLoadingAi(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !loadingAi) {
      e.preventDefault()
      handleAiQuerySubmit()
    }
  }

  return (
    <div className={`flex min-h-screen ${theme.class}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <Bot className="w-16 h-16 mx-auto mb-4 text-violet-500" />
            <h1 className="text-4xl font-bold mb-2">
              AI Assistant for Parents
            </h1>
            <p className="text-lg opacity-80">
              Get personalized advice and support for your parenting journey.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Ask your question:
              </label>
              <textarea
                className="w-full p-4 rounded-xl resize-none border-0 focus:ring-2 focus:ring-violet-400 bg-white/20 text-current"
                rows={4}
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., How can I help my child with homework?"
                disabled={loadingAi}
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleAiQuerySubmit}
                disabled={loadingAi || !aiQuery.trim()}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
                  loadingAi || !aiQuery.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-700 hover:scale-105 shadow-lg'
                } text-white`}
              >
                {loadingAi ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Ask AI
                  </>
                )}
              </button>
            </div>

            {aiResponse && (
              <div className="mt-8">
                <div className="p-6 rounded-xl border border-white/20 bg-white/10 text-current shadow-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-violet-500" />
                    AI Response:
                  </h3>
                  <p className="leading-relaxed">{aiResponse}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckChild
