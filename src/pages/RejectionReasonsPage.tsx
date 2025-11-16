import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Sidebar from '../components/Sidebar'
import { Button } from '../components/ui/button'
import { API_BASE_URL } from '../lib/api'

interface RejectionReason {
  _id: string
  lessonPlanId: string
  lessonPlanTitle: string
  teacherName: string
  teacherEmail: string
  reason: string
  highlightedText?: string
  createdAt: string
  status: 'active' | 'resolved'
}

export default function RejectionReasonsPage() {
  const { user } = useAuth()
  const { theme, isLight } = useTheme()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [rejectionReasons, setRejectionReasons] = useState<RejectionReason[]>(
    []
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    if (user.role !== 'Department' && user.role !== 'Admin') {
      alert('Access denied. You do not have permission to access this page.')
      navigate(getDashboardPath(user.role))
      return
    }
    fetchRejectionReasons()
  }, [user, navigate])

  const fetchRejectionReasons = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('No access token found')
        return
      }

      const response = await fetch(
        `${API_BASE_URL}/department/rejection-reasons`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch rejection reasons')
      }

      const data = await response.json()
      setRejectionReasons(data.rejectionReasons || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkResolved = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      const response = await fetch(
        `${API_BASE_URL}/department/rejection-reasons/${id}/resolve`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to mark as resolved')
      }

      // Update the local state
      setRejectionReasons((prev) =>
        prev.map((reason) =>
          reason._id === id ? { ...reason, status: 'resolved' } : reason
        )
      )
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Error marking as resolved'
      )
    }
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme} overflow-x-hidden ${
          isSidebarOpen ? 'sm:ml-64' : ''
        }`}
      >
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <p className="text-sm sm:text-base">Loading rejection reasons...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme} overflow-x-hidden ${
          isSidebarOpen ? 'sm:ml-64' : ''
        }`}
      >
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <p className="text-red-600 text-sm sm:text-base">{error}</p>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen ${theme} overflow-x-hidden ${
        isSidebarOpen ? 'sm:ml-64' : ''
      }`}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">
            Rejection Reasons Management
          </h1>

          <div className="grid gap-4">
            {rejectionReasons.length === 0 ? (
              <div className="text-center py-8">
                <p
                  className={`${
                    isLight ? 'text-gray-700' : 'text-gray-300'
                  } text-sm sm:text-base`}
                >
                  No rejection reasons found.
                </p>
              </div>
            ) : (
              rejectionReasons.map((reason) => (
                <div
                  key={reason._id}
                  className={`p-4 sm:p-6 rounded-lg shadow-lg border ${
                    isLight
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-800/90 border-gray-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div>
                      <h3
                        className="text-lg font-semibold mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() =>
                          navigate(`/lesson-plan/${reason.lessonPlanId}`)
                        }
                      >
                        {reason.lessonPlanTitle}
                      </h3>
                      <p
                        className={`text-sm ${
                          isLight ? 'text-gray-600' : 'text-gray-400'
                        }`}
                      >
                        Teacher: {reason.teacherName} ({reason.teacherEmail})
                      </p>
                      <p
                        className={`text-sm ${
                          isLight ? 'text-gray-600' : 'text-gray-400'
                        }`}
                      >
                        Created: {new Date(reason.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          reason.status === 'resolved'
                            ? isLight
                              ? 'bg-green-100 text-green-800'
                              : 'bg-green-900 text-green-200'
                            : isLight
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-yellow-900 text-yellow-200'
                        }`}
                      >
                        {reason.status}
                      </span>
                      {reason.status === 'active' && (
                        <Button
                          onClick={() => handleMarkResolved(reason._id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-red-600 dark:text-red-400 mb-1">
                        Rejection Reason:
                      </h4>
                      <p
                        className={`${
                          isLight ? 'text-gray-800' : 'text-gray-200'
                        }`}
                      >
                        {reason.reason}
                      </p>
                    </div>

                    {reason.highlightedText && (
                      <div>
                        <h4 className="font-medium text-orange-600 dark:text-orange-400 mb-1">
                          Highlighted Text:
                        </h4>
                        <div
                          className={`p-2 rounded ${
                            isLight
                              ? 'bg-orange-50 border border-orange-200'
                              : 'bg-orange-900/20 border border-orange-800'
                          }`}
                        >
                          <p
                            className={`${
                              isLight ? 'text-gray-800' : 'text-gray-200'
                            } italic`}
                          >
                            "{reason.highlightedText}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
