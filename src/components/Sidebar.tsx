import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { FiMenu, FiX } from 'react-icons/fi'

interface SidebarProps {
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
}

export default function Sidebar({
  isOpen: propIsOpen,
  setIsOpen: propSetIsOpen,
}: SidebarProps) {
  const { user } = useAuth()
  const { theme, isLight } = useTheme()
  const [localIsOpen, setLocalIsOpen] = React.useState(true)

  const isOpen = propIsOpen !== undefined ? propIsOpen : localIsOpen
  const setIsOpen = propSetIsOpen || setLocalIsOpen

  // Extract display name for initials to avoid TS issues
  const displayName = user?.fullName || user?.name || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  // role-based links
  const roleLinks: Record<string, { to: string; label: string }[]> = {
    Parent: [
      { to: '/check-child', label: 'AI Assistant' },
      { to: '/chat', label: 'Chat' },
      { to: '/settings', label: 'Settings' },
    ],
    Teacher: [
      { to: '/lesson-planner', label: 'Lesson Planner' },
      { to: '/chat', label: 'Chat' },
      { to: '/settings', label: 'Settings' },
    ],
    Babysitter: [
      { to: '/babysitter/attendance/', label: 'Take Attendance' },
      { to: '/chat', label: 'Chat' },
      { to: '/settings', label: 'Settings' },
    ],
    Student: [
      { to: '/homework', label: 'Homework Helper' },
      { to: '/chat', label: 'Chat' },
      { to: '/settings', label: 'Settings' },
    ],
    Admin: [
      { to: '/manage-users', label: 'Manage Users' },
      { to: '/chat', label: 'Chat' },
      { to: '/reports-lesson', label: 'Reports of the Lesson Plan' },
      { to: '/reports-attendance', label: 'Reports of the Attendance' },
      { to: '/settings', label: 'Settings' },
    ],
    Department: [
      { to: '/chat', label: 'Chat' },
      { to: '/settings', label: 'Settings' },
      { to: '/check-lesson-plans', label: 'Check Lesson Plans' },
    ],
  }

  const links = roleLinks[user?.role || 'Student']

  const sidebarBg = isLight ? 'bg-gray-100' : 'bg-gray-900'
  const sidebarText = isLight ? 'text-gray-900' : 'text-white'
  const profileBg = isLight ? 'bg-gray-200' : 'bg-gray-800'
  const profileHover = isLight ? 'hover:bg-gray-300' : 'hover:bg-gray-700'
  const linkHover = isLight ? 'hover:bg-violet-100' : 'hover:bg-violet-600'
  const textSecondary = isLight ? 'text-gray-600' : 'text-gray-400'

  return (
    <>
      {/* Hamburger Menu - only show when sidebar is closed */}
      {!isOpen && (
        <button
          className="fixed top-4 left-0 z-50 bg-violet-600 text-white p-2 rounded-lg shadow-lg hover:bg-violet-700 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <FiMenu size={24} />
        </button>
      )}

      <aside
        className={`${sidebarBg} ${sidebarText} h-auto sm:h-screen shadow-lg rounded-r-2xl flex flex-col transition-all duration-300 sticky top-0 overflow-x-hidden ${
          isOpen
            ? 'w-full sm:w-64 p-2 sm:p-4 mr-0 sm:mr-4'
            : 'w-0 overflow-hidden'
        }`}
      >
        {isOpen && (
          <div className="flex items-center gap-2 mb-6">
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors hover:scale-110"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <Link
              to="/dashboard"
              className="text-1xl font-bold text-violet-400 hover:text-violet-300 transition-colors duration-200"
            >
              📊 MYM Dashboard
            </Link>
          </div>
        )}

        {/* Profile Section */}
        <Link
          to="/profile"
          className={`mb-6 p-3 ${profileBg} rounded-lg ${profileHover} transition-colors duration-200 block`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              {(() => {
                const profilePic = user?.profilePicture || user?.avatar
                return profilePic ? (
                  <>
                    <img
                      src={
                        profilePic.startsWith('http')
                          ? profilePic
                          : `${(
                              import.meta.env.VITE_API_BASE_URL ||
                              'http://localhost:4000/api'
                            ).replace('/api', '')}${profilePic}`
                      }
                      alt="Profile"
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-violet-400 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget
                          .nextElementSibling as HTMLElement
                        if (fallback) {
                          fallback.style.display = 'flex'
                        }
                      }}
                    />
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold absolute top-0 left-0"
                      style={{ display: 'none' }}
                    >
                      {initial}
                    </div>
                  </>
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
                    {initial}
                  </div>
                )
              })()}
            </div>
            <div>
              <p className="font-semibold text-sm">{displayName}</p>
              <p className={`text-xs ${textSecondary}`}>
                {user?.role || 'Student'}
              </p>
            </div>
          </div>
        </Link>

        <nav className="flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`p-2 rounded-lg ${linkHover} transition-colors duration-200`}
              onClick={() => setIsOpen(false)} // Close sidebar on link click for mobile
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
