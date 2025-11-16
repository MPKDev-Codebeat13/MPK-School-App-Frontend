import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../lib/api'
import { Button } from '../components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'
interface LessonPlan {
  _id: string
  title: string
  description: string
  subject: string
  grade: string
  teacher: {
    fullName: string
    email: string
  } | null
  status: 'draft' | 'pending' | 'accepted' | 'rejected'
  type: 'manual' | 'ai'
  createdAt: string
  updatedAt: string
}

const LessonPlanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user, accessToken } = useAuth()
  const { theme, isLight } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const isFetchingRef = useRef(false)

  // Rejection mode state
  const rejectionMode = location.state?.rejectionMode || false
  const [selectedText, setSelectedText] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const selectedText = selection.toString()
      setSelectedText(selectedText)
    }
  }

  const handleRejectWithReason = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason.')
      return
    }
    if (!lessonPlan) return

    setIsSubmitting(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/department/lesson-plans/${lessonPlan._id}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            reason: rejectionReason,
            highlightedText: selectedText,
          }),
        }
      )
      if (!response.ok) {
        throw new Error('Failed to reject lesson plan')
      }
      alert('Lesson plan rejected successfully.')
      navigate('/check-lesson-plans')
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Error rejecting lesson plan'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    setRetryCount(0) // Reset retry count on new fetch
    const fetchLessonPlan = async () => {
      if (!id || !accessToken) {
        setError('Invalid lesson plan ID or not authenticated')
        setLoading(false)
        isFetchingRef.current = false
        return
      }
      try {
        const endpoint =
          user?.role === 'Teacher'
            ? `${API_BASE_URL}/teacher/lesson-plans/${id}`
            : `${API_BASE_URL}/department/lesson-plans/${id}`
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 600000) // 10 minute timeout

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        if (!response.ok) {
          throw new Error('Failed to fetch lesson plan')
        }
        let data
        try {
          data = await response.json()
        } catch (parseError) {
          throw new Error('Failed to parse response data')
        }
        const lessonPlanData = user?.role === 'Teacher' ? data.lessonPlan : data
        setLessonPlan(lessonPlanData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
        isFetchingRef.current = false
      }
    }
    fetchLessonPlan()
  }, [id, accessToken, user?.role])

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme.class} overflow-x-hidden`}
      >
        <p className="text-sm sm:text-base">Loading lesson plan...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme.class} overflow-x-hidden`}
      >
        <p className="text-red-600 text-sm sm:text-base">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded text-sm sm:text-base"
        >
          Go Back
        </button>
      </div>
    )
  }

  if (!lessonPlan) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme.class} overflow-x-hidden`}
      >
        <p className="text-sm sm:text-base">Lesson plan not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded text-sm sm:text-base"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div
      className={`flex min-h-screen bg-transparent ${
        theme.class
      } overflow-x-hidden ${isSidebarOpen ? 'sm:ml-64' : ''}`}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main
        className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto rounded-lg shadow-md text-gray-900 backdrop-blur-md bg-transparent text-sm sm:text-base ${
          !isLight ? 'text-white' : 'text-gray-900'
        }`}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
          {lessonPlan.title}
        </h1>
        <p className="mb-2">
          <strong>Teacher:</strong>{' '}
          {lessonPlan.teacher ? lessonPlan.teacher.fullName : 'Unknown'}
        </p>
        <p className="mb-2">
          <strong>Email:</strong>{' '}
          {lessonPlan.teacher ? lessonPlan.teacher.email : 'Unknown'}
        </p>
        <p className="mb-2">
          <strong>Subject:</strong> {lessonPlan.subject}
        </p>
        <p className="mb-2">
          <strong>Grade:</strong> {lessonPlan.grade}
        </p>
        <p className="mb-2">
          <strong>Type:</strong> {lessonPlan.type}
        </p>
        <p className="mb-2">
          <strong>Status:</strong> {lessonPlan.status}
        </p>
        <p className="mb-2">
          <strong>Created At:</strong>{' '}
          {new Date(lessonPlan.createdAt).toLocaleString()}
        </p>
        <p className="mb-2">
          <strong>Updated At:</strong>{' '}
          {new Date(lessonPlan.updatedAt).toLocaleString()}
        </p>
        <div className="mt-4 sm:mt-6 whitespace-pre-wrap bg-transparent p-4 sm:p-6 rounded-lg shadow-inner text-sm sm:text-base max-h-64 overflow-y-auto">
          {rejectionMode ? (
            <div
              onMouseUp={handleTextSelection}
              className="cursor-text select-text"
            >
              {lessonPlan.description}
            </div>
          ) : (
            lessonPlan.description
          )}
        </div>
        {user?.role === 'Teacher' && lessonPlan.status === 'draft' && (
          <div className="mt-4 sm:mt-6">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(
                    `${API_BASE_URL}/teacher/lesson-plans/${lessonPlan._id}/submit`,
                    {
                      method: 'POST',
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                      },
                    }
                  )
                  if (!response.ok) {
                    throw new Error('Failed to submit lesson plan')
                  }
                  setLessonPlan({ ...lessonPlan, status: 'pending' })
                  alert('Lesson plan submitted for review')
                } catch (error) {
                  alert(error instanceof Error ? error.message : 'Error')
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Submit for Review
            </button>
          </div>
        )}
        {user?.role === 'Department' && !rejectionMode && (
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={async () => {
                try {
                  const response = await fetch(
                    `${API_BASE_URL}/department/lesson-plans/${lessonPlan._id}/accept`,
                    {
                      method: 'POST',
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                      },
                    }
                  )
                  if (!response.ok) {
                    throw new Error('Failed to accept lesson plan')
                  }
                  setLessonPlan({ ...lessonPlan, status: 'accepted' })
                  alert('Lesson plan accepted')
                } catch (error) {
                  alert(error instanceof Error ? error.message : 'Error')
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button
              onClick={() =>
                navigate(`/lesson-plan/${lessonPlan._id}`, {
                  state: { rejectionMode: true },
                })
              }
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {rejectionMode && (
          <div className="mt-4 sm:mt-6 space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Rejection Mode
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                Select text in the lesson plan above that needs correction, then
                provide your rejection reason below.
              </p>
              {selectedText && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selected Text:
                  </p>
                  <div className="bg-yellow-100 dark:bg-yellow-800 p-2 rounded text-sm mt-1">
                    "{selectedText}"
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why this lesson plan is being rejected..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-vertical min-h-[100px]"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={handleRejectWithReason}
                disabled={isSubmitting || !rejectionReason.trim()}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Rejection'}
              </Button>
              <Button
                onClick={() => navigate('/check-lesson-plans')}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        {!rejectionMode && (
          <Button
            onClick={() => navigate(-1)}
            className="mt-4 sm:mt-6"
            variant="outline"
          >
            Back
          </Button>
        )}
      </main>
    </div>
  )
}

export default LessonPlanDetails
