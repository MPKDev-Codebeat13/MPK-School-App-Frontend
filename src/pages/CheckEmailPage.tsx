import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API_ENDPOINTS } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

const CheckEmailPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const token = searchParams.get('token')

  // Poll for verification status
  const checkVerificationStatus = useCallback(async () => {
    if (!user?.email || isVerified) return

    try {
      const response = await fetch(`${API_ENDPOINTS.PROFILE}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const userData = await response.json()
        if (userData.user?.isVerified) {
          setIsVerified(true)
          setTimeout(() => navigate('/login?verified=true'), 2000)
        }
      }
    } catch (err) {
      console.error('Error checking verification status:', err)
    }
  }, [user?.email, isVerified, navigate])

  useEffect(() => {
    // If token is present, redirect to proper verification page
    if (token) {
      navigate(`/verify-email?token=${token}`, { replace: true })
      return
    }

    // Send verification email only once
    if (!emailSent && user?.email) {
      sendVerificationEmail()
      setEmailSent(true)
    }

    // Start polling for verification status
    const pollInterval = setInterval(checkVerificationStatus, 3000) // Poll every 3 seconds

    return () => clearInterval(pollInterval)
  }, [token, navigate, emailSent, user?.email, checkVerificationStatus])

  const sendVerificationEmail = async () => {
    setLoading(true)
    setError(null)
    setResendStatus(null)
    try {
      // Get user email from auth context
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        setError('User not found. Please login and try again.')
        setLoading(false)
        return
      }
      const user = JSON.parse(storedUser)
      const email = user.email
      if (!email) {
        setError('Email not found. Please login and try again.')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_ENDPOINTS.RESEND_VERIFICATION}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (response.ok) {
        // Email sent successfully, show message
        setResendStatus(
          'Verification email sent successfully! Please check your email.'
        )
      } else {
        setResendStatus('Failed to send verification email. Please try again.')
      }
    } catch (err) {
      console.error('Send verification error:', err)
      setResendStatus('Server error, please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const resendVerification = async () => {
    setResendStatus(null)
    await sendVerificationEmail()
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
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>

        <p className="text-gray-300 mb-6">
          We've sent a verification link to your email address. Please click the
          link to verify your account.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          Didn't receive the email? Check your spam folder or resend below.
        </p>

        {isVerified && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
            Email verified successfully! Redirecting to login...
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => {
              // For OAuth users, redirect to dashboard instead of home
              const storedUser = localStorage.getItem('user')
              if (storedUser) {
                const user = JSON.parse(storedUser)
                if (user.isOAuth) {
                  navigate('/')
                  return
                }
              }
              navigate('/')
            }}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
          >
            Go to Home
          </button>
          <button
            onClick={resendVerification}
            disabled={loading}
            className="w-full py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>

        {resendStatus && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              resendStatus.includes('successfully')
                ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                : 'bg-red-500/20 border border-red-500/50 text-red-300'
            }`}
          >
            {resendStatus}
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckEmailPage
