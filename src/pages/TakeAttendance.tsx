import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { API_BASE_URL } from '../lib/api'
import { Card } from '../components/ui/card'

interface StudentAttendance {
  name: string
  gender: string
  present: boolean
  absent: boolean
  uniform: boolean
  noHW: boolean
  noCW: boolean
}

const TakeAttendance: React.FC = () => {
  const { count } = useParams<{ count: string }>()
  const studentCount = parseInt(count || '0', 10)
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const { theme, isLight } = useTheme()

  // Initialize students with empty names and present false
  const [students, setStudents] = useState<StudentAttendance[]>(
    Array(studentCount)
      .fill(null)
      .map(() => ({
        name: '',
        gender: '',
        present: false,
        absent: false,
        uniform: false,
        noHW: true,
        noCW: true,
      }))
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleNameChange = (index: number, value: string) => {
    const newStudents = [...students]
    newStudents[index].name = value
    setStudents(newStudents)
  }

  const handleStatusChange = (index: number) => {
    const newStudents = [...students]
    newStudents[index].present = !newStudents[index].present
    newStudents[index].absent = !newStudents[index].present
    setStudents(newStudents)
  }

  const handleUniformChange = (index: number, value: boolean) => {
    const newStudents = [...students]
    newStudents[index].uniform = value
    setStudents(newStudents)
  }

  const handleNoHWChange = (index: number, value: boolean) => {
    const newStudents = [...students]
    newStudents[index].noHW = value
    setStudents(newStudents)
  }

  const handleNoCWChange = (index: number, value: boolean) => {
    const newStudents = [...students]
    newStudents[index].noCW = value
    setStudents(newStudents)
  }

  const handleGenderChange = (index: number, value: string) => {
    const newStudents = [...students]
    newStudents[index].gender = value
    setStudents(newStudents)
  }

  const handleSave = async () => {
    // Validate all names are filled
    for (const student of students) {
      if (!student.name.trim()) {
        setError('Please fill in all student names')
        return
      }
    }
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/babysitter/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ studentCount, students }),
      })
      if (!response.ok) {
        throw new Error('Failed to save attendance')
      }
      navigate('/babysitter/attendance')
    } catch (err: any) {
      setError(err.message || 'Failed to save attendance')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/babysitter/attendance')
  }

  return (
    <div className={`flex min-h-screen ${theme.class}`}>
      <Sidebar />
      <main className={`flex-1 p-8`}>
        <h1
          className={`text-3xl font-bold mb-6 ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}
        >
          Take Attendance
        </h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <Card className={theme.class}>
          <div className="mb-4 text-center">
            <h2 className="text-xl font-semibold">
              Attendance for {new Date().toLocaleDateString()} -{' '}
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-transparent rounded shadow">
              <thead>
                <tr>
                  <th className="border px-4 py-2">#</th>
                  <th className="border px-4 py-2">Student Name</th>
                  <th className="border px-4 py-2">Gender</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">Uniform</th>
                  <th className="border px-4 py-2">HW</th>
                  <th className="border px-4 py-2">CW</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={idx}>
                    <td className="border px-4 py-2">{idx + 1}</td>
                    <td className="border px-4 py-2">
                      <input
                        type="text"
                        value={student.name}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        className={`w-full p-2 border rounded bg-transparent border-gray-300 ${
                          isLight ? 'text-gray-900' : 'text-white'
                        }`}
                        placeholder={`Student ${idx + 1} Name`}
                      />
                    </td>
                    <td className="border px-4 py-2">
                      <select
                        value={student.gender}
                        onChange={(e) =>
                          handleGenderChange(idx, e.target.value)
                        }
                        className={`w-full p-2 border rounded bg-transparent border-gray-300 ${
                          isLight ? 'text-gray-900' : 'text-white'
                        }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </td>
                    <td
                      className="border px-4 py-2 text-center cursor-pointer"
                      onClick={() => handleStatusChange(idx)}
                    >
                      {student.present ? (
                        <span className="text-green-600 font-bold">
                          &#10003; Present
                        </span>
                      ) : (
                        <span className="text-red-600 font-bold">
                          &#10007; Absent
                        </span>
                      )}
                    </td>
                    <td
                      className="border px-4 py-2 text-center cursor-pointer"
                      onClick={() => handleUniformChange(idx, !student.uniform)}
                    >
                      {student.uniform ? (
                        <span className="text-green-600 font-bold">
                          &#10003; Uniform
                        </span>
                      ) : (
                        <span className="text-red-600 font-bold">
                          &#10007; No Uniform
                        </span>
                      )}
                    </td>
                    <td
                      className="border px-4 py-2 text-center cursor-pointer"
                      onClick={() => handleNoHWChange(idx, !student.noHW)}
                    >
                      {student.noHW ? (
                        <span className="text-red-600 font-bold">
                          &#10007; No HW
                        </span>
                      ) : (
                        <span className="text-green-600 font-bold">
                          &#10003; HW
                        </span>
                      )}
                    </td>
                    <td
                      className="border px-4 py-2 text-center cursor-pointer"
                      onClick={() => handleNoCWChange(idx, !student.noCW)}
                    >
                      {student.noCW ? (
                        <span className="text-red-600 font-bold">
                          &#10007; No CW
                        </span>
                      ) : (
                        <span className="text-green-600 font-bold">
                          &#10003; CW
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex space-x-4 mt-6">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}

export default TakeAttendance
