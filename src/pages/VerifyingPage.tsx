import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { API_ENDPOINTS } from '../lib/api'
import InstallButton from '../components/InstallButton'

const VerifyingPage: React.FC = () => {
  const { token: urlToken } = useParams<{ token: string }>()
  const [searchParams] = useSearchParams()
  const queryToken = searchParams.get('token')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Use token from either URL params or query params
  const token = urlToken || queryToken

  useEffect(() => {
    if (token) {
      verifyEmail()
    } else {
      // No token provided, treat as successful signup and redirect to login
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    }
  }, [token, navigate])

  const verifyEmail = async () => {
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${API_ENDPOINTS.VERIFY_EMAIL}?token=${token}`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || data.message || 'Verification failed')
        setSuccess(false)
      } else {
        setSuccess(true)

        // Redirect to check email page after verification
        setTimeout(() => {
          navigate('/check-email?from=verifying')
        }, 2000)
      }
    } catch (err) {
      console.error('Verification error:', err)
      setError('Server error, please try again later')
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 p-4 sm:p-6 overflow-x-hidden">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Email Verified!
          </h1>
          <p className="text-gray-300 mb-6">
            Your email has been successfully verified. Redirecting...
          </p>
        </div>
        <InstallButton />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 text-center">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          {loading ? 'Verifying your account...' : 'Verification Result'}
        </h1>

        {loading && (
          <>
            <p className="text-gray-300 mb-6">
              Please wait while we verify your email address. This may take a
              few moments.
            </p>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          </>
        )}

        {error && (
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-red-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/check-email')}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
            >
              Back to Check Email
            </button>
          </div>
        )}
      </div>
      <InstallButton />
    </div>
  )
}

export default VerifyingPage
