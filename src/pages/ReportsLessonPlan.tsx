import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { API_ENDPOINTS } from '../lib/api'
import Sidebar from '../components/Sidebar'

interface LessonPlan {
  _id: string
  title: string
  description: string
  subject: string
  grade: string
  teacher: {
    _id: string
    fullName: string
    email: string
  }
  status: 'pending' | 'accepted' | 'rejected'
  type: 'manual' | 'ai' | 'uploaded'
  createdAt: string
  updatedAt: string
}

export default function ReportsLessonPlan() {
  const { user } = useAuth()
  const { theme, isLight } = useTheme()
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLessonPlans()
  }, [])

  const fetchLessonPlans = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('No access token found')
        return
      }

      const response = await fetch(API_ENDPOINTS.GET_ALL_LESSON_PLANS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch lesson plans')
      }

      const data = await response.json()
      setLessonPlans(data.lessonPlans)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Loading lesson plans...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={fetchLessonPlans}
            className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const tableBg = isLight ? 'bg-white' : 'bg-gray-800'
  const tableBorder = isLight ? 'border-gray-200' : 'border-gray-700'
  const tableDivider = isLight ? 'divide-gray-200' : 'divide-gray-700'
  const tableRowHover = isLight ? 'hover:bg-gray-50' : 'hover:bg-gray-700'
  const cardTitle = isLight ? 'text-gray-900' : 'text-white'
  const cardText = isLight ? 'text-gray-500' : 'text-gray-400'

  return (
    <div className={`flex min-h-screen ${theme}`}>
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className={`text-3xl font-bold mb-6 ${cardTitle}`}>
            Reports of the Lesson Plan
          </h1>

          <div className={`${tableBg} shadow overflow-hidden sm:rounded-md`}>
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={tableBg}>
                    <tr>
                      <th
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium ${cardText} uppercase tracking-wider`}
                      >
                        Title
                      </th>
                      <th
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium ${cardText} uppercase tracking-wider`}
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium ${cardText} uppercase tracking-wider`}
                      >
                        Subject
                      </th>
                      <th
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium ${cardText} uppercase tracking-wider`}
                      >
                        Grade
                      </th>
                      <th
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium ${cardText} uppercase tracking-wider`}
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium ${cardText} uppercase tracking-wider`}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${tableBg} divide-y ${tableDivider}`}>
                    {lessonPlans.map((plan) => (
                      <tr
                        key={plan._id}
                        className={`${tableRowHover} transition-colors duration-200 hover:bg-indigo-100 dark:hover:bg-indigo-900`}
                      >
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${cardTitle}`}
                        >
                          {plan.title}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm ${cardText}`}
                        >
                          <span className="text-sm text-gray-500 dark:text-gray-300">
                            {new Date(plan.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm ${cardText}`}
                        >
                          {plan.subject}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm ${cardText}`}
                        >
                          {plan.grade}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm ${cardText}`}
                        >
                          {plan.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              plan.status === 'accepted'
                                ? isLight
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-green-900 text-green-200'
                                : plan.status === 'rejected'
                                ? isLight
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-red-900 text-red-200'
                                : isLight
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-yellow-900 text-yellow-200'
                            }`}
                          >
                            {plan.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {lessonPlans.length === 0 && (
            <div className="text-center py-12">
              <p className={cardText}>No lesson plans found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
