import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { API_ENDPOINTS, API_BASE_URL } from '../lib/api'
import Sidebar from '../components/Sidebar'
import { Button } from '../components/ui/button'

interface AttendanceRecord {
  _id: string
  date: string
  studentCount: number
  students: {
    name: string
    gender: string
    present: boolean
    absent: boolean
    uniform: boolean
    noHW: boolean
    noCW: boolean
  }[]
  stats: {
    totalStudents: number
    presentCount: number
    absentCount: number
    uniformCount: number
    noUniformCount: number
    hwCount: number
    noHwCount: number
    cwCount: number
    noCwCount: number
  }
}

export default function ReportsAttendancePage() {
  const { user } = useAuth()
  const { theme, isLight } = useTheme()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
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
    if (user.role !== 'Admin') {
      alert('Access denied. You do not have permission to access this page.')
      navigate(getDashboardPath(user.role))
      return
    }
    fetchAttendances()
  }, [user, navigate])

  const fetchAttendances = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('No access token found')
        return
      }

      const allAttendances: AttendanceRecord[] = []
      let page = 1
      const limit = 50
      let hasMore = true

      while (hasMore) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)

        const response = await fetch(
          `${API_ENDPOINTS.GET_ALL_ATTENDANCES}?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        )

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error('Failed to fetch attendances')
        }

        let data
        try {
          data = await response.json()
        } catch (parseError) {
          throw new Error('Failed to parse server response. Please try again.')
        }
        const attendancesPage = data.attendances || []
        allAttendances.push(...attendancesPage)

        const pagination = data.pagination
        if (page >= pagination.pages) {
          hasMore = false
        } else {
          page++
        }
      }

      setAttendances(allAttendances)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (attendanceId: string) => {
    window.location.href = `/babysitter/attendance/view/${attendanceId}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Loading attendances...
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
            onClick={fetchAttendances}
            className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const cardBase = 'rounded-lg shadow-lg p-6 border'
  const cardSkin = isLight
    ? 'bg-white border-gray-200'
    : 'bg-gray-800 border-gray-700'

  const cardTitle = isLight ? 'text-gray-900' : 'text-white'
  const cardText = isLight ? 'text-gray-500' : 'text-gray-400'

  return (
    <div
      className={`flex min-h-screen ${theme} ${
        isSidebarOpen ? 'flex-col sm:flex-row' : 'flex-row'
      } overflow-x-hidden`}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1
            className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${cardTitle}`}
          >
            Reports of the Attendance
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {attendances.map((attendance) => (
              <div key={attendance._id} className={`${cardBase} ${cardSkin}`}>
                <div className="mb-3 sm:mb-4">
                  <h3 className={`text-lg font-semibold ${cardTitle}`}>
                    {new Date(attendance.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <p className={`text-sm sm:text-base ${cardText}`}>
                    Total Students: {attendance.studentCount}
                  </p>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-2 sm:p-3 rounded">
                    <h4 className="font-medium text-green-800 dark:text-green-200 text-xs sm:text-sm">
                      Present
                    </h4>
                    <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                      {attendance.stats.presentCount}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-2 sm:p-3 rounded">
                    <h4 className="font-medium text-red-800 dark:text-red-200 text-xs sm:text-sm">
                      Absent
                    </h4>
                    <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
                      {attendance.stats.absentCount}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 text-xs sm:text-sm">
                      With Uniform
                    </h4>
                    <p className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                      {attendance.stats.uniformCount}
                    </p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 sm:p-3 rounded">
                    <h4 className="font-medium text-orange-800 dark:text-orange-200 text-xs sm:text-sm">
                      No Uniform
                    </h4>
                    <p className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
                      {attendance.stats.noUniformCount}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2 sm:p-3 rounded">
                    <h4 className="font-medium text-purple-800 dark:text-purple-200 text-xs sm:text-sm">
                      HW Done
                    </h4>
                    <p className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">
                      {attendance.stats.hwCount}
                    </p>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/20 p-2 sm:p-3 rounded">
                    <h4 className="font-medium text-pink-800 dark:text-pink-200 text-xs sm:text-sm">
                      No HW
                    </h4>
                    <p className="text-lg sm:text-xl font-bold text-pink-600 dark:text-pink-400">
                      {attendance.stats.noHwCount}
                    </p>
                  </div>
                </div>

                {/* Action Buttons - Admin can only view details */}
                <div className="flex gap-2 mt-3 sm:mt-4">
                  <Button
                    onClick={() => handleViewDetails(attendance._id)}
                    variant="outline"
                    size="sm"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {attendances.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <p className={`${cardText} text-sm sm:text-base`}>
                No attendances found.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
