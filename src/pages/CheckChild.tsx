import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { API_BASE_URL } from '../lib/api'
import Sidebar from '../components/Sidebar'
import { Bot, Send } from 'lucide-react'

const CheckChild: React.FC = () => {
  const { accessToken: token } = useAuth()
  const { theme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [loadingAi, setLoadingAi] = useState(false)

  const handleAiQuerySubmit = async () => {
    if (!aiQuery.trim()) return
    setLoadingAi(true)
    setAiResponse(null)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      const response = await fetch(API_BASE_URL + '/parent/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: aiQuery.trim() }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = 'Failed to get AI response'
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch (e) {
          // If parsing fails, use default message
        }
        setAiResponse(errorMessage)
        setLoadingAi(false)
        return
      }
      const data = await response.json()
      setAiResponse(data.answer)
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setAiResponse('Request timed out. Please try again.')
      } else {
        setAiResponse('Error getting AI response.')
      }
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
    <div
      className={`flex min-h-screen ${theme.class} ${
        isSidebarOpen ? 'flex-col sm:flex-row' : 'flex-row'
      } overflow-x-hidden`}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-6 sm:mb-8">
            <Bot className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-violet-500" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              AI Assistant for Parents
            </h1>
            <p className="text-base sm:text-lg opacity-80">
              Get personalized advice and support for your parenting journey.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20">
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium mb-2">
                Ask your question:
              </label>
              <textarea
                className="w-full p-3 sm:p-4 rounded-xl resize-none border-0 focus:ring-2 focus:ring-violet-400 bg-white/20 text-current text-sm sm:text-base"
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
                className={`flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                  loadingAi || !aiQuery.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-700 hover:scale-105 shadow-lg'
                } text-white`}
              >
                {loadingAi ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    Ask AI
                  </>
                )}
              </button>
            </div>

            {aiResponse && (
              <div className="mt-6 sm:mt-8">
                <div className="p-4 sm:p-6 rounded-xl border border-white/20 bg-white/10 text-current shadow-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" />
                    AI Response:
                  </h3>
                  <p className="leading-relaxed text-sm sm:text-base">{aiResponse}</p>
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
