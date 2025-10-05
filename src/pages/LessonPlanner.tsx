import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Sidebar from '../components/Sidebar'
import { Button } from '../components/ui/button'
import { API_BASE_URL } from '../lib/api'
import { useNavigate } from 'react-router-dom'

interface LessonPlan {
  _id: string
  title: string
  description: string
  subject: string
  grade: string
  type: string
  status: 'draft' | 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

const LessonPlanner: React.FC = () => {
  const { user, accessToken } = useAuth()
  const { theme, isLight } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLessonPlans = async () => {
    if (!accessToken) {
      setLessonPlans([])
      setLoading(false)
      return
    }
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/teacher/lesson-plans`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept-Encoding': 'identity',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      if (response.ok) {
        try {
          const text = await response.text()
          if (!text.trim()) {
            setLessonPlans([])
          } else {
            const data = JSON.parse(text)
            if (Array.isArray(data.lessonPlans)) {
              setLessonPlans(data.lessonPlans)
            } else if (data.lessonPlans) {
              // If lessonPlans is an object, convert to array
              setLessonPlans([data.lessonPlans])
            } else {
              setLessonPlans([])
            }
          }
        } catch (parseError) {
          console.error('Failed to parse lesson plans data:', parseError)
          setLessonPlans([])
        }
      } else {
        setLessonPlans([])
      }
    } catch (error) {
      setLessonPlans([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLessonPlans()
  }, [accessToken])

  const handleSubmitLessonPlan = async (lessonPlanId: string) => {
    const button = document.querySelector(
      `button[data-id="${lessonPlanId}-submit"]`
    ) as HTMLButtonElement
    if (button) {
      button.disabled = true
      button.textContent = 'Submitting...'
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/teacher/lesson-plans/${lessonPlanId}/submit`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      )
      if (response.ok) {
        alert('Lesson plan submitted for review successfully!')
        await fetchLessonPlans()
      } else {
        alert('Failed to submit lesson plan for review')
      }
    } catch (error) {
      alert('Error submitting lesson plan')
    } finally {
      if (button) {
        button.disabled = false
        button.textContent = 'Submit for Review'
      }
    }
  }

  const handleDeleteLessonPlan = async (lessonPlanId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this lesson plan? This action cannot be undone.'
      )
    ) {
      return
    }

    const button = document.querySelector(
      `button[data-id="${lessonPlanId}-delete"]`
    ) as HTMLButtonElement
    if (button) {
      button.disabled = true
      button.textContent = 'Deleting...'
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/teacher/lesson-plans/${lessonPlanId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      if (response.ok) {
        alert('Lesson plan deleted successfully!')
        await fetchLessonPlans()
      } else {
        alert('Failed to delete lesson plan')
      }
    } catch (error) {
      alert('Error deleting lesson plan')
    } finally {
      if (button) {
        button.disabled = false
        button.textContent = 'Delete'
      }
    }
  }

  return (
    <div
      className={`flex min-h-screen ${
        isSidebarOpen ? 'flex-col sm:flex-row' : 'flex-row'
      } overflow-x-hidden ${theme.class}`}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <h1
            className={`text-2xl sm:text-3xl font-bold ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}
          >
            Lesson Planner
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={fetchLessonPlans}
              className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto"
            >
              Refresh
            </Button>
            <Button
              onClick={() => navigate('/create-lesson-plan')}
              className="bg-violet-600 hover:bg-violet-700 text-sm sm:text-base w-full sm:w-auto"
            >
              Create a Lesson Plan
            </Button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto rounded-lg shadow p-4 sm:p-6">
          {loading ? (
            <p className="text-sm sm:text-base">Loading your lesson plans...</p>
          ) : lessonPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="text-sm sm:text-base">
                You have no lesson plans yet.
              </p>
              <Button
                onClick={() => navigate('/create-lesson-plan')}
                className="text-sm sm:text-base"
              >
                Create Your First Lesson Plan
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {lessonPlans.map((plan) => (
                <li
                  key={plan._id}
                  className={`border rounded p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer text-sm sm:text-base border-white/20`}
                >
                  <h2
                    className={`text-lg sm:text-xl font-semibold ${
                      isLight ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    {plan.title}
                  </h2>
                  <p
                    className={`text-xs sm:text-sm mb-1 ${
                      isLight ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    Subject: {plan.subject} | Grade: {plan.grade} | Type:{' '}
                    {plan.type} | Status:{' '}
                    <span
                      className={`font-semibold ${
                        plan.status === 'accepted'
                          ? 'text-green-600'
                          : plan.status === 'rejected'
                          ? 'text-red-600'
                          : plan.status === 'draft'
                          ? 'text-blue-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {plan.status.charAt(0).toUpperCase() +
                        plan.status.slice(1)}
                    </span>
                  </p>
                  <p
                    className={`whitespace-pre-wrap ${
                      isLight ? 'text-gray-800' : 'text-gray-200'
                    }`}
                  >
                    {plan.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/lesson-plan/${plan._id}`)}
                      className="bg-green-600 hover:bg-green-700 text-sm sm:text-base"
                    >
                      View
                    </Button>
                    {plan.status === 'draft' && (
                      <Button
                        size="sm"
                        data-id={`${plan._id}-submit`}
                        onClick={() => handleSubmitLessonPlan(plan._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                      >
                        Submit for Review
                      </Button>
                    )}

                    <Button
                      size="sm"
                      data-id={`${plan._id}-delete`}
                      onClick={() => handleDeleteLessonPlan(plan._id)}
                      className="bg-red-600 hover:bg-red-700 text-sm sm:text-base"
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}

export default LessonPlanner
