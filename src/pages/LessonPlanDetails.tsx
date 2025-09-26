import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../lib/api'

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
  status: 'pending' | 'accepted' | 'rejected'
  type: 'manual' | 'ai' | 'uploaded'
  createdAt: string
  updatedAt: string
}

const LessonPlanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { accessToken } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLessonPlan = async () => {
      if (!id || !accessToken) {
        setError('Invalid lesson plan ID or not authenticated')
        setLoading(false)
        return
      }
      try {
        const response = await fetch(
          `${API_BASE_URL}/department/lesson-plans/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        if (!response.ok) {
          throw new Error('Failed to fetch lesson plan')
        }
        const data = await response.json()
        setLessonPlan(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchLessonPlan()
  }, [id, accessToken])

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme}`}>
        <p>Loading lesson plan...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme}`}>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded"
        >
          Go Back
        </button>
      </div>
    )
  }

  if (!lessonPlan) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme}`}>
        <p>Lesson plan not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className={`flex min-h-screen bg-transparent ${theme}`}>
      <Sidebar />
      <main
        className={`flex-1 p-8 max-w-4xl mx-auto rounded-lg shadow-md text-gray-900 backdrop-blur-md bg-opacity-80 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-purple-900 via-pink-900 to-red-900 text-white'
            : 'bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 text-gray-900'
        }`}
      >
        <h1 className="text-3xl font-bold mb-6">{lessonPlan.title}</h1>
        <p>
          <strong>Teacher:</strong>{' '}
          {lessonPlan.teacher ? lessonPlan.teacher.fullName : 'Unknown'}
        </p>
        <p>
          <strong>Email:</strong>{' '}
          {lessonPlan.teacher ? lessonPlan.teacher.email : 'Unknown'}
        </p>
        <p>
          <strong>Subject:</strong> {lessonPlan.subject}
        </p>
        <p>
          <strong>Grade:</strong> {lessonPlan.grade}
        </p>
        <p>
          <strong>Type:</strong> {lessonPlan.type}
        </p>
        <p>
          <strong>Status:</strong> {lessonPlan.status}
        </p>
        <p>
          <strong>Created At:</strong>{' '}
          {new Date(lessonPlan.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Updated At:</strong>{' '}
          {new Date(lessonPlan.updatedAt).toLocaleString()}
        </p>
        <div className="mt-6 whitespace-pre-wrap bg-gray-50 p-6 rounded-lg shadow-inner">
          {lessonPlan.description}
        </div>
        <div className="mt-6 flex space-x-4">
          <button
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
                alert('Lesson plan accepted')
                navigate(-1)
              } catch (error) {
                alert(error instanceof Error ? error.message : 'Error')
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={async () => {
              try {
                const response = await fetch(
                  `${API_BASE_URL}/department/lesson-plans/${lessonPlan._id}/reject`,
                  {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  }
                )
                if (!response.ok) {
                  throw new Error('Failed to reject lesson plan')
                }
                alert('Lesson plan rejected')
                navigate(-1)
              } catch (error) {
                alert(error instanceof Error ? error.message : 'Error')
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reject
          </button>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Back
        </button>
      </main>
    </div>
  )
}

export default LessonPlanDetails
