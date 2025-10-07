import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Camera, Save, Lock, Trash2, AlertTriangle } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import Sidebar from '../components/Sidebar'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS } from '../lib/api'

export default function Profile() {
  const { user, setUser, changePassword, logout, accessToken } = useAuth()
  const { theme, isLight } = useTheme()
  const navigate = useNavigate()
  const goTo = (path: string) => navigate(path)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Profile state (init from real user)
  const [name, setName] = useState(user?.name || user?.fullName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [role, setRole] = useState(user?.role || '')
  const [grade, setGrade] = useState(user?.grade || '')
  const [section, setSection] = useState(user?.section || '')
  const [subject, setSubject] = useState(user?.subject || '')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)

  const [saving, setSaving] = useState(false)
  const [pwdSaving, setPwdSaving] = useState(false)

  const [msg, setMsg] = useState<string | null>(null)

  // Add local user state to update context after profile update
  const [localUser, setLocalUser] = useState(user)

  const getInitials = (name: string) => name.charAt(0).toUpperCase()

  useEffect(() => {
    setName(localUser?.name || localUser?.fullName || '')
    setEmail(localUser?.email || '')
    setRole(localUser?.role || '')
    setGrade(localUser?.grade || '')
    setSection(localUser?.section || '')
    setSubject(localUser?.subject || '')
  }, [localUser])

  // Sync localUser with global user when it changes
  useEffect(() => {
    setLocalUser(user)
  }, [user])

  // Fetch latest profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PROFILE, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setLocalUser(data.user)
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }
    fetchProfile()
  }, [accessToken])

  const cardSkin = useMemo(
    () =>
      isLight
        ? 'bg-white border-gray-200'
        : 'bg-white/10 border-white/20 backdrop-blur-xl',
    [isLight]
  )

  const textMuted = isLight ? 'text-gray-600' : 'text-gray-300'

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setMsg(null)

      const response = await fetch(API_ENDPOINTS.UPDATE_USER, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ fullName: name }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        // Update the user context with the new data
        const userData = updatedUser.user
        // Update global user context
        setUser(userData)
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(userData))
        // Update local user state to reflect changes immediately
        setLocalUser(userData)
        setMsg('Profile updated ✅')
      } else {
        const error = await response.json()
        setMsg(error.error || 'Update failed ❌')
      }
    } catch (e: any) {
      setMsg(e?.message || 'Update failed ❌')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMsg('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setMsg('Passwords do not match.')
      return
    }
    if (!user?.isOAuth && !currentPassword) {
      setMsg('Current password is required.')
      return
    }
    try {
      setPwdSaving(true)
      setMsg(null)
      await changePassword(currentPassword, newPassword)
      setMsg('Password changed ✅')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: any) {
      setMsg(e?.message || 'Failed to change password ❌')
    } finally {
      setPwdSaving(false)
    }
  }

  const handleProfilePictureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMsg('Please select a valid image file ❌')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMsg('Image size must be less than 5MB ❌')
      return
    }

    try {
      setMsg(null)
      const formData = new FormData()
      formData.append('profilePicture', file)

      const response = await fetch(API_ENDPOINTS.UPDATE_USER, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })

      if (response.ok) {
        const updatedUser = await response.json()
        // Update the user context with the new data
        const userData = updatedUser.user
        // Update global user context
        setUser(userData)
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(userData))
        // Update local user state to reflect changes immediately
        setLocalUser(userData)
        setMsg('Profile picture updated ✅')
      } else {
        const error = await response.json()
        setMsg(error.error || 'Failed to update profile picture ❌')
      }
    } catch (error: any) {
      setMsg(error?.message || 'Failed to update profile picture ❌')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true)
      setMsg(null)

      const response = await fetch(API_ENDPOINTS.DELETE_USER, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        setMsg('Account deleted successfully. Redirecting...')
        setTimeout(() => {
          logout()
          window.location.href = '/'
        }, 1500)
      } else {
        const error = await response.json()
        setMsg(error.error || 'Failed to delete account ❌')
      }
    } catch (error: any) {
      setMsg(error?.message || 'Failed to delete account ❌')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className={`flex min-h-screen ${theme} ${
        isSidebarOpen ? 'flex-col sm:flex-row' : 'flex-row'
      } overflow-x-hidden`}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main
        className={`flex-1 flex justify-center items-start min-h-[calc(100vh-4rem)] p-2 sm:p-4 lg:p-6`}
      >
        <Card
          className={`w-full max-w-5xl ${cardSkin} border shadow-xl rounded-3xl`}
        >
          <CardHeader className="text-center space-y-2">
            <CardTitle
              className={`text-2xl sm:text-3xl font-extrabold ${
                isLight ? 'text-violet-700' : 'text-violet-300'
              }`}
            >
              Your Profile
            </CardTitle>
            <p className={`${textMuted} text-sm sm:text-base`}>
              View and update your details
            </p>
          </CardHeader>

          <CardContent className="space-y-6 sm:space-y-10">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {(() => {
                  const profilePic =
                    localUser?.profilePicture || localUser?.avatar
                  let profilePictureUrl = undefined
                  if (profilePic) {
                    if (profilePic.startsWith('http')) {
                      profilePictureUrl = profilePic
                    } else {
                      profilePictureUrl = `${(
                        import.meta.env.VITE_API_BASE_URL || '/api'
                      ).replace('/api', '')}${profilePic}`
                    }
                  }
                  return profilePictureUrl ? (
                    <div className="relative">
                      <img
                        src={profilePictureUrl}
                        alt="Profile Picture"
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-violet-500"
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
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-2xl sm:text-4xl absolute top-0 left-0"
                        style={{ display: 'none' }}
                      >
                        {getInitials(name)}
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-2xl sm:text-4xl">
                      {getInitials(name)}
                    </div>
                  )
                })()}
                {/* Upload Button */}
                <label
                  htmlFor="profile-picture-upload"
                  className="absolute bottom-0 right-0 bg-violet-600 hover:bg-violet-500 text-white p-2 rounded-full cursor-pointer transition-colors duration-200 shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureUpload}
                  />
                </label>
              </div>
            </div>

            {/* Info form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <label className={`${textMuted} text-sm sm:text-base`}>
                  Full Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className={
                    isLight
                      ? 'bg-white text-sm sm:text-base'
                      : 'bg-white/10 text-white placeholder-gray-400 text-sm sm:text-base'
                  }
                />
              </div>

              <div className="space-y-2">
                <label className={`${textMuted} text-sm sm:text-base`}>
                  Email
                </label>
                <Input
                  value={email}
                  readOnly
                  className={`${
                    isLight
                      ? 'bg-gray-100 opacity-60'
                      : 'bg-white/10 text-white opacity-60'
                  } cursor-not-allowed text-sm sm:text-base`}
                />
              </div>

              <div className="space-y-2">
                <label className={`${textMuted} text-sm sm:text-base`}>
                  Role
                </label>
                <Input
                  value={role}
                  readOnly
                  className={`${
                    isLight
                      ? 'bg-gray-100 opacity-60'
                      : 'bg-white/10 text-white opacity-60'
                  } cursor-not-allowed text-sm sm:text-base`}
                />
              </div>

              {(role === 'Student' ||
                role === 'Teacher' ||
                role === 'Babysitter') && (
                <div className="space-y-2">
                  <label className={`${textMuted} text-sm sm:text-base`}>
                    Grade
                  </label>
                  <Input
                    value={grade}
                    readOnly
                    className={`${
                      isLight
                        ? 'bg-gray-100 opacity-60'
                        : 'bg-white/10 text-white opacity-60'
                    } cursor-not-allowed text-sm sm:text-base`}
                  />
                </div>
              )}

              {role === 'Babysitter' && (
                <div className="space-y-2">
                  <label className={`${textMuted} text-sm sm:text-base`}>
                    Section
                  </label>
                  <Input
                    value={section}
                    readOnly
                    className={`${
                      isLight
                        ? 'bg-gray-100 opacity-60'
                        : 'bg-white/10 text-white opacity-60'
                    } cursor-not-allowed text-sm sm:text-base`}
                  />
                </div>
              )}

              {(role === 'Teacher' || role === 'Department') && (
                <div className="space-y-2">
                  <label className={`${textMuted} text-sm sm:text-base`}>
                    Subject
                  </label>
                  <Input
                    value={subject}
                    readOnly
                    className={`${
                      isLight
                        ? 'bg-gray-100 opacity-60'
                        : 'bg-white/10 text-white opacity-60'
                    } cursor-not-allowed text-sm sm:text-base`}
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-violet-600 hover:bg-violet-500 rounded-xl flex items-center gap-2 px-4 sm:px-5 w-full sm:w-auto text-sm sm:text-base"
                >
                  <Save className="w-4 h-4" />{' '}
                  {saving ? 'Saving…' : 'Save Profile'}
                </Button>
              </div>
            </div>

            {/* Password change */}
            {/* Removed password change section as per user request */}

            {/* Delete Account Section */}
            <div
              className={`rounded-2xl p-4 sm:p-5 border-2 border-red-200 ${
                isLight
                  ? 'bg-red-50 border-red-200'
                  : 'bg-red-900/20 border-red-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-red-600 dark:text-red-400 text-sm sm:text-base">
                    Danger Zone
                  </h3>
                </div>
                <Button
                  onClick={() => setShowDeleteModal(!showDeleteModal)}
                  size="sm"
                  className="rounded-xl bg-red-600 hover:bg-red-500 text-white w-full sm:w-auto text-sm sm:text-base"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>

              {showDeleteModal && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700">
                    <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 mb-2">
                      ⚠️ This action cannot be undone. This will permanently
                      delete your account and remove all your data from our
                      servers.
                    </p>
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                      Are you sure you want to delete your account?
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                      onClick={() => {
                        setShowDeleteModal(false)
                        setDeleteConfirmation('')
                      }}
                      variant="outline"
                      className="rounded-xl w-full sm:w-auto text-sm sm:text-base"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="rounded-xl bg-red-600 hover:bg-red-500 text-white w-full sm:w-auto text-sm sm:text-base"
                    >
                      {deleting ? 'Deleting…' : 'Delete Account'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {msg && (
              <div
                className={`text-center text-sm sm:text-base ${
                  isLight ? 'text-gray-700' : 'text-gray-200'
                }`}
              >
                {msg}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function iconColor(isLight: boolean) {
  return isLight ? 'text-violet-700' : 'text-violet-300'
}
