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
    <div className={`flex min-h-screen ${theme}`}>
      <Sidebar />
      <main className={`flex-1 p-8`}>
        <h1
          className={`text-3xl font-bold mb-6 ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}
        >
          Create Attendance
        </h1>
        <Card className={`${theme} max-w-md mx-auto`}>
          <div className="p-6">
            <label
              className={`block mb-2 font-medium ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}
            >
              Number of Students
            </label>
            <input
              type="number"
              value={studentCount}
              onChange={(e) => setStudentCount(e.target.value)}
              className="w-full p-2 border rounded mb-4 bg-transparent border-gray-300 text-gray-900"
              min={1}
            />
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <div className="flex space-x-4">
              <Button onClick={handleCreate}>Create Attendance</Button>
              <Button variant="outline" onClick={handleCancel}>
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
