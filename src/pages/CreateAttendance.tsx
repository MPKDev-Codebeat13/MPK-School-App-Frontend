import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import Sidebar from '../components/Sidebar'
import { useTheme } from '../context/ThemeContext'
import { Card } from '../components/ui/card'

const CreateAttendance: React.FC = () => {
  const [studentCount, setStudentCount] = useState(1)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { theme, isLight } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleIncrement = () => {
    setStudentCount((prev) => prev + 1)
  }

  const handleDecrement = () => {
    setStudentCount((prev) => Math.max(1, prev - 1))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value > 0) {
      setStudentCount(value)
    } else if (e.target.value === '') {
      setStudentCount(1)
    }
  }

  const handleCreate = () => {
    if (studentCount <= 0) {
      setError('Please enter a valid number of students')
      return
    }
    setError('')
    navigate(`/babysitter/attendance/take/${studentCount}`)
  }

  const handleCancel = () => {
    navigate('/babysitter/attendance')
  }

  return (
    <div
      className={`flex min-h-screen ${theme} ${
        isSidebarOpen ? 'flex-col sm:flex-row' : 'flex-row'
      } overflow-x-hidden`}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={`flex-1 p-4 sm:p-6 lg:p-8`}>
        <h1
          className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}
        >
          Create Attendance
        </h1>
        <Card className={`${theme} max-w-md mx-auto shadow-lg rounded-lg border border-gray-300 dark:border-gray-700`}>
          <div className="p-6 sm:p-8">
            <h2 className={`text-lg sm:text-xl font-semibold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Total number of your students
            </h2>
            <div className="flex items-center mb-6">
              <Button
                onClick={handleDecrement}
                variant="outline"
                className="px-3 py-2"
                disabled={studentCount <= 1}
              >
                -
              </Button>
              <input
                type="number"
                value={studentCount}
                onChange={handleInputChange}
                className={`mx-2 p-3 border rounded bg-transparent border-gray-300 text-base text-center ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}
                min={1}
              />
              <Button
                onClick={handleIncrement}
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
              <Button onClick={handleCreate} className="w-full sm:w-auto text-lg font-semibold">
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
