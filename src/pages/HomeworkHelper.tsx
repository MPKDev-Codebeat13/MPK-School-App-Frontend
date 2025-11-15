import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { sendHomeworkChat } from '../lib/api'

interface Message {
  id: number
  sender: 'user' | 'ai'
  content: string
}

const HomeworkHelper: React.FC = () => {
  const { user, accessToken } = useAuth()
  const { theme, isLight } = useTheme()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'Teacher':
        return '/lesson-planner'
      case 'Department':
        return '/check-lesson-plans'
      case 'Admin':
        return '/manage-users-page'
      default:
        return '/'
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'Student') {
      alert('Access denied. You do not have permission to access this page.')
      navigate(getDashboardPath(user.role))
      return
    }
  }, [user, navigate])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !accessToken) return
    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      content: input.trim(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const data = await sendHomeworkChat(accessToken, userMessage.content)
      const aiMessage: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        content: data.answer || 'Sorry, I could not find an answer.',
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Homework chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          content:
            'Error: Failed to get response from server. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      sendMessage()
    }
  }

  return (
    <div className={`min-h-screen overflow-x-hidden ${theme}`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div
        className={`flex flex-col p-4 sm:p-6 bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg ${
          isSidebarOpen ? 'sm:ml-64' : ''
        }`}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
          Homework Helper
        </h1>
        <div
          className="flex-1 overflow-y-auto mb-4 p-3 sm:p-4 border rounded-lg shadow-inner"
          style={{ maxHeight: '70vh' }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 max-w-xs sm:max-w-xl p-2 sm:p-3 rounded-lg text-sm sm:text-base ${
                msg.sender === 'user'
                  ? 'bg-violet-500 text-white self-end'
                  : 'bg-gray-300 text-gray-900 self-start'
              }`}
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            className={`flex-1 p-3 rounded-lg border text-sm sm:text-base ${
              isLight ? 'border-gray-300' : 'border-gray-700 bg-gray-800'
            } focus:outline-none focus:ring-2 focus:ring-violet-400`}
            placeholder="Ask your homework question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`px-4 sm:px-6 py-3 rounded-lg text-white text-sm sm:text-base ${
              loading || !input.trim()
                ? 'bg-violet-300 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-700'
            } transition-colors duration-200 w-full sm:w-auto`}
          >
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomeworkHelper
