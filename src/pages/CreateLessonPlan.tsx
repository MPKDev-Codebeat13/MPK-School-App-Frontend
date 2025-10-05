import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Sidebar from '../components/Sidebar'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual')
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    subject: user?.subject || '',
    grade: user?.grade || '',
    lessonPlan: '',
  })
  const [aiPrompt, setAiPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<any>(null)

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'Teacher':
        return '/lesson-planner'
      case 'Department':
        return '/check-lesson-plans'
      case 'Admin':
        return '/manage-users-page'
      case 'Parent':
        return '/check-child'
      case 'Student':
        return '/homework-helper'
      default:
        return '/'
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'Teacher') {
      navigate(getDashboardPath(user.role))
      return
    }
  }, [user])

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
    if (!aiPrompt) {
      setError('Please enter a topic.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await generateAILessonPlan(
        accessToken,
        user?.grade || '',
        aiPrompt,
        user?.subject || ''
      )
      // Set the generated plan for preview
      setGeneratedPlan(data.lessonPlan)
      // Populate form data for potential save
      setFormData({
        ...formData,
        title: data.lessonPlan.title,
        lessonPlan: data.lessonPlan.description,
        subject: data.lessonPlan.subject || formData.subject,
        grade: data.lessonPlan.grade || formData.grade,
      })
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
    <div
      className={`flex min-h-screen ${
        isSidebarOpen ? 'flex-col sm:flex-row' : 'flex-row'
      } overflow-x-hidden`}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
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
              {/* Removed Subject and Grade selection as they come from user data */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div> */}
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

              {/* Generated Plan Preview */}
              {generatedPlan && (
                <div className="mt-6 transition-opacity duration-500 ease-in-out opacity-100">
                  <Card
                    className={`${
                      isLight
                        ? 'bg-white/10 backdrop-blur-xl border-white/20'
                        : 'bg-white/10 backdrop-blur-xl border-white/20'
                    }`}
                  >
                    <CardHeader>
                      <CardTitle
                        className={`${isLight ? 'text-gray-900' : ''}`}
                      >
                        Generated Lesson Plan: {generatedPlan.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p
                          className={`text-sm ${
                            isLight ? 'text-gray-700' : 'text-gray-300'
                          }`}
                        >
                          <strong>Subject:</strong> {generatedPlan.subject}
                        </p>
                        <p
                          className={`text-sm ${
                            isLight ? 'text-gray-700' : 'text-gray-300'
                          }`}
                        >
                          <strong>Grade:</strong> {generatedPlan.grade}
                        </p>
                        <div
                          className={`text-sm ${
                            isLight ? 'text-gray-700' : 'text-gray-300'
                          }`}
                        >
                          <strong>Description:</strong>
                          <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded max-h-64 overflow-y-auto whitespace-pre-wrap">
                            {generatedPlan.description}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Button
                          onClick={() => handleSave('ai')}
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Save Lesson Plan'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setGeneratedPlan(null)}
                        >
                          Discard
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default CreateLessonPlan
