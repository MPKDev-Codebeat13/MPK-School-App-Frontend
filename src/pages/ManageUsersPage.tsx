import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { API_ENDPOINTS } from '../lib/api'
import Sidebar from '../components/Sidebar'
import { useNavigate } from 'react-router-dom'

interface User {
  _id: string
  fullName: string
  email: string
  role: string
}

export default function ManageUsersPage() {
  const { user } = useAuth()
  const { theme, isLight } = useTheme()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [users, setUsers] = useState<User[]>([])
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
    fetchUsers()
  }, [user])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('No access token found')
        return
      }

      const response = await fetch(API_ENDPOINTS.GET_ALL_USERS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      // Filter out the current user from the list
      setUsers(data.users.filter((u: User) => u._id !== user?._id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center overflow-x-hidden ${theme.class}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm sm:text-base">
            Loading users...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center overflow-x-hidden ${theme.class}`}
      >
        <div className="text-center p-4">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {error}
          </p>
          <button
            onClick={fetchUsers}
            className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm sm:text-base"
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
  const tableBg = isLight ? 'bg-white' : 'bg-gray-800'
  const tableHeaderBg = isLight ? 'bg-gray-50' : 'bg-gray-700'
  const tableRowHover = isLight ? 'hover:bg-gray-50' : 'hover:bg-gray-700'
  const tableDivider = isLight ? 'divide-gray-200' : 'divide-gray-700'

  return (
    <div className={`min-h-screen overflow-x-hidden ${theme.class}`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={`p-4 sm:p-6 lg:p-8 ${isSidebarOpen ? 'sm:ml-64' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className={`${cardBase} ${cardSkin}`}>
            <h1
              className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${cardTitle}`}
            >
              Manage Users
            </h1>

            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-sm sm:text-base">
                <thead>
                  <tr className={tableHeaderBg}>
                    <th
                      className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${cardText}`}
                    >
                      Full Name
                    </th>
                    <th
                      className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${cardText}`}
                    >
                      Email
                    </th>
                    <th
                      className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${cardText}`}
                    >
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className={`${tableBg} divide-y ${tableDivider}`}>
                  {users.map((user) => (
                    <tr key={user._id} className={tableRowHover}>
                      <td
                        className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium ${cardTitle}`}
                      >
                        {user.fullName}
                      </td>
                      <td
                        className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm ${cardText}`}
                      >
                        {user.email}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'Admin'
                              ? isLight
                                ? 'bg-red-100 text-red-800'
                                : 'bg-red-900 text-red-200'
                              : user.role === 'Teacher'
                              ? isLight
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-blue-900 text-blue-200'
                              : user.role === 'Babysitter'
                              ? isLight
                                ? 'bg-green-100 text-green-800'
                                : 'bg-green-900 text-green-200'
                              : user.role === 'Parent'
                              ? isLight
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-purple-900 text-purple-200'
                              : isLight
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-gray-700 text-gray-200'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <p className={`${cardText} text-sm sm:text-base`}>
                  No users found.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
