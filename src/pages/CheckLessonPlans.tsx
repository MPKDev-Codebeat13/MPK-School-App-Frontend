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
import { CheckCircle, XCircle, Eye } from 'lucide-react'

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

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'Teacher':
        return '/lesson-planner'
      case 'Department':
        return '/check-lesson-plans'
      case 'Admin':
        return '/manage-users-page'
      default:
        return '/'
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'Department') {
      alert('Access denied. You do not have permission to access this page.')
      navigate(getDashboardPath(user.role))
      return
    }
    fetchLessonPlans()
  }, [user])

  const fetchLessonPlans = async () => {
    setLoading(true)
    setError(null)
    try {
      if (!accessToken) {
        setError('Not authenticated')
        setLoading(false)
        return
      }
      const data = await getDepartmentLessonPlans(
        accessToken,
        user?.subject || ''
      )
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

  const handleReject = (planId: string) => {
    navigate(`/lesson-plan/${planId}`, { state: { rejectionMode: true } })
  }

  const { isLight } = useTheme()

  const lessonPlanCardBase =
    'p-6 rounded-2xl shadow-lg transition-all duration-300 border'
  const lessonPlanCardSkin = isLight
    ? 'bg-white border-gray-200 hover:shadow-xl'
    : 'bg-gray-800 border-gray-700 hover:shadow-violet-500/40'
  const lessonPlanCardTitle = isLight ? 'text-gray-900' : 'text-white'
  const lessonPlanCardText = isLight ? 'text-gray-600' : 'text-gray-400'

  if (loading) return <div>Loading lesson plans...</div>
  return (
    <div
      className={`min-h-screen ${theme} overflow-x-hidden ${
        isSidebarOpen ? 'sm:ml-64' : ''
      }`}
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
                className={`${lessonPlanCardBase} ${lessonPlanCardSkin}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`text-lg font-semibold ${lessonPlanCardTitle}`}
                  >
                    Lesson Plan
                  </h3>
                  {plan.status === 'accepted' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Accepted
                    </span>
                  )}
                  {plan.status === 'rejected' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle className="w-3 h-3 mr-1" />
                      Rejected
                    </span>
                  )}
                  {plan.status === 'pending' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Review
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <p className={`${lessonPlanCardText}`}>
                    <strong>Date:</strong>{' '}
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </p>
                  <p className={`${lessonPlanCardText}`}>
                    <strong>Teacher:</strong>{' '}
                    {plan.teacher ? plan.teacher.fullName : 'Unknown'}
                  </p>
                  <p className={`${lessonPlanCardText}`}>
                    <strong>Subject:</strong> {plan.subject}
                  </p>
                  <p className={`${lessonPlanCardText}`}>
                    <strong>Type:</strong>{' '}
                    {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => handleOpen(plan)} variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  {plan.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleAccept(plan._id)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={processingIds.includes(plan._id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleReject(plan._id)}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={processingIds.includes(plan._id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {plan.status === 'accepted' && (
                    <span className="text-green-600 text-sm font-medium">
                      ✓ Accepted
                    </span>
                  )}
                  {plan.status === 'rejected' && (
                    <>
                      <Button
                        onClick={() => handleOpen(plan)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        View Rejection Details
                      </Button>
                      <Button
                        onClick={() => handleAccept(plan._id)}
                        className="bg-green-600 hover:bg-green-700"
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
