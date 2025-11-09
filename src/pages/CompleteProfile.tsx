import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_ENDPOINTS } from '../lib/api'
import { jwtDecode } from 'jwt-decode'
import Dropdown from '../components/ui/Dropdown'

interface DecodedToken {
  id?: string
  email?: string
  name?: string
  fullName?: string
  role?: string
  picture?: string
  profilePic?: string
  avatar?: string
  avatar_url?: string
  photo?: string
  image?: string
  exp?: number
  isOAuth?: boolean
}

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate()
  const { user, updateUser, isAuthenticated, accessToken } = useAuth()

  const [formData, setFormData] = useState({
    role: '',
    grade: '',
    section: '',
    subject: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)

  // OAuth user data from JWT token
  // Profile data from API
  const [profileData, setProfileData] = useState<{
    profilePicture?: string
    fullName?: string
    email?: string
    role?: string
    grade?: string
    subject?: string
    isOAuth?: boolean
  } | null>(null)
  const [oauthUser, setOauthUser] = useState<{
    name: string
    email: string
    avatar?: string
    role?: string
  } | null>(null)

  // Helper function to extract OAuth profile picture from JWT token
  const extractOAuthProfilePicture = (
    decoded: DecodedToken
  ): string | undefined => {
    // Common OAuth profile picture field names across different providers
    const possibleFields = [
      'picture',
      'profilePic',
      'avatar',
      'avatar_url',
      'photo',
      'image',
      'profilePicture',
      'profile_image',
    ]

    for (const field of possibleFields) {
      const value = decoded[field as keyof DecodedToken] as string
      if (value && typeof value === 'string' && value.trim()) {
        return value.trim()
      }
    }

    return undefined
  }

  // Helper function to construct profile picture URL
  const getProfilePictureUrl = (
    picturePath: string | undefined
  ): string | null => {
    if (!picturePath) return null

    // If it's already a full URL (starts with http/https), return as is
    if (
      picturePath.startsWith('http://') ||
      picturePath.startsWith('https://')
    ) {
      return picturePath
    }

    // Otherwise, construct URL with API base
    const baseUrl = (
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
    ).replace('/api', '')
    return `${baseUrl}${picturePath}`
  }

  // Helper function to get display name initials
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Try to get OAuth user data from JWT token
    let isOAuthUser = false
    if (accessToken) {
      try {
        const decoded: DecodedToken = jwtDecode(accessToken)
        const profilePicture = extractOAuthProfilePicture(decoded)

        const userData = {
          name: decoded.name || decoded.fullName || '',
          email: decoded.email || '',
          avatar: profilePicture,
          role: decoded.role || '',
        }
        setOauthUser(userData)
        isOAuthUser = decoded.isOAuth === true
      } catch (error) {
        console.error('Failed to decode JWT token:', error)
      }
    }

    // Fetch profile data from API only for non-OAuth users
    const fetchProfileData = async () => {
      if (!accessToken || isOAuthUser) {
        setProfileLoading(false)
        return
      }

      try {
        setProfileLoading(true)
        setProfileError(null)

        const response = await fetch(API_ENDPOINTS.PROFILE, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.status === 401) {
          // Invalid token, redirect to login
          localStorage.removeItem('user')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          navigate('/login')
          return
        }

        if (response.ok) {
          const data = await response.json()
          setProfileData(data.user)
        } else {
          throw new Error(`Failed to fetch profile: ${response.status}`)
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
        setProfileError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch profile data'
        )
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfileData()

    // If user already has required fields, redirect to dashboard
    const currentRole = user?.role || oauthUser?.role
    if (currentRole === 'Student' && user && user.grade) {
      navigate('/dashboard')
    } else if (
      currentRole === 'Teacher' &&
      user &&
      user.subject &&
      user.grade
    ) {
      navigate('/dashboard')
    } else if (
      currentRole === 'Babysitter' &&
      user &&
      user.grade &&
      user.section
    ) {
      navigate('/dashboard')
    } else if (currentRole === 'Admin') {
      navigate('/dashboard')
    } else if (currentRole === 'Department' && user && user.subject) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate, accessToken, user]) // Added user back since it's used in conditions

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDropdownChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const roleOptions = [
    { value: 'Student', label: 'Student' },
    { value: 'Teacher', label: 'Teacher' },
    { value: 'Babysitter', label: 'Babysitter' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Parent', label: 'Parent' },
    { value: 'Department', label: 'Department' },
  ]

  const gradeOptions = [...Array(12)].map((_, i) => ({
    value: (i + 1).toString(),
    label: `Grade ${i + 1}`,
  }))

  const sectionOptions = [
    { value: 'A', label: 'Section A' },
    { value: 'B', label: 'Section B' },
    { value: 'C', label: 'Section C' },
  ]

  const subjectOptions = [
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'English', label: 'English' },
    { value: 'Science', label: 'Science' },
    { value: 'History', label: 'History' },
    { value: 'Geography', label: 'Geography' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Biology', label: 'Biology' },
    { value: 'IT', label: 'IT' },
    { value: 'Art', label: 'Art' },
    { value: 'Music', label: 'Music' },
    { value: 'HPE', label: 'HPE' },
    { value: 'Foreign Languages', label: 'Foreign Languages' },
    { value: 'Social Studies', label: 'Social Studies' },
    { value: 'Economics', label: 'Economics' },
    { value: 'Psychology', label: 'Psychology' },
    { value: 'Literature', label: 'Literature' },
    { value: 'Afan Oromo', label: 'Afan Oromo' },
    { value: 'Amharic', label: 'Amharic' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate required fields
      const currentRole = user?.role || oauthUser?.role || formData.role
      if (!currentRole) {
        throw new Error('Please select your role')
      }

      // Validate required fields based on role
      if (currentRole === 'Student' && !formData.grade) {
        throw new Error('Grade is required for students')
      }
      if (currentRole === 'Teacher' && !formData.grade) {
        throw new Error('Grade is required for teachers')
      }
      if (currentRole === 'Teacher' && !formData.subject) {
        throw new Error('Subject is required for teachers')
      }
      if (currentRole === 'Babysitter' && !formData.grade) {
        throw new Error('Grade is required for babysitters')
      }
      if (currentRole === 'Babysitter' && !formData.section) {
        throw new Error('Section is required for babysitters')
      }
      if (currentRole === 'Department' && !formData.subject) {
        throw new Error('Subject is required for department')
      }

      await updateUser(formData)

      // Check if user is OAuth user (from profile data or JWT token)
      const isOAuthUser =
        profileData?.isOAuth ||
        (accessToken &&
          (() => {
            try {
              const decoded: DecodedToken = jwtDecode(accessToken)
              return decoded.isOAuth === true
            } catch {
              return false
            }
          })())

      if (isOAuthUser) {
        // OAuth user - redirect to check email for verification
        navigate('/check-email')
      } else {
        // Normal user - redirect to check email
        navigate('/check-email')
      }
    } catch (err) {
      console.error('Profile update error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // Get display data from either user context or OAuth data
  const displayUser = user || oauthUser

  if (!displayUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  // Get the best available profile picture
  const profilePictureUrl = getProfilePictureUrl(
    profileData?.profilePicture || displayUser.avatar
  )
  const displayName = profileData?.fullName || displayUser.name || 'User'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 p-4 sm:p-6 overflow-x-hidden">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Complete Your Profile
          </h1>
          <p className="text-white text-sm">
            Please provide additional information to complete your account
            setup.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {profileError && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 text-sm">
            {profileError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display current user info */}
          <div className="bg-white/5 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {profileLoading ? (
                  <div className="w-16 h-16 rounded-full bg-gray-600 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
                  </div>
                ) : profilePictureUrl ? (
                  <div className="relative">
                    <img
                      src={profilePictureUrl}
                      alt="Profile"
                      className="w-16 h-16 rounded-full border-2 border-violet-400 object-cover"
                      onError={(e) => {
                        // Hide the broken image and show fallback
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget
                          .nextElementSibling as HTMLElement
                        if (fallback) {
                          fallback.style.display = 'flex'
                        }
                      }}
                    />
                    <div
                      className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold absolute top-0 left-0 hidden"
                      style={{ display: 'none' }}
                    >
                      {getInitials(displayName)}
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
                    {getInitials(displayName)}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-300">
                <p>
                  <span className="font-semibold">Name:</span> {displayName}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{' '}
                  {profileData?.email || displayUser.email}
                </p>
                <p>
                  <span className="font-semibold">Role:</span>{' '}
                  {profileData?.role || displayUser.role || 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Role selection if not set */}
          {!(profileData?.role || displayUser.role) && (
            <div>
              <Dropdown
                options={roleOptions}
                value={formData.role}
                onChange={handleDropdownChange('role')}
                placeholder="Select Your Role"
                className="bg-white/20 text-white border-white/20"
              />
            </div>
          )}

          {/* Role-specific fields */}
          {((profileData?.role || user?.role || oauthUser?.role) ===
            'Student' ||
            formData.role === 'Student') && (
            <div>
              <Dropdown
                options={gradeOptions}
                value={formData.grade}
                onChange={handleDropdownChange('grade')}
                placeholder="Select Grade"
                className="bg-white/20 text-white border-white/20"
              />
            </div>
          )}

          {((profileData?.role || user?.role || oauthUser?.role) ===
            'Teacher' ||
            formData.role === 'Teacher') && (
            <>
              <div>
                <Dropdown
                  options={gradeOptions}
                  value={formData.grade}
                  onChange={handleDropdownChange('grade')}
                  placeholder="Select Grade"
                  className="bg-white/20 text-white border-white/20"
                />
              </div>
              <div>
                <Dropdown
                  options={subjectOptions}
                  value={formData.subject}
                  onChange={handleDropdownChange('subject')}
                  placeholder="Select Subject"
                  className="bg-white/20 text-white border-white/20"
                />
              </div>
            </>
          )}

          {((profileData?.role || user?.role || oauthUser?.role) ===
            'Babysitter' ||
            formData.role === 'Babysitter') && (
            <>
              <div>
                <Dropdown
                  options={gradeOptions}
                  value={formData.grade}
                  onChange={handleDropdownChange('grade')}
                  placeholder="Select Grade"
                  className="bg-white/20 text-white border-white/20"
                />
              </div>
              <div>
                <Dropdown
                  options={sectionOptions}
                  value={formData.section}
                  onChange={handleDropdownChange('section')}
                  placeholder="Select Section"
                  className="bg-white/20 text-white border-white/20"
                />
              </div>
            </>
          )}

          {((profileData?.role || user?.role || oauthUser?.role) ===
            'Department' ||
            formData.role === 'Department') && (
            <div>
              <Dropdown
                options={subjectOptions}
                value={formData.subject}
                onChange={handleDropdownChange('subject')}
                placeholder="Select Subject"
                className="bg-white/20 text-white border-white/20"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              (!(profileData?.role || displayUser.role) && !formData.role)
            }
            className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CompleteProfile
