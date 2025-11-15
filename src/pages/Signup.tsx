import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_ENDPOINTS, OAUTH_GOOGLE_START } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff } from 'lucide-react'
import Dropdown from '../components/ui/Dropdown'
import InstallButton from '../components/InstallButton'

const Signup: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  // Redirect if already logged in and verified
  useEffect(() => {
    if (isAuthenticated && user && user.isVerified) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, user, navigate])

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: '',
    grade: '',
    section: '',
    subject: '',
  })
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [preview, setPreview] = useState(
    'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.Ai9h_6D7ojZdsZnE4_6SDgAAAA%3Fpid%3DApi&f=1&ipt=8e2776a266b58e01092cc5c997fc6d37f99717f56a2c80427&ipo=images'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const subjects = [
    'Mathematics',
    'English',
    'Science',
    'History',
    'Geography',
    'Physics',
    'Chemistry',
    'Biology',
    'IT',
    'Art',
    'Music',
    'HPE',
    'Foreign Languages',
    'Social Studies',
    'Economics',
    'Psychology',
    'Literature',
    'Afan Oromo',
    'Amharic',
  ]

  const roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Principal', label: 'Principal' },
    { value: 'Sub Principal', label: 'Sub Principal' },
    { value: 'Department', label: 'Department' },
    { value: 'Teacher', label: 'Teacher' },
    { value: 'Babysitter', label: 'Babysitter' },
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

  const subjectOptions = subjects.map((subj) => ({ value: subj, label: subj }))

  useEffect(() => {
    setFormData((prev) => ({ ...prev, grade: '', section: '', subject: '' }))
  }, [formData.role])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDropdownChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfilePic(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const validatePassword = (password: string) => {
    return password.length >= 8
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validatePassword(formData.password)) {
      return setError('Password must be at least 8 characters long')
    }

    if (!formData.role) {
      return setError('Please select a role')
    }

    setLoading(true)

    try {
      const response = await fetch(API_ENDPOINTS.SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Account created successfully! Redirecting...')
        // Clear form
        setFormData({
          fullName: '',
          email: '',
          password: '',
          role: '',
          grade: '',
          section: '',
          subject: '',
        })
        setProfilePic(null)
        setPreview(
          'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.Ai9h_6D7ojZdsZnE4_6SDgAAAA%3Fpid%3DApi&f=1&ipt=8e2776a266b58e01092cc5c997fc6d37f99717f56a2c80427&ipo=images'
        )
        // Redirect to check email page with email parameter
        navigate(data.redirectTo || '/check-email')
      } else {
        setError(data.message || data.error || 'Signup failed')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('Server error, please try again later')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = () => {
    window.location.href = OAUTH_GOOGLE_START()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 p-4 sm:p-6 overflow-x-hidden">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold text-center text-indigo-300 mb-6 tracking-wide drop-shadow-lg">
          Create Account
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="text-center mb-4">
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-indigo-400"
              />
              <label className="absolute bottom-0 right-0 bg-indigo-500 text-white rounded-full p-1 cursor-pointer">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-300 mt-2">
              Click the icon to upload your profile picture
            </p>
          </div>

          <div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

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
              placeholder="Password (min 8 characters)"
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

          <div>
            <Dropdown
              options={roleOptions}
              value={formData.role}
              onChange={handleDropdownChange('role')}
              placeholder="Select Role"
              className="bg-white/20 text-white border-white/20"
            />
          </div>

          {(formData.role === 'Teacher' || formData.role === 'Babysitter') && (
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
              {formData.role === 'Babysitter' && (
                <div>
                  <Dropdown
                    options={sectionOptions}
                    value={formData.section}
                    onChange={handleDropdownChange('section')}
                    placeholder="Select Section"
                    className="bg-white/20 text-white border-white/20"
                  />
                </div>
              )}
            </>
          )}

          {(formData.role === 'Teacher' || formData.role === 'Department') && (
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
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/20" />
          <span className="text-sm text-gray-300">or</span>
          <div className="h-px flex-1 bg-white/20" />
        </div>

        <button
          onClick={handleGoogleSignup}
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
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-indigo-400 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
      <InstallButton />
    </div>
  )
}

export default Signup
