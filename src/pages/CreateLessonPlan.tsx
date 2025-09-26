import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Sidebar from '../components/Sidebar'
import { Button } from '../components/ui/button'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  createLessonPlan,
  generateAILessonPlan,
  API_BASE_URL,
} from '../lib/api'

const gradeOptions = [...Array(12)].map((_, i) => ({
  value: (i + 1).toString(),
  label: `Grade ${i + 1}`,
}))

const subjectOptions = [
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'English', label: 'English' },
  { value: 'Science', label: 'Science' },
  { value: 'History', label: 'History' },
  { value: 'Geography', label: 'Geography' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Biology', label: 'Biology' },
  { value: 'IT', label: 'IT' },
  { value: 'Art', label: 'Art' },
  { value: 'Music', label: 'Music' },
  { value: 'HPE', label: 'HPE' },
  { value: 'Foreign Languages', label: 'Foreign Languages' },
  { value: 'Social Studies', label: 'Social Studies' },
  { value: 'Economics', label: 'Economics' },
  { value: 'Psychology', label: 'Psychology' },
  { value: 'Literature', label: 'Literature' },
  { value: 'Afan Oromo', label: 'Afan Oromo' },
  { value: 'Amharic', label: 'Amharic' },
]

const CreateLessonPlan: React.FC = () => {
  const { accessToken } = useAuth()
  const { theme, isLight } = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual')
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    grade: '',
    lessonPlan: '',
  })
  const [aiPrompt, setAiPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async (preferredType?: 'manual' | 'ai') => {
    if (isSaving) {
      return // Prevent multiple saves
    }
    if (!accessToken) {
      setError('Not authenticated')
      return
    }
    if (
      !formData.title ||
      !formData.subject ||
      !formData.grade ||
      !formData.lessonPlan.trim()
    ) {
      setError('Please fill in all required fields.')
      return
    }

    // Determine type
    let saveType: 'manual' | 'ai'
    if (preferredType) {
      saveType = preferredType
    } else if (activeTab === 'ai') {
      saveType = 'ai'
    } else {
      saveType = 'manual'
    }

    setIsSaving(true)
    setError('')
    setLoading(true) // Reuse loading for UI consistency

    try {
      const payload = {
        title: formData.title,
        description: formData.lessonPlan,
        subject: formData.subject,
        grade: formData.grade,
        type: saveType,
      }

      await createLessonPlan(accessToken, payload)
      setError('Lesson plan created successfully')
      navigate('/lesson-planner')
    } catch (error) {
      setError('Failed to create lesson plan')
    } finally {
      setLoading(false)
      setIsSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSave(activeTab === 'ai' ? 'ai' : undefined)
  }

  const handleGenerateAI = async () => {
    if (!accessToken) {
      setError('Not authenticated')
      return
    }
    if (!formData.subject || !formData.grade || !aiPrompt) {
      setError('Please select subject, grade, and enter a topic.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await generateAILessonPlan(
        accessToken,
        formData.grade,
        aiPrompt,
        formData.subject
      )
      // Navigate to the details page of the newly generated lesson plan
      navigate(`/teacher-lesson-plan/${data.lessonPlan._id}`)
    } catch (error: any) {
      let errorMessage = 'Failed to generate lesson plan'

      if (error.message) {
        const message = error.message.toLowerCase()

        if (message.includes('quota') || message.includes('billing')) {
          errorMessage =
            'AI service quota exceeded. Please try again later or contact administrator.'
        } else if (message.includes('payment') || message.includes('402')) {
          errorMessage =
            'AI service payment required. Please contact administrator.'
        } else if (
          message.includes('api key') ||
          message.includes('unauthorized')
        ) {
          errorMessage =
            'AI service configuration issue. Please contact administrator.'
        } else if (message.includes('network') || message.includes('timeout')) {
          errorMessage =
            'Network error. Please check your connection and try again.'
        } else if (message.includes('service not available')) {
          errorMessage =
            'AI services are currently unavailable. Please try manual creation or contact administrator.'
        } else {
          errorMessage = error.message
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        <h1
          className={`text-3xl font-bold mb-6 ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}
        >
          Create Lesson Plan
        </h1>
        <div
          className={`max-w-4xl mx-auto ${
            isLight ? 'bg-white' : 'bg-white/10 backdrop-blur-xl'
          } rounded-lg shadow p-6`}
        >
          {/* Error Display */}
          {error && (
            <div
              className={`mb-4 p-3 rounded ${
                isLight
                  ? 'bg-red-100 border-red-400 text-red-700'
                  : 'bg-red-900/20 border-red-800 text-red-200'
              }`}
            >
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b mb-6">
            <Button
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-2 ${
                activeTab === 'manual'
                  ? 'border-b-2 border-violet-500 text-violet-500'
                  : 'text-gray-500'
              }`}
            >
              Manual
            </Button>
            <Button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 ${
                activeTab === 'ai'
                  ? 'border-b-2 border-violet-500 text-violet-500'
                  : 'text-gray-500'
              }`}
            >
              AI
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === 'manual' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${
                    isLight
                      ? 'bg-white text-gray-900'
                      : 'bg-white/10 text-white placeholder-gray-400'
                  }`}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${
                      isLight
                        ? 'bg-white text-gray-900'
                        : 'bg-gray-800/50 text-white placeholder-gray-400'
                    }`}
                    required
                  >
                    <option value="" disabled selected>
                      Select subject
                    </option>
                    {subjectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Grade
                  </label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${
                      isLight
                        ? 'bg-white text-gray-900'
                        : 'bg-gray-800/50 text-white placeholder-gray-400'
                    }`}
                    required
                  >
                    <option value="" disabled selected>
                      Select grade
                    </option>
                    {gradeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Lesson Plan
                </label>
                <textarea
                  name="lessonPlan"
                  value={formData.lessonPlan}
                  onChange={handleInputChange}
                  rows={10}
                  className={`w-full p-2 border rounded ${
                    isLight
                      ? 'bg-white text-gray-900'
                      : 'bg-white/10 text-white placeholder-gray-400'
                  }`}
                  required
                  placeholder="Combine description, objectives, materials, activities, and assessment here..."
                />
              </div>
              <Button type="submit" disabled={isSaving || loading}>
                {isSaving || loading ? 'Creating...' : 'Create Lesson Plan'}
              </Button>
            </form>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${
                      isLight
                        ? 'bg-white text-gray-900'
                        : 'bg-gray-800/50 text-white placeholder-gray-400'
                    }`}
                    required
                  >
                    <option value="" disabled selected>
                      Select subject
                    </option>
                    {subjectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Grade
                  </label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${
                      isLight
                        ? 'bg-white text-gray-900'
                        : 'bg-gray-800/50 text-white placeholder-gray-400'
                    }`}
                    required
                  >
                    <option value="" disabled selected>
                      Select grade
                    </option>
                    {gradeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Topic</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Enter the topic for the lesson plan..."
                  rows={5}
                  className={`w-full p-2 border rounded ${
                    isLight
                      ? 'bg-white text-gray-900'
                      : 'bg-white/10 text-white placeholder-gray-400'
                  }`}
                />
              </div>
              <Button onClick={handleGenerateAI} disabled={loading}>
                {loading ? 'Generating...' : 'Generate with AI'}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default CreateLessonPlan
