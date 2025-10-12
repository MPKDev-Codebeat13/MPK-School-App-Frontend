import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [status, setStatus] = useState('Processing login...')

  useEffect(() => {
    const handleOAuth = async () => {
      const params = new URLSearchParams(location.search)
      const accessToken = params.get('accessToken')
      const userParam = params.get('user')

      if (!accessToken || !userParam) {
        setStatus('No token or user data found. Please try logging in again.')
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      try {
        const user = JSON.parse(decodeURIComponent(userParam))

        if (!user?._id) {
          throw new Error('Invalid user data')
        }

        login(user, accessToken, undefined)

        // Check if user has password set
        if (!user.hasPassword) {
          setStatus('Login successful! Redirecting to set password...')
          setTimeout(() => navigate('/set-password', { replace: true }), 1000)
        } else {
          // Always go to complete profile for OAuth users
          setStatus('Login successful! Redirecting to complete profile...')
          setTimeout(
            () => navigate('/complete-profile', { replace: true }),
            1000
          )
        }
      } catch (err) {
        console.error('OAuth callback error:', err)
        setStatus('Authentication failed. Redirecting to login...')
        setTimeout(() => navigate('/login'), 2000)
      }
    }

    handleOAuth()
  }, [location.search, login, navigate])

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-lg">{status}</p>
      </div>
    </div>
  )
}
