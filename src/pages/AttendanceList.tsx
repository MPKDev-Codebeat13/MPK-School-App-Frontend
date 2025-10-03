import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const AttendanceList: React.FC = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const { theme, isLight } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return
    setLoading(true)
    fetch(`${API_BASE_URL}/babysitter/attendance`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch attendance records')
        return res.json()
      })
      .then((data) => {
        setAttendanceRecords(data.records)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [accessToken])

  const handleDelete = async (recordId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this attendance record? This action cannot be undone.'
      )
    ) {
      return
    }

    setDeleteLoading(recordId)
    try {
      const response = await fetch(
        `${API_BASE_URL}/babysitter/attendance/${recordId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete attendance record')
      }

      // Remove the record from the local state
      setAttendanceRecords((prev) =>
        prev.filter((record) => record._id !== recordId)
      )
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleViewDetails = async (recordId: string) => {
    navigate(`/babysitter/attendance/view/${recordId}`)
  }

  return (
    <div
      className={`flex min-h-screen ${theme} ${
        isSidebarOpen ? 'flex-col sm:flex-row' : 'flex-row'
      } overflow-x-hidden`}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={`flex-1 p-4 sm:p-6 md:p-8`}>
        <h1
          className={`text-3xl font-bold mb-6 ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}
        >
          Attendance
        </h1>
        <Button onClick={() => navigate('/babysitter/attendance/create')}>
          Create Attendance
        </Button>
        {loading && (
          <p className={isLight ? 'text-gray-900' : 'text-white'}>Loading...</p>
        )}
        {error && <p className="text-red-600">{error}</p>}
        <div className="mt-6 space-y-4">
          {attendanceRecords.map((record) => (
            <div
              key={record._id}
              className="p-6 bg-transparent rounded shadow border"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      isLight ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    {new Date(record.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <p
                    className={`text-lg ${
                      isLight ? 'text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    Total Students: {record.stats.totalStudents}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleViewDetails(record._id)}
                    variant="outline"
                  >
                    View Details
                  </Button>
                  <Button
                    onClick={() => handleDelete(record._id)}
                    variant="danger"
                    disabled={deleteLoading === record._id}
                  >
                    {deleteLoading === record._id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Attendance Status */}
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                  <h4 className="font-medium text-green-800 dark:text-green-200">
                    Present
                  </h4>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {record.stats.presentCount}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                  <h4 className="font-medium text-red-800 dark:text-red-200">
                    Absent
                  </h4>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {record.stats.absentCount}
                  </p>
                </div>

                {/* Uniform Status */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">
                    With Uniform
                  </h4>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {record.stats.uniformCount}
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded">
                  <h4 className="font-medium text-orange-800 dark:text-orange-200">
                    No Uniform
                  </h4>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {record.stats.noUniformCount}
                  </p>
                </div>

                {/* Homework Status */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200">
                    HW Done
                  </h4>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {record.stats.hwCount}
                  </p>
                </div>
                <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded">
                  <h4 className="font-medium text-pink-800 dark:text-pink-200">
                    No HW
                  </h4>
                  <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                    {record.stats.noHwCount}
                  </p>
                </div>

                {/* Classwork Status */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded">
                  <h4 className="font-medium text-indigo-800 dark:text-indigo-200">
                    CW Done
                  </h4>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {record.stats.cwCount}
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                    No CW
                  </h4>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {record.stats.noCwCount}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {attendanceRecords.length === 0 && !loading && (
            <p
              className={`text-center py-8 ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}
            >
              No attendance records found.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

export default AttendanceList
