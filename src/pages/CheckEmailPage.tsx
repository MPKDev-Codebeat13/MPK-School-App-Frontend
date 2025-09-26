import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API_ENDPOINTS } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

const CheckEmailPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const token = searchParams.get('token')

  useEffect(() => {
    // If token is present, redirect to proper verification page
    if (token) {
      navigate(`/verify-email?token=${token}`, { replace: true })
      return
    }
    // Otherwise, send verification email only once
    if (!emailSent) {
      sendVerificationEmail()
      setEmailSent(true)
    }
  }, [token, navigate, emailSent])

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

      if (response.redirected) {
        // Backend redirects to login page with success message
        const url = new URL(response.url)
        const verified = url.searchParams.get('verified')
        if (verified === 'true') {
          setSuccess(true)
          setTimeout(() => navigate('/login'), 2000)
        }
      } else {
        const data = await response.json()
        if (response.ok) {
          setSuccess(true)
          setTimeout(() => navigate('/login'), 2000)
        } else {
          setError(data.message || data.error || 'Verification failed')
        }
      }
    } catch (err) {
      console.error('Verification error:', err)
      setError('Server error, please try again later')
    } finally {
      setLoading(false)
    }
  }

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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 p-6">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 text-center">
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
            Your email has been successfully verified. You can now access your
            account.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
          >
            Continue to Login
          </button>
        </div>
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
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>

        {token ? (
          <>
            <p className="text-gray-300 mb-6">
              Click the button below to verify your email address.
            </p>
            {loading && (
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <button
                onClick={verifyEmail}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
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
                className="w-full py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                Go to Home
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-300 mb-6">
              We've sent a verification link to your email address. Please click
              the link to verify your account.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Didn't receive the email? Check your spam folder or try logging in
              to resend.
            </p>
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
                className="w-full py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                Resend Verification Email
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
          </>
        )}
      </div>
    </div>
  )
}

export default CheckEmailPage
