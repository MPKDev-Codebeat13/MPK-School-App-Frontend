import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const TestPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 p-6 text-white">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-4">Test Page</h1>
        <p className="text-center mb-4">This page is working!</p>
        
        <div className="text-sm text-gray-300 mb-4">
          <p><strong>Current path:</strong> {location.pathname}</p>
          <p><strong>Location state:</strong> {JSON.stringify(location.state)}</p>
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => navigate('/verify/check-email', { state: { email: 'test@example.com' } })}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Test Navigate to Check Email
          </button>
          
          <button 
            onClick={() => navigate('/signup')}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Back to Signup
          </button>
        </div>
      </div>
    </div>
  )
}

export default TestPage
