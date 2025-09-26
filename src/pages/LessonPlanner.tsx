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
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

const LessonPlanner: React.FC = () => {
  const { user, accessToken } = useAuth()
  const { theme, isLight } = useTheme()
  const navigate = useNavigate()
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLessonPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/lesson-plans`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setLessonPlans(data.lessonPlans)
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
    try {
      const response = await fetch(
        `${API_BASE_URL}/teacher/lesson-plans/${lessonPlanId}/submit`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
      if (response.ok) {
        await fetchLessonPlans()
      } else {
        console.error('Failed to submit lesson plan for review')
      }
    } catch (error) {
      console.error('Error submitting lesson plan:', error)
    }
  }

  const handleDeleteLessonPlan = async (lessonPlanId: string) => {
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
        await fetchLessonPlans()
      } else {
        console.error('Failed to delete lesson plan')
      }
    } catch (error) {
      console.error('Error deleting lesson plan:', error)
    }
  }


  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1
            className={`text-3xl font-bold ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}
          >
            Lesson Planner
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={fetchLessonPlans}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Refresh
            </Button>
            <Button
              onClick={() => navigate('/create-lesson-plan')}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Create a Lesson Plan
            </Button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto rounded-lg shadow p-6">
          {loading ? (
            <p>Loading your lesson plans...</p>
          ) : lessonPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <p>You have no lesson plans yet.</p>
              <Button onClick={() => navigate('/create-lesson-plan')}>
                Create Your First Lesson Plan
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {lessonPlans.map((plan) => (
                <li
                  key={plan._id}
                  className={`border rounded p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    isLight ? 'border-gray-200' : 'border-gray-700'
                  }`}
                >
                  <h2
                    className={`text-xl font-semibold ${
                      isLight ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    {plan.title}
                  </h2>
                  <p
                    className={`text-sm mb-1 ${
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
                  <div className="mt-2 flex gap-2">
                    {plan.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleSubmitLessonPlan(plan._id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Submit for Review
                      </Button>
                    )}

                    <Button
                      size="sm"
                      onClick={() => handleDeleteLessonPlan(plan._id)}
                      className="bg-red-600 hover:bg-red-700"
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
