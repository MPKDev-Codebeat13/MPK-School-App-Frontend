import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

import { API_ENDPOINTS } from '../lib/api'

export interface User {
  _id?: string
  id?: string
  name: string
  fullName?: string
  email: string
  role: string

  avatar?: string
  profilePicture?: string
  grade?: string
  subject?: string
  isVerified?: boolean
  isOAuth?: boolean
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
  login: (user: User, accessToken: string, refreshToken?: string) => void
  logout: (redirectPath?: string) => void
  refreshAuth: () => Promise<boolean>
  updateUser: (updates: Partial<User>) => Promise<void>
  setUser: (user: User) => void
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedAccess = localStorage.getItem('accessToken')
    const storedRefresh = localStorage.getItem('refreshToken')

    if (storedUser && storedAccess) {
      try {
        const parsedUser = JSON.parse(storedUser)

        // Convert field names for OAuth users
        const convertedUser: User = {
          _id: parsedUser._id,
          id: parsedUser.id,
          name: parsedUser.name || parsedUser.fullName || '',
          email: parsedUser.email || '',
          role: parsedUser.role || '',
          avatar: parsedUser.avatar || parsedUser.profilePicture || '',
          profilePicture: parsedUser.profilePicture || parsedUser.avatar || '',
          fullName: parsedUser.fullName || parsedUser.name || '',
          grade: parsedUser.grade,
          subject: parsedUser.subject,
          isVerified: parsedUser.isVerified,
          isOAuth: parsedUser.isOAuth,
          createdAt: parsedUser.createdAt,
        }

        // Verify the token is still valid by making a request to profile endpoint
        const verifyAuth = async () => {
          try {
            const response = await fetch(API_ENDPOINTS.PROFILE, {
              headers: { Authorization: `Bearer ${storedAccess}` },
            })
            if (response.ok) {
              setUser(convertedUser)
              setAccessToken(storedAccess)
              setRefreshToken(storedRefresh)
              // console.log('[DEBUG] Loaded auth state from localStorage:', {
              //   user: convertedUser,
              //   accessToken: storedAccess,
              //   refreshToken: storedRefresh,
              // })
            } else {
              // Token invalid or user deleted, clear storage
              localStorage.removeItem('user')
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              console.log(
                '[DEBUG] Auth verification failed, cleared stored data'
              )
            }
          } catch (error) {
            // Network error or other issue, clear storage to be safe
            localStorage.removeItem('user')
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            console.error('[DEBUG] Auth verification error:', error)
          }
          setLoading(false)
        }

        verifyAuth()
      } catch (error) {
        console.error('[DEBUG] Error parsing stored auth data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback((user: User, token: string, refresh?: string) => {
    setUser(user)
    setAccessToken(token)
    setRefreshToken(refresh || null)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('accessToken', token)
    if (refresh) localStorage.setItem('refreshToken', refresh)
    // console.log('[DEBUG] Login called:', { user, token, refresh })
  }, [])

  const logout = useCallback((redirectPath: string = '/login') => {
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = redirectPath
  }, [])

  const refreshAuth = async (): Promise<boolean> => {
    if (!refreshToken) {
      logout()
      return false
    }

    try {
      // console.log('[DEBUG] Attempting token refresh with:', refreshToken)
      const response = await fetch(API_ENDPOINTS.REFRESH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[DEBUG] Refresh failed. Response:', errorText)
        throw new Error('Refresh failed')
      }

      const data = await response.json()
      setAccessToken(data.accessToken)
      localStorage.setItem('accessToken', data.accessToken)

      if (data.refreshToken) {
        setRefreshToken(data.refreshToken)
        localStorage.setItem('refreshToken', data.refreshToken)
      }

      // console.log('[DEBUG] Token refresh successful:', data)
      return true
    } catch (error) {
      console.error('[DEBUG] Token refresh failed:', error)
      logout()
      return false
    }
  }

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    if (!accessToken) throw new Error('Not authenticated')

    try {
      // console.log('[DEBUG] updateUser called:', updates)
      const response = await fetch(API_ENDPOINTS.UPDATE_USER, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('[DEBUG] updateUser failed. Response:', error)
        throw new Error('Failed to update user')
      }

      const updated = await response.json()
      setUser(updated.user)
      localStorage.setItem('user', JSON.stringify(updated.user))
    } catch (err) {
      console.error('[DEBUG] updateUser error:', err)
      throw err
    }
  }

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    if (!accessToken) throw new Error('Not authenticated')

    try {
      // console.log('[DEBUG] changePassword called:', {
      //   currentPassword,
      //   newPassword,
      // })
      const response = await fetch(API_ENDPOINTS.CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('[DEBUG] changePassword failed. Response:', error)
        throw new Error('Failed to change password')
      }
      // console.log('[DEBUG] changePassword successful')
    } catch (err) {
      console.error('[DEBUG] changePassword error:', err)
      throw err
    }
  }

  const setUserContext = useCallback((newUser: User) => {
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
  }, [])

  const isAuthenticated = !!user && !!accessToken

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        loading,
        login,
        logout,
        refreshAuth,
        updateUser,
        setUser: setUserContext,
        changePassword,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
