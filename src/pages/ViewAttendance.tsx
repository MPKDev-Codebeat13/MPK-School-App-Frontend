import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { API_BASE_URL } from '../lib/api'

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

const ViewAttendance: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { accessToken, user } = useAuth()
  const navigate = useNavigate()
  const { theme, isLight } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [record, setRecord] = useState<AttendanceRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!accessToken || !id) return
    setLoading(true)
    fetch(`${API_BASE_URL}/babysitter/attendance/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch attendance record')
        return res.json()
      })
      .then((data) => {
        setRecord(data.record)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [accessToken, id])

  const handleEdit = (recordId: string) => {
    // Navigate to edit page - you can create this later
    console.log('Edit attendance:', recordId)
  }

  if (loading) {
    return (
      <div
        className={`flex min-h-screen ${theme} ${
          isSidebarOpen ? 'flex-col sm:flex-row' : 'flex-row'
        } overflow-x-hidden`}
      >
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <p
            className={`${
              isLight ? 'text-gray-900' : 'text-white'
            } text-sm sm:text-base`}
          >
            Loading...
          </p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`flex min-h-screen ${theme} ${
          isSidebarOpen ? 'flex-col sm:flex-row' : 'flex-row'
        } overflow-x-hidden`}
      >
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <p className="text-red-600 text-sm sm:text-base">{error}</p>
        </main>
      </div>
    )
  }

  if (!record) {
    return (
      <div
        className={`flex min-h-screen ${theme} ${
          isSidebarOpen ? 'flex-col sm:flex-row' : 'flex-row'
        } overflow-x-hidden`}
      >
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <p
            className={`${
              isLight ? 'text-gray-900' : 'text-white'
            } text-sm sm:text-base`}
          >
            Record not found
          </p>
        </main>
      </div>
    )
  }

  return (
    <div
      className={`flex min-h-screen ${theme} ${
        isSidebarOpen ? 'flex-col sm:flex-row' : 'flex-row'
      } overflow-x-hidden`}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <h1
            className={`text-2xl sm:text-3xl font-bold ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}
          >
            Attendance Details
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {user?.role === 'Babysitter' && (
              <Button
                onClick={() => handleEdit(record._id)}
                variant="default"
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Edit
              </Button>
            )}
            <Button
              onClick={() => navigate('/reports-attendance')}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Back to List
            </Button>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <h2
            className={`text-xl sm:text-2xl font-semibold mb-2 ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}
          >
            {new Date(record.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h2>
          <p
            className={`text-base sm:text-lg ${
              isLight ? 'text-gray-700' : 'text-gray-300'
            }`}
          >
            Total Students: {record.stats.totalStudents}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded">
            <h3 className="font-medium text-green-800 dark:text-green-200 text-sm sm:text-base">
              Present
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
              {record.stats.presentCount}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 rounded">
            <h3 className="font-medium text-red-800 dark:text-red-200 text-sm sm:text-base">
              Absent
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
              {record.stats.absentCount}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base">
              With Uniform
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {record.stats.uniformCount}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 sm:p-4 rounded">
            <h3 className="font-medium text-orange-800 dark:text-orange-200 text-sm sm:text-base">
              No Uniform
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
              {record.stats.noUniformCount}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 rounded">
            <h3 className="font-medium text-purple-800 dark:text-purple-200 text-sm sm:text-base">
              HW Done
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {record.stats.hwCount}
            </p>
          </div>
          <div className="bg-pink-50 dark:bg-pink-900/20 p-3 sm:p-4 rounded">
            <h3 className="font-medium text-pink-800 dark:text-pink-200 text-sm sm:text-base">
              No HW
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-pink-600 dark:text-pink-400">
              {record.stats.noHwCount}
            </p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 sm:p-4 rounded">
            <h3 className="font-medium text-indigo-800 dark:text-indigo-200 text-sm sm:text-base">
              CW Done
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {record.stats.cwCount}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 sm:p-4 rounded">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200 text-sm sm:text-base">
              No CW
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {record.stats.noCwCount}
            </p>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <h3
            className={`text-lg sm:text-xl font-semibold p-3 sm:p-4 border-b ${
              isLight
                ? 'text-gray-900 border-gray-200'
                : 'text-white border-gray-700'
            }`}
          >
            Student Details
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm sm:text-base">
              <thead className={`bg-gray-50 dark:bg-gray-700`}>
                <tr>
                  <th
                    className={`px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isLight ? 'text-gray-500' : 'text-gray-300'
                    }`}
                  >
                    Name
                  </th>
                  <th
                    className={`px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isLight ? 'text-gray-500' : 'text-gray-300'
                    }`}
                  >
                    Gender
                  </th>
                  <th
                    className={`px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isLight ? 'text-gray-500' : 'text-gray-300'
                    }`}
                  >
                    Status
                  </th>
                  <th
                    className={`px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isLight ? 'text-gray-500' : 'text-gray-300'
                    }`}
                  >
                    Uniform
                  </th>
                  <th
                    className={`px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isLight ? 'text-gray-500' : 'text-gray-300'
                    }`}
                  >
                    Homework
                  </th>
                  <th
                    className={`px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isLight ? 'text-gray-500' : 'text-gray-300'
                    }`}
                  >
                    Classwork
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isLight ? 'divide-gray-200' : 'divide-gray-700'
                }`}
              >
                {record.students.map((student, index) => (
                  <tr
                    key={index}
                    className={
                      isLight ? 'hover:bg-gray-50' : 'hover:bg-gray-700'
                    }
                  >
                    <td
                      className={`px-3 sm:px-4 py-3 whitespace-nowrap text-sm font-medium ${
                        isLight ? 'text-gray-900' : 'text-white'
                      }`}
                    >
                      {student.name}
                    </td>
                    <td
                      className={`px-3 sm:px-4 py-3 whitespace-nowrap text-sm ${
                        isLight ? 'text-gray-500' : 'text-gray-300'
                      }`}
                    >
                      {student.gender}
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.present
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {student.present ? 'Present' : 'Absent'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.uniform
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}
                      >
                        {student.uniform ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          !student.noHW
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                        }`}
                      >
                        {!student.noHW ? 'Done' : 'Not Done'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          !student.noCW
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {!student.noCW ? 'Done' : 'Not Done'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ViewAttendance
