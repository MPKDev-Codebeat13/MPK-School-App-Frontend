import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import Sidebar from '../components/Sidebar'
import { useTheme } from '../context/ThemeContext'
import { Card } from '../components/ui/card'

const CreateAttendance: React.FC = () => {
  const [totalStudents, setTotalStudents] = useState(1)
  const [todayStudents, setTodayStudents] = useState(1)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { theme, isLight } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleTotalIncrement = () => {
    setTotalStudents((prev) => prev + 1)
  }

  const handleTotalDecrement = () => {
    setTotalStudents((prev) => Math.max(1, prev - 1))
  }

  const handleTotalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value > 0) {
      setTotalStudents(value)
    } else if (e.target.value === '') {
      setTotalStudents(1)
    }
  }

  const handleTodayIncrement = () => {
    setTodayStudents((prev) => prev + 1)
  }

  const handleTodayDecrement = () => {
    setTodayStudents((prev) => Math.max(1, prev - 1))
  }

  const handleTodayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value > 0) {
      setTodayStudents(value)
    } else if (e.target.value === '') {
      setTodayStudents(1)
    }
  }

  const handleCreate = () => {
    if (totalStudents <= 0 || todayStudents <= 0) {
      setError("Please enter valid numbers for both total and today's students")
      return
    }
    if (todayStudents > totalStudents) {
      setError("Today's students cannot exceed total students")
      return
    }
    setError('')
    navigate(
      `/babysitter/attendance/take/${todayStudents}?total=${totalStudents}`
    )
  }

  const handleCancel = () => {
    navigate('/babysitter/attendance')
  }

  return (
    <div className={`min-h-screen ${theme} overflow-x-hidden`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={`p-4 sm:p-6 lg:p-8 ${isSidebarOpen ? 'sm:ml-64' : ''}`}>
        <h1
          className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}
        >
          Create Attendance
        </h1>
        <Card
          className={`${theme} max-w-md mx-auto shadow-lg rounded-lg border border-gray-300 dark:border-gray-700`}
        >
          <div className="p-6 sm:p-8">
            <h2
              className={`text-lg sm:text-xl font-semibold mb-4 ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}
            >
              Total number of students
            </h2>
            <div className="flex items-center mb-6">
              <Button
                onClick={handleTotalDecrement}
                variant="outline"
                className="px-3 py-2"
                disabled={totalStudents <= 1}
              >
                -
              </Button>
              <input
                type="number"
                value={totalStudents}
                onChange={handleTotalInputChange}
                className={`mx-2 p-3 border rounded bg-transparent border-gray-300 text-base text-center ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}
                min={1}
              />
              <Button
                onClick={handleTotalIncrement}
                variant="outline"
                className="px-3 py-2"
              >
                +
              </Button>
            </div>
            <h2
              className={`text-lg sm:text-xl font-semibold mb-4 ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}
            >
              Today's number of students
            </h2>
            <div className="flex items-center mb-6">
              <Button
                onClick={handleTodayDecrement}
                variant="outline"
                className="px-3 py-2"
                disabled={todayStudents <= 1}
              >
                -
              </Button>
              <input
                type="number"
                value={todayStudents}
                onChange={handleTodayInputChange}
                className={`mx-2 p-3 border rounded bg-transparent border-gray-300 text-base text-center ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}
                min={1}
              />
              <Button
                onClick={handleTodayIncrement}
                variant="outline"
                className="px-3 py-2"
              >
                +
              </Button>
            </div>
            {error && (
              <p className="text-red-600 mb-6 text-base sm:text-lg">{error}</p>
            )}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-6">
              <Button
                onClick={handleCreate}
                className="w-full sm:w-auto text-lg font-semibold"
              >
                Create Attendance
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="w-full sm:w-auto text-lg font-semibold"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}

export default CreateAttendance
