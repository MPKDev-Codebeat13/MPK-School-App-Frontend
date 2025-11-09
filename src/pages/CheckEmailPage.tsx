import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API_ENDPOINTS } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import InstallButton from '../components/InstallButton'

const CheckEmailPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [shouldPoll, setShouldPoll] = useState(true)

  const token = searchParams.get('token')
  const emailFromParams = searchParams.get('email')
  const from = searchParams.get('from')

  // Poll for verification status
  const checkVerificationStatus = useCallback(async () => {
    if (isVerified || !shouldPoll) return

    const email = emailFromParams || user?.email
    if (!email) return

    try {
      const response = await fetch(
        `${API_ENDPOINTS.CHECK_VERIFICATION_STATUS}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.isVerified) {
          setIsVerified(true)
          setShouldPoll(false)
          setTimeout(() => navigate('/dashboard'), 500)
        }
      }
    } catch (err) {
      console.error('Error checking verification status:', err)
    }
  }, [emailFromParams, user?.email, isVerified, shouldPoll, navigate])

  useEffect(() => {
    // If token is present, redirect to proper verification page
    if (token) {
      navigate(`/verify-email?token=${token}`, { replace: true })
      return
    }

    // If redirected from verifying page, don't send email, just poll
    if (from === 'verifying') {
      // Start polling for verification status
      const pollInterval = setInterval(checkVerificationStatus, 3000) // Poll every 3 seconds
      return () => clearInterval(pollInterval)
    }

    // If redirected from complete profile, don't send email, just poll
    if (from === 'complete-profile') {
      // Start polling for verification status
      const pollInterval = setInterval(checkVerificationStatus, 3000) // Poll every 3 seconds
      return () => clearInterval(pollInterval)
    }

    // Send verification email only once
    const email = emailFromParams || user?.email
    if (!emailSent && email) {
      sendVerificationEmail()
      setEmailSent(true)
    }

    // Start polling for verification status
    const pollInterval = setInterval(checkVerificationStatus, 3000) // Poll every 3 seconds

    return () => clearInterval(pollInterval)
  }, [
    token,
    navigate,
    emailSent,
    emailFromParams,
    user?.email,
    checkVerificationStatus,
    from,
  ])

  const sendVerificationEmail = async () => {
    setLoading(true)
    setError(null)
    setResendStatus(null)
    try {
      // Get email from URL params or auth context
      const email = emailFromParams || user?.email
      if (!email) {
        setError('Email not found. Please try signing up again.')
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
        // Handle specific error cases
        if (response.status === 429) {
          // Rate limited - show the specific error message from server
          setResendStatus(
            data.error || 'Please wait before requesting another email.'
          )
        } else if (response.status === 400) {
          setResendStatus(data.error || 'Failed to send verification email.')
        } else {
          setResendStatus(
            'Failed to send verification email. Please try again.'
          )
        }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 p-4 sm:p-6 overflow-x-hidden">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
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

        <h1 className="text-2xl font-bold text-white mb-4">
          {from === 'verifying' ? 'Verification Complete' : 'Check Your Email'}
        </h1>

        <p className="text-gray-300 mb-6">
          {from === 'verifying'
            ? 'Your email has been verified. Redirecting to dashboard...'
            : "We've sent a verification link to your email address. Please click the link to verify your account."}
        </p>
        {from !== 'verifying' && (
          <p className="text-sm text-gray-400 mb-6">
            Didn't receive the email? Check your spam folder or resend below.
          </p>
        )}

        {isVerified && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
            Email verified successfully! Redirecting to dashboard...
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {from !== 'verifying' && from !== 'complete-profile' && (
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
          )}
          {from !== 'verifying' && from !== 'complete-profile' && (
            <button
              onClick={resendVerification}
              disabled={loading}
              className="w-full py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          )}
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
      <InstallButton />
    </div>
  )
}

export default CheckEmailPage
