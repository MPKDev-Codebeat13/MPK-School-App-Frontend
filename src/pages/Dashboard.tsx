import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import WelcomeBanner from '../components/WelcomeBanner'
import { Button } from '../components/ui/button'
import {
  MessageSquare,
  User,
  Settings as SettingsIcon,
  BookOpen,
  Users,
  ClipboardCheck,
  GraduationCap,
  LogOut,
  Eye,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, isLight } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const goTo = (path: string) => navigate(path)

  const cardBase =
    'cursor-pointer group p-6 rounded-2xl shadow-lg transition-all duration-300 border'
  const cardSkin = isLight
    ? 'bg-white border-gray-200 hover:shadow-xl'
    : 'bg-white/10 backdrop-blur-xl border-white/20 hover:shadow-violet-500/40'

  const cardTitle = isLight ? 'text-violet-700' : 'text-violet-300'
  const cardText = isLight ? 'text-gray-700' : 'text-gray-300'
  const iconColor = isLight ? 'text-violet-600' : 'text-violet-400'

  const renderRoleTools = () => {
    switch (user?.role) {
      case 'Parent':
        return (
          <div
            onClick={() => goTo('/check-child')}
            className={`${cardBase} ${cardSkin}`}
          >
            <div className="flex items-center gap-3">
              <Eye
                className={`w-6 h-6 ${iconColor} group-hover:scale-110 transition`}
              />
              <h3 className={`font-bold text-lg ${cardTitle}`}>
                AI Assistant 🤖
              </h3>
            </div>
            <p className={`${cardText} mt-3`}>
              Get personalized advice and support from our AI assistant for your
              parenting journey.
            </p>
          </div>
        )
      case 'Teacher':
        return (
          <div
            onClick={() => goTo('/lesson-plans')}
            className={`${cardBase} ${cardSkin}`}
          >
            <div className="flex items-center gap-3">
              <BookOpen
                className={`w-6 h-6 ${iconColor} group-hover:scale-110 transition`}
              />
              <h3 className={`font-bold text-lg ${cardTitle}`}>
                Lesson Plans 📚
              </h3>
            </div>
            <p className={`${cardText} mt-3`}>Create and edit lesson plans.</p>
          </div>
        )
      case 'Babysitter':
        return (
          <div
            onClick={() => goTo('/babysitter/attendance/')}
            className={`${cardBase} ${cardSkin}`}
          >
            <div className="flex items-center gap-3">
              <ClipboardCheck
                className={`w-6 h-6 ${iconColor} group-hover:scale-110 transition`}
              />
              <h3 className={`font-bold text-lg ${cardTitle}`}>
                Attendance ✅
              </h3>
            </div>
            <p className={`${cardText} mt-3`}>
              Mark and review student attendance with ease.
            </p>
          </div>
        )
      case 'Student':
        return (
          <div
            onClick={() => goTo('/homework')}
            className={`${cardBase} ${cardSkin}`}
          >
            <div className="flex items-center gap-3">
              <GraduationCap
                className={`w-6 h-6 ${iconColor} group-hover:scale-110 transition`}
              />
              <h3 className={`font-bold text-lg ${cardTitle}`}>
                HW & CW Helper ✏️
              </h3>
            </div>
            <p className={`${cardText} mt-3`}>
              Get guided help with homework and classwork from the AI tutor.
            </p>
          </div>
        )
      case 'Admin':
        return (
          <>
            {/* Manage Users */}
            <div
              onClick={() => goTo('/manage-users')}
              className={`${cardBase} ${cardSkin}`}
            >
              <div className="flex items-center gap-3">
                <Users
                  className={`w-6 h-6 ${iconColor} group-hover:scale-110 transition`}
                />
                <h3 className={`font-bold text-lg ${cardTitle}`}>
                  Manage Users 👥
                </h3>
              </div>
              <p className={`${cardText} mt-3`}>
                Add, edit, and manage user accounts and permissions.
              </p>
            </div>

            {/* Reports Attendance */}
            <div
              onClick={() => goTo('/reports-attendance')}
              className={`${cardBase} ${cardSkin}`}
            >
              <div className="flex items-center gap-3">
                <ClipboardCheck
                  className={`w-6 h-6 ${iconColor} group-hover:scale-110 transition`}
                />
                <h3 className={`font-bold text-lg ${cardTitle}`}>
                  Attendance Reports 📊
                </h3>
              </div>
              <p className={`${cardText} mt-3`}>
                View and analyze student attendance data and trends.
              </p>
            </div>

            {/* Reports Lesson Plan */}
            <div
              onClick={() => goTo('/reports-lesson')}
              className={`${cardBase} ${cardSkin}`}
            >
              <div className="flex items-center gap-3">
                <BookOpen
                  className={`w-6 h-6 ${iconColor} group-hover:scale-110 transition`}
                />
                <h3 className={`font-bold text-lg ${cardTitle}`}>
                  Lesson Plan Reports 📚
                </h3>
              </div>
              <p className={`${cardText} mt-3`}>
                Review and manage lesson plans across the school.
              </p>
            </div>
          </>
        )
      case 'Department':
        return (
          <div
            onClick={() => goTo('/check-lesson-plans')}
            className={`${cardBase} ${cardSkin}`}
          >
            <div className="flex items-center gap-3">
              <BookOpen
                className={`w-6 h-6 ${iconColor} group-hover:scale-110 transition`}
              />
              <h3 className={`font-bold text-lg ${cardTitle}`}>
                Check Lesson Plans 📚
              </h3>
            </div>
            <p className={`${cardText} mt-3`}>
              Check the created lesson plans of your subject.
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen ${theme} overflow-x-hidden`}>
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <main
        className={`p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 ${
          isSidebarOpen ? 'sm:ml-64' : ''
        }`}
      >
        {/* Topbar */}
        <div className="flex justify-between items-center mb-6">
          <WelcomeBanner />
          <Button
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 rounded-xl shadow-lg"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        {/* Feature cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Chat */}
          <div
            onClick={() => goTo('/chat')}
            className={`${cardBase} ${cardSkin}`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare
                className={`w-6 h-6 ${iconColor} group-hover:scale-110 transition`}
              />
              <h3 className={`font-bold text-lg ${cardTitle}`}>
                Community Chat 💬
              </h3>
            </div>
            <p className={`${cardText} mt-3`}>
              Connect with parents, teachers, and students to share ideas.
            </p>
          </div>

          {/* Profile */}
          <div
            onClick={() => goTo('/profile')}
            className={`${cardBase} ${cardSkin}`}
          >
            <div className="flex items-center gap-3">
              <User
                className={`w-6 h-6 ${iconColor} group-hover:scale-110 transition`}
              />
              <h3 className={`font-bold text-lg ${cardTitle}`}>Profile 👤</h3>
            </div>
            <p className={`${cardText} mt-3`}>
              Manage your personal info and avatar. Change your password.
            </p>
          </div>

          {/* Settings */}
          <div
            onClick={() => goTo('/settings')}
            className={`${cardBase} ${cardSkin}`}
          >
            <div className="flex items-center gap-3">
              <SettingsIcon
                className={`w-6 h-6 ${iconColor} group-hover:scale-110 transition`}
              />
              <h3 className={`font-bold text-lg ${cardTitle}`}>Settings ⚙️</h3>
            </div>
            <p className={`${cardText} mt-3`}>
              Choose a theme and tweak preferences.
            </p>
          </div>

          {/* Role-based Tool */}
          {renderRoleTools()}
        </section>
      </main>
    </div>
  )
}
