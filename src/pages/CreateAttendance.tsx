import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import Sidebar from '../components/Sidebar'
import { useTheme } from '../context/ThemeContext'
import { Card } from '../components/ui/card'

const CreateAttendance: React.FC = () => {
  const [studentCount, setStudentCount] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { theme, isLight } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleCreate = () => {
    const count = parseInt(studentCount, 10)
    if (isNaN(count) || count <= 0) {
      setError('Please enter a valid number of students')
      return
    }
    setError('')
    navigate(`/babysitter/attendance/take/${count}`)
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
        <Card className={`${theme} max-w-md mx-auto`}>
          <div className="p-4 sm:p-6">
            <label
              className={`block mb-2 font-medium text-sm sm:text-base ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}
            >
              Number of Students
            </label>
            <input
              type="number"
              value={studentCount}
              onChange={(e) => setStudentCount(e.target.value)}
              className={`w-full p-2 border rounded mb-4 bg-transparent border-gray-300 text-sm sm:text-base ${isLight ? 'text-gray-900' : 'text-white'}`}
              min={1}
            />
            {error && <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Button onClick={handleCreate} className="w-full sm:w-auto">Create Attendance</Button>
              <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
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
