import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import Sidebar from '../components/Sidebar'
import { useTheme } from '../context/ThemeContext'
import {
  getDepartmentLessonPlans,
  acceptLessonPlan,
  rejectLessonPlan,
} from '../lib/api'

interface LessonPlan {
  _id: string
  createdAt: string
  teacher: {
    fullName: string
  }
  subject: string
  type: 'manual' | 'uploaded' | 'ai'
  status: 'pending' | 'accepted' | 'rejected'
  content: string // full lesson plan content
}

const CheckLessonPlans: React.FC = () => {
  const { user, accessToken } = useAuth()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [processingIds, setProcessingIds] = useState<string[]>([])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchLessonPlans()
  }, [user])

  const fetchLessonPlans = async () => {
    setLoading(true)
    setError(null)
    try {
      if (!accessToken || !user?.subject) {
        setError('Not authenticated or subject missing')
        setLoading(false)
        return
      }
      const data = await getDepartmentLessonPlans(accessToken, user.subject)
      setLessonPlans(data.lessonPlans)
    } catch (err) {
      setError('Failed to load lesson plans')
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = (plan: LessonPlan) => {
    navigate(`/lesson-plan/${plan._id}`, { state: { lessonPlan: plan } })
  }

  const handleAccept = async (planId: string) => {
    try {
      if (!accessToken) {
        setError('Not authenticated')
        return
      }
      setProcessingIds((prev) => [...prev, planId])
      await acceptLessonPlan(planId, accessToken)
      setError(null)
      setSuccessMessage('Lesson plan accepted successfully! Thank you.')
      // Update lessonPlans state directly
      setLessonPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan._id === planId ? { ...plan, status: 'accepted' } : plan
        )
      )
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch {
      setError('Failed to accept lesson plan')
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== planId))
    }
  }

  const handleReject = async (planId: string) => {
    try {
      if (!accessToken) {
        setError('Not authenticated')
        return
      }
      setProcessingIds((prev) => [...prev, planId])
      await rejectLessonPlan(planId, accessToken)
      setError(null)
      setSuccessMessage('Lesson plan rejected. Thank you for your review.')
      // Update lessonPlans state directly
      setLessonPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan._id === planId ? { ...plan, status: 'rejected' } : plan
        )
      )
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch {
      setError('Failed to reject lesson plan')
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== planId))
    }
  }

  if (loading) return <div>Loading lesson plans...</div>
  return (
    <div
      className={`flex min-h-screen ${theme} ${
        isSidebarOpen ? 'flex-col sm:flex-row' : 'flex-row'
      } overflow-x-hidden`}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Check Lesson Plans</h1>
            <Button
              onClick={fetchLessonPlans}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Refresh
            </Button>
          </div>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          {successMessage && (
            <div className="text-green-600 mb-4">{successMessage}</div>
          )}
          {lessonPlans.length === 0 && <p>No lesson plans at the moment.</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lessonPlans.map((plan) => (
              <div
                key={plan._id}
                className={`border rounded-lg p-4 shadow-md bg-transparent ${
                  plan.status === 'rejected' ? 'bg-red-100 border-red-500' : ''
                }`}
              >
                <p>
                  <strong>Date:</strong>{' '}
                  {new Date(plan.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Teacher:</strong>{' '}
                  {plan.teacher ? plan.teacher.fullName : 'Unknown'}
                </p>
                <p>
                  <strong>Subject:</strong> {plan.subject}
                </p>
                <p>
                  <strong>Type:</strong>{' '}
                  {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => handleOpen(plan)}>Open</Button>
                  {plan.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleAccept(plan._id)}
                        variant="default"
                        disabled={processingIds.includes(plan._id)}
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleReject(plan._id)}
                        variant="danger"
                        disabled={processingIds.includes(plan._id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {plan.status === 'accepted' && (
                    <>
                      <Button
                        onClick={() => handleReject(plan._id)}
                        variant="danger"
                        disabled={processingIds.includes(plan._id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {plan.status === 'rejected' && (
                    <>
                      <Button
                        onClick={() => handleAccept(plan._id)}
                        variant="default"
                        disabled={processingIds.includes(plan._id)}
                      >
                        Accept
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
export default CheckLessonPlans
