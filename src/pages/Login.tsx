import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { API_ENDPOINTS, OAUTH_GOOGLE_START } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff } from 'lucide-react'
import InstallButton from '../components/InstallButton'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, user, isAuthenticated } = useAuth()

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Check for oauth-verified message
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const message = params.get('message')
    if (message === 'oauth-verified') {
      setSuccessMessage(
        'Your account has been verified! You can now log in with Google.'
      )
      // Clear the URL parameter
      navigate('/login', { replace: true })
    }
  }, [location.search, navigate])

  // Redirect if already logged in and verified
  useEffect(() => {
    if (isAuthenticated && user && user.isVerified) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, user, navigate])

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        const accessToken = data.accessToken
        const refreshToken = data.refreshToken

        if (!accessToken) {
          throw new Error('No access token in response')
        }

        login(data.user, accessToken, refreshToken)
        navigate('/dashboard')
      } else {
        setError(data.message || data.error || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Server error, please try again later')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = OAUTH_GOOGLE_START()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 p-4 sm:p-6 overflow-x-hidden">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold text-center text-indigo-300 mb-6 tracking-wide drop-shadow-lg">
          Welcome Back
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-white/80 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="accent-indigo-400"
              />
              Remember Me
            </label>
            <Link
              to="/forgot-password"
              className="hover:text-indigo-300 cursor-pointer"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/20" />
          <span className="text-sm text-gray-300">or</span>
          <div className="h-px flex-1 bg-white/20" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 bg-white text-slate-800 font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          <img
            alt="Google"
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-indigo-400 font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
      <InstallButton />
    </div>
  )
}

export default Login
