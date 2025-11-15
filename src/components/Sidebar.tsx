import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { FiMenu, FiX } from 'react-icons/fi'
import { getUnreadMessageCount } from '../lib/api'

interface SidebarProps {
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
  showHamburger?: boolean
}

export default function Sidebar({
  isOpen: propIsOpen,
  setIsOpen: propSetIsOpen,
  showHamburger,
}: SidebarProps) {
  const { user, accessToken } = useAuth()
  const { theme, isLight } = useTheme()
  const [localIsOpen, setLocalIsOpen] = React.useState(false)
  const [unreadCount, setUnreadCount] = React.useState(0)

  const isOpen = propIsOpen !== undefined ? propIsOpen : localIsOpen
  const setIsOpen = propSetIsOpen || setLocalIsOpen

  // Fetch unread message count
  React.useEffect(() => {
    const fetchUnreadCount = async () => {
      if (accessToken && user) {
        try {
          const response = await getUnreadMessageCount(accessToken, 'public')
          setUnreadCount(response.unreadCount || 0)
        } catch (error) {
          console.error('Failed to fetch unread count:', error)
        }
      }
    }

    fetchUnreadCount()
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [accessToken, user])

  // Extract display name for initials to avoid TS issues
  const displayName = user?.fullName || user?.name || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  // role-based links
  const roleLinks: Record<string, { to: string; label: string }[]> = {
    teacher: [
      { to: '/lesson-planner', label: 'Lesson Planner' },
      { to: '/chat', label: 'Chat' },
      { to: '/settings', label: 'Settings' },
    ],
    babysitter: [
      { to: '/attendance/', label: 'Take Attendance' },
      { to: '/chat', label: 'Chat' },
      { to: '/settings', label: 'Settings' },
    ],
    admin: [
      { to: '/manage-users', label: 'Manage Users' },
      { to: '/chat', label: 'Chat' },
      { to: '/reports-lesson', label: 'Reports of the Lesson Plan' },
      { to: '/reports-attendance', label: 'Reports of the Attendance' },
      { to: '/settings', label: 'Settings' },
    ],
    department: [
      { to: '/chat', label: 'Chat' },
      { to: '/settings', label: 'Settings' },
      { to: '/check-lesson-plans', label: 'Check Lesson Plans' },
    ],
  }

  const links = roleLinks[user?.role?.toLowerCase() || 'teacher']

  const sidebarBg = isLight ? 'bg-gray-100' : 'bg-gray-900'
  const sidebarText = isLight ? 'text-gray-900' : 'text-white'
  const profileBg = isLight ? 'bg-gray-200' : 'bg-gray-800'
  const profileHover = isLight ? 'hover:bg-gray-300' : 'hover:bg-gray-700'
  const linkHover = isLight ? 'hover:bg-violet-100' : 'hover:bg-violet-600'
  const textSecondary = isLight ? 'text-gray-600' : 'text-gray-400'

  return (
    <>
      {/* Hamburger Menu - conditionally visible */}
      {showHamburger !== false && (
        <button
          className="fixed top-4 left-4 z-50 bg-violet-600 text-white p-3 rounded shadow hover:bg-violet-700 transition-colors relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="transition-transform duration-500 ease-in-out">
            {isOpen ? (
              <FiX size={32} className="rotate-[360deg]" />
            ) : (
              <FiMenu size={32} />
            )}
          </div>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] transform translate-x-1/2 -translate-y-1/2">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}

      <aside
        className={`${sidebarBg} ${sidebarText} h-screen shadow-lg rounded-r-2xl flex flex-col transition-all duration-300 fixed top-0 left-0 z-40 overflow-x-hidden ${
          isOpen ? 'w-64 p-4' : 'w-0 overflow-hidden'
        }`}
      >
        {isOpen && (
          <div className="flex items-center gap-2 mb-6">
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
                              'https://mym-nexus.onrender.com/api'
                            ).replace('/api', '')}${profilePic}`
                      }
                      alt="Profile"
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-violet-400 object-cover"
                      loading="lazy"
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
                {user?.role || 'Teacher'}
              </p>
            </div>
          </div>
        </Link>

        <nav className="flex flex-col gap-3 overflow-y-auto max-h-full overflow-x-hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`p-2 rounded-lg ${linkHover} transition-colors duration-200 relative`}
              onClick={() => setIsOpen(false)} // Close sidebar on link click for mobile
            >
              {link.label}
              {link.to === '/chat' && unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
